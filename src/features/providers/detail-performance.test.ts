import { expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ rows: vi.fn(), user: vi.fn(), rating: vi.fn() }));
vi.mock("@/features/shared/wordpress-client", () => ({ wordpressCCTFetch: mocks.rows, wordpressFetch: vi.fn() }));
vi.mock("@/features/shared/wp-users", () => ({ fetchWPUserPublicProfile: mocks.user, fetchWPUserPublicProfiles: vi.fn() }));
vi.mock("@/features/reviews/source.wordpress", () => ({ fetchProviderRatingSummary: mocks.rating, fetchProviderRatingSummaries: vi.fn() }));
import { fetchProviderByIdWordPress } from "./source.wordpress";
it("starts profile identity before the dictionary read finishes and omits duplicate ratings", async () => {
  let resolveRows: (value: unknown[]) => void = () => {};
  mocks.rows.mockReturnValue(new Promise(resolve => { resolveRows = resolve; }));
  mocks.user.mockResolvedValue({ id: 46, full_name: "test1" });
  const pending = fetchProviderByIdWordPress("wp-46", false);
  expect(mocks.user).toHaveBeenCalledWith("46");
  expect(mocks.rating).not.toHaveBeenCalled();
  resolveRows([{ cct_author_id: "46", a59: "b55", a60: "b55" }]);
  expect((await pending)?.full_name).toBe("test1");
});