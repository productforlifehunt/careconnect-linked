import { afterEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ coreRead: vi.fn(), coreWrite: vi.fn(), row: vi.fn(), name: vi.fn(), saveName: vi.fn(), appRow: vi.fn(), appWrite: vi.fn(), cct: vi.fn() }));
vi.mock('@/features/shared/wordpress-adapter', () => ({ getWordPressFeature: mocks.coreRead, updateWordPressFeature: mocks.coreWrite }));
vi.mock('@/features/shared/wordpress-client', () => ({ wordpressCCTFetch: mocks.cct }));
vi.mock('@/features/shared/own-profile-row', () => ({ findOwnRow: mocks.row, linkOwnRow: vi.fn() }));
vi.mock('@/features/profile/app-user-name', () => ({ fetchMyAppUserName: mocks.name, saveMyAppUserName: mocks.saveName }));
vi.mock('@/features/shared/app-profile', () => ({ getAppProfileRow: mocks.appRow, patchAppProfile: mocks.appWrite, APP_PROFILE_F: { PHONE: 'a98' } }));
vi.mock('@/services/wp-auth', () => ({ getStoredWPUser: () => ({ user_id: 46 }) }));
import { fetchMyProfileWordPress, updateProfileWordPress } from './source.wordpress';
afterEach(() => vi.resetAllMocks());
it('saves biography to CCT258 a107, never WordPress description', async () => {
  mocks.row.mockResolvedValue({ _ID: '2581' });
  await updateProfileWordPress({ bio: '我的介绍' });
  expect(mocks.cct).toHaveBeenCalledWith('user_ext_profile_2', { id: '2581', method: 'PUT', body: { a107: '我的介绍' } });
  expect(mocks.coreWrite).not.toHaveBeenCalled();
});
it('saves optional phone to app-scoped CCT151 a98', async () => {
  await updateProfileWordPress({ phone: '12345678' });
  expect(mocks.appWrite).toHaveBeenCalledWith({ a98: '12345678' });
  expect(mocks.coreWrite).not.toHaveBeenCalled();
  expect(mocks.cct).not.toHaveBeenCalled();
});
it('reads biography and phone from the exact user-specified columns', async () => {
  mocks.coreRead.mockResolvedValue({ id: 'wp-46', bio: '旧 WordPress 简介', phone: '旧号码' });
  mocks.name.mockResolvedValue('本应用姓名');
  mocks.row.mockResolvedValue({ a107: '护理简介' });
  mocks.appRow.mockResolvedValue({ a01: 'challenged', a98: '12345678' });
  expect(await fetchMyProfileWordPress()).toMatchObject({ bio: '护理简介', phone: '12345678', full_name: '本应用姓名' });
});