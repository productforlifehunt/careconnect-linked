import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
import { i as getStoredWPUser } from "./wp-auth-DL1jfVY7.mjs";
import { a as wordpressFetch, i as wordpressCCTFetch } from "./wordpress-client-b834cpZh.mjs";
import { n as R, r as T } from "./wp-schema-Dnlz0TVP.mjs";
import { s as fetchMyAppUserName } from "./app-profile-DeZHIfiB.mjs";
import { y as runNotificationSkill } from "./ai-dynamic-knowledge-C5tnjGCy.mjs";
import { a as writeLocationAndCheckZones, n as fetchLocationHistory, o as writeLocationSnapshot, t as fetchCurrentLocation } from "./source.wordpress-CSA-mU0R.mjs";
import { n as setLocationSharingFlags, t as fetchLocationSharingFlags } from "./sharing-flags-D_5TkgbY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/source.wordpress-extended-CLFqt_H_.js
/**
* Zone types for CCT 214 "Safe Zone" — dictionary a55.
*
* The dictionary defines exactly three zone types:
*   b55 Safe | b56 Danger | b57 Custom
*
* The zone's name lives on the zone itself, in a57 "Zone name":
*   - Safe / Danger  → a57 holds "Safe" / "Danger", notes go in a58.
*   - Custom         → a57 holds the user's own zone name (unlimited types).
*
* a58 "Custom description" holds the zone's free-text note only; it must never
* be used to smuggle a name. There are no custom-name slots on any profile CCT.
*/
var ZONE_TYPE = T.safeZone.opt.ZONE_TYPE;
/** Ordered list of the three dictionary zone-type codes. */
var ZONE_TYPE_CODES = [
	ZONE_TYPE.SAFE,
	ZONE_TYPE.DANGER,
	ZONE_TYPE.CUSTOM
];
function isDangerZone(code) {
	return code === ZONE_TYPE.DANGER;
}
function isSafeZone(code) {
	return code === ZONE_TYPE.SAFE;
}
function isCustomZone(code) {
	return code === ZONE_TYPE.CUSTOM;
}
/**
* Canonical value for a57 "Zone name".
* Safe/Danger are fixed labels; Custom keeps whatever the user typed.
*/
function zoneNameFor(code, customName) {
	if (code === ZONE_TYPE.SAFE) return "Safe";
	if (code === ZONE_TYPE.DANGER) return "Danger";
	const name = (customName || "").trim();
	if (!name) throw new Error("A custom zone requires a name");
	return name;
}
/** Display label for a zone: the stored a57 name, localized for Safe/Danger. */
function zoneTypeLabel(code, zoneName, zh) {
	if (code === ZONE_TYPE.SAFE) return zh ? "安全区域" : "Safe zone";
	if (code === ZONE_TYPE.DANGER) return zh ? "危险区域" : "Danger zone";
	const name = (zoneName || "").trim();
	if (name) return name;
	return zh ? "自定义区域" : "Custom zone";
}
/**
* Location Extended — Safe Zones, Alerts, Requests, Location Settings
*
* Safe Zone CCT: "Safe Zone" (slug: safe_zone)
* Safe Zone Relation: "One user can have many related safe zones" (one-to-many)
*
* Location uses the new single-CCT architecture from source.wordpress.ts
*/
var source_wordpress_extended_exports = /* @__PURE__ */ __exportAll({
	acknowledgeAlertWordPress: () => acknowledgeAlertWordPress,
	acknowledgeAllAlertsWordPress: () => acknowledgeAllAlertsWordPress,
	answerEmergencyRequestWordPress: () => answerEmergencyRequestWordPress,
	cancelLocationRequestWordPress: () => cancelLocationRequestWordPress,
	createSafeZoneAlertsForLocation: () => createSafeZoneAlertsForLocation,
	createSafeZoneWordPress: () => createSafeZoneWordPress,
	deleteSafeZoneWordPress: () => deleteSafeZoneWordPress,
	disableMyLocationSharingWordPress: () => disableMyLocationSharingWordPress,
	enableEmergencyLocationPermissionWordPress: () => enableEmergencyLocationPermissionWordPress,
	fetchCaredOneLocationHistoryWordPress: () => fetchCaredOneLocationHistoryWordPress,
	fetchCaredOneLocationSettingsWordPress: () => fetchCaredOneLocationSettingsWordPress,
	fetchCaredOneLocationWordPress: () => fetchCaredOneLocationWordPress,
	fetchLocationReceiverIds: () => fetchLocationReceiverIds,
	fetchLocationRequestsWordPress: () => fetchLocationRequestsWordPress,
	fetchSafeZoneAlertsWordPress: () => fetchSafeZoneAlertsWordPress,
	fetchSafeZonesWordPress: () => fetchSafeZonesWordPress,
	respondToLocationRequestWordPress: () => respondToLocationRequestWordPress,
	sendLocationRequestWordPress: () => sendLocationRequestWordPress,
	setLocationReceivers: () => setLocationReceivers,
	shareMyLocationWordPress: () => shareMyLocationWordPress,
	updateSafeZoneWordPress: () => updateSafeZoneWordPress,
	writeCaredOneSnapshot: () => writeCaredOneSnapshot
});
var ALERT_DEDUP_KEY = (userId, zoneId, type) => `cc_zone_alert:${userId}:${zoneId}:${type}`;
var ALERT_DEDUP_WINDOW_MS = 300 * 1e3;
var REL_USER_SAFE_ZONE = R.userSafeZones;
var REL_LOCATION_RECEIVER = R.caredOneLocationReceivers;
function normalizeWpUserId(id) {
	return Number(String(id).replace(/^wp-/, ""));
}
async function fetchRelationChildIds(relationId, parentUserId) {
	const rels = await wordpressFetch(`jet-rel/${relationId}/children/${parentUserId}`);
	if (!Array.isArray(rels)) return [];
	return rels.map((relation) => String(relation.child_object_id || "")).filter(Boolean);
}
async function attachChildToUserRelation(relationId, parentUserId, childId) {
	await wordpressFetch(`jet-rel/${relationId}`, {
		method: "POST",
		body: {
			parent_id: parentUserId,
			child_id: Number(childId),
			context: "child",
			store_items_type: "update"
		}
	});
}
/** Users who receive this cared one's location alerts (JetEngine Relation 290). */
async function fetchLocationReceiverIds(userId) {
	return fetchRelationChildIds(REL_LOCATION_RECEIVER, normalizeWpUserId(userId));
}
/** Replace the cared one's location-alert receiver list (Relation 290 only). */
async function setLocationReceivers(userId, receiverIds) {
	const parentId = normalizeWpUserId(userId);
	if (!parentId) throw new Error("Invalid user for location alert receivers");
	const body = {
		parent_id: parentId,
		child_id: (receiverIds || []).map((v) => normalizeWpUserId(v)).filter(Boolean).map(Number),
		context: "parent",
		store_items_type: "replace"
	};
	try {
		await wordpressFetch(`jet-rel/${REL_LOCATION_RECEIVER}`, {
			method: "POST",
			body
		});
	} catch (err) {
		if (!/40[13]/.test(String(err?.message || ""))) throw err;
		const { wpAdminOps } = await import("../_libs/_5.mjs").then((n) => n.x);
		const res = await wpAdminOps("set_relation", {
			relation_id: Number(REL_LOCATION_RECEIVER),
			parent_id: body.parent_id,
			child_ids: body.child_id,
			context: "parent",
			store_items_type: "replace"
		});
		if (!res?.ok) throw new Error(res?.error || "Could not save alert receivers");
	}
}
function parseNumber(value, fallback = null) {
	if (value === void 0 || value === null || value === "") return fallback;
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
}
function normalizePolygonPoints(points) {
	if (!points) return [];
	if (typeof points === "string") try {
		points = JSON.parse(points);
	} catch {
		return [];
	}
	if (!Array.isArray(points)) return [];
	return points.map((point) => {
		if (Array.isArray(point) && point.length >= 2) {
			const lat = Number(point[0]);
			const lng = Number(point[1]);
			if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
		}
		if (point && typeof point === "object") {
			const lat = Number(point.lat ?? point.latitude ?? point[0]);
			const lng = Number(point.lng ?? point.longitude ?? point[1]);
			if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
		}
		return null;
	}).filter(Boolean);
}
function mapSafeZone(z, userId) {
	const polygonPoints = normalizePolygonPoints(z.a63);
	const typeCode = String(z.a55 || ZONE_TYPE.SAFE);
	const zoneName = typeof z.a57 === "string" ? z.a57 : "";
	return {
		id: String(z._ID || z.id),
		user_id: userId,
		zone_type: typeCode,
		zone_name: zoneName,
		zone_type_label: zoneTypeLabel(typeCode, zoneName, false),
		zone_type_label_zh: zoneTypeLabel(typeCode, zoneName, true),
		is_custom: isCustomZone(typeCode),
		is_danger: isDangerZone(typeCode),
		is_safe: isSafeZone(typeCode),
		shape_type: z.a56 === T.safeZone.opt.SHAPE_TYPE.POLYGON ? "Polygon" : polygonPoints.length >= 3 ? "Polygon" : "Radius",
		color: z.a59 || null,
		latitude: parseNumber(z.a60),
		longitude: parseNumber(z.a61),
		radius_meters: parseNumber(z.a62, 100) ?? 100,
		polygon_points: polygonPoints,
		description: typeof z.a58 === "string" && z.a58 ? z.a58 : null,
		notify_on_enter: z.a64 === T.safeZone.opt.NOTIFY_ON_ENTER.ON,
		notify_on_exit: z.a65 === T.safeZone.opt.NOTIFY_ON_EXIT.ON,
		schedule_enabled: z.a66 === T.safeZone.opt.SCHEDULE_ENABLED.ON,
		schedule_start_time: z.a67 || null,
		schedule_end_time: z.a68 || null,
		is_active: z.a69 !== T.safeZone.opt.IS_ACTIVE.NO,
		created_at: z.cct_created || z.created_at,
		updated_at: z.cct_modified || z.updated_at || z.created_at
	};
}
function getDistanceMeters(lat1, lon1, lat2, lon2) {
	const R = 6371e3;
	const dLat = (lat2 - lat1) * Math.PI / 180;
	const dLon = (lon2 - lon1) * Math.PI / 180;
	const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
	return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function isPointInPolygon(lat, lng, polygon) {
	let inside = false;
	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const [xi, yi] = polygon[i];
		const [xj, yj] = polygon[j];
		if (yi > lat !== yj > lat && lng < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
	}
	return inside;
}
function isZoneActiveNow(zone) {
	if (!zone.schedule_enabled) return true;
	const now = /* @__PURE__ */ new Date();
	if (!zone.schedule_start_time || !zone.schedule_end_time) return true;
	const start = new Date(zone.schedule_start_time);
	const end = new Date(zone.schedule_end_time);
	return now >= start && now <= end;
}
function evaluateZoneAlert(zone, lat, lng) {
	if (!zone.is_active || !isZoneActiveNow(zone)) return null;
	let inside = false;
	let distance = 0;
	if (String(zone.shape_type).toLowerCase() === "polygon" && zone.polygon_points?.length >= 3) {
		inside = isPointInPolygon(lat, lng, zone.polygon_points);
		if (zone.latitude != null && zone.longitude != null) distance = Math.round(getDistanceMeters(lat, lng, zone.latitude, zone.longitude));
	} else {
		if (zone.latitude == null || zone.longitude == null) return null;
		distance = Math.round(getDistanceMeters(lat, lng, zone.latitude, zone.longitude));
		inside = distance <= (zone.radius_meters || 100);
	}
	if (zone.is_danger) {
		if (!inside || !zone.notify_on_enter) return null;
		return {
			distance,
			alertType: "entered_danger_zone"
		};
	}
	if (zone.is_safe) {
		if (inside) return null;
		if (!zone.notify_on_exit) return null;
		return {
			distance,
			alertType: "exited_safe_zone"
		};
	}
	if (inside) {
		if (!zone.notify_on_enter) return null;
		return {
			distance,
			alertType: "entered_safe_zone"
		};
	}
	if (!zone.notify_on_exit) return null;
	return {
		distance,
		alertType: "exited_safe_zone"
	};
}
async function fetchSafeZonesWordPress(userId) {
	const [zoneIds, receiverIds] = await Promise.all([fetchRelationChildIds(REL_USER_SAFE_ZONE, normalizeWpUserId(userId)), fetchLocationReceiverIds(userId)]);
	return (await Promise.all(zoneIds.map(async (zoneId) => {
		const zone = await wordpressCCTFetch(T.safeZone.slug, { id: zoneId });
		if (!zone || typeof zone !== "object" || Array.isArray(zone)) return null;
		const mapped = mapSafeZone(zone, userId);
		if (!mapped.id || mapped.id === "undefined" || mapped.id === "null") return null;
		return {
			...mapped,
			receiver_ids: receiverIds
		};
	}))).filter(Boolean);
}
/** Zone-type code (a55). Accepts only the three dictionary codes. */
function requireZoneTypeCode(value) {
	const code = String(value || ZONE_TYPE.SAFE);
	if (!ZONE_TYPE_CODES.includes(code)) throw new Error(`Unknown zone type "${code}" — CCT 214 a55 accepts b55/b56/b57 only`);
	return code;
}
async function createSafeZoneWordPress(zone) {
	const userId = normalizeWpUserId(zone.user_id);
	if (!userId) throw new Error("Invalid user");
	const typeCode = requireZoneTypeCode(zone["zone_type"]);
	const created = await wordpressCCTFetch(T.safeZone.slug, {
		method: "POST",
		body: {
			a55: typeCode,
			a56: String(zone["shape_type"] || "Radius").toLowerCase() === "polygon" ? T.safeZone.opt.SHAPE_TYPE.POLYGON : T.safeZone.opt.SHAPE_TYPE.RADIUS,
			a57: zoneNameFor(typeCode, zone["zone_name"]),
			a58: zone["description"] || "",
			a59: zone["color"] || "",
			a60: String(zone.latitude),
			a61: String(zone.longitude),
			a62: String(zone.radius_meters ?? 100),
			a63: zone["polygon_points"] ? JSON.stringify(zone["polygon_points"]) : "",
			a64: zone["notify_on_enter"] !== false ? T.safeZone.opt.NOTIFY_ON_ENTER.ON : T.safeZone.opt.NOTIFY_ON_ENTER.OFF,
			a65: zone["notify_on_exit"] !== false ? T.safeZone.opt.NOTIFY_ON_EXIT.ON : T.safeZone.opt.NOTIFY_ON_EXIT.OFF,
			a66: zone["schedule_enabled"] ? T.safeZone.opt.SCHEDULE_ENABLED.ON : T.safeZone.opt.SCHEDULE_ENABLED.OFF,
			a67: zone["schedule_start_time"] || "",
			a68: zone["schedule_end_time"] || "",
			a69: zone["is_active"] === false ? T.safeZone.opt.IS_ACTIVE.NO : T.safeZone.opt.IS_ACTIVE.YES
		}
	});
	await attachChildToUserRelation(REL_USER_SAFE_ZONE, userId, String(created._ID || created.id));
	if (Array.isArray(zone["receiver_ids"])) await setLocationReceivers(zone.user_id, zone["receiver_ids"]);
}
async function updateSafeZoneWordPress(id, updates) {
	const body = {};
	if (updates["description"] !== void 0) body["a58"] = updates["description"] || "";
	if (updates["zone_type"] !== void 0) {
		const typeCode = requireZoneTypeCode(updates["zone_type"]);
		body["a55"] = typeCode;
		body["a57"] = zoneNameFor(typeCode, updates["zone_name"]);
	} else if (updates["zone_name"] !== void 0) {
		body["a57"] = String(updates["zone_name"] || "").trim();
		if (!body["a57"]) throw new Error("A custom zone requires a name");
	}
	if (updates["shape_type"] !== void 0) body["a56"] = String(updates["shape_type"]).toLowerCase() === "polygon" ? T.safeZone.opt.SHAPE_TYPE.POLYGON : T.safeZone.opt.SHAPE_TYPE.RADIUS;
	if (updates["color"] !== void 0) body["a59"] = updates["color"];
	if (updates["latitude"] !== void 0) body["a60"] = String(updates["latitude"]);
	if (updates["longitude"] !== void 0) body["a61"] = String(updates["longitude"]);
	if (updates["radius_meters"] !== void 0) body["a62"] = String(updates["radius_meters"]);
	if (updates["polygon_points"] !== void 0) body["a63"] = updates["polygon_points"] ? JSON.stringify(updates["polygon_points"]) : "";
	if (updates["notify_on_enter"] !== void 0) body["a64"] = updates["notify_on_enter"] ? T.safeZone.opt.NOTIFY_ON_ENTER.ON : T.safeZone.opt.NOTIFY_ON_ENTER.OFF;
	if (updates["notify_on_exit"] !== void 0) body["a65"] = updates["notify_on_exit"] ? T.safeZone.opt.NOTIFY_ON_EXIT.ON : T.safeZone.opt.NOTIFY_ON_EXIT.OFF;
	if (updates["schedule_enabled"] !== void 0) body["a66"] = updates["schedule_enabled"] ? T.safeZone.opt.SCHEDULE_ENABLED.ON : T.safeZone.opt.SCHEDULE_ENABLED.OFF;
	if (updates["schedule_start_time"] !== void 0) body["a67"] = updates["schedule_start_time"];
	if (updates["schedule_end_time"] !== void 0) body["a68"] = updates["schedule_end_time"];
	if (updates["is_active"] !== void 0) body["a69"] = updates["is_active"] ? T.safeZone.opt.IS_ACTIVE.YES : T.safeZone.opt.IS_ACTIVE.NO;
	await wordpressCCTFetch(T.safeZone.slug, {
		id,
		method: "PUT",
		body
	});
	if (updates["receiver_ids"] !== void 0) {
		if (!updates["user_id"]) throw new Error("Cannot save location alert receivers without the cared one's user id");
		await setLocationReceivers(String(updates["user_id"]), updates["receiver_ids"] || []);
	}
}
async function deleteSafeZoneWordPress(id) {
	await wordpressCCTFetch(T.safeZone.slug, {
		id,
		method: "DELETE"
	});
}
async function fetchSafeZoneAlertsWordPress(_caredOneId) {
	return (await runNotificationSkill("list-notifications")).filter((n) => n.type === "location").map((n) => ({
		id: n.id,
		alert_type: /danger|危险/i.test(`${n.title} ${n.message}`) ? "entered_danger_zone" : "safe_zone",
		message: n.message || n.title,
		is_read: n.is_read,
		created_at: n.created_at
	}));
}
async function acknowledgeAlertWordPress(alertId) {
	await runNotificationSkill("mark-notification-read", { id: alertId });
}
async function acknowledgeAllAlertsWordPress(_caredOneId) {
	await runNotificationSkill("mark-all-notifications-read");
}
async function fetchCaredOneLocationWordPress(caredOneId) {
	const snapshot = await fetchCurrentLocation(caredOneId);
	if (!snapshot) return null;
	return {
		id: snapshot.id,
		user_id: caredOneId,
		latitude: snapshot.latitude,
		longitude: snapshot.longitude,
		accuracy_meters: snapshot.accuracy_meters,
		battery_level: snapshot.battery_level,
		address_text: snapshot.address_text,
		platform: snapshot.platform,
		phone_is_charging: snapshot.phone_is_charging,
		is_emergency: snapshot.is_emergency === "Yes",
		moving_type: snapshot.moving_type,
		captured_at: snapshot.captured_at,
		updated_at: snapshot.captured_at,
		created_at: snapshot.captured_at
	};
}
async function fetchCaredOneLocationHistoryWordPress(caredOneId) {
	return (await fetchLocationHistory(caredOneId, { limit: 200 })).map((s) => ({
		id: s.id,
		user_id: caredOneId,
		latitude: s.latitude,
		longitude: s.longitude,
		accuracy_meters: s.accuracy_meters,
		address_text: s.address_text,
		battery_level: s.battery_level,
		phone_is_charging: s.phone_is_charging,
		platform: s.platform,
		moving_type: s.moving_type,
		is_emergency: s.is_emergency === "Yes",
		recorded_at: s.captured_at,
		created_at: s.captured_at
	}));
}
async function createSafeZoneAlertsForLocation(userId, lat, lng) {
	const zones = await fetchSafeZonesWordPress(userId);
	if (!zones.length) return;
	{
		const now = Date.now();
		for (const zone of zones) {
			const result = evaluateZoneAlert(zone, lat, lng);
			if (!result) continue;
			try {
				const key = ALERT_DEDUP_KEY(userId, String(zone.id), result.alertType);
				const last = Number(sessionStorage.getItem(key) || 0);
				if (last && now - last < ALERT_DEDUP_WINDOW_MS) continue;
				sessionStorage.setItem(key, String(now));
			} catch {}
			const msg = result.alertType === "entered_danger_zone" ? `Entered danger zone: ${zone.zone_type_label}` : result.alertType === "exited_safe_zone" ? `Left zone: ${zone.zone_type_label}` : `Entered zone: ${zone.zone_type_label}`;
			{
				await runNotificationSkill("send-notification", {
					userIds: [userId],
					includeSelf: true,
					type: "safe_zone_breach",
					title: result.alertType === "entered_danger_zone" ? "⚠️ Danger Zone Alert" : "📍 Safe Zone Alert",
					message: msg,
					actionUrl: `/find?zone=${zone.id}`
				});
				const receivers = Array.isArray(zone.receiver_ids) ? zone.receiver_ids : await fetchLocationReceiverIds(userId);
				await Promise.all(receivers.filter((rid) => normalizeWpUserId(rid) !== normalizeWpUserId(userId)).map((rid) => runNotificationSkill("send-notification", {
					userIds: [rid],
					type: "safe_zone_breach",
					title: result.alertType === "entered_danger_zone" ? "⚠️ Danger Zone Alert" : "📍 Safe Zone Alert",
					message: msg,
					actionUrl: `/find?zone=${zone.id}`
				})));
			}
		}
	}
}
async function shareMyLocationWordPress(latitude, longitude, options) {
	if (!getStoredWPUser()?.user_id) throw new Error("Not authenticated");
	if (!(options?.enabled ?? true)) return;
	await writeLocationAndCheckZones(latitude, longitude, {
		accuracy: options?.accuracy,
		battery_level: options?.batteryLevel,
		address_text: options?.addressText,
		isEmergency: options?.isEmergency
	});
}
async function disableMyLocationSharingWordPress() {}
var REQ_LOG_KEY = (caredOneId) => `locreq:${getStoredWPUser()?.user_id || ""}:${normalizeWpUserId(caredOneId)}`;
function readReqLog(caredOneId) {
	try {
		return JSON.parse(localStorage.getItem(REQ_LOG_KEY(caredOneId)) || "[]");
	} catch {
		return [];
	}
}
function writeReqLog(caredOneId, rows) {
	try {
		localStorage.setItem(REQ_LOG_KEY(caredOneId), JSON.stringify(rows.slice(0, 20)));
	} catch {}
}
async function fetchLocationRequestsWordPress(caredOneId) {
	const log = readReqLog(caredOneId);
	if (!log.length) return [];
	const latest = await fetchCurrentLocation(caredOneId).catch(() => null);
	const latestMs = latest?.captured_at ? new Date(latest.captured_at).getTime() : 0;
	return log.map((r) => ({
		...r,
		status: latestMs > new Date(r.created_at).getTime() ? "accepted" : "pending"
	}));
}
function zh() {
	try {
		return (localStorage.getItem("i18nextLng") || navigator.language || "").startsWith("zh");
	} catch {
		return false;
	}
}
async function sendLocationRequestWordPress(input) {
	const caredOneUserId = normalizeWpUserId(input.caredOneId);
	if (!caredOneUserId) throw new Error("Invalid cared one user");
	const storedUser = getStoredWPUser();
	if (!storedUser?.user_id) throw new Error("Not authenticated");
	const cn = zh();
	if (input.isEmergency) {
		if (!(await fetchLocationSharingFlags(caredOneUserId)).emergencyAllowed) throw new Error(cn ? "对方还没有开启紧急请求许可" : "Emergency requests are not allowed for this person yet");
	}
	const askerName = await fetchMyAppUserName().catch(() => "") || (cn ? "你的护理者" : "Your caregiver");
	if (!await runNotificationSkill("send-notification", {
		userIds: [caredOneUserId],
		type: input.isEmergency ? "emergency_location_request" : "location_request",
		title: input.isEmergency ? cn ? "🚨 紧急位置请求" : "🚨 Emergency location request" : cn ? "📍 位置请求" : "📍 Location request",
		message: (input.isEmergency ? cn ? `${askerName}发出了紧急位置请求，你的位置已自动发送。` : `${askerName} sent an emergency location request; your location is sent automatically.` : cn ? `${askerName}请求查看你的位置，点开选择是否允许。` : `${askerName} asks to see your location. Open to allow or decline.`) + (input.message ? ` “${input.message}”` : ""),
		actionUrl: `/find?request_from=${storedUser.user_id}${input.isEmergency ? "&emergency=1" : ""}`
	})) throw new Error(cn ? "请求没有送达对方" : "The request was not delivered");
	const log = readReqLog(input.caredOneId);
	log.unshift({
		id: String(Date.now()),
		created_at: (/* @__PURE__ */ new Date()).toISOString(),
		message: input.message || "",
		is_emergency: !!input.isEmergency
	});
	writeReqLog(input.caredOneId, log);
}
async function cancelLocationRequestWordPress(requestId, caredOneId) {
	if (!caredOneId) return;
	writeReqLog(caredOneId, readReqLog(caredOneId).filter((r) => r.id !== requestId));
}
async function notifyRequester(requesterId, accept, emergency = false) {
	const me = getStoredWPUser();
	const cn = zh();
	const name = await fetchMyAppUserName().catch(() => "") || (cn ? "被护理者" : "Your cared one");
	await runNotificationSkill("send-notification", {
		userIds: [requesterId],
		type: "location",
		title: accept ? cn ? "📍 已收到位置" : "📍 Location received" : cn ? "位置请求被拒绝" : "Location request declined",
		message: accept ? emergency ? cn ? `紧急请求：已收到${name}现在的位置。` : `Emergency request: ${name}'s current location arrived.` : cn ? `${name}已允许并开启位置分享。` : `${name} allowed it and turned on location sharing.` : cn ? `${name}暂不分享位置。` : `${name} is not sharing their location right now.`,
		actionUrl: `/cared-ones/${me?.user_id}/location`
	});
}
/**
* Ordinary request answered by the cared one. Allow = CCT 258 a56 → b55
* (sharing on), plus one snapshot right away; the sharing agent keeps it going.
*/
async function respondToLocationRequestWordPress(input) {
	const me = getStoredWPUser();
	if (!me?.user_id) throw new Error("Not authenticated");
	const requester = normalizeWpUserId(input.requesterId);
	if (!requester) throw new Error("Invalid requester");
	if (input.accept) {
		if (!input.position) throw new Error(zh() ? "没有拿到你的位置" : "No position");
		await setLocationSharingFlags(me.user_id, { shareOn: true });
		await writeCaredOneSnapshot(input.position, false);
	}
	await notifyRequester(requester, input.accept);
}
/** One snapshot of the signed-in person. a68 b55 marks an emergency-only reading. */
async function writeCaredOneSnapshot(position, emergencyWithoutPermission) {
	const me = getStoredWPUser();
	if (!me?.user_id) throw new Error("Not authenticated");
	await writeLocationSnapshot(position.latitude, position.longitude, {
		accuracy: position.accuracy ?? null,
		is_emergency: emergencyWithoutPermission,
		is_cared_one: true
	});
	await createSafeZoneAlertsForLocation(String(me.user_id), position.latitude, position.longitude).catch(() => {});
}
/**
* Emergency request arriving on the cared one's device. Only allowed when the
* cared one's CCT 258 a55 is b55. No confirmation: the position is sent at once.
* If ordinary sharing (a56) is off, the snapshot is flagged a68 b55.
*/
async function answerEmergencyRequestWordPress(input) {
	const me = getStoredWPUser();
	if (!me?.user_id) throw new Error("Not authenticated");
	const flags = await fetchLocationSharingFlags(me.user_id);
	if (!flags.emergencyAllowed) throw new Error("Emergency requests are not allowed");
	await writeCaredOneSnapshot(input.position, !flags.shareOn);
	const requester = normalizeWpUserId(input.requesterId);
	if (requester) await notifyRequester(requester, true, true);
}
/** Caregiver switches on "emergency request permission" (a55 → b55) and tells the cared one. */
async function enableEmergencyLocationPermissionWordPress(caredOneId) {
	const target = normalizeWpUserId(caredOneId);
	if (!target) throw new Error("Invalid cared one user");
	await setLocationSharingFlags(target, { emergencyAllowed: true });
	notifyEmergencyEnabled(target).catch((e) => console.error("Emergency permission notice failed", e));
}
async function notifyEmergencyEnabled(target) {
	const cn = zh();
	const askerName = await fetchMyAppUserName().catch(() => "") || (cn ? "你的护理者" : "Your caregiver");
	await runNotificationSkill("send-notification", {
		userIds: [target],
		type: "location",
		title: cn ? "已开启紧急定位许可" : "Emergency location permission is on",
		message: cn ? `${askerName}为你开启了紧急定位许可：遇到紧急情况时，护理者可以不经确认查看你的位置。` : `${askerName} turned on emergency location permission: in an emergency your caregiver can see your location without asking first.`,
		actionUrl: `/find`
	});
}
async function fetchCaredOneLocationSettingsWordPress(caredOneId) {
	const latest = await fetchCurrentLocation(caredOneId);
	if (!latest) return null;
	const lastTime = latest.captured_at ? new Date(latest.captured_at).getTime() : 0;
	const isRecent = Date.now() - lastTime < 300 * 1e3;
	return {
		id: latest.id,
		user_id: caredOneId,
		tracking_enabled: isRecent,
		is_sharing_enabled: isRecent,
		sharing_enabled: isRecent
	};
}
//#endregion
export { zoneTypeLabel as C, updateSafeZoneWordPress as S, isSafeZone as _, cancelLocationRequestWordPress as a, shareMyLocationWordPress as b, enableEmergencyLocationPermissionWordPress as c, fetchCaredOneLocationWordPress as d, fetchLocationRequestsWordPress as f, isDangerZone as g, isCustomZone as h, acknowledgeAllAlertsWordPress as i, fetchCaredOneLocationHistoryWordPress as l, fetchSafeZonesWordPress as m, ZONE_TYPE_CODES as n, createSafeZoneWordPress as o, fetchSafeZoneAlertsWordPress as p, acknowledgeAlertWordPress as r, deleteSafeZoneWordPress as s, ZONE_TYPE as t, fetchCaredOneLocationSettingsWordPress as u, respondToLocationRequestWordPress as v, source_wordpress_extended_exports as x, sendLocationRequestWordPress as y };
