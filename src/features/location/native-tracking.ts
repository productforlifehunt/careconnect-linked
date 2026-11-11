import { Capacitor } from "@capacitor/core";
import type { CareLocationPlugin, PendingPosition, CircleFence } from "@careconnect/location";

export function usesNativeLocation(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";
}

/** Acknowledgment follows the confirmed CCT + JetEngine relation write, never the request start. */
export async function flushNativePositions(
  plugin: CareLocationPlugin,
  write: (position: PendingPosition) => Promise<unknown>,
  isCurrent: () => boolean,
): Promise<number> {
  const { positions } = await plugin.getPending();
  const outcomes = await Promise.allSettled(positions.map(async position => {
    if (!isCurrent()) return 0;
    await write(position);
    await plugin.acknowledge({ sequences: [position.sequence] });
    return 1;
  }));
  const failure = outcomes.find(outcome => outcome.status === "rejected");
  if (failure?.status === "rejected") throw failure.reason;
  return outcomes.reduce((count, result) => count + (result.status === "fulfilled" ? result.value : 0), 0);
}

export interface NativeZone {
  id: string;
  is_active: boolean;
  shape_type: string;
  latitude: number | null;
  longitude: number | null;
  radius_meters: number;
  notify_on_enter: boolean;
  notify_on_exit: boolean;
  schedule_enabled: boolean;
}

/** Polygon/scheduled regions keep the existing exact CCT214 evaluator, not an approximate circle. */
export function nativeCircleFences(zones: NativeZone[]): CircleFence[] {
  return zones.filter(z => z.is_active && !z.schedule_enabled && z.shape_type.toLowerCase() === "radius"
    && z.latitude != null && z.longitude != null && (z.notify_on_enter || z.notify_on_exit))
    .flatMap(z => z.latitude == null || z.longitude == null ? [] : [{
      identifier: z.id, latitude: z.latitude, longitude: z.longitude, radius: z.radius_meters,
      notifyOnEntry: z.notify_on_enter, notifyOnExit: z.notify_on_exit,
    }]);
}