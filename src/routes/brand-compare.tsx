import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

function RouteBrandComparePage() {
  return <Navigate to="/" replace />;
}

export const Route = createFileRoute("/brand-compare")({
  component: RouteBrandComparePage,
});
