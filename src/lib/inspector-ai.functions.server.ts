import { z } from "zod";

/** Researcher-only AI explanation of an inspected element or page. */
/** Researcher-only: does one manual note conflict with its REL325 related notes? Read fresh on the server. */
/** One bounded part of a site audit. Every call verifies WP identity and re-reads CCT324 + REL325. */
/** Researcher-only dialog about one suggestion. Related notes and code are re-read on the server; nothing is saved. */

export const explainReadWriteInput = z.object({ context: z.string().min(2), mode: z.enum(["full", "origin"]).optional(), scope: z.enum(['page', 'element']).optional(), noteKeys: z.array(z.string().max(2000)).max(3).optional(), noteId: z.string().regex(/^\d+$/).optional(), draft: z.object({ title: z.string().max(240), text: z.string() }).optional() });
export const analyzeSiteNoteInput = z.object({ page: z.string().max(500), noteId: z.string().regex(/^\d+$/), pageNoteIds: z.array(z.string().regex(/^\d+$/)).max(100).optional(), evidence: z.string().min(1), chunk: z.number().int().min(1), chunks: z.number().int().min(1), omissions: z.array(z.string().max(1000)).max(1000) }).refine(v => v.chunk <= v.chunks);

export async function explainReadWrite(rawData: unknown, request: Request) {
  const data = explainReadWriteInput.parse(rawData);

    const { verifyResearcher, explainInspection } = await import("./inspector-ai.server");
    try { await verifyResearcher(request.headers.get("X-WP-Token") || ""); }
    catch (error) { return { error: error instanceof Error ? error.message : "Forbidden", status: 403 }; }
    // Always compare against the current CCT324 manual notes and their REL325 related notes, read fresh on the server.
    let notes: string;
    let noteIds: string[] = [];
    const { attachCorrectionNotes, noteRole } = await import('@/features/inspector/corrections');
    const originals: import('@/features/inspector/conflict-report').ReportNote[] = [];
    try {
      const { readCCTNoteForKey, readRelatedNotes, readNoteById } = await import("./inspector-notes.server");
      const all = await Promise.all((data.noteId ? ['current-selection'] : data.noteKeys || []).map(async (key) => {
        const note = data.noteId ? await readNoteById(data.noteId) : await readCCTNoteForKey(key);
        return { key: data.noteId && data.scope === 'page' ? 'page|current-selection' : key, note, related: note ? await readRelatedNotes(note.id) : [] };
      }));
      // Element identity + its old line-based key describe one element: keep one entry (the bound one).
      const elements = all.filter((f) => !f.key.startsWith('page|'));
      const element = elements.find((f) => f.note) || elements[0];
      const found = all.filter((f) => f.key.startsWith('page|') || f === element);
      noteIds = [...new Set(found.flatMap(({note, related}) => [...(note ? [note.id] : []), ...related.map(r => r.id)]))];
      for (const { key, note, related } of found) {
        if (note) originals.push({ ...note, current: true, role: noteRole(note.title, key.startsWith('page|') ? 'page_note' : 'element_note') });
        originals.push(...related.map(n => ({ ...n, role: noteRole(n.title, 'related_note') })));
      }
      notes = JSON.stringify(found.map(({ key, note, related }) => ({
        scope: key.startsWith("page|") ? "page" : "element", role: note ? originals.find(n => n.id === note.id)?.role : null, cct: note ? `CCT324 #${note.id}` : null, a55: data.draft?.title ?? note?.title ?? null, a56: data.draft?.text ?? note?.text ?? null, unsavedDraft: !!data.draft,
        relatedNotesREL325: [...new Map(related.map(r => [r.id, r])).values()].map((r) => ({ cct: `CCT324 #${r.id}`, role: noteRole(r.title, 'related_note'), a55: r.title, a56: r.text })),
      })));
    } catch (error) { return { error: `手动注释读取失败：${error instanceof Error ? error.message : String(error)}`, status: 502 }; }
    let runtime: { page?: string | undefined };
    try { runtime = z.object({ page: z.string().min(1).optional() }).parse(JSON.parse(data.context)); }
    catch { return { error: '无法确定实际页面，三方核对未执行。', status: 422 }; }
    if (!runtime.page) return { error: '缺少页面位置，不能仅核对笔记。', status: 422 };
    const { readInspectionSource } = await import('./inspector-source.server');
    const { formatSourceEvidence } = await import('@/features/inspector/source-evidence');
    const source = await readInspectionSource({ page: runtime.page });
    if (!source.files.length) return { error: source.omissions.join('；'), status: 422 };
    const actualCode = formatSourceEvidence(source);
    const result = await explainInspection(`SERVER_READ_ACTUAL_SOURCE (deployment source, not a UI summary):\n${actualCode}\nSOURCE_OMISSIONS:\n${JSON.stringify(source.omissions)}\n\nCCT324_MANUAL_NOTES (claims to verify, related notes read fresh; draft if indicated):\n${notes}\n\nEVIDENCE:\n${data.context}`, data.mode, undefined, noteIds, true);
    if (result.report && source.omissions.length) {
      for (const omission of source.omissions) result.report.findings.push({ kind: 'missing_evidence', title: '实际代码证据缺失', noteIds: [], evidence: omission, verdict: '三方核对不完整，不能认定一致', fix: '补齐实际代码依赖后重新分析，不修改已核对笔记。' });
    }
    return result.report ? { ...result, report: attachCorrectionNotes(result.report, originals) } : result;
  
}

export async function checkNoteConflicts(rawData: unknown, request: Request) {
  const validate = ((input: unknown) => z.object({ id: z.string().regex(/^\d+$/) }).parse(input));
  const data = validate(rawData);

    const { verifyResearcher, compareNotes } = await import("./inspector-ai.server");
    try { await verifyResearcher(request.headers.get("X-WP-Token") || ""); }
    catch (error) { return { error: error instanceof Error ? error.message : "Forbidden", status: 403 }; }
    let payload: string;
    const { attachCorrectionNotes, noteRole } = await import('@/features/inspector/corrections');
    let originals: import('@/features/inspector/conflict-report').ReportNote[] = [];
    try {
      const { readNoteById, readRelatedNotes } = await import("./inspector-notes.server");
      const [note, related] = await Promise.all([readNoteById(data.id), readRelatedNotes(data.id)]);
      originals = [{ ...note, current: true, role: noteRole(note.title, 'element_note') }, ...related.map(r => ({ ...r, role: noteRole(r.title, 'related_note') }))];
      payload = JSON.stringify({ note: { cct: `CCT324 #${data.id}`, role: originals[0]?.role, a55: note.title, a56: note.text }, related: related.map((r) => ({ cct: `CCT324 #${r.id}`, role: noteRole(r.title, 'related_note'), a55: r.title, a56: r.text })) });
    } catch (error) { return { error: `注释读取失败：${error instanceof Error ? error.message : String(error)}`, status: 502 }; }
    const result = await compareNotes(payload);
    return result.report ? { ...result, report: attachCorrectionNotes(result.report, originals) } : result;
  
}

export async function analyzeSiteNote(rawData: unknown, request: Request) {
  const data = analyzeSiteNoteInput.parse(rawData);

    const { verifyResearcher, explainInspection } = await import('./inspector-ai.server');
    try { await verifyResearcher(request.headers.get("X-WP-Token") || ""); }
    catch (error) { return { error: error instanceof Error ? error.message : 'Forbidden', status: 403 }; }
    try {
      const { readNoteById, readRelatedNotes } = await import('./inspector-notes.server');
      const rootIds = [...new Set([data.noteId, ...(data.pageNoteIds || [])])];
      const { attachCorrectionNotes, noteRole } = await import('@/features/inspector/corrections');
      const collected: import('@/features/inspector/conflict-report').ReportNote[] = [];
      for (const id of rootIds) {
        const [note, related] = await Promise.all([readNoteById(id), readRelatedNotes(id)]);
        collected.push({ ...note, current: true, role: noteRole(note.title, data.pageNoteIds?.includes(id) ? 'page_note' : 'element_note') }, ...related.map(n => ({ ...n, role: noteRole(n.title, 'related_note') })));
      }
      const notes = attachCorrectionNotes({ summary: '正在准备', comparedNoteIds: [], comparedPairs: [], comparedCodeNoteIds: [], codeCompared: false, findings: [] }, collected).notes || [];
      const { WP, R, T } = await import('@/integrations/wp-schema');
      const evidenceText = data.evidence + '\n' + notes.map(n => n.text).join('\n');
      const cctIds = new Set([...evidenceText.matchAll(/CCT\s*([0-9]+)|cct\[["']([0-9]+)["']\]/gi)].map(m => m[1] || m[2]));
      const relIds = new Set([...evidenceText.matchAll(/REL\s*([0-9]+)|jet-rel\/([0-9]+)/gi)].map(m => m[1] || m[2]));
      const tables = T as unknown as Record<string, { id: number }>; const relations = R as unknown as Record<string, number>;
      for (const match of evidenceText.matchAll(/\bT\.([A-Za-z_]\w*)/g)) { const table = tables[match[1] || '']; if (table) cctIds.add(String(table.id)); }
      for (const match of evidenceText.matchAll(/\bR\.([A-Za-z_]\w*)/g)) { const relation = relations[match[1] || '']; if (relation) relIds.add(String(relation)); }
      const dictionary = { cct: Object.fromEntries(Object.entries(WP.cct).filter(([id]) => cctIds.has(id))), rel: Object.fromEntries(Object.entries(WP.rel).filter(([id]) => relIds.has(id))) };
      const context = JSON.stringify({ page: data.page, analysis: '全站分析中的一项；逐对比较当前元素、整页主注释和它们所有直接关联注释；注释的用途与当前代码不一致也要明确指出，不自动裁决需求', sourceChunk: data.chunk, sourceChunks: data.chunks, evidenceOmissions: data.omissions, notes, dictionary, source: data.evidence });
      const result = await explainInspection(context, 'full', undefined, notes.map(n => n.id), true);
      return result.report ? { ...result, report: attachCorrectionNotes(result.report, notes) } : result;
    } catch (error) { return { error: error instanceof Error ? error.message : '全站分析读取失败', status: 502 }; }
  
}

export async function chatAboutCorrection(rawData: unknown, request: Request) {
  const validate = ((input: unknown) => z.object({
    page: z.string().min(1).max(2000),
    target: z.enum(['page_note', 'element_note', 'functional_note', 'code']),
    noteId: z.string().regex(/^\d+$/).nullable(),
    basisNoteIds: z.array(z.string().regex(/^\d+$/)).max(50),
    reason: z.string(), draftTitle: z.string(), draftText: z.string(),
    messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1) })).min(1).max(60),
  }).parse(input));
  const data = validate(rawData);

    const { verifyResearcher, chatCorrection } = await import('./inspector-ai.server');
    try { await verifyResearcher(request.headers.get("X-WP-Token") || ""); }
    catch (error) { return { error: error instanceof Error ? error.message : 'Forbidden' }; }
    try {
      const { readNoteById, readRelatedNotes } = await import('./inspector-notes.server');
      const current = data.noteId ? await readNoteById(data.noteId) : null;
      const related = data.noteId ? await readRelatedNotes(data.noteId) : [];
      const basis = await Promise.all(data.basisNoteIds.filter(id => !related.some(r => r.id === id)).map(id => readNoteById(id).catch(() => null)));
      const baseline = [...related, ...basis.filter((n): n is NonNullable<typeof n> => !!n)];
      const { readInspectionSource } = await import('./inspector-source.server');
      const { formatSourceEvidence } = await import('@/features/inspector/source-evidence');
      const source = await readInspectionSource({ page: data.page });
      const context = `SERVER_READ_ACTUAL_SOURCE:\n${source.files.length ? formatSourceEvidence(source) : '（未读取到实际代码）'}\nSOURCE_OMISSIONS:${JSON.stringify(source.omissions)}\n\nBASELINE_RELATED_NOTES（视为正确）:\n${JSON.stringify(baseline.map(n => ({ cct: `CCT324 #${n.id}`, a55: n.title, a56: n.text })))}\n\nCURRENT_NOTE（被修改对象）:\n${JSON.stringify(current ? { cct: `CCT324 #${current.id}`, a55: current.title, a56: current.text } : null)}\n\nSUGGESTION（target=${data.target}）原因：${data.reason}\n当前编辑框名字：${data.draftTitle}\n当前编辑框正文：\n${data.draftText}`;
      return await chatCorrection(context, data.messages);
    } catch (error) { return { error: error instanceof Error ? error.message : '读取失败' }; }
  
}
