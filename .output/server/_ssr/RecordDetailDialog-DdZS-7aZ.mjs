import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { _ as TriangleAlert, jt as LoaderCircle, ut as Pencil, y as Trash2 } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-COszB6Fv.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/RecordDetailDialog-DdZS-7aZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Shared detail popup for every cared-one record card (tasks, tips, notes,
* plans, documents, contacts, visits...).
*
* Rules it enforces everywhere:
*  - a record is opened, read in full, and only then acted on;
*  - nothing destructive or state-changing happens on a single card tap;
*  - delete always asks for confirmation inside the popup.
*/
function RecordDetailDialog({ open, onOpenChange, title, subtitle, rows, actions, onEdit, onDelete, isDeleting }) {
	const { i18n } = useTranslation();
	const isCN = i18n.language?.startsWith("zh");
	const Z = (cn, en) => isCN ? cn : en;
	const [confirming, setConfirming] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!open) setConfirming(false);
	}, [open]);
	const visible = rows.filter((r) => r.value !== void 0 && r.value !== null && r.value !== "");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "text-base",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: subtitle || Z("查看这条记录的完整内容，再决定要做什么。", "Read the whole record first, then choose what to do.") })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "components/cared-ones/RecordDetailDialog.tsx:62:9:e569951a9aa3aba8bcd60094b8bbad6f833c3477c491f4e43b03bcea9e9ac7a5:1",
					className: "mt-1 space-y-3",
					children: visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/cared-ones/RecordDetailDialog.tsx:64:13:1452657c31aae9c37c39d4a0cfe8a15019dfc5bc40dd1e5b63c0374cec53fd6f:1",
						className: "text-sm text-muted-foreground",
						children: Z("这条记录还没有填写内容。", "Nothing has been written in this record yet.")
					}) : visible.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/cared-ones/RecordDetailDialog.tsx:67:15:0dea1a7400a93a45e4e7dae0da79b6f7c5bd868dbdcffbf266b870bd56fdd472:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "components/cared-ones/RecordDetailDialog.tsx:68:17:7dbe1fc3549352890af8ec814c70582d5596320c3adc0292f2349abd81c12809:1",
							className: "text-[10px] uppercase tracking-wide text-muted-foreground",
							children: r.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-source": "components/cared-ones/RecordDetailDialog.tsx:69:17:8ea4bc7c8db8cac7c3b5062d2ecc05bd7205003859b0df83d66a4171804914ae:1",
							className: "text-sm text-foreground whitespace-pre-wrap break-words",
							children: r.value
						})]
					}, `${r.label}-${i}`))
				}),
				actions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "components/cared-ones/RecordDetailDialog.tsx:75:21:7fd6efd18a0d5bcca230edf368c84283383d173e98a8b347ba10611c328b4706:1",
					className: "flex flex-wrap gap-2 pt-2",
					children: actions
				}),
				(onEdit || onDelete) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "components/cared-ones/RecordDetailDialog.tsx:78:11:8c09c0e7b2337aed2c3a575938c0aaa8c0556e5f85987a80ccf38989ac49f219:1",
					className: "mt-2 border-t pt-3",
					children: confirming && onDelete ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/cared-ones/RecordDetailDialog.tsx:80:15:42e90dccce7e84c974ece10adac1404bffeb077c1784338ffc1e89c432b77bf6:1",
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							"data-inspector-source": "components/cared-ones/RecordDetailDialog.tsx:81:17:8120cda26e38aabe6d995ac452df4344cf56b1036307999dc60618526f03c57a:1",
							className: "text-sm text-foreground flex items-start gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4 text-destructive mt-0.5 shrink-0" }), Z("删除后无法恢复，确定要删除这条记录吗？", "This cannot be undone. Delete this record?")]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/RecordDetailDialog.tsx:85:17:4687f423751d0186b35a3b0ab1a590922bcf7b177864491ca979a7748085f199:1",
							className: "flex gap-2 justify-end",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => setConfirming(false),
								children: Z("取消", "Cancel")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "destructive",
								size: "sm",
								onClick: onDelete,
								disabled: isDeleting,
								children: [isDeleting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin mr-1" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5 mr-1" }), Z("确认删除", "Yes, delete")]
							})]
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/cared-ones/RecordDetailDialog.tsx:94:15:8f2a008cc2775da558d5cf179e7cda5123267bb46788f2420f908f690d05f9ce:1",
						className: "flex gap-2 justify-end",
						children: [onEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: onEdit,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5 mr-1" }),
								" ",
								Z("编辑", "Edit")
							]
						}), onDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							className: "text-destructive",
							onClick: () => setConfirming(true),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5 mr-1" }),
								" ",
								Z("删除", "Delete")
							]
						})]
					})
				})
			]
		})
	});
}
//#endregion
export { RecordDetailDialog as t };
