import { afterEach, expect, it, vi } from "vitest";
import type { ConfigEnv, UserConfig } from "vite";

vi.mock("@react-router/dev/vite", () => ({ reactRouter: () => [{ name: "react-router" }, { name: "react-router:react-refresh-babel" }] }));
vi.mock("@tailwindcss/vite", () => ({ default: () => ({ name: "tailwind" }) }));
vi.mock("vite-tsconfig-paths", () => ({ default: () => ({ name: "paths" }) }));
vi.mock("../../.draftbit/draftbit-integration.mjs", () => ({ vitePlugin: () => ({ name: "draftbit" }) }));
vi.mock("../../scripts/inspector-source-plugin", () => ({ inspectorSourcePlugin: () => ({ name: "inspector" }) }));

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

async function config(command: "serve" | "build", marker: string) {
  vi.stubEnv("LOVABLE_PROJECT_ID", marker);
  const { default: factory } = await import("../../vite.config");
  if (typeof factory !== "function") throw new Error("Expected config factory");
  return await factory({ command, mode: "development" } as ConfigEnv) as UserConfig;
}

it("uses host refresh only in Lovable development and declares runnable SSR", async () => {
  const result = await config("serve", "test-project");
  expect(result.environments?.ssr?.dev?.createEnvironment).toBeTypeOf("function");
  const plugins = result.plugins?.flat();
  expect(plugins).toContainEqual(expect.objectContaining({ name: "react-router-request-url" }));
  expect(plugins).not.toContainEqual(expect.objectContaining({ name: "react-router:react-refresh-babel" }));
});

it("preserves native Draftbit development refresh", async () => {
  const result = await config("serve", "");
  expect(result.environments?.ssr?.dev?.createEnvironment).toBeUndefined();
  expect(result.plugins?.flat()).toContainEqual(expect.objectContaining({ name: "react-router:react-refresh-babel" }));
});

it("bundles production dependencies without development host URLs", async () => {
  const result = await config("build", "test-project");
  expect(result.ssr?.noExternal).toBe(true);
  expect(result.plugins?.flat()).not.toContainEqual(expect.objectContaining({ name: "react-router-request-url" }));
});