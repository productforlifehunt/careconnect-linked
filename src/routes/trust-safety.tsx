import { createFileRoute } from "@tanstack/react-router";
import TrustSafety from "@/pages/TrustSafety";

export const Route = createFileRoute("/trust-safety")({
  component: TrustSafety,
});
