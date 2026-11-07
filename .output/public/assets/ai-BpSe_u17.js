var e=`import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

function RouteAiPage() {
  return <Navigate to="/ai-companion" replace />;
}

export const Route = createFileRoute("/ai")({
  component: RouteAiPage,
});
`;export{e as default};