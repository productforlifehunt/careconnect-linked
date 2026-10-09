import { createFileRoute } from "@tanstack/react-router";
import { Calendar } from "@/components/routing/BrowserOnlyPages";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteCalendarPage() {
  return <RequireAuth><Calendar /></RequireAuth>;
}

export const Route = createFileRoute("/calendar")({
  component: RouteCalendarPage,
});
