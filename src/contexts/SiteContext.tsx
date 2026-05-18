import React, { createContext, useContext, useMemo, useEffect } from "react";
import i18n from "@/i18n/config";

export type SiteId = "carecnc" | "challenged" | "challenged-v1" | "duocare";

export interface SiteConfig {
  id: SiteId;
  /** Brand family — versioned variants (e.g. challenged-v1) share the
   *  same family as their parent so id-based UI checks keep working. */
  family?: "challenged" | "carecnc" | "duocare";
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
  /** Force a specific i18n language regardless of browser detection. */
  forceLanguage?: string;
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
  family: "carecnc",
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
  family: "challenged",
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
  family: "duocare",
  name: "CareDuo",
  tagline: "Simple care for everyday life.",
  logoText: "Care",
  logoAccent: "Duo",
  heroTitle: "Trusted care,",
  heroHighlight: "made simpler.",
  heroSubtitle: "CareDuo helps families find trusted caregivers, manage schedules, and stay connected with the people they care about.",
  ctaTitle: "Ready to arrange care with confidence?",
  ctaSubtitle: "Use CareDuo to find reliable support, compare options, and keep care organized in one place.",
  ctaButton: "Find Care",
  searchPlaceholder: "What kind of care do you need?",
  howItWorksTitle: "How CareDuo Works",
  footerBrand: "CareDuo",
  footerTagline: "Trusted care for families, seniors, children, pets, and everyday support.",
  metaTitle: "CareDuo — Simple, trusted care",
  metaDescription: "Find trusted caregivers, manage bookings, and keep care organized with CareDuo.",
  cssClass: "site-duocare",
  contactEmail: "hello@duocare.app",
  brandSlug: "duocare",
  caredOneSingular: "Loved One",
  careGroupSingular: "Care Circle",
  navLabels: {
    careGroups: "Care Circles",
    findCare: "Find Care",
    caredOnes: "Loved Ones",
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

// ChallengeD 1.0 / 忆畅 1.0 — early-launch version.
// Same brand and language as `challenged`, but trimmed feature set.
// Use ?__site=challenged-v1 (or its dedicated domain) to load this build.
const challengedV1Config: SiteConfig = {
  ...challengedConfig,
  id: "challenged-v1",
  name: "ChallengeD 1.0",
  metaTitle: "ChallengeD 1.0 — 忆畅 早期版",
  brandSlug: "challenged-v1",
  forceLanguage: "zh-CN",
};

// Force language on the main brands so the Chinese build is fully Chinese
// and the English builds are fully English.
challengedConfig.forceLanguage = "zh-CN";
careCNCConfig.forceLanguage = "en";
duoCareConfig.forceLanguage = "en";

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

const SITE_STORAGE_KEY = "__lovable_site_id";

function persistSite(id: SiteId) {
  try { sessionStorage.setItem(SITE_STORAGE_KEY, id); } catch {}
}

function detectSite(): SiteId {
  if (typeof window === "undefined") return "carecnc";

  const host = window.location.host;
  const hostname = window.location.hostname;

  const params = new URLSearchParams(window.location.search);
  const siteParam = params.get("__site");
  let resolved: SiteId | null = null;
  if (siteParam === "challenged") resolved = "challenged";
  else if (siteParam === "challenged-v1" || siteParam === "challenged-1.0" || siteParam === "yichang-v1") resolved = "challenged-v1";
  else if (siteParam === "carecnc" || siteParam === "careconnected") resolved = "carecnc";
  else if (siteParam === "duocare") resolved = "duocare";

  if (resolved) { persistSite(resolved); return resolved; }

  // Fallback: remember last site within the session so SPA navigation
  // (which strips `?__site=` from internal Links) keeps us inside the same brand.
  try {
    const stored = sessionStorage.getItem(SITE_STORAGE_KEY) as SiteId | null;
    if (stored && SITE_CONFIGS[stored]) return stored;
  } catch {}

  if (DOMAIN_MAP[host]) { persistSite(DOMAIN_MAP[host]); return DOMAIN_MAP[host]; }
  if (DOMAIN_MAP[hostname]) { persistSite(DOMAIN_MAP[hostname]); return DOMAIN_MAP[hostname]; }

  return "challenged";
}

const SITE_CONFIGS: Record<SiteId, SiteConfig> = {
  challenged: challengedConfig,
  "challenged-v1": challengedV1Config,
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

    // Force language so Chinese builds are fully Chinese and English builds
    // are fully English, regardless of browser locale or saved preference.
    if (config.forceLanguage && i18n.language !== config.forceLanguage) {
      i18n.changeLanguage(config.forceLanguage);
      try { localStorage.setItem("i18nextLng", config.forceLanguage); } catch {}
    }
  }, [config]);

  return <SiteContext.Provider value={config}>{children}</SiteContext.Provider>;
};

export const useSite = () => useContext(SiteContext);

/** Returns { area, language } for CCT content filtering based on current site. */
export function getContentLocale(siteId: SiteId = detectSite()): { area: string; language: string } {
  if (siteId === "challenged" || siteId === "challenged-v1") {
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
