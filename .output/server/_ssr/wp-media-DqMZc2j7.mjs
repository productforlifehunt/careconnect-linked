import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
import { a as getWPToken, n as buildWPUrl, t as buildWPHeaders } from "./wp-auth-DL1jfVY7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wp-media-DqMZc2j7.js
/**
* WordPress Media Library helpers (headless).
*
* JetEngine `gallery` fields store a comma-separated list of WP media IDs
* (e.g. "173,174,175"); `media` fields store a single ID. These helpers keep
* the parsing/serialising in one place so every CCT that carries attachments
* behaves identically.
*/
var wp_media_exports = /* @__PURE__ */ __exportAll({
	parseMediaIds: () => parseMediaIds,
	resolveWPMedia: () => resolveWPMedia,
	serializeMediaIds: () => serializeMediaIds,
	uploadWPMedia: () => uploadWPMedia,
	uploadWPMediaBatch: () => uploadWPMediaBatch
});
/** "173,174" -> [173, 174]. Accepts arrays and single numbers too. */
function parseMediaIds(raw) {
	if (raw == null || raw === "") return [];
	return (Array.isArray(raw) ? raw : String(raw).split(",")).map((v) => Number(String(v).trim())).filter((n) => Number.isFinite(n) && n > 0);
}
/** [173, 174] -> "173,174" (JetEngine gallery storage format). */
function serializeMediaIds(ids) {
	return parseMediaIds(ids).join(",");
}
function fileToBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(/* @__PURE__ */ new Error("Could not read the file"));
		reader.onload = () => {
			const result = String(reader.result || "");
			resolve(result.slice(result.indexOf(",") + 1));
		};
		reader.readAsDataURL(file);
	});
}
/**
* Upload on behalf of a normal app user. Roles like `customer`/`subscriber`
* have no `upload_files` capability, so WP answers the direct REST call with
* 403 rest_cannot_create. The wp-admin-ops proxy performs the upload with the
* admin application password and re-attributes the attachment to the caller.
*/
async function uploadViaAdminOps(file) {
	const { wpAdminOps } = await import("../_libs/_5.mjs").then((n) => n.x);
	const data_base64 = await fileToBase64(file);
	const res = await wpAdminOps("upload_media", {
		file_name: file.name,
		mime_type: file.type || "application/octet-stream",
		data_base64
	});
	if (!res?.media?.id) throw new Error(res?.error || "Media upload failed");
	return toMediaItem(res.media);
}
/** Upload one File to the WP media library, returning the media item. */
async function uploadWPMedia(file) {
	const url = buildWPUrl("/wp-json/wp/v2/media");
	const headers = buildWPHeaders(getWPToken());
	delete headers["Content-Type"];
	headers["Content-Disposition"] = `attachment; filename="${file.name.replace(/"/g, "")}"`;
	const fd = new FormData();
	fd.append("file", file);
	let res;
	try {
		res = await fetch(url, {
			method: "POST",
			headers,
			body: fd
		});
	} catch {
		return uploadViaAdminOps(file);
	}
	if (res.status === 401 || res.status === 403) return uploadViaAdminOps(file);
	if (!res.ok) throw new Error(`Media upload failed: ${res.status} ${await res.text()}`);
	return toMediaItem(await res.json());
}
/** Upload several files in parallel. */
async function uploadWPMediaBatch(files) {
	return Promise.all(files.map((f) => uploadWPMedia(f)));
}
function toMediaItem(m) {
	const mime = m?.mime_type || "";
	return {
		id: Number(m?.id),
		url: m?.media_details?.sizes?.medium_large?.source_url || m?.media_details?.sizes?.medium?.source_url || m?.source_url || "",
		name: m?.title?.rendered || m?.slug || String(m?.id ?? ""),
		mime,
		isImage: String(mime).startsWith("image/")
	};
}
/** Resolve a gallery/media field value into media items (order preserved). */
async function resolveWPMedia(raw) {
	const ids = parseMediaIds(raw);
	if (ids.length === 0) return [];
	const { wordpressFetch } = await import("./wordpress-client-C6ZyenBF.mjs");
	try {
		const list = await wordpressFetch("wp/v2/media", { params: {
			include: ids.join(","),
			per_page: Math.min(ids.length, 100)
		} });
		const items = (Array.isArray(list) ? list : []).map(toMediaItem);
		return ids.map((id) => items.find((i) => i.id === id)).filter((i) => !!i && !!i.url);
	} catch {
		return [];
	}
}
//#endregion
export { wp_media_exports as i, uploadWPMedia as n, uploadWPMediaBatch as r, resolveWPMedia as t };
