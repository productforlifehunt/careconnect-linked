import { createFileRoute } from "@tanstack/react-router";
import SafeD from "@/pages/SafeD";

export const Route = createFileRoute("/safed/")({
  component: SafeD,
});
