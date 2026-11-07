import "../_runtime.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/return-path-B1QN16Ol.js
/**
* Where to go after signing in / finishing app onboarding.
* Only same-site paths ("/care-circle/28") are accepted, never "//host" or
* full URLs, so a crafted link cannot send someone to another website.
*/
function safeNextPath(raw) {
	const value = String(raw ?? "").trim();
	if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
	if (value.startsWith("/auth") || value.startsWith("/onboarding")) return null;
	return value;
}
function withNext(path, next) {
	const safe = safeNextPath(next);
	return safe ? `${path}?next=${encodeURIComponent(safe)}` : path;
}
//#endregion
export { withNext as n, safeNextPath as t };
