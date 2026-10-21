/**
 * Interview recordings (private file storage).
 * Public (anyone with the page): list, play_url, load_archive.
 * Researcher only: upload_url, save_meta, save_archive, delete.
 * Each recording's title / notes / transcription instructions live in meta/<path>.json.
 */
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { isResearcher } from "../_shared/wp-researcher.ts";
import { archiveObjectPath, normalizeArchiveLines } from "../_shared/interview-archive.ts";

const BUCKET = "interview-audio";
const headers = { ...corsHeaders, "Access-Control-Allow-Headers": `${corsHeaders["Access-Control-Allow-Headers"]}, x-wp-token` };
const validPath = (p: string) => !!p && !p.includes("/") && !p.includes("..") && p.length < 300;
// Leaked links: these recordings are disabled for everyone (play, list, archive).
const PROTECTED = new Set(["1790784395705_69.wav"]);
// Occasional secondary caregivers did not sign the ethics consent: their voice
// must not be played for anyone except the researcher. Transcripts stay public.
const OCCASIONAL_SECONDARY = /^occasional\s+secondary\s+caregiver/i;

export interface Meta { title: string; notes: string; instructions: string }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...headers, "Content-Type": "application/json" } });

  let body: { action?: string; name?: string; path?: string; meta?: Partial<Meta>; lines?: unknown[]; kind?: "raw" | "edited" };
  try { body = await req.json(); } catch { return json({ error: "Invalid request" }, 400); }
  if (body.kind !== undefined && body.kind !== "raw" && body.kind !== "edited") return json({ error: "Invalid archive kind" }, 400);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const store = admin.storage.from(BUCKET);
  const readMeta = async (path: string): Promise<Meta> => {
    const { data } = await store.download(`meta/${path}.json`);
    const m = data ? await data.text().then((t) => JSON.parse(t)).catch(() => ({})) : {};
    return { title: String(m.title || ""), notes: String(m.notes || ""), instructions: String(m.instructions || "") };
  };

  const researcher = await isResearcher(req).catch(() => false);
  const locked = (p: string) => PROTECTED.has(p) && !researcher;

  if (body.action === "list") {
    const { data, error } = await store.list("", { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
    if (error) return json({ error: error.message }, 500);
    const files = (data || []).filter((f) => f.id && !locked(f.name));
    const metas = await Promise.all(files.map((f) => readMeta(f.name)));
    return json({
      items: files.map((f, i) => ({
        path: f.name,
        size: (f.metadata as any)?.size ?? 0,
        type: (f.metadata as any)?.mimetype ?? "",
        created: f.created_at,
        meta: metas[i],
      })),
    });
  }

  if (body.action === "play_url") {
    const path = String(body.path || "");
    if (!validPath(path)) return json({ error: "Invalid recording" }, 400);
    if (locked(path)) return json({ error: "protected", protected: true }, 403);
    if (!researcher && OCCASIONAL_SECONDARY.test((await readMeta(path)).title)) {
      return json({ error: "This participant did not sign the ethics consent, so only the researcher can play this recording. / 该参与者未签署伦理协议，录音仅供研究者播放。", consent: true }, 403);
    }
    const { data, error } = await store.createSignedUrl(path, 60 * 60 * 6);
    if (error) return json({ error: error.message }, 404);
    return json({ url: data.signedUrl });
  }

  // Transcription needs the audio bytes; this short-lived URL keeps transcript
  // generation working for everyone without exposing a long-lived play link.
  if (body.action === "transcribe_url") {
    const path = String(body.path || "");
    if (!validPath(path)) return json({ error: "Invalid recording" }, 400);
    if (locked(path)) return json({ error: "protected", protected: true }, 403);
    const { data, error } = await store.createSignedUrl(path, 60 * 15);
    if (error) return json({ error: error.message }, 404);
    return json({ url: data.signedUrl });
  }

  if (body.action === "load_archive") {
    const path = String(body.path || "");
    if (!validPath(path)) return json({ error: "Invalid recording" }, 400);
    if (locked(path)) return json({ error: "protected", protected: true }, 403);
    const { data, error } = await store.download(archiveObjectPath(path, body.kind));
    if (error || !data) return json({ archive: null });
    const archive = await data.text().then((text) => JSON.parse(text)).catch(() => null);
    return json({ archive });
  }

  if (!researcher) return json({ error: "Only the researcher can add or edit recordings." }, 403);

  if (body.action === "upload_url") {
    const name = String(body.name || "").trim();
    if (!name || name.length > 200) return json({ error: "A file name is required." }, 400);
    // Storage keys must be ASCII: strip non-ASCII chars, keep extension.
    const ext = (name.match(/\.[A-Za-z0-9]{1,8}$/) || [""])[0];
    let safe = name.replace(/\.[^.]+$/, "").replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);
    if (!safe) safe = "recording";
    const path = `${Date.now()}_${safe}${ext}`;
    const { data, error } = await store.createSignedUploadUrl(path);
    if (error) return json({ error: error.message }, 500);
    return json({ path, token: data.token });
  }

  if (body.action === "delete") {
    const path = String(body.path || "");
    if (!validPath(path)) return json({ error: "Invalid recording" }, 400);
    const { error } = await store.remove([path, `meta/${path}.json`, archiveObjectPath(path), archiveObjectPath(path, "edited")]);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  if (body.action === "save_meta") {
    const path = String(body.path || "");
    if (!validPath(path)) return json({ error: "Invalid recording" }, 400);
    const m = body.meta || {};
    const meta: Meta = {
      title: String(m.title ?? "").slice(0, 200),
      notes: String(m.notes ?? "").slice(0, 5000),
      instructions: String(m.instructions ?? "").slice(0, 5000),
    };
    const blob = new Blob([JSON.stringify(meta)], { type: "application/json" });
    const { error } = await store.upload(`meta/${path}.json`, blob, { upsert: true, contentType: "application/json" });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, meta });
  }

  if (body.action === "save_archive") {
    const path = String(body.path || "");
    if (!validPath(path)) return json({ error: "Invalid recording" }, 400);
    if (!Array.isArray(body.lines) || body.lines.length > 20_000) return json({ error: "Invalid transcript archive" }, 400);
    const lines = normalizeArchiveLines(body.lines);
    if (!lines.length) return json({ error: "The transcript archive cannot be empty." }, 400);
    const archive = { lines, savedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(archive)], { type: "application/json" });
    const { error } = await store.upload(archiveObjectPath(path, body.kind), blob, { upsert: true, contentType: "application/json" });
    if (error) return json({ error: error.message }, 500);
    return json({ archive });
  }

  return json({ error: "Unknown action" }, 400);
});
