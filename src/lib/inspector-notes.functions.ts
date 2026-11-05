import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

/** Researcher-only: read manual notes for an element and its page. */
export const loadInspectorNotes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ keys: z.array(z.string().min(1).max(600)).min(1).max(5) }).parse(input))
  .handler(async ({ data }) => {
    const { verifyResearcher } = await import("./inspector-ai.server");
    try { await verifyResearcher(getRequestHeader("X-WP-Token") || ""); } catch (e) { return { error: e instanceof Error ? e.message : "Forbidden", notes: [] }; }
    const { readAllNotes } = await import("./inspector-notes.server");
    try { return { notes: (await readAllNotes()).filter(note => data.keys.includes(note.key)) }; } catch (e) { return { error: e instanceof Error ? e.message : "读取失败", notes: [] }; }
  });

/** Researcher-only: read every saved note in one call (the inspector caches them in the browser). */
export const loadAllInspectorNotes = createServerFn({ method: "POST" })
  .handler(async () => {
    const { verifyResearcher } = await import("./inspector-ai.server");
    try { await verifyResearcher(getRequestHeader("X-WP-Token") || ""); } catch (e) { return { error: e instanceof Error ? e.message : "Forbidden", notes: [] }; }
    const { readAllNotes } = await import("./inspector-notes.server");
    const { encodeNotes } = await import('@/features/inspector/notes-transport');
    try { return { compressedNotes: await encodeNotes(await readAllNotes()) }; } catch (e) { return { error: e instanceof Error ? e.message : "读取失败", notes: [] }; }
  });

/** Researcher-only: save (overwrite) the manual note for one element or page. */
export const saveInspectorNote = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ key: z.string().min(1).max(600), scope: z.enum(["element", "page"]), page: z.string().max(400), label: z.string().max(400), title: z.string().min(1).max(240), id: z.string().regex(/^\d+$/).optional(), create: z.boolean().optional(), verified: z.boolean().optional(), text: z.string().max(100_000), source: z.object({ file: z.string().min(1).max(300), line: z.number().int().positive(), endLine: z.number().int().positive(), tag: z.string().min(1).max(60), digest: z.string().regex(/^[0-9a-f]{64}$/) }).optional() }).parse(input))
  .handler(async ({ data }) => {
    const { verifyResearcher } = await import("./inspector-ai.server");
    try { await verifyResearcher(getRequestHeader("X-WP-Token") || ""); } catch (e) { return { error: e instanceof Error ? e.message : "Forbidden" }; }
    const { writeNote } = await import("./inspector-notes.server");
    try { return { note: await writeNote(data) }; } catch (e) { return { error: e instanceof Error ? e.message : "保存失败" }; }
  });

export const selectInspectorNote = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => z.object({ key: z.string().min(1).max(600), id: z.string().regex(/^\d+$/), scope: z.enum(['element', 'page']), page: z.string().max(400), label: z.string().max(400) }).parse(input))
  .handler(async ({ data }) => {
    const { verifyResearcher } = await import('./inspector-ai.server');
    try { await verifyResearcher(getRequestHeader('X-WP-Token') || ''); } catch (e) { return { error: e instanceof Error ? e.message : 'Forbidden' }; }
    const { selectNote } = await import('./inspector-notes.server');
    try { return { note: await selectNote(data) }; } catch (e) { return { error: e instanceof Error ? e.message : '保存失败' }; }
  });

const noteId = z.string().regex(/^\d+$/);
async function researcherOnly(): Promise<string | undefined> {
  const { verifyResearcher } = await import('./inspector-ai.server');
  try { await verifyResearcher(getRequestHeader('X-WP-Token') || ''); return undefined; } catch (e) { return e instanceof Error ? e.message : 'Forbidden'; }
}

/** Researcher-only: notes linked to one CCT324 note through REL325. */
export const listRelatedNotes = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => z.object({ id: noteId }).parse(input))
  .handler(async ({ data }) => {
    const denied = await researcherOnly(); if (denied) return { error: denied, notes: [] };
    const { readRelatedNotes } = await import('./inspector-notes.server');
    try { return { notes: await readRelatedNotes(data.id) }; } catch (e) { return { error: e instanceof Error ? e.message : '读取失败', notes: [] }; }
  });

/** Researcher-only: link an existing note (or a newly created one) to the current note through REL325. */
export const linkRelatedNote = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => z.object({ id: noteId, otherId: noteId.optional(), create: z.object({ title: z.string().min(1).max(240), text: z.string().max(100_000) }).optional() }).refine(v => !!v.otherId !== !!v.create).parse(input))
  .handler(async ({ data }) => {
    const denied = await researcherOnly(); if (denied) return { error: denied };
    const s = await import('./inspector-notes.server');
    try {
      const currentTitle = await s.noteTitle(data.id);
      const otherId = data.otherId || await s.createPlainNote(data.create!.title, data.create!.text);
      const otherTitle = data.otherId ? await s.noteTitle(otherId) : data.create!.title;
      const { parent, child } = s.relationDirection({ id: data.id, title: currentTitle }, { id: otherId, title: otherTitle });
      try { await s.linkNotes(parent, child); }
      catch (e) { if (data.create) throw new Error(`新注释 #${otherId} 已保存，但关联失败：${e instanceof Error ? e.message : String(e)}`); throw e; }
      return { notes: await s.readRelatedNotes(data.id) };
    } catch (e) { return { error: e instanceof Error ? e.message : '关联失败' }; }
  });

export const unlinkRelatedNote = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => z.object({ id: noteId, parent: noteId, child: noteId }).refine(v => v.id === v.parent || v.id === v.child).parse(input))
  .handler(async ({ data }) => {
    const denied = await researcherOnly(); if (denied) return { error: denied };
    const s = await import('./inspector-notes.server');
    try { await s.unlinkNotes(data.parent, data.child); return { notes: await s.readRelatedNotes(data.id) }; } catch (e) { return { error: e instanceof Error ? e.message : '取消关联失败' }; }
  });

/** Researcher-only: edit a related note (name, content, manual-check flag) and return the refreshed REL325 list. */
export const updateRelatedNote = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => z.object({ id: noteId, otherId: noteId, title: z.string().min(1).max(240), text: z.string().max(100_000), verified: z.boolean() }).parse(input))
  .handler(async ({ data }) => {
    const denied = await researcherOnly(); if (denied) return { error: denied };
    const s = await import('./inspector-notes.server');
    try { await s.updatePlainNote(data.otherId, data.title, data.text, data.verified); return { notes: await s.readRelatedNotes(data.id) }; } catch (e) { return { error: e instanceof Error ? e.message : '保存失败' }; }
  });
