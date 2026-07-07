/**
 * Notch Note — WP CCT client (thin wrapper, own namespace).
 * Uses same buildWPUrl helper but attaches nn_ token.
 */
import { buildWPUrl, buildWPHeaders } from "@/lib/wp-url";
import { getNNToken, clearNNSession } from "./nn-auth";

export interface NNFetchOpts {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
}

export async function nnFetch<T = any>(endpoint: string, opts: NNFetchOpts = {}): Promise<T> {
  const { method = "GET", body, params } = opts;
  const clean: Record<string, string | number | boolean> = {};
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      clean[k] = v;
    }
  }
  const url = buildWPUrl(endpoint, clean);
  const token = getNNToken();
  const res = await fetch(url, {
    method,
    headers: buildWPHeaders(token, "application/json"),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    if (res.status === 404) return [] as any;
    if (res.status === 401 || res.status === 403) {
      clearNNSession();
      // Signal expiry; NotchAuthContext listens and reroutes without losing ?__site
      window.dispatchEvent(new CustomEvent("nn:session-expired"));
      throw new Error("Session expired");
    }
    const text = await res.text().catch(() => "");
    throw new Error(`NN API ${endpoint}: ${res.status} ${text.slice(0, 200)}`);
  }
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("json")) return res.json();
  return res.text() as any;
}

/** Normalize JetEngine CCT item: _ID→id, unix ts→ISO. */
export function normalizeCCT(item: any): any {
  if (!item || typeof item !== "object") return item;
  const { _ID, cct_created, cct_modified, cct_author_id, cct_status, ...rest } = item;
  const toISO = (v: any) => {
    if (!v) return null;
    if (typeof v === "number") return new Date(v * 1000).toISOString();
    const d = new Date(String(v).replace(" ", "T") + "Z");
    return isNaN(d.getTime()) ? null : d.toISOString();
  };
  return {
    id: String(_ID),
    author_id: cct_author_id ? String(cct_author_id) : null,
    created_at: toISO(cct_created),
    updated_at: toISO(cct_modified),
    cct_status: cct_status || "publish",
    ...rest,
  };
}

export async function cctList<T = any>(slug: string, params?: NNFetchOpts["params"]): Promise<T[]> {
  const raw = await nnFetch<any>(`jet-cct/${slug}`, { params });
  return Array.isArray(raw) ? raw.map(normalizeCCT) : [];
}

export async function cctGet<T = any>(slug: string, id: string | number): Promise<T | null> {
  const raw = await nnFetch<any>(`jet-cct/${slug}/${id}`);
  if (!raw) return null;
  return normalizeCCT(raw);
}

export async function cctCreate(slug: string, data: Record<string, any>): Promise<{ id: string }> {
  const raw = await nnFetch<any>(`jet-cct/${slug}`, { method: "POST", body: data });
  const id = raw?.item_id ?? raw?._ID ?? raw?.id;
  return { id: String(id) };
}

export async function cctUpdate(slug: string, id: string | number, data: Record<string, any>): Promise<void> {
  await nnFetch(`jet-cct/${slug}/${id}`, { method: "PATCH", body: data });
}

export async function cctDelete(slug: string, id: string | number): Promise<void> {
  await nnFetch(`jet-cct/${slug}/${id}`, { method: "DELETE" });
}

/** Notch Note CCT slugs (single source of truth for the frontend). */
export const NN = {
  workspace: "nn_workspace",
  block: "nn_block",
  propSchema: "nn_page_property_schema",
  propValue: "nn_page_property_value",
  view: "nn_view",
  comment: "nn_comment",
  permission: "nn_permission",
  template: "nn_template",
  favorite: "nn_favorite",
  activity: "nn_activity_log",
} as const;
