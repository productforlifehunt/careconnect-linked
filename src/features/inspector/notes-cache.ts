import type { SourceAnnotation } from "./source-notes";
export type CachedInspectorNote = SourceAnnotation;
type Result = { notes: CachedInspectorNote[]; error?: string };

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
      pending = fetchNotes().then((result) => {
        if (result.error) throw new Error(result.error);
        if (version !== generation) throw new Error("登录状态已变化，请重新打开注释。");
        // Preserve saves that finished while this read was in flight.
        const merged = new Map(result.notes.map((note) => [note.key, note]));
        values?.forEach((note, key) => merged.set(key, note));
        values = merged;
        return merged;
      }).finally(() => { if (version === generation) pending = null; });
      return pending;
    },
    put(session: string, note: CachedInspectorNote) {
      if (session !== owner) return;
      if (!values) values = new Map();
      values.set(note.key, note);
    },
  };
}

export const inspectorNotesCache = createNotesCache();