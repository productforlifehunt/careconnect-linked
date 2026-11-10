import Favorites from "@/pages/Favorites";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { SiteFeature } from "@/components/routing/SiteFeature";
export function meta() {
  return [
    { title: "Saved Caregivers · Family Care" },
    { name: "description", content: "View and manage your saved caregivers." },
    { property: "og:title", content: "Saved Caregivers · Family Care" },
    { property: "og:description", content: "View and manage your saved caregivers." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ];
}

function RouteFavoriteCaregiverPage() {
  return <SiteFeature name="paidCaregivers"><RequireAuth><Favorites /></RequireAuth></SiteFeature>;
}
const RouteComponent = (RouteFavoriteCaregiverPage);
export default RouteComponent;

