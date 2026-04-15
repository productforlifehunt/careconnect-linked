/**
 * Location Extended — Safe Zones, Alerts, Requests, Location Settings
 *
 * Safe Zone CCT: "Safe Zone" (slug: safe_zone)
 * Safe Zone Relation: "One user can have many related safe zones" (one-to-many)
 *
 * Location uses the new single-CCT architecture from source.wordpress.ts
 */

import { createWordPressFeature, deleteWordPressFeature, listWordPressFeature, updateWordPressFeature } from "@/features/shared/wordpress-adapter";
import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";
import { createNotificationWordPress } from "@/features/notifications/source.wordpress";
import { fetchCurrentLocation, fetchLocationHistory, writeLocationAndCheckZones } from "@/features/location/source.wordpress";
import type { LocationSnapshot } from "@/features/location/source.wordpress";

// ─── Relation IDs ────────────────────────────────────────────
const REL_USER_SAFE_ZONE = 90;

type SafeZoneAlertType = "exited_safe_zone" | "entered_safe_zone" | "entered_danger_zone" | "exited_danger_zone";

function normalizeWpUserId(id: string): number {
  return Number(String(id).replace(/^wp-/, ""));
}

async function fetchRelationChildIds(relationId: number, parentUserId: number): Promise<string[]> {
  const rels = await wordpressFetch<any[]>(`jet-rel/${relationId}/children/${parentUserId}`);
  if (!Array.isArray(rels)) return [];
  return rels
    .map((relation: any) => String(relation.child_object_id || ""))
    .filter(Boolean);
}

async function attachChildToUserRelation(relationId: number, parentUserId: number, childId: string): Promise<void> {
  await wordpressFetch(`jet-rel/${relationId}`, {
    method: "POST",
    body: {
      parent_id: parentUserId,
      child_id: Number(childId),
      context: "child",
      store_items_type: "update",
    },
  });
}

function parseBoolean(value: any, fallback = false): boolean {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  return ["yes", "true", "1", "on"].includes(String(value).toLowerCase());
}

function parseNumber(value: any, fallback: number | null = null): number | null {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizePolygonPoints(points: any): [number, number][] {
  if (!points) return [];
  // If it's a string (textarea), try to parse as JSON
  if (typeof points === "string") {
    try { points = JSON.parse(points); } catch { return []; }
  }
  if (!Array.isArray(points)) return [];
  return points.map((point: any) => {
    if (Array.isArray(point) && point.length >= 2) {
      const lat = Number(point[0]); const lng = Number(point[1]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng] as [number, number];
    }
    if (point && typeof point === "object") {
      const lat = Number(point.lat ?? point.latitude ?? point[0]);
      const lng = Number(point.lng ?? point.longitude ?? point[1]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng] as [number, number];
    }
    return null;
  }).filter(Boolean) as [number, number][];
}

// ─── Safe Zone mapping (matches new CCT fields) ─────────────

function mapSafeZone(z: any, userId: string): any {
  const polygonPoints = normalizePolygonPoints(z.polygon_points);
  return {
    id: String(z._ID || z.id),
    user_id: userId,
    name: z.custom_name || z.name || null,
    zone_type: z.zone_type || "Safe",
    shape_type: z.shape_type || (polygonPoints.length >= 3 ? "Polygon" : "Radius"),
    color: z.custom_color || z.color || null,
    latitude: parseNumber(z.latitude),
    longitude: parseNumber(z.longitude),
    radius_meters: parseNumber(z.radius_meters, 100) ?? 100,
    polygon_points: polygonPoints,
    description: z.custom_description || z.description || null,
    notify_on_enter: z.notify_on_enter === "On" || parseBoolean(z.notify_on_enter, true),
    notify_on_exit: z.notify_on_exit === "On" || parseBoolean(z.notify_on_exit, true),
    schedule_enabled: z.schedule_enabled === "On" || parseBoolean(z.schedule_enabled, false),
    schedule_start_time: z.schedule_start_time || null,
    schedule_end_time: z.schedule_end_time || null,
    is_active: z.is_active === "Yes" || parseBoolean(z.is_active, true),
    created_at: z.cct_created || z.created_at,
    updated_at: z.cct_modified || z.updated_at || z.created_at,
  };
}

// ─── Geo math ────────────────────────────────────────────────

function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isPointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function isZoneActiveNow(zone: any): boolean {
  if (!zone.schedule_enabled) return true;
  const now = new Date();
  if (!zone.schedule_start_time || !zone.schedule_end_time) return true;
  const start = new Date(zone.schedule_start_time);
  const end = new Date(zone.schedule_end_time);
  return now >= start && now <= end;
}

function evaluateZoneAlert(zone: any, lat: number, lng: number): { distance: number; alertType: SafeZoneAlertType } | null {
  if (!zone.is_active || !isZoneActiveNow(zone)) return null;
  let inside = false; let distance = 0;
  const zoneType = String(zone.zone_type).toLowerCase();

  if (String(zone.shape_type).toLowerCase() === "polygon" && zone.polygon_points?.length >= 3) {
    inside = isPointInPolygon(lat, lng, zone.polygon_points);
    if (zone.latitude != null && zone.longitude != null) distance = Math.round(getDistanceMeters(lat, lng, zone.latitude, zone.longitude));
  } else {
    if (zone.latitude == null || zone.longitude == null) return null;
    distance = Math.round(getDistanceMeters(lat, lng, zone.latitude, zone.longitude));
    inside = distance <= (zone.radius_meters || 200);
  }

  if (zoneType === "danger") {
    if (!inside || !zone.notify_on_enter) return null;
    return { distance, alertType: "entered_danger_zone" };
  }
  // Safe zone
  if (inside) return null;
  if (!zone.notify_on_exit) return null;
  return { distance, alertType: "exited_safe_zone" };
}

// ─── Safe Zones CRUD ────────────────────────────────────────

export async function fetchSafeZonesWordPress(userId: string): Promise<any[]> {
  try {
    const zoneIds = await fetchRelationChildIds(REL_USER_SAFE_ZONE, normalizeWpUserId(userId));
    const zones = await Promise.all(
      zoneIds.map(async (zoneId) => {
        try {
          const zone = await wordpressCCTFetch<any>("safe_zone", { id: zoneId });
          return mapSafeZone(zone, userId);
        } catch { return null; }
      }),
    );
    return zones.filter(Boolean);
  } catch { return []; }
}

export async function createSafeZoneWordPress(zone: { user_id: string; name: string; latitude: number; longitude: number; radius_meters?: number; [key: string]: any }): Promise<void> {
  const userId = normalizeWpUserId(zone.user_id);
  if (!userId) throw new Error("Invalid user");
  const created = await wordpressCCTFetch<any>("safe_zone", {
    method: "POST",
    body: {
      zone_type: zone.zone_type || "Safe",
      shape_type: zone.shape_type || "Radius",
      custom_name: zone.name,
      custom_description: zone.description || "",
      custom_color: zone.color || "",
      latitude: String(zone.latitude),
      longitude: String(zone.longitude),
      radius_meters: zone.radius_meters ?? 100,
      polygon_points: zone.polygon_points ? JSON.stringify(zone.polygon_points) : "",
      notify_on_enter: zone.notify_on_enter !== false ? "On" : "Off",
      notify_on_exit: zone.notify_on_exit !== false ? "On" : "Off",
      schedule_enabled: zone.schedule_enabled ? "On" : "Off",
      schedule_start_time: zone.schedule_start_time || "",
      schedule_end_time: zone.schedule_end_time || "",
      is_active: zone.is_active === false ? "No" : "Yes",
    },
  });
  await attachChildToUserRelation(REL_USER_SAFE_ZONE, userId, String(created._ID || created.id));
}

export async function updateSafeZoneWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const body: Record<string, any> = {};
  if (updates.name !== undefined) body.custom_name = updates.name;
  if (updates.zone_type !== undefined) body.zone_type = updates.zone_type;
  if (updates.shape_type !== undefined) body.shape_type = updates.shape_type;
  if (updates.color !== undefined) body.custom_color = updates.color;
  if (updates.latitude !== undefined) body.latitude = String(updates.latitude);
  if (updates.longitude !== undefined) body.longitude = String(updates.longitude);
  if (updates.radius_meters !== undefined) body.radius_meters = updates.radius_meters;
  if (updates.polygon_points !== undefined) body.polygon_points = updates.polygon_points ? JSON.stringify(updates.polygon_points) : "";
  if (updates.description !== undefined) body.custom_description = updates.description;
  if (updates.notify_on_enter !== undefined) body.notify_on_enter = updates.notify_on_enter ? "On" : "Off";
  if (updates.notify_on_exit !== undefined) body.notify_on_exit = updates.notify_on_exit ? "On" : "Off";
  if (updates.schedule_enabled !== undefined) body.schedule_enabled = updates.schedule_enabled ? "On" : "Off";
  if (updates.schedule_start_time !== undefined) body.schedule_start_time = updates.schedule_start_time;
  if (updates.schedule_end_time !== undefined) body.schedule_end_time = updates.schedule_end_time;
  if (updates.is_active !== undefined) body.is_active = updates.is_active ? "Yes" : "No";
  await wordpressCCTFetch("safe_zone", { id, method: "PUT", body });
}

export async function deleteSafeZoneWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("safe_zone", { id, method: "DELETE" });
}

// ─── Safe Zone Alerts ───────────────────────────────────────

export async function fetchSafeZoneAlertsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const alerts = await listWordPressFeature<any[]>("safe_zone_alerts");
    const zones = await fetchSafeZonesWordPress(caredOneId);
    return (alerts || [])
      .filter((a: any) => String(a.user_id || "") === String(caredOneId))
      .map((a: any) => ({
        ...a,
        is_read: parseBoolean(a.is_read, false),
        safe_zone: zones.find((z: any) => String(z.id) === String(a.safe_zone_id)) || null,
        distance_from_center: parseNumber(a.distance_from_center),
      }))
      .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  } catch { return []; }
}

export async function acknowledgeAlertWordPress(alertId: string): Promise<void> {
  await updateWordPressFeature("safe_zone_alerts", { is_read: true, acknowledged_at: new Date().toISOString() }, { endpointArgs: { id: alertId } });
}

export async function acknowledgeAllAlertsWordPress(caredOneId: string): Promise<void> {
  try {
    const alerts = await fetchSafeZoneAlertsWordPress(caredOneId);
    await Promise.all(alerts.filter((a: any) => !a.is_read).map((a: any) => acknowledgeAlertWordPress(String(a.id))));
  } catch {}
}

// ─── Cared One Location (delegates to source.wordpress.ts) ───

export async function fetchCaredOneLocationWordPress(caredOneId: string): Promise<any | null> {
  const snapshot = await fetchCurrentLocation(caredOneId);
  if (!snapshot) return null;
  return {
    id: snapshot.id,
    user_id: caredOneId,
    latitude: snapshot.latitude,
    longitude: snapshot.longitude,
    accuracy_meters: snapshot.accuracy_meters,
    battery_level: snapshot.battery_level,
    address_text: snapshot.address_text,
    is_sharing_enabled: true,
    sharing_enabled: true,
    tracking_enabled: true,
    updated_at: snapshot.captured_at,
    created_at: snapshot.captured_at,
  };
}

export async function fetchCaredOneLocationHistoryWordPress(caredOneId: string): Promise<any[]> {
  const snapshots = await fetchLocationHistory(caredOneId, { limit: 200 });
  return snapshots.map(s => ({
    id: s.id,
    user_id: caredOneId,
    latitude: s.latitude,
    longitude: s.longitude,
    accuracy_meters: s.accuracy_meters,
    address_text: s.address_text,
    battery_level: s.battery_level,
    is_emergency: s.is_emergency === "Yes",
    recorded_at: s.captured_at,
    created_at: s.captured_at,
  }));
}

// ─── Zone Breach Detection ──────────────────────────────────

export async function createSafeZoneAlertsForLocation(userId: string, lat: number, lng: number): Promise<void> {
  try {
    const zones = await fetchSafeZonesWordPress(userId);
    if (!zones.length) return;
    let existingAlerts: any[] = [];
    try { existingAlerts = await listWordPressFeature<any[]>("safe_zone_alerts") || []; } catch {}
    const userAlerts = existingAlerts.filter((a: any) => String(a.user_id || "") === String(userId));
    for (const zone of zones) {
      const result = evaluateZoneAlert(zone, lat, lng);
      if (!result) continue;
      const dup = userAlerts.find((a: any) => String(a.safe_zone_id || "") === String(zone.id) && String(a.alert_type || "") === result.alertType && !parseBoolean(a.is_read, false));
      if (dup) continue;
      const msg = result.alertType === "entered_danger_zone" ? `Entered danger zone: ${zone.name}` : result.alertType === "exited_safe_zone" ? `Left safe zone: ${zone.name}` : `Entered safe zone: ${zone.name}`;
      await createWordPressFeature("safe_zone_alerts", { user_id: userId, safe_zone_id: zone.id, alert_type: result.alertType, latitude: lat, longitude: lng, message: msg });
      try {
        await createNotificationWordPress({
          user_id: userId,
          type: "safe_zone_breach",
          title: result.alertType === "entered_danger_zone" ? "⚠️ Danger Zone Alert" : "📍 Safe Zone Alert",
          message: msg,
          related_id: zone.id,
          related_type: "safe_zone",
        });
      } catch {}
    }
  } catch {}
}

// ─── Share / Disable (now just write or stop writing) ────────

export async function shareMyLocationWordPress(latitude: number, longitude: number, options?: {
  accuracy?: number | null;
  batteryLevel?: number | null;
  addressText?: string | null;
  isEmergency?: boolean;
  enabled?: boolean;
}): Promise<void> {
  const storedUser = getStoredWPUser();
  if (!storedUser?.user_id) throw new Error("Not authenticated");

  const enabled = options?.enabled ?? true;
  if (!enabled) return; // just stop — no row to update

  await writeLocationAndCheckZones(latitude, longitude, {
    accuracy: options?.accuracy,
    battery_level: options?.batteryLevel,
    address_text: options?.addressText,
    isEmergency: options?.isEmergency,
  });
}

export async function disableMyLocationSharingWordPress(): Promise<void> {
  // With append-only architecture, "disabling" sharing means the client
  // simply stops calling writeLocationSnapshot. No server-side toggle needed.
  // The UI state is managed locally.
}

// ─── Location Requests ──────────────────────────────────────

export async function fetchLocationRequestsWordPress(caredOneId: string): Promise<any[]> {
  try {
    const requests = await listWordPressFeature<any[]>("location_requests");
    const storedUser = getStoredWPUser();
    return (requests || [])
      .filter((r: any) => String(r.target_user_id || "") === String(caredOneId) || String(r.requester_id || "") === String(storedUser?.user_id || ""))
      .map((r: any) => ({
        id: String(r.id),
        user_id: String(r.target_user_id || caredOneId),
        requested_by: String(r.requester_id || ""),
        status: r.status || "pending",
        created_at: r.created_at,
        message: r.message || null,
        is_emergency: parseBoolean(r.is_emergency, false),
        expire_at: r.expire_at || null,
      }))
      .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  } catch { return []; }
}

export async function sendLocationRequestWordPress(input: { caredOneId: string; message?: string; isEmergency?: boolean }): Promise<void> {
  const caredOneUserId = normalizeWpUserId(input.caredOneId);
  if (!caredOneUserId) throw new Error("Invalid cared one user");
  const storedUser = getStoredWPUser();
  if (!storedUser?.user_id) throw new Error("Not authenticated");
  await createWordPressFeature("location_requests", {
    requester_id: String(storedUser.user_id),
    target_user_id: String(caredOneUserId),
    message: input.message || undefined,
    is_emergency: input.isEmergency || false,
    status: input.isEmergency ? "emergency_approved" : "pending",
  });
  try {
    await createNotificationWordPress({
      user_id: caredOneUserId,
      type: input.isEmergency ? "emergency_location_request" : "location_request",
      title: input.isEmergency ? "🚨 Emergency Location Request" : "📍 Location Request",
      message: `${storedUser.user_display_name || "Someone"} ${input.isEmergency ? "urgently needs" : "is requesting"} your location.${input.message ? ` "${input.message}"` : ""}`,
      related_id: storedUser.user_id,
      related_type: "user",
    });
  } catch {}
}

export async function cancelLocationRequestWordPress(requestId: string): Promise<void> {
  await deleteWordPressFeature("location_requests", { endpointArgs: { id: requestId } });
}

// ─── Location Settings (simplified — no separate settings CCT) ─

export async function fetchCaredOneLocationSettingsWordPress(caredOneId: string): Promise<any | null> {
  // With the new architecture, there's no separate settings record.
  // Check if the user has any recent location snapshots to determine if sharing is active.
  const latest = await fetchCurrentLocation(caredOneId);
  if (!latest) return null;

  // Consider sharing "active" if last snapshot is within 5 minutes
  const lastTime = latest.captured_at ? new Date(latest.captured_at).getTime() : 0;
  const isRecent = Date.now() - lastTime < 5 * 60 * 1000;

  return {
    id: latest.id,
    user_id: caredOneId,
    tracking_enabled: isRecent,
    is_sharing_enabled: isRecent,
    sharing_enabled: isRecent,
  };
}
