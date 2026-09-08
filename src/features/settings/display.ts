/**
 * Keeps the screen in sync with the display settings. It stores nothing: the
 * values, their allowed options and the write path all live in the setting
 * skills in src/lib/ai-dynamic-knowledge.ts.
 */
import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAppSettings,
  applyDisplaySettings,
  DEFAULT_APP_SETTINGS,
} from "@/lib/ai-dynamic-knowledge";

export { applyDisplaySettings };

/** Mount once, high in the tree. */
export function useApplyDisplaySettings() {
  const { setTheme } = useTheme();
  const { data } = useQuery({
    queryKey: ["appSettings"],
    queryFn: () => fetchAppSettings(),
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
