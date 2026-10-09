import { createFileRoute } from "@tanstack/react-router";
import Profile from "@/pages/Profile";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteSettingsPage() {
  return <RequireAuth><Profile /></RequireAuth>;
}

export const Route = createFileRoute("/settings")({
  component: RouteSettingsPage,
});
