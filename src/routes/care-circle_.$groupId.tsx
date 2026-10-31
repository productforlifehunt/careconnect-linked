import { createFileRoute } from "@tanstack/react-router";
import CareCircle from "@/pages/CareCircle";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteCareGroupPage() {
  return <RequireAuth><CareCircle /></RequireAuth>;
}

/**
 * A care group's home page — also the one link the group shares.
 * No head() here, like /care-circle: signed-out visitors are sent to sign-in
 * during the first render, and a head change at that moment crashed the
 * sign-in page (blank form).
 */
export const Route = createFileRoute("/care-circle_/$groupId")({
  component: RouteCareGroupPage,
});
