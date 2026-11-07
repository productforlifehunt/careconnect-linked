import Onboarding from "@/pages/Onboarding";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteOnboardingPage() {
  return <RequireAuth><Onboarding /></RequireAuth>;
}
const RouteComponent = (RouteOnboardingPage);
export default RouteComponent;

