import { createFileRoute } from "@tanstack/react-router";
import CareFacilityProfile from "@/pages/CareFacilityProfile";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteFacilityIdPage() {
  return <SiteFeature name="facilities"><CareFacilityProfile /></SiteFeature>;
}

export const Route = createFileRoute("/facility/$id")({
  component: RouteFacilityIdPage,
});
