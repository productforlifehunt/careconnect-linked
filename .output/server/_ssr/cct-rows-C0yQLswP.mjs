import "../_runtime.mjs";
import { i as wordpressCCTFetch } from "./wordpress-client-b834cpZh.mjs";
import { t as dedupeRead } from "./rel-batch-97Y7fPM-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cct-rows-C0yQLswP.js
/** JetEngine-native IN filter, verified in the CCT151 GUI and live read-only requests. */
function linkedRowParams(ids) {
	return {
		_limit: ids.length,
		_filters: JSON.stringify([{
			field: "_ID",
			operator: "IN",
			value: ids,
			type: "integer"
		}])
	};
}
/** Call only AFTER resolving the caller's existing JetEngine relation IDs. */
async function readLinkedCCTRows(slug, ids) {
	const clean = [...new Set(ids.filter((id) => /^\d+$/.test(id)))].sort((a, b) => Number(a) - Number(b));
	if (!clean.length) return [];
	if (clean.length === 1) return dedupeRead(`linked-cct-single:${slug}:${clean[0]}`, async () => {
		const row = await wordpressCCTFetch(slug, { id: clean[0] });
		if (!row || String(row.id ?? row._ID) !== clean[0]) throw new Error("CCT item read returned an unrelated row.");
		return [row];
	});
	return dedupeRead(`linked-cct:${slug}:${clean.join(",")}`, async () => {
		const batches = [];
		for (let offset = 0; offset < clean.length; offset += 100) batches.push(clean.slice(offset, offset + 100));
		return (await Promise.all(batches.map(async (batch) => {
			const rows = await wordpressCCTFetch(slug, { params: linkedRowParams(batch) });
			if (!Array.isArray(rows)) throw new Error("CCT batch read returned an invalid response.");
			const allowed = new Set(batch);
			if (rows.some((row) => !allowed.has(String(row?.id ?? row?._ID)))) throw new Error("CCT filter returned unrelated rows; batch read rejected.");
			return rows;
		}))).flat();
	});
}
//#endregion
export { readLinkedCCTRows as t };
