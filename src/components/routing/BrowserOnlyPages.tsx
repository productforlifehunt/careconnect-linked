import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// The map (Leaflet) and calendar (FullCalendar) libraries touch `window` the
// moment they load, so these pages are only loaded in the browser.
const GPSTrackingPage = lazy(() => import("@/pages/GPSTracking"));
const CalendarPage = lazy(() => import("@/pages/Calendar"));

function PageSpinner() {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export function GPSTracking() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <GPSTrackingPage />
    </Suspense>
  );
}

export function Calendar() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <CalendarPage />
    </Suspense>
  );
}
