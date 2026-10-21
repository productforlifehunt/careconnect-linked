/**
 * Interview recordings: upload to private storage and generate an A/B,
 * Chinese + English sentence-by-sentence transcript. Every Generate click
 * transcribes the recording again from the audio itself (nothing cached).
 */
import { supabase } from "@/integrations/supabase/client";
import { getWPToken } from "@/services/wp-auth";

const FN_BASE = `https://${import.meta.env["VITE_SUPABASE_PROJECT_ID"]}.supabase.co/functions/v1`;
// Keep each base64 WAV request below common browser/edge gateway body limits.
const SEGMENT_SECONDS = 30;
const RATE = 16000;

export interface Meta { title: string; notes: string; instructions: string; recruitmentSource?: string; playbackAllowed?: boolean; showPlayback?: boolean; showGenerate?: boolean }
export interface ParticipantMeta { title: string; recruitmentSource: string; notes: string }
export interface Recording { path: string; size: number; type: string; created: string; meta: Meta }
export interface Line { s: "A" | "B"; zh: string; en: string; t: number }
export interface TranscriptArchive { lines: Line[]; text?: string; savedAt: string }
export type ArchiveKind = "raw" | "edited" | "anonymized" | "text" | "anonymized-text";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"],
    Authorization: `Bearer ${import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]}`,
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
/** Only returned when the caller is authorized to receive the audio itself. */
const transcribeUrl = (path: string) => audioFn<{ url: string }>({ action: "transcribe_url", path }).then((d) => d.url);

export const saveMeta = (path: string, meta: Partial<Meta>) => audioFn<{ meta: Meta }>({ action: "save_meta", path, meta }).then((d) => d.meta);
export const listParticipantMeta = () => audioFn<{ items: Record<string, ParticipantMeta> }>({ action: "list_participant_meta" }).then((d) => d.items);
export const saveParticipantMeta = (participantId: string, meta: ParticipantMeta) => audioFn<{ meta: ParticipantMeta }>({ action: "save_participant_meta", participantId, meta }).then((d) => d.meta);
export const deleteRecording = (path: string) => audioFn<{ ok: boolean }>({ action: "delete", path });
export const loadTranscriptArchive = (path: string, kind: ArchiveKind = "raw") => audioFn<{ archive: TranscriptArchive | null }>({ action: "load_archive", path, kind }).then((d) => d.archive);
export const saveTranscriptArchive = (path: string, lines: Line[], kind: ArchiveKind = "raw") => audioFn<{ archive: TranscriptArchive }>({ action: "save_archive", path, lines, kind }).then((d) => d.archive);
export const saveTextArchive = (path: string, text: string, kind: "text" | "anonymized-text") => audioFn<{ archive: TranscriptArchive }>({ action: "save_archive", path, text, kind }).then((d) => d.archive);

/** Researcher only: replaces names with codes, chunk by chunk, keeping one mapping. */
export async function anonymizeLines(lines: Line[], onProgress?: (done: number, total: number) => void): Promise<Line[]> {
  const size = 100;
  const total = Math.ceil(lines.length / size);
  let names: Record<string, string> = {};
  const out: Line[] = [];
  for (let i = 0; i < total; i++) {
    for (let attempt = 0; ; attempt++) {
      try {
        const res = await audioFn<{ lines: Line[]; names: Record<string, string> }>({ action: "anonymize", lines: lines.slice(i * size, (i + 1) * size), names });
        out.push(...res.lines); names = res.names; break;
      } catch (e) {
        if (attempt >= 2 || /only the researcher|credits/i.test(String((e as Error)?.message))) throw e;
        await new Promise((r) => setTimeout(r, 3000 * 2 ** attempt));
      }
    }
    onProgress?.(i + 1, total);
  }
  return out;
}

export async function uploadRecording(file: File): Promise<string> {
  const { path, token } = await audioFn<{ path: string; token: string }>({ action: "upload_url", name: file.name });
  const { error } = await supabase.storage.from("interview-audio").uploadToSignedUrl(path, token, file, {
    contentType: file.type || "audio/mpeg",
  });
  if (error) throw new Error(error.message);
  return path;
}

/** Overwrites the audio of an existing recording; title, notes and archives stay as they are. */
export async function replaceRecording(path: string, file: File): Promise<void> {
  const { token } = await audioFn<{ path: string; token: string }>({ action: "replace_url", path });
  const { error } = await supabase.storage.from("interview-audio").uploadToSignedUrl(path, token, file, {
    contentType: file.type || "audio/mpeg", upsert: true,
  });
  if (error) throw new Error(error.message);
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
    const x = Math.max(-1, Math.min(1, samples[i]!));
    v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7fff, true);
  }
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

interface WavInfo {
  audioFormat: number;
  channels: number;
  sampleRate: number;
  bitsPerSample: number;
  blockAlign: number;
  dataOffset: number;
  dataSize: number;
}

async function fetchBytes(url: string, start: number, end: number, signal: AbortSignal): Promise<ArrayBuffer> {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetch(url, { headers: { Range: `bytes=${start}-${end}` }, signal });
      if (!response.ok && response.status !== 206) throw new Error(`Recording download failed (${response.status})`);
      return await response.arrayBuffer();
    } catch (error) {
      if (signal.aborted) throw error;
      if (attempt >= 3) throw new Error("The recording connection was interrupted after several retries. Please generate again.");
      await new Promise((resolve) => setTimeout(resolve, 2000 * 2 ** attempt + Math.random() * 1000));
    }
  }
}

function readWavInfo(buffer: ArrayBuffer): WavInfo | null {
  const view = new DataView(buffer);
  if (view.byteLength < 44 || view.getUint32(0, false) !== 0x52494646 || view.getUint32(8, false) !== 0x57415645) return null;
  let offset = 12;
  let format: Omit<WavInfo, "dataOffset" | "dataSize"> | null = null;
  while (offset + 8 <= view.byteLength) {
    const id = String.fromCharCode(view.getUint8(offset), view.getUint8(offset + 1), view.getUint8(offset + 2), view.getUint8(offset + 3));
    const size = view.getUint32(offset + 4, true);
    if (id === "fmt " && size >= 16 && offset + 8 + size <= view.byteLength) {
      format = {
        audioFormat: view.getUint16(offset + 8, true),
        channels: view.getUint16(offset + 10, true),
        sampleRate: view.getUint32(offset + 12, true),
        blockAlign: view.getUint16(offset + 20, true),
        bitsPerSample: view.getUint16(offset + 22, true),
      };
    }
    if (id === "data" && format) return { ...format, dataOffset: offset + 8, dataSize: size };
    offset += 8 + size + (size % 2);
  }
  return null;
}

function wavChunkToMono(buffer: ArrayBuffer, info: WavInfo): Float32Array {
  const view = new DataView(buffer);
  const frames = Math.floor(view.byteLength / info.blockAlign);
  const output = new Float32Array(frames);
  const bytesPerSample = info.bitsPerSample / 8;
  const sample = (offset: number) => {
    if (info.audioFormat === 3 && info.bitsPerSample === 32) return view.getFloat32(offset, true);
    if (info.audioFormat !== 1) throw new Error("This WAV encoding is not supported. Please use PCM WAV, MP3 or M4A.");
    if (info.bitsPerSample === 8) return (view.getUint8(offset) - 128) / 128;
    if (info.bitsPerSample === 16) return view.getInt16(offset, true) / 32768;
    if (info.bitsPerSample === 24) {
      let value = view.getUint8(offset) | (view.getUint8(offset + 1) << 8) | (view.getUint8(offset + 2) << 16);
      if (value & 0x800000) value |= ~0xffffff;
      return value / 8388608;
    }
    if (info.bitsPerSample === 32) return view.getInt32(offset, true) / 2147483648;
    throw new Error("This WAV bit depth is not supported.");
  };
  for (let frame = 0; frame < frames; frame++) {
    let sum = 0;
    for (let channel = 0; channel < info.channels; channel++) sum += sample(frame * info.blockAlign + channel * bytesPerSample);
    output[frame] = sum / info.channels;
  }
  if (info.sampleRate === RATE) return output;
  const resampled = new Float32Array(Math.floor(output.length * RATE / info.sampleRate));
  for (let i = 0; i < resampled.length; i++) {
    const source = i * info.sampleRate / RATE;
    const left = Math.floor(source);
    const right = Math.min(left + 1, output.length - 1);
    const fraction = source - left;
    resampled[i] = output[left]! * (1 - fraction) + output[right]! * fraction;
  }
  return resampled;
}

async function transcribeSegment(path: string, audio: string, previous: Line[], signal: AbortSignal, segment?: number, onTotal?: (total: number) => void): Promise<Omit<Line, "t">[]> {
  for (let attempt = 0; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(`${FN_BASE}/interview-transcribe`, {
        method: "POST", headers: authHeaders(), signal,
        body: JSON.stringify({ path, ...(segment === undefined ? { audio } : { segment }), previous: previous.map(({ s, zh }) => ({ s, zh })) }),
      });
    } catch (error) {
      if (signal.aborted) throw error;
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt + Math.random() * 1000));
        continue;
      }
      throw new Error("The connection was interrupted after several retries. Please generate again.");
    }
    if (!res.ok || !res.body) {
      const data = await res.json().catch(() => ({}));
      if ((res.status === 429 || res.status >= 500) && attempt < 3) {
        await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt + Math.random() * 1000));
        continue;
      }
      throw new Error(data?.error || `Transcription failed (${res.status})`);
    }
    const payload = await res.json().catch(() => ({}));
    if (segment !== undefined) {
      if (!Number.isInteger(payload.total) || payload.total < 1) throw new Error("Invalid transcription segment count");
      onTotal?.(payload.total);
    }
    const text = String(payload?.content || "");
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
): Promise<Line[]> {
  // WAV bytes stay on the server. The browser sends a segment index and
  // receives text only, irrespective of player visibility or permission.
  if (/\.wav$/i.test(path)) {
    let total = 1;
    const complete: Line[] = [];
    let previous: Line[] = [];
    onProgress(0, total);
    for (let i = 0; i < total; i++) {
      if (signal.aborted) throw new DOMException("Stopped", "AbortError");
      const lines = (await transcribeSegment(path, "", previous, signal, i, (count) => { total = count; }))
        .map((line) => ({ ...line, t: i * SEGMENT_SECONDS }));
      if (lines.length) { onLines(lines); complete.push(...lines); previous = lines; }
      onProgress(i + 1, total);
    }
    return complete;
  }
  const url = await transcribeUrl(path);
  // Large PCM WAV files are read in short byte ranges. This avoids a fragile
  // 100–500 MB browser download before the first transcript request starts.
  if (/\.wav$/i.test(path)) {
    const header = await fetchBytes(url, 0, 65535, signal);
    const info = readWavInfo(header);
    if (info && info.channels > 0 && info.blockAlign > 0 && info.sampleRate > 0) {
      const sourceFramesPerSegment = SEGMENT_SECONDS * info.sampleRate;
      const bytesPerSegment = sourceFramesPerSegment * info.blockAlign;
      const total = Math.ceil(info.dataSize / bytesPerSegment);
      const complete: Line[] = [];
      let previous: Line[] = [];
      onProgress(0, total);
      for (let i = 0; i < total; i++) {
        if (signal.aborted) throw new DOMException("Stopped", "AbortError");
        const start = info.dataOffset + i * bytesPerSegment;
        const end = Math.min(info.dataOffset + info.dataSize - 1, start + bytesPerSegment - 1);
        const pcm = wavChunkToMono(await fetchBytes(url, start, end, signal), info);
        const lines = (await transcribeSegment(path, wavBase64(pcm), previous, signal))
          .map((line) => ({ ...line, t: i * SEGMENT_SECONDS }));
        if (lines.length) { onLines(lines); complete.push(...lines); previous = lines; }
        onProgress(i + 1, total);
      }
      return complete;
    }
  }
  const bytes = await (await fetch(url, { signal })).arrayBuffer();
  const ctx = new AudioContext({ sampleRate: RATE });
  let pcm: Float32Array;
  try {
    const decoded = await ctx.decodeAudioData(bytes);
    pcm = decoded.getChannelData(0);
    if (decoded.numberOfChannels > 1) {
      const r = decoded.getChannelData(1);
      const mono = new Float32Array(pcm.length);
      for (let i = 0; i < pcm.length; i++) mono[i] = (pcm[i]! + r[i]!) / 2;
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
  const complete: Line[] = [];
  onProgress(0, total);
  for (let i = 0; i < total; i++) {
    if (signal.aborted) throw new DOMException("Stopped", "AbortError");
    const lines = (await transcribeSegment(path, wavBase64(pcm.subarray(i * step, (i + 1) * step)), previous, signal))
      .map((l) => ({ ...l, t: i * SEGMENT_SECONDS }));
    if (lines.length) { onLines(lines); complete.push(...lines); previous = lines; }
    onProgress(i + 1, total);
  }
  return complete;
}
