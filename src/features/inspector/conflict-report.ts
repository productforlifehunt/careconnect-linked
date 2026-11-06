import { z } from 'zod';

export const conflictReportSchema = z.object({
  summary: z.string().min(1),
  comparedNoteIds: z.array(z.string()),
  comparedPairs: z.array(z.tuple([z.string(), z.string()])),
  codeCompared: z.boolean(),
  findings: z.array(z.object({
    kind: z.enum(['conflict', 'suspicion', 'redundancy', 'fallback', 'compatibility', 'missing_evidence']),
    title: z.string().min(1),
    noteIds: z.array(z.string()),
    evidence: z.string().min(1),
    verdict: z.string().min(1),
    fix: z.string().min(1),
  })),
});
export type ConflictReport = z.infer<typeof conflictReportSchema>;

/** A clean verdict requires complete pairwise and code coverage, never a percentage guess. */
export function validateConflictReport(text: string, ids: string[], requireCode: boolean): ConflictReport {
  const json = text.trim().replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  const report = conflictReportSchema.parse(JSON.parse(json));
  const unique = [...new Set(ids)];
  const missing: string[] = unique.filter(id => !report.comparedNoteIds.includes(id)).map(id => `注释 #${id} 未完成比对`);
  for (let i = 0; i < unique.length; i++) {
    for (let j = i + 1; j < unique.length; j++) {
      const a = unique[i], b = unique[j];
      if (a === undefined || b === undefined) continue;
      if (!report.comparedPairs.some(pair => pair.includes(a) && pair.includes(b))) missing.push(`注释 #${a} 与 #${b} 未完成逐对比对`);
    }
  }
  if (requireCode && !report.codeCompared) missing.push('实际代码证据未完成比对');
  for (const evidence of missing) report.findings.push({ kind: 'missing_evidence', title: '核查不完整', noteIds: [], evidence, verdict: '证据不足，不能认定一致', fix: '补齐证据并重新分析；不要修改已核对注释。' });
  return report;
}