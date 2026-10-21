import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateTranscript } from "@/features/interviews/transcribe";
import { readWavInfo, wavBase64, wavChunkToMono } from "../../supabase/functions/_shared/interview-wav";
import { mp3Segment } from "../../supabase/functions/_shared/interview-mp3";

vi.mock("@/services/wp-auth", () => ({ getWPToken: () => "" }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

describe("server-only recording transcription", () => {
  it("never falls back to downloading unsupported recording formats", async () => {
    const request = vi.spyOn(globalThis, "fetch");
    await expect(generateTranscript("sample.m4a", vi.fn(), vi.fn(), new AbortController().signal)).rejects.toThrow("Server transcription");
    expect(request).not.toHaveBeenCalled();
  });
  it("keeps complete MP3 frames on the server with an exact byte cursor", () => {
    const frame = new Uint8Array(417);
    frame.set([255, 251, 144, 0]);
    const bytes = new Uint8Array(417 * 1200);
    for (let i = 0; i < 1200; i++) bytes.set(frame, i * 417);
    const first = mp3Segment(bytes.buffer, 0, bytes.length);
    expect(first.nextOffset).toBe(417 * 1149);
    expect(atob(first.audio).length).toBe(417 * 1149);
    if (first.nextOffset === null) throw new Error("Missing next frame");
    const last = mp3Segment(bytes.buffer.slice(first.nextOffset), first.nextOffset, bytes.length);
    expect(last.nextOffset).toBeNull();
    expect(atob(last.audio).length).toBe(417 * 51);
  });
  beforeEach(() => vi.restoreAllMocks());
  it("generates fresh WAV text without receiving any audio URL or downloading audio", async () => {
    const requests: Record<string, unknown>[] = [];
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (url, options) => {
      expect(String(url)).toContain("/interview-transcribe");
      const body = JSON.parse(String(options?.body));
      requests.push(body);
      return Response.json({ total: 2, content: JSON.stringify({ lines: [{ s: "B", zh: `文字${body.segment}`, en: "Text" }] }) });
    });
    const lines = await generateTranscript("sample.wav", vi.fn(), vi.fn(), new AbortController().signal);
    expect(lines.map((l) => l.zh)).toEqual(["文字0", "文字1"]);
    expect(requests.map((r) => r['segment'])).toEqual([0, 1]);
    expect(requests.every((r) => !("audio" in r) && !("url" in r))).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it("encodes and decodes the same server-side mono PCM WAV samples", () => {
    const bytes = Uint8Array.from(atob(wavBase64(new Float32Array([0, 0.5, -0.5]))), (c) => c.charCodeAt(0));
    const info = readWavInfo(bytes.buffer);
    expect(info?.sampleRate).toBe(16000);
    expect(info?.dataSize).toBe(6);
    if (!info) throw new Error("Missing WAV header");
    const pcm = wavChunkToMono(bytes.buffer.slice(info.dataOffset), info);
    expect(pcm[1]).toBeCloseTo(0.5, 3);
    expect(pcm[2]).toBeCloseTo(-0.5, 3);
  });
});