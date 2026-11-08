import { createClient } from "@supabase/supabase-js";
import {
  bindCCTNotes,
  type CCTNote,
  type NoteBinding,
} from "@/features/inspector/cct-notes";
import {
  positionBindings,
  samePosition,
  updatePositionBindings,
} from "@/features/inspector/position-bindings";
import { WP } from "@/integrations/wp-schema";

/** Legacy Cloud archives are inactive backups; active position bindings live only in CCT324 a59. */
const BUCKET = "inspector-notes";
export interface InspectorNote {
  key: string;
  scope: "element" | "page" | "site";
  page: string;
  label: string;
  text: string;
  updatedAt: string;
  id?: string | undefined;
  title?: string | undefined;
  version?: string | undefined;
  noteType?: "b55" | "b56" | undefined;
  tabOrder?: number | undefined;
  locked?: boolean | undefined;
  verified?: boolean | undefined;
  relationVerified?: boolean | undefined;
  relationDetails?: string | undefined;
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
  a57?: string;
  a58?: string;
  a59?: string;
  a60?: string;
  a61?: string;
  a62?: string;
  a63?: string;
  a64?: string | number | null;
  cct_modified?: string;
};
const NOTE_FIELDS = WP.cct["324"].f;
const NOTE_RELATION_VERIFIED = WP.cct["324"].opt["NOTE_RELATION_VERIFIED"];
const CCT_BASE =
  "https://app.challenged-dementia.com/afresh/wp-json/jet-cct/manual_notes";
async function wp(
  path = "",
  method = "GET",
  body?: unknown,
  token?: string,
): Promise<unknown> {
  const user = process.env["WP_ADMIN_USER"];
  const password = process.env["WP_ADMIN_APP_PASSWORD"];
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (user && password)
    headers["Authorization"] = `Basic ${btoa(`${user}:${password}`)}`;
  else if (token) headers["Authorization"] = `Bearer ${token}`;
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
  const rawTabOrder = row[NOTE_FIELDS["笔记标签顺序"]];
  const tabOrder = rawTabOrder === undefined || rawTabOrder === null || rawTabOrder === ""
    ? undefined
    : Number(rawTabOrder);
  return {
    key: `cct|${row._ID}`,
    id: String(row._ID),
    title: row.a55,
    text: row.a56,
    version: row[NOTE_FIELDS["版本"]] || "",
    noteType: row[NOTE_FIELDS["笔记类型"]] === WP.cct["324"].opt["NOTE_TYPE"]["PAGE_ASSOCIATION"]
      ? "b56"
      : row[NOTE_FIELDS["笔记类型"]] === WP.cct["324"].opt["NOTE_TYPE"]["PAGE_DESCRIPTION"]
        ? "b55"
        : undefined,
    tabOrder: tabOrder !== undefined && Number.isFinite(tabOrder) ? tabOrder : undefined,
    verified: row.a58 === "b55",
    relationVerified:
      row[NOTE_FIELDS["已手动核对笔记关联"]] ===
      NOTE_RELATION_VERIFIED["YES"],
    relationDetails: row[NOTE_FIELDS["已手动核对笔记关联详情"]] || "",
    updatedAt: row.cct_modified
      ? row.cct_modified.replace(" ", "T") + "+08:00"
      : "",
  };
}
/** Filter on the existing a59 field; never download the entire note catalogue for one element. */
async function bindingRows(key: string, token?: string): Promise<CCTRow[]> {
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
      "GET",
      undefined,
      token,
    );
    if (!Array.isArray(result)) throw new Error("位置绑定读取异常。");
    rows.push(...(result as CCTRow[]));
    if (result.length < 100) break;
  }
  return rows.filter((row) =>
    positionBindings(row.a59, String(row._ID)).some((b) =>
      samePosition(b.key, key),
    ),
  );
}
async function storedBinding(key: string, token?: string): Promise<NoteBinding | undefined> {
  const bindings = (await bindingRows(key, token)).flatMap((row) =>
    positionBindings(row.a59, String(row._ID)),
  );
  return bindings.find((binding) => binding.key === key) ||
    bindings.find((binding) => samePosition(binding.key, key));
}

async function notesBoundToPosition(key: string, token?: string): Promise<CCTNote[]> {
  const rows = await bindingRows(key, token);
  return rows.flatMap((row) => {
    const binding = positionBindings(row.a59, String(row._ID)).find((entry) => samePosition(entry.key, key));
    return binding ? [{ ...mapRow(row), ...binding }] : [];
  }).sort((a, b) => (a.tabOrder ?? Number.MAX_SAFE_INTEGER) - (b.tabOrder ?? Number.MAX_SAFE_INTEGER) || Number(a.id) - Number(b.id));
}

async function writeNoteTypeAndOrder(
  id: string,
  noteType: "b55" | "b56",
  tabOrder: number,
  token?: string,
) {
  const row = (await wp(`/${id}`, "GET", undefined, token)) as CCTRow;
  const typeField = NOTE_FIELDS["笔记类型"];
  const orderField = NOTE_FIELDS["笔记标签顺序"];
  if (row[typeField] === noteType && Number(row[orderField]) === tabOrder) return;
  await wp(`/${id}`, "POST", { [typeField]: noteType, [orderField]: String(tabOrder) }, token);
  const saved = (await wp(`/${id}`, "GET", undefined, token)) as CCTRow;
  if (String(saved._ID) !== id || saved[typeField] !== noteType || String(saved[orderField]) !== String(tabOrder))
    throw new Error(`笔记 #${id} 的类型或标签顺序保存后核对不一致。`);
}

/** Backfill a63/a64 for notes already bound to this position in a59. */
export async function readNotesForPosition(key: string, token?: string): Promise<CCTNote[]> {
  let notes = await notesBoundToPosition(key, token);
  const nextOrder: Record<"b55" | "b56", number> = { b55: 1, b56: 1 };
  for (const note of notes) {
    const noteType = note.noteType || "b55";
    const tabOrder = note.tabOrder ?? nextOrder[noteType];
    nextOrder[noteType] = Math.max(nextOrder[noteType], tabOrder + 1);
    await writeNoteTypeAndOrder(note.id, noteType, tabOrder, token);
  }
  notes = await notesBoundToPosition(key, token);
  return notes;
}

export async function reorderPositionNotes(
  key: string,
  noteType: "b55" | "b56",
  ids: string[],
  token?: string,
): Promise<CCTNote[]> {
  const seen = new Set<string>();
  for (const [index, id] of ids.entries()) {
    if (seen.has(id)) throw new Error("笔记顺序包含重复编号。");
    seen.add(id);
    const row = (await wp(`/${id}`, "GET", undefined, token)) as CCTRow;
    if (String(row._ID) !== id || row[NOTE_FIELDS["笔记类型"]] !== noteType ||
      !positionBindings(row.a59, id).some((binding) => samePosition(binding.key, key)))
        throw new Error(`笔记 #${id} 已不属于当前分类或位置，请重新读取。`);
    const tabOrder = String(index + 1);
    if (row[NOTE_FIELDS["笔记标签顺序"]] !== tabOrder) {
      await wp(`/${id}`, "POST", { [NOTE_FIELDS["笔记标签顺序"]]: tabOrder }, token);
      const fresh = (await wp(`/${id}`, "GET", undefined, token)) as CCTRow;
      if (String(fresh._ID) !== id || fresh[NOTE_FIELDS["笔记标签顺序"]] !== tabOrder)
        throw new Error(`笔记 #${id} 的标签顺序保存后核对不一致。`);
    }
  }
  return readNotesForPosition(key, token);
}
/** Picker search uses partial keyword matches (or an exact number): returns at most 60 names, never note bodies. */
export async function searchNotes(
  q: string,
  status: "all" | "verified" | "unverified",
  token?: string,
): Promise<
  { id: string; title: string; version: string; verified: boolean }[]
> {
  const words = q
    .trim()
    .replace(/^#/, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6);
  const statusFilter:
    { field: string; operator: string; value: string } | undefined =
    status === "all"
      ? undefined
      : {
          field: "a58",
          operator: "=",
          value: status === "verified" ? "b55" : "b56",
        };
  const firstWord = words[0];
  const exactId = words.length === 1 && !!firstWord && /^\d+$/.test(firstWord);
  const searchWords = exactId && firstWord ? [firstWord] : words;
  const queryRows = await Promise.all(
    (searchWords.length ? searchWords : [""]).map(async (word) => {
      const filters: { field: string; operator: string; value: string }[] = [];
      if (exactId && word)
        filters.push({ field: "_ID", operator: "=", value: word });
      else if (word)
        filters.push({ field: "a55", operator: "LIKE", value: word });
      if (statusFilter) filters.push(statusFilter);
      const qs = `?_limit=60&_orderby=_ID&_order=desc${filters.length ? `&_filters=${encodeURIComponent(JSON.stringify(filters))}` : ""}`;
      const rows = (await wp(qs, "GET", undefined, token)) as CCTRow[];
      return Array.isArray(rows) ? rows : [];
    }),
  );
  const rowsById = new Map<string, CCTRow>();
  for (const rows of queryRows)
    for (const row of rows) rowsById.set(String(row._ID), row);
  const rows = [...rowsById.values()];
  const normalizedWords = words.map((word) => word.toLocaleLowerCase());
  rows.sort((a, b) => {
    const titleA = String(a.a55 || "").toLocaleLowerCase();
    const titleB = String(b.a55 || "").toLocaleLowerCase();
    const matchesA = normalizedWords.filter((word) =>
      titleA.includes(word),
    ).length;
    const matchesB = normalizedWords.filter((word) =>
      titleB.includes(word),
    ).length;
    return matchesB - matchesA || Number(b._ID) - Number(a._ID);
  });
  return rows.slice(0, 60).map((r) => ({
    id: String(r._ID),
    title: r.a55 || "",
    version: r[NOTE_FIELDS["版本"]] || "",
    verified: r.a58 === "b55",
  }));
}
export async function readNoteForKey(
  key: string,
  token?: string,
): Promise<InspectorNote | null> {
  const binding = await storedBinding(key, token);
  if (!binding?.id) return null;
  const row = (await wp(`/${binding.id}`, "GET", undefined, token)) as CCTRow;
  if (String(row._ID) !== binding.id) throw new Error("绑定的注释不存在。");
  return { ...mapRow(row), ...binding, key };
}

/** Recover a source-verified legacy binding only when its fingerprint identifies one note. */
export async function readNoteForFingerprint(
  key: string,
  fingerprint: string,
  tag: string,
  page: string,
  currentLabel?: string,
  token?: string,
): Promise<InspectorNote | null> {
  const match = fingerprint.match(/^([^:]+):(\d+):(\d+):([0-9a-f]{64}):1$/);
  if (!match) return null;
  const [, file, , , digest] = match;
  const rows: CCTRow[] = [];
  for (let offset = 0; ; offset += 100) {
    const filters = [{ field: "a59", operator: "LIKE", value: file }];
    const result = await wp(
      `?_limit=100&_offset=${offset}&_orderby=_ID&_order=asc&_filters=${encodeURIComponent(JSON.stringify(filters))}`,
      "GET",
      undefined,
      token,
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
  const note = { ...mapRow(found.row), ...found.binding, key };
  if (currentLabel) {
    const { matchingLegacyLabel } =
      await import("@/features/inspector/legacy-match");
    if (!matchingLegacyLabel(note.label, currentLabel)) return null;
  }
  return note;
}

/** Add the newly resolved stable position to a CCT note without changing its text or check state. */
export async function rebindRecoveredNote(
  note: InspectorNote,
  key: string,
  scope: "element" | "page" | "site",
  page: string,
  label: string,
  alias?: string,
  token?: string,
): Promise<InspectorNote> {
  if (!note.id) throw new Error("恢复的注释缺少 CCT 编号，未修改关联。");
  const binding: NoteBinding = {
    key,
    id: note.id,
    scope,
    page,
    label,
    ...(note.source ? { source: note.source } : {}),
    ...(alias || note.alias ? { alias: alias || note.alias } : {}),
    locked: true,
  };
  await storeBinding(binding, token);
  return { ...note, ...binding };
}
async function writeBindingsOnly(
  row: CCTRow,
  bindings: NoteBinding[],
  token?: string,
): Promise<void> {
  const a59 = updatePositionBindings(row.a59, bindings);
  await wp(`/${row._ID}`, "POST", { a59 }, token);
  const saved = (await wp(`/${row._ID}`, "GET", undefined, token)) as CCTRow;
  if (
    saved.a59 !== a59 ||
    saved.a55 !== row.a55 ||
    saved.a56 !== row.a56 ||
    (saved.a58 || "") !== (row.a58 || "")
  )
    throw new Error("位置绑定保存后核对不一致，未确认保存。");
}
async function storeBinding(binding: NoteBinding, token?: string) {
  const target = (await wp(`/${binding.id}`, "GET", undefined, token)) as CCTRow;
  if (String(target._ID) !== binding.id) throw new Error("所选注释不存在。");
  const retained = positionBindings(target.a59, binding.id);
  const existing = retained.findIndex((b) => b.key === binding.key);
  if (existing < 0) retained.push(binding);
  else retained[existing] = binding;
  await writeBindingsOnly(target, retained, token);
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
  token?: string,
): Promise<{ rows: CCTRow[]; total: number | null }> {
  const user = process.env["WP_ADMIN_USER"];
  const password = process.env["WP_ADMIN_APP_PASSWORD"];
  const headers: Record<string, string> = {};
  if (user && password)
    headers["Authorization"] = `Basic ${btoa(`${user}:${password}`)}`;
  else if (token) headers["Authorization"] = `Bearer ${token}`;
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
async function readAllRows(token?: string): Promise<CCTRow[]> {
  const first = await readPage(0, token);
  if (first.rows.length < PAGE) return first.rows;
  const rows: CCTRow[] = [...first.rows];
  if (first.total) {
    const offsets: number[] = [];
    for (let o = PAGE; o < first.total; o += PAGE) offsets.push(o);
    for (let i = 0; i < offsets.length; i += PARALLEL) {
      const pages = await Promise.all(
        offsets.slice(i, i + PARALLEL).map((offset) => readPage(offset, token)),
      );
      for (const p of pages) rows.push(...p.rows);
    }
    // Rows added while reading land past the counted total; pick them up so nothing is missed.
    for (let o = Math.ceil(first.total / PAGE) * PAGE; ; o += PAGE) {
      const tail = await readPage(o, token);
      rows.push(...tail.rows);
      if (tail.rows.length < PAGE) break;
    }
  } else {
    for (let o = PAGE; ; o += PAGE) {
      const page = await readPage(o, token);
      rows.push(...page.rows);
      if (page.rows.length < PAGE) break;
    }
  }
  return [...new Map(rows.map((r) => [String(r._ID), r])).values()];
}

export async function readAllNotes(token?: string): Promise<InspectorNote[]> {
  const rows = await readAllRows(token);
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
export async function selectNote(
  binding: NoteBinding & { noteType?: "b55" | "b56" | undefined; tabOrder?: number | undefined },
  token?: string,
): Promise<InspectorNote> {
  let row = (await wp(`/${binding.id}`, "GET", undefined, token)) as CCTRow;
  if (String(row._ID) !== binding.id) throw new Error("所选注释不存在。");
  if (binding.noteType && binding.tabOrder !== undefined) {
    await updatePlainNote(binding.id, {
      title: row.a55 || "",
      text: row.a56 || "",
      verified: row.a58 === "b55",
      relationVerified: row[NOTE_FIELDS["已手动核对笔记关联"]] === NOTE_RELATION_VERIFIED["YES"],
      relationDetails: row[NOTE_FIELDS["已手动核对笔记关联详情"]] || "",
      version: row[NOTE_FIELDS["版本"]] || "",
      noteType: binding.noteType,
      tabOrder: binding.tabOrder,
    }, token);
    row = (await wp(`/${binding.id}`, "GET", undefined, token)) as CCTRow;
  }
  const { noteType, tabOrder, ...positionBinding } = binding;
  await storeBinding({ ...positionBinding, locked: true }, token);
  return {
    ...mapRow(row),
    ...positionBinding,
    ...(noteType === undefined ? {} : { noteType }),
    ...(tabOrder === undefined ? {} : { tabOrder }),
    locked: true,
  };
}
export async function writeNote(
  note: Omit<InspectorNote, "updatedAt"> & { create?: boolean | undefined },
  token?: string,
): Promise<InspectorNote> {
  const current = note.create ? undefined : await storedBinding(note.key, token);
  let id = note.create ? undefined : note.id || current?.id;
  const isNew = !id;
  if (!id) {
    const result = (await wp("", "POST", {
      a55: note.title || note.label,
      a56: note.text,
      a57: "ChallengeD",
      [NOTE_FIELDS["版本"]]: note.version || "",
      [NOTE_FIELDS["笔记类型"]]: note.noteType || WP.cct["324"].opt["NOTE_TYPE"]["PAGE_DESCRIPTION"],
      [NOTE_FIELDS["笔记标签顺序"]]: String(note.tabOrder ?? 1),
      a58: note.verified ? "b55" : "b56",
      [NOTE_FIELDS["已手动核对笔记关联"]]: note.relationVerified
        ? NOTE_RELATION_VERIFIED["YES"]
        : NOTE_RELATION_VERIFIED["NO"],
      [NOTE_FIELDS["已手动核对笔记关联详情"]]: note.relationDetails || "",
      cct_status: "publish",
    }, token)) as number | string | { item_id?: number; _ID?: number };
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
      [NOTE_FIELDS["版本"]]: note.version || "",
      [NOTE_FIELDS["笔记类型"]]: note.noteType || WP.cct["324"].opt["NOTE_TYPE"]["PAGE_DESCRIPTION"],
      [NOTE_FIELDS["笔记标签顺序"]]: String(note.tabOrder ?? 1),
      a58: note.verified ? "b55" : "b56",
      [NOTE_FIELDS["已手动核对笔记关联"]]: note.relationVerified
        ? NOTE_RELATION_VERIFIED["YES"]
        : NOTE_RELATION_VERIFIED["NO"],
      [NOTE_FIELDS["已手动核对笔记关联详情"]]: note.relationDetails || "",
    }, token);
  }
  const row = (await wp(`/${id}`, "GET", undefined, token)) as CCTRow;
  if (
    row.a56 !== note.text ||
    row.a55 !== (note.title || note.label) ||
    (isNew && row.a57 !== "ChallengeD") ||
    (row[NOTE_FIELDS["版本"]] || "") !== (note.version || "") ||
    (row[NOTE_FIELDS["笔记类型"]] || WP.cct["324"].opt["NOTE_TYPE"]["PAGE_DESCRIPTION"]) !==
      (note.noteType || WP.cct["324"].opt["NOTE_TYPE"]["PAGE_DESCRIPTION"]) ||
    (row[NOTE_FIELDS["笔记标签顺序"]] || "1") !== String(note.tabOrder ?? 1) ||
    (row.a58 === "b55") !== !!note.verified ||
    row[NOTE_FIELDS["已手动核对笔记关联"]] !==
      (note.relationVerified
        ? NOTE_RELATION_VERIFIED["YES"]
        : NOTE_RELATION_VERIFIED["NO"]) ||
    (row[NOTE_FIELDS["已手动核对笔记关联详情"]] || "") !==
      (note.relationDetails || "")
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
  await storeBinding(binding, token);
  return { ...mapRow(row), ...binding };
}

/** Update a note already associated with a position, without changing its a59 bindings. */
export async function updateBoundNote(
  key: string,
  id: string,
  note: { title: string; text: string; version: string; noteType: "b55" | "b56"; tabOrder: number; verified: boolean; relationVerified: boolean; relationDetails: string },
  token?: string,
): Promise<CCTNote> {
  const row = (await wp(`/${id}`, "GET", undefined, token)) as CCTRow;
  if (String(row._ID) !== id || !positionBindings(row.a59, id).some((binding) => samePosition(binding.key, key)))
    throw new Error("此笔记未关联到当前元素、页面或全站。");
  await updatePlainNote(id, note, token);
  const fresh = (await wp(`/${id}`, "GET", undefined, token)) as CCTRow;
  const binding = positionBindings(fresh.a59, id).find((entry) => samePosition(entry.key, key));
  if (!binding) throw new Error("笔记关联回读不一致。");
  return { ...mapRow(fresh), ...binding };
}

/** Fresh CCT324 note for one exact position, including a site scope, stored in a59; null when unbound. */
export async function readCCTNoteForKey(key: string, token?: string): Promise<{
  id: string;
  title: string;
  text: string;
  verified: boolean;
  relationVerified: boolean;
  relationDetails: string;
  version: string;
} | null> {
  const binding = await storedBinding(key, token);
  if (!binding?.id) return null;
  const row = (await wp(`/${binding.id}`, "GET", undefined, token)) as CCTRow;
  if (String(row._ID) !== binding.id) return null;
  return {
    id: binding.id,
    title: row.a55 || "",
    text: row.a56 || "",
    verified: row.a58 === "b55",
    relationVerified:
      row[NOTE_FIELDS["已手动核对笔记关联"]] ===
      NOTE_RELATION_VERIFIED["YES"],
    relationDetails: row[NOTE_FIELDS["已手动核对笔记关联详情"]] || "",
    version: row[NOTE_FIELDS["版本"]] || "",
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
  token?: string,
): Promise<unknown> {
  const user = process.env["WP_ADMIN_USER"];
  const password = process.env["WP_ADMIN_APP_PASSWORD"];
  if (!user && !password && !token) throw new Error("注释关联未配置。");
  const authorization =
    user && password
      ? `Basic ${btoa(`${user}:${password}`)}`
      : `Bearer ${token}`;
  const response = await fetch(REL_BASE + path, {
    method,
    headers: {
      Authorization: authorization,
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
  version: string;
  text: string;
  side: "parent" | "child";
  verified: boolean;
  relationVerified: boolean;
  relationDetails: string;
}
async function relIds(
  side: "parents" | "children",
  id: string,
  token?: string,
): Promise<string[]> {
  const rows = await rel(`/${side}/${id}`, "GET", undefined, token);
  if (!Array.isArray(rows)) throw new Error("注释关联返回异常。");
  return rows
    .map((r: { parent_object_id?: unknown; child_object_id?: unknown }) =>
      String(side === "parents" ? r.parent_object_id : r.child_object_id),
    )
    .filter((v) => /^\d+$/.test(v));
}
/** Parent (REL325 父) and children (REL325 子) of one CCT324 note, read fresh with their a55/a56. */
export async function readRelatedNotes(
  id: string,
  token?: string,
): Promise<RelatedNote[]> {
  const [parents, children] = await Promise.all([
    relIds("parents", id, token),
    relIds("children", id, token),
  ]);
  const entries: [string, "parent" | "child"][] = [
    ...parents.map((p) => [p, "parent"] as [string, "parent"]),
    ...children.map((c) => [c, "child"] as [string, "child"]),
  ];
  return Promise.all(
    entries.map(async ([nid, side]) => {
      const row = (await wp(`/${nid}`, "GET", undefined, token)) as CCTRow;
      return {
        id: nid,
        title: row.a55 || "",
        text: row.a56 || "",
        side,
        verified: row.a58 === "b55",
        relationVerified:
          row[NOTE_FIELDS["已手动核对笔记关联"]] ===
          NOTE_RELATION_VERIFIED["YES"],
        relationDetails: row[NOTE_FIELDS["已手动核对笔记关联详情"]] || "",
        version: row[NOTE_FIELDS["版本"]] || "",
      };
    }),
  );
}
/** Edit a related CCT324 note's a55/a56/a58 in place; never touches element/page bindings. */
export async function updatePlainNote(
  id: string,
  note: {
    title: string;
    text: string;
    verified: boolean;
    relationVerified: boolean;
    relationDetails: string;
    version?: string | undefined;
    noteType?: "b55" | "b56" | undefined;
    tabOrder?: number | undefined;
  },
  token?: string,
): Promise<void> {
  await wp(
    `/${id}`,
    "POST",
    {
      a55: note.title,
      a56: note.text,
      a58: note.verified ? "b55" : "b56",
      [NOTE_FIELDS["已手动核对笔记关联"]]: note.relationVerified
        ? NOTE_RELATION_VERIFIED["YES"]
        : NOTE_RELATION_VERIFIED["NO"],
      [NOTE_FIELDS["已手动核对笔记关联详情"]]: note.relationDetails,
      ...(note.version === undefined ? {} : { [NOTE_FIELDS["版本"]]: note.version }),
      ...(note.noteType === undefined ? {} : { [NOTE_FIELDS["笔记类型"]]: note.noteType }),
      ...(note.tabOrder === undefined ? {} : { [NOTE_FIELDS["笔记标签顺序"]]: String(note.tabOrder) }),
    },
    token,
  );
  const row = (await wp(`/${id}`, "GET", undefined, token)) as CCTRow;
  if (
    String(row._ID) !== id ||
    row.a55 !== note.title ||
    row.a56 !== note.text ||
    (row.a58 === "b55") !== note.verified ||
    row[NOTE_FIELDS["已手动核对笔记关联"]] !==
      (note.relationVerified
        ? NOTE_RELATION_VERIFIED["YES"]
        : NOTE_RELATION_VERIFIED["NO"]) ||
    (row[NOTE_FIELDS["已手动核对笔记关联详情"]] || "") !==
      note.relationDetails ||
    (note.version !== undefined && (row[NOTE_FIELDS["版本"]] || "") !== note.version) ||
    (note.noteType !== undefined && row[NOTE_FIELDS["笔记类型"]] !== note.noteType) ||
    (note.tabOrder !== undefined && String(row[NOTE_FIELDS["笔记标签顺序"]] || "") !== String(note.tabOrder))
  )
    throw new Error("保存后的内容核对不一致。");
}
/** Many to many: adding a link never removes the note's other links. */
export async function linkNotes(
  parent: string,
  child: string,
  token?: string,
  meta?: Record<string, unknown> | undefined,
): Promise<void> {
  if (parent === child) throw new Error("不能把注释关联到它自己。");
  const [p, c] = await Promise.all([
    wp(`/${parent}`, "GET", undefined, token) as Promise<CCTRow>,
    wp(`/${child}`, "GET", undefined, token) as Promise<CCTRow>,
  ]);
  if (String(p._ID) !== parent || String(c._ID) !== child)
    throw new Error("所选注释不存在。");
  const before = await relIds("parents", child, token);
  const alreadyLinked =
    before.includes(parent) ||
    (await relIds("parents", parent, token)).includes(child);
  if (!alreadyLinked || meta) {
    await rel(
      "",
      "POST",
      {
        parent_id: Number(parent),
        child_id: Number(child),
        context: "child",
        store_items_type: "update",
        ...(meta ? { meta } : {}),
      },
      token,
    );
  }
  const after = await relIds("parents", child, token);
  if (!after.includes(parent) || before.some((id) => !after.includes(id)))
    throw new Error("关联保存后核对不一致。");
  if (meta) {
    const relationData = await rel(
      `/parents/${child}`,
      "GET",
      undefined,
      token,
    );
    if (!Array.isArray(relationData)) throw new Error("关联字段回读异常。");
    const relation = relationData.find(
      (row: { parent_object_id?: unknown }) =>
        String(row["parent_object_id"]) === parent,
    ) as { meta?: Record<string, unknown> } | undefined;
    if (
      !relation ||
      Object.entries(meta).some(
        ([field, value]) =>
          JSON.stringify(relation.meta?.[field]) !== JSON.stringify(value),
      )
    )
      throw new Error("关联类型保存后核对不一致。");
  }
}
export async function unlinkNotes(
  parent: string,
  child: string,
  token?: string,
): Promise<void> {
  await rel(
    "",
    "POST",
    {
      parent_id: Number(parent),
      child_id: Number(child),
      context: "child",
      store_items_type: "disconnect",
    },
    token,
  );
  if ((await relIds("parents", child, token)).includes(parent))
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
  token?: string,
): Promise<{
  id: string;
  title: string;
  text: string;
  version: string;
  verified: boolean;
  relationVerified: boolean;
  relationDetails: string;
}> {
  const row = (await wp(`/${id}`, "GET", undefined, token)) as CCTRow;
  if (String(row._ID) !== id) throw new Error("所选注释不存在。");
  return {
    id,
    title: row.a55 || "",
    text: row.a56 || "",
    version: row[NOTE_FIELDS["版本"]] || "",
    verified: row.a58 === "b55",
    relationVerified:
      row[NOTE_FIELDS["已手动核对笔记关联"]] ===
      NOTE_RELATION_VERIFIED["YES"],
    relationDetails: row[NOTE_FIELDS["已手动核对笔记关联详情"]] || "",
  };
}
export async function noteTitle(id: string, token?: string): Promise<string> {
  return (await readNoteById(id, token)).title;
}
export async function createPlainNote(
  note: { title: string; text: string; relationVerified: boolean; relationDetails: string; version?: string | undefined },
  token?: string,
): Promise<string> {
  const result = (await wp(
    "",
    "POST",
    {
      a55: note.title,
      a56: note.text,
      [NOTE_FIELDS["版本"]]: note.version || "",
      [NOTE_FIELDS["已手动核对笔记关联"]]: note.relationVerified
        ? NOTE_RELATION_VERIFIED["YES"]
        : NOTE_RELATION_VERIFIED["NO"],
      [NOTE_FIELDS["已手动核对笔记关联详情"]]: note.relationDetails,
      cct_status: "publish",
    },
    token,
  )) as number | string | { item_id?: number; _ID?: number };
  const id = String(
    typeof result === "number" || typeof result === "string"
      ? result
      : result.item_id || result._ID || "",
  );
  if (!/^\d+$/.test(id))
    throw new Error("没有返回新注释编号，请重新读取列表，勿重复新建。");
  const row = (await wp(`/${id}`, "GET", undefined, token)) as CCTRow;
  if (
    row.a55 !== note.title ||
    row.a56 !== note.text ||
    (row[NOTE_FIELDS["版本"]] || "") !== (note.version || "") ||
    row[NOTE_FIELDS["已手动核对笔记关联"]] !==
      (note.relationVerified
        ? NOTE_RELATION_VERIFIED["YES"]
        : NOTE_RELATION_VERIFIED["NO"]) ||
    (row[NOTE_FIELDS["已手动核对笔记关联详情"]] || "") !==
      note.relationDetails
  )
    throw new Error("保存后的内容核对不一致。");
  return id;
}

/** Clone a note's content and every direct REL325 edge into a new version.
 * Position bindings (a59) are deliberately left on the original until the user chooses to switch.
 */
export async function duplicateNoteVersion(
  sourceId: string,
  version: string,
  token?: string,
): Promise<CCTNote> {
  const source = (await wp(`/${sourceId}`, "GET", undefined, token)) as CCTRow;
  if (String(source._ID) !== sourceId) throw new Error("原笔记不存在，未创建新版本。");
  const [parents, children] = await Promise.all([
    relIds("parents", sourceId, token),
    relIds("children", sourceId, token),
  ]);
  const result = (await wp(
    "",
    "POST",
    {
      a55: source.a55 || "",
      a56: source.a56 || "",
      ...(source.a57 ? { a57: source.a57 } : {}),
      a58: source.a58 || "b56",
      [NOTE_FIELDS["版本"]]: version,
      [NOTE_FIELDS["已手动核对笔记关联"]]:
        source[NOTE_FIELDS["已手动核对笔记关联"]] || NOTE_RELATION_VERIFIED["NO"],
      [NOTE_FIELDS["已手动核对笔记关联详情"]]:
        source[NOTE_FIELDS["已手动核对笔记关联详情"]] || "",
      [NOTE_FIELDS["笔记类型"]]: source[NOTE_FIELDS["笔记类型"]] || WP.cct["324"].opt["NOTE_TYPE"]["PAGE_DESCRIPTION"],
      [NOTE_FIELDS["笔记标签顺序"]]: source[NOTE_FIELDS["笔记标签顺序"]] || "1",
      cct_status: "publish",
    },
    token,
  )) as number | string | { item_id?: number; _ID?: number };
  const newId = String(
    typeof result === "number" || typeof result === "string"
      ? result
      : result.item_id || result._ID || "",
  );
  if (!/^\d+$/.test(newId))
    throw new Error("新版本已提交，但没有返回编号；请搜索确认后再重试。 ");

  const fresh = (await wp(`/${newId}`, "GET", undefined, token)) as CCTRow;
  if (
    String(fresh._ID) !== newId ||
    fresh.a55 !== (source.a55 || "") ||
    fresh.a56 !== (source.a56 || "") ||
    (fresh.a57 || "") !== (source.a57 || "") ||
    (fresh.a58 || "b56") !== (source.a58 || "b56") ||
    (fresh[NOTE_FIELDS["版本"]] || "") !== version ||
    (fresh[NOTE_FIELDS["已手动核对笔记关联"]] || NOTE_RELATION_VERIFIED["NO"]) !==
      (source[NOTE_FIELDS["已手动核对笔记关联"]] || NOTE_RELATION_VERIFIED["NO"]) ||
    (fresh[NOTE_FIELDS["已手动核对笔记关联详情"]] || "") !==
      (source[NOTE_FIELDS["已手动核对笔记关联详情"]] || "") ||
    (fresh[NOTE_FIELDS["笔记类型"]] || WP.cct["324"].opt["NOTE_TYPE"]["PAGE_DESCRIPTION"]) !==
      (source[NOTE_FIELDS["笔记类型"]] || WP.cct["324"].opt["NOTE_TYPE"]["PAGE_DESCRIPTION"]) ||
    (fresh[NOTE_FIELDS["笔记标签顺序"]] || "1") !== (source[NOTE_FIELDS["笔记标签顺序"]] || "1")
  )
    throw new Error(`新版本 #${newId} 的内容回读不一致，关联尚未复制。`);

  // Keep every existing association on both notes, then add an explicit
  // source → new-version edge so all versions remain discoverable in REL325.
  const edges = [
    { parent: sourceId, child: newId },
    ...parents.map((parent) => ({ parent, child: newId })),
    ...children.map((child) => ({ parent: newId, child })),
  ];
  const linked: typeof edges = [];
  try {
    for (const edge of edges) {
      linked.push(edge);
      await linkNotes(
        edge.parent,
        edge.child,
        token,
        edge.parent === sourceId && edge.child === newId
          ? { a55: ["b55"] }
          : undefined,
      );
    }
    const [copiedParents, copiedChildren] = await Promise.all([
      relIds("parents", newId, token),
      relIds("children", newId, token),
    ]);
    if (
      parents.some((id) => !copiedParents.includes(id)) ||
      children.some((id) => !copiedChildren.includes(id)) ||
      !copiedParents.includes(sourceId) ||
      copiedParents.length !== parents.length + 1 ||
      copiedChildren.length !== children.length
    )
      throw new Error("关联回读与原笔记不一致。");
    const [sourceParentsAfter, sourceChildrenAfter] = await Promise.all([
      relIds("parents", sourceId, token),
      relIds("children", sourceId, token),
    ]);
    if (
      sourceParentsAfter.length !== parents.length ||
      parents.some((id) => !sourceParentsAfter.includes(id)) ||
      sourceChildrenAfter.length !== children.length + 1 ||
      children.some((id) => !sourceChildrenAfter.includes(id)) ||
      !sourceChildrenAfter.includes(newId)
    )
      throw new Error("原笔记的关联未完整保留，或版本关联回读不一致。");
  } catch (error) {
    for (const edge of linked.reverse()) {
      try {
        await unlinkNotes(edge.parent, edge.child, token);
      } catch {
        // Keep the primary error; the explicit note ID lets the researcher inspect partial recovery.
      }
    }
    throw new Error(
      `新版本 #${newId} 已创建，但关联未能完整复制：${error instanceof Error ? error.message : String(error)}。请先核对该编号，避免重复创建。`,
    );
  }
  return { ...mapRow(fresh), key: `cct|${newId}` };
}
