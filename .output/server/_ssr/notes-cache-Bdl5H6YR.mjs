import "../_runtime.mjs";
import { t as decodeNotes } from "./notes-transport-DYZ3UYut.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notes-cache-Bdl5H6YR.js
/** Private, memory-only cache. A session change invalidates both data and in-flight reads. */
function createNotesCache() {
	let owner = "";
	let values = null;
	let pending = null;
	let generation = 0;
	const select = (session) => {
		if (owner === session) return;
		owner = session;
		values = null;
		pending = null;
		generation++;
	};
	return {
		reset() {
			owner = "";
			values = null;
			pending = null;
			generation++;
		},
		peek(session) {
			select(session);
			return values;
		},
		async load(session, fetchNotes) {
			select(session);
			if (values) return values;
			if (pending) return pending;
			const version = generation;
			pending = fetchNotes().then(async (result) => {
				if (result.error) throw new Error(result.error);
				const notes = result.compressedNotes ? await decodeNotes(result.compressedNotes) : result.notes;
				if (!notes) throw new Error("注释返回格式异常，请重试。");
				if (version !== generation) throw new Error("登录状态已变化，请重新打开注释。");
				const merged = new Map(notes.map((note) => [note.key, note]));
				values?.forEach((note, key) => merged.set(key, note));
				values = merged;
				return merged;
			}).finally(() => {
				if (version === generation) pending = null;
			});
			return pending;
		},
		put(session, note) {
			if (session !== owner) return;
			if (!values) values = /* @__PURE__ */ new Map();
			if (note.id) values.forEach((existing, key) => {
				if (existing.id === note.id) values?.set(key, {
					...existing,
					text: note.text,
					title: note.title,
					updatedAt: note.updatedAt
				});
			});
			values.set(note.key, note);
			if (note.id) values.set(`cct|${note.id}`, {
				...note,
				key: `cct|${note.id}`,
				source: void 0,
				locked: void 0
			});
		}
	};
}
var inspectorNotesCache = createNotesCache();
//#endregion
export { inspectorNotesCache as t };
