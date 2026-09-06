/**
 * Single source of truth for app navigation.
 *
 * Before this file the same link lists were hand-written in AppHeader,
 * AppSidebar and the mobile drawer, which is how they drifted apart.
 * Every surface now derives its items from here.
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
  navLabels: { careGroups: string; caredOnes: string };
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
            { title: t("nav.awareD"), url: "/aware", icon: Search },
            { title: t("nav.careD"), url: "/care-guides", icon: Heart },
            { title: t("nav.copeD"), url: "/coping", icon: Heart },
            { title: t("nav.safeD"), url: "/safety-guides", icon: Heart },
            { title: t("nav.accompanieD"), url: "/accompanied", icon: Heart },
          ]),
      { title: t("nav.findCaregivers"), url: "/search?service_category=care", icon: Search },
      {
        title: t("nav.findLocalCompanion"),
        url: "/search?service_category=care&service_location=in-person&service_type=companionship",
        icon: Heart,
      },
      {
        title: t("nav.findRemoteCompanion"),
        url: "/search?service_category=care&service_location=remote&service_type=companionship",
        icon: MessageSquare,
      },
      { title: t("nav.aiCompanion"), url: "/ai-companion", icon: Bot, badge: aiBrand(isChinese ? "zh" : "en") },
      { title: t("nav.seniorFacilities"), url: "/search?service_category=facility", icon: Building2 },
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

/** Signed-in entries. `dashboardLabel` differs between installed app and web. */
export function buildAuthNav({
  site,
  t,
  dashboardLabel,
}: Opts & { dashboardLabel?: string }): NavItem[] {
  const isChallenged = site.family === "challenged";
  return [
    { title: dashboardLabel || t("nav.dashboard"), url: "/dashboard", icon: LayoutDashboard },
    { title: t(isChallenged ? "nav.myLovedOnes" : "nav.caredOnes"), url: "/cared-ones", icon: Heart },
    { title: t("nav.myBookings"), url: "/bookings", icon: CalendarDays },
    { title: t(isChallenged ? "nav.united" : "nav.careGroups"), url: "/care-circle", icon: Users },
    { title: isChallenged ? t("nav.find") : t("nav.gpsTracking"), url: "/gps-tracking", icon: MapPin },
    { title: t("nav.messages"), url: "/messages", icon: MessageSquare },
    { title: t("nav.notifications"), url: "/notifications", icon: Bell },
    { title: t("nav.favorites"), url: "/favorites", icon: Heart },
    { title: t("nav.cart", "Cart"), url: "/cart", icon: ShoppingCart },
    { title: t("nav.myProfile"), url: "/profile", icon: User },
  ];
}
