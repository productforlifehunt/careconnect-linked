/**
 * Trackserver GPS Ingestion Service
 * 
 * Uses the OsmAnd protocol to POST GPS coordinates to Trackserver.
 * Trackserver stores tracks in independent MySQL tables (wp_ts_tracks, wp_ts_locations)
 * for efficient high-frequency GPS breadcrumb storage.
 * 
 * Architecture:
 * - Ingestion: OsmAnd protocol → Trackserver (this file)
 * - Retrieval: JetEngine CCT REST API (source.wordpress-extended.ts)
 * - Geofencing: safe_zone CCT + breach detection (source.wordpress-extended.ts)
 */

import { getActiveServer } from "@/lib/wp-servers";
import { getStoredWPUser } from "@/services/wp-auth";

const TRACKSERVER_SLUG = "trackserver";

/**
 * Build the Trackserver OsmAnd endpoint URL.
 * Uses Basic Auth with WordPress Application Password.
 */
function getTrackserverUrl(): string {
  const server = getActiveServer();
  return `${server.baseUrl}/${TRACKSERVER_SLUG}/`;
}

/**
 * Send a GPS coordinate to Trackserver via OsmAnd protocol.
 * This writes to Trackserver's optimized wp_ts_locations table.
 * 
 * @param lat - Latitude
 * @param lng - Longitude
 * @param options - Optional speed, altitude, battery, accuracy
 * @returns Track ID if successful, null if failed
 */
export async function postLocationToTrackserver(
  lat: number,
  lng: number,
  options?: {
    speed?: number;
    altitude?: number;
    battery?: number;
    accuracy?: number;
    timestamp?: number;
  }
): Promise<{ trackId: string; timestamp: string } | null> {
  const storedUser = getStoredWPUser();
  if (!storedUser?.user_login) return null;

  const ts = options?.timestamp ?? Math.floor(Date.now() / 1000);
  const baseUrl = getTrackserverUrl();

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    timestamp: String(ts),
    speed: String(options?.speed ?? 0),
  });

  if (options?.altitude != null) params.set("altitude", String(options.altitude));
  if (options?.battery != null) params.set("batt", String(options.battery));
  if (options?.accuracy != null) params.set("hdop", String(options.accuracy));

  const url = `${baseUrl}?${params.toString()}`;

  // Use Basic Auth with WordPress Application Password
  const appPassword = "challenged5527@@@@@";
  const authHeader = `Basic ${btoa(`${storedUser.user_login}:${appPassword}`)}`;

  try {
    const response = await fetch(url, {
      method: "GET", // OsmAnd protocol uses GET
      headers: { Authorization: authHeader },
    });

    if (!response.ok) {
      console.warn("[Trackserver] Ingestion failed:", response.status);
      return null;
    }

    const text = await response.text();
    // Response format: "OK, track ID = 1, timestamp = 2026-04-15 18:35:34"
    const trackMatch = text.match(/track ID = (\d+)/);
    const tsMatch = text.match(/timestamp = (.+)/);

    if (trackMatch) {
      return {
        trackId: trackMatch[1],
        timestamp: tsMatch?.[1] ?? new Date().toISOString(),
      };
    }

    console.warn("[Trackserver] Unexpected response:", text);
    return null;
  } catch (err) {
    console.warn("[Trackserver] Network error:", err);
    return null;
  }
}

/**
 * Dual-write: Send location to both Trackserver AND our CCT system.
 * Trackserver stores the breadcrumb trail; CCT stores for headless retrieval.
 */
export async function dualWriteLocation(
  lat: number,
  lng: number,
  options?: {
    accuracy?: number | null;
    batteryLevel?: number | null;
    speed?: number;
    isEmergency?: boolean;
  }
): Promise<void> {
  const { shareMyLocationWordPress } = await import(
    "@/features/location/source.wordpress-extended"
  );

  // Write to both in parallel
  const [tsResult] = await Promise.allSettled([
    postLocationToTrackserver(lat, lng, {
      accuracy: options?.accuracy ?? undefined,
      battery: options?.batteryLevel ?? undefined,
      speed: options?.speed,
    }),
    shareMyLocationWordPress(lat, lng, {
      accuracy: options?.accuracy,
      batteryLevel: options?.batteryLevel,
      isEmergency: options?.isEmergency,
    }),
  ]);

  if (tsResult.status === "fulfilled" && tsResult.value) {
    console.debug("[Trackserver] Stored at track", tsResult.value.trackId);
  }
}

/**
 * Configuration for the Capacitor background-geolocation plugin.
 * Returns the OsmAnd endpoint URL and auth headers.
 */
export function getTrackserverConfig(): {
  url: string;
  method: "GET";
  headers: Record<string, string>;
} | null {
  const storedUser = getStoredWPUser();
  if (!storedUser?.user_login) return null;

  const appPassword = "challenged5527@@@@@";
  return {
    url: getTrackserverUrl(),
    method: "GET",
    headers: {
      Authorization: `Basic ${btoa(`${storedUser.user_login}:${appPassword}`)}`,
    },
  };
}
