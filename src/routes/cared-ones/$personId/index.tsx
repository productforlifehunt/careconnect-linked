import { createFileRoute } from "@tanstack/react-router";
import CaredOnes from "@/pages/CaredOnes";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteCaredOnesPersonidPage() {
  return <RequireAuth><CaredOnes /></RequireAuth>;
}

export const Route = createFileRoute("/cared-ones/$personId/")({
  component: RouteCaredOnesPersonidPage,
});
