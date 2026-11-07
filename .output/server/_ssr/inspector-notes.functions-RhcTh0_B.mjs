import "../_runtime.mjs";
import { l as createServerFn } from "./createServerFn-Be1RckzI.mjs";
import { a as objectType, c as unionType, i as numberType, n as booleanType, o as stringType, r as enumType, t as arrayType } from "../_libs/zod.mjs";
import { t as getRequestHeader } from "./request-response-CaQSkNBu.mjs";
import { t as createServerRpc } from "./createServerRpc-Cn_WX1Po.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/inspector-notes.functions-RhcTh0_B.js
/** Researcher-only: read manual notes for an element and its page. */
var loadInspectorNotes_createServerFn_handler = createServerRpc({
	id: "43690a4d3d9aa2699c75ba38700c15cd6046e109e43a5a2683337aac4f01af13",
	name: "loadInspectorNotes",
	filename: "src/lib/inspector-notes.functions.ts"
}, (opts) => loadInspectorNotes.__executeServer(opts));
var loadInspectorNotes = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	keys: arrayType(stringType().min(1).max(600)).min(1).max(5),
	fingerprint: stringType().max(600).optional(),
	tag: stringType().max(60).optional(),
	page: stringType().max(400).optional(),
	priorKey: stringType().min(1).max(600).optional(),
	priorLabel: stringType().max(400).optional(),
	legacy: unionType([objectType({
		key: stringType().min(1).max(600),
		label: stringType().max(400)
	}), arrayType(objectType({
		key: stringType().min(1).max(600),
		label: stringType().max(400)
	})).min(1).max(8)]).optional(),
	alias: stringType().max(600).optional()
}).parse(input)).handler(loadInspectorNotes_createServerFn_handler, async ({ data }) => {
	const { verifyResearcher } = await import("./inspector-ai.server-6flM55mk.mjs");
	try {
		await verifyResearcher(getRequestHeader("X-WP-Token") || "");
	} catch (e) {
		return {
			error: e instanceof Error ? e.message : "Forbidden",
			notes: []
		};
	}
	const { readNoteForKey, readNoteForFingerprint, rebindRecoveredNote } = await import("./inspector-notes.server-hcmV7c7F.mjs");
	try {
		const notes = (await Promise.all(data.keys.map(readNoteForKey))).filter((n) => !!n);
		const { matchingLegacyLabel } = await import("./legacy-match-D51Cu6Mc.mjs");
		let warning;
		const migrationCandidates = [];
		const seenCandidates = /* @__PURE__ */ new Set();
		const listCandidate = (note, key, label, reason) => {
			if (!note?.id) return;
			const signature = `${note.id}|${key}`;
			if (seenCandidates.has(signature)) return;
			seenCandidates.add(signature);
			migrationCandidates.push({
				key,
				id: note.id,
				title: note.title || "（无标题）",
				label,
				reason
			});
		};
		const rebind = async (note, label) => {
			const recovered = {
				...note,
				key: data.keys[0]
			};
			try {
				return await rebindRecoveredNote(recovered, data.keys[0], "element", data.page || "", label, data.alias);
			} catch (error) {
				warning = `已读回 CCT324 #${note.id}，但 a59 关联没有写入：${error instanceof Error ? error.message : String(error)}`;
				return recovered;
			}
		};
		if (!notes.length && data.priorKey && data.page) {
			const previous = await readNoteForKey(data.priorKey);
			if (previous?.scope === "element" && data.priorLabel && matchingLegacyLabel(previous.label, data.priorLabel)) notes.push(await rebind(previous, data.priorLabel));
			else if (previous) listCandidate(previous, data.priorKey, data.priorLabel || "", "旧可见位置存在笔记，但标签未能核对一致");
		}
		if (!notes.length && data.legacy) {
			const entries = Array.isArray(data.legacy) ? data.legacy : [data.legacy];
			const candidates = [...new Map(entries.flatMap((entry) => {
				const keys = [entry.key];
				const parts = entry.key.split("|");
				if (parts[0] === "el" && parts.length > 3) keys.push(parts.slice(0, -1).join("|"));
				return keys.map((key) => [key, {
					key,
					label: entry.label
				}]);
			})).values()];
			const oldRows = (await Promise.all(candidates.map((candidate) => readNoteForKey(candidate.key)))).flatMap((note, index) => note ? [{
				note,
				candidate: candidates[index]
			}] : []);
			const matches = oldRows.filter(({ note, candidate }) => matchingLegacyLabel(note.label, candidate.label));
			const matchIds = new Set(matches.map(({ note }) => note.id));
			if (matchIds.size === 1) {
				const match = matches[0];
				notes.push(await rebind(match.note, match.candidate.label));
			} else if (matchIds.size > 1) {
				warning = `发现多个旧元素绑定符合当前标签（${[...matchIds].map((id) => `CCT324 #${id}`).join("、")}），未自动绑定。请在“选择其他注释”中明确选择。`;
				for (const { note, candidate } of matches) listCandidate(note, candidate.key, candidate.label, "多个旧位置同时符合，未自动猜绑");
			} else if (oldRows.length) {
				warning = "发现旧元素绑定，但没有一个能与当前可见标签唯一核对一致，未自动绑定。";
				for (const { note, candidate } of oldRows) listCandidate(note, candidate.key, candidate.label, "旧绑定标签未核对一致");
			}
		}
		if (!notes.length && data.fingerprint && data.tag && data.page) {
			const recovered = await readNoteForFingerprint(data.keys[0], data.fingerprint, data.tag, data.page, Array.isArray(data.legacy) ? data.legacy[0]?.label : data.legacy?.label);
			if (recovered) notes.push(await rebind(recovered, recovered.label || ""));
		}
		return {
			notes,
			...warning ? { warning } : {},
			...migrationCandidates.length ? { migrationCandidates } : {}
		};
	} catch (e) {
		return {
			error: e instanceof Error ? e.message : "读取失败",
			notes: []
		};
	}
});
var loadAllInspectorNotes_createServerFn_handler = createServerRpc({
	id: "7a2c7294467f56a028fcf0ff17c2ac4ab9fd538f70a58128b77796a6961e6e9d",
	name: "loadAllInspectorNotes",
	filename: "src/lib/inspector-notes.functions.ts"
}, (opts) => loadAllInspectorNotes.__executeServer(opts));
var loadAllInspectorNotes = createServerFn({ method: "POST" }).handler(loadAllInspectorNotes_createServerFn_handler, async () => {
	const { verifyResearcher } = await import("./inspector-ai.server-6flM55mk.mjs");
	try {
		await verifyResearcher(getRequestHeader("X-WP-Token") || "");
	} catch (e) {
		return {
			error: e instanceof Error ? e.message : "Forbidden",
			notes: []
		};
	}
	const { readAllNotes } = await import("./inspector-notes.server-hcmV7c7F.mjs");
	const { encodeNotes } = await import("../_libs/_32.mjs").then((n) => n.n);
	try {
		return { compressedNotes: await encodeNotes(await readAllNotes()) };
	} catch (e) {
		return {
			error: e instanceof Error ? e.message : "读取失败",
			notes: []
		};
	}
});
var searchInspectorNotes_createServerFn_handler = createServerRpc({
	id: "c19ad123684bff70e7873b6d6439947839fdde14c75f5dd01ba436b12a96ae8e",
	name: "searchInspectorNotes",
	filename: "src/lib/inspector-notes.functions.ts"
}, (opts) => searchInspectorNotes.__executeServer(opts));
var searchInspectorNotes = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	q: stringType().max(200),
	status: enumType([
		"all",
		"verified",
		"unverified"
	])
}).parse(input)).handler(searchInspectorNotes_createServerFn_handler, async ({ data }) => {
	const { verifyResearcher } = await import("./inspector-ai.server-6flM55mk.mjs");
	try {
		await verifyResearcher(getRequestHeader("X-WP-Token") || "");
	} catch (e) {
		return {
			error: e instanceof Error ? e.message : "Forbidden",
			notes: []
		};
	}
	const { searchNotes } = await import("./inspector-notes.server-hcmV7c7F.mjs");
	try {
		return { notes: await searchNotes(data.q, data.status) };
	} catch (e) {
		return {
			error: e instanceof Error ? e.message : "搜索失败",
			notes: []
		};
	}
});
var saveInspectorNote_createServerFn_handler = createServerRpc({
	id: "c7f4965852721a31cbb1d12971fecb7b5e8aca26875d68e10daa9a9485f78230",
	name: "saveInspectorNote",
	filename: "src/lib/inspector-notes.functions.ts"
}, (opts) => saveInspectorNote.__executeServer(opts));
var saveInspectorNote = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	key: stringType().min(1).max(600),
	scope: enumType(["element", "page"]),
	page: stringType().max(400),
	label: stringType().max(400),
	title: stringType().min(1).max(240),
	id: stringType().regex(/^\d+$/).optional(),
	create: booleanType().optional(),
	verified: booleanType().optional(),
	text: stringType().max(1e5),
	source: objectType({
		file: stringType().min(1).max(300),
		line: numberType().int().positive(),
		endLine: numberType().int().positive(),
		tag: stringType().min(1).max(60),
		digest: stringType().regex(/^[0-9a-f]{64}$/)
	}).optional(),
	alias: stringType().max(600).optional()
}).parse(input)).handler(saveInspectorNote_createServerFn_handler, async ({ data }) => {
	const { verifyResearcher } = await import("./inspector-ai.server-6flM55mk.mjs");
	try {
		await verifyResearcher(getRequestHeader("X-WP-Token") || "");
	} catch (e) {
		return { error: e instanceof Error ? e.message : "Forbidden" };
	}
	const { writeNote } = await import("./inspector-notes.server-hcmV7c7F.mjs");
	try {
		return { note: await writeNote(data) };
	} catch (e) {
		return { error: e instanceof Error ? e.message : "保存失败" };
	}
});
var selectInspectorNote_createServerFn_handler = createServerRpc({
	id: "7955a7df5aef9c063bb7cccf15e6a4567156df200fc56b9178be64857c5b0ba0",
	name: "selectInspectorNote",
	filename: "src/lib/inspector-notes.functions.ts"
}, (opts) => selectInspectorNote.__executeServer(opts));
var selectInspectorNote = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	key: stringType().min(1).max(600),
	id: stringType().regex(/^\d+$/),
	scope: enumType(["element", "page"]),
	page: stringType().max(400),
	label: stringType().max(400),
	source: objectType({
		file: stringType().min(1).max(300),
		line: numberType().int().positive(),
		endLine: numberType().int().positive(),
		tag: stringType().min(1).max(60),
		digest: stringType().regex(/^[0-9a-f]{64}$/)
	}).optional(),
	alias: stringType().max(600).optional()
}).parse(input)).handler(selectInspectorNote_createServerFn_handler, async ({ data }) => {
	const { verifyResearcher } = await import("./inspector-ai.server-6flM55mk.mjs");
	try {
		await verifyResearcher(getRequestHeader("X-WP-Token") || "");
	} catch (e) {
		return { error: e instanceof Error ? e.message : "Forbidden" };
	}
	const { selectNote } = await import("./inspector-notes.server-hcmV7c7F.mjs");
	try {
		return { note: await selectNote(data) };
	} catch (e) {
		return { error: e instanceof Error ? e.message : "保存失败" };
	}
});
var noteId = stringType().regex(/^\d+$/);
/** Explicit user submission to one existing record; never creates bindings or relations. */
var submitNoteCorrection_createServerFn_handler = createServerRpc({
	id: "a55074f9a2c3679f0fcb680587f5991c765b0801c777fe5b0cdee20e526c1390",
	name: "submitNoteCorrection",
	filename: "src/lib/inspector-notes.functions.ts"
}, (opts) => submitNoteCorrection.__executeServer(opts));
var submitNoteCorrection = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	id: noteId,
	title: stringType().trim().min(1).max(240),
	text: stringType().min(1).max(1e5),
	expected: objectType({
		title: stringType(),
		text: stringType(),
		verified: booleanType()
	}),
	confirmVerified: booleanType()
}).parse(input)).handler(submitNoteCorrection_createServerFn_handler, async ({ data }) => {
	const denied = await researcherOnly();
	if (denied) return { error: denied };
	try {
		const s = await import("./inspector-notes.server-hcmV7c7F.mjs");
		const { assertUnchangedNote } = await import("./corrections-8s7iIkbf.mjs");
		const current = await s.readNoteById(data.id);
		assertUnchangedNote(current, data.expected);
		if (current.verified && !data.confirmVerified) throw new Error("这条笔记已手动核对，请先明确确认修改。");
		await s.updatePlainNote(data.id, data.title, data.text, current.verified);
		return { note: await s.readNoteById(data.id) };
	} catch (e) {
		return { error: e instanceof Error ? e.message : "提交失败，未确认保存。" };
	}
});
async function researcherOnly() {
	const { verifyResearcher } = await import("./inspector-ai.server-6flM55mk.mjs");
	try {
		await verifyResearcher(getRequestHeader("X-WP-Token") || "");
		return;
	} catch (e) {
		return e instanceof Error ? e.message : "Forbidden";
	}
}
/** Researcher-only: notes linked to one CCT324 note through REL325. */
var listRelatedNotes_createServerFn_handler = createServerRpc({
	id: "365dfa0e02c1ec2266223abc440777ff8542bba00a3a9377675879bb85ef1d35",
	name: "listRelatedNotes",
	filename: "src/lib/inspector-notes.functions.ts"
}, (opts) => listRelatedNotes.__executeServer(opts));
var listRelatedNotes = createServerFn({ method: "POST" }).inputValidator((input) => objectType({ id: noteId }).parse(input)).handler(listRelatedNotes_createServerFn_handler, async ({ data }) => {
	const denied = await researcherOnly();
	if (denied) return {
		error: denied,
		notes: []
	};
	const { readRelatedNotes } = await import("./inspector-notes.server-hcmV7c7F.mjs");
	try {
		return { notes: await readRelatedNotes(data.id) };
	} catch (e) {
		return {
			error: e instanceof Error ? e.message : "读取失败",
			notes: []
		};
	}
});
var linkRelatedNote_createServerFn_handler = createServerRpc({
	id: "4b95470b37060ed8a3242601bbc3e284db14472436be2cc47d75bd58c365fb26",
	name: "linkRelatedNote",
	filename: "src/lib/inspector-notes.functions.ts"
}, (opts) => linkRelatedNote.__executeServer(opts));
var linkRelatedNote = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	id: noteId,
	otherId: noteId.optional(),
	create: objectType({
		title: stringType().min(1).max(240),
		text: stringType().max(1e5)
	}).optional()
}).refine((v) => !!v.otherId !== !!v.create).parse(input)).handler(linkRelatedNote_createServerFn_handler, async ({ data }) => {
	const denied = await researcherOnly();
	if (denied) return { error: denied };
	const s = await import("./inspector-notes.server-hcmV7c7F.mjs");
	try {
		const currentTitle = await s.noteTitle(data.id);
		const otherId = data.otherId || await s.createPlainNote(data.create.title, data.create.text);
		const otherTitle = data.otherId ? await s.noteTitle(otherId) : data.create.title;
		const { parent, child } = s.relationDirection({
			id: data.id,
			title: currentTitle
		}, {
			id: otherId,
			title: otherTitle
		});
		try {
			await s.linkNotes(parent, child);
		} catch (e) {
			if (data.create) throw new Error(`新注释 #${otherId} 已保存，但关联失败：${e instanceof Error ? e.message : String(e)}`);
			throw e;
		}
		return { notes: await s.readRelatedNotes(data.id) };
	} catch (e) {
		return { error: e instanceof Error ? e.message : "关联失败" };
	}
});
var unlinkRelatedNote_createServerFn_handler = createServerRpc({
	id: "6f7891540b48800a8ccd2ff7ea8f642add416c7c64a217d55e8937106d706e41",
	name: "unlinkRelatedNote",
	filename: "src/lib/inspector-notes.functions.ts"
}, (opts) => unlinkRelatedNote.__executeServer(opts));
var unlinkRelatedNote = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	id: noteId,
	parent: noteId,
	child: noteId
}).refine((v) => v.id === v.parent || v.id === v.child).parse(input)).handler(unlinkRelatedNote_createServerFn_handler, async ({ data }) => {
	const denied = await researcherOnly();
	if (denied) return { error: denied };
	const s = await import("./inspector-notes.server-hcmV7c7F.mjs");
	try {
		await s.unlinkNotes(data.parent, data.child);
		return { notes: await s.readRelatedNotes(data.id) };
	} catch (e) {
		return { error: e instanceof Error ? e.message : "取消关联失败" };
	}
});
var updateRelatedNote_createServerFn_handler = createServerRpc({
	id: "2ee085be7ed96707ef92a5fc66dd70944c88e13f4f05f4088bcb3efce17ee805",
	name: "updateRelatedNote",
	filename: "src/lib/inspector-notes.functions.ts"
}, (opts) => updateRelatedNote.__executeServer(opts));
var updateRelatedNote = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	id: noteId,
	otherId: noteId,
	title: stringType().min(1).max(240),
	text: stringType().max(1e5),
	verified: booleanType()
}).parse(input)).handler(updateRelatedNote_createServerFn_handler, async ({ data }) => {
	const denied = await researcherOnly();
	if (denied) return { error: denied };
	const s = await import("./inspector-notes.server-hcmV7c7F.mjs");
	try {
		await s.updatePlainNote(data.otherId, data.title, data.text, data.verified);
		return { notes: await s.readRelatedNotes(data.id) };
	} catch (e) {
		return { error: e instanceof Error ? e.message : "保存失败" };
	}
});
//#endregion
export { linkRelatedNote_createServerFn_handler, listRelatedNotes_createServerFn_handler, loadAllInspectorNotes_createServerFn_handler, loadInspectorNotes_createServerFn_handler, saveInspectorNote_createServerFn_handler, searchInspectorNotes_createServerFn_handler, selectInspectorNote_createServerFn_handler, submitNoteCorrection_createServerFn_handler, unlinkRelatedNote_createServerFn_handler, updateRelatedNote_createServerFn_handler };
