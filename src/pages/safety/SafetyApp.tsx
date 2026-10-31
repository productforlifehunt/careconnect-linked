import { useEffect } from "react";
import { groupIdFromPath } from "@/features/care-groups/join-link";
import { Navigate, useLocation } from "@/lib/router-compat";
import { Routes, Route } from "@/lib/path-routes";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/contexts/AuthContext";
import Auth from "@/pages/Auth";
import JoinGroup from "@/pages/JoinGroup";
import NotFound from "@/pages/NotFound";
import { GPSTracking } from "@/components/routing/BrowserOnlyPages";
import CareCircle from "@/pages/CareCircle";
import Inbox from "@/pages/Inbox";
import Profile from "@/pages/Profile";
import Onboarding from "@/pages/Onboarding";
import AICompanion from "@/pages/AICompanion";
import Index from "@/pages/Index";
import { SafetyShell } from "./SafetyShell";

/**
 * NotchSafety — a *variant* of the care app, not a second app.
 *
 * It uses the shared public homepage with family-location content, plus this
 * shell (header + bottom bar, family-locator wording). Every functional screen
 * is the exact same file the care app uses; the path only picks which tab opens.
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
            element={!isLoading && isAuthenticated ? <Navigate to="/map" replace /> : <Index />}
          />
          {/* Same GPSTracking file — path selects the tab (map / zones / alerts). */}
          <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
          <Route path="/map" element={<RequireAuth><GPSTracking /></RequireAuth>} />
          <Route path="/places" element={<RequireAuth><GPSTracking /></RequireAuth>} />
          <Route path="/circle" element={<RequireAuth><CareCircle /></RequireAuth>} />
          {/* A group's one page (shared link /care-circle/<id>) opens under Circle here. */}
          <Route path="/circle/:groupId" element={<RequireAuth><CareCircle /></RequireAuth>} />
          <Route path="/care-circle/:groupId" element={<CircleGroupAlias />} />
          <Route path="/assistant" element={<RequireAuth><AICompanion /></RequireAuth>} />
          {/* One shared inbox for messages + alerts — same file the care app uses. */}
          <Route path="/inbox" element={<RequireAuth><Inbox /></RequireAuth>} />
          <Route path="/alerts" element={<Navigate to="/inbox?tab=notifications" replace />} />
          <Route path="/chat" element={<Navigate to="/inbox?tab=messages" replace />} />
          <Route path="/me" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/join/:code" element={<JoinGroup />} />
          {/* Aliases — shared pages navigate to the care app's paths. */}
          <Route path="/dashboard" element={<Navigate to="/map" replace />} />
          <Route path="/find" element={<Navigate to="/map" replace />} />
          <Route path="/care-circle" element={<Navigate to="/circle" replace />} />
          <Route path="/notifications" element={<Navigate to="/inbox?tab=notifications" replace />} />
          <Route path="/messages" element={<Navigate to="/inbox?tab=messages" replace />} />
          <Route path="/ai-companion" element={<Navigate to="/assistant" replace />} />
          <Route path="/settings" element={<Navigate to="/me" replace />} />
          <Route path="/drives" element={<Navigate to="/map" replace />} />
          <Route path="/member/:userId" element={<Navigate to="/map" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </SafetyShell>
  );
}

/** /care-circle/<id> (the shared group link) opens the same group under /circle. */
function CircleGroupAlias() {
  const location = useLocation();
  const id = groupIdFromPath(location.pathname);
  return <Navigate to={id ? `/circle/${id}${location.search}` : "/circle"} replace />;
}
