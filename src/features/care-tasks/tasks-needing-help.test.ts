import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  wordpressCCTFetch: vi.fn(),
  wordpressFetch: vi.fn(),
  fetchWPUserPublicProfile: vi.fn(),
}));

vi.mock("@/features/shared/wordpress-client", () => ({
  wordpressCCTFetch: mocks.wordpressCCTFetch,
  wordpressFetch: mocks.wordpressFetch,
}));

vi.mock("@/features/shared/wp-users", () => ({
  fetchWPUserPublicProfile: mocks.fetchWPUserPublicProfile,
}));

vi.mock("@/services/wp-auth", () => ({
  getStoredWPUser: () => ({ user_id: 70 }),
}));

import {
  fetchHelpTaskPostersWordPress,
  fetchHelpTaskRowsWordPress,
  fetchHelpTasksWordPress,
} from "./tasks-needing-help";
import { T } from "@/integrations/wp-schema";

const taskRow = {
  id: "17",
  cct_author_id: "42",
  [T.careTask.f.TITLE]: "Morning visit",
  [T.careTask.f.TASK_HELP_STATUS]:
    T.careTask.opt.TASK_HELP_STATUS.TASK_NEEDS_HELP,
};

describe("shared care task reads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.wordpressCCTFetch.mockResolvedValue([taskRow]);
    mocks.fetchWPUserPublicProfile.mockResolvedValue({
      full_name: "Care partner",
      avatar_url: "avatar.png",
      location: "Beijing",
    });
  });

  it("returns task rows without waiting for poster profile reads", async () => {
    const tasks = await fetchHelpTaskRowsWordPress();

    expect(tasks).toHaveLength(1);
    expect(tasks[0]?.title).toBe("Morning visit");
    expect(tasks[0]?.poster).toBeUndefined();
    expect(mocks.fetchWPUserPublicProfile).not.toHaveBeenCalled();
  });

  it("batches duplicate poster IDs and returns profiles keyed by user ID", async () => {
    const posters = await fetchHelpTaskPostersWordPress([42, "wp-42", 42]);

    expect(mocks.fetchWPUserPublicProfile).toHaveBeenCalledTimes(1);
    expect(mocks.fetchWPUserPublicProfile).toHaveBeenCalledWith(42);
    expect(posters["42"]).toMatchObject({
      full_name: "Care partner",
      avatar_url: "avatar.png",
    });
  });

  it("keeps the enriched read available to callers that need poster details", async () => {
    const tasks = await fetchHelpTasksWordPress();

    expect(tasks[0]?.poster).toMatchObject({
      id: "wp-42",
      full_name: "Care partner",
      avatar_url: "avatar.png",
      location: "Beijing",
    });
  });
});
