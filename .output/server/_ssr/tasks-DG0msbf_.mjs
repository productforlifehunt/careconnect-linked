//#region node_modules/.nitro/vite/services/ssr/assets/tasks-DG0msbf_.js
var tasks_default = "import { createFileRoute } from \"@tanstack/react-router\";\nimport { RequireAuth } from \"@/components/auth/RequireAuth\";\nimport TasksNeedingHelp from \"@/pages/TasksNeedingHelp\";\nimport { SiteFeature } from \"@/components/routing/SiteFeature\";\n\nfunction RouteTasksPage() {\n  return <SiteFeature name=\"paidCaregivers\"><RequireAuth><TasksNeedingHelp /></RequireAuth></SiteFeature>;\n}\n\nexport const Route = createFileRoute(\"/tasks\")({\n  component: RouteTasksPage,\n});\n";
//#endregion
export { tasks_default as default };
