import { createClient } from "@supabase/supabase-js";
import { bindCCTNotes, type CCTNote, type NoteBinding } from '@/features/inspector/cct-notes';

/** Researcher manual notes for inspected elements/pages: one private JSON file per scope key. */
const BUCKET = "inspector-notes";
export interface InspectorNote { key: string; scope: "element" | "page"; page: string; label: string; text: string; updatedAt: string; id?: string | undefined; title?: string | undefined; locked?: boolean | undefined; source?: { file: string; line: number; endLine: number; tag: string; digest: string } | undefined }

function client() {
  const url = process.env["SUPABASE_URL"] || ""; const key = process.env["SUPABASE_SERVICE_ROLE_KEY"] || "";
  if (!url || !key) throw new Error("注释存储未配置 / Notes storage is not configured.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
    headers.set("apikey", key); return fetch(input, { ...init, headers });
  } } });
}

async function hash(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

export async function readNotes(keys: string[]): Promise<InspectorNote[]> {
  const c = client();
  const out = await Promise.all(keys.map(async (k) => {
    const { data, error } = await c.storage.from(BUCKET).download(`notes/${await hash(k)}.json`);
    if (error || !data) return null;
    try { return JSON.parse(await data.text()) as InspectorNote; } catch { return null; }
  }));
  return out.filter((n): n is InspectorNote => !!n && n.text.trim().length > 0);
}

const ALL = "notes/all.json";
/** Every note in one file, so the inspector loads them all with a single read. */
export async function readArchivedNotes(): Promise<InspectorNote[]> {
  const { data, error } = await client().storage.from(BUCKET).download(ALL);
  if (error || !data) throw new Error("注释读取失败，请重试。");
  const manual = JSON.parse(await data.text()) as InspectorNote[];
  // Source annotations are separately compressed; manual edits keep their original independent files.
  const bundle = await client().storage.from(BUCKET).download("notes/source.json.gz");
  if (!bundle.data) return manual.filter((n) => n.text.trim().length > 0);
  const stream = bundle.data.stream().pipeThrough(new DecompressionStream("gzip"));
  const source = JSON.parse(await new Response(stream).text()) as InspectorNote[];
  return [...new Map([...source, ...manual].map((n) => [n.key, n])).values()].filter((n) => n.text.trim().length > 0);
}

type CCTRow = { _ID: string | number; a55: string; a56: string; cct_modified?: string };
const CCT_BASE = 'https://app.challenged-dementia.com/afresh/wp-json/jet-cct/manual_notes';
async function wp(path = '', method = 'GET', body?: unknown): Promise<unknown> {
  const user = process.env['WP_ADMIN_USER']; const password = process.env['WP_ADMIN_APP_PASSWORD'];
  if (!user || !password) throw new Error('注释写入未配置。');
  const response = await fetch(CCT_BASE + path, { method, headers: { Authorization: `Basic ${btoa(`${user}:${password}`)}`, 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  if (!response.ok) throw new Error(`注释读取或保存失败（${response.status}），请重试。`);
  return response.json();
}
function mapRow(row: CCTRow): CCTNote {
  return { key: `cct|${row._ID}`, id: String(row._ID), title: row.a55, text: row.a56, updatedAt: row.cct_modified ? row.cct_modified.replace(' ', 'T') + '+08:00' : '' };
}
async function configuration(): Promise<NoteBinding[]> {
  const { data, error } = await client().storage.from(BUCKET).download('notes/cct-bindings.json.gz');
  if (error || !data) throw new Error('注释迁移尚未完成，暂不能切换。');
  const stream = data.stream().pipeThrough(new DecompressionStream('gzip'));
  const manifest = JSON.parse(await new Response(stream).text()) as { complete: boolean; bindings: NoteBinding[] };
  if (!manifest.complete) throw new Error('注释迁移尚未完成，暂不能切换。');
  return manifest.bindings;
}
async function override(key: string): Promise<NoteBinding | undefined> {
  const { data, error } = await client().storage.from(BUCKET).download(`bindings/${await hash(key)}.json`);
  if (error) {
    if ('statusCode' in error && String(error.statusCode) === '404') return undefined;
    throw new Error('无法读取固定选择，请重试。');
  }
  return data ? JSON.parse(await data.text()) as NoteBinding : undefined;
}
async function storeBinding(binding: NoteBinding) {
  const { error } = await client().storage.from(BUCKET).upload(`bindings/${await hash(binding.key)}.json`, new Blob([JSON.stringify(binding)], { type: 'application/json' }), { upsert: true, contentType: 'application/json' });
  if (error) throw new Error('注释已写入，但固定选择未保存，请重试；不要再次新建。');
}
export async function readAllNotes(): Promise<InspectorNote[]> {
  const bindings = await configuration();
  const rows: CCTRow[] = [];
  for (let offset = 0; ; offset += 500) {
    const result = await wp(`?_limit=500&_offset=${offset}&_orderby=_ID&_order=asc`);
    if (!Array.isArray(result)) throw new Error('注释列表返回异常。');
    rows.push(...result as CCTRow[]);
    if (result.length < 500) break;
  }
  // Independent location files avoid lost updates between unrelated elements.
  const storage = client().storage.from(BUCKET);
  const files: { name: string }[] = [];
  for (let offset = 0; ; offset += 100) {
    const result = await storage.list('bindings', { limit: 100, offset, sortBy: { column: 'name', order: 'asc' } });
    if (result.error) throw new Error('无法读取固定选择，请重试。');
    files.push(...result.data);
    if (result.data.length < 100) break;
  }
  const overrides = await Promise.all(files.filter(file => file.name.endsWith('.json')).map(async file => {
    const result = await storage.download(`bindings/${file.name}`);
    if (result.error || !result.data) throw new Error('无法读取固定选择，请重试。');
    return JSON.parse(await result.data.text()) as NoteBinding;
  }));
  return bindCCTNotes(rows.map(mapRow), [...bindings, ...overrides]).map(note => ({ scope: 'element', page: '', label: note.title, ...note }));
}
export async function selectNote(binding: NoteBinding): Promise<InspectorNote> {
  const row = await wp(`/${binding.id}`) as CCTRow;
  if (String(row._ID) !== binding.id) throw new Error('所选注释不存在。');
  await storeBinding({ ...binding, locked: true });
  return { ...mapRow(row), ...binding, locked: true };
}
export async function writeNote(note: Omit<InspectorNote, 'updatedAt'> & { create?: boolean | undefined }): Promise<InspectorNote> {
  await configuration();
  const current = await override(note.key);
  let id = note.create ? undefined : note.id || current?.id;
  if (!id && !note.create) {
    const binding = (await configuration()).find(binding => binding.key === note.key);
    id = binding?.id;
  }
  if (!id) {
    const result = await wp('', 'POST', { a55: note.title || note.label, a56: note.text, cct_status: 'publish' }) as number | string | { item_id?: number; _ID?: number };
    id = String(typeof result === 'number' || typeof result === 'string' ? result : result.item_id || result._ID || '');
    if (!/^\d+$/.test(id)) throw new Error('没有返回新注释编号，请重新读取列表，勿重复新建。');
  } else {
    await wp(`/${id}`, 'POST', { a55: note.title || note.label, a56: note.text });
  }
  const row = await wp(`/${id}`) as CCTRow;
  if (row.a56 !== note.text || row.a55 !== (note.title || note.label)) throw new Error('保存后的内容核对不一致。');
  const binding: NoteBinding = { key: note.key, id, scope: note.scope, page: note.page, label: note.label, ...(note.source ? { source: note.source } : {}), locked: true };
  await storeBinding(binding);
  return { ...mapRow(row), ...binding };
}
