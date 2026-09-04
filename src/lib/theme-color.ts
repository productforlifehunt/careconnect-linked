/**
 * Leaflet paints shapes with SVG presentation attributes, which do NOT resolve
 * `var(--token)`. Resolve a theme token to a real colour string so map shapes
 * are actually visible while still following the design system.
 */
export function themeColor(token: string, fallback: string): string {
  try {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
    return raw ? `hsl(${raw})` : fallback;
  } catch {
    return fallback;
  }
}
