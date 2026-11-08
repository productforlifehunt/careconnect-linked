import { wordpressCCTFetch } from './wordpress-client';
import { dedupeRead } from './rel-batch';
import { T } from '@/integrations/wp-schema';

const PROFILE_CCT_CACHE_TTL_MS = 30_000;

function cacheTtlForCct(slug: string): number | undefined {
  return slug === T.userProfile.slug || slug === T.userProfile2.slug
    ? PROFILE_CCT_CACHE_TTL_MS
    : undefined;
}

/** JetEngine-native IN filter, verified in the CCT151 GUI and live read-only requests. */
export function linkedRowParams(ids: string[]) {
  return {
    _limit: ids.length,
    _filters: JSON.stringify([{ field: '_ID', operator: 'IN', value: ids, type: 'integer' }]),
  };
}

/** Call only AFTER resolving the caller's existing JetEngine relation IDs. */
export async function readLinkedCCTRows(slug: string, ids: string[]): Promise<any[]> {
  const clean = [...new Set(ids.filter(id => /^\d+$/.test(id)))].sort((a, b) => Number(a) - Number(b));
  if (!clean.length) return [];
  const cacheTtl = cacheTtlForCct(slug);
  if (clean.length === 1) return dedupeRead(`linked-cct-single:${slug}:${clean[0]}`, async () => {
    const row = await wordpressCCTFetch<any>(slug, { id: clean[0] });
    if (!row || String(row.id ?? row._ID) !== clean[0]) throw new Error('CCT item read returned an unrelated row.');
    return [row];
  }, cacheTtl);
  return dedupeRead(`linked-cct:${slug}:${clean.join(',')}`, async () => {
    const batches: string[][] = [];
    for (let offset = 0; offset < clean.length; offset += 100) batches.push(clean.slice(offset, offset + 100));
    const pages = await Promise.all(batches.map(async batch => {
      const rows = await wordpressCCTFetch<any[]>(slug, { params: linkedRowParams(batch) });
      if (!Array.isArray(rows)) throw new Error('CCT batch read returned an invalid response.');
      const allowed = new Set(batch);
      if (rows.some(row => !allowed.has(String(row?.id ?? row?._ID)))) throw new Error('CCT filter returned unrelated rows; batch read rejected.');
      return rows;
    }));
    return pages.flat();
  }, cacheTtl);
}
