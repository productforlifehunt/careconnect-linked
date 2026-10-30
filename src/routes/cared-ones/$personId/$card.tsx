import { createFileRoute } from "@tanstack/react-router";
import CaredOnes from "@/pages/CaredOnes";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteCaredOnesPersonidCardPage() {
  return <RequireAuth><CaredOnes /></RequireAuth>;
}

export const Route = createFileRoute("/cared-ones/$personId/$card")({
  head: ({ params }) => ({ meta: [
    { title: `${params.card === "family-voice" ? "Family Voices" : params.card === "tasks" ? "Care Tasks" : params.card === "documents" ? "Care Documents" : "Care Tools"} · Family Care` },
    { name: "description", content: params.card === "family-voice" ? "Record and listen to familiar family voices." : "Manage a family member's care records and tools." },
    { property: "og:title", content: `${params.card === "family-voice" ? "Family Voices" : params.card === "tasks" ? "Care Tasks" : params.card === "documents" ? "Care Documents" : "Care Tools"} · Family Care` },
    { property: "og:description", content: params.card === "family-voice" ? "Record and listen to familiar family voices." : "Manage a family member's care records and tools." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: RouteCaredOnesPersonidCardPage,
});
