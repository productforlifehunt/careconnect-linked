//#region node_modules/.nitro/vite/services/ssr/assets/order-confirmation-Bu79cLpd.js
var order_confirmation_default = "import { createFileRoute } from \"@tanstack/react-router\";\nimport OrderConfirmation from \"@/pages/OrderConfirmation\";\nimport { RequireAuth } from \"@/components/auth/RequireAuth\";\nimport { SiteFeature } from \"@/components/routing/SiteFeature\";\n\nfunction RouteOrderConfirmationPage() {\n  return <SiteFeature name=\"paidCaregivers\"><RequireAuth><OrderConfirmation /></RequireAuth></SiteFeature>;\n}\n\nexport const Route = createFileRoute(\"/order-confirmation\")({\n  component: RouteOrderConfirmationPage,\n});\n";
//#endregion
export { order_confirmation_default as default };
