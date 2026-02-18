import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  MapPin, Navigation, RefreshCw, X, Plus, Trash2, Edit2,
  Bell, BellOff, Clock, Shield, AlertTriangle, CheckCircle2,
  Home, Building2, GraduationCap, Heart, Target, Ban,
  Loader2, Send, ChevronDown, ChevronUp, Radio,
} from "lucide-react";
import {
  useSafeZones, useCreateSafeZone, useUpdateSafeZone, useDeleteSafeZone,
  useCaredOneLocation, useCaredOneLocationHistory,
  useSafeZoneAlerts, useAcknowledgeAlert, useAcknowledgeAllAlerts,
  useLocationRequests, useSendLocationRequest, useCancelLocationRequest,
  useCaredOneLocationSettings, useShareMyLocation,
} from "@/hooks/use-care-data";
import { careAuth } from "@/integrations/supabase/external-client";
import { useToast } from "@/hooks/use-toast";

// ─── Leaflet dynamic import to avoid SSR issues ────────────
let L: any = null;

// ─── Utility: Haversine distance in meters ─────────────────
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Utility: Ray-casting point-in-polygon ─────────────────
function pointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// ─── Zone category config ───────────────────────────────────
const CATEGORY_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  home: { color: "#10B981", icon: Home, label: "Home" },
  work: { color: "#3B82F6", icon: Building2, label: "Work" },
  school: { color: "#8B5CF6", icon: GraduationCap, label: "School" },
  medical: { color: "#EF4444", icon: Heart, label: "Medical" },
  custom: { color: "#F59E0B", icon: Target, label: "Custom" },
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── Check if zone is currently active (schedule-aware) ────
function isZoneActive(zone: any): boolean {
  if (!zone.schedule_enabled) return true;
  const now = new Date();
  const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now.getDay()];
  if (!zone.schedule_days?.includes(dayName)) return false;
  const curMin = now.getHours() * 60 + now.getMinutes();
  if (!zone.schedule_start_time || !zone.schedule_end_time) return true;
  const [sh, sm] = zone.schedule_start_time.split(":").map(Number);
  const [eh, em] = zone.schedule_end_time.split(":").map(Number);
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  if (start <= end) return curMin >= start && curMin <= end;
  return curMin >= start || curMin <= end; // overnight
}

// ─── Check breach for a single zone ───────────────────────
function checkZoneBreach(zone: any, lat: number, lng: number): { breached: boolean; distance: number } {
  if (!isZoneActive(zone)) return { breached: false, distance: 0 };
  let inside = false;
  let distance = 0;

  if (zone.shape_type === "polygon" && zone.polygon_points?.length >= 3) {
    inside = pointInPolygon(lat, lng, zone.polygon_points);
    distance = haversine(lat, lng, zone.latitude, zone.longitude);
  } else {
    distance = haversine(lat, lng, zone.latitude, zone.longitude);
    inside = distance <= (zone.radius || 200);
  }

  // safe zone: breach = being outside; danger zone: breach = being inside
  const breached = zone.zone_type === "danger" ? inside : !inside;
  return { breached, distance: Math.round(distance) };
}

type Tab = "location" | "safezones" | "alerts" | "requests" | "history";

interface Props {
  caredOneId: string;
  caredOneName: string;
}

export default function LocationCard({ caredOneId, caredOneName }: Props) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("location");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Queries
  const { data: currentLocation, refetch: refetchLocation, isLoading: loadingLocation } = useCaredOneLocation(caredOneId);
  const { data: locationHistory, refetch: refetchHistory } = useCaredOneLocationHistory(caredOneId);
  const { data: zones, refetch: refetchZones } = useSafeZones(caredOneId);
  const { data: alerts, refetch: refetchAlerts } = useSafeZoneAlerts(caredOneId);
  const { data: locationRequests, refetch: refetchRequests } = useLocationRequests(caredOneId);
  const { data: locationSettings } = useCaredOneLocationSettings(caredOneId);

  // Mutations
  const createZone = useCreateSafeZone();
  const updateZone = useUpdateSafeZone();
  const deleteZone = useDeleteSafeZone();
  const acknowledgeAlert = useAcknowledgeAlert();
  const acknowledgeAll = useAcknowledgeAllAlerts();
  const sendRequest = useSendLocationRequest();
  const cancelRequest = useCancelLocationRequest();
  const shareLocation = useShareMyLocation();

  // Zone form state
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);
  const [zoneForm, setZoneForm] = useState({
    name: "", zone_type: "safe", category: "home", shape_type: "radius",
    latitude: "", longitude: "", radius: 200,
    description: "", notify_on_enter: true, notify_on_exit: true,
    schedule_enabled: false, schedule_start_time: "08:00", schedule_end_time: "20:00",
    schedule_days: [] as string[],
  });
  const [pickingOnMap, setPickingOnMap] = useState(false);
  const [gettingGPS, setGettingGPS] = useState(false);

  // Request form state
  const [requestMessage, setRequestMessage] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [emergencyConfirm, setEmergencyConfirm] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);

  // Sharing state
  const [sharingMyLocation, setSharingMyLocation] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    careAuth.auth.getSession().then(({ data }) => {
      setCurrentUserId(data.session?.user?.id ?? null);
    });
  }, []);

  // ─── Leaflet map init ──────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "location" && activeTab !== "safezones") return;
    if (!mapRef.current) return;

    const initMap = async () => {
      if (!L) {
        L = await import("leaflet");
        // Fix default icon paths
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
      }

      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      leafletMapRef.current = map;

      renderMapContent(map);

      if (pickingOnMap) {
        map.getContainer().style.cursor = "crosshair";
        map.once("click", (e: any) => {
          setZoneForm(p => ({ ...p, latitude: e.latlng.lat.toFixed(6), longitude: e.latlng.lng.toFixed(6) }));
          setPickingOnMap(false);
          map.getContainer().style.cursor = "";
        });
      }
    };

    initMap();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [activeTab, currentLocation, zones, pickingOnMap]);

  const renderMapContent = useCallback((map: any) => {
    if (!L || !map) return;
    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const bounds: [number, number][] = [];

    // Person marker
    if (currentLocation?.latitude && currentLocation?.longitude) {
      const lat = parseFloat(currentLocation.latitude);
      const lng = parseFloat(currentLocation.longitude);
      bounds.push([lat, lng]);

      const personIcon = L.divIcon({
        className: "",
        html: `<div style="width:22px;height:22px;border-radius:50%;background:#10B981;border:3px solid white;box-shadow:0 0 0 3px rgba(16,185,129,0.3);animation:pulse 2s infinite"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      const m = L.marker([lat, lng], { icon: personIcon })
        .addTo(map)
        .bindPopup(`<b>${caredOneName}</b><br>${currentLocation.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}`);
      markersRef.current.push(m);
    }

    // Zone overlays
    (zones || []).forEach((zone: any) => {
      if (!zone.latitude || !zone.longitude) return;
      const zLat = parseFloat(zone.latitude);
      const zLng = parseFloat(zone.longitude);
      const color = zone.zone_type === "danger" ? "#EF4444" : (CATEGORY_CONFIG[zone.category]?.color || "#10B981");

      if (zone.shape_type === "polygon" && zone.polygon_points?.length >= 3) {
        const poly = L.polygon(zone.polygon_points, {
          color, fillColor: color, fillOpacity: 0.15, weight: 2,
          dashArray: zone.zone_type === "danger" ? "6,4" : undefined,
        }).addTo(map).bindPopup(`<b>${zone.name}</b><br>${zone.zone_type} zone`);
        markersRef.current.push(poly);
        zone.polygon_points.forEach((pt: [number, number]) => bounds.push(pt));
      } else if (zone.latitude && zone.longitude) {
        const circle = L.circle([zLat, zLng], {
          radius: zone.radius || 200, color, fillColor: color, fillOpacity: 0.15, weight: 2,
          dashArray: zone.zone_type === "danger" ? "6,4" : undefined,
        }).addTo(map).bindPopup(`<b>${zone.name}</b><br>${zone.zone_type} zone · ${zone.radius || 200}m`);
        markersRef.current.push(circle);
        bounds.push([zLat, zLng]);
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else {
      map.setView([37.0902, -95.7129], 4);
    }
  }, [currentLocation, zones, caredOneName]);

  // Breach computation
  const breaches = (zones || []).filter((z: any) => {
    if (!currentLocation?.latitude || !currentLocation?.longitude) return false;
    const { breached } = checkZoneBreach(z, parseFloat(currentLocation.latitude), parseFloat(currentLocation.longitude));
    return breached;
  });

  const unreadAlerts = (alerts || []).filter((a: any) => !a.is_read).length;
  const pendingRequests = (locationRequests || []).filter((r: any) => r.status === "pending").length;

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchLocation(), refetchHistory(), refetchZones(), refetchAlerts(), refetchRequests()]);
    setRefreshing(false);
    toast({ title: "Refreshed" });
  };

  const handleShareMyLocation = async () => {
    if (!navigator.geolocation) { toast({ title: "Geolocation not supported", variant: "destructive" }); return; }
    setSharingMyLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        shareLocation.mutate({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy }, {
          onSuccess: () => { setSharingMyLocation(false); toast({ title: "Your location shared ✓" }); },
          onError: (e: any) => { setSharingMyLocation(false); toast({ title: "Failed to share", description: e.message, variant: "destructive" }); },
        });
      },
      () => { setSharingMyLocation(false); toast({ title: "Could not get location", variant: "destructive" }); },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleGetGPS = () => {
    if (!navigator.geolocation) return;
    setGettingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setZoneForm(p => ({ ...p, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }));
        setGettingGPS(false);
      },
      () => { setGettingGPS(false); toast({ title: "Could not get location", variant: "destructive" }); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const openZoneForm = (zone?: any) => {
    if (zone) {
      setEditingZone(zone);
      setZoneForm({
        name: zone.name || "", zone_type: zone.zone_type || "safe", category: zone.category || "home",
        shape_type: zone.shape_type || "radius", latitude: zone.latitude?.toString() || "", longitude: zone.longitude?.toString() || "",
        radius: zone.radius || 200, description: zone.description || "",
        notify_on_enter: zone.notify_on_enter ?? true, notify_on_exit: zone.notify_on_exit ?? true,
        schedule_enabled: zone.schedule_enabled ?? false, schedule_start_time: zone.schedule_start_time || "08:00",
        schedule_end_time: zone.schedule_end_time || "20:00", schedule_days: zone.schedule_days || [],
      });
    } else {
      setEditingZone(null);
      setZoneForm({
        name: "", zone_type: "safe", category: "home", shape_type: "radius",
        latitude: "", longitude: "", radius: 200, description: "",
        notify_on_enter: true, notify_on_exit: true, schedule_enabled: false,
        schedule_start_time: "08:00", schedule_end_time: "20:00", schedule_days: [],
      });
    }
    setShowZoneForm(true);
  };

  const handleSaveZone = () => {
    if (!zoneForm.name.trim()) { toast({ title: "Zone name required", variant: "destructive" }); return; }
    const lat = parseFloat(zoneForm.latitude);
    const lng = parseFloat(zoneForm.longitude);
    if (isNaN(lat) || isNaN(lng)) { toast({ title: "Valid coordinates required", variant: "destructive" }); return; }

    const color = zoneForm.zone_type === "danger" ? "#EF4444" : (CATEGORY_CONFIG[zoneForm.category]?.color || "#10B981");
    const payload = {
      user_id: caredOneId, name: zoneForm.name.trim(), zone_type: zoneForm.zone_type,
      shape_type: zoneForm.shape_type, category: zoneForm.zone_type === "danger" ? "custom" : zoneForm.category,
      color, latitude: lat, longitude: lng, radius: zoneForm.shape_type === "polygon" ? 0 : zoneForm.radius,
      description: zoneForm.description || null, notify_on_enter: zoneForm.notify_on_enter,
      notify_on_exit: zoneForm.notify_on_exit, schedule_enabled: zoneForm.schedule_enabled,
      schedule_start_time: zoneForm.schedule_enabled ? zoneForm.schedule_start_time : null,
      schedule_end_time: zoneForm.schedule_enabled ? zoneForm.schedule_end_time : null,
      schedule_days: zoneForm.schedule_enabled ? zoneForm.schedule_days : [],
    };

    if (editingZone) {
      updateZone.mutate({ id: editingZone.id, ...payload }, {
        onSuccess: () => { setShowZoneForm(false); setEditingZone(null); toast({ title: "Zone updated ✓" }); },
        onError: (e: any) => toast({ title: "Failed to update", description: e.message, variant: "destructive" }),
      });
    } else {
      createZone.mutate(payload, {
        onSuccess: () => { setShowZoneForm(false); toast({ title: "Zone created ✓" }); },
        onError: (e: any) => toast({ title: "Failed to create", description: e.message, variant: "destructive" }),
      });
    }
  };

  const handleDeleteZone = (id: string, name: string) => {
    deleteZone.mutate(id, {
      onSuccess: () => toast({ title: `Zone "${name}" deleted` }),
      onError: (e: any) => toast({ title: "Failed to delete", description: e.message, variant: "destructive" }),
    });
  };

  const handleSendRequest = async () => {
    if (isEmergency && !emergencyConfirm) { setEmergencyConfirm(true); return; }
    setSendingRequest(true);
    sendRequest.mutate({ caredOneId, message: requestMessage, isEmergency }, {
      onSuccess: () => {
        setSendingRequest(false); setRequestMessage(""); setIsEmergency(false); setEmergencyConfirm(false);
        toast({ title: isEmergency ? "Emergency request sent 🚨" : "Location request sent ✓" });
      },
      onError: (e: any) => { setSendingRequest(false); toast({ title: "Failed to send", description: e.message, variant: "destructive" }); },
    });
  };

  const handleAcknowledge = (alertId: string) => {
    acknowledgeAlert.mutate({ alertId, userId: caredOneId }, {
      onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
    });
  };

  const handleAcknowledgeAll = () => {
    acknowledgeAll.mutate(caredOneId, {
      onSuccess: () => toast({ title: "All alerts acknowledged ✓" }),
      onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
    });
  };

  // CSS for Leaflet
  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if (!document.getElementById("pulse-style")) {
      const style = document.createElement("style");
      style.id = "pulse-style";
      style.textContent = `@keyframes pulse{0%,100%{box-shadow:0 0 0 3px rgba(16,185,129,0.3)}50%{box-shadow:0 0 0 8px rgba(16,185,129,0)}}`;
      document.head.appendChild(style);
    }
  }, []);

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: "location", label: "Map" },
    { key: "safezones", label: "Zones", badge: (zones || []).length },
    { key: "alerts", label: "Alerts", badge: unreadAlerts || undefined },
    { key: "requests", label: "Requests", badge: pendingRequests || undefined },
    { key: "history", label: "History" },
  ];

  // ─── Map area (shared between map and zones tab) ───────────
  const MapArea = () => (
    <div className="relative mb-4">
      <div ref={mapRef} style={{ height: 300, borderRadius: 8, overflow: "hidden", background: "hsl(var(--muted))" }} />
      {activeTab === "safezones" && (
        <Button
          size="sm" variant={"coral" as any}
          className="absolute top-2 right-2 z-[1000] shadow-md"
          onClick={() => openZoneForm()}
        >
          <Plus className="h-3 w-3 mr-1" /> Add Zone
        </Button>
      )}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Location & Safe Zones</h2>
          <p className="text-xs text-muted-foreground">For {caredOneName}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleShareMyLocation} disabled={sharingMyLocation}>
            {sharingMyLocation ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Radio className="h-3 w-3 mr-1" />}
            Share My Location
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setActiveTab("requests"); }}>
            <Send className="h-3 w-3 mr-1" /> Request Location
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Breach banner */}
      {breaches.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-2 text-destructive font-semibold text-sm mb-1">
            <AlertTriangle className="h-4 w-4" /> Zone Breach Detected
          </div>
          {breaches.map((z: any) => (
            <p key={z.id} className="text-xs text-destructive/80">
              {z.zone_type === "danger" ? `⚠ ${caredOneName} is inside danger zone "${z.name}"` : `⚠ ${caredOneName} is outside safe zone "${z.name}"`}
            </p>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-border overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-1.5 border-b-2 transition-colors ${activeTab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
            {t.badge ? (
              <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold ${t.key === "alerts" ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`}>
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* ─── MAP TAB ─────────────────────────────────────────── */}
      {activeTab === "location" && (
        <div>
          <MapArea />

          {/* Location sharing settings (read-only) */}
          {locationSettings && (
            <Card className="border-transparent card-elevated mb-4">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Sharing Settings (set by {caredOneName})</p>
                <div className="flex gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${locationSettings.is_sharing_enabled ? "bg-success" : "bg-muted-foreground"}`} />
                    <span className="text-sm text-foreground">{locationSettings.is_sharing_enabled ? "Sharing enabled" : "Sharing disabled"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-foreground">{locationSettings.require_approval ? "Approval required" : "No approval needed"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current location details */}
          {loadingLocation ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : currentLocation ? (
            <Card className="border-transparent card-elevated">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs text-muted-foreground">Last seen {new Date(currentLocation.created_at).toLocaleString()}</span>
                </div>
                {currentLocation.address && <p className="text-sm font-medium text-foreground">{currentLocation.address}</p>}
                <p className="text-xs text-muted-foreground font-mono">
                  {parseFloat(currentLocation.latitude).toFixed(6)}, {parseFloat(currentLocation.longitude).toFixed(6)}
                  {currentLocation.accuracy && ` ± ${Math.round(currentLocation.accuracy)}m`}
                </p>
                {currentLocation.battery_level != null && (
                  <p className="text-xs text-muted-foreground">🔋 {currentLocation.battery_level}%</p>
                )}
                <Button variant="outline" size="sm" asChild>
                  <a href={`https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`} target="_blank" rel="noopener noreferrer">
                    <Navigation className="h-3 w-3 mr-1" /> Open in Maps
                  </a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No location data available</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setActiveTab("requests")}>
                <Send className="h-3 w-3 mr-1" /> Request Location
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ─── ZONES TAB ───────────────────────────────────────── */}
      {activeTab === "safezones" && (
        <div>
          <MapArea />

          {/* Zone form */}
          {showZoneForm && (
            <Card className="border-primary/20 card-elevated mb-4">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{editingZone ? "Edit Zone" : "New Zone"}</h3>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setShowZoneForm(false); setEditingZone(null); }}><X className="h-3.5 w-3.5" /></Button>
                </div>

                {/* Zone type toggle */}
                <div className="flex rounded-lg border overflow-hidden">
                  {["safe", "danger"].map(t => (
                    <button key={t} onClick={() => setZoneForm(p => ({ ...p, zone_type: t }))}
                      className={`flex-1 py-2 text-sm font-medium transition-colors ${zoneForm.zone_type === t ? (t === "danger" ? "bg-destructive text-destructive-foreground" : "bg-success text-white") : "bg-transparent text-muted-foreground"}`}
                    >
                      {t === "safe" ? "✅ Safe Zone" : "⚠️ Danger Zone"}
                    </button>
                  ))}
                </div>
                {zoneForm.zone_type === "danger" && (
                  <p className="text-xs text-destructive bg-destructive/10 rounded p-2">Alert when {caredOneName} enters this area (e.g. casino, restricted area)</p>
                )}

                {/* Name */}
                <div>
                  <Label className="text-xs">Zone Name *</Label>
                  <Input value={zoneForm.name} onChange={e => setZoneForm(p => ({ ...p, name: e.target.value }))} placeholder='e.g. "Home", "Casino"' className="mt-1" />
                </div>

                {/* Category (safe only) */}
                {zoneForm.zone_type === "safe" && (
                  <div>
                    <Label className="text-xs">Category</Label>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
                        const Icon = cfg.icon;
                        return (
                          <button key={key} onClick={() => setZoneForm(p => ({ ...p, category: key }))}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${zoneForm.category === key ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent"}`}
                            style={{ borderColor: zoneForm.category === key ? cfg.color : undefined, color: zoneForm.category === key ? cfg.color : undefined, backgroundColor: zoneForm.category === key ? `${cfg.color}20` : undefined }}
                          >
                            <Icon className="h-3 w-3" /> {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Coordinates */}
                <div>
                  <Label className="text-xs">Center Coordinates</Label>
                  <div className="flex gap-2 mt-1">
                    <Button variant="outline" size="sm" onClick={handleGetGPS} disabled={gettingGPS}>
                      {gettingGPS ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <MapPin className="h-3 w-3 mr-1" />}
                      Use {caredOneName}'s Location
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPickingOnMap(true)}>
                      <Navigation className="h-3 w-3 mr-1" /> Pick on Map
                    </Button>
                  </div>
                  {pickingOnMap && <p className="text-xs text-primary mt-1">👆 Click on the map above to set the zone center</p>}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Latitude</Label>
                      <Input value={zoneForm.latitude} onChange={e => setZoneForm(p => ({ ...p, latitude: e.target.value }))} placeholder="40.71280" className="mt-0.5 font-mono text-xs" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Longitude</Label>
                      <Input value={zoneForm.longitude} onChange={e => setZoneForm(p => ({ ...p, longitude: e.target.value }))} placeholder="-74.00600" className="mt-0.5 font-mono text-xs" />
                    </div>
                  </div>
                </div>

                {/* Radius slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs">Radius</Label>
                    <span className="text-xs text-muted-foreground font-mono">{zoneForm.radius}m</span>
                  </div>
                  <Slider min={50} max={5000} step={50} value={[zoneForm.radius]}
                    onValueChange={([v]) => setZoneForm(p => ({ ...p, radius: v }))} />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5"><span>50m</span><span>5km</span></div>
                </div>

                {/* Description */}
                <div>
                  <Label className="text-xs">Description (optional)</Label>
                  <Input value={zoneForm.description} onChange={e => setZoneForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional notes..." className="mt-1" />
                </div>

                {/* Notifications */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Notify on enter</Label>
                    <Switch checked={zoneForm.notify_on_enter} onCheckedChange={v => setZoneForm(p => ({ ...p, notify_on_enter: v }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Notify on exit</Label>
                    <Switch checked={zoneForm.notify_on_exit} onCheckedChange={v => setZoneForm(p => ({ ...p, notify_on_exit: v }))} />
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Enable schedule</Label>
                    <Switch checked={zoneForm.schedule_enabled} onCheckedChange={v => setZoneForm(p => ({ ...p, schedule_enabled: v }))} />
                  </div>
                  {zoneForm.schedule_enabled && (
                    <div className="mt-2 space-y-2 pl-2 border-l-2 border-border">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label className="text-[10px]">Start</Label>
                          <Input type="time" value={zoneForm.schedule_start_time} onChange={e => setZoneForm(p => ({ ...p, schedule_start_time: e.target.value }))} className="mt-0.5" />
                        </div>
                        <div className="flex-1">
                          <Label className="text-[10px]">End</Label>
                          <Input type="time" value={zoneForm.schedule_end_time} onChange={e => setZoneForm(p => ({ ...p, schedule_end_time: e.target.value }))} className="mt-0.5" />
                        </div>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {DAYS.map(d => (
                          <button key={d} onClick={() => setZoneForm(p => ({ ...p, schedule_days: p.schedule_days.includes(d) ? p.schedule_days.filter(x => x !== d) : [...p.schedule_days, d] }))}
                            className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${zoneForm.schedule_days.includes(d) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="flex-1" onClick={() => { setShowZoneForm(false); setEditingZone(null); }}>Cancel</Button>
                  <Button
                    className="flex-1"
                    style={{ background: zoneForm.zone_type === "danger" ? "#EF4444" : "#10B981", color: "white" }}
                    onClick={handleSaveZone}
                    disabled={createZone.isPending || updateZone.isPending || !zoneForm.name.trim()}
                  >
                    {(createZone.isPending || updateZone.isPending) ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                    {editingZone ? "Save Changes" : "Create Zone"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Zone list */}
          <div className="space-y-2">
            {(zones || []).length === 0 && !showZoneForm && (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No zones configured</p>
                <p className="text-xs">Add safe zones like Home or Work, or danger zones to avoid</p>
              </div>
            )}
            {(zones || []).map((zone: any) => {
              const catCfg = CATEGORY_CONFIG[zone.category] || CATEGORY_CONFIG.custom;
              const Icon = zone.zone_type === "danger" ? Ban : catCfg.icon;
              const color = zone.zone_type === "danger" ? "#EF4444" : catCfg.color;
              const active = isZoneActive(zone);
              let breachInfo = { breached: false, distance: 0 };
              if (currentLocation?.latitude && currentLocation?.longitude) {
                breachInfo = checkZoneBreach(zone, parseFloat(currentLocation.latitude), parseFloat(currentLocation.longitude));
              }

              return (
                <Card key={zone.id} className="border-transparent card-elevated">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: `${color}20`, color }}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground text-sm">{zone.name}</span>
                          {zone.zone_type === "danger" && <Badge variant="destructive" className="text-[10px]">DANGER</Badge>}
                          {!active && <Badge variant="secondary" className="text-[10px]">⏰ Scheduled</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {zone.shape_type === "polygon" ? "Custom shape" : `${zone.radius || 200}m radius`} · {catCfg.label}
                        </p>
                        {zone.description && <p className="text-xs text-muted-foreground">{zone.description}</p>}
                        {zone.schedule_enabled && zone.schedule_start_time && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {zone.schedule_start_time}–{zone.schedule_end_time} {zone.schedule_days?.join(", ")}
                          </p>
                        )}
                        {currentLocation && active && (
                          <p className={`text-xs mt-1 font-medium ${breachInfo.breached ? "text-destructive" : "text-success"}`}>
                            {zone.zone_type === "safe"
                              ? (breachInfo.breached ? `⚠ Outside (${breachInfo.distance}m away)` : `✓ Inside (${breachInfo.distance}m from center)`)
                              : (breachInfo.breached ? `⚠ INSIDE danger zone! (${breachInfo.distance}m from center)` : `✓ Away (${breachInfo.distance}m)`)}
                          </p>
                        )}
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {zone.notify_on_enter && <Badge variant="outline" className="text-[10px]">Enter alert</Badge>}
                          {zone.notify_on_exit && <Badge variant="outline" className="text-[10px]">Exit alert</Badge>}
                          {zone.schedule_enabled && <Badge variant="outline" className="text-[10px]">Scheduled</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openZoneForm(zone)}><Edit2 className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteZone(zone.id, zone.name)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── ALERTS TAB ──────────────────────────────────────── */}
      {activeTab === "alerts" && (
        <div>
          {unreadAlerts > 0 && (
            <div className="flex justify-end mb-3">
              <Button variant="outline" size="sm" onClick={handleAcknowledgeAll} disabled={acknowledgeAll.isPending}>
                <CheckCircle2 className="h-3 w-3 mr-1" /> Mark all read
              </Button>
            </div>
          )}
          {(alerts || []).length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No zone alerts</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(alerts || []).map((alert: any) => {
                const typeConfig: Record<string, { label: string; color: string }> = {
                  exited_safe_zone: { label: "Left Safe Zone", color: "text-destructive" },
                  entered_safe_zone: { label: "Entered Safe Zone", color: "text-success" },
                  entered_danger_zone: { label: "Entered Danger Zone", color: "text-destructive" },
                  exited_danger_zone: { label: "Left Danger Zone", color: "text-success" },
                };
                const cfg = typeConfig[alert.alert_type] || { label: alert.alert_type, color: "text-muted-foreground" };
                return (
                  <Card key={alert.id} className={`border-transparent card-elevated ${!alert.is_read ? "border-l-2 border-l-destructive" : "opacity-70"}`}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
                            {alert.safe_zone?.name && <Badge variant="secondary" className="text-[10px]">{alert.safe_zone.name}</Badge>}
                          </div>
                          {alert.message && <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>}
                          {alert.distance_from_center != null && (
                            <p className="text-xs text-muted-foreground">{Math.round(alert.distance_from_center)}m from center</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">{new Date(alert.created_at).toLocaleString()}</p>
                        </div>
                        {!alert.is_read && (
                          <Button variant="outline" size="sm" className="text-xs h-7 shrink-0" onClick={() => handleAcknowledge(alert.id)} disabled={acknowledgeAlert.isPending}>
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Ack
                          </Button>
                        )}
                        {alert.is_read && <CheckCircle2 className="h-4 w-4 text-success shrink-0" />}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── REQUESTS TAB ────────────────────────────────────── */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {/* Send form */}
          <Card className="border-transparent card-elevated">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Request {caredOneName}'s Location</h3>
              <Textarea
                value={requestMessage}
                onChange={e => setRequestMessage(e.target.value)}
                placeholder="Optional message (why you need their location)..."
                rows={2}
              />
              <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="checkbox" id="emergency-check"
                    checked={isEmergency}
                    onChange={e => { setIsEmergency(e.target.checked); setEmergencyConfirm(false); }}
                    className="rounded"
                  />
                  <label htmlFor="emergency-check" className="text-sm font-medium text-foreground cursor-pointer">
                    🚨 Emergency
                  </label>
                </div>
                {isEmergency && (
                  <p className="text-xs text-destructive">Bypasses approval — {caredOneName}'s location will be shared immediately without their consent. They will be notified.</p>
                )}
              </div>
              {emergencyConfirm && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive font-medium">
                  ⚠️ Are you sure? This is an emergency override. Click Send again to confirm.
                </div>
              )}
              <Button
                className="w-full"
                style={{ background: isEmergency ? "#EF4444" : undefined }}
                variant={isEmergency ? "default" : ("coral" as any)}
                onClick={handleSendRequest}
                disabled={sendingRequest || sendRequest.isPending}
              >
                {(sendingRequest || sendRequest.isPending) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                {isEmergency && emergencyConfirm ? "Confirm Emergency Request" : isEmergency ? "Send Emergency Request" : "Send Request"}
              </Button>
            </CardContent>
          </Card>

          {/* Pending requests */}
          {(locationRequests || []).filter((r: any) => r.status === "pending").length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Pending</h3>
              <div className="space-y-2">
                {(locationRequests || []).filter((r: any) => r.status === "pending").map((req: any) => (
                  <Card key={req.id} className="border-transparent card-elevated border-l-2 border-l-amber-400">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-amber-500">⏳ Awaiting response</span>
                            {req.is_emergency && <Badge variant="destructive" className="text-[10px]">EMERGENCY</Badge>}
                          </div>
                          {req.message && <p className="text-xs text-muted-foreground mt-0.5">"{req.message}"</p>}
                          <p className="text-xs text-muted-foreground">{new Date(req.created_at).toLocaleString()}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive text-xs h-7"
                          onClick={() => cancelRequest.mutate({ requestId: req.id, caredOneId })}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Request history */}
          {(locationRequests || []).filter((r: any) => r.status !== "pending").length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">History</h3>
              <div className="space-y-2">
                {(locationRequests || []).filter((r: any) => r.status !== "pending").map((req: any) => {
                  const statusConfig: Record<string, { icon: string; label: string; color: string }> = {
                    accepted: { icon: "✓", label: "Accepted", color: "text-success" },
                    emergency_approved: { icon: "🚨", label: "Emergency — Auto-shared", color: "text-destructive" },
                    declined: { icon: "✗", label: "Declined", color: "text-destructive" },
                    cancelled: { icon: "—", label: "Cancelled", color: "text-muted-foreground" },
                    pending: { icon: "⏳", label: "Pending", color: "text-amber-500" },
                  };
                  const sc = statusConfig[req.status] || statusConfig.pending;
                  return (
                    <Card key={req.id} className="border-transparent card-elevated opacity-80">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${sc.color}`}>{sc.icon} {sc.label}</span>
                          {req.is_emergency && req.status !== "emergency_approved" && <Badge variant="destructive" className="text-[10px]">Emergency</Badge>}
                        </div>
                        {req.message && <p className="text-xs text-muted-foreground mt-0.5">"{req.message}"</p>}
                        <p className="text-xs text-muted-foreground">{new Date(req.created_at).toLocaleString()}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {(locationRequests || []).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Send className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No location requests yet</p>
            </div>
          )}
        </div>
      )}

      {/* ─── HISTORY TAB ─────────────────────────────────────── */}
      {activeTab === "history" && (
        <div className="space-y-2">
          {(locationHistory || []).length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Clock className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No location history</p>
            </div>
          ) : (
            (locationHistory || []).map((entry: any, idx: number) => (
              <Card key={entry.id} className="border-transparent card-elevated">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${idx === 0 ? "bg-success" : "bg-muted-foreground/40"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${idx === 0 ? "text-success" : "text-muted-foreground"}`}>
                          {idx === 0 ? "Current" : "Previous"}
                        </span>
                        <span className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</span>
                      </div>
                      {entry.address && <p className="text-sm text-foreground mt-0.5">{entry.address}</p>}
                      {entry.location_name && !entry.address && <p className="text-sm text-foreground">{entry.location_name}</p>}
                      <p className="text-xs text-muted-foreground font-mono">
                        {parseFloat(entry.latitude).toFixed(4)}, {parseFloat(entry.longitude).toFixed(4)}
                      </p>
                      {entry.battery_level != null && <p className="text-xs text-muted-foreground">🔋 {entry.battery_level}%</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
