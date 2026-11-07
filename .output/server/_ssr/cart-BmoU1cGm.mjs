//#region node_modules/.nitro/vite/services/ssr/assets/cart-BmoU1cGm.js
var cart_default = "import { createFileRoute } from \"@tanstack/react-router\";\nimport Cart from \"@/pages/Cart\";\nimport { RequireAuth } from \"@/components/auth/RequireAuth\";\nimport { SiteFeature } from \"@/components/routing/SiteFeature\";\n\nfunction RouteCartPage() {\n  return <SiteFeature name=\"paidCaregivers\"><RequireAuth><Cart /></RequireAuth></SiteFeature>;\n}\n\nexport const Route = createFileRoute(\"/cart\")({\n  component: RouteCartPage,\n});\n";
//#endregion
export { cart_default as default };
