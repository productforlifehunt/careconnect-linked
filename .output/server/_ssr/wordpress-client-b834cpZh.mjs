import "../_runtime.mjs";
import { a as getWPToken, n as buildWPUrl, s as wpEnsureFreshToken, t as buildWPHeaders, u as wpRefreshToken } from "./wp-auth-DL1jfVY7.mjs";
import { n as attachResponse, s as recordRequest, t as InspectorWriteBlocked } from "./recorder-CZ3Gd8pJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wordpress-client-b834cpZh.js
/** Memory-only reads: coalesce pending work, expire after completion, reject stale generations. */
function createReadCache() {
	const entries = /* @__PURE__ */ new Map();
	return {
		clear(fragment) {
			if (!fragment) entries.clear();
			else for (const key of entries.keys()) if (key.includes(fragment)) entries.delete(key);
		},
		read(key, load, ttl) {
			const hit = entries.get(key);
			if (hit && (hit.settledAt === null || Date.now() - hit.settledAt < ttl)) return hit.promise;
			const entry = {
				settledAt: null,
				promise: Promise.resolve().then(load)
			};
			entry.promise = entry.promise.then((value) => {
				entry.settledAt = Date.now();
				return value;
			}, (error) => {
				if (entries.get(key) === entry) entries.delete(key);
				throw error;
			});
			entries.set(key, entry);
			return entry.promise;
		}
	};
}
/**
* Transport-level read dedupe.
*
* Sibling widgets on one screen repeatedly ask for the same relation/CCT rows.
* Instead of one HTTP round-trip per caller, identical GETs issued within a
* short window share a single response (cloned per caller). Any write clears
* the cache, so nothing stale is served after a mutation.
*/
var GET_TTL_MS = 4e3;
var getCache = createReadCache();
if (typeof window !== "undefined") window.addEventListener("wp-write", () => getCache.clear());
/** Endpoints that only work through the backend proxy for anonymous visitors. */
var CREDENTIALED_GUEST_ENDPOINTS = [/(^|\/)wc\/v3\//i, /(^|\/)jet-cct\/user_ext_profile_2/i];
function needsCredentialedProxy(endpoint) {
	return CREDENTIALED_GUEST_ENDPOINTS.some((re) => re.test(endpoint));
}
async function wordpressFetchRaw(endpoint, options = {}, retried = false) {
	if (typeof window !== "undefined" && getWPToken()) await wpEnsureFreshToken().catch(() => false);
	const token = getWPToken();
	const { method = "GET", body, params } = options;
	const cleanParams = {};
	if (params) Object.entries(params).forEach(([key, value]) => {
		if (value === void 0 || value === null) return;
		cleanParams[key] = value;
	});
	const forceEdge = !token && needsCredentialedProxy(endpoint);
	const url = buildWPUrl(endpoint, cleanParams, { forceEdge });
	const headers = buildWPHeaders(token, "application/json", { forceEdge });
	const recorded = typeof window !== "undefined" ? recordRequest(method, endpoint, cleanParams, body) : null;
	if (recorded?.blocked) throw new InspectorWriteBlocked(method, endpoint);
	if (method !== "GET" && typeof window !== "undefined") window.dispatchEvent(new CustomEvent("wp-write"));
	let response;
	try {
		if (method === "GET") {
			const key = `${url}|${token || "guest"}`;
			response = (await getCache.read(key, async () => {
				const result = await fetch(url, {
					method,
					headers
				});
				await result.clone().arrayBuffer();
				if (!result.ok) getCache.clear(key);
				return result;
			}, GET_TTL_MS)).clone();
		} else response = await fetch(url, {
			method,
			headers,
			body: body ? JSON.stringify(body) : null
		});
	} catch (err) {
		const detail = err instanceof Error ? err.message : String(err);
		const e = /* @__PURE__ */ new Error(`WP API ${endpoint}: request aborted (${detail})`);
		e.isNetworkAbort = true;
		throw e;
	}
	if (method !== "GET" && typeof window !== "undefined") window.dispatchEvent(new CustomEvent("wp-write"));
	attachResponse(recorded, response);
	if (!response.ok) {
		if (response.status === 404) return new Response("[]", {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
		if (response.status === 400 || response.status === 401 || response.status === 403) try {
			const text = await response.clone().text();
			const looksLikeAuthFailure = /signature verification failed/i.test(text) || /expired token/i.test(text) || /token.*(expired|invalid|revoked)/i.test(text) || /jwt/i.test(text) && /(invalid|expired|verification)/i.test(text) || /simple-jwt-login-middleware/i.test(text) || /errorCode"\s*:\s*\d{1,2}/i.test(text);
			const onResearcherPage = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("__site") === "researcher";
			if (looksLikeAuthFailure && token && !retried && await wpRefreshToken()) return wordpressFetchRaw(endpoint, options, true);
			if (looksLikeAuthFailure && token && onResearcherPage) throw new Error("Session expired. Please log in again.");
			if (looksLikeAuthFailure && token) {
				localStorage.removeItem("cc_wp_token");
				localStorage.removeItem("cc_wp_user");
				if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
					const next = encodeURIComponent(window.location.pathname + window.location.search);
					window.location.replace(`/auth?session_expired=1&next=${next}`);
				}
				throw new Error("Session expired. Please log in again.");
			}
		} catch (e) {
			if (e instanceof Error && e.message.startsWith("Session expired")) throw e;
		}
		throw new Error(`WP API ${endpoint}: ${response.status} ${response.statusText}`);
	}
	return response;
}
async function wordpressFetch(endpoint, options = {}) {
	return (await wordpressFetchRaw(endpoint, options)).json();
}
function stripHtml(value) {
	return (value || "").replace(/<[^>]*>/g, "");
}
/** Convert a CCT timestamp (Unix number OR date string) to ISO string. */
function cctTimestampToISO(val) {
	if (!val) return null;
	if (typeof val === "number") return (/* @__PURE__ */ new Date(val * 1e3)).toISOString();
	const d = /* @__PURE__ */ new Date(String(val).replace(" ", "T") + "Z");
	return isNaN(d.getTime()) ? null : d.toISOString();
}
/** Normalizes a raw JetEngine CCT item: _ID → id, Unix timestamps → ISO strings. */
function normalizeCCT(item) {
	const { _ID, cct_created, cct_modified, cct_author_id, cct_status, ...fields } = item;
	return {
		id: String(_ID),
		created_at: cctTimestampToISO(cct_created),
		updated_at: cctTimestampToISO(cct_modified),
		author_id: cct_author_id ? String(cct_author_id) : null,
		cct_status: cct_status || "publish",
		...fields
	};
}
/**
* Fetch from a JetEngine CCT endpoint (`/wp-json/jet-cct/{slug}`).
*/
async function wordpressCCTFetch(slug, options = {}) {
	const { id, ...fetchOptions } = options;
	const raw = await wordpressFetch(id !== void 0 ? `jet-cct/${slug}/${id}` : `jet-cct/${slug}`, fetchOptions);
	if (Array.isArray(raw)) return raw.map(normalizeCCT);
	if (raw && typeof raw === "object" && "_ID" in raw) return normalizeCCT(raw);
	if (raw && typeof raw === "object" && "item_id" in raw) return {
		...raw,
		_ID: raw.item_id,
		id: String(raw.item_id)
	};
	return raw;
}
/** True for requests dropped by the browser (route change / page unload). */
function isNetworkAbort(err) {
	return Boolean(err && typeof err === "object" && err.isNetworkAbort);
}
//#endregion
export { wordpressFetch as a, wordpressCCTFetch as i, isNetworkAbort as n, stripHtml as r, createReadCache as t };
