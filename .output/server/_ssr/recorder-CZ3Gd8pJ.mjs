import "../_runtime.mjs";
import { i as getStoredWPUser } from "./wp-auth-DL1jfVY7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recorder-CZ3Gd8pJ.js
/**
* Read/write inspector recorder (researcher-only, browser-only).
*
* Every WordPress request that goes through wordpressFetchRaw is recorded here
* while the signed-in account is the researcher. When inspect mode is on, any
* write (POST/PUT/PATCH/DELETE) is recorded and NOT sent, so checking a page
* can never change data.
*/
var RESEARCHER_LOGIN = "researcher";
var MODE_KEY = "cc_rw_inspector";
var MAX_ROWS = 40;
var entries = [];
var seq = 0;
var listeners = /* @__PURE__ */ new Set();
function isResearcherAccount() {
	if (typeof window === "undefined") return false;
	try {
		return getStoredWPUser()?.user_login === RESEARCHER_LOGIN;
	} catch {
		return false;
	}
}
function inspectModeOn() {
	if (typeof window === "undefined") return false;
	return isResearcherAccount() && window.localStorage.getItem(MODE_KEY) === "1";
}
function setInspectMode(on) {
	if (on) window.localStorage.setItem(MODE_KEY, "1");
	else window.localStorage.removeItem(MODE_KEY);
	emit();
}
function emit() {
	listeners.forEach((l) => l());
}
function subscribeRecorder(fn) {
	listeners.add(fn);
	return () => {
		listeners.delete(fn);
	};
}
function getRecorded() {
	return entries;
}
function clearRecorded() {
	entries = [];
	emit();
}
function callerFiles() {
	const stack = (/* @__PURE__ */ new Error()).stack || "";
	const out = [];
	for (const m of stack.matchAll(/\/src\/([^?:)\s]+\.(?:tsx?|jsx?))/g)) {
		const f = m[1];
		if (f.includes("features/inspector/") || f.endsWith("wordpress-client.ts")) continue;
		if (!out.includes(f)) out.push(f);
	}
	return out.slice(0, 8);
}
function trim(value) {
	if (Array.isArray(value)) return value.slice(0, MAX_ROWS);
	return value;
}
/** Called by wordpressFetchRaw before a request. Returns the entry so the caller can attach the response. */
function recordRequest(method, endpoint, params, body) {
	if (!isResearcherAccount()) return null;
	const blocked = method !== "GET" && inspectModeOn();
	const entry = {
		id: ++seq,
		at: Date.now(),
		path: window.location.pathname + window.location.search,
		method,
		endpoint: endpoint.replace(/^\/+/, ""),
		params,
		body,
		blocked,
		callers: callerFiles()
	};
	entries = [...entries.slice(-599), entry];
	emit();
	return entry;
}
function attachResponse(entry, response) {
	if (!entry) return;
	entry.status = response.status;
	if (entry.method !== "GET") {
		emit();
		return;
	}
	response.clone().json().then((json) => {
		entry.rows = trim(json);
		emit();
	}).catch(() => emit());
}
var InspectorWriteBlocked = class extends Error {
	constructor(method, endpoint) {
		super(`读写核对模式：已拦截 ${method} ${endpoint}，未写入 / Inspect mode held back this write`);
		this.name = "InspectorWriteBlocked";
	}
};
/**
* Requests that bypass wordpressFetchRaw (WooCommerce, bookings, auth, media)
* are recorded too by observing window.fetch. Recording only: they are never
* held back here, so sign-in refresh and checkout behave normally.
*/
/** Best-effort plain view of a server-function payload (seroval: t1 string, t0 number, t9 array, t10 object). */
function fromSeroval(node) {
	if (!node || typeof node !== "object") return node;
	const n = node;
	if ("t" in n && typeof n.t === "number" && !("p" in n) && !("a" in n) && "s" in n) return n.t === 0 ? Number(n.s) : n.s;
	if (n.t === 2) return n.s === 2 ? true : n.s === 3 ? false : null;
	if (Array.isArray(n.a)) return n.a.map(fromSeroval);
	if (n.p && Array.isArray(n.p.k)) return Object.fromEntries(n.p.k.map((k, i) => [k, fromSeroval(n.p.v?.[i])]));
	if ("t" in n && typeof n.t === "object") return fromSeroval(n.t);
	return node;
}
function installFetchObserver() {
	if (typeof window === "undefined") return;
	const w = window;
	if (w.__rwFetchObserved) return;
	w.__rwFetchObserved = true;
	const original = w.fetch.bind(window);
	w.fetch = (async (input, init) => {
		let entry = null;
		try {
			const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
			const stack = (/* @__PURE__ */ new Error()).stack || "";
			const viaClient = /wordpress-client\.ts/.test(stack);
			const m = url.match(/\/wp-json\/([^?#]+)(?:\?([^#]*))?/) || url.match(/[?&]rest_route=\/?([^&#]+)(?:&([^#]*))?/);
			if (m && !viaClient && isResearcherAccount()) {
				const params = m[2] ? Object.fromEntries(new URLSearchParams(m[2])) : void 0;
				let body;
				try {
					body = typeof init?.body === "string" ? JSON.parse(init.body) : void 0;
				} catch {
					body = void 0;
				}
				entry = recordRequest((init?.method || (typeof input === "object" && "method" in input ? input.method : "GET")).toUpperCase(), decodeURIComponent(m[1]), params, body);
				if (entry) entry.blocked = false;
			}
			const fn = url.match(/\/functions\/v1\/(wp-admin-ops)\b/);
			if (fn && !entry && isResearcherAccount() && typeof init?.body === "string") {
				let body = {};
				try {
					body = JSON.parse(init.body);
				} catch {
					body = {};
				}
				const action = String(body["action"] || "?");
				const { wp_base: _base, action: _a, ...rest } = body;
				entry = recordRequest(/^(list|get|fetch|read|search)/.test(action) ? "GET" : "POST", `wc/server-op/${action}`, rest, void 0);
				if (entry) {
					entry.blocked = false;
					entry.via = fn[1];
				}
			}
			const sf = url.match(/\/_serverFn\/([A-Za-z0-9_=-]+)/);
			if (sf && !entry && isResearcherAccount() && !/inspector-ai/.test(url)) {
				let name = "serverFn";
				let serverFile = "";
				try {
					const id = JSON.parse(atob(sf[1].replace(/-/g, "+").replace(/_/g, "/")));
					name = String(id.export || name).replace(/_createServerFn_handler$/, "");
					serverFile = String(id.file || "").replace(/^\/?src\//, "").replace(/\?.*$/, "");
					if (/inspector-ai/.test(id.file || "")) name = "";
				} catch {}
				if (name) {
					let data;
					try {
						data = typeof init?.body === "string" ? fromSeroval(JSON.parse(init.body)) : void 0;
					} catch {
						data = void 0;
					}
					const payload = data && typeof data === "object" && "data" in data ? data.data : data;
					const action = payload && typeof payload === "object" && typeof payload["action"] === "string" ? String(payload["action"]) : "";
					entry = recordRequest(!action || /^(list|get|fetch|read|load|search|original)/.test(action) ? "GET" : "POST", `server-fn/${name}${action ? `/${action}` : ""}`, payload && typeof payload === "object" ? Object.fromEntries(Object.entries(payload).filter(([, v]) => typeof v !== "string" || v.length < 200)) : void 0, void 0);
					if (entry) {
						entry.blocked = false;
						entry.via = "server-fn";
						if (!entry.callers.length && serverFile) entry.callers = [serverFile];
					}
				}
			}
		} catch {
			entry = null;
		}
		const res = await original(input, init);
		if (entry?.via) {
			const e = entry;
			e.status = res.status;
			res.clone().json().then((raw) => {
				let j = e.via === "server-fn" ? fromSeroval(raw) : raw;
				if (e.via === "server-fn" && j && typeof j === "object" && "result" in j) j = j.result;
				if (e.via === "server-fn" && j && typeof j === "object" && !Array.isArray(j)) {
					const arrays = Object.values(j).filter(Array.isArray);
					if (arrays.length === 1) j = arrays[0];
				}
				e.rows = trim(j && typeof j === "object" && "data" in j && e.via !== "server-fn" ? j.data : j);
				emit();
			}).catch(() => emit());
		} else if (entry) attachResponse(entry, res);
		return res;
	});
}
installFetchObserver();
//#endregion
export { inspectModeOn as a, setInspectMode as c, getRecorded as i, subscribeRecorder as l, attachResponse as n, isResearcherAccount as o, clearRecorded as r, recordRequest as s, InspectorWriteBlocked as t };
