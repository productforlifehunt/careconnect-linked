import { createFileRoute } from "@tanstack/react-router";
import CareFacilityForm from "@/pages/CareFacilityForm";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteFacilitiesIdEditPage() {
  return <SiteFeature name="facilities"><RequireAuth><CareFacilityForm /></RequireAuth></SiteFeature>;
}

export const Route = createFileRoute("/facilities/$id/edit")({
  head: () => ({ meta: [
    { title: "Edit care facility | 编辑护理场所" },
    { name: "description", content: "Edit an existing care facility's directory details." },
    { property: "og:title", content: "Edit care facility | 编辑护理场所" },
    { property: "og:description", content: "Update care-facility contact information and services." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: RouteFacilitiesIdEditPage,
});
