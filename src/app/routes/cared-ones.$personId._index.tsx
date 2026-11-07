import CaredOnes from "@/pages/CaredOnes";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteCaredOnesPersonidPage() {
  return <RequireAuth><CaredOnes /></RequireAuth>;
}
export function meta({ params }: { params: Record<string, string | undefined> }) {
  return [
    { title: "Family Member Care · Family Care" },
    { name: "description", content: "Care tasks, schedules and records for your family member." },
    { property: "og:title", content: "Family Member Care · Family Care" },
    { property: "og:description", content: "Care tasks, schedules and records for your family member." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ];
}

const RouteComponent = (RouteCaredOnesPersonidPage);
export default RouteComponent;

