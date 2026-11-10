export type ActiveCareTip = {
  caredOneId: string;
  caredOneName: string;
  title: string;
  content: string;
  category?: string | undefined;
};

/** Keep hidden bodies out of displayed/saved replies, including partial stream tails. */
export function hideCareTipBodies(text: string, tips: ActiveCareTip[], streaming = false): string {
  let visible = text;
  for (const tip of tips) {
    const body = tip.content.trim();
    if (!body) continue;
    visible = visible.split(body).join(tip.title);
    if (streaming) {
      for (let length = Math.min(body.length - 1, visible.length); length > 0; length--) {
        if (visible.endsWith(body.slice(0, length))) {
          visible = visible.slice(0, -length);
          break;
        }
      }
    }
  }
  return visible;
}

function careTipDetails(tips: ActiveCareTip[], isChinese: boolean): string {
  return tips
    .map((tip) => {
      const category =
        tip.category === "avoid"
          ? isChinese
            ? "避免"
            : "Avoid"
          : isChinese
            ? "建议"
            : "Tip";
      const title = tip.title.trim() || (isChinese ? "护理小贴士" : "Care tip");
      return `- ${tip.caredOneName} · ${category} · ${title}\n  ${tip.content.trim()}`;
    })
    .join("\n");
}

export function buildActiveCareTipsPrompt(
  tips: ActiveCareTip[],
  isChinese: boolean,
): string {
  if (tips.length === 0) return "";
  const details = careTipDetails(tips, isChinese);
  const behavior = isChinese
    ? "这些贴士已经由用户选为当前对话的有效参考。资料类内容只在相关时自然回答；行为建议、避免事项和说话方式要直接落实到回复中，不要只解释建议。区分当前说话的人与被要求回应的对象：对象明确时用对方姓名直接回应；只有对象是否在场或身份确实不清楚时，才自然地问一句确认。模拟来电时按已设置的来电者口吻，把电话另一端的人作为对话对象执行要求。不要提及贴士、记录、技能或资料来源，也不要复述全文。"
    : "The user selected these tips as active context for this chat. Use factual details naturally only when relevant; carry out behavioral advice, avoid items, and suggested wording in your response instead of merely explaining the advice. Distinguish the current speaker from the person the user wants addressed: use the person's known name and speak to them directly when the target is clear; ask one natural clarifying question only when their identity or presence is genuinely unclear. In simulated family-call mode, use the configured caller's voice and treat the person on the other end as the conversation partner. Never mention the tips, records, skills, or their source, and do not repeat their full text.";
  return [
    isChinese ? "当前正在使用的护理小贴士：" : "Care tips active in this chat:",
    details,
    behavior,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildCareTipSelectionPrompt(
  tips: ActiveCareTip[],
  isChinese: boolean,
): string {
  if (tips.length === 0) return "";
  const decision = isChinese
    ? "用户刚刚把这些贴士发送给你，还没有决定是否启用或收藏。确认已收到，不要复述正文；然后询问要在后续对话中使用，还是加入常用栏。此轮先不要把它们当作持续生效的指令。"
    : "The user has just sent you these tips but has not chosen whether to activate or favorite them. Confirm receipt without repeating their text, then ask whether to use them in future replies or add them to favorites. Do not treat them as ongoing instructions yet.";
  return [
    isChinese
      ? "刚刚发送给 AI 的护理小贴士："
      : "Care tips just sent to the AI:",
    careTipDetails(tips, isChinese),
    decision,
  ].join("\n\n");
}
