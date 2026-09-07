import React, { createContext, useContext, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n/config";

export type SiteId = "carecnc" | "challenged" | "challenged-v1" | "notchsafety";

export interface SiteConfig {
  id: SiteId;
  /** Brand family — versioned variants (e.g. challenged-v1) share the
   *  same family as their parent so id-based UI checks keep working. */
  family?: "challenged" | "carecnc" | "notchsafety";
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
  family: "carecnc",
  name: "CareCNC",
  tagline: "Connect. Care. Continue.",
  logoText: "Care",
  logoAccent: "CNC",
  heroTitle: "Find Trusted Care,",
  heroHighlight: "Stay Connected",
  heroSubtitle: "Search caregivers, book appointments, coordinate with your care team, and track care in real-time — all in one place.",
  ctaTitle: "Ready to find the perfect caregiver?",
  ctaSubtitle: "Search caregivers, compare rates, and book in a few steps.",
  ctaButton: "Find Caregivers",
  searchPlaceholder: "What type of care do you need?",
  howItWorksTitle: "How CareCNC Works",
  footerBrand: "CareCNC",
  footerTagline: "Connect. Care. Continue. — Find caregivers and coordinate care.",
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
  footerTagline: "Dementia care knowledge, coordination and location safety.",
  metaTitle: "ChallengeD — Dementia Care Together",
  metaDescription: "Coordinate dementia care, find specialized caregivers, and keep your cared one safe.",
  cssClass: "site-challenged",
  contactEmail: "safety@challenged.com",
  brandSlug: "challenged",
  caredOneSingular: "Cared One",
  careGroupSingular: "Care Team",
  navLabels: {
    careGroups: "Care Teams",
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
  trustBadges: ["badge1", "badge2", "badge3", "badge4"],
};

// 忆畅 early-launch variant.
// Same Chinese brand as `challenged`, but trimmed feature set.
// Use ?__site=challenged-v1 (or its dedicated domain) to load this build.
const challengedV1Config: SiteConfig = {
  ...challengedConfig,
  id: "challenged-v1",
  name: "忆畅",
  metaTitle: "忆畅 — 失智症护理支持",
  footerBrand: "忆畅",
  brandSlug: "challenged-v1",
};

// All brands keep the user's explicit language choice; never auto-overwrite it.

/** Map hostnames to site IDs */
const DOMAIN_MAP: Record<string, SiteId> = {
  "challenged.com": "challenged",
  "www.challenged.com": "challenged",
  "carecnc.com": "carecnc",
  "www.carecnc.com": "carecnc",
  "localhost:5174": "challenged",
};

function detectSite(): SiteId {
  if (typeof window === "undefined") return "challenged";

  const host = window.location.host;
  const hostname = window.location.hostname;
  const storageKey = `__site_id:${host}`;

  const params = new URLSearchParams(window.location.search);
  const siteParam = params.get("__site");
  const paramSite: SiteId | null =
    siteParam === "challenged" ? "challenged" :
    siteParam === "challenged-v1" || siteParam === "challenged-1.0" || siteParam === "yichang-v1" ? "challenged-v1" :
    siteParam === "carecnc" || siteParam === "careconnected" ? "carecnc" :
    siteParam === "notchsafety" || siteParam === "safety" ? "notchsafety" : null;

  // The query override is used to preview separate sub-apps on one host. Keep
  // that explicit choice for this tab so an internal Link followed by refresh
  // cannot silently fall back to another brand. The key is host-scoped to
  // prevent identity leaking between real domains.
  if (paramSite) {
    try { sessionStorage.setItem(storageKey, paramSite); } catch {}
    return paramSite;
  }

  const mappedSite = DOMAIN_MAP[host] || DOMAIN_MAP[hostname];
  if (mappedSite) {
    try { sessionStorage.removeItem(storageKey); } catch {}
    return mappedSite;
  }

  try {
    const storedSite = sessionStorage.getItem(storageKey);
    if (storedSite && storedSite in SITE_CONFIGS) return storedSite as SiteId;
  } catch {}

  // Default to challenged (忆畅) when nothing else matches.
  return "challenged";
}

const notchSafetyConfig: SiteConfig = {
  ...careCNCConfig,
  id: "notchsafety", family: "notchsafety", name: "NotchSafety",
  tagline: "Know everyone is safe.",
  logoText: "Notch", logoAccent: "Safety",
  footerBrand: "NotchSafety",
  metaTitle: "NotchSafety — Family location & safe zones",
  metaDescription: "See where your family is, get alerts when they leave or enter a safe zone, and send SOS in one tap.",
  cssClass: "site-notchsafety", brandSlug: "notchsafety",
  navLabels: { ...careCNCConfig.navLabels, gpsTracking: "Map" },
};

const SITE_CONFIGS: Record<SiteId, SiteConfig> = {
  challenged: challengedConfig,
  "challenged-v1": challengedV1Config,
  carecnc: careCNCConfig,
  notchsafety: notchSafetyConfig,
};

const SiteContext = createContext<SiteConfig>(challengedConfig);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const config = useMemo(() => {
    const id = detectSite();
    return SITE_CONFIGS[id];
  }, []);

  // Apply CSS class to <html> for theme override
  useEffect(() => {
    const html = document.documentElement;
    // Remove any existing site class
    html.classList.remove("site-carecnc", "site-challenged", "site-notchsafety");
    html.classList.add(config.cssClass);

    // Update page title
    document.title = config.metaTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", config.metaDescription);
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) {
      favicon.href =
        config.family === "notchsafety"
          ? "/favicon-notchsafety.png"
          : config.family === "carecnc"
            ? "/favicon-carecnc.png"
            : "/favicon-challenged.png";
    }

  }, [config]);

  return <SiteContext.Provider value={config}>{children}</SiteContext.Provider>;
};

export const useSite = (): SiteConfig => {
  const base = useContext(SiteContext);
  const { i18n: i18nInstance } = useTranslation();
  const lang = i18nInstance.language || "en";
  const isCN = lang.startsWith("zh");
  if (!isCN) return base;
  // NotchSafety is a family locator, not a care product — it never inherits
  // caregiving vocabulary.
  if (base.family === "notchsafety") {
    return {
      ...base,
      name: "诺驰安全",
      tagline: "让家人始终安全",
      caredOneSingular: "家人",
      careGroupSingular: "圈子",
      navLabels: { ...base.navLabels, gpsTracking: "地图", careGroups: "圈子", dashboard: "地图" },
    };
  }
  const isChallenged = base.family === "challenged";
  return {
    ...base,
    caredOneSingular: isChallenged ? "被护理者" : "被照顾者",
    careGroupSingular: isChallenged ? "护理群组" : "照护小组",
    navLabels: {
      ...base.navLabels,
      careGroups: isChallenged ? "护理群组" : "照护小组",
      findCare: isChallenged ? "寻求帮助" : "寻找护理",
      caredOnes: isChallenged ? "被护理者" : "被照顾者",
      dashboard: "控制面板",
      gpsTracking: isChallenged ? "定位" : "定位追踪",
      awareD: "认知助手",
      careD: "护理助手",
      copeD: "情绪助手",
      safeD: "安全助手",
      accompanieD: "陪伴助手",
      manageD: "管理助手",
    },
  };
};

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
