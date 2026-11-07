//#region node_modules/.nitro/vite/services/ssr/assets/settings-nkVBq9-2.js
var settings_default = "import { createFileRoute } from \"@tanstack/react-router\";\nimport Profile from \"@/pages/Profile\";\nimport { RequireAuth } from \"@/components/auth/RequireAuth\";\n\nfunction RouteSettingsPage() {\n  return <RequireAuth><Profile /></RequireAuth>;\n}\n\nexport const Route = createFileRoute(\"/settings\")({\n  component: RouteSettingsPage,\n});\n";
//#endregion
export { settings_default as default };
