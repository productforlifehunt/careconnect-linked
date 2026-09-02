import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTranslation } from "react-i18next";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useSite } from "@/contexts/SiteContext";
import {
  Home,
  Search,
  CalendarDays,
  LayoutDashboard,
  Users,
  MapPin,
  MessageSquare,
  Heart,
  HelpCircle,
  Shield,
  Bell,
  UserPlus,
  User,
  Newspaper,
  ShoppingCart,
} from "lucide-react";

import { Bot, Building2 } from "lucide-react";

export function AppSidebar() {
  const { isAuthenticated } = useAuth();
  const site = useSite();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { t } = useTranslation();

  const isChallenged = site.family === "challenged";
  const isV1 = site.id === "challenged-v1";

  const publicItems = isChallenged
    ? [
        { title: t("nav.dashboard"), url: "/", icon: Home },
        ...(isV1 ? [] : [
          { title: t("nav.awareD"), url: "/aware", icon: Search },
          { title: t("nav.careD"), url: "/care-guides", icon: Heart },
          { title: t("nav.copeD"), url: "/coping", icon: Heart },
          { title: t("nav.safeD"), url: "/safety-guides", icon: Heart },
          { title: t("nav.accompanieD"), url: "/accompanied", icon: Heart },
        ]),
        { title: t("nav.findCaregivers"), url: "/search?service_category=care", icon: Search },
        { title: t("nav.findLocalCompanion"), url: "/search?service_type=local&service_category=companionship", icon: Heart },
        { title: t("nav.findRemoteCompanion"), url: "/search?service_type=remote&service_category=companionship", icon: MessageSquare },
        { title: t("nav.aiCompanion"), url: "/ai-companion", icon: Bot },
        { title: t("nav.seniorFacilities"), url: "/search?service_category=facility", icon: Building2 },
        { title: t("nav.community"), url: "/community", icon: Newspaper },
        { title: t("nav.howItWorks"), url: "/how-it-works", icon: HelpCircle },
      ]
    : [
        { title: t("nav.dashboard"), url: "/", icon: Home },
        { title: t("nav.findCare"), url: "/search", icon: Search },
        { title: t("nav.community"), url: "/community", icon: Newspaper },
        { title: t("nav.articles"), url: "/articles", icon: Newspaper },
        { title: t("nav.howItWorks"), url: "/how-it-works", icon: HelpCircle },
        { title: t("nav.becomeCaregiver"), url: "/become-caregiver", icon: UserPlus },
      ];

  const authItems = [
    { title: t("nav.dashboard"), url: "/dashboard", icon: LayoutDashboard },
    { title: t("nav.myBookings"), url: "/bookings", icon: CalendarDays },
    { title: t(isChallenged ? "nav.united" : "nav.careGroups"), url: "/care-circle", icon: Users },
    { title: t(isChallenged ? "nav.myLovedOnes" : "nav.caredOnes"), url: "/cared-ones", icon: Heart },
    { title: isChallenged ? t("nav.find") : t("nav.gpsTracking"), url: "/gps-tracking", icon: MapPin },
    { title: t("nav.messages"), url: "/messages", icon: MessageSquare },
    { title: t("nav.notifications"), url: "/notifications", icon: Bell },
    { title: t("nav.favorites"), url: "/favorites", icon: Heart },
    { title: t("nav.cart", "Cart"), url: "/cart", icon: ShoppingCart },
    { title: t("nav.myProfile"), url: "/profile", icon: User },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent className="pt-0">
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.browse")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {publicItems.map((item) => {
                const title = item.title;
                return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={title}>
                    <NavLink to={item.url} end={item.url === "/"} className="hover:bg-accent/50" activeClassName="bg-accent text-accent-foreground font-medium">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAuthenticated && (
          <SidebarGroup>
            <SidebarGroupLabel>{t("nav.myCare")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {authItems.map((item) => {
                  const title = item.title;
                  return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild tooltip={title}>
                      <NavLink to={item.url} className="hover:bg-accent/50" activeClassName="bg-accent text-accent-foreground font-medium">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("nav.trustSafety")}>
                  <NavLink to="/trust-safety" className="hover:bg-accent/50" activeClassName="bg-accent text-accent-foreground font-medium">
                    <Shield className="h-4 w-4" />
                    {!collapsed && <span>{t("nav.trustSafety")}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
