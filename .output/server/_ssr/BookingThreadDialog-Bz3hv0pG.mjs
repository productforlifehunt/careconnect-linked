import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { t as Badge } from "./badge-Dn-oRli-.mjs";
import { t as Textarea } from "./textarea-DPamDMgK.mjs";
import { n as formatDateTime } from "./locale-DKwjQju2.mjs";
import { Pn as Check, St as MessageSquare, W as Send, jt as LoaderCircle, n as X } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-COszB6Fv.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { d as useResolveRefund, s as useOrderNotes, t as useAddOrderNote } from "./use-cart-B3rnJV3i.mjs";
import { t as Separator } from "./separator-BD-dtN1z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/BookingThreadDialog-Bz3hv0pG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* The booking conversation both sides read in the app: issue reports, refund
* requests and the caregiver's decision, all on one timeline. This is what
* keeps clients and caregivers out of any admin back office.
*/
function BookingThreadDialog({ open, onOpenChange, orderId, role, counterpartName, refundStatus, refundReason, refundAmount }) {
	const { t, i18n } = useTranslation();
	const isZh = i18n.language?.startsWith("zh");
	const id = Number(orderId);
	const { data: notes, isLoading } = useOrderNotes(open && id > 0 ? id : void 0);
	const addNote = useAddOrderNote();
	const resolveRefund = useResolveRefund();
	const [message, setMessage] = (0, import_react.useState)("");
	const [settledAs, setSettledAs] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!open) setSettledAs(null);
	}, [open]);
	(0, import_react.useEffect)(() => {
		if (refundStatus && refundStatus !== "requested") setSettledAs(null);
	}, [refundStatus]);
	const currency = isZh ? "¥" : "$";
	const effectiveRefundStatus = settledAs ?? refundStatus;
	const openRefund = effectiveRefundStatus === "requested";
	const send = async () => {
		if (!message.trim() || !(id > 0)) return;
		try {
			await addNote.mutateAsync({
				orderId: id,
				note: message.trim()
			});
			setMessage("");
		} catch {}
	};
	const settle = async (decision) => {
		if (!(id > 0)) return;
		try {
			await resolveRefund.mutateAsync({
				orderId: id,
				decision,
				note: message.trim() || void 0
			});
			setSettledAs(decision === "approve" ? "approved" : "declined");
			setMessage("");
		} catch {}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-5 w-5 text-primary" }),
						isZh ? "这次预约的沟通" : "Messages about this booking",
						id > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							"data-inspector-source": "components/booking/BookingThreadDialog.tsx:88:24:04d7b0b2081d5bb408bef30236c7f567fd00a2d3e9753349ebc47a63a2b4e7e4:1",
							className: "text-sm font-normal text-muted-foreground",
							children: ["#", id]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: counterpartName ? isZh ? `与 ${counterpartName} 就这笔预约的沟通、问题反馈与退款处理。` : `Messages, issues and refunds for this booking with ${counterpartName}.` : isZh ? "就这笔预约反馈问题、查看退款处理进度。" : "Report an issue or follow the refund decision for this booking." })] }),
				effectiveRefundStatus && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/booking/BookingThreadDialog.tsx:102:11:ffca8e3407de7ee18191f66e8acdcad52fafc6cbc3eebcbe2525740f40a29ef4:1",
					className: "rounded-lg border border-border/60 bg-muted/40 p-3 space-y-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/booking/BookingThreadDialog.tsx:103:13:91b195b00bd14bc939d799cb7af282c07a3fd16f9bcf3d5fbe0436cafb0a8e54:1",
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-source": "components/booking/BookingThreadDialog.tsx:104:15:f1a503e91de4b3fcfeb3c83b2d1536a0924574b8dd90769b762d2e9a430d4e19:1",
								className: "text-sm font-semibold text-foreground",
								children: isZh ? "退款申请" : "Refund request"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: effectiveRefundStatus === "approved" ? "default" : effectiveRefundStatus === "declined" ? "destructive" : "secondary",
								children: effectiveRefundStatus === "approved" ? isZh ? "已退款" : "Refunded" : effectiveRefundStatus === "declined" ? isZh ? "已拒绝" : "Declined" : isZh ? "待处理" : "Awaiting decision"
							})]
						}),
						!!Number(refundAmount) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							"data-inspector-source": "components/booking/BookingThreadDialog.tsx:120:15:5d90bae0884f04da9ca0ed51e4224705403f46d35be88ee28e9517d5a5cacb5a:1",
							className: "text-sm text-muted-foreground",
							children: [
								isZh ? "金额" : "Amount",
								": ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									"data-inspector-source": "components/booking/BookingThreadDialog.tsx:121:43:9df6207e51dd0c27e0ea9a6c111916e213a986e3479f093aa2ceedcbbfe0aaab:1",
									className: "font-medium text-foreground",
									children: [currency, Number(refundAmount).toFixed(2)]
								})
							]
						}),
						!!refundReason && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "components/booking/BookingThreadDialog.tsx:124:32:7b67fc4888945dbb10e47fb83134261abb886ebe5b98c552d9aa508f0ba6bece:1",
							className: "text-sm text-muted-foreground",
							children: refundReason
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "components/booking/BookingThreadDialog.tsx:128:9:621cdef281426c2550d5ffd7b7191537419c27032c1b9411f907d2d821133a87:1",
					className: "max-h-64 overflow-y-auto space-y-2 pr-1",
					children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "components/booking/BookingThreadDialog.tsx:130:13:8bef58aa6de91bd75c3f45c022563fae93fed7edc10ac751ff711fe3adc422d4:1",
						className: "flex justify-center py-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-muted-foreground" })
					}) : notes?.length ? notes.map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/booking/BookingThreadDialog.tsx:135:15:64d1454074a3a950e85dd4cd0ea6f24c2a7e0d00ff98264be98f13dc9b8940f3:1",
						className: "rounded-lg border border-border/50 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "components/booking/BookingThreadDialog.tsx:136:17:064b70625c4bb23fc36cd33fc60ab8384a816e4332cdea9d799446f583fc6be1:1",
							className: "text-sm text-foreground whitespace-pre-wrap",
							children: note.note
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "components/booking/BookingThreadDialog.tsx:137:17:1ba736aae822138a4f8a0eebee709e7d9e37134e05cd387de6b48a215ec26bd3:1",
							className: "text-xs text-muted-foreground mt-1",
							children: formatDateTime(note.date_created, i18n.language)
						})]
					}, note.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/booking/BookingThreadDialog.tsx:143:13:6158499d5bc29612d60ff6eccb239c5f801f25fb7053360d401723e3a1523e0f:1",
						className: "text-sm text-muted-foreground py-4 text-center",
						children: isZh ? "还没有消息，写下第一条吧。" : "No messages yet — write the first one."
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/booking/BookingThreadDialog.tsx:151:9:a9929ebdeed0219092c2fcd37f2f2e7dc244c8e4e2f4be9fa5f3c342ed4ae6f9:1",
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: message,
						onChange: (e) => setMessage(e.target.value),
						rows: 3,
						placeholder: openRefund && role === "provider" ? isZh ? "给客户的说明（可选）" : "Optional note to the client" : isZh ? "写下您的问题或说明..." : "Describe the issue or add a note..."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/booking/BookingThreadDialog.tsx:162:11:3bf512fd4841cbe0e9c752df9123907829c63a87bad63cc8f3c7dbb249ce54a5:1",
						className: "flex flex-wrap gap-2 justify-end",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: () => send(),
							disabled: addNote.isPending || !message.trim(),
							children: [addNote.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4 mr-2" }), isZh ? "发送" : "Send"]
						}), role === "provider" && openRefund && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							className: "text-destructive",
							onClick: () => settle("decline"),
							disabled: resolveRefund.isPending,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4 mr-2" }), isZh ? "拒绝退款" : "Decline refund"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "coral",
							onClick: () => settle("approve"),
							disabled: resolveRefund.isPending,
							children: [resolveRefund.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4 mr-2" }), isZh ? "同意并退款" : "Approve refund"]
						})] })]
					})]
				})
			]
		})
	});
}
//#endregion
export { BookingThreadDialog as t };
