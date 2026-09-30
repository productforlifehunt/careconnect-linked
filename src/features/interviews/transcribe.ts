/**
 * Interview recordings: upload to private storage and generate an A/B,
 * Chinese + English sentence-by-sentence transcript. Every Generate click
 * transcribes the recording again from the audio itself (nothing cached).
 */
import { supabase } from "@/integrations/supabase/client";
import { getWPToken } from "@/services/wp-auth";

const FN_BASE = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1`;
const SEGMENT_SECONDS = 180;
const RATE = 16000;

export interface Meta { title: string; notes: string; instructions: string }
export interface Recording { path: string; size: number; type: string; created: string; meta: Meta }
export interface Line { s: "A" | "B"; zh: string; en: string; t: number }

function authHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    "x-wp-token": getWPToken() || "",
  };
}

async function audioFn<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${FN_BASE}/interview-audio`, { method: "POST", headers: authHeaders(), body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data as T;
}

export const listRecordings = () => audioFn<{ items: Recording[] }>({ action: "list" }).then((d) => d.items);
export const playUrl = (path: string) => audioFn<{ url: string }>({ action: "play_url", path }).then((d) => d.url);

export const saveMeta = (path: string, meta: Meta) => audioFn<{ meta: Meta }>({ action: "save_meta", path, meta }).then((d) => d.meta);
export const deleteRecording = (path: string) => audioFn<{ ok: boolean }>({ action: "delete", path });

export async function uploadRecording(file: File): Promise<string> {
  const { path, token } = await audioFn<{ path: string; token: string }>({ action: "upload_url", name: file.name });
  const { error } = await supabase.storage.from("interview-audio").uploadToSignedUrl(path, token, file, {
    contentType: file.type || "audio/mpeg",
  });
  if (error) throw new Error(error.message);
  return path;
}

export const displayName = (path: string) => path.replace(/^\d+_/, "");

function wavBase64(samples: Float32Array): string {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const v = new DataView(buf);
  const w = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, "RIFF"); v.setUint32(4, 36 + samples.length * 2, true); w(8, "WAVE"); w(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, RATE, true); v.setUint32(28, RATE * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, "data"); v.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const x = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7fff, true);
  }
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

async function transcribeSegment(path: string, audio: string, previous: Line[], signal: AbortSignal): Promise<Omit<Line, "t">[]> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${FN_BASE}/interview-transcribe`, {
      method: "POST", headers: authHeaders(), signal,
      body: JSON.stringify({ path, audio, previous: previous.map(({ s, zh }) => ({ s, zh })) }),
    });
    if (!res.ok || !res.body) {
      const data = await res.json().catch(() => ({}));
      if ((res.status === 429 || res.status >= 500) && attempt < 3) {
        await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt + Math.random() * 1000));
        continue;
      }
      throw new Error(data?.error || `Transcription failed (${res.status})`);
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buffer = "", text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += dec.decode(value, { stream: true });
      const parts = buffer.split("\n");
      buffer = parts.pop() || "";
      for (const p of parts) {
        const d = p.trim();
        if (!d.startsWith("data:")) continue;
        const payload = d.slice(5).trim();
        if (payload === "[DONE]") continue;
        try { text += JSON.parse(payload)?.choices?.[0]?.delta?.content ?? ""; } catch { /* partial */ }
      }
    }
    const match = text.match(/\{[\s\S]*\}/);
    try {
      const lines = (JSON.parse(match ? match[0] : text)?.lines ?? []) as any[];
      return lines
        .filter((l) => l && (l.zh || l.en))
        .map((l) => ({ s: l.s === "B" ? "B" : "A", zh: String(l.zh ?? ""), en: String(l.en ?? "") }));
    } catch {
      return text.trim() ? [{ s: "A", zh: text.trim(), en: "" }] : [];
    }
  }
}

/** Downloads, decodes and transcribes the recording segment by segment. */
export async function generateTranscript(
  path: string,
  onProgress: (done: number, total: number) => void,
  onLines: (lines: Line[]) => void,
  signal: AbortSignal,
): Promise<void> {
  const url = await playUrl(path);
  const bytes = await (await fetch(url, { signal })).arrayBuffer();
  const ctx = new AudioContext({ sampleRate: RATE });
  let pcm: Float32Array;
  try {
    const decoded = await ctx.decodeAudioData(bytes);
    pcm = decoded.getChannelData(0);
    if (decoded.numberOfChannels > 1) {
      const r = decoded.getChannelData(1);
      const mono = new Float32Array(pcm.length);
      for (let i = 0; i < pcm.length; i++) mono[i] = (pcm[i] + r[i]) / 2;
      pcm = mono;
    }
  } catch {
    throw new Error("This recording format could not be read. Please upload MP3, M4A or WAV.");
  } finally {
    ctx.close();
  }
  const step = SEGMENT_SECONDS * RATE;
  const total = Math.ceil(pcm.length / step);
  let previous: Line[] = [];
  onProgress(0, total);
  for (let i = 0; i < total; i++) {
    if (signal.aborted) throw new DOMException("Stopped", "AbortError");
    const lines = (await transcribeSegment(path, wavBase64(pcm.subarray(i * step, (i + 1) * step)), previous, signal))
      .map((l) => ({ ...l, t: i * SEGMENT_SECONDS }));
    if (lines.length) { onLines(lines); previous = lines; }
    onProgress(i + 1, total);
  }
}
