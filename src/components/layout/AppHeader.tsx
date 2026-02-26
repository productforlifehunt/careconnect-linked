import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSite } from "@/contexts/SiteContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NavLink } from "@/components/NavLink";
import { Menu, User, LogOut, LayoutDashboard, Bell, Heart, Search, HelpCircle, UserPlus, CalendarDays, Users, MapPin, MessageSquare, Shield, Sun, Moon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useTheme } from "next-themes";
import { useNotifications } from "@/hooks/use-care-data";

export function AppHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const site = useSite();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: notifications } = useNotifications();
  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  const publicNav = [
    { title: site.navLabels.careGroups, url: "/care-circle", icon: Users },
    { title: site.navLabels.findCare, url: "/search", icon: Search },
    { title: "How It Works", url: "/how-it-works", icon: HelpCircle },
  ];

  const displayName = user?.full_name || user?.first_name || user?.email || "User";
  const initials = displayName.charAt(0).toUpperCase();

  const isDashboardRoute = ["/dashboard", "/bookings", "/care-circle", "/gps-tracking", "/messages", "/favorites", "/notifications", "/profile", "/cared-ones"].some(
    r => location.pathname.startsWith(r)
  );

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-16 items-center px-4 lg:px-6 gap-2">
        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="sm:hidden shrink-0">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="p-4 border-b">
              <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg hero-gradient flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">{site.logoText}</span>
                </div>
                <span className="font-bold text-lg">
                  <span className="text-primary">{site.id === "challenged" ? "Ch" : "Care"}</span>
                  <span className="text-muted-foreground">{site.logoAccent}</span>
                </span>
              </Link>
            </div>
            <nav className="p-4 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Browse</p>
              {publicNav.map(item => (
                <Link
                  key={item.url}
                  to={item.url}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${location.pathname === item.url ? "bg-accent text-accent-foreground font-medium" : "text-foreground hover:bg-accent/50"}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              ))}
              {isAuthenticated && (
                <>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-6 px-3">My Care</p>
                  {[
                    { title: site.navLabels.dashboard, url: "/dashboard", icon: LayoutDashboard },
                    { title: site.navLabels.caredOnes, url: "/cared-ones", icon: Heart },
                    { title: "Bookings", url: "/bookings", icon: CalendarDays },
                    { title: site.navLabels.careGroups, url: "/care-circle", icon: Users },
                    { title: "Messages", url: "/messages", icon: MessageSquare },
                    { title: "Favorites", url: "/favorites", icon: Heart },
                    { title: "GPS Tracking", url: "/gps-tracking", icon: MapPin },
                  ].map(item => (
                    <Link
                      key={item.url}
                      to={item.url}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${location.pathname === item.url ? "bg-accent text-accent-foreground font-medium" : "text-foreground hover:bg-accent/50"}`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-lg hero-gradient flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">{site.logoText}</span>
          </div>
          <span className="font-bold text-lg hidden sm:inline">
            <span className="text-primary">{site.id === "challenged" ? "Ch" : "Care"}</span>
            <span className="text-muted-foreground">{site.logoAccent}</span>
          </span>
        </Link>

        {/* Desktop horizontal nav */}
        <nav className="hidden sm:flex items-center gap-1 ml-4">
          {publicNav.map(item => (
            <NavLink
              key={item.url}
              to={item.url}
              className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              activeClassName="text-primary font-medium bg-accent/50"
            >
              {item.title}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title="Toggle dark mode"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Auth section */}
        {isAuthenticated ? (
          <div className="flex items-center gap-1">
            <NavLink
              to="/dashboard"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              activeClassName="bg-primary text-primary-foreground rounded-lg"
            >
              Dashboard
            </NavLink>

            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/notifications")}>
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-coral text-coral-foreground text-xs border-2 border-card">
                  {unreadCount}
                </Badge>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-sm font-medium">{initials}</span>
                    </div>
                  )}
                  <span className="hidden md:inline text-sm font-medium">{displayName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-card border shadow-lg z-[60]">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium text-foreground">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/bookings")}>
                  <CalendarDays className="mr-2 h-4 w-4" /> My Bookings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/care-circle")}>
                  <Users className="mr-2 h-4 w-4" /> Care Circle
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/gps-tracking")}>
                  <MapPin className="mr-2 h-4 w-4" /> GPS Tracking
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/messages")}>
                  <MessageSquare className="mr-2 h-4 w-4" /> Messages
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" /> My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/favorites")}>
                  <Heart className="mr-2 h-4 w-4" /> Favorites
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/notifications")}>
                  <Bell className="mr-2 h-4 w-4" /> Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/auth")} className="hidden sm:inline-flex">
              Sign In
            </Button>
            <Button variant="coral" onClick={() => navigate("/auth?mode=signup")}>
              Get Started
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
