/**
 * Cloned family voices, kept on this device only (for now), each belonging to a cared one.
 */
import type { FamilyVoiceModel } from "@/lib/family-voice-models";
export type FamilyVoice = { id: string; voiceId: string; model?: FamilyVoiceModel; label: string; caredOneId: string; caredOneName: string; createdAt: string };

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
