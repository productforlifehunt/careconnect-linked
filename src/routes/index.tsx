import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "ChallengeD · Family Care & Safety" },
    { name: "description", content: "Family care knowledge, shared care coordination, and location safety." },
    { property: "og:title", content: "ChallengeD · Family Care & Safety" },
    { property: "og:description", content: "Family care knowledge, shared care coordination, and location safety." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});
