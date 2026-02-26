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
} from "lucide-react";

const publicItems = [
  { title: "Home", url: "/", icon: Home },
  { titleKey: "findCare" as const, url: "/search", icon: Search },
  { title: "How It Works", url: "/how-it-works", icon: HelpCircle },
  { title: "Become a Caregiver", url: "/become-caregiver", icon: UserPlus },
];

const authItems = [
  { titleKey: "dashboard" as const, url: "/dashboard", icon: LayoutDashboard },
  { title: "My Bookings", url: "/bookings", icon: CalendarDays },
  { titleKey: "careGroups" as const, url: "/care-circle", icon: Users },
  { title: "GPS Tracking", url: "/gps-tracking", icon: MapPin },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Favorites", url: "/favorites", icon: Heart },
  { title: "My Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { isAuthenticated } = useAuth();
  const site = useSite();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const getTitle = (item: any) => item.titleKey ? (site.navLabels as any)[item.titleKey] : item.title;

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupLabel>Browse</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {publicItems.map((item) => {
                const title = getTitle(item);
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
            <SidebarGroupLabel>My Care</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {authItems.map((item) => {
                  const title = getTitle(item);
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
                <SidebarMenuButton asChild tooltip="Trust & Safety">
                  <NavLink to="/trust-safety" className="hover:bg-accent/50" activeClassName="bg-accent text-accent-foreground font-medium">
                    <Shield className="h-4 w-4" />
                    {!collapsed && <span>Trust & Safety</span>}
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
