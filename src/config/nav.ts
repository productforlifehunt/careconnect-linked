/**
 * Single source of truth for app navigation.
 *
 * Before this file the same link lists were hand-written in the header, the
 * dashboard sidebar and the mobile bottom bar, which is how they drifted apart.
 * Every surface now derives its items from here:
 *   header        → buildPublicNav
 
 *   bottom tabs   → buildBottomTabs
 */
import type { TFunction } from "i18next";
import {
  Home,
  Search,
  Heart,
  MessageSquare,
  Bot,
  Building2,
  Users,
  Newspaper,
  HelpCircle,
  UserPlus,
  LayoutDashboard,
  CalendarDays,
  MapPin,
  Bell,
  User,
  ShoppingCart,
  Inbox,
  Settings,
  HeartHandshake,
  Lightbulb,
  HeartPulse,
  Wand2,
  ShieldCheck,
  HandHeart,
  BookOpen,
} from "lucide-react";
import { aiBrand } from "../../supabase/functions/_shared/ai-prompts";

export type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

type SiteLike = {
  id: string;
  family?: string;
  navLabels: {
    careGroups: string;
    caredOnes: string;
    findCare?: string;
    dashboard?: string;
    gpsTracking?: string;
    awareD?: string;
    careD?: string;
    copeD?: string;
    safeD?: string;
    accompanieD?: string;
  };
};


type Opts = {
  site: SiteLike;
  t: TFunction;
  isChinese?: boolean;
  /** Include a Home/Dashboard entry first (sidebar does, header does not). */
  withHome?: boolean;
};


/** Public entries: visible to everyone, signed in or not. */
export function buildPublicNav({ site, t, isChinese, withHome }: Opts): NavItem[] {
  const isChallenged = site.family === "challenged";
  const isV1 = site.id === "challenged-v1";
  const isCareCNC = site.id === "carecnc";
  const home: NavItem[] = withHome ? [{ title: t("nav.dashboard"), url: "/", icon: Home }] : [];

  if (isChallenged) {
    return [
      ...home,
      ...(isV1
        ? []
        : [
            { title: t("nav.awareD"), url: "/awared", icon: Search },
            { title: t("nav.careD"), url: "/cared", icon: Heart },
            { title: t("nav.copeD"), url: "/coped", icon: Heart },
            { title: t("nav.safeD"), url: "/safed", icon: Heart },
            { title: t("nav.accompanieD"), url: "/accompanied", icon: Heart },
          ]),
      { title: t("nav.findCaregivers"), url: "/search-caregiver", icon: Search },
      {
        title: t("nav.findLocalCompanion"),
        url: "/search-local-caregiver",
        icon: Heart,
      },
      {
        title: t("nav.findRemoteCompanion"),
        url: "/search-remote-caregiver",
        icon: MessageSquare,
      },
      { title: t("nav.aiCompanion"), url: "/ai-companion", icon: Bot, badge: aiBrand(isChinese ? "zh" : "en") },
      { title: t("nav.seniorFacilities"), url: "/search-care-facility", icon: Building2 },
      { title: isChinese ? t("nav.united") : site.navLabels.careGroups, url: "/care-circle", icon: Users },
      { title: t("nav.community"), url: "/community", icon: Newspaper },
      { title: t("nav.howItWorks"), url: "/how-it-works", icon: HelpCircle },
    ];
  }

  return [
    ...home,
    { title: t("nav.careGroups"), url: "/care-circle", icon: Users },
    { title: t("nav.findCare"), url: "/search", icon: Search },
    ...(isCareCNC ? [] : [{ title: t("nav.community"), url: "/community", icon: Newspaper }]),
    { title: t("nav.articles"), url: "/articles", icon: Newspaper },
    { title: t("nav.howItWorks"), url: "/how-it-works", icon: HelpCircle },
    { title: t("nav.becomeCaregiver"), url: "/become-caregiver", icon: UserPlus },
  ];
}


/** The four fixed tabs of the mobile bottom bar (the 5th slot is "More"). */
export function buildBottomTabs({ site, t, isChinese }: Opts): NavItem[] {
  const isChallenged = site.family === "challenged";
  const caredOnesLabel = isChinese ? "被护理者" : site.navLabels.caredOnes;
  const careGroupLabel = isChinese
    ? isChallenged
      ? "护理群组"
      : "照护小组"
    : isChallenged
      ? "Care Teams"
      : site.navLabels.careGroups;

  return [
    { title: isChinese ? "首页" : "Home", url: "/dashboard", icon: LayoutDashboard },
    { title: caredOnesLabel, url: "/cared-ones", icon: Heart },
    { title: careGroupLabel, url: "/care-circle", icon: Users },
    { title: isChinese ? "收件箱" : "Inbox", url: "/inbox", icon: Inbox },
  ];
}
