import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig, type Plugin } from "vite";
import { vitePlugin as injectJsxSourcePlugin } from "./.draftbit/draftbit-integration.mjs";
import { inspectorSourcePlugin } from "./scripts/inspector-source-plugin";

const draftbitSource = injectJsxSourcePlugin();

// Forward only hooks that the installed Draftbit plugin actually supplies.
const draftbitPlugin: Plugin = {
  name: draftbitSource?.name || "draftbit-inject-jsx-source",
  ...(draftbitSource?.enforce ? { enforce: draftbitSource.enforce } : {}),
  ...(draftbitSource?.apply ? { apply: draftbitSource.apply } : {}),
  load(...args) {
    const hook = draftbitSource?.load;
    return typeof hook === "function" ? hook.apply(this, args as never) : null;
  },
  transform(...args) {
    const hook = draftbitSource?.transform;
    return typeof hook === "function" ? hook.apply(this, args as never) : null;
  },
};

// Lovable's editor preview waits for its dev-server coordination (HMR gate + preview
// bridge). Load them only inside a Lovable sandbox so Draftbit and local dev are unchanged.
const isLovableSandbox = process.env["LOVABLE_SANDBOX"] === "1";
const lovablePreviewPlugins: Plugin[] = isLovableSandbox
  ? [
      (await import("@lovable.dev/vite-tanstack-config/hmr-gate")).hmrGatePlugin(),
      (await import("@lovable.dev/vite-tanstack-config/dev-server-bridge")).devServerBridgePlugin(),
    ]
  : [];

export default defineConfig({
  plugins: [
    reactRouter(),
    tailwindcss(),
    tsconfigPaths(),
    draftbitPlugin,
    inspectorSourcePlugin(),
    ...lovablePreviewPlugins,
  ],
  server: {
    host: true,
    port: Number(process.env["WORKING_METRO_PORT"] || 36356),
    strictPort: true,
    allowedHosts: true,
  },
  optimizeDeps: {
    include: ["@draftbit/iframe-element-picker", "@draftbit/babel-plugin-inject-jsx-source"],
  },
  // Worker hosts cannot resolve modules at runtime, so production SSR bundles every dependency.
  ssr: { noExternal: process.env["NODE_ENV"] === "production" || process.argv.includes("build") ? true : ["rrule"] },
  build: { rolldownOptions: { output: { keepNames: true } } },
});
