/**
 * General app settings (notifications, display, privacy nudges).
 *
 * Per the data dictionary these are NOT separate CCTs — every non-health,
 * general setting is stored as one JSON blob on
 * JetEngine CCT 151 `users_extended_prof`:
 *   a95 = User's app setting for ChallengeD
 *   a96 = User's app setting for CareCNC
 * Linked to the user via Relation 152 (one to one).
 */
import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { getCurrentUserIdNumber } from "@/features/shared/current-user";
import { T, R } from "@/integrations/wp-schema";
import { currentAppScope } from "@/features/shared/app-scope";
import { findOwnRow, linkOwnRow } from "@/features/shared/own-profile-row";

const SLUG = T.userProfile.slug;
const F = T.userProfile.f;
const REL_USER_PROFILE = R.userProfileRel;

/** Which blob field this app writes to. */
function settingsField(): string {
  return currentAppScope() === "carecnc"
    ? F.USER_S_APP_SETTING_FOR_CARECNC
    : F.USER_S_APP_SETTING_FOR_CHALLENGED;
}

export interface AppSettings {
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    /** categories the user switched off: chat | booking | system | location | check_in | medicine */
    muted_types: string[];
    quiet_hours?: { enabled: boolean; from: string; to: string };
  };
  display: {
    theme: "system" | "light" | "dark";
    text_size: "default" | "large" | "xlarge";
    reduce_motion: boolean;
  };
  permissions_asked: {
    push?: boolean;
    location?: boolean;
    calendar?: boolean;
  };
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  notifications: { push: true, email: true, sms: false, muted_types: [] },
  display: { theme: "system", text_size: "default", reduce_motion: false },
  permissions_asked: {},
};

function merge(raw: any): AppSettings {
  const d = DEFAULT_APP_SETTINGS;
  return {
    notifications: { ...d.notifications, ...(raw?.notifications ?? {}) },
    display: { ...d.display, ...(raw?.display ?? {}) },
    permissions_asked: { ...d.permissions_asked, ...(raw?.permissions_asked ?? {}) },
  };
}

function findRow(): Promise<any | null> {
  // Resolved through Relation 152 — a cct_author_id query filter is ignored by
  // JetEngine on this route and returns another user's row.
  return findOwnRow(REL_USER_PROFILE, SLUG);
}

export async function fetchAppSettings(): Promise<AppSettings> {
  const row = await findRow();
  const raw = row?.[settingsField()];
  if (!raw) return DEFAULT_APP_SETTINGS;
  try {
    return merge(typeof raw === "string" ? JSON.parse(raw) : raw);
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export async function saveAppSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const userId = getCurrentUserIdNumber();
  const current = await fetchAppSettings();
  const next = merge({ ...current, ...patch });
  const body = { [settingsField()]: JSON.stringify(next) };

  const row = await findRow();
  if (row) {
    await wordpressCCTFetch(SLUG, { id: String(row.id ?? row._ID), method: "PUT", body });
    return next;
  }

  // No extended profile row yet — create one and link via Relation 152.
  const created: any = await wordpressCCTFetch(SLUG, { method: "POST", body });
  const newId = created?.item_id ?? created?._ID ?? created?.id;
  if (!newId || !userId) throw new Error("Could not create the extended profile row for app settings");
  await linkOwnRow(REL_USER_PROFILE, newId);
  return next;
}
