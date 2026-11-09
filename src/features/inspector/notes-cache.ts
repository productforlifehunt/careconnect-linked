import type { SourceAnnotation } from "./source-notes";
import { decodeNotes } from './notes-transport';
export type CachedInspectorNote = SourceAnnotation;
type Result = { notes?: CachedInspectorNote[]; compressedNotes?: string; error?: string };

/** Private, memory-only cache. A session change invalidates both data and in-flight reads. */
export function createNotesCache() {
  let owner = "";
  let values: Map<string, CachedInspectorNote> | null = null;
  let pending: Promise<Map<string, CachedInspectorNote>> | null = null;
  let generation = 0;
  const select = (session: string) => {
    if (owner === session) return;
    owner = session; values = null; pending = null; generation++;
  };
  return {
    reset() { owner = ""; values = null; pending = null; generation++; },
    peek(session: string) { select(session); return values; },
    async load(session: string, fetchNotes: () => Promise<Result>) {
      select(session);
      if (values) return values;
      if (pending) return pending;
      const version = generation;
      pending = fetchNotes().then(async (result) => {
        if (result.error) throw new Error(result.error);
        const notes = result.compressedNotes ? await decodeNotes(result.compressedNotes) : result.notes;
        if (!notes) throw new Error('注释返回格式异常，请重试。');
        if (version !== generation) throw new Error("登录状态已变化，请重新打开注释。");
        // Preserve saves that finished while this read was in flight.
        const merged = new Map(notes.map((note) => [note.key, note]));
        values?.forEach((note, key) => merged.set(key, note));
        values = merged;
        return merged;
      }).finally(() => { if (version === generation) pending = null; });
      return pending;
    },
    put(session: string, note: CachedInspectorNote) {
      if (session !== owner) return;
      if (!values) values = new Map();
      if (note.id) values.forEach((existing, key) => {
        if (existing.id === note.id)
          values?.set(key, {
            ...existing,
            text: note.text,
            title: note.title,
            version: note.version,
            noteType: note.noteType,
            tabOrder: note.tabOrder,
            updatedAt: note.updatedAt,
            verified: note.verified,
            relationVerified: note.relationVerified,
            relationDetails: note.relationDetails,
          });
      });
      values.set(note.key, note);
      if (note.id) values.set(`cct|${note.id}`, { ...note, key: `cct|${note.id}`, source: undefined, locked: undefined });
    },
    removePosition(session: string, id: string, keys: string[]) {
      if (session !== owner || !values) return;
      for (const key of keys) {
        if (values.get(key)?.id === id) values.delete(key);
      }
    },
    removeNote(session: string, id: string) {
      if (session !== owner || !values) return;
      for (const [key, note] of values) {
        if (note.id === id) values.delete(key);
      }
    },
  };
}

export const inspectorNotesCache = createNotesCache();
