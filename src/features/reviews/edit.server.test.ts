import { afterEach, expect, it, vi } from "vitest";
import { editOwnReview } from "./edit.server";

afterEach(() => vi.unstubAllGlobals());

it("rejects a caregiver editing somebody else's review without writing", async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(Response.json({ id: 46 })).mockResolvedValueOnce(Response.json({ cct_author_id: 70 }));
  vi.stubGlobal("fetch", fetcher);
  await expect(editOwnReview({ id: "118", rating: 5, content: "changed" }, new Request("http://localhost", { headers: { "X-WP-Token": "test-session" } }))).rejects.toMatchObject({ status: 403 });
  expect(fetcher).toHaveBeenCalledTimes(2);
});

it("allows the saved writer to update only content and rating", async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(Response.json({ id: 70 })).mockResolvedValueOnce(Response.json({ cct_author_id: "70" })).mockResolvedValueOnce(Response.json({ success: true }));
  vi.stubGlobal("fetch", fetcher);
  await editOwnReview({ id: "118", rating: 4, content: "updated" }, new Request("http://localhost", { headers: { "X-WP-Token": "test-session" } }));
  expect(JSON.parse(fetcher.mock.calls[2]?.[1]?.body)).toEqual({ a56: "updated", a57: "4" });
});