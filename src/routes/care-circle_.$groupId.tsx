import { createFileRoute } from "@tanstack/react-router";
import CareCircle from "@/pages/CareCircle";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteCareGroupPage() {
  return <RequireAuth><CareCircle /></RequireAuth>;
}

/** A care group's home page — also the one link the group shares. */
export const Route = createFileRoute("/care-circle_/$groupId")({
  head: () => ({
    meta: [
      { title: "Care group" },
      { name: "description", content: "Open this care group. Not a member yet? Join with the group's join code or ask an admin." },
      { property: "og:title", content: "Care group" },
      { property: "og:description", content: "Open this care group, or join it with the join code or by asking an admin." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RouteCareGroupPage,
});
