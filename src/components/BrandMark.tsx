import { useTranslation } from "react-i18next";
import { useSite } from "@/contexts/SiteContext";
import yichangIcon from "@/assets/yichang-icon-128.webp";
import huchangIcon from "@/assets/huchang-icon-128.webp";

interface BrandMarkProps {
  /** Icon size in px. Wordmark scales with it. */
  size?: number;
  /** Show the wordmark next to the icon */
  showWordmark?: boolean;
  className?: string;
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

  const box: React.CSSProperties = { width: size, height: size };

  let icon: React.ReactNode;
  if (brand === "challenged" && isChinese) {
    icon = <img src={yichangIcon} alt="忆畅" width={size} height={size} style={box} decoding="sync" loading="eager" fetchPriority="high" className="rounded-xl object-cover" />;
  } else if (brand === "challenged") {
    icon = (
      <div
        style={box}
        className="rounded-xl bg-primary flex items-center justify-center leading-none shadow-sm px-1 overflow-hidden"
      >
        <span
          className="text-primary-foreground font-bold tracking-normal whitespace-nowrap"
          style={{ fontSize: Math.max(6, Math.round(size * 0.145)) }}
        >
          ChallengeD
        </span>
      </div>
    );
  } else if (brand === "carecnc" && isChinese) {
    icon = <img src={huchangIcon} alt="护畅" width={size} height={size} style={box} decoding="sync" loading="eager" fetchPriority="high" className="rounded-xl object-cover" />;
  } else if (brand === "carecnc") {
    icon = (
      <div
        style={box}
        className="rounded-[22%] hero-gradient flex flex-col items-center justify-center leading-none shadow-sm"
      >
        <span className="text-primary-foreground font-bold tracking-tight" style={{ fontSize: Math.round(size * 0.27) }}>Care</span>
        <span className="text-primary-foreground font-bold tracking-tight" style={{ fontSize: Math.round(size * 0.27) }}>cnc</span>
      </div>
    );
  } else {
    icon = (
      <div style={box} className="rounded-xl hero-gradient flex items-center justify-center shadow-sm">
        <span
          className="text-primary-foreground font-bold"
          style={{ fontSize: Math.round(size * 0.36) }}
        >
          {site.logoText}
        </span>
      </div>
    );
  }

  const wordmark = isCareCNC
    ? (isChinese ? "护畅" : "Care cnc")
    : null;

  return (
    <span className={`flex items-center gap-2 ${className}`}>
      {icon}
      {showWordmark && brand !== "challenged" && brand !== "carecnc" && (
        <span className="font-bold text-lg">
          {wordmark ? (
            <span className="text-primary">{wordmark}</span>
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
