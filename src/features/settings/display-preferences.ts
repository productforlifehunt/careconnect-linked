export interface DisplaySettings {
  theme: "system" | "light" | "dark";
  text_size: "default" | "large" | "xlarge";
  reduce_motion: boolean;
  help_bubble: boolean;
}

export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  theme: "system",
  text_size: "default",
  reduce_motion: false,
  help_bubble: true,
};

export function applyDisplaySettings(
  display: Pick<DisplaySettings, "text_size" | "reduce_motion">,
) {
  const root = document.documentElement;
  root.classList.remove("text-size-large", "text-size-xlarge");
  if (display.text_size === "large") root.classList.add("text-size-large");
  if (display.text_size === "xlarge") root.classList.add("text-size-xlarge");
  root.classList.toggle("reduce-motion", !!display.reduce_motion);
}
