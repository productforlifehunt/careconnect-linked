//#region node_modules/.nitro/vite/services/ssr/assets/source.wordpress-Cvio76Mo.js
var source_wordpress_default = "import { listWordPressFeature } from \"@/features/shared/wordpress-adapter\";\n\nexport async function fetchCategoriesWordPress(taxonomy = \"product_cat\"): Promise<any[]> {\n  try {\n    return await listWordPressFeature<any[]>(\"categories\", { endpointArgs: { taxonomy } });\n  } catch {\n    return [];\n  }\n}\n";
//#endregion
export { source_wordpress_default as default };
