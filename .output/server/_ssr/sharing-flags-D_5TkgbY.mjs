import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
import { a as wordpressFetch, i as wordpressCCTFetch } from "./wordpress-client-b834cpZh.mjs";
import { n as R, r as T } from "./wp-schema-Dnlz0TVP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sharing-flags-D_5TkgbY.js
/**
* Location-sharing switches on CCT 258 (user's extended profile 2), joined to
* the user through JetEngine Relation 259 (one to one).
*   a56 LOCATION_SHARE_IS_ON            b55 yes / b56 no
*   a55 ALLOW_EMERGENCY_LOCATION_REQUEST b55 yes / b56 no
*/
var sharing_flags_exports = /* @__PURE__ */ __exportAll({
	fetchLocationSharingFlags: () => fetchLocationSharingFlags,
	setLocationSharingFlags: () => setLocationSharingFlags
});
var P2 = T.userProfile2;
var F = P2.f;
var O = P2.opt;
var REL = R.userProfile2Rel;
var bare = (id) => Number(String(id).replace(/^wp-/, ""));
async function profileRowId(userId) {
	const rels = await wordpressFetch(`jet-rel/${REL}/children/${userId}`);
	if (!Array.isArray(rels)) throw new Error(`Relation ${REL} returned an invalid response`);
	const id = rels[0]?.child_object_id;
	return id ? String(id) : null;
}
async function fetchLocationSharingFlags(userId) {
	const uid = bare(userId);
	if (!uid) throw new Error("Invalid user");
	const id = await profileRowId(uid);
	if (!id) return {
		shareOn: false,
		emergencyAllowed: false
	};
	const row = await wordpressCCTFetch(P2.slug, { id });
	return {
		shareOn: row?.[F.LOCATION_SHARE_IS_ON] === O.LOCATION_SHARE_IS_ON.YES,
		emergencyAllowed: row?.[F.ALLOW_EMERGENCY_LOCATION_REQUEST] === O.ALLOW_EMERGENCY_LOCATION_REQUEST.YES
	};
}
async function setLocationSharingFlags(userId, patch) {
	const uid = bare(userId);
	if (!uid) throw new Error("Invalid user");
	const body = {};
	if (patch.shareOn !== void 0) body[F.LOCATION_SHARE_IS_ON] = patch.shareOn ? O.LOCATION_SHARE_IS_ON.YES : O.LOCATION_SHARE_IS_ON.NO;
	if (patch.emergencyAllowed !== void 0) body[F.ALLOW_EMERGENCY_LOCATION_REQUEST] = patch.emergencyAllowed ? O.ALLOW_EMERGENCY_LOCATION_REQUEST.YES : O.ALLOW_EMERGENCY_LOCATION_REQUEST.NO;
	if (!Object.keys(body).length) return;
	const id = await profileRowId(uid);
	if (id) {
		await wordpressCCTFetch(P2.slug, {
			id,
			method: "PUT",
			body
		});
		return;
	}
	const created = await wordpressCCTFetch(P2.slug, {
		method: "POST",
		body
	});
	const newId = created?.item_id || created?._ID || created?.id;
	if (!newId) throw new Error("Profile row was created without an item ID");
	await wordpressFetch(`jet-rel/${REL}`, {
		method: "POST",
		body: {
			parent_id: String(uid),
			child_id: String(newId),
			context: "child_object",
			store_items_type: "replace"
		}
	});
}
//#endregion
export { setLocationSharingFlags as n, sharing_flags_exports as r, fetchLocationSharingFlags as t };
