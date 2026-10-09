import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

function RouteHelpPage() {
  return <Navigate to="/resources" replace />;
}

export const Route = createFileRoute("/help")({
  component: RouteHelpPage,
});
