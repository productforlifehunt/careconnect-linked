import ProviderDashboard from "@/pages/ProviderDashboard";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { SiteFeature } from "@/components/routing/SiteFeature";

export function meta() {
  const title = "Caregiver Settings · Family Care";
  const description = "Manage caregiver location, services, prices, and public booking availability.";
  return [
    { title }, { name: "description", content: description },
    { property: "og:title", content: title }, { property: "og:description", content: description },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ];
}

function RouteCaregiverSettingPage() {
  return <SiteFeature name="paidCaregivers"><RequireAuth skipOnboarding><ProviderDashboard /></RequireAuth></SiteFeature>;
}
const RouteComponent = (RouteCaregiverSettingPage);
export default RouteComponent;

