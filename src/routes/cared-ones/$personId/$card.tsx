import { createFileRoute } from "@tanstack/react-router";
import CaredOnes from "@/pages/CaredOnes";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteCaredOnesPersonidCardPage() {
  return <RequireAuth><CaredOnes /></RequireAuth>;
}

export const Route = createFileRoute("/cared-ones/$personId/$card")({
  head: ({ params }) => ({ meta: [
    { title: `${params.card === "documents" ? "Care Documents" : "Care Tools"} · Family Care` },
    { name: "description", content: "Manage a family member's care records and tools." },
    { property: "og:title", content: `${params.card === "documents" ? "Care Documents" : "Care Tools"} · Family Care` },
    { property: "og:description", content: "Manage a family member's care records and tools." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: RouteCaredOnesPersonidCardPage,
});
