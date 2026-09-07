/**
 * Single source of truth for app navigation.
 *
 * Before this file the same link lists were hand-written in the header, the
 * dashboard sidebar and the mobile bottom bar, which is how they drifted apart.
 * Every surface now derives its items from here:
 *   header        → buildPublicNav
 *   sidebar       → buildSidebarNav
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
    { title: t(isCareCNC ? "nav.careGroups" : "nav.careGroups"), url: "/care-circle", icon: Users },
    { title: t("nav.findCare"), url: "/search", icon: Search },
    ...(isCareCNC ? [] : [{ title: t("nav.community"), url: "/community", icon: Newspaper }]),
    { title: t("nav.articles"), url: "/articles", icon: Newspaper },
    { title: t("nav.howItWorks"), url: "/how-it-works", icon: HelpCircle },
    { title: t("nav.becomeCaregiver"), url: "/become-caregiver", icon: UserPlus },
  ];
}

/**
 * Dashboard sidebar (desktop, signed in). This list used to live inside
 * DashboardLayout; it is the canonical signed-in list now.
 */
export function buildSidebarNav({ site, t, isChinese }: Opts): NavItem[] {
  const isChallenged = site.family === "challenged";
  const isCareCNC = site.id === "carecnc";
  const isV1 = site.id === "challenged-v1";
  const L = (zh: string, en: string) => (isChinese ? zh : en);

  const items: NavItem[] = [
    { title: L("控制面板", site.navLabels.dashboard || "Dashboard"), url: "/dashboard", icon: LayoutDashboard },
    { title: L(isChallenged ? "被护理者" : "被照顾者", site.navLabels.caredOnes), url: "/cared-ones", icon: Heart },
    { title: L("预约", "Appointments"), url: "/bookings", icon: CalendarDays },
    { title: L("消息", "Messages"), url: "/messages", icon: MessageSquare },
    { title: L(isChallenged ? "护理群组" : "照护小组", site.navLabels.careGroups), url: "/care-circle", icon: Users },
    { title: L("需要帮手的任务", "Tasks Needing Help"), url: "/shared-tasks", icon: HeartHandshake },
    { title: L(isChallenged ? "寻求帮助" : "寻找护理", site.navLabels.findCare || "Find Care"), url: "/search", icon: Search },
    { title: L(isChallenged ? "定位" : "定位追踪", site.navLabels.gpsTracking || "GPS"), url: "/find", icon: MapPin },
    { title: L("收藏", "Favorites"), url: "/favorites", icon: Heart },
    { title: L("护理者面板", "Provider Dashboard"), url: "/provider-dashboard", icon: Settings },
    { title: L("购物车", "Cart"), url: "/cart", icon: ShoppingCart },
  ];

  if (isChallenged && !isV1) {
    items.push(
      { title: L("认知篇", site.navLabels.awareD || "AwareD"), url: "/awared", icon: Lightbulb },
      { title: L("护理篇", site.navLabels.careD || "CareD"), url: "/cared", icon: HeartPulse },
      { title: L("应对篇", site.navLabels.copeD || "CopeD"), url: "/coped", icon: Wand2 },
      { title: L("安全篇", site.navLabels.safeD || "SafeD"), url: "/safed", icon: ShieldCheck },
      { title: L("陪伴篇", site.navLabels.accompanieD || "AccompanieD"), url: "/accompanied", icon: HandHeart },
    );
  }

  // Resources is only for the ChallengeD full build — not CareCNC, not v1.
  if (!isCareCNC && !isV1) {
    items.push({ title: L("资源", "Resources"), url: "/resources", icon: BookOpen });
  }

  items.push(
    { title: L("收件箱", "Inbox"), url: "/inbox", icon: Inbox },
    { title: L("通知", "Notifications"), url: "/notifications", icon: Bell },
    { title: L("我的资料", "My Profile"), url: "/profile", icon: User },
  );

  return items;
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
