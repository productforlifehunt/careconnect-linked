import "../_runtime.mjs";
import { r as routePattern } from "./route-key-D5CyzPmV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/position-bindings-DbhXelFw.js
/** a59 can contain pre-existing metadata; only inspectorBindings belongs to this feature. */
function bindingDocument(raw) {
	if (raw === void 0 || raw === null || raw === "") return {};
	const value = typeof raw === "string" ? JSON.parse(raw) : raw;
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("a59 现有内容不是对象，未覆盖，请先核查。");
	return value;
}
function positionBindings(raw, id) {
	const entries = bindingDocument(raw)["inspectorBindings"];
	if (entries === void 0) return [];
	if (!Array.isArray(entries)) throw new Error(`注释 #${id} 的元素绑定格式异常。`);
	return entries.map((value) => {
		if (!value || typeof value !== "object") throw new Error(`注释 #${id} 的元素绑定格式异常。`);
		const b = value;
		if (typeof b.key !== "string" || !b.key || b.id !== id || !["page", "element"].includes(b.scope) || typeof b.page !== "string" || typeof b.label !== "string") throw new Error(`注释 #${id} 的元素绑定格式异常。`);
		return b;
	});
}
function samePosition(a, b) {
	return a === b || (routePattern(a) ?? a) === (routePattern(b) ?? b);
}
function updatePositionBindings(raw, bindings) {
	return JSON.stringify({
		...bindingDocument(raw),
		inspectorBindings: bindings
	});
}
function findPositionBinding(bindings, key) {
	const matches = bindings.filter((b) => samePosition(b.key, key));
	if (new Set(matches.map((b) => b.id)).size > 1) throw new Error("同一元素绑定了不同笔记，请明确重新选择；未自动匹配。");
	return matches.find((b) => b.key === key) ?? matches[0];
}
//#endregion
export { updatePositionBindings as i, positionBindings as n, samePosition as r, findPositionBinding as t };
