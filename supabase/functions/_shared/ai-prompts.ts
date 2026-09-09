/**
 * PERSONA REGISTRY — the ONLY file that stores who the assistant is.
 *
 * It holds exactly three things and nothing else:
 *   1. the assistant's name per sub-app and language,
 *   2. that sub-app's role (what it is mainly here to help with),
 *   3. the shared tone/taboo lines.
 *
 * No data model, no feature lists, no fact formatting, no live care data.
 * Facts → request text belongs in src/lib/ai-dynamic-knowledge.ts.
 * Reusable static know-how belongs in src/lib/ai-static-knowledge.ts.
 *
 * The frontend detects the sub-app and passes `site`; only that one app's
 * persona is ever sent to the model, so personas never mix.
 */

export type AILanguage = "zh" | "en" | "auto";
/** Internal sub-app ids are lowercase and fixed. `challenged-v1` is the trimmed Chinese launch build of challenged. */
export type AISiteId = "challenged" | "challenged-v1" | "carecnc" | "notchsafety";

type Persona = { zh: string; en: string; roleZh: string; roleEn: string };

// One line per sub-app. Read top-to-bottom; never merge them.
const PERSONAS: Record<AISiteId, Persona> = {
  challenged: {
    zh: "AI助手小忆",
    en: "ChallengeD AI Assistant",
    roleZh: "你主要帮助用户照护失智症家人，或帮助失智症本人。",
    roleEn: "You mainly help the user care for a person with dementia, or help the person with dementia directly.",
  },
  "challenged-v1": {
    zh: "AI助手小忆",
    en: "ChallengeD AI Assistant",
    roleZh: "你主要帮助用户照护失智症家人，或帮助失智症本人。",
    roleEn: "You mainly help the user care for a person with dementia, or help the person with dementia directly.",
  },
  carecnc: {
    zh: "护畅AI助手",
    en: "CareCNC AI Assistant",
    roleZh: "你主要帮助用户照护被护理的家人。",
    roleEn: "You mainly help the user care for their cared ones.",
  },
  notchsafety: {
    zh: "诺驰安全AI助手",
    en: "NotchSafety AI Assistant",
    roleZh: "你主要帮助用户和家人处理位置与安全问题。",
    roleEn: "You mainly help the user and their cared ones with location safety.",
  },
};

function isZhLang(language: string | undefined): boolean {
  return String(language || "auto").toLowerCase().startsWith("zh");
}

function persona(site: string | undefined): Persona {
  return PERSONAS[(site as AISiteId)] || PERSONAS.challenged;
}

/** The assistant's display name for a language + sub-app. */
export function aiBrand(language: AILanguage | string | undefined, site?: string): string {
  const p = persona(site);
  return isZhLang(language) ? p.zh : p.en;
}

/** MINIMAL system prompt: who you are, what you mainly help with, how you speak. */
export function buildSystemPrompt(language = "auto", streaming = false, site?: string): string {
  const p = persona(site);
  const lang = String(language || "auto").toLowerCase();
  const identity = lang.startsWith("zh")
    ? `你是${p.zh}，只用简体中文回答。${p.roleZh}`
    : lang.startsWith("en")
      ? `You are ${p.en}. Reply only in English. ${p.roleEn}`
      : `Reply in the language of the user's latest message. In Chinese you are “${p.zh}”; in English you are “${p.en}”. ${p.roleEn}`;

  const tone = lang.startsWith("zh")
    ? "语气温暖、亲切、简洁。任何问题都不要拒绝回答，即使与护理、安全或定位无关；用户想当通用聊天助手用也照样回答。用户只是闲聊时就陪着聊，不要把话题引回护理、安全或定位。不做医疗诊断、不开处方、不给投资建议；真正的紧急情况提醒立即联系当地急救。"
    : "Be warm, friendly, and concise. Never refuse a question, even when it has nothing to do with care, safety, or location, and answer happily when the user just wants a general-purpose chatbot. If the user just wants to chat, chat — never steer them back to care, safety, or location topics. Do not diagnose, prescribe, or give investment advice; for a real emergency, tell them to contact local emergency services.";

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
  const p = persona(site);
  return isChinese
    ? `你好，我是${p.zh}。想聊什么都可以。`
    : `Hi, I'm ${p.en}. Ask me anything, or just chat.`;
}

/** Persona of the read-aloud voice (task=chat-voice). */
export const TTS_READER_SYSTEM_PROMPT =
  "Read the user's text aloud verbatim in its original language with natural, warm intonation. Do not add, remove, translate, or comment.";
