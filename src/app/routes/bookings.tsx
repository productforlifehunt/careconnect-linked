import Bookings from "@/pages/Bookings";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteBookingsPage() {
  return <SiteFeature name="paidCaregivers"><RequireAuth><Bookings /></RequireAuth></SiteFeature>;
}
const RouteComponent = (RouteBookingsPage);
export default RouteComponent;

