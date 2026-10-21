import type { Line } from "./transcribe";

const stamp = (t: number) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

/** Plain-text transcript laid out like a paper appendix. */
export function archiveToText(title: string, lines: Line[]): string {
  const head = [
    title, "Interview transcript and translation / 访谈转录与翻译",
    "A = Interviewer / 访谈者; B = Interviewee / 受访者", "",
  ];
  const body = lines.map((l, i) => [`${i + 1}. [${stamp(l.t)}] ${l.s}`, l.zh && `中文：${l.zh}`, l.en && `English: ${l.en}`].filter(Boolean).join("\n"));
  return `${head.join("\n")}\n${body.join("\n\n")}\n`;
}

export function downloadText(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
