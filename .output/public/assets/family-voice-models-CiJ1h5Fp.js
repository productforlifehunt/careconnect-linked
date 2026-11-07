var e=`/** New enrollments always use the default model. Legacy model IDs stay resolvable so previously enrolled voices keep synthesizing with the exact model their voice was cloned under — provider voice IDs cannot cross models. Model names and prices are never shown to users. */
export const DEFAULT_FAMILY_VOICE_MODEL = "qwen-audio-3.1-tts-flash";
const FAMILY_VOICE_MODEL_IDS = [
  DEFAULT_FAMILY_VOICE_MODEL,
  "cosyvoice-v3.5-flash",
  "qwen-audio-3.0-tts-flash",
  "cosyvoice-v3-flash",
  "qwen-audio-3.1-tts-plus",
  "qwen-audio-3.0-tts-plus",
  "cosyvoice-v3.5-plus",
  "cosyvoice-v3-plus",
  "cosyvoice-v2",
] as const;
export const FAMILY_VOICE_MODELS = FAMILY_VOICE_MODEL_IDS;
export type FamilyVoiceModel = typeof FAMILY_VOICE_MODEL_IDS[number];
export function resolveFamilyVoiceModel(model?: string): FamilyVoiceModel {
  if (FAMILY_VOICE_MODEL_IDS.includes((model || DEFAULT_FAMILY_VOICE_MODEL) as FamilyVoiceModel)) return (model || DEFAULT_FAMILY_VOICE_MODEL) as FamilyVoiceModel;
  throw new Error("Unsupported family voice model");
}
export const VOICE_RECORDING_SECONDS = 60;
export const VOICE_MIN_RECORDING_SECONDS = 10;
`;export{e as default};