/**
 * DYNAMIC context — the single place where AI features read the database and
 * where "who may see what" is decided.
 *
 * Design rules (do not break these):
 *  1. The AI never queries anything. It only ever receives finished text.
 *  2. Permissions are ordinary code here, never instructions in a prompt.
 *  3. Resolvers run on demand (when a panel opens, or per question), and they
 *     return small AGGREGATED summaries, never raw rows — so cost stays flat
 *     whether a person has 20 records or 20,000.
 *  4. Field codes stay inside the feature/service layer; only plain language
 *     leaves this file.
 *
 * When the data model, business rules, or view permissions change, this file is
 * the only one that changes.
 */

import { retrieveStaticKnowledge, type KnowledgeTopic } from "@/lib/ai-static-knowledge";
type Lang = { isChinese: boolean };

const Z = (isChinese: boolean, zh: string, en: string) => (isChinese ? zh : en);

function line(label: string, value: string | number | null | undefined): string {
  const v = value === 0 ? "0" : value;
  return v ? `${label}: ${v}` : "";
}

function join(parts: Array<string | undefined | null>): string {
  return parts.filter(Boolean).join("\n");
}

// ───────────────────────────── Permission layer ─────────────────────────────

export type AccessLevel = "full" | "shared-card" | "none";

/**
 * What the signed-in viewer may see about a cared one.
 *  - "full": the viewer is a caregiver of this person, or a member of a care
 *    group that this person belongs to.
 *  - "shared-card": the viewer opened a shared information card (no account
 *    relationship) — only what is printed on that card.
 *  - "none": no relationship, nothing is attached.
 */
export async function resolveCaredOneAccess(
  caredOneId: string | undefined,
  opts: { sharedCard?: boolean } = {}
): Promise<AccessLevel> {
  if (!caredOneId) return "none";
  if (opts.sharedCard) return "shared-card";
  try {
    const { wpFetchCaredOnes } = await import("@/services/wp-data");
    const mine = await wpFetchCaredOnes();
    if (mine.some((c: any) => String(c.user_id) === String(caredOneId))) return "full";
  } catch {
    /* fall through */
  }
  try {
    const { wpFetchCareGroups } = await import("@/services/wp-data");
    const groups = await wpFetchCareGroups();
    const { fetchGroupCaredOneIdsWordPress } = await import("@/features/care-groups/source.wordpress-extended").catch(() => ({} as any));
    if (typeof fetchGroupCaredOneIdsWordPress === "function") {
      for (const g of groups) {
        const ids: string[] = await fetchGroupCaredOneIdsWordPress(String(g.id)).catch(() => []);
        if (ids.some((id) => String(id) === String(caredOneId))) return "full";
      }
    }
  } catch {
    /* fall through */
  }
  return "none";
}

/** Whether the viewer is a member of this care group. */
export async function resolveGroupAccess(groupId: string | undefined): Promise<AccessLevel> {
  if (!groupId) return "none";
  try {
    const { wpFetchCareGroups } = await import("@/services/wp-data");
    const groups = await wpFetchCareGroups();
    return groups.some((g: any) => String(g.id) === String(groupId)) ? "full" : "none";
  } catch {
    return "none";
  }
}

// ───────────────────────── Fact resolvers (aggregated) ──────────────────────

/** Who the viewer is, plus the people and groups they are connected to. */
export async function resolveViewerFacts({ isChinese }: Lang): Promise<string> {
  try {
    const { wpFetchCaredOnes, wpFetchCareGroups } = await import("@/services/wp-data");
    const [caredOnes, groups] = await Promise.all([
      wpFetchCaredOnes().catch(() => []),
      wpFetchCareGroups().catch(() => []),
    ]);
    return join([
      line(Z(isChinese, "今天日期", "Today"), new Date().toISOString().slice(0, 10)),
      line(
        Z(isChinese, "我照护的人", "People I care for"),
        caredOnes.map((c: any) => c.cared_one?.full_name).filter(Boolean).join("、") ||
          Z(isChinese, "无", "none")
      ),
      line(
        Z(isChinese, "我的护理群组", "My care groups"),
        groups.map((g: any) => g.name).filter(Boolean).join("、") || Z(isChinese, "无", "none")
      ),
    ]);
  } catch {
    return "";
  }
}

/** Medicine: schedule summary + today's adherence. Aggregated, never raw logs. */
export async function resolveMedicineFacts(caredOneId: string, { isChinese }: Lang): Promise<string> {
  try {
    const { fetchMedicinesWordPress, fetchTodayMedicineLogsWordPress } = await import(
      "@/features/medicine/source.medicine"
    );
    const [meds, logs] = await Promise.all([
      fetchMedicinesWordPress(caredOneId).catch(() => []),
      fetchTodayMedicineLogsWordPress(caredOneId).catch(() => []),
    ]);
    const schedule = meds
      .slice(0, 20)
      .map((m: any) => `${m.name}${m.dosage ? ` ${m.dosage}` : ""}${m.time_slot?.length ? ` @ ${m.time_slot.join(",")}` : ""}`)
      .join("; ");
    const taken = logs.filter((l: any) => String(l.status || "").includes("taken")).length;
    const skipped = logs.length - taken;
    return join([
      line(Z(isChinese, "用药安排", "Medicine schedule"), schedule || Z(isChinese, "未设置", "none set")),
      line(
        Z(isChinese, "今日用药记录", "Today's medicine log"),
        `${Z(isChinese, "已服用", "taken")} ${taken} / ${Z(isChinese, "跳过或未记录", "skipped or unlogged")} ${skipped}`
      ),
    ]);
  } catch {
    return "";
  }
}

/** Check-ins: what is scheduled and today's result. */
export async function resolveCheckInFacts(caredOneId: string, { isChinese }: Lang): Promise<string> {
  try {
    const { fetchCheckinsWordPress, fetchTodayCheckinLogsWordPress } = await import(
      "@/features/cared-ones/source.wordpress-extended"
    );
    const [checkins, logs] = await Promise.all([
      fetchCheckinsWordPress(caredOneId).catch(() => []),
      fetchTodayCheckinLogsWordPress(caredOneId).catch(() => []),
    ]);
    return join([
      line(
        Z(isChinese, "探望签到安排", "Check-ins scheduled"),
        checkins.slice(0, 10).map((c: any) => `${c.name || c.title || ""}${c.time ? ` @ ${c.time}` : ""}`).filter(Boolean).join("; ") ||
          Z(isChinese, "未设置", "none set")
      ),
      line(
        Z(isChinese, "今日签到", "Today's check-ins"),
        logs.length
          ? logs.slice(0, 5).map((l: any) => `${l.status || ""} ${String(l.summary || "").slice(0, 120)}`.trim()).join(" | ")
          : Z(isChinese, "今天还没有签到记录", "no check-in recorded yet today")
      ),
    ]);
  } catch {
    return "";
  }
}

/**
 * Location: latest position, safe zones, and — for "where is he usually?" —
 * a frequency summary over a wider window instead of hundreds of raw points.
 */
export async function resolveLocationFacts(
  caredOneId: string,
  { isChinese }: Lang,
  opts: { pattern?: boolean; sinceDays?: number } = {}
): Promise<string> {
  try {
    const { fetchCurrentLocation, fetchLocationHistory } = await import("@/features/location/source.wordpress");
    const { fetchSafeZonesWordPress } = await import("@/features/location/source.wordpress-extended");
    const [current, zones] = await Promise.all([
      fetchCurrentLocation(caredOneId).catch(() => null),
      fetchSafeZonesWordPress(caredOneId).catch(() => []),
    ]);

    let pattern = "";
    if (opts.pattern) {
      const sinceDays = opts.sinceDays ?? 30;
      const since = new Date(Date.now() - sinceDays * 86400_000).toISOString();
      const history = await fetchLocationHistory(caredOneId, { limit: 500, since }).catch(() => []);
      pattern = summarizeLocationPattern(history, zones, isChinese);
    }

    return join([
      line(
        Z(isChinese, "最新位置", "Latest location"),
        current
          ? `${current.address || `${current.latitude}, ${current.longitude}`}${current.captured_at ? ` (${current.captured_at})` : ""}`
          : Z(isChinese, "暂无位置数据", "no location data")
      ),
      line(
        Z(isChinese, "安全区", "Safe zones"),
        zones.slice(0, 10).map((z: any) => z.zone_name || z.name).filter(Boolean).join("、") ||
          Z(isChinese, "未设置", "none set")
      ),
      pattern,
    ]);
  } catch {
    return "";
  }
}

/** Turns hundreds of points into a handful of percentages. */
function summarizeLocationPattern(history: any[], zones: any[], isChinese: boolean): string {
  if (!history.length) return "";
  const bucket = new Map<string, number>();
  for (const p of history) {
    const zone = zones.find((z: any) => {
      const r = Number(z.radius_meters || 200);
      const d = haversine(Number(p.latitude), Number(p.longitude), Number(z.latitude), Number(z.longitude));
      return Number.isFinite(d) && d <= r;
    });
    const key = zone?.zone_name || zone?.name || Z(isChinese, "其他地点", "elsewhere");
    bucket.set(key, (bucket.get(key) || 0) + 1);
  }
  const total = history.length;
  const top = [...bucket.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k, n]) => `${k} ${Math.round((n / total) * 100)}%`)
    .join("、");
  return line(Z(isChinese, "常出现的地点（近一个月）", "Where they usually are (last month)"), top);
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return NaN;
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Tasks assigned to or created by the viewer, counts plus the next few. */
export async function resolveTaskFacts({ isChinese }: Lang): Promise<string> {
  try {
    const { wpFetchCareTasks } = await import("@/services/wp-data");
    const tasks = await wpFetchCareTasks().catch(() => []);
    const open = tasks.filter((t: any) => t.status !== "completed");
    return join([
      line(Z(isChinese, "未完成任务数", "Open tasks"), open.length),
      line(
        Z(isChinese, "最近的任务", "Next tasks"),
        open.slice(0, 5).map((t: any) => `${t.title}${t.due_date ? ` (${t.due_date})` : ""}`).join("; ")
      ),
    ]);
  } catch {
    return "";
  }
}

/** Group facts, gated on membership. */
export async function resolveGroupFacts(
  groupId: string | undefined,
  groupName: string | undefined,
  { isChinese }: Lang
): Promise<string> {
  const access = await resolveGroupAccess(groupId);
  if (access !== "full") {
    return line(Z(isChinese, "当前群组", "Current group"), groupName || Z(isChinese, "未指定", "unspecified"));
  }
  try {
    const { wpFetchCareGroups } = await import("@/services/wp-data");
    const groups = await wpFetchCareGroups();
    const g = groups.find((x: any) => String(x.id) === String(groupId));
    return join([
      line(Z(isChinese, "群组名称", "Group name"), g?.name || groupName),
      line(Z(isChinese, "群组说明", "Group description"), g?.description),
      line(
        Z(isChinese, "私密性", "Privacy"),
        g?.is_private ? Z(isChinese, "私密群组", "private") : Z(isChinese, "公开群组", "open")
      ),
    ]);
  } catch {
    return line(Z(isChinese, "群组名称", "Group name"), groupName);
  }
}

/**
 * Settings: read straight off the SETTING SKILLS registry at the bottom of this
 * same file, which also performs the writes. One structure, one file.
 */
export async function resolveSettingFacts({ isChinese }: Lang): Promise<string> {
  try {
    const skills = settingSkillsForApp().filter((s) => s.kind !== "action");
    const current = await fetchAppSettings().catch(() => null);
    const rows = skills.map((s) => {
      const value = current && s.readFrom ? s.readFrom(current) : undefined;
      const shown =
        typeof value === "boolean"
          ? Z(isChinese, value ? "开" : "关", value ? "on" : "off")
          : value == null
            ? Z(isChinese, "未设置", "not set")
            : String(value);
      const where =
        s.storage === "backend"
          ? Z(isChinese, "保存在账号里", "saved to the account")
          : s.storage === "local"
            ? Z(isChinese, "只保存在这台设备", "this device only")
            : Z(isChinese, "设备权限", "device permission");
      const allowed =
        s.kind === "switch"
          ? "true / false"
          : s.kind === "time"
            ? "HH:MM"
            : (s.options?.(isChinese) ?? []).map((o) => o.value).join(" / ");
      return `- ${s.name} — ${s.label(isChinese)}（${where}${allowed ? `; ${Z(isChinese, "可选值", "allowed")}: ${allowed}` : ""}）: ${shown}`;
    });
    return join([
      Z(
        isChinese,
        "用户设置全部保存在同一处（扩展资料 CCT 151 的应用设置 JSON）。要修改设置时，只能使用下面列出的 skill 名，并给出允许值：",
        "All user settings live in one place (the app-settings JSON on extended profile CCT 151). To change one, use only the skill names listed below with an allowed value:",
      ),
      ...rows,
    ]);
  } catch {
    return "";
  }
}


// ──────────────────────────── Request dispatcher ────────────────────────────

/** Cheap, deterministic intent detection. Rules, not a model. */
function needs(question: string) {
  const q = (question || "").toLowerCase();
  const has = (...terms: string[]) => terms.some((t) => q.includes(t));
  return {
    medicine: has("medicine", "medication", "dose", "pill", "用药", "吃药", "药"),
    checkIn: has("check-in", "checkin", "check in", "visit", "签到", "探望"),
    location: has("location", "where", "gps", "zone", "位置", "在哪", "定位", "安全区"),
    pattern: has("usually", "often", "pattern", "常", "经常", "一般在", "平时"),
    tasks: has("task", "todo", "任务", "待办"),
    settings: has("setting", "notification", "notify", "language", "theme", "dark mode", "text size", "quiet hours", "permission", "设置", "通知", "提醒方式", "语言", "主题", "字号", "免打扰", "权限"),
  };
}

export interface AssistantContextInput {
  question: string;
  isChinese: boolean;
  /** The cared one currently in view, when any. */
  caredOneId?: string;
  groupId?: string;
  groupName?: string;
  /** Which static knowledge topics this surface is allowed to quote. */
  topics?: KnowledgeTopic[];
  /** True when the reader came in through a public shared information card. */
  sharedCard?: boolean;
}

/**
 * The one entry point AI surfaces call. It picks the static snippets that match
 * the question and attaches only the permitted dynamic facts the question needs.
 */
export async function resolveAssistantContext(input: AssistantContextInput): Promise<string> {
  const { question, isChinese, caredOneId, groupId, groupName, topics, sharedCard } = input;
  const lang: Lang = { isChinese };
  const want = needs(question);

  const staticPart = retrieveStaticKnowledge(question, {
    topics,
    isChinese,
    fallbackToIndex: false,
  });

  const dynamic: string[] = [];
  const access = await resolveCaredOneAccess(caredOneId, { sharedCard });

  if (access === "full" && caredOneId) {
    const [med, chk, loc] = await Promise.all([
      want.medicine ? resolveMedicineFacts(caredOneId, lang) : Promise.resolve(""),
      want.checkIn ? resolveCheckInFacts(caredOneId, lang) : Promise.resolve(""),
      want.location
        ? resolveLocationFacts(caredOneId, lang, { pattern: want.pattern })
        : Promise.resolve(""),
    ]);
    dynamic.push(med, chk, loc);
  } else if (access === "none" && caredOneId && (want.medicine || want.checkIn || want.location)) {
    dynamic.push(
      Z(isChinese, "权限说明", "Access note") +
        ": " +
        Z(
          isChinese,
          "当前用户没有查看这位被护理者详细记录的权限，请说明无法提供，并建议联系家属。",
          "The viewer is not allowed to see this person's detailed records — say so plainly and suggest contacting the family."
        )
    );
  }

  if (want.tasks) dynamic.push(await resolveTaskFacts(lang));
  if (want.settings && !sharedCard) dynamic.push(await resolveSettingFacts(lang));

  if (groupId || groupName) dynamic.push(await resolveGroupFacts(groupId, groupName, lang));
  if (!sharedCard) dynamic.push(await resolveViewerFacts(lang));

  const facts = dynamic.filter(Boolean).join("\n");
  const factHeader = isChinese
    ? "以下是从数据库读取的、当前用户有权查看的事实。回答相关问题时只使用这些事实，缺少的就直接说明，不要编造。"
    : "The facts below were read from the database and are what this viewer is allowed to see. Use only these for data questions, say plainly when something is missing, and never invent values.";

  return [staticPart, facts ? `${factHeader}\n\n${facts}` : ""].filter(Boolean).join("\n\n");
}


// ═══════════════════════════ SETTING SKILLS (read + write) ═══════════════════
/**
 * ONE skill per user-facing setting. Each skill carries, in the same entry:
 *   • the wording shown on screen,
 *   • the allowed values,
 *   • how to READ the current value,
 *   • how to WRITE it (the real CCT / column / device target),
 *   • which sub-apps show it and, when they differ, the per-sub-app target.
 *
 * Everything goes through a skill NAME. The settings screen, the header theme
 * button, the language menu and the AI floating assistant all call the same
 * skill, so no front-end file stores a data structure or a write path.
 *
 * Sub-app detection: currentAppScope() only (URL `?__site=` in preview, the real
 * domain in production). Callers never pass an app. An edge/server caller must
 * pass an explicit app name through appScopeFromEdge(), which rejects anything
 * that is not one of the three known apps instead of silently defaulting.
 *
 * Storage targets used below:
 *   CCT 151 `users_extended_prof`, linked to the user by Relation 152
 *     challenged  → column a95  (User's app setting for ChallengeD)
 *     notchsafety → column a95  (same data as ChallengeD; it is a skin over it)
 *     carecnc     → column a96  (User's app setting for CareCNC)
 *   local  → this device only (localStorage / i18next)
 *   device → an OS permission; we only record that we asked
 */
import { wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getCurrentUserIdNumber } from "@/features/shared/current-user";
import { T, R } from "@/integrations/wp-schema";
import { currentAppScope, type AppScope } from "@/features/shared/app-scope";
import { findOwnRow, linkOwnRow } from "@/features/shared/own-profile-row";
import { checkPermission, requestPermission, type PermissionKind } from "@/features/settings/permissions";

const PROFILE_SLUG = T.userProfile.slug;
const PROFILE_F = T.userProfile.f;
const REL_USER_PROFILE = R.userProfileRel;

/** The three sub-apps this backend serves. */
export const KNOWN_APPS = ["challenged", "carecnc", "notchsafety"] as const;

/** Edge / server callers must name their app; unknown names are refused. */
export function appScopeFromEdge(appName: string): AppScope {
  const n = String(appName || "").toLowerCase();
  if (n === "carecnc") return "carecnc";
  // NotchSafety is a front-end skin over the ChallengeD care data.
  if (n === "challenged" || n === "notchsafety") return "challenged";
  throw new Error(`Unknown app "${appName}". Allowed: ${KNOWN_APPS.join(", ")}`);
}

/** Per-sub-app column on CCT 151 that holds the settings JSON. */
function settingsColumn(scope: AppScope = currentAppScope()): string {
  return scope === "carecnc"
    ? PROFILE_F.USER_S_APP_SETTING_FOR_CARECNC
    : PROFILE_F.USER_S_APP_SETTING_FOR_CHALLENGED;
}

export interface AppSettings {
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    /** categories switched off: chat | booking | system | location | check_in | medicine */
    muted_types: string[];
    quiet_hours?: { enabled: boolean; from: string; to: string };
  };
  display: {
    theme: "system" | "light" | "dark";
    text_size: "default" | "large" | "xlarge";
    reduce_motion: boolean;
  };
  permissions_asked: { push?: boolean; location?: boolean; calendar?: boolean };
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  notifications: { push: true, email: true, sms: false, muted_types: [] },
  display: { theme: "system", text_size: "default", reduce_motion: false },
  permissions_asked: {},
};

function mergeSettings(raw: any): AppSettings {
  const d = DEFAULT_APP_SETTINGS;
  return {
    notifications: { ...d.notifications, ...(raw?.notifications ?? {}) },
    display: { ...d.display, ...(raw?.display ?? {}) },
    permissions_asked: { ...d.permissions_asked, ...(raw?.permissions_asked ?? {}) },
  };
}

// Resolved through Relation 152 — a cct_author_id query filter is ignored by
// JetEngine on this route and would return another user's row.
const ownProfileRow = () => findOwnRow(REL_USER_PROFILE, PROFILE_SLUG);

export async function fetchAppSettings(scope: AppScope = currentAppScope()): Promise<AppSettings> {
  const row = await ownProfileRow();
  const raw = row?.[settingsColumn(scope)];
  if (!raw) return DEFAULT_APP_SETTINGS;
  try {
    return mergeSettings(typeof raw === "string" ? JSON.parse(raw) : raw);
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

async function saveAppSettings(patch: Partial<AppSettings>, scope: AppScope = currentAppScope()): Promise<AppSettings> {
  const userId = getCurrentUserIdNumber();
  const current = await fetchAppSettings(scope);
  const next = mergeSettings({ ...current, ...patch });
  const body = { [settingsColumn(scope)]: JSON.stringify(next) };

  const row = await ownProfileRow();
  if (row) {
    await wordpressCCTFetch(PROFILE_SLUG, { id: String(row.id ?? row._ID), method: "PUT", body });
    return next;
  }
  const created: any = await wordpressCCTFetch(PROFILE_SLUG, { method: "POST", body });
  const newId = created?.item_id ?? created?._ID ?? created?.id;
  if (!newId || !userId) throw new Error("Could not create the extended profile row for app settings");
  await linkOwnRow(REL_USER_PROFILE, newId);
  return next;
}

/** Puts the display half of the settings on screen at once. */
export function applyDisplaySettings(display: AppSettings["display"]) {
  const root = document.documentElement;
  root.classList.remove("text-size-large", "text-size-xlarge");
  if (display.text_size === "large") root.classList.add("text-size-large");
  if (display.text_size === "xlarge") root.classList.add("text-size-xlarge");
  root.classList.toggle("reduce-motion", !!display.reduce_motion);
}

/* ── skill shape ──────────────────────────────────────────────────────────── */

export type SettingGroupId =
  | "profile" | "channels" | "categories" | "quiet" | "display"
  | "language" | "permissions" | "privacy" | "provider" | "location";
export type SettingStorage = "backend" | "local" | "device";
export type SettingKind = "switch" | "choice" | "time" | "permission" | "form" | "action";

export interface SettingOption { value: string; label: string }

export interface SettingSkill<V = any> {
  /** The only lookup key, from AI and from the screens alike. */
  name: string;
  group: SettingGroupId;
  kind: SettingKind;
  storage: SettingStorage;
  /** "all" = every sub-app. */
  apps: AppScope[] | "all";
  label: (isChinese: boolean) => string;
  hint?: (isChinese: boolean) => string;
  options?: (isChinese: boolean) => SettingOption[];
  /** Reads the value out of the settings JSON (blob-backed skills). */
  readFrom?: (s: AppSettings) => V;
  /** Reads on its own (skills that do not live in the settings JSON). */
  read?: () => Promise<V>;
  /** The write. Blob-backed skills use patch; everything else uses run. */
  patch?: (s: AppSettings, value: V) => Partial<AppSettings>;
  run?: (value: V, scope: AppScope) => Promise<any>;
  /** Device permission this skill asks for. */
  permission?: PermissionKind;
  /** Cannot be switched off (safety alerts). */
  locked?: boolean;
  /** Plain note on how the sub-apps differ, kept next to the write itself. */
  perApp?: Partial<Record<AppScope, string>>;
}

/* ── languages (header menu and settings tab share this one list) ─────────── */

export const LANGUAGES = [
  { code: "en", flag: "🇺🇸" }, { code: "zh-CN", flag: "🇨🇳" }, { code: "zh-TW", flag: "🇹🇼" },
  { code: "ja", flag: "🇯🇵" }, { code: "ko", flag: "🇰🇷" }, { code: "es", flag: "🇪🇸" },
  { code: "fr", flag: "🇫🇷" }, { code: "de", flag: "🇩🇪" }, { code: "pt", flag: "🇧🇷" },
  { code: "hi", flag: "🇮🇳" }, { code: "ar", flag: "🇸🇦" }, { code: "vi", flag: "🇻🇳" },
  { code: "th", flag: "🇹🇭" }, { code: "id", flag: "🇮🇩" }, { code: "tl", flag: "🇵🇭" },
  { code: "ru", flag: "🇷🇺" }, { code: "it", flag: "🇮🇹" },
] as const;

/* ── the registry ─────────────────────────────────────────────────────────── */

const channelSkill = (
  key: "push" | "email" | "sms",
  name: string,
  zh: string, en: string, zhHint: string, enHint: string,
): SettingSkill<boolean> => ({
  name,
  group: "channels",
  kind: "switch",
  storage: "backend",
  apps: "all",
  label: (cn) => Z(cn, zh, en),
  hint: (cn) => Z(cn, zhHint, enHint),
  readFrom: (s) => s.notifications[key],
  patch: (s, value) => ({ notifications: { ...s.notifications, [key]: value } }),
});

const categorySkill = (
  key: string,
  name: string,
  zh: string, en: string, zhHint: string, enHint: string,
  opts: { locked?: boolean } = {},
): SettingSkill<boolean> => ({
  name,
  group: "categories",
  kind: "switch",
  storage: "backend",
  apps: "all",
  locked: opts.locked,
  label: (cn) => Z(cn, zh, en),
  hint: (cn) => Z(cn, zhHint, enHint),
  readFrom: (s) => !s.notifications.muted_types.includes(key),
  patch: (s, value) => {
    const muted = new Set(s.notifications.muted_types);
    value ? muted.delete(key) : muted.add(key);
    return { notifications: { ...s.notifications, muted_types: [...muted] } };
  },
});

const quietDefaults = { enabled: false, from: "22:00", to: "07:00" };
const quietOf = (s: AppSettings) => ({ ...quietDefaults, ...(s.notifications.quiet_hours ?? {}) });

export const SETTING_SKILLS: SettingSkill[] = [
  /* 1 — personal profile (name, photo, area). CCT 151/258 through the profile
     feature layer; every sub-app writes the same row, only the displayed name
     differs per app (per-app name column handled in app-scope.ts). */
  {
    name: "set-personal-profile",
    group: "profile",
    kind: "form",
    storage: "backend",
    apps: "all",
    label: (cn) => Z(cn, "个人资料（姓名、头像、地区）", "Personal details (name, photo, area)"),
    read: async () => {
      const { fetchMyProfileWordPress } = await import("@/features/profile/source.wordpress");
      return await fetchMyProfileWordPress();
    },
    run: async (value: Record<string, any>) => {
      const { updateProfileWordPress } = await import("@/features/profile/source.wordpress");
      await updateProfileWordPress(value);
    },
    perApp: {
      challenged: "CCT 151/258; display name in the per-app name column",
      carecnc: "same row; CareCNC name column",
    },
  },

  /* 2 — how we reach you */
  channelSkill("push", "set-alerts-on-phone", "手机提醒", "Phone alerts", "直接弹在你手机或电脑上", "Pop up on your phone or computer"),
  channelSkill("email", "set-alerts-by-email", "邮件", "Email", "发到你注册时用的邮箱", "Sent to the email address on your account"),
  channelSkill("sms", "set-alerts-by-text", "短信", "Text message", "只在紧急情况下发，比如老人走失", "Only for urgent things, such as a loved one going missing"),

  /* 3 — category muting */
  categorySkill("chat", "set-category-messages", "消息", "Messages", "家人或护理者给你发新消息时", "When family or a caregiver sends you a new message"),
  categorySkill("booking", "set-category-appointments", "预约", "Appointments", "预约被接受、确认或取消时", "When an appointment is accepted, confirmed or cancelled"),
  categorySkill("check_in", "set-category-visits", "探望与签到", "Visits and check-ins", "到了该去看看老人、该签到的时候", "Reminders when it is time to visit or check in"),
  categorySkill("medicine", "set-category-medicine", "吃药提醒", "Medicine reminders", "到了吃药或日常安排的时间", "When it is time for medicine or a daily routine"),
  categorySkill("location", "set-category-safety-alerts", "走失提醒", "Safety alerts", "老人走出安全范围时马上告诉你，这一项不能关", "If your loved one leaves the area you marked as safe — this one cannot be switched off", { locked: true }),
  categorySkill("system", "set-category-account", "账号消息", "Account messages", "登录、密码和账号安全相关的通知", "Sign-in, password and account safety notices"),

  /* 4 — quiet hours (default 22:00–07:00) */
  {
    name: "set-quiet-hours",
    group: "quiet",
    kind: "switch",
    storage: "backend",
    apps: "all",
    label: (cn) => Z(cn, "夜里不要打扰我", "Do not disturb at night"),
    hint: (cn) => Z(cn, "走失这类紧急提醒仍然会发。", "Urgent alerts, such as a loved one going missing, still come through."),
    readFrom: (s) => quietOf(s).enabled,
    patch: (s, value) => ({ notifications: { ...s.notifications, quiet_hours: { ...quietOf(s), enabled: value } } }),
  },
  {
    name: "set-quiet-hours-start",
    group: "quiet",
    kind: "time",
    storage: "backend",
    apps: "all",
    label: (cn) => Z(cn, "从", "From"),
    readFrom: (s) => quietOf(s).from,
    patch: (s, value) => ({ notifications: { ...s.notifications, quiet_hours: { ...quietOf(s), from: value } } }),
  },
  {
    name: "set-quiet-hours-end",
    group: "quiet",
    kind: "time",
    storage: "backend",
    apps: "all",
    label: (cn) => Z(cn, "到", "Until"),
    readFrom: (s) => quietOf(s).to,
    patch: (s, value) => ({ notifications: { ...s.notifications, quiet_hours: { ...quietOf(s), to: value } } }),
  },

  /* 6 — display */
  {
    name: "set-text-size",
    group: "display",
    kind: "choice",
    storage: "backend",
    apps: "all",
    label: (cn) => Z(cn, "字的大小", "Text size"),
    options: (cn) => [
      { value: "default", label: Z(cn, "标准", "Standard") },
      { value: "large", label: Z(cn, "大", "Large") },
      { value: "xlarge", label: Z(cn, "特大", "Extra large") },
    ],
    readFrom: (s) => s.display.text_size,
    patch: (s, value) => ({ display: { ...s.display, text_size: value } }),
  },
  {
    name: "set-light-or-dark",
    group: "display",
    kind: "choice",
    storage: "backend",
    apps: "all",
    label: (cn) => Z(cn, "亮色或暗色", "Light or dark"),
    options: (cn) => [
      { value: "system", label: Z(cn, "跟手机一样", "Match my device") },
      { value: "light", label: Z(cn, "亮色", "Light") },
      { value: "dark", label: Z(cn, "暗色", "Dark") },
    ],
    readFrom: (s) => s.display.theme,
    patch: (s, value) => ({ display: { ...s.display, theme: value } }),
  },
  {
    name: "set-reduce-motion",
    group: "display",
    kind: "switch",
    storage: "backend",
    apps: "all",
    label: (cn) => Z(cn, "减少晃动效果", "Reduce movement"),
    hint: (cn) => Z(cn, "关掉画面的滑动和淡入淡出，看着更稳。", "Turns off sliding and fading, which can feel steadier."),
    readFrom: (s) => s.display.reduce_motion,
    patch: (s, value) => ({ display: { ...s.display, reduce_motion: value } }),
  },

  /* 7 — language: this device only, so a shared account can be read in two languages */
  {
    name: "set-language",
    group: "language",
    kind: "choice",
    storage: "local",
    apps: "all",
    label: (cn) => Z(cn, "语言", "Language"),
    options: () => LANGUAGES.map((l) => ({ value: l.code, label: `${l.flag} ${l.code}` })),
    readFrom: () => {
      try { return localStorage.getItem("i18nextLng") || "en"; } catch { return "en"; }
    },
    run: async (value: string) => {
      try { localStorage.setItem("i18nextLng", value); } catch { /* ignore */ }
      const i18n = (await import("@/i18n/config")).default as any;
      await i18n?.changeLanguage?.(value);
    },
  },

  /* 5 — device permissions */
  {
    name: "set-permission-phone-alerts",
    group: "permissions",
    kind: "permission",
    storage: "device",
    apps: "all",
    permission: "push",
    label: (cn) => Z(cn, "手机提醒", "Phone alerts"),
    hint: (cn) => Z(cn, "允许后，即使没打开这个应用也能收到提醒", "Lets us reach you even when the app is closed"),
    readFrom: (s) => !!s.permissions_asked.push,
    patch: (s, value) => ({ permissions_asked: { ...s.permissions_asked, push: value } }),
  },
  {
    name: "set-permission-location",
    group: "permissions",
    kind: "permission",
    storage: "device",
    apps: "all",
    permission: "location",
    label: (cn) => Z(cn, "位置", "Location"),
    hint: (cn) => Z(cn, "用来看老人在哪里，以及是否走出安全范围", "Used to show where your loved one is and whether they left the safe area"),
    readFrom: (s) => !!s.permissions_asked.location,
    patch: (s, value) => ({ permissions_asked: { ...s.permissions_asked, location: value } }),
  },
  {
    name: "set-permission-calendar",
    group: "permissions",
    kind: "permission",
    storage: "device",
    apps: "all",
    permission: "calendar",
    label: (cn) => Z(cn, "日历", "Calendar"),
    hint: (cn) => Z(cn, "可选：把探望安排一起写进你手机的日历", "Optional: also writes visits into your phone's own calendar"),
    readFrom: (s) => !!s.permissions_asked.calendar,
    patch: (s, value) => ({ permissions_asked: { ...s.permissions_asked, calendar: value } }),
  },

  /* 8 — download my data (read-only across the tables the viewer owns) */
  {
    name: "download-my-data",
    group: "privacy",
    kind: "action",
    storage: "backend",
    apps: "all",
    label: (cn) => Z(cn, "下载我的数据", "Download my data"),
    run: async () => {
      const { fetchMyProfileWordPress } = await import("@/features/profile/source.wordpress");
      const [profile, settings] = await Promise.all([
        fetchMyProfileWordPress().catch(() => null),
        fetchAppSettings().catch(() => null),
      ]);
      return {
        exported_at: new Date().toISOString(),
        profile: profile
          ? {
              full_name: profile.full_name,
              email: profile.email,
              phone: profile.phone,
              location: profile.location,
              bio: profile.bio,
              avatar_url: profile.avatar_url,
              general_user_role: profile.general_user_role,
            }
          : null,
        settings,
      };
    },
  },

  /* 9 — close my account (anonymised on the server) */
  {
    name: "close-my-account",
    group: "privacy",
    kind: "action",
    storage: "backend",
    apps: "all",
    label: (cn) => Z(cn, "注销账号", "Close my account"),
    run: async () => {
      const { wpDeleteAccount } = await import("@/services/wp-auth");
      await wpDeleteAccount();
    },
  },

  /* 10 — provider profile and bookable hours (WooCommerce product + availability).
     Not offered in NotchSafety, which has no marketplace. */
  {
    name: "set-provider-availability",
    group: "provider",
    kind: "form",
    storage: "backend",
    apps: ["challenged", "carecnc"],
    label: (cn) => Z(cn, "可预约时间", "Bookable hours"),
    read: async () => {
      const { getProviderCalendarAvailability } = await import("@/features/calendar/booking-availability");
      const me = getCurrentUserIdNumber();
      if (!me) return null;
      return await getProviderCalendarAvailability(String(me));
    },
    run: async (value: { providerId?: string; slots: any[] }) => {
      const { upsertProviderCalendarAvailability } = await import("@/features/calendar/booking-availability");
      const providerId = value?.providerId || String(getCurrentUserIdNumber() ?? "");
      if (!providerId) throw new Error("set-provider-availability needs the signed-in provider");
      await upsertProviderCalendarAvailability(providerId, (value?.slots ?? []) as any);
    },
  },

  /* 11 — location sharing and per-safe-zone arrive/leave alerts (CCT 213 / 214) */
  {
    name: "set-location-sharing",
    group: "location",
    kind: "switch",
    storage: "backend",
    apps: "all",
    label: (cn) => Z(cn, "把我的位置分享给护理团队", "Share my location with my care team"),
    run: async (value: boolean) => {
      if (value) {
        const { getCurrentPosition } = await import("@/lib/geolocation");
        const pos = await getCurrentPosition();
        if (!pos) throw new Error("Could not read this device's location");
        const { shareMyLocationWordPress } = await import("@/features/location/source.wordpress-extended");
        await shareMyLocationWordPress(pos.coords.latitude, pos.coords.longitude);
        return;
      }
      const { disableMyLocationSharingWordPress } = await import("@/features/location/source.wordpress-extended");
      await disableMyLocationSharingWordPress();
    },
  },
  {
    name: "set-safe-zone-alerts",
    group: "location",
    kind: "form",
    storage: "backend",
    apps: "all",
    label: (cn) => Z(cn, "安全区的进入 / 离开提醒", "Arrive and leave alerts for a safe area"),
    hint: (cn) => Z(cn, "每个安全区各有两个开关。", "Each safe area has its own two switches."),
    run: async (value: { zoneId: string; notify_on_enter?: boolean; notify_on_exit?: boolean }) => {
      const { updateSafeZoneWordPress } = await import("@/features/location/source.wordpress-extended");
      const { zoneId, ...updates } = value;
      if (!zoneId) throw new Error("set-safe-zone-alerts needs a zoneId");
      await updateSafeZoneWordPress(String(zoneId), updates);
    },
  },
];

/* ── group wording (also one place) ───────────────────────────────────────── */

export const SETTING_GROUPS: {
  id: SettingGroupId;
  title: (isChinese: boolean) => string;
  description: (isChinese: boolean) => string;
}[] = [
  { id: "profile", title: (cn) => Z(cn, "个人资料", "Personal details"), description: (cn) => Z(cn, "别人在圈子里看到的就是这些。", "This is what other people in your circle see.") },
  { id: "channels", title: (cn) => Z(cn, "我们怎么联系你", "How we reach you"), description: (cn) => Z(cn, "关掉一项，我们就不会再用这个方式联系你。", "Switch one off and we will stop contacting you that way.") },
  { id: "categories", title: (cn) => Z(cn, "你想收到哪些提醒", "What you want to hear about"), description: (cn) => Z(cn, "这里的选择对上面每一种联系方式都有效。", "These choices apply to every way of contacting you above.") },
  { id: "quiet", title: (cn) => Z(cn, "免打扰时段", "Quiet hours"), description: (cn) => Z(cn, "这段时间里我们不发一般提醒。", "We hold back everyday reminders during these hours.") },
  { id: "display", title: (cn) => Z(cn, "看得清楚一点", "Making it easier to read"), description: (cn) => Z(cn, "这些改动马上生效，只影响你自己的界面。", "These take effect right away and only change what you see.") },
  { id: "language", title: (cn) => Z(cn, "语言", "Language"), description: (cn) => Z(cn, "只改这台设备上的显示语言。", "Changes the language on this device only.") },
  { id: "permissions", title: (cn) => Z(cn, "这台设备上的权限", "What this device allows"), description: (cn) => Z(cn, "只有你自己点了才会去问，随时可以改。", "We only ask when you tap, and you can change it any time.") },
  { id: "privacy", title: (cn) => Z(cn, "你的数据", "Your data"), description: (cn) => Z(cn, "随时可以带走或删除。", "You can take it with you or remove it at any time.") },
  { id: "provider", title: (cn) => Z(cn, "接单设置", "Taking bookings"), description: (cn) => Z(cn, "你提供的服务和可预约的时间。", "The services you offer and when you can be booked.") },
  { id: "location", title: (cn) => Z(cn, "位置与安全区", "Location and safe areas"), description: (cn) => Z(cn, "谁能看到位置，什么时候提醒你。", "Who can see the location, and when we alert you.") },
];

/* ── the one read / write API, by skill name ──────────────────────────────── */

export function settingSkill(name: string): SettingSkill | undefined {
  return SETTING_SKILLS.find((s) => s.name === name);
}

/** Every legal skill name. Handed to the AI verbatim, so it can never invent one. */
export const SETTING_SKILL_NAMES: string[] = SETTING_SKILLS.map((s) => s.name);

export function settingSkillAppliesTo(skill: SettingSkill, scope: AppScope = currentAppScope()): boolean {
  return skill.apps === "all" || skill.apps.includes(scope);
}

export function settingSkillsForApp(scope: AppScope = currentAppScope()): SettingSkill[] {
  return SETTING_SKILLS.filter((s) => settingSkillAppliesTo(s, scope));
}

/** Every skill of one group that the running app shows. */
export function settingSkillsInGroup(group: SettingGroupId, scope: AppScope = currentAppScope()): SettingSkill[] {
  return SETTING_SKILLS.filter((s) => s.group === group && settingSkillAppliesTo(s, scope));
}

/**
 * Guard for anything coming from outside (the AI above all). A wrong name, a
 * wrong type or a value outside the declared options is refused here and never
 * half-written.
 */
export function validateSettingWrite(
  name: string,
  value: any,
): { ok: true; skill: SettingSkill } | { ok: false; error: string } {
  const skill = settingSkill(name);
  if (!skill) return { ok: false, error: `Unknown setting skill: ${name}. Allowed: ${SETTING_SKILL_NAMES.join(", ")}` };
  if (!settingSkillAppliesTo(skill)) return { ok: false, error: `${name} is not available in this app` };
  if (skill.locked && value === false) return { ok: false, error: `${name} cannot be switched off` };
  if (skill.kind === "switch" && typeof value !== "boolean") return { ok: false, error: `${name} expects true or false` };
  if (skill.kind === "choice") {
    const allowed = (skill.options?.(false) ?? []).map((o) => o.value);
    if (allowed.length && !allowed.includes(String(value)))
      return { ok: false, error: `${name} expects one of: ${allowed.join(", ")}` };
  }
  if (skill.kind === "time" && !/^\d{2}:\d{2}$/.test(String(value)))
    return { ok: false, error: `${name} expects a time like 22:00` };
  return { ok: true, skill };
}

/** Current value of one skill, out of an already-fetched settings snapshot. */
export function readSettingSkill<V = any>(name: string, settings: AppSettings = DEFAULT_APP_SETTINGS): V | undefined {
  const skill = settingSkill(name);
  return skill?.readFrom ? (skill.readFrom(settings) as V) : undefined;
}

/** Current value of a skill that reads on its own (profile, availability…). */
export async function loadSettingSkill<V = any>(name: string): Promise<V | undefined> {
  const skill = settingSkill(name);
  return skill?.read ? ((await skill.read()) as V) : undefined;
}

/**
 * THE single write path for every setting, from any entry point (settings page,
 * header button, language menu, AI assistant, edge caller).
 */
export async function runSettingSkill(
  name: string,
  value?: any,
  opts: { settings?: AppSettings; app?: string } = {},
): Promise<AppSettings> {
  const scope = opts.app ? appScopeFromEdge(opts.app) : currentAppScope();
  const checked = validateSettingWrite(name, value);
  if (checked.ok === false) throw new Error(checked.error);
  const skill = checked.skill;

  if (skill.run) {
    const result = await skill.run(value, scope);
    if (skill.patch) {
      const base = opts.settings ?? (await fetchAppSettings(scope));
      return await saveAppSettings(skill.patch(base, value), scope);
    }
    return (result as any) ?? (opts.settings ?? DEFAULT_APP_SETTINGS);
  }

  if (!skill.patch) return opts.settings ?? DEFAULT_APP_SETTINGS;
  const base = opts.settings ?? (await fetchAppSettings(scope));
  const next = await saveAppSettings(skill.patch(base, value), scope);
  applyDisplaySettings(next.display);
  return next;
}

/** Ask the OS for a permission, then record that we asked. */
export async function askPermissionSkill(name: string, settings?: AppSettings) {
  const skill = settingSkill(name);
  if (!skill?.permission) throw new Error(`Not a permission skill: ${name}`);
  const state = await requestPermission(skill.permission);
  const next = await runSettingSkill(name, true, { settings });
  return { state, settings: next };
}

export async function permissionSkillStates() {
  const skills = SETTING_SKILLS.filter((s) => s.kind === "permission" && settingSkillAppliesTo(s));
  const states = await Promise.all(skills.map((s) => checkPermission(s.permission!)));
  return Object.fromEntries(skills.map((s, i) => [s.name, states[i]])) as Record<
    string,
    Awaited<ReturnType<typeof checkPermission>>
  >;
}
