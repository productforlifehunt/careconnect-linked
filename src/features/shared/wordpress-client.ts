import { getWPToken } from "@/services/wp-auth";
import { buildWPUrl, buildWPHeaders } from "@/lib/wp-url";

export interface WordPressFetchOptions {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
}

export async function wordpressFetchRaw(endpoint: string, options: WordPressFetchOptions = {}): Promise<Response> {
  const token = getWPToken();
  const { method = "GET", body, params } = options;

  // Build clean params (filter out undefined/null)
  const cleanParams: Record<string, string | number | boolean> = {};
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      cleanParams[key] = value;
    });
  }

  const url = buildWPUrl(endpoint, cleanParams);
  const headers = buildWPHeaders(token, "application/json");

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    // Treat 404 on JetEngine relation lookups as "no relations" — the relation
    // may not be registered on this WP yet, or the parent has zero children.
    // Returning an empty payload keeps the UI from crashing on optional links.
    if (response.status === 404 && /^jet-rel\//.test(endpoint)) {
      return new Response("[]", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    // Auto-recover from stale / invalid JWT: clear token and bounce to /auth
    if (response.status === 400 || response.status === 401 || response.status === 403) {
      try {
        const cloned = response.clone();
        const text = await cloned.text();
        const looksLikeAuthFailure =
          /signature verification failed/i.test(text) ||
          /jwt/i.test(text) && /(invalid|expired|verification)/i.test(text) ||
          /errorCode"\s*:\s*1[0-3]/i.test(text); // simple-jwt-login auth error codes
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
        // fall through to generic error
      }
    }
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
  // Handle CCT create response: {"success":true,"item_id":N}
  if (raw && typeof raw === "object" && "item_id" in raw) {
    return { ...raw, _ID: raw.item_id, id: String(raw.item_id) } as unknown as T;
  }
  return raw as T;
}
