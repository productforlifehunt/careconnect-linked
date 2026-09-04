import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSite } from "@/contexts/SiteContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Clock, Shield, AlertTriangle, RefreshCw, Loader2, Radio, Route, Bell, Hexagon, Plus, Trash2, Pencil, Crosshair } from "lucide-react";
import { useLocationShares, useCareGroups, useCareGroupMembers } from "@/hooks/use-care-data";
import {
  shareMyLocationWordPress, disableMyLocationSharingWordPress,
  fetchCaredOneLocationSettingsWordPress,
  fetchCaredOneLocationHistoryWordPress,
  fetchSafeZonesWordPress,
  fetchSafeZoneAlertsWordPress,
  acknowledgeAlertWordPress,
  createSafeZoneWordPress,
  updateSafeZoneWordPress,
  deleteSafeZoneWordPress,
} from "@/features/location/source.wordpress-extended";
import { writeLocationAndCheckZones } from "@/features/location/source.wordpress";
import { checkBreaches, getDistanceMeters } from "@/lib/locationService";
import {
  ZONE_TYPE, ZONE_TYPE_CODES, isCustomZone, isDangerZone,
  zoneTypeLabel,
} from "@/features/location/zone-types";
import { ZoneShapeEditor, type ZoneShape } from "@/components/location/ZoneShapeEditor";


import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslation } from "react-i18next";
import { getCurrentPosition } from "@/lib/geolocation";
import { formatDate, formatTime, formatDateTime } from "@/lib/locale";

const POLL_INTERVAL = 15_000; // 15 seconds
const TRAIL_MAX_POINTS = 200;

export default function GPSTracking() {
  const { t, i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const { toast } = useToast();
  const site = useSite();
  const { data: locationShares, isLoading, refetch } = useLocationShares(POLL_INTERVAL);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [shareMyLocation, setShareMyLocation] = useState(false);
  const [geofenceAlerts, setGeofenceAlerts] = useState(true);
  const [updatingShare, setUpdatingShare] = useState(false);
  const [sosDialogOpen, setSosDialogOpen] = useState(false);
  const [sosSending, setSosSending] = useState(false);
  const [activeTab, setActiveTab] = useState("map");
  const [alerts, setAlerts] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [trailData, setTrailData] = useState<Record<string, [number, number][]>>({});
  // Safe-zone editor state — zones are created and edited entirely in-app.
  // CCT 214 has NO name column: a zone is labelled by its TYPE (a55).

  const [customNameDraft, setCustomNameDraft] = useState("");
  const emptyZoneForm = {
    id: "" as string,
    zone_type: ZONE_TYPE.SAFE as string,
    // a56 shape type: a plain circle, or a precise hand-drawn outline in a63.
    shape_type: "Radius" as ZoneShape,
    polygon_points: [] as [number, number][],
    latitude: "" as string,
    longitude: "" as string,
    radius_meters: "200" as string,
    notify_on_enter: true,
    notify_on_exit: true,
    is_active: true,
    receiver_ids: [] as string[],
  };


  const [zoneDialogOpen, setZoneDialogOpen] = useState(false);
  const [zoneForm, setZoneForm] = useState({ ...emptyZoneForm });
  const [zoneSaving, setZoneSaving] = useState(false);
  const [zoneDeletingId, setZoneDeletingId] = useState<string | null>(null);

  // The map lives inside a tab panel that Radix unmounts, so track the node in
  // state: every re-mount hands us a fresh element and rebuilds the map.
  const [mapNode, setMapNode] = useState<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMap = useRef<L.Map | null>(null);

  const markersRef = useRef<L.Marker[]>([]);
  const trailLinesRef = useRef<L.Polyline[]>([]);
  const zoneLayers = useRef<L.Layer[]>([]);
  
  const lastBreach = useRef<Record<string, number>>({});

  const { user } = useAuth();
  const userId = user?.user_id ?? null;
  const { data: careGroups } = useCareGroups();
  const primaryGroupId = (careGroups || [])[0]?.id ? String((careGroups as any[])[0].id) : null;
  const { data: groupMembers } = useCareGroupMembers(primaryGroupId);

  // ─── Initialize sharing state ───────────────────────────────
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const settings = await fetchCaredOneLocationSettingsWordPress(String(userId));
        if (settings?.sharing_enabled) setShareMyLocation(true);
      } catch {}
    })();
  }, [userId]);

  // ─── Load safe zones & alerts ───────────────────────────────
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const [z, a] = await Promise.all([
          fetchSafeZonesWordPress(String(userId)),
          fetchSafeZoneAlertsWordPress(String(userId)),
        ]);
        setZones(z);
        setAlerts(a);
      } catch {}
    })();
  }, [userId]);

  // ─── Build people list from location shares ─────────────────
  const people = (locationShares || []).map((ls: any) => {
    const lat = parseFloat(ls.latitude) || 0;
    const lng = parseFloat(ls.longitude) || 0;
    return {
      id: ls.id,
      userId: ls.user_id,
      name: ls.profile?.full_name || t("common.unknown"),
      avatar_url: ls.profile?.avatar_url || ls.user_avatar,
      lastLocation: ls.address_text || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      coordinates: { lat, lng },
      lastUpdated: ls.updated_at
        ? formatTime(typeof ls.updated_at === "number" ? ls.updated_at * 1000 : ls.updated_at, "en", { hour: "numeric", minute: "2-digit" })
        : "",
      status: "active" as const,
      isSharing: ls.sharing_status !== "off" && ls.is_sharing_enabled !== false,
    };
  });

  const sharingPeople = people.filter(p => p.isSharing && p.coordinates.lat && p.coordinates.lng);

  // Alert receivers are care-team members, not only people who share a
  // location — anyone in the team can be notified about a breach.
  const receiverCandidates = (() => {
    const seen = new Set<string>();
    const out: { id: string; userId: string; name: string }[] = [];
    const push = (uid: any, name: string) => {
      const key = String(uid ?? "").replace(/^wp-/, "");
      if (!key || seen.has(key)) return;
      seen.add(key);
      out.push({ id: key, userId: key, name: name || t("common.unknown") });
    };
    (groupMembers || []).forEach((m: any) => push(m.user_id ?? m.id, m.display_name || m.profile?.full_name || m.profile?.email));
    people.forEach((p: any) => push(p.userId, p.name));
    return out;
  })();

  // ─── Load trail history for each person ─────────────────────
  useEffect(() => {
    if (!sharingPeople.length) return;
    (async () => {
      const trails: Record<string, [number, number][]> = {};
      await Promise.all(
        sharingPeople.map(async (p) => {
          try {
            const history = await fetchCaredOneLocationHistoryWordPress(p.userId);
            trails[p.userId] = history
              .filter((h: any) => h.latitude && h.longitude)
              .slice(0, TRAIL_MAX_POINTS)
              .map((h: any) => [Number(h.latitude), Number(h.longitude)] as [number, number])
              .reverse(); // oldest first for polyline
          } catch {
            trails[p.userId] = [];
          }
        })
      );
      setTrailData(trails);
    })();
  }, [sharingPeople.length]);

  // ─── Initialize Leaflet map ─────────────────────────────────
  useEffect(() => {
    if (!mapNode) return;
    const map = L.map(mapNode, { zoomControl: true }).setView([39.8283, -98.5795], 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    const mapContainer = map.getContainer();
    mapContainer.setAttribute("aria-label", Z("位置地图", "Location map"));
    mapContainer.querySelector<HTMLAnchorElement>(".leaflet-control-zoom-in")?.setAttribute("aria-label", Z("放大地图", "Zoom in"));
    mapContainer.querySelector<HTMLAnchorElement>(".leaflet-control-zoom-out")?.setAttribute("aria-label", Z("缩小地图", "Zoom out"));
    leafletMap.current = map;
    // The panel animates in, so the tile grid needs a size recheck once painted.
    const t = window.setTimeout(() => map.invalidateSize(), 200);
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(mapNode);
    return () => {
      window.clearTimeout(t);
      ro.disconnect();
      map.remove();
      leafletMap.current = null;
      markersRef.current = [];
      trailLinesRef.current = [];
      zoneLayers.current = [];
    };
  }, [mapNode]);


  // ─── Draw safe zones on map ─────────────────────────────────
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;
    zoneLayers.current.forEach(l => map.removeLayer(l));
    zoneLayers.current = [];

    zones.filter(z => z.is_active).forEach(zone => {
      // The CCT mapper returns "Danger"/"Polygon" capitalised — compare lowercased.
      const isDanger = isDangerZone(String(zone.zone_type));
      const isPolygon = String(zone.shape_type).toLowerCase() === "polygon";
      const label = zoneLabel(String(zone.zone_type), zone.zone_name);
      const color = isDanger ? "#ef4444" : "hsl(var(--primary))";
      if (isPolygon && zone.polygon_points?.length >= 3) {
        const poly = L.polygon(zone.polygon_points, {
          color,
          weight: 2,
          fillOpacity: 0.15,
          dashArray: isDanger ? "6 4" : undefined,
        }).addTo(map);
        poly.bindPopup(`<b>${label}</b>`);
        zoneLayers.current.push(poly);
      } else if (zone.latitude && zone.longitude) {
        const circle = L.circle([zone.latitude, zone.longitude], {
          radius: zone.radius_meters || 200,
          color,
          weight: 2,
          fillOpacity: 0.12,
          dashArray: isDanger ? "6 4" : undefined,
        }).addTo(map);
        circle.bindPopup(`<b>${label}</b><br/>${Z("半径", "Radius")}: ${zone.radius_meters || 200}m`);
        zoneLayers.current.push(circle);
      }
    });

  }, [zones]);

  // ─── Update markers + trails when data changes ──────────────
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;

    // Clear old markers & trails
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    trailLinesRef.current.forEach(l => l.remove());
    trailLinesRef.current = [];

    if (sharingPeople.length === 0) return;

    sharingPeople.forEach(person => {
      const initials = person.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="width:40px;height:40px;border-radius:50%;background:hsl(var(--primary));color:white;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.3);cursor:pointer;position:relative">
          ${initials}
          <span style="position:absolute;bottom:-2px;right:-2px;width:12px;height:12px;border-radius:50%;background:hsl(var(--primary));border:2px solid white"></span>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
      const marker = L.marker([person.coordinates.lat, person.coordinates.lng], { icon })
        .addTo(map)
        .bindPopup(`<b>${person.name}</b><br/>${Z("最近上线", "Last seen")}: ${person.lastUpdated}<br/>${person.lastLocation}`);
      marker.on("click", () => setSelectedPerson(person));
      markersRef.current.push(marker);

      // Draw trail polyline
      const trail = trailData[person.userId];
      if (trail && trail.length > 1) {
        const polyline = L.polyline(trail, {
          color: "hsl(var(--primary))",
          weight: 3,
          opacity: 0.6,
          dashArray: "4 6",
        }).addTo(map);
        trailLinesRef.current.push(polyline);
      }
    });

    // Fit bounds
    if (sharingPeople.length === 1) {
      map.setView([sharingPeople[0].coordinates.lat, sharingPeople[0].coordinates.lng], 14);
    } else {
      const bounds = L.latLngBounds(sharingPeople.map(p => [p.coordinates.lat, p.coordinates.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [sharingPeople.length, locationShares, trailData]);

  // ─── Live breach detection on each poll ─────────────────────
  useEffect(() => {
    if (!geofenceAlerts || !zones.length || !sharingPeople.length) return;

    sharingPeople.forEach(person => {
      const breaches = checkBreaches(person.coordinates.lat, person.coordinates.lng, zones);
      breaches.forEach(breach => {
        const dedupKey = `${person.userId}-${breach.zoneId}-${breach.alertType}`;
        const lastTime = lastBreach.current[dedupKey] || 0;
        const now = Date.now();
        // 5 minute dedup window
        if (now - lastTime < 5 * 60 * 1000) return;
        lastBreach.current[dedupKey] = now;

        toast({
          title: breach.alertType === "entered_danger_zone" ? Z("⚠️ 危险区域警报", "⚠️ Danger Zone Alert") : Z("📍 安全区域警报", "📍 Safe Zone Alert"),
          description: `${person.name} — ${Z(({ entered_danger_zone: "进入危险区域", exited_safe_zone: "离开安全区域", entered_safe_zone: "进入安全区域" } as any)[breach.alertType] || breach.alertType, breach.alertType.replace(/_/g, " "))} (${breach.zoneName})`,
          variant: breach.alertType.includes("danger") ? "destructive" : "default",
        });
      });
    });
  }, [locationShares, zones, geofenceAlerts]);

  // ─── Auto-share my location (sender polling) ───────────────
  useEffect(() => {
    if (!shareMyLocation || !userId) return;

    const sendMyLocation = async () => {
      try {
        const pos = await getCurrentPosition({ timeout: 10000 });
        if (!pos) return;
        await writeLocationAndCheckZones(pos.latitude, pos.longitude, {
          accuracy: pos.accuracy,
        });
      } catch {}
    };

    // Send immediately, then every 15s
    sendMyLocation();
    const interval = setInterval(sendMyLocation, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [shareMyLocation, userId]);

  // ─── Focus map on selected person ───────────────────────────
  useEffect(() => {
    if (selectedPerson?.coordinates?.lat && leafletMap.current) {
      leafletMap.current.setView([selectedPerson.coordinates.lat, selectedPerson.coordinates.lng], 15);
    }
  }, [selectedPerson]);

  // ─── Toggle share ──────────────────────────────────────────
  const handleToggleShare = async (checked: boolean) => {
    setShareMyLocation(checked);
    setUpdatingShare(true);
    try {
      if (!userId) return;
      if (checked) {
        const pos = await getCurrentPosition({ timeout: 10000 });
        if (!pos) {
          setUpdatingShare(false);
          toast({ title: t("gps.couldNotGetLocation"), description: t("gps.enableLocationAccess"), variant: "destructive" });
          setShareMyLocation(false);
          return;
        }
        await writeLocationAndCheckZones(pos.latitude, pos.longitude, { accuracy: pos.accuracy });
        refetch();
        toast({ title: t("gps.locationSharingEnabled") });
      } else {
        await disableMyLocationSharingWordPress();
        refetch();
        toast({ title: t("gps.locationSharingDisabled") });
      }
    } catch {
    } finally {
      setUpdatingShare(false);
    }
  };

  const handleRefresh = () => {
    refetch().then(() => {
      toast({ title: t("gps.locationsUpdated") });
    });
  };

  const handleSOS = async () => {
    setSosSending(true);
    try {
      if (!userId) throw new Error(Z("未登录", "Not authenticated"));
      const pos = await getCurrentPosition({ timeout: 8000 });
      await writeLocationAndCheckZones(pos?.latitude ?? 0, pos?.longitude ?? 0, {
        accuracy: pos?.accuracy,
        isEmergency: true,
      });
      refetch();
      setSosDialogOpen(false);
      toast({
        title: t("gps.sosSuccess"),
        description: pos
          ? t("gps.sosSuccessDesc", { groups: site.navLabels.careGroups.toLowerCase() })
          : t("gps.sosWithoutLocation", "SOS alert sent without location. Your care circle has been notified."),
      });
    } catch (err: any) {
      toast({ title: t("gps.sosFailed"), description: err.message || t("gps.sosFailedDesc"), variant: "destructive" });
    } finally {
      setSosSending(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await acknowledgeAlertWordPress(alertId);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_read: true } : a));
    } catch {}
  };

  // ─── Safe zone CRUD (100% in-app, never the WP admin) ──────
  const reloadZones = async () => {
    if (!userId) return;
    try {
      const rows = await fetchSafeZonesWordPress(String(userId));
      setZones(rows);
    } catch {}
  };

  const zoneLabel = (code: string, zoneName?: string | null) => zoneTypeLabel(code, zoneName ?? null, isCN);

  const openNewZone = () => {
    const center = leafletMap.current?.getCenter();
    setZoneForm({
      ...emptyZoneForm,
      latitude: center ? center.lat.toFixed(6) : "",
      longitude: center ? center.lng.toFixed(6) : "",
    });
    setCustomNameDraft("");
    setZoneDialogOpen(true);
  };

  const openEditZone = (zone: any) => {
    setCustomNameDraft(isCustomZone(String(zone.zone_type)) ? String(zone.zone_name || "") : "");
    const pts: [number, number][] = Array.isArray(zone.polygon_points) ? zone.polygon_points : [];
    setZoneForm({
      id: String(zone.id),
      zone_type: String(zone.zone_type),
      shape_type: String(zone.shape_type).toLowerCase() === "polygon" && pts.length >= 3 ? "Polygon" : "Radius",
      polygon_points: pts,
      latitude: zone.latitude != null ? String(zone.latitude) : "",
      longitude: zone.longitude != null ? String(zone.longitude) : "",
      radius_meters: String(zone.radius_meters ?? 200),
      notify_on_enter: !!zone.notify_on_enter,
      notify_on_exit: !!zone.notify_on_exit,
      is_active: !!zone.is_active,
      receiver_ids: Array.isArray(zone.receiver_ids) ? zone.receiver_ids.map(String) : [],
    });
    setZoneDialogOpen(true);
  };


  const useMyLocationForZone = async () => {
    try {
      const pos = await getCurrentPosition({ timeout: 10000 });
      if (!pos) throw new Error("no position");
      setZoneForm(f => ({ ...f, latitude: pos.latitude.toFixed(6), longitude: pos.longitude.toFixed(6) }));
    } catch {
      toast({ title: t("gps.couldNotGetLocation"), description: t("gps.enableLocationAccess"), variant: "destructive" });
    }
  };

  const handleSaveZone = async () => {
    const isPolygon = zoneForm.shape_type === "Polygon";
    const points = zoneForm.polygon_points;
    const radius = Number(zoneForm.radius_meters);
    const isCustom = isCustomZone(zoneForm.zone_type);
    if (isCustom && !customNameDraft.trim()) {
      toast({ title: Z("请填写自定义区域名称", "Custom zone name is required"), variant: "destructive" });
      return;
    }
    // A drawn outline keeps its own points; its centre is their average so the
    // list, popups and alerts still have one anchor point.
    let lat = Number(zoneForm.latitude);
    let lng = Number(zoneForm.longitude);
    if (isPolygon) {
      if (points.length < 3) {
        toast({ title: Z("手绘范围至少需要 3 个点", "A drawn area needs at least 3 points"), variant: "destructive" });
        return;
      }
      lat = points.reduce((s, p) => s + p[0], 0) / points.length;
      lng = points.reduce((s, p) => s + p[1], 0) / points.length;
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      toast({ title: Z("这个位置填得不对，请在地图上重新选一次", "That location doesn't look right — please pick the spot on the map again"), variant: "destructive" });
      return;
    }
    if (!isPolygon && (!Number.isFinite(radius) || radius < 20)) {
      toast({ title: Z("范围至少要 20 米", "Please make the area at least 20 metres wide"), variant: "destructive" });
      return;
    }
    setZoneSaving(true);
    try {
      const payload = {
        zone_type: zoneForm.zone_type,
        // a57 — the zone's own name; Safe/Danger keep their fixed label.
        zone_name: isCustom ? customNameDraft.trim() : "",
        shape_type: isPolygon ? "Polygon" : "Radius",
        polygon_points: isPolygon ? points : [],
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lng.toFixed(6)),
        radius_meters: isPolygon ? 0 : Math.round(radius),
        notify_on_enter: zoneForm.notify_on_enter,
        notify_on_exit: zoneForm.notify_on_exit,
        is_active: zoneForm.is_active,
        // Receivers live on the cared one (Relation 290), shared by all zones.
        user_id: String(userId),
        receiver_ids: zoneForm.receiver_ids,
      };
      if (zoneForm.id) {
        await updateSafeZoneWordPress(zoneForm.id, payload);

      } else {
        await createSafeZoneWordPress({ user_id: String(userId), ...payload });
      }
      await reloadZones();
      setZoneDialogOpen(false);
      toast({ title: zoneForm.id ? Z("区域已更新", "Zone updated") : Z("区域已创建", "Zone created") });
    } catch (err: any) {
      toast({ title: Z("保存失败", "Save failed"), description: err?.message, variant: "destructive" });
    } finally {
      setZoneSaving(false);
    }
  };

  const handleDeleteZone = async (zone: any) => {
    setZoneDeletingId(String(zone.id));
    try {
      await deleteSafeZoneWordPress(String(zone.id));
      setZones(prev => prev.filter(z => String(z.id) !== String(zone.id)));
      toast({ title: Z("区域已删除", "Zone deleted") });
    } catch (err: any) {
      toast({ title: Z("删除失败", "Delete failed"), description: err?.message, variant: "destructive" });
    } finally {
      setZoneDeletingId(null);
    }
  };

  const handleToggleZoneActive = async (zone: any, next: boolean) => {
    setZones(prev => prev.map(z => (String(z.id) === String(zone.id) ? { ...z, is_active: next } : z)));
    try {
      await updateSafeZoneWordPress(String(zone.id), { is_active: next });
    } catch (err: any) {
      setZones(prev => prev.map(z => (String(z.id) === String(zone.id) ? { ...z, is_active: !next } : z)));
      toast({ title: Z("更新失败", "Update failed"), description: err?.message, variant: "destructive" });
    }
  };

  const dangerZoneCount = zones.filter(z => isDangerZone(String(z.zone_type))).length;

  const unreadAlerts = alerts.filter(a => !a.is_read);


  return (
    <div className="max-w-6xl mx-auto px-4 py-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{t("gps.gpsTracking")}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {t("gps.realtimeLocation")}
            <span className="ml-2 inline-block whitespace-nowrap text-xs text-muted-foreground/70">
              <Radio className="inline h-3 w-3 mr-1 text-success" />
              {t("gps.autoRefresh", "Auto-refreshing")}
            </span>
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" /> {t("common.refresh")}
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setSosDialogOpen(true)}>
            <AlertTriangle className="h-4 w-4 mr-1" /> {t("gps.sos")}
          </Button>
        </div>
      </div>

      {/* SOS Dialog */}
      <Dialog open={sosDialogOpen} onOpenChange={setSosDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> {t("gps.emergencySOS")}
            </DialogTitle>
            <DialogDescription>
              {t("gps.sosDesc", { groups: site.navLabels.careGroups.toLowerCase() })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSosDialogOpen(false)} disabled={sosSending}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleSOS} disabled={sosSending}>
              {sosSending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t("gps.sosConfirmSending")}</> : t("gps.sendSOS")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Safe / danger zone editor — full in-app management */}
      <Dialog open={zoneDialogOpen} onOpenChange={setZoneDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hexagon className="h-5 w-5 text-primary" />
              {zoneForm.id ? Z("编辑区域", "Edit zone") : Z("新建区域", "New zone")}
            </DialogTitle>
            <DialogDescription>
              {Z("设置区域中心、半径和提醒方式。", "Set the zone centre, radius and alert rules.")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{Z("区域类型", "Zone type")}</Label>
              <div className="grid grid-cols-3 gap-2">
                {ZONE_TYPE_CODES.map((code) => {
                  const active = zoneForm.zone_type === code;
                  return (
                    <Button
                      key={code}
                      type="button"
                      size="sm"
                      className="truncate"
                      variant={active ? (isDangerZone(code) ? "destructive" : "default") : "outline"}
                      onClick={() => {
                        setZoneForm(f => ({ ...f, zone_type: code }));
                        if (!isCustomZone(code)) setCustomNameDraft("");
                      }}
                    >
                      {isDangerZone(code) ? <AlertTriangle className="h-4 w-4 mr-1" /> : <Shield className="h-4 w-4 mr-1" />}
                      {zoneLabel(code)}
                    </Button>
                  );
                })}
              </div>
            </div>

            {isCustomZone(zoneForm.zone_type) && (
              <div className="space-y-1.5">
                <Label htmlFor="zone-custom-name">
                  {Z("自定义区域名称", "Custom zone name")}
                </Label>
                <Input
                  id="zone-custom-name"
                  value={customNameDraft}
                  onChange={(e) => setCustomNameDraft(e.target.value)}
                  placeholder={Z("例如：日托中心", 'e.g. "Day centre"')}
                />
              </div>
            )}


            <ZoneShapeEditor
              shape={zoneForm.shape_type}
              onShapeChange={(s) => setZoneForm(f => ({ ...f, shape_type: s }))}
              latitude={zoneForm.latitude}
              longitude={zoneForm.longitude}
              onCenterChange={(lat, lng) => setZoneForm(f => ({ ...f, latitude: lat, longitude: lng }))}
              radiusMeters={zoneForm.radius_meters}
              onRadiusChange={(r) => setZoneForm(f => ({ ...f, radius_meters: r }))}
              points={zoneForm.polygon_points}
              onPointsChange={(p) => setZoneForm(f => ({ ...f, polygon_points: p }))}
              onUseMyLocation={useMyLocationForZone}
              danger={isDangerZone(zoneForm.zone_type)}
            />


            <div className="space-y-3 rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">{Z("进入时提醒", "Alert on entry")}</Label>
                <Switch checked={zoneForm.notify_on_enter}
                  onCheckedChange={(v) => setZoneForm(f => ({ ...f, notify_on_enter: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">{Z("离开时提醒", "Alert on exit")}</Label>
                <Switch checked={zoneForm.notify_on_exit}
                  onCheckedChange={(v) => setZoneForm(f => ({ ...f, notify_on_exit: v }))} />
              </div>
              <div>
                <Label className="text-sm">{Z("提醒接收人（对该被护理人的所有区域生效）", "Alert receivers (apply to all zones of this person)")}</Label>
                <div className="mt-2 max-h-32 overflow-auto rounded-md border p-2 space-y-2">
                  {receiverCandidates.length === 0 && (
                    <p className="text-xs text-muted-foreground">{Z("暂无可选成员", "No members available")}</p>
                  )}
                  {receiverCandidates.map((pp: any) => {
                    const pid = String(pp.userId ?? "").replace(/^wp-/, "");
                    const checked = zoneForm.receiver_ids.some((r) => String(r).replace(/^wp-/, "") === pid);
                    return (
                      <label key={pp.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => setZoneForm(f => ({
                            ...f,
                            receiver_ids: checked
                              ? f.receiver_ids.filter((r) => String(r).replace(/^wp-/, "") !== pid)
                              : [...f.receiver_ids, pid],
                          }))}
                        />
                        <span>{pp.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">{Z("启用此区域", "Zone active")}</Label>
                <Switch checked={zoneForm.is_active}
                  onCheckedChange={(v) => setZoneForm(f => ({ ...f, is_active: v }))} />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setZoneDialogOpen(false)} disabled={zoneSaving}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSaveZone} disabled={zoneSaving}>
              {zoneSaving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t("common.saving", "Saving...")}</> : t("common.save", "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map + Tabs */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-2">
              <TabsTrigger value="map" className="gap-1"><MapPin className="h-3.5 w-3.5" /> {t("gps.map", "Map")}</TabsTrigger>
              <TabsTrigger value="alerts" className="gap-1">
                <Bell className="h-3.5 w-3.5" /> {t("gps.alerts", "Alerts")}
                {unreadAlerts.length > 0 && <Badge variant="destructive" className="ml-1 text-[10px] px-1">{unreadAlerts.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="zones" className="gap-1"><Hexagon className="h-3.5 w-3.5" /> {t("gps.zones", "Zones")}</TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="mt-0">
              <Card className="border-transparent card-elevated overflow-hidden relative">
                <CardContent className="p-0">
                  <div ref={(node) => { mapRef.current = node; setMapNode(node); }} className="h-[500px] w-full" />
                  {sharingPeople.length === 0 && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[400]">
                      <div className="text-center bg-card/80 backdrop-blur-sm rounded-xl p-6">
                        <MapPin className="h-12 w-12 text-primary/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">{t("gps.noSharingDesc")}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t("gps.enableSharingDesc")}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="mt-0">
              <Card className="border-transparent card-elevated">
                <CardContent className="py-4 space-y-3">
                  {alerts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">{t("gps.noAlerts", "No geofence alerts")}</p>
                  ) : (
                    alerts.slice(0, 20).map((alert: any) => (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-lg border ${alert.is_read ? "bg-muted/30 border-border" : "bg-warning/10 border-warning/30"}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {alert.alert_type?.includes("danger") ? "⚠️" : "📍"} {alert.message || alert.alert_type?.replace(/_/g, " ")}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {alert.created_at ? formatDateTime(alert.created_at) : ""}
                            </p>
                          </div>
                          {!alert.is_read && (
                            <Button variant="ghost" size="sm" onClick={() => handleAcknowledgeAlert(alert.id)}>
                              {t("common.dismiss", "Dismiss")}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="zones" className="mt-0">
              <Card className="border-transparent card-elevated">
                <CardContent className="py-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      {Z("在此创建和管理安全区域与危险区域。", "Create and manage safe and danger zones here.")}
                    </p>
                    <Button size="sm" onClick={openNewZone} className="shrink-0">
                      <Plus className="h-4 w-4 mr-1" />
                      {Z("新建区域", "New zone")}
                    </Button>
                  </div>
                  {zones.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">{t("gps.noZones", "No areas set up yet")}</p>
                  ) : (
                    zones.map((zone: any) => {
                      const isDanger = isDangerZone(String(zone.zone_type));
                      const isPolygon = String(zone.shape_type).toLowerCase() === "polygon";
                      return (
                        <div key={zone.id} className="p-3 rounded-lg bg-muted/50 border border-border">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-3 h-3 rounded-full shrink-0 ${isDanger ? "bg-destructive" : "bg-success"}`} />
                              <p className="text-sm font-medium text-foreground truncate">{zoneLabel(String(zone.zone_type), zone.zone_name)}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Switch
                                checked={!!zone.is_active}
                                onCheckedChange={(v) => handleToggleZoneActive(zone, v)}
                                aria-label={Z("启用区域", "Zone active")}
                              />
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditZone(zone)} aria-label={Z("编辑", "Edit")}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDeleteZone(zone)}
                                disabled={zoneDeletingId === String(zone.id)}
                                aria-label={Z("删除", "Delete")}
                              >
                                {zoneDeletingId === String(zone.id)
                                  ? <Loader2 className="h-4 w-4 animate-spin" />
                                  : <Trash2 className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {isPolygon ? `Polygon (${zone.polygon_points?.length || 0} points)` : `${Z("半径", "Radius")}: ${zone.radius_meters || 200}m`}
                            {" · "}{isDanger ? Z("⚠️ 危险", "⚠️ Danger") : zoneLabel(String(zone.zone_type), zone.zone_name)}
                            {" · "}{zone.is_active ? t("common.active", "Active") : t("common.inactive", "Inactive")}
                          </p>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Tracked People */}
          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle className="text-lg">{t("gps.trackedPeople")}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : people.length > 0 ? people.map((p: any) => (
                <div
                  key={p.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedPerson?.id === p.id ? "bg-accent border border-primary/20" : "bg-muted/50 hover:bg-accent/50"}`}
                  onClick={() => setSelectedPerson(p)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary text-sm font-medium">{p.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${p.isSharing ? "bg-success" : "bg-muted-foreground/30"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      {!p.isSharing && <Badge variant="secondary" className="text-[10px] mt-0.5">{t("gps.notSharing")}</Badge>}
                    </div>
                  </div>
                  {p.isSharing && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.lastLocation}</p>
                      <p className="flex items-center gap-1 mt-1"><Clock className="h-3 w-3" /> {p.lastUpdated}</p>
                    </div>
                  )}
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">{t("gps.noLocationShares")}</p>
              )}
            </CardContent>
          </Card>

          {/* Selected Person Detail */}
          {selectedPerson && selectedPerson.coordinates?.lat ? (
            <Card className="border-transparent card-elevated">
              <CardHeader><CardTitle className="text-lg">{selectedPerson.name}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="p-2 rounded bg-muted/50 text-sm">
                  <p className="text-muted-foreground text-xs">{t("gps.coordinates")}</p>
                  <p className="font-mono text-xs text-foreground">{selectedPerson.coordinates.lat?.toFixed(6)}, {selectedPerson.coordinates.lng?.toFixed(6)}</p>
                </div>
                <div className="p-2 rounded bg-muted/50 text-sm">
                  <p className="text-muted-foreground text-xs">{t("gps.lastUpdated")}</p>
                  <p className="text-xs text-foreground">{selectedPerson.lastUpdated}</p>
                </div>
                {trailData[selectedPerson.userId]?.length > 0 && (
                  <div className="p-2 rounded bg-muted/50 text-sm">
                    <p className="text-muted-foreground text-xs flex items-center gap-1"><Route className="h-3 w-3" /> {t("gps.trail", "Trail")}</p>
                    <p className="text-xs text-foreground">{trailData[selectedPerson.userId].length} {t("gps.points", "points")}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPerson.coordinates.lat},${selectedPerson.coordinates.lng}`} target="_blank" rel="noopener noreferrer">
                      <Navigation className="h-3 w-3 mr-1" /> {t("common.directions")}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Settings */}
          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle className="text-lg">{t("common.settings")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">{t("gps.shareMyLocation")}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {shareMyLocation
                      ? t("gps.sharingActive", "Sharing every 15s")
                      : t("gps.sharingInactive", "Not sharing")}
                  </p>
                </div>
                 <Switch aria-label={t("gps.shareMyLocation")} checked={shareMyLocation} onCheckedChange={handleToggleShare} disabled={updatingShare} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">{t("gps.geofenceAlerts")}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {zones.length} {t("gps.zonesConfigured", "zones")} ({dangerZoneCount} {t("gps.danger", "danger")})
                  </p>
                </div>
                 <Switch aria-label={t("gps.geofenceAlerts")} checked={geofenceAlerts} onCheckedChange={setGeofenceAlerts} />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Shield className="h-3 w-3" /> {t("gps.locationEncrypted", { groups: site.navLabels.careGroups.toLowerCase() })}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
