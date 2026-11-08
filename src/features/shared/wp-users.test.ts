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
import { fetchWPUserProfile } from "./wp-users";

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
    if (endpoint === "jet-rel/152") {
      return { "70": [{ child_object_id: "151" }] };
    }
    if (endpoint === "jet-rel/259") {
      return { "70": [{ child_object_id: "258" }] };
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
  expect(mocks.wordpressCCTFetch).toHaveBeenCalledTimes(2);

  window.dispatchEvent(new Event("wp-write"));
  await fetchWPUserProfile(70);
  expect(mocks.wordpressCCTFetch).toHaveBeenCalledTimes(4);
});
