import { createFileRoute } from "@tanstack/react-router";
import Inbox from "@/pages/Inbox";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteInboxPage() {
  return <RequireAuth><Inbox /></RequireAuth>;
}

export const Route = createFileRoute("/inbox")({
  component: RouteInboxPage,
});
