import "../_runtime.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Xt as HeartPulse } from "../_libs/lucide-react.mjs";
import { t as ContentHub } from "./ContentHub-DlL_lKP-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cared-UoFDPssI.js
var import_jsx_runtime = require_jsx_runtime();
var SUBCATEGORIES = [
	{
		key: "daily-routines",
		label: "Daily Routines",
		labelZh: "日常作息"
	},
	{
		key: "nutrition",
		label: "Nutrition & Meals",
		labelZh: "营养与饮食"
	},
	{
		key: "hygiene",
		label: "Personal Hygiene",
		labelZh: "个人卫生"
	},
	{
		key: "communication",
		label: "Communication",
		labelZh: "沟通技巧"
	},
	{
		key: "behaviors",
		label: "Managing Behaviors",
		labelZh: "行为管理"
	},
	{
		key: "sleep",
		label: "Sleep & Sundowning",
		labelZh: "睡眠与黄昏综合征"
	},
	{
		key: "activities",
		label: "Activities & Engagement",
		labelZh: "活动与参与"
	},
	{
		key: "medication",
		label: "Medication Management",
		labelZh: "药物管理"
	}
];
function CareD() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContentHub, {
		category: "care",
		brandName: "CareD",
		brandNameZh: "护理篇",
		title: "Dementia Care Guides",
		titleZh: "失智症护理指南",
		subtitle: "Practical guides for providing daily care — from routines and communication to managing challenging behaviors.",
		subtitleZh: "提供日常护理的实用指南——从日常作息和沟通到应对挑战性行为。",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartPulse, { className: "h-6 w-6 text-white" }),
		accentColor: "from-rose-500 to-pink-600",
		subcategories: SUBCATEGORIES,
		basePath: "/cared"
	});
}
var SplitComponent = CareD;
//#endregion
export { SplitComponent as component };
