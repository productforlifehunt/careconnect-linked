import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
import { a as wordpressFetch } from "./wordpress-client-b834cpZh.mjs";
import { n as getCurrentUserIdNumber } from "./current-user-CV-pp6xq.mjs";
import { n as R } from "./wp-schema-Dnlz0TVP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/visibility-Ka39tmJT.js
/**
* Sub-group visibility helpers (Care Group private member groups).
*
* - REL 75:  care_group_private_member_group → users   (M:M, members of a sub-group)
* - REL 103: care_group_not_too_special_post → care_group_private_member_group (M:M, post visibility)
* - REL 104: care_group_not_too_special_post → users   (M:M, direct user visibility)
* - REL  81: care_task_real → users (M:M, direct user visibility)
* - REL 109: care_task_real → care_group_private_member_group (M:M, sub-group visibility)
* (REL 108 = assigned caregivers, NOT visibility)
*
* Visibility rule per the PRD:
*   A post / task is visible to the current user if EITHER
*     • it has no visibility links at all (i.e. visible to whole group), OR
*     • the user is directly listed (rel 104 / 108), OR
*     • the user is a member of any linked sub-group (rel 75 ∩ rel 103/109).
*/
var visibility_exports = /* @__PURE__ */ __exportAll({
	fetchMySubgroupIds: () => fetchMySubgroupIds,
	filterVisiblePosts: () => filterVisiblePosts,
	filterVisibleTasks: () => filterVisibleTasks,
	setPostVisibility: () => setPostVisibility,
	setTaskVisibility: () => setTaskVisibility
});
var REL_SUBGROUP_MEMBERS = R.privateMemberGroupMembers;
var REL_POST_SUBGROUPS = R.careGroupPostPrivateGroups;
var REL_POST_USERS = R.careGroupPostMentionedUsers;
var REL_TASK_USERS = R.careTaskVisibleUsers;
var REL_TASK_SUBGROUPS = R.careTaskPrivateMemberGroups;
/** REL 293 — sub-groups a post is explicitly NOT visible to. */
var REL_POST_HIDDEN_SUBGROUPS = R.careGroupPostHiddenPrivateGroups;
/** REL 292 — members a post is explicitly NOT visible to. */
var REL_POST_HIDDEN_USERS = R.careGroupPostHiddenUsers;
/**
* Whole-relation map: `{ parentId: [childId, ...] }`.
* One request replaces the per-item `children/{id}` calls, which turned every
* feed render into an N+1 storm (~20s for a handful of posts).
*/
async function relMap(rel) {
	const out = /* @__PURE__ */ new Map();
	try {
		const r = await wordpressFetch(`jet-rel/${rel}`);
		if (r && typeof r === "object" && !Array.isArray(r)) for (const [parent, rows] of Object.entries(r)) out.set(Number(parent), (Array.isArray(rows) ? rows : []).map((x) => Number(x.child_object_id)).filter(Boolean));
	} catch {}
	return out;
}
/**
* Sub-group ids the current user belongs to. Sub-group membership has no
* invitation step — being linked through REL 225 IS membership.
*/
async function fetchMySubgroupIds() {
	const uid = getCurrentUserIdNumber();
	if (!uid) return /* @__PURE__ */ new Set();
	try {
		const rels = await wordpressFetch(`jet-rel/${REL_SUBGROUP_MEMBERS}/parents/${uid}`);
		return new Set((Array.isArray(rels) ? rels : []).map((r) => Number(r.parent_object_id)).filter(Boolean));
	} catch {
		return /* @__PURE__ */ new Set();
	}
}
/**
* Resolve visibility for a list of entities while PRESERVING input order.
* (An earlier version pushed into an array from inside `Promise.all`, which made
* the result order depend on network timing — newest items could fall outside a
* `slice(0, n)` feed and appear to vanish.)
*/
async function filterVisibleEntities(items, relSubgroups, relUsers, relHiddenSubgroups, relHiddenUsers) {
	if (items.length === 0) return items;
	const uid = getCurrentUserIdNumber();
	if (!uid) return [];
	const [mySubgroups, subMap, userMap, hiddenSubMap, hiddenUserMap] = await Promise.all([
		fetchMySubgroupIds(),
		relMap(relSubgroups),
		relMap(relUsers),
		relHiddenSubgroups ? relMap(relHiddenSubgroups) : Promise.resolve(/* @__PURE__ */ new Map()),
		relHiddenUsers ? relMap(relHiddenUsers) : Promise.resolve(/* @__PURE__ */ new Map())
	]);
	return items.filter((item) => {
		const id = Number(String(item.id).replace(/^wp-/, ""));
		if (!id) return true;
		if ((hiddenUserMap.get(id) || []).includes(uid)) return false;
		if ((hiddenSubMap.get(id) || []).some((sg) => mySubgroups.has(sg))) return false;
		const allowedSub = subMap.get(id) || [];
		const allowedUsers = userMap.get(id) || [];
		if (allowedSub.length === 0 && allowedUsers.length === 0) return true;
		if (allowedUsers.includes(uid)) return true;
		return allowedSub.some((sg) => mySubgroups.has(sg));
	});
}
async function filterVisiblePosts(posts) {
	return filterVisibleEntities(posts, REL_POST_SUBGROUPS, REL_POST_USERS, REL_POST_HIDDEN_SUBGROUPS, REL_POST_HIDDEN_USERS);
}
/** Filter a list of tasks to those visible to the current user. */
async function filterVisibleTasks(tasks) {
	return filterVisibleEntities(tasks, REL_TASK_SUBGROUPS, REL_TASK_USERS);
}
/** Replace the visibility links of one entity (adds new, removes dropped ones). */
async function replaceLinks(rel, parentId, wantedIds) {
	const current = await wordpressFetch(`jet-rel/${rel}/children/${parentId}`);
	const existing = (Array.isArray(current) ? current : []).map((r) => Number(r.child_object_id)).filter(Boolean);
	const toAdd = wantedIds.filter((id) => !existing.includes(id));
	const toRemove = existing.filter((id) => !wantedIds.includes(id));
	await Promise.all([...toAdd.map((id) => wordpressFetch(`jet-rel/${rel}`, {
		method: "POST",
		body: {
			parent_id: parentId,
			child_id: id,
			context: "child",
			store_items_type: "update"
		}
	}).catch(() => void 0)), ...toRemove.map((id) => wordpressFetch(`jet-rel/${rel}`, {
		method: "POST",
		body: {
			parent_id: parentId,
			child_id: id,
			context: "child",
			store_items_type: "disconnect"
		}
	}).catch(() => void 0))]);
}
/** Set the sub-group / user visibility links for a post (replaces existing). */
async function setPostVisibility(postId, subgroupIds, userIds = [], hiddenSubgroupIds = [], hiddenUserIds = []) {
	const pid = Number(String(postId).replace(/^wp-/, ""));
	if (!pid) return;
	await Promise.all([
		replaceLinks(REL_POST_SUBGROUPS, pid, subgroupIds),
		replaceLinks(REL_POST_USERS, pid, userIds),
		replaceLinks(REL_POST_HIDDEN_SUBGROUPS, pid, hiddenSubgroupIds),
		replaceLinks(REL_POST_HIDDEN_USERS, pid, hiddenUserIds)
	]);
}
/** Set the sub-group / user visibility links for a task (replaces existing). */
async function setTaskVisibility(taskId, subgroupIds, userIds = []) {
	const tid = Number(String(taskId).replace(/^wp-/, ""));
	if (!tid) return;
	await Promise.all([replaceLinks(REL_TASK_SUBGROUPS, tid, subgroupIds), replaceLinks(REL_TASK_USERS, tid, userIds)]);
}
//#endregion
export { visibility_exports as a, setTaskVisibility as i, filterVisibleTasks as n, setPostVisibility as r, filterVisiblePosts as t };
