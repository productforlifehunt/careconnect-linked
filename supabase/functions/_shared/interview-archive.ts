/** Shared storage rules; old archives remain Raw without moving any files. */
export function archiveObjectPath(path: string, kind: unknown = "raw"): string {
  if (kind !== "raw" && kind !== "edited") throw new Error("Invalid archive kind");
  return `${kind === "edited" ? "archive-edited" : "archive"}/${path}.json`;
}

export function normalizeArchiveLines(items: unknown[]) {
  return items.map((item) => {
    const line = item && typeof item === "object" ? item as Record<string, unknown> : {};
    return {
      s: line.s === "B" ? "B" as const : "A" as const,
      zh: String(line.zh || "").slice(0, 5000),
      en: String(line.en || "").slice(0, 5000),
      t: Math.max(0, Number(line.t) || 0),
    };
  }).filter((line) => line.zh || line.en);
}