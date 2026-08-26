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
  // 20s timeout so a hung upstream can't leave the UI stuck at "Loading…" forever.
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 20000);
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: buildWPHeaders(token, "application/json"),
      body: body ? JSON.stringify(body) : undefined,
      signal: ac.signal,
    });
  } catch (err: any) {
    clearTimeout(t);
    if (err?.name === "AbortError") throw new Error(`NN API ${endpoint}: request timed out`);
    throw err;
  }
  clearTimeout(t);
  if (!res.ok) {
    if (res.status === 404) return null as any;
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
  return Array.isArray(raw) ? raw.map((r) => adaptIn(slug, normalizeCCT(r))) : [];
}


export async function cctGet<T = any>(slug: string, id: string | number): Promise<T | null> {
  const raw = await nnFetch<any>(`jet-cct/${slug}/${id}`);
  if (!raw) return null;
  return adaptIn(slug, normalizeCCT(raw));
}

export async function cctCreate(slug: string, data: Record<string, any>): Promise<{ id: string }> {
  const payload = adaptOut(slug, data);
  const raw = await nnFetch<any>(`jet-cct/${slug}`, { method: "POST", body: payload });
  const id = raw?.item_id ?? raw?._ID ?? raw?.id;
  return { id: String(id) };
}

export async function cctUpdate(slug: string, id: string | number, data: Record<string, any>): Promise<void> {
  const payload = adaptOut(slug, data);
  await nnFetch(`jet-cct/${slug}/${id}`, { method: "PATCH", body: payload });
}

export async function cctDelete(slug: string, id: string | number): Promise<void> {
  await nnFetch(`jet-cct/${slug}/${id}`, { method: "DELETE" });
}

/** Notch Note CCT slugs (single source of truth for the frontend). */
export const NN = {
  workspace: "nn_workspace",
  block: "nn_block",
  comment: "nn_comment",
  permission: "nn_permission",
  template: "nn_template",
  favorite: "nn_favorite",
  member: "nn_workspace_member",
  invite: "nn_invite",
  reminder: "nn_reminder",
  notification: "nn_notification",
} as const;



/* ─── Field adapter: frontend field names ↔ actual CCT column names ────────
 * The WP-side CCTs were provisioned with a subset of fields. This adapter
 * remaps the frontend's richer field vocabulary onto the columns that
 * actually exist, stuffing extra metadata inside JSON blob fields where
 * necessary. Keep this table in sync with the JetEngine CCT definitions.
 * All values are cast to strings because JetEngine switcher/text fields
 * expect string types over REST. */

const BOOL_KEYS_BY_SLUG: Record<string, string[]> = {
  nn_block: ["archived", "in_trash"],
  nn_permission: ["is_public"],
};

function toWpString(v: any): any {
  if (v === undefined || v === null) return "";
  if (typeof v === "boolean") return v ? "1" : "";
  if (typeof v === "number") return String(v);
  return v;
}

function adaptOut(slug: string, data: Record<string, any>): Record<string, any> {
  const d = { ...data };
  // universal: coerce switcher-like fields to string
  for (const k of BOOL_KEYS_BY_SLUG[slug] || []) {
    if (k in d) d[k] = d[k] ? "1" : "";
  }
  if (slug === "nn_block") {
    // title → plain_text; extras → merged into properties JSON under _meta
    const extras: Record<string, any> = {};
    for (const k of ["workspace_id", "parent_id", "created_by", "last_edited_by"]) {
      if (k in d) { extras[k] = d[k]; delete d[k]; }
    }
    if ("title" in d) { d.plain_text = String(d.title ?? ""); delete d.title; }
    if (Object.keys(extras).length) {
      let props: any = {};
      try { props = d.properties ? JSON.parse(d.properties) : {}; } catch { props = {}; }
      props._meta = { ...(props._meta || {}), ...extras };
      d.properties = JSON.stringify(props);
    }
  } else if (slug === "nn_comment") {
    if ("block_id" in d) { d.discussion_id = String(d.block_id); delete d.block_id; }
    if ("body" in d) { d.rich_text = String(d.body ?? ""); delete d.body; }
    if ("author_id" in d) { delete d.author_id; /* cct_author_id auto */ }
  } else if (slug === "nn_favorite") {
    // No block_id column exists; encode block_id into `position` (max-safe int)
    if ("block_id" in d) { d.position = String(d.block_id); delete d.block_id; }
    if ("added_at" in d) { delete d.added_at; /* cct_created auto */ }
  } else if (slug === "nn_permission") {
    if ("block_id" in d) { d.scope_type = `block:${d.block_id}`; delete d.block_id; }
    // email / granted_by have no columns; drop silently
    if ("email" in d) { delete d.email; }
    if ("granted_by" in d) { delete d.granted_by; }
  } else if (slug === "nn_template") {
    if ("name" in d) { d.tpl_name = String(d.name); delete d.name; }
    if ("source_block_id" in d || "is_published" in d) {
      const src = d.source_block_id ?? "";
      const pub = d.is_published ? ":pub" : "";
      d.category = `${src}${pub}`;
      delete d.source_block_id;
      delete d.is_published;
    }
    if ("workspace_id" in d) { delete d.workspace_id; }
    if ("body_snapshot" in d) { d.block_tree_snapshot = String(d.body_snapshot); delete d.body_snapshot; }
  } else if (slug === "nn_workspace_member") {
    // Store display_name/email in the "role" field is wrong — but adaptOut kept role separate.
    // Nothing extra to remap: fields (workspace_id, user_id, role, status, invited_by, joined_at) exist.
  }

  // Coerce remaining values that are numbers to strings for JetEngine's text fields.
  for (const k of Object.keys(d)) d[k] = toWpString(d[k]);
  return d;
}

/** Notion "object" type name per CCT slug — synthesized client-side. */
const NOTION_OBJECT_BY_SLUG: Record<string, string> = {
  nn_workspace: "workspace",
  nn_block: "block",
  nn_comment: "comment",
  nn_permission: "permission",
  nn_template: "template",
  nn_favorite: "favorite",
  nn_workspace_member: "user",
  nn_invite: "invite",
  nn_reminder: "reminder",
  nn_notification: "users_notification",
};

/** Compute a public URL for a block/page — matches the app router. */
function nnPublicUrl(slug: string, id: string): string {
  if (typeof window === "undefined" || !id) return "";
  if (slug === "nn_block") return `${window.location.origin}/notch/p/${id}`;
  if (slug === "nn_workspace") return `${window.location.origin}/notch/w/${id}`;
  return "";
}

/** Attach Notion-standard synthesized metadata that WP doesn't store. */
function withNotionMeta(slug: string, item: any, parentId: string = ""): any {
  if (!item) return item;
  const id = String(item.id ?? "");
  const url = nnPublicUrl(slug, id);
  const parentType = parentId
    ? (slug === "nn_block" && item.parent_id ? "block_id" : "workspace_id")
    : "workspace_id";
  return {
    ...item,
    object: NOTION_OBJECT_BY_SLUG[slug] || slug.replace(/^nn_/, ""),
    parent: { type: parentType, id: parentId || item.workspace_id || "" },
    created_time: item.created_at || null,
    last_edited_time: item.updated_at || item.created_at || null,
    created_by: item.created_by || item.author_id || null,
    last_edited_by: item.last_edited_by || item.created_by || item.author_id || null,
    has_children: slug === "nn_block"
      ? Boolean(item.content_order && String(item.content_order).length > 2)
      : false,
    url,
    public_url: url,
  };
}

/** Inverse of adaptOut — normalise a CCT row into the shape the frontend expects. */
function adaptIn(slug: string, item: any): any {
  if (!item) return item;
  if (slug === "nn_block") {
    let props: any = {};
    try { props = item.properties ? JSON.parse(item.properties) : {}; } catch { props = {}; }
    const meta = props._meta || {};
    const shaped = {
      ...item,
      title: item.plain_text || "",
      workspace_id: meta.workspace_id || "",
      parent_id: meta.parent_id || "",
      created_by: meta.created_by || item.author_id || "",
      last_edited_by: meta.last_edited_by || "",
      archived: item.archived === "1" ? 1 : 0,
      in_trash: item.in_trash === "1" ? 1 : 0,
    };
    return withNotionMeta(slug, shaped, shaped.parent_id || shaped.workspace_id);
  }
  if (slug === "nn_comment") {
    const shaped = { ...item, block_id: item.discussion_id, body: item.rich_text, author_id: item.author_id };
    return withNotionMeta(slug, shaped, shaped.block_id);
  }
  if (slug === "nn_favorite") {
    const shaped = { ...item, block_id: String(item.position || "") };
    return withNotionMeta(slug, shaped, shaped.block_id);
  }
  if (slug === "nn_permission") {
    const bid = typeof item.scope_type === "string" && item.scope_type.startsWith("block:") ? item.scope_type.slice(6) : "";
    const shaped = { ...item, block_id: bid, email: "", is_public: 0, granted_by: item.author_id };
    return withNotionMeta(slug, shaped, shaped.block_id);
  }
  if (slug === "nn_template") {
    const cat = String(item.category || "");
    const isPub = cat.endsWith(":pub");
    const src = isPub ? cat.slice(0, -4) : cat;
    const shaped = { ...item, name: item.tpl_name, source_block_id: src, is_published: isPub, body_snapshot: item.block_tree_snapshot };
    return withNotionMeta(slug, shaped, shaped.source_block_id);
  }

  return withNotionMeta(slug, item);
}

// (Adaptation is now applied inside cctList / cctGet above.)
