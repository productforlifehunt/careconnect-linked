import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
import { i as getStoredWPUser } from "./wp-auth-DL1jfVY7.mjs";
import { a as wordpressFetch, i as wordpressCCTFetch } from "./wordpress-client-b834cpZh.mjs";
import { n as R, r as T } from "./wp-schema-Dnlz0TVP.mjs";
import { s as fetchMyAppUserName } from "./app-profile-DeZHIfiB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/source.wordpress-CSA-mU0R.js
/**
* Location Source — Single CCT "current_location" (append-only snapshots)
*
* Architecture:
*   - One JetEngine CCT "The current location of one user" (slug: current_location)
*   - One JetEngine Relation "One user can have many related current location snapshots"
*   - Every GPS ping = one new row (append-only, never UPDATE)
*   - Current position = latest row (ORDER BY captured_at DESC LIMIT 1)
*   - History/trail   = all rows for user (ORDER BY captured_at ASC)
*   - No separate location_history or location_sharing table needed
*/
var source_wordpress_exports = /* @__PURE__ */ __exportAll({
	fetchCurrentLocation: () => fetchCurrentLocation,
	fetchLocationHistory: () => fetchLocationHistory,
	fetchLocationSharesWordPress: () => fetchLocationSharesWordPress,
	writeLocationAndCheckZones: () => writeLocationAndCheckZones,
	writeLocationSnapshot: () => writeLocationSnapshot
});
var REL_USER_CURRENT_LOCATION = R.userCurrentLocations;
var CCT_SLUG = T.currentLocation.slug;
var F = T.currentLocation.f;
var O = T.currentLocation.opt;
function parseNum(v) {
	if (v === void 0 || v === null || v === "") return null;
	const n = Number(v);
	if (!Number.isFinite(n)) throw new Error(`Invalid numeric location value: ${v}`);
	return n;
}
/** Dictionary codes → plain words the UI can show. */
var MOVING_LABEL = {
	[O.MOVING_TYPE.STATIONARY]: "stationary",
	[O.MOVING_TYPE.WALKING]: "walking",
	[O.MOVING_TYPE.RUNNING]: "running",
	[O.MOVING_TYPE.CYCLING]: "cycling",
	[O.MOVING_TYPE.AUTOMOTIVE]: "automotive",
	[O.MOVING_TYPE.UNKNOWN]: "unknown"
};
var PLATFORM_LABEL = {
	[O.PLATFORM.IOS]: "iOS",
	[O.PLATFORM.ANDROID]: "Android",
	[O.PLATFORM.WEB]: "Web"
};
var YES_NO_LABEL = {
	[O.PHONE_IS_CHARING.YES]: "Yes",
	[O.PHONE_IS_CHARING.NO]: "No"
};
function mapSnapshot(raw) {
	const movingCode = raw[F.MOVING_TYPE] || null;
	const platformCode = raw[F.PLATFORM] || null;
	const chargingCode = raw[F.PHONE_IS_CHARING] || null;
	const emergencyCode = raw[F.IS_SO_MUCH_OF_AN_EMERGENCY_THAT_WE_DON_T_BOTHER_TO_ASK_FOR_THE_CARED_ONE_S_PERMISSION] || null;
	return {
		id: String(raw._ID || raw.id || ""),
		latitude: parseNum(raw[F.LATITUDE]),
		longitude: parseNum(raw[F.LONGITUDE]),
		accuracy_meters: parseNum(raw[F.ACCURACY_METERS]),
		altitude_meters: parseNum(raw[F.ALTITUDE_METERS]),
		heading_degrees: parseNum(raw[F.HEADING_DEGREES]),
		speed: parseNum(raw[F.SPEED]),
		moving_type: movingCode ? MOVING_LABEL[movingCode] ?? null : null,
		is_stationary: movingCode ? movingCode === O.MOVING_TYPE.STATIONARY : null,
		platform: platformCode ? PLATFORM_LABEL[platformCode] ?? null : null,
		battery_level: (() => {
			const b = parseNum(raw[F.BATTERY_LEVEL]);
			return b ? b : null;
		})(),
		phone_is_charging: chargingCode ? YES_NO_LABEL[chargingCode] ?? null : null,
		address_text: raw[F.ADDRESS_TEXT] || null,
		captured_at: raw[F.CAPTURED_AT] || null,
		is_emergency: emergencyCode === O.IS_SO_MUCH_OF_AN_EMERGENCY_THAT_WE_DON_T_BOTHER_TO_ASK_FOR_THE_CARED_ONE_S_PERMISSION.YES ? "Yes" : "No",
		cct_author_id: raw.cct_author_id ? Number(raw.cct_author_id) : void 0
	};
}
async function writeLocationSnapshot(lat, lng, opts) {
	const storedUser = getStoredWPUser();
	if (!storedUser?.user_id) throw new Error("Not authenticated");
	const userId = Number(String(opts?.subject_user_id ?? storedUser.user_id).replace(/^wp-/, ""));
	if (!userId) throw new Error("Invalid user for location snapshot");
	const charging = opts?.phone_is_charging ?? await detectCharging();
	const battery = opts?.battery_level ?? await import("../_libs/_28.mjs").then((m) => m.getBatteryLevel()).catch(() => null);
	const created = await wordpressCCTFetch(CCT_SLUG, {
		method: "POST",
		body: {
			[F.LATITUDE]: String(lat),
			[F.LONGITUDE]: String(lng),
			[F.ACCURACY_METERS]: opts?.accuracy != null ? String(opts.accuracy) : "",
			[F.ALTITUDE_METERS]: opts?.altitude != null ? String(opts.altitude) : "",
			[F.HEADING_DEGREES]: opts?.heading != null ? String(opts.heading) : "",
			[F.SPEED]: opts?.speed != null ? String(opts.speed) : "",
			[F.MOVING_TYPE]: movingTypeCode(opts?.moving_type, opts?.speed),
			[F.PLATFORM]: detectPlatformCode(),
			[F.BATTERY_LEVEL]: battery != null ? String(battery) : "",
			[F.PHONE_IS_CHARING]: charging == null ? "" : charging ? O.PHONE_IS_CHARING.YES : O.PHONE_IS_CHARING.NO,
			[F.ADDRESS_TEXT]: opts?.address_text || "",
			[F.CAPTURED_AT]: (/* @__PURE__ */ new Date()).toISOString(),
			[F.IS_SO_MUCH_OF_AN_EMERGENCY_THAT_WE_DON_T_BOTHER_TO_ASK_FOR_THE_CARED_ONE_S_PERMISSION]: opts?.is_emergency ? O.IS_SO_MUCH_OF_AN_EMERGENCY_THAT_WE_DON_T_BOTHER_TO_ASK_FOR_THE_CARED_ONE_S_PERMISSION.YES : O.IS_SO_MUCH_OF_AN_EMERGENCY_THAT_WE_DON_T_BOTHER_TO_ASK_FOR_THE_CARED_ONE_S_PERMISSION.NO
		}
	});
	const newId = String(created._ID || created.id || "");
	if (!newId) throw new Error("Location snapshot was created without an item ID");
	await wordpressFetch(`jet-rel/${REL_USER_CURRENT_LOCATION}`, {
		method: "POST",
		body: {
			parent_id: userId,
			child_id: Number(newId),
			context: "child",
			store_items_type: "update",
			meta: { a55: opts?.is_cared_one ? "b56" : "b55" }
		}
	});
	return mapSnapshot(created);
}
async function fetchCurrentLocation(userId) {
	const wpUserId = Number(String(userId).replace(/^wp-/, ""));
	if (!wpUserId) throw new Error("Invalid user ID");
	const rels = await wordpressFetch(`jet-rel/${REL_USER_CURRENT_LOCATION}/children/${wpUserId}`);
	if (!Array.isArray(rels)) throw new Error(`Relation ${REL_USER_CURRENT_LOCATION} returned an invalid response`);
	const ids = rels.map((r) => Number(r.child_object_id)).filter(Boolean);
	if (!ids.length) return null;
	return (await Promise.all(ids.map((id) => wordpressCCTFetch(CCT_SLUG, { id })))).map(mapSnapshot).sort((a, b) => new Date(b.captured_at || 0).getTime() - new Date(a.captured_at || 0).getTime())[0] || null;
}
async function fetchLocationHistory(userId, opts) {
	const wpUserId = Number(String(userId).replace(/^wp-/, ""));
	if (!wpUserId) throw new Error("Invalid user ID");
	const rels = await wordpressFetch(`jet-rel/${REL_USER_CURRENT_LOCATION}/children/${wpUserId}`);
	if (!Array.isArray(rels)) throw new Error(`Relation ${REL_USER_CURRENT_LOCATION} returned an invalid response`);
	const ids = rels.map((r) => Number(r.child_object_id)).filter(Boolean);
	return (await Promise.all(ids.map((id) => wordpressCCTFetch(CCT_SLUG, { id })))).map(mapSnapshot).filter((s) => s.latitude != null && s.longitude != null).filter((s) => !opts?.since || new Date(s.captured_at || 0) >= new Date(opts.since)).sort((a, b) => new Date(b.captured_at || 0).getTime() - new Date(a.captured_at || 0).getTime()).slice(0, opts?.limit || 200);
}
/**
* scope "cared-ones" (care apps): only the people I look after — Relation 219
* children with an accepted link — plus me. scope "group" (Notch Safety family
* locator): everyone in my groups.
*/
async function fetchLocationSharesWordPress(scope = "cared-ones") {
	try {
		const storedUser = getStoredWPUser();
		if (!storedUser?.user_id) return [];
		const memberUserIds = /* @__PURE__ */ new Set();
		if (scope === "cared-ones") {
			const { fetchUserCaredOnesWordPress } = await import("../_libs/_9.mjs").then((n) => n.n);
			const caredOnes = await fetchUserCaredOnesWordPress();
			for (const c of caredOnes) {
				if (c.invitation_status && c.invitation_status !== "accepted") continue;
				const id = String(c.user_id ?? c.id ?? "").replace(/^wp-/, "");
				if (id) memberUserIds.add(id);
			}
		}
		const { fetchCareGroupsWordPress } = await import("../_libs/_7.mjs").then((n) => n.a);
		const groups = scope === "group" ? await fetchCareGroupsWordPress() : [];
		for (const group of groups) {
			const members = group.members || [];
			for (const member of members) {
				const memberId = String(member.user_id || member.id || "");
				if (memberId && memberId !== String(storedUser.user_id)) memberUserIds.add(memberId);
			}
		}
		memberUserIds.add(String(storedUser.user_id));
		return (await Promise.all(Array.from(memberUserIds).map(async (uid) => {
			try {
				const snapshot = await fetchCurrentLocation(uid);
				if (!snapshot || !snapshot.latitude || !snapshot.longitude) return null;
				return {
					id: snapshot.id,
					user_id: uid,
					latitude: snapshot.latitude,
					longitude: snapshot.longitude,
					accuracy_meters: snapshot.accuracy_meters,
					battery_level: snapshot.battery_level,
					phone_is_charging: snapshot.phone_is_charging,
					moving_type: snapshot.moving_type,
					speed: snapshot.speed,
					address_text: snapshot.address_text,
					is_sharing_enabled: true,
					user_name: null,
					user_avatar: null,
					updated_at: snapshot.captured_at,
					created_at: snapshot.captured_at
				};
			} catch {
				return null;
			}
		}))).filter(Boolean);
	} catch {
		return [];
	}
}
async function writeLocationAndCheckZones(lat, lng, opts) {
	const storedUser = getStoredWPUser();
	const snapshot = await writeLocationSnapshot(lat, lng, {
		accuracy: opts?.accuracy,
		altitude: opts?.altitude,
		heading: opts?.heading,
		speed: opts?.speed,
		battery_level: opts?.battery_level,
		phone_is_charging: opts?.phone_is_charging,
		moving_type: opts?.moving_type,
		address_text: opts?.address_text,
		is_emergency: opts?.isEmergency,
		is_cared_one: opts?.is_cared_one
	});
	if (storedUser?.user_id) try {
		const { createSafeZoneAlertsForLocation } = await import("../_libs/_19.mjs").then((n) => n.g);
		await createSafeZoneAlertsForLocation(String(storedUser.user_id), lat, lng);
	} catch {}
	if (opts?.isEmergency && storedUser?.user_id) try {
		const { createNotificationWordPress } = await import("./source.wordpress-4K22Mifm.mjs");
		const { fetchLocationReceiverIds } = await import("../_libs/_19.mjs").then((n) => n.g);
		const receivers = await fetchLocationReceiverIds(String(storedUser.user_id));
		const name = await fetchMyAppUserName().catch(() => "") || "A care circle member";
		await Promise.all(receivers.filter((rid) => String(rid) !== String(storedUser.user_id)).map((rid) => createNotificationWordPress({
			user_id: String(rid),
			type: "sos_emergency",
			title: "🚨 SOS Emergency Alert",
			message: `${name} triggered an SOS emergency alert.`,
			action_url: `/find?sos=${storedUser.user_id}`
		}).catch(() => null)));
	} catch {}
	return snapshot;
}
/** a63 Platform — dictionary codes only: b55 iOS, b56 Android, b57 Web. */
function detectPlatformCode() {
	if (typeof navigator === "undefined") return O.PLATFORM.WEB;
	const native = (window?.Capacitor)?.getPlatform?.();
	if (native === "ios") return O.PLATFORM.IOS;
	if (native === "android") return O.PLATFORM.ANDROID;
	const ua = navigator.userAgent.toLowerCase();
	if (ua.includes("android")) return O.PLATFORM.ANDROID;
	if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) return O.PLATFORM.IOS;
	return O.PLATFORM.WEB;
}
/**
* a62 Moving type — dictionary codes only. Accepts the plain word a caller
* already knows (native CMMotionActivity), otherwise infers from speed in m/s.
*/
function movingTypeCode(word, speed) {
	const byWord = {
		stationary: O.MOVING_TYPE.STATIONARY,
		walking: O.MOVING_TYPE.WALKING,
		running: O.MOVING_TYPE.RUNNING,
		cycling: O.MOVING_TYPE.CYCLING,
		automotive: O.MOVING_TYPE.AUTOMOTIVE,
		unknown: O.MOVING_TYPE.UNKNOWN
	};
	if (word) {
		const code = byWord[word.trim().toLowerCase()] ?? Object.values(O.MOVING_TYPE).find((c) => c === word);
		if (!code) throw new Error(`Unknown moving type "${word}" — CCT 213 a62 accepts b55..b60 only`);
		return code;
	}
	if (speed == null || !Number.isFinite(speed)) return O.MOVING_TYPE.UNKNOWN;
	if (speed < .3) return O.MOVING_TYPE.STATIONARY;
	if (speed < 2) return O.MOVING_TYPE.WALKING;
	if (speed < 4) return O.MOVING_TYPE.RUNNING;
	if (speed < 8) return O.MOVING_TYPE.CYCLING;
	return O.MOVING_TYPE.AUTOMOTIVE;
}
/** a65 Phone is charging — from the Battery API / Capacitor Device info. */
async function detectCharging() {
	try {
		if ((window?.Capacitor)?.isNativePlatform?.()) {
			const { Device } = await import("../_libs/_10.mjs");
			const info = await Device.getBatteryInfo();
			return typeof info?.isCharging === "boolean" ? info.isCharging : null;
		}
		const nav = typeof navigator !== "undefined" ? navigator : null;
		if (nav?.getBattery) {
			const battery = await nav.getBattery();
			return typeof battery?.charging === "boolean" ? battery.charging : null;
		}
	} catch {}
	return null;
}
//#endregion
export { writeLocationAndCheckZones as a, source_wordpress_exports as i, fetchLocationHistory as n, writeLocationSnapshot as o, fetchLocationSharesWordPress as r, fetchCurrentLocation as t };
