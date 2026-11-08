import { beforeEach, describe, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ fetch: vi.fn(), cct: vi.fn(), user: vi.fn(), caredOneIds: vi.fn() }));
vi.mock("@/features/shared/wordpress-client", () => ({ wordpressFetch: m.fetch, wordpressCCTFetch: m.cct }));
vi.mock("@/services/wp-auth", () => ({ getStoredWPUser: m.user }));
vi.mock("@/features/shared/current-user", () => ({
  getCurrentUserId: () => m.user()?.user_id,
  getCurrentUserIdNumber: () => Number(m.user()?.user_id || 0),
}));
vi.mock("@/features/shared/rel-batch", () => ({ dedupeRead: (_key: string, fn: () => unknown) => fn() }));
vi.mock("@/features/shared/wp-users", () => ({ fetchWPUserProfile: vi.fn() }));
vi.mock("@/features/profile/app-user-name", () => ({ fetchMyAppUserName: vi.fn() }));
vi.mock("@/features/cared-ones/source.wordpress", () => ({
  fetchUserCaredOneIdsWordPress: () => m.caredOneIds(),
  fetchUserCaredOnesWordPress: async () => [],
}));
import { fetchCareGroupsWordPress } from "@/features/care-groups/source.wordpress";
import { fetchNotificationsWordPress } from "@/features/notifications/source.wordpress";
import { fetchCareTasksWordPress } from "@/features/care-tasks/source.wordpress";
import { R, T } from "@/integrations/wp-schema";

describe("private lists resolve user relations, not whole-app CCT lists", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    m.user.mockReturnValue({ user_id: 88 });
    m.caredOneIds.mockResolvedValue([]);
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
  it("reuses normalized authored rows and avoids per-task detail reads for the dashboard", async () => {
    const row = {
      id: "27",
      author_id: 88,
      [T.careTask.f.TITLE]: "My task",
      [T.careTask.f.TASK_FINISH_STATUS]: T.careTask.opt.TASK_FINISH_STATUS.NOT_FINISHED,
      [T.careTask.f.TASK_HELP_STATUS]: T.careTask.opt.TASK_HELP_STATUS.TASK_DOESN_T_NEED_HELP,
    };
    m.cct.mockResolvedValueOnce([row]);
    m.fetch.mockImplementation(async (path: string) =>
      path === `jet-rel/${R.careTaskAssignees}/parents/88`
        ? [{ parent_object_id: "27" }]
        : [],
    );

    const tasks = await fetchCareTasksWordPress(undefined, { includeAssignees: false });

    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({ id: "27", assigned_to_ids: ["wp-88"], cared_one_id: null });
    expect(m.cct).toHaveBeenCalledExactlyOnceWith(T.careTask.slug, { params: { cct_author_id: 88, _limit: 100 } });
    expect(m.fetch.mock.calls.some(([path]) => String(path).endsWith("/children/27"))).toBe(false);
  });
  it("loads cared-one task summaries only through the user's cared-one links", async () => {
    m.caredOneIds.mockResolvedValue(["wp-99"]);
    m.fetch.mockImplementation(async (path: string) =>
      path === `jet-rel/${R.careTaskCaredOnes}/parents/99`
        ? [{ parent_object_id: "27" }]
        : [],
    );
    m.cct.mockResolvedValue({
      _ID: 27,
      [T.careTask.f.TITLE]: "Cared-one task",
      [T.careTask.f.TASK_FINISH_STATUS]: T.careTask.opt.TASK_FINISH_STATUS.NOT_FINISHED,
      [T.careTask.f.TASK_HELP_STATUS]: T.careTask.opt.TASK_HELP_STATUS.TASK_DOESN_T_NEED_HELP,
    });

    const tasks = await fetchCareTasksWordPress(undefined, {
      caredOneOnly: true,
      includeAssignees: false,
      includeAssignmentStatus: false,
      visibleToCurrentUser: true,
    });

    expect(tasks).toMatchObject([{ id: "27", cared_one_id: "wp-99", title: "Cared-one task" }]);
    expect(m.cct).toHaveBeenCalledExactlyOnceWith(T.careTask.slug, { id: "27" });
    expect(m.fetch.mock.calls.some(([path]) => path === `jet-rel/${R.careTaskAssignees}/parents/88`)).toBe(false);
    expect(m.fetch.mock.calls.some(([path]) => path === `jet-rel/${R.careGroupTasks}`)).toBe(false);
  });
  it("starts task-scoped assignee reads before waiting for task details", async () => {
    m.caredOneIds.mockResolvedValue(["wp-99"]);
    m.fetch.mockImplementation(async (path: string) =>
      path === `jet-rel/${R.careTaskCaredOnes}/parents/99`
        ? [{ parent_object_id: "27" }]
        : [],
    );

    let resolveTask!: (task: Record<string, unknown>) => void;
    m.cct.mockImplementation(
      () => new Promise((resolve) => { resolveTask = resolve; }),
    );
    const taskLoad = fetchCareTasksWordPress(undefined, {
      caredOneOnly: true,
      includeAssignees: true,
      includeAssignmentStatus: false,
    });

    await vi.waitFor(() => {
      expect(m.fetch).toHaveBeenCalledWith(`jet-rel/${R.careTaskAssignees}/children/27`);
    });
    resolveTask({
      _ID: 27,
      [T.careTask.f.TITLE]: "Cared-one task",
      [T.careTask.f.TASK_FINISH_STATUS]: T.careTask.opt.TASK_FINISH_STATUS.NOT_FINISHED,
      [T.careTask.f.TASK_HELP_STATUS]: T.careTask.opt.TASK_HELP_STATUS.TASK_DOESN_T_NEED_HELP,
    });

    await expect(taskLoad).resolves.toMatchObject([
      { id: "27", cared_one_id: "wp-99", title: "Cared-one task", assignees: [] },
    ]);
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
