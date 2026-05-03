import React, { createContext, useContext, useMemo, useEffect } from "react";

export type SiteId = "carecnc" | "challenged" | "duocare";

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
  /** Singular label for a cared-one */
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

const careCNCConfig: SiteConfig = {
  id: "carecnc",
  name: "CareCNC",
  tagline: "Connect. Care. Continue.",
  logoText: "CNC",
  logoAccent: "",
  heroTitle: "Find Trusted Care,",
  heroHighlight: "Stay Connected",
  heroSubtitle: "Search caregivers, book appointments, coordinate with your care team, and track care in real-time — all in one place.",
  ctaTitle: "Ready to find the perfect caregiver?",
  ctaSubtitle: "Join thousands of families who trust CareCNC for their caregiving needs.",
  ctaButton: "Find Caregivers",
  searchPlaceholder: "What type of care do you need?",
  howItWorksTitle: "How CareCNC Works",
  footerBrand: "CareCNC",
  footerTagline: "Connect. Care. Continue. — Connecting families with trusted caregivers since 2024.",
  metaTitle: "CareCNC — Connect. Care. Continue.",
  metaDescription: "Search caregivers, book appointments, and coordinate care in one place.",
  cssClass: "site-carecnc",
  contactEmail: "hello@carecnc.com",
  brandSlug: "carecnc",
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
  heroTitle: "Challenge Dementia,",
  heroHighlight: "Together",
  heroSubtitle: "Your all-in-one dementia care platform — knowledge guides, care coordination, GPS safety, AI companionship, and professional support.",
  ctaTitle: "Your dementia care journey starts here",
  ctaSubtitle: "Join families who trust ChallengeD to coordinate compassionate dementia care.",
  ctaButton: "Find Dementia Caregivers",
  searchPlaceholder: "What dementia care do you need?",
  howItWorksTitle: "How ChallengeD Works",
  footerBrand: "ChallengeD",
  footerTagline: "Supporting dementia caregivers and families since 2024.",
  metaTitle: "ChallengeD — Dementia Care Together",
  metaDescription: "Coordinate dementia care, find specialized caregivers, and keep your cared one safe.",
  cssClass: "site-challenged",
  contactEmail: "safety@challenged.com",
  brandSlug: "challenged",
  caredOneSingular: "Cared One",
  careGroupSingular: "Care Team",
  navLabels: {
    careGroups: "UniteD",
    findCare: "Find Help",
    caredOnes: "Cared Ones",
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

const duoCareConfig: SiteConfig = {
  id: "duocare",
  name: "DuoCare",
  tagline: "Care, made simple — together.",
  logoText: "Duo",
  logoAccent: "Care",
  heroTitle: "Care is better,",
  heroHighlight: "in pairs.",
  heroSubtitle: "DuoCare pairs families with trusted caregivers — playful, simple, and built around the people you love.",
  ctaTitle: "Ready to find your care duo?",
  ctaSubtitle: "Join thousands of families who picked DuoCare for warm, reliable care matches.",
  ctaButton: "Find My Duo",
  searchPlaceholder: "Who needs care today?",
  howItWorksTitle: "How DuoCare Works",
  footerBrand: "DuoCare",
  footerTagline: "Pairing families with caregivers — one duo at a time.",
  metaTitle: "DuoCare — Care, in pairs.",
  metaDescription: "Pair with trusted caregivers, coordinate your care duo, and keep loved ones supported.",
  cssClass: "site-duocare",
  contactEmail: "hello@duocare.app",
  brandSlug: "duocare",
  caredOneSingular: "Loved One",
  careGroupSingular: "Care Duo",
  navLabels: {
    careGroups: "Care Duos",
    findCare: "Find a Duo",
    caredOnes: "Loved Ones",
    dashboard: "My Duo",
    gpsTracking: "Where",
  },
  howItWorksSteps: [
    { step: "1", titleKey: "step1Title", descKey: "step1Desc" },
    { step: "2", titleKey: "step2Title", descKey: "step2Desc" },
    { step: "3", titleKey: "step3Title", descKey: "step3Desc" },
  ],
  trustBadges: ["badge1", "badge2", "badge3"],
};

/** Map hostnames to site IDs */
const DOMAIN_MAP: Record<string, SiteId> = {
  "challenged.com": "challenged",
  "www.challenged.com": "challenged",
  "duocare.app": "duocare",
  "www.duocare.app": "duocare",
  "carecnc.com": "carecnc",
  "www.carecnc.com": "carecnc",
  "localhost:5174": "challenged",
};

function detectSite(): SiteId {
  if (typeof window === "undefined") return "carecnc";

  const host = window.location.host;
  const hostname = window.location.hostname;

  const params = new URLSearchParams(window.location.search);
  const siteParam = params.get("__site");
  if (siteParam === "challenged") return "challenged";
  if (siteParam === "carecnc" || siteParam === "careconnected") return "carecnc";
  if (siteParam === "duocare") return "duocare";

  if (DOMAIN_MAP[host]) return DOMAIN_MAP[host];
  if (DOMAIN_MAP[hostname]) return DOMAIN_MAP[hostname];

  return "challenged";
}

const SITE_CONFIGS: Record<SiteId, SiteConfig> = {
  challenged: challengedConfig,
  carecnc: careCNCConfig,
  duocare: duoCareConfig,
};

const SiteContext = createContext<SiteConfig>(careCNCConfig);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const config = useMemo(() => {
    const id = detectSite();
    return SITE_CONFIGS[id];
  }, []);

  // Apply CSS class to <html> for theme override
  useEffect(() => {
    const html = document.documentElement;
    // Remove any existing site class
    html.classList.remove("site-carecnc", "site-challenged", "site-duocare");
    html.classList.add(config.cssClass);

    // Update page title
    document.title = config.metaTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", config.metaDescription);
  }, [config]);

  return <SiteContext.Provider value={config}>{children}</SiteContext.Provider>;
};

export const useSite = () => useContext(SiteContext);

/** Returns { area, language } for CCT content filtering based on current site. */
export function getContentLocale(siteId: SiteId = detectSite()): { area: string; language: string } {
  if (siteId === "challenged") {
    // Chinese site uses China + zh-CN
    return { area: "china", language: "zh-CN" };
  }
  // Default: global English
  return { area: "global", language: "en" };
}

export const useContentLocale = () => {
  const site = useSite();
  return useMemo(() => getContentLocale(site.id), [site.id]);
};
