/**
 * locationService.ts
 * Cross-platform GPS service supporting web (navigator.geolocation) and Capacitor native.
 * Also provides breach-detection algorithms and the full save-and-check pipeline.
 */

// ─── Types ────────────────────────────────────────────────────

export interface GPSCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface ZoneBreachResult {
  zoneId: string;
  zoneName: string;
  zoneType: "safe" | "danger";
  alertType: "exited_safe_zone" | "entered_safe_zone" | "entered_danger_zone" | "exited_danger_zone";
  distance: number;
  breached: boolean;
}

// ─── Permission ───────────────────────────────────────────────

export async function requestLocationPermission(): Promise<"granted" | "denied" | "prompt"> {
  try {
    // Try Capacitor first
    const cap = (window as any)?.Capacitor;
    if (cap?.isNativePlatform?.()) {
      const { Geolocation } = await import("@capacitor/core" as any);
      const status = await Geolocation.requestPermissions();
      return status.location === "granted" ? "granted" : "denied";
    }
  } catch (_) {}
  // Web fallback
  if (!navigator.permissions) return "prompt";
  try {
    const result = await navigator.permissions.query({ name: "geolocation" as PermissionName });
    return result.state as "granted" | "denied" | "prompt";
  } catch (_) {
    return "prompt";
  }
}

export async function checkLocationPermission(): Promise<"granted" | "denied" | "prompt"> {
  return requestLocationPermission();
}

// ─── Get position ─────────────────────────────────────────────

export interface GetPositionOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export async function getCurrentPosition(opts: GetPositionOptions = {}): Promise<GPSCoords> {
  const { enableHighAccuracy = true, timeout = 15000, maximumAge = 0 } = opts;
  try {
    const cap = (window as any)?.Capacitor;
    if (cap?.isNativePlatform?.()) {
      const { Geolocation } = await import("@capacitor/core" as any);
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy, timeout });
      return { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy };
    }
  } catch (_) {}
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      p => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy: p.coords.accuracy }),
      e => reject(e),
      { enableHighAccuracy, timeout, maximumAge }
    );
  });
}

export function watchPosition(
  callback: (coords: GPSCoords) => void,
  errorCallback?: (error: any) => void,
  opts: GetPositionOptions = {}
): () => void {
  const { enableHighAccuracy = true, timeout = 15000, maximumAge = 0 } = opts;
  const id = navigator.geolocation.watchPosition(
    p => callback({ latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy: p.coords.accuracy }),
    e => errorCallback?.(e),
    { enableHighAccuracy, timeout, maximumAge }
  );
  return () => navigator.geolocation.clearWatch(id);
}

// ─── Battery ──────────────────────────────────────────────────

export async function getBatteryLevel(): Promise<number | null> {
  try {
    const cap = (window as any)?.Capacitor;
    if (cap?.isNativePlatform?.()) {
      const { Device } = await import("@capacitor/core" as any);
      const info = await Device.getBatteryInfo();
      return info.batteryLevel != null ? Math.round(info.batteryLevel * 100) : null;
    }
    const nav: any = navigator;
    if (nav.getBattery) {
      const battery = await nav.getBattery();
      return Math.round(battery.level * 100);
    }
  } catch (_) {}
  return null;
}

// ─── Reverse geocode ──────────────────────────────────────────

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) return "";
    const data = await res.json();
    return data.display_name || "";
  } catch (_) {
    return "";
  }
}

// ─── Algorithms ───────────────────────────────────────────────

export function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isPointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function chaikinSmoothPerVertex(points: [number, number][], radii: number[]): [number, number][] {
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

// ─── Breach detection ─────────────────────────────────────────

function isZoneActiveNow(zone: any): boolean {
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

export function checkBreaches(lat: number, lng: number, zones: any[]): ZoneBreachResult[] {
  const results: ZoneBreachResult[] = [];
  for (const zone of zones) {
    if (!isZoneActiveNow(zone)) continue;
    // Zone rows carry the dictionary a55 semantics resolved by the CCT mapper:
    // is_danger / is_safe booleans plus zone_type_label. Custom zones (b57)
    // are neither safe nor danger — they breach on whichever transition the zone
    // enabled.
    const isDanger = !!zone.is_danger;
    const isPolygon = String(zone.shape_type).toLowerCase() === "polygon";
    let inside = false;
    let distance = 0;
    if (isPolygon && zone.polygon_points?.length >= 3) {
      const pts: [number, number][] = zone.polygon_points;
      const smoothed = zone.corner_radius?.some((r: number) => r > 0) ? chaikinSmoothPerVertex(pts, zone.corner_radius) : pts;
      inside = isPointInPolygon(lat, lng, smoothed);
      distance = Math.round(getDistanceMeters(lat, lng, zone.latitude, zone.longitude));
    } else {
      distance = Math.round(getDistanceMeters(lat, lng, zone.latitude, zone.longitude));
      inside = distance <= (zone.radius_meters || 200);
    }
    const breached = isDanger
      ? inside
      : zone.is_safe
        ? !inside
        : (inside ? !!zone.notify_on_enter : !!zone.notify_on_exit);
    if (breached) {
      const alertType = isDanger
        ? (inside ? "entered_danger_zone" : "exited_danger_zone")
        : (inside ? "entered_safe_zone" : "exited_safe_zone");
      results.push({ zoneId: zone.id, zoneName: zone.zone_type_label, zoneType: zone.zone_type, alertType, distance, breached });
    }

  }
  return results;
}


// ─── Full pipeline: save location + check zones + create dedup'd alerts ───

export async function saveLocationAndCheckZones(_userId: string, coords: GPSCoords): Promise<void> {
  const { writeLocationAndCheckZones } = await import("@/features/location/source.wordpress");
  await writeLocationAndCheckZones(coords.latitude, coords.longitude, { accuracy: coords.accuracy ?? undefined });
}
