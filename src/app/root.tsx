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
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AIAssistantProvider } from "@/contexts/AIAssistantContext";
import { useApplyDisplaySettings } from "@/features/settings/display";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocationSharingAgent } from "@/components/location/LocationSharingAgent";
import { SiteProvider, useSite } from "@/contexts/SiteContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ErrorBoundary as AppErrorBoundary } from "@/components/ErrorBoundary";
import NotFound from "@/pages/NotFound";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import { InspectorGate } from "@/components/inspector/InspectorGate";
import { lazyRetry } from "@/lib/lazy-retry";

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
    { name: "viewport", content: "width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no" },
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
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Color+Emoji&display=swap" },
  ];
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function BootScreen() {
  return <div className="min-h-dvh bg-background" aria-busy="true" />;
}

function SiteRouter() {
  const site = useSite();
  useApplyDisplaySettings();
  if (site.id === "notchsafety") return <SafetyApp />;
  if (site.id === "researcher") return <ResearcherApp />;
  if (site.id === "esm_survey") return <EsmApp />;
  if (site.id === "consent") return <ConsentApp />;
  if (site.id === "sick") return <SickApp />;
  return (
    <AppLayout>
      <AppErrorBoundary>
        <Outlet />
      </AppErrorBoundary>
    </AppLayout>
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
                <AuthProvider>
                  <SiteProvider>
                    <Sonner />
                    <LocationSharingAgent />
                    <InspectorGate />
                    <AIAssistantProvider>
                      <Suspense fallback={<BootScreen />}>
                        <SiteRouter />
                      </Suspense>
                    </AIAssistantProvider>
                  </SiteProvider>
                </AuthProvider>
              ) : <BootScreen />}
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
