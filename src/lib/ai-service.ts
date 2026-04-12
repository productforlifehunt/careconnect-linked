/**
 * AI Service — WordPress-backed AI integration.
 */

import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";

export type AIMode =
  | "insights"
  | "cognitive_exercise"
  | "medication_check"
  | "behavior_analysis"
  | "care_tips"
  | "daily_summary"
  | "routine_suggestion"
  | "general_chat";

export interface AIChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface InvokeAIOptions {
  conversationId?: string;
  title?: string;
  caredOneId?: string | number | null;
  messages?: AIChatMessage[];
}

const MODEL_NAME = "google/gemma-3-4b-it:free";
const CONVERSATION_SLUG = "ai_conversations";
const MESSAGE_SLUG = "ai_messages";
const CONTEXT_SLUG = "ai_context_memory";

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function unixNow() {
  return Math.floor(Date.now() / 1000);
}

function conversationStorageKey(mode: AIMode, caredOneId?: string | number | null) {
  return `ai_conversation:${mode}:${caredOneId ?? "none"}`;
}

async function ensureConversation(mode: AIMode, options: InvokeAIOptions = {}) {
  const user = getStoredWPUser();
  const cachedId = options.conversationId || localStorage.getItem(conversationStorageKey(mode, options.caredOneId));

  if (cachedId) {
    try {
      const existing = await wordpressCCTFetch<Record<string, any>>(CONVERSATION_SLUG, { id: cachedId });
      if (existing?.id) {
        localStorage.setItem(conversationStorageKey(mode, options.caredOneId), String(existing.id));
        return String(existing.id);
      }
    } catch {}
  }

  const result = await wordpressCCTFetch<any>(CONVERSATION_SLUG, {
    method: "POST",
    body: {
      conversation_id: createId(),
      user_id: user?.user_id || 0,
      cared_one_id: options.caredOneId ? Number(options.caredOneId) : 0,
      title: options.title || mode.replace(/_/g, " "),
      conversation_type: mode,
      status: "active",
      last_message_at: unixNow(),
      message_count: 0,
      metadata: "",
    },
  });

  const createdId = String(result?.item_id || result?.id || result?._ID);
  localStorage.setItem(conversationStorageKey(mode, options.caredOneId), createdId);
  return createdId;
}

async function createMessage(conversationId: string, role: AIChatMessage["role"], content: string, mode: AIMode, rawResponse = "") {
  await wordpressCCTFetch(MESSAGE_SLUG, {
    method: "POST",
    body: {
      conversation_id: conversationId,
      message_id: createId(),
      role,
      ai_mode: mode,
      content,
      context_used: rawResponse,
      tokens_used: 0,
      model_name: MODEL_NAME,
      created_at: unixNow(),
    },
  });
}

async function touchConversation(conversationId: string) {
  try {
    const messages = await wordpressCCTFetch<any[]>(MESSAGE_SLUG, { params: { _limit: 200 } });
    const count = (Array.isArray(messages) ? messages : []).filter((item) => String(item.conversation_id) === String(conversationId)).length;
    await wordpressCCTFetch(CONVERSATION_SLUG, {
      id: conversationId,
      method: "PUT",
      body: {
        last_message_at: unixNow(),
        message_count: count,
      },
    });
  } catch {}
}

function buildSystemPrompt(mode: AIMode) {
  const base = "You are a dementia care assistant. Be compassionate, practical, concise, and safety-first. Never claim to replace a doctor. Escalate emergencies immediately.";
  const modePrompt: Record<AIMode, string> = {
    insights: "Analyze care coordination patterns and suggest the most actionable next steps.",
    cognitive_exercise: "Return a gentle dementia-friendly exercise as valid JSON only.",
    medication_check: "Flag possible issues conservatively and remind the user to verify with a clinician or pharmacist.",
    behavior_analysis: "Identify likely triggers, patterns, and non-pharmacological strategies.",
    care_tips: "Provide practical dementia care tips tailored to the situation.",
    daily_summary: "Summarize the care day clearly, warmly, and usefully.",
    routine_suggestion: "Suggest safe, simple dementia-friendly routines.",
    general_chat: "Answer dementia care questions helpfully and naturally.",
  };
  return `${base} ${modePrompt[mode]}`;
}

function normalizeMessages(mode: AIMode, prompt: string, messages?: AIChatMessage[]) {
  const baseMessages = messages && messages.length > 0
    ? messages
    : [{ role: "user" as const, content: prompt }];

  if (baseMessages[0]?.role === "system") {
    return baseMessages;
  }

  return [{ role: "system" as const, content: buildSystemPrompt(mode) }, ...baseMessages];
}

function extractReply(response: any): string {
  if (!response) return "";
  if (typeof response === "string") return response;
  if (typeof response.reply === "string") return response.reply;
  if (typeof response.result === "string") return response.result;
  if (typeof response.message === "string") return response.message;
  if (typeof response.output === "string") return response.output;
  if (typeof response.text === "string") return response.text;
  if (typeof response.data === "string") return response.data;
  if (typeof response?.data?.reply === "string") return response.data.reply;
  if (typeof response?.data?.result === "string") return response.data.result;
  if (typeof response?.choices?.[0]?.message?.content === "string") return response.choices[0].message.content;
  if (typeof response?.choices?.[0]?.text === "string") return response.choices[0].text;
  return JSON.stringify(response);
}

async function callWordPressAI(mode: AIMode, prompt: string, messages: AIChatMessage[]) {
  const attempts: Array<{ endpoint: string; body: Record<string, any> }> = [
    {
      endpoint: "mwai-ui/v1/chats/submit",
      body: {
        botId: "default",
        customId: "challenged-dementia-assistant",
        newMessage: prompt,
        messages,
        model: MODEL_NAME,
      },
    },
    {
      endpoint: "mwai/v1/chats/submit",
      body: {
        botId: "default",
        newMessage: prompt,
        messages,
        model: MODEL_NAME,
      },
    },
    {
      endpoint: "mwai/v1/chat/submit",
      body: {
        prompt,
        messages,
        model: MODEL_NAME,
      },
    },
    {
      endpoint: "better-messages/v1/ai/chat",
      body: {
        message: prompt,
        messages,
        model: MODEL_NAME,
        assistant: mode,
      },
    },
  ];

  let lastError: unknown = null;
  for (const attempt of attempts) {
    try {
      const response = await wordpressFetch<any>(attempt.endpoint, {
        method: "POST",
        body: attempt.body,
      });
      const reply = extractReply(response).trim();
      if (reply) return { reply, raw: response };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("No WordPress AI endpoint responded.");
}

export async function loadAIConversation(mode: AIMode, options: Pick<InvokeAIOptions, "conversationId" | "caredOneId"> = {}) {
  const conversationId = options.conversationId || localStorage.getItem(conversationStorageKey(mode, options.caredOneId));
  if (!conversationId) return [] as AIChatMessage[];
  const messages = await wordpressCCTFetch<any[]>(MESSAGE_SLUG, { params: { _limit: 200, _orderby: "cct_created", _order: "asc" } });
  return (Array.isArray(messages) ? messages : [])
    .filter((item) => String(item.conversation_id) === String(conversationId))
    .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
    .map((item) => ({ role: item.role, content: item.content }));
}

export async function invokeAI(mode: AIMode, context: string, options: InvokeAIOptions = {}): Promise<string> {
  const conversationId = await ensureConversation(mode, options);
  const messages = normalizeMessages(mode, context, options.messages);
  const userMessage = messages.filter((message) => message.role === "user").at(-1)?.content || context;

  await createMessage(conversationId, "user", userMessage, mode);

  if (options.caredOneId) {
    try {
      await wordpressCCTFetch(CONTEXT_SLUG, {
        method: "POST",
        body: {
          context_id: createId(),
          user_id: getStoredWPUser()?.user_id || 0,
          cared_one_id: Number(options.caredOneId),
          context_type: "cared_one_profile",
          context_key: `last_${mode}`,
          context_value: userMessage,
          priority: "medium",
          last_updated: unixNow(),
        },
      });
    } catch {}
  }

  try {
    const { reply, raw } = await callWordPressAI(mode, context, messages);
    await createMessage(conversationId, "assistant", reply, mode, JSON.stringify(raw));
    await touchConversation(conversationId);
    return reply;
  } catch (error) {
    await createMessage(conversationId, "assistant", "I’m having trouble reaching the WordPress AI service right now. Please try again in a moment.", mode);
    await touchConversation(conversationId);
    throw error;
  }
}

/** Parse JSON from AI reply, stripping markdown fences if present */
export function parseAIJson<T = any>(reply: string): T | null {
  try {
    let cleaned = reply.trim();
    // Strip markdown code fences
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    return JSON.parse(cleaned);
  } catch {
    console.warn("Failed to parse AI JSON:", reply.slice(0, 200));
    return null;
  }
}
