import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, Home, Users, Bell, Sparkles, User as UserIcon, Moon, Sun, MessageCircle} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { runSettingSkill } from "@/lib/ai-dynamic-knowledge";
import { useQuery } from "@tanstack/react-query";
import { BrandMark } from "@/components/BrandMark";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { runNotificationSkill } from "@/lib/ai-dynamic-knowledge";

/**
 * NotchSafety app shell — one persistent header on every screen and one
 * navigation model that scales from phone (bottom bar) to tablet/desktop
 * (inline top nav). Family-locator vocabulary only.
 */
export function SafetyShell({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const zh = i18n.language?.startsWith("zh");
  const L = (cn: string, en: string) => (zh ? cn : en);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();

  const { data: unread = 0 } = useQuery({
    queryKey: ["nn-unread"],
    enabled: isAuthenticated,
    refetchInterval: 60_000,
    queryFn: async () => {
      const all = await runNotificationSkill("list-notifications");
      return (Array.isArray(all) ? all : []).filter((n: any) => !n.is_read).length;
    },
  });

  const tabs = [
    { url: "/map", label: L("地图", "Map"), icon: MapPin },
    { url: "/places", label: L("地点", "Places"), icon: Home },
    { url: "/chat", label: L("聊天", "Chat"), icon: MessageCircle },
    
    { url: "/circle", label: L("圈子", "Circle"), icon: Users },
    { url: "/me", label: L("我的", "Me"), icon: UserIcon },
  ];

  const isActive = (url: string) => location.pathname === url || location.pathname.startsWith(url + "/");
  const bare = location.pathname === "/" || location.pathname.startsWith("/auth") || location.pathname.startsWith("/join");

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 md:h-16">
          <button
            type="button"
            onClick={() => navigate(isAuthenticated ? "/map" : "/")}
            className="flex shrink-0 items-center gap-2"
            aria-label={L("诺驰安全首页", "NotchSafety home")}
          >
            <span className="hidden sm:flex">
              <BrandMark size={28} showWordmark />
            </span>
            <span className="flex sm:hidden">
              <BrandMark size={28} />
            </span>
          </button>

          {isAuthenticated && (
            <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label={L("主导航", "Main navigation")}>
              {tabs
                .filter((t) => t.url !== "/me")
                .map((t) => (
                  <Button
                    key={t.url}
                    variant={isActive(t.url) ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-2"
                    onClick={() => navigate(t.url)}
                    aria-current={isActive(t.url) ? "page" : undefined}
                  >
                    <t.icon className="h-4 w-4" />
                    {t.label}
                  </Button>
                ))}
            </nav>
          )}

          <div className="ml-auto flex items-center gap-1">
            {isAuthenticated && (
              <Button
                variant={isActive("/assistant") ? "secondary" : "ghost"}
                size="icon"
                onClick={() => navigate("/assistant")}
                aria-label={L("安全助手", "Safety assistant")}
              >
                <Sparkles className="h-5 w-5" />
              </Button>
            )}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate("/alerts")}
                aria-label={L("提醒", "Alerts")}
              >
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Button>
            )}
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const next = theme === "dark" ? "light" : "dark";
                setTheme(next);
                void runSettingSkill("set-light-or-dark", next).catch(() => {});
              }}
              aria-label={L("切换主题", "Toggle theme")}
            >
              <Sun className="h-5 w-5 dark:hidden" />
              <Moon className="hidden h-5 w-5 dark:block" />
            </Button>
            {isAuthenticated ? (
              <Button variant="ghost" size="icon" onClick={() => navigate("/me")} aria-label={L("我的", "Me")}>
                <UserIcon className="h-5 w-5" />
              </Button>
            ) : (
              <Button size="sm" onClick={() => navigate("/auth")}>
                {L("登录", "Sign in")}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className={`mx-auto w-full flex-1 ${bare ? "" : "max-w-6xl px-0 pb-20 md:px-4 md:pb-8"}`}>
        {children}
      </main>

      {isAuthenticated && !bare && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
          aria-label={L("底部导航", "Bottom navigation")}
        >
          <div className="mx-auto flex max-w-3xl">
            {tabs.map((tab) => {
              const active = isActive(tab.url);
              const Icon = tab.icon;
              return (
                <button
                  key={tab.url}
                  type="button"
                  onClick={() => navigate(tab.url)}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 text-[10px] font-medium transition-colors ${
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="w-full truncate text-center leading-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
