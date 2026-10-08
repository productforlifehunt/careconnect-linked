import { ESM_SPEC, type SpecItem } from "./spec.generated";
import { translateSurveyText } from "./i18n";

/** Only cite explicitly defined scale bounds, never infer them from option codes. */
export function scaleRangeLabel(item: SpecItem): string | null {
  return item.scale ? `Scale / 量表范围：${item.scale.min}–${item.scale.max}` : null;
}

/** Original document references, not storage IDs or generated answer-key order. */
export function screeningSource(item: SpecItem) {
  const heading = item.block || item.group;
  const headingCode = heading.match(/^\d+(?:\.\d+)*/)?.[0] ?? "";
  const name = heading.replace(/^\d+(?:\.\d+)*\s+/, "");
  const chineseName = translateSurveyText(name, true) ?? name;
  const root = item.group.startsWith("2.")
    ? "Secondary caregiver screening / 其他护理者初筛"
    : "Primary caregiver screening / 主护理者初筛";
  // ADL/IADL items are unnumbered in the original. Their generated `code`
  // incorrectly inherits 1.2.6, so cite the actual section and listed position.
  const unnumbered = headingCode === "1.2.7" || headingCode === "1.2.8";
  const singleSectionItem = item.code === "1.6";
  const position = unnumbered
    ? ESM_SPEC.filter((candidate) => candidate.cct === item.cct && candidate.block === heading).findIndex((candidate) => candidate.id === item.id) + 1
    : singleSectionItem ? 1 : Number(item.code.split(".").at(-1));
  const reference = unnumbered ? headingCode : item.code;
  const followup = item.otherFor
    ? " · Other detail (unnumbered follow-up) / 其他补充（原文未单独编号）"
    : / caregiver distress$/.test(item.label)
      ? " · Caregiver distress / 护理者困扰"
      : / severity$/.test(item.label)
        ? " · Severity / 严重程度"
        : item.code === "2.1.2"
          ? " · Shared original number / 原文两项共用此题号"
          : "";
  return {
    chineseLabel: translateSurveyText(item.label, true) ?? item.label,
    source: `${root} · ${name} / ${chineseName}`,
    reference: unnumbered
      ? `Original section ${reference}, listed item ${position} / 原问卷 ${reference} 节，第 ${position} 项（原文未单独编号）`
      : singleSectionItem
        ? "Original section 1.6, sole item / 原问卷 1.6 节，唯一题目（原文未单独编号）"
      : `Original question ${reference} · Item ${position} / 原题号 ${reference} · 第 ${position} 题${followup}`,
  };
}