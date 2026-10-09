import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

function RouteMessagesPage() {
  return <Navigate to="/inbox?tab=messages" replace />;
}

export const Route = createFileRoute("/messages")({
  component: RouteMessagesPage,
});
