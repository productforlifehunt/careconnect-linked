/** One element on /care-circle/28 and /care-circle/31 is the same element: match its note across record ids in the page path. */
export function routePattern(key: string): string | undefined {
  const parts = key.split("|");
  if (parts[0] !== "el" || !parts[1] || !/\/\d+(?=\/|$)/.test(parts[1])) return undefined;
  return ["el", parts[1].replace(/\/\d+(?=\/|$)/g, "/:id"), ...parts.slice(2)].join("|");
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

/** This app's "所有子App" scope key; distinct from other apps sharing CCT324. */
export const ALL_SUB_APPS = "challenged-all";
/** A page is its route (record ids as :id) on one sub-app, never a deployment host. */
export function pagePositionKey(pathname: string, site: string): string {
  const path = (pathname.split("?")[0] || "/").replace(/\/\d+(?=\/|$)/g, "/:id").replace(/(.)\/$/, "$1");
  return `page|${path}?__site=${encodeURIComponent(site)}`;
}
const PARAM_NAMES: Record<string, string> = { "cared-ones": "Cared One ID", "care-circle": "Group ID", circle: "Group ID", group: "Group ID", caregiver: "Caregiver ID" };
/** Shown path: /cared-ones/46/medicine -> /cared-ones/{Cared One ID}/medicine. */
export function pageDisplayPath(pathname: string): string {
  const parts = (pathname.split("?")[0] || "/").split("/");
  return parts.map((seg, i) => /^\d+$/.test(seg) ? `{${PARAM_NAMES[parts[i - 1] || ""] || "ID"}}` : seg).join("/");
}
