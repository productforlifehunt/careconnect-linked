import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { t as instance } from "../_libs/i18next.mjs";
import { t as CARE_SERVICE_TYPES } from "./source.wordpress-CI9kg3_M.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-service-types-BfA6EtiC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/**
* Unified Service Type hook — single source of truth is the data dictionary
* (CCT 258 a68 "Care provider offers care service type").
*
* Browsing / filtering / badges MUST NOT touch WooCommerce: per the dictionary,
* WooCommerce only enters the picture at "add to cart". This hook therefore
* serves the fixed Bible catalogue synchronously — no network call, no
* pa_service-type taxonomy, no duplicate-term cleanup needed.
*/
/**
* Hook: returns all care service types from the dictionary.
* Use `serviceTypes` for dropdowns, `serviceTypeMap` for slug→name lookups.
*/
function useServiceTypes() {
	const zh = instance.language?.startsWith("zh");
	return (0, import_react.useMemo)(() => {
		const serviceTypes = CARE_SERVICE_TYPES.map((s) => ({
			id: s.id,
			name: zh ? s.zh : s.en,
			slug: s.slug,
			delivery: s.delivery
		}));
		const serviceTypeMap = /* @__PURE__ */ new Map();
		const serviceTypeBySlug = /* @__PURE__ */ new Map();
		serviceTypes.forEach((t) => {
			serviceTypeMap.set(t.slug, t.name);
			serviceTypeMap.set(t.name, t.name);
			serviceTypeMap.set(t.id, t.name);
			serviceTypeBySlug.set(t.slug, t);
		});
		return {
			serviceTypes,
			serviceTypeNames: serviceTypes.map((t) => t.name),
			serviceTypeMap,
			serviceTypeBySlug,
			isLoading: false,
			error: null
		};
	}, [zh]);
}
//#endregion
export { useServiceTypes as t };
