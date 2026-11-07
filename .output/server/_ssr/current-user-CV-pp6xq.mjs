import "../_runtime.mjs";
import { i as getStoredWPUser } from "./wp-auth-DL1jfVY7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/current-user-CV-pp6xq.js
/**
* Shared helper to read the current WP user id from localStorage.
* The stored user object uses `user_id` (not `id`) — see services/wp-auth.ts.
*/
function getCurrentUserId() {
	const u = getStoredWPUser();
	if (!u) return null;
	const raw = u.user_id ?? u.id;
	return raw ? String(raw) : null;
}
function getCurrentUserIdNumber() {
	const id = getCurrentUserId();
	if (!id) return null;
	const n = Number(String(id).replace(/^wp-/, ""));
	return Number.isFinite(n) && n > 0 ? n : null;
}
//#endregion
export { getCurrentUserIdNumber as n, getCurrentUserId as t };
