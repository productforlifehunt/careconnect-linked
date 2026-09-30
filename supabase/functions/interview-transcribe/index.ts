/**
 * Transcribes one short WAV segment of an interview into speaker-labelled
 * sentences (A / B) with Chinese and English text. Streams the model output.
 * Open to anyone viewing the interview page; the researcher's saved
 * instructions for that recording are loaded server-side (never from the caller).
 */
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const MODEL = "google/gemini-3.8-flash";
const headers = { ...corsHeaders, "Access-Control-Allow-Headers": `${corsHeaders["Access-Control-Allow-Headers"]}, x-wp-token` };

const PROMPT = `You transcribe one segment of a research interview recording between two people.
Label the speakers "A" and "B". A is the interviewer (the person asking the questions); B is the interviewee.
Transcribe EVERY utterance in order, sentence by sentence, without summarising, skipping or inventing anything.
For each sentence give "zh" (the Chinese text: verbatim if spoken in Chinese, otherwise a faithful Chinese translation) and "en" (verbatim if spoken in English, otherwise a faithful English translation).
If the segment has no speech, return an empty list.
Respond with JSON only, exactly: {"lines":[{"s":"A","zh":"...","en":"..."}]}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...headers, "Content-Type": "application/json" } });

  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return json({ error: "Transcription is not configured." }, 500);

  let body: { audio?: string; path?: string; previous?: { s: string; zh: string }[] };
  try { body = await req.json(); } catch { return json({ error: "Invalid request" }, 400); }
  const audio = String(body.audio || "");
  if (audio.length < 3000) return json({ error: "Empty audio segment." }, 400);
  if (audio.length > 18_000_000) return json({ error: "Audio segment too large." }, 400);
  const path = String(body.path || "");
  if (!path || path.includes("/") || path.includes("..")) return json({ error: "Invalid recording" }, 400);

  const store = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!).storage.from("interview-audio");
  const { data: exists } = await store.list("", { search: path, limit: 1 });
  if (!exists?.some((f) => f.name === path)) return json({ error: "Recording not found." }, 404);
  let instructions = "";
  const { data: metaFile } = await store.download(`meta/${path}.json`);
  if (metaFile) { try { instructions = String(JSON.parse(await metaFile.text())?.instructions || "").slice(0, 5000); } catch { /* none */ } }

  const previous = (Array.isArray(body.previous) ? body.previous : []).slice(-8)
    .map((l) => `${l.s === "B" ? "B" : "A"}: ${String(l.zh || "").slice(0, 300)}`).join("\n");
  const system = instructions
    ? `${PROMPT}\n\nAdditional instructions from the researcher for this recording (follow them, but never invent content):\n${instructions}`
    : PROMPT;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    signal: req.signal,
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key, Authorization: `Bearer ${key}`, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: [
            { type: "text", text: previous ? `The previous segment ended with (keep the same A/B labels):\n${previous}` : "This is the first segment." },
            { type: "input_audio", input_audio: { data: audio, format: "wav" } },
          ],
        },
      ],
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    console.error(`Transcribe failed [${res.status}]: ${detail}`);
    let message = "Transcription failed.";
    if (res.status === 402) message = "AI credits are used up. Add credits in Settings → Plans & credits.";
    else if (res.status === 429) message = "Too many requests — waiting and retrying.";
    else { try { message = JSON.parse(detail)?.error?.message || message; } catch { /* keep */ } }
    return json({ error: message }, res.status);
  }

  const out = new Headers({ ...headers, "Content-Type": "text/event-stream" });
  res.headers.forEach((v, k) => { if (k.toLowerCase().startsWith("x-lovable-aig-")) out.set(k, v); });
  return new Response(res.body, { headers: out });
});
