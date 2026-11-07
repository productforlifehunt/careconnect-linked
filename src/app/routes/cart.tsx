import Cart from "@/pages/Cart";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteCartPage() {
  return <SiteFeature name="paidCaregivers"><RequireAuth><Cart /></RequireAuth></SiteFeature>;
}
const RouteComponent = (RouteCartPage);
export default RouteComponent;

