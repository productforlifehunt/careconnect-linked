import { beforeEach, afterEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ fetch: vi.fn(), cct: vi.fn(), core: vi.fn(), name: vi.fn(), own: vi.fn() }));
vi.mock('@/features/shared/wordpress-client', () => ({ wordpressFetch: mocks.fetch, wordpressCCTFetch: mocks.cct }));
vi.mock('@/features/shared/wordpress-adapter', () => ({ getWordPressFeature: mocks.core, updateWordPressFeature: vi.fn() }));
vi.mock('@/features/shared/current-user', () => ({ getCurrentUserIdNumber: () => 70 }));
vi.mock('@/features/shared/own-profile-row', () => ({ findOwnRow: mocks.own, linkOwnRow: vi.fn() }));
vi.mock('@/features/shared/app-scope', () => ({ currentAppScope: () => 'challenged' }));
vi.mock('@/contexts/SiteContext', () => ({ detectSite: () => 'challenged' }));
vi.mock('@/features/profile/app-user-name', () => ({ fetchMyAppUserName: mocks.name, saveMyAppUserName: vi.fn() }));
import { getAppProfileRow } from './app-profile';
import { fetchMyProfileWordPress } from '@/features/profile/source.wordpress';

beforeEach(() => {
  vi.clearAllMocks();
  window.dispatchEvent(new Event('wp-write'));
  mocks.fetch.mockResolvedValue([{ child_object_id: 151 }]);
  mocks.cct.mockResolvedValue({ id: '151', a01: 'challenged', a55: 'Care name' });
});
afterEach(() => window.dispatchEvent(new Event('wp-write')));

it('header, settings and credits share one app-profile resolution', async () => {
  const rows = await Promise.all([getAppProfileRow('challenged'), getAppProfileRow('challenged'), getAppProfileRow('challenged')]);
  expect(rows.map(row => row.a55)).toEqual(['Care name', 'Care name', 'Care name']);
  expect(mocks.fetch).toHaveBeenCalledTimes(1);
  expect(mocks.cct).toHaveBeenCalledTimes(1);
});
it('starts the three independent own-profile reads before the core account finishes', async () => {
  let finish: ((value: object) => void) | undefined;
  mocks.core.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  mocks.name.mockResolvedValue('Care name');
  mocks.own.mockResolvedValue(null);
  const result = fetchMyProfileWordPress();
  await Promise.resolve();
  const nameStarted = mocks.name.mock.calls.length;
  const ownStarted = mocks.own.mock.calls.length;
  finish?.({ id: 'wp-70' });
  expect((await result)?.full_name).toBe('Care name');
  expect(nameStarted).toBe(1);
  expect(ownStarted).toBe(1);
});