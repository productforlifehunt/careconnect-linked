import { bindingDocument } from './position-bindings';

export type Mark = { a: number; b: number; c: number };
export function readNoteMarks(raw?: string): Mark[] | undefined {
  return bindingDocument(raw)["inspectorMarks"] as Mark[] | undefined;
}
export function writeNoteMarks(raw: string | undefined, marks: Mark[]): string {
  return JSON.stringify({ ...bindingDocument(raw), inspectorMarks: marks });
}
export function legacyNoteMarks(id?: string): Mark[] {
  if (!id || typeof localStorage === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(`inspector-note-marks:${id}`) || '[]'); }
  catch { return []; }
}