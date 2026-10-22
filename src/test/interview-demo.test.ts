import { afterEach, describe, expect, it, vi } from "vitest";
import { canPreloadInterviewAudio, DEMO_RECORDINGS, isDemoRecording } from "../../supabase/functions/_shared/interview-demo";
import { PreloadedInterviewPlayback } from "@/features/interviews/preload-playback";

const api = vi.hoisted(() => ({ preloadRecordingUrl: vi.fn() }));
vi.mock("@/features/interviews/transcribe", () => api);
afterEach(() => { vi.clearAllMocks(); vi.unstubAllGlobals(); });

describe("consented full-preload demos", () => {
  it("grants full preload to exactly the five currently consented recording identities", () => {
    expect(DEMO_RECORDINGS).toEqual([
      "1792069468864_34.wav", "1790775526991_32.wav", "1791796863950_33_-edited.wav", "1791798861562_31_-edited.wav", "1790783161922_27.wav",
    ]);
    expect(isDemoRecording("1791798861562_31_-edited.wav")).toBe(true);
    expect(isDemoRecording("1790781885160_57.wav")).toBe(false);
    for (const path of DEMO_RECORDINGS) expect(canPreloadInterviewAudio(path, { showPlayback: true, playbackAllowed: true }, false)).toBe(true);
    expect(isDemoRecording("1790786958895_40.wav")).toBe(false);
    expect(canPreloadInterviewAudio("1790786958895_40.wav", { title: "P-CN1-A1", showPlayback: true, playbackAllowed: true }, true)).toBe(false);
  });
  it("refuses full preload for hidden or disabled demo visitors", () => {
    for (const path of DEMO_RECORDINGS) {
      expect(canPreloadInterviewAudio(path, { showPlayback: false, playbackAllowed: true }, false)).toBe(false);
      expect(canPreloadInterviewAudio(path, { showPlayback: true, playbackAllowed: false }, false)).toBe(false);
      expect(canPreloadInterviewAudio(path, { showPlayback: false, playbackAllowed: false }, true)).toBe(true);
    }
  });
  it("preloads the authorized demo before play, starts only on click and clears it on dispose", async () => {
    let audio: any;
    vi.stubGlobal("Audio", class {
      preload = ""; controls = true; src = ""; paused = true; ended = false; currentTime = 0; duration = 120;
      setAttribute = vi.fn(); addEventListener = vi.fn(); load = vi.fn(); pause = vi.fn();
      removeAttribute = vi.fn(); play = vi.fn().mockResolvedValue(undefined);
      constructor() { audio = this; }
    });
    api.preloadRecordingUrl.mockResolvedValue("https://audio.example/authorized-demo");
    const player = new PreloadedInterviewPlayback(DEMO_RECORDINGS[0], vi.fn(), vi.fn());
    await Promise.resolve();
    expect(api.preloadRecordingUrl).toHaveBeenCalledWith("1792069468864_34.wav");
    expect(audio.src).toBe("https://audio.example/authorized-demo");
    expect(audio.preload).toBe("auto"); expect(audio.controls).toBe(false);
    expect(audio.play).not.toHaveBeenCalled();
    await player.play(); expect(audio.play).toHaveBeenCalledOnce();
    player.seek(35); expect(audio.currentTime).toBe(35);
    player.dispose(); expect(audio.removeAttribute).toHaveBeenCalledWith("src");
  });
  it("never attaches audio after a denied preload", async () => {
    const play = vi.fn(); const load = vi.fn();
    vi.stubGlobal("Audio", class {
      src = ""; setAttribute = vi.fn(); addEventListener = vi.fn(); load = load; play = play; pause = vi.fn(); removeAttribute = vi.fn();
    });
    api.preloadRecordingUrl.mockRejectedValue(new Error("403"));
    const error = vi.fn(); const player = new PreloadedInterviewPlayback(DEMO_RECORDINGS[0], vi.fn(), error);
    await player.play();
    expect(error).toHaveBeenCalledOnce(); expect(load).not.toHaveBeenCalled(); expect(play).not.toHaveBeenCalled();
    player.dispose();
  });
});