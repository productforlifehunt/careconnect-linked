import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ request: vi.fn(), provider: vi.fn() }));
vi.mock("@/features/shared/wordpress-client", () => ({ wordpressFetch: mocks.request }));
vi.mock("@/services/wp-auth", () => ({ getStoredWPUser: () => ({ user_id: 46 }) }));
vi.mock("@/features/providers/source.wordpress", () => ({ fetchProviderByIdWordPress: mocks.provider }));
import { fetchSavedProviderIdsWordPress, toggleSavedProviderWordPress } from "./source.wordpress";
beforeEach(() => vi.clearAllMocks());
it("reads favorite membership without loading any provider profiles", async () => {
  mocks.request.mockResolvedValue([{ child_object_id: "70" }]);
  expect(await fetchSavedProviderIdsWordPress()).toEqual(["70"]);
  expect(mocks.provider).not.toHaveBeenCalled();
});
it("saves with one relationship write and no preflight read", async () => {
  mocks.request.mockResolvedValue({ success: true });
  expect(await toggleSavedProviderWordPress("wp-70", false)).toBe(true);
  expect(mocks.request).toHaveBeenCalledTimes(1);
  expect(mocks.request).toHaveBeenCalledWith("jet-rel/295", { method: "POST", body: { parent_id: 46, child_id: 70, context: "child", store_items_type: "update" } });
});
it("removes only the chosen caregiver through the existing relation", async () => {
  mocks.request.mockResolvedValue({ success: true });
  expect(await toggleSavedProviderWordPress("wp-70", true)).toBe(false);
  expect(mocks.request).toHaveBeenCalledWith("jet-rel/295", { method: "POST", body: { parent_id: 46, child_id: 70, context: "child", store_items_type: "disconnect" } });
});