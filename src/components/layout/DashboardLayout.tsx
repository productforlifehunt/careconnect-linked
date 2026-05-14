import { NavLink } from "@/components/NavLink";
import { useSite } from "@/contexts/SiteContext";
import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  MessageSquare,
  Heart as HeartIcon,
  Users,
  Search,
  MapPin,
  Bell,
  User,
  LayoutDashboard,
  Briefcase,
  Settings,
  ShoppingCart,
  Lightbulb,
  HeartPulse,
  Brain,
  ShieldCheck,
  HandHeart,
  BookOpen,
} from "lucide-react";

function useSidebarItems() {
  const site = useSite();
  const { i18n } = useTranslation();
  const isChinese = i18n.language?.startsWith("zh");
  const isChallenged = site.family === "challenged";
  const isCareCNC = site.id === "carecnc";
  const L = (zh: string, en: string) => (isChinese ? zh : en);

  const base = [
    { title: site.navLabels.dashboard, url: "/dashboard", icon: LayoutDashboard },
    { title: site.navLabels.caredOnes, url: "/cared-ones", icon: HeartIcon },
    { title: L("预约", "Appointments"), url: "/bookings", icon: CalendarDays },
    { title: L("消息", "Messages"), url: "/messages", icon: MessageSquare },
    { title: site.navLabels.careGroups, url: "/care-circle", icon: Users },
    { title: L("工作机会", "Jobs Board"), url: "/jobs", icon: Briefcase },
    { title: site.navLabels.findCare, url: "/search", icon: Search },
    { title: site.navLabels.gpsTracking, url: "/gps-tracking", icon: MapPin },
    { title: L("收藏", "Favorites"), url: "/favorites", icon: HeartIcon },
    { title: L("服务者后台", "Provider Dashboard"), url: "/provider-dashboard", icon: Settings },
    { title: L("购物车", "Cart"), url: "/cart", icon: ShoppingCart },
  ];

  if (isChallenged) {
    base.push(
      { title: site.navLabels.awareD || "AwareD", url: "/aware", icon: Lightbulb },
      { title: site.navLabels.careD || "CareD", url: "/care-guides", icon: HeartPulse },
      { title: site.navLabels.copeD || "CopeD", url: "/coping", icon: Brain },
      { title: site.navLabels.safeD || "SafeD", url: "/safety-guides", icon: ShieldCheck },
      { title: site.navLabels.accompanieD || "AccompanieD", url: "/accompanied", icon: HandHeart },
    );
  }

  // Resources is only for ChallengeD/忆畅 — not for CareCNC/护畅
  if (!isCareCNC) {
    base.push({ title: L("资源", "Resources"), url: "/resources", icon: BookOpen });
  }

  base.push(
    { title: L("通知", "Notifications"), url: "/notifications", icon: Bell },
    { title: L("我的资料", "My Profile"), url: "/profile", icon: User },
  );

  return base;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const sidebarItems = useSidebarItems();
  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r bg-sidebar-background overflow-y-auto">
        <nav className="flex flex-col gap-0.5 p-3 pt-4">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.url + item.title}
              to={item.url}
              end={item.url === "/dashboard"}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
