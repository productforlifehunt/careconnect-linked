import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
import { i as getStoredWPUser } from "./wp-auth-DL1jfVY7.mjs";
import { a as wordpressFetch, i as wordpressCCTFetch } from "./wordpress-client-b834cpZh.mjs";
import { n as R, r as T } from "./wp-schema-Dnlz0TVP.mjs";
import { t as readLinkedCCTRows } from "./cct-rows-C0yQLswP.mjs";
import { s as fetchMyAppUserName } from "./app-profile-DeZHIfiB.mjs";
import { r as fetchWPUserPublicProfile } from "./wp-users-C2nRIR2f.mjs";
import { i as encodeRel75Meta, n as decodeRel75Meta, r as encodeRel72Meta, t as decodeRel72Meta } from "./rel-meta-Ubi-lVVD.mjs";
import { w as fetchWPUserSafe } from "./source.wordpress-extended-FYtgdTd3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/source.wordpress-extended-GzmnoRoT.js
var source_wordpress_extended_exports = /* @__PURE__ */ __exportAll({
	acceptInvitationWordPress: () => acceptInvitationWordPress,
	addCaredOneToGroupWordPress: () => addCaredOneToGroupWordPress,
	addMemberToSubgroupWordPress: () => addMemberToSubgroupWordPress,
	addSubgroupOwnerWordPress: () => addSubgroupOwnerWordPress,
	answerJoinRequestWordPress: () => answerJoinRequestWordPress,
	cancelInvitationWordPress: () => cancelInvitationWordPress,
	createCareGroupGalleryItemWordPress: () => createCareGroupGalleryItemWordPress,
	createGroupInviteWordPress: () => createGroupInviteWordPress,
	createGroupPostWordPress: () => createGroupPostWordPress,
	createMemberCategoryWordPress: () => createMemberCategoryWordPress,
	declineInvitationWordPress: () => declineInvitationWordPress,
	deleteCareGroupGalleryItemWordPress: () => deleteCareGroupGalleryItemWordPress,
	deleteCareGroupWordPress: () => deleteCareGroupWordPress,
	deleteGroupInviteWordPress: () => deleteGroupInviteWordPress,
	deleteGroupPostWordPress: () => deleteGroupPostWordPress,
	deleteMemberCategoryWordPress: () => deleteMemberCategoryWordPress,
	fetchCareGroupGalleryWordPress: () => fetchCareGroupGalleryWordPress,
	fetchCareGroupPostsWordPress: () => fetchCareGroupPostsWordPress,
	fetchGroupInvitationsWordPress: () => fetchGroupInvitationsWordPress,
	fetchGroupInvitesWordPress: () => fetchGroupInvitesWordPress,
	fetchGroupLinkStateWordPress: () => fetchGroupLinkStateWordPress,
	fetchJoinRequesterWordPress: () => fetchJoinRequesterWordPress,
	fetchMemberCategoriesWordPress: () => fetchMemberCategoriesWordPress,
	fetchMyPendingInvitationsWordPress: () => fetchMyPendingInvitationsWordPress,
	fetchSubgroupMemberRecordsWordPress: () => fetchSubgroupMemberRecordsWordPress,
	fetchSubgroupMembersWordPress: () => fetchSubgroupMembersWordPress,
	inviteToGroupWordPress: () => inviteToGroupWordPress,
	joinGroupByAnyCodeWordPress: () => joinGroupByAnyCodeWordPress,
	joinGroupByCodeWordPress: () => joinGroupByCodeWordPress,
	joinGroupByJoinCodeWordPress: () => joinGroupByJoinCodeWordPress,
	leaveGroupWordPress: () => leaveGroupWordPress,
	previewGroupInviteWordPress: () => previewGroupInviteWordPress,
	removeGroupMemberWordPress: () => removeGroupMemberWordPress,
	removeMemberFromSubgroupWordPress: () => removeMemberFromSubgroupWordPress,
	requestToJoinGroupWordPress: () => requestToJoinGroupWordPress,
	searchProfilesWordPress: () => searchProfilesWordPress,
	updateCareGroupWordPress: () => updateCareGroupWordPress,
	updateGroupInviteWordPress: () => updateGroupInviteWordPress,
	updateGroupPostWordPress: () => updateGroupPostWordPress,
	updateMemberCategoryWordPress: () => updateMemberCategoryWordPress,
	updateMemberRoleWordPress: () => updateMemberRoleWordPress,
	updateSubgroupMemberRoleWordPress: () => updateSubgroupMemberRoleWordPress,
	uploadToWPMedia: () => uploadToWPMedia
});
var REL_GROUP_MEMBER = R.careGroupMembers;
var REL_GROUP_GALLERY = R.careGroupGalleries;
var REL_GROUP_SUBGROUP = R.careGroupPrivateMemberGroups;
var REL_GROUP_POST = R.careGroupPosts;
var REL_SUBGROUP_MEMBERS = R.privateMemberGroupMembers;
var REL_GROUP_INVITE = R.careGroupInvites;
var F_POST = T.careGroupPost.f;
var F_INVITE = T.careGroupInvite.f;
var O_INVITE = T.careGroupInvite.opt;
var F_GALLERY = T.careGroupGallery.f;
var F_SUBGROUP = T.careGroupPrivateMemberGroup.f;
var F_GROUP = T.careGroup.f;
var O_GROUP = T.careGroup.opt;
var YES = "b55";
var NO = "b56";
var POST_TYPE_CODE = {
	discussion: "b55",
	announcement: "b56",
	wish: "b57"
};
var POST_TYPE_LABEL = {
	b55: "discussion",
	b56: "announcement",
	b57: "wish"
};
function isYesCode(v) {
	if (v === true) return true;
	if (typeof v === "string") {
		const s = v.toLowerCase();
		return s === "b55" || s === "yes" || s === "1" || s === "true";
	}
	return false;
}
/** REL 72 meta — opaque-code only (dictionary). */
var memberMeta = encodeRel72Meta;
function normalizeWpObjectId(value) {
	return Number(String(value ?? "").replace(/^wp-/, ""));
}
async function fetchRelatedCctItems(relationId, parentId, cctSlug) {
	const normalizedParentId = normalizeWpObjectId(parentId);
	if (!normalizedParentId) return [];
	const rels = await wordpressFetch(`jet-rel/${relationId}/children/${normalizedParentId}`);
	if (!Array.isArray(rels) || rels.length === 0) return [];
	return (await readLinkedCCTRows(cctSlug, rels.map((r) => String(r.child_object_id || "")).filter(Boolean))).filter(Boolean);
}
async function fetchCareGroupPostsWordPress(groupId, type) {
	try {
		const posts = await fetchRelatedCctItems(REL_GROUP_POST, groupId, "care_group_post");
		if (!Array.isArray(posts)) return [];
		const normalizeType = (raw) => {
			const v = Array.isArray(raw) ? raw[0] || "" : raw || "";
			return POST_TYPE_LABEL[String(v)] || String(v) || "discussion";
		};
		const myId = getStoredWPUser()?.user_id ? Number(getStoredWPUser().user_id) : 0;
		const notYetDue = (p) => {
			const raw = p[F_POST.SCHEDULED_AT];
			if (!raw) return false;
			const due = Date.parse(String(raw).replace(" ", "T"));
			if (!Number.isFinite(due)) return false;
			return due > Date.now();
		};
		return posts.filter((p) => !type || normalizeType(p[F_POST.TYPE]) === type).filter((p) => !notYetDue(p) || Number(p.cct_author_id || p.author_id) === myId).sort((a, b) => {
			const ta = Date.parse(a.created_at || "") || 0;
			const tb = Date.parse(b.created_at || "") || 0;
			if (tb !== ta) return tb - ta;
			return Number(b.id || b._ID || 0) - Number(a.id || a._ID || 0);
		}).map((p) => ({
			id: p.id,
			group_id: groupId,
			author_id: p.author_id || null,
			type: normalizeType(p[F_POST.TYPE]),
			title: p[F_POST.TITLE] || null,
			content: p[F_POST.CONTENT] || null,
			is_pinned: isYesCode(p[F_POST.IS_PINNED]),
			scheduled_at: p[F_POST.SCHEDULED_AT] || null,
			is_scheduled: notYetDue(p),
			created_at: p.created_at,
			updated_at: p.updated_at || p.created_at,
			author: p.author_id ? {
				id: p.author_id,
				full_name: null,
				avatar_url: null
			} : null
		}));
	} catch (e) {
		throw e instanceof Error ? e : new Error(String(e));
	}
}
async function createGroupPostWordPress(post) {
	const created = await wordpressCCTFetch(T.careGroupPost.slug, {
		method: "POST",
		body: {
			[F_POST.TITLE]: post.title || post.content.substring(0, 50),
			[F_POST.CONTENT]: post.content,
			[F_POST.TYPE]: POST_TYPE_CODE[post.type || "discussion"] || "b55",
			[F_POST.IS_PINNED]: NO,
			[F_POST.SCHEDULED_AT]: post.scheduled_at || ""
		}
	});
	const groupId = normalizeWpObjectId(post.group_id);
	const postId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
	if (groupId && postId) await wordpressFetch(`jet-rel/${REL_GROUP_POST}`, {
		method: "POST",
		body: {
			parent_id: groupId,
			child_id: postId,
			context: "child",
			store_items_type: "update"
		}
	});
	if (groupId && postId) try {
		const rels = await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}/children/${groupId}`);
		const memberIds = Array.isArray(rels) ? rels.map((r) => r.child_object_id).filter(Boolean) : [];
		const { notifyGroupPost } = await import("../_libs/_12.mjs").then((n) => n.n);
		await notifyGroupPost(memberIds, String(groupId), post.title || post.content.substring(0, 50), (post.type || "discussion") === "announcement");
	} catch {}
	return postId ? String(postId) : null;
}
async function updateGroupPostWordPress(id, updates) {
	const body = {};
	if (updates.content !== void 0) body[F_POST.CONTENT] = updates.content;
	if (updates.title !== void 0) body[F_POST.TITLE] = updates.title;
	if (updates.is_pinned !== void 0) body[F_POST.IS_PINNED] = updates.is_pinned ? YES : NO;
	if (updates.type !== void 0) body[F_POST.TYPE] = POST_TYPE_CODE[updates.type] || updates.type;
	if (updates.scheduled_at !== void 0) body[F_POST.SCHEDULED_AT] = updates.scheduled_at || "";
	await wordpressCCTFetch(T.careGroupPost.slug, {
		id,
		method: "PUT",
		body
	});
}
async function deleteGroupPostWordPress(id) {
	await wordpressCCTFetch(T.careGroupPost.slug, {
		id,
		method: "DELETE"
	});
}
async function updateCareGroupWordPress(id, updates) {
	const body = {};
	if (updates.name !== void 0) body[F_GROUP.NAME] = updates.name;
	if (updates.description !== void 0) body[F_GROUP.DESCRIPTION] = updates.description;
	if (updates.is_private !== void 0) body[F_GROUP.GROUP_TYPE] = updates.is_private ? O_GROUP.GROUP_TYPE.PRIVATE : O_GROUP.GROUP_TYPE.PUBLIC;
	if (updates.join_code !== void 0) body[F_GROUP.JOIN_CODE] = updates.join_code;
	if (updates.is_active !== void 0) body[F_GROUP.STATUS] = updates.is_active ? O_GROUP.STATUS.ACTIVE : O_GROUP.STATUS.NO;
	await wordpressCCTFetch(T.careGroup.slug, {
		id,
		method: "PUT",
		body
	});
}
async function deleteCareGroupWordPress(id) {
	await wordpressCCTFetch(T.careGroup.slug, {
		id,
		method: "DELETE"
	});
}
/** Group display name (best-effort, only used for notification copy). */
async function groupNameOf(groupId) {
	try {
		const g = await wordpressCCTFetch(T.careGroup.slug, { id: String(groupId) });
		return g?.[T.careGroup.f.NAME] || g?.name || "your care group";
	} catch {
		return "your care group";
	}
}
/** Owner/admin user ids of a group, from Rel 72 meta (notification routing). */
async function groupAdminIds(groupId) {
	try {
		const rels = await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}/children/${groupId}`);
		return (Array.isArray(rels) ? rels : []).filter((r) => {
			const m = decodeRel72Meta(r?.meta);
			return m.memberTypes.includes("owner") || m.memberTypes.includes("admin");
		}).map((r) => Number(r.child_object_id)).filter((n) => Number.isFinite(n) && n > 0);
	} catch {
		return [];
	}
}
/**
* Every invitation hands out the group's one link (<origin>/group/<id>).
* The system recognises the person, not the link:
*  - an app user gets a pending Rel 223 row carrying the invited role (a56)
*    and sees "accept" when they open the group link;
*  - an outside email address gets the group link, plus the join code written
*    in the email text (never inside the link). They join as a normal member.
*/
async function inviteToGroupWordPress(groupId, userIdOrEmail, invitedAs = "normal group member") {
	const isEmail = userIdOrEmail.includes("@");
	const normalizedGroupId = normalizeWpObjectId(groupId);
	if (!normalizedGroupId) throw new Error("Invalid care group");
	const childId = isEmail ? 0 : normalizeWpObjectId(userIdOrEmail);
	if (!isEmail && !childId) throw new Error("Invalid user");
	const { careGroupLink } = await import("../_libs/_6.mjs").then((n) => n.a);
	const url = careGroupLink(window.location.origin, normalizedGroupId);
	const group = await wordpressCCTFetch(T.careGroup.slug, { id: String(normalizedGroupId) }).catch(() => null);
	const groupName = group?.[F_GROUP.NAME] || "your care group";
	let emailResult = "skipped";
	if (childId) {
		const rels = await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}/children/${normalizedGroupId}`);
		const existing = (Array.isArray(rels) ? rels : []).find((r) => Number(r.child_object_id) === childId);
		if (existing && decodeRel72Meta(existing.meta).invitationStatus === "accepted") throw new Error("This person is already in the group.");
		const memberType = invitedAs === "owner" ? "owner" : invitedAs === "admin" ? "admin" : "nothing special";
		await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
			method: "POST",
			body: {
				parent_id: normalizedGroupId,
				child_id: childId,
				context: "child",
				store_items_type: "update",
				meta: memberMeta({
					memberTypes: [memberType],
					memberRoles: ["nothing special"],
					invitationStatus: "pending"
				})
			}
		});
		try {
			const { notifyGroupInvite } = await import("../_libs/_12.mjs").then((n) => n.n);
			await notifyGroupInvite(childId, groupName, url);
		} catch {}
	} else try {
		const { sendGroupInviteEmail } = await import("./invite-email-_Xv8Sl6N.mjs");
		emailResult = await sendGroupInviteEmail(userIdOrEmail, groupName, url, String(group?.[F_GROUP.JOIN_CODE] || "").trim()) ? "sent" : "failed";
	} catch {
		emailResult = "failed";
	}
	return {
		url,
		email: emailResult
	};
}
async function fetchGroupInvitationsWordPress(groupId) {
	try {
		const normalizedGroupId = normalizeWpObjectId(groupId);
		const rels = await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}/children/${normalizedGroupId}`);
		const pending = (Array.isArray(rels) ? rels : []).filter((r) => decodeRel72Meta(r?.meta).invitationStatus === "pending");
		return Promise.all(pending.map(async (r) => {
			const decoded = decodeRel72Meta(r?.meta);
			let name = decoded.displayName || "";
			if (!name) try {
				name = (await fetchWPUserPublicProfile(Number(r.child_object_id))).full_name || "";
			} catch {}
			return {
				id: `${normalizedGroupId}:${r.child_object_id}`,
				group_id: groupId,
				user_id: `wp-${r.child_object_id}`,
				name,
				role: decoded.memberTypes.includes("owner") ? "owner" : decoded.memberTypes.includes("admin") ? "admin" : "nothing special",
				invitation_status: "pending",
				invited_email: null,
				created_at: null
			};
		}));
	} catch (e) {
		throw e instanceof Error ? e : new Error(String(e));
	}
}
async function cancelInvitationWordPress(invitationId) {
	const [groupPart, userPart] = invitationId.split(":");
	const groupId = normalizeWpObjectId(groupPart);
	const userId = normalizeWpObjectId(userPart);
	if (!groupId || !userId) return;
	await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
		method: "POST",
		body: {
			parent_id: groupId,
			child_id: userId,
			context: "child",
			store_items_type: "disconnect"
		}
	});
}
async function fetchMyPendingInvitationsWordPress() {
	try {
		const wpUser = getStoredWPUser();
		if (!wpUser?.user_id) return [];
		const userId = Number(wpUser.user_id);
		const rels = await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}/parents/${userId}`);
		const pending = (Array.isArray(rels) ? rels : []).filter((r) => decodeRel72Meta(r?.meta).invitationStatus === "pending");
		return await Promise.all(pending.map(async (r) => {
			const groupId = r.parent_object_id ? String(r.parent_object_id) : null;
			let groupName = "Care Group";
			if (groupId) try {
				groupName = (await wordpressCCTFetch(T.careGroup.slug, { id: groupId }))?.name || groupName;
			} catch {}
			return {
				id: `${r.parent_object_id}:${userId}`,
				group_id: groupId,
				user_id: `wp-${userId}`,
				role: "member",
				invitation_status: "pending",
				created_at: null,
				group: groupId ? {
					id: groupId,
					name: groupName
				} : null
			};
		}));
	} catch (e) {
		throw e instanceof Error ? e : new Error(String(e));
	}
}
async function acceptInvitationWordPress(invitationId, displayName) {
	const [groupPart, userPart] = invitationId.split(":");
	const groupId = normalizeWpObjectId(groupPart);
	const userId = normalizeWpObjectId(userPart) || (getStoredWPUser()?.user_id ? Number(getStoredWPUser().user_id) : 0);
	if (!groupId || !userId) return;
	const rels = await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}/children/${groupId}`);
	const row = (Array.isArray(rels) ? rels : []).find((r) => Number(r.child_object_id) === userId);
	const decoded = row ? decodeRel72Meta(row.meta) : null;
	if (!decoded) throw new Error("This invitation is no longer available.");
	if (decoded.invitationStatus === "accepted") return;
	if (decoded.invitationStatus !== "pending") throw new Error("This invitation is no longer available.");
	await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
		method: "POST",
		body: {
			parent_id: groupId,
			child_id: userId,
			context: "child",
			store_items_type: "update",
			meta: memberMeta({
				displayName: displayName?.trim() || decoded.displayName || await fetchMyAppUserName(),
				memberTypes: decoded.memberTypes,
				memberRoles: decoded.memberRoles,
				invitationStatus: "accepted"
			})
		}
	});
	await notifyInviteOutcome(groupId, true);
}
async function declineInvitationWordPress(invitationId) {
	const [groupPart, userPart] = invitationId.split(":");
	const groupId = normalizeWpObjectId(groupPart);
	const userId = normalizeWpObjectId(userPart) || (getStoredWPUser()?.user_id ? Number(getStoredWPUser().user_id) : 0);
	if (!groupId || !userId) return;
	await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
		method: "POST",
		body: {
			parent_id: groupId,
			child_id: userId,
			context: "child",
			store_items_type: "update",
			meta: memberMeta({ invitationStatus: "declined" })
		}
	});
	await notifyInviteOutcome(groupId, false);
}
/** Tell the group's owners/admins how an invitation was answered. Never throws. */
async function notifyInviteOutcome(groupId, accepted) {
	try {
		const [{ notifyInviteResponse }, admins, name] = await Promise.all([
			import("../_libs/_12.mjs").then((n) => n.n),
			groupAdminIds(groupId),
			groupNameOf(groupId)
		]);
		await notifyInviteResponse(admins, String(groupId), name, accepted);
	} catch {}
}
async function updateMemberRoleWordPress(memberId, updates, groupId) {
	const normalizedGroupId = normalizeWpObjectId(groupId);
	const normalizedMemberId = normalizeWpObjectId(memberId);
	if (!normalizedGroupId || !normalizedMemberId) return;
	const rels = await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}/children/${normalizedGroupId}`);
	const decoded = decodeRel72Meta((Array.isArray(rels) ? rels : []).find((r) => Number(r.child_object_id) === normalizedMemberId)?.meta);
	const nextTypes = new Set(decoded.memberTypes.length ? decoded.memberTypes : ["nothing special"]);
	const nextRoles = new Set(decoded.memberRoles.length ? decoded.memberRoles : ["nothing special"]);
	if (typeof updates === "string") {
		nextTypes.clear();
		nextTypes.add(updates);
	} else {
		if (updates?.is_owner !== void 0) updates.is_owner ? nextTypes.add("owner") : nextTypes.delete("owner");
		if (updates?.is_admin !== void 0) updates.is_admin ? nextTypes.add("admin") : nextTypes.delete("admin");
		if (updates?.is_cared_one !== void 0) updates.is_cared_one ? nextRoles.add("cared one") : nextRoles.delete("cared one");
	}
	if ([...nextTypes].some((v) => v !== "nothing special")) nextTypes.delete("nothing special");
	if ([...nextRoles].some((v) => v !== "nothing special")) nextRoles.delete("nothing special");
	await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
		method: "POST",
		body: {
			parent_id: normalizedGroupId,
			child_id: normalizedMemberId,
			context: "child",
			store_items_type: "update",
			meta: memberMeta({
				displayName: decoded.displayName || void 0,
				memberTypes: [...nextTypes],
				memberRoles: [...nextRoles],
				invitationStatus: decoded.invitationStatus
			})
		}
	});
	try {
		const { notifyMemberRoleChanged } = await import("../_libs/_12.mjs").then((n) => n.n);
		const label = [...nextTypes].filter((v) => v !== "nothing special").join(", ") || "member";
		await notifyMemberRoleChanged(normalizedMemberId, String(normalizedGroupId), label);
	} catch {}
}
async function removeGroupMemberWordPress(memberId, groupId) {
	const normalizedGroupId = normalizeWpObjectId(groupId);
	const normalizedMemberId = normalizeWpObjectId(memberId);
	if (normalizedGroupId && normalizedMemberId) {
		const name = await groupNameOf(normalizedGroupId);
		await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
			method: "POST",
			body: {
				parent_id: normalizedGroupId,
				child_id: normalizedMemberId,
				context: "child",
				store_items_type: "disconnect"
			}
		});
		try {
			const { notifyMemberRemoved } = await import("../_libs/_12.mjs").then((n) => n.n);
			await notifyMemberRemoved(normalizedMemberId, name);
		} catch {}
	}
}
function generateInviteToken() {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let out = "";
	for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * 32)];
	return out;
}
var INVITED_AS_CODE = {
	"normal group member": O_INVITE.THE_USER_IS_INVITED_AS.NORMAL_GROUP_MEMBER,
	owner: O_INVITE.THE_USER_IS_INVITED_AS.OWNER,
	admin: O_INVITE.THE_USER_IS_INVITED_AS.ADMIN
};
var INVITED_AS_LABEL = {
	[O_INVITE.THE_USER_IS_INVITED_AS.NORMAL_GROUP_MEMBER]: "normal group member",
	[O_INVITE.THE_USER_IS_INVITED_AS.OWNER]: "owner",
	[O_INVITE.THE_USER_IS_INVITED_AS.ADMIN]: "admin"
};
var SOURCE_CODE = {
	custom: O_INVITE.CUSTOM_OR_APP_NATIVE_GENERATED.CUSTOM,
	"app native generated": O_INVITE.CUSTOM_OR_APP_NATIVE_GENERATED.APP_NATIVE_GENERATED
};
var SOURCE_LABEL = {
	[O_INVITE.CUSTOM_OR_APP_NATIVE_GENERATED.CUSTOM]: "custom",
	[O_INVITE.CUSTOM_OR_APP_NATIVE_GENERATED.APP_NATIVE_GENERATED]: "app native generated"
};
function normalizeInvite(raw, groupId) {
	const id = String(raw.id || raw._ID || "");
	const expiresRaw = raw[F_INVITE.EXPIRES_AT];
	const expires = expiresRaw ? String(expiresRaw) : null;
	const isExpired = expires ? new Date(expires).getTime() < Date.now() : false;
	const maxUses = Number(raw[F_INVITE.MAX_USES] || 0);
	const useCount = Number(raw[F_INVITE.USE_COUNT] || 0);
	const isRevoked = String(raw[F_INVITE.IS_REVOKED] || "") === O_INVITE.IS_REVOKED.YES;
	const isExhausted = maxUses > 0 && useCount >= maxUses;
	return {
		id,
		group_id: groupId || null,
		token: raw[F_INVITE.TOKEN] || "",
		name: raw[F_INVITE.NAME] || "",
		note: raw[F_INVITE.NOTE] || "",
		invited_as: INVITED_AS_LABEL[String(raw[F_INVITE.THE_USER_IS_INVITED_AS] || "")] || "normal group member",
		source: SOURCE_LABEL[String(raw[F_INVITE.CUSTOM_OR_APP_NATIVE_GENERATED] || "")] || "custom",
		expires_at: expires,
		max_uses: maxUses,
		use_count: useCount,
		is_revoked: isRevoked,
		is_expired: isExpired,
		is_exhausted: isExhausted,
		is_active: !isRevoked && !isExpired && !isExhausted,
		created_at: raw.created_at || raw.cct_created || null
	};
}
/**
* Only the links the group's owners/admins created themselves are listed
* (a63 = Custom). App-native one-time links stay out of the list.
*/
async function fetchGroupInvitesWordPress(groupId) {
	try {
		return (await fetchRelatedCctItems(REL_GROUP_INVITE, groupId, T.careGroupInvite.slug)).map((i) => normalizeInvite(i, groupId)).filter((i) => i.source === "custom");
	} catch (e) {
		throw e instanceof Error ? e : new Error(String(e));
	}
}
async function createGroupInviteWordPress(input) {
	const token = (input.token || generateInviteToken()).trim();
	const source = input.source || "custom";
	const created = await wordpressCCTFetch(T.careGroupInvite.slug, {
		method: "POST",
		body: {
			[F_INVITE.TOKEN]: token,
			[F_INVITE.NAME]: input.name || "",
			[F_INVITE.EXPIRES_AT]: source === "app native generated" ? "" : input.expiresAt || "",
			[F_INVITE.MAX_USES]: source === "app native generated" ? "0" : String(Number(input.maxUses || 0)),
			[F_INVITE.USE_COUNT]: "0",
			[F_INVITE.IS_REVOKED]: O_INVITE.IS_REVOKED.NO,
			[F_INVITE.NOTE]: input.note || "",
			[F_INVITE.THE_USER_IS_INVITED_AS]: INVITED_AS_CODE[input.invitedAs || "normal group member"],
			[F_INVITE.CUSTOM_OR_APP_NATIVE_GENERATED]: SOURCE_CODE[source]
		}
	});
	const groupIdNum = normalizeWpObjectId(input.groupId);
	const inviteId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
	if (groupIdNum && inviteId) await wordpressFetch(`jet-rel/${REL_GROUP_INVITE}`, {
		method: "POST",
		body: {
			parent_id: groupIdNum,
			child_id: inviteId,
			context: "child",
			store_items_type: "update"
		}
	});
	return normalizeInvite({
		...created,
		id: inviteId,
		[F_INVITE.TOKEN]: token,
		[F_INVITE.NAME]: input.name || "",
		[F_INVITE.NOTE]: input.note || "",
		[F_INVITE.EXPIRES_AT]: source === "app native generated" ? "" : input.expiresAt || "",
		[F_INVITE.MAX_USES]: source === "app native generated" ? "0" : String(Number(input.maxUses || 0)),
		[F_INVITE.USE_COUNT]: "0",
		[F_INVITE.IS_REVOKED]: O_INVITE.IS_REVOKED.NO,
		[F_INVITE.THE_USER_IS_INVITED_AS]: INVITED_AS_CODE[input.invitedAs || "normal group member"],
		[F_INVITE.CUSTOM_OR_APP_NATIVE_GENERATED]: SOURCE_CODE[source]
	}, input.groupId);
}
async function updateGroupInviteWordPress(id, updates) {
	const body = {};
	if (updates.name !== void 0) body[F_INVITE.NAME] = updates.name;
	if (updates.note !== void 0) body[F_INVITE.NOTE] = updates.note;
	if (updates.token !== void 0) body[F_INVITE.TOKEN] = updates.token;
	if (updates.expiresAt !== void 0) body[F_INVITE.EXPIRES_AT] = updates.expiresAt || "";
	if (updates.maxUses !== void 0) body[F_INVITE.MAX_USES] = String(Number(updates.maxUses || 0));
	if (updates.isRevoked !== void 0) body[F_INVITE.IS_REVOKED] = updates.isRevoked ? O_INVITE.IS_REVOKED.YES : O_INVITE.IS_REVOKED.NO;
	if (updates.invitedAs !== void 0) body[F_INVITE.THE_USER_IS_INVITED_AS] = INVITED_AS_CODE[updates.invitedAs];
	await wordpressCCTFetch(T.careGroupInvite.slug, {
		id,
		method: "PUT",
		body
	});
}
async function deleteGroupInviteWordPress(id) {
	await wordpressCCTFetch(T.careGroupInvite.slug, {
		id,
		method: "DELETE"
	});
}
/** Invite-link preview for the join page: which group, invited as what. */
async function previewGroupInviteWordPress(token) {
	const { invite, groupId, groupName } = await resolveInviteByToken(token);
	return {
		group_id: String(groupId),
		group_name: groupName,
		invited_as: invite.invited_as,
		note: invite.note,
		name: invite.name
	};
}
/** Finds a CCT 200 link by its token (a55), validates it, resolves its group. */
async function resolveInviteByToken(token) {
	const trimmed = (token || "").trim();
	if (!trimmed) throw new Error("Invalid invite link");
	const invites = await wordpressCCTFetch(T.careGroupInvite.slug, { params: {
		_limit: 20,
		_filters: JSON.stringify([{
			field: F_INVITE.TOKEN,
			operator: "LIKE",
			value: trimmed
		}])
	} });
	if (!Array.isArray(invites)) throw new Error("Invalid invite link");
	const lower = trimmed.toLowerCase();
	const match = invites.find((i) => String(i[F_INVITE.TOKEN] || "").trim().toLowerCase() === lower);
	if (!match) throw new Error("Invalid invite link");
	const invite = normalizeInvite(match);
	if (invite.is_revoked) throw new Error("This invite link has been revoked.");
	if (invite.is_expired) throw new Error("This invite link has expired.");
	if (invite.is_exhausted) throw new Error("This invite link has reached its maximum uses.");
	const inviteId = normalizeWpObjectId(match.id || match._ID);
	const parents = await wordpressFetch(`jet-rel/${REL_GROUP_INVITE}/parents/${inviteId}`);
	const groupId = Array.isArray(parents) && parents.length ? Number(parents[0].parent_object_id) : 0;
	if (!groupId) throw new Error("This invite link is not connected to a group.");
	return {
		invite,
		inviteId,
		groupId,
		groupName: await groupNameOf(groupId)
	};
}
/**
* Completes the group onboarding popup: writes the Rel 223 membership with the
* in-group display name and the role the link invited the person as, then bumps
* a59 use count.
*/
async function joinGroupByCodeWordPress(token, displayName) {
	try {
		const { invite, inviteId, groupId, groupName } = await resolveInviteByToken(token);
		const wpUser = getStoredWPUser();
		const userId = wpUser?.user_id ? Number(wpUser.user_id) : 0;
		if (!userId) throw new Error("Please sign in to join this group.");
		const existingMembers = await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}/children/${groupId}`);
		if ((Array.isArray(existingMembers) ? existingMembers : []).some((r) => Number(r.child_object_id) === userId && decodeRel72Meta(r?.meta).invitationStatus === "accepted")) return {
			group_id: String(groupId),
			group_name: groupName,
			already_member: true
		};
		const memberType = invite.invited_as === "owner" ? "owner" : invite.invited_as === "admin" ? "admin" : "nothing special";
		await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
			method: "POST",
			body: {
				parent_id: groupId,
				child_id: userId,
				context: "child",
				store_items_type: "update",
				meta: memberMeta({
					displayName: displayName?.trim() || await fetchMyAppUserName(),
					memberTypes: [memberType],
					memberRoles: ["nothing special"],
					invitationStatus: "accepted"
				})
			}
		});
		wordpressCCTFetch(T.careGroupInvite.slug, {
			id: String(inviteId),
			method: "PUT",
			body: { [F_INVITE.USE_COUNT]: String(Number(invite.use_count || 0) + 1) }
		}).catch(() => {});
		return {
			group_id: String(groupId),
			group_name: groupName,
			already_member: false
		};
	} catch (e) {
		throw new Error(e?.message || "Invalid invite link");
	}
}
/**
* Join code path (CCT 199 a58): a non-member who types the group's join code
* gets the group onboarding popup and becomes a normal member.
*/
async function joinGroupByJoinCodeWordPress(groupId, code, displayName) {
	const gid = normalizeWpObjectId(groupId);
	if (!gid) throw new Error("Invalid care group");
	const group = await wordpressCCTFetch(T.careGroup.slug, { id: String(gid) });
	if (String(group?.[F_GROUP.STATUS] ?? "") === O_GROUP.STATUS.NO) throw new Error("This care group is no longer active.");
	const expected = String(group?.[F_GROUP.JOIN_CODE] || "").trim();
	if (!expected) throw new Error("This care group has no join code. Ask an admin to let you in.");
	if (expected.toLowerCase() !== String(code || "").trim().toLowerCase()) throw new Error("That join code is not correct.");
	const wpUser = getStoredWPUser();
	const userId = wpUser?.user_id ? Number(wpUser.user_id) : 0;
	if (!userId) throw new Error("Please sign in to join this group.");
	const rels = await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}/children/${gid}`);
	const existing = (Array.isArray(rels) ? rels : []).find((r) => Number(r.child_object_id) === userId);
	const decoded = existing ? decodeRel72Meta(existing.meta) : null;
	if (decoded?.invitationStatus === "accepted") return {
		group_id: String(gid),
		group_name: group?.[F_GROUP.NAME] || "",
		already_member: true
	};
	const keepTypes = decoded?.invitationStatus === "pending" && decoded.memberTypes.length ? decoded.memberTypes : ["nothing special"];
	await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
		method: "POST",
		body: {
			parent_id: gid,
			child_id: userId,
			context: "child",
			store_items_type: "update",
			meta: memberMeta({
				displayName: displayName?.trim() || await fetchMyAppUserName(),
				memberTypes: keepTypes,
				memberRoles: ["nothing special"],
				invitationStatus: "accepted"
			})
		}
	});
	return {
		group_id: String(gid),
		group_name: group?.[F_GROUP.NAME] || "",
		already_member: false
	};
}
/**
* Legacy code box: older invite-link codes (CCT 200 a55) that were already
* sent out keep working. Join codes are only typed on the group's own page,
* because six digits are not unique across groups.
*/
async function joinGroupByAnyCodeWordPress(code, displayName) {
	const trimmed = String(code || "").trim();
	if (!trimmed) throw new Error("Please enter the code you were given.");
	return joinGroupByCodeWordPress(trimmed, displayName);
}
/** What the group page needs to know about this group and the signed-in viewer. */
async function fetchGroupLinkStateWordPress(groupId) {
	const gid = normalizeWpObjectId(groupId);
	const empty = {
		group_id: String(groupId),
		group_name: "",
		found: false,
		is_active: false,
		has_join_code: false,
		my_status: "none",
		my_invited_as: "normal group member",
		i_am_admin: false
	};
	if (!gid) return empty;
	const group = await wordpressCCTFetch(T.careGroup.slug, { id: String(gid) }).catch(() => null);
	if (!group || !(group?._ID || group?.item_id || group?.id || group?.[F_GROUP.NAME])) return empty;
	const userId = Number(getStoredWPUser()?.user_id || 0);
	let myStatus = "none";
	let invitedAs = "normal group member";
	let iAmAdmin = false;
	if (userId) {
		const rels = await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}/children/${gid}`);
		const mine = (Array.isArray(rels) ? rels : []).find((r) => Number(r.child_object_id) === userId);
		if (mine) {
			const d = decodeRel72Meta(mine.meta);
			myStatus = d.invitationStatus;
			invitedAs = d.memberTypes.includes("owner") ? "owner" : d.memberTypes.includes("admin") ? "admin" : "normal group member";
			iAmAdmin = myStatus === "accepted" && (d.memberTypes.includes("owner") || d.memberTypes.includes("admin"));
		}
	}
	return {
		group_id: String(gid),
		group_name: group?.[F_GROUP.NAME] || "",
		found: true,
		is_active: String(group?.[F_GROUP.STATUS] ?? "") !== O_GROUP.STATUS.NO,
		has_join_code: !!String(group?.[F_GROUP.JOIN_CODE] || "").trim(),
		my_status: myStatus,
		my_invited_as: invitedAs,
		i_am_admin: iAmAdmin
	};
}
/**
* "Ask to join": no membership row is written. The group's owners and admins
* get an inbox notice that opens this group's page with the request on it.
*/
async function requestToJoinGroupWordPress(groupId) {
	const gid = normalizeWpObjectId(groupId);
	const userId = Number(getStoredWPUser()?.user_id || 0);
	if (!gid) throw new Error("Invalid care group");
	if (!userId) throw new Error("Please sign in first.");
	const [admins, name] = await Promise.all([groupAdminIds(gid), groupNameOf(gid)]);
	if (admins.length === 0) throw new Error("This group has no admin who can let you in.");
	const { notifyJoinRequest } = await import("../_libs/_12.mjs").then((n) => n.n);
	const { careGroupPath } = await import("../_libs/_6.mjs").then((n) => n.a);
	await notifyJoinRequest(admins, name, `${careGroupPath(gid)}?request=${userId}`);
}
/** The person behind a join request, read fresh for the admin's decision. */
async function fetchJoinRequesterWordPress(groupId, requesterId) {
	const gid = normalizeWpObjectId(groupId);
	const uid = normalizeWpObjectId(requesterId);
	if (!gid || !uid) throw new Error("Invalid request");
	const [profile, rels] = await Promise.all([fetchWPUserPublicProfile(uid).catch(() => null), wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}/children/${gid}`)]);
	const row = (Array.isArray(rels) ? rels : []).find((r) => Number(r.child_object_id) === uid);
	return {
		user_id: String(uid),
		name: profile?.full_name || "",
		status: row ? decodeRel72Meta(row.meta).invitationStatus : "none"
	};
}
/** Admin answers a join request: approving writes the accepted Rel 223 row. */
async function answerJoinRequestWordPress(groupId, requesterId, approve) {
	const gid = normalizeWpObjectId(groupId);
	const uid = normalizeWpObjectId(requesterId);
	if (!gid || !uid) throw new Error("Invalid request");
	const name = await groupNameOf(gid);
	const { careGroupPath } = await import("../_libs/_6.mjs").then((n) => n.a);
	if (approve) {
		const profile = await fetchWPUserPublicProfile(uid).catch(() => null);
		await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
			method: "POST",
			body: {
				parent_id: gid,
				child_id: uid,
				context: "child",
				store_items_type: "update",
				meta: memberMeta({
					displayName: profile?.full_name || "",
					memberTypes: ["nothing special"],
					memberRoles: ["nothing special"],
					invitationStatus: "accepted"
				})
			}
		});
	}
	try {
		const { notifyJoinRequestAnswered } = await import("../_libs/_12.mjs").then((n) => n.n);
		await notifyJoinRequestAnswered(uid, name, approve, careGroupPath(gid));
	} catch {}
}
async function resolveMediaUrl(mediaId) {
	if (!mediaId) return null;
	try {
		const m = await wordpressFetch(`/wp-json/wp/v2/media/${mediaId}`);
		return m?.media_details?.sizes?.medium_large?.source_url || m?.media_details?.sizes?.medium?.source_url || m?.source_url || null;
	} catch (e) {
		throw e instanceof Error ? e : new Error(String(e));
	}
}
async function fetchCareGroupGalleryWordPress(groupId) {
	try {
		const items = await fetchRelatedCctItems(REL_GROUP_GALLERY, groupId, "care_group_gallery");
		return await Promise.all(items.map(async (m) => {
			const mediaId = m[F_GALLERY.IMAGE] ?? null;
			const image_url = await resolveMediaUrl(mediaId);
			return {
				id: String(m.id || m._ID),
				group_id: groupId,
				media_id: mediaId,
				image_url,
				url: image_url,
				type: "image",
				caption: m[F_GALLERY.IMAGE_DESCRIPTION] || "",
				taken_at: m[F_GALLERY.TAKEN_AT] || null,
				created_at: m.created_at
			};
		}));
	} catch (e) {
		throw e instanceof Error ? e : new Error(String(e));
	}
}
/**
* Upload a File to WP Media Library and return the media ID.
* Delegates to the shared uploader, which falls back to the privileged
* wp-admin-ops path when WordPress refuses direct uploads for the role
* (subscribers get 403 rest_cannot_create on wp/v2/media).
*/
async function uploadToWPMedia(file) {
	const { uploadWPMedia } = await import("../_libs/_26.mjs").then((n) => n.i);
	const media = await uploadWPMedia(file);
	if (!media?.id) throw new Error("Media upload failed");
	return Number(media.id);
}
async function createCareGroupGalleryItemWordPress(groupId, mediaId, caption, takenAt) {
	const normalizedGroupId = normalizeWpObjectId(groupId);
	const created = await wordpressCCTFetch(T.careGroupGallery.slug, {
		method: "POST",
		body: {
			[F_GALLERY.IMAGE]: String(mediaId),
			[F_GALLERY.IMAGE_DESCRIPTION]: caption || "",
			[F_GALLERY.TAKEN_AT]: takenAt || (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ")
		}
	});
	const itemId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
	if (normalizedGroupId && itemId) await wordpressFetch(`jet-rel/${REL_GROUP_GALLERY}`, {
		method: "POST",
		body: {
			parent_id: normalizedGroupId,
			child_id: itemId,
			context: "child",
			store_items_type: "update"
		}
	});
}
async function deleteCareGroupGalleryItemWordPress(itemId) {
	await wordpressCCTFetch(T.careGroupGallery.slug, {
		id: itemId,
		method: "DELETE"
	});
}
async function fetchMemberCategoriesWordPress(groupId) {
	try {
		return (await fetchRelatedCctItems(REL_GROUP_SUBGROUP, groupId, "care_group_pmg")).map((c) => ({
			id: String(c.id || c._ID),
			group_id: groupId,
			name: c[F_SUBGROUP.NAME] || "",
			description: c[F_SUBGROUP.DESCRIPTION] || null,
			color: c[F_SUBGROUP.COLOR] || null,
			created_at: c.created_at
		}));
	} catch (e) {
		throw e instanceof Error ? e : new Error(String(e));
	}
}
async function createMemberCategoryWordPress(groupId, name, color, description) {
	const created = await wordpressCCTFetch(T.careGroupPrivateMemberGroup.slug, {
		method: "POST",
		body: {
			[F_SUBGROUP.NAME]: name,
			[F_SUBGROUP.DESCRIPTION]: description || "",
			[F_SUBGROUP.COLOR]: color || ""
		}
	});
	const normalizedGroupId = normalizeWpObjectId(groupId);
	const categoryId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
	if (normalizedGroupId && categoryId) {
		await wordpressFetch(`jet-rel/${REL_GROUP_SUBGROUP}`, {
			method: "POST",
			body: {
				parent_id: normalizedGroupId,
				child_id: categoryId,
				context: "child",
				store_items_type: "update"
			}
		});
		const wpUser = getStoredWPUser();
		const ownerId = wpUser?.user_id ? Number(wpUser.user_id) : 0;
		if (ownerId) try {
			await addSubgroupOwnerWordPress(String(categoryId), ownerId);
		} catch {}
	}
}
async function updateMemberCategoryWordPress(categoryId, updates) {
	const body = {};
	if (updates.name !== void 0) body[F_SUBGROUP.NAME] = updates.name;
	if (updates.description !== void 0) body[F_SUBGROUP.DESCRIPTION] = updates.description;
	if (updates.color !== void 0) body[F_SUBGROUP.COLOR] = updates.color;
	await wordpressCCTFetch(T.careGroupPrivateMemberGroup.slug, {
		id: categoryId,
		method: "POST",
		body
	});
}
async function deleteMemberCategoryWordPress(categoryId) {
	await wordpressCCTFetch(T.careGroupPrivateMemberGroup.slug, {
		id: categoryId,
		method: "DELETE"
	});
}
var subgroupMeta = encodeRel75Meta;
async function fetchSubgroupMemberRecords(subgroupId) {
	const sid = normalizeWpObjectId(subgroupId);
	if (!sid) return [];
	try {
		const rels = await wordpressFetch(`jet-rel/${REL_SUBGROUP_MEMBERS}/children/${sid}`);
		return (Array.isArray(rels) ? rels : []).map((r) => {
			const uid = Number(r.child_object_id);
			if (!uid) return null;
			const { types } = decodeRel75Meta(r?.meta);
			const is_owner = types.includes("owner");
			const is_admin = types.includes("admin") || is_owner;
			return {
				user_id: uid,
				types: types.length ? types : ["nothing special"],
				is_owner,
				is_admin
			};
		}).filter(Boolean);
	} catch (e) {
		throw e instanceof Error ? e : new Error(String(e));
	}
}
/** Member user ids of a sub-group. */
async function fetchSubgroupMembersWordPress(subgroupId) {
	return (await fetchSubgroupMemberRecords(subgroupId)).map((r) => r.user_id);
}
/** Full member records (with owner/admin flags) for management views. */
async function fetchSubgroupMemberRecordsWordPress(subgroupId) {
	return fetchSubgroupMemberRecords(subgroupId);
}
/** Sub-group owners/admins add members directly. */
async function addMemberToSubgroupWordPress(subgroupId, userId, opts = {}) {
	const sid = normalizeWpObjectId(subgroupId);
	const uid = normalizeWpObjectId(userId);
	if (!sid || !uid) return;
	await wordpressFetch(`jet-rel/${REL_SUBGROUP_MEMBERS}`, {
		method: "POST",
		body: {
			parent_id: sid,
			child_id: uid,
			context: "child",
			store_items_type: "update",
			meta: subgroupMeta({ types: opts.types })
		}
	});
}
async function removeMemberFromSubgroupWordPress(subgroupId, userId) {
	const sid = normalizeWpObjectId(subgroupId);
	const uid = normalizeWpObjectId(userId);
	if (!sid || !uid) return;
	await wordpressFetch(`jet-rel/${REL_SUBGROUP_MEMBERS}`, {
		method: "POST",
		body: {
			parent_id: sid,
			child_id: uid,
			context: "child",
			store_items_type: "disconnect"
		}
	});
}
/** Update sub-group member type (owner / admin / nothing special). */
async function updateSubgroupMemberRoleWordPress(subgroupId, userId, role) {
	const sid = normalizeWpObjectId(subgroupId);
	const uid = normalizeWpObjectId(userId);
	if (!sid || !uid) return;
	await wordpressFetch(`jet-rel/${REL_SUBGROUP_MEMBERS}`, {
		method: "POST",
		body: {
			parent_id: sid,
			child_id: uid,
			context: "child",
			store_items_type: "update",
			meta: subgroupMeta({ types: [role] })
		}
	});
}
/** The creator of a sub-group is its owner. */
async function addSubgroupOwnerWordPress(subgroupId, userId) {
	return addMemberToSubgroupWordPress(subgroupId, userId, { types: ["owner"] });
}
async function searchProfilesWordPress(query) {
	try {
		const users = await wordpressFetch("wp/v2/users", { params: {
			search: query,
			per_page: 20
		} });
		if (!Array.isArray(users)) return [];
		const profiles = await Promise.all(users.map(async (u) => {
			try {
				return await fetchWPUserPublicProfile(u.id);
			} catch {
				return null;
			}
		}));
		return users.map((u, i) => ({
			id: `wp-${u.id}`,
			user_id: `wp-${u.id}`,
			full_name: profiles[i]?.full_name || "",
			email: u.email || null,
			avatar_url: profiles[i]?.avatar_url || u.avatar_urls?.["96"] || null
		}));
	} catch (e) {
		throw e instanceof Error ? e : new Error(String(e));
	}
}
async function addCaredOneToGroupWordPress(groupId, caredOneId) {
	const normalizedGroupId = normalizeWpObjectId(groupId);
	const normalizedCaredOneId = normalizeWpObjectId(caredOneId);
	if (!normalizedGroupId || !normalizedCaredOneId) return;
	let displayName = "Cared One";
	try {
		const user = await fetchWPUserSafe(normalizedCaredOneId);
		displayName = user?.name || user?.slug || displayName;
	} catch {}
	await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
		method: "POST",
		body: {
			parent_id: normalizedGroupId,
			child_id: normalizedCaredOneId,
			context: "child",
			store_items_type: "update",
			meta: memberMeta({
				displayName,
				memberTypes: ["nothing special"],
				memberRoles: ["cared one"],
				invitationStatus: "accepted"
			})
		}
	});
}
async function leaveGroupWordPress(groupId, userId) {
	if (!userId) return;
	try {
		const normalizedGroupId = normalizeWpObjectId(groupId);
		const normalizedUserId = normalizeWpObjectId(userId);
		if (!normalizedGroupId || !normalizedUserId) return;
		await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
			method: "POST",
			body: {
				parent_id: normalizedGroupId,
				child_id: normalizedUserId,
				context: "child",
				store_items_type: "disconnect"
			}
		});
	} catch {}
}
//#endregion
export { removeMemberFromSubgroupWordPress as A, uploadToWPMedia as B, fetchSubgroupMemberRecordsWordPress as C, leaveGroupWordPress as D, joinGroupByJoinCodeWordPress as E, updateGroupInviteWordPress as F, updateGroupPostWordPress as I, updateMemberCategoryWordPress as L, searchProfilesWordPress as M, source_wordpress_extended_exports as N, previewGroupInviteWordPress as O, updateCareGroupWordPress as P, updateMemberRoleWordPress as R, fetchMyPendingInvitationsWordPress as S, joinGroupByAnyCodeWordPress as T, fetchGroupInvitationsWordPress as _, cancelInvitationWordPress as a, fetchJoinRequesterWordPress as b, createMemberCategoryWordPress as c, deleteCareGroupWordPress as d, deleteGroupInviteWordPress as f, fetchCareGroupPostsWordPress as g, fetchCareGroupGalleryWordPress as h, answerJoinRequestWordPress as i, requestToJoinGroupWordPress as j, removeGroupMemberWordPress as k, declineInvitationWordPress as l, deleteMemberCategoryWordPress as m, addCaredOneToGroupWordPress as n, createCareGroupGalleryItemWordPress as o, deleteGroupPostWordPress as p, addMemberToSubgroupWordPress as r, createGroupPostWordPress as s, acceptInvitationWordPress as t, deleteCareGroupGalleryItemWordPress as u, fetchGroupInvitesWordPress as v, inviteToGroupWordPress as w, fetchMemberCategoriesWordPress as x, fetchGroupLinkStateWordPress as y, updateSubgroupMemberRoleWordPress as z };
