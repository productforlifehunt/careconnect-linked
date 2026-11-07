//#region node_modules/.nitro/vite/services/ssr/assets/favorite-caregiver-DbbgXmqQ.js
var favorite_caregiver_default = "import { createFileRoute } from \"@tanstack/react-router\";\nimport Favorites from \"@/pages/Favorites\";\nimport { RequireAuth } from \"@/components/auth/RequireAuth\";\nimport { SiteFeature } from \"@/components/routing/SiteFeature\";\n\nfunction RouteFavoriteCaregiverPage() {\n  return <SiteFeature name=\"paidCaregivers\"><RequireAuth><Favorites /></RequireAuth></SiteFeature>;\n}\n\nexport const Route = createFileRoute(\"/favorite-caregiver\")({\n  component: RouteFavoriteCaregiverPage,\n});\n";
//#endregion
export { favorite_caregiver_default as default };
