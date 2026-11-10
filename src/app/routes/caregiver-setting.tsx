import ProviderDashboard from "@/pages/ProviderDashboard";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteCaregiverSettingPage() {
  return <SiteFeature name="paidCaregivers"><RequireAuth skipOnboarding><ProviderDashboard /></RequireAuth></SiteFeature>;
}
const RouteComponent = (RouteCaregiverSettingPage);
export default RouteComponent;

