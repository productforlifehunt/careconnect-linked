import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

function RouteCheckInsPage() {
  return <Navigate to="/cared-ones" replace />;
}

export const Route = createFileRoute("/check-ins")({
  component: RouteCheckInsPage,
});
