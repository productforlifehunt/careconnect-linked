import { describe, expect, it } from "vitest";
import { canReceiveInterviewAudio, interviewDisplaySettings } from "../../supabase/functions/_shared/interview-display";

describe("recording visitor controls", () => {
  it("denies every visitor audio URL when playback is disabled even with a visible player", () => {
    expect(canReceiveInterviewAudio({ playbackAllowed: false, showPlayback: true }, false)).toBe(false);
  });
  it("denies every visitor audio URL when the player is hidden even with playback permission", () => {
    expect(canReceiveInterviewAudio({ playbackAllowed: true, showPlayback: false }, false)).toBe(false);
  });
  it("preserves researcher audio access in both restricted states", () => {
    expect(canReceiveInterviewAudio({ playbackAllowed: false, showPlayback: true }, true)).toBe(true);
    expect(canReceiveInterviewAudio({ playbackAllowed: true, showPlayback: false }, true)).toBe(true);
  });
  it("keeps existing consented recording playback and generation available", () => {
    expect(interviewDisplaySettings({ title: "P-CN2-B1" })).toEqual({ playbackAllowed: true, showPlayback: true, showGenerate: true, showRaw: true });
  });
  it("hides occasional caregiver audio by default without hiding generation", () => {
    expect(interviewDisplaySettings({ title: "P-C1 Occasional caregiver" })).toEqual({ playbackAllowed: false, showPlayback: false, showGenerate: true, showRaw: true });
  });
  it("retains disabled playback independently of visible controls and generation", () => {
    expect(interviewDisplaySettings({ playbackAllowed: false, showPlayback: true, showGenerate: true, showRaw: true })).toEqual({ playbackAllowed: false, showPlayback: true, showGenerate: true, showRaw: true });
  });
  it("allows researcher-approved playback for an occasional caregiver", () => {
    expect(interviewDisplaySettings({ title: "P-C2", playbackAllowed: true, showPlayback: true }).playbackAllowed).toBe(true);
  });
  it("retains archive-only display settings", () => {
    expect(interviewDisplaySettings({ showPlayback: false, showGenerate: false, showRaw: false })).toEqual({ playbackAllowed: true, showPlayback: false, showGenerate: false, showRaw: false });
  });
});