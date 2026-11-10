import { useEffect, useRef } from "react";
import { Navigate, useNavigate } from "@/lib/router-compat";
import { useAuth } from "@/contexts/AuthContext";
import { useMyProfile, useUpdateProfile } from "@/hooks/use-care-data";
import { withNext } from "@/lib/return-path";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function BecomeCaregiver() {
  const { isAuthenticated, isLoading } = useAuth();
  const { data: profile, isLoading: profileLoading, error: profileError, refetch } = useMyProfile();
  const update = useUpdateProfile();
  const navigate = useNavigate();
  const started = useRef(false);
  const { i18n } = useTranslation();
  const zh = i18n.language?.startsWith("zh");

  useEffect(() => {
    if (!isAuthenticated || !profile || started.current) return;
    started.current = true;
    if (profile.is_care_provider) {
      navigate("/caregiver-setting?tab=settings", { replace: true });
      return;
    }
    update.mutate({ is_care_provider: true }, {
      onSuccess: () => navigate("/caregiver-setting?tab=settings", { replace: true }),
    });
  }, [isAuthenticated, profile, navigate, update]);

  if (!isLoading && !isAuthenticated) return <Navigate to={withNext("/auth", "/become-caregiver")} replace />;
  if (profileError || update.error) return <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
    <p className="text-destructive">{(profileError || update.error)?.message}</p>
    <Button onClick={() => { started.current = false; update.reset(); void refetch(); }}>{zh ? "重试" : "Retry"}</Button>
  </div>;
  return <div className="flex justify-center items-center min-h-[60vh]" aria-busy={isLoading || profileLoading || update.isPending}>
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>;
}
