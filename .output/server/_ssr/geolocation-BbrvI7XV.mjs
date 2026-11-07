import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
import { r as Capacitor } from "../_libs/@capacitor/app+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/geolocation-BbrvI7XV.js
var geolocation_exports = /* @__PURE__ */ __exportAll({ getCurrentPosition: () => getCurrentPosition });
/**
* Get current position using Capacitor on native, browser API on web.
* Returns null if permission denied or unavailable (never throws).
*/
async function getCurrentPosition(options) {
	const timeout = options?.timeout ?? 1e4;
	if (Capacitor.isNativePlatform()) try {
		const { Geolocation } = await import("../_libs/_42.mjs");
		if ((await Geolocation.checkPermissions()).location === "denied") {
			if ((await Geolocation.requestPermissions()).location === "denied") return null;
		}
		const pos = await Geolocation.getCurrentPosition({
			enableHighAccuracy: true,
			timeout
		});
		return {
			latitude: pos.coords.latitude,
			longitude: pos.coords.longitude,
			accuracy: pos.coords.accuracy ?? null
		};
	} catch {
		return null;
	}
	if (!("geolocation" in navigator)) return null;
	try {
		const pos = await new Promise((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(resolve, reject, {
				enableHighAccuracy: true,
				timeout,
				maximumAge: 6e4
			});
		});
		return {
			latitude: pos.coords.latitude,
			longitude: pos.coords.longitude,
			accuracy: pos.coords.accuracy ?? null
		};
	} catch {
		return null;
	}
}
//#endregion
export { getCurrentPosition as n, geolocation_exports as t };
