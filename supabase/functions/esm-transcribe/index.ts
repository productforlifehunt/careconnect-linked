/**
 * ESM survey speech-to-text.
 * The browser records a complete WAV file and posts it here; this function
 * forwards it to Lovable AI and returns the transcript as plain JSON.
 */
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const MAX_BYTES = 20 * 1024 * 1024;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method !== "POST") return json({ error: "Use POST" }, 405);

  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return json({ error: "Speech recognition is not configured." }, 500);

  let audio: File | null = null;
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (file instanceof File) audio = file;
  } catch {
    return json({ error: "Expected a multipart form upload." }, 400);
  }

  if (!audio) return json({ error: "No audio was uploaded." }, 400);
  if (audio.size < 2048) return json({ error: "That recording was empty — please try again." }, 400);
  if (audio.size > MAX_BYTES) return json({ error: "That recording is too long." }, 400);
  if (!audio.type.startsWith("audio/")) return json({ error: "Only audio uploads are accepted." }, 400);

  const upstream = new FormData();
  upstream.append("model", "google/gemini-3.5-transcribe");
  upstream.append("file", audio, "recording.wav");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: upstream,
  });

  const body = await res.text();
  if (!res.ok) {
    console.error(`Transcription failed [${res.status}]: ${body}`);
    return json({ error: "Could not turn that recording into text.", status: res.status, details: body }, res.status);
  }

  let text = "";
  try {
    text = (JSON.parse(body)?.text ?? "").toString();
  } catch {
    text = body;
  }
  return json({ text: text.trim() });
});
