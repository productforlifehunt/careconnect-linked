import type { SourceAnnotation } from './source-notes';

/** Location bindings are inspector configuration, not WordPress business relations. */
export interface NoteBinding {
  key: string;
  id: string;
  scope: 'element' | 'page' | 'site';
  page: string;
  label: string;
  locked?: boolean | undefined;
  source?: SourceAnnotation['source'];
  alias?: string | undefined;
}
export interface CCTNote extends SourceAnnotation {
  id: string;
  title: string;
  version?: string | undefined;
  noteType?: "b55" | "b56" | undefined;
  tabOrder?: number | undefined;
  locked?: boolean | undefined;
  /** CCT324 a65: note is still being edited. */
  todo?: boolean | undefined;
  /** CCT324 a66: prohibit AI changes; human editing remains available. */
  aiLocked?: boolean | undefined;
  /** CCT324 已手动核对 (a58): b55 是 / b56 否。 */
  verified?: boolean | undefined;
  /** CCT324 a60/a61: whether the note's REL325 connections were reviewed and the review details. */
  relationVerified?: boolean | undefined;
  relationDetails?: string | undefined;
}
export function bindCCTNotes(rows: CCTNote[], bindings: NoteBinding[]): CCTNote[] {
  const byId = new Map(rows.map(row => [row.id, row]));
  return [...rows, ...bindings.map(binding => {
    const row = byId.get(binding.id);
    if (!row) throw new Error(`注释 #${binding.id} 不存在，不能显示其他注释代替。`);
    return { ...row, ...binding };
  })];
}
export function noteCatalogue(notes: Map<string, SourceAnnotation>): CCTNote[] {
  const unique = new Map<string, CCTNote>();
  notes.forEach(note => { if (note.id && note.title !== undefined) unique.set(note.id, note as CCTNote); });
  return [...unique.values()].sort((a,b) => a.title.localeCompare(b.title, 'zh') || Number(a.id) - Number(b.id));
}
export function replaceCCTNote(notes: Map<string, SourceAnnotation>, updated: CCTNote) {
  const next = new Map(notes);
  next.forEach((note, key) => {
    if (note.id === updated.id)
      next.set(key, {
        ...note,
        text: updated.text,
        title: updated.title,
        version: updated.version,
        noteType: updated.noteType,
        tabOrder: updated.tabOrder,
        todo: updated.todo,
        aiLocked: updated.aiLocked,
        updatedAt: updated.updatedAt,
        verified: updated.verified,
        relationVerified: updated.relationVerified,
        relationDetails: updated.relationDetails,
      } as CCTNote);
  });
  next.set(updated.key, updated);
  return next;
}
