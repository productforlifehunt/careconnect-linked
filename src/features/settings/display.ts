/**
 * Applies the display half of the app settings blob (CCT 151 a95/a96) to the
 * live document, so a switch flipped in Settings actually changes the screen:
 *   text_size    → root font-size class (`text-size-large` / `text-size-xlarge`)
 *   reduce_motion→ `reduce-motion` class (kills transitions/animations)
 *   theme        → next-themes
 */
import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { fetchAppSettings, DEFAULT_APP_SETTINGS, type AppSettings } from "./app-settings";

export function applyDisplaySettings(display: AppSettings["display"]) {
  const root = document.documentElement;
  root.classList.remove("text-size-large", "text-size-xlarge");
  if (display.text_size === "large") root.classList.add("text-size-large");
  if (display.text_size === "xlarge") root.classList.add("text-size-xlarge");
  root.classList.toggle("reduce-motion", !!display.reduce_motion);
}

/** Mount once, high in the tree: keeps the DOM in sync with the saved settings. */
export function useApplyDisplaySettings() {
  const { setTheme } = useTheme();
  const { data } = useQuery({
    queryKey: ["appSettings"],
    queryFn: fetchAppSettings,
    staleTime: 60_000,
  });
  const display = (data ?? DEFAULT_APP_SETTINGS).display;

  useEffect(() => {
    applyDisplaySettings(display);
  }, [display.text_size, display.reduce_motion]);

  useEffect(() => {
    if (display.theme) setTheme(display.theme);
  }, [display.theme, setTheme]);
}
