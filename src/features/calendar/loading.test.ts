import { expect, it, vi } from 'vitest';
const m = vi.hoisted(() => ({ fetch: vi.fn(), cct: vi.fn() }));
vi.mock('@/features/shared/wordpress-client', () => ({ wordpressFetch: m.fetch, wordpressCCTFetch: m.cct }));
vi.mock('@/features/shared/rel-batch', () => ({ dedupeRead: (_key: string, load: () => unknown) => load() }));
import { fetchCalendarEventsForUserWordPress } from './source.wordpress';
it('starts both ownership relations together and batches their unique event IDs', async () => {
  let finish: ((value: unknown[]) => void) | undefined;
  m.fetch.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; })).mockResolvedValueOnce([{ parent_object_id: 20 }]);
  m.cct.mockResolvedValue([{ id: '10', a55: 'Owned' }, { id: '20', a55: 'Invited' }]);
  const pending = fetchCalendarEventsForUserWordPress(70);
  const started = m.fetch.mock.calls.length;
  finish?.([{ child_object_id: 10 }]);
  await pending;
  expect(started).toBe(2);
  expect(m.cct).toHaveBeenCalledTimes(1);
  expect(JSON.parse(m.cct.mock.calls[0]?.[1].params._filters)[0].value).toEqual(['10', '20']);
});