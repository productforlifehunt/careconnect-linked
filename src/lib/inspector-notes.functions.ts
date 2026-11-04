import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

/** Researcher-only: read manual notes for an element and its page. */
export const loadInspectorNotes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ keys: z.array(z.string().min(1).max(600)).min(1).max(5) }).parse(input))
  .handler(async ({ data }) => {
    const { verifyResearcher } = await import("./inspector-ai.server");
    try { await verifyResearcher(getRequestHeader("X-WP-Token") || ""); } catch (e) { return { error: e instanceof Error ? e.message : "Forbidden", notes: [] }; }
    const { readNotes } = await import("./inspector-notes.server");
    try { return { notes: await readNotes(data.keys) }; } catch (e) { return { error: e instanceof Error ? e.message : "读取失败", notes: [] }; }
  });

/** Researcher-only: read every saved note in one call (the inspector caches them in the browser). */
export const loadAllInspectorNotes = createServerFn({ method: "POST" })
  .handler(async () => {
    const { verifyResearcher } = await import("./inspector-ai.server");
    try { await verifyResearcher(getRequestHeader("X-WP-Token") || ""); } catch (e) { return { error: e instanceof Error ? e.message : "Forbidden", notes: [] }; }
    const { readAllNotes } = await import("./inspector-notes.server");
    try { return { notes: await readAllNotes() }; } catch (e) { return { error: e instanceof Error ? e.message : "读取失败", notes: [] }; }
  });

/** Researcher-only: save (overwrite) the manual note for one element or page. */
export const saveInspectorNote = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ key: z.string().min(1).max(600), scope: z.enum(["element", "page"]), page: z.string().max(400), label: z.string().max(400), text: z.string().max(20_000) }).parse(input))
  .handler(async ({ data }) => {
    const { verifyResearcher } = await import("./inspector-ai.server");
    try { await verifyResearcher(getRequestHeader("X-WP-Token") || ""); } catch (e) { return { error: e instanceof Error ? e.message : "Forbidden" }; }
    const { writeNote } = await import("./inspector-notes.server");
    try { return { note: await writeNote(data) }; } catch (e) { return { error: e instanceof Error ? e.message : "保存失败" }; }
  });
