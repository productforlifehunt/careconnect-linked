import BecomeCaregiver from "@/pages/BecomeCaregiver";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteBecomeCaregiverPage() {
  return <SiteFeature name="paidCaregivers"><BecomeCaregiver /></SiteFeature>;
}
const RouteComponent = (RouteBecomeCaregiverPage);
export default RouteComponent;

