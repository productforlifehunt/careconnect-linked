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
    // iOS app-icon squircle (continuous corners, superellipse n=5) with flat,
    // TechCrunch-style blocky "CD" letterforms. Single purple, no gradient.
    icon = (
      <svg viewBox="0 0 48 48" role="img" aria-label="ChallengeD" style={box}>
        <path
          fill="hsl(var(--primary))"
          d="M48 24 L47.95 33.73 L47.79 36.8 L47.52 39 L47.15 40.75 L46.66 42.19 L46.05 43.4 L45.31 44.44 L44.44 45.31 L43.4 46.05 L42.19 46.66 L40.75 47.15 L39 47.52 L36.8 47.79 L33.73 47.95 L24 48 L14.27 47.95 L11.2 47.79 L9 47.52 L7.25 47.15 L5.81 46.66 L4.6 46.05 L3.56 45.31 L2.69 44.44 L1.95 43.4 L1.34 42.19 L0.85 40.75 L0.48 39 L0.21 36.8 L0.05 33.73 L0 24 L0.05 14.27 L0.21 11.2 L0.48 9 L0.85 7.25 L1.34 5.81 L1.95 4.6 L2.69 3.56 L3.56 2.69 L4.6 1.95 L5.81 1.34 L7.25 0.85 L9 0.48 L11.2 0.21 L14.27 0.05 L24 0 L33.73 0.05 L36.8 0.21 L39 0.48 L40.75 0.85 L42.19 1.34 L43.4 1.95 L44.44 2.69 L45.31 3.56 L46.05 4.6 L46.66 5.81 L47.15 7.25 L47.52 9 L47.79 11.2 L47.95 14.27Z"
        />
        <g fill="hsl(var(--primary-foreground))">
          <path d="M8 14H22V19H13V29H22V34H8Z" />
          <path fillRule="evenodd" d="M25 14H36L40 18V30L36 34H25ZM30 19V29H35V19Z" />
        </g>
      </svg>
    );
  } else if (site.family === "notchsafety") {
    icon = (
      <svg
        viewBox="0 0 48 48"
        width={size}
        height={size}
        style={box}
        role="img"
        aria-label={isChinese ? "诺驰安全" : "NotchSafety"}
        className="text-primary"
      >
        {/* Flat shield, single brand colour, no gradient and no background plate */}
        <path
          d="M24 3 41 9v14.5C41 34.2 33.8 42.4 24 45 14.2 42.4 7 34.2 7 23.5V9L24 3Z"
          fill="currentColor"
        />
        {/* Location pin cut out of the shield */}
        <path
          d="M24 13.5c-4.1 0-7.4 3.3-7.4 7.4 0 5.2 5.7 11 7 12.2.2.2.6.2.8 0 1.3-1.2 7-7 7-12.2 0-4.1-3.3-7.4-7.4-7.4Zm0 10.4a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
          fill="hsl(var(--primary-foreground))"
        />
      </svg>
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
    : brand === "challenged"
      ? "ChallengeD"
      : site.family === "notchsafety" && isChinese
        ? "诺驰安全"
        : null;

  return (
    <span className={`flex items-center gap-2 ${className}`}>
      {icon}
      {showWordmark && brand !== "carecnc" && (
        <span className="font-bold text-lg tracking-tight">
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
