import SearchResults from "@/pages/SearchResults";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteSearchRemoteCaregiverPage() {
  return <SiteFeature name="paidCaregivers"><SearchResults /></SiteFeature>;
}
const RouteComponent = (RouteSearchRemoteCaregiverPage);
export default RouteComponent;

