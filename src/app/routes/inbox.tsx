import Inbox from "@/pages/Inbox";
import { RequireAuth } from "@/components/auth/RequireAuth";

function RouteInboxPage() {
  return <RequireAuth><Inbox /></RequireAuth>;
}
export function meta({ params }: { params: Record<string, string | undefined> }) {
  return [
    { title: "Inbox · Family Care" },
    { name: "description", content: "Your care messages, notifications and unread items." },
    { property: "og:title", content: "Inbox · Family Care" },
    { property: "og:description", content: "Your care messages, notifications and unread items." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ];
}

const RouteComponent = (RouteInboxPage);
export default RouteComponent;

