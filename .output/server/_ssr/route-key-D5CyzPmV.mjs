import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-key-D5CyzPmV.js
var route_key_exports = /* @__PURE__ */ __exportAll({
	elementAlias: () => elementAlias,
	findSameElementNote: () => findSameElementNote,
	routePattern: () => routePattern
});
/** One element on /care-circle/28 and /care-circle/31 is the same element: match its note across record ids in the page path. */
function routePattern(key) {
	const parts = key.split("|");
	if (parts[0] !== "el" || !parts[1] || !/\/\d+(?=\/|$)/.test(parts[1])) return void 0;
	return [
		"el",
		parts[1].replace(/\/\d+(?=\/|$)/g, "/:id"),
		...parts.slice(2)
	].join("|");
}
/**
* Build-independent second key for an element: page pattern + the app's own component names + tag + slot.
* The main key holds a source line (preview) or component names (published), which differ between the two
* builds and shift when code above changes; this one is saved with every binding so the note is found again.
*/
function elementAlias(pathname, components, tag, slot) {
	const names = components.filter((n) => n.length >= 3).slice(0, 6);
	if (!names.length) return "";
	return [
		"al",
		pathname.replace(/\/\d+(?=\/|$)/g, "/:id"),
		names.join("<"),
		tag + (slot ? `|${slot}` : "")
	].join("|");
}
function findSameElementNote(notes, key) {
	const exact = notes.get(key);
	if (exact) return exact;
	const pattern = routePattern(key);
	if (!pattern) return void 0;
	for (const [k, v] of notes) if (routePattern(k) === pattern) return v;
}
//#endregion
export { route_key_exports as i, findSameElementNote as n, routePattern as r, elementAlias as t };
