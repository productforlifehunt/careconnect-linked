/**
 * AI Service — Lovable AI Gateway via edge function + WordPress CCT for conversation storage.
 */

import { wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";
import { supabase } from "@/integrations/supabase/client";

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

async function createMessage(conversationId: string, role: AIChatMessage["role"], content: string, mode: AIMode) {
  await wordpressCCTFetch(MESSAGE_SLUG, {
    method: "POST",
    body: {
      conversation_id: conversationId,
      message_id: createId(),
      role,
      ai_mode: mode,
      content,
      context_used: "",
      tokens_used: 0,
      model_name: "gemini-3-flash-preview",
      created_at: unixNow(),
    },
  });
}

async function touchConversation(conversationId: string) {
  try {
    const messages = await wordpressCCTFetch<any[]>(MESSAGE_SLUG, { params: { _limit: 200 } });
    const count = (Array.isArray(messages) ? messages : []).filter(
      (item) => String(item.conversation_id) === String(conversationId)
    ).length;
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

/** Call the ai-care-engine edge function (Lovable AI Gateway) */
async function callAI(mode: AIMode, messages: AIChatMessage[]): Promise<string> {
  const { data, error } = await supabase.functions.invoke("ai-care-engine", {
    body: { mode, messages },
  });

  if (error) {
    console.error("AI edge function error:", error);
    throw new Error(error.message || "AI service unavailable");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data?.reply || "";
}

export async function loadAIConversation(mode: AIMode, options: Pick<InvokeAIOptions, "conversationId" | "caredOneId"> = {}) {
  const conversationId = options.conversationId || localStorage.getItem(conversationStorageKey(mode, options.caredOneId));
  if (!conversationId) return [] as AIChatMessage[];
  const messages = await wordpressCCTFetch<any[]>(MESSAGE_SLUG, {
    params: { _limit: 200, _orderby: "cct_created", _order: "asc" },
  });
  return (Array.isArray(messages) ? messages : [])
    .filter((item) => String(item.conversation_id) === String(conversationId))
    .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
    .map((item) => ({ role: item.role, content: item.content }));
}

export async function invokeAI(mode: AIMode, context: string, options: InvokeAIOptions = {}): Promise<string> {
  const conversationId = await ensureConversation(mode, options);

  // Build messages array
  const userMessages = options.messages && options.messages.length > 0
    ? options.messages.filter((m) => m.role !== "system")
    : [{ role: "user" as const, content: context }];

  const userMessage = userMessages.filter((m) => m.role === "user").at(-1)?.content || context;

  // Store user message in WP CCT
  await createMessage(conversationId, "user", userMessage, mode);

  // Store context memory if caredOne specified
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
    const reply = await callAI(mode, userMessages);
    await createMessage(conversationId, "assistant", reply, mode);
    await touchConversation(conversationId);
    return reply;
  } catch (error) {
    const fallbackMsg = "I'm having trouble reaching the AI service right now. Please try again in a moment.";
    await createMessage(conversationId, "assistant", fallbackMsg, mode);
    await touchConversation(conversationId);
    throw error;
  }
}

/** Parse JSON from AI reply, stripping markdown fences if present */
export function parseAIJson<T = any>(reply: string): T | null {
  try {
    let cleaned = reply.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    return JSON.parse(cleaned);
  } catch {
    console.warn("Failed to parse AI JSON:", reply.slice(0, 200));
    return null;
  }
}
