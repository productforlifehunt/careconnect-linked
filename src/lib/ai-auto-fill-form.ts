/**
 * AI AUTO-FILL FORM — the ONE hidden form every AI-driven record goes through.
 *
 * There is a single generic form (this registry). Each "intent" is one row in it
 * and declares: the wording, the allowed outcomes, when the exchange is
 * finished, which existing feature function performs the real database write,
 * and which cached lists refresh afterwards.
 *
 * The AI never writes and never calls a tool. It only returns
 * {done, status, summary}. The confirm / skip buttons are plain front-end UI in
 * src/components/ai/AICompanionChat.tsx, and the single shared entry point is
 * openWriteAssistant() in src/contexts/AIAssistantContext.tsx.
 *
 * READ context (permissions, facts sent to the AI) lives separately in
 * src/lib/ai-dynamic-knowledge.ts. Reads and writes are deliberately kept in
 * two files: one is about what may be shown, this one is about what may be saved.
 */

import {
  buildCheckInContext,
  buildMedicineDoseContext,
  buildMedicineDoseStarter,
} from "../../supabase/functions/_shared/ai-prompts";

type Lang = { isChinese: boolean };

const Z = (isChinese: boolean, zh: string, en: string) => (isChinese ? zh : en);

// ─────────────────────────── Write layer (single source) ────────────────────
/**
 * WRITE SPECS — the one place that says, for each AI-driven record:
 *   • which outcomes are allowed,
 *   • when the AI should consider the exchange finished,
 *   • which existing feature function performs the database write.
 *
 * The AI still writes nothing. It only returns {done, status, summary}; the
 * front end asks for the spec by intent and calls spec.write(). Change a data
 * structure, a status list, or a write rule here and every AI surface follows —
 * no prompt edits, no component edits.
 */
export type WriteIntent = "medicine-dose" | "check-in" | "care-tip";

export interface WriteTarget {
  caredOneId?: string;
  /** Medicine record id (medicine-dose) or check-in record id (check-in). */
  recordId?: string;
  /** Human label used in the rule text, e.g. the medicine or check-in name. */
  label?: string;
  /** Extra plain-language detail, e.g. "Aricept · 5mg · 08:00" or check-in instructions. */
  detail?: string;
}

export interface WriteSpec {
  intent: WriteIntent;
  /** Dialog title shown above the conversation. */
  title: string;
  /** Full context text handed to the AI (scene + finish rule). */
  contextPrompt: string;
  /** First instruction that makes the assistant open the conversation. */
  starterPrompt: string;
  /** Shown if the model is unreachable. */
  starterFallback: string;
  /** Toast text after a successful write, by outcome. */
  toastFor: (status?: string) => string;
  /** Allowed outcomes; the first one is the default when the AI omits status. */
  statuses: string[];
  /** The rule sentence appended to the context so the AI knows when to finish. */
  rule: string;
  /** Performs the real write through the feature layer the manual forms use. */
  write: (result: { status?: string; summary?: string }) => Promise<void>;
  /** Cached lists that must refresh after the write. */
  invalidateKeys: string[][];
}

const asStatus = (spec: string[], status?: string) =>
  status && spec.includes(status) ? status : spec[0];

export function resolveWriteSpec(
  intent: WriteIntent,
  target: WriteTarget,
  { isChinese }: Lang
): WriteSpec {
  const name = target.label || "";

  if (intent === "medicine-dose") {
    const statuses = ["taken", "skipped", "no-response"];
    const dose = target.detail || name;
    const rule = Z(
        isChinese,
        `这是${name || "这次"}用药的记录对话。确认服用、跳过，或对方始终没有回应时，返回 JSON：{"done":true,"status":"taken|skipped|no-response","summary":"一两句说明"}。不要询问剂量以外的医疗判断。`,
        `This exchange records the ${name || "current"} dose. When it is confirmed taken, skipped, or the person never responds, return JSON: {"done":true,"status":"taken|skipped|no-response","summary":"one or two sentences"}. Do not give medical judgement beyond the dose.`
    );
    return {
      intent,
      statuses,
      rule,
      title: Z(isChinese, "用药提醒", "Medicine reminder"),
      contextPrompt: [buildMedicineDoseContext(dose, isChinese), rule].join("\n\n"),
      starterPrompt: buildMedicineDoseStarter(dose, isChinese),
      starterFallback: Z(
        isChinese,
        `到了 ${name} 的用药时间。已经服用了吗？`,
        `It is time for ${name}. Has this dose been taken?`
      ),
      toastFor: (status) =>
        asStatus(statuses, status) === "taken"
          ? Z(isChinese, `${name} 已记录服用`, `${name} recorded as taken`)
          : Z(isChinese, `${name} 已跳过`, `${name} skipped`),
      write: async ({ status, summary }) => {
        const { logMedicineWordPress } = await import("@/features/medicine/source.medicine");
        await logMedicineWordPress({
          medicine_id: String(target.recordId),
          status: asStatus(statuses, status) === "taken" ? "taken" : "skipped",
          note: summary || undefined,
          user_id: target.caredOneId,
        } as any);
      },
      invalidateKeys: [["medicineLogs"], ["todayMedicineLogs"]],
    };
  }

  if (intent === "check-in") {
    const statuses = ["checked", "skipped", "no-response"];
    const rule = Z(
        isChinese,
        `这是${name || "本次"}签到对话。签到完成、对方选择跳过，或对方始终没有回应时，返回 JSON：{"done":true,"status":"checked|skipped|no-response","summary":"把问到的情况写成一两句"}。`,
        `This exchange is the ${name || "current"} check-in. When it is completed, skipped, or the person never responds, return JSON: {"done":true,"status":"checked|skipped|no-response","summary":"one or two sentences of what was reported"}.`
    );
    return {
      intent,
      statuses,
      rule,
      title: Z(isChinese, "AI 签到", "AI Check-In"),
      contextPrompt: [
        buildCheckInContext(
          name || Z(isChinese, "签到", "Check-In"),
          target.detail || "",
          Z(isChinese, "被护理者", "the cared one"),
          isChinese
        ),
        rule,
      ].join("\n\n"),
      starterPrompt: Z(isChinese, "现在请开始签到。", "Please start the check-in now."),
      starterFallback: Z(
        isChinese,
        "你好，到了签到时间。今天感觉怎么样？",
        "Hi, it is check-in time. How are you today?"
      ),
      toastFor: () => Z(isChinese, "AI 签到已保存", "AI check-in saved"),
      write: async ({ status, summary }) => {
        const { logCheckinWordPress } = await import("@/features/cared-ones/source.wordpress-extended");
        const s = asStatus(statuses, status);
        await logCheckinWordPress({
          checkin_id: String(target.recordId),
          status: s === "checked" ? "checked" : s === "skipped" ? "skipped" : "missed",
          note: summary || "",
          checked_by_ai: true,
          cared_one_id: target.caredOneId,
          checkin_name: name || undefined,
        });
      },
      invalidateKeys: [["checkinLogs"], ["todayCheckinLogs"]],
    };
  }

  const statuses = ["saved", "discarded"];
  const tipRule = Z(
      isChinese,
      `当用户想把一条护理小贴士存下来时，返回 JSON：{"done":true,"status":"saved","summary":"小贴士正文"}；用户改主意就用 status "discarded"。`,
      `When the user wants a care tip saved, return JSON: {"done":true,"status":"saved","summary":"the tip text"}; use status "discarded" if they change their mind.`
  );
  return {
    intent: "care-tip",
    statuses,
    rule: tipRule,
    title: Z(isChinese, "护理小贴士", "Care tip"),
    contextPrompt: tipRule,
    starterPrompt: Z(isChinese, "请帮我把这条护理小贴士整理好。", "Help me word this care tip."),
    starterFallback: Z(isChinese, "想记下哪一条护理小贴士？", "Which care tip would you like to save?"),
    toastFor: (status) =>
      asStatus(statuses, status) === "saved"
        ? Z(isChinese, "小贴士已保存", "Care tip saved")
        : Z(isChinese, "已丢弃", "Discarded"),
    write: async ({ status, summary }) => {
      if (asStatus(statuses, status) !== "saved" || !summary) return;
      const { createCareTipWordPress } = await import("@/features/cared-ones/source.wordpress-extended");
      await createCareTipWordPress({ user_id: String(target.caredOneId), content: summary });
    },
    invalidateKeys: [["careTips"]],
  };
}
