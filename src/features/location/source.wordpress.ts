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
import { fetchMyAppUserName } from "@/features/profile/app-user-name";
import { getStoredWPUser } from "@/services/wp-auth";
import { T, R } from "@/integrations/wp-schema";

// ─── JetEngine Relation ID (User → current_location, one-to-many) ────
// Dictionary name "117. current location snapshots" — live ID 165 (old 117 was deleted & recreated).
const REL_USER_CURRENT_LOCATION = R.userCurrentLocations;

// ─── CCT slug ────────────────────────────────────────────────
const CCT_SLUG = T.currentLocation.slug;
const F = T.currentLocation.f;
const O = T.currentLocation.opt;

// ─── Types ───────────────────────────────────────────────────

export interface LocationSnapshot {
  id: string;
  latitude: number | null;
  longitude: number | null;
  accuracy_meters: number | null;
  altitude_meters: number | null;
  heading_degrees: number | null;
  speed: number | null;
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

function parseNum(v: any): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`Invalid numeric location value: ${v}`);
  return n;
}

/** Dictionary codes → plain words the UI can show. */
const MOVING_LABEL: Record<string, string> = {
  [O.MOVING_TYPE.STATIONARY]: "stationary",
  [O.MOVING_TYPE.WALKING]: "walking",
  [O.MOVING_TYPE.RUNNING]: "running",
  [O.MOVING_TYPE.CYCLING]: "cycling",
  [O.MOVING_TYPE.AUTOMOTIVE]: "automotive",
  [O.MOVING_TYPE.UNKNOWN]: "unknown",
};
const PLATFORM_LABEL: Record<string, string> = {
  [O.PLATFORM.IOS]: "iOS",
  [O.PLATFORM.ANDROID]: "Android",
  [O.PLATFORM.WEB]: "Web",
};
const YES_NO_LABEL: Record<string, string> = {
  [O.PHONE_IS_CHARING.YES]: "Yes",
  [O.PHONE_IS_CHARING.NO]: "No",
};

function mapSnapshot(raw: any): LocationSnapshot {
  const movingCode = raw[F.MOVING_TYPE] || null;
  const platformCode = raw[F.PLATFORM] || null;
  const chargingCode = raw[F.PHONE_IS_CHARING] || null;
  const emergencyCode = raw[F.IS_SO_MUCH_OF_AN_EMERGENCY_THAT_WE_DON_T_BOTHER_TO_ASK_FOR_THE_CARED_ONE_S_PERMISSION] || null;
  return {
    id: String(raw._ID || raw.id || ""),
    latitude: parseNum(raw[F.LATITUDE]),
    longitude: parseNum(raw[F.LONGITUDE]),
    accuracy_meters: parseNum(raw[F.ACCURACY_METERS]),
    altitude_meters: parseNum(raw[F.ALTITUDE_METERS]),
    heading_degrees: parseNum(raw[F.HEADING_DEGREES]),
    speed: parseNum(raw[F.SPEED]),
    moving_type: movingCode ? MOVING_LABEL[movingCode] ?? null : null,
    // a62 "stationary" is the only stillness signal — the old a61 "Is moving" is retired.
    is_stationary: movingCode ? movingCode === O.MOVING_TYPE.STATIONARY : null,
    platform: platformCode ? PLATFORM_LABEL[platformCode] ?? null : null,
    battery_level: parseNum(raw[F.BATTERY_LEVEL]),
    phone_is_charging: chargingCode ? YES_NO_LABEL[chargingCode] ?? null : null,
    address_text: raw[F.ADDRESS_TEXT] || null,
    captured_at: raw[F.CAPTURED_AT] || null,
    is_emergency: emergencyCode === O.IS_SO_MUCH_OF_AN_EMERGENCY_THAT_WE_DON_T_BOTHER_TO_ASK_FOR_THE_CARED_ONE_S_PERMISSION.YES ? "Yes" : "No",
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
    moving_type?: string;
    platform?: string;
    battery_level?: number | null;
    phone_is_charging?: string;
    address_text?: string | null;
    is_emergency?: boolean;
  }
): Promise<LocationSnapshot | null> {
  const storedUser = getStoredWPUser();
  if (!storedUser?.user_id) throw new Error("Not authenticated");

  const userId = Number(storedUser.user_id);

  // Create a new CCT row (append-only — never update)
  const created = await wordpressCCTFetch<any>(CCT_SLUG, {
    method: "POST",
    body: {
      [F.LATITUDE]: String(lat),
      [F.LONGITUDE]: String(lng),
      [F.ACCURACY_METERS]: opts?.accuracy != null ? String(opts.accuracy) : "",
      [F.ALTITUDE_METERS]: opts?.altitude != null ? String(opts.altitude) : "",
      [F.HEADING_DEGREES]: opts?.heading != null ? String(opts.heading) : "",
      [F.SPEED]: opts?.speed != null ? String(opts.speed) : "",
      [F.MOVING_TYPE]: opts?.moving_type || "",
      [F.PLATFORM]: opts?.platform || detectPlatform(),
      [F.BATTERY_LEVEL]: opts?.battery_level != null ? String(opts.battery_level) : "",
      [F.PHONE_IS_CHARING]: opts?.phone_is_charging || "",
      [F.ADDRESS_TEXT]: opts?.address_text || "",
      [F.CAPTURED_AT]: new Date().toISOString(),
      [F.IS_SO_MUCH_OF_AN_EMERGENCY_THAT_WE_DON_T_BOTHER_TO_ASK_FOR_THE_CARED_ONE_S_PERMISSION]: opts?.is_emergency ? O.IS_SO_MUCH_OF_AN_EMERGENCY_THAT_WE_DON_T_BOTHER_TO_ASK_FOR_THE_CARED_ONE_S_PERMISSION.YES : O.IS_SO_MUCH_OF_AN_EMERGENCY_THAT_WE_DON_T_BOTHER_TO_ASK_FOR_THE_CARED_ONE_S_PERMISSION.NO,
    },
  });

  const newId = String(created._ID || created.id || "");
  if (!newId) throw new Error("Location snapshot was created without an item ID");

  // Attach to user via JetEngine relation
  await wordpressFetch(`jet-rel/${REL_USER_CURRENT_LOCATION}`, {
      method: "POST",
      body: {
        parent_id: userId,
        child_id: Number(newId),
        context: "child",
        store_items_type: "update",
        meta: { a55: "b56" },
      },
  });

  return mapSnapshot(created);
}

// ─── READ: Current location (latest snapshot) ────────────────

export async function fetchCurrentLocation(userId: string | number): Promise<LocationSnapshot | null> {
    const wpUserId = Number(String(userId).replace(/^wp-/, ""));
    if (!wpUserId) throw new Error("Invalid user ID");
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_USER_CURRENT_LOCATION}/children/${wpUserId}`);
    if (!Array.isArray(rels)) throw new Error(`Relation ${REL_USER_CURRENT_LOCATION} returned an invalid response`);
    const ids = rels.map((r) => Number(r.child_object_id)).filter(Boolean);
    if (!ids.length) return null;
    const items = await Promise.all(ids.map((id) => wordpressCCTFetch<any>(CCT_SLUG, { id })));
    const mapped = items.map(mapSnapshot).sort((a, b) => new Date(b.captured_at || 0).getTime() - new Date(a.captured_at || 0).getTime());
    return mapped[0] || null;
}

// ─── READ: Location history (all snapshots for trail) ────────

export async function fetchLocationHistory(
  userId: string | number,
  opts?: { limit?: number; since?: string }
): Promise<LocationSnapshot[]> {
    const wpUserId = Number(String(userId).replace(/^wp-/, ""));
    if (!wpUserId) throw new Error("Invalid user ID");
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_USER_CURRENT_LOCATION}/children/${wpUserId}`);
    if (!Array.isArray(rels)) throw new Error(`Relation ${REL_USER_CURRENT_LOCATION} returned an invalid response`);
    const ids = rels.map((r) => Number(r.child_object_id)).filter(Boolean);
    const items = await Promise.all(ids.map((id) => wordpressCCTFetch<any>(CCT_SLUG, { id })));
    return items
      .map(mapSnapshot)
      .filter(s => s.latitude != null && s.longitude != null)
      .filter(s => !opts?.since || new Date(s.captured_at || 0) >= new Date(opts.since))
      .sort((a, b) => new Date(b.captured_at || 0).getTime() - new Date(a.captured_at || 0).getTime())
      .slice(0, opts?.limit || 200);
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
              message: `${(await fetchMyAppUserName().catch(() => "")) || "A care circle member"} triggered an SOS emergency alert.`,
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
