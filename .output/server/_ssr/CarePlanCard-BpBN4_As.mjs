import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { n as CardContent, t as Card } from "./card-Cz5iPbNd.mjs";
import { t as Input } from "./input-DmTt3-fi.mjs";
import { t as Textarea } from "./textarea-DPamDMgK.mjs";
import { Pn as Check, bn as ClipboardList, it as Plus, jt as LoaderCircle, n as X } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-COszB6Fv.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { M as useCarePlans, er as useUpdateCarePlan, mt as useDeleteCarePlan, q as useCreateCarePlan } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { t as RowActions } from "./RowActions-BGuzjdk0.mjs";
import { t as RecordDetailDialog } from "./RecordDetailDialog-DdZS-7aZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CarePlanCard-BpBN4_As.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useZ() {
	const { i18n } = useTranslation();
	const isCN = i18n.language?.startsWith("zh");
	return {
		isCN,
		Z: (cn, en) => isCN ? cn : en
	};
}
function CarePlanCard({ caredOneId }) {
	const { toast } = useToast();
	const { Z } = useZ();
	const { data: plans, isLoading } = useCarePlans(caredOneId);
	const create = useCreateCarePlan();
	const update = useUpdateCarePlan();
	const del = useDeleteCarePlan();
	const [addOpen, setAddOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		title: "",
		description: ""
	});
	const [editId, setEditId] = (0, import_react.useState)(null);
	const [editForm, setEditForm] = (0, import_react.useState)({
		title: "",
		description: ""
	});
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const open = (plans || []).find((p) => String(p.id) === String(openId));
	const startEdit = (p) => {
		setOpenId(null);
		setEditId(p.id);
		setEditForm({
			title: p.title,
			description: p.description || ""
		});
	};
	const cancelEdit = () => setEditId(null);
	const saveEdit = () => {
		if (!editId || !editForm.title) return;
		update.mutate({
			id: editId,
			title: editForm.title,
			description: editForm.description || void 0
		}, { onSuccess: () => {
			setEditId(null);
			toast({ title: Z("方案已更新", "Plan updated") });
		} });
	};
	const handleAdd = () => {
		if (!form.title) return;
		create.mutate({
			user_id: caredOneId,
			title: form.title,
			description: form.description || void 0
		}, { onSuccess: () => {
			setForm({
				title: "",
				description: ""
			});
			setAddOpen(false);
			toast({ title: Z("方案已创建", "Plan created") });
		} });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:52:5:7d9b64e2b3d3009104b259db8525641c470f96c72d612cc057b0833cbdeb2660:1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:53:7:56f1b728c89d539050aa9ef414b8313b28216110b1ab11c168493d99ed8710f5:1",
				className: "flex items-center justify-between mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:54:9:2051604ad28e2bee7894bc1d11d37647727ac9fd04cf5fdc0df5da03292e9a78:1",
					className: "text-lg font-bold text-foreground",
					children: Z("护理方案", "Care Plans")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => setAddOpen(true),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }),
						" ",
						Z("添加", "Add")
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: addOpen,
				onOpenChange: setAddOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: Z("创建护理方案", "Create Care Plan") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: Z("制定护理方案并设定目标来追踪进展", "Define a care plan with goals to track progress") })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:64:11:1ac5ea4d441b4926f94bcb09515e7e5ebd280c0295c90fc7a30b7a08f2a729c8:1",
					className: "space-y-4 mt-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:65:13:0bd137aee249026a5dcadda5560dc6aa5052211c8c1d3dfb27198b058ac36b71:1",
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "plan-title",
								children: Z("方案名称", "Plan name")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "plan-title",
								value: form.title,
								onChange: (e) => setForm((p) => ({
									...p,
									title: e.target.value
								})),
								placeholder: Z("例如:每日活动安排", "e.g. Daily activity routine")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:69:13:0bd137aee249026a5dcadda5560dc6aa5052211c8c1d3dfb27198b058ac36b71:1",
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "plan-detail",
								children: Z("方案内容", "Plan details")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "plan-detail",
								value: form.description,
								onChange: (e) => setForm((p) => ({
									...p,
									description: e.target.value
								})),
								placeholder: Z("要做什么、什么时候做、由谁来做…", "What to do, when, and who helps..."),
								rows: 3
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "coral",
							className: "w-full",
							onClick: handleAdd,
							disabled: create.isPending || !form.title,
							children: [
								create.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-2" }),
								" ",
								Z("创建方案", "Create Plan")
							]
						})
					]
				})] })
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" }) : (plans || []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:83:9:46119a07a0831a6dbbe6f75edb4540edbf84f4bf35c3a0cf51a944e0aa862c41:1",
				className: "text-center py-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-10 w-10 text-muted-foreground mx-auto mb-3" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:85:11:f514c814dc3154d4eeee9566d95003487e3224d2eca16309663569a47abe64a3:1",
						className: "text-muted-foreground mb-3",
						children: Z("暂无护理方案", "No care plans yet")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "coral",
						size: "sm",
						onClick: () => setAddOpen(true),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }),
							" ",
							Z("添加第一个方案", "Add First Plan")
						]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:89:9:a9929ebdeed0219092c2fcd37f2f2e7dc244c8e4e2f4be9fa5f3c342ed4ae6f9:1",
				className: "space-y-2",
				children: (plans || []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-transparent card-elevated",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-4",
						children: editId === p.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:94:19:439b6f9b43d94c6ccd7c220cd8528c328eb752b546b04255c1754d6c16590ed1:1",
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:95:21:854621f2485bde3d9e0ff94e9f29ed70b3172173517897649044c06fd36c5aa5:1",
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: `edit-title-${p.id}`,
										children: Z("方案名称", "Plan name")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: `edit-title-${p.id}`,
										value: editForm.title,
										onChange: (e) => setEditForm((prev) => ({
											...prev,
											title: e.target.value
										})),
										placeholder: Z("例如:每日活动安排", "e.g. Daily activity routine")
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:99:21:854621f2485bde3d9e0ff94e9f29ed70b3172173517897649044c06fd36c5aa5:1",
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: `edit-detail-${p.id}`,
										children: Z("方案内容", "Plan details")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										id: `edit-detail-${p.id}`,
										value: editForm.description,
										onChange: (e) => setEditForm((prev) => ({
											...prev,
											description: e.target.value
										})),
										rows: 3,
										placeholder: Z("要做什么、什么时候做、由谁来做…", "What to do, when, and who helps...")
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:103:21:d654e7fb763fab829be3ac025e8dbe710285a46495b0b3cef817f1037abfcb51:1",
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
							"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:109:19:18bc362a46f2e08f4bc5fd29aa963ca6064b832f40fa3be80a50987dab9f516e:1",
							className: "flex items-start gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:109:59:18bc362a46f2e08f4bc5fd29aa963ca6064b832f40fa3be80a50987dab9f516e:1",
								type: "button",
								className: "min-w-0 flex-1 text-left flex justify-between items-start gap-2",
								onClick: () => setOpenId(String(p.id)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:110:21:2584ea9c4d0e3d8784afe71c4e79fba41af83c4a86831844c640a68b888e2c1f:1",
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:111:23:f1bde6294ffbe7ecdf3974de96e9244d061fe2a6e1d0a72395cf4c4f0d55883a:1",
										className: "block font-medium text-foreground",
										children: p.title || Z("未命名方案", "Untitled plan")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:112:23:b87d2fd999e870b4928e539556c77be4fcf2f0643e4e402292a67cf27e8bda6a:1",
										className: "block text-xs text-muted-foreground mt-1 line-clamp-2",
										children: p.description || Z("暂无内容", "No details added yet")
									})]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowActions, {
								onEdit: () => startEdit(p),
								onDelete: () => del.mutateAsync(p.id)
							})]
						})
					})
				}, p.id))
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordDetailDialog, {
				open: !!openId,
				onOpenChange: (v) => !v && setOpenId(null),
				title: open.title || Z("未命名方案", "Untitled plan"),
				rows: [{
					label: Z("方案内容", "Plan details"),
					value: open.description || Z("暂无内容", "No details added yet")
				}],
				onEdit: () => startEdit(open),
				onDelete: () => del.mutate(open.id, {
					onSuccess: () => {
						setOpenId(null);
						toast({ title: Z("方案已删除", "Plan deleted") });
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
export { CarePlanCard };
