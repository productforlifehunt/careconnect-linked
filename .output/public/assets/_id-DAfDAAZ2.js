var e=`import { createFileRoute } from "@tanstack/react-router";
import CaregiverProfile from "@/pages/CaregiverProfile";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteCaregiverIdPage() {
  return <SiteFeature name="paidCaregivers"><CaregiverProfile /></SiteFeature>;
}

export const Route = createFileRoute("/caregiver/$id")({
  component: RouteCaregiverIdPage,
});
`;export{e as default};