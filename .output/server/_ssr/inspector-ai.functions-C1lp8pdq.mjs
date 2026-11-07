import "../_runtime.mjs";
import { l as createServerFn } from "./createServerFn-Be1RckzI.mjs";
import { a as objectType, i as numberType, o as stringType, r as enumType, t as arrayType } from "../_libs/zod.mjs";
import { t as getRequestHeader } from "./request-response-CaQSkNBu.mjs";
import { t as createServerRpc } from "./createServerRpc-Cn_WX1Po.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/inspector-ai.functions-C1lp8pdq.js
/** Researcher-only AI explanation of an inspected element or page. */
var explainReadWrite_createServerFn_handler = createServerRpc({
	id: "1e7513ea11ab0f03772e681b4f51a6657b641e09ec7fbf3ebbcf9bab04236011",
	name: "explainReadWrite",
	filename: "src/lib/inspector-ai.functions.ts"
}, (opts) => explainReadWrite.__executeServer(opts));
var explainReadWrite = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	context: stringType().min(2),
	mode: enumType(["full", "origin"]).optional(),
	scope: enumType(["page", "element"]).optional(),
	noteKeys: arrayType(stringType().max(2e3)).max(3).optional(),
	noteId: stringType().regex(/^\d+$/).optional(),
	draft: objectType({
		title: stringType().max(240),
		text: stringType()
	}).optional()
}).parse(input)).handler(explainReadWrite_createServerFn_handler, async ({ data }) => {
	const { verifyResearcher, explainInspection } = await import("./inspector-ai.server-6flM55mk.mjs");
	try {
		await verifyResearcher(getRequestHeader("X-WP-Token") || "");
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : "Forbidden",
			status: 403
		};
	}
	let notes;
	let noteIds = [];
	const token = getRequestHeader("X-WP-Token") || "";
	const { attachCorrectionNotes, noteRole } = await import("./corrections-8s7iIkbf.mjs");
	const originals = [];
	try {
		const { readCCTNoteForKey, readRelatedNotes, readNoteById } = await import("./inspector-notes.server-BwCAiGYE.mjs");
		const all = await Promise.all((data.noteId ? ["current-selection"] : data.noteKeys || []).map(async (key) => {
			const note = data.noteId ? await readNoteById(data.noteId) : await readCCTNoteForKey(key);
			return {
				key: data.noteId && data.scope === "page" ? "page|current-selection" : key,
				note,
				related: note ? await readRelatedNotes(note.id, token) : []
			};
		}));
		const elements = all.filter((f) => !f.key.startsWith("page|"));
		const element = elements.find((f) => f.note) || elements[0];
		const found = all.filter((f) => f.key.startsWith("page|") || f === element);
		noteIds = [...new Set(found.flatMap(({ note, related }) => [...note ? [note.id] : [], ...related.map((r) => r.id)]))];
		for (const { key, note, related } of found) {
			if (note) originals.push({
				...note,
				current: true,
				role: noteRole(note.title, key.startsWith("page|") ? "page_note" : "element_note")
			});
			originals.push(...related.map((n) => ({
				...n,
				role: noteRole(n.title, "related_note")
			})));
		}
		notes = JSON.stringify(found.map(({ key, note, related }) => ({
			scope: key.startsWith("page|") ? "page" : "element",
			role: note ? originals.find((n) => n.id === note.id)?.role : null,
			cct: note ? `CCT324 #${note.id}` : null,
			a55: data.draft?.title ?? note?.title ?? null,
			a56: data.draft?.text ?? note?.text ?? null,
			unsavedDraft: !!data.draft,
			relatedNotesREL325: [...new Map(related.map((r) => [r.id, r])).values()].map((r) => ({
				cct: `CCT324 #${r.id}`,
				role: noteRole(r.title, "related_note"),
				a55: r.title,
				a56: r.text
			}))
		})));
	} catch (error) {
		return {
			error: `手动注释读取失败：${error instanceof Error ? error.message : String(error)}`,
			status: 502
		};
	}
	let runtime;
	try {
		runtime = objectType({ page: stringType().min(1).optional() }).parse(JSON.parse(data.context));
	} catch {
		return {
			error: "无法确定实际页面，三方核对未执行。",
			status: 422
		};
	}
	if (!runtime.page) return {
		error: "缺少页面位置，不能仅核对笔记。",
		status: 422
	};
	const { readInspectionSource } = await import("./inspector-source.server-DiUm_Rfu.mjs");
	const { formatSourceEvidence } = await import("../_libs/_37.mjs");
	const source = await readInspectionSource({ page: runtime.page });
	if (!source.files.length) return {
		error: source.omissions.join("；"),
		status: 422
	};
	const result = await explainInspection(`SERVER_READ_ACTUAL_SOURCE (deployment source, not a UI summary):\n${formatSourceEvidence(source)}\nSOURCE_OMISSIONS:\n${JSON.stringify(source.omissions)}\n\nCCT324_MANUAL_NOTES (claims to verify, related notes read fresh; draft if indicated):\n${notes}\n\nEVIDENCE:\n${data.context}`, data.mode, void 0, noteIds, true);
	if (result.report && source.omissions.length) for (const omission of source.omissions) result.report.findings.push({
		kind: "missing_evidence",
		title: "实际代码证据缺失",
		noteIds: [],
		evidence: omission,
		verdict: "三方核对不完整，不能认定一致",
		fix: "补齐实际代码依赖后重新分析，不修改已核对笔记。"
	});
	return result.report ? {
		...result,
		report: attachCorrectionNotes(result.report, originals)
	} : result;
});
var checkNoteConflicts_createServerFn_handler = createServerRpc({
	id: "f41ba9d83bea6f205fd3c150915b515c7827685c773d495d0fb3f9d8c3540f5d",
	name: "checkNoteConflicts",
	filename: "src/lib/inspector-ai.functions.ts"
}, (opts) => checkNoteConflicts.__executeServer(opts));
var checkNoteConflicts = createServerFn({ method: "POST" }).inputValidator((input) => objectType({ id: stringType().regex(/^\d+$/) }).parse(input)).handler(checkNoteConflicts_createServerFn_handler, async ({ data }) => {
	const { verifyResearcher, compareNotes } = await import("./inspector-ai.server-6flM55mk.mjs");
	try {
		await verifyResearcher(getRequestHeader("X-WP-Token") || "");
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : "Forbidden",
			status: 403
		};
	}
	let payload;
	const { attachCorrectionNotes, noteRole } = await import("./corrections-8s7iIkbf.mjs");
	let originals = [];
	try {
		const { readNoteById, readRelatedNotes } = await import("./inspector-notes.server-BwCAiGYE.mjs");
		const token = getRequestHeader("X-WP-Token") || "";
		const [note, related] = await Promise.all([readNoteById(data.id, token), readRelatedNotes(data.id, token)]);
		originals = [{
			...note,
			current: true,
			role: noteRole(note.title, "element_note")
		}, ...related.map((r) => ({
			...r,
			role: noteRole(r.title, "related_note")
		}))];
		payload = JSON.stringify({
			note: {
				cct: `CCT324 #${data.id}`,
				role: originals[0]?.role,
				a55: note.title,
				a56: note.text
			},
			related: related.map((r) => ({
				cct: `CCT324 #${r.id}`,
				role: noteRole(r.title, "related_note"),
				a55: r.title,
				a56: r.text
			}))
		});
	} catch (error) {
		return {
			error: `注释读取失败：${error instanceof Error ? error.message : String(error)}`,
			status: 502
		};
	}
	const result = await compareNotes(payload);
	return result.report ? {
		...result,
		report: attachCorrectionNotes(result.report, originals)
	} : result;
});
var analyzeSiteNote_createServerFn_handler = createServerRpc({
	id: "c7b660e60c90ac67defafa5cfd4fbf45668c3236ae3e39736cf4bc752c27dcf6",
	name: "analyzeSiteNote",
	filename: "src/lib/inspector-ai.functions.ts"
}, (opts) => analyzeSiteNote.__executeServer(opts));
var analyzeSiteNote = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	page: stringType().max(500),
	noteId: stringType().regex(/^\d+$/),
	pageNoteIds: arrayType(stringType().regex(/^\d+$/)).max(100).optional(),
	evidence: stringType().min(1),
	chunk: numberType().int().min(1),
	chunks: numberType().int().min(1),
	omissions: arrayType(stringType().max(1e3)).max(1e3)
}).refine((v) => v.chunk <= v.chunks).parse(input)).handler(analyzeSiteNote_createServerFn_handler, async ({ data }) => {
	const { verifyResearcher, explainInspection } = await import("./inspector-ai.server-6flM55mk.mjs");
	try {
		await verifyResearcher(getRequestHeader("X-WP-Token") || "");
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : "Forbidden",
			status: 403
		};
	}
	try {
		const { readNoteById, readRelatedNotes } = await import("./inspector-notes.server-BwCAiGYE.mjs");
		const token = getRequestHeader("X-WP-Token") || "";
		const rootIds = [.../* @__PURE__ */ new Set([data.noteId, ...data.pageNoteIds || []])];
		const { attachCorrectionNotes, noteRole } = await import("./corrections-8s7iIkbf.mjs");
		const collected = [];
		for (const id of rootIds) {
			const [note, related] = await Promise.all([readNoteById(id, token), readRelatedNotes(id, token)]);
			collected.push({
				...note,
				current: true,
				role: noteRole(note.title, data.pageNoteIds?.includes(id) ? "page_note" : "element_note")
			}, ...related.map((n) => ({
				...n,
				role: noteRole(n.title, "related_note")
			})));
		}
		const notes = attachCorrectionNotes({
			summary: "正在准备",
			comparedNoteIds: [],
			comparedPairs: [],
			comparedCodeNoteIds: [],
			codeCompared: false,
			findings: []
		}, collected).notes || [];
		const { WP, R, T } = await import("../_libs/_2.mjs").then((n) => n.a);
		const evidenceText = data.evidence + "\n" + notes.map((n) => n.text).join("\n");
		const cctIds = new Set([...evidenceText.matchAll(/CCT\s*([0-9]+)|cct\[["']([0-9]+)["']\]/gi)].map((m) => m[1] || m[2]));
		const relIds = new Set([...evidenceText.matchAll(/REL\s*([0-9]+)|jet-rel\/([0-9]+)/gi)].map((m) => m[1] || m[2]));
		const tables = T;
		const relations = R;
		for (const match of evidenceText.matchAll(/\bT\.([A-Za-z_]\w*)/g)) {
			const table = tables[match[1] || ""];
			if (table) cctIds.add(String(table.id));
		}
		for (const match of evidenceText.matchAll(/\bR\.([A-Za-z_]\w*)/g)) {
			const relation = relations[match[1] || ""];
			if (relation) relIds.add(String(relation));
		}
		const dictionary = {
			cct: Object.fromEntries(Object.entries(WP.cct).filter(([id]) => cctIds.has(id))),
			rel: Object.fromEntries(Object.entries(WP.rel).filter(([id]) => relIds.has(id)))
		};
		const result = await explainInspection(JSON.stringify({
			page: data.page,
			analysis: "全站分析中的一项；逐对比较当前元素、整页主注释和它们所有直接关联注释；注释的用途与当前代码不一致也要明确指出，不自动裁决需求",
			sourceChunk: data.chunk,
			sourceChunks: data.chunks,
			evidenceOmissions: data.omissions,
			notes,
			dictionary,
			source: data.evidence
		}), "full", void 0, notes.map((n) => n.id), true);
		return result.report ? {
			...result,
			report: attachCorrectionNotes(result.report, notes)
		} : result;
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : "全站分析读取失败",
			status: 502
		};
	}
});
var chatAboutCorrection_createServerFn_handler = createServerRpc({
	id: "ea746736277ceb9aea07e443526e8f12d7462737856a591b0e804c5328ac90a3",
	name: "chatAboutCorrection",
	filename: "src/lib/inspector-ai.functions.ts"
}, (opts) => chatAboutCorrection.__executeServer(opts));
var chatAboutCorrection = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	page: stringType().min(1).max(2e3),
	target: enumType([
		"page_note",
		"element_note",
		"functional_note",
		"code"
	]),
	noteId: stringType().regex(/^\d+$/).nullable(),
	basisNoteIds: arrayType(stringType().regex(/^\d+$/)).max(50),
	reason: stringType(),
	draftTitle: stringType(),
	draftText: stringType(),
	messages: arrayType(objectType({
		role: enumType(["user", "assistant"]),
		content: stringType().min(1)
	})).min(1).max(60)
}).parse(input)).handler(chatAboutCorrection_createServerFn_handler, async ({ data }) => {
	const { verifyResearcher, chatCorrection } = await import("./inspector-ai.server-6flM55mk.mjs");
	try {
		await verifyResearcher(getRequestHeader("X-WP-Token") || "");
	} catch (error) {
		return { error: error instanceof Error ? error.message : "Forbidden" };
	}
	try {
		const { readNoteById, readRelatedNotes } = await import("./inspector-notes.server-BwCAiGYE.mjs");
		const token = getRequestHeader("X-WP-Token") || "";
		const current = data.noteId ? await readNoteById(data.noteId, token) : null;
		const related = data.noteId ? await readRelatedNotes(data.noteId, token) : [];
		const basis = await Promise.all(data.basisNoteIds.filter((id) => !related.some((r) => r.id === id)).map((id) => readNoteById(id, token).catch(() => null)));
		const baseline = [...related, ...basis.filter((n) => !!n)];
		const { readInspectionSource } = await import("./inspector-source.server-DiUm_Rfu.mjs");
		const { formatSourceEvidence } = await import("../_libs/_37.mjs");
		const source = await readInspectionSource({ page: data.page });
		return await chatCorrection(`SERVER_READ_ACTUAL_SOURCE:\n${source.files.length ? formatSourceEvidence(source) : "（未读取到实际代码）"}\nSOURCE_OMISSIONS:${JSON.stringify(source.omissions)}\n\nBASELINE_RELATED_NOTES（视为正确）:\n${JSON.stringify(baseline.map((n) => ({
			cct: `CCT324 #${n.id}`,
			a55: n.title,
			a56: n.text
		})))}\n\nCURRENT_NOTE（被修改对象）:\n${JSON.stringify(current ? {
			cct: `CCT324 #${current.id}`,
			a55: current.title,
			a56: current.text
		} : null)}\n\nSUGGESTION（target=${data.target}）原因：${data.reason}\n当前编辑框名字：${data.draftTitle}\n当前编辑框正文：\n${data.draftText}`, data.messages);
	} catch (error) {
		return { error: error instanceof Error ? error.message : "读取失败" };
	}
});
//#endregion
export { analyzeSiteNote_createServerFn_handler, chatAboutCorrection_createServerFn_handler, checkNoteConflicts_createServerFn_handler, explainReadWrite_createServerFn_handler };
