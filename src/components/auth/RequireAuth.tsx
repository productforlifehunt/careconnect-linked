import { Navigate, useLocation } from "@/lib/router-compat";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { currentAppId, fetchOnboardingDone } from "@/features/shared/app-profile";
import { withNext } from "@/lib/return-path";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const app = currentAppId();
  const queryClient = useQueryClient();

  // Start the ownership-scoped person list while onboarding is checked, but
  // keep the same render/redirect gate. No hidden child component is mounted.
  useEffect(() => {
    if (!isAuthenticated || !location.pathname.startsWith('/cared-ones')) return;
    void import('@/features/cared-ones/source.wordpress').then(({ fetchUserCaredOnesWordPress }) =>
      queryClient.prefetchQuery({ queryKey: ['userCaredOnes'], queryFn: fetchUserCaredOnesWordPress }),
    ).catch(() => {});
  }, [isAuthenticated, location.pathname, queryClient]);

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
    // Come back to the page they opened (e.g. a group link) after signing in.
    // While the jump is under way this still renders once with /auth as the
    // location; a second jump from there would drop the return address.
    if (location.pathname.startsWith("/auth")) return null;
    return <Navigate to={withNext("/auth", location.pathname + location.search)} replace />;
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
      return <Navigate to={withNext("/onboarding", location.pathname + location.search)} replace />;
    }
  }

  return <>{children}</>;
}
