var e=`import { createFileRoute } from "@tanstack/react-router";
import SearchResults from "@/pages/SearchResults";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteSearchCaregiverPage() {
  return <SiteFeature name="paidCaregivers"><SearchResults /></SiteFeature>;
}

export const Route = createFileRoute("/search-caregiver")({
  component: RouteSearchCaregiverPage,
});
`;export{e as default};