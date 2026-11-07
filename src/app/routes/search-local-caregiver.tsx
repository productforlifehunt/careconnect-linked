import SearchResults from "@/pages/SearchResults";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteSearchLocalCaregiverPage() {
  return <SiteFeature name="paidCaregivers"><SearchResults /></SiteFeature>;
}
const RouteComponent = (RouteSearchLocalCaregiverPage);
export default RouteComponent;

