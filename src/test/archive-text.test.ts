import { describe, expect, it } from "vitest";
import { archiveToText } from "@/features/interviews/archive-text";

describe("archiveToText", () => {
  it("numbers each sentence with time, speaker, Chinese and English", () => {
    const text = archiveToText("P-CN1-A1", [
      { s: "A", zh: "你好", en: "Hello", t: 0 },
      { s: "B", zh: "我丈夫", en: "My husband", t: 95 },
    ]);
    expect(text).toContain("1. [00:00] A\n中文：你好\nEnglish: Hello");
    expect(text).toContain("2. [01:35] B\n中文：我丈夫\nEnglish: My husband");
  });
});
