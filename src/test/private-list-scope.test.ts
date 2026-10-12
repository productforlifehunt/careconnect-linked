import { beforeEach, describe, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ fetch: vi.fn(), cct: vi.fn(), user: vi.fn() }));
vi.mock("@/features/shared/wordpress-client", () => ({ wordpressFetch: m.fetch, wordpressCCTFetch: m.cct }));
vi.mock("@/services/wp-auth", () => ({ getStoredWPUser: m.user }));
vi.mock("@/features/shared/current-user", () => ({ getCurrentUserId: () => m.user()?.user_id }));
vi.mock("@/features/shared/rel-batch", () => ({ dedupeRead: (_key: string, fn: () => unknown) => fn() }));
vi.mock("@/features/shared/wp-users", () => ({ fetchWPUserProfile: vi.fn() }));
vi.mock("@/features/profile/app-user-name", () => ({ fetchMyAppUserName: vi.fn() }));
vi.mock("@/features/cared-ones/source.wordpress", () => ({ fetchUserCaredOnesWordPress: async () => [] }));
import { fetchCareGroupsWordPress } from "@/features/care-groups/source.wordpress";
import { fetchNotificationsWordPress } from "@/features/notifications/source.wordpress";
import { fetchCareTasksWordPress } from "@/features/care-tasks/source.wordpress";
import { R, T } from "@/integrations/wp-schema";

describe("private lists resolve user relations, not whole-app CCT lists", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    m.user.mockReturnValue({ user_id: 88 });
    m.fetch.mockResolvedValue([]);
    m.cct.mockResolvedValue([]);
  });
  it("an unconnected account reads no group rows", async () => {
    expect(await fetchCareGroupsWordPress()).toEqual([]);
    expect(m.cct).not.toHaveBeenCalled();
  });
  it("groups beyond the old first-100 limit are loaded by relation ID", async () => {
    m.fetch.mockResolvedValue([{ parent_object_id: 999 }]);
    m.cct.mockResolvedValue({ _ID: 999, a55: "Own group", a57: "b56" });
    expect((await fetchCareGroupsWordPress()).map((g) => g.id)).toEqual(["999"]);
    expect(m.cct).toHaveBeenCalledExactlyOnceWith(T.careGroup.slug, { id: "999" });
  });
  it("notifications load only recipient-linked rows, deduplicated", async () => {
    m.fetch.mockResolvedValue([{ child_object_id: 5 }, { child_object_id: 5 }]);
    m.cct.mockResolvedValue({ _ID: 5 });
    expect((await fetchNotificationsWordPress()).map((n) => n.id)).toEqual(["5"]);
    expect(m.cct).toHaveBeenCalledExactlyOnceWith(T.notification.slug, { id: "5" });
  });
  it("no relationship means no whole-app task list", async () => {
    expect(await fetchCareTasksWordPress()).toEqual([]);
    expect(m.cct).toHaveBeenCalledExactlyOnceWith(T.careTask.slug, { params: { cct_author_id: 88, _limit: 100 } });
    expect(m.fetch.mock.calls.every(([path]) => path !== `jet-rel/${R.careTaskAssignees}`)).toBe(true);
  });
  it("empty group task relation downloads no CCT rows", async () => {
    expect(await fetchCareTasksWordPress("200")).toEqual([]);
    expect(m.cct).not.toHaveBeenCalled();
  });
  it("signed-out users cannot load private task lists", async () => {
    m.user.mockReturnValue(null);
    expect(await fetchCareTasksWordPress()).toEqual([]);
    expect(m.fetch).not.toHaveBeenCalled();
    expect(m.cct).not.toHaveBeenCalled();
  });
});