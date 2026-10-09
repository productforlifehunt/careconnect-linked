import { createFileRoute } from "@tanstack/react-router";
import CommunityPost from "@/pages/CommunityPost";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteCommunityIdPage() {
  return <SiteFeature name="community"><CommunityPost /></SiteFeature>;
}

export const Route = createFileRoute("/community/$id")({
  component: RouteCommunityIdPage,
});
