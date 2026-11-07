import CareCircle from "@/pages/CareCircle";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteCareGroupPage() {
  return <RequireAuth><CareCircle /></RequireAuth>;
}
const RouteComponent = (RouteCareGroupPage);
export default RouteComponent;

