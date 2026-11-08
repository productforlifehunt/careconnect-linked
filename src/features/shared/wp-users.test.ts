import { afterEach, expect, it, vi } from "vitest";
import { T } from "@/integrations/wp-schema";
import { APP_PROFILE_F } from "@/features/shared/app-profile";

const mocks = vi.hoisted(() => ({
  wordpressFetch: vi.fn(),
  wordpressCCTFetch: vi.fn(),
}));

vi.mock("@/features/shared/wordpress-client", () => ({
  wordpressFetch: mocks.wordpressFetch,
  wordpressCCTFetch: mocks.wordpressCCTFetch,
}));

import { invalidateRead } from "@/features/shared/rel-batch";
import { fetchWPUserProfile, fetchWPUserPublicProfiles } from "./wp-users";

afterEach(() => {
  invalidateRead();
  window.dispatchEvent(new Event("wp-write"));
  window.localStorage.clear();
  vi.clearAllMocks();
});

it("shares linked profile CCT reads across a token refresh and clears them after writes", async () => {
  window.localStorage.setItem("cc_wp_token", "test-token");
  window.localStorage.setItem("cc_wp_user", JSON.stringify({ user_id: 70 }));
  mocks.wordpressFetch.mockImplementation(async (endpoint: string) => {
    if (endpoint === "wp/v2/users") {
      return [
        {
          id: 70,
          name: "WordPress Name",
          slug: "member-70",
          roles: ["subscriber"],
        },
      ];
    }
    if (endpoint === "jet-rel/152/children/70") {
      return [{ child_object_id: "151" }];
    }
    if (endpoint === "jet-rel/259/children/70") {
      return [{ child_object_id: "258" }];
    }
    return [];
  });
  mocks.wordpressCCTFetch.mockImplementation(async (slug: string) => {
    if (slug === T.userProfile.slug) {
      return {
        id: "151",
        [APP_PROFILE_F.APP]: "challenged",
        [APP_PROFILE_F.NAME]: "Family Display Name",
      };
    }
    return {
      id: "258",
      [T.userProfile2.f.CARED_ONE_S_CONDITION_TYPE]: '["Dementia"]',
    };
  });

  const first = await fetchWPUserProfile(70);
  window.localStorage.setItem("cc_wp_token", "refreshed-token");
  const second = await fetchWPUserProfile(70);

  expect(first.full_name).toBe("Family Display Name");
  expect(second.full_name).toBe("Family Display Name");
  expect(mocks.wordpressFetch).toHaveBeenCalledWith("jet-rel/152/children/70");
  expect(mocks.wordpressFetch).toHaveBeenCalledWith("jet-rel/259/children/70");
  expect(mocks.wordpressFetch).not.toHaveBeenCalledWith("jet-rel/152");
  expect(mocks.wordpressFetch).not.toHaveBeenCalledWith("jet-rel/259");
  expect(mocks.wordpressCCTFetch).toHaveBeenCalledTimes(2);

  window.dispatchEvent(new Event("wp-write"));
  await fetchWPUserProfile(70);
  expect(mocks.wordpressCCTFetch).toHaveBeenCalledTimes(4);
});

it("batch reads app-scoped public profiles after resolving each user's relation", async () => {
  mocks.wordpressFetch.mockImplementation(async (endpoint: string) => {
    if (endpoint === "wp/v2/users") {
      return [
        { id: 70, name: "WP Name 70", slug: "member-70", roles: [] },
        { id: 71, name: "WP Name 71", slug: "member-71", roles: [] },
      ];
    }
    if (endpoint === "jet-rel/152/children/70") {
      return [{ child_object_id: "151" }];
    }
    if (endpoint === "jet-rel/152/children/71") {
      return [{ child_object_id: "152" }, { child_object_id: "153" }];
    }
    return [];
  });
  mocks.wordpressCCTFetch.mockImplementation(
    async (slug: string, request?: { params?: { _filters?: string } }) => {
      if (slug !== T.userProfile.slug || !request?.params?._filters) return [];
      return [
        {
          id: "151",
          [APP_PROFILE_F.APP]: "challenged",
          [APP_PROFILE_F.NAME]: "App Name 70",
        },
        {
          id: "152",
          [APP_PROFILE_F.APP]: "carecnc",
          [APP_PROFILE_F.NAME]: "Other App Name 71",
        },
        { id: "153", [APP_PROFILE_F.NAME]: "Legacy Name 71" },
      ];
    },
  );

  const profiles = await fetchWPUserPublicProfiles([70, 71]);
  const cctOptions = mocks.wordpressCCTFetch.mock.calls[0]?.[1] as {
    params?: { _filters?: string };
  };
  const filters = JSON.parse(cctOptions?.params?._filters ?? "[]");

  expect(profiles.get(70)?.full_name).toBe("App Name 70");
  expect(profiles.get(71)?.full_name).toBe("Legacy Name 71");
  expect(profiles.get(70)?.slug).toBe("member-70");
  expect(mocks.wordpressFetch).toHaveBeenCalledTimes(3);
  expect(mocks.wordpressCCTFetch).toHaveBeenCalledTimes(1);
  expect(filters[0]?.value).toEqual(["151", "152", "153"]);
});
