import { createFileRoute } from "@tanstack/react-router";
import { GPSTracking } from "@/components/routing/BrowserOnlyPages";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteFindPage() {
  return <RequireAuth><GPSTracking /></RequireAuth>;
}

export const Route = createFileRoute("/find")({
  component: RouteFindPage,
});
