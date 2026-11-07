import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/family-voice-models-BvOL_Vgu.js
var family_voice_models_exports = /* @__PURE__ */ __exportAll({
	DEFAULT_FAMILY_VOICE_MODEL: () => DEFAULT_FAMILY_VOICE_MODEL,
	VOICE_MIN_RECORDING_SECONDS: () => 10,
	VOICE_RECORDING_SECONDS: () => 60,
	resolveFamilyVoiceModel: () => resolveFamilyVoiceModel
});
/** New enrollments always use the default model. Legacy model IDs stay resolvable so previously enrolled voices keep synthesizing with the exact model their voice was cloned under — provider voice IDs cannot cross models. Model names and prices are never shown to users. */
var DEFAULT_FAMILY_VOICE_MODEL = "qwen-audio-3.1-tts-flash";
var FAMILY_VOICE_MODEL_IDS = [
	DEFAULT_FAMILY_VOICE_MODEL,
	"cosyvoice-v3.5-flash",
	"qwen-audio-3.0-tts-flash",
	"cosyvoice-v3-flash",
	"qwen-audio-3.1-tts-plus",
	"qwen-audio-3.0-tts-plus",
	"cosyvoice-v3.5-plus",
	"cosyvoice-v3-plus",
	"cosyvoice-v2"
];
function resolveFamilyVoiceModel(model) {
	if (FAMILY_VOICE_MODEL_IDS.includes(model || "qwen-audio-3.1-tts-flash")) return model || "qwen-audio-3.1-tts-flash";
	throw new Error("Unsupported family voice model");
}
//#endregion
export { family_voice_models_exports as n, resolveFamilyVoiceModel as r, DEFAULT_FAMILY_VOICE_MODEL as t };
