var e=`import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";

function RoutePlacesPage() {
  return <Navigate to="/find" replace />;
}

export const Route = createFileRoute("/places")({
  component: RoutePlacesPage,
});
`;export{e as default};