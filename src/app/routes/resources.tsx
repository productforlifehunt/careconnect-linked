import Resources from "@/pages/Resources";
export function meta() {
  return [
    { title: "Care Learning Resources · Family Care" },
    { name: "description", content: "Read care-learning modules and lessons, and keep track of completed lessons." },
    { property: "og:title", content: "Care Learning Resources · Family Care" },
    { property: "og:description", content: "Read care-learning modules and lessons, and keep track of completed lessons." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ];
}
const RouteComponent = (Resources);
export default RouteComponent;

