import { createFileRoute } from "@tanstack/react-router";
import BecomeCaregiver from "@/pages/BecomeCaregiver";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteBecomeCaregiverPage() {
  return <SiteFeature name="paidCaregivers"><BecomeCaregiver /></SiteFeature>;
}

export const Route = createFileRoute("/become-caregiver")({
  component: RouteBecomeCaregiverPage,
});
