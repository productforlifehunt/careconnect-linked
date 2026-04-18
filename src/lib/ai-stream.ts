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
  onError?: (err: Error) => void;
  signal?: AbortSignal;
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
  private nextExpectedIndex = 0;
  private audio: HTMLAudioElement | null = null;
  private aborted = false;
  private onStart?: () => void;
  private onEnd?: () => void;
  private startedOnce = false;
  private finished = false;
  private streamDone = false;

  constructor(opts: { onStart?: () => void; onEnd?: () => void }) {
    this.onStart = opts.onStart;
    this.onEnd = opts.onEnd;
  }

  abort() {
    this.aborted = true;
    if (this.audio) {
      try { this.audio.pause(); this.audio.src = ""; } catch {}
      this.audio = null;
    }
    for (const item of this.queue) {
      try { URL.revokeObjectURL(item.url); } catch {}
    }
    this.queue = [];
    this.playing = false;
  }

  /** Mark that no more sentences will arrive — used to decide when to fire onEnd. */
  markStreamDone() {
    this.streamDone = true;
    this.maybeFinish();
  }

  push(item: QueueItem) {
    if (this.aborted) {
      try { URL.revokeObjectURL(item.url); } catch {}
      return;
    }
    this.queue.push(item);
    this.queue.sort((a, b) => a.index - b.index);
    this.tryPlayNext();
  }

  private tryPlayNext() {
    if (this.playing || this.aborted) return;
    const next = this.queue[0];
    if (!next || next.index !== this.nextExpectedIndex) {
      // waiting for the in-order chunk
      this.maybeFinish();
      return;
    }
    this.queue.shift();
    this.nextExpectedIndex += 1;
    this.playing = true;
    const audio = new Audio(next.url);
    this.audio = audio;
    if (!this.startedOnce) {
      this.startedOnce = true;
      this.onStart?.();
    }
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
 * each completed sentence to TTS in parallel. Returns the final full text.
 */
export async function streamChatWithVoice(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  voice: string,
  handlers: StreamHandlers,
): Promise<string> {
  const audioQueue = new AudioQueue({
    onStart: handlers.onAudioStart,
    onEnd: handlers.onAllAudioEnd,
  });

  if (handlers.signal) {
    handlers.signal.addEventListener("abort", () => audioQueue.abort(), { once: true });
  }

  const resp = await fetch(STREAM_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
    signal: handlers.signal,
  });

  if (!resp.ok || !resp.body) {
    const errText = await resp.text().catch(() => "");
    audioQueue.abort();
    const err = new Error(`Stream failed [${resp.status}]: ${errText.slice(0, 200)}`);
    handlers.onError?.(err);
    throw err;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";   // raw SSE buffer
  let pending = "";      // accumulated text not yet shipped to TTS
  let fullText = "";
  let chunkIndex = 0;
  const ttsPromises: Promise<void>[] = [];

  const dispatchSentence = (sentence: string) => {
    const idx = chunkIndex++;
    handlers.onSentence?.(sentence);
    const p = fetchTTSBlobURL(sentence, voice).then((url) => {
      if (url) audioQueue.push({ url, index: idx });
      else audioQueue.push({ url: "", index: idx }); // skip slot
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
      // No terminator. Ship a long fragment to keep latency low.
      if (!force && pending.length >= MIN_FRAGMENT_LEN) {
        // Try to break on a comma / 中文逗号 / space near the end.
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
          // Partial JSON across chunks — push back and wait.
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Flush remaining buffer.
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
}
