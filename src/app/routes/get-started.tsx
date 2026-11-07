import { Navigate } from "@/lib/router-compat";

function RouteGetStartedPage() {
  return <Navigate to="/auth?mode=signup" replace />;
}
const RouteComponent = (RouteGetStartedPage);
export default RouteComponent;

