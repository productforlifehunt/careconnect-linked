/**
 * ONE row per user per sub-app on JetEngine CCT 151 `users_extended_prof`.
 *
 * Data dictionary (opaque codes — never inferred, only from the dictionary):
 *   a01  This is for app        → lowercase standard app slug: "challenged",
 *                                 "carecnc", "notchsafety", "afresh", …
 *   a55  User's name for this app
 *   a56  User's community name for this app
 *   a57  Timezone   a58 Language   a59 Currency
 *   a70  Onboarding state              (b55 = done/skipped)
 *   a87  App settings (JSON textarea)
 *   a91  AI credits for this app
 *   a92  AI help ("?") button hidden    (1 = hidden, 0/empty = shown;
 *                                       the live column is numeric, so the
 *                                       yes/no codes are not accepted there)
 *
 * The row is linked to the WordPress user through JetEngine Relation 152 only —
 * no custom id, no foreign key. Core identity stays on the WordPress user; the
 * WordPress display name is shared by every app and is never shown.
 *
 * Rules enforced here:
 *   • exactly one row per user per app — duplicates are merged silently,
 *   • a legacy row with no a01 is adopted (stamped + migrated) instead of
 *     creating a second row,
 *   • paid apps grant 10 AI credits when the row is first created.
 */
import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getCurrentUserIdNumber } from "@/features/shared/current-user";
import { T, R } from "@/integrations/wp-schema";
import { currentAppScope, type AppScope } from "@/features/shared/app-scope";
import { linkOwnRow } from "@/features/shared/own-profile-row";

const SLUG = T.userProfile.slug;
const REL = R.userProfileRel;

export const APP_PROFILE_F = {
  APP: "a01",
  NAME: "a55",
  COMMUNITY_NAME: "a56",
  TIMEZONE: "a57",
  LANGUAGE: "a58",
  CURRENCY: "a59",
  ONBOARDING: "a70",
  SETTINGS_JSON: "a87",
  AI_CREDITS: "a91",
  HELP_HIDDEN: "a92",
} as const;

export const YES = "b55";
export const NO = "b56";

/** Standard lowercase app id stored in a01. */
export type AppId = "challenged" | "carecnc" | "notchsafety" | "afresh" | "adry" | "ablocked" | "benotch";

/** Apps that charge for AI, and therefore get the 10-credit welcome grant. */
const PAID_APPS: AppId[] = ["challenged", "carecnc", "notchsafety"];

/** Legacy per-app columns, read once when a pre-a01 row is adopted. */
const LEGACY_NAME: Partial<Record<AppId, string>> = {
  challenged: "a556",
  carecnc: "a557",
  notchsafety: "a555",
  afresh: "a55",
  adry: "a551",
  ablocked: "a552",
  benotch: "a555",
};
const LEGACY_SETTINGS: Partial<Record<AppId, string>> = {
  challenged: "a95",
  notchsafety: "a95",
  carecnc: "a96",
  afresh: "a87",
  adry: "a88",
  ablocked: "a89",
  benotch: "a90",
};

/**
 * The running app's own id. NotchSafety shares the ChallengeD care data model
 * (currentAppScope() folds it into "challenged"), but it is its own product and
 * therefore keeps its own settings row.
 */
export function currentAppId(): AppId {
  if (typeof window !== "undefined") {
    try {
      const p = new URLSearchParams(window.location.search).get("__site");
      if (p === "notchsafety" || p === "safety") return "notchsafety";
      if (/(^|\.)notchsafety\.com$/.test(window.location.hostname)) return "notchsafety";
    } catch {
      /* ignore */
    }
  }
  const scope: AppScope = currentAppScope();
  return scope as AppId;
}

async function childRowIds(userId: number): Promise<string[]> {
  const rels = await wordpressFetch<any[]>(`jet-rel/${REL}/children/${userId}`);
  if (!Array.isArray(rels)) throw new Error(`Relation ${REL} returned an invalid response`);
  return rels.map((r) => String(r?.child_object_id ?? "")).filter(Boolean);
}

async function readRows(ids: string[]): Promise<any[]> {
  const rows = await Promise.all(
    ids.map((id) => wordpressCCTFetch<any>(SLUG, { id }).catch(() => null)),
  );
  return rows.filter(Boolean);
}

const rowId = (row: any) => String(row?._ID ?? row?.id ?? "");
const isFilled = (v: any) => v !== undefined && v !== null && String(v).trim() !== "";

/** Merges duplicates into the oldest row and deletes the extras. Silent. */
async function mergeDuplicates(rows: any[]): Promise<any> {
  const [keep, ...extras] = rows;
  if (extras.length === 0) return keep;
  const patch: Record<string, any> = {};
  for (const extra of extras) {
    for (const key of Object.values(APP_PROFILE_F)) {
      if (!isFilled(keep[key]) && isFilled(extra[key]) && !isFilled(patch[key])) patch[key] = extra[key];
    }
  }
  if (Object.keys(patch).length) {
    await wordpressCCTFetch(SLUG, { id: rowId(keep), method: "PUT", body: patch });
    Object.assign(keep, patch);
  }
  await Promise.all(
    extras.map((e) => wordpressCCTFetch(SLUG, { id: rowId(e), method: "DELETE" }).catch(() => null)),
  );
  return keep;
}

/** This user's row for this app, or null when it does not exist yet. */
export async function getAppProfileRow(app: AppId = currentAppId()): Promise<any | null> {
  const userId = getCurrentUserIdNumber();
  if (!userId) return null;
  const rows = await readRows(await childRowIds(userId));
  const mine = rows.filter((r) => String(r?.[APP_PROFILE_F.APP] ?? "").toLowerCase() === app);
  if (mine.length) return mergeDuplicates(mine);

  // A row written before a01 existed: adopt it rather than adding a second one.
  const legacy = rows.find((r) => !isFilled(r?.[APP_PROFILE_F.APP]));
  if (!legacy) return null;
  const patch: Record<string, any> = { [APP_PROFILE_F.APP]: app };
  const nameCol = LEGACY_NAME[app];
  if (nameCol && !isFilled(legacy[APP_PROFILE_F.NAME]) && isFilled(legacy[nameCol]))
    patch[APP_PROFILE_F.NAME] = legacy[nameCol];
  const setCol = LEGACY_SETTINGS[app];
  if (setCol && setCol !== APP_PROFILE_F.SETTINGS_JSON && isFilled(legacy[setCol]))
    patch[APP_PROFILE_F.SETTINGS_JSON] = legacy[setCol];
  await wordpressCCTFetch(SLUG, { id: rowId(legacy), method: "PUT", body: patch });
  return { ...legacy, ...patch };
}

export interface EnsureResult {
  row: any;
  created: boolean;
  /** Credits granted by this call (10 on first creation for a paid app). */
  grantedCredits: number;
}

/**
 * Guarantees exactly one row for this user and this app.
 * Called after login / signup, when onboarding is finished or skipped, and
 * again as a silent second check when the Settings screen opens.
 */
export async function ensureAppProfile(app: AppId = currentAppId()): Promise<EnsureResult | null> {
  const userId = getCurrentUserIdNumber();
  if (!userId) return null;

  const existing = await getAppProfileRow(app);
  if (existing) return { row: existing, created: false, grantedCredits: 0 };

  const grant = PAID_APPS.includes(app) ? 10 : 0;
  const body: Record<string, any> = {
    [APP_PROFILE_F.APP]: app,
    [APP_PROFILE_F.ONBOARDING]: YES,
    cct_author_id: String(userId),
  };
  if (grant) body[APP_PROFILE_F.AI_CREDITS] = String(grant);
  try {
    body[APP_PROFILE_F.TIMEZONE] = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    /* ignore */
  }
  if (typeof navigator !== "undefined" && navigator.language) body[APP_PROFILE_F.LANGUAGE] = navigator.language;

  const created: any = await wordpressCCTFetch(SLUG, { method: "POST", body });
  const newId = created?.item_id ?? created?._ID ?? created?.id;
  if (!newId) throw new Error("Could not create the app settings record");
  await linkOwnRow(REL, newId);
  return { row: { ...body, _ID: newId }, created: true, grantedCredits: grant };
}

/** Writes columns onto this app's row, creating it first when needed. */
export async function patchAppProfile(body: Record<string, any>, app: AppId = currentAppId()): Promise<void> {
  const ensured = await ensureAppProfile(app);
  if (!ensured) throw new Error("No signed-in user");
  await wordpressCCTFetch(SLUG, { id: rowId(ensured.row), method: "PUT", body });
}

/* ── name (a55) ─────────────────────────────────────────────────────────── */

export async function fetchMyAppUserName(app: AppId = currentAppId()): Promise<string> {
  const row = await getAppProfileRow(app);
  const raw = row?.[APP_PROFILE_F.NAME];
  return typeof raw === "string" ? raw.trim() : "";
}

export async function saveMyAppUserName(name: string, app: AppId = currentAppId()): Promise<void> {
  await patchAppProfile({ [APP_PROFILE_F.NAME]: name }, app);
}

/* ── AI credits (a91) ───────────────────────────────────────────────────── */

export async function fetchMyAiCredits(app: AppId = currentAppId()): Promise<number> {
  const row = await getAppProfileRow(app);
  const n = parseFloat(String(row?.[APP_PROFILE_F.AI_CREDITS] ?? ""));
  return Number.isFinite(n) ? n : 0;
}

/* ── "?" help button (a92) ─────────────────────────────────────────────── */

export async function fetchHelpBubbleVisible(app: AppId = currentAppId()): Promise<boolean> {
  const row = await getAppProfileRow(app);
  return parseFloat(String(row?.[APP_PROFILE_F.HELP_HIDDEN] ?? "0")) !== 1;
}

export async function saveHelpBubbleVisible(visible: boolean, app: AppId = currentAppId()): Promise<void> {
  await patchAppProfile({ [APP_PROFILE_F.HELP_HIDDEN]: visible ? "0" : "1" }, app);
}

/* ── settings JSON (a87) ───────────────────────────────────────────────── */

export async function fetchAppSettingsJson(app: AppId = currentAppId()): Promise<any | null> {
  const row = await getAppProfileRow(app);
  const raw = row?.[APP_PROFILE_F.SETTINGS_JSON];
  if (!raw) return null;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

export async function saveAppSettingsJson(value: any, app: AppId = currentAppId()): Promise<void> {
  await patchAppProfile({ [APP_PROFILE_F.SETTINGS_JSON]: JSON.stringify(value) }, app);
}
