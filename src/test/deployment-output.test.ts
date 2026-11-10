import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it("writes real client and SSR builds to dist on Lovable", async () => {
  vi.stubEnv("LOVABLE_PROJECT_ID", "test-project");
  vi.resetModules();
  const { default: config } = await import("../../react-router.config");
  expect(config.buildDirectory).toBe("dist");
  expect(config.ssr).toBe(true);
});

it("preserves Draftbit's build directory without a Lovable project", async () => {
  vi.stubEnv("LOVABLE_PROJECT_ID", "");
  vi.resetModules();
  const { default: config } = await import("../../react-router.config");
  expect(config.buildDirectory).toBe("build");
  expect(config.ssr).toBe(true);
});