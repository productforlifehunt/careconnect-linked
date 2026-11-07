import { Navigate } from "@/lib/router-compat";

function RouteChatPage() {
  return <Navigate to="/inbox?tab=messages" replace />;
}
const RouteComponent = (RouteChatPage);
export default RouteComponent;

