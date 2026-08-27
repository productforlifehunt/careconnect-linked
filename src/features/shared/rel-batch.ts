/**
 * Relation batching + short-lived read dedupe.
 *
 * JetEngine exposes a bare `GET jet-rel/<id>` that returns EVERY row of a
 * relation, keyed by parent id:
 *   { "<parentId>": [{ child_object_id: "18", meta?: {...} }, ...], ... }
 *
 * Fetching that once is dramatically cheaper than one
 * `jet-rel/<id>/children/<parentId>` request per row (the N+1 pattern).
 */
import { wordpressFetch } from "@/features/shared/wordpress-client";

export interface RelChild {
  childId: string;
  meta: Record<string, any> | null;
}

type CacheEntry = { at: number; promise: Promise<any> };

const READ_TTL_MS = 8000;
const cache = new Map<string, CacheEntry>();

/**
 * Deduplicates identical reads happening within a short window (default 8s),
 * so sibling widgets mounting on the same screen share one network round-trip.
 * Failed reads are never cached.
 */
export function dedupeRead<T>(key: string, fn: () => Promise<T>, ttlMs = READ_TTL_MS): Promise<T> {
  const hit = cache.get(key);
  const now = Date.now();
  if (hit && now - hit.at < ttlMs) return hit.promise as Promise<T>;
  const promise = fn().catch((err) => {
    cache.delete(key);
    throw err;
  });
  cache.set(key, { at: now, promise });
  return promise;
}

/** Drops cached reads whose key contains `fragment` (call after a write). */
export function invalidateRead(fragment?: string) {
  if (!fragment) { cache.clear(); return; }
  for (const key of Array.from(cache.keys())) {
    if (key.includes(fragment)) cache.delete(key);
  }
}

/** One request per relation → Map<parentId, RelChild[]>. */
export function fetchRelChildrenMap(relationId: number | string): Promise<Map<string, RelChild[]>> {
  return dedupeRead(`rel-map:${relationId}`, async () => {
    const map = new Map<string, RelChild[]>();
    try {
      const rows = await wordpressFetch<Record<string, any[]>>(`jet-rel/${relationId}`);
      if (!rows || typeof rows !== "object" || Array.isArray(rows)) return map;
      for (const [parent, children] of Object.entries(rows)) {
        if (!Array.isArray(children)) continue;
        const list: RelChild[] = [];
        for (const c of children) {
          const childId = String(c?.child_object_id ?? "");
          if (!childId) continue;
          list.push({ childId, meta: c?.meta && typeof c.meta === "object" ? c.meta : null });
        }
        if (list.length) map.set(String(parent), list);
      }
    } catch { /* empty map → callers fall back to per-parent lookups */ }
    return map;
  });
}

/** One request per relation → Map<childId, parentIds[]> (reverse direction). */
export function fetchRelParentsMap(relationId: number | string): Promise<Map<string, string[]>> {
  return dedupeRead(`rel-parents:${relationId}`, async () => {
    const map = new Map<string, string[]>();
    const children = await fetchRelChildrenMap(relationId);
    for (const [parent, list] of children.entries()) {
      for (const c of list) {
        const existing = map.get(c.childId) || [];
        if (!existing.includes(parent)) existing.push(parent);
        map.set(c.childId, existing);
      }
    }
    return map;
  });
}
