import { describe, expect, it } from "vitest";
import {
  aiBrand,
  buildFallbackReply,
  buildSystemPrompt,
  stripFillerOpening,
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
    // Persona + tone + the shared role-switch / no-fabrication checklist only.
    expect(prompt).toContain("who is speaking now");
    expect(prompt).toContain("Hand-off signals");
    expect(prompt.length).toBeLessThan(3200);
  });

  it("cuts greeting boilerplate off the reply", () => {
    expect(stripFillerOpening("Hi there. I’m talking to you now. Where did you last see it?"))
      .toBe("Where did you last see it?");
    expect(stripFillerOpening("你好，我现在就直接和你说话了。钱包可能在外套口袋里。"))
      .toBe("钱包可能在外套口袋里。");
    expect(stripFillerOpening("Hi there.")).toBe("Hi there.");
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
