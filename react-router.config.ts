import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "src/app",
  // Keep genuine client and SSR outputs together in the host's required root.
  buildDirectory: "build",
  ssr: true,
} satisfies Config;
