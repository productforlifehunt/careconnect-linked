import CareFacilityProfile from "@/pages/CareFacilityProfile";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteFacilityIdPage() {
  return <SiteFeature name="facilities"><CareFacilityProfile /></SiteFeature>;
}
export function meta({ params }: { params: Record<string, string | undefined> }) {
  return [
    { title: "Care facility profile | 护理场所资料" },
    { name: "description", content: "View care-facility services, contact details, reviews and ownership applications." },
    { property: "og:title", content: "Care facility profile | 护理场所资料" },
    { property: "og:description", content: "Care-facility directory details, member roles and reviews." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ];
}

const RouteComponent = (RouteFacilityIdPage);
export default RouteComponent;

