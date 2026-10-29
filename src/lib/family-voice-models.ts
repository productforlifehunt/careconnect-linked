/** Beijing list prices checked against Alibaba's official catalog on 2026-10-29. */
export const DEFAULT_FAMILY_VOICE_MODEL = "qwen-audio-3.1-tts-flash";
export const FAMILY_VOICE_MODELS = [
  { id: "cosyvoice-v3.5-flash", name: "CosyVoice 3.5 Flash", price: 0.8, tier: "flash" },
  { id: "qwen-audio-3.0-tts-flash", name: "Qwen-Audio 3.0 Flash", price: 1, tier: "flash" },
  { id: "cosyvoice-v3-flash", name: "CosyVoice 3 Flash", price: 1, tier: "flash" },
  { id: "qwen-audio-3.1-tts-plus", name: "Qwen-Audio 3.1 Plus", price: 1.4, tier: "plus" },
  { id: "qwen-audio-3.0-tts-plus", name: "Qwen-Audio 3.0 Plus", price: 1.4, tier: "plus" },
  { id: "cosyvoice-v3.5-plus", name: "CosyVoice 3.5 Plus", price: 1.5, tier: "plus" },
  { id: "cosyvoice-v3-plus", name: "CosyVoice 3 Plus", price: 2, tier: "plus" },
  { id: "cosyvoice-v2", name: "CosyVoice 2", price: 2, tier: "legacy" },
  { id: DEFAULT_FAMILY_VOICE_MODEL, name: "Qwen-Audio 3.1 Flash", price: null, tier: "flash" },
] as const;
export type FamilyVoiceModel = typeof FAMILY_VOICE_MODELS[number]["id"];
export function resolveFamilyVoiceModel(model?: string): FamilyVoiceModel {
  const match = FAMILY_VOICE_MODELS.find((item) => item.id === (model || DEFAULT_FAMILY_VOICE_MODEL));
  if (!match) throw new Error("Unsupported family voice model");
  return match.id;
}
export function familyVoiceModelName(model?: string) {
  return FAMILY_VOICE_MODELS.find((item) => item.id === resolveFamilyVoiceModel(model))?.name || "";
}
export const VOICE_RECORDING_SECONDS = 20;
export const VOICE_MIN_RECORDING_SECONDS = 10;
export const FAMILY_VOICE_PRICE_SOURCE = "https://help.aliyun.com/zh/model-studio/model-pricing";
export const FAMILY_VOICE_CLONE_SOURCE = "https://help.aliyun.com/zh/model-studio/voice-cloning-user-guide";