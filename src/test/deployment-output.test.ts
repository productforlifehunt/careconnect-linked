import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it("writes client and SSR builds to dist without editor environment variables", async () => {
  vi.stubEnv("LOVABLE_PROJECT_ID", "");
  vi.stubEnv("REACT_ROUTER_BUILD_DIRECTORY", "");
  vi.resetModules();
  const { default: config } = await import("../../react-router.config");
  expect(config.buildDirectory).toBe("dist");
  expect(config.ssr).toBe(true);
});

it("supports an explicit Draftbit build directory without disabling SSR", async () => {
  vi.stubEnv("LOVABLE_PROJECT_ID", "");
  vi.stubEnv("REACT_ROUTER_BUILD_DIRECTORY", "build");
  vi.resetModules();
  const { default: config } = await import("../../react-router.config");
  expect(config.buildDirectory).toBe("build");
  expect(config.ssr).toBe(true);
});