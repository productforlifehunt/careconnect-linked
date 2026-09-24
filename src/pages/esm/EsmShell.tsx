import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { CircleHelp, ClipboardList, Home, Languages, ListChecks, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { getProfile } from "@/features/esm/store";
import { isChineseLanguage, uiText } from "@/features/esm/i18n";

/** The study's own shell — no care-app menus, just the four study screens. */
export function EsmShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();
  const isChinese = isChineseLanguage(i18n.language);
  const [profile, setProfile] = useState(getProfile());
  useEffect(() => {
    const refresh = () => setProfile(getProfile());
    window.addEventListener("esm-profile-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("esm-profile-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  const tabs = [
    { to: "/", label: uiText(isChinese, "Today", "今天"), icon: Home },
    { to: "/log", label: uiText(isChinese, "Log entry", "记录"), icon: ClipboardList },
    { to: "/entries", label: uiText(isChinese, "My entries", "我的记录"), icon: ListChecks },
    { to: "/help", label: uiText(isChinese, "Help", "帮助"), icon: CircleHelp },
  ];

  return (
    <div className="flex min-h-dvh w-full flex-col overflow-x-hidden bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4">
          <Link to="/" className="truncate text-sm font-semibold text-foreground">
            {uiText(isChinese, "A Week in the Life of Dementia Caregivers", "失智症护理者的一周")}
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 px-2"
              onClick={() => void i18n.changeLanguage(isChinese ? "en" : "zh-CN")}
              aria-label={uiText(isChinese, "Switch to Chinese", "切换到英文")}
            >
              <Languages className="h-4 w-4" />
              <span>{uiText(isChinese, "Chinese", "英文")}</span>
            </Button>
            <Button asChild variant="ghost" size="sm" className="max-w-32 gap-1.5 px-2" aria-label={profile?.name || uiText(isChinese, "Me", "我")}>
              <Link to="/me"><UserRound className="h-5 w-5 shrink-0" /><span className="truncate">{profile?.name || uiText(isChinese, "Me", "我")}</span></Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20">{children}</main>

      <nav className="fixed bottom-0 z-40 w-full border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
