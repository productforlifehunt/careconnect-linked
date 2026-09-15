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
        className="rounded-[24%] bg-primary flex items-center justify-center leading-none shadow-sm overflow-hidden"
      >
        {/* Keep the original D centered; place the wordmark beneath it inside the icon border. */}
        <svg
          viewBox="0 0 48 48"
          role="img"
          aria-label="ChallengeD"
          className="text-primary-foreground"
          style={box}
        >
          <g transform="translate(9.12 5.25) scale(0.62)">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="8.5"
              strokeLinejoin="round"
              d="M14 9 h14 c7.7 0 12 5.8 12 13.5 s-4.3 13.5 -12 13.5 h-14 c-2 0 -3 -1 -3 -3 v-21 c0 -2 1 -3 3 -3 z"
            />
          </g>
          <text
            x="24"
            y="37.25"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="currentColor"
            fontSize="5.25"
            fontWeight="700"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
            letterSpacing="0.15"
          >
            ChallengeD
          </text>
        </svg>
      </div>
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
