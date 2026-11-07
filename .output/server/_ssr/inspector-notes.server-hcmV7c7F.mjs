import "../_runtime.mjs";
import { i as updatePositionBindings, n as positionBindings, r as samePosition, t as findPositionBinding } from "./position-bindings-DbhXelFw.mjs";
import processModule from "node:process";
//#region node_modules/.nitro/vite/services/ssr/assets/inspector-notes.server-hcmV7c7F.js
function bindCCTNotes(rows, bindings) {
	const byId = new Map(rows.map((row) => [row.id, row]));
	const byKey = new Map(bindings.map((binding) => [binding.key, binding]));
	return [...rows, ...[...byKey.values()].map((binding) => {
		const row = byId.get(binding.id);
		if (!row) throw new Error(`注释 #${binding.id} 不存在，不能显示其他注释代替。`);
		return {
			...row,
			...binding
		};
	})];
}
var CCT_BASE = "https://app.challenged-dementia.com/afresh/wp-json/jet-cct/manual_notes";
async function wp(path = "", method = "GET", body) {
	const user = processModule.env["WP_ADMIN_USER"];
	const password = processModule.env["WP_ADMIN_APP_PASSWORD"];
	const headers = { "Content-Type": "application/json" };
	if (user && password) headers["Authorization"] = `Basic ${btoa(`${user}:${password}`)}`;
	const response = await fetch(CCT_BASE + path, {
		method,
		headers,
		...body === void 0 ? {} : { body: JSON.stringify(body) }
	});
	if (!response.ok) throw new Error(`注释读取或保存失败（${response.status}），请重试。`);
	return response.json();
}
function mapRow(row) {
	return {
		key: `cct|${row._ID}`,
		id: String(row._ID),
		title: row.a55,
		text: row.a56,
		verified: row.a58 === "b55",
		updatedAt: row.cct_modified ? row.cct_modified.replace(" ", "T") + "+08:00" : ""
	};
}
/** Filter on the existing a59 field; never download the entire note catalogue for one element. */
async function bindingRows(key) {
	const { routePattern } = await import("../_libs/_33.mjs").then((n) => n.i);
	const pattern = routePattern(key);
	const parts = key.split("|");
	const needle = pattern || key.includes("/:id") ? parts.slice(2).join("|") : key;
	const encoded = JSON.stringify(needle).slice(1, -1);
	const rows = [];
	for (let offset = 0;; offset += 100) {
		const result = await wp(`?_limit=100&_offset=${offset}&_orderby=_ID&_order=asc&_filters=${encodeURIComponent(JSON.stringify([{
			field: "a59",
			operator: "LIKE",
			value: encoded
		}]))}`);
		if (!Array.isArray(result)) throw new Error("元素绑定读取异常。");
		rows.push(...result);
		if (result.length < 100) break;
	}
	return rows.filter((row) => positionBindings(row.a59, String(row._ID)).some((b) => samePosition(b.key, key)));
}
async function storedBinding(key) {
	return findPositionBinding((await bindingRows(key)).flatMap((row) => positionBindings(row.a59, String(row._ID))), key);
}
/** Picker search done by WordPress itself (name LIKE each word, or exact number): returns at most 60 names, never note bodies. */
async function searchNotes(q, status) {
	const words = q.trim().replace(/^#/, "").split(/\s+/).filter(Boolean).slice(0, 6);
	const filters = [];
	const firstWord = words[0];
	if (words.length === 1 && firstWord && /^\d+$/.test(firstWord)) filters.push({
		field: "_ID",
		operator: "=",
		value: firstWord
	});
	else for (const w of words) filters.push({
		field: "a55",
		operator: "LIKE",
		value: w
	});
	if (status !== "all") filters.push({
		field: "a58",
		operator: "=",
		value: status === "verified" ? "b55" : "b56"
	});
	const rows = await wp(`?_limit=60&_orderby=_ID&_order=desc${filters.length ? `&_filters=${encodeURIComponent(JSON.stringify(filters))}` : ""}`);
	if (!Array.isArray(rows)) return [];
	return rows.map((r) => ({
		id: String(r._ID),
		title: r.a55 || "",
		verified: r.a58 === "b55"
	}));
}
async function readNoteForKey(key) {
	const binding = await storedBinding(key);
	if (!binding?.id) return null;
	const row = await wp(`/${binding.id}`);
	if (String(row._ID) !== binding.id) throw new Error("绑定的注释不存在。");
	return {
		...mapRow(row),
		...binding,
		key
	};
}
/** Recover a source-verified legacy binding only when its fingerprint identifies one note. */
async function readNoteForFingerprint(key, fingerprint, tag, page, currentLabel) {
	const match = fingerprint.match(/^([^:]+):(\d+):(\d+):([0-9a-f]{64}):1$/);
	if (!match) return null;
	const [, file, , , digest] = match;
	const rows = [];
	for (let offset = 0;; offset += 100) {
		const result = await wp(`?_limit=100&_offset=${offset}&_orderby=_ID&_order=asc&_filters=${encodeURIComponent(JSON.stringify([{
			field: "a59",
			operator: "LIKE",
			value: file
		}]))}`);
		if (!Array.isArray(result)) throw new Error("旧注释读取异常。");
		rows.push(...result);
		if (result.length < 100) break;
	}
	const { samePosition: samePage } = await import("../_libs/_36.mjs");
	const matches = rows.flatMap((row) => positionBindings(row.a59, String(row._ID)).filter((b) => (!b.page || samePage(`el|${b.page}|x`, `el|${page}|x`) || key.startsWith("el|*|") && b.key.startsWith("el|*|")) && b.source?.file === file && b.source?.tag.toLowerCase() === tag.toLowerCase() && b.source?.digest === digest).map((b) => ({
		row,
		binding: b
	})));
	if (new Set(matches.map((m) => m.binding.id)).size !== 1) return null;
	const found = matches[0];
	if (!found) return null;
	const note = {
		...mapRow(found.row),
		...found.binding,
		key
	};
	if (currentLabel) {
		const { matchingLegacyLabel } = await import("./legacy-match-D51Cu6Mc.mjs");
		if (!matchingLegacyLabel(note.label, currentLabel)) return null;
	}
	return note;
}
/** Add the newly resolved stable position to a CCT note without changing its text or check state. */
async function rebindRecoveredNote(note, key, scope, page, label, alias) {
	if (!note.id) throw new Error("恢复的注释缺少 CCT 编号，未修改关联。");
	const binding = {
		key,
		id: note.id,
		scope,
		page,
		label,
		...note.source ? { source: note.source } : {},
		...alias || note.alias ? { alias: alias || note.alias } : {},
		locked: true
	};
	await storeBinding(binding);
	return {
		...note,
		...binding
	};
}
async function writeBindingsOnly(row, bindings) {
	const a59 = updatePositionBindings(row.a59, bindings);
	await wp(`/${row._ID}`, "POST", { a59 });
	const saved = await wp(`/${row._ID}`);
	if (saved.a59 !== a59 || saved.a55 !== row.a55 || saved.a56 !== row.a56 || (saved.a58 || "") !== (row.a58 || "")) throw new Error("元素绑定保存后核对不一致，未确认保存。");
}
async function storeBinding(binding) {
	const rows = await bindingRows(binding.key);
	const target = await wp(`/${binding.id}`);
	if (String(target._ID) !== binding.id) throw new Error("所选注释不存在。");
	await writeBindingsOnly(target, [...positionBindings(target.a59, binding.id).filter((b) => !samePosition(b.key, binding.key)), binding]);
	for (const row of rows) {
		if (String(row._ID) === binding.id) continue;
		const fresh = await wp(`/${row._ID}`);
		await writeBindingsOnly(fresh, positionBindings(fresh.a59, String(fresh._ID)).filter((b) => !samePosition(b.key, binding.key)));
	}
	if ((await storedBinding(binding.key))?.id !== binding.id) throw new Error("元素绑定回读不一致。");
}
/**
* Reads every CCT324 row in a few large pages fetched side by side.
* The old loop asked for 500 rows at a time, one after another (20+ round trips in a row),
* which kept the small WordPress server busy for half a minute on every inspector load.
*/
var PAGE = 1e3;
var PARALLEL = 3;
async function readPage(offset) {
	const user = processModule.env["WP_ADMIN_USER"];
	const password = processModule.env["WP_ADMIN_APP_PASSWORD"];
	const headers = {};
	if (user && password) headers["Authorization"] = `Basic ${btoa(`${user}:${password}`)}`;
	const response = await fetch(`${CCT_BASE}?_limit=${PAGE}&_offset=${offset}&_orderby=_ID&_order=asc`, { headers });
	if (!response.ok) throw new Error(`注释读取或保存失败（${response.status}），请重试。`);
	const result = await response.json();
	if (!Array.isArray(result)) throw new Error("注释列表返回异常。");
	const header = Number(response.headers.get("Jet-Query-Total"));
	return {
		rows: result,
		total: Number.isFinite(header) && header > 0 ? header : null
	};
}
async function readAllRows() {
	const first = await readPage(0);
	if (first.rows.length < PAGE) return first.rows;
	const rows = [...first.rows];
	if (first.total) {
		const offsets = [];
		for (let o = PAGE; o < first.total; o += PAGE) offsets.push(o);
		for (let i = 0; i < offsets.length; i += PARALLEL) {
			const pages = await Promise.all(offsets.slice(i, i + PARALLEL).map(readPage));
			for (const p of pages) rows.push(...p.rows);
		}
		for (let o = Math.ceil(first.total / PAGE) * PAGE;; o += PAGE) {
			const tail = await readPage(o);
			rows.push(...tail.rows);
			if (tail.rows.length < PAGE) break;
		}
	} else for (let o = PAGE;; o += PAGE) {
		const page = await readPage(o);
		rows.push(...page.rows);
		if (page.rows.length < PAGE) break;
	}
	return [...new Map(rows.map((r) => [String(r._ID), r])).values()];
}
async function readAllNotes() {
	const rows = await readAllRows();
	const bindings = rows.flatMap((row) => positionBindings(row.a59, String(row._ID)));
	return bindCCTNotes(rows.map(mapRow), bindings).map((note) => ({
		scope: "element",
		page: "",
		label: note.title,
		...note
	}));
}
async function selectNote(binding) {
	const row = await wp(`/${binding.id}`);
	if (String(row._ID) !== binding.id) throw new Error("所选注释不存在。");
	await storeBinding({
		...binding,
		locked: true
	});
	return {
		...mapRow(row),
		...binding,
		locked: true
	};
}
async function writeNote(note) {
	const current = note.create ? void 0 : await storedBinding(note.key);
	let id = note.create ? void 0 : note.id || current?.id;
	if (!id) {
		const result = await wp("", "POST", {
			a55: note.title || note.label,
			a56: note.text,
			a58: note.verified ? "b55" : "b56",
			cct_status: "publish"
		});
		id = String(typeof result === "number" || typeof result === "string" ? result : result.item_id || result._ID || "");
		if (!/^\d+$/.test(id)) throw new Error("没有返回新注释编号，请重新读取列表，勿重复新建。");
	} else await wp(`/${id}`, "POST", {
		a55: note.title || note.label,
		a56: note.text,
		a58: note.verified ? "b55" : "b56"
	});
	const row = await wp(`/${id}`);
	if (row.a56 !== note.text || row.a55 !== (note.title || note.label) || row.a58 === "b55" !== !!note.verified) throw new Error("保存后的内容核对不一致。");
	const binding = {
		key: note.key,
		id,
		scope: note.scope,
		page: note.page,
		label: note.label,
		...note.source ? { source: note.source } : {},
		...note.alias ? { alias: note.alias } : {},
		locked: true
	};
	await storeBinding(binding);
	return {
		...mapRow(row),
		...binding
	};
}
/** Fresh CCT324 note for one exact position stored in a59; null when unbound. */
async function readCCTNoteForKey(key) {
	const binding = await storedBinding(key);
	if (!binding?.id) return null;
	const row = await wp(`/${binding.id}`);
	if (String(row._ID) !== binding.id) return null;
	return {
		id: binding.id,
		title: row.a55 || "",
		text: row.a56 || "",
		verified: row.a58 === "b55"
	};
}
var REL_BASE = "https://app.challenged-dementia.com/afresh/wp-json/jet-rel/325";
async function rel(path = "", method = "GET", body) {
	const user = processModule.env["WP_ADMIN_USER"];
	const password = processModule.env["WP_ADMIN_APP_PASSWORD"];
	if (!user || !password) throw new Error("注释关联未配置。");
	const response = await fetch(REL_BASE + path, {
		method,
		headers: {
			Authorization: `Basic ${btoa(`${user}:${password}`)}`,
			"Content-Type": "application/json"
		},
		...body === void 0 ? {} : { body: JSON.stringify(body) }
	});
	if (!response.ok) throw new Error(`注释关联读取或保存失败（${response.status}），请重试。`);
	return response.json();
}
async function relIds(side, id) {
	const rows = await rel(`/${side}/${id}`);
	if (!Array.isArray(rows)) throw new Error("注释关联返回异常。");
	return rows.map((r) => String(side === "parents" ? r.parent_object_id : r.child_object_id)).filter((v) => /^\d+$/.test(v));
}
/** Parent (REL325 父) and children (REL325 子) of one CCT324 note, read fresh with their a55/a56. */
async function readRelatedNotes(id) {
	const [parents, children] = await Promise.all([relIds("parents", id), relIds("children", id)]);
	const entries = [...parents.map((p) => [p, "parent"]), ...children.map((c) => [c, "child"])];
	return Promise.all(entries.map(async ([nid, side]) => {
		const row = await wp(`/${nid}`);
		return {
			id: nid,
			title: row.a55 || "",
			text: row.a56 || "",
			side,
			verified: row.a58 === "b55"
		};
	}));
}
/** Edit a related CCT324 note's a55/a56/a58 in place; never touches element/page bindings. */
async function updatePlainNote(id, title, text, verified) {
	await wp(`/${id}`, "POST", {
		a55: title,
		a56: text,
		a58: verified ? "b55" : "b56"
	});
	const row = await wp(`/${id}`);
	if (String(row._ID) !== id || row.a55 !== title || row.a56 !== text || row.a58 === "b55" !== verified) throw new Error("保存后的内容核对不一致。");
}
/** Many to many: adding a link never removes the note's other links. */
async function linkNotes(parent, child) {
	if (parent === child) throw new Error("不能把注释关联到它自己。");
	const [p, c] = await Promise.all([wp(`/${parent}`), wp(`/${child}`)]);
	if (String(p._ID) !== parent || String(c._ID) !== child) throw new Error("所选注释不存在。");
	const before = await relIds("parents", child);
	if (before.includes(parent) || (await relIds("parents", parent)).includes(child)) return;
	await rel("", "POST", {
		parent_id: Number(parent),
		child_id: Number(child),
		context: "child",
		store_items_type: "update"
	});
	const after = await relIds("parents", child);
	if (!after.includes(parent) || before.some((id) => !after.includes(id))) throw new Error("关联保存后核对不一致。");
}
async function unlinkNotes(parent, child) {
	await rel("", "POST", {
		parent_id: Number(parent),
		child_id: Number(child),
		context: "child",
		store_items_type: "disconnect"
	});
	if ((await relIds("parents", child)).includes(parent)) throw new Error("取消关联后核对不一致。");
}
/** REL325 is shown without parent/child, so the current note is stored as parent (titles no longer mark note kinds). */
function relationDirection(current, other) {
	return {
		parent: current.id,
		child: other.id
	};
}
async function readNoteById(id) {
	const row = await wp(`/${id}`);
	if (String(row._ID) !== id) throw new Error("所选注释不存在。");
	return {
		id,
		title: row.a55 || "",
		text: row.a56 || "",
		verified: row.a58 === "b55"
	};
}
async function noteTitle(id) {
	return (await readNoteById(id)).title;
}
async function createPlainNote(title, text) {
	const result = await wp("", "POST", {
		a55: title,
		a56: text,
		cct_status: "publish"
	});
	const id = String(typeof result === "number" || typeof result === "string" ? result : result.item_id || result._ID || "");
	if (!/^\d+$/.test(id)) throw new Error("没有返回新注释编号，请重新读取列表，勿重复新建。");
	const row = await wp(`/${id}`);
	if (row.a55 !== title || row.a56 !== text) throw new Error("保存后的内容核对不一致。");
	return id;
}
//#endregion
export { createPlainNote, linkNotes, noteTitle, readAllNotes, readCCTNoteForKey, readNoteById, readNoteForFingerprint, readNoteForKey, readRelatedNotes, rebindRecoveredNote, relationDirection, searchNotes, selectNote, unlinkNotes, updatePlainNote, writeNote };
