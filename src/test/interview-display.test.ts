import { describe, expect, it } from "vitest";
import { interviewDisplaySettings } from "../../supabase/functions/_shared/interview-display";

describe("recording visitor controls", () => {
  it("keeps existing consented recording playback and generation available", () => {
    expect(interviewDisplaySettings({ title: "P-CN2-B1" })).toEqual({ playbackAllowed: true, showPlayback: true, showGenerate: true });
  });
  it("hides occasional caregiver audio by default without hiding generation", () => {
    expect(interviewDisplaySettings({ title: "P-C1 Occasional caregiver" })).toEqual({ playbackAllowed: false, showPlayback: false, showGenerate: true });
  });
  it("retains disabled playback independently of visible controls and generation", () => {
    expect(interviewDisplaySettings({ playbackAllowed: false, showPlayback: true, showGenerate: true })).toEqual({ playbackAllowed: false, showPlayback: true, showGenerate: true });
  });
  it("allows researcher-approved playback for an occasional caregiver", () => {
    expect(interviewDisplaySettings({ title: "P-C2", playbackAllowed: true, showPlayback: true }).playbackAllowed).toBe(true);
  });
  it("retains archive-only display settings", () => {
    expect(interviewDisplaySettings({ showPlayback: false, showGenerate: false })).toEqual({ playbackAllowed: true, showPlayback: false, showGenerate: false });
  });
});