import FindCaredOnes from "@/pages/FindCaredOnes";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteFindPage() {
  return <RequireAuth><FindCaredOnes /></RequireAuth>;
}
const RouteComponent = (RouteFindPage);
export default RouteComponent;

