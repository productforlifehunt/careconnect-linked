import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notes-transport-DYZ3UYut.js
var notes_transport_exports = /* @__PURE__ */ __exportAll({
	decodeNotes: () => decodeNotes,
	encodeNotes: () => encodeNotes
});
/** One compressed scalar avoids RPC object-graph/output limits for the complete catalogue. */
async function encodeNotes(notes) {
	const stream = new Blob([JSON.stringify(notes)]).stream().pipeThrough(new CompressionStream("gzip"));
	const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
	let binary = "";
	for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
	return btoa(binary);
}
async function decodeNotes(encoded) {
	const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
	const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
	const result = JSON.parse(await new Response(stream).text());
	if (!Array.isArray(result)) throw new Error("注释返回格式异常，请重试。");
	return result;
}
//#endregion
export { notes_transport_exports as n, decodeNotes as t };
