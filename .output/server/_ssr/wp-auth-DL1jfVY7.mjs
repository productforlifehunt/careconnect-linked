import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wp-auth-DL1jfVY7.js
var WP_SERVERS = [{
	id: "main",
	label: "Main Server (app.challenged-dementia.com/afresh)",
	baseUrl: "https://app.challenged-dementia.com/afresh",
	sitePath: "afresh",
	isPrimary: true
}];
var STORAGE_KEY = "cc_active_wp_server";
function getActiveServer() {
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored) {
		const found = WP_SERVERS.find((s) => s.id === stored);
		if (found) return found;
	}
	return WP_SERVERS.find((s) => s.isPrimary) || WP_SERVERS[0];
}
/**
* Centralized WordPress base URL helper.
* Reads the active server from wp-servers registry.
* - Default: direct HTTPS to WordPress (JWT auth, permissive CORS) — no proxy.
* - Only credentialed guest reads (Woo catalog keys, sanitized provider search)
*   go through the backend proxy.
*/
/** Backend proxy URL — used only for credentialed guest reads. */
var PROD_WP_PROXY = `${{
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SSR": true,
	"TSS_DEV_SERVER": "false",
	"TSS_DEV_SSR_STYLES_BASEPATH": "/",
	"TSS_DEV_SSR_STYLES_ENABLED": "true",
	"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
	"TSS_INLINE_CSS_ENABLED": "false",
	"TSS_ROUTER_BASEPATH": "",
	"TSS_SERVER_FN_BASE": "/_serverFn/",
	"VITE_SUPABASE_PROJECT_ID": "fofewspvoaylmzzgpyrg",
	"VITE_SUPABASE_PUBLISHABLE_KEY": "sb_publishable_4ZCLp6URt0IVeFm6-aSD4g_dxkJY7Ps",
	"VITE_SUPABASE_URL": "https://fofewspvoaylmzzgpyrg.supabase.co",
	"VITE_WP_BASE_URL": "https://app.challenged-dementia.com/afresh"
}["VITE_SUPABASE_URL"] || ""}/functions/v1/wp-proxy`;
/**
* Returns the WP API URL for the given path.
* In dev mode with the primary server, uses Vite proxy.
* Otherwise routes through the edge function with a dynamic base URL header.
*/
function buildWPUrl(wpJsonPath, params, options) {
	const server = getActiveServer();
	const qs = new URLSearchParams();
	if (params) Object.entries(params).forEach(([key, value]) => {
		if (value === void 0 || value === null) return;
		qs.set(key, String(value));
	});
	const path = wpJsonPath.startsWith("/") ? wpJsonPath : `/wp-json/${wpJsonPath}`;
	if (!options?.forceEdge) {
		const query = qs.toString();
		return `${server.baseUrl}${path}${query ? `?${query}` : ""}`;
	}
	qs.set("path", path);
	qs.set("wp_base", server.baseUrl);
	return `${PROD_WP_PROXY}?${qs.toString()}`;
}
/**
* Build headers for WP requests. In production, includes the Supabase anon key.
*/
function buildWPHeaders(token, contentType, options) {
	const headers = {};
	if (contentType) headers["Content-Type"] = contentType;
	if (token) headers["Authorization"] = `Bearer ${token}`;
	if (options?.forceEdge === true) {
		const anonKey = {
			"BASE_URL": "/",
			"DEV": false,
			"MODE": "production",
			"PROD": true,
			"SSR": true,
			"TSS_DEV_SERVER": "false",
			"TSS_DEV_SSR_STYLES_BASEPATH": "/",
			"TSS_DEV_SSR_STYLES_ENABLED": "true",
			"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
			"TSS_INLINE_CSS_ENABLED": "false",
			"TSS_ROUTER_BASEPATH": "",
			"TSS_SERVER_FN_BASE": "/_serverFn/",
			"VITE_SUPABASE_PROJECT_ID": "fofewspvoaylmzzgpyrg",
			"VITE_SUPABASE_PUBLISHABLE_KEY": "sb_publishable_4ZCLp6URt0IVeFm6-aSD4g_dxkJY7Ps",
			"VITE_SUPABASE_URL": "https://fofewspvoaylmzzgpyrg.supabase.co",
			"VITE_WP_BASE_URL": "https://app.challenged-dementia.com/afresh"
		}["VITE_SUPABASE_PUBLISHABLE_KEY"];
		if (anonKey) headers["apikey"] = anonKey;
	}
	return headers;
}
/**
* WordPress JWT Authentication Service
*/
var wp_auth_exports = /* @__PURE__ */ __exportAll({
	getStoredWPUser: () => getStoredWPUser,
	getWPToken: () => getWPToken,
	wpChangePassword: () => wpChangePassword,
	wpDeleteAccount: () => wpDeleteAccount,
	wpEnsureFreshToken: () => wpEnsureFreshToken,
	wpLogin: () => wpLogin,
	wpLogout: () => wpLogout,
	wpRefreshToken: () => wpRefreshToken,
	wpRegister: () => wpRegister,
	wpRequestPasswordReset: () => wpRequestPasswordReset,
	wpUploadMedia: () => wpUploadMedia,
	wpValidateToken: () => wpValidateToken
});
var TOKEN_KEY = "cc_wp_token";
var USER_KEY = "cc_wp_user";
function decodeJwtPayload(token) {
	try {
		const [, payload] = token.split(".");
		if (!payload) return null;
		const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
		const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
		return JSON.parse(atob(padded));
	} catch {
		return null;
	}
}
function userFromToken(token, fallbackIdentifier) {
	const payload = decodeJwtPayload(token) || {};
	const data = payload["data"] ?? payload;
	const userEmail = String(data.user_email ?? payload["email"] ?? fallbackIdentifier);
	const userLogin = String(data.user_login ?? payload["username"] ?? userEmail);
	return {
		user_id: Number(data.user_id ?? payload["id"] ?? 0),
		user_email: userEmail,
		user_login: userLogin,
		user_display_name: String(data.user_display_name ?? payload["username"] ?? (userLogin || fallbackIdentifier))
	};
}
async function fetchCurrentWpUser(token) {
	try {
		const url = buildWPUrl("wp/v2/users/me", { context: "edit" });
		const response = await fetch(url, {
			method: "GET",
			headers: buildWPHeaders(token, "application/json")
		});
		if (!response.ok) return null;
		const data = await response.json();
		const userId = Number(data?.id ?? 0);
		const userEmail = String(data?.email ?? "");
		const userLogin = String(data?.slug ?? data?.username ?? "");
		const userDisplayName = String(data?.name ?? userLogin);
		if (!userId || !userLogin) return null;
		return {
			user_id: userId,
			user_email: userEmail,
			user_login: userLogin,
			user_display_name: userDisplayName
		};
	} catch {
		return null;
	}
}
async function trySimpleJwtLogin(identifier, password) {
	const body = identifier.includes("@") ? {
		email: identifier,
		password
	} : {
		username: identifier,
		password
	};
	const url = buildWPUrl("simple-jwt-login/v1/auth");
	const response = await fetch(url, {
		method: "POST",
		headers: buildWPHeaders(null, "application/json"),
		body: JSON.stringify(body)
	});
	const data = await response.json();
	if (response.ok && data?.success && data.data?.jwt) return data;
	return null;
}
/**
* Authenticate against WordPress and receive a JWT token.
*/
async function wpLogin(usernameOrEmail, password) {
	const sjlData = await trySimpleJwtLogin(usernameOrEmail, password);
	if (!sjlData?.success || !sjlData.data?.jwt) {
		const message = sjlData?.data?.message || "WordPress authentication failed";
		throw new Error(message);
	}
	const sjlToken = sjlData.data.jwt;
	const wpUser = await fetchCurrentWpUser(sjlToken) || userFromToken(sjlToken, usernameOrEmail);
	localStorage.setItem(TOKEN_KEY, sjlToken);
	localStorage.setItem(USER_KEY, JSON.stringify(wpUser));
	return {
		success: true,
		token: sjlToken,
		expires: 0,
		user_id: wpUser.user_id,
		user_email: wpUser.user_email,
		user_login: wpUser.user_login,
		user_display_name: wpUser.user_display_name
	};
}
/**
* Validate a stored token against WordPress.
*/
async function wpValidateToken() {
	const token = localStorage.getItem(TOKEN_KEY);
	if (!token) return null;
	try {
		const payload = decodeJwtPayload(token);
		if (!payload) {
			wpLogout();
			return null;
		}
		const exp = typeof payload["exp"] === "number" ? payload["exp"] : null;
		if (exp && exp * 1e3 <= Date.now()) {
			if (!await wpRefreshToken()) {
				wpLogout();
				return null;
			}
		}
		const verifiedUser = await fetchCurrentWpUser(token);
		if (verifiedUser) {
			localStorage.setItem(USER_KEY, JSON.stringify(verifiedUser));
			return verifiedUser;
		}
		const storedUser = getStoredWPUser();
		if (!storedUser) {
			wpLogout();
			return null;
		}
		return storedUser;
	} catch {
		wpLogout();
		return null;
	}
}
/**
* Renew the stored sign-in token (WordPress tokens last 60 minutes).
* Returns false when there is no token or WordPress refuses to renew it.
*/
var refreshInflight = null;
function wpRefreshToken() {
	if (!refreshInflight) refreshInflight = doRefreshToken().finally(() => {
		refreshInflight = null;
	});
	return refreshInflight;
}
async function doRefreshToken() {
	const token = localStorage.getItem(TOKEN_KEY);
	if (!token) return false;
	try {
		const response = await fetch(buildWPUrl("simple-jwt-login/v1/auth/refresh"), {
			method: "POST",
			headers: buildWPHeaders(null, "application/json"),
			body: JSON.stringify({ JWT: token })
		});
		const data = await response.json().catch(() => null);
		const next = response.ok && data?.success ? data.data?.jwt : null;
		if (!next) return false;
		localStorage.setItem(TOKEN_KEY, next);
		return true;
	} catch {
		return false;
	}
}
/**
* Renews the token when it expires within `marginMs` (or already expired).
* Returns false when no usable token remains.
*/
async function wpEnsureFreshToken(marginMs = 900 * 1e3) {
	const token = localStorage.getItem(TOKEN_KEY);
	if (!token) return false;
	const exp = decodeJwtPayload(token)?.["exp"];
	if (typeof exp === "number" && exp * 1e3 - Date.now() > marginMs) return true;
	return wpRefreshToken();
}
/**
* Clear WP auth state.
*/
function wpLogout() {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USER_KEY);
}
/**
* Get the stored WP token.
*/
function getWPToken() {
	return localStorage.getItem(TOKEN_KEY);
}
/**
* Get the stored WP user (without network call).
*/
function getStoredWPUser() {
	const raw = localStorage.getItem(USER_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}
async function wpUploadMedia(file) {
	const token = getWPToken();
	if (!token) throw new Error("Not authenticated");
	const formData = new FormData();
	formData.append("file", file, file.name);
	const url = buildWPUrl("wp/v2/media");
	const res = await fetch(url, {
		method: "POST",
		headers: buildWPHeaders(token),
		body: formData
	});
	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Upload failed: ${res.status} - ${err}`);
	}
	const data = await res.json();
	return data.source_url || data.guid?.rendered || "";
}
async function wpRequestPasswordReset(email) {
	const url = buildWPUrl("simple-jwt-login/v1/user/reset_password");
	if ((await fetch(url, {
		method: "POST",
		headers: buildWPHeaders(null, "application/json"),
		body: JSON.stringify({ email })
	})).ok) return;
	throw new Error("Password reset request failed. Please try again.");
}
async function wpRegister(email, password, displayName) {
	const url = buildWPUrl("simple-jwt-login/v1/users");
	const res = await fetch(url, {
		method: "POST",
		headers: buildWPHeaders(null, "application/json"),
		body: JSON.stringify({
			email,
			password,
			user_login: email,
			display_name: displayName || email
		})
	});
	const data = await res.json();
	if (!res.ok || !data?.success && !data?.user) {
		const msg = data?.data?.message || data?.message || "Registration failed";
		throw new Error(msg);
	}
	return wpLogin(email, password);
}
async function wpDeleteAccount() {
	const token = getWPToken();
	if (!token) throw new Error("Not authenticated");
	const randomSuffix = Math.random().toString(36).substring(2, 10);
	const url = buildWPUrl("wp/v2/users/me");
	const res = await fetch(url, {
		method: "POST",
		headers: buildWPHeaders(token, "application/json"),
		body: JSON.stringify({
			first_name: "Deleted",
			last_name: "User",
			name: `deleted_${randomSuffix}`,
			description: "",
			url: ""
		})
	});
	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Account deletion failed: ${res.status} - ${err}`);
	}
	wpLogout();
}
async function wpChangePassword(newPassword) {
	const token = getWPToken();
	if (!token) throw new Error("Not authenticated");
	const url = buildWPUrl("wp/v2/users/me");
	const res = await fetch(url, {
		method: "POST",
		headers: buildWPHeaders(token, "application/json"),
		body: JSON.stringify({ password: newPassword })
	});
	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Password change failed: ${res.status} - ${err}`);
	}
}
//#endregion
export { getWPToken as a, wpLogin as c, wpRegister as d, wpRequestPasswordReset as f, wp_auth_exports as h, getStoredWPUser as i, wpLogout as l, wpValidateToken as m, buildWPUrl as n, wpChangePassword as o, wpUploadMedia as p, getActiveServer as r, wpEnsureFreshToken as s, buildWPHeaders as t, wpRefreshToken as u };
