/** Source-verified annotations stay private in the existing notes cache. */
export interface SourceAnnotation {
  key: string;
  text: string;
  updatedAt: string;
  id?: string | undefined;
  title?: string | undefined;
  locked?: boolean | undefined;
  verified?: boolean | undefined;
  source?: { file: string; line: number; endLine: number; tag: string; digest: string } | undefined;
  alias?: string | undefined;
}

/** Source reference saved with a binding so the note survives line shifts ("components/x.tsx:12" + tag). */
export async function sourceRef(source: string, tag: string, read: (file: string) => Promise<string | null>) {
  const match = source.match(/^(.*?):(\d+)(?::\d+)?$/);
  if (!match || !match[1]) return undefined;
  const text = await read(match[1]);
  const line = Number(match[2]);
  const at = text?.split("\n")[line - 1];
  if (at === undefined || !at.trim()) return undefined;
  return { file: match[1], line, endLine: line, tag: tag.slice(0, 60), digest: await sourceDigest(at) };
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
  // Same file and tag at any saved line: edits above an element shift its line, so the saved
  // source block is compared at the element's current line instead of its old line number.
  const candidates = [...notes.values()].filter((n) => n.source?.file === file && n.source.tag.toLowerCase() === tag.toLowerCase())
    .sort((a, b) => Math.abs((a.source?.line ?? 0) - line) - Math.abs((b.source?.line ?? 0) - line));
  if (!candidates.length) return undefined;
  const current = await read(file);
  if (!current) return undefined;
  const lines = current.split("\n");
  const valid: SourceAnnotation[] = [];
  for (const note of candidates) {
    const ref = note.source;
    if (!ref) continue;
    if (await sourceDigest(lines.slice(line - 1, line + (ref.endLine - ref.line)).join("\n")) === ref.digest) valid.push(note);
  }
  // A position selects one real note; do not synthesize a merged body with a misleading CCT ID.
  if (valid.length === 1) return valid[0];
  const first = valid[0];
  if (first && valid.length > 1) return first;
  return undefined;
}