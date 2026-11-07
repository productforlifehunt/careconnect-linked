var e=`import { createFileRoute } from "@tanstack/react-router";
import Community from "@/pages/Community";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteCommunityPage() {
  return <SiteFeature name="community"><Community /></SiteFeature>;
}

export const Route = createFileRoute("/community/")({
  head: () => ({ meta: [
    { title: "Community · Family Care" },
    { name: "description", content: "Care community posts and family discussions." },
    { property: "og:title", content: "Community · Family Care" },
    { property: "og:description", content: "Care community posts and family discussions." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: RouteCommunityPage,
});
`;export{e as default};