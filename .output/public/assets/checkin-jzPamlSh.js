var e=`import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

function RouteCheckinPage() {
  return <Navigate to="/cared-ones" replace />;
}

export const Route = createFileRoute("/checkin")({
  component: RouteCheckinPage,
});
`;export{e as default};