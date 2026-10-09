import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

function RouteNotificationsPage() {
  return <Navigate to="/inbox?tab=notifications" replace />;
}

export const Route = createFileRoute("/notifications")({
  component: RouteNotificationsPage,
});
