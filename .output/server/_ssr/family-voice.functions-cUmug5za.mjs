import "../_runtime.mjs";
import { l as createServerFn } from "./createServerFn-Be1RckzI.mjs";
import { r as resolveFamilyVoiceModel } from "./family-voice-models-BvOL_Vgu.mjs";
import { a as objectType, o as stringType, r as enumType } from "../_libs/zod.mjs";
import { n as FAMILY_VOICE_STATE, t as FAMILY_VOICE_CCT } from "./schema-C7za4mA0.mjs";
import { i as setResponseHeader, t as getRequestHeader } from "./request-response-CaQSkNBu.mjs";
import { t as createServerRpc } from "./createServerRpc-Cn_WX1Po.mjs";
import processModule from "node:process";
//#region node_modules/.nitro/vite/services/ssr/assets/family-voice.functions-cUmug5za.js
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
var familyVoiceAction_createServerFn_handler = createServerRpc({
	id: "ca1f8a9e8361ca9963078f940ce58a9c2b0e44bc15e0f6f3c80362529fd8907c",
	name: "familyVoiceAction",
	filename: "src/lib/family-voice.functions.ts"
}, (opts) => familyVoiceAction.__executeServer(opts));
var familyVoiceAction = createServerFn({ method: "POST" }).inputValidator((data) => input.parse(data)).handler(familyVoiceAction_createServerFn_handler, async ({ data }) => {
	setResponseHeader("Cache-Control", "private, no-store");
	const { verifiedActor, wordpressStore } = await import("./store.server-LsTp-Uay.mjs");
	const actor = await verifiedActor(getRequestHeader("X-WP-Token") || "");
	const store = wordpressStore(processModule.env["WP_ADMIN_USER"] || "", processModule.env["WP_ADMIN_APP_PASSWORD"] || "");
	if (data.action === "list") return { voices: await store.list(actor.id, data.caredOneId) };
	const { privateAudio } = await import("./audio.server-CY2mmHLG.mjs");
	const audio = privateAudio(processModule.env["SUPABASE_URL"] || "", processModule.env["SUPABASE_SERVICE_ROLE_KEY"] || "");
	const { enrollVoice, deleteVoice, synthesizeVoice } = await import("../_libs/_35.mjs");
	const key = processModule.env["DASHSCOPE_API_KEY"] || "";
	if (!key) throw new Error("Voice synthesis is not configured");
	if (data.action === "create" || data.action === "import") {
		if (!data.caredOneId || !data.label) throw new Error("Cared one and voice name are required");
		await store.access(actor.id, data.caredOneId);
		const model = resolveFamilyVoiceModel(data.model);
		if (data.action === "import") {
			if (!data.voiceId) throw new Error("Missing legacy voice ID");
			const existing = (await store.list(actor.id, data.caredOneId)).find((v) => v.voiceId === data.voiceId && v.model === model);
			if (existing) return { voice: existing };
			const id = await store.create(actor.id, data.caredOneId, {
				[FAMILY_VOICE_CCT.fields.label]: data.label,
				[FAMILY_VOICE_CCT.fields.voiceId]: data.voiceId,
				[FAMILY_VOICE_CCT.fields.model]: model,
				[FAMILY_VOICE_CCT.fields.state]: FAMILY_VOICE_STATE.ready
			});
			return { voice: store.map(await store.get(id), data.caredOneId) };
		}
		if (!data.audioBase64 || !data.mime) throw new Error("Original recording is required");
		const path = `recordings/${crypto.randomUUID()}.${data.mime === "audio/wav" ? "wav" : data.mime === "audio/mpeg" ? "mp3" : "m4a"}`;
		await audio.save(path, data.audioBase64, data.mime);
		const id = await store.create(actor.id, data.caredOneId, {
			[FAMILY_VOICE_CCT.fields.label]: data.label,
			[FAMILY_VOICE_CCT.fields.audioPath]: path,
			[FAMILY_VOICE_CCT.fields.model]: model,
			[FAMILY_VOICE_CCT.fields.state]: FAMILY_VOICE_STATE.pending,
			[FAMILY_VOICE_CCT.fields.mime]: data.mime
		});
		try {
			await enrollVoice(key, data.audioBase64, data.mime, model, async (voiceId) => {
				await store.update(id, { [FAMILY_VOICE_CCT.fields.voiceId]: voiceId });
			});
			await store.update(id, {
				[FAMILY_VOICE_CCT.fields.state]: FAMILY_VOICE_STATE.ready,
				[FAMILY_VOICE_CCT.fields.error]: ""
			});
		} catch (error) {
			await store.update(id, {
				[FAMILY_VOICE_CCT.fields.state]: FAMILY_VOICE_STATE.failed,
				[FAMILY_VOICE_CCT.fields.error]: error instanceof Error ? error.message.slice(0, 1500) : "Enrollment failed"
			});
		}
		return { voice: store.map(await store.get(id), data.caredOneId) };
	}
	if (!data.id) throw new Error("Saved voice record is required");
	const { row, person } = await store.owned(actor.id, data.id, data.caredOneId);
	const path = String(row[FAMILY_VOICE_CCT.fields.audioPath] || "");
	const voiceId = String(row[FAMILY_VOICE_CCT.fields.voiceId] || "");
	const model = resolveFamilyVoiceModel(String(row[FAMILY_VOICE_CCT.fields.model] || ""));
	if (data.action === "original") return {
		audioBase64: await audio.read(path),
		mime: String(row[FAMILY_VOICE_CCT.fields.mime] || "audio/wav")
	};
	if (data.action === "speak") {
		if (!voiceId || row[FAMILY_VOICE_CCT.fields.state] !== FAMILY_VOICE_STATE.ready || !data.text) throw new Error("Voice is not ready for playback");
		return synthesizeVoice(key, voiceId, model, data.text);
	}
	if (data.action === "rename") {
		if (!data.label) throw new Error("Voice name is required");
		await store.update(data.id, { [FAMILY_VOICE_CCT.fields.label]: data.label });
	} else if (data.action === "delete") {
		if (voiceId) await deleteVoice(key, voiceId);
		await audio.remove(path);
		await store.remove(person, data.id);
		return { ok: true };
	} else if (data.action === "retry") {
		const base64 = await audio.read(path);
		await store.update(data.id, { [FAMILY_VOICE_CCT.fields.state]: FAMILY_VOICE_STATE.pending });
		try {
			if (voiceId) {
				await deleteVoice(key, voiceId);
				await store.update(data.id, { [FAMILY_VOICE_CCT.fields.voiceId]: "" });
			}
			await enrollVoice(key, base64, String(row[FAMILY_VOICE_CCT.fields.mime] || "audio/wav"), model, async (id) => {
				await store.update(data.id || "", { [FAMILY_VOICE_CCT.fields.voiceId]: id });
			});
			await store.update(data.id, {
				[FAMILY_VOICE_CCT.fields.state]: FAMILY_VOICE_STATE.ready,
				[FAMILY_VOICE_CCT.fields.error]: ""
			});
		} catch (error) {
			await store.update(data.id, {
				[FAMILY_VOICE_CCT.fields.state]: FAMILY_VOICE_STATE.failed,
				[FAMILY_VOICE_CCT.fields.error]: error instanceof Error ? error.message.slice(0, 1500) : "Enrollment failed"
			});
		}
	}
	return { voice: store.map(await store.get(data.id), person) };
});
//#endregion
export { familyVoiceAction_createServerFn_handler };
