import { createFileRoute } from "@tanstack/react-router";
import FindCaredOnes from "@/pages/FindCaredOnes";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteFindPage() {
  return <RequireAuth><FindCaredOnes /></RequireAuth>;
}

export const Route = createFileRoute("/find")({
  component: RouteFindPage,
});
