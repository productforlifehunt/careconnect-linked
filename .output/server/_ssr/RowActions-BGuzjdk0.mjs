import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { jt as LoaderCircle, ut as Pencil, y as Trash2 } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-B2Az5zRn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/RowActions-BGuzjdk0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Standard per-row Edit + Delete buttons used by every cared-one feature list. */
function RowActions({ onEdit, onDelete }) {
	const { i18n } = useTranslation();
	const zh = i18n.language?.startsWith("zh");
	const { toast } = useToast();
	const [confirm, setConfirm] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const doDelete = async () => {
		if (!onDelete) return;
		setBusy(true);
		try {
			await onDelete();
			toast({ title: zh ? "已删除" : "Deleted" });
			setConfirm(false);
		} catch (e) {
			toast({
				title: zh ? "没能删除" : "Couldn't delete",
				description: e?.message,
				variant: "destructive"
			});
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/cared-ones/RowActions.tsx:26:5:82d2679bf61263a8c79f9658ce4adf4b56049cd3a2b58aaf0aa6484112d06958:1",
		className: "flex shrink-0 items-center gap-1",
		children: [
			onEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				size: "icon",
				variant: "ghost",
				className: "h-8 w-8",
				"aria-label": zh ? "编辑" : "Edit",
				title: zh ? "编辑" : "Edit",
				onClick: onEdit,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
			}),
			onDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				size: "icon",
				variant: "ghost",
				className: "h-8 w-8 text-destructive hover:text-destructive",
				"aria-label": zh ? "删除" : "Delete",
				title: zh ? "删除" : "Delete",
				onClick: () => setConfirm(true),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: confirm,
				onOpenChange: setConfirm,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: zh ? "确定删除？" : "Delete this item?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: zh ? "删除后无法恢复。" : "This cannot be undone." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: zh ? "取消" : "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogAction, {
					onClick: (e) => {
						e.preventDefault();
						doDelete();
					},
					disabled: busy,
					className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
					children: [busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }), zh ? "删除" : "Delete"]
				})] })] })
			})
		]
	});
}
//#endregion
export { RowActions as t };
