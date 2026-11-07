import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { jt as LoaderCircle, ut as Pencil, y as Trash2 } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-BwgHkacp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/RowActions-BNn5o7zD.js
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
		"data-inspector-id": "components/cared-ones/RowActions/RowActions/div/7fa516e9657e/0",
		"data-inspector-source": "components/cared-ones/RowActions.tsx:26:5:82d2679bf61263a8c79f9658ce4adf4b56049cd3a2b58aaf0aa6484112d06958:1",
		className: "flex shrink-0 items-center gap-1",
		children: [
			onEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				"data-inspector-id": "components/cared-ones/RowActions/RowActions/Button/0f180ff21cd5/0",
				"data-inspector-source": "components/cared-ones/RowActions.tsx:28:9:0d2ab6b2f1af49318841420aace93163666ddd37bb7e701769a23e920fc40ad0:1",
				type: "button",
				size: "icon",
				variant: "ghost",
				className: "h-8 w-8",
				"aria-label": zh ? "编辑" : "Edit",
				title: zh ? "编辑" : "Edit",
				onClick: onEdit,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {
					"data-inspector-id": "components/cared-ones/RowActions/RowActions/Pencil/0",
					"data-inspector-source": "components/cared-ones/RowActions.tsx:29:11:224e150dc5b5f2cd889986aedfd646313cd898b2c48bbb4385097b5164296eba:1",
					className: "h-4 w-4"
				})
			}),
			onDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				"data-inspector-id": "components/cared-ones/RowActions/RowActions/Button/14bcd866eb94/0",
				"data-inspector-source": "components/cared-ones/RowActions.tsx:33:9:428eced5868e478de93da70b7e962bea397b7eaef86d3f6e0d5d4589782a9171:1",
				type: "button",
				size: "icon",
				variant: "ghost",
				className: "h-8 w-8 text-destructive hover:text-destructive",
				"aria-label": zh ? "删除" : "Delete",
				title: zh ? "删除" : "Delete",
				onClick: () => setConfirm(true),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
					"data-inspector-id": "components/cared-ones/RowActions/RowActions/Trash2/0",
					"data-inspector-source": "components/cared-ones/RowActions.tsx:34:11:9ff9013ac503321b7ff72157a393350232dc7025340104fd84fcc6c999c8c118:1",
					className: "h-4 w-4"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				"data-inspector-id": "components/cared-ones/RowActions/RowActions/AlertDialog/14bcd866eb94/0",
				"data-inspector-source": "components/cared-ones/RowActions.tsx:37:7:218784b059a9e80b7c0fc36def8a6502aa6953782151d4244bbd2106b073ef25:1",
				open: confirm,
				onOpenChange: setConfirm,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, {
					"data-inspector-id": "components/cared-ones/RowActions/RowActions/AlertDialogContent/0",
					"data-inspector-source": "components/cared-ones/RowActions.tsx:38:9:fe882bff82cf92609c5c378a06ff00f5061eae47f7c332a6d6cc383b3bd43648:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, {
						"data-inspector-id": "components/cared-ones/RowActions/RowActions/AlertDialogHeader/0",
						"data-inspector-source": "components/cared-ones/RowActions.tsx:39:11:62e07f561da6944a047b4e012eb2391860120be17ea9744e8c36929801480129:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, {
							"data-inspector-id": "components/cared-ones/RowActions/RowActions/AlertDialogTitle/60cae1d01739/0",
							"data-inspector-source": "components/cared-ones/RowActions.tsx:40:13:d2bb4ea0aa8d7d51f48802a825c287728c949693217e9a040d8bba9d70cf4f52:1",
							children: zh ? "确定删除？" : "Delete this item?"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, {
							"data-inspector-id": "components/cared-ones/RowActions/RowActions/AlertDialogDescription/60cae1d01739/0",
							"data-inspector-source": "components/cared-ones/RowActions.tsx:41:13:ea4e35ef87846209b53eb3a5a8e7344863473338434a6da7ce8693771f3bcf9d:1",
							children: zh ? "删除后无法恢复。" : "This cannot be undone."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, {
						"data-inspector-id": "components/cared-ones/RowActions/RowActions/AlertDialogFooter/0",
						"data-inspector-source": "components/cared-ones/RowActions.tsx:43:11:cd21762e2df7a9f57cbb6fa1f162d0299e5ad7c25832bc9f66493b677e8736df:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
							"data-inspector-id": "components/cared-ones/RowActions/RowActions/AlertDialogCancel/60cae1d01739/0",
							"data-inspector-source": "components/cared-ones/RowActions.tsx:44:13:e478c5bb26fdbf405378a69f08fffcacf7afd9c36c5d0162001763f606bd2cef:1",
							children: zh ? "取消" : "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogAction, {
							"data-inspector-id": "components/cared-ones/RowActions/RowActions/AlertDialogAction/b46aba377628/0",
							"data-inspector-source": "components/cared-ones/RowActions.tsx:45:13:eb270d8322aa17b979d28ec677c15e6500ae7ed41987573f9224e0f048e85e3a:1",
							onClick: (e) => {
								e.preventDefault();
								doDelete();
							},
							disabled: busy,
							className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
							children: [busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								"data-inspector-id": "components/cared-ones/RowActions/RowActions/Loader2/0",
								"data-inspector-source": "components/cared-ones/RowActions.tsx:46:24:3292f80148127e5054a22e0a51dbdd6c480d09a91b1a511629275e3735ac5262:1",
								className: "mr-1 h-4 w-4 animate-spin"
							}), zh ? "删除" : "Delete"]
						})]
					})]
				})
			})
		]
	});
}
//#endregion
export { RowActions as t };
