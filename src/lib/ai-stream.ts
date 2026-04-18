/**
 * Sentence-level streaming pipeline for the dementia voice assistant.
 *
 * Flow:
 *   1. POST to ai-care-stream → consume SSE deltas as text tokens.
 *   2. Whenever a sentence terminator is seen (. ! ? 。 ! ? ; ；), dispatch
 *      that sentence to ai-voice (in parallel with the next sentence).
 *   3. Audio blobs are pushed to a queue and played sequentially via
 *      a single <audio> element so playback is gap-free and ordered.
 *
 * Result: first audio starts playing ~1–2 s after the user speaks, instead
 * of waiting 8–10 s for the full reply.
 */

import { supabase } from "@/integrations/supabase/client";

const STREAM_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-care-stream`;

export interface StreamHandlers {
  onTextDelta: (delta: string, fullText: string) => void;
  onSentence?: (sentence: string) => void;
  onAudioStart?: () => void;
  onAllAudioEnd?: () => void;
  onPlayStateChange?: (state: "playing" | "paused" | "stopped" | "idle") => void;
  onError?: (err: Error) => void;
  signal?: AbortSignal;
  language?: string;
}

export interface TextStreamHandlers {
  onTextDelta: (delta: string, fullText: string) => void;
  onDone?: (fullText: string) => void;
  onError?: (err: Error) => void;
  signal?: AbortSignal;
  language?: string;
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

class AudioQueue {
  private queue: QueueItem[] = [];
  private playing = false;
  private paused = false;
  private nextExpectedIndex = 0;
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

  abort() {
    this.aborted = true;
    if (this.audio) {
      try { this.audio.pause(); this.audio.src = ""; } catch {}
      this.audio = null;
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
    const audio = new Audio(next.url);
    this.audio = audio;
    if (!this.startedOnce) {
      this.startedOnce = true;
      this.onStart?.();
    }
    this.onPlayStateChange?.("playing");
    audio.onended = () => {
      try { URL.revokeObjectURL(next.url); } catch {}
      this.audio = null;
      this.playing = false;
      this.tryPlayNext();
    };
    audio.onerror = () => {
      console.error("Audio playback error in queue");
      try { URL.revokeObjectURL(next.url); } catch {}
      this.audio = null;
      this.playing = false;
      this.tryPlayNext();
    };
    audio.play().catch((err) => {
      console.error("audio.play() failed:", err);
      this.audio = null;
      this.playing = false;
      this.tryPlayNext();
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

async function fetchTTSBlobURL(text: string, voice: string): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    const { data, error } = await supabase.functions.invoke("ai-voice", {
      body: { text: trimmed, voice, format: "mp3" },
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
      body: JSON.stringify({ messages, language: handlers.language }),
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
      const p = fetchTTSBlobURL(sentence, voice).then((url) => {
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
    return fetchTTSBlobURL(s, voice).then((url) => {
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
