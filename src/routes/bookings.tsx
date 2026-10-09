import { createFileRoute } from "@tanstack/react-router";
import Bookings from "@/pages/Bookings";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteBookingsPage() {
  return <SiteFeature name="paidCaregivers"><RequireAuth><Bookings /></RequireAuth></SiteFeature>;
}

export const Route = createFileRoute("/bookings")({
  component: RouteBookingsPage,
});
