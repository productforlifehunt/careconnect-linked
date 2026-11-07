import { s as __toESM } from "../_runtime.mjs";
import { n as __name$1 } from "./rolldown-runtime-CNktS9qV.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { t as Badge } from "./badge-B2YCAhUo.mjs";
import { t as Input } from "./input-4rcasKp7.mjs";
import { t as Textarea } from "./textarea-ZNemOC_7.mjs";
import { r as formatTime, t as formatDate } from "./locale-DKwjQju2.mjs";
import { C as Tag, Cn as CircleX, En as CircleCheck, G as Search, Gn as Bell, Pn as Check, St as MessageSquare, Ut as Inbox, W as Send, Zn as ArrowLeft, c as Users, ct as Phone, d as UserPlus, dn as DollarSign, it as Plus, jt as LoaderCircle, ln as EllipsisVertical, mt as Paperclip, n as X, nn as FileText, o as Video, on as ExternalLink, vn as Clock } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-C88F3k7U.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { r as useSite } from "./SiteContext-Br0kF93Q.mjs";
import { s as createServiceProduct } from "./woocommerce-api-BoF1FQHg.mjs";
import { Bn as useStartConversation, Kt as useInboxCounts, Mn as useSearchProfiles, Pn as useSendMessage, U as useConversations, an as useMarkAllNotificationsRead, dt as useDeclineInvitation, gn as useNotifications, kt as useDirectMessages, m as useAcceptInvitation, mn as useMyProfile, on as useMarkMessagesRead, pn as useMyPendingInvitations, sn as useMarkNotificationRead } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-HRlnwchH.mjs";
import { n as uploadWPMedia } from "./wp-media-DqMZc2j7.mjs";
import { i as useNavigate$1, o as useSearchParams, r as useLocation$1 } from "./router-compat-CRbRSfhz.mjs";
import { t as Skeleton } from "./skeleton-BRV0UAw9.mjs";
import { n as useAddToCart } from "./use-cart-B3rnJV3i.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Inbox-CIgavLPB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Real attachment picker: opens the device's photo library / files chooser
* (camera on phones), uploads to the WordPress media library and hands back a
* usable URL. No URL typing — caregivers are not expected to know what a URL is.
*/
function MessageAttachment({ onAttach, disabled }) {
	const { toast } = useToast();
	const { i18n } = useTranslation();
	const isCN = i18n.language?.startsWith("zh");
	const Z = (cn, en) => isCN ? cn : en;
	const inputRef = (0, import_react.useRef)(null);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const handleFiles = async (files) => {
		const file = files?.[0];
		if (!file) return;
		setUploading(true);
		try {
			const media = await uploadWPMedia(file);
			onAttach(media.url, media.isImage ? "image" : "file", media.name || file.name);
		} catch {
			toast({
				title: Z("没能添加这个文件", "Couldn't add that file"),
				description: Z("请再试一次，或选择小一点的照片。", "Please try again, or pick a smaller photo."),
				variant: "destructive"
			});
		} finally {
			setUploading(false);
			if (inputRef.current) inputRef.current.value = "";
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		"data-inspector-id": "components/messages/MessageAttachment/MessageAttachment/Button/0",
		"data-inspector-source": "components/messages/MessageAttachment.tsx:47:7:647d41609c8dfe04374d35bc6d4e9599509ddf62956a52fa12a782ad99482c03:1",
		type: "button",
		variant: "ghost",
		size: "icon",
		className: "min-h-11 min-w-11 shrink-0",
		disabled: disabled || uploading,
		title: Z("添加照片或文件", "Add a photo or file"),
		"aria-label": Z("添加照片或文件", "Add a photo or file"),
		onClick: () => inputRef.current?.click(),
		children: uploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
			"data-inspector-id": "components/messages/MessageAttachment/MessageAttachment/Loader2/0",
			"data-inspector-source": "components/messages/MessageAttachment.tsx:57:22:d8312a23b23b0518634d4a79b8a63ff1bcc1f54d34d7c5cfdc5c8c991bb93aaf:1",
			className: "h-4 w-4 animate-spin"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, {
			"data-inspector-id": "components/messages/MessageAttachment/MessageAttachment/Paperclip/0",
			"data-inspector-source": "components/messages/MessageAttachment.tsx:57:69:d8312a23b23b0518634d4a79b8a63ff1bcc1f54d34d7c5cfdc5c8c991bb93aaf:1",
			className: "h-4 w-4"
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		"data-inspector-id": "components/messages/MessageAttachment/MessageAttachment/input/0",
		"data-inspector-source": "components/messages/MessageAttachment.tsx:59:7:45d120ecc57c929d22196f6f1415f1d19eda1bb92081cf8489845578b143cd2b:1",
		ref: inputRef,
		type: "file",
		accept: "image/*,application/pdf,.doc,.docx,.txt",
		className: "hidden",
		onChange: (e) => handleFiles(e.target.files)
	})] });
}
var OPEN = "[QUOTE]";
var CLOSE = "[/QUOTE]";
function encodeQuote(q, locale) {
	const json = JSON.stringify(q);
	const zh = (locale || (typeof navigator !== "undefined" ? navigator.language : "")).startsWith("zh");
	const c = zh ? "¥" : "$";
	return `${OPEN}${json}${CLOSE}\n${zh ? q.mode === "hourly" ? `💬 报价：${c}${q.ratePerHour}/小时 × ${q.hours}小时 = ${c}${q.amount}${q.serviceType ? `（${q.serviceType}）` : ""}` : `💬 报价：${c}${q.amount} 一次性${q.serviceType ? `（${q.serviceType}）` : ""}${q.note ? ` — ${q.note}` : ""}` : q.mode === "hourly" ? `💬 Quote: ${c}${q.ratePerHour}/hr × ${q.hours}h = ${c}${q.amount}${q.serviceType ? ` for ${q.serviceType}` : ""}` : `💬 Quote: ${c}${q.amount} flat${q.serviceType ? ` for ${q.serviceType}` : ""}${q.note ? ` — ${q.note}` : ""}`}`;
}
function extractQuote(content) {
	if (!content) return null;
	const start = content.indexOf(OPEN);
	if (start < 0) return null;
	const end = content.indexOf(CLOSE, start + 7);
	if (end < 0) return null;
	const raw = content.slice(start + 7, end);
	try {
		const parsed = JSON.parse(raw);
		if (parsed && typeof parsed === "object" && "amount" in parsed && "mode" in parsed) return parsed;
	} catch {}
	return null;
}
/** Strip the marker from a content string, leaving only the human-readable summary. */
function stripQuoteMarker(content) {
	const start = content.indexOf(OPEN);
	if (start < 0) return content;
	const end = content.indexOf(CLOSE, start + 7);
	if (end < 0) return content;
	return (content.slice(0, start) + content.slice(end + 8)).trim();
}
/**
* Create a hidden simple product priced at the agreed quote amount,
* owned by the vendor so Dokan commission applies.
* Returns the new product ID.
*/
async function createQuoteProduct(input) {
	const { quote, vendorUserId, buyerName, sellerName } = input;
	if (!quote.amount || quote.amount <= 0) throw new Error("Quote amount must be greater than 0");
	const label = quote.serviceType || (quote.mode === "hourly" ? "Care Service (hourly)" : "Care Service (flat)");
	const name = sellerName ? `Custom Quote: ${label} — ${sellerName}` : `Custom Quote: ${label}`;
	const description = quote.mode === "hourly" ? `Negotiated rate: $${quote.ratePerHour}/hr × ${quote.hours}h = $${quote.amount}${quote.note ? `. Note: ${quote.note}` : ""}` : `Flat-rate quote: $${quote.amount}${quote.note ? `. Note: ${quote.note}` : ""}`;
	const numericVendorId = String(vendorUserId).replace(/^wp-/, "");
	const meta = [
		{
			key: "_quote_mode",
			value: quote.mode
		},
		{
			key: "_quote_amount",
			value: String(quote.amount)
		},
		{
			key: "_dokan_vendor_id",
			value: numericVendorId
		},
		{
			key: "_is_quote_product",
			value: "1"
		}
	];
	if (quote.ratePerHour != null) meta.push({
		key: "_quote_rate",
		value: String(quote.ratePerHour)
	});
	if (quote.hours != null) meta.push({
		key: "_quote_hours",
		value: String(quote.hours)
	});
	if (quote.serviceType) meta.push({
		key: "_quote_service_type",
		value: quote.serviceType
	});
	if (quote.delivery) meta.push({
		key: "_quote_delivery",
		value: quote.delivery
	});
	if (quote.jobId != null) meta.push({
		key: "_quote_job_id",
		value: String(quote.jobId)
	});
	if (buyerName) meta.push({
		key: "_quote_buyer",
		value: buyerName
	});
	return createServiceProduct({
		name,
		description,
		amount: quote.amount,
		vendorUserId: numericVendorId,
		meta
	});
}
function QuoteCard({ quote, isRecipient, isMe, conversationId, otherUserId }) {
	const { toast } = useToast();
	const { i18n } = useTranslation();
	const isZh = i18n.language?.startsWith("zh");
	const Z = (cn, en) => isZh ? cn : en;
	const navigate = useNavigate$1();
	const currency = isZh ? "¥" : "$";
	const addToCart = useAddToCart();
	const sendMessage = useSendMessage();
	const [accepting, setAccepting] = (0, import_react.useState)(false);
	const [declining, setDeclining] = (0, import_react.useState)(false);
	const status = quote.status || "pending";
	const statusLabel = (s) => s === "accepted" ? Z("已接受", "accepted") : s === "paid" ? Z("已付款", "paid") : s === "declined" ? Z("已拒绝", "declined") : Z("待回应", "pending");
	const handleAccept = async () => {
		if (!quote.vendorUserId) {
			toast({
				title: Z("无法接受", "Cannot accept"),
				description: Z("报价缺少卖家信息。", "Quote is missing seller info."),
				variant: "destructive"
			});
			return;
		}
		setAccepting(true);
		try {
			const { id: productId } = await createQuoteProduct({
				quote,
				vendorUserId: quote.vendorUserId
			});
			await addToCart.mutateAsync({ productId });
			toast({
				title: Z("已加入购物车", "Added to cart"),
				description: Z(`${currency}${quote.amount} 的报价已准备结账。`, `Quote of ${currency}${quote.amount} ready to checkout.`)
			});
			navigate("/cart");
		} catch (e) {
			toast({
				title: Z("接受报价失败", "Failed to accept quote"),
				description: e?.message || Z("请重试。", "Please try again."),
				variant: "destructive"
			});
		} finally {
			setAccepting(false);
		}
	};
	const handleDecline = async () => {
		if (!conversationId || !otherUserId) {
			toast({
				title: Z("无法拒绝", "Cannot decline"),
				description: Z("缺少对话上下文。", "Missing conversation context."),
				variant: "destructive"
			});
			return;
		}
		setDeclining(true);
		try {
			const declined = {
				...quote,
				status: "declined"
			};
			await sendMessage.mutateAsync({
				conversationId,
				receiverUserId: otherUserId,
				content: encodeQuote(declined)
			});
			toast({
				title: Z("已拒绝报价", "Quote declined"),
				description: Z("已通知发送方。", "The sender has been notified.")
			});
		} catch (e) {
			toast({
				title: Z("拒绝失败", "Failed to decline"),
				description: e?.message || Z("请重试。", "Please try again."),
				variant: "destructive"
			});
		} finally {
			setDeclining(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "components/messages/QuoteCard/QuoteCard/div/0",
		"data-inspector-source": "components/messages/QuoteCard.tsx:95:5:87864ea657de9b8df04eee17f170dc074229b35a52d6b8e6ccf42a09e690dd2b:1",
		className: `max-w-[80%] rounded-2xl border-2 ${isMe ? "border-primary/40 bg-primary/5 ml-auto" : "border-coral/30 bg-card"} p-4 shadow-xs`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "components/messages/QuoteCard/QuoteCard/div/1",
				"data-inspector-source": "components/messages/QuoteCard.tsx:98:7:34047ae62b2829534b1bd952e6cac97212bf981ffbb97e400ba7998a9ab82e50:1",
				className: "flex items-center gap-2 mb-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-id": "components/messages/QuoteCard/QuoteCard/div/2",
						"data-inspector-source": "components/messages/QuoteCard.tsx:99:9:0cc26839d235e81356aac9d8a6e31b1d9a1d03719c6da1ccf4416466756ad6a3:1",
						className: "h-7 w-7 rounded-full bg-coral/15 flex items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {
							"data-inspector-id": "components/messages/QuoteCard/QuoteCard/Tag/0",
							"data-inspector-source": "components/messages/QuoteCard.tsx:100:11:df78d161f20aab7c7c08f40a277c1ba06061abc930eddd3ea88a5cbda2295668:1",
							className: "h-3.5 w-3.5 text-coral"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-inspector-id": "components/messages/QuoteCard/QuoteCard/span/0",
						"data-inspector-source": "components/messages/QuoteCard.tsx:102:9:01a5d570dfd9bb25d441a03c0f9a64583b2b40db3b918e611de7556d2304a320:1",
						className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
						children: Z("价格报价", "Price Quote")
					}),
					status !== "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						"data-inspector-id": "components/messages/QuoteCard/QuoteCard/Badge/0",
						"data-inspector-source": "components/messages/QuoteCard.tsx:106:11:eec5b11d29e4a9a66312552e3e854e5ec53defc33aec906fdd0d9996529721df:1",
						variant: status === "accepted" || status === "paid" ? "default" : "secondary",
						className: "ml-auto text-[10px]",
						children: statusLabel(status)
					})
				]
			}),
			quote.serviceType && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-id": "components/messages/QuoteCard/QuoteCard/p/0",
				"data-inspector-source": "components/messages/QuoteCard.tsx:113:9:9194be6a50a302f81e0e3204cadc62f67c5bb319e3be5305977b7b1d94600fb9:1",
				className: "text-sm font-medium text-foreground mb-1",
				children: quote.serviceType
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "components/messages/QuoteCard/QuoteCard/div/3",
				"data-inspector-source": "components/messages/QuoteCard.tsx:116:7:1e5bd314a617501a07cc0ba1c29beb1d4b27cadd8cbd71766e16de289fee3f02:1",
				className: "flex items-baseline gap-1 mb-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-inspector-id": "components/messages/QuoteCard/QuoteCard/span/1",
						"data-inspector-source": "components/messages/QuoteCard.tsx:117:9:36932a5cf7fb5c90949f6292ecbd9d1c35a8ff97c665520ee043a64b52afd981:1",
						className: "text-3xl font-bold text-foreground",
						children: [currency, quote.amount]
					}),
					quote.mode === "hourly" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-inspector-id": "components/messages/QuoteCard/QuoteCard/span/2",
						"data-inspector-source": "components/messages/QuoteCard.tsx:119:11:2a21361b2ad8c220890753104aeee45bd15f20ef433fdbb4cef9d7e63df688b2:1",
						className: "text-xs text-muted-foreground",
						children: [
							"(",
							quote.ratePerHour,
							"/",
							Z("小时", "hr"),
							" × ",
							quote.hours,
							Z("小时", "h"),
							")"
						]
					}),
					quote.mode === "flat" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-inspector-id": "components/messages/QuoteCard/QuoteCard/span/3",
						"data-inspector-source": "components/messages/QuoteCard.tsx:124:11:30fb709adb24743ea706a8458c5e604e552b95df8848a1baac0970b22545beed:1",
						className: "text-xs text-muted-foreground",
						children: Z("一口价", "flat rate")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "components/messages/QuoteCard/QuoteCard/div/4",
				"data-inspector-source": "components/messages/QuoteCard.tsx:128:7:f62d8b83142fed840fbfb1b647a1fcda448ed32885bf6d482f1fcc30985901e1:1",
				className: "flex items-center gap-1.5 text-xs text-muted-foreground mb-3",
				children: [quote.mode === "hourly" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
					"data-inspector-id": "components/messages/QuoteCard/QuoteCard/Clock/0",
					"data-inspector-source": "components/messages/QuoteCard.tsx:130:11:8a73f07854303e429b5a7c64beb12049394f2bbf2c16c8d1dfc48db8fbd91a73:1",
					className: "h-3 w-3"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, {
					"data-inspector-id": "components/messages/QuoteCard/QuoteCard/DollarSign/0",
					"data-inspector-source": "components/messages/QuoteCard.tsx:132:11:94d648ad2315b71339881e1762dc84e117ca61e5e10f0b9bd3fadc2f4b0cc703:1",
					className: "h-3 w-3"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"data-inspector-id": "components/messages/QuoteCard/QuoteCard/span/4",
					"data-inspector-source": "components/messages/QuoteCard.tsx:134:9:63a917ee66c1e84ec83da862581bbb5d92c9a966bacf646779cfb3055eb6cb66:1",
					children: quote.mode === "hourly" ? Z("按小时计费", "Hourly billing") : Z("一次性支付", "One-time payment")
				})]
			}),
			quote.note && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				"data-inspector-id": "components/messages/QuoteCard/QuoteCard/p/1",
				"data-inspector-source": "components/messages/QuoteCard.tsx:138:9:00b53ef2caacf3317a8e52d35f24fbcb04164c8e67fba706ac24b0a8bd02b658:1",
				className: "text-xs text-muted-foreground italic border-l-2 border-muted pl-2 mb-3",
				children: [
					"\"",
					quote.note,
					"\""
				]
			}),
			status === "pending" && isRecipient && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "components/messages/QuoteCard/QuoteCard/div/5",
				"data-inspector-source": "components/messages/QuoteCard.tsx:144:9:13fca74284b835632785c8e98256cdd19613cc852967f8d8b57b1bcf256aa4d2:1",
				className: "flex gap-2 pt-2 border-t",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					"data-inspector-id": "components/messages/QuoteCard/QuoteCard/Button/0",
					"data-inspector-source": "components/messages/QuoteCard.tsx:145:11:47da7afe0ed7722377b8ff6b7acd0c92a749325efdb93d76a13647f443d0fa2f:1",
					variant: "coral",
					size: "sm",
					className: "flex-1",
					disabled: accepting || addToCart.isPending || declining,
					onClick: handleAccept,
					children: accepting || addToCart.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							"data-inspector-id": "components/messages/QuoteCard/QuoteCard/Loader2/0",
							"data-inspector-source": "components/messages/QuoteCard.tsx:154:17:c46d2d06d665537156d139d038d1a8326db3531c08cfe6728efd600a867d1c69:1",
							className: "h-3.5 w-3.5 mr-1 animate-spin"
						}),
						" ",
						Z("处理中…", "Processing…")
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
							"data-inspector-id": "components/messages/QuoteCard/QuoteCard/CheckCircle2/0",
							"data-inspector-source": "components/messages/QuoteCard.tsx:158:17:a55dad04791613afe959ff5e242ce433892f6fe013b9168a040e6e42a4313f09:1",
							className: "h-3.5 w-3.5 mr-1"
						}),
						" ",
						Z("接受并支付", "Accept & Pay"),
						" ",
						currency,
						quote.amount
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					"data-inspector-id": "components/messages/QuoteCard/QuoteCard/Button/1",
					"data-inspector-source": "components/messages/QuoteCard.tsx:162:11:47da7afe0ed7722377b8ff6b7acd0c92a749325efdb93d76a13647f443d0fa2f:1",
					variant: "outline",
					size: "sm",
					disabled: accepting || declining,
					onClick: handleDecline,
					children: declining ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						"data-inspector-id": "components/messages/QuoteCard/QuoteCard/Loader2/1",
						"data-inspector-source": "components/messages/QuoteCard.tsx:169:15:016b0d2bbcaaf6e56edd11cee4ae68c9e754ccdb6be4e2b7ae16d7dc6f8b47e1:1",
						className: "h-3.5 w-3.5 animate-spin"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, {
							"data-inspector-id": "components/messages/QuoteCard/QuoteCard/XCircle/0",
							"data-inspector-source": "components/messages/QuoteCard.tsx:172:17:e9ca28ed5468421fd565e92b5f0402b92199fabb609916b723ea0157af78a9ed:1",
							className: "h-3.5 w-3.5 mr-1"
						}),
						" ",
						Z("拒绝", "Decline")
					] })
				})]
			}),
			status === "pending" && isMe && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-id": "components/messages/QuoteCard/QuoteCard/p/2",
				"data-inspector-source": "components/messages/QuoteCard.tsx:180:9:b6b527213eec35190d429777ded8bcb6f23241d11f5a1efe9a8d262a02d6ec5f:1",
				className: "text-xs text-muted-foreground italic pt-2 border-t",
				children: Z("等待对方回应…", "Awaiting acceptance…")
			}),
			(status === "accepted" || status === "paid") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "components/messages/QuoteCard/QuoteCard/div/6",
				"data-inspector-source": "components/messages/QuoteCard.tsx:186:9:a3648905e79cec84e7f7f84c54218cf2d8f90abb9dafc9be513fe25c8cd721bb:1",
				className: "flex items-center gap-1.5 text-xs text-success pt-2 border-t",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
					"data-inspector-id": "components/messages/QuoteCard/QuoteCard/CheckCircle2/1",
					"data-inspector-source": "components/messages/QuoteCard.tsx:187:11:429a60fb7b6ccadd1c494693a3b0a084ad63f0464dc705d26666b9ed94d31d60:1",
					className: "h-3.5 w-3.5"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"data-inspector-id": "components/messages/QuoteCard/QuoteCard/span/5",
					"data-inspector-source": "components/messages/QuoteCard.tsx:188:11:2d6d0f9370cc536ea730ec23531ddd2f5dbb4bbfaa13c68c99dfb799ba19f3e9:1",
					children: Z(`报价${statusLabel(status)}`, `Quote ${status}`)
				})]
			}),
			status === "declined" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "components/messages/QuoteCard/QuoteCard/div/7",
				"data-inspector-source": "components/messages/QuoteCard.tsx:193:9:d07e1434e876214bfd5433baa01ac5ed407131f8eb08e65044c3d674933ba8bf:1",
				className: "flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, {
					"data-inspector-id": "components/messages/QuoteCard/QuoteCard/XCircle/1",
					"data-inspector-source": "components/messages/QuoteCard.tsx:194:11:1e4656c2a92dbf518e6be2b5a675838af59d3f205c834c5fa2e1e4235e876b4e:1",
					className: "h-3.5 w-3.5"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"data-inspector-id": "components/messages/QuoteCard/QuoteCard/span/6",
					"data-inspector-source": "components/messages/QuoteCard.tsx:195:11:5a74f9a76d82f2664edad2346ce51bd558b152bd0b3a1038bc43618d9a9a4bb9:1",
					children: Z("报价已拒绝", "Quote declined")
				})]
			})
		]
	});
}
function MessageBubble({ message, isMe, conversationId, otherUserId }) {
	const { i18n } = useTranslation();
	const isCN = i18n.language?.startsWith("zh");
	const rawContent = message.message_content || message.content || "";
	const quote = extractQuote(rawContent);
	if (quote) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-inspector-id": "components/messages/MessageBubble/MessageBubble/div/0",
		"data-inspector-source": "components/messages/MessageBubble.tsx:23:7:f24982d4486d331edb9e8137b922db63385af6c40a8b41ebd2b8b3ade740f86c:1",
		className: `flex ${isMe ? "justify-end" : "justify-start"}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteCard, {
			"data-inspector-id": "components/messages/MessageBubble/MessageBubble/QuoteCard/0",
			"data-inspector-source": "components/messages/MessageBubble.tsx:24:9:3c0ca39b57ed21032a767cc5120743cacfdf9853b6fca5fd364e7af8540c5414:1",
			quote,
			isMe,
			isRecipient: !isMe,
			conversationId,
			otherUserId
		})
	});
	const bodyText = stripQuoteMarker(rawContent);
	const urlLine = (bodyText.match(/https?:\/\/\S+$/m) || [])[0] || "";
	const attachmentUrl = message.attachment_url || urlLine || "";
	const hasAttachment = !!attachmentUrl;
	const isImage = message.message_type === "image" || hasAttachment && /\.(jpg|jpeg|png|gif|webp|svg|heic)(\?|$)/i.test(attachmentUrl);
	const textContent = urlLine ? bodyText.replace(urlLine, "").trim() : bodyText;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-inspector-id": "components/messages/MessageBubble/MessageBubble/div/1",
		"data-inspector-source": "components/messages/MessageBubble.tsx:48:5:e22f2efd04b0a393698663e1331910b43e40de9aee3b8761a2c92f05044025cc:1",
		className: `flex ${isMe ? "justify-end" : "justify-start"}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-id": "components/messages/MessageBubble/MessageBubble/div/2",
			"data-inspector-source": "components/messages/MessageBubble.tsx:49:7:1dc09556720dfce550ab24d2290796c3dbacf9f00337ff150867e2045fc73368:1",
			className: `max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? "hero-gradient text-primary-foreground rounded-br-md" : "bg-card border rounded-bl-md text-foreground"}`,
			children: [
				hasAttachment && isImage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					"data-inspector-id": "components/messages/MessageBubble/MessageBubble/a/0",
					"data-inspector-source": "components/messages/MessageBubble.tsx:52:11:5d815aa3d744ecee3606e9b043652f78ad9a293417528453f61be135981a252e:1",
					href: attachmentUrl,
					target: "_blank",
					rel: "noopener noreferrer",
					className: "block mb-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						"data-inspector-id": "components/messages/MessageBubble/MessageBubble/img/0",
						"data-inspector-source": "components/messages/MessageBubble.tsx:53:13:2350999baf3b5e49e044bc077a944fe161bfc29a136bfa2d350fab1febb1b441:1",
						src: attachmentUrl,
						alt: isCN ? "分享的图片" : "Shared image",
						className: "rounded-lg max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity",
						onError: (e) => {
							e.target.style.display = "none";
						}
					})
				}),
				hasAttachment && !isImage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					"data-inspector-id": "components/messages/MessageBubble/MessageBubble/a/1",
					"data-inspector-source": "components/messages/MessageBubble.tsx:62:11:550ee99611b35282e1549cd008b9047615f090dcc6aa337b41e42c91aa30bc28:1",
					href: attachmentUrl,
					target: "_blank",
					rel: "noopener noreferrer",
					className: `flex items-center gap-2 p-2 rounded-lg mb-1 ${isMe ? "bg-primary-foreground/10" : "bg-muted"} hover:opacity-80 transition-opacity`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
							"data-inspector-id": "components/messages/MessageBubble/MessageBubble/FileText/0",
							"data-inspector-source": "components/messages/MessageBubble.tsx:68:13:b86531407f3b3f61e93ed3e4ea5dc110a223ab407d1f2dd7bbb521c7dae9a5a4:1",
							className: "h-4 w-4 shrink-0"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-id": "components/messages/MessageBubble/MessageBubble/span/0",
							"data-inspector-source": "components/messages/MessageBubble.tsx:69:13:875c3891e5bbe22e0e86994eafd3d090d75366c04e7ad9d5be45f3ff8960700a:1",
							className: "text-xs truncate flex-1",
							children: decodeURIComponent(attachmentUrl.split("/").pop() || "") || (isCN ? "文件" : "File")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
							"data-inspector-id": "components/messages/MessageBubble/MessageBubble/ExternalLink/0",
							"data-inspector-source": "components/messages/MessageBubble.tsx:72:13:eb42a1825133374e29f1dab79adc8443c2132f948dc4049eab73a6e57f97356c:1",
							className: "h-3 w-3 shrink-0"
						})
					]
				}),
				textContent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-id": "components/messages/MessageBubble/MessageBubble/p/0",
					"data-inspector-source": "components/messages/MessageBubble.tsx:78:11:a93be288a90643366ad67795a5e2c585a2662f5eb4b71e291c818551ad6c204e:1",
					className: "text-sm whitespace-pre-wrap",
					children: textContent
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-id": "components/messages/MessageBubble/MessageBubble/p/1",
					"data-inspector-source": "components/messages/MessageBubble.tsx:80:9:063ca25bc98f1c97e50c298e7f371efecc5eb9237910f9cc2e0650a3de35325b:1",
					className: `text-xs mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`,
					children: formatTime(message.created_at, i18n.language, {
						hour: "numeric",
						minute: "2-digit"
					})
				})
			]
		})
	});
}
function QuoteDialog({ open, onOpenChange, defaultServiceType, defaultRatePerHour, jobId, vendorUserId, onSend, submitting }) {
	const { i18n } = useTranslation();
	const isCN = i18n.language?.startsWith("zh");
	const Z = (cn, en) => isCN ? cn : en;
	const currency = isCN ? "¥" : "$";
	const [mode, setMode] = (0, import_react.useState)("hourly");
	const [rate, setRate] = (0, import_react.useState)(defaultRatePerHour ? String(defaultRatePerHour) : "");
	const [hours, setHours] = (0, import_react.useState)("2");
	const [flatAmount, setFlatAmount] = (0, import_react.useState)("");
	const [serviceType, setServiceType] = (0, import_react.useState)(defaultServiceType || "");
	const [note, setNote] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (open) {
			setRate(defaultRatePerHour ? String(defaultRatePerHour) : "");
			setHours("2");
			setFlatAmount("");
			setServiceType(defaultServiceType || "");
			setNote("");
			setMode("hourly");
		}
	}, [
		open,
		defaultRatePerHour,
		defaultServiceType
	]);
	const computedAmount = mode === "hourly" ? (parseFloat(rate) || 0) * (parseFloat(hours) || 0) : parseFloat(flatAmount) || 0;
	const canSend = computedAmount > 0 && !submitting;
	const handleSend = async () => {
		if (!canSend) return;
		await onSend({
			mode,
			amount: Math.round(computedAmount * 100) / 100,
			ratePerHour: mode === "hourly" ? parseFloat(rate) || 0 : void 0,
			hours: mode === "hourly" ? parseFloat(hours) || 0 : void 0,
			serviceType: serviceType || void 0,
			note: note || void 0,
			jobId,
			status: "pending",
			vendorUserId,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/Dialog/0",
		"data-inspector-source": "components/messages/QuoteDialog.tsx:86:5:1ccf9e54b65e83e6b93d88e4615c4822c95bb446b111e5596f76ba65c22d896c:1",
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/DialogContent/0",
			"data-inspector-source": "components/messages/QuoteDialog.tsx:87:7:3a08db13c986716e30547467139520b667bcdaca5b2ec791c296a8088d44272a:1",
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
					"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/DialogHeader/0",
					"data-inspector-source": "components/messages/QuoteDialog.tsx:88:9:9db98273150bc559dca8500eeb3053480fe8643d6606b91f256a7e3158c9d513:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/DialogTitle/0",
						"data-inspector-source": "components/messages/QuoteDialog.tsx:89:11:d62cce55c85b6343db574339c7baff2db8b811ca1407b2b84bcfe647ca20b1a2:1",
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {
								"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/Tag/0",
								"data-inspector-source": "components/messages/QuoteDialog.tsx:90:13:96b807b0dc502535ce3b94cc088eee3e941e072ae08881c38a75a30962a09080:1",
								className: "h-5 w-5 text-primary"
							}),
							" ",
							Z("发送报价", "Send a Price Quote")
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
						"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/DialogDescription/0",
						"data-inspector-source": "components/messages/QuoteDialog.tsx:92:11:d1ee46d754524a8c5cb9b8ae098712ed4d9dd9a0721ad0df3500e87ba3d0d985:1",
						children: Z("对方可一键查看并接受、付款。", "The other side can review and one-tap accept & pay.")
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
					"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/Tabs/0",
					"data-inspector-source": "components/messages/QuoteDialog.tsx:97:9:421db138a65c0cb7e85a669af8c3bf5596794c0a4bac1d31ec50dcd217014886:1",
					value: mode,
					onValueChange: (v) => setMode(v),
					className: "mt-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
							"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/TabsList/0",
							"data-inspector-source": "components/messages/QuoteDialog.tsx:98:11:68f96e705c6054bdb1af30cad735d566b28ab751b811579c5fd4201014d1dc82:1",
							className: "grid w-full grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/TabsTrigger/0",
								"data-inspector-source": "components/messages/QuoteDialog.tsx:99:13:c6948c72c83c3f97b973f803f931fbd7ffc8e3d767c9804a37f955ed5275742d:1",
								value: "hourly",
								className: "gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
										"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/Clock/0",
										"data-inspector-source": "components/messages/QuoteDialog.tsx:100:15:d63a0552b6e416a072c8a7048eb6682558bf0e9bd761bbd83882ab0478746cd4:1",
										className: "h-3.5 w-3.5"
									}),
									" ",
									Z("按小时", "Hourly")
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/TabsTrigger/1",
								"data-inspector-source": "components/messages/QuoteDialog.tsx:102:13:716fb36bc0496f050342c9a75300fe2bc54e6640ae4a702b03939680075331ad:1",
								value: "flat",
								className: "gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, {
										"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/DollarSign/0",
										"data-inspector-source": "components/messages/QuoteDialog.tsx:103:15:ff0e532f79422755528769b0deffd0a52f45fb1eb98d6647514c1b203428c67b:1",
										className: "h-3.5 w-3.5"
									}),
									" ",
									Z("一口价", "Flat Price")
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/TabsContent/0",
							"data-inspector-source": "components/messages/QuoteDialog.tsx:107:11:fcc11988374904ba61173b1a1f748a5fe9ab1aa386a0e66d99882826698263f9:1",
							value: "hourly",
							className: "space-y-3 mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/div/0",
								"data-inspector-source": "components/messages/QuoteDialog.tsx:108:13:37078065acf0e00bda900d47a69b1df85a33458fc30b9f78a703de0c2b5b767c:1",
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/div/1",
									"data-inspector-source": "components/messages/QuoteDialog.tsx:109:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/Label/0",
										"data-inspector-source": "components/messages/QuoteDialog.tsx:110:17:6b79cbdf324cb7e8f0852d4bf8183ea4da8af20dee1b78a6a4d0e9067230bb1e:1",
										className: "mb-1.5 block text-xs",
										children: Z(`每小时单价（${currency}）`, `Rate per hour (${currency})`)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/Input/0",
										"data-inspector-source": "components/messages/QuoteDialog.tsx:111:17:1b672057fcea09067ce1ce6e6cb5f341eea03edbf9b8a51780a399aa3c5ba37f:1",
										type: "number",
										min: "1",
										step: "1",
										value: rate,
										onChange: (e) => setRate(e.target.value),
										placeholder: "50"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/div/2",
									"data-inspector-source": "components/messages/QuoteDialog.tsx:120:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/Label/1",
										"data-inspector-source": "components/messages/QuoteDialog.tsx:121:17:60a4abb7bceda0f3f1052e6bcb9ee2ff0339790af0068627cf3eaf43f5d11c0e:1",
										className: "mb-1.5 block text-xs",
										children: Z("小时数", "Hours")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/Input/1",
										"data-inspector-source": "components/messages/QuoteDialog.tsx:122:17:1b672057fcea09067ce1ce6e6cb5f341eea03edbf9b8a51780a399aa3c5ba37f:1",
										type: "number",
										min: "0.5",
										step: "0.5",
										value: hours,
										onChange: (e) => setHours(e.target.value),
										placeholder: "2"
									})]
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/TabsContent/1",
							"data-inspector-source": "components/messages/QuoteDialog.tsx:134:11:ee662f8b39bfc3c4106dd9ee1c8ca82ce6f5f7f726b88aa8aba7624fbe8e835c:1",
							value: "flat",
							className: "space-y-3 mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/div/3",
								"data-inspector-source": "components/messages/QuoteDialog.tsx:135:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/Label/2",
										"data-inspector-source": "components/messages/QuoteDialog.tsx:136:15:1c9256635cff49123d02047fd1a900cd50445e7f73706da6295ae7944c146d48:1",
										className: "mb-1.5 block text-xs",
										children: Z(`总价（${currency}）`, `Total price (${currency})`)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/Input/2",
										"data-inspector-source": "components/messages/QuoteDialog.tsx:137:15:8f0eb9169b503119d96bda2e87c73c9ce55a4f3450055e53b86496e7ade91891:1",
										type: "number",
										min: "1",
										step: "1",
										value: flatAmount,
										onChange: (e) => setFlatAmount(e.target.value),
										placeholder: "200"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/p/0",
										"data-inspector-source": "components/messages/QuoteDialog.tsx:145:15:6c0a1513abf0393bb6cec2e8afbf23ee5c5fdefaecc636e8ffbb567960e9c419:1",
										className: "text-xs text-muted-foreground mt-1",
										children: Z("例如：过夜照护、一次性上门", "e.g. overnight care, one-time visit")
									})
								]
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/div/4",
					"data-inspector-source": "components/messages/QuoteDialog.tsx:152:9:359f964a2f5f9d1fffc392059bd44f47d42e38fc77af3ea2f1c2ffc88e83c015:1",
					className: "space-y-3 mt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/div/5",
						"data-inspector-source": "components/messages/QuoteDialog.tsx:153:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/Label/3",
							"data-inspector-source": "components/messages/QuoteDialog.tsx:154:13:3d521a2902ddf9ce61980ac5d29b334faae3786353fbcd2bd4275d1146b7dfe4:1",
							className: "mb-1.5 block text-xs",
							children: Z("服务描述（可选）", "Service description (optional)")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/Input/3",
							"data-inspector-source": "components/messages/QuoteDialog.tsx:155:13:f8dc2d8b298e828184f92f8f9e5eae0e54d3df44a3c49a90dfb735edcc2d1bc1:1",
							value: serviceType,
							onChange: (e) => setServiceType(e.target.value),
							placeholder: Z("例如：陪伴长者、过夜照护", "e.g. Elder companion, Overnight care")
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/div/6",
						"data-inspector-source": "components/messages/QuoteDialog.tsx:161:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/Label/4",
							"data-inspector-source": "components/messages/QuoteDialog.tsx:162:13:a178a07c72bf280f5c48772d6ba2e99aedf9d9008ca11d0ddcaf2f953331bb1a:1",
							className: "mb-1.5 block text-xs",
							children: Z("备注（可选）", "Note (optional)")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/Textarea/0",
							"data-inspector-source": "components/messages/QuoteDialog.tsx:163:13:0664b8337fa794f6160571cedab7a1e20789f1ba8665fc34e15fcbefe5796e9d:1",
							value: note,
							onChange: (e) => setNote(e.target.value),
							placeholder: Z("需要确认的细节……", "Any details to confirm…"),
							rows: 2
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/div/7",
					"data-inspector-source": "components/messages/QuoteDialog.tsx:172:9:9659d6e2f30cdde960f74fce9da1a49d0894b7322d33f6bf9d8b6022537cfd63:1",
					className: "flex items-center justify-between p-3 rounded-lg bg-accent mt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/span/0",
						"data-inspector-source": "components/messages/QuoteDialog.tsx:173:11:dad7f233313015dcdf86bfb04eddcaf0a3053e7c28dab262dacb5bf9018db9d0:1",
						className: "text-sm font-medium text-foreground",
						children: Z("合计", "Total")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/span/1",
						"data-inspector-source": "components/messages/QuoteDialog.tsx:174:11:f8058577eda82421b21dd5830e432573e13135cb235432539a5047859c1b4047:1",
						className: "text-2xl font-bold text-foreground",
						children: [currency, computedAmount.toFixed(2)]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					"data-inspector-id": "components/messages/QuoteDialog/QuoteDialog/Button/0",
					"data-inspector-source": "components/messages/QuoteDialog.tsx:179:9:2cbf2afe1b54a91992d854285721d994fd9ad62c98cef20b40ccfc2ba0f045a3:1",
					variant: "coral",
					className: "w-full mt-2",
					disabled: !canSend,
					onClick: handleSend,
					children: submitting ? Z("发送中……", "Sending…") : Z("发送报价", "Send Quote")
				})
			]
		})
	});
}
function Messages({ embedded = false, readFilter = "all" } = {}) {
	const Heading = embedded ? "h2" : "h1";
	const { t, i18n } = useTranslation();
	const isCN = i18n.language?.startsWith("zh");
	const Z = (cn, en) => isCN ? cn : en;
	const { toast } = useToast();
	const { data: profile } = useMyProfile();
	const location = useLocation$1();
	const qc = useQueryClient();
	const { data: conversations, isLoading: convosLoading } = useConversations();
	const sendMessage = useSendMessage();
	const startConversation = useStartConversation();
	const markRead = useMarkMessagesRead();
	const [selectedConvoId, setSelectedConvoId] = (0, import_react.useState)(null);
	const [selectedOtherUser, setSelectedOtherUser] = (0, import_react.useState)(null);
	const [newMessage, setNewMessage] = (0, import_react.useState)("");
	const [pendingAttachment, setPendingAttachment] = (0, import_react.useState)(null);
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [dragOver, setDragOver] = (0, import_react.useState)(false);
	const [newConvoOpen, setNewConvoOpen] = (0, import_react.useState)(false);
	const [newConvoSearch, setNewConvoSearch] = (0, import_react.useState)("");
	const [quoteDialogOpen, setQuoteDialogOpen] = (0, import_react.useState)(false);
	const messagesEndRef = (0, import_react.useRef)(null);
	const messagesBoxRef = (0, import_react.useRef)(null);
	const navHandledRef = (0, import_react.useRef)(false);
	const closedByUserRef = (0, import_react.useRef)(false);
	const { data: newConvoResults } = useSearchProfiles(newConvoSearch);
	const [handledNavState, setHandledNavState] = (0, import_react.useState)(false);
	const getOtherUser = (convo) => {
		if (!convo) return null;
		const rawOther = convo.other_user_id || (convo.participant_1_id && convo.participant_2_id ? profile?.id && String(convo.participant_1_id) === String(profile.id).replace(/^wp-/, "") ? `wp-${convo.participant_2_id}` : `wp-${convo.participant_1_id}` : null);
		const numeric = rawOther ? String(rawOther).replace(/^wp-/, "") : "";
		const fallback = convo.chat_name && !String(convo.chat_name).startsWith("__group:") ? String(convo.chat_name) : numeric ? isCN ? `用户 ${numeric}` : `User ${numeric}` : isCN ? "对话" : "Conversation";
		return {
			id: rawOther || null,
			full_name: convo.other_user_name || fallback,
			avatar_url: convo.other_user_avatar || null
		};
	};
	(0, import_react.useEffect)(() => {
		const tick = () => {
			if (document.visibilityState !== "visible") return;
			qc.invalidateQueries({ queryKey: ["messages"] });
			qc.invalidateQueries({ queryKey: ["conversations"] });
		};
		const interval = setInterval(tick, 3e4);
		return () => clearInterval(interval);
	}, [qc]);
	const [quotePrefill, setQuotePrefill] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const navState = location.state;
		if (navState?.conversationId && !navHandledRef.current && conversations) {
			const conversation = conversations.find((c) => String(c.id) === String(navState.conversationId));
			if (!conversation) return;
			navHandledRef.current = true;
			setSelectedConvoId(conversation.id);
			setSelectedOtherUser(getOtherUser(conversation));
			return;
		}
		if (navState?.targetUserId && !navHandledRef.current) {
			navHandledRef.current = true;
			setHandledNavState(true);
			const targetUser = {
				id: navState.targetUserId,
				full_name: navState.targetUserName,
				avatar_url: navState.targetUserAvatar
			};
			startConversation.mutate(navState.targetUserId, { onSuccess: (convoId) => {
				setSelectedConvoId(convoId);
				setSelectedOtherUser(targetUser);
				qc.invalidateQueries({ queryKey: ["conversations"] });
				if (navState.openQuote) {
					if (navState.quotePrefill) setQuotePrefill(navState.quotePrefill);
					setQuoteDialogOpen(true);
				}
			} });
		}
	}, [location.state, conversations]);
	(0, import_react.useEffect)(() => {
		const navState = location.state;
		if (!(typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) || closedByUserRef.current) return;
		if (conversations && conversations.length > 0 && !selectedConvoId && !navState?.targetUserId) {
			const first = conversations[0];
			setSelectedConvoId(first.id);
			setSelectedOtherUser(getOtherUser(first));
		}
	}, [
		conversations,
		selectedConvoId,
		profile?.id
	]);
	selectedOtherUser?.id;
	const { data: messages, isLoading: msgsLoading } = useDirectMessages(selectedConvoId);
	(0, import_react.useEffect)(() => {
		if (!selectedConvoId || !messages || msgsLoading) return;
		const conversation = conversations?.find((c) => String(c.id) === String(selectedConvoId));
		if (Number(conversation?.unread_count) > 0 && !markRead.isPending) markRead.mutate(selectedConvoId);
	}, [
		selectedConvoId,
		messages,
		msgsLoading,
		conversations
	]);
	(0, import_react.useEffect)(() => {
		const box = messagesBoxRef.current;
		if (box) box.scrollTo({
			top: box.scrollHeight,
			behavior: "smooth"
		});
	}, [messages]);
	const handleDrop = async (e) => {
		e.preventDefault();
		setDragOver(false);
		const file = e.dataTransfer?.files?.[0];
		if (!file) return;
		try {
			const { uploadWPMedia } = await import("../_libs/_26.mjs").then((n) => n.i);
			const media = await uploadWPMedia(file);
			setPendingAttachment({
				url: media.url,
				type: media.isImage ? "image" : "file",
				name: media.name || file.name
			});
		} catch {
			toast({
				title: Z("没能添加这个文件", "Couldn't add that file"),
				description: Z("请再试一次，或选择小一点的照片。", "Please try again, or pick a smaller photo."),
				variant: "destructive"
			});
		}
	};
	const handleSend = () => {
		if (!newMessage.trim() && !pendingAttachment || !selectedConvoId) return;
		const body = [newMessage.trim(), pendingAttachment?.url].filter(Boolean).join("\n");
		sendMessage.mutate({
			conversationId: selectedConvoId,
			content: body,
			receiverUserId: selectedOtherUser?.id || void 0
		});
		setNewMessage("");
		setPendingAttachment(null);
	};
	const handleSendQuote = async (quote) => {
		if (!selectedConvoId) return;
		const encoded = encodeQuote(quote);
		await sendMessage.mutateAsync({
			conversationId: selectedConvoId,
			content: encoded,
			receiverUserId: selectedOtherUser?.id || void 0
		});
		qc.invalidateQueries({ queryKey: ["messages"] });
		qc.invalidateQueries({ queryKey: ["conversations"] });
		setQuoteDialogOpen(false);
		toast({
			title: Z("报价已发送", "Quote sent"),
			description: `${isCN ? "¥" : "$"}${quote.amount} ${quote.mode === "hourly" ? Z("（按小时）", "(hourly)") : Z("（一口价）", "(flat)")} ${Z("已发送", "sent")}.`
		});
	};
	const handleStartConversation = (person) => {
		startConversation.mutate(person.id, {
			onSuccess: (convoId) => {
				setSelectedOtherUser(person);
				setSelectedConvoId(convoId);
				setNewConvoOpen(false);
				setNewConvoSearch("");
			},
			onError: (err) => toast({
				title: Z("操作失败", "Failed"),
				description: err.message,
				variant: "destructive"
			})
		});
	};
	const filteredConvos = (conversations || []).filter((c) => {
		if (readFilter === "unread" && !(c.unread_count > 0)) return false;
		if (readFilter === "read" && c.unread_count > 0) return false;
		if (!searchQuery.trim()) return true;
		return (getOtherUser(c)?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
	});
	const ConvoSkeleton = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-inspector-id": "pages/Messages/ConvoSkeleton/div/0",
		"data-inspector-source": "pages/Messages.tsx:232:5:c148ee3d2759fe6f42d04e626899a1d89c207ec25a68abd60331818f76291448:1",
		className: "space-y-0",
		children: [
			1,
			2,
			3,
			4,
			5
		].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-id": "pages/Messages/ConvoSkeleton/div/1",
			"data-inspector-source": "pages/Messages.tsx:234:9:c39596e28041ac1fcf6d689af090e5aee5daf799f8afe98402ec3934500c64b9:1",
			className: "p-4 border-b flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
				"data-inspector-id": "pages/Messages/ConvoSkeleton/Skeleton/0",
				"data-inspector-source": "pages/Messages.tsx:235:11:602803d229c6420f049c35e7d577b94f2896a7d419d1dad4fb90ae8251174c59:1",
				className: "w-10 h-10 rounded-full shrink-0"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/Messages/ConvoSkeleton/div/2",
				"data-inspector-source": "pages/Messages.tsx:236:11:836dd91fd4433534271b9ba94f8f7ad761071638f36fdb5b8b6430421b5b0e31:1",
				className: "flex-1 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
					"data-inspector-id": "pages/Messages/ConvoSkeleton/Skeleton/1",
					"data-inspector-source": "pages/Messages.tsx:237:13:903b34de540d32783764ba82062cea95cb99ef9208c58d27dacef5a5a87cd3dd:1",
					className: "h-4 w-24"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
					"data-inspector-id": "pages/Messages/ConvoSkeleton/Skeleton/2",
					"data-inspector-source": "pages/Messages.tsx:238:13:602ff0bcf06302fddccd0b99bc14f58959cfd3e2cd3e357257a040ce906582e5:1",
					className: "h-3 w-40"
				})]
			})]
		}, i))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "pages/Messages/Messages/div/0",
		"data-inspector-source": "pages/Messages.tsx:246:5:87864ea657de9b8df04eee17f170dc074229b35a52d6b8e6ccf42a09e690dd2b:1",
		className: `flex ${embedded ? "h-[calc(100dvh-19rem)] min-h-[24rem] md:h-[calc(100dvh-13rem)]" : "h-[calc(100dvh-8rem)] md:h-[calc(100dvh-4rem)]"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/Messages/Messages/div/1",
				"data-inspector-source": "pages/Messages.tsx:254:7:dadb5dcdddc84f06c64d4dc8328af9f3ebcb4f3e3f9060beb2fc5c0f8878dc15:1",
				className: `w-full md:w-80 border-r flex flex-col bg-card ${selectedConvoId ? "hidden md:flex" : "flex"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/Messages/Messages/div/2",
					"data-inspector-source": "pages/Messages.tsx:255:9:be585d105e5d93ee46fd5fe8e42298bc0f0ead2867d327e965061de83e225628:1",
					className: "p-4 border-b",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/Messages/Messages/div/3",
						"data-inspector-source": "pages/Messages.tsx:256:11:51df52180145b7f0572f57c54f97b2c2e6e6c234f2ff476236b52c71dd91186f:1",
						className: "flex items-center justify-between mb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heading, {
							"data-inspector-id": "pages/Messages/Messages/Heading/0",
							"data-inspector-source": "pages/Messages.tsx:257:13:149fe19464d576c4a2c11e46acca531b1f7c1efebf1d7ad960211ffdd9866b12:1",
							className: "text-lg font-bold text-foreground",
							children: t("messages.messages")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							"data-inspector-id": "pages/Messages/Messages/Button/0",
							"data-inspector-source": "pages/Messages.tsx:258:13:34d8698a918e86b05f43c9263a8c54cfdb8d9c0a5bf3372700a5fcc12931d345:1",
							variant: "ghost",
							size: "icon",
							className: "min-h-11 min-w-11",
							onClick: () => setNewConvoOpen(true),
							title: t("messages.newConversation"),
							"aria-label": t("messages.newConversation"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
								"data-inspector-id": "pages/Messages/Messages/Plus/0",
								"data-inspector-source": "pages/Messages.tsx:259:15:010eb8707d5b95c1194173dffba9f9603062d29ec755381414375d60a4bc2779:1",
								className: "h-4 w-4"
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/Messages/Messages/div/4",
						"data-inspector-source": "pages/Messages.tsx:262:11:4ac264ea0efe13cd6678c47a2a5ca0706e3518a72db315ad355a3a057b26f43a:1",
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
							"data-inspector-id": "pages/Messages/Messages/Search/0",
							"data-inspector-source": "pages/Messages.tsx:263:13:ee62c4dafa218eea55a8e58c4011d6308aafaf430ca2035ef70f79069eab7b84:1",
							className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							"data-inspector-id": "pages/Messages/Messages/Input/0",
							"data-inspector-source": "pages/Messages.tsx:264:13:5734afb47f8bd1aced93b0c7f143ab095dd2962bac84620ace6279cca27b3990:1",
							placeholder: t("messages.searchConversations"),
							value: searchQuery,
							onChange: (e) => setSearchQuery(e.target.value),
							className: "pl-9"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-id": "pages/Messages/Messages/div/5",
					"data-inspector-source": "pages/Messages.tsx:267:9:9c401e059e5299ed460b1ca947c52f7986844f1a6cb1b429e7ba77aa24e088d6:1",
					className: "flex-1 overflow-auto",
					children: convosLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConvoSkeleton, {
						"data-inspector-id": "pages/Messages/Messages/ConvoSkeleton/0",
						"data-inspector-source": "pages/Messages.tsx:269:13:cceb6f822a2d174535d4139da84b41c3b0cf9c89a8afa757eb4bf236003bff68:1"
					}) : filteredConvos.length > 0 ? filteredConvos.map((c) => {
						const other = getOtherUser(c);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-id": "pages/Messages/Messages/div/6",
							"data-inspector-source": "pages/Messages.tsx:274:15:e5232daef8c2d07e939e94c37a42cc2b6c906e30a7ca6d939b9ad099833ed7d9:1",
							className: `p-4 cursor-pointer border-b transition-colors ${selectedConvoId === c.id ? "bg-accent" : "hover:bg-muted/50"}`,
							onClick: () => {
								setSelectedConvoId(c.id);
								setSelectedOtherUser(other);
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/Messages/Messages/div/7",
								"data-inspector-source": "pages/Messages.tsx:279:17:246b8e45cf8511f8ecde338c72c5e0248c0feb3450bad74911a2eca39f059592:1",
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-id": "pages/Messages/Messages/div/8",
									"data-inspector-source": "pages/Messages.tsx:280:19:e24ab57e8b56dfb102cb2a301b961008a9f9a353043bdc7f48fd18df9228aebd:1",
									className: "relative shrink-0",
									children: other?.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										"data-inspector-id": "pages/Messages/Messages/img/0",
										"data-inspector-source": "pages/Messages.tsx:282:23:1b5adde462500be7c66c3553fd3d9f2794caad0ab15898cd423d7eef5a5d52f3:1",
										src: other.avatar_url,
										alt: "",
										className: "w-10 h-10 rounded-full object-cover"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-id": "pages/Messages/Messages/div/9",
										"data-inspector-source": "pages/Messages.tsx:284:23:9494d603c9a515d2629fea11edc930a09277469e378ceb7192971dab6160b3f4:1",
										className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "pages/Messages/Messages/span/0",
											"data-inspector-source": "pages/Messages.tsx:285:25:acf717b7b7c3c1b14392275a30b5e85b5c21180d5da02e6fccb35fc1b4aad428:1",
											className: "text-primary text-sm font-medium",
											children: (other?.full_name || "?").charAt(0)
										})
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/Messages/Messages/div/10",
									"data-inspector-source": "pages/Messages.tsx:289:19:6c7e01a82bed7b5be9659555d26252fa1b29a459f38ae1c7991bc5c13fe68b12:1",
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/Messages/Messages/div/11",
										"data-inspector-source": "pages/Messages.tsx:290:21:c6b6a68a80486df16455d85d1d86194749ff4e462ac843d6a447816fa31cee39:1",
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "pages/Messages/Messages/span/1",
											"data-inspector-source": "pages/Messages.tsx:291:23:24f983d292448a2251fb50b47c34d584a192094e986574d93aeb8de04bf9a417:1",
											className: `font-medium text-sm ${c.unread_count > 0 ? "text-foreground font-semibold" : "text-foreground"}`,
											children: other?.full_name || t("common.unknown")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "pages/Messages/Messages/span/2",
											"data-inspector-source": "pages/Messages.tsx:292:23:dfb13e9855441b770cab6894c6df4f4ae542d735e4fc6b4df371cdf46b67eb1e:1",
											className: "text-xs text-muted-foreground",
											children: c.last_message_at ? formatDate(c.last_message_at, i18n.language, {
												month: "short",
												day: "numeric"
											}) : ""
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/Messages/Messages/div/12",
										"data-inspector-source": "pages/Messages.tsx:296:21:e8167701a27888fef8e691718d1cb2739411f129b622e5b6bf6825c16bf75cf0:1",
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-id": "pages/Messages/Messages/p/0",
											"data-inspector-source": "pages/Messages.tsx:297:23:509e971df9d35d30ba7f5e82cb5846c7fee24f515cbe961839c483ba43b652a2:1",
											className: "text-xs text-muted-foreground truncate",
											children: c.last_message ? (c.last_message.sender_id === profile?.id ? `${t("common.you")}: ` : "") + (c.last_message.message_content || "").substring(0, 50) : t("messages.noMessages")
										}), c.unread_count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "pages/Messages/Messages/span/3",
											"data-inspector-source": "pages/Messages.tsx:301:25:419ce64fab5afe85d453edfa72c5ef0ca4efe5cb5483e9e3d1ad6e4746ca2bf0:1",
											className: "shrink-0 w-5 h-5 rounded-full bg-coral text-coral-foreground text-xs flex items-center justify-center font-semibold",
											children: c.unread_count > 9 ? "9+" : c.unread_count
										})]
									})]
								})]
							})
						}, c.id);
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/Messages/Messages/div/13",
						"data-inspector-source": "pages/Messages.tsx:309:13:afda75db3f51bbd948e67a02ab8602ed788a964c91576ffcddc96d08e3002e7a:1",
						className: "text-center py-8 px-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "pages/Messages/Messages/p/1",
							"data-inspector-source": "pages/Messages.tsx:310:15:c4faa0aee30189c1ee657a22c31fadc7610ec65c2c7def220d49cf617d0fd98e:1",
							className: "text-sm text-muted-foreground mb-3",
							children: t("messages.noConversations")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							"data-inspector-id": "pages/Messages/Messages/Button/1",
							"data-inspector-source": "pages/Messages.tsx:311:15:e22beecf9985ee437f3739b73fa4d698fd4a14d095e0db705f37d360568d17a7:1",
							size: "sm",
							variant: "coral",
							onClick: () => setNewConvoOpen(true),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
									"data-inspector-id": "pages/Messages/Messages/Plus/1",
									"data-inspector-source": "pages/Messages.tsx:312:17:6d721903532060c6f28cbb656bccc16a6edb652b6d58622b8022c504696172c7:1",
									className: "h-3.5 w-3.5 mr-1"
								}),
								" ",
								t("messages.startConversation")
							]
						})]
					})
				})]
			}),
			selectedOtherUser ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/Messages/Messages/div/14",
				"data-inspector-source": "pages/Messages.tsx:321:9:2e5647a70fc458c9b8ed4c125e5a6731381412e16c934e93186bc0638279c643:1",
				className: `flex-1 min-w-0 flex flex-col ${selectedConvoId ? "flex" : "hidden md:flex"}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/Messages/Messages/div/15",
						"data-inspector-source": "pages/Messages.tsx:322:11:d9b778be617d9f7ed03607ee2a5ebd8f8fe5b48cc39347e78bc85862b17e6bb7:1",
						className: "p-3 sm:p-4 border-b flex items-center justify-between bg-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/Messages/Messages/div/16",
							"data-inspector-source": "pages/Messages.tsx:323:13:cc9aafb42633546c02e60b1fa8b3d3728153386cbb80d9e3c391fbad7fcea94d:1",
							className: "flex items-center gap-2 sm:gap-3 min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "pages/Messages/Messages/Button/2",
									"data-inspector-source": "pages/Messages.tsx:324:15:07f77ad16dcf60707111099b7ffe94ca8bfc5a0b826f92ea7219e3e2cfb16e6f:1",
									variant: "ghost",
									size: "icon",
									className: "md:hidden min-h-11 min-w-11 shrink-0",
									"aria-label": Z("返回消息列表", "Back to messages"),
									onClick: () => {
										closedByUserRef.current = true;
										setSelectedConvoId(null);
										setSelectedOtherUser(null);
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
										"data-inspector-id": "pages/Messages/Messages/ArrowLeft/0",
										"data-inspector-source": "pages/Messages.tsx:335:17:774c3b4b6dc88698484b51f9ac7440b1898cdf5521c054f50c21b1fdb8067ad9:1",
										className: "h-5 w-5"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-id": "pages/Messages/Messages/div/17",
									"data-inspector-source": "pages/Messages.tsx:337:15:c0f4cd389b3df51cc6404c9c96ad7dfe256f2b81a879f3e9e75e6657edbe69ad:1",
									className: "relative",
									children: selectedOtherUser.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										"data-inspector-id": "pages/Messages/Messages/img/1",
										"data-inspector-source": "pages/Messages.tsx:339:19:42c4db3cdb30a0b26d285f9b2106a44849bbdc1a0a44883c7f10343d911e9c8a:1",
										src: selectedOtherUser.avatar_url,
										alt: "",
										className: "w-10 h-10 rounded-full object-cover"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-id": "pages/Messages/Messages/div/18",
										"data-inspector-source": "pages/Messages.tsx:341:19:7d39386abf14fc06a1854f1b02fe045847a5df25db2a2604b4554926c00a2544:1",
										className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "pages/Messages/Messages/span/4",
											"data-inspector-source": "pages/Messages.tsx:342:21:46526bb695bea2b449c1c9ca1307d4941e5f1d14baba1e27be921f2de0e5477c:1",
											className: "text-primary text-sm font-medium",
											children: (selectedOtherUser.full_name || "?").charAt(0)
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-id": "pages/Messages/Messages/div/19",
									"data-inspector-source": "pages/Messages.tsx:346:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-id": "pages/Messages/Messages/p/2",
										"data-inspector-source": "pages/Messages.tsx:347:17:ccf5ffd6bd9af18e438e50bf094fc26880e9aabb88bd2c4221c3cfd71738a695:1",
										className: "font-medium text-foreground",
										children: selectedOtherUser.full_name
									})
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/Messages/Messages/div/20",
							"data-inspector-source": "pages/Messages.tsx:350:13:253d5c43120fd09086fb21433eb50b92acf65895ff4afaa1cf58235b15083f79:1",
							className: "flex gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "pages/Messages/Messages/Button/3",
									"data-inspector-source": "pages/Messages.tsx:351:15:a27d1123c8b4e6986e4595ac6a3c60ede1fbacb7b6c842a8d0a8f2b4e3f8fafc:1",
									variant: "ghost",
									size: "icon",
									className: "min-h-11 min-w-11",
									"aria-label": Z("语音通话", "Voice call"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, {
										"data-inspector-id": "pages/Messages/Messages/Phone/0",
										"data-inspector-source": "pages/Messages.tsx:351:118:a27d1123c8b4e6986e4595ac6a3c60ede1fbacb7b6c842a8d0a8f2b4e3f8fafc:1",
										className: "h-4 w-4"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "pages/Messages/Messages/Button/4",
									"data-inspector-source": "pages/Messages.tsx:352:15:5ed30df2a8fdf2f9f8959d55cf461bcfdc710c1a9f9f033b0719df2bf7c437f9:1",
									variant: "ghost",
									size: "icon",
									className: "min-h-11 min-w-11",
									"aria-label": Z("视频通话", "Video call"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, {
										"data-inspector-id": "pages/Messages/Messages/Video/0",
										"data-inspector-source": "pages/Messages.tsx:352:118:5ed30df2a8fdf2f9f8959d55cf461bcfdc710c1a9f9f033b0719df2bf7c437f9:1",
										className: "h-4 w-4"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "pages/Messages/Messages/Button/5",
									"data-inspector-source": "pages/Messages.tsx:353:15:34d7224177bb9b255fcbc6424261b5910786854fec7a274f446ef2aa201d95a9:1",
									variant: "ghost",
									size: "icon",
									className: "min-h-11 min-w-11",
									"aria-label": Z("更多对话操作", "More conversation actions"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, {
										"data-inspector-id": "pages/Messages/Messages/MoreVertical/0",
										"data-inspector-source": "pages/Messages.tsx:353:135:34d7224177bb9b255fcbc6424261b5910786854fec7a274f446ef2aa201d95a9:1",
										className: "h-4 w-4"
									})
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/Messages/Messages/div/21",
						"data-inspector-source": "pages/Messages.tsx:357:11:8777458440cfbef8877513571cfac714f6a9cb8baba9bf068b5ec4f7d8441c47:1",
						ref: messagesBoxRef,
						className: `flex-1 overflow-auto p-4 space-y-3 bg-muted/20 ${dragOver ? "ring-2 ring-primary/50 ring-inset" : ""}`,
						onDragOver: (e) => {
							e.preventDefault();
							setDragOver(true);
						},
						onDragLeave: () => setDragOver(false),
						onDrop: handleDrop,
						children: [msgsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-id": "pages/Messages/Messages/div/22",
							"data-inspector-source": "pages/Messages.tsx:365:15:42e90dccce7e84c974ece10adac1404bffeb077c1784338ffc1e89c432b77bf6:1",
							className: "space-y-3",
							children: [
								1,
								2,
								3
							].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-id": "pages/Messages/Messages/div/23",
								"data-inspector-source": "pages/Messages.tsx:367:19:2f8ea579715adbefa8d4d1445197c4786e64c2b0097444a088bc5833c98400a2:1",
								className: `flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
									"data-inspector-id": "pages/Messages/Messages/Skeleton/0",
									"data-inspector-source": "pages/Messages.tsx:368:21:1afb84992089a5b0b47495019314e04040907f92b49266962487db3df8c092f2:1",
									className: `h-12 rounded-2xl ${i % 2 === 0 ? "w-48" : "w-56"}`
								})
							}, i))
						}) : (messages || []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/Messages/Messages/div/24",
							"data-inspector-source": "pages/Messages.tsx:373:15:651acddc72eeec4123dcec2bb51e8506487c52a6ded4f6eeca46124ef7e833de:1",
							className: "flex flex-col items-center justify-center h-full text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/Messages/Messages/p/3",
								"data-inspector-source": "pages/Messages.tsx:374:17:75e5aee7c87910605639f925e10c26032fc9905a4ffe74a4bf00b8a516d2413b:1",
								className: "text-muted-foreground text-sm",
								children: t("messages.noMessages")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/Messages/Messages/p/4",
								"data-inspector-source": "pages/Messages.tsx:375:17:f11ef22e5148090081d8900bd224fb78d39d73c459727c072fd009aabd1fff72:1",
								className: "text-xs text-muted-foreground mt-1",
								children: t("messages.startConversationBelow")
							})]
						}) : (messages || []).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageBubble, {
							"data-inspector-id": "pages/Messages/Messages/MessageBubble/0",
							"data-inspector-source": "pages/Messages.tsx:378:15:ac96189a5e909855bb1f36c505999ee96983a83d2a651ae6b6ad86bdc307d12a:1",
							message: m,
							isMe: m.sender_id === profile?.id,
							conversationId: selectedConvoId || void 0,
							otherUserId: selectedOtherUser?.id
						}, m.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-id": "pages/Messages/Messages/div/25",
							"data-inspector-source": "pages/Messages.tsx:386:13:05165b57485691235b81a4f62c63bdeed5046f68afdcb7faae00374a0c7264ba:1",
							ref: messagesEndRef
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/Messages/Messages/div/26",
						"data-inspector-source": "pages/Messages.tsx:389:11:ae2acf084963bfbd02b529262e4c84371a8d8b995a8e5e27bea714fe77ef8e01:1",
						className: "p-4 border-t bg-card",
						children: [pendingAttachment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/Messages/Messages/div/27",
							"data-inspector-source": "pages/Messages.tsx:391:15:8a2fe0114308b350e498d3f91a7cd560e260d1767a86bc20dc40cec303cf571b:1",
							className: "flex items-center gap-2 mb-2 p-2 rounded-lg bg-muted/50 text-sm",
							children: [
								pendingAttachment.type === "image" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									"data-inspector-id": "pages/Messages/Messages/img/2",
									"data-inspector-source": "pages/Messages.tsx:393:19:0719220d11689966aa408d2a3277e88a65b34fef2829245509c5f1b0c38a90d4:1",
									src: pendingAttachment.url,
									alt: "",
									className: "h-10 w-10 rounded-sm object-cover shrink-0"
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-id": "pages/Messages/Messages/span/5",
									"data-inspector-source": "pages/Messages.tsx:395:17:fec21610b01a079e950d69a6f8cd72ec89b72a62a640bf5d3fb3a8c767a264fb:1",
									className: "text-muted-foreground truncate flex-1",
									children: pendingAttachment.name || Z("已选择文件", "File selected")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "pages/Messages/Messages/Button/6",
									"data-inspector-source": "pages/Messages.tsx:398:17:6c07e71ec54f5f918ca733885ab48f2cd432f5011cca8f604ef65003cc45c5b3:1",
									variant: "ghost",
									size: "icon",
									className: "min-h-11 min-w-11 shrink-0",
									"aria-label": Z("移除附件", "Remove attachment"),
									onClick: () => setPendingAttachment(null),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
										"data-inspector-id": "pages/Messages/Messages/X/0",
										"data-inspector-source": "pages/Messages.tsx:399:19:f2c055e9a5a9b6fac0f6316db5e5afa0af0c1d2f71366e5a77996b1a3943cb52:1",
										className: "h-3 w-3"
									})
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/Messages/Messages/div/28",
							"data-inspector-source": "pages/Messages.tsx:403:13:b264473553b1958ee021c70e050479b2e989c4dfb7fb0314c4d37a6ed996f4b3:1",
							className: "flex gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageAttachment, {
									"data-inspector-id": "pages/Messages/Messages/MessageAttachment/0",
									"data-inspector-source": "pages/Messages.tsx:404:15:51beedd61eef710bb141bfa3844db4d855160bc94ba889f6ce8bdd2599cb7bc6:1",
									onAttach: (url, type, name) => setPendingAttachment({
										url,
										type,
										name
									}),
									disabled: sendMessage.isPending
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "pages/Messages/Messages/Button/7",
									"data-inspector-source": "pages/Messages.tsx:406:15:07f77ad16dcf60707111099b7ffe94ca8bfc5a0b826f92ea7219e3e2cfb16e6f:1",
									variant: "ghost",
									size: "icon",
									className: "min-h-11 min-w-11",
									title: Z("发送报价", "Send a price quote"),
									"aria-label": Z("发送报价", "Send a price quote"),
									onClick: () => setQuoteDialogOpen(true),
									disabled: !selectedConvoId,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {
										"data-inspector-id": "pages/Messages/Messages/Tag/0",
										"data-inspector-source": "pages/Messages.tsx:415:17:cabb953f444d9e6f67a12a99da56cff48a490330665c54ade9877e35587e4c8e:1",
										className: "h-4 w-4"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"data-inspector-id": "pages/Messages/Messages/Input/1",
									"data-inspector-source": "pages/Messages.tsx:417:15:8f0eb9169b503119d96bda2e87c73c9ce55a4f3450055e53b86496e7ade91891:1",
									placeholder: t("messages.typeMessage"),
									value: newMessage,
									onChange: (e) => setNewMessage(e.target.value),
									onKeyDown: (e) => e.key === "Enter" && handleSend(),
									className: "flex-1"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "pages/Messages/Messages/Button/8",
									"data-inspector-source": "pages/Messages.tsx:424:15:4a7f4fadf3a1a80e4c0daafb628af9affce3583a1dc45e47333e4c75c656e70c:1",
									variant: "coral",
									size: "icon",
									className: "min-h-11 min-w-11",
									"aria-label": Z("发送消息", "Send message"),
									onClick: handleSend,
									disabled: !newMessage.trim() && !pendingAttachment || sendMessage.isPending,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, {
										"data-inspector-id": "pages/Messages/Messages/Send/0",
										"data-inspector-source": "pages/Messages.tsx:425:17:f842547a1676525a44e4c2aa7023b73f292bf41b60e93d1e68cd3e4f815f49c6:1",
										className: "h-4 w-4"
									})
								})
							]
						})]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/Messages/Messages/div/29",
				"data-inspector-source": "pages/Messages.tsx:431:9:fa862e95a0496470fd82ff510a85688083f6a669fa4bf154490b8ffc925780fd:1",
				className: "flex-1 hidden md:flex flex-col items-center justify-center text-muted-foreground gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-id": "pages/Messages/Messages/p/5",
					"data-inspector-source": "pages/Messages.tsx:432:11:d621c492f0a1608e5d236853282ef195725a91e3e20b0a40f92956fb0ea0dbc5:1",
					children: t("messages.selectConversation")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					"data-inspector-id": "pages/Messages/Messages/Button/9",
					"data-inspector-source": "pages/Messages.tsx:433:11:f858d83f88e39ba533c26d2eff3859fee5eb232de2df2578ac5a176b76559d83:1",
					size: "sm",
					variant: "coral",
					onClick: () => setNewConvoOpen(true),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
							"data-inspector-id": "pages/Messages/Messages/Plus/2",
							"data-inspector-source": "pages/Messages.tsx:434:13:450dd3dda6ac4af54168376c116c0c47968fd68511bf08698f1f43045b53525d:1",
							className: "h-3.5 w-3.5 mr-1"
						}),
						" ",
						t("messages.newMessage")
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				"data-inspector-id": "pages/Messages/Messages/Dialog/0",
				"data-inspector-source": "pages/Messages.tsx:440:7:72934509379f6d46b3447628fccebed0bcc5ac28c207a7929ffc1ded5bcdf0ea:1",
				open: newConvoOpen,
				onOpenChange: (o) => {
					setNewConvoOpen(o);
					if (!o) setNewConvoSearch("");
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					"data-inspector-id": "pages/Messages/Messages/DialogContent/0",
					"data-inspector-source": "pages/Messages.tsx:441:9:a1db9351f2bc97608c8aaec7c954792a0a22e6a3d66d076f63a06f6c1dd1b96a:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
						"data-inspector-id": "pages/Messages/Messages/DialogHeader/0",
						"data-inspector-source": "pages/Messages.tsx:442:11:afcb70705f23a881d1c28f98c88bee58e3a926e74cd5767fa2a34ccf842a1f28:1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							"data-inspector-id": "pages/Messages/Messages/DialogTitle/0",
							"data-inspector-source": "pages/Messages.tsx:442:25:afcb70705f23a881d1c28f98c88bee58e3a926e74cd5767fa2a34ccf842a1f28:1",
							children: t("messages.newMessage")
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/Messages/Messages/div/30",
						"data-inspector-source": "pages/Messages.tsx:443:11:2995dfc8cb02ff86e5b949e1f6885e03932586a0dbe7a96a660c24336b94b5e2:1",
						className: "space-y-3 mt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/Messages/Messages/div/31",
								"data-inspector-source": "pages/Messages.tsx:444:13:f8362e1c9dcab7020df6c4ddd1253ac437214a4e97efd416a1d93d0afd30a978:1",
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
									"data-inspector-id": "pages/Messages/Messages/Search/1",
									"data-inspector-source": "pages/Messages.tsx:445:15:ffd82b8eabd9067552471ef4d4658a0b1ff2aafd697c12310bc3ac7050fcd1e4:1",
									className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"data-inspector-id": "pages/Messages/Messages/Input/2",
									"data-inspector-source": "pages/Messages.tsx:446:15:9a88b58212b7a1af20bbe95020d0a4c322d0ca3fb74a9ee76078527ad91a4059:1",
									value: newConvoSearch,
									onChange: (e) => setNewConvoSearch(e.target.value),
									placeholder: t("messages.searchByNameEmail"),
									className: "pl-9",
									autoFocus: true
								})]
							}),
							newConvoSearch.length >= 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-id": "pages/Messages/Messages/div/32",
								"data-inspector-source": "pages/Messages.tsx:449:15:d7ab20ce262f79279f1a2b4ae7e755723dd072d2f033e90c372f6b6f75a65e22:1",
								className: "border rounded-lg max-h-64 overflow-y-auto",
								children: (newConvoResults || []).length > 0 ? (newConvoResults || []).filter((p) => p.id !== profile?.id).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									"data-inspector-id": "pages/Messages/Messages/button/0",
									"data-inspector-source": "pages/Messages.tsx:451:19:adbb91b32e3ec8de0bd3ff222b63fa5a25edeb2a1fffb39e869f517a47f12f30:1",
									className: "w-full flex items-center gap-3 p-3 hover:bg-accent text-left border-b last:border-b-0 transition-colors",
									onClick: () => handleStartConversation(p),
									disabled: startConversation.isPending,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-id": "pages/Messages/Messages/div/33",
											"data-inspector-source": "pages/Messages.tsx:453:21:8de44eca5d6187992b1c81c92cd480feb9dd71d5b1b9b3da298e747452328738:1",
											className: "w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0",
											children: p.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												"data-inspector-id": "pages/Messages/Messages/img/3",
												"data-inspector-source": "pages/Messages.tsx:454:39:96a018454d9a93c54f4824f96ab8ccf9c8a7b73294e9676d07711411ad93f32f:1",
												src: p.avatar_url,
												alt: "",
												className: "w-9 h-9 rounded-full object-cover"
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												"data-inspector-id": "pages/Messages/Messages/span/6",
												"data-inspector-source": "pages/Messages.tsx:454:121:96a018454d9a93c54f4824f96ab8ccf9c8a7b73294e9676d07711411ad93f32f:1",
												className: "text-primary text-xs font-medium",
												children: (p.full_name || "?")[0]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-id": "pages/Messages/Messages/div/34",
											"data-inspector-source": "pages/Messages.tsx:456:21:7e92fa1cb7f722585e2d72c13c697dfb618334b5b769825562efeebdfc7de1ce:1",
											className: "min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-id": "pages/Messages/Messages/p/6",
												"data-inspector-source": "pages/Messages.tsx:457:23:a59826a2cd7571d7c2c81d7395ea12776d2b287706e80a60e022896abd4a10cb:1",
												className: "text-sm font-medium text-foreground",
												children: p.full_name || ""
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-id": "pages/Messages/Messages/p/7",
												"data-inspector-source": "pages/Messages.tsx:458:23:253ecf28ae1e40862db2570f3413741ce3ed063fc466ade991a55548dcb2e68b:1",
												className: "text-xs text-muted-foreground",
												children: p.email || p.user_name || ""
											})]
										}),
										startConversation.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
											"data-inspector-id": "pages/Messages/Messages/Loader2/0",
											"data-inspector-source": "pages/Messages.tsx:460:53:75946654d982302e8be2333d22c80c3519d48f72bc617aeedd8f7d87f188e8d6:1",
											className: "h-4 w-4 animate-spin ml-auto"
										})
									]
								}, p.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-id": "pages/Messages/Messages/p/8",
									"data-inspector-source": "pages/Messages.tsx:463:19:a945cd622a022f58f0b67c08c54cd35e79b6f7691acd75cc59d162493540d536:1",
									className: "p-3 text-sm text-muted-foreground text-center",
									children: t("common.noResults")
								})
							}),
							newConvoSearch.length < 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/Messages/Messages/p/9",
								"data-inspector-source": "pages/Messages.tsx:468:15:c5312767c04ac6592179f4cd12ecf04ff390afa2cccd99797f9828620b1c2800:1",
								className: "text-xs text-muted-foreground text-center py-4",
								children: t("common.minCharsToSearch")
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteDialog, {
				"data-inspector-id": "pages/Messages/Messages/QuoteDialog/0",
				"data-inspector-source": "pages/Messages.tsx:475:7:21a42a7ea4d1931ba0f108ffbac7c8a8a6a4ffefeb518314d0b3c6417e22e4b3:1",
				open: quoteDialogOpen,
				onOpenChange: (o) => {
					setQuoteDialogOpen(o);
					if (!o) setQuotePrefill(null);
				},
				vendorUserId: profile?.id || "",
				defaultServiceType: quotePrefill?.serviceType,
				jobId: quotePrefill?.jobId,
				onSend: handleSendQuote,
				submitting: sendMessage.isPending
			})
		]
	});
}
function Notifications({ embedded = false, readFilter = "all" } = {}) {
	const Heading = embedded ? "h2" : "h1";
	const { t, i18n } = useTranslation();
	const navigate = useNavigate$1();
	const { toast } = useToast();
	const site = useSite();
	const { data: notifications, isLoading } = useNotifications();
	const markRead = useMarkNotificationRead();
	const markAllRead = useMarkAllNotificationsRead();
	const { data: pendingInvitations } = useMyPendingInvitations();
	const acceptInvitation = useAcceptInvitation();
	const declineInvitation = useDeclineInvitation();
	const allNotifs = [...notifications || []].filter((n) => readFilter === "unread" ? !n.is_read : readFilter === "read" ? !!n.is_read : true).sort((a, b) => {
		const ta = new Date(a.created_at || 0).getTime();
		return new Date(b.created_at || 0).getTime() - ta;
	});
	const unreadCount = (notifications || []).filter((n) => !n.is_read).length;
	const invitationCount = (pendingInvitations || []).length;
	const handleAccept = (inv) => {
		acceptInvitation.mutate(inv.id, {
			onSuccess: () => toast({
				title: t("notifs.joined"),
				description: t("notifs.joinedDesc", { name: inv.group?.name || site.careGroupSingular })
			}),
			onError: (err) => toast({
				title: t("notifs.failedToJoin"),
				description: err.message,
				variant: "destructive"
			})
		});
	};
	const handleDecline = (inv) => {
		declineInvitation.mutate(inv.id, { onSuccess: () => toast({ title: t("notifs.invitationDeclined") }) });
	};
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-inspector-id": "pages/Notifications/Notifications/div/0",
		"data-inspector-source": "pages/Notifications.tsx:54:12:931bb606ad09dd79e0793a816a4f30106b10954d0e914b5de9507f02e36808af:1",
		className: "flex justify-center py-20",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
			"data-inspector-id": "pages/Notifications/Notifications/Loader2/0",
			"data-inspector-source": "pages/Notifications.tsx:54:55:931bb606ad09dd79e0793a816a4f30106b10954d0e914b5de9507f02e36808af:1",
			className: "h-8 w-8 animate-spin text-muted-foreground"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "pages/Notifications/Notifications/div/1",
		"data-inspector-source": "pages/Notifications.tsx:58:5:41a3ad4da040094834c4804d8e84f8024ba734a3596a2449ad63feeaba6fd399:1",
		className: "max-w-3xl mx-auto px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/Notifications/Notifications/div/2",
				"data-inspector-source": "pages/Notifications.tsx:59:7:0b496867b94319357106cf8df390be531cc988004833a109d7b0817c699314ee:1",
				className: "flex items-center justify-between gap-3 mb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/Notifications/Notifications/div/3",
					"data-inspector-source": "pages/Notifications.tsx:60:9:ad6704f0e73e2aaf5297b25ad967181462ad8d1550149ddfe9e7f973738162c1:1",
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heading, {
						"data-inspector-id": "pages/Notifications/Notifications/Heading/0",
						"data-inspector-source": "pages/Notifications.tsx:61:11:3e76cd9fbe37aec4f51f3f571bcd829571d124292f59b4dd4791e3d1fb9e4441:1",
						className: "text-xl sm:text-2xl font-bold text-foreground tracking-tight",
						children: t("notifs.notifications")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						"data-inspector-id": "pages/Notifications/Notifications/p/0",
						"data-inspector-source": "pages/Notifications.tsx:62:11:bd7b01af8ff98d3ec53297b7c88d4d88ad4acbfe1c30b0f203c55b6190188014:1",
						className: "text-sm text-muted-foreground mt-0.5",
						children: [t("notifs.unread", { count: unreadCount }), invitationCount > 0 ? ` · ${t("notifs.pendingInvitations", {
							count: invitationCount,
							s: invitationCount > 1 ? "s" : ""
						})}` : ""]
					})]
				}), unreadCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					"data-inspector-id": "pages/Notifications/Notifications/Button/0",
					"data-inspector-source": "pages/Notifications.tsx:65:11:f845c01a6f53aa5919e3b333d3be11fb190e45cf7524f54a1bf71794deb0a518:1",
					variant: "ghost",
					size: "sm",
					onClick: () => markAllRead.mutate(),
					children: t("notifs.markAllRead")
				})]
			}),
			invitationCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/Notifications/Notifications/div/4",
				"data-inspector-source": "pages/Notifications.tsx:70:9:60097b0ae2c4092a7959317de2d78f609f50f96596f10aab469774cf1f343c9a:1",
				className: "mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					"data-inspector-id": "pages/Notifications/Notifications/h2/0",
					"data-inspector-source": "pages/Notifications.tsx:71:11:c8db3f2be7407157624420983a48de2400877ad92c7887d76a16e97564498483:1",
					className: "text-sm font-semibold text-foreground mb-3 flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, {
							"data-inspector-id": "pages/Notifications/Notifications/UserPlus/0",
							"data-inspector-source": "pages/Notifications.tsx:72:13:3a006c2a8355728e8f7288705eae659a61da98e216c399e501e3e4ec34949305:1",
							className: "h-4 w-4 text-primary"
						}),
						" ",
						t("notifs.groupInvitations"),
						" (",
						invitationCount,
						")"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-id": "pages/Notifications/Notifications/div/5",
					"data-inspector-source": "pages/Notifications.tsx:74:11:94490c180d4f0469c17deda0b1a4d7cc86527230dc532ba16ef5120fe55a0723:1",
					className: "space-y-2",
					children: (pendingInvitations || []).map((inv) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						"data-inspector-id": "pages/Notifications/Notifications/Card/0",
						"data-inspector-source": "pages/Notifications.tsx:76:15:605398114878a20aebbf031c90b39b0477e76c0ab3c66d5a2860500267568a54:1",
						className: "border-transparent card-elevated border-l-4 border-l-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							"data-inspector-id": "pages/Notifications/Notifications/CardContent/0",
							"data-inspector-source": "pages/Notifications.tsx:77:17:611837ca724bab64c6e3ad6d94de8a5d3b269bdca27d17c9fa8f39e04e8d2394:1",
							className: "p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/Notifications/Notifications/div/6",
								"data-inspector-source": "pages/Notifications.tsx:78:19:b453ae7830446dca30dcf4e7bd0936be22a8252c051f38a1bc40a708a2a72e09:1",
								className: "flex items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/Notifications/Notifications/div/7",
									"data-inspector-source": "pages/Notifications.tsx:79:21:e32b91149a5643e915b55a6fce117128e9b07b04204425fa33c97088818aeef6:1",
									className: "flex items-center gap-3 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-id": "pages/Notifications/Notifications/div/8",
										"data-inspector-source": "pages/Notifications.tsx:80:23:87bbf9f209b955ac21fa6f310e0c8e550109021be6919cacb8568f7ee726a868:1",
										className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
											"data-inspector-id": "pages/Notifications/Notifications/Users/0",
											"data-inspector-source": "pages/Notifications.tsx:81:25:ab758cee835962176ab7c2773326dcaee4dd6fe3b3253aa20caaec6492b4a15d:1",
											className: "h-5 w-5 text-primary"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/Notifications/Notifications/div/9",
										"data-inspector-source": "pages/Notifications.tsx:83:23:14dcbb2c650c5fc6e766bd72f477d4e0d3ce3a326620389d3b4df042bff78dfa:1",
										className: "min-w-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-id": "pages/Notifications/Notifications/p/1",
												"data-inspector-source": "pages/Notifications.tsx:84:25:2b91ba7b2cad954baf58712347e713a95e93a4004abb951a7935f7f4b56c79fd:1",
												className: "text-sm font-medium text-foreground",
												children: inv.group?.name || site.careGroupSingular
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-id": "pages/Notifications/Notifications/p/2",
												"data-inspector-source": "pages/Notifications.tsx:85:25:b68ce18a480929c298c482cdb7176ffa4d3cb390bc1b81fbb285d25398ff0d93:1",
												className: "text-xs text-muted-foreground",
												children: inv.group?.description ? inv.group.description.substring(0, 60) + (inv.group.description.length > 60 ? "…" : "") : `You've been invited to join this ${site.careGroupSingular.toLowerCase()}`
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												"data-inspector-id": "pages/Notifications/Notifications/p/3",
												"data-inspector-source": "pages/Notifications.tsx:88:25:90412395fb9030909caeb8656df9247ee79227886d979de86517eb320b4c9648:1",
												className: "text-xs text-muted-foreground mt-0.5",
												children: [
													t("notifs.received"),
													" ",
													formatDate(inv.created_at, i18n.language, {
														month: "short",
														day: "numeric"
													})
												]
											})
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/Notifications/Notifications/div/10",
									"data-inspector-source": "pages/Notifications.tsx:93:21:5769cce884c1423ff3d4de04e44711feab7bcfda7109045a71a38c218b108c30:1",
									className: "flex gap-2 shrink-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										"data-inspector-id": "pages/Notifications/Notifications/Button/1",
										"data-inspector-source": "pages/Notifications.tsx:94:23:c8ac46467de681e10ea2f2fcfa1b58c67aeb5941054d152f507cfbdaf551136a:1",
										size: "sm",
										variant: "coral",
										onClick: () => handleAccept(inv),
										disabled: acceptInvitation.isPending,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
												"data-inspector-id": "pages/Notifications/Notifications/Check/0",
												"data-inspector-source": "pages/Notifications.tsx:95:25:5768dfcddbe8ada85b023fb22bf9152a859ca8c02d04524b2f353f2bc65fbb8c:1",
												className: "h-3.5 w-3.5 mr-1"
											}),
											" ",
											t("common.accept")
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										"data-inspector-id": "pages/Notifications/Notifications/Button/2",
										"data-inspector-source": "pages/Notifications.tsx:97:23:bc58ed1a2dba90a327584b55043885086a6281643496ed07c9eb35252814fd6c:1",
										size: "sm",
										variant: "ghost",
										className: "text-destructive hover:text-destructive",
										onClick: () => handleDecline(inv),
										disabled: declineInvitation.isPending,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
											"data-inspector-id": "pages/Notifications/Notifications/X/0",
											"data-inspector-source": "pages/Notifications.tsx:98:25:fba8e1b5a94e78617c568406dd7c94e20f19e3bd900155b2ecd5c4be963dbf93:1",
											className: "h-3.5 w-3.5"
										})
									})]
								})]
							})
						})
					}, inv.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "pages/Notifications/Notifications/div/11",
				"data-inspector-source": "pages/Notifications.tsx:109:7:293654f1b55fbd0f45154f2452fafc5ae095e31fc8cfd19257d608f7f96df07e:1",
				className: "space-y-2",
				children: allNotifs.length > 0 ? allNotifs.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					"data-inspector-id": "pages/Notifications/Notifications/Card/1",
					"data-inspector-source": "pages/Notifications.tsx:111:11:a4506f879c64fdebc889b4b982aafb42041ac61dfef5a3e7a9c1246c2180c6b9:1",
					className: `cursor-pointer transition-colors border-transparent ${n.is_read ? "opacity-70" : "card-elevated"}`,
					onClick: () => {
						if (!n.is_read) markRead.mutate(n.id);
						let url = n.action_url || n.link_url;
						if (url?.includes("/dashboard/appointments")) url = "/bookings";
						if (url?.includes("/dashboard/booking-history")) url = "/bookings";
						if (url) navigate(url);
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						"data-inspector-id": "pages/Notifications/Notifications/CardContent/1",
						"data-inspector-source": "pages/Notifications.tsx:122:13:773b03b19e173b93bd341425dde45c41c838b6f5c09f3afeacbee391404c62f2:1",
						className: "p-4 flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-id": "pages/Notifications/Notifications/div/12",
							"data-inspector-source": "pages/Notifications.tsx:123:15:bf22af5ca84894792cae067cd040e56d23a0a98366ab0a9595024f4481fa45a8:1",
							className: "mt-0.5 shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
								"data-inspector-id": "pages/Notifications/Notifications/Bell/0",
								"data-inspector-source": "pages/Notifications.tsx:123:48:bf22af5ca84894792cae067cd040e56d23a0a98366ab0a9595024f4481fa45a8:1",
								className: "h-5 w-5 text-muted-foreground"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/Notifications/Notifications/div/13",
							"data-inspector-source": "pages/Notifications.tsx:124:15:a104d5461a703c9ef75613cbbdf47223b0ee194f7e6dfabbbfd095be5591983f:1",
							className: "flex-1 min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/Notifications/Notifications/div/14",
									"data-inspector-source": "pages/Notifications.tsx:125:17:ddda52a954e0b7361f4465e4102ec5e0196544c94ac144760245f0dab7b3e0c6:1",
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										"data-inspector-id": "pages/Notifications/Notifications/h3/0",
										"data-inspector-source": "pages/Notifications.tsx:126:19:28b1ceeae0bfd62f7f0f989168129c7116c259a471761b40c5817012472e376e:1",
										className: `text-sm ${n.is_read ? "font-normal text-muted-foreground" : "font-semibold text-foreground"}`,
										children: n.title
									}), !n.is_read && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-id": "pages/Notifications/Notifications/div/15",
										"data-inspector-source": "pages/Notifications.tsx:127:34:b95c1fe94f21265062d19c008698ae25d273c9c86b613ccb34342551b3513c8b:1",
										className: "w-2 h-2 rounded-full bg-coral shrink-0"
									})]
								}),
								(n.message || n.content) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-id": "pages/Notifications/Notifications/p/4",
									"data-inspector-source": "pages/Notifications.tsx:130:19:0c0b485147a270dbe8649f40d03df8166984fb8b6d04d2a1da6692e3f3fd8368:1",
									className: "text-sm text-muted-foreground mt-0.5",
									children: n.message || n.content
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									"data-inspector-id": "pages/Notifications/Notifications/p/5",
									"data-inspector-source": "pages/Notifications.tsx:132:17:1ba736aae822138a4f8a0eebee709e7d9e37134e05cd387de6b48a215ec26bd3:1",
									className: "text-xs text-muted-foreground mt-1",
									children: [
										formatDate(n.created_at, i18n.language, {
											month: "short",
											day: "numeric"
										}),
										" ",
										t("common.at"),
										" ",
										formatTime(n.created_at, "en", {
											hour: "numeric",
											minute: "2-digit"
										})
									]
								})
							]
						})]
					})
				}, n.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/Notifications/Notifications/div/16",
					"data-inspector-source": "pages/Notifications.tsx:140:11:55f4ffcf35c0cf8a7b6562fc815926ae349d751ee6995b854194eeb72f51ad14:1",
					className: "text-center py-12",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
						"data-inspector-id": "pages/Notifications/Notifications/Bell/1",
						"data-inspector-source": "pages/Notifications.tsx:141:13:6ed3f6a7e6a8b9c297b35f97533594180436f6fee5eb3e365b3e38a1f62f6902:1",
						className: "h-10 w-10 text-muted-foreground/30 mx-auto mb-3"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "pages/Notifications/Notifications/p/6",
						"data-inspector-source": "pages/Notifications.tsx:142:13:edabcd1f3324719f6dd1d8dfafb57f367857db7ffb10bc9a7676ace1565e5526:1",
						className: "text-muted-foreground",
						children: t("notifs.noNotifications")
					})]
				})
			})
		]
	});
}
/**
* Unified Inbox — 3 tabs:
*  - All: one chronological stream where every row carries a
*    "Notification" or "Message" tag. Not two stacked lists.
*  - Notifications: notifications only
*  - Messages: the conversation view only
* There are no standalone /notifications or /messages pages: those paths
* redirect here with the matching tab, so this file is the single surface.
*/
function Inbox$1() {
	const { i18n } = useTranslation();
	const isChinese = i18n.language?.startsWith("zh");
	const Z = (cn, en) => isChinese ? cn : en;
	const navigate = useNavigate$1();
	const [params, setParams] = useSearchParams();
	const [tab, setTab] = (0, import_react.useState)((() => {
		const p = params.get("tab");
		if (p === "messages") return "messages";
		if (p === "notifications") return "notifications";
		return "all";
	})());
	const [readFilter, setReadFilter] = (0, import_react.useState)("all");
	const { data: notifications, isLoading: notifsLoading } = useNotifications();
	const { data: conversations, isLoading: convosLoading } = useConversations();
	const { data: profile } = useMyProfile();
	const markRead = useMarkNotificationRead();
	const markAllRead = useMarkAllNotificationsRead();
	const markMessagesRead = useMarkMessagesRead();
	const counts = useInboxCounts();
	const selectedTotal = tab === "notifications" ? (notifications || []).length : tab === "messages" ? (conversations || []).length : counts.total;
	const selectedUnread = tab === "notifications" ? counts.unreadNotifications : tab === "messages" ? counts.unreadMessages : counts.unread;
	const [markingAll, setMarkingAll] = (0, import_react.useState)(false);
	const [markError, setMarkError] = (0, import_react.useState)("");
	const markEverythingRead = async () => {
		setMarkingAll(true);
		setMarkError("");
		try {
			await Promise.all([markAllRead.mutateAsync(), ...(conversations || []).filter((c) => Number(c.unread_count) > 0).map((c) => markMessagesRead.mutateAsync(c.id))]);
		} catch (error) {
			setMarkError(error instanceof Error ? error.message : String(error));
		} finally {
			setMarkingAll(false);
		}
	};
	const switchTab = (v, state) => {
		setTab(v);
		const next = new URLSearchParams(params);
		next.set("tab", v);
		setParams(next, { replace: true });
		if (state) navigate(`/inbox?tab=${v}`, {
			state,
			replace: true
		});
	};
	const feed = [...(notifications || []).map((n) => ({
		kind: "notification",
		id: `n-${n.id}`,
		at: n.created_at,
		title: n.title,
		body: n.message || n.content || "",
		unread: !n.is_read,
		raw: n
	})), ...(conversations || []).map((c) => {
		const numeric = c.other_user_id ? String(c.other_user_id).replace(/^wp-/, "") : "";
		const name = c.other_user_name || (c.chat_name && !String(c.chat_name).startsWith("__group:") ? String(c.chat_name) : "") || (numeric ? isChinese ? `用户 ${numeric}` : `User ${numeric}` : Z("对话", "Conversation"));
		const last = c.last_message?.message_content || "";
		const mine = c.last_message?.sender_id && profile?.id && c.last_message.sender_id === profile.id;
		return {
			kind: "message",
			id: `c-${c.id}`,
			at: c.last_message_at || c.created_at,
			title: name,
			body: (mine ? `${Z("你", "You")}: ` : "") + last.substring(0, 80),
			unread: (c.unread_count || 0) > 0,
			raw: c
		};
	})].filter((r) => readFilter === "all" ? true : readFilter === "unread" ? r.unread : !r.unread).sort((a, b) => new Date(b.at || 0).getTime() - new Date(a.at || 0).getTime());
	const openRow = (row) => {
		if (row.kind === "notification") {
			const n = row.raw;
			if (!n.is_read) markRead.mutate(n.id);
			let url = n.action_url || n.link_url;
			if (url?.includes("/dashboard/appointments")) url = "/bookings";
			if (url?.includes("/dashboard/booking-history")) url = "/bookings";
			if (url?.startsWith("/messages")) {
				switchTab("messages");
				return;
			}
			if (url?.startsWith("/notifications")) {
				switchTab("notifications");
				return;
			}
			if (url) navigate(url);
			return;
		}
		switchTab("messages", { conversationId: row.raw.id });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "pages/Inbox/Inbox/div/0",
		"data-inspector-source": "pages/Inbox.tsx:141:5:c092c4fd1e2bc7b5e10f7b0c62666ef375ffc95e410aeb61f0ab3e5cdd342b28:1",
		className: "min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-id": "pages/Inbox/Inbox/div/1",
			"data-inspector-source": "pages/Inbox.tsx:142:7:62fcb9ce6eef052b9d94773ab4e86cff4e597bb315394ed8af8da202be939244:1",
			className: "max-w-3xl mx-auto px-4 pt-5 pb-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				"data-inspector-id": "pages/Inbox/Inbox/h1/0",
				"data-inspector-source": "pages/Inbox.tsx:143:9:ee0a095636e259f9b213ed71f02a2a17e096d4c14ed1ffe522747428d538768b:1",
				className: "text-xl sm:text-2xl font-bold text-foreground tracking-tight",
				children: Z("收件箱", "Inbox")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-id": "pages/Inbox/Inbox/p/0",
				"data-inspector-source": "pages/Inbox.tsx:146:9:c501f98dbd62c92671127721909584a0bc1b6f21a03993f7c5811190cc271b1b:1",
				className: "text-sm text-muted-foreground mt-0.5",
				children: Z("消息与通知", "Messages & notifications")
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			"data-inspector-id": "pages/Inbox/Inbox/Tabs/0",
			"data-inspector-source": "pages/Inbox.tsx:151:7:8a0001c5d5b66215a5d0134a3591127ed056a3de61010f2869efd7d71815128e:1",
			value: tab,
			onValueChange: (v) => switchTab(v),
			className: "w-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/Inbox/Inbox/div/2",
					"data-inspector-source": "pages/Inbox.tsx:152:9:ff73985599876067c393232ce4478217ac55ec06f973ffbf5ac90ce554151e6f:1",
					className: "max-w-3xl mx-auto px-4 space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						"data-inspector-id": "pages/Inbox/Inbox/TabsList/0",
						"data-inspector-source": "pages/Inbox.tsx:153:11:e5b27dd5e470787416ab48dfe3216a5c8d924c7eecd33551de746a83ee9bd145:1",
						className: "grid w-full grid-cols-3 h-11 bg-muted/50 rounded-xl p-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								"data-inspector-id": "pages/Inbox/Inbox/TabsTrigger/0",
								"data-inspector-source": "pages/Inbox.tsx:154:13:d50c9eb95b3a38079e96648601acdda3cdcb6a1d1bca010fac6e6302f2f8b880:1",
								value: "all",
								className: "rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1.5 px-1 text-xs sm:text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, {
									"data-inspector-id": "pages/Inbox/Inbox/InboxIcon/0",
									"data-inspector-source": "pages/Inbox.tsx:158:15:8cc6b49b3900fc045a12f244f72d6b779db5a5b83f8e30b1eb69de0225c3d1ac:1",
									className: "h-4 w-4 shrink-0"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-id": "pages/Inbox/Inbox/span/0",
									"data-inspector-source": "pages/Inbox.tsx:159:15:ccce6a2e722703e37e592410581578ad6da7c55de2346a956030f97dff13b92a:1",
									children: Z("全部", "All")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								"data-inspector-id": "pages/Inbox/Inbox/TabsTrigger/1",
								"data-inspector-source": "pages/Inbox.tsx:161:13:d50c9eb95b3a38079e96648601acdda3cdcb6a1d1bca010fac6e6302f2f8b880:1",
								value: "notifications",
								className: "rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1.5 px-1 text-xs sm:text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
									"data-inspector-id": "pages/Inbox/Inbox/Bell/0",
									"data-inspector-source": "pages/Inbox.tsx:165:15:052f0210a2cd9c2fe71887153574445f5de37aaac614b6d6be682a86728a10d7:1",
									className: "h-4 w-4 shrink-0"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-id": "pages/Inbox/Inbox/span/1",
									"data-inspector-source": "pages/Inbox.tsx:166:15:9ccfb8236e02318e8d9818934ba534b35f540810f83f7c6c51f840e9a1f56afd:1",
									children: Z("通知", "Notifications")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								"data-inspector-id": "pages/Inbox/Inbox/TabsTrigger/2",
								"data-inspector-source": "pages/Inbox.tsx:168:13:d50c9eb95b3a38079e96648601acdda3cdcb6a1d1bca010fac6e6302f2f8b880:1",
								value: "messages",
								className: "rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1.5 px-1 text-xs sm:text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, {
									"data-inspector-id": "pages/Inbox/Inbox/MessageSquare/0",
									"data-inspector-source": "pages/Inbox.tsx:172:15:e39f872820fba30ed5579ae8ccc5bc544dd64b35871569629f0c93802a74108c:1",
									className: "h-4 w-4 shrink-0"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-id": "pages/Inbox/Inbox/span/2",
									"data-inspector-source": "pages/Inbox.tsx:173:15:f648073acf645ba315256f32f750d2aebf859b6edbd0214c3b33a3a583860f1a:1",
									children: Z("消息", "Messages")
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-id": "pages/Inbox/Inbox/div/3",
						"data-inspector-source": "pages/Inbox.tsx:178:11:0d9f616527958e01a6edd5787aec0b1ffa4fe9dc5d03708bfce1a7c85a5bc6d3:1",
						className: "grid w-full grid-cols-3 items-center gap-1 rounded-xl bg-muted/50 p-1",
						children: [
							["all", Z("全部", "All")],
							["unread", Z("未读", "Unread")],
							["read", Z("已读", "Read")]
						].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							"data-inspector-id": "pages/Inbox/Inbox/Button/0",
							"data-inspector-source": "pages/Inbox.tsx:184:15:07f77ad16dcf60707111099b7ffe94ca8bfc5a0b826f92ea7219e3e2cfb16e6f:1",
							type: "button",
							variant: "ghost",
							size: "sm",
							onClick: () => setReadFilter(key),
							"aria-pressed": readFilter === key,
							className: `rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${readFilter === key ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`,
							children: [
								label,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-id": "pages/Inbox/Inbox/span/3",
									"data-inspector-source": "pages/Inbox.tsx:197:25:717e9a6c063ac0e03a522c14b198cd7f4e9d49120a195f88210186fedf0b018e:1",
									className: "ml-1",
									children: counts.isLoading || counts.error ? "—" : key === "all" ? selectedTotal : key === "unread" ? selectedUnread : selectedTotal - selectedUnread
								})
							]
						}, key))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					"data-inspector-id": "pages/Inbox/Inbox/TabsContent/0",
					"data-inspector-source": "pages/Inbox.tsx:204:9:aa83de166020fd05a26fa119e171e6d7d1634744386ec784a6ec56b5e1191368:1",
					value: "all",
					className: "mt-0 focus-visible:outline-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-id": "pages/Inbox/Inbox/div/4",
						"data-inspector-source": "pages/Inbox.tsx:205:11:5b485b7f39d6820e83b3c264f6ee7b6dfa1a35922e440cdfd5c3527b5441e2aa:1",
						className: "max-w-3xl mx-auto px-4 py-4",
						children: counts.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "pages/Inbox/Inbox/p/1",
							"data-inspector-source": "pages/Inbox.tsx:207:15:812d2c406f61110fa28a2d2a24fa1c9a418b677119da53d2afce194c899297e9:1",
							role: "alert",
							className: "py-4 text-destructive",
							children: Z("未能读取收件箱，请刷新重试。", "Couldn't load your inbox. Please refresh to retry.")
						}) : notifsLoading || convosLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-id": "pages/Inbox/Inbox/div/5",
							"data-inspector-source": "pages/Inbox.tsx:209:15:3f4ac3670bc52768c86a1babacd7c1b1f45f804d8da6a3b91f61b86e04aa7f1e:1",
							className: "space-y-3 py-2",
							children: [
								1,
								2,
								3,
								4,
								5
							].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
								"data-inspector-id": "pages/Inbox/Inbox/Skeleton/0",
								"data-inspector-source": "pages/Inbox.tsx:210:43:eca83634588f16e0e1a3bfe3f28bd669b5e964d907912c86ac47359cce944d9d:1",
								className: "h-20 rounded-xl"
							}, i))
						}) : feed.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/Inbox/Inbox/div/6",
							"data-inspector-source": "pages/Inbox.tsx:213:15:fffe833e209b7358ff84b9e2ef63b7c9efb12b9fe7dce771cf4d54ce1f4f1c0c:1",
							className: "text-center py-16",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, {
								"data-inspector-id": "pages/Inbox/Inbox/InboxIcon/1",
								"data-inspector-source": "pages/Inbox.tsx:214:17:dc4b701b927594e80912d937c9ee5b76f7d3fc3a90b98c3dd7a8d2d51849b130:1",
								className: "h-10 w-10 text-muted-foreground/30 mx-auto mb-3"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/Inbox/Inbox/p/2",
								"data-inspector-source": "pages/Inbox.tsx:215:17:d3dd46140edee21024caa4fad2caf68d0128e0fac96083445d51ae0a4a1e96e5:1",
								className: "text-muted-foreground",
								children: Z("暂时没有新内容", "Nothing here yet")
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							counts.unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-id": "pages/Inbox/Inbox/div/7",
								"data-inspector-source": "pages/Inbox.tsx:220:19:77ef0f4bee45b7777a2cb2dc14cc54909d8d7680bfa5bccc716b527e9e5ef6b7:1",
								className: "flex justify-end mb-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "pages/Inbox/Inbox/Button/1",
									"data-inspector-source": "pages/Inbox.tsx:221:21:4e75bfbc4c8d0c155ce38c019fc6f7bd5681e1d067e9146b653ae65b8a6bdd68:1",
									variant: "ghost",
									size: "sm",
									disabled: markingAll,
									onClick: markEverythingRead,
									children: Z("全部标为已读", "Mark all as read")
								})
							}),
							markError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/Inbox/Inbox/p/3",
								"data-inspector-source": "pages/Inbox.tsx:226:31:866685fb4f293d10ebc0d96a042be4bc05762eef3afd02e73169917db3d023ec:1",
								role: "alert",
								className: "text-sm text-destructive",
								children: markError
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-id": "pages/Inbox/Inbox/div/8",
								"data-inspector-source": "pages/Inbox.tsx:227:17:17d9d6c09ea299a8a60db95751c360e55c1db680a84cb8451206c49e7d794eb0:1",
								className: "space-y-2",
								children: feed.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									"data-inspector-id": "pages/Inbox/Inbox/Card/0",
									"data-inspector-source": "pages/Inbox.tsx:229:21:530563689c6bc8420b7fec39d156e5fbd2a12cad6be3892db2205c683921dcb5:1",
									className: `cursor-pointer transition-colors border-transparent ${row.unread ? "card-elevated" : "opacity-70"}`,
									onClick: () => openRow(row),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
										"data-inspector-id": "pages/Inbox/Inbox/CardContent/0",
										"data-inspector-source": "pages/Inbox.tsx:234:23:d648d7e7bc035dce726b50fd8780920b540a3f30c365ef2941afd41165d18787:1",
										className: "p-4 flex items-start gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-id": "pages/Inbox/Inbox/div/9",
											"data-inspector-source": "pages/Inbox.tsx:235:25:1586db34cb9d0447f68663ef071e4d7d5d6bea701d714a0f98640ff41d6cf3ad:1",
											className: "mt-0.5 shrink-0",
											children: row.kind === "notification" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
												"data-inspector-id": "pages/Inbox/Inbox/Bell/1",
												"data-inspector-source": "pages/Inbox.tsx:237:29:0016f9a6fa150f84dc175c3291c190383f0d1f936c42e993e6bdda9bbe124e28:1",
												className: "h-5 w-5 text-muted-foreground"
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, {
												"data-inspector-id": "pages/Inbox/Inbox/MessageSquare/1",
												"data-inspector-source": "pages/Inbox.tsx:239:29:c8377fba13d110e9550379d48dd1544c19515c3ef502e8b3eb4c6c54c1d60988:1",
												className: "h-5 w-5 text-muted-foreground"
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-id": "pages/Inbox/Inbox/div/10",
											"data-inspector-source": "pages/Inbox.tsx:242:25:c5ef961e7c671996083509685695e28adf3bf953f4f06f8bf48866d694a6d3b4:1",
											className: "flex-1 min-w-0",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													"data-inspector-id": "pages/Inbox/Inbox/div/11",
													"data-inspector-source": "pages/Inbox.tsx:243:27:823d4945657298f9d7cb696ad55f222c2ac0ea660c998a4502b524ba0ff4381b:1",
													className: "flex items-center gap-2 flex-wrap",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															"data-inspector-id": "pages/Inbox/Inbox/Badge/0",
															"data-inspector-source": "pages/Inbox.tsx:244:29:88fadbfa78dfe6fc21466005816a5aaeb38b73d10269f58657d318139908985e:1",
															variant: "secondary",
															className: "text-[10px] px-1.5 py-0",
															children: row.kind === "notification" ? Z("通知", "Notification") : Z("消息", "Message")
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
															"data-inspector-id": "pages/Inbox/Inbox/h3/0",
															"data-inspector-source": "pages/Inbox.tsx:247:29:ecc76b3095b56766d36772819ed88d9699536651fe58edcc532e07d60e468cf9:1",
															className: `text-sm truncate ${row.unread ? "font-semibold text-foreground" : "font-normal text-muted-foreground"}`,
															children: row.title
														}),
														row.unread && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															"data-inspector-id": "pages/Inbox/Inbox/div/12",
															"data-inspector-source": "pages/Inbox.tsx:252:44:4d159782d7c9ef9c9dd639e6f40ac8a1f9a21491d3a97b63de7617361f062988:1",
															className: "w-2 h-2 rounded-full bg-coral shrink-0"
														})
													]
												}),
												row.body && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													"data-inspector-id": "pages/Inbox/Inbox/p/4",
													"data-inspector-source": "pages/Inbox.tsx:255:29:37063cbd28da4071c70a01887d9801cf61b4c33cb624f2df2df347778135e130:1",
													className: "text-sm text-muted-foreground mt-0.5 line-clamp-2",
													children: row.body
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													"data-inspector-id": "pages/Inbox/Inbox/p/5",
													"data-inspector-source": "pages/Inbox.tsx:257:27:278ed9c4ec2b90c8f4fae3e59f604aa6f569ef42524b645f9b6bad5a72bc312e:1",
													className: "text-xs text-muted-foreground mt-1",
													children: [
														formatDate(row.at, i18n.language, {
															month: "short",
															day: "numeric"
														}),
														" ",
														formatTime(row.at, "en", {
															hour: "numeric",
															minute: "2-digit"
														})
													]
												})
											]
										})]
									})
								}, row.id))
							})
						] })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					"data-inspector-id": "pages/Inbox/Inbox/TabsContent/1",
					"data-inspector-source": "pages/Inbox.tsx:270:9:19ac519a31a520fd052d6d21739c4befbd3fa0572e4eed6cbd4f9825079f195e:1",
					value: "notifications",
					className: "mt-0 focus-visible:outline-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notifications, {
						"data-inspector-id": "pages/Inbox/Inbox/Notifications/0",
						"data-inspector-source": "pages/Inbox.tsx:271:11:717c216f3ae0251a2661a332d6700940ae8bfc57aabe45aaf63bc027641bbefd:1",
						embedded: true,
						readFilter
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					"data-inspector-id": "pages/Inbox/Inbox/TabsContent/2",
					"data-inspector-source": "pages/Inbox.tsx:273:9:f9ab01816152ec37d14e8edc065837d2b1053d073cd168e7f033b5cd29fce87c:1",
					value: "messages",
					className: "mt-0 focus-visible:outline-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Messages, {
						"data-inspector-id": "pages/Inbox/Inbox/Messages/0",
						"data-inspector-source": "pages/Inbox.tsx:274:11:3796fe5103d72ce1cf213b977120e849a5d823015931f8094ab5bfe364cebc10:1",
						embedded: true,
						readFilter
					})
				})
			]
		})]
	});
}
__name$1(Inbox$1, "Inbox");
//#endregion
export { Inbox$1 as t };
