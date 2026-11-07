var e=`import { createFileRoute } from "@tanstack/react-router";
import Inbox from "@/pages/Inbox";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteInboxPage() {
  return <RequireAuth><Inbox /></RequireAuth>;
}

export const Route = createFileRoute("/inbox")({
  head: () => ({ meta: [
    { title: "Inbox · Family Care" },
    { name: "description", content: "Your care messages, notifications and unread items." },
    { property: "og:title", content: "Inbox · Family Care" },
    { property: "og:description", content: "Your care messages, notifications and unread items." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: RouteInboxPage,
});
`;export{e as default};