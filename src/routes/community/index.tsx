import { createFileRoute } from "@tanstack/react-router";
import Community from "@/pages/Community";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteCommunityPage() {
  return <SiteFeature name="community"><Community /></SiteFeature>;
}

export const Route = createFileRoute("/community/")({
  component: RouteCommunityPage,
});
