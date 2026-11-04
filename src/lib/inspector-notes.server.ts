import { createClient } from "@supabase/supabase-js";

/** Researcher manual notes for inspected elements/pages: one private JSON file per scope key. */
const BUCKET = "inspector-notes";
export interface InspectorNote { key: string; scope: "element" | "page"; page: string; label: string; text: string; updatedAt: string; source?: { file: string; line: number; endLine: number; tag: string; digest: string } }

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
export async function readAllNotes(): Promise<InspectorNote[]> {
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

export async function writeNote(note: Omit<InspectorNote, "updatedAt">): Promise<InspectorNote> {
  const full: InspectorNote = { ...note, updatedAt: new Date().toISOString() };
  const path = `notes/${await hash(note.key)}.json`;
  const { error } = await client().storage.from(BUCKET).upload(path, new Blob([JSON.stringify(full)], { type: "application/json" }), { upsert: true, contentType: "application/json" });
  if (error) throw new Error("注释没有保存成功 / The note was not saved.");
  const all = (await readAllNotes()).filter((n) => !n.source && n.key !== full.key); all.push(full);
  const r = await client().storage.from(BUCKET).upload(ALL, new Blob([JSON.stringify(all)], { type: "application/json" }), { upsert: true, contentType: "application/json" });
  if (r.error) throw new Error("注释没有保存成功 / The note was not saved.");
  return full;
}
