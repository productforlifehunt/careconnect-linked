import { createFileRoute } from "@tanstack/react-router";
import SearchResults from "@/pages/SearchResults";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteSearchCareFacilityPage() {
  return <SiteFeature name="facilities"><SearchResults /></SiteFeature>;
}

export const Route = createFileRoute("/search-care-facility")({
  component: RouteSearchCareFacilityPage,
});
