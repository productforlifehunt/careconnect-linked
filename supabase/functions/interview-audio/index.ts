/**
 * Interview recordings (private file storage).
 * Public (anyone with the page): list, play_url, load_archive.
 * Researcher only: upload_url, save_meta, save_archive, delete.
 * Each recording's title / notes / transcription instructions live in meta/<path>.json.
 */
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { isResearcher } from "../_shared/wp-researcher.ts";
import { ARCHIVE_FOLDERS, archiveObjectPath, isArchiveKind, isTextKind, normalizeArchiveLines } from "../_shared/interview-archive.ts";
import { canReceiveInterviewAudio, interviewDisplaySettings, type InterviewDisplaySettings } from "../_shared/interview-display.ts";
import { recordingStreamChunk } from "../_shared/interview-stream.ts";
import { canPreloadInterviewAudio } from "../_shared/interview-demo.ts";

const BUCKET = "interview-audio";
const headers = { ...corsHeaders, "Access-Control-Allow-Headers": `${corsHeaders["Access-Control-Allow-Headers"]}, x-wp-token`, "Access-Control-Expose-Headers": "X-Next-Offset, X-Duration, X-Position, X-Recording-Size", "Cache-Control": "no-store" };
const validPath = (p: string) => !!p && !p.includes("/") && !p.includes("..") && p.length < 300;
// Leaked links: these recordings are disabled for everyone (play, list, archive).
const PROTECTED = new Set<string>();
// Occasional secondary caregivers did not sign the ethics consent: their voice
// must not be played for anyone except the researcher. Transcripts stay public.

export interface Meta extends InterviewDisplaySettings { title: string; notes: string; instructions: string; recruitmentSource: string }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...headers, "Content-Type": "application/json" } });

  let body: { action?: string; name?: string; path?: string; offset?: number; participantId?: string; meta?: Partial<Meta>; lines?: unknown[]; kind?: string; text?: string; names?: Record<string, string> };
  try { body = await req.json(); } catch { return json({ error: "Invalid request" }, 400); }
  if (body.kind !== undefined && !isArchiveKind(body.kind)) return json({ error: "Invalid archive kind" }, 400);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const store = admin.storage.from(BUCKET);
  const readMeta = async (path: string): Promise<Meta> => {
    const { data } = await store.download(`meta/${path}.json`);
    const m = data ? await data.text().then((t) => JSON.parse(t)).catch(() => ({})) : {};
    const meta = { title: String(m.title || ""), notes: String(m.notes || ""), instructions: String(m.instructions || ""), recruitmentSource: String(m.recruitmentSource || "") };
    return { ...meta, ...interviewDisplaySettings({ ...m, title: meta.title }) };
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

  if (body.action === "stream") {
    const path = String(body.path || "");
    const offset = body.offset ?? 0;
    if (!validPath(path)) return json({ error: "Invalid recording" }, 400);
    if (!Number.isSafeInteger(offset) || offset < 0) return json({ error: "Invalid recording offset" }, 400);
    if (locked(path)) return json({ error: "protected", protected: true }, 403);
    if (!canReceiveInterviewAudio(await readMeta(path), researcher)) {
      return json({ error: "Playback unavailable", consent: true }, 403);
    }
    const { data, error } = await store.createSignedUrl(path, 30);
    if (error || !data) return json({ error: "Recording unavailable" }, 404);
    try {
      const part = await recordingStreamChunk(data.signedUrl, offset, req.signal);
      return new Response(part.bytes, { headers: { ...headers, "Content-Type": part.type,
        "X-Next-Offset": part.nextOffset === null ? "end" : String(part.nextOffset),
        "X-Duration": String(part.duration), "X-Position": String(part.position), "X-Recording-Size": String(part.fileSize) } });
    } catch { return json({ error: "Recording stream unavailable" }, 422); }
  }

  if (body.action === "preload_url") {
    const path = String(body.path || "");
    if (!validPath(path)) return json({ error: "Invalid recording" }, 400);
    if (locked(path) || !canPreloadInterviewAudio(path, await readMeta(path), researcher)) {
      return json({ error: "Playback unavailable" }, 403);
    }
    const { data, error } = await store.createSignedUrl(path, 300);
    if (error || !data) return json({ error: "Recording unavailable" }, 404);
    return json({ url: data.signedUrl });
  }

  // Legacy URL actions remain denied; full preload is limited to consented demos.
  if (body.action === "play_url" || body.action === "transcribe_url") {
    return json({ error: "Audio URLs unavailable" }, 403);
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

  if (body.action === "list_participant_meta") {
    const { data, error } = await store.list("participant-meta", { limit: 1000 });
    if (error) return json({ error: error.message }, 500);
    const pairs = await Promise.all((data || []).filter((f) => /^[1-9]\d*\.json$/.test(f.name)).map(async (f) => {
      const { data: file, error: readError } = await store.download(`participant-meta/${f.name}`);
      if (readError || !file) throw new Error("Participant metadata could not be read");
      return [f.name.replace(/\.json$/, ""), await file.text().then((text) => JSON.parse(text))];
    }));
    return json({ items: Object.fromEntries(pairs) });
  }

  if (body.action === "save_participant_meta") {
    const id = String(body.participantId || "");
    if (!/^[1-9]\d*$/.test(id)) return json({ error: "Invalid participant" }, 400);
    const meta = { title: String(body.meta?.title || "").slice(0, 2000), recruitmentSource: String(body.meta?.recruitmentSource || "").slice(0, 5000), notes: String(body.meta?.notes || "").slice(0, 5000) };
    if (!meta.title.trim()) return json({ error: "A title is required" }, 400);
    const { error } = await store.upload(`participant-meta/${id}.json`, new Blob([JSON.stringify(meta)], { type: "application/json" }), { upsert: true, contentType: "application/json" });
    if (error) return json({ error: error.message }, 500);
    return json({ meta });
  }

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

  // Replace the audio file in place (e.g. a denoised version); meta and archives are untouched.
  if (body.action === "replace_url") {
    const path = String(body.path || "");
    if (!validPath(path)) return json({ error: "Invalid recording" }, 400);
    const { data, error } = await store.createSignedUploadUrl(path, { upsert: true });
    if (error) return json({ error: error.message }, 500);
    return json({ path, token: data.token });
  }

  if (body.action === "delete") {
    const path = String(body.path || "");
    if (!validPath(path)) return json({ error: "Invalid recording" }, 400);
    const { error } = await store.remove([path, `meta/${path}.json`, ...Object.keys(ARCHIVE_FOLDERS).map((k) => archiveObjectPath(path, k))]);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  if (body.action === "save_meta") {
    const path = String(body.path || "");
    if (!validPath(path)) return json({ error: "Invalid recording" }, 400);
    const m = { ...await readMeta(path), ...body.meta };
    const meta: Meta = {
      title: String(m.title ?? "").slice(0, 2000),
      recruitmentSource: String(m.recruitmentSource ?? "").slice(0, 5000),
      notes: String(m.notes ?? "").slice(0, 5000),
      instructions: String(m.instructions ?? "").slice(0, 5000),
      ...interviewDisplaySettings(m),
    };
    const blob = new Blob([JSON.stringify(meta)], { type: "application/json" });
    const { error } = await store.upload(`meta/${path}.json`, blob, { upsert: true, contentType: "application/json" });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, meta });
  }

  // Researcher-only: replace personal names in a chunk of edited lines with codes.
  if (body.action === "anonymize") {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "Anonymization is not configured." }, 500);
    if (!Array.isArray(body.lines) || !body.lines.length || body.lines.length > 150) return json({ error: "Invalid lines" }, 400);
    const input = normalizeArchiveLines(body.lines);
    const names = body.names && typeof body.names === "object" ? body.names : {};
    const prompt = `You anonymize lines of a research interview transcript for a paper appendix.
Replace every personal name (Chinese or English, full names, surnames with titles, nicknames) with an anonymous code. Reuse the existing mapping exactly; give new people new codes like "[Person 1]" in en and "[人物1]" in zh (same number in both).
If a sentence states someone's name (e.g. "my husband is Wang Jun" / "我丈夫是王军"), remove the name and keep only the relationship ("my husband" / "我丈夫").
Also replace identifying workplaces, hospitals, schools, street addresses and phone numbers with "[place]" / "[地点]".
Change nothing else: keep wording, order and the number of lines exactly the same.
Respond with JSON only: {"lines":[{"zh":"...","en":"..."}],"names":{"original name":"code"}}`;
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key, Authorization: `Bearer ${key}`, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: `Existing mapping: ${JSON.stringify(names)}\nLines:\n${JSON.stringify(input.map(({ zh, en }) => ({ zh, en })))}` },
        ],
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`Anonymize failed [${res.status}]: ${detail}`);
      return json({ error: res.status === 402 ? "AI credits are used up." : res.status === 429 ? "Too many requests" : "Anonymization failed." }, res.status);
    }
    const content = String((await res.json().catch(() => null))?.choices?.[0]?.message?.content || "");
    let parsed: { lines?: { zh?: string; en?: string }[]; names?: Record<string, string> } = {};
    try { parsed = JSON.parse((content.match(/\{[\s\S]*\}/) || [content])[0]); } catch { /* checked below */ }
    const out = parsed.lines;
    if (!Array.isArray(out) || out.length !== input.length) return json({ error: "Anonymization returned a different number of lines." }, 502);
    return json({
      lines: input.map((line, i) => ({ ...line, zh: String(out[i]?.zh ?? ""), en: String(out[i]?.en ?? "") })),
      names: { ...names, ...(parsed.names && typeof parsed.names === "object" ? parsed.names : {}) },
    });
  }

  if (body.action === "save_archive") {
    const path = String(body.path || "");
    if (!validPath(path)) return json({ error: "Invalid recording" }, 400);
    if (isTextKind(body.kind)) {
      const text = String(body.text || "").slice(0, 5_000_000);
      if (!text.trim()) return json({ error: "The transcript archive cannot be empty." }, 400);
      const archive = { lines: [], text, savedAt: new Date().toISOString() };
      const { error } = await store.upload(archiveObjectPath(path, body.kind), new Blob([JSON.stringify(archive)], { type: "application/json" }), { upsert: true, contentType: "application/json" });
      if (error) return json({ error: error.message }, 500);
      return json({ archive });
    }
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
