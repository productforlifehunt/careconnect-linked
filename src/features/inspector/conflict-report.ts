import { z } from 'zod';

export const correctionSchema = z.object({
  target: z.enum(['page_note', 'element_note', 'functional_note', 'code']),
  noteId: z.string().regex(/^\d+$/).nullable(),
  basisNoteIds: z.array(z.string()),
  reason: z.string().min(1), title: z.string(), text: z.string().min(1),
});
export type Correction = z.infer<typeof correctionSchema>;
export type ReportNote = { id: string; title: string; text: string; verified: boolean; role: 'page_note' | 'element_note' | 'functional_note' | 'related_note'; current?: boolean | undefined };
export const conflictReportSchema = z.object({
  summary: z.string().min(1),
  comparedNoteIds: z.array(z.string()),
  comparedPairs: z.array(z.tuple([z.string(), z.string()])),
  comparedCodeNoteIds: z.array(z.string()),
  codeCompared: z.boolean(),
  findings: z.array(z.object({
    kind: z.enum(['conflict', 'suspicion', 'redundancy', 'fallback', 'compatibility', 'missing_evidence', 'incomplete']),
    title: z.string().min(1),
    noteIds: z.array(z.string()),
    evidence: z.string().min(1),
    verdict: z.string().min(1),
    fix: z.string().min(1),
    suggestions: z.array(correctionSchema).optional(),
  })),
  notes: z.array(z.object({ id: z.string(), title: z.string(), text: z.string(), verified: z.boolean(), role: z.enum(['page_note', 'element_note', 'functional_note', 'related_note']), current: z.boolean().optional() })).optional(),
});
export type ConflictReport = z.infer<typeof conflictReportSchema>;

/** A clean verdict requires complete pairwise and code coverage, never a percentage guess. */
export function validateConflictReport(text: string, ids: string[], requireCode: boolean): ConflictReport {
  const json = text.trim().replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  const report = conflictReportSchema.parse(normalizeIds(JSON.parse(json)));
  const unique = [...new Set(ids)];
  const rejected: string[] = [];
  for (const finding of report.findings) {
    if (finding.suggestions) finding.suggestions = finding.suggestions.filter(suggestion => {
      let why = '';
      if (suggestion.basisNoteIds.some(id => !unique.includes(id))) why = '引用了未读取的笔记';
      else if (suggestion.target === 'code') { if (suggestion.noteId !== null) why = '代码建议指向了笔记'; }
      else if (!suggestion.noteId || !unique.includes(suggestion.noteId) || !suggestion.title.trim()) why = '目标不是本次核查的笔记';
      if (why) rejected.push(`「${finding.title}」的建议修改或补充被拒绝：${why}`);
      return !why;
    });
  }
  const missing: string[] = unique.filter(id => !report.comparedNoteIds.includes(id)).map(id => `注释 #${id} 未完成比对`);
  if (unique.length === 0) missing.push('没有绑定注释，无法核对注释与代码');
  if (requireCode) for (const id of unique) if (!report.comparedCodeNoteIds.includes(id)) missing.push(`实际代码与注释 #${id} 未完成比对`);
  for (let i = 0; i < unique.length; i++) {
    for (let j = i + 1; j < unique.length; j++) {
      const a = unique[i], b = unique[j];
      if (a === undefined || b === undefined) continue;
      if (!report.comparedPairs.some(pair => pair.includes(a) && pair.includes(b))) missing.push(`注释 #${a} 与 #${b} 未完成逐对比对`);
    }
  }
  for (const evidence of rejected) report.findings.push({ kind: 'missing_evidence', title: '建议修改或补充无效', noteIds: [], evidence, verdict: '该建议未采用', fix: '重新分析以获取有效建议。' });
  if (requireCode && !report.codeCompared) missing.push('实际代码证据未完成比对');
  for (const evidence of missing) report.findings.push({ kind: 'missing_evidence', title: '核查不完整', noteIds: [], evidence, verdict: '证据不足，不能认定一致', fix: '补齐证据并重新分析；不要修改已核对注释。' });
  return report;
}
/** Models often write ids as numbers or "#6858" / "CCT324 #6858"; reduce to bare digit strings. */
const ID_KEYS = new Set(['comparedNoteIds', 'comparedCodeNoteIds', 'noteIds', 'basisNoteIds', 'comparedPairs', 'noteId', 'id']);
function cleanId(v: unknown): unknown {
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') { const m = v.match(/(\d+)\s*$/); return m ? m[1] : v; }
  if (Array.isArray(v)) return v.map(cleanId);
  return v;
}
function normalizeIds(v: unknown, key = ''): unknown {
  if (ID_KEYS.has(key) && v !== null) return cleanId(v);
  if (Array.isArray(v)) return v.map(x => normalizeIds(x, key === 'findings' || key === 'suggestions' || key === 'notes' ? '' : key));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, normalizeIds(x, k)]));
  return v;
}
