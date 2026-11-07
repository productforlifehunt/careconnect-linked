import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { n as CardContent, t as Card } from "./card-Cz5iPbNd.mjs";
import { t as Input } from "./input-DmTt3-fi.mjs";
import { t as Textarea } from "./textarea-DPamDMgK.mjs";
import { t as formatDate } from "./locale-DKwjQju2.mjs";
import { Pn as Check, it as Plus, jt as LoaderCircle, n as X, w as StickyNote } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-COszB6Fv.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { $n as useUpdateCareNote, K as useCreateCareNote, j as useCareNotes, pt as useDeleteCareNote } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { t as RowActions } from "./RowActions-BGuzjdk0.mjs";
import { t as RecordDetailDialog } from "./RecordDetailDialog-DdZS-7aZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/NotesCard-Cf1TMxUA.js
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
		"data-inspector-source": "components/cared-ones/NotesCard.tsx:50:5:7d9b64e2b3d3009104b259db8525641c470f96c72d612cc057b0833cbdeb2660:1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/NotesCard.tsx:51:7:56f1b728c89d539050aa9ef414b8313b28216110b1ab11c168493d99ed8710f5:1",
				className: "flex items-center justify-between mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					"data-inspector-source": "components/cared-ones/NotesCard.tsx:52:9:ecde03a55c1c2a98f7da39e6ee38976fe1f39edd7416592ed4b38941a7ce7b5d:1",
					className: "text-lg font-bold text-foreground",
					children: Z("护理笔记", "Care Notes")
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
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: Z("添加护理笔记", "Add Care Note") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: Z("记录观察、指示或任何相关信息", "Record observations, instructions, or anything relevant") })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/cared-ones/NotesCard.tsx:62:11:1ac5ea4d441b4926f94bcb09515e7e5ebd280c0295c90fc7a30b7a08f2a729c8:1",
					className: "space-y-4 mt-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.title,
							onChange: (e) => setForm((p) => ({
								...p,
								title: e.target.value
							})),
							placeholder: Z("笔记标题（可选）", "Note title (optional)")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: form.content,
							onChange: (e) => setForm((p) => ({
								...p,
								content: e.target.value
							})),
							placeholder: Z("写下观察、指示或任何相关内容……", "Write observations, instructions, or anything relevant..."),
							rows: 4
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
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
				"data-inspector-source": "components/cared-ones/NotesCard.tsx:75:9:46119a07a0831a6dbbe6f75edb4540edbf84f4bf35c3a0cf51a944e0aa862c41:1",
				className: "text-center py-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickyNote, { className: "h-10 w-10 text-muted-foreground mx-auto mb-3" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/cared-ones/NotesCard.tsx:77:11:6aaa9cebc85102db1aa85ef8cc01ca7e52478e27b1facbe0e2eee5fab75598a2:1",
						className: "text-muted-foreground mb-3",
						children: Z("还没有笔记", "No notes yet")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
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
				"data-inspector-source": "components/cared-ones/NotesCard.tsx:81:9:a9929ebdeed0219092c2fcd37f2f2e7dc244c8e4e2f4be9fa5f3c342ed4ae6f9:1",
				className: "space-y-2",
				children: (notes || []).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-transparent card-elevated",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-4",
						children: editId === n.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/NotesCard.tsx:86:19:439b6f9b43d94c6ccd7c220cd8528c328eb752b546b04255c1754d6c16590ed1:1",
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: editForm.title,
									onChange: (e) => setEditForm((p) => ({
										...p,
										title: e.target.value
									})),
									placeholder: Z("标题（可选）", "Title (optional)")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									value: editForm.content,
									onChange: (e) => setEditForm((p) => ({
										...p,
										content: e.target.value
									})),
									rows: 4
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/NotesCard.tsx:89:21:d654e7fb763fab829be3ac025e8dbe710285a46495b0b3cef817f1037abfcb51:1",
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
							"data-inspector-source": "components/cared-ones/NotesCard.tsx:95:19:33c06376ecfd730410c9854cd5d9e8eefaa8113a892e21d20b5aec13e2ce2a83:1",
							className: "flex items-start gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								"data-inspector-source": "components/cared-ones/NotesCard.tsx:95:59:33c06376ecfd730410c9854cd5d9e8eefaa8113a892e21d20b5aec13e2ce2a83:1",
								type: "button",
								className: "min-w-0 flex-1 text-left flex justify-between items-start gap-2",
								onClick: () => setOpenId(String(n.id)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									"data-inspector-source": "components/cared-ones/NotesCard.tsx:96:21:16c60377f1a55d3776405362999179f692149984f59bb23dbca2ffd2d854ba06:1",
									className: "min-w-0",
									children: [
										n.title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-source": "components/cared-ones/NotesCard.tsx:97:35:59474139045b9650e939f257d2964a97b7b1d822c5b492864efe36ff9680fd1f:1",
											className: "block font-medium text-foreground text-sm",
											children: n.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-source": "components/cared-ones/NotesCard.tsx:98:23:582d3bb6ac26ceafd8f488a24785d93a957be373dc6c09e86a5fee8bf761d3d8:1",
											className: "block text-xs text-muted-foreground line-clamp-2",
											children: n.content
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
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
								onEdit: () => startEdit(n),
								onDelete: () => del.mutateAsync(n.id)
							})]
						})
					})
				}, n.id))
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordDetailDialog, {
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
