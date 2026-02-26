import { NavLink } from "@/components/NavLink";
import { useSite } from "@/contexts/SiteContext";
import {
  CheckSquare,
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
} from "lucide-react";

function useSidebarItems() {
  const site = useSite();
  return [
    { title: site.navLabels.dashboard, url: "/dashboard", icon: LayoutDashboard },
    { title: site.navLabels.caredOnes, url: "/cared-ones", icon: HeartIcon },
    { title: "Appointments", url: "/bookings", icon: CalendarDays },
    { title: "Messages", url: "/messages", icon: MessageSquare },
    { title: site.navLabels.careGroups, url: "/care-circle", icon: Users },
    { title: "Jobs Board", url: "/jobs", icon: Briefcase },
    { title: site.navLabels.findCare, url: "/search", icon: Search },
    { title: "GPS Tracking", url: "/gps-tracking", icon: MapPin },
    { title: "Favorites", url: "/favorites", icon: HeartIcon },
    { title: "Provider Dashboard", url: "/provider-dashboard", icon: Settings },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "My Profile", url: "/profile", icon: User },
  ];
}

// Key items for mobile bottom bar (max 5)
function useMobileBarItems() {
  const site = useSite();
  return [
    { title: "Home", url: "/dashboard", icon: LayoutDashboard },
    { title: site.navLabels.caredOnes, url: "/cared-ones", icon: HeartIcon },
    { title: "Messages", url: "/messages", icon: MessageSquare },
    { title: site.navLabels.careGroups.split(" ")[0], url: "/care-circle", icon: Users },
    { title: "Profile", url: "/profile", icon: User },
  ];
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const sidebarItems = useSidebarItems();
  const mobileBarItems = useMobileBarItems();
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

      {/* Main content — add bottom padding on mobile for bottom bar */}
      <div className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</div>

      {/* Mobile bottom navigation bar — visible only below md */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t flex items-center justify-around h-14 px-1">
        {mobileBarItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/dashboard"}
            className="flex flex-col items-center gap-0.5 px-2 py-1 text-muted-foreground transition-colors min-w-0"
            activeClassName="text-primary"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] leading-tight truncate">{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
