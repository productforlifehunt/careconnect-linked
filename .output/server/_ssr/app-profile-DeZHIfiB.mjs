import "../_runtime.mjs";
import { a as wordpressFetch, i as wordpressCCTFetch } from "./wordpress-client-b834cpZh.mjs";
import { n as getCurrentUserIdNumber } from "./current-user-CV-pp6xq.mjs";
import { n as R, r as T } from "./wp-schema-Dnlz0TVP.mjs";
import { i as currentAppScope } from "./app-scope-Cq6C10CZ.mjs";
import { t as dedupeRead } from "./rel-batch-97Y7fPM-.mjs";
import { t as readLinkedCCTRows } from "./cct-rows-C0yQLswP.mjs";
import { n as detectSite } from "./SiteContext-Br0kF93Q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-profile-DeZHIfiB.js
/**
* The current user's one-to-one extended-profile rows.
*
* The link is a JetEngine relation — Relation 152 for CCT 151
* (`users_extended_prof`) and Relation 259 for CCT 258 (`user_ext_profile_2`).
* Never resolve these rows with a `cct_author_id` query filter: JetEngine
* silently ignores it on some CCT routes and hands back somebody else's row.
*/
/** Row id of the user's one-to-one child row, or null when none exists yet. */
async function findOwnRowId(relationId) {
	const userId = getCurrentUserIdNumber();
	if (!userId) return null;
	const rels = await wordpressFetch(`jet-rel/${relationId}/children/${userId}`);
	if (!Array.isArray(rels)) throw new Error(`Relation ${relationId} returned an invalid response`);
	const childId = rels[0]?.child_object_id;
	return childId ? String(childId) : null;
}
/** The user's one-to-one child row, or null when none exists yet. */
async function findOwnRow(relationId, cctSlug) {
	const id = await findOwnRowId(relationId);
	if (!id) return null;
	return wordpressCCTFetch(cctSlug, { id });
}
/** Links a freshly created child row to the current user over `relationId`. */
async function linkOwnRow(relationId, childId) {
	const userId = getCurrentUserIdNumber();
	if (!userId) throw new Error("No signed-in user to link the profile row to");
	await wordpressFetch(`jet-rel/${relationId}`, {
		method: "POST",
		body: {
			parent_id: String(userId),
			child_id: String(childId),
			context: "child_object",
			store_items_type: "replace"
		}
	});
}
/**
* ONE row per user per sub-app on JetEngine CCT 151 `users_extended_prof`.
*
* Data dictionary (opaque codes — never inferred, only from the dictionary):
*   a01  This is for app        → lowercase standard app slug: "challenged",
*                                 "carecnc", "notchsafety", "afresh", …
*   a55  User's name for this app
*   a56  User's community name for this app
*   a57  Timezone   a58 Language   a59 Currency
*   a70  Onboarding state              (b55 = done/skipped)
*   a87  App settings (JSON textarea)
*   a91  AI credits for this app
*   a92  AI help ("?") button hidden    (1 = hidden, 0/empty = shown;
*                                       the live column is numeric, so the
*                                       yes/no codes are not accepted there)
*
* The row is linked to the WordPress user through JetEngine Relation 152 only —
* no custom id, no foreign key. Core identity stays on the WordPress user; the
* WordPress display name is shared by every app and is never shown.
*
* Rules enforced here:
*   • exactly one row per user per app — duplicates are merged silently,
*   • a legacy row with no a01 is adopted (stamped + migrated) instead of
*     creating a second row,
*   • paid apps grant 10 AI credits when the row is first created.
*/
var SLUG = T.userProfile.slug;
var REL = R.userProfileRel;
var APP_PROFILE_F = {
	APP: "a01",
	NAME: "a55",
	COMMUNITY_NAME: "a56",
	TIMEZONE: "a57",
	LANGUAGE: "a58",
	CURRENCY: "a59",
	ONBOARDING: "a70",
	SETTINGS_JSON: "a87",
	AI_CREDITS: "a91",
	HELP_HIDDEN: "a92"
};
/** Apps that charge for AI, and therefore get the 10-credit welcome grant. */
var PAID_APPS = [
	"challenged",
	"carecnc",
	"notchsafety"
];
/** Legacy per-app columns, read once when a pre-a01 row is adopted. */
var LEGACY_NAME = {
	challenged: "a556",
	carecnc: "a557",
	notchsafety: "a555",
	afresh: "a55",
	adry: "a551",
	ablocked: "a552",
	benotch: "a555"
};
var LEGACY_SETTINGS = {
	challenged: "a95",
	notchsafety: "a95",
	carecnc: "a96",
	afresh: "a87",
	adry: "a88",
	ablocked: "a89",
	benotch: "a90"
};
/**
* The running app's own id. NotchSafety shares the ChallengeD care data model
* (currentAppScope() folds it into "challenged"), but it is its own product and
* therefore keeps its own settings row.
*/
function currentAppId() {
	if (typeof window !== "undefined") try {
		const p = new URLSearchParams(window.location.search).get("__site");
		if (p === "notchsafety" || p === "safety") return "notchsafety";
		if (/(^|\.)notchsafety\.com$/.test(window.location.hostname)) return "notchsafety";
		if (detectSite() === "notchsafety") return "notchsafety";
	} catch {}
	return currentAppScope();
}
async function childRowIds(userId) {
	const rels = await wordpressFetch(`jet-rel/${REL}/children/${userId}`);
	if (!Array.isArray(rels)) throw new Error(`Relation ${REL} returned an invalid response`);
	return rels.map((r) => String(r?.child_object_id ?? "")).filter(Boolean);
}
async function readRows(ids) {
	return readLinkedCCTRows(SLUG, ids);
}
var rowId = (row) => String(row?._ID ?? row?.id ?? "");
var isFilled = (v) => v !== void 0 && v !== null && String(v).trim() !== "";
/** Merges duplicates into the oldest row and deletes the extras. Silent. */
async function mergeDuplicates(rows) {
	const [keep, ...extras] = rows;
	if (extras.length === 0) return keep;
	const patch = {};
	for (const extra of extras) for (const key of Object.values(APP_PROFILE_F)) if (!isFilled(keep[key]) && isFilled(extra[key]) && !isFilled(patch[key])) patch[key] = extra[key];
	if (Object.keys(patch).length) {
		await wordpressCCTFetch(SLUG, {
			id: rowId(keep),
			method: "PUT",
			body: patch
		});
		Object.assign(keep, patch);
	}
	await Promise.all(extras.map((e) => wordpressCCTFetch(SLUG, {
		id: rowId(e),
		method: "DELETE"
	}).catch(() => null)));
	return keep;
}
/** This user's row for this app, or null when it does not exist yet. */
async function getAppProfileRow(app = currentAppId()) {
	const userId = getCurrentUserIdNumber();
	if (!userId) return null;
	return dedupeRead(`app-profile:${userId}:${app}`, () => readAppProfileRow(userId, app));
}
async function readAppProfileRow(userId, app) {
	const rows = await readRows(await childRowIds(userId));
	const mine = rows.filter((r) => String(r?.[APP_PROFILE_F.APP] ?? "").toLowerCase() === app);
	if (mine.length) return mergeDuplicates(mine);
	const legacy = rows.find((r) => !isFilled(r?.[APP_PROFILE_F.APP]));
	if (!legacy) return null;
	const patch = { [APP_PROFILE_F.APP]: app };
	const nameCol = LEGACY_NAME[app];
	if (nameCol && !isFilled(legacy[APP_PROFILE_F.NAME]) && isFilled(legacy[nameCol])) patch[APP_PROFILE_F.NAME] = legacy[nameCol];
	const setCol = LEGACY_SETTINGS[app];
	if (setCol && setCol !== APP_PROFILE_F.SETTINGS_JSON && isFilled(legacy[setCol])) patch[APP_PROFILE_F.SETTINGS_JSON] = legacy[setCol];
	await wordpressCCTFetch(SLUG, {
		id: rowId(legacy),
		method: "PUT",
		body: patch
	});
	return {
		...legacy,
		...patch
	};
}
/**
* Guarantees exactly one row for this user and this app.
* Called after login / signup, when onboarding is finished or skipped, and
* again as a silent second check when the Settings screen opens.
*/
async function ensureAppProfile(app = currentAppId()) {
	const userId = getCurrentUserIdNumber();
	if (!userId) return null;
	const existing = await getAppProfileRow(app);
	if (existing) return {
		row: existing,
		created: false,
		grantedCredits: 0
	};
	const body = {
		[APP_PROFILE_F.APP]: app,
		cct_author_id: String(userId)
	};
	try {
		body[APP_PROFILE_F.TIMEZONE] = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
	} catch {}
	if (typeof navigator !== "undefined" && navigator.language) body[APP_PROFILE_F.LANGUAGE] = navigator.language;
	const created = await wordpressCCTFetch(SLUG, {
		method: "POST",
		body
	});
	const newId = created?.item_id ?? created?._ID ?? created?.id;
	if (!newId) throw new Error("Could not create the app settings record");
	await linkOwnRow(REL, newId);
	return {
		row: {
			...body,
			_ID: newId
		},
		created: true,
		grantedCredits: 0
	};
}
/** True once the user finished or skipped this app's onboarding. */
async function fetchOnboardingDone(app = currentAppId()) {
	return isFilled((await getAppProfileRow(app))?.[APP_PROFILE_F.ONBOARDING]);
}
/**
* Marks this app's onboarding as finished or skipped, saves whatever basic
* information was entered, and grants the 10 welcome AI credits once, on paid
* apps only. Returns the credits granted by this call.
*/
async function completeOnboarding(values = {}, app = currentAppId()) {
	const ensured = await ensureAppProfile(app);
	if (!ensured) throw new Error("No signed-in user");
	const row = ensured.row;
	const grant = !isFilled(row?.[APP_PROFILE_F.ONBOARDING]) && PAID_APPS.includes(app) ? 10 : 0;
	const body = { [APP_PROFILE_F.ONBOARDING]: "b55" };
	if (isFilled(values.name)) body[APP_PROFILE_F.NAME] = values.name.trim();
	if (isFilled(values.communityName)) body[APP_PROFILE_F.COMMUNITY_NAME] = values.communityName.trim();
	if (grant) {
		const current = parseFloat(String(row?.[APP_PROFILE_F.AI_CREDITS] ?? "0"));
		body[APP_PROFILE_F.AI_CREDITS] = String((Number.isFinite(current) ? current : 0) + grant);
	}
	await wordpressCCTFetch(SLUG, {
		id: rowId(row),
		method: "PUT",
		body
	});
	return grant;
}
/** The name shown on this app's forum only — every app has its own. */
async function fetchMyCommunityName(app = currentAppId()) {
	const raw = (await getAppProfileRow(app))?.[APP_PROFILE_F.COMMUNITY_NAME];
	return typeof raw === "string" ? raw.trim() : "";
}
async function saveMyCommunityName(name, app = currentAppId()) {
	await patchAppProfile({ [APP_PROFILE_F.COMMUNITY_NAME]: name }, app);
}
/** Writes columns onto this app's row, creating it first when needed. */
async function patchAppProfile(body, app = currentAppId()) {
	const ensured = await ensureAppProfile(app);
	if (!ensured) throw new Error("No signed-in user");
	await wordpressCCTFetch(SLUG, {
		id: rowId(ensured.row),
		method: "PUT",
		body
	});
}
async function fetchMyAppUserName(app = currentAppId()) {
	const raw = (await getAppProfileRow(app))?.[APP_PROFILE_F.NAME];
	return typeof raw === "string" ? raw.trim() : "";
}
async function saveMyAppUserName(name, app = currentAppId()) {
	await patchAppProfile({ [APP_PROFILE_F.NAME]: name }, app);
}
async function fetchHelpBubbleVisible(app = currentAppId()) {
	const row = await getAppProfileRow(app);
	return parseFloat(String(row?.[APP_PROFILE_F.HELP_HIDDEN] ?? "0")) !== 1;
}
async function saveHelpBubbleVisible(visible, app = currentAppId()) {
	await patchAppProfile({ [APP_PROFILE_F.HELP_HIDDEN]: visible ? "0" : "1" }, app);
}
async function fetchAppSettingsJson(app = currentAppId()) {
	const raw = (await getAppProfileRow(app))?.[APP_PROFILE_F.SETTINGS_JSON];
	if (!raw) return null;
	try {
		return typeof raw === "string" ? JSON.parse(raw) : raw;
	} catch {
		return null;
	}
}
async function saveAppSettingsJson(value, app = currentAppId()) {
	await patchAppProfile({ [APP_PROFILE_F.SETTINGS_JSON]: JSON.stringify(value) }, app);
}
//#endregion
export { fetchAppSettingsJson as a, fetchMyCommunityName as c, linkOwnRow as d, saveAppSettingsJson as f, saveMyCommunityName as h, ensureAppProfile as i, fetchOnboardingDone as l, saveMyAppUserName as m, completeOnboarding as n, fetchHelpBubbleVisible as o, saveHelpBubbleVisible as p, currentAppId as r, fetchMyAppUserName as s, APP_PROFILE_F as t, findOwnRow as u };
