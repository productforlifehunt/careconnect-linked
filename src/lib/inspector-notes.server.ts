import { createClient } from "@supabase/supabase-js";

/** Researcher manual notes for inspected elements/pages: one private JSON file per scope key. */
const BUCKET = "inspector-notes";
export interface InspectorNote { key: string; scope: "element" | "page"; page: string; label: string; text: string; updatedAt: string }

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
  if (error || !data) return [];
  try { return (JSON.parse(await data.text()) as InspectorNote[]).filter((n) => n.text.trim().length > 0); } catch { return []; }
}

export async function writeNote(note: Omit<InspectorNote, "updatedAt">): Promise<InspectorNote> {
  const full: InspectorNote = { ...note, updatedAt: new Date().toISOString() };
  const path = `notes/${await hash(note.key)}.json`;
  const { error } = await client().storage.from(BUCKET).upload(path, new Blob([JSON.stringify(full)], { type: "application/json" }), { upsert: true, contentType: "application/json" });
  if (error) throw new Error("注释没有保存成功 / The note was not saved.");
  const all = (await readAllNotes()).filter((n) => n.key !== full.key); all.push(full);
  const r = await client().storage.from(BUCKET).upload(ALL, new Blob([JSON.stringify(all)], { type: "application/json" }), { upsert: true, contentType: "application/json" });
  if (r.error) throw new Error("注释没有保存成功 / The note was not saved.");
  return full;
}
