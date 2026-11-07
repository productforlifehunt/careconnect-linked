import "../_runtime.mjs";
import { a as getWPToken } from "./wp-auth-DL1jfVY7.mjs";
import { a as wordpressFetch, t as createReadCache } from "./wordpress-client-b834cpZh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rel-batch-97Y7fPM-.js
/**
* Relation batching + short-lived read dedupe.
*
* JetEngine exposes a bare `GET jet-rel/<id>` that returns EVERY row of a
* relation, keyed by parent id:
*   { "<parentId>": [{ child_object_id: "18", meta?: {...} }, ...], ... }
*
* Fetching that once is dramatically cheaper than one
* `jet-rel/<id>/children/<parentId>` request per row (the N+1 pattern).
*/
var READ_TTL_MS = 8e3;
var cache = createReadCache();
if (typeof window !== "undefined") window.addEventListener("wp-write", () => cache.clear());
/**
* Deduplicates identical reads happening within a short window (default 8s),
* so sibling widgets mounting on the same screen share one network round-trip.
* Failed reads are never cached.
*/
function dedupeRead(key, fn, ttlMs = READ_TTL_MS) {
	const owner = typeof window === "undefined" ? "" : getWPToken() || "guest";
	return cache.read(`${owner}|${key}`, fn, ttlMs);
}
/**
* Map of parentId → children, plus `loaded`: true when the batch request
* succeeded (including a legitimately empty relation, which JetEngine returns
* as `[]`). Callers must branch on `loaded`, never on `size` — an empty
* relation is a real answer, not a failure, and re-querying row by row in that
* case is exactly the N+1 storm we removed.
*/
var RelChildMap = class extends Map {
	loaded = false;
};
/** One request per relation → RelChildMap. */
function fetchRelChildrenMap(relationId) {
	return dedupeRead(`rel-map:${relationId}`, async () => {
		const map = new RelChildMap();
		try {
			const rows = await wordpressFetch(`jet-rel/${relationId}`);
			if (Array.isArray(rows)) {
				map.loaded = true;
				return map;
			}
			if (!rows || typeof rows !== "object") return map;
			for (const [parent, children] of Object.entries(rows)) {
				if (!Array.isArray(children)) continue;
				const list = [];
				for (const c of children) {
					const childId = String(c?.child_object_id ?? "");
					if (!childId) continue;
					list.push({
						childId,
						meta: c?.meta && typeof c.meta === "object" ? c.meta : null
					});
				}
				if (list.length) map.set(String(parent), list);
			}
			map.loaded = true;
		} catch {}
		return map;
	});
}
/** Children of ONE parent only (`/jet-rel/<rel>/children/<parent>`); never downloads the whole relation. */
function fetchRelChildrenOf(relationId, parentId) {
	return dedupeRead(`rel-of:${relationId}:${parentId}`, async () => {
		const rows = await wordpressFetch(`jet-rel/${relationId}/children/${parentId}`);
		if (!Array.isArray(rows)) throw new Error(`Could not read JetEngine relation ${relationId}`);
		return rows.map((c) => ({
			childId: String(c?.child_object_id ?? ""),
			meta: c?.meta && typeof c.meta === "object" ? c.meta : null
		})).filter((c) => c.childId);
	});
}
//#endregion
export { fetchRelChildrenMap as n, fetchRelChildrenOf as r, dedupeRead as t };
