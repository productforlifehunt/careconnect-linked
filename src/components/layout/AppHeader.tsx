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
import { Menu, User, LogOut, LayoutDashboard, Bell, Heart, Search, HelpCircle, CalendarDays, Users, MapPin, MessageSquare, Sun, Moon, Newspaper, Bot, Building2, Settings, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useTheme } from "next-themes";
import { applySetting } from "@/lib/ai-auto-fill-form";
import { useNotifications } from "@/hooks/use-care-data";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useStandaloneMode } from "@/hooks/useStandaloneMode";
import { BrandMark } from "@/components/BrandMark";
import { buildPublicNav } from "@/config/nav";


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
  const isStandalone = useStandaloneMode();
  const dashboardLabel = isStandalone ? t("nav.dashboard") : t("nav.enterApp");
  const isChallenged = site.family === "challenged";
  const isCareCNC = site.id === "carecnc";
  const isV1 = site.id === "challenged-v1";
  const logoWordmarkText = isCareCNC
    ? (isChinese ? "护畅" : "Care cnc")
    : (isChinese ? "忆畅" : "ChallengeD");

  const publicNav = buildPublicNav({ site, t, isChinese });


  // Keep the header on one row: show the first links inline, rest under "More".
  const PRIMARY_COUNT = 5;
  const primaryNav = publicNav.slice(0, PRIMARY_COUNT);
  const overflowNav = publicNav.slice(PRIMARY_COUNT);
  const currentUrl = `${location.pathname}${location.search}`;
  const isNavActive = (url: string) =>
    url.includes("?") ? currentUrl === url : location.pathname === url;

  const displayName = user?.full_name || user?.email || t("common.anonymous");
  const initials = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Mobile drawer is for visitors only: it lists the public pages and sign-in.
  // Once signed in, the bottom bar + avatar menu already cover everything, so
  // the extra drawer layer is dropped instead of duplicating those links.
  const mobileMenu = isAuthenticated ? null : (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="min-h-11 min-w-11 lg:hidden shrink-0" aria-label={t("nav.browse")}>
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72 p-0">
        <div className="p-4 border-b">
          <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
            <BrandMark size={44} showWordmark />
          </Link>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-6rem)]">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">{t("nav.browse")}</p>
          {publicNav.map(item => (
            <Link
              key={item.url}
              to={item.url}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isNavActive(item.url) ? "bg-accent text-accent-foreground font-medium" : "text-foreground hover:bg-accent/50"}`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.title}</span>
            </Link>
          ))}
          <div className="pt-4 mt-4 border-t space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => { setMobileOpen(false); navigate("/auth"); }}
            >
              {t("common.signIn")}
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );





  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-16 items-center pl-3 pr-2 lg:pl-3 lg:pr-6 gap-2">
        {/* Logo — always the first element on the left (standard convention) */}
        <Link to="/" className="flex items-center gap-2 shrink-0" aria-label={logoWordmarkText}>
          <BrandMark size={40} showWordmark />
        </Link>

        {/* Desktop horizontal nav — primary links inline, the rest in a More menu
            so items never wrap below the header border. */}
        <nav className="hidden lg:flex items-center gap-0.5 ml-3 min-w-0 flex-nowrap">

          {primaryNav.map(item => (
            <Link
              key={item.url}
              to={item.url}
              className={`shrink-0 whitespace-nowrap px-2.5 py-2 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                isNavActive(item.url)
                  ? "text-primary font-medium bg-accent/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <span className="relative">
                {item.title}
                {"badge" in item && item.badge && (
                  <span className="absolute -top-2.5 -right-7 px-1 py-px text-[9px] font-bold text-coral bg-coral/10 border border-coral/30 rounded-full whitespace-nowrap leading-tight">
                    {item.badge}
                  </span>
                )}
              </span>
            </Link>
          ))}
          {overflowNav.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="shrink-0 text-sm text-muted-foreground hover:text-foreground gap-1">
                  {t("nav.more", "More")}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-card border shadow-lg z-[60]">
                {overflowNav.map(item => (
                  <DropdownMenuItem key={item.url} onClick={() => navigate(item.url)}>
                    <item.icon className="mr-2 h-4 w-4" />
                    <span className="truncate">{item.title}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        <div className="flex-1" />

        {/* Language switcher */}
        <LanguageSwitcher />

        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="relative min-h-11 min-w-11 shrink-0"
          onClick={() => {
            const next = theme === "dark" ? "light" : "dark";
            setTheme(next);
            // Persisted through the one settings registry so Profile agrees.
            void applySetting("display.theme", next).catch(() => {});
          }}
          title={t("nav.toggleTheme")}
          aria-label={t("nav.toggleTheme")}
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
              className="hidden md:inline-flex px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              activeClassName="bg-primary text-primary-foreground rounded-lg"
            >
              {t("nav.dashboard")}
            </NavLink>

            <Button
              variant="ghost"
              size="icon"
              className="relative min-h-11 min-w-11 shrink-0"
              onClick={() => navigate("/inbox?tab=notifications")}
              title={t("nav.notifications")}
              aria-label={t("nav.notifications")}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-coral text-coral-foreground text-xs border-2 border-card">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2 max-w-[18rem]" aria-label={displayName}>

                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-primary-foreground text-sm font-medium">{initials}</span>
                    </div>
                  )}
                  <span className="hidden md:inline text-sm font-medium truncate">{displayName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-card border shadow-lg z-[60]">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>

                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> {dashboardLabel}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/bookings")}>
                  <CalendarDays className="mr-2 h-4 w-4" /> {t("nav.myBookings")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/care-circle")}>
                  <Users className="mr-2 h-4 w-4" /> {isChallenged ? t("nav.united") : t(site.family === "challenged" ? "nav.careTeams" : "nav.careGroups")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/find")}>
                  <MapPin className="mr-2 h-4 w-4" /> {isChallenged ? t("nav.find") : t("nav.gpsTracking")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/inbox?tab=messages")}>
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
                <DropdownMenuItem onClick={() => navigate("/inbox?tab=notifications")}>
                  <Bell className="mr-2 h-4 w-4" /> {t("nav.notifications")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile?tab=settings")}>
                  <Settings className="mr-2 h-4 w-4" /> {isChinese ? "设置" : "Settings"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/how-it-works")}>
                  <HelpCircle className="mr-2 h-4 w-4" /> {isChinese ? "帮助" : "Help"}
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
            <Button variant="coral" className="shrink-0" onClick={() => navigate("/auth?mode=signup")}>
              {t("common.getStarted")}
            </Button>
          </div>
        )}

        {/* Mobile menu — last item on the right, standard mobile convention */}
        {mobileMenu}
      </div>

    </header>
  );
}
