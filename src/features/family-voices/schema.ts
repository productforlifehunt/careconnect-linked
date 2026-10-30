/** Verified in the /afresh JetEngine GUI on 2026-10-30. Never regenerate this mapping. */
export const FAMILY_VOICE_CCT = { id: 322, slug: "cared_one_relatives_voice", fields: {
  label: "a55", audioPath: "a56", voiceId: "a57", model: "a58", state: "a59", error: "a60", mime: "a61",
} } as const;
export const FAMILY_VOICE_RELATION = 323;
export const FAMILY_VOICE_STATE = { pending: "b55", ready: "b56", failed: "b57" } as const;
export type SavedFamilyVoice = { id: string; voiceId: string; model: string; label: string; caredOneId: string; caredOneName: string; createdAt: string; audioSaved: boolean; state: string; error: string };