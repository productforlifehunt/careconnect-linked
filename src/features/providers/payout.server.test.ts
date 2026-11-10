import { afterEach, expect, it, vi } from "vitest";
import { saveOwnPayout } from "./payout.server";
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
it("writes only the verified caller's store with one write and no rejected settings attempt", async () => {
  vi.stubEnv("WP_ADMIN_USER", "test-admin");
  vi.stubEnv("WP_ADMIN_APP_PASSWORD", "test-secret");
  const payment = { paypal: { email: "test@example.com" } };
  const fetcher = vi.fn().mockResolvedValueOnce(Response.json({ id: 52 })).mockResolvedValueOnce(Response.json({ payment }));
  vi.stubGlobal("fetch", fetcher);
  expect(await saveOwnPayout(payment, new Request("http://localhost", { headers: { "X-WP-Token": "test-session" } }))).toEqual(payment);
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(fetcher.mock.calls[1]?.[0]).toBe("https://app.challenged-dementia.com/afresh/wp-json/dokan/v1/stores/52");
  expect(JSON.parse(fetcher.mock.calls[1]?.[1]?.body)).toEqual({ payment });
});
it("does not write when the caller cannot be verified", async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response("Invalid session", { status: 401 }));
  vi.stubGlobal("fetch", fetcher);
  await expect(saveOwnPayout({}, new Request("http://localhost", { headers: { "X-WP-Token": "test-session" } }))).rejects.toMatchObject({ status: 401 });
  expect(fetcher).toHaveBeenCalledTimes(1);
});