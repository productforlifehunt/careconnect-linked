import "../_runtime.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { z as ShieldCheck } from "../_libs/lucide-react.mjs";
import { t as ContentHub } from "./ContentHub-8JTohp7z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/safed-CST3i5Oa.js
var import_jsx_runtime = require_jsx_runtime();
var SUBCATEGORIES = [
	{
		key: "home-safety",
		label: "Home Safety",
		labelZh: "居家安全"
	},
	{
		key: "wandering",
		label: "Wandering Prevention",
		labelZh: "防走失"
	},
	{
		key: "bathing",
		label: "Bathing Safety",
		labelZh: "沐浴安全"
	},
	{
		key: "fire",
		label: "Fire Safety & NRT",
		labelZh: "消防安全与NRT"
	},
	{
		key: "falls",
		label: "Fall Prevention",
		labelZh: "防跌倒"
	},
	{
		key: "medication",
		label: "Medication Safety",
		labelZh: "用药安全"
	},
	{
		key: "driving",
		label: "Driving Safety",
		labelZh: "驾驶安全"
	},
	{
		key: "emergency",
		label: "Emergency Planning",
		labelZh: "应急规划"
	}
];
function SafeD() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContentHub, {
		"data-inspector-id": "pages/SafeD/SafeD/ContentHub/0",
		"data-inspector-source": "pages/SafeD.tsx:17:5:0f00df0dcddacdc28644b13365a833bd657afde5be5b0172b58cc0b5b4090f85:1",
		category: "safe",
		brandName: "SafeD",
		brandNameZh: "安全篇",
		title: "Safety Guides & Products",
		titleZh: "安全指南与产品推荐",
		subtitle: "Keep your cared one safe at home and outside. Practical guides and recommended products for every safety concern.",
		subtitleZh: "保护被护理者在家中和外出时的安全。针对各种安全问题的实用指南和产品推荐。",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-6 w-6 text-white" }),
		accentColor: "from-primary to-primary",
		subcategories: SUBCATEGORIES,
		basePath: "/safed"
	});
}
var SplitComponent = SafeD;
//#endregion
export { SplitComponent as component };
