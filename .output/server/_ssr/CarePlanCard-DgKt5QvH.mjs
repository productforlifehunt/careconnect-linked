import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { t as Input } from "./input-JWLlmFeK.mjs";
import { t as Textarea } from "./textarea-ZNemOC_7.mjs";
import { Pn as Check, bn as ClipboardList, it as Plus, jt as LoaderCircle, n as X } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-DHxbK-sS.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { M as useCarePlans, er as useUpdateCarePlan, mt as useDeleteCarePlan, q as useCreateCarePlan } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { t as RowActions } from "./RowActions-B2oGg1MM.mjs";
import { t as RecordDetailDialog } from "./RecordDetailDialog-4j2qP3NS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CarePlanCard-DgKt5QvH.js
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
		"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/div/0",
		"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:52:5:7d9b64e2b3d3009104b259db8525641c470f96c72d612cc057b0833cbdeb2660:1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/h2/0",
					"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:54:9:2051604ad28e2bee7894bc1d11d37647727ac9fd04cf5fdc0df5da03292e9a78:1",
					className: "text-lg font-bold text-foreground",
					children: Z("护理方案", "Care Plans")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/Button/98512c5a1f68",
					"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:55:9:0cc17c211e83f06cde4e8236ac9c5e5f9e315993ee5d924d96f00ee0b99351be:1",
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
				"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/Dialog/98512c5a1f68",
				"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:58:7:0948f33fe93c407a8c4efe07c67f4b5b473c27ae9abaf58d027354e93eacabeb:1",
				open: addOpen,
				onOpenChange: setAddOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/DialogTitle/0",
					"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:61:13:e715403fd647fed5b6caec905eaf440cf056b35fd9d0c2a0d8882450c6c9a584:1",
					children: Z("创建护理方案", "Create Care Plan")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/DialogDescription/0",
					"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:62:13:10e9595c5204ccd617a946907ff068699443b5688a90dba308973ba2b2379ca6:1",
					children: Z("制定护理方案并设定目标来追踪进展", "Define a care plan with goals to track progress")
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 mt-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/Label/0",
								"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:66:15:cfb05da86de423f416b1932b2e2d2d39293435fb7c5e859bc0df04e5e2fef077:1",
								htmlFor: "plan-title",
								children: Z("方案名称", "Plan name")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/Input/15956501a556",
								"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:67:15:e987c273e78af28c29fd2f95da1262a297bd0809ff46633ec9ff869c704ada9f:1",
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
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/Label/1",
								"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:70:15:5f4097620c258e54c7c9873735aad67bcd81befa48ed2260b04a6c15bd539377:1",
								htmlFor: "plan-detail",
								children: Z("方案内容", "Plan details")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/Textarea/80adc8127230",
								"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:71:15:84b7dd4c36d2e16eba09af2d0aac9298f345410605f092057f3008a7045f0cf3:1",
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
							"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/Button/b537fb954dc1",
							"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:73:13:9f95628439c3c364683f09cb50ba1efd44652e0affa2902c99840d0636013eaa:1",
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
				className: "text-center py-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-10 w-10 text-muted-foreground mx-auto mb-3" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/p/0",
						"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:85:11:f514c814dc3154d4eeee9566d95003487e3224d2eca16309663569a47abe64a3:1",
						className: "text-muted-foreground mb-3",
						children: Z("暂无护理方案", "No care plans yet")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/Button/98512c5a1f68",
						"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:86:11:16ed7b07d25953bc31b051652ebe58957f5658d99651579d3cc66c7a7bf5974c:1",
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
				"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/div/1",
				"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:89:9:a9929ebdeed0219092c2fcd37f2f2e7dc244c8e4e2f4be9fa5f3c342ed4ae6f9:1",
				className: "space-y-2",
				children: (plans || []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/Card/0",
					"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:91:13:3426e7229af94bb5c83b906e484161124459bc176d75c9284901c61805bc80d5:1",
					className: "border-transparent card-elevated",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/CardContent/0",
						"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:92:15:28db4c9a96e8d75b48cbafc894d97da998a5485519267eabecbea2eb58e81599:1",
						className: "p-4",
						children: editId === p.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/Label/2",
										"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:96:23:d3286b1f63105dd76198e5d765f9a41398bb536a516c2d16dc4e9370629aa202:1",
										htmlFor: `edit-title-${p.id}`,
										children: Z("方案名称", "Plan name")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/Input/3077a4e7ed42",
										"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:97:23:5b9cbd59848fbcb4fd46c568ddcc44214ca97f57e82f9d4a8f2e4465bebf672b:1",
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
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/Label/3",
										"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:100:23:ba7de0d14615c4baa981104ceca7079db72f34c3f6bb91860b66c52e0f392fb6:1",
										htmlFor: `edit-detail-${p.id}`,
										children: Z("方案内容", "Plan details")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/Textarea/2891bfe03417",
										"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:101:23:f5d344342b593a8dbf64c28f50e1d5dda530bbeae1d09a0f35ba515d7d786c03:1",
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
									className: "flex gap-2 justify-end",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/Button/817c69c1a25a",
										"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:104:23:11830e72714551f45bdf25deab185d0b2c743b5a54e66f2a6c3fd0875e29379f:1",
										variant: "ghost",
										size: "sm",
										onClick: cancelEdit,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5 mr-1" }),
											" ",
											Z("取消", "Cancel")
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/Button/bbb0c0e8996a",
										"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:105:23:aa3c740f38236ac98f26a0811e0e8d7717d361be979f79a993a531a7ac0c9b9e:1",
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
								"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/button/7bf37ef9e936",
								"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:109:59:18bc362a46f2e08f4bc5fd29aa963ca6064b832f40fa3be80a50987dab9f516e:1",
								type: "button",
								className: "min-w-0 flex-1 text-left flex justify-between items-start gap-2",
								onClick: () => setOpenId(String(p.id)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/span/0",
										"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:111:23:f1bde6294ffbe7ecdf3974de96e9244d061fe2a6e1d0a72395cf4c4f0d55883a:1",
										className: "block font-medium text-foreground",
										children: p.title || Z("未命名方案", "Untitled plan")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/span/1",
										"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:112:23:b87d2fd999e870b4928e539556c77be4fcf2f0643e4e402292a67cf27e8bda6a:1",
										className: "block text-xs text-muted-foreground mt-1 line-clamp-2",
										children: p.description || Z("暂无内容", "No details added yet")
									})]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowActions, {
								"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/RowActions/f1d3e1aeb87c",
								"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:114:28:5f88ae391d2ba3a9c0bad4e2f06725cd447637a5cb65ccc3c2eec89c0aca4d40:1",
								onEdit: () => startEdit(p),
								onDelete: () => del.mutateAsync(p.id)
							})]
						})
					})
				}, p.id))
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordDetailDialog, {
				"data-inspector-id": "components/cared-ones/CarePlanCard/CarePlanCard/RecordDetailDialog/288082ddbbcd",
				"data-inspector-source": "components/cared-ones/CarePlanCard.tsx:123:9:c8f3633af12767a744af92f278dcdfe4ce9bcb908a2caeab3f2637c57a9782a6:1",
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
