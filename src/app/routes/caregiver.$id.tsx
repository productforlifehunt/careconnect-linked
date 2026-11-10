import CaregiverProfile from "@/pages/CaregiverProfile";
import { SiteFeature } from "@/components/routing/SiteFeature";
export function meta() {
  return [
    { title: "Caregiver Services and Reviews · Family Care" },
    { name: "description", content: "View caregiver services, availability and reviews." },
    { property: "og:title", content: "Caregiver Services and Reviews · Family Care" },
    { property: "og:description", content: "View caregiver services, availability and reviews." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ];
}

function RouteCaregiverIdPage() {
  return <SiteFeature name="paidCaregivers"><CaregiverProfile /></SiteFeature>;
}
const RouteComponent = (RouteCaregiverIdPage);
export default RouteComponent;

