import "../_runtime.mjs";
import { a as wordpressFetch, i as wordpressCCTFetch } from "./wordpress-client-b834cpZh.mjs";
import { t as getCurrentUserId } from "./current-user-CV-pp6xq.mjs";
import { n as R, r as T } from "./wp-schema-Dnlz0TVP.mjs";
import { a as filterAppScope, t as appScopeBody } from "./app-scope-Cq6C10CZ.mjs";
import { t as readLinkedCCTRows } from "./cct-rows-C0yQLswP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/source.wordpress-4K22Mifm.js
/**
* Notifications — JetEngine CCT `notification`
*
* Live fields: a55=type, a56=title, a57=content, a58=action url, a59=is read
*
* Recipient linkage is via JetEngine relation configured in WP admin.
* Relation ID is read from VITE env so it can change without code edits.
*/
var SLUG = T.notification.slug;
var F = T.notification.f;
var READ = T.notification.opt.NOTIFICATION_IS_READ;
var TYPE = T.notification.opt.NOTIFICATION_TYPE;
var REL_USER_NOTIFICATION = R.userNotifications;
/**
* a55 is a RADIO field: only the dictionary codes below are valid values.
* Semantic event names used across the app map onto those codes; anything
* without its own code (task, job, group post) is a SYSTEM notification.
* Mirrors TYPE_CODE in supabase/functions/_shared/notify-core.ts.
*/
var TYPE_CODE = {
	chat: TYPE.USER_CHAT,
	message: TYPE.USER_CHAT,
	booking: TYPE.BOOKING,
	system: TYPE.SYSTEM,
	task: TYPE.SYSTEM,
	job: TYPE.SYSTEM,
	community: TYPE.SYSTEM,
	location: TYPE.LOCATION_ALERT,
	safe_zone: TYPE.LOCATION_ALERT,
	location_alert: TYPE.LOCATION_ALERT,
	check_in: TYPE.CHECK_IN,
	checkin: TYPE.CHECK_IN,
	medicine: TYPE.MEDICINE
};
/** Radio code → semantic type the UI filters and icons are keyed on. */
var CODE_TYPE = {
	[TYPE.USER_CHAT]: "chat",
	[TYPE.BOOKING]: "booking",
	[TYPE.SYSTEM]: "system",
	[TYPE.LOCATION_ALERT]: "location",
	[TYPE.CHECK_IN]: "check_in",
	[TYPE.MEDICINE]: "medicine"
};
function typeToCode(type) {
	return TYPE_CODE[type] ?? TYPE.SYSTEM;
}
function codeToType(code) {
	const raw = String(code ?? "");
	return CODE_TYPE[raw] ?? (raw && !/^b\d+$/.test(raw) ? raw : "system");
}
function isRead(v) {
	return v === true || v === "yes" || v === "1" || v === 1 || v === READ.YES;
}
async function fetchNotificationsWordPress() {
	try {
		const userId = getCurrentUserId();
		if (!userId || !REL_USER_NOTIFICATION) return [];
		const links = await wordpressFetch(`jet-rel/${REL_USER_NOTIFICATION}/children/${userId}`);
		if (!Array.isArray(links) || links.length === 0) return [];
		const ids = links.map((l) => String(l.child_object_id || "")).filter(Boolean);
		if (ids.length === 0) return [];
		const raw = await readLinkedCCTRows(SLUG, ids);
		if (raw.length === 0) return [];
		return filterAppScope("notification", raw).map((n) => ({
			id: String(n.id ?? n._ID),
			user_id: userId,
			type: codeToType(n[F.NOTIFICATION_TYPE]),
			title: n[F.NOTIFICATION_TITLE] || null,
			message: n[F.NOTIFICATION_CONTENT] || null,
			is_read: isRead(n[F.NOTIFICATION_IS_READ]),
			action_url: n[F.ACTION_URL] || null,
			created_at: n.created_at ?? n.cct_created ?? null
		}));
	} catch (error) {
		throw error;
	}
}
async function markNotificationReadWordPress(id) {
	await wordpressCCTFetch(SLUG, {
		id,
		method: "PUT",
		body: { [F.NOTIFICATION_IS_READ]: READ.YES }
	});
}
async function markAllNotificationsReadWordPress() {
	const list = await fetchNotificationsWordPress();
	await Promise.all(list.filter((n) => !n.is_read).map((n) => markNotificationReadWordPress(n.id)));
}
/**
* Create a notification and link it to the recipient via the user→notification relation.
* `action_url` is a frontend route like "/tasks/123" or "/messages/abc".
*/
async function createNotificationWordPress(input) {
	let url = input.action_url || "";
	if (!url && input.related_type && input.related_id) {
		const base = {
			task: "/dashboard?tab=tasks",
			message: "/inbox?tab=messages",
			booking: "/bookings",
			community: "/community",
			shared_task: "/tasks",
			location: "/find",
			safe_zone: "/find"
		}[input.related_type] || "/inbox?tab=notifications";
		url = `${base}${base.includes("?") ? "&" : "?"}id=${input.related_id}`;
	}
	const { sendNotification } = await import("./dispatch-D0Zv_RsR.mjs");
	if (await sendNotification({
		user_id: input.user_id,
		type: input.type,
		title: input.title,
		message: input.message,
		action_url: url
	})) return;
	const created = await wordpressCCTFetch(SLUG, {
		method: "POST",
		body: {
			[F.NOTIFICATION_TYPE]: typeToCode(input.type),
			[F.NOTIFICATION_TITLE]: input.title,
			[F.NOTIFICATION_CONTENT]: input.message,
			[F.ACTION_URL]: url,
			[F.NOTIFICATION_IS_READ]: READ.NO,
			...appScopeBody("notification")
		}
	});
	const newId = created?.item_id ?? created?._ID ?? created?.id;
	if (newId && REL_USER_NOTIFICATION) try {
		await wordpressFetch(`jet-rel/${REL_USER_NOTIFICATION}`, {
			method: "POST",
			body: {
				parent_id: String(input.user_id),
				child_id: String(newId),
				context: "child_object",
				store_items_type: "replace"
			}
		});
	} catch {}
}
//#endregion
export { createNotificationWordPress, fetchNotificationsWordPress, markAllNotificationsReadWordPress, markNotificationReadWordPress };
