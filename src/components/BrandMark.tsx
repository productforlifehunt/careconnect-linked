import { useTranslation } from "react-i18next";
import { useSite } from "@/contexts/SiteContext";
import { BrandIcon } from "@/components/BrandIcon";



interface BrandMarkProps {
  /** Icon size in px. Wordmark scales with it. */
  size?: number | undefined;
  /** Show the wordmark next to the icon */
  showWordmark?: boolean | undefined;
  className?: string | undefined;
}

/**
 * Single source of truth for the brand logo.
 * Used by the header, the mobile drawer and the auth screen so the mark is
 * always identical across surfaces.
 */
export function BrandMark({ size = 48, showWordmark = false, className = "" }: BrandMarkProps) {
  const site = useSite();
  const { i18n } = useTranslation();
  const isChinese = i18n.language?.startsWith("zh");

  const isCareCNC = site.id === "carecnc";
  const brand =
    site.family === "challenged" || site.brandSlug.startsWith("challenged") ? "challenged" : site.id;

  const wordmark = isCareCNC
    ? (isChinese ? "护畅" : "CareCNC")
    : brand === "challenged"
      ? (isChinese ? "忆畅" : "ChallengeD")
      : site.family === "notchsafety" && isChinese
        ? "诺驰安全"
        : site.family === "notchsafety" ? "Notch Safety" : null;

  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <BrandIcon brand={brand} chinese={Boolean(isChinese)} size={size} label={wordmark || site.name} />
      {showWordmark && (
        <span className="font-bold text-lg">
          {wordmark ? (
            <span className="text-foreground">{wordmark}</span>
          ) : (
            <>
              <span className="text-primary">{site.logoText}</span>
              {site.logoAccent && <span className="text-muted-foreground">{site.logoAccent}</span>}
            </>
          )}
        </span>
      )}
    </span>
  );
}
