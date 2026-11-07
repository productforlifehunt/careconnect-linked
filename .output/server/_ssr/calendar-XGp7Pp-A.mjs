//#region node_modules/.nitro/vite/services/ssr/assets/calendar-XGp7Pp-A.js
var calendar_default = "import { createFileRoute } from \"@tanstack/react-router\";\nimport { Calendar } from \"@/components/routing/BrowserOnlyPages\";\nimport { RequireAuth } from \"@/components/auth/RequireAuth\";\n\nfunction RouteCalendarPage() {\n  return <RequireAuth><Calendar /></RequireAuth>;\n}\n\nexport const Route = createFileRoute(\"/calendar\")({\n  component: RouteCalendarPage,\n});\n";
//#endregion
export { calendar_default as default };
