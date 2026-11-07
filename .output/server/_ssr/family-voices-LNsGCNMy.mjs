import "../_runtime.mjs";
import { l as createServerFn } from "./createServerFn-Be1RckzI.mjs";
import { r as resolveFamilyVoiceModel, t as DEFAULT_FAMILY_VOICE_MODEL } from "./family-voice-models-BvOL_Vgu.mjs";
import { t as createSsrRpc } from "./createSsrRpc-DWUsQYVr.mjs";
import { a as objectType, o as stringType, r as enumType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/family-voices-LNsGCNMy.js
var input = objectType({
	action: enumType([
		"list",
		"create",
		"import",
		"rename",
		"delete",
		"speak",
		"original",
		"retry"
	]),
	caredOneId: stringType().regex(/^\d+$/).optional(),
	id: stringType().regex(/^\d+$/).optional(),
	label: stringType().trim().min(1).max(120).optional(),
	voiceId: stringType().min(5).max(200).optional(),
	model: stringType().transform(resolveFamilyVoiceModel).optional(),
	audioBase64: stringType().min(1e3).max(14e6).optional(),
	mime: enumType([
		"audio/wav",
		"audio/mpeg",
		"audio/mp4"
	]).optional(),
	text: stringType().trim().min(1).max(2e3).optional()
});
var familyVoiceAction = createServerFn({ method: "POST" }).inputValidator((data) => input.parse(data)).handler(createSsrRpc("ca1f8a9e8361ca9963078f940ce58a9c2b0e44bc15e0f6f3c80362529fd8907c"));
var KEY = "family-voices-v1";
var EVT = "family-voices-changed";
function listFamilyVoices(caredOneId) {
	try {
		const all = JSON.parse(localStorage.getItem(KEY) || "[]");
		return caredOneId ? all.filter((v) => v.caredOneId === caredOneId) : all;
	} catch {
		return [];
	}
}
function onFamilyVoicesChanged(cb) {
	window.addEventListener(EVT, cb);
	window.addEventListener("storage", cb);
	return () => {
		window.removeEventListener(EVT, cb);
		window.removeEventListener("storage", cb);
	};
}
/** Local records remain untouched until an explicit import; server lists never fall back to them. */
async function loadSavedFamilyVoices(caredOneId) {
	const result = await familyVoiceAction({ data: {
		action: "list",
		...caredOneId ? { caredOneId } : {}
	} });
	if (!("voices" in result) || !result.voices) throw new Error("Voices could not be loaded");
	return result.voices;
}
function notifyFamilyVoicesChanged() {
	window.dispatchEvent(new Event(EVT));
}
async function saveFamilyVoiceRecording(caredOneId, label, blob, model = DEFAULT_FAMILY_VOICE_MODEL) {
	const result = await familyVoiceAction({ data: {
		action: "create",
		caredOneId,
		label,
		audioBase64: await blobToBase64(blob),
		mime: "audio/wav",
		model
	} });
	notifyFamilyVoicesChanged();
	if (!("voice" in result) || !result.voice) throw new Error("Voice record was not returned");
	return result.voice;
}
async function updateSavedFamilyVoice(action, v, label) {
	const result = await familyVoiceAction({ data: {
		action,
		id: v.id,
		caredOneId: v.caredOneId,
		...label ? { label } : {}
	} });
	notifyFamilyVoicesChanged();
	return result;
}
async function importLocalFamilyVoices(caredOneId) {
	for (const v of listFamilyVoices(caredOneId)) await familyVoiceAction({ data: {
		action: "import",
		caredOneId,
		label: v.label,
		voiceId: v.voiceId,
		...v.model ? { model: v.model } : {}
	} });
	notifyFamilyVoicesChanged();
}
async function savedVoiceAudio(v, text) {
	const result = await familyVoiceAction({ data: {
		action: text === void 0 ? "original" : "speak",
		caredOneId: v.caredOneId,
		id: v.id,
		...text === void 0 ? {} : { text }
	} });
	if (!("audioBase64" in result) || !result.audioBase64) throw new Error("No audio returned");
	return {
		audioBase64: result.audioBase64,
		mime: "mime" in result ? result.mime : "audio/mpeg"
	};
}
async function blobToBase64(blob) {
	const buf = new Uint8Array(await blob.arrayBuffer());
	let bin = "";
	for (let i = 0; i < buf.length; i += 32768) bin += String.fromCharCode(...buf.subarray(i, i + 32768));
	return btoa(bin);
}
function playBase64Mp3(b64) {
	const a = new Audio(`data:audio/mpeg;base64,${b64}`);
	a.volume = 1;
	a.play();
	return a;
}
//#endregion
export { playBase64Mp3 as a, updateSavedFamilyVoice as c, onFamilyVoicesChanged as i, listFamilyVoices as n, saveFamilyVoiceRecording as o, loadSavedFamilyVoices as r, savedVoiceAudio as s, importLocalFamilyVoices as t };
