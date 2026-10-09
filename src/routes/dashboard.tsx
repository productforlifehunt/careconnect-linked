import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/pages/Dashboard";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteDashboardPage() {
  return <RequireAuth><Dashboard /></RequireAuth>;
}

export const Route = createFileRoute("/dashboard")({
  component: RouteDashboardPage,
});
