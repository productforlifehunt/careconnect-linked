import { useEffect } from "react";
import { Navigate, useLocation } from "@/lib/router-compat";
import { Routes, Route } from "@/lib/path-routes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { EsmShell } from "./EsmShell";
import EsmToday from "./EsmToday";
import EsmScreening from "./EsmScreening";
import EsmHourlyLog from "./EsmHourlyLog";
import EsmDailyLog from "./EsmDailyLog";
import EsmEntries from "./EsmEntries";
import EsmLogEntry from "./EsmLogEntry";
import EsmHelp from "./EsmHelp";
import EsmMe from "./EsmMe";

/**
 * ESM Survey — "A Week in the Life of Dementia Caregivers".
 * A standalone study app: its own shell, its own screens, no care-app menus.
 */
export default function EsmApp() {
  const location = useLocation();

  // Keep ?__site=esm_survey in the URL so reloads and deep links stay here.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("__site") !== "esm_survey") {
      url.searchParams.set("__site", "esm_survey");
      window.history.replaceState({}, "", url.toString());
    }
  }, [location.pathname]);

  return (
    <EsmShell>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<EsmToday />} />
          <Route path="/screening" element={<EsmScreening />} />
          <Route path="/log" element={<EsmLogEntry />} />
          <Route path="/log/hourly" element={<EsmHourlyLog />} />
          <Route path="/log/daily" element={<EsmDailyLog />} />
          <Route path="/evening" element={<Navigate to="/log/daily" replace />} />
          <Route path="/entries" element={<EsmEntries />} />
          <Route path="/help" element={<EsmHelp />} />
          <Route path="/me" element={<EsmMe />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </EsmShell>
  );
}
