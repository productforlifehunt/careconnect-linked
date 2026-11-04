/** Source-verified annotations stay private in the existing notes cache. */
export interface SourceAnnotation {
  key: string;
  text: string;
  updatedAt: string;
  source?: { file: string; line: number; endLine: number; tag: string; digest: string };
}

export async function sourceDigest(text: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function isGeneratedNote(text: string): boolean {
  return text.startsWith("【根据本页") || text.startsWith("这段代码同一处") || text.startsWith("【源码核查注释");
}

/** Match the exact rendering source, not displayed text, request logs or ancestor guesses. */
export async function resolveSourceNote(
  notes: Map<string, SourceAnnotation>, source: string, tag: string,
  read: (file: string) => Promise<string | null>,
): Promise<SourceAnnotation | undefined> {
  const match = source.match(/^(.*?):(\d+)(?::\d+)?$/);
  if (!match) return undefined;
  const file = match[1]; const line = Number(match[2]);
  if (!file) return undefined;
  const candidates = [...notes.values()].filter((n) => n.source?.file === file && n.source.line === line && n.source.tag.toLowerCase() === tag.toLowerCase());
  if (!candidates.length) return undefined;
  const current = await read(file);
  if (!current) return undefined;
  const lines = current.split("\n");
  const valid: SourceAnnotation[] = [];
  for (const note of candidates) {
    const ref = note.source;
    if (!ref) continue;
    if (await sourceDigest(lines.slice(ref.line - 1, ref.endLine).join("\n")) === ref.digest) valid.push(note);
  }
  // Multiple same-line tags are indistinguishable without a source column; share their verified explanation.
  if (valid.length === 1) return valid[0];
  if (valid.length > 1) return { ...valid[0], key: valid[0]?.key || "", text: [...new Set(valid.map((n) => n.text))].join("\n\n") };
  return undefined;
}