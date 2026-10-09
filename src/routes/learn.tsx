import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

function RouteLearnPage() {
  return <Navigate to="/resources" replace />;
}

export const Route = createFileRoute("/learn")({
  component: RouteLearnPage,
});
