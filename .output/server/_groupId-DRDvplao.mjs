//#region node_modules/.nitro/vite/services/ssr/assets/_groupId-DRDvplao.js
var $groupId_default = "import { createFileRoute, redirect } from \"@tanstack/react-router\";\n\n/** Older shared address: forwards to the group's one page, /care-circle/<id>. */\nexport const Route = createFileRoute(\"/group/$groupId\")({\n  beforeLoad: ({ params, location }) => {\n    const id = String(params.groupId || \"\").replace(/\\D/g, \"\");\n    const search = location.searchStr ? (location.searchStr.startsWith(\"?\") ? location.searchStr : `?${location.searchStr}`) : \"\";\n    throw redirect({ href: id ? `/care-circle/${id}${search}` : \"/care-circle\", replace: true });\n  },\n});\n";
//#endregion
export { $groupId_default as default };
