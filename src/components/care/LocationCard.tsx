import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ZonePathEditor } from "@/components/care/ZonePathEditor";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  MapPin, ChevronDown, Navigation, RefreshCw, X, Plus, Trash2, Edit2,
  Bell, Clock, Shield, AlertTriangle, CheckCircle2,
  Target, Ban,
  Loader2, Send, Radio, Pencil, RotateCcw, Layers,
  ExternalLink,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getCurrentPosition } from "@/lib/geolocation";
import {
  useSafeZones, useCreateSafeZone, useUpdateSafeZone, useDeleteSafeZone,
  useCaredOneLocation, useCaredOneLocationHistory,
  useSafeZoneAlerts, useAcknowledgeAlert, useAcknowledgeAllAlerts,
  useLocationRequests, useSendLocationRequest, useCancelLocationRequest,
  useLocationSharingFlags, useEnableEmergencyLocationPermission,
  useCaredOneLocationSettings, useShareMyLocation,
} from "@/hooks/use-care-data";
import {
  ZONE_TYPE, ZONE_TYPE_CODES, isCustomZone, isDangerZone, isSafeZone,
  zoneTypeLabel,
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
    const [xi, yi] = polygon[i]!;
    const [xj, yj] = polygon[j]!;
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function douglasPeucker(points: [number, number][], tolerance: number): [number, number][] {
  if (points.length <= 2) return points;
  let maxDist = 0; let maxIdx = 0;
  const [x1, y1] = points[0]!; const [x2, y2] = points[points.length - 1]!;
  const len = Math.hypot(x2 - x1, y2 - y1);
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i]!;
    const dist = len === 0 ? Math.hypot(px - x1, py - y1)
      : Math.abs((y2 - y1) * px - (x2 - x1) * py + x2 * y1 - y2 * x1) / len;
    if (dist > maxDist) { maxDist = dist; maxIdx = i; }
  }
  if (maxDist > tolerance) {
    const l = douglasPeucker(points.slice(0, maxIdx + 1), tolerance);
    const r = douglasPeucker(points.slice(maxIdx), tolerance);
    return [...l.slice(0, -1), ...r];
  }
  return [points[0]!, points[points.length - 1]!];
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
      const si = strength(rads[i]!);
      const sj = strength(rads[j]!);
      const [xi, yi] = pts[i]!; const [xj, yj] = pts[j]!;
      if (si >= 1) {
        next.push([xi * 0.75 + xj * 0.25, yi * 0.75 + yj * 0.25]);
        next.push([xi * 0.25 + xj * 0.75, yi * 0.25 + yj * 0.75]);
        nextR.push(rads[i]!, rads[j]!);
      } else if (si > 0) {
        const q1: [number, number] = [xi * 0.75 + xj * 0.25, yi * 0.75 + yj * 0.25];
        const q2: [number, number] = [xi * 0.25 + xj * 0.75, yi * 0.25 + yj * 0.75];
        next.push([xi * (1 - si) + q1[0] * si, yi * (1 - si) + q1[1] * si]);
        if (sj > 0) { next.push([xj * (1 - sj) + q2[0] * sj, yj * (1 - sj) + q2[1] * sj]); nextR.push(rads[i]!, rads[j]!); }
        else { nextR.push(rads[i]!); }
      } else {
        next.push([xi, yi]); nextR.push(rads[i]!);
        if (sj > 0) { next.push([xi * 0.25 + xj * 0.75, yi * 0.25 + yj * 0.75]); nextR.push(rads[j]!); }
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
// Zone colours follow the dictionary type (a55): Safe = green, Danger = red,
// Custom = blue unless the zone stores its own colour in a59.
function zoneColor(code: string): string {
  if (isDangerZone(code)) return "#EF4444";
  if (isSafeZone(code)) return "#10B981";
  if (isCustomZone(code)) return "#3B82F6";
  return "#6B7280";
}

/** Colour actually painted for a zone: a custom zone may carry its own colour (a59). */
function zoneFill(code: string, storedColor?: string | null | undefined): string {
  if (isCustomZone(code) && typeof storedColor === "string" && /^#[0-9a-fA-F]{6}$/.test(storedColor)) return storedColor;
  return zoneColor(code);
}

/** Palette offered for custom zones — includes the Safe green and Danger red. */
const CUSTOM_ZONE_COLORS = ["#10B981", "#EF4444", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899", "#0EA5E9", "#6B7280"];

function zoneIcon(code: string) {
  if (isDangerZone(code)) return Ban;
  if (isSafeZone(code)) return Shield;
  return Target;
}

// CCT 214 has no column for corner rounding, so the control stays hidden.
const SHOW_CORNER_ROUNDING: boolean = Boolean(0);

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** "08:00", an ISO datetime, or an RFC 5545 "…T080000" value → minutes after local midnight. */
function toMinutes(v: any): number | null {
  const str = String(v ?? "").trim();
  if (!str) return null;
  let m = /^(\d{1,2}):(\d{2})/.exec(str);
  if (m) return Number(m[1]) * 60 + Number(m[2]);
  m = /T(\d{2})(\d{2})(\d{2})?(Z)?$/.exec(str);
  if (m && !str.includes("-")) {
    if (m[4]) { const d = new Date(Date.UTC(2000, 0, 1, Number(m[1]), Number(m[2]))); return d.getHours() * 60 + d.getMinutes(); }
    return Number(m[1]) * 60 + Number(m[2]);
  }
  const d = new Date(str);
  if (!Number.isNaN(d.getTime())) return d.getHours() * 60 + d.getMinutes();
  return null;
}

function hhmm(v: any, fallback: string): string {
  const n = toMinutes(v);
  if (n == null) return fallback;
  return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
}

function isZoneActive(zone: any): boolean {
  if (!zone.schedule_enabled) return true;
  const now = new Date();
  const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now.getDay()];
  // CCT 214 has no weekday column, so days only limit the zone when present.
  if (Array.isArray(zone.schedule_days) && zone.schedule_days.length && !zone.schedule_days.includes(dayName)) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  const s = toMinutes(zone.schedule_start_time), e = toMinutes(zone.schedule_end_time);
  if (s == null || e == null) return true;
  return s <= e ? cur >= s && cur <= e : cur >= s || cur <= e;
}

function checkZoneBreach(zone: any, lat: number, lng: number): { breached: boolean; distance: number; inside: boolean } {
  if (!isZoneActive(zone)) return { breached: false, distance: 0, inside: false };
  let inside = false, distance = 0;
  if (String(zone.shape_type || "").toLowerCase() === "polygon" && zone.polygon_points?.length >= 3) {
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
  return { breached, distance: Math.round(distance), inside };
}

type Tab = "location" | "requests" | "alerts" | "safezones" | "history";

interface Props { caredOneId: string; caredOneName: string; readOnly?: boolean; }

const defaultForm = () => ({
  zone_type: ZONE_TYPE.SAFE as string, shape_type: "radius", color: "#3B82F6",
  latitude: "", longitude: "", radius: 200,
  polygon_points: [] as [number, number][],
  corner_radius: [] as number[],
  description: "", notify_on_enter: true, notify_on_exit: true,
  schedule_enabled: false, schedule_start_time: "08:00", schedule_end_time: "20:00",
  schedule_days: [] as string[],
});


export default function LocationCard({ caredOneId, caredOneName, readOnly = false }: Props) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith("zh");
  const [activeTab, setActiveTab] = useState<Tab>("location");

  // ─── Data
  const { data: currentLocation, refetch: refetchLocation, isLoading: loadingLocation } = useCaredOneLocation(caredOneId);
  const managementSubject = readOnly ? null : caredOneId;
  const { data: locationHistory, refetch: refetchHistory } = useCaredOneLocationHistory(managementSubject);
  const { data: zones, refetch: refetchZones } = useSafeZones(caredOneId);
  const { data: alerts, refetch: refetchAlerts } = useSafeZoneAlerts(managementSubject);
  const { data: locationRequests, refetch: refetchRequests } = useLocationRequests(managementSubject);
  const { data: locationSettings, refetch: refetchSettings } = useCaredOneLocationSettings(managementSubject);
  // CCT 258: a56 sharing on, a55 emergency requests allowed — decided per person.
  const { data: flags, refetch: refetchFlags } = useLocationSharingFlags(managementSubject);
  const enableEmergency = useEnableEmergencyLocationPermission();
  // Fallback map centre: where the person looking at this page is.
  const [viewerPos, setViewerPos] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    if (readOnly) return;
    let off = false;
    getCurrentPosition({ timeout: 10000 }).then((p) => { if (!off && p) setViewerPos({ lat: p.latitude, lng: p.longitude }); });
    return () => { off = true; };
  }, [readOnly]);

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

  // ─── Custom zone name lives on the zone row itself (CCT 214 a57)
  const [customNameDraft, setCustomNameDraft] = useState("");
  const zoneLabel = useCallback(
    (code: string, zoneName?: string | null | undefined) => zoneTypeLabel(code, zoneName ?? null, !!isZh),
    [isZh],
  );


  // ─── Polygon drawing state
  const [drawMode, setDrawMode] = useState<"idle" | "drawing" | "editing">("idle");
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);
  const initialPathRef = useRef<[number, number][]>([]);
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
  const [openHistoryId, setOpenHistoryId] = useState<string | null>(null);
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
      const color = zoneFill(zone.zone_type, zone.color);
      const isDanger = isDangerZone(zone.zone_type);
      if (String(zone.shape_type || "").toLowerCase() === "polygon" && zone.polygon_points?.length >= 3) {
        const pts: [number, number][] = zone.polygon_points;
        const smoothed = zone.corner_radius?.some((r: number) => r > 0)
          ? chaikinPerVertex(pts, zone.corner_radius) : pts;
        const poly = Lx.polygon(smoothed, { color, fillColor: color, fillOpacity: 0.15, weight: 2, dashArray: isDanger ? "6,4" : undefined })
          .addTo(map).bindPopup(`<b>${zoneLabel(zone.zone_type, zone.zone_name)}</b>${zone.description ? `<br>${zone.description}` : ""}`);
        mapLayersRef.current.push(poly);
        pts.forEach((pt: [number, number]) => bounds.push(pt));
      } else {
        const c = Lx.circle([zLat, zLng], { radius: zone.radius_meters || 200, color, fillColor: color, fillOpacity: 0.15, weight: 2, dashArray: isDanger ? "6,4" : undefined })
          .addTo(map).bindPopup(`<b>${zoneLabel(zone.zone_type, zone.zone_name)}</b><br>${zone.radius_meters || 200}m`);
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
    } else if (viewerPos) {
      map.setView([viewerPos.lat, viewerPos.lng], 15);
      const me = Lx.circleMarker([viewerPos.lat, viewerPos.lng], { radius: 8, color: "#fff", weight: 3, fillColor: "#3B82F6", fillOpacity: 1 }).addTo(map)
        .bindTooltip(isZh ? "你的位置" : "You are here");
      mapLayersRef.current.push(me);
    } else {
      map.setView([37.0902, -95.7129], 4);
    }
  }, [currentLocation, zones, caredOneName, zoneLabel, viewerPos, isZh]);

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
    const color = zoneFill(zoneForm.zone_type, zoneForm.color);
    const c = Lx.circle([lat, lng], { radius: zoneForm.radius, color, fillColor: color, fillOpacity: 0.2, weight: 2, dashArray: "4,4" }).addTo(map);
    drawLayersRef.current.push(c);
    try { map.panTo([lat, lng]); } catch (_) {}
  }, [zoneForm.latitude, zoneForm.longitude, zoneForm.radius, zoneForm.zone_type, zoneForm.color]);


  // The map always sits on top; the five tabs live below it.
  const isMapTab = true;

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
    if (zoneForm.shape_type === "polygon") {
      drawLayersRef.current.forEach(l => { try { l.remove(); } catch (_) {} });
      drawLayersRef.current = [];
    } else renderRadiusPreview();
  }, [renderRadiusPreview, showZoneForm, zoneForm.shape_type, zoneForm.latitude, zoneForm.longitude, zoneForm.radius, drawMode]);

  useEffect(() => () => {
    if (leafletMapRef.current) {
      try { leafletMapRef.current.remove(); } catch (_) {}
      leafletMapRef.current = null; mapReadyRef.current = false;
    }
  }, []);

  // ─── Map click handlers for drawing
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !showZoneForm) return undefined;

    if (pickingOnMap && zoneForm.shape_type === "radius") {
      map.getContainer().style.cursor = "crosshair";
      const h = (e: any) => {
        setZoneForm(p => ({ ...p, latitude: e.latlng.lat.toFixed(6), longitude: e.latlng.lng.toFixed(6) }));
        setPickingOnMap(false);
      };
      map.once("click", h);
      return () => { map.off("click", h); map.getContainer().style.cursor = ""; };
    }

    map.getContainer().style.cursor = "";
    return undefined;
  }, [pickingOnMap, drawMode, showZoneForm, drawnPoints.length, zoneForm.shape_type]);

  function finishDrawing() {
    if (drawnPoints.length < 3) { toast({ title: isZh ? "至少需要3个点" : "Need at least 3 points", variant: "destructive" }); return; }
    const c = centroid(drawnPoints);
    setZoneForm(p => ({ ...p, latitude: c[0].toFixed(6), longitude: c[1].toFixed(6) }));
    setDrawMode("editing");
    setSelectedVertex(null);
  }

  const openZoneForm = (zone?: any | undefined) => {
    initialPathRef.current = zone?.polygon_points || [];
    if (zone) {
      setEditingZone(zone);
      setZoneForm({
        zone_type: zone.zone_type || ZONE_TYPE.SAFE,
        // Stored rows say "Polygon"/"Radius"; the form works in lowercase.
        shape_type: String(zone.shape_type || "radius").toLowerCase() === "polygon" ? "polygon" : "radius",
        color: (typeof zone.color === "string" && /^#[0-9a-fA-F]{6}$/.test(zone.color)) ? zone.color : "#3B82F6",
        latitude: zone.latitude?.toString() || "", longitude: zone.longitude?.toString() || "",
        radius: zone.radius_meters || 200, description: zone.description || "",
        polygon_points: zone.polygon_points || [], corner_radius: zone.corner_radius || [],
        notify_on_enter: zone.notify_on_enter ?? true, notify_on_exit: zone.notify_on_exit ?? true,
        schedule_enabled: zone.schedule_enabled ?? false,
        schedule_start_time: hhmm(zone.schedule_start_time, "08:00"),
        schedule_end_time: hhmm(zone.schedule_end_time, "20:00"),
        schedule_days: zone.schedule_days || [],
      });
      if (String(zone.shape_type || "").toLowerCase() === "polygon" && zone.polygon_points?.length >= 3) {
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
    setCustomNameDraft(isCustomZone(zone?.zone_type || ZONE_TYPE.SAFE) ? String(zone?.zone_name || "") : "");
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

    // A custom zone carries its own name in a57; Safe/Danger use the fixed label.
    const isCustom = isCustomZone(zoneForm.zone_type);
    if (isCustom && !customNameDraft.trim()) {
      toast({ title: isZh ? "请填写自定义区域名称" : "Custom zone name is required", variant: "destructive" });
      return;
    }

    const payload = {
      user_id: caredOneId, zone_type: zoneForm.zone_type,
      zone_name: isCustom ? customNameDraft.trim() : "",
      shape_type: isPolygon ? "polygon" : "radius",
      color: isCustom ? zoneForm.color : zoneColor(zoneForm.zone_type), latitude: lat, longitude: lng,
      radius_meters: isPolygon ? 0 : zoneForm.radius,
      polygon_points: isPolygon ? drawnPoints : null,
      corner_radius: null,
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


  const handleSendRequest = async (emergency: boolean) => {
    if (emergency && !emergencyConfirm) { setEmergencyConfirm(true); return; }
    const isEmergency = emergency;
    setSendingRequest(true);
    sendRequest.mutate({ caredOneId, message: requestMessage, isEmergency }, {
      onSuccess: () => {
        setSendingRequest(false); setRequestMessage(""); setIsEmergency(false); setEmergencyConfirm(false);
        toast({ title: isZh ? (isEmergency ? "紧急请求已发送 🚨" : "位置请求已发送 ✓") : (isEmergency ? "Emergency request sent 🚨" : "Location request sent ✓"), description: isEmergency ? (isZh ? "对方应用开着时位置会立即到达。" : "The location arrives as soon as their app is open.") : (isZh ? "对方允许后，位置会出现在「实时位置」。" : "Once they allow it, the location appears under Live location.") });
        refetchFlags();
        refetchRequests();
      },
      onError: (e: any) => { setSendingRequest(false); toast({ title: isZh ? "操作失败" : "Failed", description: e.message, variant: "destructive" }); },
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all(readOnly
      ? [refetchLocation(), refetchZones()]
      : [refetchLocation(), refetchHistory(), refetchZones(), refetchAlerts(), refetchRequests(), refetchSettings()]);
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
      toast({ title: isZh ? `已使用${caredOneName}最后一次已知位置` : `Using ${caredOneName}'s last known location` });
    } else {
      toast({ title: isZh ? `暂无${caredOneName}的位置数据` : `No location data for ${caredOneName}`, variant: "destructive" });
    }
  };

  const tabs: { key: Tab; label: string; icon: any; badge?: number | undefined }[] = [
    { key: "location", label: isZh ? "实时位置" : "Live Location", icon: MapPin },
    { key: "requests", label: isZh ? "共享请求" : "Requests", icon: Send, badge: pendingRequests || undefined },
    { key: "alerts", label: isZh ? "提醒" : "Alerts", icon: Bell, badge: unreadAlerts || undefined },
    { key: "safezones", label: isZh ? "安全区域" : "Safe Zones", icon: Shield, badge: (zones || []).length || undefined },
    { key: "history", label: isZh ? "历史记录" : "History", icon: Clock },
  ];

  const lastSeen = currentLocation ? formatDateTime(currentLocation.created_at) : null;

  return (
    <div className="space-y-4">
      {/* ─── Header with status + actions ─── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {isZh ? `${caredOneName}的位置` : `${caredOneName}'s Location`}
          </h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {!readOnly && <Badge variant={flags?.shareOn ? "default" : "secondary"} className="text-xs">
              {flags?.shareOn ? (isZh ? "📍 已开启实时位置分享" : "📍 Live sharing on") : (isZh ? "未开启实时位置分享" : "Live sharing off")}
            </Badge>}
            {!readOnly && <Badge variant="outline" className="text-xs">
              {flags?.emergencyAllowed ? (isZh ? "🚨 允许紧急请求" : "🚨 Emergency requests allowed") : (isZh ? "未允许紧急请求" : "Emergency requests not allowed")}
            </Badge>}
            {lastSeen && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                {isZh ? `最后位置 ${lastSeen}` : `Last seen ${lastSeen}`}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh} disabled={refreshing} aria-label={isZh ? "刷新位置" : "Refresh location"}>
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* ─── Breach banner ─── */}
      {breaches.length > 0 && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-2 text-destructive font-semibold text-sm mb-1">
            <AlertTriangle className="h-4 w-4" /> {isZh ? "检测到越界" : "Zone breach detected"}
          </div>
          {breaches.map((z: any) => (
            <p key={z.id} className="text-xs text-destructive/80">
              {isDangerZone(z.zone_type)
                ? (isZh ? `⚠ ${caredOneName} 位于危险区域「${zoneLabel(z.zone_type, z.zone_name)}」内` : `⚠ ${caredOneName} is inside danger zone "${zoneLabel(z.zone_type, z.zone_name)}"`)
                : checkZoneBreach(z, parseFloat(currentLocation.latitude), parseFloat(currentLocation.longitude)).inside
                  ? (isZh ? `⚠ ${caredOneName} 已进入区域「${zoneLabel(z.zone_type, z.zone_name)}」` : `⚠ ${caredOneName} entered zone "${zoneLabel(z.zone_type, z.zone_name)}"`)
                  : (isZh ? `⚠ ${caredOneName} 已离开区域「${zoneLabel(z.zone_type, z.zone_name)}」` : `⚠ ${caredOneName} is outside zone "${zoneLabel(z.zone_type, z.zone_name)}"`)}

            </p>
          ))}
        </div>
      )}

      {/* ─── Map (always visible on map tabs) ─── */}
      <div style={{ display: isMapTab ? "block" : "none" }} className="relative">
        <div ref={mapRef} className={`${readOnly ? "h-56" : showZoneForm && zoneForm.shape_type === "polygon" ? "h-[460px]" : "h-[350px]"} w-full rounded-md overflow-hidden bg-muted`} />
        {activeTab === "location" && currentLocation?.latitude && (
          <Button variant="outline" size="sm" className="absolute top-2 right-2 z-[1000] shadow-md bg-background/90 backdrop-blur-sm" asChild>
            <a href={`https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" /> {isZh ? "在地图中打开" : "Open in Maps"}
            </a>
          </Button>
        )}
        {activeTab === "safezones" && !showZoneForm && (
          <Button size="sm"
            className="absolute top-2 right-2 z-[1000] shadow-md bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => openZoneForm()}>
            <Plus className="h-3 w-3 mr-1" /> {isZh ? "添加区域" : "Add Zone"}
          </Button>
        )}
        {showZoneForm && zoneForm.shape_type === "polygon" && leafletMapRef.current && (
          <ZonePathEditor key={editingZone?.id || "new-zone"} map={leafletMapRef.current}
            initial={initialPathRef.current} isZh={!!isZh} onChange={setDrawnPoints} />
        )}
      </div>

      {/* ─── Tabs ─── */}
      {!readOnly && <div className="flex gap-1 border-b border-border overflow-x-auto -mx-1 px-1">
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
      </div>}

      {/* ─── TAB CONTENT ─── */}

      {/* LIVE LOCATION */}
      {activeTab === "location" && (
        <div className="space-y-4">
          {!readOnly && !flags?.shareOn && (
            <Card className="border-transparent card-elevated">
              <CardContent className="p-4 space-y-2">
                <p className="text-sm font-medium">{isZh ? `${caredOneName}还没有开启实时位置分享` : `${caredOneName} has not turned on live sharing`}</p>
                <p className="text-xs text-muted-foreground">{isZh ? "发送位置请求后，对方允许即开启分享，位置会自动更新。" : "Send a location request. Once they allow it, sharing turns on and the location keeps updating."}</p>
                <Button variant="coral" size="sm" onClick={() => setActiveTab("requests")}>
                  <Send className="h-3 w-3 mr-1" /> {isZh ? "请求位置" : "Request location"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Current location details */}
          {loadingLocation ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : currentLocation ? (
            <Card className="border-transparent card-elevated">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm font-semibold text-foreground">{isZh ? "最新位置" : "Latest location"}</span>
                  {currentLocation.is_emergency && <Badge variant="destructive" className="text-[10px]">{isZh ? "紧急模式" : "Emergency mode"}</Badge>}
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                  <dt className="text-muted-foreground">{isZh ? "位置" : "Location"}</dt>
                  <dd>{currentLocation.address_text || `${parseFloat(currentLocation.latitude).toFixed(6)}, ${parseFloat(currentLocation.longitude).toFixed(6)}`}</dd>
                  <dt className="text-muted-foreground">{isZh ? "使用设备" : "Device"}</dt>
                  <dd>{currentLocation.platform || (isZh ? "未知" : "Unknown")}</dd>
                  <dt className="text-muted-foreground">{isZh ? "最后更新" : "Last updated"}</dt>
                  <dd>{formatDateTime(currentLocation.captured_at || currentLocation.created_at)}</dd>
                  <dt className="text-muted-foreground">{isZh ? "电量" : "Battery"}</dt>
                  <dd>{currentLocation.battery_level != null ? `${currentLocation.battery_level}%` : (isZh ? "未知" : "Unknown")}</dd>
                  <dt className="text-muted-foreground">{isZh ? "是否在充电" : "Charging"}</dt>
                  <dd>{currentLocation.phone_is_charging === "Yes" ? (isZh ? "是" : "Yes") : currentLocation.phone_is_charging === "No" ? (isZh ? "否" : "No") : (isZh ? "未知" : "Unknown")}</dd>
                </dl>

                {/* Quick zone status */}
                {(zones || []).length > 0 && (
                  <div className="pt-2 border-t border-border mt-2 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{isZh ? "区域状态" : "Zone Status"}</p>
                    {(zones || []).map((zone: any) => {
                      const breach = checkZoneBreach(zone, parseFloat(currentLocation.latitude), parseFloat(currentLocation.longitude));
                      return (
                        <div key={zone.id} className="flex items-center gap-2 text-xs">
                          <div className="w-2 h-2 rounded-full" style={{ background: zoneFill(zone.zone_type, zone.color) }} />
                          <span className="font-medium">{zoneLabel(zone.zone_type, zone.zone_name)}</span>
                          <span className={breach.breached ? "text-destructive font-semibold" : "text-success"}>
                            {isDangerZone(zone.zone_type)
                              ? (breach.breached
                                  ? (isZh ? "⚠ 已进入危险区域！" : "⚠ INSIDE danger zone!")
                                  : (isZh ? `✓ 已远离（${breach.distance} 米）` : `✓ Away (${breach.distance}m)`))
                              : (!breach.inside
                                  ? (isZh ? `${breach.breached ? "⚠ " : ""}在区域外（${breach.distance} 米）` : `${breach.breached ? "⚠ " : ""}Outside (${breach.distance}m)`)
                                  : (isZh ? `${breach.breached ? "⚠ " : "✓ "}在区域内（${breach.distance} 米）` : `${breach.breached ? "⚠ " : "✓ "}Inside (${breach.distance}m)`))}
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
                <p className="text-sm font-medium text-foreground mb-1">{isZh ? "还没有位置记录" : "No location yet"}</p>
                <p className="text-xs text-muted-foreground mb-3">{readOnly
                  ? (isZh ? "这张信息卡关联的人暂无位置记录。如需帮助，请联系其家人。" : "No location has been recorded for the person on this card. Please contact their family for help.")
                  : (isZh ? `${caredOneName}还没分享过位置。发送请求后，对方手机会收到通知，点开同意即可在这里看到位置。` : `${caredOneName} has not shared a location yet. Send a request; once they tap it and agree, it shows here.`)}</p>
                {!readOnly && <Button variant="coral" size="sm" onClick={() => setActiveTab("requests")}>
                  <Send className="h-3 w-3 mr-1" /> {isZh ? "去发送位置请求" : "Send a location request"}
                </Button>}
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
              <h3 className="font-semibold text-sm">{isZh ? `请求${caredOneName}的位置` : `Ask ${caredOneName} for their location`}</h3>
              <p className="text-xs text-muted-foreground">{isZh ? `${caredOneName}会收到消息，选择是否允许。允许后会开启实时位置分享，位置显示在「实时位置」。` : `${caredOneName} gets a message and chooses whether to allow it. Allowing turns on live sharing; the location shows under Live location.`}</p>
              <Textarea value={requestMessage} onChange={e => setRequestMessage(e.target.value)}
                placeholder={isZh ? "可选：说明为什么需要位置" : "Optional: why you need their location"} rows={2} />
              <Button className="w-full" onClick={() => handleSendRequest(false)} disabled={sendingRequest || sendRequest.isPending}>
                {(sendingRequest || sendRequest.isPending) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                {isZh ? "发送位置请求" : "Send location request"}
              </Button>
              <div className="flex flex-col gap-2 p-3 rounded-lg border bg-destructive/5 border-destructive/30">
                <p className="text-sm font-medium">{isZh ? "🚨 紧急请求" : "🚨 Emergency request"}</p>
                {flags?.emergencyAllowed ? (
                  <>
                    <p className="text-xs text-muted-foreground">{isZh ? `${caredOneName}已允许紧急请求：不需要对方确认，只要对方的应用开着，位置会立即发过来，并记为紧急模式。` : `${caredOneName} allows emergency requests: no confirmation needed. As long as their app is open, the location arrives at once and is marked as emergency mode.`}</p>
                    {emergencyConfirm && <p className="text-xs text-destructive font-medium">{isZh ? "确定吗？再点一次发送。" : "Are you sure? Click again to send."}</p>}
                    <Button variant="destructive" onClick={() => handleSendRequest(true)} disabled={sendingRequest || sendRequest.isPending}>
                      {emergencyConfirm ? (isZh ? "确认发送紧急请求" : "Confirm emergency request") : (isZh ? "发送紧急请求" : "Send emergency request")}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">{isZh ? `${caredOneName}还没有开启紧急请求许可。开启后，紧急时不需要对方确认就能查看位置；开启时会给对方发送通知。` : `Emergency requests are off for ${caredOneName}. Once on, you can see their location in an emergency without them confirming. They are notified when you turn it on.`}</p>
                    <Button variant="outline" disabled={enableEmergency.isPending}
                      onClick={() => enableEmergency.mutate(caredOneId, {
                        onSuccess: () => { refetchFlags(); toast({ title: isZh ? "已开启紧急请求许可，并已通知对方" : "Emergency permission on; they were notified" }); },
                        onError: (e: any) => toast({ title: isZh ? "操作失败" : "Failed", description: e.message, variant: "destructive" }),
                      })}>
                      {enableEmergency.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {isZh ? `为${caredOneName}开启紧急请求许可` : `Turn on emergency requests for ${caredOneName}`}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {(locationRequests || []).filter((r: any) => r.status === "pending").length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">{isZh ? "等待回应" : "Waiting"}</h3>
              <div className="space-y-2">
                {(locationRequests || []).filter((r: any) => r.status === "pending").map((req: any) => (
                  <Card key={req.id} className="border-transparent card-elevated border-l-2 border-l-amber-400">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-amber-500">{isZh ? "⏳ 已送达，等待对方同意" : "⏳ Delivered, waiting for them"}</span>
                            {req.is_emergency && <Badge variant="destructive" className="text-[10px]">{isZh ? "紧急" : "Urgent"}</Badge>}
                          </div>
                          {req.message && <p className="text-xs text-muted-foreground mt-0.5">"{req.message}"</p>}
                          <p className="text-xs text-muted-foreground">{formatDateTime(req.created_at)}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive text-xs h-7"
                          onClick={() => cancelRequest.mutate({ requestId: req.id, caredOneId })}
                          disabled={cancelRequest.isPending}>{isZh ? "移除" : "Remove"}</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {(locationRequests || []).filter((r: any) => r.status !== "pending").length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">{isZh ? "已回应" : "Answered"}</h3>
              <div className="space-y-2">
                {(locationRequests || []).filter((r: any) => r.status !== "pending").map((req: any) => {
                  const sc: Record<string, { icon: string; label: string; color: string }> = {
                    accepted:           { icon: "✓",  label: isZh ? "已分享位置" : "Location shared",               color: "text-success" },
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
              <p className="text-sm">{isZh ? "这台设备还没发过位置请求" : "No requests sent from this device yet"}</p>
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
                            {alert.safe_zone?.zone_type && (
                              <Badge variant="secondary" className="text-[10px]">{zoneLabel(alert.safe_zone.zone_type, alert.safe_zone.zone_name)}</Badge>
                            )}

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
                  <h3 className="font-semibold">{editingZone ? (isZh ? "编辑区域" : "Edit zone") : (isZh ? "新建区域" : "New zone")}</h3>
                  <Button variant="ghost" size="icon" className="h-7 w-7"
                    onClick={() => { setShowZoneForm(false); setEditingZone(null); setDrawMode("idle"); setDrawnPoints([]); setCornerRadii([]); }}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Zone type — the three dictionary types (a55): Safe, Danger,
                    Custom. A custom zone carries its own name in a57. */}
                <div>
                  <Label className="text-xs">{isZh ? "区域类型 *" : "Zone Type *"}</Label>
                  <div className="grid grid-cols-3 gap-1.5 mt-1">
                    {ZONE_TYPE_CODES.map(code => {
                      const active = zoneForm.zone_type === code;
                      const c = zoneColor(code);
                      return (
                        <button key={code}
                          onClick={() => {
                            setZoneForm(p => ({ ...p, zone_type: code }));
                            if (!isCustomZone(code)) setCustomNameDraft("");
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
                  <p className="text-xs text-destructive bg-destructive/10 rounded-sm p-2">
                    {isZh
                      ? `当 ${caredOneName} 进入该区域时提醒`
                      : `Alert when ${caredOneName} enters this area`}
                  </p>
                )}

                {isCustomZone(zoneForm.zone_type) && (
                  <div>
                    <Label className="text-xs">
                      {isZh ? "自定义区域名称" : "Custom zone name"}
                    </Label>
                    <Input value={customNameDraft} onChange={e => setCustomNameDraft(e.target.value)}
                      placeholder={isZh ? "例如：日托中心" : 'e.g. "Day centre"'} className="mt-1" />

                    <Label className="text-xs mt-3 block">{isZh ? "区域颜色" : "Zone colour"}</Label>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      {CUSTOM_ZONE_COLORS.map(c => (
                        <button key={c} type="button" aria-label={c}
                          onClick={() => setZoneForm(p => ({ ...p, color: c }))}
                          className={`h-7 w-7 rounded-full border-2 transition-transform ${zoneForm.color.toLowerCase() === c.toLowerCase() ? "scale-110 border-foreground" : "border-transparent"}`}
                          style={{ background: c }} />
                      ))}
                      <input type="color" aria-label={isZh ? "自选颜色" : "Pick a colour"}
                        value={zoneForm.color}
                        onChange={e => setZoneForm(p => ({ ...p, color: e.target.value }))}
                        className="h-7 w-9 rounded-sm border bg-transparent p-0.5" />
                    </div>
                  </div>
                )}


                <div>
                  <Label className="text-xs">{isZh ? "形状" : "Shape"}</Label>
                  <div className="flex rounded-lg border overflow-hidden mt-1">
                    {(["radius", "polygon"] as const).map(st => (
                      <button key={st} onClick={() => {
                        setZoneForm(p => ({ ...p, shape_type: st }));
                        if (st === "radius") { setDrawMode("idle"); setDrawnPoints([]); setCornerRadii([]); }
                      }}
                        className={`flex-1 py-1.5 text-sm font-medium transition-colors
                          ${zoneForm.shape_type === st ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-accent"}`}>
                        {st === "radius" ? (isZh ? "⬤ 圆形范围" : "⬤ Circle area") : (isZh ? "⬡ 绘制边界" : "⬡ Draw boundary")}
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
                        onValueChange={([v]) => setZoneForm(p => ({ ...p, radius: v! }))} />
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5"><span>50m</span><span>5km</span></div>
                    </div>
                  </>
                )}

                {zoneForm.shape_type === "polygon" && (
                  <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
                    <span className="text-sm font-medium">{isZh ? "边界" : "Boundary"}</span>
                    <span className="text-xs text-muted-foreground">{drawnPoints.length} {isZh ? "边界点" : "boundary points"}</span>
                  </div>
                )}

                <div>
                  <Label className="text-xs">{isZh ? "描述（可选）" : "Description (optional)"}</Label>
                  <Textarea value={zoneForm.description} onChange={e => setZoneForm(p => ({ ...p, description: e.target.value }))}
                    placeholder={isZh ? "可选备注…" : "Optional notes..."} rows={2} className="mt-1" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">{isZh ? "进入时提醒" : "Alert on enter"}</Label>
                    <Switch checked={zoneForm.notify_on_enter} onCheckedChange={v => setZoneForm(p => ({ ...p, notify_on_enter: v }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">{isZh ? "离开时提醒" : "Alert on exit"}</Label>
                    <Switch checked={zoneForm.notify_on_exit} onCheckedChange={v => setZoneForm(p => ({ ...p, notify_on_exit: v }))} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-semibold">{isZh ? "生效时段" : "Active hours"}</Label>
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
                            className={`px-2 py-1 rounded-sm text-xs border font-medium transition-colors
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
                    {isZh ? "取消" : "Cancel"}
                  </Button>
                  <Button className="flex-1 text-white"
                    style={{ background: zoneFill(zoneForm.zone_type, zoneForm.color) }}
                    onClick={handleSaveZone}
                    disabled={createZone.isPending || updateZone.isPending}>

                    {(createZone.isPending || updateZone.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                    {editingZone ? (isZh ? "保存修改" : "Save changes") : (isZh ? "创建区域" : "Create zone")}
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
                <p className="text-sm">{isZh ? "还没有区域" : "No zones yet"}</p>
                <p className="text-xs">{isZh ? "可以加安全区域（如家），或要避开的危险区域" : "Add safe zones like home, or danger zones to avoid"}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => openZoneForm()}>
                  <Plus className="h-3 w-3 mr-1" /> {isZh ? "新建区域" : "New zone"}
                </Button>
              </div>
            )}
            {(zones || []).map((zone: any) => {
              const color = zoneFill(zone.zone_type, zone.color);
              const Icon = zoneIcon(zone.zone_type);
              const label = zoneLabel(zone.zone_type, zone.zone_name);

              const active = isZoneActive(zone);
              const breachInfo = currentLocation
                ? checkZoneBreach(zone, parseFloat(currentLocation.latitude), parseFloat(currentLocation.longitude))
                : { breached: false, distance: 0, inside: false };
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
                          <span className="font-semibold text-sm">{label}</span>
                          {isDangerZone(zone.zone_type) && <Badge variant="destructive" className="text-[10px]">{isZh ? "危险" : "DANGER"}</Badge>}
                          {!active && <Badge variant="secondary" className="text-[10px]">{isZh ? "⏰ 定时（当前未生效）" : "⏰ Scheduled (inactive)"}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {String(zone.shape_type).toLowerCase() === "polygon" ? (isZh ? "精确范围" : "Traced area") : (isZh ? `半径 ${zone.radius_meters || 200} 米` : `${zone.radius_meters || 200}m radius`)}
                        </p>

                        {zone.description && <p className="text-xs text-muted-foreground">{zone.description}</p>}
                        {zone.schedule_enabled && zone.schedule_start_time && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {hhmm(zone.schedule_start_time, "")}–{hhmm(zone.schedule_end_time, "")}
                          </p>
                        )}
                        {currentLocation && active && (
                          <p className={`text-xs mt-1 font-medium ${breachInfo.breached ? "text-destructive" : "text-success"}`}>
                            {isDangerZone(zone.zone_type)
                              ? (breachInfo.breached ? (isZh ? `⚠ 现在在危险区域里（${breachInfo.distance} 米）` : `⚠ Inside danger zone (${breachInfo.distance}m)`) : (isZh ? `✓ 现在在区域外（${breachInfo.distance} 米）` : `✓ Outside (${breachInfo.distance}m)`))
                              : (!breachInfo.inside ? (isZh ? `现在在区域外（距中心 ${breachInfo.distance} 米）` : `Outside (${breachInfo.distance}m away)`) : (isZh ? `现在在区域里（距中心 ${breachInfo.distance} 米）` : `Inside (${breachInfo.distance}m from center)`))}

                          </p>
                        )}
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          <Badge variant="outline" className="text-[10px]">{isZh ? "类型：" : "Type: "}{isDangerZone(zone.zone_type) ? (isZh ? "危险区域" : "Danger") : isSafeZone(zone.zone_type) ? (isZh ? "安全区域" : "Safe") : (isZh ? "自定义" : "Custom")}</Badge>
                          {zone.schedule_enabled && <Badge variant="outline" className="text-[10px]"><Clock className="h-2.5 w-2.5 mr-0.5" />{isZh ? "有生效时段" : "Scheduled"}</Badge>}
                        </div>
                        <div className="flex gap-4 mt-2 flex-wrap">
                          <label className="flex items-center gap-2 text-xs">
                            <Switch checked={!!zone.notify_on_enter} onCheckedChange={(v) => updateZone.mutate({ id: zone.id, notify_on_enter: v })} />
                            {isZh ? "进入时提醒" : "Alert on enter"}
                          </label>
                          <label className="flex items-center gap-2 text-xs">
                            <Switch checked={!!zone.notify_on_exit} onCheckedChange={(v) => updateZone.mutate({ id: zone.id, notify_on_exit: v })} />
                            {isZh ? "离开时提醒" : "Alert on exit"}
                          </label>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openZoneForm(zone)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteZone(zone.id, label)}>
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
              <p className="text-sm">{isZh ? "还没有位置记录" : "No location history"}</p>
              <p className="text-xs mt-1">{isZh ? `${caredOneName}分享位置后，这里会出现记录` : `Location history appears after ${caredOneName} shares their location`}</p>
            </div>
          ) : (locationHistory || []).map((entry: any, idx: number) => {
            const lat = parseFloat(entry.latitude), lng = parseFloat(entry.longitude);
            const validPos = Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
            const open = openHistoryId === entry.id;
            const unknown = isZh ? "未知" : "Unknown";
            const yesNo = (v: string | null) => v === "Yes" ? (isZh ? "是" : "Yes") : v === "No" ? (isZh ? "否" : "No") : unknown;
            const moving: Record<string, [string, string]> = { stationary: ["静止", "Stationary"], walking: ["步行", "Walking"], running: ["跑步", "Running"], cycling: ["骑行", "Cycling"], automotive: ["乘车", "In a vehicle"], unknown: ["未知", "Unknown"] };
            return (
            <Card key={entry.id} className="border-transparent card-elevated">
              <CardContent className="p-0">
                <button type="button" className="w-full text-left p-3 flex items-start gap-3" onClick={() => setOpenHistoryId(open ? null : entry.id)} aria-expanded={open}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${idx === 0 ? "bg-success" : "bg-muted-foreground/40"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-medium ${idx === 0 ? "text-success" : "text-muted-foreground"}`}>
                        {idx === 0 ? (isZh ? "最新" : "Latest") : (isZh ? "之前" : "Earlier")}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatDateTime(entry.created_at)}</span>
                      {entry.is_emergency && <Badge variant="destructive" className="text-[10px]">{isZh ? "紧急定位" : "Emergency"}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {validPos ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : (isZh ? "没有有效位置" : "No valid position")}
                    </p>
                  </div>
                  <ChevronDown className={`h-4 w-4 mt-1 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
                {open && (
                  <div className="px-3 pb-3 pl-8 space-y-2">
                    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                      <dt className="text-muted-foreground">{isZh ? "位置" : "Location"}</dt>
                      <dd className="break-all">{entry.address_text || (validPos ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : unknown)}</dd>
                      <dt className="text-muted-foreground">{isZh ? "精度" : "Accuracy"}</dt>
                      <dd>{entry.accuracy_meters ? `±${Math.round(entry.accuracy_meters)} ${isZh ? "米" : "m"}` : unknown}</dd>
                      <dt className="text-muted-foreground">{isZh ? "记录时间" : "Recorded"}</dt>
                      <dd>{formatDateTime(entry.created_at)}</dd>
                      <dt className="text-muted-foreground">{isZh ? "使用设备" : "Device"}</dt>
                      <dd>{entry.platform || unknown}</dd>
                      <dt className="text-muted-foreground">{isZh ? "移动状态" : "Movement"}</dt>
                      <dd>{entry.moving_type ? (moving[entry.moving_type]?.[isZh ? 0 : 1] ?? unknown) : unknown}</dd>
                      <dt className="text-muted-foreground">{isZh ? "电量" : "Battery"}</dt>
                      <dd>{entry.battery_level != null ? `${entry.battery_level}%` : (isZh ? "手机未提供" : "Not reported by phone")}</dd>
                      <dt className="text-muted-foreground">{isZh ? "是否在充电" : "Charging"}</dt>
                      <dd>{yesNo(entry.phone_is_charging)}</dd>
                      <dt className="text-muted-foreground">{isZh ? "记录方式" : "Type"}</dt>
                      <dd>{entry.is_emergency ? (isZh ? "紧急定位（未开实时分享时）" : "Emergency (live sharing off)") : (isZh ? "实时位置分享" : "Live sharing")}</dd>
                    </dl>
                    {validPos && (
                      <Button size="sm" variant="outline" onClick={() => {
                        const map = leafletMapRef.current;
                        if (map) { map.setView([lat, lng], 16); map.getContainer().scrollIntoView({ behavior: "smooth", block: "center" }); }
                      }}>
                        <MapPin className="h-4 w-4 mr-1" />{isZh ? "在地图上查看" : "Show on map"}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
