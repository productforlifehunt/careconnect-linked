import { describe, expect, it } from "vitest";
import { overviewSource } from "@/features/interviews/overview-source";

describe("interview overview evidence", () => {
  const edited = { lines: [{ s: "B" as const, zh: "我已经退休，白天照顾丈夫。", en: "I am retired.", t: 0 }], savedAt: "1" };
  it("uses manual text corrections ahead of earlier Edited lines", () => {
    expect(overviewSource({ lines: [], text: "人工修订：我仍全职工作。", savedAt: "2" }, edited)).toBe("人工修订：我仍全职工作。");
  });
  it("uses the original Chinese and identifies the interviewee", () => {
    expect(overviewSource(null, edited)).toBe("1. Interviewee: 我已经退休，白天照顾丈夫。");
  });
  it("does not invent care facts when no corrected archive exists", () => {
    expect(overviewSource(null, null)).toBe("");
  });
});