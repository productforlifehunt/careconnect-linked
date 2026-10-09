import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

function RouteChatPage() {
  return <Navigate to="/inbox?tab=messages" replace />;
}

export const Route = createFileRoute("/chat")({
  component: RouteChatPage,
});
