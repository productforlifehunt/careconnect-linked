import { createFileRoute } from "@tanstack/react-router";
import CareFacilityForm from "@/pages/CareFacilityForm";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteFacilitiesIdEditPage() {
  return <SiteFeature name="facilities"><RequireAuth><CareFacilityForm /></RequireAuth></SiteFeature>;
}

export const Route = createFileRoute("/facilities/$id/edit")({
  component: RouteFacilitiesIdEditPage,
});
