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

export default defineConfig({
  plugins: [
    reactRouter(),
    tailwindcss(),
    tsconfigPaths(),
    draftbitPlugin,
    inspectorSourcePlugin(),
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
  ssr: { noExternal: ["rrule"] },
  build: { rolldownOptions: { output: { keepNames: true } } },
});
