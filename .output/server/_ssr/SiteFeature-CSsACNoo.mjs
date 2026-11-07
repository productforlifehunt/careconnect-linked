//#region node_modules/.nitro/vite/services/ssr/assets/SiteFeature-CSsACNoo.js
var SiteFeature_default = "import type { ReactNode } from \"react\";\nimport { useSite, type SiteFeatures } from \"@/contexts/SiteContext\";\nimport NotFound from \"@/pages/NotFound\";\n\n/**\n * Release builds (beta / public) are a strict subset of the internal build:\n * pages for a feature the running release drops show \"not found\", so no\n * direct URL can reach them.\n */\nexport function SiteFeature({ name, children }: { name: keyof SiteFeatures; children: ReactNode }) {\n  const { features } = useSite();\n  if (!features[name]) return <NotFound />;\n  return <>{children}</>;\n}\n";
//#endregion
export { SiteFeature_default as default };
