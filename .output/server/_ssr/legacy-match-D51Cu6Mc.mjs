import "../_runtime.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/legacy-match-D51Cu6Mc.js
/** Old line-only positions need corroborating visible text: a line number alone can move. */
function matchingLegacyLabel(saved, current) {
	const normal = (label) => label.replace(/^<[^>]+>\s*/, "").split(" · ")[0].toLocaleLowerCase().replace(/[\d\s\p{P}\p{S}]+/gu, "");
	const a = normal(saved);
	const b = normal(current);
	return a.length >= 2 && a === b;
}
//#endregion
export { matchingLegacyLabel };
