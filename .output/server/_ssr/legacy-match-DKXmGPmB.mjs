import "../_runtime.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/legacy-match-DKXmGPmB.js
/** Old line-only positions need corroborating visible text: a line number alone can move. */
function matchingLegacyLabel(saved, current) {
	const normal = (label) => {
		const [value, ...context] = label.replace(/^<[^>]+>\s*/, "").split(" · ");
		return [(value || "").replace(/^\s*[\d.,—-]+\s*/u, ""), ...context].filter(Boolean).join(" ").toLocaleLowerCase().replace(/[\d\s\p{P}\p{S}]+/gu, "");
	};
	const a = normal(saved);
	const b = normal(current);
	return a.length >= 2 && a === b;
}
//#endregion
export { matchingLegacyLabel };
