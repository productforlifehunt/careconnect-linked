import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { createRunnableDevEnvironment, defineConfig, type Plugin } from "vite";
import { vitePlugin as injectJsxSourcePlugin } from "./.draftbit/draftbit-integration.mjs";
import { inspectorSourcePlugin } from "./scripts/inspector-source-plugin";
import { workerRequireShim } from "./scripts/worker-require-shim";

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

// React Router expects Connect's originalUrl; alternate Vite hosts may omit it.
const requestUrlPlugin: Plugin = {
  name: "react-router-request-url",
  enforce: "pre",
  async resolveId(id) {
    if (id.startsWith("\0virtual:react-router/")) {
      return this.resolve(id.slice(1), undefined, { skipSelf: true });
    }
    return null;
  },
  load(id) {
    if (id.endsWith("/src/styles.css?url")) {
      return 'export default "/src/styles.css?direct";';
    }
    if (id === "\0virtual:react-router/inject-hmr-runtime") {
      return 'import "/@oj/refresh-preamble.js";';
    }
    return null;
  },
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      req.originalUrl ??= req.url;
      next();
    });
  },
};

export default defineConfig(({ command }) => {
  const lovableDev = command === "serve" && Boolean(process.env["LOVABLE_PROJECT_ID"]);
  const routerPlugins = reactRouter().filter(plugin => !lovableDev || plugin.name !== "react-router:react-refresh-babel");
  return ({
  environments: {
    ...(lovableDev ? { ssr: { dev: { createEnvironment: (name, config) => createRunnableDevEnvironment(name, config) } } } : {}),
    ...(command === "build" && !process.env["REACT_ROUTER_BUILD_DIRECTORY"] ? { ssr: { build: { rollupOptions: { input: "./src/worker.ts" } } } } : {}),
  },
  plugins: [
    ...(lovableDev ? [requestUrlPlugin] : []),
    routerPlugins,
    tailwindcss(),
    tsconfigPaths(),
    draftbitPlugin,
    inspectorSourcePlugin(),
    workerRequireShim(),
  ],
  server: {
    host: true,
    port: Number(process.env["WORKING_METRO_PORT"] || 36356),
    strictPort: true,
    allowedHosts: true,
  },
  optimizeDeps: {
    include: [
      "@draftbit/iframe-element-picker",
      "@draftbit/babel-plugin-inject-jsx-source",
      "@capacitor/core",
      "@capacitor/app",
      "@capacitor/geolocation",
      "@capacitor/push-notifications",
      "@ebarooni/capacitor-calendar",
      "capacitor-native-settings",
      "@radix-ui/react-switch",
      "@radix-ui/react-progress",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-popover",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-select",
      "@radix-ui/react-slider",
      "@radix-ui/react-slot",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "@radix-ui/react-tooltip",
      "@tanstack/react-query",
      "class-variance-authority",
      "clsx",
      "i18next",
      "i18next-browser-languagedetector",
      "lucide-react",
      "next-themes",
      "react-i18next",
      "sonner",
      "tailwind-merge",
      "@supabase/supabase-js",
      "bezier-js",
      "leaflet",
    ],
  },
  ssr: { noExternal: command === "build" ? true : ["rrule"] },
  build: { rolldownOptions: { output: { keepNames: true } } },
});
});
