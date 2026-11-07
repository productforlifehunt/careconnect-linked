import { Navigate } from "@/lib/router-compat";

function RouteAppointmentsPage() {
  return <Navigate to="/calendar" replace />;
}
const RouteComponent = (RouteAppointmentsPage);
export default RouteComponent;

