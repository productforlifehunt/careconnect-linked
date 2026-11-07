import SearchResults from "@/pages/SearchResults";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteSearchPage() {
  return <SiteFeature name="paidCaregivers"><SearchResults /></SiteFeature>;
}
const RouteComponent = (RouteSearchPage);
export default RouteComponent;

