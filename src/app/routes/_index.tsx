import Index from "@/pages/Index";
export function meta({ params }: { params: Record<string, string | undefined> }) {
  return [
    { title: "ChallengeD · Family Care & Safety" },
    { name: "description", content: "Family care knowledge, shared care coordination, and location safety." },
    { property: "og:title", content: "ChallengeD · Family Care & Safety" },
    { property: "og:description", content: "Family care knowledge, shared care coordination, and location safety." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}

const RouteComponent = (Index);
export default RouteComponent;

