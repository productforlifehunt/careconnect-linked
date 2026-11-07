import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { t as Badge } from "./badge-B2YCAhUo.mjs";
import { Dt as MapPin, Hn as Bot, Nn as ChevronDown } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { d as buildInfoSheetIntroduction, u as buildInfoSheetContext } from "./ai-dynamic-knowledge-C5tnjGCy.mjs";
import { _ as fetchMedicinesWordPress } from "./source.medicine-C8MN5KOu.mjs";
import { _ as fetchCareTipsWordPress, g as fetchCarePlansWordPress, h as fetchCareNotesWordPress } from "./source.wordpress-extended-FYtgdTd3.mjs";
import { t as AICompanionChat } from "./AICompanionChat-D950CHJf.mjs";
import { t as LocationCard } from "./LocationCard-C1cmRDPS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/info-sheet-parts-cOh0dpOg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Pieces shared by the in-app information card popup and the public shared page.
*
* - SheetLocationTag: a tag next to the status. Collapsed by default; click to
*   reveal the person's last known location (current_location CCT).
* - SheetAIPanel: collapsed by default. Once opened it greets the reader with
*   what is needed this time and answers questions about the person, using the
*   care plan / tips / medicines / notes already stored for them.
*   Nothing is written to the chat tables — whoever reads a shared card is
*   usually not an app user.
*/
function SheetLocationTag({ caredOneId, caredOneName }) {
	const { i18n } = useTranslation();
	const isCN = i18n.language?.startsWith("zh");
	const Z = (cn, en) => isCN ? cn : en;
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "components/cared-ones/info-sheet-parts/SheetLocationTag/div/cc48080a7d2d/0",
		"data-inspector-source": "components/cared-ones/info-sheet-parts.tsx:34:5:764c36d9bc54130592fdcab54b636758efd222768d1bebe92aacb02012a3609e:1",
		className: "w-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			"data-inspector-id": "components/cared-ones/info-sheet-parts/SheetLocationTag/Button/7eadc33d61d7/0",
			"data-inspector-source": "components/cared-ones/info-sheet-parts.tsx:35:7:3dc099e87702cc235bc2368b709e8ace51f89d9f534281b40822cbbb19248914:1",
			type: "button",
			variant: "ghost",
			size: "sm",
			onClick: () => setOpen((v) => !v),
			"aria-expanded": open,
			className: "h-auto p-0 hover:bg-transparent",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				"data-inspector-id": "components/cared-ones/info-sheet-parts/SheetLocationTag/Badge/bbeebd879e1d/0",
				"data-inspector-source": "components/cared-ones/info-sheet-parts.tsx:36:9:a6c716869d09275fc4a88a41aecfa989b7767c83f7ed17d5ec34cad3353c45e4:1",
				variant: "outline",
				className: "text-xs cursor-pointer hover:bg-accent",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
						"data-inspector-id": "components/cared-ones/info-sheet-parts/SheetLocationTag/MapPin/0",
						"data-inspector-source": "components/cared-ones/info-sheet-parts.tsx:37:11:34323e7d475efc5ab5b28f171e8f898fa2a602b47f73a5ab304d1f5c7f186c06:1",
						className: "h-3 w-3 mr-1"
					}),
					Z("查看位置", "Cared one's location"),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
						"data-inspector-id": "components/cared-ones/info-sheet-parts/SheetLocationTag/ChevronDown/0",
						"data-inspector-source": "components/cared-ones/info-sheet-parts.tsx:39:11:4f6301040cbda387c107994016dd96699679b3b03af68119ce0a15734757df3f:1",
						className: `h-3 w-3 ml-1 ${open ? "rotate-180" : ""}`
					})
				]
			})
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-inspector-id": "components/cared-ones/info-sheet-parts/SheetLocationTag/div/4ef2b150ced7/0",
			"data-inspector-source": "components/cared-ones/info-sheet-parts.tsx:43:9:1ae97acf71d1f629c7f6d94c7e6b163137e137474ad92cf6fc9e5b4eeb0c636b:1",
			className: "mt-2",
			children: caredOneId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationCard, {
				"data-inspector-id": "components/cared-ones/info-sheet-parts/SheetLocationTag/LocationCard/0",
				"data-inspector-source": "components/cared-ones/info-sheet-parts.tsx:45:13:1396cc499c1d9bc28c272e04092fab9e4aa5f5912bbb0ab1e02fca0ef778b7e5:1",
				caredOneId,
				caredOneName: caredOneName || Z("被护理者", "Cared one"),
				readOnly: true
			}, caredOneId) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-id": "components/cared-ones/info-sheet-parts/SheetLocationTag/p/bbeebd879e1d/0",
				"data-inspector-source": "components/cared-ones/info-sheet-parts.tsx:47:13:1631e568c3137f420f79bbb4ae582b740d688b2d4897c591bb4b6d078423f0da:1",
				className: "text-sm text-muted-foreground",
				children: Z("这张信息卡尚未关联被护理者，无法显示位置。", "No person is linked to this card, so their location is unavailable.")
			})
		})]
	});
}
function useInfoSheetKnowledge(caredOneId, enabled = true) {
	const { i18n } = useTranslation();
	const isCN = i18n.language?.startsWith("zh");
	const { data } = useQuery({
		queryKey: ["infoSheetKnowledge", caredOneId],
		enabled: enabled && !!caredOneId,
		staleTime: 300 * 1e3,
		queryFn: async () => {
			const id = String(caredOneId);
			const [tips, plans, notes, medicines] = await Promise.all([
				fetchCareTipsWordPress(id).catch(() => []),
				fetchCarePlansWordPress(id).catch(() => []),
				fetchCareNotesWordPress(id).catch(() => []),
				fetchMedicinesWordPress(id).catch(() => [])
			]);
			return {
				tips,
				plans,
				notes,
				medicines
			};
		}
	});
	return (0, import_react.useMemo)(() => {
		if (!data) return "";
		const L = (cn, en) => isCN ? cn : en;
		const list = (rows, keys) => (rows || []).slice(0, 12).map((r) => keys.map((k) => r?.[k]).filter(Boolean).join(" — ")).filter(Boolean).join("\n");
		return [
			list(data.plans, [
				"title",
				"name",
				"content",
				"description"
			]) && `${L("护理计划", "Care plan")}:\n${list(data.plans, [
				"title",
				"name",
				"content",
				"description"
			])}`,
			list(data.tips, [
				"title",
				"name",
				"content",
				"description"
			]) && `${L("照护要点与喜好", "Care tips and preferences")}:\n${list(data.tips, [
				"title",
				"name",
				"content",
				"description"
			])}`,
			list(data.medicines, [
				"name",
				"medicine_name",
				"dosage",
				"frequency",
				"note"
			]) && `${L("用药", "Medicines")}:\n${list(data.medicines, [
				"name",
				"medicine_name",
				"dosage",
				"frequency",
				"note"
			])}`,
			list(data.notes, ["title", "content"]) && `${L("护理笔记", "Care notes")}:\n${list(data.notes, ["title", "content"])}`
		].filter(Boolean).join("\n\n");
	}, [data, isCN]);
}
function SheetAIPanel({ context }) {
	const { i18n } = useTranslation();
	const isCN = i18n.language?.startsWith("zh");
	const Z = (cn, en) => isCN ? cn : en;
	const [open, setOpen] = (0, import_react.useState)(false);
	const task = context.situationDetails?.trim();
	const request = (0, import_react.useMemo)(() => ({
		id: `information-card-${context.caredOneName || "shared"}`,
		title: Z("信息卡助手", "Information card assistant"),
		contextPrompt: buildInfoSheetContext(context, !!isCN),
		starterPrompt: task ? buildInfoSheetIntroduction(task, context.caredOneName, !!isCN) : Z("请先简单介绍你能根据这张信息卡回答什么。", "Briefly explain what you can answer from this information card."),
		starterFallback: Z("我只根据这张信息卡上的内容回答。有什么想问的？", "I answer only from this information card. What would you like to know?")
	}), [
		context,
		isCN,
		task
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "components/cared-ones/info-sheet-parts/SheetAIPanel/div/01a3d74c5121/0",
		"data-inspector-source": "components/cared-ones/info-sheet-parts.tsx:120:5:42a2e02a49e6662c788de004d412f3856f74ec8b9b6b0977ac03b15e8497c6ff:1",
		className: "rounded-md border overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			"data-inspector-id": "components/cared-ones/info-sheet-parts/SheetAIPanel/button/7eadc33d61d7/0",
			"data-inspector-source": "components/cared-ones/info-sheet-parts.tsx:121:7:884f2b97be20d104c7313fbc9f87db3e9d09edaf79c67b32cae183a9df9dbf84:1",
			type: "button",
			onClick: () => setOpen((v) => !v),
			"aria-expanded": open,
			className: "flex w-full items-center justify-between gap-2 p-3 text-left hover:bg-accent transition",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				"data-inspector-id": "components/cared-ones/info-sheet-parts/SheetAIPanel/span/bbeebd879e1d/0",
				"data-inspector-source": "components/cared-ones/info-sheet-parts.tsx:127:9:572d11881e63da74600cbd1a70b936794c7f5923aaab078684da879b6e55f6aa:1",
				className: "flex items-center gap-2 text-sm font-medium",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, {
					"data-inspector-id": "components/cared-ones/info-sheet-parts/SheetAIPanel/Bot/0",
					"data-inspector-source": "components/cared-ones/info-sheet-parts.tsx:128:11:0668e5eb3947222aa408c2f9fba82f049f2d4ba4a10ff050dc66e596f25c98e6:1",
					className: "h-4 w-4 text-primary"
				}), Z("有问题？直接问助手", "Have a question? Ask the assistant")]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
				"data-inspector-id": "components/cared-ones/info-sheet-parts/SheetAIPanel/ChevronDown/0",
				"data-inspector-source": "components/cared-ones/info-sheet-parts.tsx:131:9:319d291a39e4e988257c8835ba85c1b1fc69e75efcbb9c76936a25f2483aaa19:1",
				className: `h-4 w-4 text-muted-foreground transition-transform ${open ? "" : "-rotate-90"}`
			})]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-inspector-id": "components/cared-ones/info-sheet-parts/SheetAIPanel/div/0",
			"data-inspector-source": "components/cared-ones/info-sheet-parts.tsx:134:9:d3c5420a129a745be1f24985ca6cab54b8b139276ce0100cd88cc92e35fb0622:1",
			className: "border-t",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AICompanionChat, {
				"data-inspector-id": "components/cared-ones/info-sheet-parts/SheetAIPanel/AICompanionChat/0",
				"data-inspector-source": "components/cared-ones/info-sheet-parts.tsx:135:11:60e58857913a5cc582a9740e387b8c9e7748a547413ca94d22d02a34f12715c6:1",
				active: open,
				request,
				className: "flex h-[380px] flex-col"
			})
		})]
	});
}
//#endregion
export { SheetLocationTag as n, useInfoSheetKnowledge as r, SheetAIPanel as t };
