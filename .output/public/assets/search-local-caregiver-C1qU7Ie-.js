var e=`import { createFileRoute } from "@tanstack/react-router";
import SearchResults from "@/pages/SearchResults";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteSearchLocalCaregiverPage() {
  return <SiteFeature name="paidCaregivers"><SearchResults /></SiteFeature>;
}

export const Route = createFileRoute("/search-local-caregiver")({
  component: RouteSearchLocalCaregiverPage,
});
`;export{e as default};