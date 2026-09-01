import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useApplyDisplaySettings } from "@/features/settings/display";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SiteProvider, useSite } from "@/contexts/SiteContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
import Messages from "./pages/Messages";
import HowItWorks from "./pages/HowItWorks";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import TrustSafety from "./pages/TrustSafety";
import BecomeCaregiver from "./pages/BecomeCaregiver";
import Notifications from "./pages/Notifications";
import Inbox from "./pages/Inbox";
import CaredOnes from "./pages/CaredOnes";
import Jobs from "./pages/Jobs";
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
import NotchApp from "./notch/NotchApp";
import SafetyApp from "./pages/safety/SafetyApp";

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

// Dashboard routes that always get sidebar
const baseDashboardPaths = ["/dashboard", "/bookings", "/care-circle", "/gps-tracking", "/messages", "/favorites", "/notifications", "/profile", "/cared-ones", "/jobs", "/provider-dashboard", "/community", "/articles", "/cart", "/order-confirmation", "/aware", "/care-guides", "/coping", "/safety-guides", "/accompanied", "/calendar", "/resources"];
// Routes that get sidebar only when authenticated
const authDashboardPaths = ["/search", "/caregiver"];

function AppRoutes() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isDashboard = useMemo(() => {
    const allPaths = isAuthenticated
      ? [...baseDashboardPaths, ...authDashboardPaths]
      : baseDashboardPaths;
    return allPaths.some((p) => location.pathname.startsWith(p));
  }, [location.pathname, isAuthenticated]);

  const routes = (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/caregiver/:id" element={<CaregiverProfile />} />
      <Route path="/facility/:id" element={<CareFacilityProfile />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/join/:code" element={<JoinGroup />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/trust-safety" element={<TrustSafety />} />
      <Route path="/become-caregiver" element={<BecomeCaregiver />} />
      <Route path="/community" element={<Community />} />
      <Route path="/community/:id" element={<CommunityPost />} />
      <Route path="/articles" element={<Articles />} />
      <Route path="/articles/:id" element={<ArticlePost />} />
      <Route path="/ai-companion" element={<AICompanion />} />
      <Route path="/brand-compare" element={<BrandCompare />} />
      <Route path="/xianyu-listings" element={<XianyuListings />} />
      <Route path="/share/card/:token" element={<SharedInformationCard />} />
      {/* ChallengeD content sections */}
      <Route path="/aware" element={<AwareD />} />
      <Route path="/aware/:id" element={<ChallengedArticleDetail />} />
      <Route path="/care-guides" element={<CareD />} />
      <Route path="/care-guides/:id" element={<ChallengedArticleDetail />} />
      <Route path="/coping" element={<CopeD />} />
      <Route path="/coping/:id" element={<ChallengedArticleDetail />} />
      <Route path="/safety-guides" element={<SafeD />} />
      <Route path="/safety-guides/:id" element={<ChallengedArticleDetail />} />
      <Route path="/accompanied" element={<AccompanieD />} />
      <Route path="/accompanied/:id" element={<ChallengedArticleDetail />} />
      <Route path="/facilities/new" element={<RequireAuth><CareFacilityForm /></RequireAuth>} />
      <Route path="/facilities/:id/edit" element={<RequireAuth><CareFacilityForm /></RequireAuth>} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/care-circle" element={<RequireAuth><CareCircle /></RequireAuth>} />
      <Route path="/gps-tracking" element={<RequireAuth><GPSTracking /></RequireAuth>} />
      <Route path="/bookings" element={<RequireAuth><Bookings /></RequireAuth>} />
      <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />
      <Route path="/favorites" element={<RequireAuth><Favorites /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
      <Route path="/inbox" element={<RequireAuth><Inbox /></RequireAuth>} />
      <Route path="/cared-ones" element={<RequireAuth><CaredOnes /></RequireAuth>} />
      <Route path="/jobs" element={<RequireAuth><Jobs /></RequireAuth>} />
      <Route path="/provider-dashboard" element={<RequireAuth><ProviderDashboard /></RequireAuth>} />
      <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
      <Route path="/order-confirmation" element={<RequireAuth><OrderConfirmation /></RequireAuth>} />
      {/* /consultation route removed — see compliance decision */}
      <Route path="/calendar" element={<RequireAuth><Calendar /></RequireAuth>} />
      <Route path="/resources" element={<Resources />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  return isDashboard ? <DashboardLayout>{routes}</DashboardLayout> : routes;
}

function RootRouter() {
  const site = useSite();
  useApplyDisplaySettings();
  // When Notch Note site is selected (via ?__site=notchnote or its own domain),
  // mount the entire app as Notch Note in standalone mode.
  if (site.id === "notchnote") {
    return <NotchApp base="" standalone />;
  }
  // NotchSafety — standalone family-locator front over the same data model.
  if (site.id === "notchsafety") {
    return <SafetyApp />;
  }
  return (
    <Routes>
      <Route path="/notch/*" element={<NotchApp base="/notch" />} />
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
              <RootRouter />
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SiteProvider>
  </AuthProvider>
);

export default App;
