import "../_runtime.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { It as Lightbulb } from "../_libs/lucide-react.mjs";
import { t as ContentHub } from "./ContentHub-CZFNNpPa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/awared-Bi4kT9WF.js
var import_jsx_runtime = require_jsx_runtime();
var SUBCATEGORIES = [
	{
		key: "understanding",
		label: "Understanding Dementia",
		labelZh: "认识失智症"
	},
	{
		key: "types",
		label: "Types & Causes",
		labelZh: "类型与病因"
	},
	{
		key: "signs",
		label: "Signs & Symptoms",
		labelZh: "征兆与症状"
	},
	{
		key: "stages",
		label: "Stages",
		labelZh: "发展阶段"
	},
	{
		key: "diagnosis",
		label: "Diagnosis",
		labelZh: "诊断"
	},
	{
		key: "prevention",
		label: "Risk Factors & Prevention",
		labelZh: "风险因素与预防"
	},
	{
		key: "treatments",
		label: "Treatments",
		labelZh: "治疗方法"
	}
];
function AwareD() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContentHub, {
		"data-inspector-source": "pages/AwareD.tsx:16:5:0f00df0dcddacdc28644b13365a833bd657afde5be5b0172b58cc0b5b4090f85:1",
		category: "aware",
		brandName: "AwareD",
		brandNameZh: "认知篇",
		title: "Understanding Dementia",
		titleZh: "了解失智症",
		subtitle: "A comprehensive beginner's guide to dementia — what it is, how it progresses, and what you need to know.",
		subtitleZh: "全面了解失智症——它是什么、如何发展、以及您需要知道的一切。",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, {
			"data-inspector-id": "pages/AwareD/AwareD/Lightbulb/0",
			"data-inspector-source": "pages/AwareD.tsx:24:13:0e8cbe6ea32ba03f439b0885a2e9a0128dc19848d56de2fb3572bcb580eddfb3:1",
			className: "h-6 w-6 text-white"
		}),
		accentColor: "from-amber-500 to-orange-600",
		subcategories: SUBCATEGORIES,
		basePath: "/awared"
	});
}
var SplitComponent = AwareD;
//#endregion
export { SplitComponent as component };
