import { useNavigate } from "@/lib/router-compat";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSite } from "@/contexts/SiteContext";

/** Shared at the start of page content; direct-entry pages return to the site's home. */
export function PageBackButton() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const site = useSite();
  const label = i18n.language?.startsWith("zh") ? "返回" : "Back";
  const homePath = isAuthenticated
    ? site.family === "notchsafety"
      ? "/map"
      : "/dashboard"
    : "/";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="min-h-11 min-w-11 shrink-0"
      aria-label={label}
      title={label}
      data-page-back
      onClick={() => {
        const historyIndex = Number(window.history.state?.idx);
        if (Number.isInteger(historyIndex) && historyIndex > 0) {
          navigate(-1);
        } else {
          navigate(homePath, { replace: true });
        }
      }}
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
}
