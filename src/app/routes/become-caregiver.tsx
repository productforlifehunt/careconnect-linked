import BecomeCaregiver from "@/pages/BecomeCaregiver";
import { SiteFeature } from "@/components/routing/SiteFeature";

export function meta() {
  const title = "Caregiver Entry · Family Care";
  const description = "Sign in or register to manage your caregiver services and availability.";
  return [
    { title }, { name: "description", content: description },
    { property: "og:title", content: title }, { property: "og:description", content: description },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ];
}

function RouteBecomeCaregiverPage() {
  return <SiteFeature name="paidCaregivers"><BecomeCaregiver /></SiteFeature>;
}
const RouteComponent = (RouteBecomeCaregiverPage);
export default RouteComponent;

