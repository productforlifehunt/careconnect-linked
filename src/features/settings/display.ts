/**
 * Keeps the screen in sync with the display settings. It stores nothing: the
 * values, their allowed options and the write path all live in the setting
 * skills in src/lib/ai-dynamic-knowledge.ts.
 */
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  applyDisplaySettings,
  DEFAULT_DISPLAY_SETTINGS,
} from "@/features/settings/display-preferences";

export { applyDisplaySettings };

/** Mount once, high in the tree. */
export function useApplyDisplaySettings() {
  const { isAuthenticated } = useAuth();
  const { data } = useQuery({
    queryKey: ["appSettings"],
    queryFn: async () => (await import("@/lib/ai-dynamic-knowledge")).fetchAppSettings(),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
  const textSize = data?.display.text_size ?? DEFAULT_DISPLAY_SETTINGS.text_size;
  const reduceMotion = data?.display.reduce_motion ?? DEFAULT_DISPLAY_SETTINGS.reduce_motion;

  useEffect(() => {
    applyDisplaySettings({ text_size: textSize, reduce_motion: reduceMotion });
  }, [textSize, reduceMotion]);
}
