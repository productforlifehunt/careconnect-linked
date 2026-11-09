/**
 * App scoping for CCTs shared across every app on the merged WordPress backend.
 *
 * Notifications (185), Chat Conversation (121), Calendar Event (187) and
 * Notification Token (186) all live in ONE table shared by Afresh / Adry /
 * Ablocked / BeNotch / ChallengeD / CareCNC. Without an explicit app filter a
 * quit-smoking log or a workout reminder shows up inside the care app.
 *
 * Every read of those CCTs MUST filter by the scope code, and every write MUST
 * stamp it. Codes are opaque — they come from the dictionary, never inferred.
 */
import { T } from "@/integrations/wp-schema";

/** The apps that share the backend. */
export type AppScope = "afresh" | "adry" | "ablocked" | "benotch" | "challenged" | "carecnc";

/**
 * Opaque option codes for the "App" radio. Identical option order on CCT 121 /
 * 185 / 186 / 187, but we still read each one from its own CCT definition so a
 * future divergence is caught by the generator, not by users.
 */
export const APP_CODE = {
  notification: T.notification.opt.THIS_IS_THE_NOTIFICATION_FOR_APP,
  notificationToken: T.notificationToken.opt.APP,
  chatConversation: T.chatConversation.opt.APP,
  calendarEvent: T.calendarEvent.opt.APP,
} as const;

/** Field code holding the app scope, per CCT. */
export const APP_FIELD = {
  notification: T.notification.f.THIS_IS_THE_NOTIFICATION_FOR_APP,
  notificationToken: T.notificationToken.f.APP,
  chatConversation: T.chatConversation.f.APP,
  calendarEvent: T.calendarEvent.f.APP,
} as const;

/** Community post (149) stores the standard lowercase app name in a01. */
export const COMMUNITY_TYPE_FIELD = T.afreshCommunityPost.f.COMMUNITY_TYPE;

const COMMUNITY_APP_NAME: Record<string, AppScope> = {
  afresh: "afresh",
  adry: "adry",
  ablocked: "ablocked",
  benotch: "benotch",
  challenged: "challenged",
  carecnc: "carecnc",
  careconnected: "carecnc",
  safety: "benotch",
  notchsafety: "benotch",
};

function appNameFromSite(value: string | null | undefined): AppScope | undefined {
  const slug = value?.trim().toLowerCase();
  if (!slug) return undefined;
  const app = Object.keys(COMMUNITY_APP_NAME).find((name) => slug === name || slug.startsWith(`${name}-`));
  return app ? COMMUNITY_APP_NAME[app] : undefined;
}

/** Resolve the app name stored on CCT 149, including preview site overrides. */
export function communityAppName(): AppScope {
  if (typeof window === "undefined") return currentAppScope();
  try {
    const params = new URLSearchParams(window.location.search);
    const queryApp = appNameFromSite(params.get("__site"));
    if (queryApp) return queryApp;

    const storedApp = appNameFromSite(sessionStorage.getItem(`__site_id:${window.location.host}`));
    if (storedApp) return storedApp;

    const hostname = window.location.hostname.toLowerCase();
    const hostApp = hostname
      .split(".")
      .map((label) => appNameFromSite(label))
      .find((app): app is AppScope => Boolean(app));
    if (hostApp) return hostApp;
    if (hostname === "challenged.com" || hostname === "www.challenged.com") return "challenged";
    if (hostname === "carecnc.com" || hostname === "www.carecnc.com") return "carecnc";
  } catch {
    /* ignore */
  }
  return currentAppScope();
}

type ScopedCct = keyof typeof APP_CODE;

/**
 * Resolve the running brand to its app scope. Mirrors SiteContext.detectSite()
 * without importing React so data sources can call it freely.
 */
export function currentAppScope(): AppScope {
  if (typeof window === "undefined") return "challenged";
  try {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("__site");
    if (p === "careconnected" || (p && p.startsWith("carecnc"))) return "carecnc";
    // NotchSafety is a front-end skin over the main care data model.
    if (p === "safety" || (p && p.startsWith("notchsafety"))) return "challenged";
    if (p && p.startsWith("challenged")) return "challenged";

    const host = window.location.host;
    const hostname = window.location.hostname;
    if (/^(www\.)?carecnc\.com$/.test(host) || /^(www\.)?carecnc\.com$/.test(hostname)) return "carecnc";
  } catch {
    /* ignore */
  }
  return "challenged";
}

const SCOPE_KEY: Record<AppScope, string> = {
  afresh: "AFRESH",
  adry: "ADRY",
  ablocked: "ABLOCKED",
  benotch: "BENOTCH",
  challenged: "CHALLENGED",
  carecnc: "CARECNC",
};

/** Opaque option code for the current (or given) app on a scoped CCT. */
export function appScopeCode(cct: ScopedCct, scope: AppScope = currentAppScope()): string {
  const map = APP_CODE[cct] as Readonly<Record<string, string>>;
  return map[SCOPE_KEY[scope]]!;
}

/** `{ [appFieldCode]: appOptionCode }` — spread into a CCT create/update body. */
export function appScopeBody(cct: ScopedCct, scope: AppScope = currentAppScope()): Record<string, string> {
  return { [APP_FIELD[cct]]: appScopeCode(cct, scope) };
}

/** `{ [appFieldCode]: appOptionCode }` — spread into CCT REST query params. */
export function appScopeParams(cct: ScopedCct, scope: AppScope = currentAppScope()): Record<string, string> {
  return appScopeBody(cct, scope);
}

/**
 * True when a raw CCT row belongs to the current app. Rows with an empty scope
 * are treated as in-scope (legacy rows written before scoping existed), rows
 * stamped for another app are always rejected.
 *
 * CCT 187's "App" field is a dictionary radio. Older rows were written as the
 * lowercase app name, so both representations are accepted while every new
 * write uses the current app's option code.
 */
export function isInAppScope(cct: ScopedCct, raw: Record<string, any>, scope: AppScope = currentAppScope()): boolean {
  const value = raw?.[APP_FIELD[cct]];
  if (value === undefined || value === null || value === "") return true;
  const v = String(value).trim().toLowerCase();
  return v === String(appScopeCode(cct, scope)).toLowerCase() || v === scope;
}

/** Filter a raw CCT list down to rows belonging to the current app. */
export function filterAppScope<TRow extends Record<string, any>>(
  cct: ScopedCct,
  rows: TRow[],
  scope: AppScope = currentAppScope(),
): TRow[] {
  if (!Array.isArray(rows)) return [];
  return rows.filter((r) => isInAppScope(cct, r, scope));
}

/**
 * Per-app user name field on CCT 151 (User's extended profile).
 * The WordPress user login/display name is SHARED across every app on the
 * merged backend and must never be shown. Each app stores its own display
 * name in its own column: a55 afresh, a551 adry, a552 ablocked, a555 benotch,
 * a556 ChallengeD, a557 CareCNC.
 */
const USER_NAME_FIELD: Record<AppScope, string> = {
  afresh: T.userProfile.f.USER_NAME_FOR_AFRESH,
  adry: T.userProfile.f.USER_NAME_FOR_ADRY,
  ablocked: T.userProfile.f.USER_NAME_FOR_ABLOCKED,
  benotch: T.userProfile.f.USER_NAME_FOR_BENOTCH,
  challenged: T.userProfile.f.USER_NAME_FOR_CHALLENGED,
  carecnc: T.userProfile.f.USER_NAME_FOR_CARECNC,
};

export function appUserNameField(scope: AppScope = currentAppScope()): string {
  return USER_NAME_FIELD[scope];
}
