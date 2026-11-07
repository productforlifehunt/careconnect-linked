import "../_runtime.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shared-note-BCJzvZmG.js
var toB64Url = (s) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
function encodeSharedNote(n) {
	return `${window.location.origin}/share/note?d=${toB64Url(JSON.stringify(n))}`;
}
function decodeSharedNote(d) {
	try {
		const b = atob(d.replace(/-/g, "+").replace(/_/g, "/"));
		const obj = JSON.parse(new TextDecoder().decode(Uint8Array.from(b, (ch) => ch.charCodeAt(0))));
		return obj && typeof obj.t === "string" && typeof obj.c === "string" ? obj : null;
	} catch {
		return null;
	}
}
//#endregion
export { encodeSharedNote as n, decodeSharedNote as t };
