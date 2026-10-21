import type { Line } from "./transcribe";

export const speakerLabel = (speaker: "A" | "B") => speaker === "A" ? "A — Interviewer / 访谈者" : "B — Interviewee / 受访者";

/** Format legacy text archives for reading/export without rewriting stored corrections. */
export function appendixText(text: string): string {
  return text.replace(/^(\d+\.\s*)(?:\[\d+:\d+(?::\d+)?\]\s*)?([AB])(?:\s*—\s*(?:Interviewer \/ 访谈者|Interviewee \/ 受访者))?\s*$/gm,
    (_match, number: string, speaker: "A" | "B") => `${number}${speakerLabel(speaker)}`);
}

/** Plain-text transcript laid out like a paper appendix. */
export function archiveToText(title: string, lines: Line[]): string {
  const head = [
    title, "Interview transcript and translation / 访谈转录与翻译",
    "A = Interviewer / 访谈者; B = Interviewee / 受访者", "",
  ];
  const body = lines.map((l, i) => [`${i + 1}. ${speakerLabel(l.s)}`, l.zh && `中文：${l.zh}`, l.en && `English: ${l.en}`].filter(Boolean).join("\n"));
  return `${head.join("\n")}\n${body.join("\n\n")}\n`;
}

export function downloadText(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
