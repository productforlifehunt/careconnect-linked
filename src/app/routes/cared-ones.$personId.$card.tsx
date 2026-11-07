import CaredOnes from "@/pages/CaredOnes";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteCaredOnesPersonidCardPage() {
  return <RequireAuth><CaredOnes /></RequireAuth>;
}
export function meta({ params }: { params: Record<string, string | undefined> }) {
  return [
    { title: `${params["card"] === "family-voice" ? "Family Voices" : params["card"] === "tasks" ? "Care Tasks" : params["card"] === "documents" ? "Care Documents" : "Care Tools"} · Family Care` },
    { name: "description", content: params["card"] === "family-voice" ? "Record and listen to familiar family voices." : "Manage a family member's care records and tools." },
    { property: "og:title", content: `${params["card"] === "family-voice" ? "Family Voices" : params["card"] === "tasks" ? "Care Tasks" : params["card"] === "documents" ? "Care Documents" : "Care Tools"} · Family Care` },
    { property: "og:description", content: params["card"] === "family-voice" ? "Record and listen to familiar family voices." : "Manage a family member's care records and tools." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ];
}

const RouteComponent = (RouteCaredOnesPersonidCardPage);
export default RouteComponent;

