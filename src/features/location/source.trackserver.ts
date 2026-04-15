/**
 * Trackserver REST Endpoint — Permanent Write-Only Archive
 * 
 * Sends GPS breadcrumbs to Trackserver via OsmAnd protocol (GET + Basic Auth).
 * Trackserver stores high-frequency location data in optimized MySQL tables
 * (wp_ts_tracks, wp_ts_locations) — ideal for long-term GPS history archival.
 * 
 * This is WRITE-ONLY. Retrieval uses JetEngine CCTs (location_sharing / location_history)
 * because Trackserver's read API requires WordPress nonces (incompatible with headless JWT).
 * 
 * Architecture:
 *   Write: OsmAnd → Trackserver (this file) + CCT dual-write
 *   Read:  JetEngine CCT REST API (source.wordpress-extended.ts)
 */

import { getActiveServer } from "@/lib/wp-servers";
import { getStoredWPUser } from "@/services/wp-auth";

const TRACKSERVER_SLUG = "trackserver";
const APP_PASSWORD = "challenged5527@@@@@";

function buildAuthHeader(username: string): string {
  return `Basic ${btoa(`${username}:${APP_PASSWORD}`)}`;
}

function buildEndpointUrl(lat: number, lng: number, params: Record<string, string | number>): string {
  const server = getActiveServer();
  const qs = new URLSearchParams();
  qs.set("lat", String(lat));
  qs.set("lon", String(lng));
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== "") qs.set(k, String(v));
  }
  return `${server.baseUrl}/${TRACKSERVER_SLUG}/?${qs.toString()}`;
}

interface TrackserverWriteResult {
  trackId: string;
  timestamp: string;
}

/**
 * Write a single GPS point to Trackserver (OsmAnd protocol).
 * Returns track ID on success, null on failure. Never throws.
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

  const url = buildEndpointUrl(lat, lng, {
    timestamp: opts?.timestamp ?? Math.floor(Date.now() / 1000),
    speed: opts?.speed ?? 0,
    ...(opts?.altitude != null && { altitude: opts.altitude }),
    ...(opts?.battery != null && { batt: opts.battery }),
    ...(opts?.accuracy != null && { hdop: opts.accuracy }),
  });

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

/**
 * Dual-write: Trackserver (archive) + CCT (live/headless retrieval).
 * Both writes run in parallel; failures are isolated.
 */
export async function dualWriteLocation(
  lat: number,
  lng: number,
  opts?: {
    accuracy?: number | null;
    batteryLevel?: number | null;
    speed?: number;
    isEmergency?: boolean;
  }
): Promise<void> {
  const { shareMyLocationWordPress } = await import(
    "@/features/location/source.wordpress-extended"
  );

  const [tsResult] = await Promise.allSettled([
    writeToTrackserver(lat, lng, {
      accuracy: opts?.accuracy ?? undefined,
      battery: opts?.batteryLevel ?? undefined,
      speed: opts?.speed,
    }),
    shareMyLocationWordPress(lat, lng, {
      accuracy: opts?.accuracy,
      batteryLevel: opts?.batteryLevel,
      isEmergency: opts?.isEmergency,
    }),
  ]);

  if (tsResult.status === "fulfilled" && tsResult.value) {
    console.debug("[Trackserver] Archived → track", tsResult.value.trackId);
  }
}

/**
 * Capacitor background-geolocation config for native apps.
 * Returns the OsmAnd endpoint URL and auth headers.
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
