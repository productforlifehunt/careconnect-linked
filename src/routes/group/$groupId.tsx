import { createFileRoute } from "@tanstack/react-router";
import GroupLink from "@/pages/GroupLink";

export const Route = createFileRoute("/group/$groupId")({
  head: () => ({
    meta: [
      { title: "Care group link" },
      { name: "description", content: "Open this link to join the care group with its join code, or ask an admin to let you in." },
      { property: "og:title", content: "Care group link" },
      { property: "og:description", content: "Join the care group with its join code, or ask an admin to let you in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GroupLink,
});
