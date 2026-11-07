import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
import { i as getStoredWPUser } from "./wp-auth-DL1jfVY7.mjs";
import { a as wordpressFetch, i as wordpressCCTFetch } from "./wordpress-client-b834cpZh.mjs";
import { n as R, r as T } from "./wp-schema-Dnlz0TVP.mjs";
import { r as fetchRelChildrenOf, t as dedupeRead } from "./rel-batch-97Y7fPM-.mjs";
import { t as readLinkedCCTRows } from "./cct-rows-C0yQLswP.mjs";
import { n as fetchWPUserProfile } from "./wp-users-C2nRIR2f.mjs";
import { t as decodeRel72Meta } from "./rel-meta-Ubi-lVVD.mjs";
import { C as normalizeSlots, D as readReminderMinutes, E as readEvent, M as toFrequencyCode, N as updateEvent, O as scheduleTimeColumns, T as parseRRule, a as LOG_TYPE_HUMAN, b as frequencyFromRow, c as buildReminders, d as dateOf, f as deleteEvent, h as fetchEventsOfType, i as FREQ_EN, k as slotsFromRRule, l as createEvent, n as EVENT_TYPE, o as STATUS_CANCELLED, r as FC, s as STATUS_CONFIRMED, t as APP_CHALLENGED, w as occurrencesOn, x as localDay, y as frequencyForSlots } from "./source.medicine-C8MN5KOu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/source.wordpress-extended-FYtgdTd3.js
var source_wordpress_extended_exports = /* @__PURE__ */ __exportAll({
	createCareNoteWordPress: () => createCareNoteWordPress,
	createCarePlanWordPress: () => createCarePlanWordPress,
	createCareTipWordPress: () => createCareTipWordPress,
	createCaredOneDocumentWordPress: () => createCaredOneDocumentWordPress,
	createCheckinWordPress: () => createCheckinWordPress,
	createEmergencyContactWordPress: () => createEmergencyContactWordPress,
	createUserCaredOneWordPress: () => createUserCaredOneWordPress,
	deleteCareNoteWordPress: () => deleteCareNoteWordPress,
	deleteCarePlanWordPress: () => deleteCarePlanWordPress,
	deleteCareTipWordPress: () => deleteCareTipWordPress,
	deleteCaredOneDocumentWordPress: () => deleteCaredOneDocumentWordPress,
	deleteCheckinWordPress: () => deleteCheckinWordPress,
	deleteEmergencyContactWordPress: () => deleteEmergencyContactWordPress,
	deleteUserCaredOneWordPress: () => deleteUserCaredOneWordPress,
	fetchCareNotesWordPress: () => fetchCareNotesWordPress,
	fetchCarePlansWordPress: () => fetchCarePlansWordPress,
	fetchCareTipsWordPress: () => fetchCareTipsWordPress,
	fetchCaredOneDocumentsWordPress: () => fetchCaredOneDocumentsWordPress,
	fetchCheckinLogsWordPress: () => fetchCheckinLogsWordPress,
	fetchCheckinReceiverIdsWordPress: () => fetchCheckinReceiverIdsWordPress,
	fetchCheckinsWordPress: () => fetchCheckinsWordPress,
	fetchEmergencyContactsWordPress: () => fetchEmergencyContactsWordPress,
	fetchGroupCaredOnesWordPress: () => fetchGroupCaredOnesWordPress,
	fetchTodayCheckinLogsWordPress: () => fetchTodayCheckinLogsWordPress,
	fetchWPUserSafe: () => fetchWPUserSafe,
	logCheckinWordPress: () => logCheckinWordPress,
	setCheckinAssigneesWordPress: () => setCheckinAssigneesWordPress,
	setCheckinReceiversWordPress: () => setCheckinReceiversWordPress,
	updateCareNoteWordPress: () => updateCareNoteWordPress,
	updateCarePlanWordPress: () => updateCarePlanWordPress,
	updateCareTipWordPress: () => updateCareTipWordPress,
	updateCaredOneDocumentWordPress: () => updateCaredOneDocumentWordPress,
	updateCheckinWordPress: () => updateCheckinWordPress,
	updateEmergencyContactWordPress: () => updateEmergencyContactWordPress
});
var REL_USER_CARED_ONE = R.userCaredOnes;
R.caredOneInfoCards;
R.infoCardEmergencyContacts;
var REL_GROUP_MEMBER = R.careGroupMembers;
var REL_CHECKIN_LOG = R.checkinScheduleLogs;
var REL_USER_CARE_TIP = R.caredOneCareTips;
var REL_USER_EMERGENCY_CONTACT = R.caredOneEmergencyContacts;
var REL_USER_CARE_NOTE = R.caredOneCareNotes;
var REL_USER_CARE_DOCUMENT = R.caredOneCareDocuments;
var REL_USER_CARE_PLAN = R.caredOneCarePlans;
var F_LOGEVT = T.userLogEvent.f;
var F_NOTE = T.careNote.f;
var F_TIP = T.careTip.f;
var F_PLAN = T.carePlan.f;
var F_EMG = T.emergencyContact.f;
var F_DOC = T.careDocument.f;
T.infoCard.f;
var YES = "b55";
var NO = "b56";
function normalizeWpObjectId(value) {
	return Number(String(value ?? "").replace(/^wp-/, ""));
}
function isYes(value) {
	if (value === true) return true;
	if (typeof value === "string") {
		const v = value.toLowerCase();
		return v === "b55" || v === "yes" || v === "1" || v === "true";
	}
	return false;
}
function numOrNull(value) {
	if (value === void 0 || value === null || value === "") return null;
	const n = Number(value);
	return Number.isFinite(n) ? n : null;
}
/** Check-in type (CCT 187 a97 Checkin log type): AI | Human. */
function encodeCheckinLogType(value) {
	const first = (Array.isArray(value) ? value : value ? [value] : []).map((v) => String(v).toLowerCase())[0];
	if (first === "ai" || first === "AI") return "AI";
	if (first === "human" || first === "Human") return LOG_TYPE_HUMAN;
	return "";
}
function decodeCheckinLogType(value) {
	const v = String(value ?? "");
	if (v === "AI") return ["ai"];
	if (v === "Human") return ["human"];
	return [];
}
async function fetchRelatedCctChildren(relationId, parentId, cctSlug) {
	const pid = normalizeWpObjectId(parentId);
	if (!pid) throw new Error(`Invalid parent ID for relation ${relationId}`);
	return dedupeRead(`rel-children:${relationId}:${pid}:${cctSlug}`, async () => {
		const rels = await wordpressFetch(`jet-rel/${relationId}/children/${pid}`);
		if (!Array.isArray(rels) || rels.length === 0) return [];
		return (await Promise.all(rels.map((r) => wordpressCCTFetch(cctSlug, { id: r.child_object_id })))).filter((row) => row && typeof row === "object");
	});
}
/** Reads a real WP user (core fields) plus its extended-profile CCTs through
*  the privileged `wp-admin-ops` proxy. The display name comes from the
*  per-app column on CCT 151 (a556 ChallengeD / a557 CareCNC) — never from the
*  shared WordPress user name. */
async function fetchWPUserSafe(userId) {
	const u = await fetchWPUserProfile(userId);
	return {
		...u,
		avatar_urls: { "96": u.avatar_url }
	};
}
async function linkRel(relId, parentId, childId, meta) {
	if (!parentId || !childId) throw new Error(`Invalid object ID for relation ${relId}`);
	await wordpressFetch(`jet-rel/${relId}`, {
		method: "POST",
		body: {
			parent_id: parentId,
			child_id: childId,
			context: "child",
			store_items_type: "update",
			...meta ? { meta } : {}
		}
	});
}
async function createUserCaredOneWordPress(caredOne) {
	const stored = getStoredWPUser();
	if (!stored?.user_id) throw new Error("Not authenticated");
	const childId = normalizeWpObjectId(caredOne.caredOneId);
	if (!childId) throw new Error("Invalid cared one user");
	if (String(childId) === String(normalizeWpObjectId(String(stored.user_id)))) throw new Error("You cannot add yourself");
	const { encodeRel219Meta } = await import("../_libs/_8.mjs").then((n) => n.r);
	await linkRel(REL_USER_CARED_ONE, Number(stored.user_id), childId, encodeRel219Meta("pending"));
	try {
		const { sendNotification } = await import("./dispatch-D0Zv_RsR.mjs");
		const me = await fetchWPUserSafe(Number(stored.user_id));
		const myName = me?.full_name || me?.name || "Someone";
		await sendNotification({
			user_id: childId,
			type: "system",
			title: `${myName} asked to be listed as your caregiver`,
			message: `${myName} would like to be listed as the person caring for you. Nothing is shared until you agree. Open the people caring for you in Settings to accept or decline.`,
			action_url: "/settings"
		});
	} catch {}
}
async function deleteUserCaredOneWordPress(id) {
	const stored = getStoredWPUser();
	if (!stored?.user_id) throw new Error("Not authenticated");
	const childId = normalizeWpObjectId(id);
	if (!childId) throw new Error("Invalid cared one user");
	await wordpressFetch(`jet-rel/${REL_USER_CARED_ONE}`, {
		method: "POST",
		body: {
			parent_id: Number(stored.user_id),
			child_id: childId,
			context: "child",
			store_items_type: "disconnect"
		}
	});
}
async function fetchGroupCaredOnesWordPress(groupId) {
	const rels = await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}/children/${normalizeWpObjectId(groupId)}`);
	if (!Array.isArray(rels) || rels.length === 0) return [];
	const userIds = rels.filter((r) => {
		const { memberRoles } = decodeRel72Meta(r?.meta);
		return memberRoles.includes("cared one");
	}).map((r) => Number(r.child_object_id)).filter(Boolean);
	return await Promise.all(userIds.map(async (userId) => {
		const user = await fetchWPUserSafe(userId);
		const fullName = user.full_name;
		return {
			id: `wp-${userId}`,
			user_id: `wp-${userId}`,
			name: fullName,
			full_name: fullName,
			relationship: null,
			avatar_url: user.avatar_urls?.["96"] || null,
			profile: {
				id: `wp-${userId}`,
				user_id: `wp-${userId}`,
				full_name: fullName,
				email: user.email || null,
				avatar_url: user.avatar_urls?.["96"] || null
			},
			created_at: null
		};
	}));
}
async function fetchCheckinsWordPress(caredOneId) {
	try {
		return (await fetchEventsOfType(caredOneId, EVENT_TYPE.CHECKIN)).map((i) => {
			const slots = slotsFromRRule(i[FC.RRULE], i[FC.START_AT]);
			const freqCode = frequencyFromRow(i[FC.RRULE], false, slots);
			return {
				id: String(i.id || i._ID),
				user_id: caredOneId,
				name: i[FC.TITLE] || "Daily Check-In",
				detail: i[FC.DESCRIPTION] || null,
				frequency: FREQ_EN[freqCode],
				frequency_code: freqCode,
				time_slot: slots,
				today_slots: occurrencesOn(localDay(), {
					startAt: i[FC.START_AT],
					rrule: i[FC.RRULE],
					exdates: i[FC.EXDATES],
					rdates: i[FC.RDATES]
				}),
				start_date: dateOf(i[FC.START_AT]),
				end_date: parseRRule(i[FC.RRULE])?.until ?? null,
				is_active: String(i[FC.STATUS] || STATUS_CONFIRMED) !== STATUS_CANCELLED,
				reminder_time_before: readReminderMinutes(i[FC.REMINDERS]),
				time_to_send_to_caregiver: numOrNull(i[FC.MEDICINE_CHECKIN_TO_REMIND_CAREGIVER_TIME_AFTER_MISSING]),
				check_in_type: decodeCheckinLogType(i[FC.CHECKIN_LOG_TYPE]),
				checked_by_ai: String(i[FC.CHECKIN_LOG_TYPE] || "") === "AI",
				created_at: i.cct_created || i.created_at
			};
		});
	} catch (e) {
		throw e instanceof Error ? e : new Error(String(e));
	}
}
/** Check-in notification receivers — JetEngine Relation 260. */
async function fetchCheckinReceiverIdsWordPress(checkinId) {
	const rels = await wordpressFetch(`jet-rel/${R.checkinNotificationReceivers}/children/${normalizeWpObjectId(checkinId)}`);
	return Array.isArray(rels) ? rels.map((r) => String(r.child_object_id)).filter(Boolean) : [];
}
async function setCheckinUserRelation(relationId, checkinId, userIds) {
	const parentId = normalizeWpObjectId(checkinId);
	if (!parentId) throw new Error("Invalid check-in schedule");
	const ids = (userIds || []).map((v) => normalizeWpObjectId(v)).filter(Boolean);
	const body = {
		parent_id: parentId,
		child_id: ids,
		context: "parent",
		store_items_type: "replace"
	};
	try {
		await wordpressFetch(`jet-rel/${relationId}`, {
			method: "POST",
			body
		});
	} catch (err) {
		if (!/40[13]/.test(String(err?.message || ""))) throw err;
		const { wpAdminOps } = await import("../_libs/_5.mjs").then((n) => n.x);
		const res = await wpAdminOps("set_relation", {
			relation_id: relationId,
			parent_id: parentId,
			child_ids: ids,
			context: "parent",
			store_items_type: "replace"
		});
		if (!res?.ok) throw new Error(res?.error || "Could not save check-in people");
	}
}
function setCheckinAssigneesWordPress(checkinId, userIds) {
	return setCheckinUserRelation(R.checkinScheduleAssignees, checkinId, userIds);
}
function setCheckinReceiversWordPress(checkinId, userIds) {
	return setCheckinUserRelation(R.checkinNotificationReceivers, checkinId, userIds);
}
async function createCheckinWordPress(checkin) {
	const slots = normalizeSlots(checkin.time_slot || ["08:00"]);
	const freq = frequencyForSlots(toFrequencyCode(checkin.frequency), slots);
	const newId = await createEvent({
		[FC.TITLE]: checkin.name,
		[FC.DESCRIPTION]: checkin.detail || "",
		[FC.CUSTOM_EVENT_TYPE]: EVENT_TYPE.CHECKIN,
		[FC.APP]: APP_CHALLENGED,
		...scheduleTimeColumns(freq, slots, checkin.start_date || localDay(), checkin.end_date),
		[FC.STATUS]: STATUS_CONFIRMED,
		[FC.REMINDERS]: buildReminders(checkin.reminder_time_before),
		[FC.CHECKIN_LOG_TYPE]: encodeCheckinLogType(checkin.check_in_type),
		[FC.MEDICINE_CHECKIN_TO_REMIND_CAREGIVER_TIME_AFTER_MISSING]: checkin.time_to_send_to_caregiver != null ? String(checkin.time_to_send_to_caregiver) : ""
	}, checkin.user_id);
	if (checkin.assignee_ids?.length) await setCheckinAssigneesWordPress(String(newId), checkin.assignee_ids);
	if (checkin.receiver_ids?.length) await setCheckinReceiversWordPress(String(newId), checkin.receiver_ids);
}
async function updateCheckinWordPress(id, updates) {
	const body = {};
	if (updates["name"] !== void 0) body[FC.TITLE] = updates["name"];
	if (updates["detail"] !== void 0) body[FC.DESCRIPTION] = updates["detail"];
	if (updates["is_active"] !== void 0) body[FC.STATUS] = updates["is_active"] ? STATUS_CONFIRMED : STATUS_CANCELLED;
	if (updates["reminder_time_before"] !== void 0) body[FC.REMINDERS] = buildReminders(updates["reminder_time_before"]);
	if (updates["time_to_send_to_caregiver"] !== void 0) body[FC.MEDICINE_CHECKIN_TO_REMIND_CAREGIVER_TIME_AFTER_MISSING] = updates["time_to_send_to_caregiver"] != null ? String(updates["time_to_send_to_caregiver"]) : "";
	if (updates["check_in_type"] !== void 0) body[FC.CHECKIN_LOG_TYPE] = encodeCheckinLogType(updates["check_in_type"]);
	else if (updates["checked_by_ai"] !== void 0) body[FC.CHECKIN_LOG_TYPE] = updates["checked_by_ai"] ? "AI" : LOG_TYPE_HUMAN;
	if ([
		"frequency",
		"time_slot",
		"start_date",
		"end_date"
	].some((k) => updates[k] !== void 0)) {
		const row = await readEvent(id);
		const curSlots = slotsFromRRule(row?.[FC.RRULE], row?.[FC.START_AT]);
		const slots = normalizeSlots(updates["time_slot"] !== void 0 ? updates["time_slot"] : curSlots);
		const freq = frequencyForSlots(updates["frequency"] !== void 0 ? toFrequencyCode(updates["frequency"]) : frequencyFromRow(row?.[FC.RRULE], false, curSlots), slots);
		Object.assign(body, scheduleTimeColumns(freq, slots, updates["start_date"] || dateOf(row?.[FC.START_AT]) || localDay(), updates["end_date"] !== void 0 ? updates["end_date"] : parseRRule(row?.[FC.RRULE])?.until ?? null));
	}
	await updateEvent(id, body);
	if (updates["assignee_ids"] !== void 0) await setCheckinAssigneesWordPress(id, updates["assignee_ids"] || []);
	if (updates["receiver_ids"] !== void 0) await setCheckinReceiversWordPress(id, updates["receiver_ids"] || []);
}
async function deleteCheckinWordPress(id) {
	await deleteEvent(id);
}
var CHK_STATUS_CODE = {
	checked: "b55",
	skipped: "b56",
	missed: "b57"
};
var CHK_STATUS_LABEL = {
	b55: "checked",
	b56: "skipped",
	b57: "missed"
};
async function fetchCheckinLogsWordPress(caredOneId) {
	try {
		const checkins = await fetchCheckinsWordPress(caredOneId);
		return (await Promise.all(checkins.map(async (checkin) => {
			try {
				const childIds = (await fetchRelChildrenOf(REL_CHECKIN_LOG, String(normalizeWpObjectId(checkin.id)))).map((c) => c.childId);
				if (!childIds.length) return [];
				const items = await readLinkedCCTRows(T.userLogEvent.slug, childIds);
				return (await Promise.all(items.map(async (item) => {
					const childId = String(item.id ?? item._ID);
					try {
						const statusCode = String(item[F_LOGEVT.CHECK_TYPE] || "b55");
						return {
							id: String(item.id || item._ID || childId),
							checkin_id: String(checkin.id),
							status: CHK_STATUS_LABEL[statusCode] || "checked",
							note: item[F_LOGEVT.LOG_CHECKIN_NOTE] || null,
							checked_by_ai: isYes(item[F_LOGEVT.CHECKED_BY_AI]),
							created_at: item[F_LOGEVT.LOG_EVENT_TIME] || item.cct_created || item.created_at
						};
					} catch (e) {
						throw e instanceof Error ? e : new Error(String(e));
					}
				}))).filter(Boolean);
			} catch (e) {
				throw e instanceof Error ? e : new Error(String(e));
			}
		}))).flat().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
	} catch (e) {
		throw e instanceof Error ? e : new Error(String(e));
	}
}
async function fetchTodayCheckinLogsWordPress(caredOneId) {
	const today = /* @__PURE__ */ new Date();
	today.setHours(0, 0, 0, 0);
	return (await fetchCheckinLogsWordPress(caredOneId)).filter((log) => log.created_at && new Date(log.created_at) >= today);
}
async function logCheckinWordPress(log) {
	const statusCode = CHK_STATUS_CODE[log.status || "checked"] || "b55";
	const now = /* @__PURE__ */ new Date();
	const p = (n) => String(n).padStart(2, "0");
	const stamp = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())} ${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`;
	const result = await wordpressCCTFetch(T.userLogEvent.slug, {
		method: "POST",
		body: {
			[F_LOGEVT.LOG_EVENT_NAME]: "Check-in",
			[F_LOGEVT.CHECK_TYPE]: statusCode,
			[F_LOGEVT.LOG_CHECKIN_NOTE]: log.note || "",
			[F_LOGEVT.CHECKED_BY_AI]: log.checked_by_ai ? YES : NO,
			[F_LOGEVT.LOG_EVENT_TIME]: stamp,
			[F_LOGEVT.FOR_APP]: "challenged"
		}
	});
	const newLogId = normalizeWpObjectId(result?.item_id || result?._ID || result?.id);
	await linkRel(REL_CHECKIN_LOG, normalizeWpObjectId(log.checkin_id || log.medicine_id), newLogId);
	if (log.cared_one_id) try {
		await linkRel(R.userLogEvents, normalizeWpObjectId(log.cared_one_id), newLogId);
	} catch {}
	try {
		const checkinId = String(log.checkin_id || log.medicine_id || "");
		if (checkinId) {
			const receivers = await fetchCheckinReceiverIdsWordPress(checkinId).catch(() => []);
			const { notifyCheckIn } = await import("../_libs/_12.mjs").then((n) => n.n);
			await notifyCheckIn(receivers, String(log.cared_one_id || ""), log.checkin_name || "Check-in", log.status || "checked");
		}
	} catch {}
}
var TIP_CATEGORY_CODE = {
	tip: "b55",
	avoid: "b56"
};
var TIP_CATEGORY_LABEL = {
	b55: "tip",
	b56: "avoid"
};
async function fetchCareTipsWordPress(caredOneId) {
	try {
		return (await fetchRelatedCctChildren(REL_USER_CARE_TIP, caredOneId, T.careTip.slug)).map((t) => ({
			id: String(t.id || t._ID),
			user_id: caredOneId,
			title: t[F_TIP.TITLE] || null,
			content: t[F_TIP.CONTENT] || null,
			category: TIP_CATEGORY_LABEL[String(t[F_TIP.CATEGORY] || "")] || t[F_TIP.CATEGORY] || null,
			is_pinned: isYes(t[F_TIP.IS_PINNED]),
			is_important: isYes(t[F_TIP.IS_PINNED]),
			created_at: t.created_at,
			updated_at: t.updated_at || t.created_at
		}));
	} catch (e) {
		throw e instanceof Error ? e : new Error(String(e));
	}
}
async function createCareTipWordPress(tip) {
	const created = await wordpressCCTFetch(T.careTip.slug, {
		method: "POST",
		body: {
			[F_TIP.TITLE]: tip.title || tip.content.substring(0, 50),
			[F_TIP.CONTENT]: tip.content,
			[F_TIP.CATEGORY]: TIP_CATEGORY_CODE[tip.category || "tip"] || "b55",
			[F_TIP.IS_PINNED]: tip.is_pinned ? YES : NO
		}
	});
	const newId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
	await linkRel(REL_USER_CARE_TIP, normalizeWpObjectId(tip.user_id), newId);
}
async function updateCareTipWordPress(id, updates) {
	const body = {};
	if (updates["title"] !== void 0) body[F_TIP.TITLE] = updates["title"];
	if (updates["content"] !== void 0) body[F_TIP.CONTENT] = updates["content"];
	if (updates["category"] !== void 0) body[F_TIP.CATEGORY] = TIP_CATEGORY_CODE[updates["category"]] || updates["category"];
	const pinned = updates["is_pinned"] ?? updates["is_important"];
	if (pinned !== void 0) body[F_TIP.IS_PINNED] = pinned ? YES : NO;
	await wordpressCCTFetch(T.careTip.slug, {
		id,
		method: "PUT",
		body
	});
}
async function deleteCareTipWordPress(id) {
	await wordpressCCTFetch(T.careTip.slug, {
		id,
		method: "DELETE"
	});
}
async function fetchCarePlansWordPress(caredOneId) {
	try {
		return (await fetchRelatedCctChildren(REL_USER_CARE_PLAN, caredOneId, T.carePlan.slug)).map((p) => ({
			id: String(p.id || p._ID),
			user_id: caredOneId,
			title: p[F_PLAN.TITLE] || null,
			content: p[F_PLAN.CONTENT] || null,
			description: p[F_PLAN.CONTENT] || null,
			is_pinned: isYes(p[F_PLAN.IS_PINNED]),
			status: "active",
			created_at: p.created_at,
			updated_at: p.updated_at
		}));
	} catch (e) {
		throw e instanceof Error ? e : new Error(String(e));
	}
}
async function createCarePlanWordPress(plan) {
	const created = await wordpressCCTFetch(T.carePlan.slug, {
		method: "POST",
		body: {
			[F_PLAN.TITLE]: plan.title,
			[F_PLAN.CONTENT]: plan.content || plan.description || "",
			[F_PLAN.IS_PINNED]: plan.is_pinned ? YES : NO
		}
	});
	const newId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
	await linkRel(REL_USER_CARE_PLAN, normalizeWpObjectId(plan.user_id), newId);
}
async function updateCarePlanWordPress(id, updates) {
	const body = {};
	if (updates["title"] !== void 0) body[F_PLAN.TITLE] = updates["title"];
	if (updates["content"] !== void 0 || updates["description"] !== void 0) body[F_PLAN.CONTENT] = updates["content"] ?? updates["description"];
	if (updates["is_pinned"] !== void 0) body[F_PLAN.IS_PINNED] = updates["is_pinned"] ? YES : NO;
	await wordpressCCTFetch(T.carePlan.slug, {
		id,
		method: "PUT",
		body
	});
}
async function deleteCarePlanWordPress(id) {
	await wordpressCCTFetch(T.carePlan.slug, {
		id,
		method: "DELETE"
	});
}
async function fetchCareNotesWordPress(caredOneId) {
	try {
		return (await fetchRelatedCctChildren(REL_USER_CARE_NOTE, caredOneId, T.careNote.slug)).map((n) => ({
			id: String(n.id || n._ID),
			user_id: caredOneId,
			title: n[F_NOTE.TITLE] || null,
			content: n[F_NOTE.CONTENT] || null,
			author_id: n.author_id || null,
			created_at: n.created_at,
			updated_at: n.updated_at || n.created_at
		}));
	} catch (e) {
		throw e instanceof Error ? e : new Error(String(e));
	}
}
async function createCareNoteWordPress(note) {
	const created = await wordpressCCTFetch(T.careNote.slug, {
		method: "POST",
		body: {
			[F_NOTE.TITLE]: note.title || note.content.substring(0, 50),
			[F_NOTE.CONTENT]: note.content
		}
	});
	const newId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
	await linkRel(REL_USER_CARE_NOTE, normalizeWpObjectId(note.user_id), newId);
}
async function updateCareNoteWordPress(id, updates) {
	const body = {};
	if (updates["title"] !== void 0) body[F_NOTE.TITLE] = updates["title"];
	if (updates["content"] !== void 0) body[F_NOTE.CONTENT] = updates["content"];
	await wordpressCCTFetch(T.careNote.slug, {
		id,
		method: "PUT",
		body
	});
}
async function deleteCareNoteWordPress(id) {
	await wordpressCCTFetch(T.careNote.slug, {
		id,
		method: "DELETE"
	});
}
async function fetchEmergencyContactsWordPress(caredOneId) {
	try {
		return (await fetchRelatedCctChildren(REL_USER_EMERGENCY_CONTACT, caredOneId, T.emergencyContact.slug)).map((c) => ({
			id: String(c.id || c._ID),
			user_id: caredOneId,
			name: c[F_EMG.NAME] || null,
			phone: c[F_EMG.PHONE] || null,
			address: c[F_EMG.ADDRESS] || null,
			content: c[F_EMG.DETAIL] || null,
			relationship: c[F_EMG.RELATIONSHIP] || null,
			note: c[F_EMG.NOTE] || null,
			created_at: c.created_at
		}));
	} catch (e) {
		throw e instanceof Error ? e : new Error(String(e));
	}
}
async function createEmergencyContactWordPress(contact) {
	const created = await wordpressCCTFetch(T.emergencyContact.slug, {
		method: "POST",
		body: {
			[F_EMG.NAME]: contact.name,
			[F_EMG.PHONE]: contact.phone || "",
			[F_EMG.ADDRESS]: contact.address || "",
			[F_EMG.RELATIONSHIP]: contact.relationship || "",
			[F_EMG.DETAIL]: contact.content || "",
			[F_EMG.NOTE]: contact.note || ""
		}
	});
	const newId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
	await linkRel(REL_USER_EMERGENCY_CONTACT, normalizeWpObjectId(contact.user_id), newId);
}
async function updateEmergencyContactWordPress(id, updates) {
	const body = {};
	if (updates["name"] !== void 0) body[F_EMG.NAME] = updates["name"];
	if (updates["phone"] !== void 0) body[F_EMG.PHONE] = updates["phone"];
	if (updates["address"] !== void 0) body[F_EMG.ADDRESS] = updates["address"];
	if (updates["relationship"] !== void 0) body[F_EMG.RELATIONSHIP] = updates["relationship"];
	if (updates["content"] !== void 0) body[F_EMG.DETAIL] = updates["content"];
	if (updates["note"] !== void 0) body[F_EMG.NOTE] = updates["note"];
	await wordpressCCTFetch(T.emergencyContact.slug, {
		id,
		method: "PUT",
		body
	});
}
async function deleteEmergencyContactWordPress(id) {
	await wordpressCCTFetch(T.emergencyContact.slug, {
		id,
		method: "DELETE"
	});
}
async function fetchCaredOneDocumentsWordPress(caredOneId) {
	try {
		const docs = await fetchRelatedCctChildren(REL_USER_CARE_DOCUMENT, caredOneId, T.careDocument.slug);
		const { resolveWPMedia, parseMediaIds } = await import("../_libs/_26.mjs").then((n) => n.i);
		return await Promise.all(docs.map(async (d) => {
			const rawIds = d[F_DOC.ATTACHMENTS];
			const attachments = await resolveWPMedia(rawIds);
			return {
				id: String(d.id || d._ID),
				user_id: caredOneId,
				title: d[F_DOC.NAME] || null,
				name: d[F_DOC.NAME] || null,
				description: d[F_DOC.CONTENT] || null,
				content: d[F_DOC.CONTENT] || null,
				attachment_ids: parseMediaIds(rawIds),
				attachments,
				created_at: d.created_at,
				updated_at: d.updated_at || d.created_at
			};
		}));
	} catch (e) {
		throw e instanceof Error ? e : new Error(String(e));
	}
}
async function createCaredOneDocumentWordPress(doc) {
	const { serializeMediaIds } = await import("../_libs/_26.mjs").then((n) => n.i);
	const created = await wordpressCCTFetch(T.careDocument.slug, {
		method: "POST",
		body: {
			[F_DOC.NAME]: doc.title,
			[F_DOC.CONTENT]: doc.description || "",
			[F_DOC.ATTACHMENTS]: serializeMediaIds(doc.attachment_ids || [])
		}
	});
	const newId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
	await linkRel(REL_USER_CARE_DOCUMENT, normalizeWpObjectId(doc.user_id), newId);
}
async function updateCaredOneDocumentWordPress(id, updates) {
	const body = {};
	if (updates["title"] !== void 0) body[F_DOC.NAME] = updates["title"];
	if (updates["name"] !== void 0) body[F_DOC.NAME] = updates["name"];
	if (updates["description"] !== void 0) body[F_DOC.CONTENT] = updates["description"];
	if (updates["content"] !== void 0) body[F_DOC.CONTENT] = updates["content"];
	if (updates["attachment_ids"] !== void 0) {
		const { serializeMediaIds } = await import("../_libs/_26.mjs").then((n) => n.i);
		body[F_DOC.ATTACHMENTS] = serializeMediaIds(updates["attachment_ids"] || []);
	}
	await wordpressCCTFetch(T.careDocument.slug, {
		id,
		method: "PUT",
		body
	});
}
async function deleteCaredOneDocumentWordPress(id) {
	await wordpressCCTFetch(T.careDocument.slug, {
		id,
		method: "DELETE"
	});
}
//#endregion
export { updateCaredOneDocumentWordPress as A, fetchTodayCheckinLogsWordPress as C, updateCareNoteWordPress as D, source_wordpress_extended_exports as E, updateEmergencyContactWordPress as M, updateCarePlanWordPress as O, fetchGroupCaredOnesWordPress as S, logCheckinWordPress as T, fetchCareTipsWordPress as _, createCheckinWordPress as a, fetchCheckinsWordPress as b, deleteCareNoteWordPress as c, deleteCaredOneDocumentWordPress as d, deleteCheckinWordPress as f, fetchCarePlansWordPress as g, fetchCareNotesWordPress as h, createCaredOneDocumentWordPress as i, updateCheckinWordPress as j, updateCareTipWordPress as k, deleteCarePlanWordPress as l, deleteUserCaredOneWordPress as m, createCarePlanWordPress as n, createEmergencyContactWordPress as o, deleteEmergencyContactWordPress as p, createCareTipWordPress as r, createUserCaredOneWordPress as s, createCareNoteWordPress as t, deleteCareTipWordPress as u, fetchCaredOneDocumentsWordPress as v, fetchWPUserSafe as w, fetchEmergencyContactsWordPress as x, fetchCheckinLogsWordPress as y };
