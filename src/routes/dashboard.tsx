import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/pages/Dashboard";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteDashboardPage() {
  return <RequireAuth><Dashboard /></RequireAuth>;
}

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [
    { title: "Care Dashboard · Family Care" },
    { name: "description", content: "Your family care schedules, tasks and unread inbox summary." },
    { property: "og:title", content: "Care Dashboard · Family Care" },
    { property: "og:description", content: "Your family care schedules, tasks and unread inbox summary." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: RouteDashboardPage,
});
