import { createFileRoute } from "@tanstack/react-router";
import SharedInformationCard from "@/pages/SharedInformationCard";

export const Route = createFileRoute("/share/card/$token")({
  head: () => ({ meta: [
    { title: "Care information card / 护理信息卡" },
    { name: "description", content: "View a care information card according to its current visibility. 按当前可见范围查看护理信息卡。" },
    { property: "og:title", content: "Care information card / 护理信息卡" },
    { property: "og:description", content: "A shared care information card. Access is determined by the card's current visibility. 护理信息卡按当前可见范围开放。" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: SharedInformationCard,
});
