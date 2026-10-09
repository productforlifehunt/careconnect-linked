import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

function RouteWelcomePage() {
  return <Navigate to="/auth?mode=signup" replace />;
}

export const Route = createFileRoute("/welcome")({
  component: RouteWelcomePage,
});
