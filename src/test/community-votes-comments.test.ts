import { describe, it, expect, vi, beforeEach } from "vitest";

const fetchCCT = vi.fn();
const fetchWP = vi.fn();
const relMap = vi.fn();
vi.mock("@/features/shared/wordpress-client", () => ({
  wordpressCCTFetch: (...a: any[]) => fetchCCT(...a),
  wordpressFetch: (...a: any[]) => fetchWP(...a),
}));
vi.mock("@/features/shared/rel-batch", () => ({
  dedupeRead: (_key: string, fn: () => unknown) => fn(),
  fetchRelChildrenMap: (...a: any[]) => relMap(...a),
  fetchRelChildrenOf: async (rel: any, pid: any) => ((await relMap(rel)).get(String(pid)) || []),
}));
vi.mock("@/features/shared/current-user", () => ({ getCurrentUserId: () => "7" }));

import { R } from "@/integrations/wp-schema";
import { summarize, toggleVote, fetchVoteSummaries } from "@/features/votes/source.wordpress";
import { createCommentWordPress, fetchCommentsWordPress } from "@/features/comments/source.wordpress";

function map(entries: Record<string, string[]>) {
  const m: any = new Map(Object.entries(entries).map(([k, v]) => [k, v.map((childId) => ({ childId, meta: null }))]));
  m.loaded = true;
  return m;
}

beforeEach(() => { fetchCCT.mockReset(); fetchWP.mockReset(); relMap.mockReset(); });

describe("dictionary relation numbers", () => {
  it("post votes use REL 166, comment votes REL 167", () => {
    expect(R.communityPostVotes).toBe(166);
    expect(R.commentVotes).toBe(167);
  });
  it("comment relations are 150 / 142 / 229 / 236 / 143", () => {
    expect(R.communityPostComments).toBe(150);
    expect(R.commentReplies).toBe(142);
    expect(R.careGroupPostComments).toBe(229);
    expect(R.careTaskComments).toBe(236);
    expect(R.reviewComments).toBe(143);
  });
});

describe("vote tally (CCT 30 a55: b55 up, b56 down)", () => {
  it("counts codes and marks my vote", () => {
    const s = summarize([
      { value: 1, authorId: "7" }, { value: 1, authorId: "8" }, { value: -1, authorId: "9" }, { value: 0, authorId: "10" },
    ], "7");
    expect(s).toEqual({ score: 1, upvotes: 2, downvotes: 1, userVote: 1 });
  });
  it("legacy text value 'Upvote' is not counted", async () => {
    relMap.mockResolvedValue(map({ "1": ["6"] }));
    fetchCCT.mockResolvedValue({ id: "6", a55: "Upvote", author_id: "1" });
    const out = await fetchVoteSummaries(R.communityPostVotes, ["1"]);
    expect(out["1"]!.upvotes).toBe(0);
  });
  it("rejects a non-vote relation", async () => {
    await expect(fetchVoteSummaries(150, ["1"])).rejects.toThrow(/not a vote relation/);
  });
});

describe("toggleVote", () => {
  it("creates vote b55 and links it on REL 167", async () => {
    relMap.mockResolvedValue(map({}));
    fetchCCT.mockResolvedValueOnce({ item_id: 55 });
    fetchWP.mockResolvedValue({});
    await toggleVote(R.commentVotes, "12", 1);
    expect(fetchCCT).toHaveBeenCalledWith("vote", { method: "POST", body: { a55: "b55" } });
    expect(fetchWP).toHaveBeenCalledWith("jet-rel/167", expect.objectContaining({ body: expect.objectContaining({ parent_id: 12, child_id: 55 }) }));
  });
  it("deletes the new vote row when linking fails", async () => {
    relMap.mockResolvedValue(map({}));
    fetchCCT.mockResolvedValueOnce({ item_id: 55 }).mockResolvedValueOnce({});
    fetchWP.mockRejectedValue(new Error("403"));
    await expect(toggleVote(R.communityPostVotes, "3", -1)).rejects.toThrow("403");
    expect(fetchCCT).toHaveBeenLastCalledWith("vote", { id: "55", method: "DELETE" });
  });
  it("same value again removes my vote", async () => {
    relMap.mockResolvedValue(map({ "3": ["40"] }));
    fetchCCT.mockResolvedValueOnce({ id: "40", a55: "b55", author_id: "7" }).mockResolvedValue({});
    fetchWP.mockResolvedValue({});
    await toggleVote(R.communityPostVotes, "3", 1);
    expect(fetchWP).toHaveBeenCalledWith("jet-rel/166", expect.objectContaining({ body: expect.objectContaining({ store_items_type: "disconnect", child_id: 40 }) }));
    expect(fetchCCT).toHaveBeenLastCalledWith("vote", { id: "40", method: "DELETE" });
  });
});

describe("comments", () => {
  it("article/community comment links on REL 150; reply links on REL 142", async () => {
    fetchCCT.mockResolvedValue({ item_id: 90 });
    fetchWP.mockResolvedValue({});
    await createCommentWordPress({ relationId: R.communityPostComments, parentId: "wp-5", content: "hi" });
    expect(fetchWP).toHaveBeenLastCalledWith("jet-rel/150", expect.objectContaining({ body: expect.objectContaining({ parent_id: 5, child_id: 90 }) }));
    await createCommentWordPress({ relationId: R.communityPostComments, parentId: "5", content: "re", replyToCommentId: "90" });
    expect(fetchWP).toHaveBeenLastCalledWith("jet-rel/142", expect.objectContaining({ body: expect.objectContaining({ parent_id: 90 }) }));
  });
  it("care group post comments use REL 229, not 150", async () => {
    fetchCCT.mockResolvedValue({ item_id: 91 });
    fetchWP.mockResolvedValue({});
    await createCommentWordPress({ relationId: R.careGroupPostComments, parentId: "8", content: "x" });
    expect(fetchWP).toHaveBeenLastCalledWith("jet-rel/229", expect.anything());
  });
  it("rejects a relation that is not a comment relation", async () => {
    await expect(createCommentWordPress({ relationId: 166, parentId: "1", content: "x" })).rejects.toThrow(/not a comment relation/);
  });
  it("loads REL 142 replies under each comment", async () => {
    relMap.mockImplementation(async (id: number) => (id === 150 ? map({ "1": ["2"] }) : map({ "2": ["3"] })));
    fetchCCT.mockImplementation(async (_s: string, { id }: any) => ({ id, a56: `c${id}`, author_id: "7", created_at: id }));
    const out = await fetchCommentsWordPress(R.communityPostComments, "1");
    expect(out.map((c) => c.id)).toEqual(["2"]);
    expect(out[0]!.replies.map((r) => r.id)).toEqual(["3"]);
  });
});
