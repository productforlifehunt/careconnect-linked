import { describe, expect, it } from "vitest";
import { buildActiveCareTipsPrompt, buildCareTipSelectionPrompt, hideCareTipBodies } from "./ai-care-tip-context";
import { hasCareTipWriteIntent, runAssistantWriteSkill } from "./ai-dynamic-knowledge";

const tip = { caredOneId: "46", caredOneName: "爸爸", title: "饭后回应", content: "不要争辩他刚吃过饭，要说陪他看看想吃什么。", category: "avoid" };

describe("uploaded care-tip acceptance rules", () => {
  it("stopping all tips sends no active body", () => {
    expect(buildActiveCareTipsPrompt([tip], true)).toContain(tip.content);
    expect(buildActiveCareTipsPrompt([], true)).toBe("");
  });
  it("sending a pending tip keeps its body in context only", () => {
    expect(buildCareTipSelectionPrompt([tip], true)).toContain(tip.content);
    expect(hideCareTipBodies(`收到：${tip.content}`, [tip])).toBe("收到：饭后回应");
  });
  it("does not expose a body as streaming fragments arrive", () => {
    expect(hideCareTipBodies(`收到：${tip.content.slice(0, 12)}`, [tip], true)).toBe("收到：");
  });
  it.each(["不要保存这条护理小贴士", "别记住爸爸的习惯", "Don't save this care tip", "取消保存小贴士", "算了"])("does not save a cancelled request: %s", (question) => {
    expect(hasCareTipWriteIntent(question, [{ role: "user", content: "保存护理小贴士" }, { role: "assistant", content: "想保存给哪位？" }])).toBe(false);
  });
  it("recognizes an explicit new-tip save request", () => {
    expect(hasCareTipWriteIntent("请保存一条护理小贴士：爸爸喜欢茶")).toBe(true);
  });
  it("requires confirmation before any care-tip write", async () => {
    await expect(runAssistantWriteSkill({ skill: "save-care-tip", question: "请保存护理小贴士", result: { status: "saved", summary: "爸爸喜欢茶" }, isChinese: true })).rejects.toThrow("Confirm the care-tip content and person");
  });
});