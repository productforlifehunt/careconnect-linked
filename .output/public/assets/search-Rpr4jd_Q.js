var e=`import { createFileRoute } from "@tanstack/react-router";
import SearchResults from "@/pages/SearchResults";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteSearchPage() {
  return <SiteFeature name="paidCaregivers"><SearchResults /></SiteFeature>;
}

export const Route = createFileRoute("/search")({
  component: RouteSearchPage,
});
`;export{e as default};