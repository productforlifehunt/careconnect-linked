import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchCCT = vi.fn();
const fetchWP = vi.fn();

vi.mock("@/features/shared/wordpress-client", () => ({
  wordpressCCTFetch: (...args: any[]) => fetchCCT(...args),
  wordpressFetch: (...args: any[]) => fetchWP(...args),
}));

import {
  createCommunityPostWordPress,
  deleteCommunityPostWordPress,
  fetchCommunityPostByIdWordPress,
  fetchCommunityPostsWordPress,
  updateCommunityPostWordPress,
} from "@/features/community-posts/source.wordpress";
import { communityAppName } from "@/features/shared/app-scope";
import { fetchPostsWordPress } from "@/features/posts/source.wordpress";
import { T } from "@/integrations/wp-schema";

function setSite(site: string) {
  window.history.replaceState({}, "", `/?__site=${site}`);
}

beforeEach(() => {
  fetchCCT.mockReset();
  fetchWP.mockReset();
  setSite("challenged");
});

describe("CCT 149 app separation", () => {
  it("stores the app name in the latest a01 text field", () => {
    expect(T.afreshCommunityPost.f.COMMUNITY_TYPE).toBe("a01");
    expect(communityAppName()).toBe("challenged");
  });

  it.each([
    ["afresh", "afresh"],
    ["adry", "adry"],
    ["ablocked", "ablocked"],
    ["benotch", "benotch"],
    ["challenged-p1-v1", "challenged"],
    ["carecnc", "carecnc"],
    ["safety", "benotch"],
  ])("resolves %s to the canonical app name", (site, appName) => {
    setSite(site);
    expect(communityAppName()).toBe(appName);
  });

  it("filters list responses to exact current-app rows", async () => {
    setSite("adry");
    fetchCCT.mockResolvedValue([
      { id: "1", a01: "adry", a55: "ADRY post" },
      { id: "2", a01: "afresh", a55: "Afresh post" },
      { id: "3", a01: "", a55: "Unscoped post" },
    ]);

    const posts = await fetchCommunityPostsWordPress();

    expect(fetchCCT).toHaveBeenCalledWith("afresh_community_pos", {
      params: { _limit: 50, a01: "adry" },
    });
    expect(posts.map((post) => post.id)).toEqual(["1"]);
  });

  it("connects app area, language, and category filters to their CCT fields", async () => {
    setSite("carecnc");
    fetchCCT.mockResolvedValue([
      { id: "1", a01: "carecnc", a58: "b56", a55: "简体中文" },
      { id: "2", a01: "carecnc", a58: "b55", a55: "English" },
    ]);

    const posts = await fetchPostsWordPress("care_community_post", "china", undefined, 20, "zh-CN");

    expect(fetchCCT).toHaveBeenCalledWith("afresh_community_pos", {
      params: { _limit: 20, a01: "carecnc", a60: "b55" },
    });
    expect(posts.map((post) => post.id)).toEqual(["1"]);
  });

  it("stamps the lowercase app name on new posts", async () => {
    setSite("benotch");
    fetchCCT.mockResolvedValue({ item_id: 12 });

    await createCommunityPostWordPress({ title: "Title", content: "Body" });

    expect(fetchCCT).toHaveBeenCalledWith("afresh_community_pos", {
      method: "POST",
      body: { a55: "Title", a56: "Body", a01: "benotch", a59: "", a58: "", a60: "" },
    });
  });

  it("hides cross-app posts opened directly by id", async () => {
    fetchCCT.mockResolvedValue({ id: "8", a01: "carecnc", a55: "Other app" });

    await expect(fetchCommunityPostByIdWordPress("8")).resolves.toBeNull();
  });

  it("does not update or delete a post from another app", async () => {
    setSite("adry");
    fetchCCT.mockResolvedValue({ id: "8", a01: "afresh" });

    await expect(updateCommunityPostWordPress("8", { title: "Changed" })).rejects.toThrow(/不属于当前 App/);
    await expect(deleteCommunityPostWordPress("8")).rejects.toThrow(/不属于当前 App/);
    expect(fetchCCT).toHaveBeenCalledTimes(2);
    expect(fetchCCT).not.toHaveBeenCalledWith("afresh_community_pos", expect.objectContaining({ method: "PUT" }));
    expect(fetchCCT).not.toHaveBeenCalledWith("afresh_community_pos", expect.objectContaining({ method: "DELETE" }));
  });

  it("keeps the app association on an in-app edit", async () => {
    setSite("afresh");
    fetchCCT.mockResolvedValueOnce({ id: "8", a01: "afresh" }).mockResolvedValueOnce({});

    await updateCommunityPostWordPress("8", { title: "Updated" });

    expect(fetchCCT).toHaveBeenNthCalledWith(2, "afresh_community_pos", {
      id: "8",
      method: "PUT",
      body: { a01: "afresh", a55: "Updated" },
    });
  });
});
