import "../_runtime.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as WandSparkles } from "../_libs/lucide-react.mjs";
import { t as ContentHub } from "./ContentHub-CZFNNpPa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/coped-RUsxlpSF.js
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
		"data-inspector-source": "pages/CopeD.tsx:17:5:0f00df0dcddacdc28644b13365a833bd657afde5be5b0172b58cc0b5b4090f85:1",
		category: "cope",
		brandName: "CopeD",
		brandNameZh: "应对篇",
		title: "Caregiver Coping Guides",
		titleZh: "照护者应对指南",
		subtitle: "You matter too. Guides for managing stress, preventing burnout, and maintaining your own wellbeing as a caregiver.",
		subtitleZh: "您同样重要。帮助照护者管理压力、预防倦怠、维护自身健康的指南。",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WandSparkles, {
			"data-inspector-id": "pages/CopeD/CopeD/Wand2/0",
			"data-inspector-source": "pages/CopeD.tsx:25:13:83d4f9b7ec1ded9b1acbbbcaaf9173d475f7c45c864ebae90a9dff3938893879:1",
			className: "h-6 w-6 text-white"
		}),
		accentColor: "from-primary to-primary",
		subcategories: SUBCATEGORIES,
		basePath: "/coped"
	});
}
var SplitComponent = CopeD;
//#endregion
export { SplitComponent as component };
