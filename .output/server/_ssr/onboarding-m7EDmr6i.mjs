//#region node_modules/.nitro/vite/services/ssr/assets/onboarding-m7EDmr6i.js
var onboarding_default = "import { createFileRoute } from \"@tanstack/react-router\";\nimport Onboarding from \"@/pages/Onboarding\";\nimport { RequireAuth } from \"@/components/auth/RequireAuth\";\n\nfunction RouteOnboardingPage() {\n  return <RequireAuth><Onboarding /></RequireAuth>;\n}\n\nexport const Route = createFileRoute(\"/onboarding\")({\n  component: RouteOnboardingPage,\n});\n";
//#endregion
export { onboarding_default as default };
