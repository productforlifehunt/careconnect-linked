/** Shared storage rules; old archives remain Raw without moving any files. */
export const ARCHIVE_FOLDERS = {
  raw: "archive",
  edited: "archive-edited",
  anonymized: "archive-anonymized",
  text: "archive-text",
  "anonymized-text": "archive-anonymized-text",
} as const;
export type ArchiveKind = keyof typeof ARCHIVE_FOLDERS;
export const isArchiveKind = (kind: unknown): kind is ArchiveKind => typeof kind === "string" && kind in ARCHIVE_FOLDERS;
export const isTextKind = (kind: unknown) => kind === "text" || kind === "anonymized-text";

export function archiveObjectPath(path: string, kind: unknown = "raw"): string {
  if (!isArchiveKind(kind)) throw new Error("Invalid archive kind");
  return `${ARCHIVE_FOLDERS[kind]}/${path}.json`;
}

export function normalizeArchiveLines(items: unknown[]) {
  return items.map((item) => {
    const line = item && typeof item === "object" ? item as Record<string, unknown> : {};
    return {
      s: line['s'] === "B" ? "B" as const : "A" as const,
      zh: String(line['zh'] || "").slice(0, 5000),
      en: String(line['en'] || "").slice(0, 5000),
      t: Math.max(0, Number(line['t']) || 0),
    };
  }).filter((line) => line.zh || line.en);
}
