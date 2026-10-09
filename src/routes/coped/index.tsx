import { createFileRoute } from "@tanstack/react-router";
import CopeD from "@/pages/CopeD";

export const Route = createFileRoute("/coped/")({
  component: CopeD,
});
