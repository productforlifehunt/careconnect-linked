import { createFileRoute } from "@tanstack/react-router";
import CareD from "@/pages/CareD";

export const Route = createFileRoute("/cared/")({
  component: CareD,
});
