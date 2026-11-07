var e=`import { createFileRoute } from "@tanstack/react-router";
import Cart from "@/pages/Cart";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { SiteFeature } from "@/components/routing/SiteFeature";

function RouteCartPage() {
  return <SiteFeature name="paidCaregivers"><RequireAuth><Cart /></RequireAuth></SiteFeature>;
}

export const Route = createFileRoute("/cart")({
  component: RouteCartPage,
});
`;export{e as default};