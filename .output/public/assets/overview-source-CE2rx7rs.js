var e=`import type { TranscriptArchive } from "./transcribe";

/** Manual text corrections take precedence; never summarize uncorrected Raw. */
export function overviewSource(text: TranscriptArchive | null, edited: TranscriptArchive | null): string {
  if (text?.text?.trim()) return text.text.trim();
  return (edited?.lines || []).map((line, i) => \`\${i + 1}. \${line.s === "A" ? "Interviewer" : "Interviewee"}: \${line.zh.trim() || line.en.trim()}\`).join("\\n").trim();
}`;export{e as default};