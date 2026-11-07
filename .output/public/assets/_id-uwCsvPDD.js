var e=`import { createFileRoute } from "@tanstack/react-router";
import CommunityPost from "@/pages/CommunityPost";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteCommunityIdPage() {
  return <SiteFeature name="community"><CommunityPost /></SiteFeature>;
}

export const Route = createFileRoute("/community/$id")({
  head: () => ({ meta: [
    { title: "Community Discussion · Family Care" },
    { name: "description", content: "Read a care community post and its discussion." },
    { property: "og:title", content: "Community Discussion · Family Care" },
    { property: "og:description", content: "Read a care community post and its discussion." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: RouteCommunityIdPage,
});
`;export{e as default};