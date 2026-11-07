import "../_runtime.mjs";
import { r as resolveFamilyVoiceModel } from "./family-voice-models-BvOL_Vgu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/provider.server-CerZpRIt.js
var BASE = "https://dashscope.aliyuncs.com/api/v1";
async function enrollment(key, input) {
	const res = await fetch(`${BASE}/services/audio/tts/customization`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${key}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			model: "voice-enrollment",
			input
		})
	});
	const json = await res.json();
	if (!res.ok) throw new Error(`[${res.status}] ${json.message || json.code || "Voice request failed"}`);
	return json.output || {};
}
async function enrollVoice(key, base64, mime, model, onCreated) {
	const out = await enrollment(key, {
		action: "create_voice",
		target_model: resolveFamilyVoiceModel(model),
		prefix: "family",
		audio: `data:${mime};base64,${base64}`
	});
	if (!out.voice_id) throw new Error("No voice was created");
	const id = out.voice_id;
	await onCreated(id);
	for (let i = 0; i < 20; i++) {
		const q = await enrollment(key, {
			action: "query_voice",
			voice_id: id
		});
		if (q.status === "OK") return id;
		if (q.status && q.status !== "DEPLOYING") throw new Error(`Voice status: ${q.status}`);
		await new Promise((r) => setTimeout(r, 1e3));
	}
	throw new Error("Voice is still deploying. Retry using the saved recording.");
}
async function deleteVoice(key, id) {
	await enrollment(key, {
		action: "delete_voice",
		voice_id: id
	});
}
async function synthesizeVoice(key, id, model, text) {
	const response = await fetch(`${BASE}/services/audio/tts/SpeechSynthesizer`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${key}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			model: resolveFamilyVoiceModel(model),
			input: {
				text,
				voice: id,
				format: "mp3"
			}
		})
	});
	const json = await response.json();
	if (!response.ok) throw new Error(`[${response.status}] ${json.message || json.code || "Speech failed"}`);
	const url = json.output?.audio?.url;
	if (!url) throw new Error("No audio returned");
	const audio = await fetch(url.replace(/^http:/, "https:"));
	if (!audio.ok) throw new Error("Audio download failed");
	return { audioBase64: bytesToBase64(new Uint8Array(await audio.arrayBuffer())) };
}
function bytesToBase64(buf) {
	let bin = "";
	for (let i = 0; i < buf.length; i += 32768) bin += String.fromCharCode(...buf.subarray(i, i + 32768));
	return btoa(bin);
}
//#endregion
export { synthesizeVoice as i, deleteVoice as n, enrollVoice as r, bytesToBase64 as t };
