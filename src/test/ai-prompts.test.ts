import { describe, expect, it } from "vitest";
import {
  aiBrand,
  buildFallbackReply,
  buildSystemPrompt,
} from "../../supabase/functions/_shared/ai-prompts";
import { buildInfoSheetContext } from "@/lib/ai-dynamic-knowledge";

describe("central AI prompt registry", () => {
  it("names the assistant per site and language", () => {
    expect(aiBrand("en", "challenged")).toBe("ChallengeD AI Assistant");
    expect(aiBrand("zh", "challenged")).toBe("AI助手小忆");
    expect(aiBrand("en", "carecnc")).toBe("CareCNC AI Assistant");
    expect(aiBrand("zh", "carecnc")).toBe("护畅AI助手");
    expect(aiBrand("en", "notchsafety")).toBe("NotchSafety AI Assistant");
    expect(aiBrand("zh", "notchsafety")).toBe("诺驰安全AI助手");
  });

  it("keeps the system prompt minimal and non-refusing", () => {
    const prompt = buildSystemPrompt("en", false, "carecnc");
    expect(prompt).toContain("CareCNC AI Assistant");
    expect(prompt).toContain("Never refuse");
    // Persona + tone + the shared role/no-fabrication rules only.
    expect(prompt.length).toBeLessThan(1400);
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
