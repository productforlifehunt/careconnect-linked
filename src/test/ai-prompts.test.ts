import { describe, expect, it } from "vitest";
import {
  aiBrand,
  buildFallbackReply,
  buildInfoSheetContext,
  buildSystemPrompt,
} from "../../supabase/functions/_shared/ai-prompts";

describe("central AI prompt registry", () => {
  it("uses the English brand without leaking the Chinese name", () => {
    const prompt = buildSystemPrompt("en", true);
    expect(aiBrand("en")).toBe("ChallengeD Assistant");
    expect(prompt).toContain("ChallengeD Assistant");
    expect(prompt).toContain("Never output the Chinese name");
  });

  it("uses the Chinese brand for Chinese", () => {
    expect(aiBrand("zh-CN")).toBe("小忆 AI");
    expect(buildSystemPrompt("zh")).toContain("小忆 AI");
  });

  it("keeps dynamic care facts in request context", () => {
    const context = buildInfoSheetContext({ caredOneName: "Pat", knowledge: "Uses a cane" }, false);
    expect(context).toContain("Pat");
    expect(context).toContain("Uses a cane");
    expect(buildSystemPrompt("en")).not.toContain("Pat");
  });

  it("returns single-language degraded responses", () => {
    expect(buildFallbackReply("en")).not.toMatch(/[\u4e00-\u9fff]/);
    expect(buildFallbackReply("zh")).toMatch(/[\u4e00-\u9fff]/);
  });
});