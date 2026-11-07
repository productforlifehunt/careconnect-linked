import SearchResults from "@/pages/SearchResults";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteSearchCareFacilityPage() {
  return <SiteFeature name="facilities"><SearchResults /></SiteFeature>;
}
const RouteComponent = (RouteSearchCareFacilityPage);
export default RouteComponent;

