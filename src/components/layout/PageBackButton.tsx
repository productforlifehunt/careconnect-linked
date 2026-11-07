import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

/** Shared at the start of page content; direct-entry pages return to the site's home. */
export function PageBackButton() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const label = i18n.language?.startsWith("zh") ? "返回" : "Back";
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
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          void navigate("/");
        }
      }}
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
}
