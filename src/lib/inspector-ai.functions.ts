import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

/** Researcher-only AI explanation of an inspected element or page. */
export const explainReadWrite = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ context: z.string().min(2).max(60_000), mode: z.enum(["full", "origin"]).optional(), noteKeys: z.array(z.string().max(2000)).max(2).optional() }).parse(input))
  .handler(async ({ data }) => {
    const { verifyResearcher, explainInspection } = await import("./inspector-ai.server");
    try { await verifyResearcher(getRequestHeader("X-WP-Token") || ""); }
    catch (error) { return { error: error instanceof Error ? error.message : "Forbidden", status: 403 }; }
    // Always compare against the current CCT324 manual notes and their REL325 related notes, read fresh on the server.
    let notes: string;
    try {
      const { readCCTNoteForKey, readRelatedNotes } = await import("./inspector-notes.server");
      const found = await Promise.all((data.noteKeys || []).map(async (key) => {
        const note = await readCCTNoteForKey(key);
        return { key, note, related: note ? await readRelatedNotes(note.id) : [] };
      }));
      notes = JSON.stringify(found.map(({ key, note, related }) => ({
        scope: key.startsWith("page|") ? "page" : "element", cct: note ? `CCT324 #${note.id}` : null, a55: note?.title ?? null, a56: note?.text ?? null,
        relatedNotesREL325: related.map((r) => ({ cct: `CCT324 #${r.id}`, side: r.side === "parent" ? "REL325 父" : "REL325 子", a55: r.title, a56: r.text })),
      })));
    } catch (error) { return { error: `手动注释读取失败：${error instanceof Error ? error.message : String(error)}`, status: 502 }; }
    return explainInspection(`CCT324_MANUAL_NOTES (authoritative, fresh from CCT324 Manual Notes, each with its REL325 related notes):\n${notes}\n\nEVIDENCE:\n${data.context}`, data.mode);
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
      const { noteTitle, readRelatedNotes } = await import("./inspector-notes.server");
      const { readCCTNoteForKey } = await import("./inspector-notes.server");
      void readCCTNoteForKey;
      const related = await readRelatedNotes(data.id);
      if (!related.length) return { error: "这条注释还没有关联注释，无法比较。", status: 422 };
      const title = await noteTitle(data.id);
      const { fetchNoteText } = await import("./inspector-notes.server");
      payload = JSON.stringify({ note: { cct: `CCT324 #${data.id}`, a55: title, a56: await fetchNoteText(data.id) }, related: related.map((r) => ({ cct: `CCT324 #${r.id}`, side: r.side === "parent" ? "REL325 父" : "REL325 子", a55: r.title, a56: r.text })) });
    } catch (error) { return { error: `注释读取失败：${error instanceof Error ? error.message : String(error)}`, status: 502 }; }
    return compareNotes(payload);
  });
