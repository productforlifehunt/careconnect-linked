import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/join-link-DH4hH7JP.js
var join_link_exports = /* @__PURE__ */ __exportAll({
	JOIN_CODE_MAX_LENGTH: () => 6,
	careGroupLink: () => careGroupLink,
	careGroupPath: () => careGroupPath,
	cleanJoinCodeInput: () => cleanJoinCodeInput,
	groupIdFromPath: () => groupIdFromPath,
	parseCareGroupLink: () => parseCareGroupLink,
	randomJoinCode: () => randomJoinCode
});
function cleanId(groupId) {
	const id = String(groupId ?? "").trim().replace(/^wp-/, "");
	return /^\d+$/.test(id) && Number(id) > 0 ? id : "";
}
function careGroupLink(origin, groupId) {
	const base = String(origin || "").trim().replace(/\/+$/, "");
	const id = cleanId(groupId);
	if (!base || !id) return "";
	return `${base}/care-circle/${id}`;
}
function careGroupPath(groupId) {
	return `/care-circle/${cleanId(groupId) || String(groupId).replace(/^wp-/, "")}`;
}
/** The group id inside a page address (/care-circle/12, NotchSafety /circle/12, old /group/12). */
function groupIdFromPath(pathname) {
	const m = String(pathname || "").match(/^\/(?:care-circle|circle|group)\/(\d+)\/?$/);
	return m && Number(m[1]) > 0 ? m[1] : null;
}
/** Reads the group id out of a pasted group link ("…/care-circle/123", old "…/group/123"). */
function parseCareGroupLink(text) {
	const m = String(text || "").trim().match(/\/(?:care-circle|circle|group)\/(\d+)(?:[/?#]|$)/);
	return m && Number(m[1]) > 0 ? m[1] : null;
}
/** Default join code: six random digits. */
function randomJoinCode() {
	const b = /* @__PURE__ */ new Uint32Array(6);
	crypto.getRandomValues(b);
	return Array.from(b, (n) => String(n % 10)).join("");
}
/** Admins may type any characters, but never more than six, and no spaces. */
function cleanJoinCodeInput(value) {
	return String(value || "").replace(/\s/g, "").slice(0, 6);
}
//#endregion
export { join_link_exports as a, groupIdFromPath as i, careGroupPath as n, parseCareGroupLink as o, cleanJoinCodeInput as r, randomJoinCode as s, careGroupLink as t };
