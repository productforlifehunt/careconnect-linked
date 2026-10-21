import { describe, expect, it } from "vitest";
import { appendixText, archiveToText } from "@/features/interviews/archive-text";

describe("archiveToText", () => {
  it("identifies each speaker and preserves Chinese and English without timestamps", () => {
    const text = archiveToText("P-CN1-A1", [
      { s: "A", zh: "你好", en: "Hello", t: 0 },
      { s: "B", zh: "我丈夫", en: "My husband", t: 95 },
    ]);
    expect(text).toContain("1. A — Interviewer / 访谈者\n中文：你好\nEnglish: Hello");
    expect(text).toContain("2. B — Interviewee / 受访者\n中文：我丈夫\nEnglish: My husband");
    expect(text).not.toMatch(/\[\d+:\d+\]/);
  });
  it("removes legacy sentence timestamps while preserving manually edited content", () => {
    expect(appendixText("Title\n1. [00:00] A\n中文：你好\n\n2. [01:35] B\nEnglish: My husband"))
      .toBe("Title\n1. A — Interviewer / 访谈者\n中文：你好\n\n2. B — Interviewee / 受访者\nEnglish: My husband");
  });
});
