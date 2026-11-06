import { beforeEach, expect, it, vi } from 'vitest';
const cct = vi.hoisted(() => vi.fn());
vi.mock('./wordpress-client', () => ({ wordpressCCTFetch: cct }));
vi.mock('./rel-batch', () => ({ dedupeRead: (_key: string, load: () => unknown) => load() }));
import { readLinkedCCTRows } from './cct-rows';
beforeEach(() => cct.mockReset());
it('fifteen already-related rows use one native-filtered request', async () => {
  const ids = Array.from({ length: 15 }, (_, i) => String(140 + i));
  cct.mockResolvedValue(ids.map(id => ({ id })));
  expect((await readLinkedCCTRows('users_extended_prof', ids)).length).toBe(15);
  expect(cct).toHaveBeenCalledTimes(1);
  const params = cct.mock.calls[0]?.[1].params;
  expect(JSON.parse(params._filters)).toEqual([{ field: '_ID', operator: 'IN', value: ids, type: 'integer' }]);
});
it('no relation IDs means no CCT request', async () => {
  expect(await readLinkedCCTRows('users_extended_prof', [])).toEqual([]);
  expect(cct).not.toHaveBeenCalled();
});
it('rejects an ignored filter instead of accepting another user row', async () => {
  cct.mockResolvedValue([{ id: '999' }]);
  await expect(readLinkedCCTRows('users_extended_prof', ['144', '145'])).rejects.toThrow('unrelated rows');
});