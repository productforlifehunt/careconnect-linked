//#region node_modules/.nitro/vite/services/ssr/assets/overview-source-dJzI3qvo.js
var overview_source_default = "import type { TranscriptArchive } from \"./transcribe\";\n\n/** Manual text corrections take precedence; never summarize uncorrected Raw. */\nexport function overviewSource(text: TranscriptArchive | null, edited: TranscriptArchive | null): string {\n  if (text?.text?.trim()) return text.text.trim();\n  return (edited?.lines || []).map((line, i) => `${i + 1}. ${line.s === \"A\" ? \"Interviewer\" : \"Interviewee\"}: ${line.zh.trim() || line.en.trim()}`).join(\"\\n\").trim();\n}";
//#endregion
export { overview_source_default as default };
