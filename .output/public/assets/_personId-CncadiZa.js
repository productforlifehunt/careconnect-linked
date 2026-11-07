var e=`import { createFileRoute } from "@tanstack/react-router";
import CaredOnes from "@/pages/CaredOnes";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteCaredOnesPersonidPage() {
  return <RequireAuth><CaredOnes /></RequireAuth>;
}

export const Route = createFileRoute("/cared-ones/$personId/")({
  head: () => ({ meta: [
    { title: "Family Member Care · Family Care" },
    { name: "description", content: "Care tasks, schedules and records for your family member." },
    { property: "og:title", content: "Family Member Care · Family Care" },
    { property: "og:description", content: "Care tasks, schedules and records for your family member." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: RouteCaredOnesPersonidPage,
});
`;export{e as default};