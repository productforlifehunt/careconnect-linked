var e=`import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// Backup (Draftbit) app access to family voices: same WordPress identity + REL access checks as the main app.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-WP-Token",
  "Cache-Control": "private, no-store",
};
const input = z.object({
  action: z.enum(["list", "speak"]),
  caredOneId: z.string().regex(/^\\d+$/).optional(),
  id: z.string().regex(/^\\d+$/).optional(),
  text: z.string().trim().min(1).max(2000).optional(),
});
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: CORS });

export const Route = createFileRoute("/api/public/family-voices")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const parsed = input.safeParse(await request.json().catch(() => null));
          if (!parsed.success) return json({ error: "Invalid request" }, 400);
          const data = parsed.data;
          const bearer = (request.headers.get("Authorization") || "").replace(/^Bearer\\s+/i, "");
          const token = request.headers.get("X-WP-Token") || bearer;
          const { verifiedActor, wordpressStore } = await import("@/features/family-voices/store.server");
          let actor;
          try { actor = await verifiedActor(token); } catch { return json({ error: "Please sign in" }, 401); }
          const store = wordpressStore(process.env["WP_ADMIN_USER"] || "", process.env["WP_ADMIN_APP_PASSWORD"] || "");
          if (data.action === "list") {
            if (!data.caredOneId) return json({ error: "Cared one is required" }, 400);
            return json({ voices: await store.list(actor.id, data.caredOneId) });
          }
          if (!data.id || !data.text) return json({ error: "Voice and text are required" }, 400);
          const { FAMILY_VOICE_CCT: C, FAMILY_VOICE_STATE: STATE } = await import("@/features/family-voices/schema");
          const { resolveFamilyVoiceModel } = await import("@/lib/family-voice-models");
          const { row } = await store.owned(actor.id, data.id, data.caredOneId);
          const voiceId = String(row[C.fields.voiceId] || "");
          if (!voiceId || row[C.fields.state] !== STATE.ready) return json({ error: "Voice is not ready" }, 409);
          const key = process.env["DASHSCOPE_API_KEY"] || "";
          if (!key) return json({ error: "Voice playback is not configured" }, 503);
          const { synthesizeVoice } = await import("@/features/family-voices/provider.server");
          return json(await synthesizeVoice(key, voiceId, resolveFamilyVoiceModel(String(row[C.fields.model] || "")), data.text));
        } catch (error) {
          return json({ error: error instanceof Error ? error.message : "Request failed" }, 403);
        }
      },
    },
  },
});
`;export{e as default};