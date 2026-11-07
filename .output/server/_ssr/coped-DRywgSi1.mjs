import "../_runtime.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as WandSparkles } from "../_libs/lucide-react.mjs";
import { t as ContentHub } from "./ContentHub-DlL_lKP-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/coped-DRywgSi1.js
var import_jsx_runtime = require_jsx_runtime();
var SUBCATEGORIES = [
	{
		key: "stress",
		label: "Stress Management",
		labelZh: "压力管理"
	},
	{
		key: "self-care",
		label: "Self-Care",
		labelZh: "自我照护"
	},
	{
		key: "emotional",
		label: "Emotional Wellbeing",
		labelZh: "情绪健康"
	},
	{
		key: "support",
		label: "Support Networks",
		labelZh: "互助网络"
	},
	{
		key: "work-life",
		label: "Work-Life Balance",
		labelZh: "工作与生活平衡"
	},
	{
		key: "financial",
		label: "Financial & Legal",
		labelZh: "财务与法律"
	},
	{
		key: "respite",
		label: "Respite Care",
		labelZh: "临时照护"
	},
	{
		key: "grief",
		label: "Grief & Loss",
		labelZh: "悲伤与失去"
	}
];
function CopeD() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContentHub, {
		category: "cope",
		brandName: "CopeD",
		brandNameZh: "应对篇",
		title: "Caregiver Coping Guides",
		titleZh: "照护者应对指南",
		subtitle: "You matter too. Guides for managing stress, preventing burnout, and maintaining your own wellbeing as a caregiver.",
		subtitleZh: "您同样重要。帮助照护者管理压力、预防倦怠、维护自身健康的指南。",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WandSparkles, { className: "h-6 w-6 text-white" }),
		accentColor: "from-primary to-primary",
		subcategories: SUBCATEGORIES,
		basePath: "/coped"
	});
}
var SplitComponent = CopeD;
//#endregion
export { SplitComponent as component };
