import CareFacilityForm from "@/pages/CareFacilityForm";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteFacilitiesNewPage() {
  return <SiteFeature name="facilities"><RequireAuth><CareFacilityForm /></RequireAuth></SiteFeature>;
}
export function meta({ params }: { params: Record<string, string | undefined> }) {
  return [
    { title: "Submit care facility | 提交护理场所" },
    { name: "description", content: "Submit a care facility and an optional ownership application for manual review." },
    { property: "og:title", content: "Submit care facility | 提交护理场所" },
    { property: "og:description", content: "Care-facility directory submissions and ownership applications." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ];
}

const RouteComponent = (RouteFacilitiesNewPage);
export default RouteComponent;

