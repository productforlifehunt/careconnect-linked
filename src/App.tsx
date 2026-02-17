import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import SearchResults from "./pages/SearchResults";
import CaregiverProfile from "./pages/CaregiverProfile";
import Auth from "./pages/Auth";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Dashboard routes that get sidebar
const dashboardPaths = ["/dashboard", "/bookings", "/care-circle", "/gps-tracking", "/messages", "/favorites", "/notifications", "/profile", "/cared-ones"];

function AppRoutes() {
  const location = useLocation();
  const isDashboard = dashboardPaths.some((p) => location.pathname.startsWith(p));

  const routes = (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/caregiver/:id" element={<CaregiverProfile />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/care-circle" element={<CareCircle />} />
      <Route path="/gps-tracking" element={<GPSTracking />} />
      <Route path="/bookings" element={<Bookings />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/trust-safety" element={<TrustSafety />} />
      <Route path="/become-caregiver" element={<BecomeCaregiver />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/cared-ones" element={<CaredOnes />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  return isDashboard ? <DashboardLayout>{routes}</DashboardLayout> : routes;
}

const App = () => (
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
);

export default App;
