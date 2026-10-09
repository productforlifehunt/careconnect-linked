import { createFileRoute } from "@tanstack/react-router";
import AICompanion from "@/pages/AICompanion";

export const Route = createFileRoute("/ai-companion")({
  component: AICompanion,
});
