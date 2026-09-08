/**
 * The single source of truth for every AI instruction in the product.
 *
 * Two kinds of text live here, and nothing else:
 *   1. The system prompt — a MINIMAL persona (name + tone). No feature lists,
 *      no data-model documentation, no per-screen rules.
 *   2. Context builders — plain functions that turn facts a page already read
 *      from the database into request text. Pages read data; these format it.
 *
 * Never put live care data in this file.
 */

export type AILanguage = "zh" | "en" | "auto";
export type AISiteId = "challenged" | "challenged-v1" | "carecnc" | "notchsafety";

const ASSISTANT_NAMES: Record<AISiteId, { zh: string; en: string }> = {
  challenged: { zh: "AI助手小忆", en: "ChallengeD AI Assistant" },
  "challenged-v1": { zh: "AI助手小忆", en: "ChallengeD AI Assistant" },
  carecnc: { zh: "护畅AI助手", en: "CareCNC AI Assistant" },
  notchsafety: { zh: "诺驰安全AI助手", en: "NotchSafety AI Assistant" },
};

function isZhLang(language: string | undefined): boolean {
  return String(language || "auto").toLowerCase().startsWith("zh");
}

function names(site: string | undefined) {
  return ASSISTANT_NAMES[(site as AISiteId)] || ASSISTANT_NAMES.challenged;
}

/** The assistant's display name for a language + site. */
export function aiBrand(language: AILanguage | string | undefined, site?: string): string {
  const n = names(site);
  return isZhLang(language) ? n.zh : n.en;
}

/** MINIMAL system prompt: who you are, how you speak. Nothing else. */
export function buildSystemPrompt(language = "auto", streaming = false, site?: string): string {
  const n = names(site);
  const lang = String(language || "auto").toLowerCase();
  const identity = lang.startsWith("zh")
    ? `你是${n.zh}，只用简体中文回答。`
    : lang.startsWith("en")
      ? `You are ${n.en}. Reply only in English.`
      : `Reply in the language of the user's latest message. In Chinese you are “${n.zh}”; in English you are “${n.en}”.`;

  const tone = lang.startsWith("zh")
    ? "语气温暖、亲切、简洁。任何问题都不要拒绝回答，即使与护理、安全或定位无关。用户只是闲聊时就陪着聊，不要把话题引回护理、安全或定位。不做医疗诊断、不开处方、不给投资建议；真正的紧急情况提醒立即联系当地急救。"
    : "Be warm, friendly, and concise. Never refuse a question, even when it has nothing to do with care, safety, or location. If the user just wants to chat, chat — never steer them back to care, safety, or location topics. Do not diagnose, prescribe, or give investment advice; for a real emergency, tell them to contact local emergency services.";

  const speech = streaming
    ? (lang.startsWith("zh")
        ? "每次回复 2–5 句，每句都用标点结尾，便于语音朗读。"
        : "Keep replies to 2–5 sentences and end every sentence with punctuation so speech playback can split cleanly.")
    : "";

  return [identity, tone, speech].filter(Boolean).join("\n\n");
}

/** One degraded reply for every call. */
export function buildFallbackReply(language = "auto"): string {
  return isZhLang(language)
    ? "我暂时无法连接到 AI 服务，请稍后再试。"
    : "I'm temporarily having trouble reaching the AI service. Please try again in a moment.";
}

export function aiGreeting(isChinese: boolean, site?: string): string {
  const n = names(site);
  return isChinese
    ? `你好，我是${n.zh}。想聊什么都可以。`
    : `Hi, I'm ${n.en}. Ask me anything, or just chat.`;
}

// ───────────────────────── Context builders (facts → request text) ──────────

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

export function buildInfoSheetIntroduction(task: string, caredOneName: string | undefined, isChinese: boolean): string {
  return isChinese
    ? `${caredOneName || "这位家人"}的家人正在请人帮忙。用两三句温和、感谢的话说明这次帮忙内容：${task}。不要使用命令句，最后邀请对方随时提问。`
    : `A family is asking a neighbour or friend for a favour. In two or three warm, appreciative, non-commanding sentences, explain this favour: ${task}. End by inviting questions.`;
}

export function buildWorkspaceNotesRequest(question: string, notes: string): string {
  return `Answer using only the workspace notes below. Cite sources inline as [1], [2], etc.; never invent citations. If the notes do not contain the answer, say so plainly and suggest the closest listed page.\n\nNotes:\n${notes || "(no matching notes found)"}\n\nQuestion: ${question}`;
}

export const TTS_READER_SYSTEM_PROMPT = "Read the user's text aloud verbatim in its original language with natural, warm intonation. Do not add, remove, translate, or comment.";
