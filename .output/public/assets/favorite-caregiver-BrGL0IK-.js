var e=`import { createFileRoute } from "@tanstack/react-router";
import Favorites from "@/pages/Favorites";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteFavoriteCaregiverPage() {
  return <SiteFeature name="paidCaregivers"><RequireAuth><Favorites /></RequireAuth></SiteFeature>;
}

export const Route = createFileRoute("/favorite-caregiver")({
  component: RouteFavoriteCaregiverPage,
});
`;export{e as default};