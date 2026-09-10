/**
 * SINGLE FRONTEND AI MODULE — every AI call from the app goes through this file.
 * Part 1: invokeAI / conversation memory (non-streaming; no modes anywhere).
 * Part 2: streaming voice pipeline (SSE text + sentence-level TTS playback).
 * Backend: the single `ai` edge function, routed by task only:
 *   ?task=chat-chat (text→text, SSE; stream:false for one-shot JSON)
 *   ?task=chat-voice (text→audio)
 * Persona: supabase/functions/_shared/ai-prompts.ts (single registry).
 */
import { wordpressCCTFetch, wordpressFetch, isNetworkAbort } from "@/features/shared/wordpress-client";
import { T, R } from "@/integrations/wp-schema";
import { appScopeBody } from "@/features/shared/app-scope";
import { supabase } from "@/integrations/supabase/client";
import { detectSite } from "@/contexts/SiteContext";


export interface AIChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface InvokeAIOptions {
  conversationId?: string;
  title?: string;
  caredOneId?: string | number | null;
  messages?: AIChatMessage[];
  /**
   * Everything this screen needs the AI to know or do, in plain language:
   * live facts, guardrails, and the wanted output shape. There are no modes.
   */
  contextPrompt?: string;
  language?: string;
  /**
   * Write the exchange into the unified chat CCTs. Default FALSE.
   * Only opt-in if you explicitly need a persisted transcript.
   */
  persist?: boolean;
  /** Only used to keep separate persisted transcripts apart. Free-form. */
  threadKey?: string;
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

function conversationStorageKey(threadKey: string, caredOneId?: string | number | null) {
  return `ai_conversation:${threadKey || "chat"}:${caredOneId ?? "none"}`;
}

const stripWp = (id: string | number | null | undefined): string =>
  id == null ? "" : String(id).replace(/^wp-/, "");
const numId = (id: string | number | null | undefined): number => Number(stripWp(id));

async function ensureConversation(threadKey: string, options: InvokeAIOptions = {}): Promise<string> {
  const cachedId = options.conversationId || localStorage.getItem(conversationStorageKey(threadKey, options.caredOneId));

  if (cachedId) {
    try {
      const existing = await wordpressCCTFetch<Record<string, any>>(CONVERSATION_SLUG, { id: cachedId });
      const id = existing?.id || existing?._ID;
      if (id) {
        localStorage.setItem(conversationStorageKey(threadKey, options.caredOneId), String(id));
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
  if (createdId) localStorage.setItem(conversationStorageKey(threadKey, options.caredOneId), createdId);
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

/** Call the single `ai` edge function (Lovable AI Gateway) */
async function callAI(messages: AIChatMessage[], contextPrompt?: string, language?: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("ai?task=chat-chat", {
    body: { messages, stream: false, site: detectSite(), ...(contextPrompt ? { contextPrompt } : {}), ...(language ? { language } : {}) },
  });
  if (error) {
    console.error("AI edge function error:", error);
    throw new Error(error.message || "AI service unavailable");
  }
  if (data?.error) throw new Error(data.error);
  return data?.reply || "";
}

class SkipPersistence extends Error {}

export async function invokeAI(request: string, options: InvokeAIOptions = {}): Promise<string> {
  const userMessages = options.messages && options.messages.length > 0
    ? options.messages.filter((m) => m.role !== "system")
    : [{ role: "user" as const, content: request }];

  const userMessage = userMessages.filter((m) => m.role === "user").at(-1)?.content || request;

  // Persist only when explicitly requested (non-blocking on failure)
  let conversationId: string | null = null;
  const shouldPersist = options.persist === true;
  try {
    if (!shouldPersist) throw new SkipPersistence();
    conversationId = await ensureConversation(options.threadKey || "chat", options);
    await createMessage(conversationId, "user", userMessage);
  } catch (e) {
    if (e instanceof SkipPersistence) conversationId = null;
    else if (isNetworkAbort(e)) console.debug("Chat CCT persistence skipped (request aborted)");
    else console.warn("Chat CCT persistence unavailable, continuing without:", e);
  }

  // Critical path
  const reply = await callAI(userMessages, options.contextPrompt, options.language);

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


// ═════════ STREAMING VOICE PIPELINE ═════════
const STREAM_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai?task=chat-chat`;

export interface StreamHandlers {
  onTextDelta: (delta: string, fullText: string) => void;
  onSentence?: (sentence: string) => void;
  onAudioStart?: () => void;
  onAllAudioEnd?: () => void;
  onPlayStateChange?: (state: "playing" | "paused" | "stopped" | "idle") => void;
  onError?: (err: Error) => void;
  signal?: AbortSignal;
  language?: string;
  engine?: "siliconflow" | "openai" | "openai-full" | "qwen-tts" | "cosyvoice-v35-plus" | "cosyvoice-v35-flash";
  contextPrompt?: string;
}

export interface TextStreamHandlers {
  onTextDelta: (delta: string, fullText: string) => void;
  onDone?: (fullText: string) => void;
  onError?: (err: Error) => void;
  signal?: AbortSignal;
  language?: string;
  contextPrompt?: string;
}

export interface StreamControls {
  pause: () => void;
  resume: () => void;
  stop: () => void;
  isPaused: () => boolean;
}

interface QueueItem {
  url: string;
  index: number;
}

/** Sentence terminators we recognise (CJK + Latin). */
const SENTENCE_RE = /([。！？!?.;；]+["'”’)\\]）】]?)\s*/;

/** Minimum chars before we ship a fragment without seeing a terminator. */
const MIN_FRAGMENT_LEN = 80;

/** 1-frame silent wav — played during the click so Safari/iOS unlock playback. */
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

class AudioQueue {
  private queue: QueueItem[] = [];
  private playing = false;
  private paused = false;
  private nextExpectedIndex = 0;
  /**
   * ONE element for the whole queue. Browsers only allow playback on an element
   * that was started inside a user gesture, and our audio arrives later (after
   * the TTS request), so we create and unlock this element synchronously on the
   * click and then just swap its `src` per chunk.
   */
  private audio: HTMLAudioElement | null = null;
  private aborted = false;
  private onStart?: () => void;
  private onEnd?: () => void;
  private onPlayStateChange?: (s: "playing" | "paused" | "stopped" | "idle") => void;
  private startedOnce = false;
  private finished = false;
  private streamDone = false;

  constructor(opts: {
    onStart?: () => void;
    onEnd?: () => void;
    onPlayStateChange?: (s: "playing" | "paused" | "stopped" | "idle") => void;
  }) {
    this.onStart = opts.onStart;
    this.onEnd = opts.onEnd;
    this.onPlayStateChange = opts.onPlayStateChange;
  }

  /**
   * Must be called synchronously inside the user's click: creates the element
   * and starts a silent frame so later `src` swaps are allowed to play.
   */
  unlock() {
    if (this.audio || typeof Audio === "undefined") return;
    const el = new Audio(SILENT_WAV);
    el.preload = "auto";
    this.audio = el;
    el.play().catch(() => {});
  }

  abort() {
    this.aborted = true;
    if (this.audio) {
      try { this.audio.pause(); } catch {}
      this.audio.onended = null;
      this.audio.onerror = null;
    }
    for (const item of this.queue) {
      try { if (item.url) URL.revokeObjectURL(item.url); } catch {}
    }
    this.queue = [];
    this.playing = false;
    this.paused = false;
    this.onPlayStateChange?.("stopped");
  }

  pause() {
    if (!this.playing || this.paused || !this.audio) return;
    this.paused = true;
    try { this.audio.pause(); } catch {}
    this.onPlayStateChange?.("paused");
  }

  resume() {
    if (!this.paused) return;
    this.paused = false;
    if (this.audio) {
      this.audio.play().catch(() => {});
      this.onPlayStateChange?.("playing");
    } else {
      // No active audio (paused between chunks) — kick the queue.
      this.tryPlayNext();
    }
  }

  isPaused() {
    return this.paused;
  }

  /** Mark that no more sentences will arrive — used to decide when to fire onEnd. */
  markStreamDone() {
    this.streamDone = true;
    this.maybeFinish();
  }

  push(item: QueueItem) {
    if (this.aborted) {
      try { if (item.url) URL.revokeObjectURL(item.url); } catch {}
      return;
    }
    this.queue.push(item);
    this.queue.sort((a, b) => a.index - b.index);
    this.tryPlayNext();
  }

  private tryPlayNext() {
    if (this.playing || this.aborted || this.paused) return;
    const next = this.queue[0];
    if (!next || next.index !== this.nextExpectedIndex) {
      // waiting for the in-order chunk
      this.maybeFinish();
      return;
    }
    this.queue.shift();
    this.nextExpectedIndex += 1;

    // Empty url = TTS failed for this chunk, skip silently and continue.
    if (!next.url) {
      this.tryPlayNext();
      return;
    }

    this.playing = true;
    // Reuse the unlocked element; a fresh one would be blocked by autoplay rules.
    if (!this.audio) this.audio = new Audio();
    const audio = this.audio;
    if (!this.startedOnce) {
      this.startedOnce = true;
      this.onStart?.();
    }
    this.onPlayStateChange?.("playing");
    const advance = () => {
      try { URL.revokeObjectURL(next.url); } catch {}
      audio.onended = null;
      audio.onerror = null;
      this.playing = false;
      this.tryPlayNext();
    };
    audio.onended = advance;
    audio.onerror = () => {
      console.error("Audio playback error in queue");
      advance();
    };
    audio.src = next.url;
    audio.play().catch((err) => {
      console.error("audio.play() failed:", err);
      advance();
    });
  }

  private maybeFinish() {
    if (
      !this.finished &&
      this.streamDone &&
      !this.playing &&
      this.queue.length === 0
    ) {
      this.finished = true;
      this.onPlayStateChange?.("idle");
      this.onEnd?.();
    }
  }
}

export type TTSEngine = "siliconflow" | "openai" | "openai-full" | "qwen-tts" | "cosyvoice-v35-plus" | "cosyvoice-v35-flash";

async function fetchTTSBlobURL(
  text: string,
  voice: string,
  engine: TTSEngine = "siliconflow",
): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    const { data, error } = await supabase.functions.invoke("ai?task=chat-voice", {
      body: { text: trimmed, voice, format: "mp3", engine },
    });
    if (error || data?.error || !data?.audio) {
      console.error("TTS chunk failed:", error || data?.error);
      return null;
    }
    const binary = atob(data.audio as string);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const mime = data.format === "wav" ? "audio/wav" : "audio/mpeg";
    return URL.createObjectURL(new Blob([bytes], { type: mime }));
  } catch (err) {
    console.error("TTS chunk error:", err);
    return null;
  }
}

/**
 * Stream a chat reply, emitting text deltas immediately and dispatching
 * each completed sentence to TTS in parallel.
 *
 * Returns { controls, result }:
 *   - controls: pause/resume/stop the audio playback (text streaming itself
 *     is not pausable — only the audio queue).
 *   - result: Promise resolving to the final full text once the SSE stream
 *     ends (independent of whether audio finished playing).
 */
export function streamChatWithVoice(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  voice: string,
  handlers: StreamHandlers,
): { controls: StreamControls; result: Promise<string> } {
  const audioQueue = new AudioQueue({
    onStart: handlers.onAudioStart,
    onEnd: handlers.onAllAudioEnd,
    onPlayStateChange: handlers.onPlayStateChange,
  });
  // Runs inside the send click — required for playback.
  audioQueue.unlock();

  if (handlers.signal) {
    handlers.signal.addEventListener("abort", () => audioQueue.abort(), { once: true });
  }

  const controls: StreamControls = {
    pause: () => audioQueue.pause(),
    resume: () => audioQueue.resume(),
    stop: () => audioQueue.abort(),
    isPaused: () => audioQueue.isPaused(),
  };

  const result = (async () => {
    const resp = await fetch(STREAM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, site: detectSite(), language: handlers.language, contextPrompt: handlers.contextPrompt }),
      signal: handlers.signal,
    });

    if (!resp.ok || !resp.body) {
      const errText = await resp.text().catch(() => "");
      audioQueue.abort();
      const err = new Error(`Stream failed [${resp.status}]: ${errText.slice(0, 200)}`);
      handlers.onError?.(err);
      throw err;
    }

    if (!resp.ok || !resp.body) {
      const errText = await resp.text().catch(() => "");
      audioQueue.abort();
      const err = new Error(`Stream failed [${resp.status}]: ${errText.slice(0, 200)}`);
      handlers.onError?.(err);
      throw err;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let pending = "";
    let fullText = "";
    let chunkIndex = 0;
    const ttsPromises: Promise<void>[] = [];

    const dispatchSentence = (sentence: string) => {
      const idx = chunkIndex++;
      handlers.onSentence?.(sentence);
      const p = fetchTTSBlobURL(sentence, voice, handlers.engine ?? "siliconflow").then((url) => {
        audioQueue.push({ url: url || "", index: idx });
      });
      ttsPromises.push(p);
    };

    const flushSentencesFromPending = (force = false) => {
      while (true) {
        const match = pending.match(SENTENCE_RE);
        if (match && match.index !== undefined) {
          const end = match.index + match[0].length;
          const sentence = pending.slice(0, end).trim();
          pending = pending.slice(end);
          if (sentence) dispatchSentence(sentence);
          continue;
        }
        if (!force && pending.length >= MIN_FRAGMENT_LEN) {
          const breakRe = /[，,、 ]/g;
          let lastBreak = -1;
          let m;
          while ((m = breakRe.exec(pending)) !== null) {
            if (m.index >= 30) lastBreak = m.index + 1;
          }
          if (lastBreak > 0) {
            const fragment = pending.slice(0, lastBreak).trim();
            pending = pending.slice(lastBreak);
            if (fragment) dispatchSentence(fragment);
            continue;
          }
        }
        if (force && pending.trim()) {
          dispatchSentence(pending.trim());
          pending = "";
        }
        return;
      }
    };

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, nl);
          textBuffer = textBuffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") {
            textBuffer = "";
            break;
          }
          try {
            const parsed = JSON.parse(payload);
            const delta: string | undefined = parsed?.choices?.[0]?.delta?.content;
            if (delta) {
              fullText += delta;
              pending += delta;
              handlers.onTextDelta(delta, fullText);
              flushSentencesFromPending(false);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      flushSentencesFromPending(true);
      await Promise.all(ttsPromises);
      audioQueue.markStreamDone();
      return fullText;
    } catch (err) {
      audioQueue.abort();
      const e = err instanceof Error ? err : new Error(String(err));
      handlers.onError?.(e);
      throw e;
    }
  })();

  return { controls, result };
}

/**
 * Play arbitrary text through the same sentence-level pipeline (no LLM call).
 * Used by the "Listen" button on a finished text-only reply.
 */
export function speakTextStreaming(
  text: string,
  voice: string,
  handlers: Omit<StreamHandlers, "onTextDelta" | "onSentence"> & {
    onSentence?: (s: string) => void;
  },
): StreamControls {
  const audioQueue = new AudioQueue({
    onStart: handlers.onAudioStart,
    onEnd: handlers.onAllAudioEnd,
    onPlayStateChange: handlers.onPlayStateChange,
  });
  // Runs inside the click that pressed "Listen" — required for playback.
  audioQueue.unlock();

  if (handlers.signal) {
    handlers.signal.addEventListener("abort", () => audioQueue.abort(), { once: true });
  }

  // Split text into sentence-sized chunks up front and dispatch in parallel.
  const sentences: string[] = [];
  let pending = text;
  while (true) {
    const match = pending.match(SENTENCE_RE);
    if (match && match.index !== undefined) {
      const end = match.index + match[0].length;
      const s = pending.slice(0, end).trim();
      pending = pending.slice(end);
      if (s) sentences.push(s);
      continue;
    }
    if (pending.trim()) sentences.push(pending.trim());
    break;
  }

  const ttsPromises = sentences.map((s, idx) => {
    handlers.onSentence?.(s);
    return fetchTTSBlobURL(s, voice, handlers.engine ?? "siliconflow").then((url) => {
      audioQueue.push({ url: url || "", index: idx });
    });
  });

  if (sentences.length === 0) {
    audioQueue.markStreamDone();
  } else {
    // Only mark stream done after all TTS dispatches have at least been queued.
    Promise.all(ttsPromises).then(() => audioQueue.markStreamDone());
  }

  return {
    pause: () => audioQueue.pause(),
    resume: () => audioQueue.resume(),
    stop: () => audioQueue.abort(),
    isPaused: () => audioQueue.isPaused(),
  };
}

/**
 * Pure text streaming — same SSE pipeline as voice mode, but NO TTS.
 * Tokens arrive in real time so the UI bubble updates word-by-word.
 * Returns an AbortController so the caller can cancel mid-stream.
 */
export function streamChatTextOnly(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  handlers: TextStreamHandlers,
): { abort: () => void; result: Promise<string> } {
  const controller = new AbortController();
  const signal = handlers.signal
    ? mergeSignals(handlers.signal, controller.signal)
    : controller.signal;

  const result = (async () => {
    const resp = await fetch(STREAM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, site: detectSite(), language: handlers.language, contextPrompt: handlers.contextPrompt }),
      signal,
    });

    if (!resp.ok || !resp.body) {
      const errText = await resp.text().catch(() => "");
      const err = new Error(`Stream failed [${resp.status}]: ${errText.slice(0, 200)}`);
      handlers.onError?.(err);
      throw err;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let fullText = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, nl);
          textBuffer = textBuffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") {
            textBuffer = "";
            break;
          }
          try {
            const parsed = JSON.parse(payload);
            const delta: string | undefined = parsed?.choices?.[0]?.delta?.content;
            if (delta) {
              fullText += delta;
              handlers.onTextDelta(delta, fullText);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
      handlers.onDone?.(fullText);
      return fullText;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      handlers.onError?.(e);
      throw e;
    }
  })();

  return { abort: () => controller.abort(), result };
}

function mergeSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
  if (a.aborted) return a;
  if (b.aborted) return b;
  const ctrl = new AbortController();
  const onAbort = () => ctrl.abort();
  a.addEventListener("abort", onAbort, { once: true });
  b.addEventListener("abort", onAbort, { once: true });
  return ctrl.signal;
}



// ═════════ CONVERSATION MEMORY STANDARD ═════════
// 1. Casual/companion chat: frontend-only, 10,000-char rolling window, no DB.
// 2. Care-fact/one-shot: no memory; fresh facts each call; only conclusions stored.
// Shared-link visitors: nothing stored, ever.
export const AI_MEMORY_CHAR_LIMIT = 10_000;

/**
 * Keep the newest messages whose total character count is within the limit.
 * Drops oldest messages first. Always keeps at least the last message so a
 * single long user prompt can still be sent.
 *
 * The count includes BOTH user messages and assistant replies — the model
 * sees the full conversation, not just what the user typed.
 */
export function trimMessagesToCharLimit<T extends { role: string; content?: string | null }>(
  messages: T[],
  limit = AI_MEMORY_CHAR_LIMIT
): T[] {
  if (!messages.length) return [];
  const chars = messages.map((m) => (m.content?.length ?? 0));
  let total = chars.reduce((a, b) => a + b, 0);
  let start = 0;
  while (total > limit && start < messages.length - 1) {
    total -= chars[start] ?? 0;
    start++;
  }
  return messages.slice(start);
}
