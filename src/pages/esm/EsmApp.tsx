import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { EsmShell } from "./EsmShell";
import EsmToday from "./EsmToday";
import EsmScreening from "./EsmScreening";
import EsmHourlyLog from "./EsmHourlyLog";
import EsmDailyLog from "./EsmDailyLog";
import EsmEntries from "./EsmEntries";

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
          <Route path="/log" element={<EsmHourlyLog />} />
          <Route path="/evening" element={<EsmDailyLog />} />
          <Route path="/entries" element={<EsmEntries />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </EsmShell>
  );
}
