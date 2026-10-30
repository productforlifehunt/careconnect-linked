/**
 * Server-persisted family voices plus untouched legacy device-local imports.
 */
import type { FamilyVoiceModel } from "@/lib/family-voice-models";
import { familyVoiceAction } from "@/lib/family-voice.functions";
export type FamilyVoice = { id: string; voiceId: string; model?: FamilyVoiceModel; label: string; caredOneId: string; caredOneName: string; createdAt: string; audioSaved?: boolean; state?: string; error?: string };

const KEY = "family-voices-v1";
const EVT = "family-voices-changed";

export function listFamilyVoices(caredOneId?: string | undefined): FamilyVoice[] {
  try {
    const all: FamilyVoice[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    return caredOneId ? all.filter((v) => v.caredOneId === caredOneId) : all;
  } catch { return []; }
}

function save(all: FamilyVoice[]) {
  localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(EVT));
}

export function addFamilyVoice(v: FamilyVoice) { save([...listFamilyVoices(), v]); }
export function removeFamilyVoice(id: string) { save(listFamilyVoices().filter((v) => v.id !== id)); }
export function renameFamilyVoice(id: string, label: string) {
  const name = label.trim();
  if (!name) return;
  save(listFamilyVoices().map((v) => v.id === id ? { ...v, label: name } : v));
}
export function onFamilyVoicesChanged(cb: () => void) {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(EVT, cb); window.removeEventListener("storage", cb); };
}

/** Local records remain untouched until an explicit import; server lists never fall back to them. */
export async function loadSavedFamilyVoices(caredOneId?: string): Promise<FamilyVoice[]> {
  const result = await familyVoiceAction({ data: { action: "list", ...(caredOneId ? { caredOneId } : {}) } });
  if (!("voices" in result) || !result.voices) throw new Error("Voices could not be loaded");
  return result.voices as FamilyVoice[];
}
export function notifyFamilyVoicesChanged() { window.dispatchEvent(new Event(EVT)); }
export async function saveFamilyVoiceRecording(caredOneId: string, label: string, blob: Blob, model: FamilyVoiceModel) {
  const result = await familyVoiceAction({ data: { action: "create", caredOneId, label, audioBase64: await blobToBase64(blob), mime: "audio/wav", model } });
  notifyFamilyVoicesChanged();
  if (!("voice" in result) || !result.voice) throw new Error("Voice record was not returned");
  return result.voice;
}
export async function updateSavedFamilyVoice(action: "rename" | "delete" | "retry", v: FamilyVoice, label?: string) {
  const result = await familyVoiceAction({ data: { action, id: v.id, caredOneId: v.caredOneId, ...(label ? { label } : {}) } });
  notifyFamilyVoicesChanged(); return result;
}
export async function importLocalFamilyVoices(caredOneId: string) {
  for (const v of listFamilyVoices(caredOneId)) await familyVoiceAction({ data: { action: "import", caredOneId, label: v.label, voiceId: v.voiceId, ...(v.model ? { model: v.model } : {}) } });
  notifyFamilyVoicesChanged();
}
export async function savedVoiceAudio(v: FamilyVoice, text?: string) {
  const result = await familyVoiceAction({ data: { action: text === undefined ? "original" : "speak", caredOneId: v.caredOneId, id: v.id, ...(text === undefined ? {} : { text }) } });
  if (!("audioBase64" in result) || !result.audioBase64) throw new Error("No audio returned");
  return { audioBase64: result.audioBase64, mime: "mime" in result ? result.mime : "audio/mpeg" };
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(bin);
}

export function playBase64Mp3(b64: string): HTMLAudioElement {
  const a = new Audio(`data:audio/mpeg;base64,${b64}`);
  void a.play();
  return a;
}
