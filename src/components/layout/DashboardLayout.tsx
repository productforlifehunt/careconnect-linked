import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  CheckSquare,
  CalendarDays,
  MessageSquare,
  Heart as HeartIcon,
  Users,
  Search,
  Briefcase,
  MapPin,
  Bell,
  User,
  Settings,
  LayoutDashboard,
} from "lucide-react";

const sidebarItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Appointments", url: "/bookings", icon: CalendarDays },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Cared Ones", url: "/cared-ones", icon: HeartIcon },
  { title: "Care Groups", url: "/care-circle", icon: Users },
  { title: "Find Care", url: "/search", icon: Search },
  { title: "My Bookings", url: "/bookings", icon: Briefcase },
  { title: "GPS Tracking", url: "/gps-tracking", icon: MapPin },
  { title: "Favorites", url: "/favorites", icon: HeartIcon },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "My Profile", url: "/profile", icon: User },
];

// Deduplicate by url (keep first occurrence)
const uniqueSidebarItems = sidebarItems.filter(
  (item, i, arr) => arr.findIndex((x) => x.url === item.url) === i
);

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar — hidden on mobile */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r bg-sidebar-background overflow-y-auto">
        <nav className="flex flex-col gap-0.5 p-3 pt-4">
          {uniqueSidebarItems.map((item) => (
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

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
