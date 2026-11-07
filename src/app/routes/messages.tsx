import { Navigate } from "@/lib/router-compat";

function RouteMessagesPage() {
  return <Navigate to="/inbox?tab=messages" replace />;
}
const RouteComponent = (RouteMessagesPage);
export default RouteComponent;

