import { getWPToken } from "@/services/wp-auth";

const WP_SITE_PATH = import.meta.env.VITE_WP_SITE_PATH || "careconnected";
const REMOTE_WP_BASE_URL = import.meta.env.VITE_WP_BASE_URL || `http://170.106.171.59:8080/${WP_SITE_PATH}`;
const WP_BASE_URL = import.meta.env.DEV ? `/wp-proxy/${WP_SITE_PATH}` : REMOTE_WP_BASE_URL;

export interface WordPressFetchOptions {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
}

export async function wordpressFetchRaw(endpoint: string, options: WordPressFetchOptions = {}): Promise<Response> {
  const token = getWPToken();
  const { method = "GET", body, params } = options;

  let url = `${WP_BASE_URL}/wp-json/${endpoint}`;
  if (params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      qs.set(key, String(value));
    });
    const query = qs.toString();
    if (query) url += `?${query}`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`WP API ${endpoint}: ${response.status} ${response.statusText}`);
  }

  return response;
}

export async function wordpressFetch<T = unknown>(endpoint: string, options: WordPressFetchOptions = {}): Promise<T> {
  const response = await wordpressFetchRaw(endpoint, options);
  return response.json();
}

export function stripHtml(value: string | null | undefined): string {
  return (value || "").replace(/<[^>]*>/g, "");
}

export interface CCTItem extends Record<string, any> {
  _ID: number;
  cct_status?: string;
  cct_created?: number;
  cct_modified?: number;
  cct_author_id?: number;
}

/** Convert a CCT timestamp (Unix number OR date string) to ISO string. */
function cctTimestampToISO(val: any): string | null {
  if (!val) return null;
  if (typeof val === "number") return new Date(val * 1000).toISOString();
  // String date like "2026-04-10 10:57:35" — append UTC to avoid timezone drift
  const d = new Date(String(val).replace(" ", "T") + "Z");
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/** Normalizes a raw JetEngine CCT item: _ID → id, Unix timestamps → ISO strings. */
export function normalizeCCT(item: CCTItem): Record<string, any> {
  const { _ID, cct_created, cct_modified, cct_author_id, cct_status, ...fields } = item;
  return {
    id: String(_ID),
    created_at: cctTimestampToISO(cct_created),
    updated_at: cctTimestampToISO(cct_modified),
    author_id: cct_author_id ? String(cct_author_id) : null,
    cct_status: cct_status || "publish",
    ...fields,
  };
}

/**
 * Fetch from a JetEngine CCT endpoint (`/wp-json/jet-cct/{slug}`).
 * Automatically normalizes _ID → id and Unix timestamps → ISO strings.
 * - List:   wordpressCCTFetch("safe_zone", { params: { _limit: 50 } })
 * - Single: wordpressCCTFetch("safe_zone", { id: 3 })
 * - Create: wordpressCCTFetch("safe_zone", { method: "POST", body: { ... } })
 * - Update: wordpressCCTFetch("safe_zone", { id: 3, method: "PUT", body: { ... } })
 * - Delete: wordpressCCTFetch("safe_zone", { id: 3, method: "DELETE" })
 */
export async function wordpressCCTFetch<T = Record<string, any>[]>(
  slug: string,
  options: WordPressFetchOptions & { id?: string | number } = {},
): Promise<T> {
  const { id, ...fetchOptions } = options;
  const endpoint = id !== undefined ? `jet-cct/${slug}/${id}` : `jet-cct/${slug}`;
  const raw = await wordpressFetch<any>(endpoint, fetchOptions);
  if (Array.isArray(raw)) {
    return raw.map(normalizeCCT) as unknown as T;
  }
  if (raw && typeof raw === "object" && "_ID" in raw) {
    return normalizeCCT(raw as CCTItem) as unknown as T;
  }
  return raw as T;
}
