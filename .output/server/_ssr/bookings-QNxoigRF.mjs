//#region node_modules/.nitro/vite/services/ssr/assets/bookings-QNxoigRF.js
var bookings_default = "import { createFileRoute } from \"@tanstack/react-router\";\nimport Bookings from \"@/pages/Bookings\";\nimport { RequireAuth } from \"@/components/auth/RequireAuth\";\nimport { SiteFeature } from \"@/components/routing/SiteFeature\";\n\nfunction RouteBookingsPage() {\n  return <SiteFeature name=\"paidCaregivers\"><RequireAuth><Bookings /></RequireAuth></SiteFeature>;\n}\n\nexport const Route = createFileRoute(\"/bookings\")({\n  component: RouteBookingsPage,\n});\n";
//#endregion
export { bookings_default as default };
