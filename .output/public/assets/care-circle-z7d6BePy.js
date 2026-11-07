var e=`import { createFileRoute } from "@tanstack/react-router";
import CareCircle from "@/pages/CareCircle";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteCareCirclePage() {
  return <RequireAuth><CareCircle /></RequireAuth>;
}

export const Route = createFileRoute("/care-circle")({
  component: RouteCareCirclePage,
});
`;export{e as default};