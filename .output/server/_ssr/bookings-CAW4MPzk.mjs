import { s as __toESM } from "../_runtime.mjs";
import { t as cleanBookingNote } from "./utils-CcHv9xqZ.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { n as CardContent, t as Card } from "./card-Cz5iPbNd.mjs";
import { t as Badge } from "./badge-Dn-oRli-.mjs";
import { t as Input } from "./input-DmTt3-fi.mjs";
import { t as Textarea } from "./textarea-DPamDMgK.mjs";
import { t as formatDate } from "./locale-DKwjQju2.mjs";
import { Ln as CalendarDays, St as MessageSquare, T as Star, _ as TriangleAlert, cn as Ellipsis, dn as DollarSign, et as RefreshCw, jt as LoaderCircle, n as X, vn as Clock } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-COszB6Fv.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { y as updateOrderBookingDetails } from "./woocommerce-api-BoF1FQHg.mjs";
import { Bn as useStartConversation, S as useBookings, Xn as useUpdateBookingStatus, at as useCreateReview } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-HRlnwchH.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { i as useNavigate$1 } from "./router-compat-3gk8yjav.mjs";
import { t as RequireAuth } from "./RequireAuth-CXvd5_cn.mjs";
import { a as DropdownMenuTrigger, n as DropdownMenuContent, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-BlUTKFl7.mjs";
import { u as useRequestRefund } from "./use-cart-B3rnJV3i.mjs";
import { t as SiteFeature } from "./SiteFeature-CQrN1JWZ.mjs";
import { r as getProviderCalendarBookingConflictMessage } from "./booking-availability-CfcSrbaA.mjs";
import { t as BookingThreadDialog } from "./BookingThreadDialog-Bz3hv0pG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bookings-CAW4MPzk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Bookings() {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate$1();
	const { toast } = useToast();
	const qc = useQueryClient();
	const { user: authUser } = useAuth();
	const { data: bookings, isLoading } = useBookings();
	const createReview = useCreateReview();
	const updateStatus = useUpdateBookingStatus();
	const startConversation = useStartConversation();
	const requestRefund = useRequestRefund();
	const [reviewOpen, setReviewOpen] = (0, import_react.useState)(false);
	const [reviewBooking, setReviewBooking] = (0, import_react.useState)(null);
	const [reviewRating, setReviewRating] = (0, import_react.useState)(5);
	const [reviewComment, setReviewComment] = (0, import_react.useState)("");
	const [reviewSaving, setReviewSaving] = (0, import_react.useState)(false);
	const [messagingId, setMessagingId] = (0, import_react.useState)(null);
	const [cancelConfirmOpen, setCancelConfirmOpen] = (0, import_react.useState)(false);
	const [cancelTargetId, setCancelTargetId] = (0, import_react.useState)(null);
	const [cancelTargetName, setCancelTargetName] = (0, import_react.useState)("");
	const [rescheduleOpen, setRescheduleOpen] = (0, import_react.useState)(false);
	const [rescheduleBooking, setRescheduleBooking] = (0, import_react.useState)(null);
	const [rescheduleDate, setRescheduleDate] = (0, import_react.useState)("");
	const [rescheduleTime, setRescheduleTime] = (0, import_react.useState)("");
	const [rescheduleSaving, setRescheduleSaving] = (0, import_react.useState)(false);
	const [refundOpen, setRefundOpen] = (0, import_react.useState)(false);
	const [refundBooking, setRefundBooking] = (0, import_react.useState)(null);
	const [refundReason, setRefundReason] = (0, import_react.useState)("");
	const [issueOpen, setIssueOpen] = (0, import_react.useState)(false);
	const [issueBooking, setIssueBooking] = (0, import_react.useState)(null);
	const statusColors = {
		confirmed: "bg-success text-success-foreground",
		pending: "bg-warning text-warning-foreground",
		completed: "bg-muted text-muted-foreground",
		cancelled: "bg-destructive text-destructive-foreground",
		cancelled_by_user: "bg-destructive text-destructive-foreground",
		cancelled_by_provider: "bg-destructive text-destructive-foreground",
		in_progress: "bg-primary text-primary-foreground",
		refunded: "bg-muted text-muted-foreground"
	};
	const handleStatusUpdate = (id, status) => {
		updateStatus.mutate({
			id,
			status
		}, {
			onSuccess: () => toast({ title: t("bookings.bookingUpdated", { status }) }),
			onError: (err) => toast({
				title: t("bookings.updateFailed"),
				description: err.message,
				variant: "destructive"
			})
		});
	};
	const handleMessage = (booking) => {
		if (!booking.provider_id) return;
		setMessagingId(booking.provider_id);
		startConversation.mutate(booking.provider_id, {
			onSuccess: () => {
				navigate("/inbox?tab=messages", { state: {
					targetUserId: booking.provider_id,
					targetUserName: booking.provider?.full_name,
					targetUserAvatar: booking.provider?.avatar_url
				} });
			},
			onError: () => {
				setMessagingId(null);
				navigate("/inbox?tab=messages");
			}
		});
	};
	const openReview = (booking) => {
		setReviewBooking(booking);
		setReviewRating(5);
		setReviewComment("");
		setReviewOpen(true);
	};
	const openReschedule = (booking) => {
		setRescheduleBooking(booking);
		setRescheduleDate(booking.appointment_date || "");
		setRescheduleTime(booking.appointment_time || "");
		setRescheduleOpen(true);
	};
	const handleReschedule = async () => {
		if (!rescheduleBooking || !rescheduleDate || !rescheduleTime) return;
		if (/* @__PURE__ */ new Date(rescheduleDate + "T" + rescheduleTime) < /* @__PURE__ */ new Date()) {
			toast({
				title: t("bookings.cannotPastDate"),
				variant: "destructive"
			});
			return;
		}
		setRescheduleSaving(true);
		try {
			const conflictMessage = await getProviderCalendarBookingConflictMessage(String(rescheduleBooking.provider_id || ""), rescheduleDate, rescheduleTime, Number(rescheduleBooking.duration_hour || 1));
			if (conflictMessage) {
				toast({
					title: t("bookings.rescheduleFailed"),
					description: conflictMessage,
					variant: "destructive"
				});
				return;
			}
			await updateOrderBookingDetails(Number(rescheduleBooking.id), {
				appointmentDate: rescheduleDate,
				appointmentTime: rescheduleTime,
				durationHours: Number(rescheduleBooking.duration_hour || 1),
				specialInstructions: rescheduleBooking.special_instruction || ""
			});
			toast({
				title: t("bookings.rescheduled"),
				description: t("bookings.rescheduledDesc")
			});
			setRescheduleOpen(false);
			qc.invalidateQueries({ queryKey: ["bookings"] });
			qc.invalidateQueries({ queryKey: ["providerBookings"] });
		} catch (e) {
			toast({
				title: t("bookings.rescheduleFailed"),
				description: e.message,
				variant: "destructive"
			});
		} finally {
			setRescheduleSaving(false);
		}
	};
	const handleSubmitReview = async () => {
		if (!reviewBooking) return;
		setReviewSaving(true);
		try {
			if (!authUser) throw new Error("Not authenticated");
			await createReview.mutateAsync({
				entity_id: String(reviewBooking.provider_id),
				entity_type: "provider",
				rating: reviewRating,
				comment: reviewComment
			});
			toast({ title: t("bookings.reviewSubmitted") });
			setReviewOpen(false);
			setReviewBooking(null);
			setReviewRating(5);
			setReviewComment("");
		} catch (e) {
			toast({
				title: t("bookings.reviewFailed"),
				description: e.message,
				variant: "destructive"
			});
		} finally {
			setReviewSaving(false);
		}
	};
	const allBookings = bookings || [];
	const upcoming = allBookings.filter((b) => [
		"confirmed",
		"pending",
		"in_progress"
	].includes(b.status));
	const past = allBookings.filter((b) => [
		"completed",
		"refunded",
		"cancelled",
		"cancelled_by_user",
		"cancelled_by_provider"
	].includes(b.status));
	const BookingCard = ({ booking }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "border-transparent card-elevated",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/Bookings.tsx:144:9:2f662f80148e09d1727694a6c73c8cfd39410c0737e8123153a9648d9f3477b5:1",
					className: "flex items-start justify-between mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/Bookings.tsx:145:11:33e6f92784614991cae0f3613d71c66941586a50caad3484faa92de4e2c04abd:1",
						className: "flex items-center gap-3",
						children: [booking.provider?.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							"data-inspector-source": "pages/Bookings.tsx:147:15:a9b0245704b1fb58886ab7c18d7c4f267610b53c3cf98d2d345b5080c402941c:1",
							src: booking.provider.avatar_url,
							alt: booking.provider.full_name,
							className: "w-12 h-12 rounded-xl object-cover cursor-pointer",
							onClick: () => navigate(`/caregiver/${booking.provider_id}`)
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-source": "pages/Bookings.tsx:149:15:9ff6be2474eda6b29f908c0aed45664ad62cfa5fe505ad3fd14edc52744432fd:1",
							className: "w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center cursor-pointer",
							onClick: () => navigate(`/caregiver/${booking.provider_id}`),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-source": "pages/Bookings.tsx:150:17:a224e60c6b1d52f5a0a6c4f3d6303e5b04d2483ffaa1633e60cea91571983488:1",
								className: "text-primary font-semibold",
								children: (booking.provider?.full_name || "?")[0]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "pages/Bookings.tsx:153:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								"data-inspector-source": "pages/Bookings.tsx:154:15:10a2acb638bcdc143c62f9cf3469e31a6502fa0a90537d0b940fd944fdaf57d3:1",
								className: "font-semibold text-foreground cursor-pointer hover:text-primary",
								onClick: () => navigate(`/caregiver/${booking.provider_id}`),
								children: booking.provider?.full_name || t("common.provider")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "pages/Bookings.tsx:155:15:8a32ba279cbd0c0db86229ca187f7b521111ae04327764c192a204267a8e4208:1",
								className: "text-sm text-muted-foreground",
								children: booking.service_type || "Care"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/Bookings.tsx:158:11:3f9900155b9635e4cbcd3bd763bae7c2b90165b4f1b83fed4d27f4715acbdd41:1",
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							className: statusColors[booking.status] || "bg-muted text-muted-foreground",
							children: String(t(`bookings.status.${booking.status}`, { defaultValue: booking.status.replace(/_/g, " ") }))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "min-h-11 min-w-11",
								"aria-label": t("common.actions"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "h-4 w-4" })
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
							align: "end",
							children: [
								["pending", "confirmed"].includes(booking.status) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									onClick: () => {
										setCancelTargetId(booking.id);
										setCancelTargetName(booking.provider?.full_name || t("common.provider"));
										setCancelConfirmOpen(true);
									},
									className: "text-destructive",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mr-2 h-4 w-4" }),
										" ",
										t("bookings.cancelBooking")
									]
								}),
								["pending", "confirmed"].includes(booking.status) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									onClick: () => openReschedule(booking),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-2 h-4 w-4" }),
										" ",
										t("bookings.reschedule")
									]
								}),
								booking.status === "completed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									onClick: () => openReview(booking),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "mr-2 h-4 w-4" }),
										" ",
										t("bookings.leaveReview")
									]
								}),
								[
									"completed",
									"confirmed",
									"processing"
								].includes(booking.status) && Number(booking.total_cost || 0) > 0 && !booking.refund_status && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									onClick: () => {
										setRefundBooking(booking);
										setRefundReason("");
										setRefundOpen(true);
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "mr-2 h-4 w-4" }),
										" ",
										t("bookings.requestRefund", "Request Refund")
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									onClick: () => {
										setIssueBooking(booking);
										setIssueOpen(true);
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mr-2 h-4 w-4" }),
										" ",
										t("bookings.reportIssue", "Report Issue")
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									onClick: () => handleMessage(booking),
									disabled: messagingId === booking.provider_id,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "mr-2 h-4 w-4" }),
										" ",
										t("common.message")
									]
								})
							]
						})] })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/Bookings.tsx:175:9:61cf74c3b2fedf2544fd5c7bb2f26d1b21f9c0f7d15b3e795ad2532f45f8bd26:1",
					className: "grid grid-cols-3 gap-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "pages/Bookings.tsx:176:11:e5cf4144830c9c1c2af2a3b5dd6959cc90510ba9131a7c152f377c7e1498a83b:1",
							className: "flex items-center gap-2 text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-source": "pages/Bookings.tsx:176:123:e5cf4144830c9c1c2af2a3b5dd6959cc90510ba9131a7c152f377c7e1498a83b:1",
								children: formatDate(booking.appointment_date || booking.start_time || booking.created_at, i18n.language, {
									month: "short",
									day: "numeric",
									year: "numeric"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "pages/Bookings.tsx:177:11:39d651f1d3ffa4ee0e36cc4fab8ff9ca028f1f1bd089fe8cd9fcc21dce70a288:1",
							className: "flex items-center gap-2 text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"data-inspector-source": "pages/Bookings.tsx:177:116:39d651f1d3ffa4ee0e36cc4fab8ff9ca028f1f1bd089fe8cd9fcc21dce70a288:1",
								children: [
									booking.appointment_time || "",
									" · ",
									booking.duration_hour || "",
									t("common.hours")
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-source": "pages/Bookings.tsx:178:11:eebfa4f4663e6a859c9779e3db2f46ae74a3a5315a3dae6099d035aaf80d71d5:1",
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"data-inspector-source": "pages/Bookings.tsx:178:39:eebfa4f4663e6a859c9779e3db2f46ae74a3a5315a3dae6099d035aaf80d71d5:1",
								className: "font-bold text-foreground text-lg",
								children: [i18n.language?.startsWith("zh") ? "¥" : "$", booking.total_cost || 0]
							})
						})
					]
				}),
				cleanBookingNote(booking.special_instruction) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "pages/Bookings.tsx:180:59:2518b356ba108ad829845d5964c47e7d4428879595a0d42eae665fa02eb4df95:1",
					className: "text-sm text-muted-foreground mt-3 p-2 rounded-sm bg-muted/50",
					children: cleanBookingNote(booking.special_instruction)
				}),
				!!booking.refund_status && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					"data-inspector-source": "pages/Bookings.tsx:182:11:8c368e75324f39218072cbe2158a018716f2db9df494990d6585f50bfb5db9fb:1",
					type: "button",
					onClick: () => {
						setIssueBooking(booking);
						setIssueOpen(true);
					},
					className: "mt-3 w-full flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-left hover:bg-muted/70 transition-colors",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-inspector-source": "pages/Bookings.tsx:187:13:bacdd5ac74b50da255c3640aca7509b8efaaf86e6cf8e6e03593f43e8e0f51b2:1",
						className: "text-sm text-muted-foreground",
						children: [i18n.language?.startsWith("zh") ? "退款申请" : "Refund request", !!Number(booking.refund_amount) && ` · ${i18n.language?.startsWith("zh") ? "¥" : "$"}${Number(booking.refund_amount).toFixed(2)}`]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: booking.refund_status === "approved" ? "default" : booking.refund_status === "declined" ? "destructive" : "secondary",
						children: booking.refund_status === "approved" ? i18n.language?.startsWith("zh") ? "已退款" : "Refunded" : booking.refund_status === "declined" ? i18n.language?.startsWith("zh") ? "已拒绝" : "Declined" : i18n.language?.startsWith("zh") ? "待护理者处理" : "Awaiting caregiver"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/Bookings.tsx:200:9:a8a0cdc10b4329d6d2f9c42d1acbd79e1fae400eba86560d9d4e567613e85cea:1",
					className: "flex flex-wrap gap-2 mt-3 pt-3 border-t border-border",
					children: [
						booking.status === "completed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => openReview(booking),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3.5 w-3.5 mr-1.5" }),
								" ",
								t("bookings.leaveReview")
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => {
								setIssueBooking(booking);
								setIssueOpen(true);
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-3.5 w-3.5 mr-1.5" }),
								" ",
								i18n.language?.startsWith("zh") ? "问题与退款" : "Issues & refunds"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => handleMessage(booking),
							disabled: messagingId === booking.provider_id,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-3.5 w-3.5 mr-1.5" }),
								" ",
								t("common.message")
							]
						})
					]
				})
			]
		})
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/Bookings.tsx:215:5:a8ef67586a96fb1558e64689a87f5c0e5c1993b379d27b4d72224515f1b1e4df:1",
		className: "max-w-4xl mx-auto px-4 py-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			"data-inspector-source": "pages/Bookings.tsx:216:7:e2920dbb76937f71a67e58feee247843fe6bc3c64caad6973138872d41853217:1",
			className: "sr-only",
			children: t("bookings.myBookings")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-inspector-source": "pages/Bookings.tsx:217:7:c4fa7c395339d536db25f5f96b6cde42d87aa4a53b8dfe51f31e3e228d7dacb3:1",
			className: "flex justify-center py-20",
			role: "status",
			"aria-label": t("common.loading", "Loading"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" })
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/Bookings.tsx:224:5:a8ef67586a96fb1558e64689a87f5c0e5c1993b379d27b4d72224515f1b1e4df:1",
		className: "max-w-4xl mx-auto px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/Bookings.tsx:225:7:0b496867b94319357106cf8df390be531cc988004833a109d7b0817c699314ee:1",
				className: "flex items-center justify-between gap-3 mb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/Bookings.tsx:226:9:ad6704f0e73e2aaf5297b25ad967181462ad8d1550149ddfe9e7f973738162c1:1",
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						"data-inspector-source": "pages/Bookings.tsx:227:11:8ad634a34298b89d97b23a16a156fdda68c8218e8dff0207c1dee7cd2aa6af2e:1",
						className: "text-xl sm:text-2xl font-bold text-foreground tracking-tight",
						children: t("bookings.myBookings")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "pages/Bookings.tsx:228:11:d14502a234f8f97af9792071e89abae2e8fb38398ac1ee2146e381a013ff2beb:1",
						className: "text-sm text-muted-foreground mt-0.5",
						children: t("bookings.manageCareAppointments")
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "coral",
					size: "sm",
					className: "shrink-0",
					onClick: () => navigate("/search"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "h-4 w-4 sm:mr-1" }),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-source": "pages/Bookings.tsx:230:145:7c43fe885446789fbcd43edea0ef863cba6cf498176bbb18647c7b25a65edbc3:1",
							className: "hidden sm:inline",
							children: t("bookings.bookNew")
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "upcoming",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
						value: "upcoming",
						children: [
							t("bookings.upcoming"),
							" (",
							upcoming.length,
							")"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
						value: "past",
						children: [
							t("bookings.past"),
							" (",
							past.length,
							")"
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "upcoming",
						className: "mt-4 space-y-4",
						children: upcoming.length > 0 ? upcoming.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingCard, { booking: b }, b.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "pages/Bookings.tsx:240:13:d0479225c7eb3fdfdda984ecf9c08b1ebc52ca1983bee3c3eb5bc28e034f889d:1",
							className: "text-center py-12",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "h-12 w-12 text-muted-foreground/30 mx-auto mb-3" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-source": "pages/Bookings.tsx:242:15:ed356ddbe85d0187a632112a360868b344fac815422522b81d406fb2c1319371:1",
									className: "text-muted-foreground",
									children: t("bookings.noUpcoming")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "coral",
									className: "mt-4",
									onClick: () => navigate("/search"),
									children: t("bookings.findCaregiver")
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "past",
						className: "mt-4 space-y-4",
						children: past.length > 0 ? past.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingCard, { booking: b }, b.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-source": "pages/Bookings.tsx:249:13:c7ed4957b38f788afdeaf67b9a21021840a38a5459bea6dd67a1b28a6d2a986a:1",
							className: "text-center py-12",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "pages/Bookings.tsx:249:48:c7ed4957b38f788afdeaf67b9a21021840a38a5459bea6dd67a1b28a6d2a986a:1",
								className: "text-muted-foreground",
								children: t("bookings.noPast")
							})
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: cancelConfirmOpen,
				onOpenChange: setCancelConfirmOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-5 w-5 text-destructive" }),
						" ",
						t("bookings.cancelConfirmTitle")
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: t("bookings.cancelConfirmDesc", { name: cancelTargetName }) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "gap-2 sm:gap-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setCancelConfirmOpen(false),
						children: t("bookings.keepBooking")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "destructive",
						onClick: () => {
							if (cancelTargetId) {
								handleStatusUpdate(cancelTargetId, "cancelled_by_user");
								setCancelConfirmOpen(false);
								setCancelTargetId(null);
							}
						},
						children: t("bookings.yesCancel")
					})]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: rescheduleOpen,
				onOpenChange: setRescheduleOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-5 w-5 text-primary" }),
							" ",
							t("bookings.rescheduleTitle")
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: t("bookings.rescheduleDesc", { name: rescheduleBooking?.provider?.full_name || t("common.provider") }) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/Bookings.tsx:275:11:1ac5ea4d441b4926f94bcb09515e7e5ebd280c0295c90fc7a30b7a08f2a729c8:1",
						className: "space-y-4 mt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "pages/Bookings.tsx:276:13:37078065acf0e00bda900d47a69b1df85a33458fc30b9f78a703de0c2b5b767c:1",
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/Bookings.tsx:277:15:4b6ca590475f17c5f1b9ae6380b9142063bca2d2c7d6efa04faa46e33bbf8aea:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("bookings.newDate") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									value: rescheduleDate,
									onChange: (e) => setRescheduleDate(e.target.value),
									min: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/Bookings.tsx:278:15:4972874c5a2901e06170963b140841a523174f831327c0f976e6a8c1b5e5d1dc:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("bookings.newTime") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "time",
									value: rescheduleTime,
									onChange: (e) => setRescheduleTime(e.target.value)
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "gap-2 sm:gap-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setRescheduleOpen(false),
								children: t("common.cancel")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "coral",
								onClick: handleReschedule,
								disabled: rescheduleSaving || !rescheduleDate || !rescheduleTime,
								children: [rescheduleSaving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4 mr-2" }), t("bookings.reschedule")]
							})]
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: reviewOpen,
				onOpenChange: setReviewOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-5 w-5 text-warning" }),
							" ",
							t("bookings.leaveReview")
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: t("bookings.reviewDesc", { name: reviewBooking?.provider?.full_name || t("common.provider") }) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/Bookings.tsx:298:11:1ac5ea4d441b4926f94bcb09515e7e5ebd280c0295c90fc7a30b7a08f2a729c8:1",
						className: "space-y-4 mt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/Bookings.tsx:299:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("bookings.rating") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-source": "pages/Bookings.tsx:301:15:2c6da401d5d12de62928fa5d4b3c0bab72a13549b9944c529af814e22a331633:1",
									className: "flex gap-1 mt-1",
									children: [
										1,
										2,
										3,
										4,
										5
									].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										"data-inspector-source": "pages/Bookings.tsx:303:19:95ba0669192ca33f2b91af78c42e1b8fd54cc19bc35f75deccdf78229785068f:1",
										type: "button",
										"aria-label": `${s} ${t("bookings.rating")}`,
										"aria-pressed": s === reviewRating,
										onClick: () => setReviewRating(s),
										className: "min-h-11 min-w-11 flex items-center justify-center rounded-md transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: `h-6 w-6 ${s <= reviewRating ? "text-warning fill-warning" : "text-muted-foreground"}` })
									}, s))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/Bookings.tsx:309:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("bookings.comment") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									value: reviewComment,
									onChange: (e) => setReviewComment(e.target.value),
									placeholder: t("bookings.reviewPlaceholder"),
									rows: 3
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
								className: "gap-2 sm:gap-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => setReviewOpen(false),
									children: t("common.cancel")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "coral",
									onClick: handleSubmitReview,
									disabled: reviewSaving,
									children: [reviewSaving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-4 w-4 mr-2" }), t("bookings.submitReview")]
								})]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: refundOpen,
				onOpenChange: setRefundOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-5 w-5 text-warning" }),
							" ",
							t("bookings.requestRefund", "Request Refund")
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: t("bookings.refundDesc", `Request a refund for your booking with ${refundBooking?.provider?.full_name || "provider"}.`) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/Bookings.tsx:330:11:1ac5ea4d441b4926f94bcb09515e7e5ebd280c0295c90fc7a30b7a08f2a729c8:1",
						className: "space-y-4 mt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-source": "pages/Bookings.tsx:331:13:5380b2b79e33697687caebd9d4719a7deb7774951c3fed6f29abcf2230244c8f:1",
								className: "rounded-lg bg-muted/40 p-3 text-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "pages/Bookings.tsx:332:15:0b0b1fbb442255c22787daeb2f7986dad046037c6a0bc5d67397aff13a4bfb99:1",
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-source": "pages/Bookings.tsx:332:53:0b0b1fbb442255c22787daeb2f7986dad046037c6a0bc5d67397aff13a4bfb99:0",
										className: "text-muted-foreground",
										children: t("bookings.orderTotal", "Order Total")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										"data-inspector-source": "pages/Bookings.tsx:332:141:0b0b1fbb442255c22787daeb2f7986dad046037c6a0bc5d67397aff13a4bfb99:0",
										className: "font-bold",
										children: [i18n.language?.startsWith("zh") ? "¥" : "$", refundBooking?.total_cost || 0]
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/Bookings.tsx:334:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("bookings.refundReason", "Reason for refund") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									value: refundReason,
									onChange: (e) => setRefundReason(e.target.value),
									placeholder: t("bookings.refundReasonPlaceholder", "Please describe why you are requesting a refund..."),
									rows: 3
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
								className: "gap-2 sm:gap-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => setRefundOpen(false),
									children: t("common.cancel")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "coral",
									disabled: requestRefund.isPending || !refundReason.trim(),
									onClick: async () => {
										if (!refundBooking) return;
										try {
											await requestRefund.mutateAsync({
												orderId: Number(refundBooking.id),
												amount: String(refundBooking.total_cost || ""),
												reason: refundReason.trim()
											});
											setRefundOpen(false);
											setRefundBooking(null);
											setRefundReason("");
										} catch {}
									},
									children: [requestRefund.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-4 w-4 mr-2" }), t("bookings.submitRefund", "Submit Refund Request")]
								})]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingThreadDialog, {
				open: issueOpen,
				onOpenChange: setIssueOpen,
				orderId: issueBooking?.id,
				role: "client",
				counterpartName: issueBooking?.provider?.full_name,
				refundStatus: issueBooking?.refund_status,
				refundReason: issueBooking?.refund_reason,
				refundAmount: issueBooking?.refund_amount
			})
		]
	});
}
function RouteBookingsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFeature, {
		name: "paidCaregivers",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookings, {}) })
	});
}
//#endregion
export { RouteBookingsPage as component };
