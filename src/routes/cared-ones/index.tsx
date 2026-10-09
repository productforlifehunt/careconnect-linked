import { createFileRoute } from "@tanstack/react-router";
import CaredOnes from "@/pages/CaredOnes";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteCaredOnesPage() {
  return <RequireAuth><CaredOnes /></RequireAuth>;
}

export const Route = createFileRoute("/cared-ones/")({
  component: RouteCaredOnesPage,
});
