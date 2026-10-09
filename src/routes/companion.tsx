import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

function RouteCompanionPage() {
  return <Navigate to="/ai-companion" replace />;
}

export const Route = createFileRoute("/companion")({
  component: RouteCompanionPage,
});
