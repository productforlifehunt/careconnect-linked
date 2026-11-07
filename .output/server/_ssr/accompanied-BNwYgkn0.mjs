import "../_runtime.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Qt as HandHeart } from "../_libs/lucide-react.mjs";
import { t as ContentHub } from "./ContentHub-8JTohp7z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/accompanied-BNwYgkn0.js
var import_jsx_runtime = require_jsx_runtime();
var SUBCATEGORIES = [
	{
		key: "find-companions",
		label: "Find Companions",
		labelZh: "找寻陪伴"
	},
	{
		key: "ai-companion",
		label: "AI Companion",
		labelZh: "AI陪伴"
	},
	{
		key: "companion-guides",
		label: "Companion Guides",
		labelZh: "陪伴指南"
	},
	{
		key: "activities",
		label: "Activities Together",
		labelZh: "共同活动"
	},
	{
		key: "remote-care",
		label: "Remote Care",
		labelZh: "远程关怀"
	}
];
function AccompanieD() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContentHub, {
		"data-inspector-id": "pages/AccompanieD/AccompanieD/ContentHub/0",
		"data-inspector-source": "pages/AccompanieD.tsx:14:5:0f00df0dcddacdc28644b13365a833bd657afde5be5b0172b58cc0b5b4090f85:1",
		category: "accompany",
		brandName: "AccompanieD",
		brandNameZh: "陪伴篇",
		title: "Companionship & Support",
		titleZh: "陪伴与支持",
		subtitle: "Find the right companion for your cared one — from professional caregivers to AI-powered support and activity guides.",
		subtitleZh: "为被护理者找到合适的陪伴——从专业护理人员到AI智能陪伴和活动指南。",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HandHeart, { className: "h-6 w-6 text-white" }),
		accentColor: "from-violet-500 to-purple-600",
		subcategories: SUBCATEGORIES,
		basePath: "/accompanied"
	});
}
var SplitComponent = AccompanieD;
//#endregion
export { SplitComponent as component };
