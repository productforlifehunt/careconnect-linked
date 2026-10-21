/**
 * Transcribes one short WAV segment of an interview into speaker-labelled
 * sentences (A / B) with Chinese and English text. Buffers the model response
 * so an edge stream closing cannot interrupt a completed model request.
 * Open to anyone viewing the interview page; the researcher's saved
 * instructions for that recording are loaded server-side (never from the caller).
 */
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { isResearcher } from "../_shared/wp-researcher.ts";
import { canReceiveInterviewAudio, interviewDisplaySettings } from "../_shared/interview-display.ts";
import { readWavInfo, wavChunkToMono, wavBase64, SEGMENT_SECONDS } from "../_shared/interview-wav.ts";

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

  let body: { audio?: string; path?: string; segment?: number; previous?: { s: string; zh: string }[] };
  try { body = await req.json(); } catch { return json({ error: "Invalid request" }, 400); }
  let audio = String(body.audio || "");
  const path = String(body.path || "");
  if (!path || path.includes("/") || path.includes("..") || path.length >= 300) return json({ error: "Invalid recording" }, 400);
  const researcher = await isResearcher(req).catch(() => false);
  if (path === "1790784395705_69.wav" && !researcher) return json({ error: "protected" }, 403);

  const store = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!).storage.from("interview-audio");
  const { data: exists } = await store.list("", { search: path, limit: 1 });
  if (!exists?.some((f) => f.name === path)) return json({ error: "Recording not found." }, 404);
  let instructions = "";
  let meta: Record<string, unknown> = {};
  const { data: metaFile } = await store.download(`meta/${path}.json`);
  if (metaFile) { try { meta = JSON.parse(await metaFile.text()); instructions = String(meta.instructions || "").slice(0, 5000); } catch { /* none */ } }
  const display = interviewDisplaySettings(meta);
  if (!researcher && !display.showGenerate) return json({ error: "Generation unavailable" }, 403);
  let total: number | undefined;
  if (body.segment !== undefined) {
    if (!Number.isInteger(body.segment) || body.segment < 0) return json({ error: "Invalid segment" }, 400);
    // This signed address exists only inside this handler. Never return it.
    const { data: signed, error } = await store.createSignedUrl(path, 60);
    if (error || !signed) return json({ error: "Recording not found" }, 404);
    const range = async (start: number, end: number) => {
      const response = await fetch(signed.signedUrl, { headers: { Range: `bytes=${start}-${end}` }, signal: req.signal });
      if (response.status !== 206) throw new Error("Recording range unavailable");
      const buffer = await response.arrayBuffer();
      if (buffer.byteLength > end - start + 1) throw new Error("Invalid recording range");
      return buffer;
    };
    try {
      const info = readWavInfo(await range(0, 65535));
      if (!info || info.channels < 1 || info.sampleRate < 1 || info.blockAlign < 1) return json({ error: "Server transcription requires PCM WAV. The researcher can replace this recording with WAV." }, 400);
      const step = SEGMENT_SECONDS * info.sampleRate * info.blockAlign;
      if (step > 16_000_000) return json({ error: "WAV segment too large" }, 400);
      total = Math.ceil(info.dataSize / step);
      if (body.segment >= total) return json({ error: "Invalid segment" }, 400);
      const start = info.dataOffset + body.segment * step;
      const end = Math.min(info.dataOffset + info.dataSize - 1, start + step - 1);
      audio = wavBase64(wavChunkToMono(await range(start, end), info));
    } catch { return json({ error: "Server could not read this recording segment." }, 502); }
  } else if (!canReceiveInterviewAudio(meta, researcher)) {
    return json({ error: "Server transcription required" }, 403);
  }
  if (audio.length < 60) return json({ error: "Empty audio segment." }, 400);
  if (audio.length > 18_000_000) return json({ error: "Audio segment too large." }, 400);

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

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(`Transcribe failed [${res.status}]: ${detail}`);
    let message = "Transcription failed.";
    if (res.status === 402) message = "AI credits are used up. Add credits in Settings → Plans & credits.";
    else if (res.status === 429) message = "Too many requests — waiting and retrying.";
    else { try { message = JSON.parse(detail)?.error?.message || message; } catch { /* keep */ } }
    return json({ error: message }, res.status);
  }

  const result = await res.json().catch(() => null);
  const content = result?.choices?.[0]?.message?.content;
  if (typeof content !== "string") return json({ error: "The transcription response was incomplete." }, 502);
  return json({ content, ...(total !== undefined ? { total } : {}) });
});
