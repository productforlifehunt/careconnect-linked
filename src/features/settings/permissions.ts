/**
 * Device permission layer (push / location / calendar).
 *
 * Works on three surfaces with one API:
 *   - iOS & Android via Capacitor plugins
 *   - Web via the browser APIs (Notification, Geolocation)
 *   - Any surface where the capability is missing → "unsupported", never a crash
 *
 * Nothing here asks for a permission on load. Permissions are requested only in
 * direct response to a user action (the iOS review requirement and the habit
 * users expect), and a denied permission always yields an actionable recovery
 * path via `openAppSettings()`.
 */
import { Capacitor } from "@capacitor/core";

export type PermissionState = "granted" | "denied" | "prompt" | "unsupported";
export type PermissionKind = "push" | "location" | "calendar";

export const isNative = () => Capacitor.isNativePlatform();
export const platform = () => Capacitor.getPlatform();

/* ── push ──────────────────────────────────────────────────────── */

export async function checkPushPermission(): Promise<PermissionState> {
  if (isNative()) {
    try {
      const { PushNotifications } = await import("@capacitor/push-notifications");
      const r = await PushNotifications.checkPermissions();
      return r.receive === "granted" ? "granted" : r.receive === "denied" ? "denied" : "prompt";
    } catch {
      return "unsupported";
    }
  }
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission === "granted"
    ? "granted"
    : Notification.permission === "denied"
      ? "denied"
      : "prompt";
}

/**
 * Request push permission and register the device token.
 * Returns the resulting state; the token registration is reported through
 * `onToken` because APNs/FCM deliver it asynchronously.
 */
export async function requestPushPermission(
  onToken?: (token: string, provider: "apn" | "fcm" | "web_push") => void,
): Promise<PermissionState> {
  if (isNative()) {
    try {
      const { PushNotifications } = await import("@capacitor/push-notifications");
      const req = await PushNotifications.requestPermissions();
      if (req.receive !== "granted") return req.receive === "denied" ? "denied" : "prompt";
      if (onToken) {
        await PushNotifications.removeAllListeners();
        await PushNotifications.addListener("registration", (t) =>
          onToken(t.value, platform() === "ios" ? "apn" : "fcm"),
        );
      }
      await PushNotifications.register();
      return "granted";
    } catch {
      return "unsupported";
    }
  }
  if (typeof Notification === "undefined") return "unsupported";
  try {
    const result = await Notification.requestPermission();
    return result === "granted" ? "granted" : result === "denied" ? "denied" : "prompt";
  } catch {
    return "denied";
  }
}

/* ── location ──────────────────────────────────────────────────── */

export async function checkLocationPermission(): Promise<PermissionState> {
  if (isNative()) {
    try {
      const { Geolocation } = await import("@capacitor/geolocation");
      const r = await Geolocation.checkPermissions();
      const v = r.location ?? r.coarseLocation;
      return v === "granted" ? "granted" : v === "denied" ? "denied" : "prompt";
    } catch {
      return "unsupported";
    }
  }
  if (typeof navigator === "undefined" || !navigator.geolocation) return "unsupported";
  try {
    const status = await navigator.permissions?.query({ name: "geolocation" as PermissionName });
    if (!status) return "prompt";
    return status.state === "granted" ? "granted" : status.state === "denied" ? "denied" : "prompt";
  } catch {
    return "prompt";
  }
}

export async function requestLocationPermission(): Promise<PermissionState> {
  if (isNative()) {
    try {
      const { Geolocation } = await import("@capacitor/geolocation");
      const r = await Geolocation.requestPermissions();
      return r.location === "granted" ? "granted" : r.location === "denied" ? "denied" : "prompt";
    } catch {
      return "unsupported";
    }
  }
  if (typeof navigator === "undefined" || !navigator.geolocation) return "unsupported";
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      () => resolve("granted"),
      (err) => resolve(err.code === err.PERMISSION_DENIED ? "denied" : "prompt"),
      { timeout: 10000 },
    );
  });
}

/* ── calendar ──────────────────────────────────────────────────── */

/**
 * Calendar access is optional: the in-app calendar (CCT 187) always works.
 * A native calendar plugin is imported lazily so the web build never breaks
 * when it is not installed.
 */
export async function checkCalendarPermission(): Promise<PermissionState> {
  if (!isNative()) return "unsupported";
  try {
    const mod: any = await import(/* @vite-ignore */ "@ebarooni/capacitor-calendar");
    const r = await mod.CapacitorCalendar.checkPermission({ alias: "readCalendar" });
    return r.result === "granted" ? "granted" : r.result === "denied" ? "denied" : "prompt";
  } catch {
    return "unsupported";
  }
}

export async function requestCalendarPermission(): Promise<PermissionState> {
  if (!isNative()) return "unsupported";
  try {
    const mod: any = await import(/* @vite-ignore */ "@ebarooni/capacitor-calendar");
    const r = await mod.CapacitorCalendar.requestPermission({ alias: "readCalendar" });
    return r.result === "granted" ? "granted" : r.result === "denied" ? "denied" : "prompt";
  } catch {
    return "unsupported";
  }
}

/** Export an in-app event to the device calendar; falls back to an .ics download on web. */
export async function addEventToDeviceCalendar(event: {
  title: string;
  start: Date;
  end?: Date;
  location?: string;
  notes?: string;
}): Promise<"added" | "downloaded" | "failed"> {
  if (isNative()) {
    try {
      const mod: any = await import(/* @vite-ignore */ "@ebarooni/capacitor-calendar");
      await mod.CapacitorCalendar.createEventWithPrompt({
        title: event.title,
        startDate: event.start.getTime(),
        endDate: (event.end ?? new Date(event.start.getTime() + 3600_000)).getTime(),
        location: event.location,
        notes: event.notes,
      });
      return "added";
    } catch {
      /* fall through to .ics */
    }
  }
  try {
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${fmt(event.start)}`,
      `DTEND:${fmt(event.end ?? new Date(event.start.getTime() + 3600_000))}`,
      `SUMMARY:${event.title}`,
      event.location ? `LOCATION:${event.location}` : "",
      event.notes ? `DESCRIPTION:${event.notes}` : "",
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .filter(Boolean)
      .join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title.replace(/[^\w\s-]/g, "").slice(0, 40) || "event"}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    return "downloaded";
  } catch {
    return "failed";
  }
}

/* ── recovery ──────────────────────────────────────────────────── */

/** Deep-link into the OS settings screen so a denied permission is recoverable. */
export async function openAppSettings(): Promise<boolean> {
  if (isNative()) {
    try {
      const { NativeSettings, AndroidSettings, IOSSettings } = await import(
        /* @vite-ignore */ "capacitor-native-settings"
      ) as any;
      await NativeSettings.open({
        optionAndroid: AndroidSettings.ApplicationDetails,
        optionIOS: IOSSettings.App,
      });
      return true;
    } catch {
      try {
        const { App } = await import("@capacitor/app");
        // No settings plugin available — at least surface the app info screen.
        await (App as any).openUrl?.({ url: "app-settings:" });
        return true;
      } catch {
        return false;
      }
    }
  }
  return false;
}

export async function checkPermission(kind: PermissionKind): Promise<PermissionState> {
  if (kind === "push") return checkPushPermission();
  if (kind === "location") return checkLocationPermission();
  return checkCalendarPermission();
}

export async function requestPermission(kind: PermissionKind): Promise<PermissionState> {
  if (kind === "push") return requestPushPermission();
  if (kind === "location") return requestLocationPermission();
  return requestCalendarPermission();
}
