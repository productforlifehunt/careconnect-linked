import { Navigate } from "@/lib/router-compat";

function RouteNotificationsPage() {
  return <Navigate to="/inbox?tab=notifications" replace />;
}
const RouteComponent = (RouteNotificationsPage);
export default RouteComponent;

