/**
 * SINGLE FRONTEND AI MODULE — every AI call from the app goes through this file.
 * Part 1: invokeAI for one-shot requests; conversation reads and writes live in
 *         src/lib/ai-dynamic-knowledge.ts.
 * Part 2: streaming voice pipeline (SSE text + sentence-level TTS playback).
 * Backend: the single `ai` edge function, routed by task only:
 *   ?task=chat-chat (text→text, SSE; stream:false for one-shot JSON)
 *   ?task=chat-voice (text→audio)
 * Persona: supabase/functions/_shared/ai-prompts.ts (single registry).
 */
import { supabase } from "@/integrations/supabase/client";
import { detectSite } from "@/contexts/SiteContext";


export interface AIChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface InvokeAIOptions {
  messages?: AIChatMessage[] | undefined;
  /**
   * Everything this screen needs the AI to know or do, in plain language:
   * live facts, guardrails, and the wanted output shape. There are no modes.
   */
  contextPrompt?: string | undefined;
  language?: string | undefined;
}

/** Call the single `ai` edge function (Lovable AI Gateway) */
async function callAI(messages: AIChatMessage[], contextPrompt?: string | undefined, language?: string | undefined): Promise<string> {
  const { data, error } = await supabase.functions.invoke("ai?task=chat-chat", {
    body: { messages, stream: false, site: detectSite(), contextPrompt, ...(language ? { language } : {}) },
  });
  if (error) {
    console.error("AI edge function error:", error);
    throw new Error(error.message || "AI service unavailable");
  }
  if (data?.error) throw new Error(data.error);
  return data?.reply || "";
}

export async function invokeAI(request: string, options: InvokeAIOptions = {}): Promise<string> {
  const userMessages = options.messages && options.messages.length > 0
    ? options.messages.filter((m) => m.role !== "system")
    : [{ role: "user" as const, content: request }];
  return callAI(userMessages, options.contextPrompt, options.language);
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
const STREAM_URL = `${import.meta.env["VITE_SUPABASE_URL"]}/functions/v1/ai`;

export interface StreamChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  imageDataUrl?: string | undefined;
}

function streamRequest(messages: StreamChatMessage[]) {
  let latestImageIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.imageDataUrl) {
      latestImageIndex = i;
      break;
    }
  }
  const hasImage = latestImageIndex >= 0;
  const cleanMessages = messages.map((message, index) => ({
    role: message.role,
    content: index === latestImageIndex && message.imageDataUrl
      ? [
          { type: "text", text: message.content },
          { type: "image_url", image_url: { url: message.imageDataUrl, detail: "auto" } },
        ]
      : message.content,
  }));
  return {
    url: `${STREAM_URL}?task=${hasImage ? "vision-chat" : "chat-chat"}`,
    messages: cleanMessages,
  };
}

export async function prepareChatImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight) throw new Error("This image could not be opened.");

    for (const maxSide of [1600, 1280, 1024]) {
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("This image could not be prepared.");
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      for (const quality of [0.82, 0.7, 0.58]) {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
        if (blob && blob.size <= 2_500_000) {
          return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("This image could not be prepared."));
            reader.onerror = () => reject(new Error("This image could not be prepared."));
            reader.readAsDataURL(blob);
          });
        }
      }
    }
    throw new Error("This image is too large to send.");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export interface StreamHandlers {
  onTextDelta: (delta: string, fullText: string) => void;
  onSentence?: ((sentence: string) => void) | undefined;
  onAudioStart?: (() => void) | undefined;
  onAllAudioEnd?: (() => void) | undefined;
  onPlayStateChange?: ((state: "playing" | "paused" | "stopped" | "idle") => void) | undefined;
  onError?: ((err: Error) => void) | undefined;
  signal?: AbortSignal | undefined;
  language?: string | undefined;
  engine?: "siliconflow" | "openai" | "openai-full" | "qwen-tts" | "cosyvoice-v35-plus" | "cosyvoice-v35-flash" | undefined;
  contextPrompt?: string | undefined;
}

export interface TextStreamHandlers {
  onTextDelta: (delta: string, fullText: string) => void;
  onDone?: ((fullText: string) => void) | undefined;
  onError?: ((err: Error) => void) | undefined;
  signal?: AbortSignal | undefined;
  language?: string | undefined;
  contextPrompt?: string | undefined;
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
  private onStart?: (() => void) | undefined;
  private onEnd?: (() => void) | undefined;
  private onPlayStateChange?: ((s: "playing" | "paused" | "stopped" | "idle") => void) | undefined;
  private startedOnce = false;
  private finished = false;
  private streamDone = false;

  constructor(opts: {
    onStart?: (() => void) | undefined;
    onEnd?: (() => void) | undefined;
    onPlayStateChange?: ((s: "playing" | "paused" | "stopped" | "idle") => void) | undefined;
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
      body: { text: trimmed, voice, format: "mp3", engine, site: detectSite() },
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
  messages: StreamChatMessage[],
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
    const request = streamRequest(messages);
    const resp = await fetch(request.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]}`,
      },
      body: JSON.stringify({ messages: request.messages, site: detectSite(), language: handlers.language, contextPrompt: handlers.contextPrompt }),
      signal: handlers.signal ?? null,
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
    onSentence?: ((s: string) => void) | undefined;
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
  messages: StreamChatMessage[],
  handlers: TextStreamHandlers,
): { abort: () => void; result: Promise<string> } {
  const controller = new AbortController();
  const signal = handlers.signal
    ? mergeSignals(handlers.signal, controller.signal)
    : controller.signal;

  const result = (async () => {
    const request = streamRequest(messages);
    const resp = await fetch(request.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]}`,
      },
      body: JSON.stringify({ messages: request.messages, site: detectSite(), language: handlers.language, contextPrompt: handlers.contextPrompt }),
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
export function trimMessagesToCharLimit<T extends { role: string; content?: string | null | undefined }>(
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

// ═════════ VOICE INPUT (speech → text) ═════════
/**
 * Records the microphone as PCM and encodes a complete 16 kHz mono WAV, then
 * transcribes it through the same `ai` edge function (?task=voice-chat).
 * WAV avoids MediaRecorder's headerless fragments and iOS Safari's mp4.
 */
function encodeWav(chunks: Float32Array[], sampleRate: number, targetRate = 16000): Blob {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const merged = new Float32Array(total);
  let offset = 0;
  for (const c of chunks) { merged.set(c, offset); offset += c.length; }

  const ratio = sampleRate / targetRate;
  const outLength = ratio > 1 ? Math.floor(merged.length / ratio) : merged.length;
  const samples = new Int16Array(outLength);
  for (let i = 0; i < outLength; i++) {
    const v = merged[ratio > 1 ? Math.floor(i * ratio) : i] ?? 0;
    const clamped = Math.max(-1, Math.min(1, v));
    samples[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }
  const rate = ratio > 1 ? targetRate : sampleRate;

  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (pos: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(pos + i, s.charCodeAt(i)); };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  new Int16Array(buffer, 44).set(samples);
  return new Blob([buffer], { type: "audio/wav" });
}

export class VoiceRecorder {
  private stream: MediaStream | null = null;
  private ctx: AudioContext | null = null;
  private node: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private chunks: Float32Array[] = [];

  /** raw=true turns off echo cancellation/noise suppression/auto gain (needed for voice cloning, e.g. recording audio played from the same device). */
  constructor(private raw = false) {}

  async start(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: this.raw ? { echoCancellation: false, noiseSuppression: false, autoGainControl: false } : true });
    const Ctor: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    this.ctx = new Ctor();
    this.chunks = [];
    this.source = this.ctx.createMediaStreamSource(this.stream);
    this.node = this.ctx.createScriptProcessor(4096, 1, 1);
    this.node.onaudioprocess = (e) => this.chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
    this.source.connect(this.node);
    this.node.connect(this.ctx.destination);
  }

  /** Stops recording and returns a complete WAV blob (null when nothing usable). */
  async stop(): Promise<Blob | null> {
    try { this.stream?.getTracks().forEach((t) => t.stop()); } catch { /* ignore */ }
    try { this.node?.disconnect(); this.source?.disconnect(); } catch { /* ignore */ }
    const rate = this.ctx?.sampleRate || 44100;
    const chunks = this.chunks;
    this.chunks = [];
    try { await this.ctx?.close(); } catch { /* ignore */ }
    this.ctx = null; this.node = null; this.source = null; this.stream = null;
    if (!chunks.length) return null;
    const blob = encodeWav(chunks, rate);
    return blob.size < 2048 ? null : blob;
  }

  cancel() { void this.stop(); }
}

/** Send a recorded clip to the shared `ai` function and get the text back. */
export async function transcribeAudio(blob: Blob, language?: string | undefined): Promise<string> {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let i = 0; i < buf.length; i += 0x8000) {
    binary += String.fromCharCode.apply(null, Array.from(buf.subarray(i, i + 0x8000)) as any);
  }
  const { data, error } = await supabase.functions.invoke("ai?task=voice-chat", {
    body: { audio: btoa(binary), mime: blob.type || "audio/wav", language },
  });
  if (error || data?.error) throw new Error(String(error?.message || data?.error || "transcription failed"));
  return String(data?.text || "").trim();
}
