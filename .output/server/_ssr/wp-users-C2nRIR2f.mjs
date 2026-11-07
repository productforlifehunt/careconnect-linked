import "../_runtime.mjs";
import { a as wordpressFetch } from "./wordpress-client-b834cpZh.mjs";
import { n as R, r as T } from "./wp-schema-Dnlz0TVP.mjs";
import { n as fetchRelChildrenMap, t as dedupeRead } from "./rel-batch-97Y7fPM-.mjs";
import { t as readLinkedCCTRows } from "./cct-rows-C0yQLswP.mjs";
import { r as currentAppId, t as APP_PROFILE_F } from "./app-profile-DeZHIfiB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wp-users-C2nRIR2f.js
function toRecord(u) {
	return {
		id: Number(u.id),
		name: u.name || u.slug || "",
		slug: u.slug || "",
		email: u.email || null,
		first_name: u.first_name || null,
		last_name: u.last_name || null,
		roles: Array.isArray(u.roles) ? u.roles : [],
		avatar_url: u.avatar_urls?.["96"] || u.avatar || null
	};
}
/**
* Process-level record cache.
*
* A screen that renders N people used to cost N separate admin-ops calls,
* because each single-id read had its own dedupe key. Records resolved by any
* batch are reused, so one batched request covers the whole screen.
*/
var userRecordCache = /* @__PURE__ */ new Map();
var userCacheGeneration = 0;
if (typeof window !== "undefined") window.addEventListener("wp-write", () => {
	userRecordCache.clear();
	userCacheGeneration++;
});
/**
* Micro-batching queue — reads people straight from WordPress.
*
* `wp/v2/users?include=` answers for ANY user id (subscribers included) over a
* plain authenticated HTTPS request, so there is no edge function in this path
* at all. Every id requested inside the same ~25ms window is collapsed into ONE
* request, so a screen with N people costs one round-trip, not N.
*/
var pendingIds = /* @__PURE__ */ new Set();
var pendingBatch = null;
function enqueueUserIds(ids) {
	ids.forEach((id) => pendingIds.add(id));
	if (!pendingBatch) pendingBatch = new Promise((resolve, reject) => {
		setTimeout(async () => {
			const batch = Array.from(pendingIds);
			const generation = userCacheGeneration;
			pendingIds = /* @__PURE__ */ new Set();
			pendingBatch = null;
			try {
				const rows = await wordpressFetch("wp/v2/users", { params: {
					include: batch.join(","),
					per_page: Math.max(batch.length, 10)
				} });
				if (!Array.isArray(rows)) throw new Error("Could not read WordPress users");
				if (generation !== userCacheGeneration) throw new Error("Account or user data changed; retry the read.");
				for (const u of rows) {
					const rec = toRecord(u);
					userRecordCache.set(rec.id, rec);
				}
				resolve();
			} catch (err) {
				reject(err);
			}
		}, 25);
	});
	return pendingBatch;
}
/**
* Reads real WordPress users by ID.
*
* App users are WP subscribers and cannot read other users over the REST API,
* so the read is performed through the `wp-admin-ops` edge function (admin
* credentials stay server-side). There is NO degraded/public fallback: either
* the real record comes back, or the caller sees the failure.
*/
async function fetchWPUsers(ids) {
	const clean = Array.from(new Set(ids.map((v) => Number(String(v ?? "").replace(/^wp-/, ""))).filter((n) => Number.isFinite(n) && n > 0)));
	const out = /* @__PURE__ */ new Map();
	if (clean.length === 0) return out;
	const missing = [];
	for (const id of clean) {
		const cached = userRecordCache.get(id);
		if (cached) out.set(id, cached);
		else missing.push(id);
	}
	if (missing.length === 0) return out;
	await enqueueUserIds(missing);
	for (const id of missing) {
		const rec = userRecordCache.get(id);
		if (rec) out.set(id, rec);
	}
	return out;
}
async function fetchWPUser(id) {
	const numeric = Number(String(id ?? "").replace(/^wp-/, ""));
	const rec = (await fetchWPUsers([numeric])).get(numeric);
	if (!rec) throw new Error(`WordPress user ${numeric} not found`);
	return rec;
}
/**
* Rows of a CCT by ID, gathered for one tick and read with one JetEngine IN filter.
* A screen with N people costs one small request for exactly their rows — never the whole table.
*/
var pendingRows = /* @__PURE__ */ new Map();
function fetchCCTRowsBatched(cctSlug, id) {
	let batch = pendingRows.get(cctSlug);
	if (!batch) {
		const ids = /* @__PURE__ */ new Set();
		batch = {
			ids,
			wait: new Promise((resolve, reject) => setTimeout(() => {
				pendingRows.delete(cctSlug);
				readLinkedCCTRows(cctSlug, [...ids]).then((rows) => resolve(new Map(rows.map((r) => [String(r?.id ?? r?._ID), r])))).catch(reject);
			}, 0))
		};
		pendingRows.set(cctSlug, batch);
	}
	batch.ids.add(id);
	return batch.wait.then((m) => m.get(id) ?? null);
}
/**
* One-to-one child CCT row of a user (Relation 152 / 259).
*
* Reads the relation through the batched whole-relation map and resolves the
* row from a single whole-CCT read, so a screen with N people costs ~2
* requests total instead of 2N+ sequential round-trips.
*/
async function fetchOneToOneChild(relationId, userId, cctSlug) {
	let childId = null;
	const map = await fetchRelChildrenMap(relationId);
	if (map.loaded) childId = map.get(String(userId))?.[0]?.childId ?? null;
	else {
		const rels = await dedupeRead(`rel-children:${relationId}:${userId}`, () => wordpressFetch(`jet-rel/${relationId}/children/${userId}`));
		if (!Array.isArray(rels)) throw new Error(`Relation ${relationId} returned an invalid response`);
		childId = rels[0]?.child_object_id ?? null;
	}
	if (!childId) return null;
	return fetchCCTRowsBatched(cctSlug, String(childId));
}
/**
* A user's CCT 151 row FOR THIS APP (column a01), joined through Relation 152.
* Every app keeps its own row, so the child list is filtered by app id instead
* of taking the first child.
*/
async function fetchAppProfileChild(userId) {
	const app = currentAppId();
	const slug = T.userProfile.slug;
	let childIds = [];
	const map = await fetchRelChildrenMap(R.userProfileRel);
	if (map.loaded) childIds = (map.get(String(userId)) ?? []).map((c) => String(c.childId));
	else {
		const rels = await dedupeRead(`rel-children:${R.userProfileRel}:${userId}`, () => wordpressFetch(`jet-rel/${R.userProfileRel}/children/${userId}`));
		if (!Array.isArray(rels)) throw new Error(`Relation ${R.userProfileRel} returned an invalid response`);
		childIds = rels.map((r) => String(r?.child_object_id ?? "")).filter(Boolean);
	}
	if (childIds.length === 0) return null;
	const present = (await Promise.all(childIds.map((id) => fetchCCTRowsBatched(slug, id).catch(() => null)))).filter(Boolean);
	return present.find((r) => String(r?.[APP_PROFILE_F.APP] ?? "").toLowerCase() === app) ?? present.find((r) => !String(r?.[APP_PROFILE_F.APP] ?? "").trim()) ?? null;
}
/**
* Forum display names for this app only (CCT 151 a56, Relation 152).
* Falls back to the app name (a55) when the person never picked a forum name.
*/
async function fetchForumNames(ids) {
	const numeric = Array.from(new Set(ids.map((id) => Number(String(id ?? "").replace(/^wp-/, ""))).filter((n) => Number.isFinite(n) && n > 0)));
	const out = /* @__PURE__ */ new Map();
	await Promise.all(numeric.map(async (id) => {
		const row = await fetchAppProfileChild(id).catch(() => null);
		const name = String(row?.[APP_PROFILE_F.COMMUNITY_NAME] ?? "").trim() || String(row?.[APP_PROFILE_F.NAME] ?? "").trim();
		if (name) out.set(id, name);
	}));
	return out;
}
/**
* Full user identity per the data model: the WP user record plus its two
* extended-profile CCT rows, joined through JetEngine relations 152 and 259.
*/
async function fetchWPUserProfile(id) {
	const numeric = Number(String(id ?? "").replace(/^wp-/, ""));
	const [user, profile, profile2] = await Promise.all([
		fetchWPUser(numeric),
		fetchAppProfileChild(numeric),
		fetchOneToOneChild(R.userProfile2Rel, numeric, T.userProfile2.slug)
	]);
	const profileName = profile?.[APP_PROFILE_F.NAME];
	const raw = profile2?.[T.userProfile2.f.CARED_ONE_S_CONDITION_TYPE];
	const condition_types = Array.isArray(raw) ? raw.map(String) : typeof raw === "string" && raw.trim() ? (() => {
		try {
			const parsed = JSON.parse(raw);
			return Array.isArray(parsed) ? parsed.map(String) : raw.split(",").map((s) => s.trim());
		} catch {
			return raw.split(",").map((s) => s.trim()).filter(Boolean);
		}
	})() : [];
	return {
		...user,
		profile,
		profile2,
		full_name: typeof profileName === "string" ? profileName.trim() : "",
		condition_types
	};
}
/**
* Guest-safe identity read for public marketplace browsing.
*
* The admin-ops route needs a logged-in WP session, so anonymous visitors
* cannot use it. Public discovery only needs the display name (CCT 151 app
* column, joined via relation 152) plus the public user record (slug/avatar).
*/
async function fetchWPUserPublicProfile(id) {
	const numeric = Number(String(id ?? "").replace(/^wp-/, ""));
	if (!Number.isFinite(numeric) || numeric <= 0) throw new Error(`Invalid WordPress user id: ${id}`);
	const [users, profile] = await Promise.all([fetchWPUsers([numeric]).catch(() => /* @__PURE__ */ new Map()), fetchAppProfileChild(numeric)]);
	const user = users.get(numeric);
	const profileName = profile?.[APP_PROFILE_F.NAME];
	const displayName = typeof profileName === "string" ? profileName.trim() : "";
	return {
		id: numeric,
		slug: user?.slug || "",
		avatar_url: user?.avatar_url || null,
		full_name: displayName || (user?.name || "").trim() || user?.slug || ""
	};
}
//#endregion
export { fetchWPUserProfile as n, fetchWPUserPublicProfile as r, fetchForumNames as t };
