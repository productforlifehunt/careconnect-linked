/**
 * ---
 * name: ai-dynamic-knowledge
 * description: >-
 *   Dynamic skill for ChallengeD / CareCNC / NotchSafety. Use whenever a request
 *   needs this user's own data or changes it: cared ones, medicines, check-ins,
 *   care groups, tasks, bookings, locations and safe zones, notifications, and
 *   every app setting and AI conversation. Owns data models, sub-app differences,
 *   view permissions, and the actual reads and writes.
 * keywords: [cared one, medicine, 用药, check-in, 签到, care group, 群组, task, 任务,
 *   booking, 预约, location, 定位, safe zone, 安全区, notification, 推送, setting, 设置,
 *   AI conversation, 对话记录, write care tip, 保存小贴士]
 * entrypoints: [resolveAssistantContext(), resolveBriefingFacts(), resolveWriteSkill(),
 *   runWriteSkill(), runAssistantWriteSkill(), runAssistantConversationSkill(),
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
import { DEFAULT_DISPLAY_SETTINGS, applyDisplaySettings } from "@/features/settings/display-preferences";
import { LANGUAGES } from "@/config/languages";
import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { readLinkedCCTRows } from "@/features/shared/cct-rows";
import { T, R } from "@/integrations/wp-schema";
import { appScopeBody, currentAppScope, isInAppScope, type AppScope } from "@/features/shared/app-scope";
import { getStoredWPUser } from "@/services/wp-auth";

export { applyDisplaySettings } from "@/features/settings/display-preferences";
export { LANGUAGES } from "@/config/languages";
type Lang = { isChinese: boolean };

// ─────────────────────── Assistant-conversations skill ─────────────────────
// CCT 121 conversations, REL 137 ownership, CCT 126 messages and REL 138 links.
// The model receives the finished transcript; all thread reads and writes use
// this same app-scoped skill and verify current-user ownership before access.
export const ASSISTANT_CONVERSATION_SKILL = "assistant-conversations" as const;
export interface AiThread { id: string; title: string; updatedAt: string }
export interface AiThreadMessage { role: "user" | "assistant"; content: string }
type AssistantConversationOperation = "list" | "create" | "load" | "append" | "touch";

const AI_CONV = T.chatConversation.slug;
const AI_CONV_FIELDS = T.chatConversation.f;
const AI_CONV_TYPE = T.chatConversation.opt.CHAT_TYPE.AI;
const AI_MESSAGE = T.chatMessage.slug;
const AI_MESSAGE_FIELDS = T.chatMessage.f;
const AI_MESSAGE_TYPE = T.chatMessage.opt.CHAT_MESSAGE_TYPE;
const AI_REL_MEMBER = R.conversationMembers;
const AI_REL_MESSAGE = R.conversationMessages;
const AI_MEMBER_JOINED = "a55";

const nowWPDateTime = () => new Date().toISOString().slice(0, 19).replace("T", " ");
const wpRowId = (row: any) => String(row?.item_id ?? row?._ID ?? row?.id ?? "");

function currentWPUserId(): number {
  const id = Number(getStoredWPUser()?.user_id);
  if (!id) throw new Error("Not signed in");
  return id;
}

async function ownsAssistantConversation(id: string): Promise<boolean> {
  if (!/^\d+$/.test(id)) return false;
  const [relations, conversation] = await Promise.all([
    wordpressFetch<any[]>(`jet-rel/${AI_REL_MEMBER}/children/${Number(id)}`),
    wordpressCCTFetch<any>(AI_CONV, { id }).catch(() => null),
  ]);
  return Boolean(conversation && isInAppScope("chatConversation", conversation)) &&
    Array.isArray(relations) && relations.some((relation) => Number(relation.child_object_id) === currentWPUserId());
}

export function runAssistantConversationSkill(
  skill: typeof ASSISTANT_CONVERSATION_SKILL,
  operation: "list",
): Promise<AiThread[]>;
export function runAssistantConversationSkill(
  skill: typeof ASSISTANT_CONVERSATION_SKILL,
  operation: "create",
  input?: { title?: string | undefined },
): Promise<string>;
export function runAssistantConversationSkill(
  skill: typeof ASSISTANT_CONVERSATION_SKILL,
  operation: "load",
  input: { id: string },
): Promise<AiThreadMessage[]>;
export function runAssistantConversationSkill(
  skill: typeof ASSISTANT_CONVERSATION_SKILL,
  operation: "append",
  input: { id: string; role: AiThreadMessage["role"]; content: string },
): Promise<void>;
export function runAssistantConversationSkill(
  skill: typeof ASSISTANT_CONVERSATION_SKILL,
  operation: "touch",
  input: { id: string; title?: string | undefined },
): Promise<void>;
export async function runAssistantConversationSkill(
  skill: typeof ASSISTANT_CONVERSATION_SKILL,
  operation: AssistantConversationOperation,
  input: { id?: string; title?: string; role?: AiThreadMessage["role"]; content?: string } = {},
): Promise<AiThread[] | AiThreadMessage[] | string | void> {
  if (skill !== ASSISTANT_CONVERSATION_SKILL) throw new Error(`Unknown AI skill: ${skill}`);

  if (operation === "list") {
    const relations = await wordpressFetch<any[]>(`jet-rel/${AI_REL_MEMBER}/parents/${currentWPUserId()}`);
    if (!Array.isArray(relations)) throw new Error("Could not load conversations");
    const ids = [...new Set(relations.map((relation) => String(relation.parent_object_id)).filter(Boolean))];
    const rows = await readLinkedCCTRows(AI_CONV, ids).catch(() => []);
    return rows
      .filter((conversation) => conversation && conversation[AI_CONV_FIELDS.CHAT_TYPE] === AI_CONV_TYPE && isInAppScope("chatConversation", conversation))
      .map((conversation) => ({
        id: wpRowId(conversation),
        title: conversation[AI_CONV_FIELDS.CHAT_NAME] || "",
        updatedAt: conversation[AI_CONV_FIELDS.LAST_MESSAGE_AT] || conversation.cct_modified || "",
      }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  if (operation === "create") {
    const created = await wordpressCCTFetch<any>(AI_CONV, {
      method: "POST",
      body: {
        [AI_CONV_FIELDS.CHAT_TYPE]: AI_CONV_TYPE,
        [AI_CONV_FIELDS.CHAT_NAME]: input.title || "",
        [AI_CONV_FIELDS.LAST_MESSAGE_AT]: nowWPDateTime(),
        ...appScopeBody("chatConversation", currentAppScope()),
      },
    });
    const id = wpRowId(created);
    if (!id) throw new Error("Could not create conversation");
    await wordpressFetch(`jet-rel/${AI_REL_MEMBER}`, {
      method: "POST",
      body: {
        parent_id: Number(id), child_id: currentWPUserId(), context: "child", store_items_type: "update",
        meta: { [AI_MEMBER_JOINED]: nowWPDateTime() },
      },
    });
    return id;
  }

  const id = input.id || "";
  if (!id || !(await ownsAssistantConversation(id))) throw new Error("Conversation is unavailable");

  if (operation === "load") {
    const relations = await wordpressFetch<any[]>(`jet-rel/${AI_REL_MESSAGE}/children/${Number(id)}`);
    if (!Array.isArray(relations) || relations.length === 0) return [];
    const ids = [...new Set(relations.map((relation) => String(relation.child_object_id)).filter((value) => /^\d+$/.test(value)))];
    const messages = await readLinkedCCTRows(AI_MESSAGE, ids);
    return messages
      .filter(Boolean)
      .sort((a, b) => Number(wpRowId(a)) - Number(wpRowId(b)))
      .map((message) => ({
        role: message[AI_MESSAGE_FIELDS.CHAT_MESSAGE_TYPE] === AI_MESSAGE_TYPE.AI ? "assistant" as const : "user" as const,
        content: message[AI_MESSAGE_FIELDS.CHAT_MESSAGE_CONTENT] || "",
      }));
  }

  if (operation === "append") {
    const created = await wordpressCCTFetch<any>(AI_MESSAGE, {
      method: "POST",
      body: {
        [AI_MESSAGE_FIELDS.CHAT_MESSAGE_CONTENT]: input.content || "",
        [AI_MESSAGE_FIELDS.CHAT_MESSAGE_TYPE]: input.role === "assistant" ? AI_MESSAGE_TYPE.AI : AI_MESSAGE_TYPE.TEXT,
      },
    });
    const messageId = Number(wpRowId(created));
    if (!messageId) throw new Error("Message not saved");
    await wordpressFetch(`jet-rel/${AI_REL_MESSAGE}`, {
      method: "POST",
      body: { parent_id: Number(id), child_id: messageId, context: "child", store_items_type: "update" },
    });
    return;
  }

  await wordpressCCTFetch(AI_CONV, {
    id,
    method: "PUT",
    body: {
      [AI_CONV_FIELDS.LAST_MESSAGE_AT]: nowWPDateTime(),
      ...(input.title ? { [AI_CONV_FIELDS.CHAT_NAME]: input.title } : {}),
    },
  });
}

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
  sheetName?: string | undefined;
  caredOneName?: string | undefined;
  description?: string | undefined;
  situationDetails?: string | undefined;
  contacts?: Array<{ name?: string | undefined; phone?: string | undefined; relationship?: string | undefined; note?: string | undefined }> | undefined;
  locationText?: string | null | undefined;
};

export function buildInfoSheetContext(ctx: InfoSheetPromptContext, isChinese: boolean): string {
  const facts = [
    ctx.sheetName ? `${isChinese ? "说明标题" : "Sheet"}: ${ctx.sheetName}` : "",
    ctx.caredOneName ? `${isChinese ? "被护理者" : "Person"}: ${ctx.caredOneName}` : "",
    ctx.description ? `${isChinese ? "基本情况" : "Background"}: ${ctx.description}` : "",
    ctx.situationDetails ? `${isChinese ? "本次护理安排" : "This situation"}: ${ctx.situationDetails}` : "",
    ctx.locationText ? `${isChinese ? "最近位置" : "Last known location"}: ${ctx.locationText}` : "",
    ctx.contacts?.length ? `${isChinese ? "紧急联系人" : "Emergency contacts"}: ${ctx.contacts.map((c) => [c.name, c.relationship, c.phone, c.note].filter(Boolean).join(" / ")).join(" | ")}` : "",
  ].filter(Boolean).join("\n");
  return `${isChinese ? "已知情况" : "Known details"}:\n${facts || (isChinese ? "（暂无更多信息）" : "(no further details provided)")}`;
}

export function buildInfoSheetIntroduction(task: string, caredOneName: string | undefined, isChinese: boolean): string {
  return isChinese
    ? `${caredOneName || "这位家人"}的家人正在请人帮忙。用两三句温和、感谢的话说明这次帮忙内容：${task}。不要使用命令句，最后邀请对方随时提问。`
    : `A family is asking a neighbour or friend for a favour. In two or three warm, appreciative, non-commanding sentences, explain this favour: ${task}. End by inviting questions.`;
}

export function buildCheckInContext(checkinName: string, instructions: string, caredOneName: string, isChinese: boolean): string {
  return isChinese
    ? `你正在为“${caredOneName}”进行“${checkinName}”每日探望签到。${instructions ? `附加说明：${instructions}。` : ""}\n逐个询问 3–5 个简短友好的问题，涵盖心情、睡眠、食欲、疼痛或不适、今日特别情况。每次不超过两句。信息足够后只返回 JSON：{"done":true,"summary":"用 2–3 句总结今天状态","status":"checked"}。对方明确选择跳过时返回 status "skipped"；明确表示没有得到回应时返回 status "no-response"。`
    : `Conduct the “${checkinName}” daily check-in for “${caredOneName}”. ${instructions ? `Additional instructions: ${instructions}.` : ""}\nAsk 3–5 short, friendly questions one at a time about mood, sleep, appetite, pain or discomfort, and anything notable today. Keep each turn under two sentences. Once enough is known, return only JSON: {"done":true,"summary":"2–3 sentence summary","status":"checked"}. Use status "skipped" when they clearly choose to skip, or "no-response" when they explicitly report receiving no response.`;
}

export function buildMedicineDoseContext(dose: string, isChinese: boolean): string {
  return isChinese
    ? `这是已从用药日程精确读取的本次提醒：${dose}。只确认本次是否服用、跳过或没有得到回应，不更改剂量。确认后只返回 JSON：{"done":true,"summary":"一句说明","status":"taken|skipped|no-response"}。`
    : `This reminder was read directly from the medicine schedule: ${dose}. Confirm only whether this dose was taken, skipped, or received no response; never change dosage. When confirmed, return only JSON: {"done":true,"summary":"one sentence","status":"taken|skipped|no-response"}.`;
}

export function buildMedicineDoseStarter(dose: string, isChinese: boolean): string {
  return isChinese
    ? `现在提醒用户确认这次用药：${dose}。`
    : `Prompt the user to confirm this scheduled dose now: ${dose}.`;
}

export function buildSafetyContext(circleFacts: string, isChinese: boolean): string {
  const rule = isChinese
    ? "以下是这个圈子当前的位置与安全区信息。回答位置相关问题时只用这些内容，不要编造；缺少时直接说明，不解释信息的存储方式或应用内部实现。"
    : "The following are this circle's current location and safe-zone details. Use them for location questions, never invent information, and say plainly when something is missing. Don't explain how the app stores or processes these details.";
  return `${rule}\n\n${isChinese ? "圈子事实" : "Circle facts"}:\n${circleFacts}`;
}

export function buildCareGroupHelpRequest(question: string, groupName: string | undefined, isChinese: boolean): string {
  return isChinese
    ? `用户正在护理群组${groupName ? `“${groupName}”` : ""}中寻求帮助。按用户当前问题回答。${question ? `问题：${question}` : ""}`
    : `The user is asking for help in their care group${groupName ? ` “${groupName}”` : ""}. Answer their current question. ${question ? `Question: ${question}` : ""}`;
}

export function buildBriefingRequest(data: string, isChinese: boolean): string {
  return isChinese
    ? `只根据数据写今日家庭护理简报，不编造安排。用家人日常会说的话，避免技术术语，不要提数据如何存储或应用如何实现。没有用药或签到安排时直接说明；有安排则说明时间和事项；任务仅在存在时提及。严格返回 JSON：{"alerts":[{"level":"high|medium|low","text":"..."}],"summary":"2-3 句中文，直接说今天几点做什么","suggestions":[{"title":"...","detail":"..."}]}\n数据：${data}`
    : `Write today's family-care briefing only from the data; never invent a schedule. Use everyday language for the family, avoid technical terms, and don't mention how information is stored or how the app is built. State plainly when no medicine or check-in is scheduled; otherwise give each time and item. Mention tasks only when present. Return strict JSON: {"alerts":[{"level":"high|medium|low","text":"..."}],"summary":"2–3 sentences saying what is due and when","suggestions":[{"title":"...","detail":"..."}]}\nData: ${data}`;
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
  opts: { sharedCard?: boolean | undefined } = {}
): Promise<AccessLevel> {
  if (!caredOneId) return "none";
  if (opts.sharedCard) return "shared-card";
  try {
    const { wpFetchCaredOnes } = await import("@/services/wp-data");
    const mine = await wpFetchCaredOnes();
    if (mine.some((c: any) => c?.invitation_status !== "pending" && String(c?.user_id) === String(caredOneId))) return "full";
  } catch {
    /* fall through */
  }
  try {
    const [{ wpFetchCareGroups }, { fetchGroupCaredOneIdsWordPress }] = await Promise.all([
      import("@/services/wp-data"),
      import("@/features/care-groups/source.wordpress"),
    ]);
    const groups = await wpFetchCareGroups();
    const groupCaredOneIds: string[][] = await Promise.all(
      groups.map((group: any) => fetchGroupCaredOneIdsWordPress(String(group.id)).catch((): string[] => [])),
    );
    const normalizedCaredOneId = String(caredOneId).replace(/^wp-/, "");
    if (groupCaredOneIds.some((ids) => ids.includes(normalizedCaredOneId))) return "full";
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
function viewerRoleText(profile: any, isChinese: boolean): string {
  const roles = ([] as string[]).concat(profile?.general_user_role || []).map((role) => String(role).toLowerCase());
  if (roles.some((role) => role.includes("cared"))) {
    return Z(isChinese, "账号登记为被护理者本人（只是起始假设，可随对话改变）", "account is registered as the person receiving care (starting assumption only; it may change during the conversation)");
  }
  if (roles.some((role) => role.includes("care"))) {
    return Z(isChinese, "账号登记为照护者（只是起始假设，可随对话改变）", "account is registered as a caregiver (starting assumption only; it may change during the conversation)");
  }
  return Z(isChinese, "账号登记身份未明确（请根据当前对话判断）", "the account role is not specified; infer the speaker from the current conversation");
}

/** Small role fact attached to each signed-in chat turn. */
export async function resolveViewerRoleFacts({ isChinese }: Lang): Promise<string> {
  try {
    const { fetchMyProfileWordPress } = await import("@/features/profile/source.wordpress");
    const profile = await fetchMyProfileWordPress();
    return line(Z(isChinese, "当前账号身份（仅作起始线索）", "Signed-in role (starting clue only)"), viewerRoleText(profile, isChinese));
  } catch {
    return "";
  }
}

export async function resolveViewerFacts({ isChinese }: Lang): Promise<string> {
  try {
    const { wpFetchCaredOnes, wpFetchCareGroups } = await import("@/services/wp-data");
    const { fetchMyProfileWordPress } = await import("@/features/profile/source.wordpress");
    const [caredOnes, groups, profile] = await Promise.all([
      wpFetchCaredOnes().catch(() => []),
      wpFetchCareGroups().catch(() => []),
      fetchMyProfileWordPress().catch(() => null as any),
    ]);
    const acceptedCaredOnes = caredOnes.filter((person: any) => person?.invitation_status !== "pending");
    return join([
      line(Z(isChinese, "今天日期", "Today"), new Date().toISOString().slice(0, 10)),
      line(Z(isChinese, "当前账号身份（仅作起始线索）", "Signed-in role (starting clue only)"), viewerRoleText(profile, isChinese)),
      line(
        Z(isChinese, "我照护的人", "People I care for"),
        acceptedCaredOnes.map((c: any) => c.cared_one?.full_name).filter(Boolean).join("、") ||
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

/** Additional information-card details, read only when the question needs them. */
export async function resolveInformationFacts(
  caredOneId: string,
  { isChinese }: Lang,
  wanted: { careTips?: boolean; carePlans?: boolean; careNotes?: boolean },
): Promise<string> {
  try {
    const {
      fetchCareTipsWordPress,
      fetchCarePlansWordPress,
      fetchCareNotesWordPress,
    } = await import("@/features/cared-ones/source.wordpress-extended");
    const [tips, plans, notes] = await Promise.all([
      wanted.careTips ? fetchCareTipsWordPress(caredOneId).catch(() => []) : Promise.resolve([]),
      wanted.carePlans ? fetchCarePlansWordPress(caredOneId).catch(() => []) : Promise.resolve([]),
      wanted.careNotes ? fetchCareNotesWordPress(caredOneId).catch(() => []) : Promise.resolve([]),
    ]);
    const list = (rows: any[], keys: string[]) => rows
      .slice(0, 12)
      .map((row) => keys.map((key) => row?.[key]).filter(Boolean).join(" — "))
      .filter(Boolean)
      .join("; ");
    return join([
      wanted.careTips ? line(Z(isChinese, "照护要点与喜好", "Care preferences and tips"), list(tips, ["title", "content"])) : "",
      wanted.carePlans ? line(Z(isChinese, "护理安排", "Care plans"), list(plans, ["title", "description", "content"])) : "",
      wanted.careNotes ? line(Z(isChinese, "护理记录", "Care notes"), list(notes, ["title", "content"])) : "",
    ]);
  } catch {
    return "";
  }
}

/**
 * Location: latest position, safe zones, and — for "where is he usually?" —
 * a frequency summary over a wider window instead of hundreds of raw points.
 */
async function readSharedCurrentLocation(caredOneId: string) {
  const { fetchLocationSharingFlags } = await import("@/features/location/sharing-flags");
  const flags = await fetchLocationSharingFlags(caredOneId);
  if (!flags.shareOn) return { shareOn: false, current: null };

  const { fetchCurrentLocation } = await import("@/features/location/source.wordpress");
  return { shareOn: true, current: await fetchCurrentLocation(caredOneId) };
}

function currentLocationSummary(
  current: { address_text?: string | null | undefined; latitude?: number | null | undefined; longitude?: number | null | undefined; captured_at?: string | null | undefined } | null,
  isChinese: boolean,
): string {
  if (!current) return Z(isChinese, "暂无位置数据", "no location data");
  const place = current.address_text ||
    (current.latitude != null && current.longitude != null
      ? `${current.latitude}, ${current.longitude}`
      : Z(isChinese, "暂无位置详情", "no position details"));
  return `${place}${current.captured_at ? ` (${current.captured_at})` : ""}`;
}

async function resolveBriefingLocationFacts(caredOneId: string, caredOneName: string | undefined, { isChinese }: Lang): Promise<string> {
  try {
    const { shareOn, current } = await readSharedCurrentLocation(caredOneId);
    if (!shareOn) return "";
    const label = caredOneName
      ? Z(isChinese, `${caredOneName}的最近位置`, `Latest location for ${caredOneName}`)
      : Z(isChinese, "最近位置", "Latest location");
    return line(label, currentLocationSummary(current, isChinese));
  } catch {
    return "";
  }
}

export async function resolveLocationFacts(
  caredOneId: string,
  { isChinese }: Lang,
  opts: { pattern?: boolean | undefined; sinceDays?: number | undefined } = {}
): Promise<string> {
  try {
    const { fetchLocationHistory } = await import("@/features/location/source.wordpress");
    const { fetchSafeZonesWordPress } = await import("@/features/location/source.wordpress-extended");
    const [location, zones] = await Promise.all([
      readSharedCurrentLocation(caredOneId),
      fetchSafeZonesWordPress(caredOneId).catch(() => []),
    ]);

    let pattern = "";
    if (opts.pattern && location.shareOn) {
      const sinceDays = opts.sinceDays ?? 30;
      const since = new Date(Date.now() - sinceDays * 86400_000).toISOString();
      const history = await fetchLocationHistory(caredOneId, { limit: 500, since }).catch(() => []);
      pattern = summarizeLocationPattern(history, zones, isChinese);
    }

    return join([
      line(Z(isChinese, "位置分享", "Location sharing"), location.shareOn ? Z(isChinese, "已开启", "on") : Z(isChinese, "未开启", "off")),
      line(
        Z(isChinese, "最新位置", "Latest location"),
        location.shareOn
          ? currentLocationSummary(location.current, isChinese)
          : Z(isChinese, "当前未分享位置", "not currently shared")
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
    const { fetchUserCaredOnesWordPress } = await import("@/features/cared-ones/source.wordpress");
    const [tasks, caredOnes] = await Promise.all([
      wpFetchCareTasks().catch(() => []),
      fetchUserCaredOnesWordPress().catch(() => []),
    ]);
    // Same rule as the dashboard task list: only tasks linked (task → cared-one
    // relation) to someone in this viewer's own cared-one list.
      const mine = new Set((caredOnes || [])
        .filter((person: any) => person?.invitation_status !== "pending")
        .map((c: any) => String(c.user_id).replace(/^wp-/, "")));
    const open = tasks.filter((t: any) => {
      const co = String(t.cared_one_id ?? "").replace(/^wp-/, "");
      return !!co && mine.has(co) && t.status !== "completed";
    });
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
  let notifications = "";
  let schedules = "";
  try {
    const { fetchUserCaredOnesWordPress } = await import("@/features/cared-ones/source.wordpress");
    const people = (await fetchUserCaredOnesWordPress()).filter((person: any) => person?.invitation_status !== "pending");
    schedules = (await Promise.all(people.map(async (person) => {
      const id = String(person.user_id).replace(/^wp-/, "");
      const caredOneName = person.cared_one?.full_name;
      const [medicine, checkins, location] = await Promise.all([
        resolveMedicineFacts(id, { isChinese }),
        resolveCheckInFacts(id, { isChinese }),
        resolveBriefingLocationFacts(id, caredOneName, { isChinese }),
      ]);
      return join([caredOneName, medicine, checkins, location]);
    }))).join("\n");
  } catch { /* optional */ }
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
  try {
    const rows = await runNotificationSkill("list-notifications", { unreadOnly: true });
    const latest = [...rows]
      .sort((a, b) => String(b?.created_at || "").localeCompare(String(a?.created_at || "")))
      .slice(0, 5);
    notifications = join([
      line(Z(isChinese, "未读通知数", "Unread notifications"), rows.length),
      line(
        Z(isChinese, "最近未读通知", "Recent unread notifications"),
        latest.map((row) => [row?.title, row?.message?.slice(0, 160)].filter(Boolean).join("：")).filter(Boolean).join("；")
      ),
    ]);
  } catch { /* optional */ }
  return join([viewer, tasks, schedules, bookings, unread, notifications]);
}

/** Group facts, gated on membership. */
export async function resolveGroupFacts(
  groupId: string | undefined,
  groupName: string | undefined,
  { isChinese }: Lang
): Promise<string> {
  if (!groupId) {
    return groupName ? line(Z(isChinese, "当前群组", "Current group"), groupName) : "";
  }
  try {
    const { wpFetchCareGroups } = await import("@/services/wp-data");
    const groups = await wpFetchCareGroups();
    const g = groups.find((x: any) => String(x.id) === String(groupId));
    if (!g) return "";
    return join([
      line(Z(isChinese, "群组名称", "Group name"), g?.name || groupName),
      line(Z(isChinese, "群组说明", "Group description"), g?.description),
      line(
        Z(isChinese, "私密性", "Privacy"),
        g?.is_private ? Z(isChinese, "私密群组", "private") : Z(isChinese, "公开群组", "open")
      ),
    ]);
  } catch {
    return "";
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
  const saveAction = has("save", "remember", "write down", "note down", "record", "保存", "存下", "记下", "记住", "记录");
  const careTipTerm = has("care tip", "care tips", "caregiving tip", "caregiving advice", "care preference", "care preferences", "care experience", "tip", "likes", "prefers", "dislikes", "hates", "favorite", "favourite", "routine", "小贴士", "照护经验", "护理建议", "偏好", "喜欢", "不喜欢", "讨厌", "最喜欢", "习惯");
  return {
    medicine: has("medicine", "medication", "dose", "pill", "用药", "吃药", "药"),
    checkIn: has("check-in", "checkin", "check in", "check-in log", "recent visit", "who visited", "签到", "探望", "探望记录"),
    location: has("location", "gps", "safe zone", "where is she", "where is he", "where is my family", "her location", "his location", "家人在哪里", "她在哪里", "他在哪里", "被护理者在哪", "位置", "定位", "安全区"),
    pattern: has("usually", "often", "pattern", "常", "经常", "一般在", "平时"),
    tasks: has("my care task", "my open task", "open care tasks", "task for my family", "my to-do", "my todo", "我的任务", "未完成任务", "照护任务", "待办"),
    settings: has("app setting", "notification setting", "notification preference", "change language", "app language", "display setting", "text size", "quiet hours", "privacy setting", "permission setting", "应用设置", "通知设置", "提醒方式", "修改语言", "更改语言", "字号设置", "免打扰", "权限设置", "隐私设置"),
    viewer: has("who do i care for", "who is in my care group", "my care groups", "my cared ones", "my profile", "my account details", "what do you know about my family", "我照护的人", "我的护理群组", "我的群组", "我的家人", "我的资料", "账号资料", "我照顾谁"),
    careTips: has("care tip", "care tips", "care preference", "what should i watch", "what should i know about", "daily routine", "her allergies", "his allergies", "her routine", "his routine", "what does she like", "what does he like", "tips for her", "tips for him", "护理小贴士", "照护要点", "喜好", "习惯", "忌口", "过敏", "注意事项", "今天需要注意", "她喜欢什么", "他喜欢什么", "她有什么习惯", "他有什么习惯", "照护须知"),
    carePlans: has("care plan", "care schedule", "daily care routine", "routine for her", "routine for him", "护理计划", "照护计划", "日常护理安排", "护理安排"),
    careNotes: has("care note", "care notes", "what is noted about", "previous care note", "护理记录", "护理笔记", "之前的记录", "保存过的照护信息"),
    saveCareTip: saveAction && careTipTerm,
  };
}

type ChatHistoryMessage = { role: "user" | "assistant"; content: string };

function hasCareTipWriteIntent(question: string, history: ChatHistoryMessage[] = []): boolean {
  if (needs(question).saveCareTip) return true;
  const recent = history.slice(-4);
  const priorExplicitRequest = recent.some((message) => message.role === "user" && needs(message.content).saveCareTip);
  const latest = recent.at(-1);
  if (!priorExplicitRequest || latest?.role !== "assistant") return false;
  const followUp = latest.content.toLowerCase();
  return /(?:which|what|who).{0,120}(?:tip|save|person|care)|(?:tell me|let me know).{0,120}(?:tip|save|person|care)/i.test(followUp) ||
    /哪(?:一条|个|位)|请(?:告诉|说明)|想保存|给哪位|谁的/.test(latest.content);
}

type AssistantSubject = { id?: string; name?: string; access: AccessLevel; choices?: string[] };

async function resolveAssistantSubject(question: string, caredOneId: string | undefined, sharedCard: boolean | undefined): Promise<AssistantSubject> {
  if (sharedCard) return { id: caredOneId, access: "shared-card" };
  if (caredOneId) return { id: caredOneId, access: await resolveCaredOneAccess(caredOneId) };

  try {
    const { wpFetchCaredOnes } = await import("@/services/wp-data");
    const people = (await wpFetchCaredOnes()).filter((person: any) => person?.invitation_status !== "pending");
    const questionLower = question.toLowerCase();
    const named = people.filter((person: any) => {
      const name = String(person?.cared_one?.full_name || "").trim().toLowerCase();
      return name && questionLower.includes(name);
    });
    const matching = named.length === 1 ? named[0] : named.length === 0 && people.length === 1 ? people[0] : undefined;
    if (matching) {
      return { id: String(matching.user_id), name: matching.cared_one?.full_name || undefined, access: "full" };
    }
    return {
      access: "none",
      choices: people.map((person: any) => person?.cared_one?.full_name).filter(Boolean),
    };
  } catch {
    return { access: "none" };
  }
}

function assistantSubjectFacts(subject: AssistantSubject, isChinese: boolean): string {
  if (subject.access === "shared-card") return "";
  if (subject.access === "full" && subject.id) {
    return line(Z(isChinese, "相关家人", "Person concerned"), subject.name);
  }
  if (subject.choices?.length) {
    return isChinese
      ? "可查询的家人：" + subject.choices.join("、") + "。如果用户没有说明是哪一位，先自然地询问。"
      : "People available to look up: " + subject.choices.join(", ") + ". If the user has not said which person, ask naturally before reading their details.";
  }
  return Z(
    isChinese,
    "当前没有可供查询的家人资料。若用户问个人记录，请说明目前无法查看并建议联系家属。",
    "There is no linked cared-one profile available for this question. If the user asks about personal records, say you cannot see them and suggest contacting the family.",
  );
}

function saveCareTipInstruction(subject: AssistantSubject, isChinese: boolean): string {
  const names = subject.choices?.length ? subject.choices : subject.name ? [subject.name] : [];
  return isChinese
    ? "用户明确要求保存一条护理小贴士。只有在小贴士内容清楚且保存对象明确时，才返回单独 JSON：{\"done\":true,\"skill\":\"save-care-tip\",\"status\":\"saved\",\"summary\":\"整理后的原意，不添加事实\",\"caredOneName\":\"可选家人姓名\"}。可选对象：" + (names.join("、") || "暂无已关联家人") + "。对象不明确或内容不完整时，先用普通对话询问；不要生成 JSON，也不要声称已保存。"
    : "The user explicitly asked to save a care tip. Return only this JSON when both the tip and its person are clear: {\"done\":true,\"skill\":\"save-care-tip\",\"status\":\"saved\",\"summary\":\"the tip, preserving its meaning without adding facts\",\"caredOneName\":\"optional cared-one name\"}. Available people: " + (names.join(", ") || "none linked") + ". If the person or tip is unclear, ask naturally first; do not return JSON or claim it was saved.";
}

export interface AssistantContextInput {
  question: string;
  isChinese: boolean;
  /** The cared one currently in view, when any. */
  caredOneId?: string | undefined;
  groupId?: string | undefined;
  groupName?: string | undefined;
  /** Current brand family for the app's static help entries. */
  appFamily?: string | undefined;
  /** Extra exact static skills needed by this surface, such as live voice. */
  staticSkillNames?: string[] | undefined;
  /** Information already visible on a card; extra private facts stay permission-gated below. */
  sheetContext?: InfoSheetPromptContext | undefined;
  /** Recent messages let the same skill continue a clear multi-turn write request. */
  history?: ChatHistoryMessage[] | undefined;
  /** Only these write skills are available from this chat surface. */
  writeSkills?: WriteSkillName[] | undefined;
  /** Which static knowledge topics this surface is allowed to quote. */
  topics?: KnowledgeTopic[] | undefined;
  /** True when the reader came in through a public shared information card. */
  sharedCard?: boolean | undefined;
}

/**
 * The one entry point AI surfaces call. It picks the static snippets that match
 * the question and attaches only the permitted dynamic facts the question needs.
 */
export async function resolveAssistantContext(input: AssistantContextInput): Promise<string> {
  const { question, isChinese, caredOneId, groupId, groupName, topics, sharedCard, appFamily, staticSkillNames = [], sheetContext, history = [], writeSkills = [] } = input;
  const lang: Lang = { isChinese };
  const want = needs(question);
  const allowCareTipWrite = hasCareTipWriteIntent(question, history) && writeSkills.includes("save-care-tip");
  const needPersonFacts = want.medicine || want.checkIn || want.location || want.careTips || want.carePlans || want.careNotes;

  const staticPart = retrieveStaticKnowledge(question, {
    topics,
    skillNames: ["assistant.conversation", ...staticSkillNames],
    appFamily,
    isChinese,
    fallbackToIndex: false,
  });

  const [subject, taskFacts, settingFacts, groupFacts, viewerFacts] = await Promise.all([
    needPersonFacts || allowCareTipWrite
      ? resolveAssistantSubject(question, caredOneId, sharedCard)
      : Promise.resolve({ id: caredOneId, access: sharedCard ? "shared-card" as const : "none" as const }),
    want.tasks ? resolveTaskFacts(lang) : Promise.resolve(""),
    want.settings && !sharedCard ? resolveSettingFacts(lang) : Promise.resolve(""),
    groupId || groupName ? resolveGroupFacts(groupId, groupName, lang) : Promise.resolve(""),
    sharedCard ? Promise.resolve("") : want.viewer ? resolveViewerFacts(lang) : resolveViewerRoleFacts(lang),
  ]);
  const dynamic: string[] = [
    sheetContext ? buildInfoSheetContext(sheetContext, isChinese) : "",
    taskFacts,
    settingFacts,
    groupFacts,
    viewerFacts,
  ];

  if (subject.access === "full" && subject.id && needPersonFacts) {
    const [med, chk, loc, details] = await Promise.all([
      want.medicine ? resolveMedicineFacts(subject.id, lang) : Promise.resolve(""),
      want.checkIn ? resolveCheckInFacts(subject.id, lang) : Promise.resolve(""),
      want.location ? resolveLocationFacts(subject.id, lang, { pattern: want.pattern }) : Promise.resolve(""),
      want.careTips || want.carePlans || want.careNotes
        ? resolveInformationFacts(subject.id, lang, { careTips: want.careTips, carePlans: want.carePlans, careNotes: want.careNotes })
        : Promise.resolve(""),
    ]);
    dynamic.push(assistantSubjectFacts(subject, isChinese), med, chk, loc, details);
  } else if (needPersonFacts || allowCareTipWrite) {
    dynamic.push(assistantSubjectFacts(subject, isChinese));
  }

  if (allowCareTipWrite) {
    dynamic.push(saveCareTipInstruction(subject, isChinese));
  }

  const facts = dynamic.filter(Boolean).join("\n");
  const factHeader = isChinese
    ? "以下是当前用户可以查看的相关信息。只在相关时使用这些内容，缺少时直接说明，不要编造；不要解释信息的来源或应用内部如何工作。"
    : "The following details are visible to this user. Use them only for relevant questions, plainly say when something is missing, and never invent facts. Don't explain where the information came from or how the app works internally.";

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
    quiet_hours?: { enabled: boolean; from: string; to: string } | undefined;
  };
  display: {
    theme: "system" | "light" | "dark";
    text_size: "default" | "large" | "xlarge";
    reduce_motion: boolean;
    /** Show the floating "?" app-help bubble. */
    help_bubble: boolean;
  };
  permissions_asked: { push?: boolean | undefined; location?: boolean | undefined; calendar?: boolean | undefined };
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  // Push starts OFF: it only becomes true once this device has actually
  // registered a token, so the switch can never promise alerts that
  // physically cannot arrive.
  notifications: { push: false, email: true, sms: false, muted_types: [] },
  display: { ...DEFAULT_DISPLAY_SETTINGS },
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
  hint?: ((isChinese: boolean) => string) | undefined;
  options?: ((isChinese: boolean) => SettingOption[]) | undefined;
  /** Reads the value out of the settings JSON (blob-backed skills). */
  readFrom?: ((s: AppSettings) => V) | undefined;
  /** Reads on its own (skills that do not live in the settings JSON). */
  read?: (() => Promise<V>) | undefined;
  /** The write. Blob-backed skills use patch; everything else uses run. */
  patch?: ((s: AppSettings, value: V) => Partial<AppSettings>) | undefined;
  run?: ((value: V, scope: AppScope) => Promise<any>) | undefined;
  /** Device permission this skill asks for. */
  permission?: PermissionKind | undefined;
  /** Cannot be switched off (safety alerts). */
  locked?: boolean | undefined;
  /** Plain note on how the sub-apps differ, kept next to the write itself. */
  perApp?: Partial<Record<AppScope, string>> | undefined;
}

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
  opts: { locked?: boolean | undefined } = {},
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
    run: async (value: { providerId?: string | undefined; slots: any[] }) => {
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
    run: async (value: { enabled: boolean; isCaredOne?: boolean | undefined }) => {
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
    run: async (value: { zoneId: string; notify_on_enter?: boolean | undefined; notify_on_exit?: boolean | undefined }) => {
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
  value?: any | undefined,
  opts: { settings?: AppSettings | undefined; app?: string | undefined } = {},
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
export async function askPermissionSkill(name: string, settings?: AppSettings | undefined) {
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
  caredOneId?: string | undefined;
  /** Medicine record id (record-medicine-dose) or check-in record id (record-check-in). */
  recordId?: string | undefined;
  /** Human label used in the rule text, e.g. the medicine or check-in name. */
  label?: string | undefined;
  /** Extra plain-language detail, e.g. "Aricept · 5mg · 08:00". */
  detail?: string | undefined;
  /** CCT 187 medication instructions copied to CCT 161 a97. */
  medicationNote?: string | undefined;
  /** Planned dose copied from CCT 187 into the Apple-shaped CCT 161 log. */
  doseQuantity?: number | null | undefined;
  doseUnit?: string | undefined;
  scheduleType?: string | undefined;
  conceptIdentifier?: string | undefined;
  /** Dose time "HH:MM" this medicine reminder answers (stored in CCT161 a88). */
  slot?: string | undefined;
}

export interface WriteSkill {
  name: WriteSkillName;
  title: string;
  contextPrompt: string;
  starterPrompt: string;
  starterFallback: string;
  toastFor: (status?: string | undefined) => string;
  statuses: string[];
  rule: string;
  write: (result: { status?: string | undefined; summary?: string | undefined }) => Promise<void>;
  invalidateKeys: string[][];
}

const asStatus = (allowed: string[], status?: string | undefined) => {
  if (!status || !allowed.includes(status)) {
    throw new Error("The AI returned an unsupported write status.");
  }
  return status;
};

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
        const { todayAtSlot } = await import("@/features/medicine/dose-slot");
        const outcome = asStatus(statuses, status);
        await logMedicineWordPress({
          medicine_id: String(target.recordId),
          status: outcome === "taken" ? "taken" : outcome === "skipped" ? "skipped" : "missed",
          note: summary || undefined,
          user_id: target.caredOneId,
          logged_by_ai: true,
          medication_note: target.medicationNote,
          dose_quantity: target.doseQuantity,
          scheduled_dose_quantity: target.doseQuantity,
          dose_unit: target.doseUnit,
          schedule_type: target.scheduleType,
          concept_identifier: target.conceptIdentifier,
          concept_display_text: label,
          rxcui: target.conceptIdentifier,
          scheduled_date: target.slot ? todayAtSlot(target.slot) : null,
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
        const { todayAtSlot } = await import("@/features/medicine/dose-slot");
        const s = asStatus(statuses, status);
        await logCheckinWordPress({
          checkin_id: String(target.recordId),
          status: s === "checked" ? "checked" : s === "skipped" ? "skipped" : "missed",
          note: summary || "",
          scheduled_date: target.slot ? todayAtSlot(target.slot) : new Date().toISOString(),
          checked_by_ai: true,
          cared_one_id: String(target.caredOneId),
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

export interface WriteSkillResult {
  status?: string | undefined;
  summary?: string | undefined;
}

export interface WriteSkillExecution extends WriteSkillResult {
  message: string;
  invalidateKeys: string[][];
}

/** Execute a named AI write after checking its target against current access. */
export async function runWriteSkill(
  name: WriteSkillName,
  target: WriteTarget,
  result: WriteSkillResult,
  { isChinese }: Lang,
): Promise<WriteSkillExecution> {
  const skill = resolveWriteSkill(name, target, { isChinese });
  const status = asStatus(skill.statuses, result.status);
  const summary = result.summary?.trim() || undefined;

  if (name === "save-care-tip" && status === "discarded") {
    return { status, summary, message: skill.toastFor(status), invalidateKeys: [] };
  }
  if (name !== "save-care-tip" && !target.recordId) throw new Error("The write target is unavailable.");
  if (!target.caredOneId || (await resolveCaredOneAccess(target.caredOneId)) !== "full") {
    throw new Error("The cared-one record is unavailable to this account.");
  }
  if (name === "save-care-tip" && !summary) throw new Error("The care tip is empty.");

  await skill.write({ status, summary });
  return { status, summary, message: skill.toastFor(status), invalidateKeys: skill.invalidateKeys };
}

export async function runAssistantWriteSkill(input: {
  skill: WriteSkillName;
  question: string;
  caredOneName?: string | undefined;
  caredOneId?: string | undefined;
  sharedCard?: boolean | undefined;
  history?: ChatHistoryMessage[] | undefined;
  result: WriteSkillResult;
  isChinese: boolean;
}): Promise<WriteSkillExecution> {
  if (input.skill !== "save-care-tip" || !hasCareTipWriteIntent(input.question, input.history)) {
    throw new Error("No care-tip save was requested.");
  }
  const skill = resolveWriteSkill(input.skill, {}, { isChinese: input.isChinese });
  const status = asStatus(skill.statuses, input.result.status);
  const summary = input.result.summary?.trim() || undefined;
  if (status === "discarded") {
    return { status, summary, message: skill.toastFor(status), invalidateKeys: [] };
  }
  if (!summary) throw new Error("The care tip is empty.");

  const subjectQuery = input.caredOneName?.trim() || input.question;
  const subject = await resolveAssistantSubject(subjectQuery, input.caredOneId, input.sharedCard);
  if (subject.access !== "full" || !subject.id) throw new Error("The selected cared-one record is unavailable to this account.");
  return runWriteSkill(input.skill, { caredOneId: subject.id }, { status, summary }, { isChinese: input.isChinese });
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
  actionUrl?: string | null | undefined;
  /** Keep the actor as a recipient (own-device alerts such as a zone breach). */
  includeSelf?: boolean | undefined;
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
  params?: { type?: string | undefined; unreadOnly?: boolean | undefined } | undefined
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
  params?: any | undefined
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
