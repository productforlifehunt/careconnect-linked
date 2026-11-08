import { detectSite } from "@/contexts/SiteContext";

/** Standard lowercase app id stored on each user's app-specific profile row. */
export type AppId =
  | "challenged"
  | "carecnc"
  | "notchsafety"
  | "afresh"
  | "adry"
  | "ablocked"
  | "benotch";

/**
 * Resolve the running product without loading the WordPress schema used by
 * profile data sources.
 */
export function currentAppId(): AppId {
  if (typeof window === "undefined") return "challenged";

  try {
    const params = new URLSearchParams(window.location.search);
    const site = params.get("__site");
    if (site === "notchsafety" || site === "safety") return "notchsafety";
    if (/(^|\.)notchsafety\.com$/i.test(window.location.hostname)) {
      return "notchsafety";
    }
    if (detectSite() === "notchsafety") return "notchsafety";

    if (site === "careconnected" || (site && site.startsWith("carecnc"))) {
      return "carecnc";
    }
    if (site?.startsWith("challenged")) return "challenged";

    const host = window.location.host;
    const hostname = window.location.hostname;
    if (
      /^(www\.)?carecnc\.com$/i.test(host) ||
      /^(www\.)?carecnc\.com$/i.test(hostname)
    ) {
      return "carecnc";
    }
  } catch {
    /* use the default app id */
  }

  return "challenged";
}
