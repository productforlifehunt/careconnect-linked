/**
 * WordPress Media Library helpers (headless).
 *
 * JetEngine `gallery` fields store a comma-separated list of WP media IDs
 * (e.g. "173,174,175"); `media` fields store a single ID. These helpers keep
 * the parsing/serialising in one place so every CCT that carries attachments
 * behaves identically.
 */
import { buildWPUrl, buildWPHeaders } from "@/lib/wp-url";
import { getWPToken } from "@/services/wp-auth";

export interface WPMediaItem {
  id: number;
  url: string;
  name: string;
  mime: string;
  isImage: boolean;
}

/** "173,174" -> [173, 174]. Accepts arrays and single numbers too. */
export function parseMediaIds(raw: unknown): number[] {
  if (raw == null || raw === "") return [];
  const list = Array.isArray(raw) ? raw : String(raw).split(",");
  return list
    .map((v) => Number(String(v).trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
}

/** [173, 174] -> "173,174" (JetEngine gallery storage format). */
export function serializeMediaIds(ids: Array<number | string>): string {
  return parseMediaIds(ids).join(",");
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the file"));
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
async function uploadViaAdminOps(file: File): Promise<WPMediaItem> {
  const { wpAdminOps } = await import("@/services/woocommerce-api");
  const data_base64 = await fileToBase64(file);
  const res: any = await wpAdminOps("upload_media", {
    file_name: file.name,
    mime_type: file.type || "application/octet-stream",
    data_base64,
  });
  if (!res?.media?.id) throw new Error(res?.error || "Media upload failed");
  return toMediaItem(res.media);
}

/** Upload one File to the WP media library, returning the media item. */
export async function uploadWPMedia(file: File): Promise<WPMediaItem> {
  const url = buildWPUrl("/wp-json/wp/v2/media");
  const headers = buildWPHeaders(getWPToken());
  delete (headers as any)["Content-Type"];
  headers["Content-Disposition"] = `attachment; filename="${file.name.replace(/"/g, "")}"`;
  const fd = new FormData();
  fd.append("file", file);
  let res: Response;
  try {
    res = await fetch(url, { method: "POST", headers, body: fd });
  } catch {
    return uploadViaAdminOps(file);
  }
  if (res.status === 401 || res.status === 403) return uploadViaAdminOps(file);
  if (!res.ok) throw new Error(`Media upload failed: ${res.status} ${await res.text()}`);
  const json: any = await res.json();
  return toMediaItem(json);
}

/** Upload several files in parallel. */
export async function uploadWPMediaBatch(files: File[]): Promise<WPMediaItem[]> {
  return Promise.all(files.map((f) => uploadWPMedia(f)));
}

function toMediaItem(m: any): WPMediaItem {
  const mime = m?.mime_type || "";
  return {
    id: Number(m?.id),
    url:
      m?.media_details?.sizes?.medium_large?.source_url ||
      m?.media_details?.sizes?.medium?.source_url ||
      m?.source_url ||
      "",
    name: m?.title?.rendered || m?.slug || String(m?.id ?? ""),
    mime,
    isImage: String(mime).startsWith("image/"),
  };
}

/** Resolve a gallery/media field value into media items (order preserved). */
export async function resolveWPMedia(raw: unknown): Promise<WPMediaItem[]> {
  const ids = parseMediaIds(raw);
  if (ids.length === 0) return [];
  const { wordpressFetch } = await import("@/lib/wordpress-client");
  try {
    const list: any = await wordpressFetch("wp/v2/media", {
      params: { include: ids.join(","), per_page: Math.min(ids.length, 100) },
    });
    const items: WPMediaItem[] = (Array.isArray(list) ? list : []).map(toMediaItem);
    return ids
      .map((id) => items.find((i) => i.id === id))
      .filter((i): i is WPMediaItem => !!i && !!i.url);
  } catch {
    return [];
  }
}
