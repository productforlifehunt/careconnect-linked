import React, { createContext, useContext, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n/config";

export type SiteId = "carecnc" | "challenged" | "challenged-v1" | "notchnote";

export interface SiteConfig {
  id: SiteId;
  /** Brand family — versioned variants (e.g. challenged-v1) share the
   *  same family as their parent so id-based UI checks keep working. */
  family?: "challenged" | "carecnc" | "notchnote";
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
  trustBadges: ["badge1", "badge2", "badge3", "badge4", "badge5"],
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

  // Purge any legacy sessionStorage value — site is now resolved purely from
  // hostname + ?__site param. No cross-app cache bleed.
  try { sessionStorage.removeItem("__lovable_site_id"); } catch {}

  const host = window.location.host;
  const hostname = window.location.hostname;

  const params = new URLSearchParams(window.location.search);
  const siteParam = params.get("__site");
  if (siteParam === "challenged") return "challenged";
  if (siteParam === "challenged-v1" || siteParam === "challenged-1.0" || siteParam === "yichang-v1") return "challenged-v1";
  if (siteParam === "carecnc" || siteParam === "careconnected") return "carecnc";
  if (siteParam === "notchnote" || siteParam === "notch") return "notchnote";

  if (DOMAIN_MAP[host]) return DOMAIN_MAP[host];
  if (DOMAIN_MAP[hostname]) return DOMAIN_MAP[hostname];

  // Default to challenged (忆畅) when nothing else matches.
  return "challenged";
}

const notchNoteConfig: SiteConfig = {
  ...careCNCConfig,
  id: "notchnote", family: "notchnote", name: "Notch Note",
  tagline: "The connected workspace",
  logoText: "Notch", logoAccent: "Note",
  metaTitle: "Notch Note — Write, plan, share",
  metaDescription: "The connected workspace. Notion-like pages, databases, and collaboration.",
  cssClass: "site-notchnote", brandSlug: "notchnote",
};

const SITE_CONFIGS: Record<SiteId, SiteConfig> = {
  challenged: challengedConfig,
  "challenged-v1": challengedV1Config,
  carecnc: careCNCConfig,
  notchnote: notchNoteConfig,
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
    html.classList.remove("site-carecnc", "site-challenged", "site-notchnote");
    html.classList.add(config.cssClass);

    // Update page title
    document.title = config.metaTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", config.metaDescription);

  }, [config]);

  return <SiteContext.Provider value={config}>{children}</SiteContext.Provider>;
};

export const useSite = (): SiteConfig => {
  const base = useContext(SiteContext);
  const { i18n: i18nInstance } = useTranslation();
  const lang = i18nInstance.language || "en";
  const isCN = lang.startsWith("zh");
  if (!isCN) return base;
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
