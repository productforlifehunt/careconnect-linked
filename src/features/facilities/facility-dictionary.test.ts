import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ cct: vi.fn(), fetch: vi.fn(), user: vi.fn() }));
vi.mock("@/features/shared/wordpress-client", () => ({ wordpressCCTFetch: m.cct, wordpressFetch: m.fetch }));
vi.mock("@/services/wp-auth", () => ({ getStoredWPUser: m.user }));
vi.mock("@/features/reviews/source.wordpress", () => ({ fetchRatingSummary: vi.fn() }));

import { addFacilityMemberWordPress, createCareFacilityWordPress, createFacilityOwnershipClaimWordPress, fetchFacilityMembersWordPress, getMyFacilityPermissionWordPress } from "./source.wordpress-extended";

describe("uploaded facility dictionary", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    m.user.mockReturnValue({ user_id: 70 });
    m.fetch.mockResolvedValue([]);
    m.cct.mockImplementation(async (slug) => ({ item_id: slug === "care_facility" ? 21501 : 28801 }));
  });

  it("new facility remains unapproved and claiming never creates an owner membership", async () => {
    await createCareFacilityWordPress({ name: "Test facility", isOwner: true, ownerRole: "CEO", ownershipClaim: "Please review" });
    expect(m.cct.mock.calls[0]).toMatchObject(["care_facility", { body: { a55: "Test facility", a65: "b56" } }]);
    expect(m.cct.mock.calls[1]).toMatchObject(["ownership_claim", { body: { a57: "b55", a58: "b56" } }]);
    expect(m.cct.mock.calls[1]?.[1].body.a55).toContain("CEO");
    expect(m.fetch.mock.calls.some(([path]) => path === "jet-rel/249")).toBe(false);
    expect(m.fetch.mock.calls).toContainEqual(["jet-rel/291", { method: "POST", body: { parent_id: 21501, child_id: 28801, context: "parent", store_items_type: "update" } }]);
  });

  it("claim authentication is checked before creating any facility", async () => {
    m.user.mockReturnValue(null);
    await expect(createCareFacilityWordPress({ name: "Test", isOwner: true })).rejects.toThrow();
    expect(m.cct).not.toHaveBeenCalled();
  });

  it("member type writes a checkbox array and explicit empty role text", async () => {
    await addFacilityMemberWordPress("21501", "wp-70", { type: "admin", roleLabel: "" });
    expect(m.fetch).toHaveBeenLastCalledWith("jet-rel/249", { method: "POST", body: { parent_id: 21501, child_id: 70, context: "child", store_items_type: "update", meta: { a55: ["b57"], a56: "" } } });
  });

  it("member reads retain owner and admin checkbox flags with a separate free-text role", async () => {
    m.fetch.mockResolvedValue([{ id: 1, child_object_id: 70, meta: { a55: ["b56", "b57"], a56: "Director" } }]);
    const rows = await fetchFacilityMembersWordPress("21501");
    expect(rows[0]).toMatchObject({ is_owner: true, is_admin: true, member_types: ["b56", "b57"], role_label: "Director" });
    expect(await getMyFacilityPermissionWordPress("21501")).toMatchObject({ canEdit: true });
  });

  it("ordinary members do not receive edit permission", async () => {
    m.fetch.mockResolvedValue([{ id: 1, child_object_id: 70, meta: { a55: ["b55"] } }]);
    expect(await getMyFacilityPermissionWordPress("21501")).toMatchObject({ canEdit: false });
  });

  it("a submitted dispute is always pending, never caller-approved", async () => {
    await createFacilityOwnershipClaimWordPress({ facility_id: "21501", is_dispute: true, ...({ status: "approved" } as Record<string, unknown>) });
    expect(m.cct).toHaveBeenCalledWith("ownership_claim", expect.objectContaining({ body: expect.objectContaining({ a57: "b55", a58: "b55", a59: "" }) }));
  });
});