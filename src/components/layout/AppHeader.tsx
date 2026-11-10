import { Link, useNavigate, useLocation } from "@/lib/router-compat";
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
import { Menu, LogOut, LayoutDashboard, Bell, Heart, HelpCircle, CalendarDays, Users, MapPin, MessageSquare, Building2, Briefcase, Settings, ChevronDown, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useStandaloneMode } from "@/hooks/useStandaloneMode";
import { BrandMark } from "@/components/BrandMark";
import { buildPublicNav } from "@/config/nav";
import { useMyProfile } from "@/hooks/use-care-data";


export function AppHeader() {
  const { user, isAuthenticated, logout, authSource } = useAuth();
  const site = useSite();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const isChinese = i18n.language?.startsWith("zh");
  const isStandalone = useStandaloneMode();
  const dashboardLabel = isStandalone ? t("nav.dashboard") : t("nav.enterApp");
  const isChallenged = site.family === "challenged";
  const isCareCNC = site.id === "carecnc";
  const paidCare = site.features.paidCaregivers;
  const { data: profile } = useMyProfile();
  const publicNav = buildPublicNav({ site, t, isChinese });


  // Keep the header on one row: show the first links inline, rest under "More".
  const PRIMARY_COUNT = 5;
  const primaryNav = publicNav.slice(0, PRIMARY_COUNT);
  const overflowNav = publicNav.slice(PRIMARY_COUNT);
  const headerPrimaryNav = isAuthenticated
    ? [
        { title: t("nav.dashboard"), url: "/dashboard", icon: LayoutDashboard },
        ...publicNav.slice(0, PRIMARY_COUNT - 1),
      ]
    : primaryNav;
  const headerOverflowNav = isAuthenticated
    ? publicNav.slice(PRIMARY_COUNT - 1)
    : overflowNav;
  const currentUrl = `${location.pathname}${location.search}`;
  const isNavActive = (url: string) =>
    url.includes("?")
      ? currentUrl === url
      : location.pathname === url || location.pathname.startsWith(`${url}/`);

  // Never put an email address in the header — it is on screen all day and in
  // every screenshot. Name first, then username, then a neutral label.
  const displayName =
    user?.full_name || (user as any)?.username || (user as any)?.user_login || t("common.anonymous");
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
            <BrandMark size={40} showWordmark />
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
              asChild
              variant="outline"
              className="w-full"
            >
              <Link to="/auth" onClick={() => setMobileOpen(false)}>
                {t("common.signIn")}
              </Link>
            </Button>
            <Button
              asChild
              variant="coral"
              className="w-full"
            >
              <Link to="/auth?mode=signup" onClick={() => setMobileOpen(false)}>
                {t("common.getStarted")}
              </Link>
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );





  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-[72px] w-full min-w-0 max-w-full items-center gap-2 px-4 sm:gap-3">
        {/* Keep the logo and primary navigation on the same left gutter on every route. */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex shrink-0 items-center">
          <BrandMark size={42} showWordmark className="[&>span:last-child]:text-xl" />
          {site.showBetaLabel && (
            <span className="px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-coral bg-coral/10 border border-coral/30 rounded-full leading-tight">
              Beta
            </span>
          )}
        </Link>

        {/* Desktop horizontal nav — primary links inline, the rest in a More menu
            so items never wrap below the header border. */}
        <nav className="ml-4 hidden min-w-0 flex-nowrap items-center gap-1 lg:flex" aria-label={isChinese ? "主导航" : "Main navigation"}>
          {headerPrimaryNav.map(item => (
            <Link
              key={item.url}
              to={item.url}
              aria-current={isNavActive(item.url) ? "page" : undefined}
              className={`flex h-10 shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-3 text-sm transition-colors ${
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
          {headerOverflowNav.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="shrink-0 text-sm text-muted-foreground hover:text-foreground gap-1">
                  {t("nav.more", "More")}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-card border shadow-lg z-[60]">
                {headerOverflowNav.map(item => (
                  <DropdownMenuItem key={item.url} asChild>
                    <Link to={item.url}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        <div className="flex-1" />

        {/* Language switcher */}
        <LanguageSwitcher />

        {/* Auth section */}
        {isAuthenticated ? (
          <div className="flex items-center gap-1">

            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative min-h-11 min-w-11 shrink-0"
              title={isChinese ? "收件箱" : "Inbox"}
              aria-label={isChinese ? "收件箱" : "Inbox"}
            >
              <Link to="/inbox">
                <Bell className="h-5 w-5" />
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2 max-w-[18rem]" aria-label={displayName}>

                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
                  ) : (
                    <div aria-hidden="true" className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
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

                <DropdownMenuItem asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> {dashboardLabel}
                  </Link>
                </DropdownMenuItem>
                {paidCare && (
                  <DropdownMenuItem asChild>
                    <Link to="/bookings">
                      <CalendarDays className="mr-2 h-4 w-4" /> {t("nav.myBookings")}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/care-circle">
                    <Users className="mr-2 h-4 w-4" /> {isChallenged ? t("nav.united") : t(site.family === "challenged" ? "nav.careTeams" : "nav.careGroups")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/find">
                    <MapPin className="mr-2 h-4 w-4" /> {isChallenged ? t("nav.find") : t("nav.gpsTracking")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/inbox?tab=messages">
                    <MessageSquare className="mr-2 h-4 w-4" /> {t("nav.messages")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {paidCare && (
                  <DropdownMenuItem asChild>
                    <Link to="/favorite-caregiver">
                      <Heart className="mr-2 h-4 w-4" /> {t("nav.favorites")}
                    </Link>
                  </DropdownMenuItem>
                )}
                {paidCare && (
                  <DropdownMenuItem asChild>
                    <Link to="/cart">
                      <ShoppingCart className="mr-2 h-4 w-4" /> {isChinese ? "购物车" : "Cart"}
                    </Link>
                  </DropdownMenuItem>
                )}
                {site.features.facilities && (
                  <DropdownMenuItem asChild>
                    <Link to="/facilities/new">
                      <Building2 className="mr-2 h-4 w-4" /> {isChinese ? "提交养老院" : "Submit Facility"}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" /> {isChinese ? "设置" : "Settings"}
                  </Link>
                </DropdownMenuItem>
                {paidCare && (
                  <DropdownMenuItem asChild>
                    <Link to="/caregiver-setting?tab=settings">
                      <Briefcase className="mr-2 h-4 w-4" /> {profile?.is_care_provider ? (isChinese ? "护理者设置" : "Caregiver Settings") : (isChinese ? "成为护理者" : "Become Caregiver")}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/how-it-works">
                    <HelpCircle className="mr-2 h-4 w-4" /> {isChinese ? "帮助" : "Help"}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> {t("common.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-1 sm:gap-2">
            <Button asChild variant="ghost" className="hidden h-10 px-3 sm:inline-flex">
              <Link to="/auth">{t("common.signIn")}</Link>
            </Button>
            <Button asChild variant="coral" className="hidden h-10 shrink-0 px-4 shadow-xs sm:inline-flex sm:px-5">
              <Link to="/auth?mode=signup">{t("common.getStarted")}</Link>
            </Button>
          </div>
        )}

        {/* Mobile menu — last item on the right, standard mobile convention */}
        {mobileMenu}
      </div>

    </header>
  );
}
