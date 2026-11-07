var e=`import { createFileRoute } from "@tanstack/react-router";
import SearchResults from "@/pages/SearchResults";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteSearchRemoteCaregiverPage() {
  return <SiteFeature name="paidCaregivers"><SearchResults /></SiteFeature>;
}

export const Route = createFileRoute("/search-remote-caregiver")({
  component: RouteSearchRemoteCaregiverPage,
});
`;export{e as default};