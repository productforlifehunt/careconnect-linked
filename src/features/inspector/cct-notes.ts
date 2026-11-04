import type { SourceAnnotation } from './source-notes';

/** Location bindings are inspector configuration, not WordPress business relations. */
export interface NoteBinding {
  key: string;
  id: string;
  scope: 'element' | 'page';
  page: string;
  label: string;
  locked?: boolean;
  source?: SourceAnnotation['source'];
}
export interface CCTNote extends SourceAnnotation {
  id: string;
  title: string;
  locked?: boolean;
}
export function bindCCTNotes(rows: CCTNote[], bindings: NoteBinding[]): CCTNote[] {
  const byId = new Map(rows.map(row => [row.id, row]));
  const byKey = new Map(bindings.map(binding => [binding.key, binding]));
  return [...rows, ...[...byKey.values()].map(binding => {
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
  next.forEach((note, key) => { if (note.id === updated.id) next.set(key, { ...note, text: updated.text, title: updated.title, updatedAt: updated.updatedAt }); });
  next.set(updated.key, updated);
  return next;
}