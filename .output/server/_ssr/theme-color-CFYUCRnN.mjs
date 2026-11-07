//#region node_modules/.nitro/vite/services/ssr/assets/theme-color-CFYUCRnN.js
var theme_color_default = "/**\n * Leaflet paints shapes with SVG presentation attributes, which do NOT resolve\n * `var(--token)`. Resolve a theme token to a real colour string so map shapes\n * are actually visible while still following the design system.\n */\nexport function themeColor(token: string, fallback: string): string {\n  try {\n    const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();\n    return raw ? `hsl(${raw})` : fallback;\n  } catch {\n    return fallback;\n  }\n}\n";
//#endregion
export { theme_color_default as default };
