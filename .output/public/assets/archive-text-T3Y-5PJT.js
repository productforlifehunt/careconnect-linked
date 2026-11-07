var e=`import type { Line } from "./transcribe";

export const speakerLabel = (speaker: "A" | "B") => speaker === "A" ? "A — Interviewer / 访谈者" : "B — Interviewee / 受访者";

/** Format legacy text archives for reading/export without rewriting stored corrections. */
export function appendixText(text: string): string {
  return text.replace(/^(\\d+\\.\\s*)(?:\\[\\d+:\\d+(?::\\d+)?\\]\\s*)?([AB])(?:\\s*—\\s*(?:Interviewer \\/ 访谈者|Interviewee \\/ 受访者))?\\s*$/gm,
    (_match, number: string, speaker: "A" | "B") => \`\${number}\${speakerLabel(speaker)}\`);
}

/** Plain-text transcript laid out like a paper appendix. */
export function archiveToText(title: string, lines: Line[]): string {
  const head = [
    title, "Interview transcript and translation / 访谈转录与翻译",
    "A = Interviewer / 访谈者; B = Interviewee / 受访者", "",
  ];
  const body = lines.map((l, i) => [\`\${i + 1}. \${speakerLabel(l.s)}\`, l.zh && \`中文：\${l.zh}\`, l.en && \`English: \${l.en}\`].filter(Boolean).join("\\n"));
  return \`\${head.join("\\n")}\\n\${body.join("\\n\\n")}\\n\`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function downloadText(text: string, filename: string) {
  downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), filename);
}

const xmlEscape = (s: string) => s.replace(/[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F]/g, "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Minimal Word document: one paragraph per text line, same content as the TXT export. */
export async function textToDocx(text: string): Promise<Blob> {
  const { default: JSZip } = await import("jszip");
  const paragraphs = text.split(/\\r?\\n/).map((line) => line
    ? \`<w:p><w:r><w:t xml:space="preserve">\${xmlEscape(line)}</w:t></w:r></w:p>\`
    : "<w:p/>").join("");
  const zip = new JSZip();
  zip.file("[Content_Types].xml", \`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>\`);
  zip.file("_rels/.rels", \`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>\`);
  zip.file("word/_rels/document.xml.rels", \`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>\`);
  zip.file("word/styles.xml", \`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="SimSun"/><w:sz w:val="22"/><w:lang w:val="en-US" w:eastAsia="zh-CN"/></w:rPr></w:rPrDefault></w:docDefaults></w:styles>\`);
  zip.file("word/document.xml", \`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>\${paragraphs}<w:sectPr/></w:body></w:document>\`);
  return zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
}

export async function downloadDocx(text: string, filename: string) {
  downloadBlob(await textToDocx(text), filename);
}
`;export{e as default};