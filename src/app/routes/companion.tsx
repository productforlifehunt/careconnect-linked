import { Navigate } from "@/lib/router-compat";

function RouteCompanionPage() {
  return <Navigate to="/ai-companion" replace />;
}
const RouteComponent = (RouteCompanionPage);
export default RouteComponent;

