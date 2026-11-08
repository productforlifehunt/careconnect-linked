import {
  fetchAppSettingsJson,
  fetchHelpBubbleVisible,
} from "@/features/shared/app-profile";
import { DEFAULT_DISPLAY_SETTINGS } from "@/features/settings/display-preferences";
export { appSettingsQueryKey } from "@/features/settings/app-settings-query";

export interface AppSettings {
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    muted_types: string[];
    quiet_hours?: { enabled: boolean; from: string; to: string } | undefined;
  };
  display: {
    theme: "system" | "light" | "dark";
    text_size: "default" | "large" | "xlarge";
    reduce_motion: boolean;
    help_bubble: boolean;
  };
  permissions_asked: {
    push?: boolean | undefined;
    location?: boolean | undefined;
    calendar?: boolean | undefined;
  };
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  notifications: { push: false, email: true, sms: false, muted_types: [] },
  display: { ...DEFAULT_DISPLAY_SETTINGS },
  permissions_asked: {},
};

function mergeSettings(raw: unknown): AppSettings {
  const value =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const notifications =
    value["notifications"] && typeof value["notifications"] === "object"
      ? (value["notifications"] as Record<string, unknown>)
      : {};
  const display =
    value["display"] && typeof value["display"] === "object"
      ? (value["display"] as Record<string, unknown>)
      : {};
  const permissions =
    value["permissions_asked"] && typeof value["permissions_asked"] === "object"
      ? (value["permissions_asked"] as Record<string, unknown>)
      : {};

  return {
    notifications: {
      ...DEFAULT_APP_SETTINGS.notifications,
      ...notifications,
    },
    display: {
      ...DEFAULT_APP_SETTINGS.display,
      ...display,
    },
    permissions_asked: {
      ...DEFAULT_APP_SETTINGS.permissions_asked,
      ...permissions,
    },
  } as AppSettings;
}

/** Reads the same CCT-backed settings used by the full settings and AI flows. */
export async function fetchAppSettings(): Promise<AppSettings> {
  const [json, helpVisible] = await Promise.all([
    fetchAppSettingsJson().catch(() => null),
    fetchHelpBubbleVisible().catch(() => true),
  ]);
  const settings = mergeSettings(json);
  settings.display.help_bubble = helpVisible;
  return settings;
}
