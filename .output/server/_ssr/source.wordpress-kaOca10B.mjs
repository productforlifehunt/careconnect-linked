import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
import { i as getStoredWPUser } from "./wp-auth-DL1jfVY7.mjs";
import { a as wordpressFetch, i as wordpressCCTFetch } from "./wordpress-client-b834cpZh.mjs";
import { n as R, r as T } from "./wp-schema-Dnlz0TVP.mjs";
import { t as dedupeRead } from "./rel-batch-97Y7fPM-.mjs";
import { t as readLinkedCCTRows } from "./cct-rows-C0yQLswP.mjs";
import { s as fetchMyAppUserName } from "./app-profile-DeZHIfiB.mjs";
import { n as fetchWPUserProfile } from "./wp-users-C2nRIR2f.mjs";
import { r as encodeRel72Meta, t as decodeRel72Meta } from "./rel-meta-Ubi-lVVD.mjs";
import { s as randomJoinCode } from "./join-link-DH4hH7JP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/source.wordpress-kaOca10B.js
var source_wordpress_exports = /* @__PURE__ */ __exportAll({
	createCareGroupWordPress: () => createCareGroupWordPress,
	fetchCareGroupMembersWordPress: () => fetchCareGroupMembersWordPress,
	fetchCareGroupsWordPress: () => fetchCareGroupsWordPress,
	setMyGroupDisplayNameWordPress: () => setMyGroupDisplayNameWordPress
});
var REL_GROUP_MEMBER = R.careGroupMembers;
function normalizeWpObjectId(value) {
	return Number(String(value ?? "").replace(/^wp-/, ""));
}
/**
* Only the care groups the signed-in user actually belongs to.
* Membership is JetEngine Relation 72 (care_group → users); we read the
* relation from the user's side and then load each group record.
*/
async function fetchCareGroupsWordPress() {
	const stored = getStoredWPUser();
	const userId = stored?.user_id ? Number(stored.user_id) : null;
	if (!userId) return [];
	const rels = await dedupeRead(`rel-parents:${REL_GROUP_MEMBER}:${userId}`, () => wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}/parents/${userId}`));
	if (!Array.isArray(rels) || rels.length === 0) return [];
	const myGroupIds = Array.from(new Set(rels.filter((r) => decodeRel72Meta(r?.meta).invitationStatus === "accepted").map((r) => String(r.parent_object_id || "")).filter(Boolean)));
	if (myGroupIds.length === 0) return [];
	return (await readLinkedCCTRows(T.careGroup.slug, myGroupIds)).filter(Boolean).map((g) => ({
		id: String(g.id || g._ID || ""),
		name: g.a55 || "",
		description: g.a56 || null,
		is_private: String(g.a57) === "b56",
		group_type: String(g.a57) === "b56" ? "private" : "public",
		invite_code: null,
		join_code: g.a58 || null,
		is_active: String(g.a59 ?? "") === "b55",
		created_by: g.cct_author_id ? `wp-${g.cct_author_id}` : g.author_id ? `wp-${g.author_id}` : null,
		created_at: g.created_at
	}));
}
async function fetchCareGroupMembersWordPress(groupId) {
	try {
		const normalizedGroupId = normalizeWpObjectId(groupId);
		if (!normalizedGroupId) return [];
		const rels = await dedupeRead(`rel-children:${REL_GROUP_MEMBER}:${normalizedGroupId}`, () => wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}/children/${normalizedGroupId}`));
		if (!Array.isArray(rels) || rels.length === 0) return [];
		const userIds = rels.map((r) => Number(r.child_object_id)).filter(Boolean);
		return (await Promise.all(userIds.map(async (uid) => {
			const rel = rels.find((r) => Number(r.child_object_id) === uid);
			try {
				const u = await fetchWPUserProfile(uid);
				const decoded = decodeRel72Meta(rel?.meta);
				const memberTypes = decoded.memberTypes;
				const memberRoles = decoded.memberRoles;
				const displayName = decoded.displayName || u.full_name || "";
				const invitationStatus = decoded.invitationStatus;
				const isOwner = memberTypes.includes("owner");
				const isAdmin = memberTypes.includes("admin") || isOwner;
				return {
					id: String(uid),
					user_id: `wp-${uid}`,
					group_id: groupId,
					display_name: displayName,
					member_types: memberTypes.length ? memberTypes : ["nothing special"],
					member_roles: memberRoles.length ? memberRoles : ["nothing special"],
					role: isOwner ? "owner" : isAdmin ? "admin" : "nothing special",
					is_admin: isAdmin,
					is_owner: isOwner,
					is_cared_one: memberRoles.includes("cared one"),
					invitation_status: invitationStatus,
					profile: {
						id: `wp-${uid}`,
						full_name: displayName,
						email: u.email || null,
						avatar_url: u.avatar_url || null
					}
				};
			} catch {
				const decoded = decodeRel72Meta(rel?.meta);
				const memberTypes = decoded.memberTypes;
				const memberRoles = decoded.memberRoles;
				const displayName = decoded.displayName || "";
				const isOwner = memberTypes.includes("owner");
				const isAdmin = memberTypes.includes("admin") || isOwner;
				return {
					id: String(uid),
					user_id: `wp-${uid}`,
					group_id: groupId,
					display_name: displayName,
					member_types: memberTypes.length ? memberTypes : ["nothing special"],
					member_roles: memberRoles.length ? memberRoles : ["nothing special"],
					role: isOwner ? "owner" : isAdmin ? "admin" : "nothing special",
					is_admin: isAdmin,
					is_owner: isOwner,
					is_cared_one: memberRoles.includes("cared one"),
					invitation_status: decoded.invitationStatus,
					profile: {
						id: `wp-${uid}`,
						full_name: displayName,
						email: null,
						avatar_url: null
					}
				};
			}
		}))).filter((m) => m && m.invitation_status === "accepted");
	} catch (e) {
		throw e instanceof Error ? e : /* @__PURE__ */ new Error("Could not load group members");
	}
}
async function createCareGroupWordPress(group) {
	const result = await wordpressCCTFetch(T.careGroup.slug, {
		method: "POST",
		body: {
			a55: group.name,
			a56: group.description || "",
			a57: group.is_private ? "b56" : "b55",
			a58: randomJoinCode(),
			a59: "b55"
		}
	});
	const groupId = normalizeWpObjectId(result?.item_id || result?._ID || result?.id);
	const wpUser = getStoredWPUser();
	const userId = wpUser?.user_id ? Number(wpUser.user_id) : null;
	if (groupId && userId) try {
		await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
			method: "POST",
			body: {
				parent_id: groupId,
				child_id: userId,
				context: "child",
				store_items_type: "update",
				meta: encodeRel72Meta({
					displayName: group.displayName?.trim() || await fetchMyAppUserName(),
					memberTypes: ["owner"],
					memberRoles: ["nothing special"],
					invitationStatus: "accepted"
				})
			}
		});
	} catch (e) {
		console.warn("Failed to auto-add creator as member:", e);
	}
	return result;
}
/**
* Rel 223 a55 — the member's display name INSIDE this care group.
* Every group-internal surface shows this name (dictionary requirement),
* so members must be able to set it for themselves.
*/
async function setMyGroupDisplayNameWordPress(groupId, displayName) {
	const gid = normalizeWpObjectId(groupId);
	const stored = getStoredWPUser();
	const uid = stored?.user_id ? Number(stored.user_id) : 0;
	if (!gid || !uid) return;
	const rels = await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}/children/${gid}`);
	const decoded = decodeRel72Meta((Array.isArray(rels) ? rels : []).find((r) => Number(r.child_object_id) === uid)?.meta);
	await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
		method: "POST",
		body: {
			parent_id: gid,
			child_id: uid,
			context: "child",
			store_items_type: "update",
			meta: encodeRel72Meta({
				displayName: displayName.trim(),
				memberTypes: decoded.memberTypes,
				memberRoles: decoded.memberRoles,
				invitationStatus: decoded.invitationStatus
			})
		}
	});
}
//#endregion
export { source_wordpress_exports as a, setMyGroupDisplayNameWordPress as i, fetchCareGroupMembersWordPress as n, fetchCareGroupsWordPress as r, createCareGroupWordPress as t };
