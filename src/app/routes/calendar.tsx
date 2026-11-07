import { Calendar } from "@/components/routing/BrowserOnlyPages";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteCalendarPage() {
  return <RequireAuth><Calendar /></RequireAuth>;
}
const RouteComponent = (RouteCalendarPage);
export default RouteComponent;

