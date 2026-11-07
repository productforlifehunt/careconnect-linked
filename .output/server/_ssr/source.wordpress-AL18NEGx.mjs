import "../_runtime.mjs";
import { a as wordpressFetch, i as wordpressCCTFetch } from "./wordpress-client-b834cpZh.mjs";
import { t as getCurrentUserId } from "./current-user-CV-pp6xq.mjs";
import { n as R, r as T } from "./wp-schema-Dnlz0TVP.mjs";
import { o as isInAppScope, t as appScopeBody } from "./app-scope-Cq6C10CZ.mjs";
import { t as readLinkedCCTRows } from "./cct-rows-C0yQLswP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/source.wordpress-AL18NEGx.js
/**
* Calendar — JetEngine CCT 187 `users_calendar_event`
* Shared across every app on the backend: field a91 (App) scopes each event, so
* reads filter it and writes stamp it (see features/shared/app-scope).
* Field map (data dictionary CCT 187):
*   a55=title  a56=description  a57=start_at  a58=end_at  a59=all_day
*   a60=event_type  a61=location  a62=timezone
*   a63=status   (b55 confirmed | b56 tentative | b57 cancelled)
*   a64=priority (b55 normal | b56 low | b57 high | b58 urgent)
*   a65=color  a66=rrule  a67=rrule_until  a68=exdates  a69=rdates
*   a70=recurrence_id
*   a71=show_as  (b55 busy | b56 free | b57 tentative | b58 oof)
*   a72=visibility (b55 default | b56 public | b57 private | b58 confidential)
*   a73=reminders  a74=is_availability (b55 Yes | b56 No)
*   a75=availability_note  a76=rsvp_required  a77=allow_comments
*   a78=external_source (b55 internal | b56 google | b57 outlook | b58 apple)
*   a79=ical_uid  a80=sequence  a81=etag  a82=google_event_id  a83=meeting_url
*   a84=attachments  a85=last_sync_at  a86=sync_token  a87=geo_lat  a88=geo_lng
*   a89=tags  a90=custom_data  a91=App
* Relations: 190 users→event (owner), 262 event→users (invitees)
*/
var SLUG = T.calendarEvent.slug;
var REL_USER_EVENT = R.userCalendarEvents;
var REL_EVENT_INVITEES = R.calendarEventInvitees;
var STATUS_OUT = {
	confirmed: "b55",
	tentative: "b56",
	cancelled: "b57"
};
var STATUS_IN = {
	b55: "confirmed",
	b56: "tentative",
	b57: "cancelled"
};
var PRIO_OUT = {
	urgent: "1",
	high: "3",
	normal: "5",
	low: "9"
};
function prioIn(v) {
	const n = Number(v);
	if (!Number.isFinite(n) || n === 0) return "normal";
	if (n <= 2) return "urgent";
	if (n <= 4) return "high";
	if (n <= 6) return "normal";
	return "low";
}
var SHOWAS_OUT = {
	busy: "b55",
	free: "b56",
	tentative: "b57",
	oof: "b58"
};
var SHOWAS_IN = {
	b55: "busy",
	b56: "free",
	b57: "tentative",
	b58: "oof"
};
var VIS_OUT = {
	default: "b55",
	public: "b56",
	private: "b57",
	confidential: "b58"
};
var VIS_IN = {
	b55: "default",
	b56: "public",
	b57: "private",
	b58: "confidential"
};
var EVTYPE_OUT = {
	medicine: "b55",
	check_in: "b56",
	habit: "b57"
};
var EVTYPE_IN = {
	b55: "medicine",
	b56: "check_in",
	b57: "personal",
	b58: "task"
};
function encodeEventType(t) {
	return EVTYPE_OUT[String(t || "")] || "b58";
}
function typeTag(t) {
	return t ? `type:${t}` : "";
}
function decodeEventType(raw, tags) {
	const tag = String(tags || "").split(",").map((x) => x.trim()).find((x) => x.startsWith("type:"));
	if (tag) return tag.slice(5);
	const code = String(raw || "");
	if (EVTYPE_IN[code]) return EVTYPE_IN[code];
	return code || "personal";
}
var YESNO_OUT = (v) => v ? "b55" : "b56";
var YESNO_IN = (v) => v === "b55" || v === true || v === 1 || v === "1" || v === "yes";
function normalizeWPUserId(id) {
	return String(id ?? "").replace(/^wp-/, "");
}
function mapEventFromWP(raw) {
	return {
		id: String(raw.id ?? raw._ID),
		title: raw.a55 ?? "",
		description: raw.a56 ?? "",
		start_at: raw.a57 ?? raw.cct_created ?? "",
		end_at: raw.a58 ?? "",
		all_day: YESNO_IN(raw.a59),
		event_type: decodeEventType(raw.a60, raw.a89),
		location: raw.a61 ?? "",
		timezone: raw.a62 ?? void 0,
		status: STATUS_IN[raw.a63] || raw.a63 || "confirmed",
		priority: prioIn(raw.a64),
		color: raw.a65 ?? "",
		rrule: raw.a66 ?? void 0,
		exdates: raw.a68 ?? void 0,
		show_as: SHOWAS_IN[raw.a71] || raw.a71 || "busy",
		visibility: VIS_IN[raw.a72] || raw.a72 || "default",
		reminders: (() => {
			try {
				return raw.a73 ? JSON.parse(raw.a73) : [];
			} catch {
				return [];
			}
		})(),
		is_availability: YESNO_IN(raw.a74),
		availability_note: raw.a75 ?? void 0,
		meeting_url: raw.a83 ?? void 0
	};
}
/** JetEngine Datetime columns store `YYYY-MM-DD HH:mm:ss` local time. */
function wpDateTime(v) {
	if (!v) return "";
	const d = new Date(v);
	if (Number.isNaN(d.getTime())) return String(v).replace("T", " ").replace(/\..*$/, "");
	const pad = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function mapEventToWP(e) {
	const b = {};
	if (e.title !== void 0) b["a55"] = e.title;
	if (e.description !== void 0) b["a56"] = e.description;
	if (e.start_at !== void 0) b["a57"] = wpDateTime(e.start_at);
	if (e.end_at !== void 0) b["a58"] = wpDateTime(e.end_at);
	if (e.all_day !== void 0) b["a59"] = YESNO_OUT(e.all_day);
	if (e.event_type !== void 0) {
		b["a60"] = encodeEventType(e.event_type);
		b["a89"] = typeTag(e.event_type);
	}
	if (e.location !== void 0) b["a61"] = e.location;
	if (e.timezone !== void 0) b["a62"] = e.timezone;
	if (e.status !== void 0) b["a63"] = STATUS_OUT[e.status] ?? e.status;
	if (e.priority !== void 0) b["a64"] = String(PRIO_OUT[e.priority] ?? e.priority);
	if (e.color !== void 0) b["a65"] = e.color;
	if (e.rrule !== void 0) b["a66"] = e.rrule;
	if (e.exdates !== void 0) b["a68"] = e.exdates;
	if (e.show_as !== void 0) b["a71"] = SHOWAS_OUT[e.show_as] ?? e.show_as;
	if (e.visibility !== void 0) b["a72"] = VIS_OUT[e.visibility] ?? e.visibility;
	if (e.reminders !== void 0) b["a73"] = JSON.stringify(e.reminders);
	if (e.is_availability !== void 0) b["a74"] = YESNO_OUT(e.is_availability);
	if (e.availability_note !== void 0) b["a75"] = e.availability_note;
	if (e.meeting_url !== void 0) b["a83"] = e.meeting_url;
	return b;
}
async function fetchCalendarEventsWordPress() {
	const userId = getCurrentUserId();
	if (!userId) return [];
	return fetchCalendarEventsForUserWordPress(userId);
}
async function fetchCalendarEventsForUserWordPress(userIdInput) {
	const userId = normalizeWPUserId(userIdInput);
	if (!userId) return [];
	try {
		const [ownedRels, invitedRels] = await Promise.all([wordpressFetch(`jet-rel/${REL_USER_EVENT}/children/${userId}`), wordpressFetch(`jet-rel/${REL_EVENT_INVITEES}/parents/${userId}`)]);
		const ownedIds = (Array.isArray(ownedRels) ? ownedRels : []).map((r) => String(r?.child_object_id ?? r?._ID ?? r?.id ?? "").replace(/^wp-/, "")).filter(Boolean);
		const invitedIds = (Array.isArray(invitedRels) ? invitedRels : []).map((r) => String(r?.parent_object_id ?? r?._ID ?? r?.id ?? "").replace(/^wp-/, "")).filter(Boolean);
		const allIds = Array.from(/* @__PURE__ */ new Set([...ownedIds, ...invitedIds]));
		if (allIds.length === 0) return [];
		return (await readLinkedCCTRows(SLUG, allIds)).filter((r) => Boolean(r) && isInAppScope("calendarEvent", r)).map(mapEventFromWP);
	} catch {
		return [];
	}
}
async function createCalendarEventWordPress(event) {
	const userId = getCurrentUserId();
	if (!userId) return null;
	return createCalendarEventForUserWordPress(userId, event);
}
async function createCalendarEventForUserWordPress(ownerUserIdInput, event) {
	const userId = normalizeWPUserId(ownerUserIdInput);
	if (!userId) return null;
	const created = await wordpressCCTFetch(SLUG, {
		method: "POST",
		body: {
			...mapEventToWP(event),
			...appScopeBody("calendarEvent")
		}
	});
	const newId = String(created?.item_id ?? created?._ID ?? created?.id ?? "");
	if (!newId) return null;
	try {
		await wordpressFetch(`jet-rel/${REL_USER_EVENT}`, {
			method: "POST",
			body: {
				parent_id: userId,
				child_id: newId,
				context: "child",
				store_items_type: "update"
			}
		});
	} catch {}
	return mapEventFromWP({
		...created,
		id: newId
	});
}
async function updateCalendarEventWordPress(id, patch) {
	await wordpressCCTFetch(SLUG, {
		id,
		method: "PUT",
		body: mapEventToWP(patch)
	});
}
async function deleteCalendarEventWordPress(id) {
	await wordpressCCTFetch(SLUG, {
		id,
		method: "DELETE"
	});
}
//#endregion
export { fetchCalendarEventsWordPress as a, fetchCalendarEventsForUserWordPress as i, createCalendarEventWordPress as n, updateCalendarEventWordPress as o, deleteCalendarEventWordPress as r, createCalendarEventForUserWordPress as t };
