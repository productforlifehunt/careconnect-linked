//#region node_modules/.nitro/vite/services/ssr/assets/caregiver-setting-V9rWED5f.js
var caregiver_setting_default = "import { createFileRoute } from \"@tanstack/react-router\";\nimport ProviderDashboard from \"@/pages/ProviderDashboard\";\nimport { RequireAuth } from \"@/components/auth/RequireAuth\";\nimport { SiteFeature } from \"@/components/routing/SiteFeature\";\n\nfunction RouteCaregiverSettingPage() {\n  return <SiteFeature name=\"paidCaregivers\"><RequireAuth><ProviderDashboard /></RequireAuth></SiteFeature>;\n}\n\nexport const Route = createFileRoute(\"/caregiver-setting\")({\n  component: RouteCaregiverSettingPage,\n});\n";
//#endregion
export { caregiver_setting_default as default };
