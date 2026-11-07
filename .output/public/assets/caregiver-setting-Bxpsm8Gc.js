var e=`import { createFileRoute } from "@tanstack/react-router";
import ProviderDashboard from "@/pages/ProviderDashboard";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteCaregiverSettingPage() {
  return <SiteFeature name="paidCaregivers"><RequireAuth><ProviderDashboard /></RequireAuth></SiteFeature>;
}

export const Route = createFileRoute("/caregiver-setting")({
  component: RouteCaregiverSettingPage,
});
`;export{e as default};