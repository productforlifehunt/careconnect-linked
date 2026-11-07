import { Navigate } from "@/lib/router-compat";

function RouteHelpPage() {
  return <Navigate to="/resources" replace />;
}
const RouteComponent = (RouteHelpPage);
export default RouteComponent;

