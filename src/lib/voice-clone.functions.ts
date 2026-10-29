import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Aliyun Bailian (DashScope) voice cloning + synthesis. One cheap model for both. */
const BASE = "https://dashscope.aliyuncs.com/api/v1";
export const VOICE_CLONE_MODEL = "qwen-audio-3.1-tts-flash";

function key() {
  const k = process.env["DASHSCOPE_API_KEY"];
  if (!k) throw new Error("DASHSCOPE_API_KEY is not configured");
  return k;
}

async function enroll(input: Record<string, unknown>) {
  const res = await fetch(`${BASE}/services/audio/tts/customization`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "voice-enrollment", input }),
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`[${res.status}] ${json.message || json.code || "voice request failed"}`);
  return json.output || {};
}

export const createClonedVoice = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ audioBase64: z.string().min(1000).max(14_000_000), mime: z.string().max(40) }).parse(d))
  .handler(async ({ data }) => {
    const out = await enroll({
      action: "create_voice",
      target_model: VOICE_CLONE_MODEL,
      prefix: "family",
      audio: `data:${data.mime || "audio/wav"};base64,${data.audioBase64}`,
    });
    const voiceId = String(out.voice_id || "");
    if (!voiceId) throw new Error("No voice was created");
    for (let i = 0; i < 20; i++) {
      const q = await enroll({ action: "query_voice", voice_id: voiceId });
      if (q.status === "OK") return { voiceId };
      if (q.status && q.status !== "DEPLOYING") throw new Error(`Voice status: ${q.status}`);
      await new Promise((r) => setTimeout(r, 1000));
    }
    return { voiceId };
  });

export const deleteClonedVoice = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ voiceId: z.string().min(5).max(200) }).parse(d))
  .handler(async ({ data }) => {
    await enroll({ action: "delete_voice", voice_id: data.voiceId });
    return { ok: true };
  });

/** Speaks text in a cloned voice; returns MP3 as base64 (Aliyun's result URL is plain http). */
export const speakClonedVoice = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ voiceId: z.string().min(5).max(200), text: z.string().min(1).max(2000) }).parse(d))
  .handler(async ({ data }) => {
    const res = await fetch(`${BASE}/services/audio/tts/SpeechSynthesizer`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: VOICE_CLONE_MODEL, input: { text: data.text, voice: data.voiceId, format: "mp3" } }),
    });
    const json: any = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`[${res.status}] ${json.message || json.code || "speech failed"}`);
    const url = json.output?.audio?.url;
    if (!url) throw new Error("No audio returned");
    const audio = await fetch(String(url).replace(/^http:/, "https:"));
    if (!audio.ok) throw new Error(`Audio download failed [${audio.status}]`);
    const buf = new Uint8Array(await audio.arrayBuffer());
    let bin = "";
    for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    return { audioBase64: btoa(bin) };
  });
