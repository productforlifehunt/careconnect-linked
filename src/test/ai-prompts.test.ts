import { describe, expect, it } from "vitest";
import {
  aiBrand,
  buildFallbackReply,
  buildSystemPrompt,
  stripFillerOpening,
} from "../../supabase/functions/_shared/ai-prompts";
import {
  buildCheckInContext,
  buildInfoSheetContext,
  buildMedicineDoseContext,
  runAssistantWriteSkill,
  runWriteSkill,
} from "@/lib/ai-dynamic-knowledge";
import { retrieveStaticKnowledge } from "@/lib/ai-static-knowledge";

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
    const prompt = buildSystemPrompt("en", "carecnc");
    expect(prompt).toContain("CareCNC AI Assistant");
    expect(prompt).toContain("without refusing");
    expect(prompt).toContain("identify who is currently speaking");
    expect(prompt).toContain("do not ask and relay the message in the same reply");
    expect(prompt).toContain("treat the callee as the listener");
    expect(prompt.length).toBeLessThan(1000);
  });

  it("loads speaker, companion, and open-chat guidance from the static skill", () => {
    const context = retrieveStaticKnowledge("", {
      skillNames: ["assistant.conversation", "assistant.care-tip-execution"],
      fallbackToIndex: false,
    });
    expect(context).toContain("At every turn");
    expect(context).toContain("Do not ask that question and deliver the message in the same reply");
    expect(context).toContain("output only one sentence addressed to the parent");
    expect(context).toContain("Do not preface it with empathy, explanation, or an introduction");
    expect(context).toContain("Never say that they just ate");
    expect(context).toContain("without steering it back to care, safety, or location");
    expect(context).toContain("## Care-tip understanding and use");
    expect(context).toContain("newly sent tips awaiting the user's choice");
  });

  it("cuts greeting boilerplate off the reply", () => {
    expect(stripFillerOpening("I’m talking to you now. Where did you last see it?"))
      .toBe("Where did you last see it?");
    expect(stripFillerOpening("你好，我现在就直接和你说话了。钱包可能在外套口袋里。"))
      .toBe("钱包可能在外套口袋里。");
    expect(stripFillerOpening("Hi there.")).toBe("Hi there.");
  });

  it("keeps dynamic care facts in request context", () => {
    const context = buildInfoSheetContext({ caredOneName: "Pat", description: "Uses a cane" }, false);
    expect(context).toContain("Pat");
    expect(context).toContain("Uses a cane");
    expect(buildSystemPrompt("en")).not.toContain("Pat");
  });

  it("keeps no-response distinct and rejects incomplete AI write statuses", async () => {
    expect(buildCheckInContext("daily check-in", "", "Pat", true)).toContain('"no-response"');
    expect(buildMedicineDoseContext("medicine at 08:00", false)).toContain("taken|skipped|no-response");
    await expect(
      runWriteSkill("record-medicine-dose", {}, { summary: "Dose was taken" }, { isChinese: false }),
    ).rejects.toThrow("unsupported write status");
    await expect(
      runAssistantWriteSkill({
        skill: "save-care-tip",
        question: "请保存这条护理小贴士",
        result: { summary: "Pat likes tea" },
        isChinese: true,
      }),
    ).rejects.toThrow("unsupported write status");
  });

  it("returns single-language degraded responses", () => {
    expect(buildFallbackReply("en")).not.toMatch(/[\u4e00-\u9fff]/);
    expect(buildFallbackReply("zh")).toMatch(/[\u4e00-\u9fff]/);
  });
});
