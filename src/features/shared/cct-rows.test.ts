import { afterEach, beforeEach, expect, it, vi } from "vitest";
const wordpress = vi.hoisted(() => ({ cct: vi.fn(), fetch: vi.fn() }));
vi.mock("./wordpress-client", () => ({
  wordpressCCTFetch: wordpress.cct,
  wordpressFetch: wordpress.fetch,
}));
import { readLinkedCCTRows } from "./cct-rows";
import { invalidateRead } from "./rel-batch";

beforeEach(() => {
  invalidateRead();
  wordpress.cct.mockReset();
  window.localStorage.setItem("cc_wp_token", "test-token");
  window.localStorage.setItem("cc_wp_user", JSON.stringify({ user_id: 70 }));
});
afterEach(() => {
  invalidateRead();
  window.localStorage.clear();
});
it("fifteen already-related rows use one native-filtered request", async () => {
  const ids = Array.from({ length: 15 }, (_, i) => String(140 + i));
  wordpress.cct.mockResolvedValue(ids.map((id) => ({ id })));
  expect((await readLinkedCCTRows("users_extended_prof", ids)).length).toBe(15);
  expect(wordpress.cct).toHaveBeenCalledTimes(1);
  const params = wordpress.cct.mock.calls[0]?.[1].params;
  expect(JSON.parse(params._filters)).toEqual([
    { field: "_ID", operator: "IN", value: ids, type: "integer" },
  ]);
});
it("no relation IDs means no CCT request", async () => {
  expect(await readLinkedCCTRows("users_extended_prof", [])).toEqual([]);
  expect(wordpress.cct).not.toHaveBeenCalled();
});
it("rejects an ignored filter instead of accepting another user row", async () => {
  wordpress.cct.mockResolvedValue([{ id: "999" }]);
  await expect(
    readLinkedCCTRows("users_extended_prof", ["144", "145"]),
  ).rejects.toThrow("unrelated rows");
});
it("reuses profile CCT rows across views and invalidates them after a write", async () => {
  const ids = ["151", "152"];
  wordpress.cct.mockResolvedValue(ids.map((id) => ({ id })));

  await readLinkedCCTRows("users_extended_prof", ids);
  await readLinkedCCTRows("users_extended_prof", ids);
  expect(wordpress.cct).toHaveBeenCalledTimes(1);

  window.dispatchEvent(new Event("wp-write"));
  await readLinkedCCTRows("users_extended_prof", ids);
  expect(wordpress.cct).toHaveBeenCalledTimes(2);
});
