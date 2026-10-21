import { afterEach, describe, expect, it, vi } from "vitest";
import { InterviewPlayback } from "@/features/interviews/playback";
import { recordingStreamChunk } from "../../supabase/functions/_shared/interview-stream";
import { wavBase64 } from "../../supabase/functions/_shared/interview-wav";

vi.mock("@/services/wp-auth", () => ({ getWPToken: () => "" }));
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("bounded click-only interview playback", () => {
  it("does not request anything until play and requests only one chunk while buffering/playing", async () => {
    const source = { buffer: null, connect: vi.fn(), start: vi.fn(), stop: vi.fn(), onended: null };
    vi.stubGlobal("AudioContext", class {
      currentTime = 0; destination = {};
      resume = vi.fn().mockResolvedValue(undefined);
      close = vi.fn().mockResolvedValue(undefined);
      decodeAudioData = vi.fn().mockResolvedValue({ duration: 5 });
      createBufferSource = () => source;
    });
    const request = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(new Uint8Array([1, 2]), {
      headers: { "X-Next-Offset": "80044", "X-Duration": "600", "X-Position": "0", "X-Recording-Size": "9600044" },
    }));
    const player = new InterviewPlayback("sample.wav", vi.fn(), vi.fn());
    expect(request).not.toHaveBeenCalled();
    await player.play();
    expect(request).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(request.mock.calls[0]?.[1]?.body))).toEqual({ action: "stream", path: "sample.wav", offset: 0 });
    expect(source.start).toHaveBeenCalledOnce();
    player.dispose();
  });

  it("stops on denied playback without decoding audio or retrying", async () => {
    const decode = vi.fn();
    vi.stubGlobal("AudioContext", class {
      resume = vi.fn().mockResolvedValue(undefined); close = vi.fn().mockResolvedValue(undefined);
      decodeAudioData = decode;
    });
    const request = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ error: "Playback unavailable" }, { status: 403 }));
    const error = vi.fn();
    const player = new InterviewPlayback("sample.wav", vi.fn(), error);
    await player.play();
    expect(request).toHaveBeenCalledOnce(); expect(decode).not.toHaveBeenCalled(); expect(error).toHaveBeenCalled();
    player.dispose();
  });

  it("returns five seconds rather than an entire 20-second WAV", async () => {
    const bytes = Uint8Array.from(atob(wavBase64(new Float32Array(16000 * 20))), c => c.charCodeAt(0));
    const ranges: string[] = [];
    vi.spyOn(globalThis, "fetch").mockImplementation(async (_url, init) => {
      const range = new Headers(init?.headers).get("Range") || ""; ranges.push(range);
      const [start, end] = range.replace("bytes=", "").split("-").map(Number);
      return new Response(bytes.slice(start, Math.min((end ?? 0) + 1, bytes.length)), { status: 206, headers: { "Content-Range": `bytes ${start}-${end}/${bytes.length}` } });
    });
    const chunk = await recordingStreamChunk("https://private.example/audio", 0);
    expect(chunk.bytes.length).toBe(160044);
    expect(chunk.nextOffset).toBe(160044);
    expect(chunk.duration).toBe(20);
    expect(ranges).toEqual(["bytes=0-65535", "bytes=44-160043"]);
    expect(chunk).not.toHaveProperty("url");
  });
});