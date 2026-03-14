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
  };
  howItWorksSteps: { step: string; title: string; desc: string }[];
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
  },
  howItWorksSteps: [
    { step: "1", title: "Search & Compare", desc: "Browse verified caregivers by specialty, location, ratings, and availability. No account needed to search." },
    { step: "2", title: "Book & Manage", desc: "Book care sessions, manage schedules, and coordinate with your care team all in one place." },
    { step: "3", title: "Track & Connect", desc: "Use GPS tracking, care journals, and team coordination to stay connected and informed." },
  ],
  trustBadges: ["Background Checked", "Verified Reviews", "GPS Tracking"],
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
  ctaSubtitle: "Join families who trust Challenged to coordinate compassionate dementia care.",
  ctaButton: "Find Dementia Caregivers",
  searchPlaceholder: "What dementia care do you need?",
  howItWorksTitle: "How Challenged Works",
  footerBrand: "Challenged",
  footerTagline: "Supporting dementia caregivers and families since 2024.",
  metaTitle: "Challenged — Dementia Care Together",
  metaDescription: "Coordinate dementia care, find specialized caregivers, and keep your loved one safe.",
  cssClass: "site-challenged",
  contactEmail: "safety@challenged.com",
  brandSlug: "challenged",
  caredOneSingular: "Loved One",
  careGroupSingular: "Care Team",
  navLabels: {
    careGroups: "Care Teams",
    findCare: "Find Help",
    caredOnes: "My Loved Ones",
    dashboard: "Dashboard",
  },
  howItWorksSteps: [
    { step: "1", title: "Find Specialized Help", desc: "Browse dementia-trained caregivers with verified experience in memory care, sundowning, and daily living support." },
    { step: "2", title: "Coordinate as a Team", desc: "Invite family members, assign tasks, share updates, and manage medications together." },
    { step: "3", title: "Stay Safe & Informed", desc: "GPS tracking, wandering alerts, health vitals, and daily check-ins keep everyone in the loop." },
  ],
  trustBadges: ["Dementia Trained", "Background Checked", "GPS & Wandering Alerts"],
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
