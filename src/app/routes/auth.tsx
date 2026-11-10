import Auth from "@/pages/Auth";
export function meta() {
  const title = "Sign In & Register · Family Care";
  const description = "Access your family care account or register to manage your care services.";
  return [
    { title }, { name: "description", content: description },
    { property: "og:title", content: title }, { property: "og:description", content: description },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ];
}
const RouteComponent = (Auth);
export default RouteComponent;

