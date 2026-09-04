/**
 * AI Service — Lovable AI Gateway via edge function.
 *
 * Storage uses the SAME unified chat CCTs as user/group chat:
 *   - chat_conversation (chat_type="AI", ai_chat_mode=<mode>)
 *   - chat_message      (chat_message_type="ai" for assistant, "text" for user)
 *   - REL 143           (1:M chat_conversation → chat_message)
 *
 * NO separate ai_conversations / ai_messages CCTs. Those were hallucinations.
 */

import { wordpressCCTFetch, wordpressFetch, isNetworkAbort } from "@/features/shared/wordpress-client";
import { T, R } from "@/integrations/wp-schema";
import { appScopeBody } from "@/features/shared/app-scope";
import { supabase } from "@/integrations/supabase/client";

export type AIMode =
  | "insights"
  | "cognitive_exercise"
  | "medication_check"
  | "behavior_analysis"
  | "care_tips"
  | "daily_summary"
  | "routine_suggestion"
  | "care_info_sheet"
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
  /** Extra facts/guardrails appended to the server system prompt (e.g. care sheet contents). */
  contextPrompt?: string;
  /**
   * Write the exchange into the unified chat CCTs. Default true.
   * Set false for people outside the app (e.g. someone opening a shared
   * information card link) — nothing is stored, the chat lives in memory only.
   */
  persist?: boolean;
}

const CONVERSATION_SLUG = T.chatConversation.slug;
const CF = T.chatConversation.f;
const CT = T.chatConversation.opt.CHAT_TYPE;
const MESSAGE_SLUG = T.chatMessage.slug;
const MF = T.chatMessage.f;
const MT = T.chatMessage.opt.CHAT_MESSAGE_TYPE;
const REL_CONV_MESSAGE = R.conversationMessages; // 1:M chat conversation → chat message

function nowWPDateTime() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function conversationStorageKey(mode: AIMode, caredOneId?: string | number | null) {
  return `ai_conversation:${mode}:${caredOneId ?? "none"}`;
}

const stripWp = (id: string | number | null | undefined): string =>
  id == null ? "" : String(id).replace(/^wp-/, "");
const numId = (id: string | number | null | undefined): number => Number(stripWp(id));

async function ensureConversation(mode: AIMode, options: InvokeAIOptions = {}): Promise<string> {
  const cachedId = options.conversationId || localStorage.getItem(conversationStorageKey(mode, options.caredOneId));

  if (cachedId) {
    try {
      const existing = await wordpressCCTFetch<Record<string, any>>(CONVERSATION_SLUG, { id: cachedId });
      const id = existing?.id || existing?._ID;
      if (id) {
        localStorage.setItem(conversationStorageKey(mode, options.caredOneId), String(id));
        return String(id);
      }
    } catch { /* fall through */ }
  }

  const result = await wordpressCCTFetch<any>(CONVERSATION_SLUG, {
    method: "POST",
    body: {
      [CF.CHAT_TYPE]: CT.AI,
      [CF.CHAT_NAME]: options.title || "",
      [CF.LAST_MESSAGE_AT]: nowWPDateTime(),
      ...appScopeBody("chatConversation"),
    },
  });
  const createdId = String(result?.item_id || result?._ID || result?.id);
  if (createdId) localStorage.setItem(conversationStorageKey(mode, options.caredOneId), createdId);
  return createdId;
}

async function createMessage(conversationId: string, role: AIChatMessage["role"], content: string) {
  const result = await wordpressCCTFetch<any>(MESSAGE_SLUG, {
    method: "POST",
    body: {
      [MF.CHAT_MESSAGE_CONTENT]: content,
      [MF.CHAT_MESSAGE_TYPE]: role === "assistant" ? MT.AI : MT.TEXT,
    },
  });
  const messageId = numId(result?.item_id || result?._ID || result?.id);
  const convoId = numId(conversationId);
  if (messageId && convoId) {
    try {
      await wordpressFetch(`jet-rel/${REL_CONV_MESSAGE}`, {
        method: "POST",
        body: { parent_id: convoId, child_id: messageId, context: "child", store_items_type: "update" },
      });
    } catch { /* non-blocking */ }
  }
}

async function touchConversation(conversationId: string) {
  try {
    await wordpressCCTFetch(CONVERSATION_SLUG, {
      id: conversationId,
      method: "PUT",
      body: { [CF.LAST_MESSAGE_AT]: nowWPDateTime() },
    });
  } catch { /* non-blocking */ }
}

/** Call the ai-care-engine edge function (Lovable AI Gateway) */
async function callAI(mode: AIMode, messages: AIChatMessage[], contextPrompt?: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("ai-care-engine", {
    body: { mode, messages, ...(contextPrompt ? { contextPrompt } : {}) },
  });
  if (error) {
    console.error("AI edge function error:", error);
    throw new Error(error.message || "AI service unavailable");
  }
  if (data?.error) throw new Error(data.error);
  return data?.reply || "";
}

export async function loadAIConversation(
  mode: AIMode,
  options: Pick<InvokeAIOptions, "conversationId" | "caredOneId"> = {}
): Promise<AIChatMessage[]> {
  const conversationId = options.conversationId || localStorage.getItem(conversationStorageKey(mode, options.caredOneId));
  if (!conversationId) return [];
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_CONV_MESSAGE}/children/${numId(conversationId)}`);
    if (!Array.isArray(rels) || rels.length === 0) return [];
    const messages = await Promise.all(rels.map(async (r: any) => {
      try { return await wordpressCCTFetch<any>(MESSAGE_SLUG, { id: r.child_object_id }); }
      catch { return null; }
    }));
    return (messages.filter(Boolean) as any[])
      .sort((a, b) => String(a.cct_created || "").localeCompare(String(b.cct_created || "")))
      .map((m: any) => ({
        role: (m.chat_message_type === "ai" ? "assistant" : "user") as AIChatMessage["role"],
        content: m.chat_message_content || "",
      }));
  } catch { return []; }
}

export async function invokeAI(mode: AIMode, context: string, options: InvokeAIOptions = {}): Promise<string> {
  const userMessages = options.messages && options.messages.length > 0
    ? options.messages.filter((m) => m.role !== "system")
    : [{ role: "user" as const, content: context }];

  const userMessage = userMessages.filter((m) => m.role === "user").at(-1)?.content || context;

  // Persist (non-blocking on failure)
  let conversationId: string | null = null;
  try {
    conversationId = await ensureConversation(mode, options);
    await createMessage(conversationId, "user", userMessage);
  } catch (e) {
    if (isNetworkAbort(e)) console.debug("Chat CCT persistence skipped (request aborted)");
    else console.warn("Chat CCT persistence unavailable, continuing without:", e);
  }

  // Critical path
  const reply = await callAI(mode, userMessages, options.contextPrompt);

  if (conversationId) {
    try {
      await createMessage(conversationId, "assistant", reply);
      await touchConversation(conversationId);
    } catch { /* non-blocking */ }
  }

  return reply;
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
    return null;
  }
}
