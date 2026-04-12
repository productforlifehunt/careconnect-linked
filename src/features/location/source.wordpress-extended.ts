import { createWordPressFeature, deleteWordPressFeature, listWordPressFeature, updateWordPressFeature } from "@/features/shared/wordpress-adapter";
import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";
import { createNotificationWordPress } from "@/features/notifications/source.wordpress";

const REL_USER_SAFE_ZONE = 90;
const REL_USER_LOCATION_SHARING = 91;

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

function mapSafeZone(z: any, userId: string): any {
  const polygonPoints = normalizePolygonPoints(z.polygon_points);
  return {
    id: String(z.id),
    user_id: userId,
    name: z.name || z.title || null,
    zone_type: z.zone_type || "safe",
    shape_type: z.shape_type || (polygonPoints.length >= 3 ? "polygon" : "radius"),
    category: z.category || "custom",
    color: z.color || null,
    latitude: parseNumber(z.latitude),
    longitude: parseNumber(z.longitude),
    radius_meters: parseNumber(z.radius_meters, 100) ?? 100,
    polygon_points: polygonPoints,
    description: z.description || null,
    notify_on_enter: parseBoolean(z.notify_on_enter, true),
    notify_on_exit: parseBoolean(z.notify_on_exit, true),
    schedule_enabled: parseBoolean(z.schedule_enabled, false),
    schedule_start_time: z.schedule_start_time || null,
    schedule_end_time: z.schedule_end_time || null,
    schedule_days: Array.isArray(z.schedule_days) ? z.schedule_days : [],
    is_active: parseBoolean(z.is_active, true),
    created_by: z.created_by ? String(z.created_by) : null,
    created_at: z.created_at,
    updated_at: z.updated_at || z.created_at,
  };
}

function mapLocationItem(item: any, userId: string): any {
  return {
    id: String(item.id),
    user_id: userId,
    latitude: parseNumber(item.last_latitude) ?? parseNumber(item.latitude),
    longitude: parseNumber(item.last_longitude) ?? parseNumber(item.longitude),
    accuracy_meters: parseNumber(item.accuracy_meters),
    battery_level: parseNumber(item.battery_level),
    address_text: item.address_text || null,
    is_sharing_enabled: parseBoolean(item.is_sharing_enabled, parseBoolean(item.is_active, true)),
    sharing_enabled: parseBoolean(item.is_sharing_enabled, parseBoolean(item.is_active, true)),
    tracking_enabled: parseBoolean(item.tracking_enabled, parseBoolean(item.is_active, true)),
    updated_at: item.last_updated_at || item.updated_at || item.created_at,
    created_at: item.created_at,
    update_interval_seconds: parseNumber(item.update_interval_seconds, 300) ?? 300,
  };
}

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
  const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now.getDay()];
  if (!zone.schedule_days?.includes(dayName)) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  if (!zone.schedule_start_time || !zone.schedule_end_time) return true;
  const [sh, sm] = String(zone.schedule_start_time).split(":").map(Number);
  const [eh, em] = String(zone.schedule_end_time).split(":").map(Number);
  const s = sh * 60 + sm; const e = eh * 60 + em;
  return s <= e ? cur >= s && cur <= e : cur >= s || cur <= e;
}

function evaluateZoneAlert(zone: any, lat: number, lng: number): { distance: number; alertType: SafeZoneAlertType } | null {
  if (!zone.is_active || !isZoneActiveNow(zone)) return null;
  let inside = false; let distance = 0;
  if (zone.shape_type === "polygon" && zone.polygon_points?.length >= 3) {
    inside = isPointInPolygon(lat, lng, zone.polygon_points);
    if (zone.latitude != null && zone.longitude != null) distance = Math.round(getDistanceMeters(lat, lng, zone.latitude, zone.longitude));
  } else {
    if (zone.latitude == null || zone.longitude == null) return null;
    distance = Math.round(getDistanceMeters(lat, lng, zone.latitude, zone.longitude));
    inside = distance <= (zone.radius_meters || 200);
  }
  if (zone.zone_type === "danger") {
    if (!inside || !zone.notify_on_enter) return null;
    return { distance, alertType: "entered_danger_zone" };
  }
  if (inside) return null;
  if (!zone.notify_on_exit) return null;
  return { distance, alertType: "exited_safe_zone" };
}

// ─── Safe Zones ─────────────────────────────────────────────
export async function fetchSafeZonesWordPress(userId: string): Promise<any[]> {
  try {
    const zoneIds = await fetchRelationChildIds(REL_USER_SAFE_ZONE, normalizeWpUserId(userId));
    const zones = await Promise.all(
      zoneIds.map(async (zoneId) => {
        try {
          const zone = await wordpressCCTFetch<any>("safe_zone", { id: zoneId });
          return mapSafeZone(zone, userId);
        } catch {
          return null;
        }
      }),
    );
    return zones.filter(Boolean);
  } catch { return []; }
}

export async function createSafeZoneWordPress(zone: { user_id: string; name: string; latitude: number; longitude: number; radius_meters?: number; [key: string]: any }): Promise<void> {
  const userId = normalizeWpUserId(zone.user_id);
  if (!userId) throw new Error("Invalid user");
  const storedUser = getStoredWPUser();
  const created = await wordpressCCTFetch<any>("safe_zone", {
    method: "POST",
    body: {
      name: zone.name,
      zone_type: zone.zone_type || "safe",
      shape_type: zone.shape_type || "radius",
      category: zone.category || "custom",
      color: zone.color || null,
      latitude: String(zone.latitude),
      longitude: String(zone.longitude),
      radius_meters: zone.radius_meters ?? 100,
      polygon_points: zone.polygon_points || [],
      description: zone.description || null,
      notify_on_enter: zone.notify_on_enter !== false ? "yes" : "no",
      notify_on_exit: zone.notify_on_exit !== false ? "yes" : "no",
      schedule_enabled: zone.schedule_enabled ? "yes" : "no",
      schedule_start_time: zone.schedule_start_time || null,
      schedule_end_time: zone.schedule_end_time || null,
      schedule_days: zone.schedule_days || [],
      is_active: zone.is_active === false ? "no" : "yes",
      created_by: storedUser?.user_id || userId,
    },
  });
  await attachChildToUserRelation(REL_USER_SAFE_ZONE, userId, String(created.id || created._ID));
}

export async function updateSafeZoneWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const body: Record<string, any> = {};
  if (updates.name !== undefined) body.name = updates.name;
  if (updates.zone_type !== undefined) body.zone_type = updates.zone_type;
  if (updates.shape_type !== undefined) body.shape_type = updates.shape_type;
  if (updates.category !== undefined) body.category = updates.category;
  if (updates.color !== undefined) body.color = updates.color;
  if (updates.latitude !== undefined) body.latitude = String(updates.latitude);
  if (updates.longitude !== undefined) body.longitude = String(updates.longitude);
  if (updates.radius_meters !== undefined) body.radius_meters = updates.radius_meters;
  if (updates.polygon_points !== undefined) body.polygon_points = updates.polygon_points || [];
  if (updates.description !== undefined) body.description = updates.description;
  if (updates.notify_on_enter !== undefined) body.notify_on_enter = updates.notify_on_enter ? "yes" : "no";
  if (updates.notify_on_exit !== undefined) body.notify_on_exit = updates.notify_on_exit ? "yes" : "no";
  if (updates.schedule_enabled !== undefined) body.schedule_enabled = updates.schedule_enabled ? "yes" : "no";
  if (updates.schedule_start_time !== undefined) body.schedule_start_time = updates.schedule_start_time;
  if (updates.schedule_end_time !== undefined) body.schedule_end_time = updates.schedule_end_time;
  if (updates.schedule_days !== undefined) body.schedule_days = updates.schedule_days || [];
  if (updates.is_active !== undefined) body.is_active = updates.is_active ? "yes" : "no";
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

// ─── Cared One Location ─────────────────────────────────────
export async function fetchCaredOneLocationWordPress(caredOneId: string): Promise<any | null> {
  try {
    const userId = normalizeWpUserId(caredOneId);
    if (!userId) return null;
    const itemIds = await fetchRelationChildIds(REL_USER_LOCATION_SHARING, userId);
    if (itemIds.length === 0) return null;
    const item = await wordpressCCTFetch<any>("location_sharing", { id: itemIds[0] });
    return mapLocationItem(item, caredOneId);
  } catch { return null; }
}

export async function fetchCaredOneLocationHistoryWordPress(caredOneId: string): Promise<any[]> {
  try {
    const history = await listWordPressFeature<any[]>("location_history");
    return (history || [])
      .filter((item: any) => String(item.user_id || "") === String(caredOneId))
      .map((item: any) => ({
        id: String(item.id),
        user_id: String(item.user_id),
        latitude: parseNumber(item.latitude),
        longitude: parseNumber(item.longitude),
        accuracy_meters: parseNumber(item.accuracy_meters),
        address_text: item.address_text || null,
        battery_level: parseNumber(item.battery_level),
        is_emergency: parseBoolean(item.is_emergency, false),
        recorded_at: item.captured_at || item.created_at,
        created_at: item.created_at,
      }))
      .sort((a: any, b: any) => new Date(b.recorded_at || 0).getTime() - new Date(a.recorded_at || 0).getTime());
  } catch { return []; }
}

async function ensureLocationSharingRecord(userId: number): Promise<string> {
  const existingIds = await fetchRelationChildIds(REL_USER_LOCATION_SHARING, userId);
  if (existingIds.length > 0) return existingIds[0];
  const created = await wordpressCCTFetch<any>("location_sharing", {
    method: "POST",
    body: { is_active: "yes", is_sharing_enabled: "yes", tracking_enabled: "yes", update_interval_seconds: 300 },
  });
  const id = String(created.id || created._ID);
  await attachChildToUserRelation(REL_USER_LOCATION_SHARING, userId, id);
  return id;
}

async function createSafeZoneAlertsForLocation(userId: string, lat: number, lng: number): Promise<void> {
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
      // Create in-app notification for the zone breach
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

// ─── Share My Location ──────────────────────────────────────
export async function shareMyLocationWordPress(latitude: number, longitude: number, options?: { accuracy?: number | null; batteryLevel?: number | null; addressText?: string | null; isEmergency?: boolean; enabled?: boolean }): Promise<void> {
  const storedUser = getStoredWPUser();
  if (!storedUser?.user_id) throw new Error("Not authenticated");
  const userId = Number(storedUser.user_id);
  const sharingId = await ensureLocationSharingRecord(userId);
  const enabled = options?.enabled ?? true;
  await wordpressCCTFetch("location_sharing", {
    id: sharingId,
    method: "PUT",
    body: {
      last_latitude: String(latitude),
      last_longitude: String(longitude),
      accuracy_meters: options?.accuracy ?? null,
      battery_level: options?.batteryLevel ?? null,
      address_text: options?.addressText ?? null,
      last_updated_at: Math.floor(Date.now() / 1000),
      is_active: enabled ? "yes" : "no",
      is_sharing_enabled: enabled ? "yes" : "no",
      tracking_enabled: enabled ? "yes" : "no",
    },
  });
  if (!enabled) return;
  try {
    await createWordPressFeature("location_history", {
      user_id: String(storedUser.user_id),
      latitude, longitude,
      accuracy_meters: options?.accuracy ?? undefined,
      address_text: options?.addressText ?? undefined,
      battery_level: options?.batteryLevel ?? undefined,
      is_emergency: options?.isEmergency || false,
    });
  } catch {}
  // If emergency SOS, create notification for the user's care circle
  if (options?.isEmergency) {
    try {
      // Notify all care group members via care_group relations
      const { fetchCareGroupsWordPress } = await import("@/features/care-groups/source.wordpress");
      const groups = await fetchCareGroupsWordPress();
      const notifiedUserIds = new Set<string>();
      for (const group of groups) {
        const members = (group as any).members || [];
        for (const member of members) {
          const memberId = String(member.user_id || member.id || "");
          if (memberId && memberId !== String(storedUser.user_id) && !notifiedUserIds.has(memberId)) {
            notifiedUserIds.add(memberId);
            await createNotificationWordPress({
              user_id: memberId,
              type: "sos_emergency",
              title: "🚨 SOS Emergency Alert",
              message: `${storedUser.user_display_name || "A care circle member"} triggered an SOS emergency alert. Location shared.`,
              related_id: storedUser.user_id,
              related_type: "user",
            });
          }
        }
      }
    } catch {}
  }
  await createSafeZoneAlertsForLocation(String(storedUser.user_id), latitude, longitude);
}

export async function disableMyLocationSharingWordPress(): Promise<void> {
  const storedUser = getStoredWPUser();
  if (!storedUser?.user_id) throw new Error("Not authenticated");
  const sharingId = await ensureLocationSharingRecord(Number(storedUser.user_id));
  await wordpressCCTFetch("location_sharing", {
    id: sharingId,
    method: "PUT",
    body: { is_active: "no", is_sharing_enabled: "no", tracking_enabled: "no", last_updated_at: Math.floor(Date.now() / 1000) },
  });
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
}

export async function cancelLocationRequestWordPress(requestId: string): Promise<void> {
  await deleteWordPressFeature("location_requests", { endpointArgs: { id: requestId } });
}

// ─── Cared One Location Settings ────────────────────────────
export async function fetchCaredOneLocationSettingsWordPress(caredOneId: string): Promise<any | null> {
  try {
    const userId = normalizeWpUserId(caredOneId);
    if (!userId) return null;
    const itemIds = await fetchRelationChildIds(REL_USER_LOCATION_SHARING, userId);
    if (itemIds.length === 0) return null;
    const item = await wordpressCCTFetch<any>("location_sharing", { id: itemIds[0] });
    const mapped = mapLocationItem(item, caredOneId);
    return {
      id: mapped.id,
      user_id: mapped.user_id,
      tracking_enabled: mapped.tracking_enabled,
      is_sharing_enabled: mapped.is_sharing_enabled,
      sharing_enabled: mapped.sharing_enabled,
      update_interval_seconds: mapped.update_interval_seconds,
    };
  } catch { return null; }
}
