import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RequireAuth } from "@/components/auth/RequireAuth";
import Index from "./pages/Index";
import SearchResults from "./pages/SearchResults";
import CaregiverProfile from "./pages/CaregiverProfile";
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
import CaredOnes from "./pages/CaredOnes";
import Jobs from "./pages/Jobs";
import ProviderDashboard from "./pages/ProviderDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Dashboard routes that get sidebar
const dashboardPaths = ["/dashboard", "/bookings", "/care-circle", "/gps-tracking", "/messages", "/favorites", "/notifications", "/profile", "/cared-ones", "/jobs", "/provider-dashboard"];

function AppRoutes() {
  const location = useLocation();
  const isDashboard = dashboardPaths.some((p) => location.pathname.startsWith(p));

  const routes = (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/caregiver/:id" element={<CaregiverProfile />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/trust-safety" element={<TrustSafety />} />
      <Route path="/become-caregiver" element={<BecomeCaregiver />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/care-circle" element={<RequireAuth><CareCircle /></RequireAuth>} />
      <Route path="/gps-tracking" element={<RequireAuth><GPSTracking /></RequireAuth>} />
      <Route path="/bookings" element={<RequireAuth><Bookings /></RequireAuth>} />
      <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />
      <Route path="/favorites" element={<RequireAuth><Favorites /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
      <Route path="/cared-ones" element={<RequireAuth><CaredOnes /></RequireAuth>} />
      <Route path="/jobs" element={<RequireAuth><Jobs /></RequireAuth>} />
      <Route path="/provider-dashboard" element={<RequireAuth><ProviderDashboard /></RequireAuth>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  return isDashboard ? <DashboardLayout>{routes}</DashboardLayout> : routes;
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppLayout>
              <AppRoutes />
            </AppLayout>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
