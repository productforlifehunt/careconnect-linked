import { createFileRoute } from "@tanstack/react-router";
import NotFound from "@/pages/NotFound";

// Catch-all: unknown paths on the care app show "not found". The NotchSafety
// and survey sub-apps also use their own paths (/map, /me, /log …) that land
// here; the root renders the sub-app itself for those sites.
export const Route = createFileRoute("/$")({
  component: NotFound,
});
