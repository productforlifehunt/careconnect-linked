/**
 * Trackserver REST — Unified GPS Client
 * 
 * WRITE: OsmAnd protocol (GET + Basic Auth) → Trackserver ingestion
 * READ:  Custom REST endpoints (cc/v1/location/*) → Trackserver tables
 * 
 * This eliminates the need for dual-write to JetEngine CCTs.
 * Trackserver is now the single source of truth for all GPS data.
 * 
 * Endpoints:
 *   Write: GET /trackserver/?lat=X&lon=Y&timestamp=Z  (OsmAnd protocol)
 *   Live:  GET /wp-json/cc/v1/location/live/{user_id}
 *   Trail: GET /wp-json/cc/v1/location/history/{user_id}?limit=N&since=ISO
 */

import { getActiveServer } from "@/lib/wp-servers";
import { getStoredWPUser } from "@/services/wp-auth";
import { wordpressFetch } from "@/features/shared/wordpress-client";

const TRACKSERVER_SLUG = "trackserver";
const APP_PASSWORD = "challenged5527@@@@@";

// ─── Types ────────────────────────────────────────────────────

export interface TrackserverPoint {
  latitude: number;
  longitude: number;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: string;
  track_id: number;
  track_name: string;
}

export interface LiveLocationResult {
  found: boolean;
  user_id: number;
  data: TrackserverPoint | null;
}

export interface LocationHistoryResult {
  user_id: number;
  count: number;
  points: TrackserverPoint[];
}

export interface TrackserverWriteResult {
  trackId: string;
  timestamp: string;
}

// ─── Helpers ──────────────────────────────────────────────────

function buildAuthHeader(username: string): string {
  return `Basic ${btoa(`${username}:${APP_PASSWORD}`)}`;
}

// ─── WRITE: OsmAnd ingestion ──────────────────────────────────

/**
 * Write a GPS point to Trackserver via OsmAnd protocol.
 * This is the only write path — no dual-write needed.
 */
export async function writeToTrackserver(
  lat: number,
  lng: number,
  opts?: {
    speed?: number;
    altitude?: number;
    battery?: number;
    accuracy?: number;
    timestamp?: number;
  }
): Promise<TrackserverWriteResult | null> {
  const user = getStoredWPUser();
  if (!user?.user_login) return null;

  const server = getActiveServer();
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    timestamp: String(opts?.timestamp ?? Math.floor(Date.now() / 1000)),
    speed: String(opts?.speed ?? 0),
  });
  if (opts?.altitude != null) params.set("altitude", String(opts.altitude));
  if (opts?.battery != null) params.set("batt", String(opts.battery));
  if (opts?.accuracy != null) params.set("hdop", String(opts.accuracy));

  const url = `${server.baseUrl}/${TRACKSERVER_SLUG}/?${params.toString()}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: buildAuthHeader(user.user_login) },
    });

    if (!res.ok) {
      console.warn("[Trackserver] Write failed:", res.status);
      return null;
    }

    const text = await res.text();
    const trackMatch = text.match(/track ID = (\d+)/);
    const tsMatch = text.match(/timestamp = (.+)/);

    if (trackMatch) {
      return { trackId: trackMatch[1], timestamp: tsMatch?.[1] ?? new Date().toISOString() };
    }

    console.warn("[Trackserver] Unexpected response:", text);
    return null;
  } catch (err) {
    console.warn("[Trackserver] Network error:", err);
    return null;
  }
}

// ─── READ: Live location ──────────────────────────────────────

/**
 * Fetch the latest GPS point for a user from Trackserver.
 * Uses the cc/v1/location/live endpoint (JWT/App Password auth).
 */
export async function fetchLiveLocation(userId: string | number): Promise<TrackserverPoint | null> {
  try {
    const result = await wordpressFetch<LiveLocationResult>(`cc/v1/location/live/${userId}`);
    return result?.found ? result.data : null;
  } catch (err) {
    console.warn("[Trackserver] Live location fetch failed:", err);
    return null;
  }
}

// ─── READ: Location history ──────────────────────────────────

/**
 * Fetch GPS breadcrumb trail for a user from Trackserver.
 * 
 * @param userId - WordPress user ID
 * @param opts.limit - Max points to return (default 100, max 1000)
 * @param opts.since - ISO 8601 datetime, only return points after this
 * @param opts.trackId - Filter to a specific track
 */
export async function fetchLocationHistory(
  userId: string | number,
  opts?: { limit?: number; since?: string; trackId?: number }
): Promise<TrackserverPoint[]> {
  try {
    const params = new URLSearchParams();
    if (opts?.limit) params.set("limit", String(opts.limit));
    if (opts?.since) params.set("since", opts.since);
    if (opts?.trackId) params.set("track_id", String(opts.trackId));

    const qs = params.toString();
    const path = `cc/v1/location/history/${userId}${qs ? `?${qs}` : ""}`;
    const result = await wordpressFetch<LocationHistoryResult>(path);
    return result?.points || [];
  } catch (err) {
    console.warn("[Trackserver] History fetch failed:", err);
    return [];
  }
}

// ─── WRITE: Full pipeline (write + zone check) ───────────────

/**
 * Write location to Trackserver and run zone breach detection.
 * This replaces the old dual-write pattern.
 */
export async function writeLocationAndCheckZones(
  lat: number,
  lng: number,
  opts?: {
    accuracy?: number | null;
    batteryLevel?: number | null;
    speed?: number;
    isEmergency?: boolean;
  }
): Promise<TrackserverWriteResult | null> {
  const { createSafeZoneAlertsForLocation } = await import(
    "@/features/location/source.wordpress-extended"
  );

  const storedUser = getStoredWPUser();

  // Write to Trackserver
  const result = await writeToTrackserver(lat, lng, {
    accuracy: opts?.accuracy ?? undefined,
    battery: opts?.batteryLevel ?? undefined,
    speed: opts?.speed,
  });

  if (result) {
    console.debug("[Trackserver] Stored → track", result.trackId);
  }

  // Run zone breach detection
  if (storedUser?.user_id) {
    try {
      await createSafeZoneAlertsForLocation(String(storedUser.user_id), lat, lng);
    } catch {}
  }

  // Handle SOS emergency
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
              related_id: storedUser.user_id,
              related_type: "user",
            });
          }
        }
      }
    } catch {}
  }

  return result;
}

// ─── Native config ────────────────────────────────────────────

/**
 * Capacitor background-geolocation config for native apps.
 */
export function getTrackserverNativeConfig(username: string): {
  url: string;
  method: "GET";
  headers: Record<string, string>;
} {
  const server = getActiveServer();
  return {
    url: `${server.baseUrl}/${TRACKSERVER_SLUG}/`,
    method: "GET",
    headers: { Authorization: buildAuthHeader(username) },
  };
}
