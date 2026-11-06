import { afterEach, expect, it, vi } from 'vitest';
import { createReadCache } from './read-cache';

afterEach(() => vi.useRealTimers());
it('shares a slow pending read even after the ordinary TTL has elapsed', async () => {
  vi.useFakeTimers();
  const cache = createReadCache<number>();
  let finish: ((value: number) => void) | undefined;
  const load = vi.fn(() => new Promise<number>(resolve => { finish = resolve; }));
  const first = cache.read('person:70', load, 4000);
  await Promise.resolve();
  vi.advanceTimersByTime(12000);
  const second = cache.read('person:70', load, 4000);
  expect(second).toBe(first);
  expect(load).toHaveBeenCalledTimes(1);
  finish?.(70);
  expect(await second).toBe(70);
  expect(cache.read('person:70', load, 4000)).toBe(first);
});
it('isolates identities and immediately invalidates reads after a write', async () => {
  const cache = createReadCache<number>();
  expect(await cache.read('user:70', async () => 70, 4000)).toBe(70);
  expect(await cache.read('user:71', async () => 71, 4000)).toBe(71);
  cache.clear();
  expect(await cache.read('user:70', async () => 700, 4000)).toBe(700);
});
it('an old failed request cannot remove its newer replacement', async () => {
  const cache = createReadCache<number>();
  let fail: ((reason: Error) => void) | undefined;
  const old = cache.read('row', () => new Promise<number>((_, reject) => { fail = reject; }), 4000);
  await Promise.resolve();
  const rejected = expect(old).rejects.toThrow('old failure');
  cache.clear();
  const fresh = cache.read('row', async () => 9, 4000);
  fail?.(new Error('old failure'));
  await rejected;
  expect(await fresh).toBe(9);
  expect(cache.read('row', async () => 0, 4000)).toBe(fresh);
});