import CaredOnes from "@/pages/CaredOnes";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteCaredOnesPage() {
  return <RequireAuth><CaredOnes /></RequireAuth>;
}
export function meta({ params }: { params: Record<string, string | undefined> }) {
  return [
    { title: "Cared Ones · Family Care" },
    { name: "description", content: "Your family members and their care tasks and records." },
    { property: "og:title", content: "Cared Ones · Family Care" },
    { property: "og:description", content: "Your family members and their care tasks and records." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ];
}

const RouteComponent = (RouteCaredOnesPage);
export default RouteComponent;

