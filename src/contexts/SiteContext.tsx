import React, { createContext, useContext, useMemo, useEffect } from "react";

export type SiteId = "careconnected" | "challenged";

export interface SiteConfig {
  id: SiteId;
  name: string;
  tagline: string;
  logoText: string;
  logoAccent: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
  searchPlaceholder: string;
  howItWorksTitle: string;
  footerBrand: string;
  footerTagline: string;
  metaTitle: string;
  metaDescription: string;
  cssClass: string;
  contactEmail: string;
  brandSlug: string;
  /** Singular label for a cared-one, e.g. "Cared One" or "Loved One" */
  caredOneSingular: string;
  /** Singular label for a care group, e.g. "Care Group" or "Care Team" */
  careGroupSingular: string;
  /** Override nav labels if needed */
  navLabels: {
    careGroups: string;
    findCare: string;
    caredOnes: string;
    dashboard: string;
    gpsTracking: string;
    // ChallengeD-specific content sections
    awareD?: string;
    careD?: string;
    copeD?: string;
    safeD?: string;
    accompanieD?: string;
    manageD?: string;
  };
  howItWorksSteps: { step: string; titleKey: string; descKey: string }[];
  trustBadges: string[];
}

const careConnectedConfig: SiteConfig = {
  id: "careconnected",
  name: "Care·Connected",
  tagline: "Connecting families with trusted caregivers",
  logoText: "C·C",
  logoAccent: "Connected",
  heroTitle: "Find Trusted Care,",
  heroHighlight: "Stay Connected",
  heroSubtitle: "Search caregivers, book appointments, coordinate with your care team, and track care in real-time — all in one place.",
  ctaTitle: "Ready to find the perfect caregiver?",
  ctaSubtitle: "Join thousands of families who trust Care·Connected for their caregiving needs.",
  ctaButton: "Find Caregivers",
  searchPlaceholder: "What type of care do you need?",
  howItWorksTitle: "How Care·Connected Works",
  footerBrand: "Care·Connected",
  footerTagline: "Connecting families with trusted caregivers since 2024.",
  metaTitle: "Care·Connected — Find Trusted Caregivers",
  metaDescription: "Search caregivers, book appointments, and coordinate care in one place.",
  cssClass: "site-careconnected",
  contactEmail: "safety@careconnected.com",
  brandSlug: "careconnected",
  caredOneSingular: "Cared One",
  careGroupSingular: "Care Group",
  navLabels: {
    careGroups: "Care Groups",
    findCare: "Find Care",
    caredOnes: "Cared Ones",
    dashboard: "Dashboard",
    gpsTracking: "GPS Tracking",
  },
  howItWorksSteps: [
    { step: "1", titleKey: "step1Title", descKey: "step1Desc" },
    { step: "2", titleKey: "step2Title", descKey: "step2Desc" },
    { step: "3", titleKey: "step3Title", descKey: "step3Desc" },
  ],
  trustBadges: ["badge1", "badge2", "badge3"],
};

const challengedConfig: SiteConfig = {
  id: "challenged",
  name: "ChallengeD",
  tagline: "Together in dementia care",
  logoText: "Ch",
  logoAccent: "allengeD",
  heroTitle: "Dementia Care,",
  heroHighlight: "Together",
  heroSubtitle: "Coordinate dementia care with your family, find specialized caregivers, and keep your loved one safe — one team, one platform.",
  ctaTitle: "Your dementia care journey starts here",
  ctaSubtitle: "Join families who trust ChallengeD to coordinate compassionate dementia care.",
  ctaButton: "Find Dementia Caregivers",
  searchPlaceholder: "What dementia care do you need?",
  howItWorksTitle: "How ChallengeD Works",
  footerBrand: "ChallengeD",
  footerTagline: "Supporting dementia caregivers and families since 2024.",
  metaTitle: "ChallengeD — Dementia Care Together",
  metaDescription: "Coordinate dementia care, find specialized caregivers, and keep your loved one safe.",
  cssClass: "site-challenged",
  contactEmail: "safety@challenged.com",
  brandSlug: "challenged",
  caredOneSingular: "Loved One",
  careGroupSingular: "Care Team",
  navLabels: {
    careGroups: "UniteD",
    findCare: "Find Help",
    caredOnes: "My Loved Ones",
    dashboard: "Dashboard",
    gpsTracking: "FinD",
    awareD: "AwareD",
    careD: "CareD",
    copeD: "CopeD",
    safeD: "SafeD",
    accompanieD: "AccompanieD",
    manageD: "ManageD",
  },
  howItWorksSteps: [
    { step: "1", titleKey: "step1Title", descKey: "step1Desc" },
    { step: "2", titleKey: "step2Title", descKey: "step2Desc" },
    { step: "3", titleKey: "step3Title", descKey: "step3Desc" },
  ],
  trustBadges: ["badge1", "badge2", "badge3", "badge4", "badge5"],
};

/** Map hostnames to site IDs */
const DOMAIN_MAP: Record<string, SiteId> = {
  // Production domains — add your real domains here
  "challenged.com": "challenged",
  "www.challenged.com": "challenged",
  // Dev overrides via port
  "localhost:5174": "challenged",
};

function detectSite(): SiteId {
  if (typeof window === "undefined") return "careconnected";

  const host = window.location.host; // includes port
  const hostname = window.location.hostname;

  // Check URL param override for development
  const params = new URLSearchParams(window.location.search);
  const siteParam = params.get("__site");
  if (siteParam === "challenged") return "challenged";
  if (siteParam === "careconnected") return "careconnected";

  // Check full host (with port) first, then hostname only
  if (DOMAIN_MAP[host]) return DOMAIN_MAP[host];
  if (DOMAIN_MAP[hostname]) return DOMAIN_MAP[hostname];

  // Default
  return "challenged";
}

const SITE_CONFIGS: Record<SiteId, SiteConfig> = {
  careconnected: careConnectedConfig,
  challenged: challengedConfig,
};

const SiteContext = createContext<SiteConfig>(careConnectedConfig);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const config = useMemo(() => {
    const id = detectSite();
    return SITE_CONFIGS[id];
  }, []);

  // Apply CSS class to <html> for theme override
  useEffect(() => {
    const html = document.documentElement;
    // Remove any existing site class
    html.classList.remove("site-careconnected", "site-challenged");
    html.classList.add(config.cssClass);

    // Update page title
    document.title = config.metaTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", config.metaDescription);
  }, [config]);

  return <SiteContext.Provider value={config}>{children}</SiteContext.Provider>;
};

export const useSite = () => useContext(SiteContext);
