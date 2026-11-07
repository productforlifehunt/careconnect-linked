//#region node_modules/.nitro/vite/services/ssr/assets/_-C2misPks.js
var $_default = "import { createFileRoute } from \"@tanstack/react-router\";\nimport NotFound from \"@/pages/NotFound\";\n\n// Catch-all: unknown paths on the care app show \"not found\". The NotchSafety\n// and survey sub-apps also use their own paths (/map, /me, /log …) that land\n// here; the root renders the sub-app itself for those sites.\nexport const Route = createFileRoute(\"/$\")({\n  component: NotFound,\n});\n";
//#endregion
export { $_default as default };
