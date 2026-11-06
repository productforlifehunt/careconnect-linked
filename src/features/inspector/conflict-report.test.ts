import { expect, it } from 'vitest';
import { validateConflictReport } from './conflict-report';

const base = { summary: '完成比对', comparedNoteIds: ['1', '2', '3'], comparedCodeNoteIds: ['1','2','3'], comparedPairs: [['1','2'], ['1','3'], ['2','3']], codeCompared: true, findings: [] };
it('requires all related-note pairs, not only the current note versus each related note', () => {
  const report = validateConflictReport(JSON.stringify({ ...base, comparedPairs: [['1','2'], ['1','3']] }), ['1','2','3'], true);
  expect(report.findings).toHaveLength(1);
  expect(report.findings[0]?.evidence).toBe('注释 #2 与 #3 未完成逐对比对');
});
it('does not allow a clean verdict without code evidence', () => {
  expect(validateConflictReport(JSON.stringify({ ...base, codeCompared: false }), ['1','2','3'], true).findings[0]?.kind).toBe('missing_evidence');
});
it('requires code comparison against every related note individually', () => {
  expect(validateConflictReport(JSON.stringify({ ...base, comparedCodeNoteIds: ['1','2'] }), ['1','2','3'], true).findings[0]?.evidence).toBe('实际代码与注释 #3 未完成比对');
});
it('keeps even one suspicion in the error report', () => {
  const finding = { kind: 'suspicion', title: '讨论来源疑点', noteIds: ['2'], evidence: '注释写 CCT16，代码读取 CCT202', verdict: '需核查注释', fix: '按实际用途核对' };
  expect(validateConflictReport(JSON.stringify({ ...base, findings: [finding] }), ['1','2','3'], true).findings).toEqual([finding]);
});
it('accepts zero findings only with complete note, pair and code coverage', () => {
  expect(validateConflictReport(JSON.stringify(base), ['1','2','3'], true).findings).toHaveLength(0);
});
it('rejects an unstructured or truncated result rather than showing a clean verdict', () => {
  expect(() => validateConflictReport('一致度100%', ['1'], true)).toThrow();
});