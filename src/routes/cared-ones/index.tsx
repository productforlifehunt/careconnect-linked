import { createFileRoute } from "@tanstack/react-router";
import CaredOnes from "@/pages/CaredOnes";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteCaredOnesPage() {
  return <RequireAuth><CaredOnes /></RequireAuth>;
}

export const Route = createFileRoute("/cared-ones/")({
  head: () => ({ meta: [
    { title: "Cared Ones · Family Care" },
    { name: "description", content: "Your family members and their care tasks and records." },
    { property: "og:title", content: "Cared Ones · Family Care" },
    { property: "og:description", content: "Your family members and their care tasks and records." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: RouteCaredOnesPage,
});
