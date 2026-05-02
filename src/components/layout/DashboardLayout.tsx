import { NavLink } from "@/components/NavLink";
import { useSite } from "@/contexts/SiteContext";
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
  const isChallenged = site.id === "challenged";

  const base = [
    { title: site.navLabels.dashboard, url: "/dashboard", icon: LayoutDashboard },
    { title: site.navLabels.caredOnes, url: "/cared-ones", icon: HeartIcon },
    { title: "Appointments", url: "/bookings", icon: CalendarDays },
    { title: "Messages", url: "/messages", icon: MessageSquare },
    { title: site.navLabels.careGroups, url: "/care-circle", icon: Users },
    { title: "Jobs Board", url: "/jobs", icon: Briefcase },
    { title: site.navLabels.findCare, url: "/search", icon: Search },
    { title: site.navLabels.gpsTracking, url: "/gps-tracking", icon: MapPin },
    { title: "Favorites", url: "/favorites", icon: HeartIcon },
    { title: "Provider Dashboard", url: "/provider-dashboard", icon: Settings },
    { title: "Cart", url: "/cart", icon: ShoppingCart },
  ];

  // ChallengeD content sections
  if (isChallenged) {
    base.push(
      { title: site.navLabels.awareD || "AwareD", url: "/aware", icon: Lightbulb },
      { title: site.navLabels.careD || "CareD", url: "/care-guides", icon: HeartPulse },
      { title: site.navLabels.copeD || "CopeD", url: "/coping", icon: Brain },
      { title: site.navLabels.safeD || "SafeD", url: "/safety-guides", icon: ShieldCheck },
      { title: site.navLabels.accompanieD || "AccompanieD", url: "/accompanied", icon: HandHeart },
    );
  }

  base.push(
    { title: "Resources", url: "/resources", icon: BookOpen },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "My Profile", url: "/profile", icon: User },
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
      {/* Sidebar — visible on md+ screens */}
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

      {/* Main content — bottom padding handled by AppLayout */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
