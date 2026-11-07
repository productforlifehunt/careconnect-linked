import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { t as Badge } from "./badge-B2YCAhUo.mjs";
import { t as Input } from "./input-JWLlmFeK.mjs";
import { t as Textarea } from "./textarea-ZNemOC_7.mjs";
import { Pn as Check, it as Plus, n as X } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-CCayJGqJ.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { J as useCreateCareTip, P as useCareTips, ht as useDeleteCareTip, tr as useUpdateCareTip } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { t as RowActions } from "./RowActions-B2oGg1MM.mjs";
import { t as RecordDetailDialog } from "./RecordDetailDialog-4j2qP3NS.mjs";
import { n as TabsContent, t as Tabs } from "./tabs-HRlnwchH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/TipsCard-DnK60-Iq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TIP_CATEGORIES = [{
	value: "tip",
	labelEn: "Do this (tip)",
	labelZh: "这样做（方法）"
}, {
	value: "avoid",
	labelEn: "Avoid this",
	labelZh: "避免这样做"
}];
function TipsCard({ caredOneId }) {
	const { toast } = useToast();
	const { i18n } = useTranslation();
	const isCN = i18n.language?.startsWith("zh");
	const Z = (cn, en) => isCN ? cn : en;
	const { data: tips } = useCareTips(caredOneId);
	const create = useCreateCareTip();
	const update = useUpdateCareTip();
	const del = useDeleteCareTip();
	const [form, setForm] = (0, import_react.useState)({
		title: "",
		content: "",
		category: "tip"
	});
	const [editId, setEditId] = (0, import_react.useState)(null);
	const [editForm, setEditForm] = (0, import_react.useState)({
		title: "",
		content: "",
		category: ""
	});
	const [tab, setTab] = (0, import_react.useState)("view");
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const open = (tips || []).find((t) => String(t.id) === String(openId));
	const catLabel = (val) => {
		const opt = TIP_CATEGORIES.find((c) => c.value === val);
		return opt ? isCN ? opt.labelZh : opt.labelEn : val;
	};
	const startEdit = (t) => {
		setOpenId(null);
		setEditId(t.id);
		setEditForm({
			title: t.title,
			content: t.content,
			category: t.category || "tip"
		});
	};
	const cancelEdit = () => setEditId(null);
	const saveEdit = () => {
		if (!editId || !editForm.title || !editForm.content) return;
		update.mutate({
			id: editId,
			...editForm
		}, { onSuccess: () => {
			setEditId(null);
			toast({ title: Z("提示已更新", "Tip updated") });
		} });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/div/0",
		"data-inspector-source": "components/cared-ones/TipsCard.tsx:53:5:7d9b64e2b3d3009104b259db8525641c470f96c72d612cc057b0833cbdeb2660:1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/div/1",
				"data-inspector-source": "components/cared-ones/TipsCard.tsx:54:7:56f1b728c89d539050aa9ef414b8313b28216110b1ab11c168493d99ed8710f5:1",
				className: "flex items-center justify-between mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/h2/0",
					"data-inspector-source": "components/cared-ones/TipsCard.tsx:55:9:eb181a91fcd22a07adce0072cfb3e93e395d59136c4ff9ed8f46b61cc1632314:1",
					className: "text-lg font-bold text-foreground",
					children: Z("护理提示", "Care Tips")
				}), tab === "add" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/Button/9b1703f73149",
					"data-inspector-source": "components/cared-ones/TipsCard.tsx:57:13:b615bf307fde87b48b25b892768e4c6ca4c5a022bd1575c6b077ecba671c9e4f:1",
					size: "sm",
					variant: "ghost",
					onClick: () => setTab("view"),
					children: Z("取消", "Cancel")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/Button/9b1703f73149",
					"data-inspector-source": "components/cared-ones/TipsCard.tsx:58:13:2cb0ad6d7a0f10e862d56f4941b21d5433d1f95510f474184d3af512cbcd884f:1",
					size: "sm",
					onClick: () => setTab("add"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }),
						" ",
						Z("添加", "Add")
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/Tabs/9b1703f73149",
				"data-inspector-source": "components/cared-ones/TipsCard.tsx:60:7:a7a05b60c55a8a44a25ebc27ce7f2099e92c64ba3c5667aa4ec2e3c8519e89f9:1",
				value: tab,
				onValueChange: setTab,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "view",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/div/2",
						"data-inspector-source": "components/cared-ones/TipsCard.tsx:62:11:94490c180d4f0469c17deda0b1a4d7cc86527230dc532ba16ef5120fe55a0723:1",
						className: "space-y-2",
						children: [(tips || []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/Card/0",
							"data-inspector-source": "components/cared-ones/TipsCard.tsx:64:15:2fd70f9a0e60c60f3378e572ea72e6b9ae6e80491428845af6c6b1052b21d3fc:1",
							className: "border-transparent card-elevated",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/CardContent/0",
								"data-inspector-source": "components/cared-ones/TipsCard.tsx:65:17:611837ca724bab64c6e3ad6d94de8a5d3b269bdca27d17c9fa8f39e04e8d2394:1",
								className: "p-4",
								children: editId === t.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/Input/2e3317b4bde8",
											"data-inspector-source": "components/cared-ones/TipsCard.tsx:68:23:f202ceb789bb15091341fc137cb6c04532ca6edf095d12d879608d9e913794f9:1",
											value: editForm.title,
											onChange: (e) => setEditForm((p) => ({
												...p,
												title: e.target.value
											})),
											placeholder: Z("标题", "Title")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
											"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/Textarea/37e9611e4a1a",
											"data-inspector-source": "components/cared-ones/TipsCard.tsx:69:23:9625933a40dc1a65b4b1b99f8cfe92508dec04b2bc1650091c1e5cb3e685244a:1",
											value: editForm.content,
											onChange: (e) => setEditForm((p) => ({
												...p,
												content: e.target.value
											})),
											rows: 3
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/Select/1282aafc70d0",
											"data-inspector-source": "components/cared-ones/TipsCard.tsx:70:23:4b560f60d58f646f6ed5165024b5d7df60a2f92619b273d7cbf8a0137f43521e:1",
											value: editForm.category,
											onValueChange: (v) => setEditForm((p) => ({
												...p,
												category: v
											})),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
												"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/SelectContent/0",
												"data-inspector-source": "components/cared-ones/TipsCard.tsx:72:25:bf6e28fa65c8b6ad3c54dac02f5d51a4f62f79eef11192316a58183702dce2a3:1",
												children: TIP_CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/SelectItem/0",
													"data-inspector-source": "components/cared-ones/TipsCard.tsx:72:65:bf6e28fa65c8b6ad3c54dac02f5d51a4f62f79eef11192316a58183702dce2a3:1",
													value: c.value,
													children: isCN ? c.labelZh : c.labelEn
												}, c.value))
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-2 justify-end",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/Button/817c69c1a25a",
												"data-inspector-source": "components/cared-ones/TipsCard.tsx:75:25:cf9639a15484c16b18161203c905de00d58d79e88e2977ad9143571d7405d6d0:1",
												variant: "ghost",
												size: "sm",
												onClick: cancelEdit,
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5 mr-1" }),
													" ",
													Z("取消", "Cancel")
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/Button/bbb0c0e8996a",
												"data-inspector-source": "components/cared-ones/TipsCard.tsx:76:25:924ab803fa53b9e00011fa3a1a8eaa037f9b927a22769c6da821f2461db22d31:1",
												variant: "coral",
												size: "sm",
												onClick: saveEdit,
												disabled: update.isPending,
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5 mr-1" }),
													" ",
													Z("保存", "Save")
												]
											})]
										})
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/button/a05c2f23c51c",
										"data-inspector-source": "components/cared-ones/TipsCard.tsx:80:61:9131d796bd6dbd189051b941121947a96b3590ee0c02e37bf37d252e7a32efa2:1",
										type: "button",
										className: "min-w-0 flex-1 text-left flex justify-between items-start gap-2",
										onClick: () => setOpenId(String(t.id)),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/span/0",
												"data-inspector-source": "components/cared-ones/TipsCard.tsx:82:25:97e2753d31a6d2bfbad584166eb0c0f321de1be8e550d013c28d47b48e18bc82:1",
												className: "flex items-center gap-2 flex-wrap",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/span/1",
													"data-inspector-source": "components/cared-ones/TipsCard.tsx:83:27:146616d7183c383559e374b23981479cd561c2c7e71e98c0d1973d47a538ba5d:1",
													className: "font-medium text-foreground text-sm",
													children: t.title
												}), t.category && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/Badge/0",
													"data-inspector-source": "components/cared-ones/TipsCard.tsx:84:42:1602323696e27ca1a3da5807fec70c6cb90118e19691b9416a4bef34d89c238b:1",
													variant: "secondary",
													className: "text-[10px]",
													children: catLabel(t.category)
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/span/2",
												"data-inspector-source": "components/cared-ones/TipsCard.tsx:86:25:9259230d02aef883aeef79500728c14fdc9698f54eb1c47802b0c628a403759b:1",
												className: "block text-xs text-muted-foreground mt-1 line-clamp-2",
												children: t.content
											})]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowActions, {
										"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/RowActions/38bf40ecf72b",
										"data-inspector-source": "components/cared-ones/TipsCard.tsx:88:30:b5012e895a2b5fc9010157798977dcc4d31059e0f45f5907fb746cea8f56669f:1",
										onEdit: () => startEdit(t),
										onDelete: () => del.mutateAsync(t.id)
									})]
								})
							})
						}, t.id)), (tips || []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/p/0",
							"data-inspector-source": "components/cared-ones/TipsCard.tsx:93:43:a87a7f6547d7a3ed01a81bb7699530091fc15f0f41ae78b1f7d69c05b1b19d6c:1",
							className: "text-center py-8 text-muted-foreground",
							children: Z("还没有护理提示。从「新增」标签添加一条。", "No care tips yet. Add one from the \"Add New\" tab.")
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "add",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border-transparent card-elevated",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-5 space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/Input/f322321378bd",
									"data-inspector-source": "components/cared-ones/TipsCard.tsx:98:13:a3be235f6663d154e6d70f87cbe13f5da1108eee960334dcf637d2f8cb0b4444:1",
									value: form.title,
									onChange: (e) => setForm((p) => ({
										...p,
										title: e.target.value
									})),
									placeholder: Z("提示标题", "Tip title")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/Textarea/4a62147567d1",
									"data-inspector-source": "components/cared-ones/TipsCard.tsx:99:13:de4a29602872a9fa5b05a62cf8aeee12d4a16d0c55d52ac718c38b41b309a74c:1",
									value: form.content,
									onChange: (e) => setForm((p) => ({
										...p,
										content: e.target.value
									})),
									placeholder: Z("描述这条护理提示或提醒……", "Describe the care tip or reminder..."),
									rows: 2
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/Select/87386e9c6925",
									"data-inspector-source": "components/cared-ones/TipsCard.tsx:100:13:d71957e3c8a7023b176ca388c631f84b3a0395058a2898cdce093fe1dde74f51:1",
									value: form.category,
									onValueChange: (v) => setForm((p) => ({
										...p,
										category: v
									})),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
										"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/SelectContent/1",
										"data-inspector-source": "components/cared-ones/TipsCard.tsx:102:15:03e0e61aaf164bfa8cec8d06d12d4bfcebd28d3209095e9174ad81c2b64068f8:1",
										children: TIP_CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/SelectItem/1",
											"data-inspector-source": "components/cared-ones/TipsCard.tsx:102:55:03e0e61aaf164bfa8cec8d06d12d4bfcebd28d3209095e9174ad81c2b64068f8:1",
											value: c.value,
											children: isCN ? c.labelZh : c.labelEn
										}, c.value))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/Button/562a83bf3b86",
									"data-inspector-source": "components/cared-ones/TipsCard.tsx:104:13:27eadfa261af37bd51049dece81bdf225e1d2126416d4b9aaa0044e303b5e637:1",
									variant: "coral",
									className: "w-full",
									onClick: () => {
										if (!form.title || !form.content) return;
										create.mutate({
											user_id: caredOneId,
											title: form.title,
											content: form.content,
											category: form.category
										}, { onSuccess: () => {
											setForm({
												title: "",
												content: "",
												category: "tip"
											});
											setTab("view");
											toast({ title: Z("提示已添加", "Tip added") });
										} });
									},
									disabled: create.isPending || !form.title || !form.content,
									children: Z("添加提示", "Add Tip")
								})
							]
						})
					})
				})]
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordDetailDialog, {
				"data-inspector-id": "components/cared-ones/TipsCard/TipsCard/RecordDetailDialog/288082ddbbcd",
				"data-inspector-source": "components/cared-ones/TipsCard.tsx:115:9:c8f3633af12767a744af92f278dcdfe4ce9bcb908a2caeab3f2637c57a9782a6:1",
				open: !!openId,
				onOpenChange: (v) => !v && setOpenId(null),
				title: open.title,
				rows: [{
					label: Z("类型", "Type"),
					value: open.category ? catLabel(open.category) : void 0
				}, {
					label: Z("内容", "Content"),
					value: open.content
				}],
				onEdit: () => startEdit(open),
				onDelete: () => del.mutate(open.id, {
					onSuccess: () => {
						setOpenId(null);
						toast({ title: Z("提示已删除", "Tip deleted") });
					},
					onError: (e) => toast({
						title: Z("没能删除", "Couldn't delete"),
						description: e?.message,
						variant: "destructive"
					})
				}),
				isDeleting: del.isPending
			})
		]
	});
}
//#endregion
export { TipsCard };
