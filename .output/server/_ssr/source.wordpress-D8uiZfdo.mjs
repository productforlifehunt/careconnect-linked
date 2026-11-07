import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
import { i as getStoredWPUser } from "./wp-auth-DL1jfVY7.mjs";
import { a as wordpressFetch, i as wordpressCCTFetch } from "./wordpress-client-b834cpZh.mjs";
import { i as WP, n as R, r as T } from "./wp-schema-Dnlz0TVP.mjs";
import { r as fetchCareGroupsWordPress } from "./source.wordpress-kaOca10B.mjs";
import { t as fetchUserCaredOnesWordPress } from "./source.wordpress-Dw6aJMyP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/source.wordpress-D8uiZfdo.js
var source_wordpress_exports = /* @__PURE__ */ __exportAll({
	CCT_SLUG: () => CCT_SLUG,
	REL_GROUP_TASK: () => REL_GROUP_TASK,
	REL_TASK_ASSIGNEE: () => REL_TASK_ASSIGNEE,
	REL_TASK_CALENDAR: () => REL_TASK_CALENDAR,
	REL_TASK_CARED_ONE: () => REL_TASK_CARED_ONE,
	REL_TASK_USERS: () => REL_TASK_USERS,
	createCareTaskWordPress: () => createCareTaskWordPress,
	deleteCareTaskWordPress: () => deleteCareTaskWordPress,
	fetchCareTasksWordPress: () => fetchCareTasksWordPress,
	linkTaskToCalendarEventWordPress: () => linkTaskToCalendarEventWordPress,
	updateAssigneeStatusWordPress: () => updateAssigneeStatusWordPress,
	updateCareTaskWordPress: () => updateCareTaskWordPress
});
/**
* Care Task — JetEngine CCT 204 `care_task`
*   fields:
*     a55 = Title, a56 = Description, a57 = Task type, a58 = People needed
*     a59 = Location, a60 = Photo, a61 = Date, a62 = Start, a63 = End
*     a64 = Completed at, a65 = Help status, a66 = Finish status
*
* Relations (per data model):
*   REL 231 → cared ones; REL 232 → assigned caregivers
*   REL 233 → care groups; REL 234 → private groups
*   REL 235 → visible users; REL 236 → comments
*   REL 263 → 187. User's calendar event
*/
var CCT_SLUG = T.careTask.slug;
var F = T.careTask.f;
var O = T.careTask.opt;
var REL232 = WP.rel["232"];
var ASSIGNEE_FIELD = REL232.f.ASSIGNED_CAREGIVER_STATUS;
var REL_GROUP_TASK = R.careGroupTasks;
var REL_TASK_ASSIGNEE = R.careTaskAssignees;
R.careTaskComments;
var REL_TASK_USERS = R.careTaskVisibleUsers;
R.careTaskPrivateMemberGroups;
var REL_TASK_CARED_ONE = R.careTaskCaredOnes;
var REL_TASK_CALENDAR = R.careTaskCalendarEvents;
function normalizeWpObjectId(value) {
	return Number(String(value ?? "").replace(/^wp-/, ""));
}
var HELP_STATUS_TO_LABEL = {
	[O.TASK_HELP_STATUS.TASK_DOESN_T_NEED_HELP]: "no_help_needed",
	[O.TASK_HELP_STATUS.TASK_NEEDS_HELP]: "needs_help",
	[O.TASK_HELP_STATUS.TASK_HAS_FOUND_HELP]: "found_help"
};
var FINISH_STATUS_TO_LABEL = {
	[O.TASK_FINISH_STATUS.NOT_FINISHED]: "pending",
	[O.TASK_FINISH_STATUS.FINISHED]: "completed"
};
var ASSIGNEE_STATUS_TO_CODE = {
	pending: REL232.opt.ASSIGNED_CAREGIVER_STATUS.PENDING,
	accepted: REL232.opt.ASSIGNED_CAREGIVER_STATUS.ACCEPTED,
	rejected: REL232.opt.ASSIGNED_CAREGIVER_STATUS.REJECTED
};
var ASSIGNEE_CODE_TO_STATUS = Object.fromEntries(Object.entries(ASSIGNEE_STATUS_TO_CODE).map(([status, code]) => [code, status]));
function helpStatusCode(v) {
	const value = String(v);
	if (!HELP_STATUS_TO_LABEL[value]) throw new Error(`Invalid care-task help status: ${value}`);
	return value;
}
function finishStatusFromLegacy(status) {
	return status === "completed" ? "b56" : "b55";
}
/** Returns array of { user_id: "wp-N", response: "pending"|"accepted"|"rejected" } */
function mapAssigneeRows(rows) {
	return rows.map((r) => {
		const id = normalizeWpObjectId(r.childId);
		if (!id) return null;
		const response = ASSIGNEE_CODE_TO_STATUS[String(r.meta?.[ASSIGNEE_FIELD])];
		if (!response) throw new Error(`Invalid task-assignee response code for user ${id}`);
		return {
			user_id: `wp-${id}`,
			response
		};
	}).filter(Boolean);
}
async function fetchAssignees(taskId) {
	const rels = await wordpressFetch(`jet-rel/${REL_TASK_ASSIGNEE}/children/${normalizeWpObjectId(taskId)}`);
	if (!Array.isArray(rels)) throw new Error(`Relation ${REL_TASK_ASSIGNEE} returned an invalid response`);
	return mapAssigneeRows(rels.map((r) => ({
		childId: String(r.child_object_id),
		meta: r.meta || r.meta_fields || null
	})));
}
async function fetchCaredOneId(taskId) {
	const rels = await wordpressFetch(`jet-rel/${REL_TASK_CARED_ONE}/children/${normalizeWpObjectId(taskId)}`);
	if (!Array.isArray(rels)) throw new Error(`Relation ${REL_TASK_CARED_ONE} returned an invalid response`);
	const id = rels.map((r) => normalizeWpObjectId(r.child_object_id)).find(Boolean);
	return id ? `wp-${id}` : null;
}
function mapTask(t, groupId) {
	const id = String(t._ID || t.id || "");
	const finishCode = String(t[F.TASK_FINISH_STATUS]);
	const helpCode = helpStatusCode(t[F.TASK_HELP_STATUS]);
	if (!FINISH_STATUS_TO_LABEL[finishCode]) throw new Error(`Invalid care-task finish status: ${finishCode}`);
	const taskTypeRaw = t[F.TASK_TYPE];
	const taskTypes = Array.isArray(taskTypeRaw) ? taskTypeRaw.map(String) : taskTypeRaw ? String(taskTypeRaw).split(",").map((s) => s.trim()).filter(Boolean) : [];
	return {
		id,
		care_group_id: groupId || null,
		title: t[F.TITLE] || "",
		description: t[F.DESCRIPTION] || "",
		task_types: taskTypes,
		people_needed: t[F.PEOPLE_NEEDED] ? Number(t[F.PEOPLE_NEEDED]) : null,
		location: t[F.LOCATION] || "",
		photo: t[F.PHOTO] || "",
		photo_ids: String(t[F.PHOTO] ?? "").split(",").map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n > 0),
		task_date: t[F.DATE_OF_THE_TASK] || null,
		start_time: t[F.TASK_START_TIME] || null,
		end_time: t[F.TASK_END_TIME] || null,
		completed_at: t[F.TASK_COMPLETED_AT] || null,
		due_date_time: t[F.DUE_DATE] || null,
		needs_payment: String(t[F.NEEDS_PAYMENT] || "") === O.NEEDS_PAYMENT.YES,
		price: t[F.PRICE] || "",
		help_status: helpCode,
		help_status_label: HELP_STATUS_TO_LABEL[helpCode],
		finish_status: finishCode,
		status: FINISH_STATUS_TO_LABEL[finishCode],
		due_date: t[F.DATE_OF_THE_TASK] || null,
		created_by: t.cct_author_id || t.author_id || null,
		created_at: t.cct_created || t.created_at || null,
		updated_at: t.cct_modified || t.updated_at || t.cct_created || null
	};
}
async function fetchCareTasksWordPress(groupId) {
	const userId = getStoredWPUser()?.user_id;
	if (!userId) return [];
	let taskIds = [];
	let ownRows = [];
	if (groupId) {
		const rels = await wordpressFetch(`jet-rel/${REL_GROUP_TASK}/children/${normalizeWpObjectId(groupId)}`);
		taskIds = (Array.isArray(rels) ? rels : []).map((r) => String(r.child_object_id || "")).filter(Boolean);
	} else {
		const [groups, people, assigned, visible, authored] = await Promise.all([
			fetchCareGroupsWordPress(),
			fetchUserCaredOnesWordPress(),
			wordpressFetch(`jet-rel/${REL_TASK_ASSIGNEE}/parents/${userId}`),
			wordpressFetch(`jet-rel/${REL_TASK_USERS}/parents/${userId}`),
			wordpressCCTFetch(CCT_SLUG, { params: {
				cct_author_id: userId,
				_limit: 100
			} })
		]);
		ownRows = (Array.isArray(authored) ? authored : []).filter((t) => Number(t.cct_author_id) === Number(userId));
		const links = await Promise.all([...groups.map((g) => wordpressFetch(`jet-rel/${REL_GROUP_TASK}/children/${normalizeWpObjectId(g.id)}`)), ...people.map((p) => wordpressFetch(`jet-rel/${REL_TASK_CARED_ONE}/parents/${normalizeWpObjectId(p.user_id)}`))]);
		taskIds = [
			...ownRows.map((t) => String(t._ID || t.id || "")),
			...[assigned, visible].flatMap((rows) => (Array.isArray(rows) ? rows : []).map((r) => String(r.parent_object_id || ""))),
			...links.flatMap((rows, index) => (Array.isArray(rows) ? rows : []).map((r) => String(index < groups.length ? r.child_object_id || "" : r.parent_object_id || "")))
		].filter(Boolean);
	}
	const ownById = new Map(ownRows.map((t) => [String(t._ID || t.id), t]));
	const taskList = (await Promise.all([...new Set(taskIds)].map((id) => ownById.get(id) || wordpressCCTFetch(CCT_SLUG, { id })))).filter(Boolean);
	return await Promise.all(taskList.map(async (t) => {
		const base = mapTask(t, groupId);
		const [assignees, caredOne] = await Promise.all([fetchAssignees(base.id), fetchCaredOneId(base.id)]);
		const assignedIds = assignees.map((a) => a.user_id);
		return {
			...base,
			assigned_to: assignedIds[0] || null,
			assigned_to_ids: assignedIds,
			assignees,
			cared_one_id: caredOne
		};
	}));
}
async function createCareTaskWordPress(task) {
	const created = await wordpressCCTFetch(CCT_SLUG, {
		method: "POST",
		body: {
			[F.TITLE]: task.title,
			[F.DESCRIPTION]: task.description || "",
			[F.TASK_TYPE]: Array.isArray(task.task_types) ? task.task_types : [],
			[F.PEOPLE_NEEDED]: task.people_needed != null ? String(task.people_needed) : "",
			[F.LOCATION]: task.location || "",
			[F.PHOTO]: Array.isArray(task.photo_ids) && task.photo_ids.length ? task.photo_ids.map((v) => Number(String(v).trim())).filter((n) => Number.isFinite(n) && n > 0).join(",") : task.photo || "",
			[F.DATE_OF_THE_TASK]: task.task_date || task.due_date || "",
			[F.TASK_START_TIME]: task.start_time || "",
			[F.TASK_END_TIME]: task.end_time || "",
			[F.TASK_COMPLETED_AT]: "",
			[F.TASK_HELP_STATUS]: helpStatusCode(task.help_status ?? O.TASK_HELP_STATUS.TASK_DOESN_T_NEED_HELP),
			[F.TASK_FINISH_STATUS]: T.careTask.opt.TASK_FINISH_STATUS.NOT_FINISHED,
			[F.NEEDS_PAYMENT]: task.needs_payment ? O.NEEDS_PAYMENT.YES : O.NEEDS_PAYMENT.NO,
			[F.PRICE]: task.price || ""
		}
	});
	const taskId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
	const groupId = normalizeWpObjectId(task.group_id || task.care_group_id);
	const assignedUserIds = (Array.isArray(task.assigned_to) ? task.assigned_to : task.assigned_to ? [task.assigned_to] : []).map(normalizeWpObjectId).filter(Boolean);
	const caredOneId = normalizeWpObjectId(task.cared_one_id);
	const calls = [];
	if (taskId && groupId) calls.push(wordpressFetch(`jet-rel/${REL_GROUP_TASK}`, {
		method: "POST",
		body: {
			parent_id: groupId,
			child_id: taskId,
			context: "child",
			store_items_type: "update"
		}
	}));
	assignedUserIds.forEach((assignedUserId) => calls.push(wordpressFetch(`jet-rel/${REL_TASK_ASSIGNEE}`, {
		method: "POST",
		body: {
			parent_id: taskId,
			child_id: assignedUserId,
			context: "child",
			store_items_type: "update",
			meta: { [ASSIGNEE_FIELD]: ASSIGNEE_STATUS_TO_CODE["pending"] }
		}
	})));
	if (taskId && caredOneId) calls.push(wordpressFetch(`jet-rel/${REL_TASK_CARED_ONE}`, {
		method: "POST",
		body: {
			parent_id: taskId,
			child_id: caredOneId,
			context: "child",
			store_items_type: "replace"
		}
	}));
	await Promise.all(calls);
	if (taskId && assignedUserIds.length > 0) try {
		const { notifyTaskAssigned } = await import("../_libs/_12.mjs").then((n) => n.n);
		await notifyTaskAssigned(assignedUserIds, task.title, String(taskId));
	} catch {}
	return taskId ? String(taskId) : null;
}
async function updateCareTaskWordPress(id, updates) {
	const { care_group_id: _careGroupId, group_id: _groupId, assigned_to, cared_one_id, title, description, task_types, people_needed, location, photo, photo_ids, task_date, due_date, start_time, end_time, completed_at, help_status, finish_status, status, needs_payment, price, ...rest } = updates || {};
	if (Object.keys(rest).length) throw new Error(`Unsupported care-task fields: ${Object.keys(rest).join(", ")}`);
	const body = {};
	if (title !== void 0) body[F.TITLE] = title;
	if (description !== void 0) body[F.DESCRIPTION] = description;
	if (task_types !== void 0) body[F.TASK_TYPE] = Array.isArray(task_types) ? task_types : [];
	if (people_needed !== void 0) body[F.PEOPLE_NEEDED] = people_needed != null ? String(people_needed) : "";
	if (location !== void 0) body[F.LOCATION] = location;
	if (photo_ids !== void 0) body[F.PHOTO] = (Array.isArray(photo_ids) ? photo_ids : []).map((v) => Number(String(v).trim())).filter((n) => Number.isFinite(n) && n > 0).join(",");
	else if (photo !== void 0) body[F.PHOTO] = photo;
	if (task_date !== void 0) body[F.DATE_OF_THE_TASK] = task_date || "";
	else if (due_date !== void 0) body[F.DATE_OF_THE_TASK] = due_date || "";
	if (start_time !== void 0) body[F.TASK_START_TIME] = start_time || "";
	if (end_time !== void 0) body[F.TASK_END_TIME] = end_time || "";
	if (completed_at !== void 0) body[F.TASK_COMPLETED_AT] = completed_at || "";
	if (help_status !== void 0) body[F.TASK_HELP_STATUS] = helpStatusCode(help_status);
	if (needs_payment !== void 0) body[F.NEEDS_PAYMENT] = needs_payment ? O.NEEDS_PAYMENT.YES : O.NEEDS_PAYMENT.NO;
	if (price !== void 0) body[F.PRICE] = price || "";
	if (finish_status !== void 0) {
		const code = String(finish_status);
		if (!FINISH_STATUS_TO_LABEL[code]) throw new Error(`Invalid care-task finish status: ${code}`);
		body[F.TASK_FINISH_STATUS] = code;
	}
	if (status !== void 0) {
		body[F.TASK_FINISH_STATUS] = finishStatusFromLegacy(status);
		if (status === "completed") body[F.TASK_COMPLETED_AT] = body[F.TASK_COMPLETED_AT] || (/* @__PURE__ */ new Date()).toISOString();
	}
	if (Object.keys(body).length > 0) await wordpressCCTFetch(CCT_SLUG, {
		id,
		method: "PUT",
		body
	});
	const taskId = normalizeWpObjectId(id);
	if (finish_status !== void 0 || status !== void 0) try {
		const code = String(body[F.TASK_FINISH_STATUS] ?? "");
		const label = FINISH_STATUS_TO_LABEL[code] || String(status ?? code);
		const [{ notifyTaskStatusChanged }, task, rels] = await Promise.all([
			import("../_libs/_12.mjs").then((n) => n.n),
			wordpressCCTFetch(CCT_SLUG, { id }).catch(() => null),
			wordpressFetch(`jet-rel/${REL_TASK_ASSIGNEE}/children/${taskId}`)
		]);
		await notifyTaskStatusChanged([task?.cct_author_id ?? task?.author_id ?? null, ...Array.isArray(rels) ? rels.map((r) => r.child_object_id) : []], String(taskId), label);
	} catch {}
	if (assigned_to !== void 0) {
		const assignedUserIds = (Array.isArray(assigned_to) ? assigned_to : assigned_to ? [assigned_to] : []).map(normalizeWpObjectId).filter(Boolean);
		for (const assignedUserId of assignedUserIds) await wordpressFetch(`jet-rel/${REL_TASK_ASSIGNEE}`, {
			method: "POST",
			body: {
				parent_id: taskId,
				child_id: assignedUserId,
				context: "child",
				store_items_type: "update",
				meta: { [ASSIGNEE_FIELD]: ASSIGNEE_STATUS_TO_CODE["pending"] }
			}
		});
		try {
			const { notifyTaskAssigned } = await import("../_libs/_12.mjs").then((n) => n.n);
			await notifyTaskAssigned(assignedUserIds, (await wordpressCCTFetch(CCT_SLUG, { id }).catch(() => null))?.[F.TITLE] || title || "Care task", String(taskId));
		} catch {}
	}
	if (cared_one_id !== void 0) {
		const caredOneNum = normalizeWpObjectId(cared_one_id);
		if (taskId && caredOneNum) await wordpressFetch(`jet-rel/${REL_TASK_CARED_ONE}`, {
			method: "POST",
			body: {
				parent_id: taskId,
				child_id: caredOneNum,
				context: "child",
				store_items_type: "replace"
			}
		});
	}
}
async function deleteCareTaskWordPress(id) {
	await wordpressCCTFetch(CCT_SLUG, {
		id,
		method: "DELETE"
	});
}
/**
* Link a calendar event to a task via REL 263 (204. Care Task → 187. User's
* calendar event). Relation 263 is defined in the dictionary but not yet
* registered in the data dictionary.
*/
async function linkTaskToCalendarEventWordPress(taskId, eventId) {
	const tid = normalizeWpObjectId(taskId);
	const eid = normalizeWpObjectId(eventId);
	if (!tid || !eid) throw new Error("Invalid task or calendar-event ID");
	const body = {
		parent_id: tid,
		child_id: eid,
		context: "child",
		store_items_type: "update"
	};
	try {
		await wordpressFetch(`jet-rel/${REL_TASK_CALENDAR}`, {
			method: "POST",
			body
		});
	} catch (err) {
		if (!/40[13]/.test(String(err?.message || ""))) throw err;
		const { wpAdminOps } = await import("../_libs/_5.mjs").then((n) => n.x);
		const res = await wpAdminOps("set_relation", {
			relation_id: Number(REL_TASK_CALENDAR),
			parent_id: tid,
			child_ids: [eid],
			context: "child",
			store_items_type: "update"
		});
		if (!res?.ok) throw new Error(res?.error || "Could not link task to calendar event");
	}
}
/** Update an assignee's response status (pending/accepted/rejected) on REL 108 meta field `a55`. */
async function updateAssigneeStatusWordPress(taskId, userId, status) {
	const tid = normalizeWpObjectId(taskId);
	const uid = normalizeWpObjectId(userId);
	if (!tid || !uid) throw new Error("Invalid task or user ID");
	await wordpressFetch(`jet-rel/${REL_TASK_ASSIGNEE}`, {
		method: "POST",
		body: {
			parent_id: tid,
			child_id: uid,
			context: "child",
			store_items_type: "update",
			meta: { [ASSIGNEE_FIELD]: ASSIGNEE_STATUS_TO_CODE[status] }
		}
	});
}
//#endregion
export { source_wordpress_exports as a, linkTaskToCalendarEventWordPress as i, deleteCareTaskWordPress as n, updateAssigneeStatusWordPress as o, fetchCareTasksWordPress as r, updateCareTaskWordPress as s, createCareTaskWordPress as t };
