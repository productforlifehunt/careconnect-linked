var e=`import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

function RouteProfilePage() {
  return <Navigate to="/settings" replace />;
}

export const Route = createFileRoute("/profile")({
  component: RouteProfilePage,
});
`;export{e as default};