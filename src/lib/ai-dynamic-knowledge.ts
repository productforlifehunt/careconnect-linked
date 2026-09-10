/**
 * ---
 * name: care-dynamic-knowledge
 * description: >-
 *   Dynamic skill for ChallengeD / CareCNC / NotchSafety. Use whenever a request
 *   needs this user's own data or changes it: cared ones, medicines, check-ins,
 *   care groups, tasks, bookings, locations and safe zones, notifications, and
 *   every app setting. Owns the data model (CCT + column codes), the per-sub-app
 *   write differences, view permissions, and the actual reads and writes.
 * keywords: [cared one, medicine, 用药, check-in, 签到, care group, 群组, task, 任务,
 *   booking, 预约, location, 定位, safe zone, 安全区, notification, 推送, setting, 设置]
 * entrypoints: [resolveAssistantContext(), resolveBriefingFacts(), resolveWriteSkill(),
 *   readSettingSkill(), runSettingSkill(), runNotificationSkill()]
 * ---
 *
 * Anthropic Agent Skills layout, expressed as an executable TypeScript module so
 * ordinary non-AI screens call the very same skills with zero token cost.
 *
 * Design rules (do not break these):
 *  1. The AI never queries anything. It only ever receives finished text, and it
 *     may only write by naming a skill declared here.
 *  2. Permissions are ordinary code here, never instructions in a prompt.
 *  3. Resolvers run on demand and return small AGGREGATED summaries, never raw
 *     rows — so cost stays flat whether a person has 20 records or 20,000.
 *  4. Field codes stay inside the feature/service layer; only plain language
 *     leaves this file.
 *  5. Sub-app is decided by currentAppScope() inside the skill; callers never
 *     pass it. Edge callers must send the lowercase sub-app id explicitly.
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

// ─────────────────── Facts → request text (context builders) ───────────────
// These belong to this file, not to the persona registry: they format facts
// that came out of the database above into the one-off context prompt.

export type InfoSheetPromptContext = {
  sheetName?: string;
  caredOneName?: string;
  description?: string;
  situationDetails?: string;
  contacts?: Array<{ name?: string; phone?: string; relationship?: string; note?: string }>;
  locationText?: string | null;
  knowledge?: string;
};

export function buildInfoSheetContext(ctx: InfoSheetPromptContext, isChinese: boolean): string {
  const facts = [
    ctx.sheetName ? `${isChinese ? "说明标题" : "Sheet"}: ${ctx.sheetName}` : "",
    ctx.caredOneName ? `${isChinese ? "被护理者" : "Person"}: ${ctx.caredOneName}` : "",
    ctx.description ? `${isChinese ? "基本情况" : "Background"}: ${ctx.description}` : "",
    ctx.situationDetails ? `${isChinese ? "本次护理安排" : "This situation"}: ${ctx.situationDetails}` : "",
    ctx.locationText ? `${isChinese ? "最近位置" : "Last known location"}: ${ctx.locationText}` : "",
    ctx.contacts?.length ? `${isChinese ? "紧急联系人" : "Emergency contacts"}: ${ctx.contacts.map((c) => [c.name, c.relationship, c.phone, c.note].filter(Boolean).join(" / ")).join(" | ")}` : "",
    ctx.knowledge || "",
  ].filter(Boolean).join("\n");
  const rule = isChinese
    ? "以下是这张信息卡的全部内容。只根据这些内容回答，缺少的信息就说卡片上没有写，并建议联系上面列出的联系人。对方通常是自愿帮忙的邻居、朋友或亲戚，语气温和、客气、感谢。"
    : "The facts below are everything on this information card. Answer only from them; when something is missing, say it is not written on the card and suggest contacting a listed contact. The reader is usually a neighbour, friend, or relative who volunteered to help, so be warm and appreciative.";
  return `${rule}\n\n${isChinese ? "信息卡内容" : "Card facts"}:\n${facts || (isChinese ? "（暂无更多信息）" : "(no further details provided)")}`;
}

export function buildInfoSheetIntroduction(task: string, caredOneName: string | undefined, isChinese: boolean): string {
  return isChinese
    ? `${caredOneName || "这位家人"}的家人正在请人帮忙。用两三句温和、感谢的话说明这次帮忙内容：${task}。不要使用命令句，最后邀请对方随时提问。`
    : `A family is asking a neighbour or friend for a favour. In two or three warm, appreciative, non-commanding sentences, explain this favour: ${task}. End by inviting questions.`;
}

export function buildCheckInContext(checkinName: string, instructions: string, caredOneName: string, isChinese: boolean): string {
  return isChinese
    ? `你正在为“${caredOneName}”进行“${checkinName}”每日探望签到。${instructions ? `附加说明：${instructions}。` : ""}\n逐个询问 3–5 个简短友好的问题，涵盖心情、睡眠、食欲、疼痛或不适、今日特别情况。每次不超过两句。信息足够后只返回 JSON：{"done":true,"summary":"用 2–3 句总结今天状态","status":"checked"}。明确跳过则返回：{"done":true,"summary":"用户选择跳过。","status":"skipped"}。`
    : `Conduct the “${checkinName}” daily check-in for “${caredOneName}”. ${instructions ? `Additional instructions: ${instructions}.` : ""}\nAsk 3–5 short, friendly questions one at a time about mood, sleep, appetite, pain or discomfort, and anything notable today. Keep each turn under two sentences. Once enough is known, return only JSON: {"done":true,"summary":"2–3 sentence summary","status":"checked"}. If they clearly skip, return: {"done":true,"summary":"User chose to skip.","status":"skipped"}.`;
}

export function buildMedicineDoseContext(dose: string, isChinese: boolean): string {
  return isChinese
    ? `这是已从用药日程精确读取的本次提醒：${dose}。只确认本次是否服用或跳过，不更改剂量。确认后只返回 JSON：{"done":true,"summary":"一句说明","status":"taken"} 或 status 为 "skipped"。`
    : `This reminder was read directly from the medicine schedule: ${dose}. Confirm only whether this dose was taken or skipped; never change dosage. When confirmed, return only JSON: {"done":true,"summary":"one sentence","status":"taken"} or status "skipped".`;
}

export function buildMedicineDoseStarter(dose: string, isChinese: boolean): string {
  return isChinese
    ? `现在提醒用户确认这次用药：${dose}。`
    : `Prompt the user to confirm this scheduled dose now: ${dose}.`;
}

export function buildSafetyContext(circleFacts: string, isChinese: boolean): string {
  const rule = isChinese
    ? "以下是这个圈子的位置与安全区事实。回答位置相关问题时只用这些事实，不要编造；缺失就直接说明。"
    : "The facts below are this circle's location and safe-zone data. For location questions use only these facts, never invent them, and say plainly when something is missing.";
  return `${rule}\n\n${isChinese ? "圈子事实" : "Circle facts"}:\n${circleFacts}`;
}

export function buildCareGroupHelpRequest(question: string, groupName: string | undefined, isChinese: boolean): string {
  return isChinese
    ? `用户正在使用护理群组${groupName ? `“${groupName}”` : ""}。可以解释群组内的首页、日历、任务、被护理者位置、对话、公告、祝福、相册、群组被护理者、成员、邀请成员、子群组和群组设置怎么用；不确定就直接说明。${question ? `问题：${question}` : ""}`
    : `The user is using their care group${groupName ? ` “${groupName}”` : ""}. You may explain how its Home, Calendar, Tasks, Cared One's Location, Messages, Announcements, Well Wishes, Gallery, Group Cared Ones, Members, Invite Members, Member Groups, and Group Setting features work, and say plainly when unsure.${question ? ` Question: ${question}` : ""}`;
}

export function buildBriefingRequest(data: string, isChinese: boolean): string {
  return isChinese
    ? `只根据数据写今日家庭护理简报，不编造安排。没有用药或签到安排时直接说明；有安排则说明时间和事项；任务仅在存在时提及。严格返回 JSON：{"alerts":[{"level":"high|medium|low","text":"..."}],"summary":"2-3 句中文，直接说今天几点做什么","suggestions":[{"title":"...","detail":"..."}]}\n数据：${data}`
    : `Write today's family-care briefing only from the data; never invent a schedule. State plainly when no medicine or check-in is scheduled; otherwise give each time and item. Mention tasks only when present. Return strict JSON: {"alerts":[{"level":"high|medium|low","text":"..."}],"summary":"2–3 sentences saying what is due and when","suggestions":[{"title":"...","detail":"..."}]}\nData: ${data}`;
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

/**
 * Dashboard smart-briefing facts. The dashboard page renders only; every read
 * and every permission decision happens here.
 */
export async function resolveBriefingFacts({ isChinese }: Lang): Promise<string> {
  const [viewer, tasks] = await Promise.all([
    resolveViewerFacts({ isChinese }),
    resolveTaskFacts({ isChinese }),
  ]);
  let bookings = "";
  let unread = "";
  try {
    const { wpFetchBookings } = await import("@/services/wp-data");
    const list = await wpFetchBookings().catch(() => []);
    const today = new Date().toISOString().slice(0, 10);
    const next = list
      .filter((b: any) => String(b.appointment_date || b.start_time || "").slice(0, 10) >= today)
      .slice(0, 5)
      .map((b: any) => `${b.service_name || b.title || ""} ${b.appointment_date || b.start_time || ""}`.trim())
      .filter(Boolean);
    bookings = line(Z(isChinese, "接下来的预约", "Upcoming bookings"), next.join("; "));
  } catch { /* optional */ }
  try {
    const { wpFetchConversations } = await import("@/services/wp-data");
    const convos = await wpFetchConversations().catch(() => []);
    const n = convos.reduce((sum: number, c: any) => sum + Number(c.unread_count || 0), 0);
    unread = line(Z(isChinese, "未读消息", "Unread messages"), n);
  } catch { /* optional */ }
  return join([viewer, tasks, bookings, unread]);
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
import { getCurrentUserIdNumber } from "@/features/shared/current-user";
import {
  fetchAppSettingsJson,
  saveAppSettingsJson,
  fetchHelpBubbleVisible,
  saveHelpBubbleVisible,
} from "@/features/shared/app-profile";
import { currentAppScope, type AppScope } from "@/features/shared/app-scope";
import { checkPermission, requestPermission, type PermissionKind } from "@/features/settings/permissions";

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
/* Settings live on CCT 151 column a87 of THIS app's row (a01), see app-profile. */

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
    /** Show the floating "?" app-help bubble. */
    help_bubble: boolean;
  };
  permissions_asked: { push?: boolean; location?: boolean; calendar?: boolean };
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  notifications: { push: true, email: true, sms: false, muted_types: [] },
  display: { theme: "system", text_size: "default", reduce_motion: false, help_bubble: true },
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

/**
 * Read / write of this app's settings. The JSON blob lives on column a87 of the
 * user's single row for this app (a01), and the "?" help button state lives on
 * its own column a92 — see features/shared/app-profile.ts.
 */
export async function fetchAppSettings(_scope: AppScope = currentAppScope()): Promise<AppSettings> {
  const [json, helpVisible] = await Promise.all([
    fetchAppSettingsJson().catch(() => null),
    fetchHelpBubbleVisible().catch(() => true),
  ]);
  const merged = mergeSettings(json);
  merged.display.help_bubble = helpVisible;
  return merged;
}

async function saveAppSettings(patch: Partial<AppSettings>, _scope: AppScope = currentAppScope()): Promise<AppSettings> {
  const current = await fetchAppSettings();
  const next = mergeSettings({ ...current, ...patch });
  if (next.display.help_bubble !== current.display.help_bubble) {
    await saveHelpBubbleVisible(next.display.help_bubble);
  }
  await saveAppSettingsJson(next);
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
  {
    name: "set-help-bubble",
    group: "display",
    kind: "switch",
    storage: "backend",
    apps: "all",
    label: (cn) => Z(cn, "显示“问号”帮助按钮", "Show the “?” help button"),
    hint: (cn) => Z(cn, "右下角的小问号。不知道怎么用这个应用时，点它问一句就行。", "The small “?” in the corner. Tap it to ask how to use this app."),
    readFrom: (s) => s.display.help_bubble,
    patch: (s, value) => ({ display: { ...s.display, help_bubble: value } }),
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
    kind: "form",
    storage: "backend",
    apps: "all",
    label: (cn) => Z(cn, "把我的位置分享给护理团队", "Share my location with my care team"),
    hint: (cn) => Z(cn, "开启后会写入当前位置并检查安全区（CCT 213 / 214）。", "Turning it on writes the current position and checks the safe areas (CCT 213 / 214)."),
    run: async (value: { enabled: boolean; isCaredOne?: boolean }) => {
      const enabled = typeof value === "boolean" ? value : !!value?.enabled;
      if (!enabled) {
        const { disableMyLocationSharingWordPress } = await import("@/features/location/source.wordpress-extended");
        await disableMyLocationSharingWordPress();
        return;
      }
      const { getCurrentPosition } = await import("@/lib/geolocation");
      const pos = await getCurrentPosition({ timeout: 10000 });
      if (!pos) throw new Error("Could not read this device's location");
      const { writeLocationAndCheckZones } = await import("@/features/location/source.wordpress");
      await writeLocationAndCheckZones(pos.latitude, pos.longitude, {
        accuracy: pos.accuracy,
        is_cared_one: !!(value as any)?.isCaredOne,
      });
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

/* ═══════════════════════════════════════════════════════════════════════════
 * WRITE SKILLS — the ONE place every AI-driven record write is declared.
 *
 * name: record-medicine-dose | record-check-in | save-care-tip
 *
 * Each write skill declares, in a single entry: the wording shown to the user,
 * the finish rule sent to the model, the allowed outcomes, the real database
 * write (delegated to the same feature function the manual form uses), and the
 * cached lists to refresh. The model never writes and never calls a tool — it
 * only returns {done, status, summary}, and it can only name a skill from
 * WRITE_SKILL_NAMES; anything else is rejected by resolveWriteSkill().
 * ═══════════════════════════════════════════════════════════════════════════ */

export type WriteSkillName = "record-medicine-dose" | "record-check-in" | "save-care-tip";

export const WRITE_SKILL_NAMES: WriteSkillName[] = [
  "record-medicine-dose",
  "record-check-in",
  "save-care-tip",
];

export interface WriteTarget {
  caredOneId?: string;
  /** Medicine record id (record-medicine-dose) or check-in record id (record-check-in). */
  recordId?: string;
  /** Human label used in the rule text, e.g. the medicine or check-in name. */
  label?: string;
  /** Extra plain-language detail, e.g. "Aricept · 5mg · 08:00". */
  detail?: string;
}

export interface WriteSkill {
  name: WriteSkillName;
  title: string;
  contextPrompt: string;
  starterPrompt: string;
  starterFallback: string;
  toastFor: (status?: string) => string;
  statuses: string[];
  rule: string;
  write: (result: { status?: string; summary?: string }) => Promise<void>;
  invalidateKeys: string[][];
}

const asStatus = (allowed: string[], status?: string) =>
  status && allowed.includes(status) ? status : allowed[0];

export function resolveWriteSkill(
  name: WriteSkillName,
  target: WriteTarget,
  { isChinese }: Lang
): WriteSkill {
  if (!WRITE_SKILL_NAMES.includes(name)) {
    throw new Error(`Unknown write skill: ${name}`);
  }
  const label = target.label || "";

  if (name === "record-medicine-dose") {
    const statuses = ["taken", "skipped", "no-response"];
    const dose = target.detail || label;
    const rule = Z(
      isChinese,
      `这是${label || "这次"}用药的记录对话。确认服用、跳过，或对方始终没有回应时，返回 JSON：{"done":true,"status":"taken|skipped|no-response","summary":"一两句说明"}。不要询问剂量以外的医疗判断。`,
      `This exchange records the ${label || "current"} dose. When it is confirmed taken, skipped, or the person never responds, return JSON: {"done":true,"status":"taken|skipped|no-response","summary":"one or two sentences"}. Do not give medical judgement beyond the dose.`
    );
    return {
      name,
      statuses,
      rule,
      title: Z(isChinese, "用药提醒", "Medicine reminder"),
      contextPrompt: [buildMedicineDoseContext(dose, isChinese), rule].join("\n\n"),
      starterPrompt: buildMedicineDoseStarter(dose, isChinese),
      starterFallback: Z(
        isChinese,
        `到了 ${label} 的用药时间。已经服用了吗？`,
        `It is time for ${label}. Has this dose been taken?`
      ),
      toastFor: (status) =>
        asStatus(statuses, status) === "taken"
          ? Z(isChinese, `${label} 已记录服用`, `${label} recorded as taken`)
          : Z(isChinese, `${label} 已跳过`, `${label} skipped`),
      write: async ({ status, summary }) => {
        const { logMedicineWordPress } = await import("@/features/medicine/source.medicine");
        await logMedicineWordPress({
          medicine_id: String(target.recordId),
          status: asStatus(statuses, status) === "taken" ? "taken" : "skipped",
          note: summary || undefined,
          user_id: target.caredOneId,
        } as any);
      },
      invalidateKeys: [["medicineLogs"], ["todayMedicineLogs"]],
    };
  }

  if (name === "record-check-in") {
    const statuses = ["checked", "skipped", "no-response"];
    const rule = Z(
      isChinese,
      `这是${label || "本次"}签到对话。签到完成、对方选择跳过，或对方始终没有回应时，返回 JSON：{"done":true,"status":"checked|skipped|no-response","summary":"把问到的情况写成一两句"}。`,
      `This exchange is the ${label || "current"} check-in. When it is completed, skipped, or the person never responds, return JSON: {"done":true,"status":"checked|skipped|no-response","summary":"one or two sentences of what was reported"}.`
    );
    return {
      name,
      statuses,
      rule,
      title: Z(isChinese, "AI 签到", "AI Check-In"),
      contextPrompt: [
        buildCheckInContext(
          label || Z(isChinese, "签到", "Check-In"),
          target.detail || "",
          Z(isChinese, "被护理者", "the cared one"),
          isChinese
        ),
        rule,
      ].join("\n\n"),
      starterPrompt: Z(isChinese, "现在请开始签到。", "Please start the check-in now."),
      starterFallback: Z(
        isChinese,
        "你好，到了签到时间。今天感觉怎么样？",
        "Hi, it is check-in time. How are you today?"
      ),
      toastFor: () => Z(isChinese, "AI 签到已保存", "AI check-in saved"),
      write: async ({ status, summary }) => {
        const { logCheckinWordPress } = await import(
          "@/features/cared-ones/source.wordpress-extended"
        );
        const s = asStatus(statuses, status);
        await logCheckinWordPress({
          checkin_id: String(target.recordId),
          status: s === "checked" ? "checked" : s === "skipped" ? "skipped" : "missed",
          note: summary || "",
          checked_by_ai: true,
          cared_one_id: target.caredOneId,
          checkin_name: label || undefined,
        });
      },
      invalidateKeys: [["checkinLogs"], ["todayCheckinLogs"]],
    };
  }

  const statuses = ["saved", "discarded"];
  const tipRule = Z(
    isChinese,
    `当用户想把一条护理小贴士存下来时，返回 JSON：{"done":true,"status":"saved","summary":"小贴士正文"}；用户改主意就用 status "discarded"。`,
    `When the user wants a care tip saved, return JSON: {"done":true,"status":"saved","summary":"the tip text"}; use status "discarded" if they change their mind.`
  );
  return {
    name: "save-care-tip",
    statuses,
    rule: tipRule,
    title: Z(isChinese, "护理小贴士", "Care tip"),
    contextPrompt: tipRule,
    starterPrompt: Z(isChinese, "请帮我把这条护理小贴士整理好。", "Help me word this care tip."),
    starterFallback: Z(isChinese, "想记下哪一条护理小贴士？", "Which care tip would you like to save?"),
    toastFor: (status) =>
      asStatus(statuses, status) === "saved"
        ? Z(isChinese, "小贴士已保存", "Care tip saved")
        : Z(isChinese, "已丢弃", "Discarded"),
    write: async ({ status, summary }) => {
      if (asStatus(statuses, status) !== "saved" || !summary) return;
      const { createCareTipWordPress } = await import(
        "@/features/cared-ones/source.wordpress-extended"
      );
      await createCareTipWordPress({ user_id: String(target.caredOneId), content: summary });
    },
    invalidateKeys: [["careTips"]],
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
 * NOTIFICATION SKILLS — the single executor for every push/inbox read & write
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Where things live (do not duplicate them anywhere else):
 *  - `src/features/notifications/notify-events.ts` stores ONLY the automatic
 *    trigger conditions (which business event notifies whom, with what wording).
 *    It holds no data structure, no column code, no per-app branch.
 *  - THIS file holds the data structure: CCT `notification` (185), the radio
 *    type column, title/content, `a58` = action url, read flag, and the
 *    JetEngine user→notification relation. Every read and write — triggered by
 *    an event, by a page, or (later) by the AI floating chat — goes through the
 *    skills below and is selected BY SKILL NAME.
 *  - Pages only render. They call a skill; they never know a column code.
 *
 * App scope: the browser never passes an app name. Each skill resolves it with
 * `currentAppScope()` (preview `?__site=` param or the live sub-app domain) and
 * the feature layer stamps the row via `appScopeBody("notification")`. All three
 * sub-apps (challenged / carecnc / notchsafety) currently share ONE storage
 * shape, so the per-app branch below is a single shared target; if one app ever
 * stores a notification in a different column or CCT, add its branch HERE,
 * inside the same skill — never a second skill and never a second file.
 * Edge calls must carry the lowercase slug and are validated by
 * `appScopeFromEdge()`, which throws instead of defaulting to "challenged".
 */

export type NotificationSkillName =
  | "send-notification"
  | "list-notifications"
  | "mark-notification-read"
  | "mark-all-notifications-read";

export const NOTIFICATION_SKILL_NAMES: NotificationSkillName[] = [
  "send-notification",
  "list-notifications",
  "mark-notification-read",
  "mark-all-notifications-read",
];

/** Semantic notification types the radio column accepts (aliases normalised). */
export const NOTIFICATION_TYPES = [
  "chat",
  "task",
  "booking",
  "system",
  "location",
  "check_in",
  "medicine",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

const NOTIFICATION_TYPE_ALIASES: Record<string, NotificationType> = {
  message: "chat",
  job: "system",
  community: "system",
  shared_task: "task",
  safe_zone: "location",
  safe_zone_breach: "location",
  location_alert: "location",
  location_request: "location",
  emergency_location_request: "location",
  sos: "location",
  checkin: "check_in",
};

export function normalizeNotificationType(type: string | undefined): NotificationType {
  const raw = String(type || "").trim();
  if ((NOTIFICATION_TYPES as readonly string[]).includes(raw)) return raw as NotificationType;
  return NOTIFICATION_TYPE_ALIASES[raw] ?? "system";
}

/** Which CCT / columns this app writes a notification to. */
export interface NotificationTarget {
  app: AppScope;
  /** JetEngine CCT slug (dictionary #185). */
  cct: "notification";
  /** Column purpose → live column code, as documented in the data dictionary. */
  columns: { type: string; title: string; content: string; actionUrl: string; isRead: string };
  /** JetEngine relation: parent = user, child = notification. */
  relation: "user→notification";
}

export function notificationTarget(scope: AppScope = currentAppScope()): NotificationTarget {
  // challenged / carecnc / notchsafety share one shape today.
  return {
    app: scope,
    cct: "notification",
    columns: { type: "a55", title: "a56", content: "a57", actionUrl: "a58", isRead: "a59" },
    relation: "user→notification",
  };
}

export interface SendNotificationParams {
  /** Recipient user ids; the actor is removed and duplicates dropped. */
  userIds: Array<string | number | null | undefined>;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  /** Keep the actor as a recipient (own-device alerts such as a zone breach). */
  includeSelf?: boolean;
}

export interface NotificationRow {
  id: string;
  type: string;
  title: string | null;
  message: string | null;
  is_read: boolean;
  action_url: string | null;
  created_at: string | null;
}

const stripWp = (id: string | number | null | undefined): string =>
  id == null ? "" : String(id).replace(/^wp-/, "");

/** Recipients minus the signed-in actor, de-duplicated, blanks dropped. */
export async function notificationRecipients(
  ids: Array<string | number | null | undefined>
): Promise<string[]> {
  let me = "";
  try {
    const { getStoredWPUser } = await import("@/services/wp-auth");
    me = stripWp(getStoredWPUser()?.user_id);
  } catch {
    /* not signed in — keep every recipient */
  }
  return [...new Set(ids.map(stripWp).filter(Boolean))].filter((id) => id !== me);
}

/**
 * The one dispatcher. AI and non-AI callers both land here, by skill name.
 * Sending is best-effort: a notification failure never fails the write that
 * already succeeded.
 */
export async function runNotificationSkill(
  name: "send-notification",
  params: SendNotificationParams
): Promise<number>;
export async function runNotificationSkill(
  name: "list-notifications",
  params?: { type?: string; unreadOnly?: boolean }
): Promise<NotificationRow[]>;
export async function runNotificationSkill(
  name: "mark-notification-read",
  params: { id: string }
): Promise<void>;
export async function runNotificationSkill(
  name: "mark-all-notifications-read",
  params?: undefined
): Promise<void>;
export async function runNotificationSkill(
  name: NotificationSkillName,
  params?: any
): Promise<any> {
  if (!NOTIFICATION_SKILL_NAMES.includes(name)) {
    throw new Error(`Unknown notification skill: ${name}`);
  }
  const source = await import("@/features/notifications/source.wordpress");

  if (name === "send-notification") {
    const p = params as SendNotificationParams;
    const targets = p?.includeSelf
      ? [...new Set((p.userIds ?? []).map(stripWp).filter(Boolean))]
      : await notificationRecipients(p?.userIds ?? []);
    if (targets.length === 0) return 0;
    const type = normalizeNotificationType(p.type);
    const title = String(p.title || "").trim();
    if (!title) throw new Error("send-notification requires a title");
    await Promise.all(
      targets.map((user_id) =>
        source
          .createNotificationWordPress({
            user_id,
            type,
            title,
            message: String(p.message || ""),
            action_url: p.actionUrl ?? null,
          })
          .catch(() => undefined)
      )
    );
    return targets.length;
  }

  if (name === "list-notifications") {
    const rows = (await source.fetchNotificationsWordPress()) as NotificationRow[];
    const wanted = params?.type ? normalizeNotificationType(params.type) : null;
    return rows.filter(
      (r) => (!wanted || r.type === wanted) && (!params?.unreadOnly || !r.is_read)
    );
  }

  if (name === "mark-notification-read") {
    const id = String(params?.id || "");
    if (!id) throw new Error("mark-notification-read requires an id");
    return source.markNotificationReadWordPress(id);
  }

  return source.markAllNotificationsReadWordPress();
}
