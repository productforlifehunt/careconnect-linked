import { Capacitor } from "@capacitor/core";

interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
}

const num = (v: number | null | undefined) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const toGeo = (c: { latitude: number; longitude: number; accuracy?: number | null; altitude?: number | null; heading?: number | null; speed?: number | null }): GeoPosition => ({
  latitude: c.latitude,
  longitude: c.longitude,
  accuracy: num(c.accuracy),
  altitude: num(c.altitude),
  heading: num(c.heading),
  speed: num(c.speed),
});

/**
 * Get current position using Capacitor on native, browser API on web.
 * Returns null if permission denied or unavailable (never throws).
 */
export async function getCurrentPosition(options?: { timeout?: number | undefined }): Promise<GeoPosition | null> {
  const timeout = options?.timeout ?? 10000;

  // Native (Capacitor)
  if (Capacitor.isNativePlatform()) {
    try {
      const { Geolocation } = await import("@capacitor/geolocation");
      // Request permission first on native
      const perm = await Geolocation.checkPermissions();
      if (perm.location === "denied") {
        const req = await Geolocation.requestPermissions();
        if (req.location === "denied") return null;
      }
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout,
      });
      return toGeo(pos.coords);
    } catch {
      return null;
    }
  }

  // Web fallback
  if (!("geolocation" in navigator)) return null;

  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout,
        maximumAge: 60000,
      });
    });
    return toGeo(pos.coords);
  } catch {
    return null;
  }
}

/**
 * Watch position changes. Returns a cleanup function.
 */
export function watchPosition(
  callback: (pos: GeoPosition) => void,
  errorCallback?: (() => void) | undefined,
): () => void {
  if (Capacitor.isNativePlatform()) {
    let watchId: string | null = null;
    (async () => {
      try {
        const { Geolocation } = await import("@capacitor/geolocation");
        watchId = await Geolocation.watchPosition(
          { enableHighAccuracy: true },
          (pos, err) => {
            if (err || !pos) {
              errorCallback?.();
              return;
            }
            callback(toGeo(pos.coords));
          },
        );
      } catch {
        errorCallback?.();
      }
    })();
    return () => {
      if (watchId != null) {
        import("@capacitor/geolocation").then(({ Geolocation }) => {
          Geolocation.clearWatch({ id: watchId! });
        });
      }
    };
  }

  // Web fallback
  if (!("geolocation" in navigator)) {
    errorCallback?.();
    return () => {};
  }

  const id = navigator.geolocation.watchPosition(
    (pos) => {
      callback(toGeo(pos.coords));
    },
    () => errorCallback?.(),
    { enableHighAccuracy: true },
  );

  return () => navigator.geolocation.clearWatch(id);
}
