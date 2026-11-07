import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
import { i as getStoredWPUser } from "./wp-auth-DL1jfVY7.mjs";
import { a as wordpressFetch } from "./wordpress-client-b834cpZh.mjs";
import { n as R } from "./wp-schema-Dnlz0TVP.mjs";
import { n as fetchWPUserProfile } from "./wp-users-C2nRIR2f.mjs";
import { t as decodeRel219Status } from "./rel219-meta-CiKakwJu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/source.wordpress-Dw6aJMyP.js
var source_wordpress_exports = /* @__PURE__ */ __exportAll({ fetchUserCaredOnesWordPress: () => fetchUserCaredOnesWordPress });
var REL_USER_CARED_ONE = R.userCaredOnes;
/**
* Cared ones via JetEngine Relation 219 (Users -> Users, Many to Many).
* Each cared one is a real WordPress user; its identity comes from the user
* record plus CCT 151 / 258 joined through Relations 152 / 259. No fallbacks,
* no placeholders — a failed read surfaces as a failed read.
*/
async function fetchUserCaredOnesWordPress() {
	const storedUser = getStoredWPUser();
	if (!storedUser?.user_id) return [];
	const rels = await wordpressFetch(`jet-rel/${REL_USER_CARED_ONE}/children/${storedUser.user_id}`);
	if (!Array.isArray(rels) || rels.length === 0) return [];
	const selfId = String(storedUser.user_id).replace(/^wp-/, "");
	const rows = rels.filter((r) => decodeRel219Status(r?.meta) !== "declined").map((r) => ({
		id: String(r.child_object_id ?? ""),
		status: decodeRel219Status(r?.meta)
	})).filter((r) => r.id && r.id.replace(/^wp-/, "") !== selfId);
	return await Promise.all(rows.map(async (row) => {
		const u = await fetchWPUserProfile(row.id);
		return {
			user_id: `wp-${u.id}`,
			relationship: null,
			invitation_status: row.status,
			cared_one: {
				id: `wp-${u.id}`,
				full_name: u.full_name,
				first_name: u.full_name ? u.full_name.split(" ")[0] : null,
				email: u.email,
				avatar_url: u.avatar_url,
				condition_types: u.condition_types
			}
		};
	}));
}
//#endregion
export { source_wordpress_exports as n, fetchUserCaredOnesWordPress as t };
