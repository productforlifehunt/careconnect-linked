import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  Bell, Clock, Shield, AlertTriangle, CheckCircle2,
  Target, Ban,
  Loader2, Send, Radio, Pencil, RotateCcw, Layers,
  ExternalLink,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  useSafeZones, useCreateSafeZone, useUpdateSafeZone, useDeleteSafeZone,
  useCaredOneLocation, useCaredOneLocationHistory,
  useSafeZoneAlerts, useAcknowledgeAlert, useAcknowledgeAllAlerts,
  useLocationRequests, useSendLocationRequest, useCancelLocationRequest,
  useCaredOneLocationSettings, useShareMyLocation,
} from "@/hooks/use-care-data";
import {
  ZONE_TYPE, ZONE_TYPE_CODES, customSlotOf, isDangerZone, isSafeZone,
  zoneTypeLabel, fetchCustomZoneNames, setCustomZoneName,
  type CustomZoneNames,
} from "@/features/location/zone-types";

import { useToast } from "@/hooks/use-toast";
import { formatDate, formatTime, formatDateTime } from "@/lib/locale";


// ─── Inject Leaflet CSS once ────────────────────────────────
if (typeof document !== "undefined" && !document.getElementById("leaflet-css")) {
  const link = document.createElement("link");
  link.id = "leaflet-css";
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);
}
if (typeof document !== "undefined" && !document.getElementById("loc-pulse-kf")) {
  const s = document.createElement("style");
  s.id = "loc-pulse-kf";
  s.textContent = `@keyframes locPulse{0%,100%{box-shadow:0 0 0 3px rgba(16,185,129,.3)}50%{box-shadow:0 0 0 9px rgba(16,185,129,0)}}`;
  document.head.appendChild(s);
}

// ─── Leaflet singleton ──────────────────────────────────────
let L: any = null;
async function getL() {
  if (L) return L;
  L = await import("leaflet");
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
  return L;
}

// ─── Algorithms ─────────────────────────────────────────────
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function pointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function douglasPeucker(points: [number, number][], tolerance: number): [number, number][] {
  if (points.length <= 2) return points;
  let maxDist = 0; let maxIdx = 0;
  const [x1, y1] = points[0]; const [x2, y2] = points[points.length - 1];
  const len = Math.hypot(x2 - x1, y2 - y1);
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i];
    const dist = len === 0 ? Math.hypot(px - x1, py - y1)
      : Math.abs((y2 - y1) * px - (x2 - x1) * py + x2 * y1 - y2 * x1) / len;
    if (dist > maxDist) { maxDist = dist; maxIdx = i; }
  }
  if (maxDist > tolerance) {
    const l = douglasPeucker(points.slice(0, maxIdx + 1), tolerance);
    const r = douglasPeucker(points.slice(maxIdx), tolerance);
    return [...l.slice(0, -1), ...r];
  }
  return [points[0], points[points.length - 1]];
}

function chaikinPerVertex(points: [number, number][], radii: number[]): [number, number][] {
  if (points.length < 3) return points;
  const maxRadius = Math.max(...radii, 0);
  if (maxRadius === 0) return points;
  const iters = Math.ceil(maxRadius);
  let pts: [number, number][] = [...points];
  let rads: number[] = [...radii];
  for (let iter = 0; iter < iters; iter++) {
    const strength = (r: number) => Math.min(1, Math.max(0, r - iter));
    const next: [number, number][] = [];
    const nextR: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      const si = strength(rads[i]);
      const sj = strength(rads[j]);
      const [xi, yi] = pts[i]; const [xj, yj] = pts[j];
      if (si >= 1) {
        next.push([xi * 0.75 + xj * 0.25, yi * 0.75 + yj * 0.25]);
        next.push([xi * 0.25 + xj * 0.75, yi * 0.25 + yj * 0.75]);
        nextR.push(rads[i], rads[j]);
      } else if (si > 0) {
        const q1: [number, number] = [xi * 0.75 + xj * 0.25, yi * 0.75 + yj * 0.25];
        const q2: [number, number] = [xi * 0.25 + xj * 0.75, yi * 0.25 + yj * 0.75];
        next.push([xi * (1 - si) + q1[0] * si, yi * (1 - si) + q1[1] * si]);
        if (sj > 0) { next.push([xj * (1 - sj) + q2[0] * sj, yj * (1 - sj) + q2[1] * sj]); nextR.push(rads[i], rads[j]); }
        else { nextR.push(rads[i]); }
      } else {
        next.push([xi, yi]); nextR.push(rads[i]);
        if (sj > 0) { next.push([xi * 0.25 + xj * 0.75, yi * 0.25 + yj * 0.75]); nextR.push(rads[j]); }
      }
    }
    pts = next; rads = nextR;
  }
  return pts;
}

function centroid(points: [number, number][]): [number, number] {
  const lat = points.reduce((s, p) => s + p[0], 0) / points.length;
  const lng = points.reduce((s, p) => s + p[1], 0) / points.length;
  return [lat, lng];
}

// ─── Zone helpers ────────────────────────────────────────────
// Zone colours are derived from the dictionary type (a55), not from a
// non-dictionary "category". Safe = green, Danger = red, Custom 1..7 get
// stable distinct hues so the map stays readable.
const CUSTOM_ZONE_COLORS = ["#3B82F6", "#8B5CF6", "#F59E0B", "#0EA5E9", "#EC4899", "#14B8A6", "#A16207"];

function zoneColor(code: string): string {
  if (isDangerZone(code)) return "#EF4444";
  if (isSafeZone(code)) return "#10B981";
  const slot = customSlotOf(code);
  return slot ? CUSTOM_ZONE_COLORS[(slot - 1) % CUSTOM_ZONE_COLORS.length] : "#6B7280";
}

function zoneIcon(code: string) {
  if (isDangerZone(code)) return Ban;
  if (isSafeZone(code)) return Shield;
  return Target;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function isZoneActive(zone: any): boolean {
  if (!zone.schedule_enabled) return true;
  const now = new Date();
  const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now.getDay()];
  if (!zone.schedule_days?.includes(dayName)) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  if (!zone.schedule_start_time || !zone.schedule_end_time) return true;
  const [sh, sm] = zone.schedule_start_time.split(":").map(Number);
  const [eh, em] = zone.schedule_end_time.split(":").map(Number);
  const s = sh * 60 + sm, e = eh * 60 + em;
  return s <= e ? cur >= s && cur <= e : cur >= s || cur <= e;
}

function checkZoneBreach(zone: any, lat: number, lng: number): { breached: boolean; distance: number } {
  if (!isZoneActive(zone)) return { breached: false, distance: 0 };
  let inside = false, distance = 0;
  if (zone.shape_type === "polygon" && zone.polygon_points?.length >= 3) {
    const pts: [number, number][] = zone.polygon_points;
    const smoothed = zone.corner_radius?.some((r: number) => r > 0)
      ? chaikinPerVertex(pts, zone.corner_radius) : pts;
    inside = pointInPolygon(lat, lng, smoothed);
    distance = haversine(lat, lng, zone.latitude, zone.longitude);
  } else {
    distance = haversine(lat, lng, zone.latitude, zone.longitude);
    inside = distance <= (zone.radius_meters || 200);
  }
  const isDanger = isDangerZone(zone.zone_type);
  const breached = isDanger
    ? inside
    : isSafeZone(zone.zone_type)
      ? !inside
      : (inside ? !!zone.notify_on_enter : !!zone.notify_on_exit);
  return { breached, distance: Math.round(distance) };
}

type Tab = "location" | "requests" | "alerts" | "safezones" | "history";

interface Props { caredOneId: string; caredOneName: string; }

const defaultForm = () => ({
  zone_type: ZONE_TYPE.SAFE as string, shape_type: "radius",
  latitude: "", longitude: "", radius: 200,
  polygon_points: [] as [number, number][],
  corner_radius: [] as number[],
  description: "", notify_on_enter: true, notify_on_exit: true,
  schedule_enabled: false, schedule_start_time: "08:00", schedule_end_time: "20:00",
  schedule_days: [] as string[],
});


export default function LocationCard({ caredOneId, caredOneName }: Props) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith("zh");
  const [activeTab, setActiveTab] = useState<Tab>("location");

  // ─── Data
  const { data: currentLocation, refetch: refetchLocation, isLoading: loadingLocation } = useCaredOneLocation(caredOneId);
  const { data: locationHistory, refetch: refetchHistory } = useCaredOneLocationHistory(caredOneId);
  const { data: zones, refetch: refetchZones } = useSafeZones(caredOneId);
  const { data: alerts, refetch: refetchAlerts } = useSafeZoneAlerts(caredOneId);
  const { data: locationRequests, refetch: refetchRequests } = useLocationRequests(caredOneId);
  const { data: locationSettings, refetch: refetchSettings } = useCaredOneLocationSettings(caredOneId);

  // ─── Mutations
  const createZone = useCreateSafeZone();
  const updateZone = useUpdateSafeZone();
  const deleteZone = useDeleteSafeZone();
  const acknowledgeAlert = useAcknowledgeAlert();
  const acknowledgeAll = useAcknowledgeAllAlerts();
  const sendRequest = useSendLocationRequest();
  const cancelRequest = useCancelLocationRequest();
  const shareLocation = useShareMyLocation();

  // ─── Map
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const mapLayersRef = useRef<any[]>([]);
  const mapReadyRef = useRef(false);
  const drawLayersRef = useRef<any[]>([]);

  // ─── Zone form state
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);
  const [zoneForm, setZoneForm] = useState(defaultForm());
  const [pickingOnMap, setPickingOnMap] = useState(false);

  // ─── Custom zone-type names (CCT 258 a95..a101, per cared one)
  const [customNames, setCustomNames] = useState<CustomZoneNames>({});
  const [customNameDraft, setCustomNameDraft] = useState("");
  const reloadCustomNames = useCallback(async () => {
    if (!caredOneId) return;
    setCustomNames(await fetchCustomZoneNames(caredOneId));
  }, [caredOneId]);
  useEffect(() => { void reloadCustomNames(); }, [reloadCustomNames]);
  const zoneLabel = useCallback(
    (code: string) => zoneTypeLabel(code, customNames, !!isZh),
    [customNames, isZh],
  );


  // ─── Polygon drawing state
  const [drawMode, setDrawMode] = useState<"idle" | "drawing" | "editing">("idle");
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);
  const [cornerRadii, setCornerRadii] = useState<number[]>([]);
  const [selectedVertex, setSelectedVertex] = useState<number | null>(null);
  const [flashRed, setFlashRed] = useState(false);
  const drawingRef = useRef(false);
  const freehandRef = useRef<[number, number][]>([]);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const debounceTimerRef = useRef<any>(null);

  // ─── Request/Sharing state
  const [requestMessage, setRequestMessage] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [emergencyConfirm, setEmergencyConfirm] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [sharingMyLocation, setSharingMyLocation] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const unreadAlerts = (alerts || []).filter((a: any) => !a.is_read).length;
  const pendingRequests = (locationRequests || []).filter((r: any) => r.status === "pending").length;

  const breaches = useMemo(() => (zones || []).filter((z: any) => {
    if (!currentLocation?.latitude || !currentLocation?.longitude) return false;
    return checkZoneBreach(z, parseFloat(currentLocation.latitude), parseFloat(currentLocation.longitude)).breached;
  }), [zones, currentLocation]);

  // ─── Map rendering
  const renderMapContent = useCallback(async () => {
    const Lx = await getL();
    const map = leafletMapRef.current;
    if (!map) return;
    mapLayersRef.current.forEach(l => { try { l.remove(); } catch (_) {} });
    mapLayersRef.current = [];
    const bounds: [number, number][] = [];

    if (currentLocation?.latitude && currentLocation?.longitude) {
      const lat = parseFloat(currentLocation.latitude);
      const lng = parseFloat(currentLocation.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        bounds.push([lat, lng]);
        const icon = Lx.divIcon({
          className: "",
          html: `<div style="width:22px;height:22px;border-radius:50%;background:#10B981;border:3px solid white;box-shadow:0 0 0 3px rgba(16,185,129,.3);animation:locPulse 2s infinite"></div>`,
          iconSize: [22, 22], iconAnchor: [11, 11],
        });
        mapLayersRef.current.push(Lx.marker([lat, lng], { icon }).addTo(map)
          .bindPopup(`<b>${caredOneName}</b><br>${currentLocation.address_text || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}`));
      }
    }

    (zones || []).forEach((zone: any) => {
      if (!zone.latitude || !zone.longitude) return;
      const zLat = parseFloat(zone.latitude), zLng = parseFloat(zone.longitude);
      if (isNaN(zLat) || isNaN(zLng)) return;
      const color = zoneColor(zone.zone_type);
      const isDanger = isDangerZone(zone.zone_type);
      if (zone.shape_type === "polygon" && zone.polygon_points?.length >= 3) {
        const pts: [number, number][] = zone.polygon_points;
        const smoothed = zone.corner_radius?.some((r: number) => r > 0)
          ? chaikinPerVertex(pts, zone.corner_radius) : pts;
        const poly = Lx.polygon(smoothed, { color, fillColor: color, fillOpacity: 0.15, weight: 2, dashArray: isDanger ? "6,4" : undefined })
          .addTo(map).bindPopup(`<b>${zoneLabel(zone.zone_type)}</b>${zone.description ? `<br>${zone.description}` : ""}`);
        mapLayersRef.current.push(poly);
        pts.forEach((pt: [number, number]) => bounds.push(pt));
      } else {
        const c = Lx.circle([zLat, zLng], { radius: zone.radius_meters || 200, color, fillColor: color, fillOpacity: 0.15, weight: 2, dashArray: isDanger ? "6,4" : undefined })
          .addTo(map).bindPopup(`<b>${zoneLabel(zone.zone_type)}</b><br>${zone.radius_meters || 200}m`);
        mapLayersRef.current.push(c);
        bounds.push([zLat, zLng]);
      }
      const zIcon = Lx.divIcon({
        className: "",
        html: isDanger

          ? `<div style="width:28px;height:28px;border-radius:50%;background:#EF4444;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:white;font-size:13px;font-weight:bold;line-height:1">✕</div>`
          : `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;"><svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/><circle cx='12' cy='10' r='3'/></svg></div>`,
        iconSize: [28, 28], iconAnchor: [14, 14],
      });
      mapLayersRef.current.push(Lx.marker([zLat, zLng], { icon: zIcon }).addTo(map));
    });

    if (bounds.length > 0) {
      try { map.fitBounds(bounds, { paddingTopLeft: [30, 30], paddingBottomRight: [30, 30], maxZoom: 16 }); } catch (_) {}
    } else {
      map.setView([37.0902, -95.7129], 4);
    }
  }, [currentLocation, zones, caredOneName, zoneLabel]);

  // ─── Draw layers refresh
  const renderDrawLayers = useCallback(async () => {
    const Lx = await getL();
    const map = leafletMapRef.current;
    if (!map) return;
    drawLayersRef.current.forEach(l => { try { l.remove(); } catch (_) {} });
    drawLayersRef.current = [];
    if (drawnPoints.length === 0) return;

    const color = zoneColor(zoneForm.zone_type);


    if (drawnPoints.length >= 2) {
      const smoothed = (drawMode === "editing" && cornerRadii.some(r => r > 0))
        ? chaikinPerVertex(drawnPoints, cornerRadii) : drawnPoints;
      const poly = Lx.polygon(smoothed.length >= 3 ? smoothed : drawnPoints, {
        color, fillColor: color, fillOpacity: 0.1, weight: 2, dashArray: "4,4",
      }).addTo(map);
      drawLayersRef.current.push(poly);
    }

    if (drawMode === "editing" && drawnPoints.length >= 3) {
      drawnPoints.forEach((pt, i) => {
        const j = (i + 1) % drawnPoints.length;
        const next = drawnPoints[j];
        const midLat = (pt[0] + next[0]) / 2;
        const midLng = (pt[1] + next[1]) / 2;
        const edgeIcon = Lx.divIcon({
          className: "",
          html: `<div style="width:12px;height:12px;border-radius:50%;background:white;border:2px solid ${color};opacity:0.7;cursor:copy;"></div>`,
          iconSize: [12, 12], iconAnchor: [6, 6],
        });
        const midMarker = Lx.marker([midLat, midLng], { icon: edgeIcon, zIndexOffset: 500 }).addTo(map);
        midMarker.on("click", (e: any) => {
          Lx.DomEvent.stopPropagation(e);
          const insertAt = i + 1;
          setDrawnPoints(prev => { const n = [...prev]; n.splice(insertAt, 0, [midLat, midLng]); return n; });
          setCornerRadii(prev => { const n = [...prev]; n.splice(insertAt, 0, 0); return n; });
          setSelectedVertex(insertAt);
        });
        drawLayersRef.current.push(midMarker);
      });
    }

    drawnPoints.forEach((pt, i) => {
      const isSelected = selectedVertex === i;
      const isFlash = flashRed && isSelected;
      const vIcon = Lx.divIcon({
        className: "",
        html: `<div style="width:14px;height:14px;border-radius:50%;background:${isFlash ? "#EF4444" : isSelected ? "#FBBF24" : color};border:2px solid white;cursor:grab;box-shadow:0 1px 3px rgba(0,0,0,.3);"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7],
      });
      const vm = Lx.marker(pt, { icon: vIcon, draggable: drawMode === "editing", zIndexOffset: 1000 }).addTo(map);

      if (drawMode === "editing") {
        vm.on("click", (e: any) => { Lx.DomEvent.stopPropagation(e); setSelectedVertex(prev => prev === i ? null : i); });
        vm.on("dblclick", (e: any) => {
          Lx.DomEvent.stopPropagation(e);
          setDrawnPoints(prev => {
            if (prev.length <= 3) { setFlashRed(true); setTimeout(() => setFlashRed(false), 600); return prev; }
            const next = prev.filter((_, idx) => idx !== i);
            setCornerRadii(cr => cr.filter((_, idx) => idx !== i));
            return next;
          });
          setSelectedVertex(null);
        });
        vm.on("dragend", (e: any) => {
          const { lat, lng } = e.target.getLatLng();
          setDrawnPoints(prev => { const n = [...prev]; n[i] = [lat, lng]; return n; });
        });
      }
      drawLayersRef.current.push(vm);
    });
  }, [drawnPoints, cornerRadii, selectedVertex, flashRed, drawMode, zoneForm.zone_type]);

  // ─── Radius preview layer
  const renderRadiusPreview = useCallback(async () => {
    const Lx = await getL();
    const map = leafletMapRef.current;
    if (!map) return;
    drawLayersRef.current.forEach(l => { try { l.remove(); } catch (_) {} });
    drawLayersRef.current = [];
    const lat = parseFloat(zoneForm.latitude);
    const lng = parseFloat(zoneForm.longitude);
    if (isNaN(lat) || isNaN(lng)) return;
    const color = zoneColor(zoneForm.zone_type);
    const c = Lx.circle([lat, lng], { radius: zoneForm.radius, color, fillColor: color, fillOpacity: 0.2, weight: 2, dashArray: "4,4" }).addTo(map);
    drawLayersRef.current.push(c);
    try { map.panTo([lat, lng]); } catch (_) {}
  }, [zoneForm.latitude, zoneForm.longitude, zoneForm.radius, zoneForm.zone_type]);


  const isMapTab = activeTab === "location" || activeTab === "safezones";

  // Init map immediately
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const Lx = await getL();
      if (cancelled || !mapRef.current) return;
      if (!leafletMapRef.current) {
        const map = Lx.map(mapRef.current, { zoomControl: true, attributionControl: false });
        Lx.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
        leafletMapRef.current = map;
        mapReadyRef.current = true;
      }
      setTimeout(() => { try { leafletMapRef.current?.invalidateSize(); } catch (_) {} }, 150);
      if (!cancelled) renderMapContent();
    };
    init();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (isMapTab && leafletMapRef.current) {
      setTimeout(() => { try { leafletMapRef.current?.invalidateSize(); } catch (_) {} }, 100);
    }
  }, [activeTab, isMapTab]);

  useEffect(() => {
    if (mapReadyRef.current) renderMapContent();
  }, [renderMapContent]);

  useEffect(() => {
    if (!mapReadyRef.current) return;
    if (!showZoneForm) {
      drawLayersRef.current.forEach(l => { try { l.remove(); } catch (_) {} });
      drawLayersRef.current = [];
      return;
    }
    if (zoneForm.shape_type === "polygon") renderDrawLayers();
    else renderRadiusPreview();
  }, [renderDrawLayers, renderRadiusPreview, showZoneForm, zoneForm.shape_type, zoneForm.latitude, zoneForm.longitude, zoneForm.radius, drawMode]);

  useEffect(() => () => {
    if (leafletMapRef.current) {
      try { leafletMapRef.current.remove(); } catch (_) {}
      leafletMapRef.current = null; mapReadyRef.current = false;
    }
  }, []);

  // ─── Keyboard handlers for polygon drawing
  useEffect(() => {
    if (!showZoneForm || zoneForm.shape_type !== "polygon") return;
    const onKey = (e: KeyboardEvent) => {
      if (drawMode === "drawing") {
        if (e.key === "Enter" && drawnPoints.length >= 3) finishDrawing();
        if (e.key === "Escape") { setDrawMode("idle"); setDrawnPoints([]); setCornerRadii([]); }
        if ((e.key === "z" || e.key === "Z") && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          setDrawnPoints(prev => prev.length === 0 ? prev : prev.slice(0, -1));
          setCornerRadii(prev => prev.length > 0 ? prev.slice(0, -1) : prev);
        }
      }
      if (drawMode === "editing") {
        if ((e.key === "Delete" || e.key === "Backspace") && selectedVertex !== null) {
          if (drawnPoints.length <= 3) { setFlashRed(true); setTimeout(() => setFlashRed(false), 600); return; }
          setDrawnPoints(prev => prev.filter((_, i) => i !== selectedVertex));
          setCornerRadii(prev => prev.filter((_, i) => i !== selectedVertex));
          setSelectedVertex(null);
        }
        if (e.key === "Escape") setSelectedVertex(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawMode, drawnPoints, selectedVertex, showZoneForm, zoneForm.shape_type]);

  // ─── Map click handlers for drawing
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !showZoneForm) return;

    if (pickingOnMap && zoneForm.shape_type === "radius") {
      map.getContainer().style.cursor = "crosshair";
      const h = (e: any) => {
        setZoneForm(p => ({ ...p, latitude: e.latlng.lat.toFixed(6), longitude: e.latlng.lng.toFixed(6) }));
        setPickingOnMap(false);
      };
      map.once("click", h);
      return () => { map.off("click", h); map.getContainer().style.cursor = ""; };
    }

    if (drawMode === "drawing") {
      map.getContainer().style.cursor = "crosshair";
      const onMouseDown = (e: any) => { dragStartRef.current = { x: e.originalEvent.clientX, y: e.originalEvent.clientY }; freehandRef.current = [[e.latlng.lat, e.latlng.lng]]; };
      const onMouseMove = (e: any) => {
        if (!dragStartRef.current) return;
        const dx = e.originalEvent.clientX - dragStartRef.current.x;
        const dy = e.originalEvent.clientY - dragStartRef.current.y;
        if (Math.hypot(dx, dy) > 8) freehandRef.current.push([e.latlng.lat, e.latlng.lng]);
      };
      const onMouseUp = (e: any) => {
        if (!dragStartRef.current) return;
        const dx = e.originalEvent.clientX - dragStartRef.current.x;
        const dy = e.originalEvent.clientY - dragStartRef.current.y;
        dragStartRef.current = null;
        if (Math.hypot(dx, dy) > 8 && freehandRef.current.length > 2) {
          const simplified = douglasPeucker(freehandRef.current, 0.00003);
          setDrawnPoints(prev => { const n = [...prev, ...simplified]; setCornerRadii(Array(n.length).fill(0)); return n; });
          freehandRef.current = [];
        }
      };
      const onClick = (e: any) => {
        if (freehandRef.current.length > 2) return;
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          setDrawnPoints(prev => { const n = [...prev, [e.latlng.lat, e.latlng.lng] as [number, number]]; setCornerRadii(Array(n.length).fill(0)); return n; });
        }, 200);
      };
      const onDblClick = (e: any) => {
        clearTimeout(debounceTimerRef.current);
        if (drawnPoints.length >= 3) finishDrawing();
      };
      map.on("mousedown", onMouseDown);
      map.on("mousemove", onMouseMove);
      map.on("mouseup", onMouseUp);
      map.on("click", onClick);
      map.on("dblclick", onDblClick);
      return () => {
        map.off("mousedown", onMouseDown); map.off("mousemove", onMouseMove);
        map.off("mouseup", onMouseUp); map.off("click", onClick); map.off("dblclick", onDblClick);
        map.getContainer().style.cursor = "";
      };
    }

    map.getContainer().style.cursor = "";
  }, [pickingOnMap, drawMode, showZoneForm, drawnPoints.length, zoneForm.shape_type]);

  function finishDrawing() {
    if (drawnPoints.length < 3) { toast({ title: isZh ? "至少需要3个点" : "Need at least 3 points", variant: "destructive" }); return; }
    const c = centroid(drawnPoints);
    setZoneForm(p => ({ ...p, latitude: c[0].toFixed(6), longitude: c[1].toFixed(6) }));
    setDrawMode("editing");
    setSelectedVertex(null);
  }

  const openZoneForm = (zone?: any) => {
    if (zone) {
      setEditingZone(zone);
      setZoneForm({
        zone_type: zone.zone_type || ZONE_TYPE.SAFE,
        shape_type: zone.shape_type || "radius",
        latitude: zone.latitude?.toString() || "", longitude: zone.longitude?.toString() || "",
        radius: zone.radius_meters || 200, description: zone.description || "",
        polygon_points: zone.polygon_points || [], corner_radius: zone.corner_radius || [],
        notify_on_enter: zone.notify_on_enter ?? true, notify_on_exit: zone.notify_on_exit ?? true,
        schedule_enabled: zone.schedule_enabled ?? false,
        schedule_start_time: zone.schedule_start_time || "08:00",
        schedule_end_time: zone.schedule_end_time || "20:00",
        schedule_days: zone.schedule_days || [],
      });
      if (zone.shape_type === "polygon" && zone.polygon_points?.length >= 3) {
        setDrawnPoints(zone.polygon_points);
        setCornerRadii(zone.corner_radius || Array(zone.polygon_points.length).fill(0));
        setDrawMode("editing");
      } else {
        setDrawnPoints([]); setCornerRadii([]); setDrawMode("idle");
      }
    } else {
      setEditingZone(null);
      setZoneForm(defaultForm());
      setDrawnPoints([]); setCornerRadii([]); setDrawMode("idle");
    }
    const slot = customSlotOf(zone?.zone_type || ZONE_TYPE.SAFE);
    setCustomNameDraft(slot ? (customNames[slot] || "") : "");
    setSelectedVertex(null);
    setShowZoneForm(true);
    setActiveTab("safezones");

  };

  const handleSaveZone = async () => {
    let lat = parseFloat(zoneForm.latitude);
    let lng = parseFloat(zoneForm.longitude);

    const isPolygon = zoneForm.shape_type === "polygon";
    if (isPolygon) {
      if (drawnPoints.length < 3) { toast({ title: isZh ? "请至少绘制3个多边形点" : "Draw at least 3 polygon points", variant: "destructive" }); return; }
      const c = centroid(drawnPoints);
      lat = c[0]; lng = c[1];
    } else {
      if (isNaN(lat) || isNaN(lng)) { toast({ title: isZh ? "请输入有效坐标，或使用「在地图上选点」。" : "Valid coordinates required. Use 'Pick on Map'.", variant: "destructive" }); return; }
    }

    // Custom zone-type names live on the cared one's extended profile (CCT 258),
    // one name per custom slot — not on the zone row.
    const slot = customSlotOf(zoneForm.zone_type);
    if (slot && customNameDraft.trim() && customNameDraft.trim() !== (customNames[slot] || "")) {
      try {
        await setCustomZoneName(caredOneId, slot, customNameDraft.trim());
        await reloadCustomNames();
      } catch (e: any) {
        toast({ title: isZh ? "自定义区域名称保存失败" : "Failed to save custom zone name", description: e.message, variant: "destructive" });
        return;
      }
    }

    const payload = {
      user_id: caredOneId, zone_type: zoneForm.zone_type,
      shape_type: isPolygon ? "polygon" : "radius",
      color: zoneColor(zoneForm.zone_type), latitude: lat, longitude: lng,
      radius_meters: isPolygon ? 0 : zoneForm.radius,
      polygon_points: isPolygon ? drawnPoints : null,
      corner_radius: isPolygon ? cornerRadii : null,
      description: zoneForm.description || null,
      notify_on_enter: zoneForm.notify_on_enter, notify_on_exit: zoneForm.notify_on_exit,
      schedule_enabled: zoneForm.schedule_enabled,
      schedule_start_time: zoneForm.schedule_enabled ? zoneForm.schedule_start_time : null,
      schedule_end_time: zoneForm.schedule_enabled ? zoneForm.schedule_end_time : null,
      schedule_days: zoneForm.schedule_enabled ? zoneForm.schedule_days : [],
      is_active: true,
    };

    if (editingZone) {
      updateZone.mutate({ id: editingZone.id, ...payload }, {
        onSuccess: () => { setShowZoneForm(false); setEditingZone(null); setDrawMode("idle"); toast({ title: isZh ? "区域已更新 ✓" : "Zone updated ✓" }); },
        onError: (e: any) => toast({ title: isZh ? "更新失败" : "Failed to update", description: e.message, variant: "destructive" }),
      });
    } else {
      createZone.mutate(payload, {
        onSuccess: () => { setShowZoneForm(false); setDrawMode("idle"); toast({ title: isZh ? "区域已创建 ✓" : "Zone created ✓" }); },
        onError: (e: any) => toast({ title: isZh ? "创建失败" : "Failed to create", description: e.message, variant: "destructive" }),
      });
    }
  };

  const handleDeleteZone = (id: string, label: string) => {
    if (!confirm(isZh ? `删除区域「${label}」？` : `Delete zone "${label}"?`)) return;
    deleteZone.mutate(id, {
      onSuccess: () => toast({ title: isZh ? `区域「${label}」已删除` : `Zone "${label}" deleted` }),
      onError: (e: any) => toast({ title: isZh ? "删除失败" : "Failed to delete", description: e.message, variant: "destructive" }),
    });
  };


  const handleSendRequest = async () => {
    if (isEmergency && !emergencyConfirm) { setEmergencyConfirm(true); return; }
    setSendingRequest(true);
    sendRequest.mutate({ caredOneId, message: requestMessage, isEmergency }, {
      onSuccess: () => {
        setSendingRequest(false); setRequestMessage(""); setIsEmergency(false); setEmergencyConfirm(false);
        toast({ title: isEmergency ? "Emergency request sent 🚨" : "Location request sent ✓" });
        refetchRequests();
      },
      onError: (e: any) => { setSendingRequest(false); toast({ title: isZh ? "操作失败" : "Failed", description: e.message, variant: "destructive" }); },
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchLocation(), refetchHistory(), refetchZones(), refetchAlerts(), refetchRequests(), refetchSettings()]);
    setRefreshing(false);
    toast({ title: isZh ? "已刷新" : "Refreshed" });
  };

  const handleShareMyLocation = () => {
    if (!navigator.geolocation) { toast({ title: isZh ? "浏览器不支持定位" : "Geolocation not supported", variant: "destructive" }); return; }
    setSharingMyLocation(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        shareLocation.mutate({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy }, {
          onSuccess: () => { setSharingMyLocation(false); toast({ title: isZh ? "已分享您的位置 ✓" : "Your location shared ✓" }); },
          onError: (e: any) => { setSharingMyLocation(false); toast({ title: isZh ? "操作失败" : "Failed", description: e.message, variant: "destructive" }); },
        });
      },
      () => { setSharingMyLocation(false); toast({ title: isZh ? "无法获取位置" : "Could not get location", variant: "destructive" }); },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleUseCaredOneLocation = () => {
    if (currentLocation?.latitude && currentLocation?.longitude) {
      setZoneForm(p => ({ ...p, latitude: parseFloat(currentLocation.latitude).toFixed(6), longitude: parseFloat(currentLocation.longitude).toFixed(6) }));
      toast({ title: `Using ${caredOneName}'s last known location` });
    } else {
      toast({ title: `No location data for ${caredOneName}`, variant: "destructive" });
    }
  };

  const tabs: { key: Tab; label: string; icon: any; badge?: number }[] = [
    { key: "location", label: "Live Location", icon: MapPin },
    { key: "requests", label: "Requests", icon: Send, badge: pendingRequests || undefined },
    { key: "alerts", label: "Alerts", icon: Bell, badge: unreadAlerts || undefined },
    { key: "safezones", label: "Safe Zones", icon: Shield, badge: (zones || []).length || undefined },
    { key: "history", label: "History", icon: Clock },
  ];

  const drawStatusText = useMemo(() => {
    if (drawMode === "drawing") return `Click to place · Drag to freehand · ⌘Z undo · Esc cancel · ${drawnPoints.length} pts`;
    if (drawMode === "editing") return "Drag vertices · Click edge to insert · Dbl-click to delete · Esc deselect";
    return "";
  }, [drawMode, drawnPoints.length]);

  const lastSeen = currentLocation ? formatDateTime(currentLocation.created_at) : null;

  return (
    <div className="space-y-4">
      {/* ─── Header with status + actions ─── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {caredOneName}'s Location
          </h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant={locationSettings?.is_sharing_enabled ? "default" : "secondary"} className="text-xs">
              {locationSettings?.is_sharing_enabled ? "📍 Sharing On" : "Sharing Off"}
            </Badge>
            {lastSeen && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Last seen {lastSeen}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <Button variant="outline" size="sm" onClick={handleShareMyLocation} disabled={sharingMyLocation}>
            {sharingMyLocation ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Radio className="h-3 w-3 mr-1" />}
            Share My Location
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* ─── Breach banner ─── */}
      {breaches.length > 0 && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-2 text-destructive font-semibold text-sm mb-1">
            <AlertTriangle className="h-4 w-4" /> Zone Breach Detected
          </div>
          {breaches.map((z: any) => (
            <p key={z.id} className="text-xs text-destructive/80">
              {isDangerZone(z.zone_type)
                ? (isZh ? `⚠ ${caredOneName} 位于危险区域「${zoneLabel(z.zone_type)}」内` : `⚠ ${caredOneName} is inside danger zone "${zoneLabel(z.zone_type)}"`)
                : (isZh ? `⚠ ${caredOneName} 已离开区域「${zoneLabel(z.zone_type)}」` : `⚠ ${caredOneName} is outside zone "${zoneLabel(z.zone_type)}"`)}

            </p>
          ))}
        </div>
      )}

      {/* ─── Map (always visible on map tabs) ─── */}
      <div style={{ display: isMapTab ? "block" : "none" }} className="relative">
        <div ref={mapRef} style={{ height: 350, borderRadius: 12, overflow: "hidden", background: "hsl(var(--muted))" }} />
        {activeTab === "location" && currentLocation?.latitude && (
          <Button variant="outline" size="sm" className="absolute top-2 right-2 z-[1000] shadow-md bg-background/90 backdrop-blur-sm" asChild>
            <a href={`https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" /> Open in Maps
            </a>
          </Button>
        )}
        {activeTab === "safezones" && (
          <Button size="sm"
            className="absolute top-2 right-2 z-[1000] shadow-md bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => openZoneForm()}>
            <Plus className="h-3 w-3 mr-1" /> Add Zone
          </Button>
        )}
        {drawStatusText && (
          <div className="absolute bottom-2 left-2 right-2 z-[1000] bg-black/70 text-white text-[11px] rounded px-2 py-1 text-center">
            {drawStatusText}
          </div>
        )}
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex gap-1 border-b border-border overflow-x-auto -mx-1 px-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-3 py-2.5 text-sm font-medium whitespace-nowrap flex items-center gap-1.5 border-b-2 transition-colors
              ${activeTab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
            {t.badge ? (
              <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold
                ${t.key === "alerts" ? "bg-destructive text-destructive-foreground" : "bg-primary/10 text-primary"}`}>
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* ─── TAB CONTENT ─── */}

      {/* LIVE LOCATION */}
      {activeTab === "location" && (
        <div className="space-y-4">
          {/* Sharing settings */}
          {locationSettings && (
            <Card className="border-transparent card-elevated">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Sharing Settings (set by {caredOneName})
                </p>
                <div className="flex gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${locationSettings.is_sharing_enabled ? "bg-success" : "bg-muted-foreground"}`} />
                    <span className="text-sm">{locationSettings.is_sharing_enabled ? "Sharing enabled" : "Sharing disabled"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{locationSettings.require_approval ? "Approval required" : "No approval needed"}</span>
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
                  <span className="text-sm font-semibold text-foreground">Current Location</span>
                  <span className="text-xs text-muted-foreground">· {formatDateTime(currentLocation.created_at)}</span>
                </div>
                {currentLocation.address_text && <p className="text-sm text-foreground">{currentLocation.address_text}</p>}
                <p className="text-xs text-muted-foreground font-mono">
                  {parseFloat(currentLocation.latitude).toFixed(6)}, {parseFloat(currentLocation.longitude).toFixed(6)}
                  {currentLocation.accuracy_meters && ` ± ${Math.round(currentLocation.accuracy_meters)}m`}
                </p>
                {currentLocation.battery_level != null && <p className="text-xs text-muted-foreground">🔋 {currentLocation.battery_level}%</p>}

                {/* Quick zone status */}
                {(zones || []).length > 0 && (
                  <div className="pt-2 border-t border-border mt-2 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Zone Status</p>
                    {(zones || []).map((zone: any) => {
                      const breach = checkZoneBreach(zone, parseFloat(currentLocation.latitude), parseFloat(currentLocation.longitude));
                      return (
                        <div key={zone.id} className="flex items-center gap-2 text-xs">
                          <div className="w-2 h-2 rounded-full" style={{ background: zoneColor(zone.zone_type) }} />
                          <span className="font-medium">{zoneLabel(zone.zone_type)}</span>
                          <span className={breach.breached ? "text-destructive font-semibold" : "text-success"}>
                            {isDangerZone(zone.zone_type)
                              ? (breach.breached ? `⚠ INSIDE danger zone!` : `✓ Away (${breach.distance}m)`)
                              : (breach.breached ? `⚠ Outside (${breach.distance}m)` : `✓ Inside (${breach.distance}m)`)}
                          </span>
                        </div>

                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-transparent card-elevated">
              <CardContent className="p-8 text-center">
                <MapPin className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-sm font-medium text-foreground mb-1">No location data available</p>
                <p className="text-xs text-muted-foreground mb-3">Request {caredOneName}'s location to see it on the map</p>
                <Button variant="coral" size="sm" onClick={() => setActiveTab("requests")}>
                  <Send className="h-3 w-3 mr-1" /> Request Location
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* REQUESTS */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          <Card className="border-transparent card-elevated">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-sm">Request {caredOneName}'s Location</h3>
              <Textarea value={requestMessage} onChange={e => setRequestMessage(e.target.value)}
                placeholder="Optional message (why you need their location)..." rows={2} />
              <div className={`flex flex-col gap-2 p-3 rounded-lg border ${isEmergency ? "bg-destructive/10 border-destructive/30" : "bg-muted/30 border-border"}`}>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="emerg-chk" checked={isEmergency}
                    onChange={e => { setIsEmergency(e.target.checked); setEmergencyConfirm(false); }} className="rounded" />
                  <label htmlFor="emerg-chk" className="text-sm font-medium cursor-pointer">🚨 Emergency request</label>
                </div>
                {isEmergency && (
                  <p className="text-xs text-destructive pl-5">
                    Bypasses approval — {caredOneName}'s location will be shared immediately without their consent. They will be notified.
                  </p>
                )}
              </div>
              {emergencyConfirm && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive font-medium">
                  ⚠️ Are you sure? Click Send again to confirm.
                </div>
              )}
              <Button className="w-full" style={isEmergency ? { background: "#EF4444", color: "white" } : undefined}
                onClick={handleSendRequest} disabled={sendingRequest || sendRequest.isPending}>
                {(sendingRequest || sendRequest.isPending) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                {isEmergency && emergencyConfirm ? "Confirm Emergency Request" : isEmergency ? "Send Emergency Request" : "Send Request"}
              </Button>
            </CardContent>
          </Card>

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
                          <p className="text-xs text-muted-foreground">{formatDateTime(req.created_at)}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive text-xs h-7"
                          onClick={() => cancelRequest.mutate(req.id)}
                          disabled={cancelRequest.isPending}>{isZh ? "取消" : "Cancel"}</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {(locationRequests || []).filter((r: any) => r.status !== "pending").length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Past Requests</h3>
              <div className="space-y-2">
                {(locationRequests || []).filter((r: any) => r.status !== "pending").map((req: any) => {
                  const sc: Record<string, { icon: string; label: string; color: string }> = {
                    accepted:           { icon: "✓",  label: "Accepted",               color: "text-success" },
                    emergency_approved: { icon: "🚨", label: "Emergency — Auto-shared", color: "text-destructive" },
                    declined:           { icon: "✗",  label: "Declined",               color: "text-destructive" },
                    rejected:           { icon: "✗",  label: "Declined",               color: "text-destructive" },
                    cancelled:          { icon: "—",  label: "Cancelled",              color: "text-muted-foreground" },
                  };
                  const s = sc[req.status] || { icon: "?", label: req.status, color: "text-muted-foreground" };
                  return (
                    <Card key={req.id} className="border-transparent card-elevated opacity-80">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${s.color}`}>{s.icon} {s.label}</span>
                          {req.is_emergency && req.status !== "emergency_approved" && <Badge variant="destructive" className="text-[10px]">Emergency</Badge>}
                        </div>
                        {req.message && <p className="text-xs text-muted-foreground mt-0.5">"{req.message}"</p>}
                        <p className="text-xs text-muted-foreground">{formatDateTime(req.created_at)}</p>
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

      {/* ALERTS */}
      {activeTab === "alerts" && (
        <div>
          {unreadAlerts > 0 && (
            <div className="flex justify-end mb-3">
              <Button variant="outline" size="sm" onClick={() => acknowledgeAll.mutate(caredOneId, { onSuccess: () => toast({ title: isZh ? "已确认所有警报 ✓" : "All alerts acknowledged ✓" }) })} disabled={acknowledgeAll.isPending}>
                <CheckCircle2 className="h-3 w-3 mr-1" /> Mark all read
              </Button>
            </div>
          )}
          {(alerts || []).length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No zone alerts</p>
              <p className="text-xs mt-1">Alerts appear when {caredOneName} enters or exits a zone</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(alerts || []).map((alert: any) => {
                const typeConfig: Record<string, { label: string; color: string }> = {
                  exited_safe_zone:    { label: "Left Safe Zone",      color: "text-destructive" },
                  entered_safe_zone:   { label: "Entered Safe Zone",   color: "text-success" },
                  entered_danger_zone: { label: "Entered Danger Zone", color: "text-destructive" },
                  exited_danger_zone:  { label: "Left Danger Zone",    color: "text-success" },
                };
                const cfg = typeConfig[alert.alert_type] || { label: alert.alert_type, color: "text-muted-foreground" };
                return (
                  <Card key={alert.id}
                    className={`border-transparent card-elevated ${!alert.is_read ? "border-l-2 border-l-destructive" : "opacity-70"}`}>
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
                          <p className="text-xs text-muted-foreground mt-1">{formatDateTime(alert.created_at)}</p>
                        </div>
                        {!alert.is_read ? (
                          <Button variant="outline" size="sm" className="text-xs h-7 shrink-0"
                            onClick={() => acknowledgeAlert.mutate(alert.id)}
                            disabled={acknowledgeAlert.isPending}>
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Ack
                          </Button>
                        ) : <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SAFE ZONES */}
      {activeTab === "safezones" && (
        <div>
          {showZoneForm && (
            <Card className="border-primary/20 card-elevated mb-4">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{editingZone ? "Edit Zone" : "New Zone"}</h3>
                  <Button variant="ghost" size="icon" className="h-7 w-7"
                    onClick={() => { setShowZoneForm(false); setEditingZone(null); setDrawMode("idle"); setDrawnPoints([]); setCornerRadii([]); }}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Zone type — the nine dictionary types (a55). A zone has no
                    name of its own; its type IS its label. */}
                <div>
                  <Label className="text-xs">{isZh ? "区域类型 *" : "Zone Type *"}</Label>
                  <div className="grid grid-cols-3 gap-1.5 mt-1">
                    {ZONE_TYPE_CODES.map(code => {
                      const active = zoneForm.zone_type === code;
                      const c = zoneColor(code);
                      return (
                        <button key={code}
                          onClick={() => {
                            const slot = customSlotOf(code);
                            setZoneForm(p => ({ ...p, zone_type: code }));
                            setCustomNameDraft(slot ? (customNames[slot] || "") : "");
                          }}
                          className="px-2 py-1.5 rounded-lg border text-xs font-medium truncate transition-colors"
                          style={{
                            borderColor: active ? c : undefined,
                            color: active ? c : undefined,
                            backgroundColor: active ? `${c}20` : undefined,
                          }}>
                          {zoneLabel(code)}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {isDangerZone(zoneForm.zone_type) && (
                  <p className="text-xs text-destructive bg-destructive/10 rounded p-2">
                    {isZh
                      ? `当 ${caredOneName} 进入该区域时提醒`
                      : `Alert when ${caredOneName} enters this area`}
                  </p>
                )}

                {customSlotOf(zoneForm.zone_type) > 0 && (
                  <div>
                    <Label className="text-xs">
                      {isZh
                        ? `自定义区域 ${customSlotOf(zoneForm.zone_type)} 名称`
                        : `Custom zone ${customSlotOf(zoneForm.zone_type)} name`}
                    </Label>
                    <Input value={customNameDraft} onChange={e => setCustomNameDraft(e.target.value)}
                      placeholder={isZh ? "例如：日托中心" : 'e.g. "Day centre"'} className="mt-1" />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {isZh
                        ? "该名称对此被照护者的所有同类型区域生效。"
                        : "This name applies to every zone of this type for this person."}
                    </p>
                  </div>
                )}


                <div>
                  <Label className="text-xs">Shape Type</Label>
                  <div className="flex rounded-lg border overflow-hidden mt-1">
                    {(["radius", "polygon"] as const).map(st => (
                      <button key={st} onClick={() => {
                        setZoneForm(p => ({ ...p, shape_type: st }));
                        if (st === "radius") { setDrawMode("idle"); setDrawnPoints([]); setCornerRadii([]); }
                      }}
                        className={`flex-1 py-1.5 text-sm font-medium transition-colors
                          ${zoneForm.shape_type === st ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-accent"}`}>
                        {st === "radius" ? "⬤ Radius" : "⬡ Precise Border"}
                      </button>
                    ))}
                  </div>
                </div>

                {zoneForm.shape_type === "radius" && (
                  <>
                    <div>
                      <Label className="text-xs">Zone Center</Label>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <Button variant="outline" size="sm" onClick={() => setPickingOnMap(!pickingOnMap)}>
                          <Navigation className="h-3 w-3 mr-1" />{pickingOnMap ? "Cancel picking" : "Pick on Map"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleUseCaredOneLocation}>
                          <MapPin className="h-3 w-3 mr-1" />Use {caredOneName}'s Location
                        </Button>
                      </div>
                      {pickingOnMap && <p className="text-xs text-primary mt-1 font-medium">👆 Click on the map above to set center</p>}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Latitude</Label>
                          <Input value={zoneForm.latitude} onChange={e => setZoneForm(p => ({ ...p, latitude: e.target.value }))}
                            placeholder="40.71280" className="mt-0.5 font-mono text-xs" />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Longitude</Label>
                          <Input value={zoneForm.longitude} onChange={e => setZoneForm(p => ({ ...p, longitude: e.target.value }))}
                            placeholder="-74.00600" className="mt-0.5 font-mono text-xs" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <Label className="text-xs">Radius</Label>
                        <span className="text-xs text-muted-foreground font-mono">{zoneForm.radius}m</span>
                      </div>
                      <Slider min={50} max={5000} step={50} value={[zoneForm.radius]}
                        onValueChange={([v]) => setZoneForm(p => ({ ...p, radius: v }))} />
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5"><span>50m</span><span>5km</span></div>
                    </div>
                  </>
                )}

                {zoneForm.shape_type === "polygon" && (
                  <div className="space-y-2">
                    {drawMode === "idle" && (
                      <Button className="w-full" variant="outline" onClick={() => { setDrawnPoints([]); setCornerRadii([]); setDrawMode("drawing"); }}>
                        <Pencil className="h-3 w-3 mr-1" /> Start Drawing
                      </Button>
                    )}
                    {drawMode === "drawing" && (
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2 font-mono">
                          {drawnPoints.length} point{drawnPoints.length !== 1 ? "s" : ""} placed
                          {drawnPoints.length >= 3 && " · Press Enter to finish"}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1"
                            onClick={() => { setDrawMode("idle"); setDrawnPoints([]); setCornerRadii([]); }}>
                            <X className="h-3 w-3 mr-1" /> Cancel
                          </Button>
                          <Button size="sm" className="flex-1" disabled={drawnPoints.length < 3} onClick={finishDrawing}>
                            ✓ Finish ({drawnPoints.length} pts)
                          </Button>
                        </div>
                      </div>
                    )}
                    {drawMode === "editing" && (
                      <div className="space-y-2">
                        <p className="text-xs text-success font-medium">
                          ✓ {drawnPoints.length} vertices · Drag to reposition · Dbl-click to delete
                        </p>
                        {selectedVertex !== null && drawnPoints[selectedVertex] && (
                          <div className="p-3 rounded-lg bg-muted/50 border border-border">
                            <div className="flex justify-between mb-1">
                              <Label className="text-xs">Corner Rounding (Vertex {selectedVertex + 1})</Label>
                              <span className="text-xs text-muted-foreground">
                                {cornerRadii[selectedVertex] === 0 ? "Sharp" : `${(cornerRadii[selectedVertex] || 0).toFixed(1)}`}
                              </span>
                            </div>
                            <Slider min={0} max={3} step={0.1}
                              value={[cornerRadii[selectedVertex] || 0]}
                              onValueChange={([v]) => setCornerRadii(prev => { const n = [...prev]; n[selectedVertex] = v; return n; })} />
                            <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5"><span>Sharp</span><span>Round</span></div>
                          </div>
                        )}
                        {selectedVertex === null && (
                          <p className="text-xs text-muted-foreground">Click a vertex to adjust its corner rounding</p>
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1"
                            onClick={() => { setDrawMode("drawing"); setDrawnPoints([]); setCornerRadii([]); }}>
                            <RotateCcw className="h-3 w-3 mr-1" /> Redraw
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 text-destructive"
                            onClick={() => { setDrawMode("idle"); setDrawnPoints([]); setCornerRadii([]); }}>
                            Clear All
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <Label className="text-xs">{isZh ? "描述（可选）" : "Description (optional)"}</Label>
                  <Textarea value={zoneForm.description} onChange={e => setZoneForm(p => ({ ...p, description: e.target.value }))}
                    placeholder={isZh ? "可选备注…" : "Optional notes..."} rows={2} className="mt-1" />
                </div>

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

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-semibold">Schedule</Label>
                    <Switch checked={zoneForm.schedule_enabled} onCheckedChange={v => setZoneForm(p => ({ ...p, schedule_enabled: v }))} />
                  </div>
                  {zoneForm.schedule_enabled && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Start</Label>
                          <Input type="time" value={zoneForm.schedule_start_time}
                            onChange={e => setZoneForm(p => ({ ...p, schedule_start_time: e.target.value }))} className="mt-0.5" />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">End</Label>
                          <Input type="time" value={zoneForm.schedule_end_time}
                            onChange={e => setZoneForm(p => ({ ...p, schedule_end_time: e.target.value }))} className="mt-0.5" />
                        </div>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {DAYS.map(d => (
                          <button key={d}
                            onClick={() => setZoneForm(p => ({
                              ...p,
                              schedule_days: p.schedule_days.includes(d) ? p.schedule_days.filter(x => x !== d) : [...p.schedule_days, d],
                            }))}
                            className={`px-2 py-1 rounded text-xs border font-medium transition-colors
                              ${zoneForm.schedule_days.includes(d) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="flex-1"
                    onClick={() => { setShowZoneForm(false); setEditingZone(null); setDrawMode("idle"); setDrawnPoints([]); setCornerRadii([]); }}>
                    Cancel
                  </Button>
                  <Button className="flex-1 text-white"
                    style={{ background: zoneForm.zone_type === "danger" ? "#EF4444" : "#10B981" }}
                    onClick={handleSaveZone}
                    disabled={createZone.isPending || updateZone.isPending || !zoneForm.name.trim()}>
                    {(createZone.isPending || updateZone.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
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
                <Shield className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No zones configured</p>
                <p className="text-xs">Add safe zones like Home or Work, or danger zones to avoid</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => openZoneForm()}>
                  <Plus className="h-3 w-3 mr-1" /> Add First Zone
                </Button>
              </div>
            )}
            {(zones || []).map((zone: any) => {
              const catCfg = CATEGORY_CONFIG[zone.category] || CATEGORY_CONFIG.custom;
              const color = zone.zone_type === "danger" ? "#EF4444" : catCfg.color;
              const Icon = zone.zone_type === "danger" ? Ban : catCfg.icon;
              const active = isZoneActive(zone);
              const breachInfo = currentLocation
                ? checkZoneBreach(zone, parseFloat(currentLocation.latitude), parseFloat(currentLocation.longitude))
                : { breached: false, distance: 0 };
              return (
                <Card key={zone.id} className="border-transparent card-elevated">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: `${color}20`, color }}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{zone.name}</span>
                          {zone.zone_type === "danger" && <Badge variant="destructive" className="text-[10px]">DANGER</Badge>}
                          {!active && <Badge variant="secondary" className="text-[10px]">⏰ Scheduled (inactive)</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {zone.shape_type === "polygon" ? "Custom shape" : `${zone.radius_meters || 200}m radius`} · {catCfg.label}
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
                              : (breachInfo.breached ? `⚠ INSIDE danger zone! (${breachInfo.distance}m)` : `✓ Away (${breachInfo.distance}m)`)}
                          </p>
                        )}
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {zone.shape_type === "polygon" && <Badge variant="outline" className="text-[10px]">Custom Shape</Badge>}
                          {zone.notify_on_enter && <Badge variant="outline" className="text-[10px]"><Bell className="h-2.5 w-2.5 mr-0.5" />Enter alert</Badge>}
                          {zone.notify_on_exit && <Badge variant="outline" className="text-[10px]"><Bell className="h-2.5 w-2.5 mr-0.5" />Exit alert</Badge>}
                          {zone.schedule_enabled && <Badge variant="outline" className="text-[10px]"><Clock className="h-2.5 w-2.5 mr-0.5" />Scheduled</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openZoneForm(zone)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteZone(zone.id, zone.name)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* HISTORY */}
      {activeTab === "history" && (
        <div className="space-y-2">
          {(locationHistory || []).length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Clock className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No location history</p>
              <p className="text-xs mt-1">Location history appears after {caredOneName} shares their location</p>
            </div>
          ) : (locationHistory || []).map((entry: any, idx: number) => (
            <Card key={entry.id} className="border-transparent card-elevated">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${idx === 0 ? "bg-success" : "bg-muted-foreground/40"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${idx === 0 ? "text-success" : "text-muted-foreground"}`}>
                        {idx === 0 ? "Current" : "Previous"}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatDateTime(entry.created_at)}</span>
                    </div>
                    {entry.address && <p className="text-sm mt-0.5">{entry.address}</p>}
                    {entry.location_name && !entry.address && <p className="text-sm">{entry.location_name}</p>}
                    <p className="text-xs text-muted-foreground font-mono">
                      {parseFloat(entry.latitude).toFixed(4)}, {parseFloat(entry.longitude).toFixed(4)}
                    </p>
                    {entry.battery_level != null && <p className="text-xs text-muted-foreground">🔋 {entry.battery_level}%</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
