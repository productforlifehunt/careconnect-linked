import "../_runtime.mjs";
import { r as T } from "./wp-schema-Dnlz0TVP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-scope-Cq6C10CZ.js
/**
* App scoping for CCTs shared across every app on the merged WordPress backend.
*
* Notifications (185), Chat Conversation (121), Calendar Event (187) and
* Notification Token (186) all live in ONE table shared by Afresh / Adry /
* Ablocked / BeNotch / ChallengeD / CareCNC. Without an explicit app filter a
* quit-smoking log or a workout reminder shows up inside the care app.
*
* Every read of those CCTs MUST filter by the scope code, and every write MUST
* stamp it. Codes are opaque — they come from the dictionary, never inferred.
*/
/**
* Opaque option codes for the "App" radio. Identical option order on CCT 121 /
* 185 / 186 / 187, but we still read each one from its own CCT definition so a
* future divergence is caught by the generator, not by users.
*/
var APP_CODE = {
	notification: T.notification.opt.THIS_IS_THE_NOTIFICATION_FOR_APP,
	notificationToken: T.notificationToken.opt.APP,
	chatConversation: T.chatConversation.opt.APP,
	calendarEvent: T.calendarEvent.opt.APP
};
/** Field code holding the app scope, per CCT. */
var APP_FIELD = {
	notification: T.notification.f.THIS_IS_THE_NOTIFICATION_FOR_APP,
	notificationToken: T.notificationToken.f.APP,
	chatConversation: T.chatConversation.f.APP,
	calendarEvent: T.calendarEvent.f.APP
};
T.afreshCommunityPost.f.COMMUNITY_TYPE;
var COMMUNITY_TYPE_CODE = T.afreshCommunityPost.opt.COMMUNITY_TYPE;
/**
* Resolve the running brand to its app scope. Mirrors SiteContext.detectSite()
* without importing React so data sources can call it freely.
*/
function currentAppScope() {
	if (typeof window === "undefined") return "challenged";
	try {
		const p = new URLSearchParams(window.location.search).get("__site");
		if (p === "careconnected" || p && p.startsWith("carecnc")) return "carecnc";
		if (p === "safety" || p && p.startsWith("notchsafety")) return "challenged";
		if (p && p.startsWith("challenged")) return "challenged";
		const host = window.location.host;
		const hostname = window.location.hostname;
		if (/^(www\.)?carecnc\.com$/.test(host) || /^(www\.)?carecnc\.com$/.test(hostname)) return "carecnc";
	} catch {}
	return "challenged";
}
var SCOPE_KEY = {
	afresh: "AFRESH",
	adry: "ADRY",
	ablocked: "ABLOCKED",
	benotch: "BENOTCH",
	challenged: "CHALLENGED",
	carecnc: "CARECNC"
};
/** Opaque option code for the current (or given) app on a scoped CCT. */
function appScopeCode(cct, scope = currentAppScope()) {
	return APP_CODE[cct][SCOPE_KEY[scope]];
}
/** `{ [appFieldCode]: appOptionCode }` — spread into a CCT create/update body. */
function appScopeBody(cct, scope = currentAppScope()) {
	return { [APP_FIELD[cct]]: appScopeCode(cct, scope) };
}
/** `{ [appFieldCode]: appOptionCode }` — spread into CCT REST query params. */
function appScopeParams(cct, scope = currentAppScope()) {
	return appScopeBody(cct, scope);
}
/**
* True when a raw CCT row belongs to the current app. Rows with an empty scope
* are treated as in-scope (legacy rows written before scoping existed), rows
* stamped for another app are always rejected.
*
* CCT 187's "App" column is a plain TEXT column on the live backend (verified
* 2026-09-18), so rows exist with BOTH the opaque radio code (b59) and the
* standard lowercase app name ("challenged"). Both mean the same app, so both
* are accepted; any other app's code or name is still rejected.
*/
function isInAppScope(cct, raw, scope = currentAppScope()) {
	const value = raw?.[APP_FIELD[cct]];
	if (value === void 0 || value === null || value === "") return true;
	const v = String(value).trim().toLowerCase();
	return v === String(appScopeCode(cct, scope)).toLowerCase() || v === scope;
}
/** Filter a raw CCT list down to rows belonging to the current app. */
function filterAppScope(cct, rows, scope = currentAppScope()) {
	if (!Array.isArray(rows)) return [];
	return rows.filter((r) => isInAppScope(cct, r, scope));
}
/** Community-post scope code ("ChallengeD" / "Care-CNC" community type). */
function communityTypeCode(scope = currentAppScope()) {
	const map = COMMUNITY_TYPE_CODE;
	if (scope === "carecnc") return map["CARE_CNC"];
	if (scope === "challenged") return map["CHALLENGED"];
	return map["AFRESH"];
}
T.userProfile.f.USER_NAME_FOR_AFRESH, T.userProfile.f.USER_NAME_FOR_ADRY, T.userProfile.f.USER_NAME_FOR_ABLOCKED, T.userProfile.f.USER_NAME_FOR_BENOTCH, T.userProfile.f.USER_NAME_FOR_CHALLENGED, T.userProfile.f.USER_NAME_FOR_CARECNC;
//#endregion
export { filterAppScope as a, currentAppScope as i, appScopeParams as n, isInAppScope as o, communityTypeCode as r, appScopeBody as t };
