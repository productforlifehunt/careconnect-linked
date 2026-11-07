var e=`import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

function RouteAppointmentsPage() {
  return <Navigate to="/calendar" replace />;
}

export const Route = createFileRoute("/appointments")({
  component: RouteAppointmentsPage,
});
`;export{e as default};