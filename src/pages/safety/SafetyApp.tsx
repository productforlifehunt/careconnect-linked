import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { MapPin, Users, Bell, User as UserIcon, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import GPSTracking from "@/pages/GPSTracking";
import CareCircle from "@/pages/CareCircle";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

/**
 * NotchSafety — standalone family-locator front-end (Life360 style).
 *
 * It is a *front* only: every screen reuses the existing pages and the exact
 * same JetEngine CCT data model as the main care app (current_location,
 * safe_zone, care group relations, notifications). No new backend, no new
 * tables, no duplicated business logic.
 */
export default function SafetyApp() {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const L = (zh: string, en: string) => (isCN ? zh : en);
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { url: "/", label: L("地图", "Map"), icon: MapPin },
    { url: "/circle", label: L("成员", "Circle"), icon: Users },
    { url: "/alerts", label: L("提醒", "Alerts"), icon: Bell },
    { url: "/me", label: L("我的", "Me"), icon: UserIcon },
  ];

  // Keep ?__site=notchsafety in the URL so reloads and deep links stay on this front.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("__site") !== "notchsafety") {
      url.searchParams.set("__site", "notchsafety");
      window.history.replaceState({}, "", url.toString());
    }
  }, [location.pathname]);

  const isAuthScreen = location.pathname.startsWith("/auth");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <span className="font-bold tracking-tight">
            Notch<span className="text-primary">Safety</span>
          </span>
          <span className="ml-auto text-xs text-muted-foreground">
            {L("家人位置与安全区", "Family location & safe zones")}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 pb-20">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<RequireAuth><GPSTracking /></RequireAuth>} />
            <Route path="/circle" element={<RequireAuth><CareCircle /></RequireAuth>} />
            <Route path="/alerts" element={<RequireAuth><Notifications /></RequireAuth>} />
            <Route path="/me" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/auth" element={<Auth />} />
            {/* Aliases — shared pages navigate to the main app's paths. */}
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/gps-tracking" element={<Navigate to="/" replace />} />
            <Route path="/care-circle" element={<Navigate to="/circle" replace />} />
            <Route path="/notifications" element={<Navigate to="/alerts" replace />} />
            <Route path="/profile" element={<Navigate to="/me" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>

      {!isAuthScreen && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background">
          <div className="mx-auto flex max-w-3xl">
            {tabs.map((tab) => {
              const active =
                tab.url === "/" ? location.pathname === "/" : location.pathname.startsWith(tab.url);
              const Icon = tab.icon;
              return (
                <button
                  key={tab.url}
                  type="button"
                  onClick={() => navigate(tab.url)}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
