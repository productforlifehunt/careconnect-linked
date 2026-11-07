var e=`import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/RequireAuth";
import TasksNeedingHelp from "@/pages/TasksNeedingHelp";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteTasksPage() {
  return <SiteFeature name="paidCaregivers"><RequireAuth><TasksNeedingHelp /></RequireAuth></SiteFeature>;
}

export const Route = createFileRoute("/tasks")({
  component: RouteTasksPage,
});
`;export{e as default};