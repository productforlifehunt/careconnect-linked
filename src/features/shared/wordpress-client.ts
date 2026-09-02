import { getWPToken } from "@/services/wp-auth";
import { buildWPUrl, buildWPHeaders } from "@/lib/wp-url";

export interface WordPressFetchOptions {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
}

/**
 * Transport-level read dedupe.
 *
 * Sibling widgets on one screen repeatedly ask for the same relation/CCT rows.
 * Instead of one HTTP round-trip per caller, identical GETs issued within a
 * short window share a single response (cloned per caller). Any write clears
 * the cache, so nothing stale is served after a mutation.
 */
const GET_TTL_MS = 4000;
const getCache = new Map<string, { at: number; promise: Promise<Response> }>();

if (typeof window !== "undefined") {
  window.addEventListener("wp-write", () => getCache.clear());
}

/** Endpoints that only work through the backend proxy for anonymous visitors. */
const CREDENTIALED_GUEST_ENDPOINTS = [
  /(^|\/)wc\/v3\//i,                       // catalog reads need the consumer keys
  /(^|\/)jet-cct\/user_ext_profile_2/i,    // public provider search (sanitized server-side)
];

function needsCredentialedProxy(endpoint: string): boolean {
  return CREDENTIALED_GUEST_ENDPOINTS.some((re) => re.test(endpoint));
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

  // WordPress is HTTPS with permissive CORS and every authenticated call carries
  // a JWT, so requests go straight to WordPress. The backend proxy is used ONLY
  // where the browser genuinely cannot hold the credential:
  //   - guest WooCommerce catalog reads (need the read-only consumer keys)
  //   - the guest provider-profile read (needs admin creds + server-side sanitizing)
  const forceEdge = !token && needsCredentialedProxy(endpoint);
  const url = buildWPUrl(endpoint, cleanParams, { forceEdge });
  const headers = buildWPHeaders(token, "application/json", { forceEdge });


  // Any write invalidates the short-lived read dedupe cache (rel-batch listens),
  // so a mutation is never followed by stale cached reads.
  if (method !== "GET" && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("wp-write"));
  }

  let response: Response;
  try {
    if (method === "GET") {
      const key = `${url}|${token ? "auth" : "guest"}`;
      const hit = getCache.get(key);
      const now = Date.now();
      let inflight: Promise<Response>;
      if (hit && now - hit.at < GET_TTL_MS) {
        inflight = hit.promise;
      } else {
        inflight = fetch(url, { method, headers }).catch((err) => {
          getCache.delete(key);
          throw err;
        });
        getCache.set(key, { at: now, promise: inflight });
      }
      response = (await inflight).clone();
    } else {
      response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    }
  } catch (err) {
    // Route changes abort in-flight requests (net::ERR_ABORTED → "Failed to
    // fetch"). That is not a backend failure, so tag it and let callers keep
    // it out of the console.
    const detail = err instanceof Error ? err.message : String(err);
    const e = new Error(`WP API ${endpoint}: request aborted (${detail})`) as Error & { isNetworkAbort?: boolean };

    e.isNetworkAbort = true;
    throw e;
  }



  if (!response.ok) {
    // Treat 404 on JetEngine relation lookups as "no relations" — the relation
    // may not be registered on this WP yet, or the parent has zero children.
    // Returning an empty payload keeps the UI from crashing on optional links.
    if (response.status === 404) {
      // Missing CPT/relation/CCT on this WP — treat as empty list so UI doesn't crash
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
          /expired token/i.test(text) ||
          /token.*(expired|invalid|revoked)/i.test(text) ||
          (/jwt/i.test(text) && /(invalid|expired|verification)/i.test(text)) ||
          /simple-jwt-login-middleware/i.test(text) ||
          /errorCode"\s*:\s*\d{1,2}/i.test(text); // simple-jwt-login auth error codes (incl. 14 = expired)
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

/** True for requests dropped by the browser (route change / page unload). */
export function isNetworkAbort(err: unknown): boolean {
  return Boolean(err && typeof err === "object" && (err as any).isNetworkAbort);
}
