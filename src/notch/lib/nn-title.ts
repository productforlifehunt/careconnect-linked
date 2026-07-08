/**
 * Manages document.title for Notch routes without polluting the parent app's
 * <head>. Saves and restores the original title when the Notch app unmounts.
 */
import { useEffect } from "react";

let original: string | null = null;

export function useNotchTitle(t: string) {
  useEffect(() => {
    if (original === null) original = document.title;
    document.title = t ? `${t} · Notch Note` : "Notch Note";
    return () => {
      // don't restore on every route change — only on full unmount handled elsewhere.
    };
  }, [t]);
}

export function restoreOriginalTitle() {
  if (original !== null) {
    document.title = original;
    original = null;
  }
}
