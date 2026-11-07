import "../_runtime.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/locationService-BXr8t7Zc.js
async function getBatteryLevel() {
	try {
		if ((window?.Capacitor)?.isNativePlatform?.()) {
			const { Device } = await import("../_libs/_10.mjs");
			const info = await Device.getBatteryInfo();
			return info.batteryLevel != null ? Math.round(info.batteryLevel * 100) : null;
		}
		const nav = navigator;
		if (nav.getBattery) {
			const battery = await nav.getBattery();
			return Math.round(battery.level * 100);
		}
	} catch (_) {}
	return null;
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
function chaikinSmoothPerVertex(points, radii) {
	if (points.length < 3) return points;
	const maxRadius = Math.max(...radii, 0);
	if (maxRadius === 0) return points;
	const iters = Math.ceil(maxRadius);
	let pts = [...points];
	let rads = [...radii];
	for (let iter = 0; iter < iters; iter++) {
		const strength = (r) => Math.min(1, Math.max(0, r - iter));
		const next = [];
		const nextR = [];
		for (let i = 0; i < pts.length; i++) {
			const j = (i + 1) % pts.length;
			const si = strength(rads[i]);
			const sj = strength(rads[j]);
			const [xi, yi] = pts[i];
			const [xj, yj] = pts[j];
			if (si >= 1) {
				next.push([xi * .75 + xj * .25, yi * .75 + yj * .25]);
				next.push([xi * .25 + xj * .75, yi * .25 + yj * .75]);
				nextR.push(rads[i], rads[j]);
			} else if (si > 0) {
				const q1 = [xi * .75 + xj * .25, yi * .75 + yj * .25];
				const q2 = [xi * .25 + xj * .75, yi * .25 + yj * .75];
				next.push([xi * (1 - si) + q1[0] * si, yi * (1 - si) + q1[1] * si]);
				if (sj > 0) {
					next.push([xj * (1 - sj) + q2[0] * sj, yj * (1 - sj) + q2[1] * sj]);
					nextR.push(rads[i], rads[j]);
				} else nextR.push(rads[i]);
			} else {
				next.push([xi, yi]);
				nextR.push(rads[i]);
				if (sj > 0) {
					next.push([xi * .25 + xj * .75, yi * .25 + yj * .75]);
					nextR.push(rads[j]);
				}
			}
		}
		pts = next;
		rads = nextR;
	}
	return pts;
}
function isZoneActiveNow(zone) {
	if (!zone.schedule_enabled) return true;
	const now = /* @__PURE__ */ new Date();
	const dayName = [
		"Sun",
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat"
	][now.getDay()];
	if (!zone.schedule_days?.includes(dayName)) return false;
	const cur = now.getHours() * 60 + now.getMinutes();
	if (!zone.schedule_start_time || !zone.schedule_end_time) return true;
	const [sh, sm] = zone.schedule_start_time.split(":").map(Number);
	const [eh, em] = zone.schedule_end_time.split(":").map(Number);
	const s = sh * 60 + sm;
	const e = eh * 60 + em;
	return s <= e ? cur >= s && cur <= e : cur >= s || cur <= e;
}
function checkBreaches(lat, lng, zones) {
	const results = [];
	for (const zone of zones) {
		if (!isZoneActiveNow(zone)) continue;
		const isDanger = !!zone.is_danger;
		const isPolygon = String(zone.shape_type).toLowerCase() === "polygon";
		let inside = false;
		let distance = 0;
		if (isPolygon && zone.polygon_points?.length >= 3) {
			const pts = zone.polygon_points;
			inside = isPointInPolygon(lat, lng, zone.corner_radius?.some((r) => r > 0) ? chaikinSmoothPerVertex(pts, zone.corner_radius) : pts);
			distance = Math.round(getDistanceMeters(lat, lng, zone.latitude, zone.longitude));
		} else {
			distance = Math.round(getDistanceMeters(lat, lng, zone.latitude, zone.longitude));
			inside = distance <= (zone.radius_meters || 200);
		}
		const breached = isDanger ? inside : zone.is_safe ? !inside : inside ? !!zone.notify_on_enter : !!zone.notify_on_exit;
		if (breached) {
			const alertType = isDanger ? inside ? "entered_danger_zone" : "exited_danger_zone" : inside ? "entered_safe_zone" : "exited_safe_zone";
			results.push({
				zoneId: zone.id,
				zoneName: zone.zone_type_label,
				zoneType: zone.zone_type,
				alertType,
				distance,
				breached
			});
		}
	}
	return results;
}
//#endregion
export { getBatteryLevel as n, checkBreaches as t };
