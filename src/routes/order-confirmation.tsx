import { createFileRoute } from "@tanstack/react-router";
import OrderConfirmation from "@/pages/OrderConfirmation";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteOrderConfirmationPage() {
  return <SiteFeature name="paidCaregivers"><RequireAuth><OrderConfirmation /></RequireAuth></SiteFeature>;
}

export const Route = createFileRoute("/order-confirmation")({
  component: RouteOrderConfirmationPage,
});
