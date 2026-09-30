/**
 * Transcribes one short WAV segment of an interview into speaker-labelled
 * sentences (A / B) with Chinese and English text. Streams the model output.
 */
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { isResearcher } from "../_shared/wp-researcher.ts";

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

  if (!(await isResearcher(req))) return json({ error: "Only the researcher account can transcribe interviews." }, 403);
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return json({ error: "Transcription is not configured." }, 500);

  let body: { audio?: string; previous?: { s: string; zh: string }[] };
  try { body = await req.json(); } catch { return json({ error: "Invalid request" }, 400); }
  const audio = String(body.audio || "");
  if (audio.length < 3000) return json({ error: "Empty audio segment." }, 400);
  if (audio.length > 18_000_000) return json({ error: "Audio segment too large." }, 400);
  const previous = (Array.isArray(body.previous) ? body.previous : []).slice(-8)
    .map((l) => `${l.s === "B" ? "B" : "A"}: ${String(l.zh || "").slice(0, 300)}`).join("\n");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    signal: req.signal,
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key, Authorization: `Bearer ${key}`, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: PROMPT },
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
