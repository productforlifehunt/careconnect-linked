import SearchResults from "@/pages/SearchResults";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteSearchCaregiverPage() {
  return <SiteFeature name="paidCaregivers"><SearchResults /></SiteFeature>;
}
const RouteComponent = (RouteSearchCaregiverPage);
export default RouteComponent;

