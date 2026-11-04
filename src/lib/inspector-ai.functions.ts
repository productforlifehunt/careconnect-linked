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
    // Always compare against the current CCT324 manual notes, read fresh on the server.
    let notes: string;
    try {
      const { readCCTNoteForKey } = await import("./inspector-notes.server");
      const found = await Promise.all((data.noteKeys || []).map(async (key) => ({ key, note: await readCCTNoteForKey(key) })));
      notes = JSON.stringify(found.map(({ key, note }) => ({ scope: key.startsWith("page|") ? "page" : "element", cct: note ? `CCT324 #${note.id}` : null, a55: note?.title ?? null, a56: note?.text ?? null })));
    } catch (error) { return { error: `手动注释读取失败：${error instanceof Error ? error.message : String(error)}`, status: 502 }; }
    return explainInspection(`CCT324_MANUAL_NOTES (authoritative, fresh from CCT324 Manual Notes):\n${notes}\n\nEVIDENCE:\n${data.context}`, data.mode);
  });
