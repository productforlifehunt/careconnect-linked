import { resolveFamilyVoiceModel } from "@/lib/family-voice-models";
const BASE = "https://dashscope.aliyuncs.com/api/v1";
async function enrollment(key: string, input: Record<string, unknown>) {
  const res = await fetch(`${BASE}/services/audio/tts/customization`, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "voice-enrollment", input }) });
  const json = await res.json() as { message?: string; code?: string; output?: { voice_id?: string; status?: string } };
  if (!res.ok) throw new Error(`[${res.status}] ${json.message || json.code || "Voice request failed"}`);
  return json.output || {};
}
export async function enrollVoice(key: string, base64: string, mime: string, model: string, onCreated: (id: string) => Promise<void>) {
  const out = await enrollment(key, { action: "create_voice", target_model: resolveFamilyVoiceModel(model), prefix: "family", audio: `data:${mime};base64,${base64}` });
  if (!out.voice_id) throw new Error("No voice was created");
  const id = out.voice_id;
  await onCreated(id);
  for (let i = 0; i < 20; i++) {
    const q = await enrollment(key, { action: "query_voice", voice_id: id });
    if (q.status === "OK") return id;
    if (q.status && q.status !== "DEPLOYING") throw new Error(`Voice status: ${q.status}`);
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Voice is still deploying. Retry using the saved recording.");
}
export async function deleteVoice(key: string, id: string) { await enrollment(key, { action: "delete_voice", voice_id: id }); }
export async function synthesizeVoice(key: string, id: string, model: string, text: string) {
  const response = await fetch(`${BASE}/services/audio/tts/SpeechSynthesizer`, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: resolveFamilyVoiceModel(model), input: { text, voice: id, format: "mp3" } }) });
  const json = await response.json() as { message?: string; code?: string; output?: { audio?: { url?: string } } };
  if (!response.ok) throw new Error(`[${response.status}] ${json.message || json.code || "Speech failed"}`);
  const url = json.output?.audio?.url;
  if (!url) throw new Error("No audio returned");
  const audio = await fetch(url.replace(/^http:/, "https:"));
  if (!audio.ok) throw new Error("Audio download failed");
  return { audioBase64: bytesToBase64(new Uint8Array(await audio.arrayBuffer())) };
}
export function bytesToBase64(buf: Uint8Array): string {
  let bin = ""; for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(bin);
}