import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lazy-retry-gN02cENW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/**
* lazy() that survives a new publish: an open tab still asks for the old hashed chunk,
* which no longer exists. Retry once, then reload the page once to get the new files;
* if that already happened, render nothing instead of blanking the whole app.
*/
function lazyRetry(load, name) {
	return (0, import_react.lazy)(async () => {
		const key = `chunk-reload:${name}`;
		try {
			const m = await load().catch(() => new Promise((r, j) => setTimeout(() => load().then(r, j), 800)));
			sessionStorage.removeItem(key);
			return m;
		} catch (e) {
			if (typeof window !== "undefined" && !sessionStorage.getItem(key)) {
				sessionStorage.setItem(key, "1");
				window.location.reload();
				return new Promise(() => {});
			}
			console.error(`Could not load ${name}`, e);
			return { default: (() => null) };
		}
	});
}
//#endregion
export { lazyRetry as t };
