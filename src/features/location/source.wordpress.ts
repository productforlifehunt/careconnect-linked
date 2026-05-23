/**
 * Location Source — Single CCT "current_location" (append-only snapshots)
 *
 * Architecture:
 *   - One JetEngine CCT "The current location of one user" (slug: current_location)
 *   - One JetEngine Relation "One user can have many related current location snapshots"
 *   - Every GPS ping = one new row (append-only, never UPDATE)
 *   - Current position = latest row (ORDER BY captured_at DESC LIMIT 1)
 *   - History/trail   = all rows for user (ORDER BY captured_at ASC)
 *   - No separate location_history or location_sharing table needed
 */

import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";

// ─── JetEngine Relation ID (User → current_location, one-to-many) ────
// This will be set after creating the relation via WordPress admin
const REL_USER_CURRENT_LOCATION = 165;

// ─── CCT slug ────────────────────────────────────────────────
const CCT_SLUG = "current_location";

// ─── Types ───────────────────────────────────────────────────

export interface LocationSnapshot {
  id: string;
  latitude: number | null;
  longitude: number | null;
  accuracy_meters: number | null;
  altitude_meters: number | null;
  heading_degrees: number | null;
  speed: number | null;
  is_moving: string | null;
  moving_type: string | null;
  platform: string | null;
  battery_level: number | null;
  phone_is_charging: string | null;
  address_text: string | null;
  captured_at: string | null;
  is_emergency: string; // "No" | "Yes"
  cct_author_id?: number;
}

// ─── Helpers ─────────────────────────────────────────────────

function parseNum(v: any, fallback: number | null = null): number | null {
  if (v === undefined || v === null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function mapSnapshot(raw: any): LocationSnapshot {
  return {
    id: String(raw._ID || raw.id || ""),
    latitude: parseNum(raw.a55),
    longitude: parseNum(raw.a56),
    accuracy_meters: parseNum(raw.a57),
    altitude_meters: parseNum(raw.a58),
    heading_degrees: parseNum(raw.a59),
    speed: parseNum(raw.a60),
    is_moving: raw.a61 || null,
    moving_type: raw.a62 || null,
    platform: raw.a63 || null,
    battery_level: parseNum(raw.a64),
    phone_is_charging: raw.a65 || null,
    address_text: raw.a66 || null,
    captured_at: raw.a67 || raw.cct_created || null,
    is_emergency: raw.a68 || "b56",
    cct_author_id: raw.cct_author_id ? Number(raw.cct_author_id) : undefined,
  };
}

// ─── WRITE: Append a new location snapshot ───────────────────

export async function writeLocationSnapshot(
  lat: number,
  lng: number,
  opts?: {
    accuracy?: number | null;
    altitude?: number | null;
    heading?: number | null;
    speed?: number | null;
    is_moving?: string;
    moving_type?: string;
    platform?: string;
    battery_level?: number | null;
    phone_is_charging?: string;
    address_text?: string | null;
    is_emergency?: boolean;
  }
): Promise<LocationSnapshot | null> {
  const storedUser = getStoredWPUser();
  if (!storedUser?.user_id) return null;

  const userId = Number(storedUser.user_id);

  // Create a new CCT row (append-only — never update)
  const created = await wordpressCCTFetch<any>(CCT_SLUG, {
    method: "POST",
    body: {
      latitude: String(lat),
      longitude: String(lng),
      accuracy_meters: opts?.accuracy != null ? String(opts.accuracy) : "",
      altitude_meters: opts?.altitude != null ? String(opts.altitude) : "",
      heading_degrees: opts?.heading != null ? String(opts.heading) : "",
      speed: opts?.speed != null ? String(opts.speed) : "",
      is_moving: opts?.is_moving || "",
      moving_type: opts?.moving_type || "",
      platform: opts?.platform || detectPlatform(),
      battery_level: opts?.battery_level != null ? String(opts.battery_level) : "",
      phone_is_charging: opts?.phone_is_charging || "",
      address_text: opts?.address_text || "",
      captured_at: new Date().toISOString(),
      is_emergency: opts?.is_emergency ? "Yes" : "No",
    },
  });

  const newId = String(created._ID || created.id || "");
  if (!newId) return null;

  // Attach to user via JetEngine relation
  try {
    await wordpressFetch(`jet-rel/${REL_USER_CURRENT_LOCATION}`, {
      method: "POST",
      body: {
        parent_id: userId,
        child_id: Number(newId),
        context: "child",
        store_items_type: "update",
      },
    });
  } catch (err) {
    console.warn("[Location] Failed to attach relation:", err);
  }

  return mapSnapshot(created);
}

// ─── READ: Current location (latest snapshot) ────────────────

export async function fetchCurrentLocation(userId: string | number): Promise<LocationSnapshot | null> {
  try {
    const wpUserId = Number(String(userId).replace(/^wp-/, ""));
    if (!wpUserId) return null;

    // Query CCT filtered by author (= tracked user), latest first, limit 1
    const items = await wordpressCCTFetch<any[]>(CCT_SLUG, {
      params: {
        cct_author_id: String(wpUserId),
        _limit: "1",
        _orderby: "cct_created",
        _order: "DESC",
      },
    });

    if (!Array.isArray(items) || items.length === 0) return null;
    return mapSnapshot(items[0]);
  } catch (err) {
    console.warn("[Location] fetchCurrentLocation failed:", err);
    return null;
  }
}

// ─── READ: Location history (all snapshots for trail) ────────

export async function fetchLocationHistory(
  userId: string | number,
  opts?: { limit?: number; since?: string }
): Promise<LocationSnapshot[]> {
  try {
    const wpUserId = Number(String(userId).replace(/^wp-/, ""));
    if (!wpUserId) return [];

    const params: Record<string, string> = {
      cct_author_id: String(wpUserId),
      _limit: String(opts?.limit || 200),
      _orderby: "cct_created",
      _order: "DESC",
    };

    const items = await wordpressCCTFetch<any[]>(CCT_SLUG, { params });

    if (!Array.isArray(items)) return [];

    return items
      .map(mapSnapshot)
      .filter(s => s.latitude != null && s.longitude != null);
  } catch (err) {
    console.warn("[Location] fetchLocationHistory failed:", err);
    return [];
  }
}

// ─── READ: Location shares (for care circle map view) ────────

export async function fetchLocationSharesWordPress(): Promise<any[]> {
  try {
    const storedUser = getStoredWPUser();
    if (!storedUser?.user_id) return [];

    // For now, get care group members and fetch their latest locations
    const { fetchCareGroupsWordPress } = await import("@/features/care-groups/source.wordpress");
    const groups = await fetchCareGroupsWordPress();

    const memberUserIds = new Set<string>();
    for (const group of groups) {
      const members = (group as any).members || [];
      for (const member of members) {
        const memberId = String(member.user_id || member.id || "");
        if (memberId && memberId !== String(storedUser.user_id)) {
          memberUserIds.add(memberId);
        }
      }
    }

    // Also include self
    memberUserIds.add(String(storedUser.user_id));

    const locations = await Promise.all(
      Array.from(memberUserIds).map(async (uid) => {
        try {
          const snapshot = await fetchCurrentLocation(uid);
          if (!snapshot || !snapshot.latitude || !snapshot.longitude) return null;
          return {
            id: snapshot.id,
            user_id: uid,
            latitude: snapshot.latitude,
            longitude: snapshot.longitude,
            accuracy_meters: snapshot.accuracy_meters,
            battery_level: snapshot.battery_level,
            address_text: snapshot.address_text,
            is_sharing_enabled: true,
            user_name: null, // will be enriched by caller
            user_avatar: null,
            updated_at: snapshot.captured_at,
            created_at: snapshot.captured_at,
          };
        } catch {
          return null;
        }
      })
    );

    return locations.filter(Boolean);
  } catch {
    return [];
  }
}

// ─── WRITE: Share + zone check pipeline ──────────────────────

export async function writeLocationAndCheckZones(
  lat: number,
  lng: number,
  opts?: {
    accuracy?: number | null;
    altitude?: number | null;
    heading?: number | null;
    speed?: number | null;
    battery_level?: number | null;
    is_moving?: string;
    moving_type?: string;
    address_text?: string | null;
    isEmergency?: boolean;
  }
): Promise<LocationSnapshot | null> {
  const storedUser = getStoredWPUser();

  // Write location snapshot
  const snapshot = await writeLocationSnapshot(lat, lng, {
    accuracy: opts?.accuracy,
    altitude: opts?.altitude,
    heading: opts?.heading,
    speed: opts?.speed,
    battery_level: opts?.battery_level,
    is_moving: opts?.is_moving,
    moving_type: opts?.moving_type,
    address_text: opts?.address_text,
    is_emergency: opts?.isEmergency,
  });

  // Run zone breach detection
  if (storedUser?.user_id) {
    try {
      const { createSafeZoneAlertsForLocation } = await import(
        "@/features/location/source.wordpress-extended"
      );
      await createSafeZoneAlertsForLocation(String(storedUser.user_id), lat, lng);
    } catch {}
  }

  // Handle SOS emergency — notify care circle
  if (opts?.isEmergency && storedUser?.user_id) {
    try {
      const { createNotificationWordPress } = await import("@/features/notifications/source.wordpress");
      const { fetchCareGroupsWordPress } = await import("@/features/care-groups/source.wordpress");
      const groups = await fetchCareGroupsWordPress();
      const notifiedUserIds = new Set<string>();
      for (const group of groups) {
        for (const member of ((group as any).members || [])) {
          const memberId = String(member.user_id || member.id || "");
          if (memberId && memberId !== String(storedUser.user_id) && !notifiedUserIds.has(memberId)) {
            notifiedUserIds.add(memberId);
            await createNotificationWordPress({
              user_id: memberId,
              type: "sos_emergency",
              title: "🚨 SOS Emergency Alert",
              message: `${storedUser.user_display_name || "A care circle member"} triggered an SOS emergency alert.`,
              action_url: `/gps-tracking?sos=${storedUser.user_id}`,
            });
          }
        }
      }
    } catch {}
  }

  return snapshot;
}

// ─── Helpers ─────────────────────────────────────────────────

function detectPlatform(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("android")) return "android";
  if (ua.includes("iphone") || ua.includes("ipad")) return "ios";
  return "web";
}
