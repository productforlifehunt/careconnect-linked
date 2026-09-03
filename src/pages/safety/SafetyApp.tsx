import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/contexts/AuthContext";
import Auth from "@/pages/Auth";
import JoinGroup from "@/pages/JoinGroup";
import NotFound from "@/pages/NotFound";
import { SafetyShell } from "./SafetyShell";
import SafetyLanding from "./SafetyLanding";
import SafetyMap from "./SafetyMap";
import SafetyPlaces from "./SafetyPlaces";
import SafetyMemberDetail from "./SafetyMemberDetail";
import SafetyCircle from "./SafetyCircle";
import SafetyAlerts from "./SafetyAlerts";
import SafetySettings from "./SafetySettings";
import SafetyAssistant from "./SafetyAssistant";
import SafetyChat from "./SafetyChat";
import SafetyDrives from "./SafetyDrives";

/**
 * NotchSafety — standalone family locator.
 *
 * Purpose-built screens on the same JetEngine CCT data model as the rest of the
 * platform (current_location, safe_zone, care group relations, notification).
 * Nothing here borrows caregiving vocabulary: this app is only about knowing
 * where your family is. No new backend, no new tables.
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
          <Route path="/map" element={<RequireAuth><SafetyMap /></RequireAuth>} />
          <Route path="/places" element={<RequireAuth><SafetyPlaces /></RequireAuth>} />
          <Route path="/circle" element={<RequireAuth><SafetyCircle /></RequireAuth>} />
          <Route path="/alerts" element={<RequireAuth><SafetyAlerts /></RequireAuth>} />
          <Route path="/assistant" element={<RequireAuth><SafetyAssistant /></RequireAuth>} />
          <Route path="/me" element={<RequireAuth><SafetySettings /></RequireAuth>} />
          <Route path="/member/:userId" element={<RequireAuth><SafetyMemberDetail /></RequireAuth>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/join/:code" element={<JoinGroup />} />
          {/* Aliases — shared pages navigate to the care app's paths. */}
          <Route path="/dashboard" element={<Navigate to="/map" replace />} />
          <Route path="/gps-tracking" element={<Navigate to="/map" replace />} />
          <Route path="/care-circle" element={<Navigate to="/circle" replace />} />
          <Route path="/notifications" element={<Navigate to="/alerts" replace />} />
          <Route path="/profile" element={<Navigate to="/me" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </SafetyShell>
  );
}
