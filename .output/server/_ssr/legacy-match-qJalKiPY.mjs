import "../_runtime.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/legacy-match-qJalKiPY.js
/** Old line-only positions need corroborating visible text: a line number alone can move. */
function matchingLegacyLabel(saved, current) {
	const normal = (label) => {
		const [value, ...context] = label.replace(/^<[^>]+>\s*/, "").split(" · ");
		const descriptiveValue = (value || "").replace(/^\s*[\d.,—-]+\s*/u, "");
		const genericContext = /* @__PURE__ */ new Set([
			"card",
			"cardcontent",
			"div",
			"span",
			"button",
			"p"
		]);
		const normalizedContext = context.join(" ").toLocaleLowerCase().replace(/[\d\s\p{P}\p{S}]+/gu, "");
		if (!descriptiveValue.trim() && genericContext.has(normalizedContext)) return "";
		return [descriptiveValue, ...context].filter(Boolean).join(" ").toLocaleLowerCase().replace(/[\d\s\p{P}\p{S}]+/gu, "");
	};
	const a = normal(saved);
	const b = normal(current);
	return a.length >= 2 && a === b;
}
//#endregion
export { matchingLegacyLabel };
