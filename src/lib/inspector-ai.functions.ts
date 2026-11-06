import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

/** Researcher-only AI explanation of an inspected element or page. */
export const explainReadWrite = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ context: z.string().min(2).max(60_000), mode: z.enum(["full", "origin"]).optional(), noteKeys: z.array(z.string().max(2000)).max(2).optional(), noteId: z.string().regex(/^\d+$/).optional(), draft: z.object({ title: z.string().max(240), text: z.string().max(100_000) }).optional() }).parse(input))
  .handler(async ({ data }) => {
    const { verifyResearcher, explainInspection } = await import("./inspector-ai.server");
    try { await verifyResearcher(getRequestHeader("X-WP-Token") || ""); }
    catch (error) { return { error: error instanceof Error ? error.message : "Forbidden", status: 403 }; }
    // Always compare against the current CCT324 manual notes and their REL325 related notes, read fresh on the server.
    let notes: string;
    let noteIds: string[] = [];
    try {
      const { readCCTNoteForKey, readRelatedNotes, readNoteById } = await import("./inspector-notes.server");
      const found = await Promise.all((data.noteId ? ['current-selection'] : data.noteKeys || []).map(async (key) => {
        const note = data.noteId ? await readNoteById(data.noteId) : await readCCTNoteForKey(key);
        return { key, note, related: note ? await readRelatedNotes(note.id) : [] };
      }));
      noteIds = [...new Set(found.flatMap(({note, related}) => [...(note ? [note.id] : []), ...related.map(r => r.id)]))];
      notes = JSON.stringify(found.map(({ key, note, related }) => ({
        scope: key.startsWith("page|") ? "page" : "element", cct: note ? `CCT324 #${note.id}` : null, a55: data.draft?.title ?? note?.title ?? null, a56: data.draft?.text ?? note?.text ?? null, unsavedDraft: !!data.draft,
        relatedNotesREL325: [...new Map(related.map(r => [r.id, r])).values()].map((r) => ({ cct: `CCT324 #${r.id}`, a55: r.title, a56: r.text })),
      })));
    } catch (error) { return { error: `手动注释读取失败：${error instanceof Error ? error.message : String(error)}`, status: 502 }; }
    return explainInspection(`CCT324_MANUAL_NOTES (claims to verify, related notes read fresh; draft if indicated):\n${notes}\n\nEVIDENCE:\n${data.context}`, data.mode, undefined, noteIds, true);
  });

/** Researcher-only: does one manual note conflict with its REL325 related notes? Read fresh on the server. */
export const checkNoteConflicts = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().regex(/^\d+$/) }).parse(input))
  .handler(async ({ data }) => {
    const { verifyResearcher, compareNotes } = await import("./inspector-ai.server");
    try { await verifyResearcher(getRequestHeader("X-WP-Token") || ""); }
    catch (error) { return { error: error instanceof Error ? error.message : "Forbidden", status: 403 }; }
    let payload: string;
    try {
      const { readNoteById, readRelatedNotes } = await import("./inspector-notes.server");
      const [note, related] = await Promise.all([readNoteById(data.id), readRelatedNotes(data.id)]);
      payload = JSON.stringify({ note: { cct: `CCT324 #${data.id}`, a55: note.title, a56: note.text }, related: related.map((r) => ({ cct: `CCT324 #${r.id}`, a55: r.title, a56: r.text })) });
    } catch (error) { return { error: `注释读取失败：${error instanceof Error ? error.message : String(error)}`, status: 502 }; }
    return compareNotes(payload);
  });
