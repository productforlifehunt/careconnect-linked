/**
 * Per-app assistant names and minimal personas. Conversation skills live in
 * src/lib/ai-static-knowledge.ts; dynamic facts and permissions live in
 * src/lib/ai-dynamic-knowledge.ts.
 */
export type AILanguage = "zh" | "en" | "auto";
export type AISiteId = "challenged" | "carecnc" | "notchsafety";

type Persona = { zh: string; en: string; roleZh: string; roleEn: string };

// One canonical lowercase entry per sub-app.
const PERSONAS: Record<AISiteId, Persona> = {
  challenged: { zh: "AI助手小忆", en: "ChallengeD AI Assistant", roleZh: "失智症人士及其照护者", roleEn: "people with dementia and their caregivers" },
  carecnc: { zh: "护畅AI助手", en: "CareCNC AI Assistant", roleZh: "被护理者及其照护者", roleEn: "people receiving care and their caregivers" },
  notchsafety: { zh: "诺驰安全AI助手", en: "NotchSafety AI Assistant", roleZh: "用户与家人的位置安全", roleEn: "location safety for users and their families" },
};

const GENERIC_BRAND = { zh: "AI助手", en: "AI Assistant" };

function persona(site: string | undefined): Persona | undefined {
  const id = String(site || "").trim().toLowerCase();
  return Object.hasOwn(PERSONAS, id) ? PERSONAS[id as AISiteId] : undefined;
}

function isZhLang(language: string | undefined): boolean {
  return String(language || "auto").toLowerCase().startsWith("zh");
}

/** The assistant's display name for a language + sub-app. */
export function aiBrand(language: AILanguage | string | undefined, site?: string): string {
  const p = persona(site);
  return p ? (isZhLang(language) ? p.zh : p.en) : (isZhLang(language) ? GENERIC_BRAND.zh : GENERIC_BRAND.en);
}

/** Only the selected app's name, role, language, and shared tone/taboo. */
export function buildSystemPrompt(language = "auto", site?: string): string {
  const p = persona(site);
  const lang = String(language || "auto").toLowerCase();
  const identity = p
    ? lang.startsWith("zh")
      ? "你是" + p.zh + "，主要帮助" + p.roleZh + "。"
      : lang.startsWith("en")
        ? "You are " + p.en + ". You mainly help " + p.roleEn + "."
        : "You are " + p.en + " (中文名：" + p.zh + "). You mainly help " + p.roleEn + "."
    : lang.startsWith("zh") ? "你是一位 AI 助手。" : "You are an AI assistant.";
  const languageRule = lang.startsWith("zh")
    ? "只用简体中文回答。"
    : lang.startsWith("en")
      ? "Reply in English."
      : "Reply in the language of the user's latest message.";
  const tone = lang.startsWith("zh")
    ? "语气温暖、自然、耐心。任何话题都可以回答，不因偏离本应用方向而拒绝；用户想闲聊时自然陪聊，不把话题拉回护理、安全或定位。涉及医学时不作诊断或处方。"
    : "Be warm, natural, and patient. Answer questions on any topic without refusing because they are outside this app's focus; chat normally when the user wants to chat, without steering back to care, safety, or location. Do not diagnose or prescribe.";
  const conversationRule = lang.startsWith("zh")
    ? "每轮都判断当前是谁在对话，并区分他希望你回应的人。照护者让你把话告诉家人、但无法确定家人正在听时，只问一句家人现在是否在旁边；不要在同一回复里先确认又转达。确认家人正在听后再直接对他说。明确开启模拟来电时，把接听者作为对话对象，按来电设定直接说。用户只是问如何措辞时，给一句可直接使用的话，不要声称已经转达。"
    : "At every turn, identify who is currently speaking and distinguish them from the intended listener. If a caregiver asks you to tell a family member something but it is unclear whether that person is listening, ask only whether they are there; do not ask and relay the message in the same reply. Address them directly once their presence is clear. In an explicitly configured simulated call, treat the callee as the listener and follow the call setup. If the user only asks how to phrase something, give one ready-to-use line and do not claim you have delivered it.";
  return [identity, languageRule, tone, conversationRule].join("\n");
}

/**
 * Deterministic cleanup of the model's opening filler. Remove only the explicit
 * self-narration that says it is talking to the user; keep ordinary greetings.
 */
const OPENER_PATTERNS: RegExp[] = [
  /^i(?:'|’)m (?:talking|speaking) (?:to|with) you(?: now)?[^.!?\n]*[.!?]?\s*/i,
  /^(?:你好[，,]\s*)?我(?:现在)?(?:就)?(?:在)?(?:直接)?(?:和|跟)(?:你|您|她|他)(?:说话|聊|聊天|说)(?:了|吧)?[，。!！,\s]*/,
];

export function stripFillerOpening(text: string): string {
  let out = String(text ?? "").replace(/^\s+/, "");
  for (let pass = 0; pass < 4; pass++) {
    let changed = false;
    for (const re of OPENER_PATTERNS) {
      const next = out.replace(re, "");
      if (next !== out && next.trim()) {
        out = next.replace(/^\s+/, "");
        changed = true;
      }
    }
    if (!changed) break;
  }
  return out.trim() ? out : String(text ?? "").trim();
}

/** One degraded reply for every call. */
export function buildFallbackReply(language = "auto"): string {
  return isZhLang(language)
    ? "我暂时无法连接到 AI 服务，请稍后再试。"
    : "I'm temporarily having trouble reaching the AI service. Please try again in a moment.";
}

export function aiGreeting(isChinese: boolean, site?: string): string {
  const brand = aiBrand(isChinese ? "zh" : "en", site);
  return isChinese
    ? "你好，我是" + brand + "。想聊什么都可以。"
    : "Hi, I'm " + brand + ". Ask me anything, or just chat.";
}

/** Persona of the read-aloud voice (task=chat-voice). */
export const TTS_READER_SYSTEM_PROMPT =
  "Read the user's text aloud verbatim in its original language with natural, warm intonation. Do not add, remove, translate, or comment.";
