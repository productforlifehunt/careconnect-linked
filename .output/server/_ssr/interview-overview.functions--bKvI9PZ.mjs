//#region node_modules/.nitro/vite/services/ssr/assets/interview-overview.functions--bKvI9PZ.js
var interview_overview_functions_default = "import { createServerFn } from \"@tanstack/react-start\";\nimport { z } from \"zod\";\nimport { interviewOverview } from \"./interview-overview.server\";\n\nexport const getInterviewOverview = createServerFn({ method: \"POST\" })\n  .inputValidator((input: unknown) => z.object({ path: z.string().min(1).max(299).refine((path) => !path.includes(\"/\") && !path.includes(\"..\")) }).parse(input))\n  .handler(({ data }) => interviewOverview(data.path));";
//#endregion
export { interview_overview_functions_default as default };
