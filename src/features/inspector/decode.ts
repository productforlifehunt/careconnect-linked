/**
 * Turns raw WordPress endpoints, field codes and source references into the
 * names from the data dictionary (wp-schema). Codes are opaque: names come
 * only from the dictionary, never from guessing.
 */
import { WP, R, T, CCT_SLUG } from "@/integrations/wp-schema";
import codeIndex from "./code-index.json";

type CctDef = { id: number; slug: string; name: string; f: Record<string, string>; opt: Record<string, Record<string, string>> };
type RelDef = { id: number; parent: string; child: string; type: string; f?: Record<string, string>; opt?: Record<string, Record<string, string>> };

const CCTS = WP.cct as unknown as Record<string, CctDef>;
const RELS = WP.rel as unknown as Record<string, RelDef>;
const BY_SLUG: Record<string, CctDef> = {};
for (const def of Object.values(CCTS)) BY_SLUG[def.slug] = def;
for (const [id, slug] of Object.entries(CCT_SLUG)) if (!BY_SLUG[slug] && CCTS[id]) BY_SLUG[slug] = CCTS[id]!;

export interface Target {
  kind: "cct" | "rel" | "woo" | "user" | "other";
  label: string;          // e.g. "CCT 187 Users calendar event (users_calendar_event)"
  key: string;            // grouping key
  cct?: CctDef | undefined;
  rel?: RelDef | undefined;
  action: string;         // read list / read one / create / update / delete / link …
}

const ACTIONS: Record<string, string> = { GET: "读 Read", POST: "新建/关联 Create/Link", PUT: "修改 Update", PATCH: "修改 Update", DELETE: "删除 Delete" };

export function cctBySlug(slug: string): CctDef | undefined { return BY_SLUG[slug]; }
export function relById(id: string | number): RelDef | undefined { return RELS[String(id)]; }

export function cctLabel(def: CctDef | undefined, slug: string): string {
  return def ? `CCT ${def.id} ${def.name} (${def.slug})` : `CCT ? (${slug}) — 字典里找不到 / not in dictionary`;
}
export function relLabel(id: string, def: RelDef | undefined): string {
  return def ? `REL ${id}: ${def.parent} → ${def.child} (${def.type})` : `REL ${id} — 字典里找不到 / not in dictionary`;
}

export function decodeEndpoint(method: string, endpoint: string): Target {
  const ep = endpoint.replace(/^\/+/, "").split("?")[0]!;
  const action = ACTIONS[method] || method;
  let m = ep.match(/^jet-rel\/(\d+)(?:\/(children|parents)\/(\d+))?/);
  if (m) {
    const rel = relById(m[1]!);
    const side = m[2] ? (m[2] === "children" ? ` 读子项 children of ${m[3]}` : ` 读父项 parents of ${m[3]}`) : "";
    return { kind: "rel", key: `rel:${m[1]}`, rel, label: relLabel(m[1]!, rel) + side, action: method === "POST" ? "新建关联 Link" : method === "DELETE" ? "删除关联 Unlink" : action };
  }
  m = ep.match(/^jet-cct\/([a-z0-9_]+)(?:\/(\d+))?/);
  if (m) {
    const cct = cctBySlug(m[1]!);
    return { kind: "cct", key: `cct:${m[1]}`, cct, label: cctLabel(cct, m[1]!) + (m[2] ? ` #${m[2]}` : ""), action: method === "GET" ? (m[2] ? "读一行 Read row" : "读列表 Read list") : action };
  }
  if (/^(wc\/|dokan\/)/.test(ep)) return { kind: "woo", key: `woo:${ep.replace(/\/\d+.*$/, "")}`, label: `WooCommerce/Dokan ${ep}`, action };
  if (/^wp\/v2\/users/.test(ep)) return { kind: "user", key: "user", label: `WordPress 用户 Users ${ep}`, action };
  return { kind: "other", key: `other:${ep}`, label: ep, action };
}

/** Field code → dictionary name for a CCT, or a REL meta field. */
export function fieldName(def: { f?: Record<string, string> } | undefined, code: string): string | undefined {
  if (!def?.f) return undefined;
  for (const [name, c] of Object.entries(def.f)) if (c === code) return name;
  return undefined;
}

/** Option code → dictionary option name for a field. */
export function optionName(def: { f?: Record<string, string>; opt?: Record<string, Record<string, string>> } | undefined, code: string, value: unknown): string | undefined {
  const fname = fieldName(def, code);
  if (!fname || !def?.opt?.[fname]) return undefined;
  const vals = Array.isArray(value) ? value : [value];
  const names = vals.map((v) => Object.entries(def.opt![fname]!).find(([, c]) => c === String(v))?.[0]).filter(Boolean);
  return names.length ? names.join(", ") : undefined;
}

// ── Static code references ───────────────────────────────────────────

type IndexEntry = { i: string[]; r: Array<[string, string, string, number]> };
const INDEX = codeIndex as unknown as Record<string, IndexEntry>;
const R_BY_NAME = R as unknown as Record<string, number>;
const T_BY_NAME = T as unknown as Record<string, CctDef>;

export interface CodeRef { file: string; line: number; depth: number; kind: "read" | "write" | "ref"; label: string; method: string; snippet?: string | undefined }

function describeRef(kind: string, key: string): string {
  switch (kind) {
    case "rel": return relLabel(key, relById(key));
    case "relConst": { const id = R_BY_NAME[key]; return id ? relLabel(String(id), relById(id)) + ` [R.${key}]` : `R.${key}（非字典常量 / local name）`; }
    case "cct": return cctLabel(cctBySlug(key), key);
    case "cctConst": { const d = T_BY_NAME[key]; return d ? cctLabel(d, d.slug) + ` [T.${key}]` : `T.${key}`; }
    case "cctId": { const d = CCTS[key]; return cctLabel(d, d?.slug || key); }
    case "woo": return `WooCommerce/Dokan/WP ${key}`;
    default: return key;
  }
}

export function normalizeFile(file: string): string {
  return file.replace(/^.*?\/src\//, "").replace(/^src\//, "").replace(/:\d+(:\d+)?$/, "");
}

/** Data references in a file and the files it imports (depth-limited, breadth-first). */
export function codeRefs(files: string[], maxDepth = 3): CodeRef[] {
  const out: CodeRef[] = [];
  const seen = new Map<string, number>();
  let frontier = files.map(normalizeFile).filter((f) => INDEX[f]);
  for (let depth = 0; depth <= maxDepth && frontier.length; depth++) {
    const next: string[] = [];
    for (const file of frontier) {
      if (seen.has(file)) continue;
      seen.set(file, depth);
      const entry = INDEX[file]!;
      for (const [kind, key, method, line] of entry.r) {
        if (kind === "write") out.push({ file, line, depth, kind: "write", label: method, method, snippet: key });
        else out.push({ file, line, depth, kind: method && method !== "GET" ? "write" : method === "GET" ? "read" : "ref", label: describeRef(kind, key), method });
      }
      for (const imp of entry.i) if (!seen.has(imp) && !imp.startsWith("components/ui/")) next.push(imp);
    }
    frontier = next;
  }
  return out;
}

export function indexedFile(file: string): boolean { return !!INDEX[normalizeFile(file)]; }
