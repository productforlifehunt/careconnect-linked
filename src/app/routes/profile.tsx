import { Navigate } from "@/lib/router-compat";

function RouteProfilePage() {
  return <Navigate to="/settings" replace />;
}
const RouteComponent = (RouteProfilePage);
export default RouteComponent;

