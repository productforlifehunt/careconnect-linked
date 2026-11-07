var e=`import { ESM_SPEC, type SpecItem } from "./spec.generated";
import { translateSurveyText } from "./i18n";

export type ScreeningRole = "primary" | "secondary";

/** Interview role takes priority over legacy rows containing both personal sections. */
export function screeningRole(name: string, row: Record<string, unknown>): ScreeningRole | null {
  if (/\\bSecondary caregiver\\b/i.test(name)) return "secondary";
  if (/\\bPrimary caregiver\\b/i.test(name)) return "primary";
  const primaryAge = Number(row["a02"]) > 0;
  const secondaryAge = Number(row["a134"]) > 0;
  return primaryAge === secondaryAge ? null : primaryAge ? "primary" : "secondary";
}

export function screeningItemsForRole(role: ScreeningRole): SpecItem[] {
  const personal = ESM_SPEC.filter((item) => item.cct === "318" && item.group.startsWith(role === "primary" ? "1." : "2."));
  return role === "primary" ? personal : [
    ...personal,
    ...ESM_SPEC.filter((item) => item.cct === "318" && item.code.startsWith("1.7.")),
  ];
}

/** Only cite explicitly defined scale bounds, never infer them from option codes. */
export function scaleRangeLabel(item: SpecItem): string | null {
  return item.scale ? \`Scale / 量表范围：\${item.scale.min}–\${item.scale.max}\` : null;
}

/** Original document references, not storage IDs or generated answer-key order. */
export function screeningSource(item: SpecItem, role?: ScreeningRole | null | undefined) {
  const sharedSecondary = role === "secondary" && item.code.startsWith("1.7.");
  const heading = sharedSecondary ? (item.block || item.group).replace(/^1\\.7\\./, "2.2.") : item.block || item.group;
  const headingCode = heading.match(/^\\d+(?:\\.\\d+)*/)?.[0] ?? "";
  const name = heading.replace(/^\\d+(?:\\.\\d+)*\\s+/, "");
  const chineseName = translateSurveyText(name, true) ?? name;
  const root = role === "secondary" || item.group.startsWith("2.")
    ? "Secondary caregiver screening / 其他护理者初筛"
    : "Primary caregiver screening / 主护理者初筛";
  // ADL/IADL items are unnumbered in the original. Their generated \`code\`
  // incorrectly inherits 1.2.6, so cite the actual section and listed position.
  const unnumbered = headingCode === "1.2.7" || headingCode === "1.2.8";
  // The supplied Section 2.1 source numbers Age and Gender, then leaves
  // Education Level unnumbered before continuing at 2.1.3. Do not inherit
  // Gender's generated duplicate code.
  const unnumberedSecondaryEducation = role === "secondary" && item.id === "c318_a136";
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
        : "";
  return {
    chineseLabel: translateSurveyText(item.label, true) ?? item.label,
    source: \`\${root} · \${name} / \${chineseName}\`,
    reference: sharedSecondary
      ? \`Original section \${headingCode}, item \${position} / 原问卷 \${headingCode} 节，第 \${position} 题\`
      : unnumberedSecondaryEducation
        ? "Original section 2.1, Education Level (unnumbered) / 原问卷 2.1 节，教育程度（原文未单独编号）"
      : unnumbered
      ? \`Original section \${reference}, listed item \${position} / 原问卷 \${reference} 节，第 \${position} 项（原文未单独编号）\`
      : singleSectionItem
        ? "Original section 1.6, sole item / 原问卷 1.6 节，唯一题目（原文未单独编号）"
      : \`Original question \${reference} · Item \${position} / 原题号 \${reference} · 第 \${position} 题\${followup}\`,
  };
}`;export{e as default};