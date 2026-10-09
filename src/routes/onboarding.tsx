import { createFileRoute } from "@tanstack/react-router";
import Onboarding from "@/pages/Onboarding";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteOnboardingPage() {
  return <RequireAuth><Onboarding /></RequireAuth>;
}

export const Route = createFileRoute("/onboarding")({
  component: RouteOnboardingPage,
});
