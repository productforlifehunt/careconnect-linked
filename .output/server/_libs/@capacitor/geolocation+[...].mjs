import "../../_runtime.mjs";
import { c as WebPlugin, u as registerPlugin } from "./app+[...].mjs";
//#region node_modules/@capacitor/synapse/dist/synapse.mjs
function s(t) {
	t.CapacitorUtils.Synapse = new Proxy({}, { get(e, n) {
		return new Proxy({}, { get(w, o) {
			return (c, p, r) => {
				const i = t.Capacitor.Plugins[n];
				if (i === void 0) {
					r(/* @__PURE__ */ new Error(`Capacitor plugin ${n} not found`));
					return;
				}
				if (typeof i[o] != "function") {
					r(/* @__PURE__ */ new Error(`Method ${o} not found in Capacitor plugin ${n}`));
					return;
				}
				(async () => {
					try {
						p(await i[o](c));
					} catch (a) {
						r(a);
					}
				})();
			};
		} });
	} });
}
function u(t) {
	t.CapacitorUtils.Synapse = new Proxy({}, { get(e, n) {
		return t.cordova.plugins[n];
	} });
}
function f(t = !1) {
	typeof window > "u" || (window.CapacitorUtils = window.CapacitorUtils || {}, window.Capacitor !== void 0 && !t ? s(window) : window.cordova !== void 0 && u(window));
}
//#endregion
//#region node_modules/@capacitor/geolocation/dist/esm/index.js
var Geolocation$1 = registerPlugin("Geolocation", { web: () => import("../_43.mjs").then((m) => new m.GeolocationWeb()) });
f();
//#endregion
//#region node_modules/@capacitor/geolocation/dist/esm/web.js
var GeolocationWeb = class extends WebPlugin {
	async getCurrentPosition(options) {
		return new Promise((resolve, reject) => {
			navigator.geolocation.getCurrentPosition((pos) => {
				resolve(pos);
			}, (err) => {
				reject(err);
			}, Object.assign({
				enableHighAccuracy: false,
				timeout: 1e4,
				maximumAge: 0
			}, options));
		});
	}
	async watchPosition(options, callback) {
		return `${navigator.geolocation.watchPosition((pos) => {
			callback(pos);
		}, (err) => {
			callback(null, err);
		}, Object.assign({
			enableHighAccuracy: false,
			timeout: 1e4,
			maximumAge: 0,
			minimumUpdateInterval: 5e3
		}, options))}`;
	}
	async clearWatch(options) {
		navigator.geolocation.clearWatch(parseInt(options.id, 10));
	}
	async checkPermissions() {
		if (typeof navigator === "undefined" || !navigator.permissions) throw this.unavailable("Permissions API not available in this browser");
		const permission = await navigator.permissions.query({ name: "geolocation" });
		return {
			location: permission.state,
			coarseLocation: permission.state
		};
	}
	async requestPermissions() {
		throw this.unimplemented("Not implemented on web.");
	}
};
new GeolocationWeb();
//#endregion
export { Geolocation$1 as n, GeolocationWeb as t };
