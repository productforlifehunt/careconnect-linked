import Profile from "@/pages/Profile";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteSettingsPage() {
  return <RequireAuth><Profile /></RequireAuth>;
}
const RouteComponent = (RouteSettingsPage);
export default RouteComponent;

