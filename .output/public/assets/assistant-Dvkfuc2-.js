var e=`import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

function RouteAssistantPage() {
  return <Navigate to="/ai-companion" replace />;
}

export const Route = createFileRoute("/assistant")({
  component: RouteAssistantPage,
});
`;export{e as default};