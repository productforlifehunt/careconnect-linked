import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

function RouteDocumentsPage() {
  return <Navigate to="/cared-ones" replace />;
}

export const Route = createFileRoute("/documents")({
  component: RouteDocumentsPage,
});
