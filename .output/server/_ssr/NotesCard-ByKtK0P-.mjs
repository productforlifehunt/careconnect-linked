import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { t as Input } from "./input-JWLlmFeK.mjs";
import { t as Textarea } from "./textarea-ZNemOC_7.mjs";
import { t as formatDate } from "./locale-DKwjQju2.mjs";
import { Pn as Check, it as Plus, jt as LoaderCircle, n as X, w as StickyNote } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-DHxbK-sS.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { $n as useUpdateCareNote, K as useCreateCareNote, j as useCareNotes, pt as useDeleteCareNote } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { t as RowActions } from "./RowActions-B2oGg1MM.mjs";
import { t as RecordDetailDialog } from "./RecordDetailDialog-4j2qP3NS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/NotesCard-ByKtK0P-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function NotesCard({ caredOneId }) {
	const { toast } = useToast();
	const { i18n } = useTranslation();
	const isCN = i18n.language?.startsWith("zh");
	const Z = (cn, en) => isCN ? cn : en;
	const { data: notes, isLoading } = useCareNotes(caredOneId);
	const create = useCreateCareNote();
	const update = useUpdateCareNote();
	const del = useDeleteCareNote();
	const [addOpen, setAddOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		title: "",
		content: ""
	});
	const [editId, setEditId] = (0, import_react.useState)(null);
	const [editForm, setEditForm] = (0, import_react.useState)({
		title: "",
		content: ""
	});
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const open = (notes || []).find((n) => String(n.id) === String(openId));
	const startEdit = (n) => {
		setOpenId(null);
		setEditId(n.id);
		setEditForm({
			title: n.title || "",
			content: n.content
		});
	};
	const cancelEdit = () => setEditId(null);
	const saveEdit = () => {
		if (!editId || !editForm.content) return;
		update.mutate({
			id: editId,
			title: editForm.title || void 0,
			content: editForm.content
		}, { onSuccess: () => {
			setEditId(null);
			toast({ title: Z("笔记已更新", "Note updated") });
		} });
	};
	const handleAdd = () => {
		if (!form.content) return;
		create.mutate({
			user_id: caredOneId,
			title: form.title || void 0,
			content: form.content
		}, { onSuccess: () => {
			setForm({
				title: "",
				content: ""
			});
			setAddOpen(false);
			toast({ title: Z("笔记已保存 ✓", "Note saved ✓") });
		} });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "components/cared-ones/NotesCard/NotesCard/div/0",
		"data-inspector-source": "components/cared-ones/NotesCard.tsx:50:5:7d9b64e2b3d3009104b259db8525641c470f96c72d612cc057b0833cbdeb2660:1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					"data-inspector-id": "components/cared-ones/NotesCard/NotesCard/h2/0",
					"data-inspector-source": "components/cared-ones/NotesCard.tsx:52:9:ecde03a55c1c2a98f7da39e6ee38976fe1f39edd7416592ed4b38941a7ce7b5d:1",
					className: "text-lg font-bold text-foreground",
					children: Z("护理笔记", "Care Notes")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					"data-inspector-id": "components/cared-ones/NotesCard/NotesCard/Button/98512c5a1f68",
					"data-inspector-source": "components/cared-ones/NotesCard.tsx:53:9:0cc17c211e83f06cde4e8236ac9c5e5f9e315993ee5d924d96f00ee0b99351be:1",
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
				"data-inspector-id": "components/cared-ones/NotesCard/NotesCard/Dialog/98512c5a1f68",
				"data-inspector-source": "components/cared-ones/NotesCard.tsx:56:7:0948f33fe93c407a8c4efe07c67f4b5b473c27ae9abaf58d027354e93eacabeb:1",
				open: addOpen,
				onOpenChange: setAddOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					"data-inspector-id": "components/cared-ones/NotesCard/NotesCard/DialogTitle/0",
					"data-inspector-source": "components/cared-ones/NotesCard.tsx:59:13:6437acfdc3053fa1c860fe03e33304a7aa1a71ef907b8042d8fc3580d0c0f9da:1",
					children: Z("添加护理笔记", "Add Care Note")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					"data-inspector-id": "components/cared-ones/NotesCard/NotesCard/DialogDescription/0",
					"data-inspector-source": "components/cared-ones/NotesCard.tsx:60:13:cb85a79b562befc3485019148942296665dd439be56bb1025dbb6851db27ae51:1",
					children: Z("记录观察、指示或任何相关信息", "Record observations, instructions, or anything relevant")
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 mt-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							"data-inspector-id": "components/cared-ones/NotesCard/NotesCard/Input/f322321378bd",
							"data-inspector-source": "components/cared-ones/NotesCard.tsx:63:13:bfa7ed22ec6863fd45a9690bb6f4fd0cdf6715b6062b8cc497f366db9d82583b:1",
							value: form.title,
							onChange: (e) => setForm((p) => ({
								...p,
								title: e.target.value
							})),
							placeholder: Z("笔记标题（可选）", "Note title (optional)")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							"data-inspector-id": "components/cared-ones/NotesCard/NotesCard/Textarea/4a62147567d1",
							"data-inspector-source": "components/cared-ones/NotesCard.tsx:64:13:5d5f11ab3e8949a5eb98f3f70b1628ecc2e50c33a552c4f66343ee9b8aa743f5:1",
							value: form.content,
							onChange: (e) => setForm((p) => ({
								...p,
								content: e.target.value
							})),
							placeholder: Z("写下观察、指示或任何相关内容……", "Write observations, instructions, or anything relevant..."),
							rows: 4
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							"data-inspector-id": "components/cared-ones/NotesCard/NotesCard/Button/b537fb954dc1",
							"data-inspector-source": "components/cared-ones/NotesCard.tsx:65:13:27a4621bc8b586ca6e5507971e89a3ea05ab02afeb4cf5411f9b2b9b8c181cd8:1",
							variant: "coral",
							className: "w-full",
							onClick: handleAdd,
							disabled: create.isPending || !form.content,
							children: [
								create.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-2" }),
								" ",
								Z("保存笔记", "Save Note")
							]
						})
					]
				})] })
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" }) : (notes || []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center py-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickyNote, { className: "h-10 w-10 text-muted-foreground mx-auto mb-3" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "components/cared-ones/NotesCard/NotesCard/p/0",
						"data-inspector-source": "components/cared-ones/NotesCard.tsx:77:11:6aaa9cebc85102db1aa85ef8cc01ca7e52478e27b1facbe0e2eee5fab75598a2:1",
						className: "text-muted-foreground mb-3",
						children: Z("还没有笔记", "No notes yet")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "components/cared-ones/NotesCard/NotesCard/Button/98512c5a1f68",
						"data-inspector-source": "components/cared-ones/NotesCard.tsx:78:11:9cf1fd368dad59c0fbbe59ab33f1ea5bd93233b89d468e02f5a26cd207fd09cd:1",
						variant: "coral",
						size: "sm",
						onClick: () => setAddOpen(true),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }),
							" ",
							Z("添加第一条", "Add First Note")
						]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "components/cared-ones/NotesCard/NotesCard/div/1",
				"data-inspector-source": "components/cared-ones/NotesCard.tsx:81:9:a9929ebdeed0219092c2fcd37f2f2e7dc244c8e4e2f4be9fa5f3c342ed4ae6f9:1",
				className: "space-y-2",
				children: (notes || []).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					"data-inspector-id": "components/cared-ones/NotesCard/NotesCard/Card/0",
					"data-inspector-source": "components/cared-ones/NotesCard.tsx:83:13:7e8ba919ff0051f0924274538ecbba856e62ffac14d0d22aa4f04fb10ff33b25:1",
					className: "border-transparent card-elevated",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						"data-inspector-id": "components/cared-ones/NotesCard/NotesCard/CardContent/0",
						"data-inspector-source": "components/cared-ones/NotesCard.tsx:84:15:28db4c9a96e8d75b48cbafc894d97da998a5485519267eabecbea2eb58e81599:1",
						className: "p-4",
						children: editId === n.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"data-inspector-id": "components/cared-ones/NotesCard/NotesCard/Input/2e3317b4bde8",
									"data-inspector-source": "components/cared-ones/NotesCard.tsx:87:21:efbebbe89b1a064caa52992102cf72247831b79ef94dcadaabf30ff5a9d08448:1",
									value: editForm.title,
									onChange: (e) => setEditForm((p) => ({
										...p,
										title: e.target.value
									})),
									placeholder: Z("标题（可选）", "Title (optional)")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									"data-inspector-id": "components/cared-ones/NotesCard/NotesCard/Textarea/37e9611e4a1a",
									"data-inspector-source": "components/cared-ones/NotesCard.tsx:88:21:3682f4bf9f0aeedd79372cd04d9a20db4137b690a1d9ea49254609871a6613f1:1",
									value: editForm.content,
									onChange: (e) => setEditForm((p) => ({
										...p,
										content: e.target.value
									})),
									rows: 4
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2 justify-end",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										"data-inspector-id": "components/cared-ones/NotesCard/NotesCard/Button/817c69c1a25a",
										"data-inspector-source": "components/cared-ones/NotesCard.tsx:90:23:11830e72714551f45bdf25deab185d0b2c743b5a54e66f2a6c3fd0875e29379f:1",
										variant: "ghost",
										size: "sm",
										onClick: cancelEdit,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5 mr-1" }),
											" ",
											Z("取消", "Cancel")
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										"data-inspector-id": "components/cared-ones/NotesCard/NotesCard/Button/bbb0c0e8996a",
										"data-inspector-source": "components/cared-ones/NotesCard.tsx:91:23:aa3c740f38236ac98f26a0811e0e8d7717d361be979f79a993a531a7ac0c9b9e:1",
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
								"data-inspector-id": "components/cared-ones/NotesCard/NotesCard/button/aa7b1a5d09de",
								"data-inspector-source": "components/cared-ones/NotesCard.tsx:95:59:33c06376ecfd730410c9854cd5d9e8eefaa8113a892e21d20b5aec13e2ce2a83:1",
								type: "button",
								className: "min-w-0 flex-1 text-left flex justify-between items-start gap-2",
								onClick: () => setOpenId(String(n.id)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									"data-inspector-id": "components/cared-ones/NotesCard/NotesCard/span/0",
									"data-inspector-source": "components/cared-ones/NotesCard.tsx:96:21:16c60377f1a55d3776405362999179f692149984f59bb23dbca2ffd2d854ba06:1",
									className: "min-w-0",
									children: [
										n.title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "components/cared-ones/NotesCard/NotesCard/span/1",
											"data-inspector-source": "components/cared-ones/NotesCard.tsx:97:35:59474139045b9650e939f257d2964a97b7b1d822c5b492864efe36ff9680fd1f:1",
											className: "block font-medium text-foreground text-sm",
											children: n.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "components/cared-ones/NotesCard/NotesCard/span/2",
											"data-inspector-source": "components/cared-ones/NotesCard.tsx:98:23:582d3bb6ac26ceafd8f488a24785d93a957be373dc6c09e86a5fee8bf761d3d8:1",
											className: "block text-xs text-muted-foreground line-clamp-2",
											children: n.content
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "components/cared-ones/NotesCard/NotesCard/span/3",
											"data-inspector-source": "components/cared-ones/NotesCard.tsx:99:23:561e2dadf8f4bdd67d1580668fe38d36712b5d4366aac3bda1cf907e455c2f2d:1",
											className: "block text-[10px] text-muted-foreground mt-1",
											children: formatDate(n.created_at, isCN ? "zh-CN" : "en", {
												month: "short",
												day: "numeric",
												hour: "numeric",
												minute: "2-digit"
											})
										})
									]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowActions, {
								"data-inspector-id": "components/cared-ones/NotesCard/NotesCard/RowActions/4b5bf1343afd",
								"data-inspector-source": "components/cared-ones/NotesCard.tsx:101:28:dcc30b23f90d18ed1c6b96b01b4a5922f5e8c8c6e962fe1b6ce2c1a072df2098:1",
								onEdit: () => startEdit(n),
								onDelete: () => del.mutateAsync(n.id)
							})]
						})
					})
				}, n.id))
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordDetailDialog, {
				"data-inspector-id": "components/cared-ones/NotesCard/NotesCard/RecordDetailDialog/288082ddbbcd",
				"data-inspector-source": "components/cared-ones/NotesCard.tsx:110:9:c8f3633af12767a744af92f278dcdfe4ce9bcb908a2caeab3f2637c57a9782a6:1",
				open: !!openId,
				onOpenChange: (v) => !v && setOpenId(null),
				title: open.title || Z("护理笔记", "Care note"),
				rows: [{
					label: Z("内容", "Content"),
					value: open.content
				}, {
					label: Z("记录时间", "Written"),
					value: open.created_at ? formatDate(open.created_at, isCN ? "zh-CN" : "en", {
						year: "numeric",
						month: "short",
						day: "numeric",
						hour: "numeric",
						minute: "2-digit"
					}) : void 0
				}],
				onEdit: () => startEdit(open),
				onDelete: () => del.mutate(open.id, {
					onSuccess: () => {
						setOpenId(null);
						toast({ title: Z("笔记已删除", "Note deleted") });
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
export { NotesCard };
