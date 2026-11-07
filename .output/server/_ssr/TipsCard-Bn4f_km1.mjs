import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { n as CardContent, t as Card } from "./card-Cz5iPbNd.mjs";
import { t as Badge } from "./badge-Dn-oRli-.mjs";
import { t as Input } from "./input-DmTt3-fi.mjs";
import { t as Textarea } from "./textarea-DPamDMgK.mjs";
import { Pn as Check, it as Plus, n as X } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-jh6xKLyY.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { J as useCreateCareTip, P as useCareTips, ht as useDeleteCareTip, tr as useUpdateCareTip } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { t as RowActions } from "./RowActions-BGuzjdk0.mjs";
import { t as RecordDetailDialog } from "./RecordDetailDialog-DdZS-7aZ.mjs";
import { n as TabsContent, t as Tabs } from "./tabs-HRlnwchH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/TipsCard-Bn4f_km1.js
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
		"data-inspector-source": "components/cared-ones/TipsCard.tsx:53:5:7d9b64e2b3d3009104b259db8525641c470f96c72d612cc057b0833cbdeb2660:1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/TipsCard.tsx:54:7:56f1b728c89d539050aa9ef414b8313b28216110b1ab11c168493d99ed8710f5:1",
				className: "flex items-center justify-between mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					"data-inspector-source": "components/cared-ones/TipsCard.tsx:55:9:eb181a91fcd22a07adce0072cfb3e93e395d59136c4ff9ed8f46b61cc1632314:1",
					className: "text-lg font-bold text-foreground",
					children: Z("护理提示", "Care Tips")
				}), tab === "add" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: () => setTab("view"),
					children: Z("取消", "Cancel")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
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
				value: tab,
				onValueChange: setTab,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "view",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/cared-ones/TipsCard.tsx:62:11:94490c180d4f0469c17deda0b1a4d7cc86527230dc532ba16ef5120fe55a0723:1",
						className: "space-y-2",
						children: [(tips || []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: "border-transparent card-elevated",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "p-4",
								children: editId === t.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/TipsCard.tsx:67:21:7797cf625e2a6da5c13ad2e5d24962cf5996f825e6686aafdbff036a8ac646a3:1",
									className: "space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: editForm.title,
											onChange: (e) => setEditForm((p) => ({
												...p,
												title: e.target.value
											})),
											placeholder: Z("标题", "Title")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
											value: editForm.content,
											onChange: (e) => setEditForm((p) => ({
												...p,
												content: e.target.value
											})),
											rows: 3
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: editForm.category,
											onValueChange: (v) => setEditForm((p) => ({
												...p,
												category: v
											})),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: TIP_CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: c.value,
												children: isCN ? c.labelZh : c.labelEn
											}, c.value)) })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "components/cared-ones/TipsCard.tsx:74:23:d6ee12672466ec3abcebf81b5eca14d50a47259688bda2578adbf49267ddfff1:1",
											className: "flex gap-2 justify-end",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												variant: "ghost",
												size: "sm",
												onClick: cancelEdit,
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5 mr-1" }),
													" ",
													Z("取消", "Cancel")
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
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
									"data-inspector-source": "components/cared-ones/TipsCard.tsx:80:21:9131d796bd6dbd189051b941121947a96b3590ee0c02e37bf37d252e7a32efa2:1",
									className: "flex items-start gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										"data-inspector-source": "components/cared-ones/TipsCard.tsx:80:61:9131d796bd6dbd189051b941121947a96b3590ee0c02e37bf37d252e7a32efa2:1",
										type: "button",
										className: "min-w-0 flex-1 text-left flex justify-between items-start gap-2",
										onClick: () => setOpenId(String(t.id)),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											"data-inspector-source": "components/cared-ones/TipsCard.tsx:81:23:736e250c5af5cddcb5ec668d5db492990ad513405c8dbb4a3a32d69f2c38df82:1",
											className: "min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												"data-inspector-source": "components/cared-ones/TipsCard.tsx:82:25:97e2753d31a6d2bfbad584166eb0c0f321de1be8e550d013c28d47b48e18bc82:1",
												className: "flex items-center gap-2 flex-wrap",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													"data-inspector-source": "components/cared-ones/TipsCard.tsx:83:27:146616d7183c383559e374b23981479cd561c2c7e71e98c0d1973d47a538ba5d:1",
													className: "font-medium text-foreground text-sm",
													children: t.title
												}), t.category && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "secondary",
													className: "text-[10px]",
													children: catLabel(t.category)
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												"data-inspector-source": "components/cared-ones/TipsCard.tsx:86:25:9259230d02aef883aeef79500728c14fdc9698f54eb1c47802b0c628a403759b:1",
												className: "block text-xs text-muted-foreground mt-1 line-clamp-2",
												children: t.content
											})]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowActions, {
										onEdit: () => startEdit(t),
										onDelete: () => del.mutateAsync(t.id)
									})]
								})
							})
						}, t.id)), (tips || []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
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
									value: form.title,
									onChange: (e) => setForm((p) => ({
										...p,
										title: e.target.value
									})),
									placeholder: Z("提示标题", "Tip title")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									value: form.content,
									onChange: (e) => setForm((p) => ({
										...p,
										content: e.target.value
									})),
									placeholder: Z("描述这条护理提示或提醒……", "Describe the care tip or reminder..."),
									rows: 2
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.category,
									onValueChange: (v) => setForm((p) => ({
										...p,
										category: v
									})),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: TIP_CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: c.value,
										children: isCN ? c.labelZh : c.labelEn
									}, c.value)) })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
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
