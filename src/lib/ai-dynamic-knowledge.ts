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

