import CaregiverProfile from "@/pages/CaregiverProfile";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteCaregiverIdPage() {
  return <SiteFeature name="paidCaregivers"><CaregiverProfile /></SiteFeature>;
}
const RouteComponent = (RouteCaregiverIdPage);
export default RouteComponent;

