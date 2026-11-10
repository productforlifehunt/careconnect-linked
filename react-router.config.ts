import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "src/app",
  // Build workers need not inherit editor environment variables.
  // Draftbit can explicitly retain its output with REACT_ROUTER_BUILD_DIRECTORY=build.
  buildDirectory: process.env["REACT_ROUTER_BUILD_DIRECTORY"] || "dist",
  ssr: true,
  future: { v8_viteEnvironmentApi: true },
} satisfies Config;
