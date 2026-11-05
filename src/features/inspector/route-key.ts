/** One element on /care-circle/28 and /care-circle/31 is the same element: match its note across record ids in the page path. */
export function routePattern(key: string): string | undefined {
  const parts = key.split("|");
  if (parts[0] !== "el" || !parts[1] || !/\/\d+(?=\/|$)/.test(parts[1])) return undefined;
  return ["el", parts[1].replace(/\/\d+(?=\/|$)/g, "/:id"), ...parts.slice(2)].join("|");
}
export function findSameElementNote<T>(notes: Map<string, T>, key: string): T | undefined {
  const exact = notes.get(key);
  if (exact) return exact;
  const pattern = routePattern(key);
  if (!pattern) return undefined;
  for (const [k, v] of notes) if (routePattern(k) === pattern) return v;
  return undefined;
}
