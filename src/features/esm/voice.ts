/**
 * Voice answering for the ESM survey.
 *
 * Records microphone audio with the Web Audio API, encodes a complete 16 kHz
 * mono WAV (so every browser, including iOS Safari, produces a decodable file),
 * and sends it to the `esm-transcribe` function for a transcript.
 */
import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

function encodeWav(chunks: Float32Array[], sampleRate: number, target = 16000): Blob {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const merged = new Float32Array(total);
  let at = 0;
  for (const c of chunks) {
    merged.set(c, at);
    at += c.length;
  }
  // Downsample by simple averaging.
  const ratio = Math.max(1, Math.round(sampleRate / target));
  const outLength = Math.floor(merged.length / ratio);
  const samples = new Int16Array(outLength);
  for (let i = 0; i < outLength; i++) {
    let sum = 0;
    for (let j = 0; j < ratio; j++) sum += merged[i * ratio + j] || 0;
    const v = Math.max(-1, Math.min(1, sum / ratio));
    samples[i] = v < 0 ? v * 0x8000 : v * 0x7fff;
  }
  const outRate = Math.round(sampleRate / ratio);
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const str = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  str(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  str(8, "WAVE");
  str(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, outRate, true);
  view.setUint32(28, outRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  str(36, "data");
  view.setUint32(40, samples.length * 2, true);
  new Int16Array(buffer, 44).set(samples);
  return new Blob([buffer], { type: "audio/wav" });
}

export interface VoiceRecorder {
  isRecording: boolean;
  isTranscribing: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => Promise<string | null>;
  cancel: () => void;
}

export function useVoiceRecorder(): VoiceRecorder {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const state = useRef<{
    stream?: MediaStream;
    ctx?: AudioContext;
    node?: ScriptProcessorNode;
    source?: MediaStreamAudioSourceNode;
    chunks: Float32Array[];
  }>({ chunks: [] });

  const teardown = useCallback(() => {
    const s = state.current;
    try {
      s.node?.disconnect();
      s.source?.disconnect();
      s.stream?.getTracks().forEach((t) => t.stop());
      s.ctx?.close();
    } catch {
      /* already closed */
    }
    state.current = { chunks: [] };
    setIsRecording(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone access is needed to answer by voice.");
      return;
    }
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const node = ctx.createScriptProcessor(4096, 1, 1);
    const chunks: Float32Array[] = [];
    node.onaudioprocess = (e) => chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
    source.connect(node);
    node.connect(ctx.destination);
    state.current = { stream, ctx, node, source, chunks };
    setIsRecording(true);
  }, []);

  const stop = useCallback(async (): Promise<string | null> => {
    const s = state.current;
    if (!s.ctx) return null;
    const sampleRate = s.ctx.sampleRate;
    const chunks = s.chunks;
    teardown();
    const blob = encodeWav(chunks, sampleRate);
    if (blob.size < 2048) {
      setError("That recording was empty — please try again.");
      return null;
    }
    setIsTranscribing(true);
    try {
      const form = new FormData();
      form.append("file", blob, "recording.wav");
      const { data, error: fnError } = await supabase.functions.invoke("esm-transcribe", { body: form });
      if (fnError) {
        setError("Could not turn that recording into text. Please try again.");
        return null;
      }
      const text = (data as { text?: string; error?: string } | null)?.text?.trim();
      if (!text) {
        setError((data as { error?: string } | null)?.error || "Nothing was recognised — please try again.");
        return null;
      }
      return text;
    } finally {
      setIsTranscribing(false);
    }
  }, [teardown]);

  return { isRecording, isTranscribing, error, start, stop, cancel: teardown };
}

/* --------------------------------------------- spoken answer interpretation */

const NUMBER_WORDS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13,
  fourteen: 14, fifteen: 15, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, ninety: 90,
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();

/** Pull a number out of speech, handling "minus two", "negative 3", "five". */
export function parseSpokenNumber(transcript: string): number | null {
  const t = norm(transcript);
  const negative = /\b(minus|negative)\b/.test(t);
  const digits = t.match(/-?\d+(\.\d+)?/);
  if (digits) {
    const n = parseFloat(digits[0]);
    return negative ? -Math.abs(n) : n;
  }
  for (const [word, value] of Object.entries(NUMBER_WORDS)) {
    if (new RegExp(`\\b${word}\\b`).test(t)) return negative ? -value : value;
  }
  return null;
}

/** Yes / no from speech. */
export function parseSpokenYesNo(transcript: string): "yes" | "no" | null {
  const t = norm(transcript);
  if (/\b(no|nope|none|negative|didn t|did not|never)\b/.test(t)) return "no";
  if (/\b(yes|yeah|yep|yup|correct|true|it did|there was)\b/.test(t)) return "yes";
  return null;
}

/**
 * Match speech to one of the offered options by counting shared words, with an
 * exact / substring match winning outright.
 */
export function matchSpokenOption<T extends { value: string; label: string; aliases?: string[] }>(
  transcript: string,
  options: T[],
): T | null {
  const t = norm(transcript);
  if (!t) return null;
  let best: { option: T; score: number } | null = null;
  for (const option of options) {
    const candidates = [option.label, option.value, ...(option.aliases ?? [])].map(norm);
    let score = 0;
    for (const candidate of candidates) {
      if (!candidate) continue;
      if (t === candidate) score = Math.max(score, 1000);
      else if (t.includes(candidate)) score = Math.max(score, 500 + candidate.length);
      else {
        const words = candidate.split(" ").filter((w) => w.length > 2);
        const hits = words.filter((w) => t.includes(w)).length;
        if (hits) score = Math.max(score, hits * 10 + hits / Math.max(1, words.length));
      }
    }
    if (score > 0 && (!best || score > best.score)) best = { option, score };
  }
  return best?.option ?? null;
}

/** Match speech to every option it mentions (for multi-select questions). */
export function matchSpokenOptions<T extends { value: string; label: string; aliases?: string[] }>(
  transcript: string,
  options: T[],
): T[] {
  const parts = transcript.split(/,| and | then |;|\.|、/).map((p) => p.trim()).filter(Boolean);
  const picked = new Map<string, T>();
  for (const part of parts) {
    const hit = matchSpokenOption(part, options);
    if (hit) picked.set(hit.value, hit);
  }
  return [...picked.values()];
}
