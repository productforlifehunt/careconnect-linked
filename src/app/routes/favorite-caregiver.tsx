import Favorites from "@/pages/Favorites";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteFavoriteCaregiverPage() {
  return <SiteFeature name="paidCaregivers"><RequireAuth><Favorites /></RequireAuth></SiteFeature>;
}
const RouteComponent = (RouteFavoriteCaregiverPage);
export default RouteComponent;

