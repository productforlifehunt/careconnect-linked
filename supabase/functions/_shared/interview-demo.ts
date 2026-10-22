import { canReceiveInterviewAudio, type InterviewDisplaySettings } from "./interview-display.ts";

// Freeze the consented recordings by their existing storage identities,
// rather than granting permission to whoever appears first after a title edit.
export const DEMO_RECORDINGS = [
  "1792069468864_34.wav",
  "1790775526991_32.wav",
  "1791796863950_33_-edited.wav",
  "1791798861562_31_-edited.wav",
] as const;

export function isDemoRecording(path: string) {
  return DEMO_RECORDINGS.some((recording) => recording === path);
}

export function canPreloadInterviewAudio(path: string, meta: InterviewDisplaySettings & { title?: string }, researcher: boolean) {
  return isDemoRecording(path) && canReceiveInterviewAudio(meta, researcher);
}