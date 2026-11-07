import CommunityPost from "@/pages/CommunityPost";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteCommunityIdPage() {
  return <SiteFeature name="community"><CommunityPost /></SiteFeature>;
}
export function meta({ params }: { params: Record<string, string | undefined> }) {
  return [
    { title: "Community Discussion · Family Care" },
    { name: "description", content: "Read a care community post and its discussion." },
    { property: "og:title", content: "Community Discussion · Family Care" },
    { property: "og:description", content: "Read a care community post and its discussion." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ];
}

const RouteComponent = (RouteCommunityIdPage);
export default RouteComponent;

