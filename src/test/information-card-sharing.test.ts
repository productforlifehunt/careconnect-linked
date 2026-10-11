import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ cct: vi.fn(), fetch: vi.fn(), user: vi.fn() }));
vi.mock("@/features/shared/wordpress-client", () => ({ wordpressFetch: mocks.fetch, wordpressCCTFetch: mocks.cct }));
vi.mock("@/services/wp-auth", () => ({ getStoredWPUser: mocks.user }));
import { fetchSharedInformationCardWordPress, ShareAccessError } from "@/features/cared-ones/source.information-cards";
import { T } from "@/integrations/wp-schema";

describe("fixed card-ID sharing", () => {
  const f = T.infoCard.f;
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.user.mockReturnValue(null);
    mocks.cct.mockResolvedValue({ _ID: 42, [f.STATUS]: "b56", [f.DISPLAYS_LOCATION]: "b56", [f.SHARE_VISIBILITY]: "b55", [f.SHARE_TOKEN]: "obsolete", [f.SHARE_EXPIRES_AT]: "2000-01-01" });
  });
  it("opens public card by its existing ID without token or expiry state", async () => {
    expect((await fetchSharedInformationCardWordPress("42"))?.id).toBe("42");
    expect(mocks.cct).toHaveBeenCalledWith(T.infoCard.slug, { id: 42 });
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("uses new visibility on the exact same link", async () => {
    await fetchSharedInformationCardWordPress("42");
    mocks.cct.mockResolvedValue({ _ID: 42, [f.STATUS]: "b56", [f.DISPLAYS_LOCATION]: "b56", [f.SHARE_VISIBILITY]: "b57" });
    await expect(fetchSharedInformationCardWordPress("42")).rejects.toMatchObject({ reason: "login" });
  });
  it("denies an unrelated signed-in account", async () => {
    mocks.user.mockReturnValue({ user_id: 88 });
    mocks.fetch.mockResolvedValue([]);
    mocks.cct.mockResolvedValue({ _ID: 42, cct_author_id: 99, [f.STATUS]: "b56", [f.DISPLAYS_LOCATION]: "b56", [f.SHARE_VISIBILITY]: "b56" });
    await expect(fetchSharedInformationCardWordPress("42")).rejects.toBeInstanceOf(ShareAccessError);
    await expect(fetchSharedInformationCardWordPress("42")).rejects.toMatchObject({ reason: "forbidden" });
  });
  it("does not interpret old random codes as card IDs", async () => {
    expect(await fetchSharedInformationCardWordPress("obsolete-token")).toBeNull();
    expect(mocks.cct).not.toHaveBeenCalled();
  });
});