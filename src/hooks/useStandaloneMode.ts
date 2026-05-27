import { useEffect, useState } from "react";

/**
 * Detects whether the app is running as an installed app
 * (PWA standalone, iOS home-screen app, or Capacitor native shell)
 * vs. a regular browser tab.
 *
 * In a regular browser tab we want to behave like a marketing website:
 * no bottom navigation, prominent "Enter App" CTA.
 */
export function useStandaloneMode(): boolean {
  const compute = () => {
    if (typeof window === "undefined") return false;
    // Capacitor native shell
    // @ts-expect-error - Capacitor injects this global
    if (window.Capacitor?.isNativePlatform?.()) return true;
    // iOS Safari home-screen
    // @ts-expect-error - non-standard
    if (window.navigator.standalone === true) return true;
    // PWA display-mode
    try {
      if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
      if (window.matchMedia?.("(display-mode: fullscreen)").matches) return true;
      if (window.matchMedia?.("(display-mode: minimal-ui)").matches) return true;
    } catch {}
    return false;
  };

  const [standalone, setStandalone] = useState<boolean>(compute);

  useEffect(() => {
    const mq = window.matchMedia?.("(display-mode: standalone)");
    const handler = () => setStandalone(compute());
    mq?.addEventListener?.("change", handler);
    return () => mq?.removeEventListener?.("change", handler);
  }, []);

  return standalone;
}
