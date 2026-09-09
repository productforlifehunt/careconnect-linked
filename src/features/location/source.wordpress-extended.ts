/**
 * Location Extended — Safe Zones, Alerts, Requests, Location Settings
 *
 * Safe Zone CCT: "Safe Zone" (slug: safe_zone)
 * Safe Zone Relation: "One user can have many related safe zones" (one-to-many)
 *
 * Location uses the new single-CCT architecture from source.wordpress.ts
 */

import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { fetchMyAppUserName } from "@/features/profile/app-user-name";
import { getStoredWPUser } from "@/services/wp-auth";
import { T, R } from "@/integrations/wp-schema";
import {
} from "@/features/notifications/source.wordpress";
import { fetchCurrentLocation, fetchLocationHistory, writeLocationAndCheckZones } from "@/features/location/source.wordpress";
import {
  ZONE_TYPE,
  ZONE_TYPE_CODES,
  zoneTypeLabel,
  isCustomZone,
  isDangerZone,
  isSafeZone,
  zoneNameFor,
} from "@/features/location/zone-types";


// NOTE: There is no `safe_zone_alerts` or `location_requests` CCT in the live
// WordPress backend. Alerts are delivered exclusively via the `notification`
// CCT. Location requests are sent as notifications to the target user; the
// frontend keeps a local in-memory cache of recent emergency dedup keys.
const ALERT_DEDUP_KEY = (userId: string, zoneId: string, type: string) =>
  `cc_zone_alert:${userId}:${zoneId}:${type}`;
const ALERT_DEDUP_WINDOW_MS = 5 * 60 * 1000;


// ─── Relation IDs ────────────────────────────────────────────
const REL_USER_SAFE_ZONE = R.userSafeZones;
// Dictionary Relation 290: "One cared one's location notification can have many
// added related receivers" — Users -> Users. Receivers are configured per cared
// one (not per zone), so every zone of that user alerts the same receivers.
const REL_LOCATION_RECEIVER = R.caredOneLocationReceivers;

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

/** Users who receive this cared one's location alerts (JetEngine Relation 290). */
export async function fetchLocationReceiverIds(userId: string): Promise<string[]> {
  return fetchRelationChildIds(REL_LOCATION_RECEIVER, normalizeWpUserId(userId));
}

/** Replace the cared one's location-alert receiver list (Relation 290 only). */
export async function setLocationReceivers(userId: string, receiverIds: Array<string | number>): Promise<void> {
  const parentId = normalizeWpUserId(userId);
  if (!parentId) throw new Error("Invalid user for location alert receivers");
  const ids = (receiverIds || []).map((v) => normalizeWpUserId(v as any)).filter(Boolean);
  const body = {
    parent_id: parentId,
    child_id: ids.map(Number),
    context: "parent",
    store_items_type: "replace",
  };
  try {
    await wordpressFetch(`jet-rel/${REL_LOCATION_RECEIVER}`, { method: "POST", body });
  } catch (err: any) {
    // Subscriber roles cannot always write user-to-user relations (401/403), so
    // the privileged proxy performs the identical relation write.
    if (!/40[13]/.test(String(err?.message || ""))) throw err;
    const { wpAdminOps } = await import("@/services/woocommerce-api");
    const res: any = await wpAdminOps("set_relation", {
      relation_id: Number(REL_LOCATION_RECEIVER),
      parent_id: body.parent_id,
      child_ids: body.child_id,
      context: "parent",
      store_items_type: "replace",
    });
    if (!res?.ok) throw new Error(res?.error || "Could not save alert receivers");
  }
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

// ─── Safe Zone mapping (dictionary CCT 214) ─────────────────
//
// a55 zone type: b55 Safe, b56 Danger, b57 Custom.
// a57 zone name: "Safe" / "Danger" for the fixed types, the user's own name for
// a custom zone. a58 "Custom description" carries the zone's note only.
function mapSafeZone(z: any, userId: string): any {
  const polygonPoints = normalizePolygonPoints(z.a63);
  const typeCode = String(z.a55 || ZONE_TYPE.SAFE);
  const zoneName = typeof z.a57 === "string" ? z.a57 : "";
  return {
    id: String(z._ID || z.id),
    user_id: userId,
    zone_type: typeCode,
    zone_name: zoneName,
    zone_type_label: zoneTypeLabel(typeCode, zoneName, false),
    zone_type_label_zh: zoneTypeLabel(typeCode, zoneName, true),
    is_custom: isCustomZone(typeCode),
    is_danger: isDangerZone(typeCode),
    is_safe: isSafeZone(typeCode),

    shape_type: z.a56 === T.safeZone.opt.SHAPE_TYPE.POLYGON ? "Polygon" : (polygonPoints.length >= 3 ? "Polygon" : "Radius"),
    color: z.a59 || null,
    latitude: parseNumber(z.a60),
    longitude: parseNumber(z.a61),
    radius_meters: parseNumber(z.a62, 100) ?? 100,
    polygon_points: polygonPoints,
    description: typeof z.a58 === "string" && z.a58 ? z.a58 : null,
    notify_on_enter: z.a64 === T.safeZone.opt.NOTIFY_ON_ENTER.ON,
    notify_on_exit: z.a65 === T.safeZone.opt.NOTIFY_ON_EXIT.ON,
    schedule_enabled: z.a66 === T.safeZone.opt.SCHEDULE_ENABLED.ON,
    schedule_start_time: z.a67 || null,
    schedule_end_time: z.a68 || null,
    is_active: z.a69 !== T.safeZone.opt.IS_ACTIVE.NO,
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

  if (String(zone.shape_type).toLowerCase() === "polygon" && zone.polygon_points?.length >= 3) {
    inside = isPointInPolygon(lat, lng, zone.polygon_points);
    if (zone.latitude != null && zone.longitude != null) distance = Math.round(getDistanceMeters(lat, lng, zone.latitude, zone.longitude));
  } else {
    if (zone.latitude == null || zone.longitude == null) return null;
    distance = Math.round(getDistanceMeters(lat, lng, zone.latitude, zone.longitude));
    inside = distance <= (zone.radius_meters || 100);
  }

  if (zone.is_danger) {
    if (!inside || !zone.notify_on_enter) return null;
    return { distance, alertType: "entered_danger_zone" };
  }
  if (zone.is_safe) {
    if (inside) return null;
    if (!zone.notify_on_exit) return null;
    return { distance, alertType: "exited_safe_zone" };
  }
  // Custom zone type (b57) has no safe/danger semantics — it alerts on
  // whichever transition the zone itself enabled.
  if (inside) {
    if (!zone.notify_on_enter) return null;
    return { distance, alertType: "entered_safe_zone" };
  }
  if (!zone.notify_on_exit) return null;
  return { distance, alertType: "exited_safe_zone" };
}

// ─── Safe Zones CRUD ────────────────────────────────────────

export async function fetchSafeZonesWordPress(userId: string): Promise<any[]> {
  const [zoneIds, receiverIds] = await Promise.all([
    fetchRelationChildIds(REL_USER_SAFE_ZONE, normalizeWpUserId(userId)),
    fetchLocationReceiverIds(userId),
  ]);
  const zones = await Promise.all(
    zoneIds.map(async (zoneId) => {
      const zone = await wordpressCCTFetch<any>(T.safeZone.slug, { id: zoneId });
      // A relation can outlive its row (zone deleted elsewhere): JetEngine then
      // answers `false`/an empty body. Those ghosts must never reach the UI.
      if (!zone || typeof zone !== "object" || Array.isArray(zone)) return null;
      const mapped = mapSafeZone(zone, userId);
      if (!mapped.id || mapped.id === "undefined" || mapped.id === "null") return null;
      // Receivers live on the cared one (Relation 290), shared by all zones.
      return { ...mapped, receiver_ids: receiverIds };
    }),
  );

  return zones.filter(Boolean);
}

/** Zone-type code (a55). Accepts only the three dictionary codes. */
function requireZoneTypeCode(value: any): string {
  const code = String(value || ZONE_TYPE.SAFE);
  if (!(ZONE_TYPE_CODES as readonly string[]).includes(code)) {
    throw new Error(`Unknown zone type "${code}" — CCT 214 a55 accepts b55/b56/b57 only`);
  }
  return code;
}

export async function createSafeZoneWordPress(zone: { user_id: string; latitude: number; longitude: number; radius_meters?: number; [key: string]: any }): Promise<void> {
  const userId = normalizeWpUserId(zone.user_id);
  if (!userId) throw new Error("Invalid user");
  const typeCode = requireZoneTypeCode(zone.zone_type);
  const created = await wordpressCCTFetch<any>(T.safeZone.slug, {
    method: "POST",
    body: {
      a55: typeCode,
      a56: String(zone.shape_type || "Radius").toLowerCase() === "polygon" ? T.safeZone.opt.SHAPE_TYPE.POLYGON : T.safeZone.opt.SHAPE_TYPE.RADIUS,
      a57: zoneNameFor(typeCode, zone.zone_name),
      a58: zone.description || "",

      a59: zone.color || "",
      a60: String(zone.latitude),
      a61: String(zone.longitude),
      a62: String(zone.radius_meters ?? 100),
      a63: zone.polygon_points ? JSON.stringify(zone.polygon_points) : "",
      a64: zone.notify_on_enter !== false ? T.safeZone.opt.NOTIFY_ON_ENTER.ON : T.safeZone.opt.NOTIFY_ON_ENTER.OFF,
      a65: zone.notify_on_exit !== false ? T.safeZone.opt.NOTIFY_ON_EXIT.ON : T.safeZone.opt.NOTIFY_ON_EXIT.OFF,
      a66: zone.schedule_enabled ? T.safeZone.opt.SCHEDULE_ENABLED.ON : T.safeZone.opt.SCHEDULE_ENABLED.OFF,
      a67: zone.schedule_start_time || "",
      a68: zone.schedule_end_time || "",
      a69: zone.is_active === false ? T.safeZone.opt.IS_ACTIVE.NO : T.safeZone.opt.IS_ACTIVE.YES,
    },
  });
  const zoneId = String(created._ID || created.id);
  await attachChildToUserRelation(REL_USER_SAFE_ZONE, userId, zoneId);
  if (Array.isArray(zone.receiver_ids)) {
    await setLocationReceivers(zone.user_id, zone.receiver_ids);
  }
}

export async function updateSafeZoneWordPress(id: string, updates: Record<string, any>): Promise<void> {
  const body: Record<string, any> = {};
  if (updates.description !== undefined) body.a58 = updates.description || "";
  if (updates.zone_type !== undefined) {
    const typeCode = requireZoneTypeCode(updates.zone_type);
    body.a55 = typeCode;
    // a57 always follows the type: fixed label for Safe/Danger, user name for Custom.
    body.a57 = zoneNameFor(typeCode, updates.zone_name);
  } else if (updates.zone_name !== undefined) {
    body.a57 = String(updates.zone_name || "").trim();
    if (!body.a57) throw new Error("A custom zone requires a name");
  }

  if (updates.shape_type !== undefined) body.a56 = String(updates.shape_type).toLowerCase() === "polygon" ? T.safeZone.opt.SHAPE_TYPE.POLYGON : T.safeZone.opt.SHAPE_TYPE.RADIUS;
  if (updates.color !== undefined) body.a59 = updates.color;
  if (updates.latitude !== undefined) body.a60 = String(updates.latitude);
  if (updates.longitude !== undefined) body.a61 = String(updates.longitude);
  // JetEngine's CCT REST schema types every column as string — a raw number is
  // rejected with rest_invalid_param, so always coerce.
  if (updates.radius_meters !== undefined) body.a62 = String(updates.radius_meters);

  if (updates.polygon_points !== undefined) body.a63 = updates.polygon_points ? JSON.stringify(updates.polygon_points) : "";
  if (updates.notify_on_enter !== undefined) body.a64 = updates.notify_on_enter ? T.safeZone.opt.NOTIFY_ON_ENTER.ON : T.safeZone.opt.NOTIFY_ON_ENTER.OFF;
  if (updates.notify_on_exit !== undefined) body.a65 = updates.notify_on_exit ? T.safeZone.opt.NOTIFY_ON_EXIT.ON : T.safeZone.opt.NOTIFY_ON_EXIT.OFF;
  if (updates.schedule_enabled !== undefined) body.a66 = updates.schedule_enabled ? T.safeZone.opt.SCHEDULE_ENABLED.ON : T.safeZone.opt.SCHEDULE_ENABLED.OFF;
  if (updates.schedule_start_time !== undefined) body.a67 = updates.schedule_start_time;
  if (updates.schedule_end_time !== undefined) body.a68 = updates.schedule_end_time;
  if (updates.is_active !== undefined) body.a69 = updates.is_active ? T.safeZone.opt.IS_ACTIVE.YES : T.safeZone.opt.IS_ACTIVE.NO;
  await wordpressCCTFetch(T.safeZone.slug, { id, method: "PUT", body });
  if (updates.receiver_ids !== undefined) {
    if (!updates.user_id) throw new Error("Cannot save location alert receivers without the cared one's user id");
    await setLocationReceivers(String(updates.user_id), updates.receiver_ids || []);
  }
}



export async function deleteSafeZoneWordPress(id: string): Promise<void> {
  await wordpressCCTFetch(T.safeZone.slug, { id, method: "DELETE" });
}

// ─── Safe Zone Alerts ───────────────────────────────────────
//
// No `safe_zone_alerts` CCT exists. Alerts live in the `notification` CCT with
// the LOCATION_ALERT radio code, so the GPS "Alerts" tab reads that inbox and
// filters it down to location events instead of showing an empty list.

export async function fetchSafeZoneAlertsWordPress(_caredOneId: string): Promise<any[]> {
  const all = await runNotificationSkill("list-notifications");
  return all
      .filter((n: any) => n.type === "location")
      .map((n: any) => ({
        id: n.id,
        alert_type: /danger|危险/i.test(`${n.title} ${n.message}`) ? "entered_danger_zone" : "safe_zone",
        message: n.message || n.title,
        is_read: n.is_read,
        created_at: n.created_at,
    }));
}

export async function acknowledgeAlertWordPress(alertId: string): Promise<void> {
  // Alerts are notification rows — acknowledging one marks it read.
  await runNotificationSkill("mark-notification-read", { id: alertId });
}

export async function acknowledgeAllAlertsWordPress(_caredOneId: string): Promise<void> {
  await runNotificationSkill("mark-all-notifications-read");
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
// Dedup uses sessionStorage instead of an alerts CCT (no such CCT live).

export async function createSafeZoneAlertsForLocation(userId: string, lat: number, lng: number): Promise<void> {
  const zones = await fetchSafeZonesWordPress(userId);
  if (!zones.length) return;
  {
    const now = Date.now();
    for (const zone of zones) {
      const result = evaluateZoneAlert(zone, lat, lng);
      if (!result) continue;
      // Local dedup window
      try {
        const key = ALERT_DEDUP_KEY(userId, String(zone.id), result.alertType);
        const last = Number(sessionStorage.getItem(key) || 0);
        if (last && now - last < ALERT_DEDUP_WINDOW_MS) continue;
        sessionStorage.setItem(key, String(now));
      } catch { /* sessionStorage unavailable in SSR */ }

      const msg =
        result.alertType === "entered_danger_zone" ? `Entered danger zone: ${zone.zone_type_label}` :
        result.alertType === "exited_safe_zone"   ? `Left zone: ${zone.zone_type_label}` :
                                                    `Entered zone: ${zone.zone_type_label}`;

      {
        await createNotificationWordPress({
          user_id: userId,
          type: "safe_zone_breach",
          title: result.alertType === "entered_danger_zone" ? "⚠️ Danger Zone Alert" : "📍 Safe Zone Alert",
          message: msg,
          action_url: `/find?zone=${zone.id}`,
        });
        // Fan out to the cared one's configured receivers (Relation 290).
        const receivers: string[] = Array.isArray(zone.receiver_ids)
          ? zone.receiver_ids
          : await fetchLocationReceiverIds(userId);
        await Promise.all(
          receivers
            .filter((rid) => normalizeWpUserId(rid) !== normalizeWpUserId(userId))
            .map((rid) => createNotificationWordPress({
              user_id: rid,
              type: "safe_zone_breach",
              title: result.alertType === "entered_danger_zone" ? "⚠️ Danger Zone Alert" : "📍 Safe Zone Alert",
              message: msg,
              action_url: `/find?zone=${zone.id}`,
            })),
        );
      }
    }
  }
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
}

// ─── Location Requests ──────────────────────────────────────
// No `location_requests` CCT live. Requests are pure notifications: the
// requester pings the target user, who responds by enabling location sharing.

export async function fetchLocationRequestsWordPress(_caredOneId: string): Promise<any[]> {
  return [];
}

export async function sendLocationRequestWordPress(input: { caredOneId: string; message?: string; isEmergency?: boolean }): Promise<void> {
  const caredOneUserId = normalizeWpUserId(input.caredOneId);
  if (!caredOneUserId) throw new Error("Invalid cared one user");
  const storedUser = getStoredWPUser();
  if (!storedUser?.user_id) throw new Error("Not authenticated");
  {
    // Name comes ONLY from CCT 151; no WordPress account name fallback.
    const askerName = await fetchMyAppUserName().catch(() => "");
    await createNotificationWordPress({
      user_id: caredOneUserId,
      type: input.isEmergency ? "emergency_location_request" : "location_request",
      title: input.isEmergency ? "🚨 Emergency Location Request" : "📍 Location Request",
      message: `${askerName || "A care circle member"} ${input.isEmergency ? "urgently needs" : "is requesting"} your location.${input.message ? ` "${input.message}"` : ""}`,
      action_url: `/find?request_from=${storedUser.user_id}`,
    });
  }
}

export async function cancelLocationRequestWordPress(_requestId: string): Promise<void> {
  // No-op — requests are notifications; the recipient marks them read.
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
