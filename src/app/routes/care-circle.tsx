import CareCircle from "@/pages/CareCircle";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteCareCirclePage() {
  return <RequireAuth><CareCircle /></RequireAuth>;
}
const RouteComponent = (RouteCareCirclePage);
export default RouteComponent;

