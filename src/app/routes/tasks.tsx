import { RequireAuth } from "@/components/auth/RequireAuth";
import TasksNeedingHelp from "@/pages/TasksNeedingHelp";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteTasksPage() {
  return <SiteFeature name="paidCaregivers"><RequireAuth><TasksNeedingHelp /></RequireAuth></SiteFeature>;
}
const RouteComponent = (RouteTasksPage);
export default RouteComponent;

