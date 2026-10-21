import { readWavInfo, wavBase64, wavChunkToMono } from "./interview-wav.ts";
import { mp3Segment } from "./interview-mp3.ts";

export const PLAYBACK_SECONDS = 5;

/** Fetch bounded ranges server-side; the storage address never leaves the server. */
export async function recordingStreamChunk(url: string, offset: number, signal?: AbortSignal) {
  const range = async (start: number, end: number) => {
    const response = await fetch(url, { headers: { Range: `bytes=${start}-${end}` }, signal });
    if (response.status !== 206) throw new Error("Recording range unavailable");
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > end - start + 1) throw new Error("Invalid recording range");
    return { bytes, size: Number(response.headers.get("Content-Range")?.split("/")[1]) };
  };
  const header = await range(0, 65535);
  if (!Number.isSafeInteger(header.size) || header.size < 1) throw new Error("Invalid recording size");
  let info = readWavInfo(header.bytes);
  const wav = new DataView(header.bytes).byteLength >= 12 && new DataView(header.bytes).getUint32(0, false) === 0x52494646;
  if (wav) {
    for (let end = 262143; !info && end <= 4194303; end = (end + 1) * 4 - 1) {
      info = readWavInfo((await range(0, Math.min(end, header.size - 1))).bytes);
    }
    if (!info) throw new Error("Unsupported WAV header");
  }
  let encoded: string;
  let nextOffset: number | null;
  let duration: number;
  let position: number;
  let type: string;
  if (info) {
    const bytesPerSecond = info.sampleRate * info.blockAlign;
    if (bytesPerSecond < 1 || bytesPerSecond * PLAYBACK_SECONDS > 4_000_000) throw new Error("Unsupported WAV format");
    const start = offset === 0 ? info.dataOffset : offset;
    if (start < info.dataOffset || start >= info.dataOffset + info.dataSize) throw new Error("Invalid recording offset");
    const aligned = info.dataOffset + Math.floor((start - info.dataOffset) / info.blockAlign) * info.blockAlign;
    const end = Math.min(info.dataOffset + info.dataSize - 1, aligned + PLAYBACK_SECONDS * bytesPerSecond - 1);
    encoded = wavBase64(wavChunkToMono((await range(aligned, end)).bytes, info));
    nextOffset = end + 1 >= info.dataOffset + info.dataSize ? null : end + 1;
    duration = info.dataSize / bytesPerSecond;
    position = (aligned - info.dataOffset) / bytesPerSecond;
    type = "audio/wav";
  } else {
    if (offset >= header.size) throw new Error("Invalid recording offset");
    const bytes = (await range(offset, Math.min(header.size - 1, offset + 262143))).bytes;
    const part = mp3Segment(bytes, offset, header.size, PLAYBACK_SECONDS);
    encoded = part.audio; nextOffset = part.nextOffset;
    const rate = (part.nextOffset === null ? header.size - offset : part.nextOffset - offset) / part.seconds;
    duration = header.size / rate;
    position = offset / rate;
    type = "audio/mpeg";
  }
  const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  return { bytes, nextOffset, duration, position, type, fileSize: header.size };
}