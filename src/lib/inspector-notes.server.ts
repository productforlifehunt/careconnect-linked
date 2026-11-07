import { createClient } from "@supabase/supabase-js";
import {
  bindCCTNotes,
  type CCTNote,
  type NoteBinding,
} from "@/features/inspector/cct-notes";
import {
  findPositionBinding,
  positionBindings,
  samePosition,
  updatePositionBindings,
} from "@/features/inspector/position-bindings";

/** Legacy Cloud archives are inactive backups; active position bindings live only in CCT324 a59. */
const BUCKET = "inspector-notes";
export interface InspectorNote {
  key: string;
  scope: "element" | "page";
  page: string;
  label: string;
  text: string;
  updatedAt: string;
  id?: string | undefined;
  title?: string | undefined;
  locked?: boolean | undefined;
  verified?: boolean | undefined;
  source?:
    | {
        file: string;
        line: number;
        endLine: number;
        tag: string;
        digest: string;
      }
    | undefined;
  alias?: string | undefined;
}

function client() {
  const url = process.env["SUPABASE_URL"] || "";
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"] || "";
  if (!url || !key)
    throw new Error("注释存储未配置 / Notes storage is not configured.");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (
          key.startsWith("sb_") &&
          headers.get("Authorization") === `Bearer ${key}`
        )
          headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

async function hash(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

export async function readNotes(keys: string[]): Promise<InspectorNote[]> {
  const c = client();
  const out = await Promise.all(
    keys.map(async (k) => {
      const { data, error } = await c.storage
        .from(BUCKET)
        .download(`notes/${await hash(k)}.json`);
      if (error || !data) return null;
      try {
        return JSON.parse(await data.text()) as InspectorNote;
      } catch {
        return null;
      }
    }),
  );
  return out.filter((n): n is InspectorNote => !!n && n.text.trim().length > 0);
}

const ALL = "notes/all.json";
/** Every note in one file, so the inspector loads them all with a single read. */
export async function readArchivedNotes(): Promise<InspectorNote[]> {
  const { data, error } = await client().storage.from(BUCKET).download(ALL);
  if (error || !data) throw new Error("注释读取失败，请重试。");
  const manual = JSON.parse(await data.text()) as InspectorNote[];
  // Source annotations are separately compressed; manual edits keep their original independent files.
  const bundle = await client()
    .storage.from(BUCKET)
    .download("notes/source.json.gz");
  if (!bundle.data) return manual.filter((n) => n.text.trim().length > 0);
  const stream = bundle.data
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  const source = JSON.parse(
    await new Response(stream).text(),
  ) as InspectorNote[];
  return [
    ...new Map([...source, ...manual].map((n) => [n.key, n])).values(),
  ].filter((n) => n.text.trim().length > 0);
}

type CCTRow = {
  _ID: string | number;
  a55: string;
  a56: string;
  a58?: string;
  a59?: string;
  cct_modified?: string;
};
const CCT_BASE =
  "https://app.challenged-dementia.com/afresh/wp-json/jet-cct/manual_notes";
async function wp(path = "", method = "GET", body?: unknown): Promise<unknown> {
  const user = process.env["WP_ADMIN_USER"];
  const password = process.env["WP_ADMIN_APP_PASSWORD"];
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (user && password)
    headers["Authorization"] = `Basic ${btoa(`${user}:${password}`)}`;
  const response = await fetch(CCT_BASE + path, {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok)
    throw new Error(`注释读取或保存失败（${response.status}），请重试。`);
  return response.json();
}
function mapRow(row: CCTRow): CCTNote {
  return {
    key: `cct|${row._ID}`,
    id: String(row._ID),
    title: row.a55,
    text: row.a56,
    verified: row.a58 === "b55",
    updatedAt: row.cct_modified
      ? row.cct_modified.replace(" ", "T") + "+08:00"
      : "",
  };
}
/** Filter on the existing a59 field; never download the entire note catalogue for one element. */
async function bindingRows(key: string): Promise<CCTRow[]> {
  const { routePattern } = await import("@/features/inspector/route-key");
  // Legacy record-specific keys retain their exact spelling. Query their full anchor then verify
  // the complete key, rather than rewriting or guessing a different element's binding.
  const pattern = routePattern(key);
  const parts = key.split("|");
  const needle =
    pattern || key.includes("/:id") ? parts.slice(2).join("|") : key;
  const encoded = JSON.stringify(needle).slice(1, -1);
  const rows: CCTRow[] = [];
  for (let offset = 0; ; offset += 100) {
    const filters = [{ field: "a59", operator: "LIKE", value: encoded }];
    const result = await wp(
      `?_limit=100&_offset=${offset}&_orderby=_ID&_order=asc&_filters=${encodeURIComponent(JSON.stringify(filters))}`,
    );
    if (!Array.isArray(result)) throw new Error("元素绑定读取异常。");
    rows.push(...(result as CCTRow[]));
    if (result.length < 100) break;
  }
  return rows.filter((row) =>
    positionBindings(row.a59, String(row._ID)).some((b) =>
      samePosition(b.key, key),
    ),
  );
}
async function storedBinding(key: string): Promise<NoteBinding | undefined> {
  return findPositionBinding(
    (await bindingRows(key)).flatMap((row) =>
      positionBindings(row.a59, String(row._ID)),
    ),
    key,
  );
}
/** Picker search done by WordPress itself (name LIKE each word, or exact number): returns at most 60 names, never note bodies. */
export async function searchNotes(
  q: string,
  status: "all" | "verified" | "unverified",
): Promise<{ id: string; title: string; verified: boolean }[]> {
  const words = q
    .trim()
    .replace(/^#/, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6);
  const filters: { field: string; operator: string; value: string }[] = [];
  const firstWord = words[0];
  if (words.length === 1 && firstWord && /^\d+$/.test(firstWord))
    filters.push({ field: "_ID", operator: "=", value: firstWord });
  else
    for (const w of words)
      filters.push({ field: "a55", operator: "LIKE", value: w });
  if (status !== "all")
    filters.push({
      field: "a58",
      operator: "=",
      value: status === "verified" ? "b55" : "b56",
    });
  const qs = `?_limit=60&_orderby=_ID&_order=desc${filters.length ? `&_filters=${encodeURIComponent(JSON.stringify(filters))}` : ""}`;
  const rows = (await wp(qs)) as CCTRow[];
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => ({
    id: String(r._ID),
    title: r.a55 || "",
    verified: r.a58 === "b55",
  }));
}
export async function readNoteForKey(
  key: string,
): Promise<InspectorNote | null> {
  const binding = await storedBinding(key);
  if (!binding?.id) return null;
  const row = (await wp(`/${binding.id}`)) as CCTRow;
  if (String(row._ID) !== binding.id) throw new Error("绑定的注释不存在。");
  return { ...mapRow(row), ...binding, key };
}

/** Recover a source-verified legacy binding only when its fingerprint identifies one note. */
export async function readNoteForFingerprint(
  key: string,
  fingerprint: string,
  tag: string,
  page: string,
): Promise<InspectorNote | null> {
  const match = fingerprint.match(/^([^:]+):(\d+):(\d+):([0-9a-f]{64}):1$/);
  if (!match) return null;
  const [, file, , , digest] = match;
  const rows: CCTRow[] = [];
  for (let offset = 0; ; offset += 100) {
    const filters = [{ field: "a59", operator: "LIKE", value: file }];
    const result = await wp(
      `?_limit=100&_offset=${offset}&_orderby=_ID&_order=asc&_filters=${encodeURIComponent(JSON.stringify(filters))}`,
    );
    if (!Array.isArray(result)) throw new Error("旧注释读取异常。");
    rows.push(...(result as CCTRow[]));
    if (result.length < 100) break;
  }
  const { samePosition: samePage } =
    await import("@/features/inspector/position-bindings");
  const matches = rows.flatMap((row) =>
    positionBindings(row.a59, String(row._ID))
      .filter(
        (b) =>
          (!b.page ||
            samePage(`el|${b.page}|x`, `el|${page}|x`) ||
            (key.startsWith("el|*|") && b.key.startsWith("el|*|"))) &&
          b.source?.file === file &&
          b.source?.tag.toLowerCase() === tag.toLowerCase() &&
          b.source?.digest === digest,
      )
      .map((b) => ({ row, binding: b })),
  );
  if (new Set(matches.map((m) => m.binding.id)).size !== 1) return null;
  const found = matches[0];
  if (!found) return null;
  return { ...mapRow(found.row), ...found.binding, key };
}

/** Add the newly resolved stable position to a CCT note without changing its text or check state. */
export async function rebindRecoveredNote(
  note: InspectorNote,
  key: string,
  scope: "element" | "page",
  page: string,
  label: string,
): Promise<InspectorNote> {
  if (!note.id) throw new Error("恢复的注释缺少 CCT 编号，未修改关联。");
  const binding: NoteBinding = {
    key,
    id: note.id,
    scope,
    page,
    label,
    ...(note.source ? { source: note.source } : {}),
    ...(note.alias ? { alias: note.alias } : {}),
    locked: true,
  };
  await storeBinding(binding);
  return { ...note, ...binding };
}
async function writeBindingsOnly(
  row: CCTRow,
  bindings: NoteBinding[],
): Promise<void> {
  const a59 = updatePositionBindings(row.a59, bindings);
  await wp(`/${row._ID}`, "POST", { a59 });
  const saved = (await wp(`/${row._ID}`)) as CCTRow;
  if (
    saved.a59 !== a59 ||
    saved.a55 !== row.a55 ||
    saved.a56 !== row.a56 ||
    (saved.a58 || "") !== (row.a58 || "")
  )
    throw new Error("元素绑定保存后核对不一致，未确认保存。");
}
async function storeBinding(binding: NoteBinding) {
  const rows = await bindingRows(binding.key);
  const target = (await wp(`/${binding.id}`)) as CCTRow;
  if (String(target._ID) !== binding.id) throw new Error("所选注释不存在。");
  const retained = positionBindings(target.a59, binding.id).filter(
    (b) => !samePosition(b.key, binding.key),
  );
  await writeBindingsOnly(target, [...retained, binding]);
  // Explicit user reassignment changes only this position, never other positions or REL325.
  for (const row of rows) {
    if (String(row._ID) === binding.id) continue;
    const fresh = (await wp(`/${row._ID}`)) as CCTRow;
    await writeBindingsOnly(
      fresh,
      positionBindings(fresh.a59, String(fresh._ID)).filter(
        (b) => !samePosition(b.key, binding.key),
      ),
    );
  }
  const saved = await storedBinding(binding.key);
  if (saved?.id !== binding.id) throw new Error("元素绑定回读不一致。");
}
/**
 * Reads every CCT324 row in a few large pages fetched side by side.
 * The old loop asked for 500 rows at a time, one after another (20+ round trips in a row),
 * which kept the small WordPress server busy for half a minute on every inspector load.
 */
const PAGE = 1000;
const PARALLEL = 3;
async function readPage(
  offset: number,
): Promise<{ rows: CCTRow[]; total: number | null }> {
  const user = process.env["WP_ADMIN_USER"];
  const password = process.env["WP_ADMIN_APP_PASSWORD"];
  const headers: Record<string, string> = {};
  if (user && password)
    headers["Authorization"] = `Basic ${btoa(`${user}:${password}`)}`;
  const response = await fetch(
    `${CCT_BASE}?_limit=${PAGE}&_offset=${offset}&_orderby=_ID&_order=asc`,
    { headers },
  );
  if (!response.ok)
    throw new Error(`注释读取或保存失败（${response.status}），请重试。`);
  const result = await response.json();
  if (!Array.isArray(result)) throw new Error("注释列表返回异常。");
  const header = Number(response.headers.get("Jet-Query-Total"));
  return {
    rows: result as CCTRow[],
    total: Number.isFinite(header) && header > 0 ? header : null,
  };
}
async function readAllRows(): Promise<CCTRow[]> {
  const first = await readPage(0);
  if (first.rows.length < PAGE) return first.rows;
  const rows: CCTRow[] = [...first.rows];
  if (first.total) {
    const offsets: number[] = [];
    for (let o = PAGE; o < first.total; o += PAGE) offsets.push(o);
    for (let i = 0; i < offsets.length; i += PARALLEL) {
      const pages = await Promise.all(
        offsets.slice(i, i + PARALLEL).map(readPage),
      );
      for (const p of pages) rows.push(...p.rows);
    }
    // Rows added while reading land past the counted total; pick them up so nothing is missed.
    for (let o = Math.ceil(first.total / PAGE) * PAGE; ; o += PAGE) {
      const tail = await readPage(o);
      rows.push(...tail.rows);
      if (tail.rows.length < PAGE) break;
    }
  } else {
    for (let o = PAGE; ; o += PAGE) {
      const page = await readPage(o);
      rows.push(...page.rows);
      if (page.rows.length < PAGE) break;
    }
  }
  return [...new Map(rows.map((r) => [String(r._ID), r])).values()];
}

export async function readAllNotes(): Promise<InspectorNote[]> {
  const rows = await readAllRows();
  const bindings = rows.flatMap((row) =>
    positionBindings(row.a59, String(row._ID)),
  );
  return bindCCTNotes(rows.map(mapRow), bindings).map((note) => ({
    scope: "element",
    page: "",
    label: note.title,
    ...note,
  }));
}
export async function selectNote(binding: NoteBinding): Promise<InspectorNote> {
  const row = (await wp(`/${binding.id}`)) as CCTRow;
  if (String(row._ID) !== binding.id) throw new Error("所选注释不存在。");
  await storeBinding({ ...binding, locked: true });
  return { ...mapRow(row), ...binding, locked: true };
}
export async function writeNote(
  note: Omit<InspectorNote, "updatedAt"> & { create?: boolean | undefined },
): Promise<InspectorNote> {
  const current = note.create ? undefined : await storedBinding(note.key);
  let id = note.create ? undefined : note.id || current?.id;
  if (!id) {
    const result = (await wp("", "POST", {
      a55: note.title || note.label,
      a56: note.text,
      a58: note.verified ? "b55" : "b56",
      cct_status: "publish",
    })) as number | string | { item_id?: number; _ID?: number };
    id = String(
      typeof result === "number" || typeof result === "string"
        ? result
        : result.item_id || result._ID || "",
    );
    if (!/^\d+$/.test(id))
      throw new Error("没有返回新注释编号，请重新读取列表，勿重复新建。");
  } else {
    await wp(`/${id}`, "POST", {
      a55: note.title || note.label,
      a56: note.text,
      a58: note.verified ? "b55" : "b56",
    });
  }
  const row = (await wp(`/${id}`)) as CCTRow;
  if (
    row.a56 !== note.text ||
    row.a55 !== (note.title || note.label) ||
    (row.a58 === "b55") !== !!note.verified
  )
    throw new Error("保存后的内容核对不一致。");
  const binding: NoteBinding = {
    key: note.key,
    id,
    scope: note.scope,
    page: note.page,
    label: note.label,
    ...(note.source ? { source: note.source } : {}),
    ...(note.alias ? { alias: note.alias } : {}),
    locked: true,
  };
  await storeBinding(binding);
  return { ...mapRow(row), ...binding };
}

/** Fresh CCT324 note for one exact position stored in a59; null when unbound. */
export async function readCCTNoteForKey(key: string): Promise<{
  id: string;
  title: string;
  text: string;
  verified: boolean;
} | null> {
  const binding = await storedBinding(key);
  if (!binding?.id) return null;
  const row = (await wp(`/${binding.id}`)) as CCTRow;
  if (String(row._ID) !== binding.id) return null;
  return {
    id: binding.id,
    title: row.a55 || "",
    text: row.a56 || "",
    verified: row.a58 === "b55",
  };
}

/** REL325 "One manual note can have many related manual notes" (CCT324 → CCT324, Many to many). */
const NOTE_REL = 325;
const REL_BASE =
  "https://app.challenged-dementia.com/afresh/wp-json/jet-rel/" + NOTE_REL;
async function rel(
  path = "",
  method = "GET",
  body?: unknown,
): Promise<unknown> {
  const user = process.env["WP_ADMIN_USER"];
  const password = process.env["WP_ADMIN_APP_PASSWORD"];
  if (!user || !password) throw new Error("注释关联未配置。");
  const response = await fetch(REL_BASE + path, {
    method,
    headers: {
      Authorization: `Basic ${btoa(`${user}:${password}`)}`,
      "Content-Type": "application/json",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok)
    throw new Error(`注释关联读取或保存失败（${response.status}），请重试。`);
  return response.json();
}
export interface RelatedNote {
  id: string;
  title: string;
  text: string;
  side: "parent" | "child";
  verified: boolean;
}
async function relIds(
  side: "parents" | "children",
  id: string,
): Promise<string[]> {
  const rows = await rel(`/${side}/${id}`);
  if (!Array.isArray(rows)) throw new Error("注释关联返回异常。");
  return rows
    .map((r: { parent_object_id?: unknown; child_object_id?: unknown }) =>
      String(side === "parents" ? r.parent_object_id : r.child_object_id),
    )
    .filter((v) => /^\d+$/.test(v));
}
/** Parent (REL325 父) and children (REL325 子) of one CCT324 note, read fresh with their a55/a56. */
export async function readRelatedNotes(id: string): Promise<RelatedNote[]> {
  const [parents, children] = await Promise.all([
    relIds("parents", id),
    relIds("children", id),
  ]);
  const entries: [string, "parent" | "child"][] = [
    ...parents.map((p) => [p, "parent"] as [string, "parent"]),
    ...children.map((c) => [c, "child"] as [string, "child"]),
  ];
  return Promise.all(
    entries.map(async ([nid, side]) => {
      const row = (await wp(`/${nid}`)) as CCTRow;
      return {
        id: nid,
        title: row.a55 || "",
        text: row.a56 || "",
        side,
        verified: row.a58 === "b55",
      };
    }),
  );
}
/** Edit a related CCT324 note's a55/a56/a58 in place; never touches element/page bindings. */
export async function updatePlainNote(
  id: string,
  title: string,
  text: string,
  verified: boolean,
): Promise<void> {
  await wp(`/${id}`, "POST", {
    a55: title,
    a56: text,
    a58: verified ? "b55" : "b56",
  });
  const row = (await wp(`/${id}`)) as CCTRow;
  if (
    String(row._ID) !== id ||
    row.a55 !== title ||
    row.a56 !== text ||
    (row.a58 === "b55") !== verified
  )
    throw new Error("保存后的内容核对不一致。");
}
/** Many to many: adding a link never removes the note's other links. */
export async function linkNotes(parent: string, child: string): Promise<void> {
  if (parent === child) throw new Error("不能把注释关联到它自己。");
  const [p, c] = await Promise.all([
    wp(`/${parent}`) as Promise<CCTRow>,
    wp(`/${child}`) as Promise<CCTRow>,
  ]);
  if (String(p._ID) !== parent || String(c._ID) !== child)
    throw new Error("所选注释不存在。");
  const before = await relIds("parents", child);
  if (
    before.includes(parent) ||
    (await relIds("parents", parent)).includes(child)
  )
    return;
  await rel("", "POST", {
    parent_id: Number(parent),
    child_id: Number(child),
    context: "child",
    store_items_type: "update",
  });
  const after = await relIds("parents", child);
  if (!after.includes(parent) || before.some((id) => !after.includes(id)))
    throw new Error("关联保存后核对不一致。");
}
export async function unlinkNotes(
  parent: string,
  child: string,
): Promise<void> {
  await rel("", "POST", {
    parent_id: Number(parent),
    child_id: Number(child),
    context: "child",
    store_items_type: "disconnect",
  });
  if ((await relIds("parents", child)).includes(parent))
    throw new Error("取消关联后核对不一致。");
}
/** REL325 is shown without parent/child, so the current note is stored as parent (titles no longer mark note kinds). */
export function relationDirection(
  current: { id: string; title: string },
  other: { id: string; title: string },
): { parent: string; child: string } {
  return { parent: current.id, child: other.id };
}
export async function readNoteById(
  id: string,
): Promise<{ id: string; title: string; text: string; verified: boolean }> {
  const row = (await wp(`/${id}`)) as CCTRow;
  if (String(row._ID) !== id) throw new Error("所选注释不存在。");
  return {
    id,
    title: row.a55 || "",
    text: row.a56 || "",
    verified: row.a58 === "b55",
  };
}
export async function noteTitle(id: string): Promise<string> {
  return (await readNoteById(id)).title;
}
export async function createPlainNote(
  title: string,
  text: string,
): Promise<string> {
  const result = (await wp("", "POST", {
    a55: title,
    a56: text,
    cct_status: "publish",
  })) as number | string | { item_id?: number; _ID?: number };
  const id = String(
    typeof result === "number" || typeof result === "string"
      ? result
      : result.item_id || result._ID || "",
  );
  if (!/^\d+$/.test(id))
    throw new Error("没有返回新注释编号，请重新读取列表，勿重复新建。");
  const row = (await wp(`/${id}`)) as CCTRow;
  if (row.a55 !== title || row.a56 !== text)
    throw new Error("保存后的内容核对不一致。");
  return id;
}
