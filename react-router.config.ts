import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "src/app",
  // Lovable requires dist; keep Draftbit's default build output outside Lovable.
  buildDirectory: process.env["LOVABLE_PROJECT_ID"] ? "dist" : "build",
  ssr: true,
} satisfies Config;
