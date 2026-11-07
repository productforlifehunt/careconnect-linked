import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { n as CardContent, t as Card } from "./card-Cz5iPbNd.mjs";
import { t as Input } from "./input-DmTt3-fi.mjs";
import { t as formatDate } from "./locale-DKwjQju2.mjs";
import { Pn as Check, it as Plus, jt as LoaderCircle, mt as Paperclip, n as X, nn as FileText } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-COszB6Fv.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { F as useCaredOneDocuments, Y as useCreateCaredOneDocument, gt as useDeleteCaredOneDocument, nr as useUpdateCaredOneDocument } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { t as RowActions } from "./RowActions-BGuzjdk0.mjs";
import { t as RecordDetailDialog } from "./RecordDetailDialog-DdZS-7aZ.mjs";
import { n as MediaAttachments, t as MediaAttachmentList } from "./MediaAttachments-rp7KQ6-y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/DocumentsCard-Cevb7s49.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Cared one's care document — CCT 212 only:
* a55 name, a56 content, a57 attachments (gallery).
* Linked to the cared one through its JetEngine relation.
*/
function DocumentsCard({ caredOneId }) {
	const { toast } = useToast();
	const { i18n } = useTranslation();
	const isCN = i18n.language?.startsWith("zh");
	const Z = (cn, en) => isCN ? cn : en;
	const { data: docs, isLoading } = useCaredOneDocuments(caredOneId);
	const create = useCreateCaredOneDocument();
	const update = useUpdateCaredOneDocument();
	const del = useDeleteCaredOneDocument();
	const [addOpen, setAddOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		title: "",
		description: "",
		attachment_ids: []
	});
	const [editId, setEditId] = (0, import_react.useState)(null);
	const [editForm, setEditForm] = (0, import_react.useState)({
		title: "",
		description: "",
		attachment_ids: []
	});
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const open = (docs || []).find((d) => String(d.id) === String(openId));
	const startEdit = (d) => {
		setOpenId(null);
		setEditId(d.id);
		setEditForm({
			title: d.title || "",
			description: d.description || "",
			attachment_ids: Array.isArray(d.attachment_ids) ? d.attachment_ids : []
		});
	};
	const cancelEdit = () => setEditId(null);
	const saveEdit = () => {
		if (!editId || !editForm.title) return;
		update.mutate({
			id: editId,
			title: editForm.title,
			description: editForm.description,
			attachment_ids: editForm.attachment_ids
		}, {
			onSuccess: () => {
				setEditId(null);
				toast({ title: Z("文件已更新", "Document updated") });
			},
			onError: (e) => toast({
				title: Z("保存失败", "Couldn't save"),
				description: e?.message,
				variant: "destructive"
			})
		});
	};
	const handleAdd = () => {
		if (!form.title) return;
		create.mutate({
			user_id: caredOneId,
			title: form.title,
			description: form.description || void 0,
			attachment_ids: form.attachment_ids
		}, {
			onSuccess: () => {
				setForm({
					title: "",
					description: "",
					attachment_ids: []
				});
				setAddOpen(false);
				toast({ title: Z("文件已添加", "Document added") });
			},
			onError: (e) => toast({
				title: Z("添加失败", "Couldn't add"),
				description: e?.message,
				variant: "destructive"
			})
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/cared-ones/DocumentsCard.tsx:65:5:7d9b64e2b3d3009104b259db8525641c470f96c72d612cc057b0833cbdeb2660:1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/DocumentsCard.tsx:66:7:56f1b728c89d539050aa9ef414b8313b28216110b1ab11c168493d99ed8710f5:1",
				className: "flex items-center justify-between mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					"data-inspector-source": "components/cared-ones/DocumentsCard.tsx:67:9:beca9001c6905d43594d9025949dddedc19c84c481d10ccf82d9774c3df876ee:1",
					className: "text-lg font-bold text-foreground",
					children: Z("文件资料", "Documents")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "components/cared-ones/DocumentsCard.tsx:68:9:071dccf697c1badae00a469af34e1305288e6fbee9447a5b501a11ceff357683:1",
					className: "flex gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => setAddOpen(true),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }),
							" ",
							Z("添加", "Add")
						]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: addOpen,
				onOpenChange: setAddOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: Z("添加文件", "Add Document") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: Z("存储重要文件和记录", "Store important documents and records") })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/cared-ones/DocumentsCard.tsx:79:11:1ac5ea4d441b4926f94bcb09515e7e5ebd280c0295c90fc7a30b7a08f2a729c8:1",
					className: "space-y-4 mt-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/DocumentsCard.tsx:80:13:81475fc9352177daab0d0ab585131b1648b1b7ce1d87c0e0dfb50e974045d6e8:1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [
								Z("标题", "Title"),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-source": "components/cared-ones/DocumentsCard.tsx:80:44:81475fc9352177daab0d0ab585131b1648b1b7ce1d87c0e0dfb50e974045d6e8:1",
									className: "text-destructive",
									children: "*"
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.title,
								onChange: (e) => setForm((p) => ({
									...p,
									title: e.target.value
								})),
								placeholder: Z("文件标题", "Document title"),
								className: "mt-1"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/DocumentsCard.tsx:81:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("附件（PDF / TXT / 图片）", "Attachments (PDF / TXT / images)") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-source": "components/cared-ones/DocumentsCard.tsx:83:15:026a328570fbf7b39a89b4a8d5582c9ed4205de75f9e7c926a525d3913b2549a:1",
								className: "mt-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaAttachments, {
									value: form.attachment_ids,
									onChange: (ids) => setForm((p) => ({
										...p,
										attachment_ids: ids
									})),
									accept: ".pdf,.txt,.doc,.docx,.xls,.xlsx,image/*",
									label: Z("上传附件", "Upload files")
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/DocumentsCard.tsx:92:13:5ce02a7a68389e7eebf73149c45a9a39fd70725fbc9f6495576f1635fdb9f64c:1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("说明", "Description") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.description,
								onChange: (e) => setForm((p) => ({
									...p,
									description: e.target.value
								})),
								placeholder: Z("可选说明", "Optional description"),
								className: "mt-1"
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
								Z("添加文件", "Add Document")
							]
						})
					]
				})] })
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" }) : (docs || []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/DocumentsCard.tsx:103:9:46119a07a0831a6dbbe6f75edb4540edbf84f4bf35c3a0cf51a944e0aa862c41:1",
				className: "text-center py-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-10 w-10 text-muted-foreground mx-auto mb-3" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/cared-ones/DocumentsCard.tsx:105:11:6bc76ab7ded3185a3a14cf51d70ab211dd4652190a8a80d81a646726de3be2b6:1",
						className: "text-muted-foreground mb-3",
						children: Z("暂无文件", "No documents yet")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "coral",
						size: "sm",
						onClick: () => setAddOpen(true),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }),
							" ",
							Z("添加第一个文件", "Add First Document")
						]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "components/cared-ones/DocumentsCard.tsx:109:9:a9929ebdeed0219092c2fcd37f2f2e7dc244c8e4e2f4be9fa5f3c342ed4ae6f9:1",
				className: "space-y-2",
				children: (docs || []).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-transparent card-elevated",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-4",
						children: editId === d.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/DocumentsCard.tsx:114:19:439b6f9b43d94c6ccd7c220cd8528c328eb752b546b04255c1754d6c16590ed1:1",
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
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: editForm.description,
									onChange: (e) => setEditForm((p) => ({
										...p,
										description: e.target.value
									})),
									placeholder: Z("说明", "Description")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaAttachments, {
									value: editForm.attachment_ids,
									onChange: (ids) => setEditForm((p) => ({
										...p,
										attachment_ids: ids
									})),
									accept: ".pdf,.txt,.doc,.docx,.xls,.xlsx,image/*",
									label: Z("上传附件", "Upload files")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/DocumentsCard.tsx:123:21:d654e7fb763fab829be3ac025e8dbe710285a46495b0b3cef817f1037abfcb51:1",
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
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/DocumentsCard.tsx:129:21:0215fc139587ea051a0db6e956fd924f8cb1077df6094742f4a7c0a92a52966b:1",
							className: "flex items-start gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								"data-inspector-source": "components/cared-ones/DocumentsCard.tsx:129:61:0215fc139587ea051a0db6e956fd924f8cb1077df6094742f4a7c0a92a52966b:1",
								type: "button",
								className: "min-w-0 flex-1 text-left flex justify-between items-start gap-2",
								onClick: () => setOpenId(String(d.id)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									"data-inspector-source": "components/cared-ones/DocumentsCard.tsx:130:21:16c60377f1a55d3776405362999179f692149984f59bb23dbca2ffd2d854ba06:1",
									className: "min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-source": "components/cared-ones/DocumentsCard.tsx:131:23:a4e6d6e77d5171387d2c70957f3a696fd4e87577850234c4c276fa7f649ecae1:1",
											className: "block font-medium text-foreground text-sm",
											children: d.title || Z("文件", "Document")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-source": "components/cared-ones/DocumentsCard.tsx:132:23:077ce0fc48c1e1c9c3af666076cb0b447f678f1b68aeeb9faf9d70fe30d39195:1",
											className: "block text-[10px] text-muted-foreground",
											children: formatDate(d.created_at, isCN ? "zh-CN" : void 0)
										}),
										d.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-source": "components/cared-ones/DocumentsCard.tsx:133:41:53cfc6180b625b24cd1999cc80630f98ed37adf309443e470d2dc90a88c53805:1",
											className: "block text-xs text-muted-foreground mt-0.5 line-clamp-2",
											children: d.description
										}),
										Array.isArray(d.attachment_ids) && d.attachment_ids.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											"data-inspector-source": "components/cared-ones/DocumentsCard.tsx:135:25:fa48b3f47af04941d0e8e7bf34d4e18a612991ea5528fd1dd3ab84a84ce496c3:1",
											className: "flex items-center gap-1 text-[11px] text-muted-foreground mt-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "h-3 w-3" }),
												" ",
												Z(`${d.attachment_ids.length} 个附件`, `${d.attachment_ids.length} attachment(s)`)
											]
										})
									]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowActions, {
								onEdit: () => startEdit(d),
								onDelete: () => del.mutateAsync(d.id)
							})]
						}), Array.isArray(d.attachment_ids) && d.attachment_ids.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaAttachmentList, { ids: d.attachment_ids })] })
					})
				}, d.id))
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordDetailDialog, {
				open: !!openId,
				onOpenChange: (v) => !v && setOpenId(null),
				title: open.title || Z("文件", "Document"),
				rows: [
					{
						label: Z("说明", "Description"),
						value: open.description
					},
					{
						label: Z("添加时间", "Added"),
						value: open.created_at ? formatDate(open.created_at, isCN ? "zh-CN" : void 0) : void 0
					},
					{
						label: Z("附件", "Attachments"),
						value: Array.isArray(open.attachment_ids) && open.attachment_ids.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaAttachmentList, { ids: open.attachment_ids }) : void 0
					}
				],
				onEdit: () => startEdit(open),
				onDelete: () => del.mutate(open.id, {
					onSuccess: () => {
						setOpenId(null);
						toast({ title: Z("文件已删除", "Document deleted") });
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
export { DocumentsCard };
