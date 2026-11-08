import { afterEach, expect, it, vi } from "vitest";
import { dedupeRead, invalidateRead } from "./rel-batch";

afterEach(() => {
  invalidateRead();
  window.localStorage.clear();
});

it("keeps same-account reads shared across token refresh and separates accounts", async () => {
  window.localStorage.setItem("cc_wp_token", "first-token");
  window.localStorage.setItem("cc_wp_user", JSON.stringify({ user_id: 70 }));
  let reads = 0;
  const load = vi.fn(() => Promise.resolve(`read-${++reads}`));

  await expect(dedupeRead("profile", load)).resolves.toBe("read-1");

  window.localStorage.setItem("cc_wp_token", "refreshed-token");
  await expect(dedupeRead("profile", load)).resolves.toBe("read-1");
  expect(load).toHaveBeenCalledTimes(1);

  window.localStorage.setItem("cc_wp_user", JSON.stringify({ user_id: 71 }));
  await expect(dedupeRead("profile", load)).resolves.toBe("read-2");
  expect(load).toHaveBeenCalledTimes(2);

  window.dispatchEvent(new Event("wp-write"));
  await expect(dedupeRead("profile", load)).resolves.toBe("read-3");
  expect(load).toHaveBeenCalledTimes(3);
});
