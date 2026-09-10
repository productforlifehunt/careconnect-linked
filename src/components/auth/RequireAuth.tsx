import { Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { currentAppId, fetchOnboardingDone } from "@/features/shared/app-profile";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const app = currentAppId();

  // Onboarding is per sub-app: finished or skipped once, then never again.
  const { data: onboarded, isLoading: checkingOnboarding } = useQuery({
    queryKey: ["appOnboarding", app],
    queryFn: () => fetchOnboardingDone(app),
    enabled: isAuthenticated && location.pathname !== "/onboarding",
    staleTime: 60 * 60 * 1000,
    retry: 0,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  if (location.pathname !== "/onboarding") {
    if (checkingOnboarding) {
      return (
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }
    // Only a definite "not done" sends the user to onboarding; a failed check
    // must never block the app.
    if (onboarded === false) {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return <>{children}</>;
}
