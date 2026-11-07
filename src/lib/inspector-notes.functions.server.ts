import { z } from "zod";

/** Researcher-only: read manual notes for an element and its page. */
/** Researcher-only: read every saved note in one call (the inspector caches them in the browser). */
/** Researcher-only: save (overwrite) the manual note for one element or page. */
const noteId = z.string().regex(/^\d+$/);
/** Explicit user submission to one existing record; never creates bindings or relations. */
function wpToken(request: Request): string | undefined {
  return request.headers.get("X-WP-Token") || undefined;
}
async function researcherOnly(request: Request): Promise<string | undefined> {
  const { verifyResearcher } = await import('./inspector-ai.server');
  try { await verifyResearcher(wpToken(request) || ""); return undefined; } catch (e) { return e instanceof Error ? e.message : 'Forbidden'; }
}

/** Researcher-only: notes linked to one CCT324 note through REL325. */
/** Researcher-only: link an existing note (or a newly created one) to the current note through REL325. */
/** Researcher-only: edit a related note (name, content, manual-check flag) and return the refreshed REL325 list. */

export async function loadInspectorNotes(rawData: unknown, request: Request) {
  const data = z.object({
    keys: z.array(z.string().min(1).max(600)).min(1).max(5),
    fingerprint: z.string().max(600).optional(),
    tag: z.string().max(60).optional(),
    page: z.string().max(400).optional(),
    priorKey: z.string().min(1).max(600).optional(),
    priorLabel: z.string().max(400).optional(),
    legacy: z.union([
      z.object({ key: z.string().min(1).max(600), label: z.string().max(400) }),
      z.array(z.object({ key: z.string().min(1).max(600), label: z.string().max(400) })).min(1).max(8),
    ]).optional(),
    alias: z.string().max(600).optional(),
  }).parse(rawData);
  const token = wpToken(request);
  const { verifyResearcher } = await import("./inspector-ai.server");
  try {
    await verifyResearcher(token || "");
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Forbidden", notes: [] };
  }

  const notesService = await import("./inspector-notes.server");
  const { readNoteForKey, readNoteForFingerprint, rebindRecoveredNote } = notesService;
  try {
    const notes = (await Promise.all(data.keys.map((key) => readNoteForKey(key, token)))).filter((note) => !!note);
    const { matchingLegacyLabel } = await import("@/features/inspector/legacy-match");
    let warning: string | undefined;
    const migrationCandidates: Array<{ key: string; id: string; title: string; label: string; reason: string }> = [];
    const seen = new Set<string>();
    const listCandidate = (note: Awaited<ReturnType<typeof readNoteForKey>>, key: string, label: string, reason: string) => {
      if (!note?.id) return;
      const signature = `${note.id}|${key}`;
      if (seen.has(signature)) return;
      seen.add(signature);
      migrationCandidates.push({ key, id: note.id, title: note.title || "（无标题）", label, reason });
    };
    const rebind = async (note: NonNullable<Awaited<ReturnType<typeof readNoteForKey>>>, label: string) => {
      const recovered = { ...note, key: data.keys[0]! };
      try {
        return await rebindRecoveredNote(recovered, data.keys[0]!, "element", data.page || "", label, data.alias, token);
      } catch (error) {
        warning = `已读回 CCT324 #${note.id}，但 a59 关联没有写入：${error instanceof Error ? error.message : String(error)}`;
        return recovered;
      }
    };

    if (!notes.length && data.priorKey && data.page) {
      const previous = await readNoteForKey(data.priorKey, token);
      if (previous?.scope === "element" && data.priorLabel && matchingLegacyLabel(previous.label, data.priorLabel)) {
        notes.push(await rebind(previous, data.priorLabel));
      } else if (previous) {
        listCandidate(previous, data.priorKey, data.priorLabel || "", "旧可见位置存在笔记，但标签未能核对一致");
      }
    }
    if (!notes.length && data.legacy) {
      const entries = Array.isArray(data.legacy) ? data.legacy : [data.legacy];
      const candidateMap = new Map<string, { key: string; label: string; strong: boolean }>();
      for (const entry of entries) {
        candidateMap.set(entry.key, { key: entry.key, label: entry.label, strong: true });
        const parts = entry.key.split("|");
        if (parts[0] === "el" && parts.length > 3) {
          const fallbackKey = parts.slice(0, -1).join("|");
          if (!candidateMap.has(fallbackKey)) candidateMap.set(fallbackKey, { key: fallbackKey, label: entry.label, strong: false });
        }
      }
      const candidates = [...candidateMap.values()];
      const oldRows = (await Promise.all(candidates.map((candidate) => readNoteForKey(candidate.key, token))))
        .flatMap((note, index) => note ? [{ note, candidate: candidates[index]! }] : []);
      const matches = oldRows.filter(({ note, candidate }) => matchingLegacyLabel(note.label, candidate.label));
      const strongMatches = matches.filter(({ candidate }) => candidate.strong);
      const preferredMatches = strongMatches.length ? strongMatches : matches;
      const matchIds = new Set(preferredMatches.map(({ note }) => note.id));
      if (matchIds.size === 1) {
        const match = preferredMatches[0]!;
        notes.push(await rebind(match.note, match.candidate.label));
      } else if (matchIds.size > 1) {
        warning = `发现多个旧元素绑定符合当前标签（${[...matchIds].map((id) => `CCT324 #${id}`).join("、")}），未自动绑定。请在“选择其他注释”中明确选择。`;
        for (const { note, candidate } of preferredMatches) listCandidate(note, candidate.key, candidate.label, "多个旧位置同时符合，未自动猜绑");
      } else if (oldRows.length) {
        warning = "发现旧元素绑定，但没有一个能与当前可见标签唯一核对一致，未自动绑定。";
        for (const { note, candidate } of preferredMatches.length ? preferredMatches : oldRows) listCandidate(note, candidate.key, candidate.label, "旧绑定标签未核对一致");
      }
    }
    if (!notes.length && data.fingerprint && data.tag && data.page) {
      const currentLabel = Array.isArray(data.legacy) ? data.legacy[0]?.label : data.legacy?.label;
      const recovered = await readNoteForFingerprint(data.keys[0]!, data.fingerprint, data.tag, data.page, currentLabel, token);
      if (recovered) notes.push(await rebind(recovered, recovered.label || ""));
    }
    return { notes, ...(warning ? { warning } : {}), ...(migrationCandidates.length ? { migrationCandidates } : {}) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "读取失败", notes: [] };
  }
}

export async function loadAllInspectorNotes(rawData: unknown, request: Request) {
  const data = rawData as Record<string, any> | undefined;
  const token = wpToken(request);

    const { verifyResearcher } = await import("./inspector-ai.server");
    try { await verifyResearcher(token || ""); } catch (e) { return { error: e instanceof Error ? e.message : "Forbidden", notes: [] }; }
    const { readAllNotes } = await import("./inspector-notes.server");
    const { encodeNotes } = await import('@/features/inspector/notes-transport');
    try { return { compressedNotes: await encodeNotes(await readAllNotes(token)) }; } catch (e) { return { error: e instanceof Error ? e.message : "读取失败", notes: [] }; }
  
}

export async function searchInspectorNotes(rawData: unknown, request: Request) {
  const data = z.object({ q: z.string().max(200), status: z.enum(["all", "verified", "unverified"]) }).parse(rawData);
  const token = wpToken(request);
  const { verifyResearcher } = await import("./inspector-ai.server");
  try {
    await verifyResearcher(token || "");
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Forbidden", notes: [] };
  }
  try {
    const { searchNotes } = await import("./inspector-notes.server");
    return { notes: await searchNotes(data.q, data.status, token) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "搜索失败", notes: [] };
  }
}

export async function saveInspectorNote(rawData: unknown, request: Request) {
  const validate = ((input: unknown) => z.object({ key: z.string().min(1).max(600), scope: z.enum(["element", "page"]), page: z.string().max(400), label: z.string().max(400), title: z.string().min(1).max(240), id: z.string().regex(/^\d+$/).optional(), create: z.boolean().optional(), verified: z.boolean().optional(), text: z.string().max(100_000), source: z.object({ file: z.string().min(1).max(300), line: z.number().int().positive(), endLine: z.number().int().positive(), tag: z.string().min(1).max(60), digest: z.string().regex(/^[0-9a-f]{64}$/) }).optional(), alias: z.string().max(600).optional() }).parse(input));
  const data = validate(rawData);

    const { verifyResearcher } = await import("./inspector-ai.server");
    const token = wpToken(request);
    try { await verifyResearcher(token || ""); } catch (e) { return { error: e instanceof Error ? e.message : "Forbidden" }; }
    const { writeNote } = await import("./inspector-notes.server");
    try { return { note: await writeNote(data, token) }; } catch (e) { return { error: e instanceof Error ? e.message : "保存失败" }; }
  
}

export async function selectInspectorNote(rawData: unknown, request: Request) {
  const validate = ((input: unknown) => z.object({ key: z.string().min(1).max(600), id: z.string().regex(/^\d+$/), scope: z.enum(['element', 'page']), page: z.string().max(400), label: z.string().max(400) , source: z.object({ file: z.string().min(1).max(300), line: z.number().int().positive(), endLine: z.number().int().positive(), tag: z.string().min(1).max(60), digest: z.string().regex(/^[0-9a-f]{64}$/) }).optional(), alias: z.string().max(600).optional() }).parse(input));
  const data = validate(rawData);

    const { verifyResearcher } = await import('./inspector-ai.server');
    const token = wpToken(request);
    try { await verifyResearcher(token || ""); } catch (e) { return { error: e instanceof Error ? e.message : 'Forbidden' }; }
    const { selectNote } = await import('./inspector-notes.server');
    try { return { note: await selectNote(data, token) }; } catch (e) { return { error: e instanceof Error ? e.message : '保存失败' }; }
  
}

export async function submitNoteCorrection(rawData: unknown, request: Request) {
  const validate = ((input: unknown) => z.object({ id: noteId, title: z.string().trim().min(1).max(240), text: z.string().min(1).max(100_000), expected: z.object({ title: z.string(), text: z.string(), verified: z.boolean() }), confirmVerified: z.boolean() }).parse(input));
  const data = validate(rawData);

    const denied = await researcherOnly(request); if (denied) return { error: denied };
    const token = wpToken(request);
    try {
      const s = await import('./inspector-notes.server');
      const { assertUnchangedNote } = await import('@/features/inspector/corrections');
      const current = await s.readNoteById(data.id, token);
      assertUnchangedNote(current, data.expected);
      if (current.verified && !data.confirmVerified) throw new Error('这条笔记已手动核对，请先明确确认修改。');
      await s.updatePlainNote(data.id, data.title, data.text, current.verified, token);
      return { note: await s.readNoteById(data.id, token) };
    } catch (e) { return { error: e instanceof Error ? e.message : '提交失败，未确认保存。' }; }
  
}

export async function listRelatedNotes(rawData: unknown, request: Request) {
  const validate = ((input: unknown) => z.object({ id: noteId }).parse(input));
  const data = validate(rawData);

    const denied = await researcherOnly(request); if (denied) return { error: denied, notes: [] };
    const token = wpToken(request);
    const { readRelatedNotes } = await import('./inspector-notes.server');
    try { return { notes: await readRelatedNotes(data.id, token) }; } catch (e) { return { error: e instanceof Error ? e.message : '读取失败', notes: [] }; }
  
}

export async function linkRelatedNote(rawData: unknown, request: Request) {
  const validate = ((input: unknown) => z.object({ id: noteId, otherId: noteId.optional(), create: z.object({ title: z.string().min(1).max(240), text: z.string().max(100_000) }).optional() }).refine(v => !!v.otherId !== !!v.create).parse(input));
  const data = validate(rawData);

    const denied = await researcherOnly(request); if (denied) return { error: denied };
    const token = wpToken(request);
    const s = await import('./inspector-notes.server');
    try {
      const currentTitle = await s.noteTitle(data.id, token);
      const otherId = data.otherId || await s.createPlainNote(data.create!.title, data.create!.text, token);
      const otherTitle = data.otherId ? await s.noteTitle(otherId, token) : data.create!.title;
      const { parent, child } = s.relationDirection({ id: data.id, title: currentTitle }, { id: otherId, title: otherTitle });
      try { await s.linkNotes(parent, child, token); }
      catch (e) { if (data.create) throw new Error(`新注释 #${otherId} 已保存，但关联失败：${e instanceof Error ? e.message : String(e)}`); throw e; }
      return { notes: await s.readRelatedNotes(data.id, token) };
    } catch (e) { return { error: e instanceof Error ? e.message : '关联失败' }; }
  
}

export async function unlinkRelatedNote(rawData: unknown, request: Request) {
  const validate = ((input: unknown) => z.object({ id: noteId, parent: noteId, child: noteId }).refine(v => v.id === v.parent || v.id === v.child).parse(input));
  const data = validate(rawData);

    const denied = await researcherOnly(request); if (denied) return { error: denied };
    const token = wpToken(request);
    const s = await import('./inspector-notes.server');
    try { await s.unlinkNotes(data.parent, data.child, token); return { notes: await s.readRelatedNotes(data.id, token) }; } catch (e) { return { error: e instanceof Error ? e.message : '取消关联失败' }; }
  
}

export async function updateRelatedNote(rawData: unknown, request: Request) {
  const validate = ((input: unknown) => z.object({ id: noteId, otherId: noteId, title: z.string().min(1).max(240), text: z.string().max(100_000), verified: z.boolean() }).parse(input));
  const data = validate(rawData);

    const denied = await researcherOnly(request); if (denied) return { error: denied };
    const token = wpToken(request);
    const s = await import('./inspector-notes.server');
    try { await s.updatePlainNote(data.otherId, data.title, data.text, data.verified, token); return { notes: await s.readRelatedNotes(data.id, token) }; } catch (e) { return { error: e instanceof Error ? e.message : '保存失败' }; }
  
}
