import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AIAssistantProvider } from "@/contexts/AIAssistantContext";
import { useApplyDisplaySettings } from "@/features/settings/display";
import { AuthProvider } from "@/contexts/AuthContext";
import { SiteProvider, useSite } from "@/contexts/SiteContext";
import { AppLayout } from "@/components/layout/AppLayout";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import SearchResults from "./pages/SearchResults";
import CaregiverProfile from "./pages/CaregiverProfile";
import CareFacilityProfile from "./pages/CareFacilityProfile";
import CareFacilityForm from "./pages/CareFacilityForm";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import CareCircle from "./pages/CareCircle";
import GPSTracking from "./pages/GPSTracking";
import Bookings from "./pages/Bookings";
import HowItWorks from "./pages/HowItWorks";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import TrustSafety from "./pages/TrustSafety";
import BecomeCaregiver from "./pages/BecomeCaregiver";
import Inbox from "./pages/Inbox";
import CaredOnes from "./pages/CaredOnes";
import TasksNeedingHelp from "./pages/TasksNeedingHelp";
import ProviderDashboard from "./pages/ProviderDashboard";
import NotFound from "./pages/NotFound";
import Community from "./pages/Community";
import CommunityPost from "./pages/CommunityPost";
import Articles from "./pages/Articles";
import ArticlePost from "./pages/ArticlePost";
import AICompanion from "./pages/AICompanion";
import BrandCompare from "./pages/BrandCompare";
import SharedInformationCard from "./pages/SharedInformationCard";
import Cart from "./pages/Cart";
import OrderConfirmation from "./pages/OrderConfirmation";
import AwareD from "./pages/AwareD";
import CareD from "./pages/CareD";
import CopeD from "./pages/CopeD";
import SafeD from "./pages/SafeD";
import AccompanieD from "./pages/AccompanieD";
import ChallengedArticleDetail from "./pages/ChallengedArticleDetail";
// Doctor consultation feature removed (compliance/risk avoidance — not a paid feature on this app)
import Calendar from "./pages/Calendar";
import Resources from "./pages/Resources";
import JoinGroup from "./pages/JoinGroup";
import XianyuListings from "./pages/XianyuListings";
import SafetyApp from "./pages/safety/SafetyApp";
// TEMP — delete after read (throwaway page, remove this import + its Route)
import DeleteAfterRead from "./pages/DeleteAfterRead";

// Static-first defaults: no auto refetch on focus/mount/reconnect.
// Data only fetches on first mount or explicit invalidation (after a mutation).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      staleTime: 5 * 60 * 1000, // 5 min — treat data as fresh
      gcTime: 30 * 60 * 1000,   // 30 min cache retention
      retry: 1,
    },
  },
});

// One interface everywhere: the phone layout (header + bottom bar) is the only
// shell, on phones and on desktop alike. No desktop-only sidebar.
function AppRoutes() {
  // Release builds (beta / public) are a strict subset of the internal build:
  // the paid caregiver marketplace, facilities and the open community are gone,
  // routes included, so no direct URL can reach them.
  const { paidCaregivers, facilities, community } = useSite().features;

  const routes = (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      {paidCaregivers && (
        <>
          <Route path="/search" element={<SearchResults />} />
          <Route path="/search-caregiver" element={<SearchResults />} />
          <Route path="/search-local-caregiver" element={<SearchResults />} />
          <Route path="/search-remote-caregiver" element={<SearchResults />} />
          <Route path="/caregiver/:id" element={<CaregiverProfile />} />
          <Route path="/become-caregiver" element={<BecomeCaregiver />} />
          <Route path="/bookings" element={<RequireAuth><Bookings /></RequireAuth>} />
          <Route path="/favorite-caregiver" element={<RequireAuth><Favorites /></RequireAuth>} />
          <Route path="/caregiver-setting" element={<RequireAuth><ProviderDashboard /></RequireAuth>} />
          <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
          <Route path="/order-confirmation" element={<RequireAuth><OrderConfirmation /></RequireAuth>} />
        </>
      )}
      {facilities && (
        <>
          <Route path="/search-care-facility" element={<SearchResults />} />
          <Route path="/facility/:id" element={<CareFacilityProfile />} />
          <Route path="/facilities/new" element={<RequireAuth><CareFacilityForm /></RequireAuth>} />
          <Route path="/facilities/:id/edit" element={<RequireAuth><CareFacilityForm /></RequireAuth>} />
        </>
      )}
      {community && (
        <>
          <Route path="/community" element={<Community />} />
          <Route path="/community/:id" element={<CommunityPost />} />
        </>
      )}
      <Route path="/auth" element={<Auth />} />
      <Route path="/join/:code" element={<JoinGroup />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/trust-safety" element={<TrustSafety />} />
      <Route path="/articles" element={<Articles />} />
      <Route path="/articles/:id" element={<ArticlePost />} />
      <Route path="/ai-companion" element={<AICompanion />} />
      <Route path="/brand-compare" element={<BrandCompare />} />
      <Route path="/xianyu-listings" element={<XianyuListings />} />
      {/* TEMP — delete after read */}
      <Route path="/delete-after-read" element={<DeleteAfterRead />} />
      <Route path="/share/card/:token" element={<SharedInformationCard />} />
      {/* ChallengeD content sections */}
      <Route path="/awared" element={<AwareD />} />
      <Route path="/awared/:id" element={<ChallengedArticleDetail />} />
      <Route path="/cared" element={<CareD />} />
      <Route path="/cared/:id" element={<ChallengedArticleDetail />} />
      <Route path="/coped" element={<CopeD />} />
      <Route path="/coped/:id" element={<ChallengedArticleDetail />} />
      <Route path="/safed" element={<SafeD />} />
      <Route path="/safed/:id" element={<ChallengedArticleDetail />} />
      <Route path="/accompanied" element={<AccompanieD />} />
      <Route path="/accompanied/:id" element={<ChallengedArticleDetail />} />

      {/* Protected routes */}
      <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/care-circle" element={<RequireAuth><CareCircle /></RequireAuth>} />
      <Route path="/find" element={<RequireAuth><GPSTracking /></RequireAuth>} />
      {/* Inbox is the ONLY messages/notifications surface — no standalone
          routes and no redirects. All entry points link to /inbox?tab=... */}
      <Route path="/settings" element={<RequireAuth><Profile /></RequireAuth>} />
      <Route path="/inbox" element={<RequireAuth><Inbox /></RequireAuth>} />
      <Route path="/cared-ones" element={<RequireAuth><CaredOnes /></RequireAuth>} />
      <Route path="/cared-ones/:personId" element={<RequireAuth><CaredOnes /></RequireAuth>} />
      <Route path="/cared-ones/:personId/:card" element={<RequireAuth><CaredOnes /></RequireAuth>} />
      <Route path="/tasks" element={<RequireAuth><TasksNeedingHelp /></RequireAuth>} />
      {/* /consultation route removed — see compliance decision */}
      <Route path="/calendar" element={<RequireAuth><Calendar /></RequireAuth>} />
      <Route path="/resources" element={<Resources />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  return routes;
}

function RootRouter() {
  const site = useSite();
  useApplyDisplaySettings();
  // NotchSafety — standalone family-locator front over the same data model.
  if (site.id === "notchsafety") {
    return <SafetyApp />;
  }
  return (
    <Routes>
      <Route path="*" element={
        <AppLayout>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </AppLayout>
      } />
    </Routes>
  );
}

const App = () => (
  <AuthProvider>
    <SiteProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AIAssistantProvider>
                <RootRouter />
              </AIAssistantProvider>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SiteProvider>
  </AuthProvider>
);

export default App;
