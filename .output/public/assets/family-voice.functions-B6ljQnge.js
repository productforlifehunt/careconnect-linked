var e=`import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { resolveFamilyVoiceModel } from "./family-voice-models";
import { FAMILY_VOICE_CCT as C, FAMILY_VOICE_STATE as STATE } from "@/features/family-voices/schema";

const input = z.object({ action: z.enum(["list", "create", "import", "rename", "delete", "speak", "original", "retry"]), caredOneId: z.string().regex(/^\\d+$/).optional(), id: z.string().regex(/^\\d+$/).optional(), label: z.string().trim().min(1).max(120).optional(), voiceId: z.string().min(5).max(200).optional(), model: z.string().transform(resolveFamilyVoiceModel).optional(), audioBase64: z.string().min(1000).max(14_000_000).optional(), mime: z.enum(["audio/wav", "audio/mpeg", "audio/mp4"]).optional(), text: z.string().trim().min(1).max(2000).optional() });
export const familyVoiceAction = createServerFn({ method: "POST" })
  .inputValidator((data) => input.parse(data))
  .handler(async ({ data }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    const { verifiedActor, wordpressStore } = await import("@/features/family-voices/store.server");
    const actor = await verifiedActor(getRequestHeader("X-WP-Token") || "");
    const store = wordpressStore(process.env["WP_ADMIN_USER"] || "", process.env["WP_ADMIN_APP_PASSWORD"] || "");
    if (data.action === "list") return { voices: await store.list(actor.id, data.caredOneId) };
    const { privateAudio } = await import("@/features/family-voices/audio.server");
    const audio = privateAudio(process.env["SUPABASE_URL"] || "", process.env["SUPABASE_SERVICE_ROLE_KEY"] || "");
    const { enrollVoice, deleteVoice, synthesizeVoice } = await import("@/features/family-voices/provider.server");
    const key = process.env["DASHSCOPE_API_KEY"] || "";
    if (!key) throw new Error("Voice synthesis is not configured");
    if (data.action === "create" || data.action === "import") {
      if (!data.caredOneId || !data.label) throw new Error("Cared one and voice name are required");
      await store.access(actor.id, data.caredOneId);
      const model = resolveFamilyVoiceModel(data.model);
      if (data.action === "import") {
        if (!data.voiceId) throw new Error("Missing legacy voice ID");
        const existing = (await store.list(actor.id, data.caredOneId)).find((v) => v.voiceId === data.voiceId && v.model === model);
        if (existing) return { voice: existing };
        const id = await store.create(actor.id, data.caredOneId, { [C.fields.label]: data.label, [C.fields.voiceId]: data.voiceId, [C.fields.model]: model, [C.fields.state]: STATE.ready });
        return { voice: store.map(await store.get(id), data.caredOneId) };
      }
      if (!data.audioBase64 || !data.mime) throw new Error("Original recording is required");
      const path = \`recordings/\${crypto.randomUUID()}.\${data.mime === "audio/wav" ? "wav" : data.mime === "audio/mpeg" ? "mp3" : "m4a"}\`;
      await audio.save(path, data.audioBase64, data.mime);
      // Keep audio on subsequent failure: a relation/write error must not destroy the source recording.
      const id = await store.create(actor.id, data.caredOneId, { [C.fields.label]: data.label, [C.fields.audioPath]: path, [C.fields.model]: model, [C.fields.state]: STATE.pending, [C.fields.mime]: data.mime });
      try {
        await enrollVoice(key, data.audioBase64, data.mime, model, async (voiceId) => { await store.update(id, { [C.fields.voiceId]: voiceId }); });
        await store.update(id, { [C.fields.state]: STATE.ready, [C.fields.error]: "" });
      } catch (error) {
        await store.update(id, { [C.fields.state]: STATE.failed, [C.fields.error]: error instanceof Error ? error.message.slice(0, 1500) : "Enrollment failed" });
      }
      return { voice: store.map(await store.get(id), data.caredOneId) };
    }
    if (!data.id) throw new Error("Saved voice record is required");
    const { row, person } = await store.owned(actor.id, data.id, data.caredOneId);
    const path = String(row[C.fields.audioPath] || "");
    const voiceId = String(row[C.fields.voiceId] || "");
    const model = resolveFamilyVoiceModel(String(row[C.fields.model] || ""));
    if (data.action === "original") return { audioBase64: await audio.read(path), mime: String(row[C.fields.mime] || "audio/wav") };
    if (data.action === "speak") {
      if (!voiceId || row[C.fields.state] !== STATE.ready || !data.text) throw new Error("Voice is not ready for playback");
      return synthesizeVoice(key, voiceId, model, data.text);
    }
    if (data.action === "rename") {
      if (!data.label) throw new Error("Voice name is required");
      await store.update(data.id, { [C.fields.label]: data.label });
    } else if (data.action === "delete") {
      if (voiceId) await deleteVoice(key, voiceId);
      await audio.remove(path);
      await store.remove(person, data.id);
      return { ok: true };
    } else if (data.action === "retry") {
      const base64 = await audio.read(path);
      await store.update(data.id, { [C.fields.state]: STATE.pending });
      try {
        if (voiceId) { await deleteVoice(key, voiceId); await store.update(data.id, { [C.fields.voiceId]: "" }); }
        await enrollVoice(key, base64, String(row[C.fields.mime] || "audio/wav"), model, async (id) => { await store.update(data.id || "", { [C.fields.voiceId]: id }); });
        await store.update(data.id, { [C.fields.state]: STATE.ready, [C.fields.error]: "" });
      } catch (error) { await store.update(data.id, { [C.fields.state]: STATE.failed, [C.fields.error]: error instanceof Error ? error.message.slice(0, 1500) : "Enrollment failed" }); }
    }
    return { voice: store.map(await store.get(data.id), person) };
  });`;export{e as default};