export interface InterviewDisplaySettings {
  playbackAllowed?: boolean;
  showPlayback?: boolean;
  showGenerate?: boolean;
}

export function interviewDisplaySettings(meta: InterviewDisplaySettings & { title?: string }) {
  const occasional = /\bP\s*-\s*C\s*\d+\b|occasional\s+secondary\s+caregiver/i.test(meta.title || "");
  return {
    playbackAllowed: typeof meta.playbackAllowed === "boolean" ? meta.playbackAllowed : !occasional,
    showPlayback: typeof meta.showPlayback === "boolean" ? meta.showPlayback : !occasional,
    showGenerate: typeof meta.showGenerate === "boolean" ? meta.showGenerate : true,
  };
}