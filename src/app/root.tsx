import "@/i18n/config";

import { Suspense, lazy, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "react-router";
import { ThemeProvider } from "next-themes";

import appCss from "@/styles.css?url";
import heroImage from "@/assets/hero-image.jpg";
import heroImageCn from "@/assets/hero-image-cn.jpg";
import heroImageCarecnc from "@/assets/hero-image-carecnc.jpg";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AIAssistantProvider } from "@/contexts/AIAssistantContext";
import { useApplyDisplaySettings } from "@/features/settings/display";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SiteProvider, useSite } from "@/contexts/SiteContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ErrorBoundary as AppErrorBoundary } from "@/components/ErrorBoundary";
import NotFound from "@/pages/NotFound";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import { lazyRetry } from "@/lib/lazy-retry";
import { isResearcherAccount } from "@/features/inspector/recorder";

const LocationSharingAgent = lazyRetry(
  () =>
    import("@/components/location/LocationSharingAgent").then((module) => ({
      default: module.LocationSharingAgent,
    })),
  "LocationSharingAgent",
);
const InspectorGate = lazyRetry(
  () =>
    import("@/components/inspector/InspectorGate").then((module) => ({
      default: module.InspectorGate,
    })),
  "InspectorGate",
);
const SafetyApp = lazyRetry(() => import("@/pages/safety/SafetyApp"), "SafetyApp");
const EsmApp = lazyRetry(() => import("@/pages/esm/EsmApp"), "EsmApp");
const ResearcherApp = lazyRetry(() => import("@/pages/researcher/ResearcherApp"), "ResearcherApp");
const ConsentApp = lazyRetry(() => import("@/pages/consent/ConsentApp"), "ConsentApp");
const SickApp = lazyRetry(() => import("@/pages/sick/SickApp"), "SickApp");

const FAVICON_BOOTSTRAP = `(function () {
  try {
    var host = location.host, hostname = location.hostname;
    var key = "__site_id:" + host;
    var p = (new URLSearchParams(location.search).get("__site") || "").trim().toLowerCase();
    var map = { "challenged.com": "challenged", "www.challenged.com": "challenged", "carecnc.com": "carecnc", "www.carecnc.com": "carecnc" };
    var slug = p || map[host] || map[hostname] || "";
    if (!slug) { try { slug = sessionStorage.getItem(key) || ""; } catch (e) {} }
    if (slug.indexOf("careconnected") === 0) slug = "carecnc";
    if (slug.indexOf("safety") === 0) slug = "notchsafety";
    var lang = "";
    try { lang = localStorage.getItem("i18nextLng") || ""; } catch (e) {}
    if (!lang) lang = navigator.language || "en";
    var zh = lang.toLowerCase().indexOf("zh") === 0;
    if (location.pathname === "/" && slug.indexOf("researcher") !== 0 && slug.indexOf("esm_survey") !== 0 && slug.indexOf("consent") !== 0 && slug.indexOf("sick") !== 0) {
      var hero = slug.indexOf("notchsafety") === 0
        ? (zh ? ${JSON.stringify(heroImageCarecnc)} : ${JSON.stringify(heroImage)})
        : slug.indexOf("carecnc") === 0 && zh
          ? ${JSON.stringify(heroImageCarecnc)}
          : zh
            ? ${JSON.stringify(heroImageCn)}
            : ${JSON.stringify(heroImage)};
      var imagePreload = document.createElement("link");
      imagePreload.rel = "preload";
      imagePreload.as = "image";
      imagePreload.href = hero;
      imagePreload.setAttribute("fetchpriority", "high");
      document.head.appendChild(imagePreload);
    }
    var href;
    if (slug.indexOf("researcher") === 0 || slug.indexOf("esm_survey") === 0 || slug.indexOf("consent") === 0 || slug.indexOf("sick") === 0) href = "/favicon-research.svg";
    else if (slug.indexOf("notchsafety") === 0) href = "/favicon-notchsafety.png";
    else if (slug.indexOf("carecnc") === 0) href = zh ? "/favicon-huchang.png" : "/favicon-carecnc-en.png";
    else href = zh ? "/favicon-yichang.png" : "/favicon-challenged.png";
    ["icon", "apple-touch-icon"].forEach(function (rel) {
      var link = document.createElement("link");
      link.rel = rel;
      link.href = href + "?v=flat-20261011";
      document.head.appendChild(link);
    });
  } catch (e) {}
})();`;

export function meta() {
  return [
    { charSet: "utf-8" },
    { title: "Family Care & Safety" },
    { name: "description", content: "Family care, coordination, knowledge and location safety." },
    { name: "author", content: "Family Care & Safety" },
    { name: "mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    { name: "theme-color", content: "#1a8a7a" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { property: "og:title", content: "Family Care & Safety" },
    { name: "twitter:title", content: "Family Care & Safety" },
    { property: "og:description", content: "Family care, coordination, knowledge and location safety." },
    { name: "twitter:description", content: "Family care, coordination, knowledge and location safety." },
  ];
}

export function links() {
  return [
    { rel: "stylesheet", href: appCss },
  ];
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function BootScreen() {
  return (
    <div
      className="min-h-dvh bg-background"
      aria-busy="true"
      role="status"
      aria-label="Loading application"
    >
      <div
        className="mx-auto w-full max-w-6xl animate-pulse px-4 py-6"
        aria-hidden="true"
      >
        <div className="h-12 rounded-xl bg-muted" />
        <div className="mt-8 min-h-[52vh] rounded-2xl bg-muted/70" />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="h-28 rounded-xl bg-muted/70" />
          <div className="h-28 rounded-xl bg-muted/70" />
          <div className="h-28 rounded-xl bg-muted/70" />
        </div>
      </div>
    </div>
  );
}

function SiteRouter() {
  const site = useSite();
  const { isAuthenticated } = useAuth();
  useApplyDisplaySettings();
  const locationSharingEnabled =
    isAuthenticated &&
    !["researcher", "esm_survey", "consent", "sick"].includes(site.id);
  const inspectorEnabled =
    isResearcherAccount() && !["consent", "sick"].includes(site.id);
  const sharedAgents = (
    <>
      {locationSharingEnabled && (
        <Suspense fallback={null}>
          <LocationSharingAgent />
        </Suspense>
      )}
      {inspectorEnabled && (
        <Suspense fallback={null}>
          <InspectorGate />
        </Suspense>
      )}
    </>
  );

  if (site.id === "notchsafety")
    return (
      <>
        {sharedAgents}
        <SafetyApp />
      </>
    );
  if (site.id === "researcher")
    return (
      <>
        {sharedAgents}
        <ResearcherApp />
      </>
    );
  if (site.id === "esm_survey")
    return (
      <>
        {sharedAgents}
        <EsmApp />
      </>
    );
  if (site.id === "consent") return <ConsentApp />;
  if (site.id === "sick") return <SickApp />;
  return (
    <>
      {sharedAgents}
      <AppLayout>
        <AppErrorBoundary>
          <Outlet />
        </AppErrorBoundary>
      </AppLayout>
    </>
  );
}

export default function Root() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 1,
      },
    },
  }));
  const mounted = useMounted();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no" />
        <Meta />
        <Links />
        <script dangerouslySetInnerHTML={{ __html: FAVICON_BOOTSTRAP }} />
      </head>
      <body>
        <ThemeProvider attribute="class" forcedTheme="light" enableSystem={false} disableTransitionOnChange>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              {mounted ? (
                <Suspense fallback={<BootScreen />}>
                  <AuthProvider>
                    <SiteProvider>
                      <Sonner />
                      <AIAssistantProvider>
                        <SiteRouter />
                      </AIAssistantProvider>
                    </SiteProvider>
                  </AuthProvider>
                </Suspense>
              ) : (
                <BootScreen />
              )}
            </TooltipProvider>
          </QueryClientProvider>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  useEffect(() => {
    console.error(error);
    reportLovableError(error, { boundary: "react_router_root_error_boundary" });
  }, [error]);
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background text-foreground p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="text-muted-foreground">Something went wrong on our end. You can try again or head back home.</p>
        <div className="flex gap-2 justify-center flex-wrap">
          <button type="button" className="px-4 py-2 rounded-md bg-primary text-primary-foreground" onClick={() => window.location.reload()}>Try again</button>
          <a href="/" className="px-4 py-2 rounded-md border border-border bg-background">Go home</a>
        </div>
      </div>
    </div>
  );
}
