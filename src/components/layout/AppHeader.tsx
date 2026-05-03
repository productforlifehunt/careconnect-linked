import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSite } from "@/contexts/SiteContext";
import { useTranslation } from "react-i18next";
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
import { Menu, User, LogOut, LayoutDashboard, Bell, Heart, Search, HelpCircle, CalendarDays, Users, MapPin, MessageSquare, Sun, Moon, Newspaper, Bot, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useTheme } from "next-themes";
import { useNotifications } from "@/hooks/use-care-data";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import yichangIcon from "@/assets/yichang-icon.png";

export function AppHeader() {
  const { user, isAuthenticated, logout, authSource } = useAuth();
  const site = useSite();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: notifications } = useNotifications();
  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;
  const { t, i18n } = useTranslation();
  const isChinese = i18n.language?.startsWith("zh");
  const isChallenged = site.id === "challenged";
  const isDuoCare = site.id === "duocare";
  const logoBadgeText = isDuoCare ? (isChinese ? "多户" : "DC") : site.logoText;
  const logoWordmarkText = isDuoCare ? (isChinese ? "多户" : "DuoCare") : `${site.logoText}${site.logoAccent}`;

  const publicNav = isChallenged
    ? [
        { title: t("nav.awareD"), url: "/aware", icon: Search },
        { title: t("nav.careD"), url: "/care-guides", icon: Heart },
        { title: t("nav.copeD"), url: "/coping", icon: Heart },
        { title: t("nav.safeD"), url: "/safety-guides", icon: Heart },
        { title: t("nav.accompanieD"), url: "/accompanied", icon: Heart },
        { title: t("nav.findCaregivers"), url: "/search?service_category=care", icon: Search },
        { title: t("nav.findLocalCompanion"), url: "/search?service_category=care&service_location=in-person&service_type=companionship", icon: Heart },
        { title: t("nav.findRemoteCompanion"), url: "/search?service_category=care&service_location=remote&service_type=companionship", icon: MessageSquare },
        { title: t("nav.aiCompanion"), url: "/ai-companion", icon: Bot, badge: isChinese ? "小忆AI" : "AI" },
        { title: t("nav.seniorFacilities"), url: "/search?service_category=facility", icon: Building2 },
        { title: site.navLabels.careGroups, url: "/care-circle", icon: Users },
        { title: t("nav.community"), url: "/community", icon: Newspaper },
        { title: t("nav.howItWorks"), url: "/how-it-works", icon: HelpCircle },
      ]
    : [
        { title: t(site.id === "challenged" ? "nav.careTeams" : "nav.careGroups"), url: "/care-circle", icon: Users },
        { title: t(site.id === "challenged" ? "nav.findHelp" : "nav.findCare"), url: "/search", icon: Search },
        { title: t("nav.community"), url: "/community", icon: Newspaper },
        { title: t("nav.articles"), url: "/articles", icon: Newspaper },
        { title: t("nav.howItWorks"), url: "/how-it-works", icon: HelpCircle },
      ];

  const displayName = user?.full_name || user?.first_name || user?.email || t("common.anonymous");
  const initials = displayName.charAt(0).toUpperCase();

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
                {site.id === "challenged" && isChinese ? (
                  <>
                    <img src={yichangIcon} alt="忆畅" className="w-12 h-12 rounded-xl" />
                    <span className="font-bold text-lg text-primary">忆畅</span>
                  </>
                ) : (
                  <>
                    <div className="w-9 h-9 rounded-lg hero-gradient flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">{logoBadgeText}</span>
                    </div>
                    <span className="font-bold text-lg">
                      {isDuoCare ? (
                        <span className="text-primary">{logoWordmarkText}</span>
                      ) : (
                        <>
                          <span className="text-primary">{site.logoText}</span>
                          {site.logoAccent && <span className="text-muted-foreground">{site.logoAccent}</span>}
                        </>
                      )}
                    </span>
                  </>
                )}
              </Link>
            </div>
            <nav className="p-4 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">{t("nav.browse")}</p>
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
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-6 px-3">{t("nav.myCare")}</p>
                  {[
                    { title: t("nav.dashboard"), url: "/dashboard", icon: LayoutDashboard },
                    { title: t(site.id === "challenged" ? "nav.myLovedOnes" : "nav.caredOnes"), url: "/cared-ones", icon: Heart },
                    { title: t("nav.myBookings"), url: "/bookings", icon: CalendarDays },
                    { title: t(isChallenged ? "nav.united" : (site.id === "challenged" ? "nav.careTeams" : "nav.careGroups")), url: "/care-circle", icon: Users },
                    { title: t("nav.messages"), url: "/messages", icon: MessageSquare },
                    { title: t("nav.favorites"), url: "/favorites", icon: Heart },
                    { title: isChallenged ? t("nav.find") : t("nav.gpsTracking"), url: "/gps-tracking", icon: MapPin },
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
          {site.id === "challenged" && isChinese ? (
            <>
              <img src={yichangIcon} alt="忆畅" className="w-12 h-12 rounded-xl" />
              <span className="font-bold text-lg text-primary hidden sm:inline">忆畅</span>
            </>
          ) : (
            <>
              <div className="w-9 h-9 rounded-lg hero-gradient flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">{logoBadgeText}</span>
              </div>
              <span className="font-bold text-lg hidden sm:inline">
                {isDuoCare ? (
                  <span className="text-primary">{logoWordmarkText}</span>
                ) : (
                  <>
                    <span className="text-primary">{site.logoText}</span>
                    {site.logoAccent && <span className="text-muted-foreground">{site.logoAccent}</span>}
                  </>
                )}
              </span>
            </>
          )}
        </Link>

        {/* Desktop horizontal nav */}
        <nav className="hidden sm:flex items-center gap-1 ml-4">
          {publicNav.map(item => (
            <NavLink
              key={item.url}
              to={item.url}
              className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors flex items-center gap-1"
              activeClassName="text-primary font-medium bg-accent/50"
            >
              <span className="relative">
                {item.title}
                {"badge" in item && item.badge && (
                  <span className="absolute -top-2.5 -right-8 px-1 py-px text-[9px] font-bold text-coral bg-coral/10 border border-coral/30 rounded-full whitespace-nowrap leading-tight">
                    {item.badge}
                  </span>
                )}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Language switcher */}
        <LanguageSwitcher />

        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={t("nav.toggleTheme")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{t("nav.toggleTheme")}</span>
        </Button>

        {/* Auth section */}
        {isAuthenticated ? (
          <div className="flex items-center gap-1">
            <NavLink
              to="/dashboard"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              activeClassName="bg-primary text-primary-foreground rounded-lg"
            >
              {t("nav.dashboard")}
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
                  {authSource === "wordpress" && (
                    <Badge variant="outline" className="ml-1 text-[10px] px-1.5 py-0 h-4 border-amber-400 text-amber-600 dark:text-amber-400 font-medium">
                      WP
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-card border shadow-lg z-[60]">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium text-foreground">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> {t("nav.dashboard")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/bookings")}>
                  <CalendarDays className="mr-2 h-4 w-4" /> {t("nav.myBookings")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/care-circle")}>
                  <Users className="mr-2 h-4 w-4" /> {isChallenged ? t("nav.united") : t(site.id === "challenged" ? "nav.careTeams" : "nav.careGroups")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/gps-tracking")}>
                  <MapPin className="mr-2 h-4 w-4" /> {isChallenged ? t("nav.find") : t("nav.gpsTracking")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/messages")}>
                  <MessageSquare className="mr-2 h-4 w-4" /> {t("nav.messages")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" /> {t("nav.myProfile")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/favorites")}>
                  <Heart className="mr-2 h-4 w-4" /> {t("nav.favorites")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/facilities/new")}>
                  <Building2 className="mr-2 h-4 w-4" /> {isChinese ? "提交养老院" : "Submit Facility"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/notifications")}>
                  <Bell className="mr-2 h-4 w-4" /> {t("nav.notifications")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> {t("common.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/auth")} className="hidden sm:inline-flex">
              {t("common.signIn")}
            </Button>
            <Button variant="coral" onClick={() => navigate("/auth?mode=signup")}>
              {t("common.getStarted")}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
