import { createFileRoute } from "@tanstack/react-router";
import CareCircle from "@/pages/CareCircle";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteCareGroupPage() {
  return <RequireAuth><CareCircle /></RequireAuth>;
}

/** A care group's home page — also the one link the group shares. */
export const Route = createFileRoute("/care-circle_/$groupId")({
  component: RouteCareGroupPage,
});
