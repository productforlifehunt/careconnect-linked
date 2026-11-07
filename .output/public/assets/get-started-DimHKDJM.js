var e=`import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

function RouteGetStartedPage() {
  return <Navigate to="/auth?mode=signup" replace />;
}

export const Route = createFileRoute("/get-started")({
  component: RouteGetStartedPage,
});
`;export{e as default};