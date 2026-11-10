import type { ConflictReport, ReportNote } from './conflict-report';

export function noteRole(title: string, fallback: ReportNote['role']): ReportNote['role'] {
  return /功能逻辑|数据逻辑/.test(title) ? 'functional_note' : fallback;
}

/** Only server-read current page/element notes (never related notes, which are the trusted baseline) may become save targets. */
export function attachCorrectionNotes(report: ConflictReport, notes: ReportNote[]): ConflictReport {
  const records = new Map<string, ReportNote>();
  for (const note of notes) {
    const prev = records.get(note.id);
    const isCurrent = !!(note.current || prev?.current);
    if (!prev || prev.role === 'related_note' || note.role === 'functional_note') records.set(note.id, { ...note, current: isCurrent });
    else records.set(note.id, { ...prev, current: isCurrent });
  }
  const trusted = [...records.values()];
  return { ...report, notes: trusted, findings: report.findings.map(finding => ({ ...finding, suggestions: (finding.suggestions || []).filter(suggestion => {
    if (suggestion.target === 'code') return suggestion.noteId === null;
    const note = trusted.find(note => note.id === suggestion.noteId);
    return !!note && !note.aiLocked && !!note.current && note.role === suggestion.target;
  }) })) };
}

export function assertUnchangedNote(current: { title: string; text: string; verified: boolean }, expected: { title: string; text: string; verified: boolean }) {
  if (current.title !== expected.title || current.text !== expected.text || current.verified !== expected.verified) throw new Error('这条笔记在分析后已改变，未保存。请重新读取并分析，避免覆盖新修改。');
}