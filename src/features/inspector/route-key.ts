/** Record pages and their elements share notes across numeric and WordPress-prefixed IDs. */
export function routePattern(key: string): string | undefined {
  const parts = key.split("|");
  if (!["el", "page", "al"].includes(parts[0] ?? "") || !parts[1]) return undefined;
  const path = parts[1].replace(/\/(?:wp-)?\d+(?=\/|$)/g, "/:id");
  if (path === parts[1] && !path.includes("/:id")) return undefined;
  return [parts[0], path, ...parts.slice(2)].join("|");
}
/**
 * Build-independent second key for an element: page pattern + the app's own component names + tag + slot.
 * The main key holds a source line (preview) or component names (published), which differ between the two
 * builds and shift when code above changes; this one is saved with every binding so the note is found again.
 */
export function elementAlias(pathname: string, components: string[], tag: string, slot?: string): string {
  const names = components.filter((n) => n.length >= 3).slice(0, 6);
  if (!names.length) return "";
  return ["al", pathname.replace(/\/\d+(?=\/|$)/g, "/:id"), names.join("<"), tag + (slot ? `|${slot}` : "")].join("|");
}
export function findAliasNote<T extends { alias?: string | undefined }>(notes: Map<string, T>, alias: string): T | undefined {
  if (!alias) return undefined;
  let found: T | undefined;
  for (const v of notes.values()) if (v.alias === alias) found = v; // later bindings (newer saves) win
  return found;
}
export function findSameElementNote<T>(notes: Map<string, T>, key: string): T | undefined {
  const exact = notes.get(key);
  if (exact) return exact;
  const pattern = routePattern(key);
  if (!pattern) return undefined;
  for (const [k, v] of notes) if (routePattern(k) === pattern) return v;
  return undefined;
}
