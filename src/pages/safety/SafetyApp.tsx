import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/contexts/AuthContext";
import Auth from "@/pages/Auth";
import JoinGroup from "@/pages/JoinGroup";
import NotFound from "@/pages/NotFound";
import GPSTracking from "@/pages/GPSTracking";
import CareCircle from "@/pages/CareCircle";
import Messages from "@/pages/Messages";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import AICompanion from "@/pages/AICompanion";
import { SafetyShell } from "./SafetyShell";
import SafetyLanding from "./SafetyLanding";

/**
 * NotchSafety — a *variant* of the care app, not a second app.
 *
 * Only two things are its own: the marketing landing page and this shell
 * (header + bottom bar, family-locator wording). Every functional screen is the
 * exact same file the care app uses; the path only picks which tab opens.
 */
export default function SafetyApp() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  // Keep ?__site=notchsafety in the URL so reloads and deep links stay here.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("__site") !== "notchsafety") {
      url.searchParams.set("__site", "notchsafety");
      window.history.replaceState({}, "", url.toString());
    }
  }, [location.pathname]);

  return (
    <SafetyShell>
      <ErrorBoundary>
        <Routes>
          <Route
            path="/"
            element={!isLoading && isAuthenticated ? <Navigate to="/map" replace /> : <SafetyLanding />}
          />
          {/* Same GPSTracking file — path selects the tab (map / zones / alerts). */}
          <Route path="/map" element={<RequireAuth><GPSTracking /></RequireAuth>} />
          <Route path="/places" element={<RequireAuth><GPSTracking /></RequireAuth>} />
          <Route path="/alerts" element={<RequireAuth><GPSTracking /></RequireAuth>} />
          <Route path="/circle" element={<RequireAuth><CareCircle /></RequireAuth>} />
          <Route path="/chat" element={<RequireAuth><Messages /></RequireAuth>} />
          <Route path="/assistant" element={<RequireAuth><AICompanion /></RequireAuth>} />
          <Route path="/inbox" element={<RequireAuth><Notifications /></RequireAuth>} />
          <Route path="/me" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/join/:code" element={<JoinGroup />} />
          {/* Aliases — shared pages navigate to the care app's paths. */}
          <Route path="/dashboard" element={<Navigate to="/map" replace />} />
          <Route path="/find" element={<Navigate to="/map" replace />} />
          <Route path="/care-circle" element={<Navigate to="/circle" replace />} />
          <Route path="/notifications" element={<Navigate to="/alerts" replace />} />
          <Route path="/messages" element={<Navigate to="/chat" replace />} />
          <Route path="/ai-companion" element={<Navigate to="/assistant" replace />} />
          <Route path="/profile" element={<Navigate to="/me" replace />} />
          <Route path="/drives" element={<Navigate to="/map" replace />} />
          <Route path="/member/:userId" element={<Navigate to="/map" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </SafetyShell>
  );
}
