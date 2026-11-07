import { Navigate } from "@/lib/router-compat";

function RouteWelcomePage() {
  return <Navigate to="/auth?mode=signup" replace />;
}
const RouteComponent = (RouteWelcomePage);
export default RouteComponent;

