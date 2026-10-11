import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ cct: vi.fn(), fetch: vi.fn(), user: vi.fn() }));
vi.mock("@/features/shared/wordpress-client", () => ({ wordpressFetch: mocks.fetch, wordpressCCTFetch: mocks.cct }));
vi.mock("@/services/wp-auth", () => ({ getStoredWPUser: mocks.user }));
import { fetchSharedInformationCardWordPress, ShareAccessError, updateInformationCardWordPress, deleteInformationCardWordPress } from "@/features/cared-ones/source.information-cards";
import { T, R } from "@/integrations/wp-schema";
import { REL219_STATUS_FIELD, REL219_STATUS_CODE } from "@/features/cared-ones/rel219-meta";

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

describe("all four information-card visibility scopes", () => {
  const f = T.infoCard.f;
  const scenarios = [
    { name: "visitor", user: 0, status: null, group: false, author: false, expected: [true, false, false, false] },
    { name: "unrelated user", user: 88, status: null, group: false, author: false, expected: [true, false, false, false] },
    { name: "accepted caregiver", user: 88, status: "accepted", group: false, author: false, expected: [true, false, true, true] },
    { name: "pending caregiver", user: 88, status: "pending", group: false, author: false, expected: [true, false, false, false] },
    { name: "declined caregiver", user: 88, status: "declined", group: false, author: false, expected: [true, false, false, false] },
    { name: "same care-group member", user: 88, status: null, group: true, author: false, expected: [true, true, false, true] },
    { name: "caregiver and group member", user: 88, status: "accepted", group: true, author: false, expected: [true, true, true, true] },
    { name: "card author", user: 88, status: null, group: false, author: true, expected: [true, true, true, true] },
    { name: "cared one without other role", user: 46, status: null, group: false, author: false, expected: [true, false, false, false] },
  ] as const;
  for (const scenario of scenarios) {
    for (const [index, code] of ["b55", "b56", "b57", "b58"].entries()) {
      it(`${scenario.name} / ${code}: ${scenario.expected[index] ? "allow" : "deny"}`, async () => {
        vi.resetAllMocks();
        mocks.user.mockReturnValue(scenario.user ? { user_id: scenario.user } : null);
        mocks.cct.mockResolvedValue({ _ID: 42, cct_author_id: scenario.author ? scenario.user : 99, [f.STATUS]: "b56", [f.DISPLAYS_LOCATION]: "b56", [f.SHARE_VISIBILITY]: code });
        mocks.fetch.mockImplementation(async (endpoint: string) => {
          if (endpoint === `jet-rel/${R.caredOneInfoCards}/parents/42`) return [{ parent_object_id: 46 }];
          if (endpoint === `jet-rel/${R.userCaredOnes}/children/${scenario.user}`) return scenario.status ? [{ child_object_id: 46, meta: { [REL219_STATUS_FIELD]: REL219_STATUS_CODE[scenario.status] } }] : [];
          if (endpoint === `jet-rel/${R.careGroupMembers}/parents/${scenario.user}`) return scenario.group ? [{ parent_object_id: 200 }] : [];
          if (endpoint === `jet-rel/${R.careGroupMembers}/children/200`) return [{ child_object_id: 46 }];
          return [];
        });
        if (scenario.expected[index]) expect((await fetchSharedInformationCardWordPress("42"))?.id).toBe("42");
        else await expect(fetchSharedInformationCardWordPress("42")).rejects.toMatchObject({ reason: scenario.user ? "forbidden" : "login" });
        expect(mocks.cct.mock.calls.every(([, options]) => !options.method)).toBe(true);
      });
    }
  }
  it("documents that update has no local relationship authorization (mock only, no real write)", async () => {
    vi.resetAllMocks();
    mocks.user.mockReturnValue(null);
    mocks.cct.mockResolvedValue({});
    await updateInformationCardWordPress("42", { cared_ones_name: "unchanged fixture" });
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(mocks.cct).toHaveBeenCalledWith(T.infoCard.slug, expect.objectContaining({ method: "PUT" }));
  });
  it("documents that delete has no local relationship authorization (mock only, no real deletion)", async () => {
    vi.resetAllMocks();
    mocks.user.mockReturnValue(null);
    mocks.cct.mockResolvedValue({});
    await deleteInformationCardWordPress("42");
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(mocks.cct).toHaveBeenCalledWith(T.infoCard.slug, expect.objectContaining({ method: "DELETE" }));
  });
});