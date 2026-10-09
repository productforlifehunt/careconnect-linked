import type { ReactNode } from "react";
import { useSite, type SiteFeatures } from "@/contexts/SiteContext";
import NotFound from "@/pages/NotFound";

/**
 * Release builds (beta / public) are a strict subset of the internal build:
 * pages for a feature the running release drops show "not found", so no
 * direct URL can reach them.
 */
export function SiteFeature({ name, children }: { name: keyof SiteFeatures; children: ReactNode }) {
  const { features } = useSite();
  if (!features[name]) return <NotFound />;
  return <>{children}</>;
}
