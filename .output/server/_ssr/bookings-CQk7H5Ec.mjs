import { s as __toESM } from "../_runtime.mjs";
import { t as cleanBookingNote } from "./utils-CcHv9xqZ.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { t as Badge } from "./badge-B2YCAhUo.mjs";
import { t as Input } from "./input-4rcasKp7.mjs";
import { t as Textarea } from "./textarea-ZNemOC_7.mjs";
import { t as formatDate } from "./locale-DKwjQju2.mjs";
import { Ln as CalendarDays, St as MessageSquare, T as Star, _ as TriangleAlert, cn as Ellipsis, dn as DollarSign, et as RefreshCw, jt as LoaderCircle, n as X, vn as Clock } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-C88F3k7U.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { y as updateOrderBookingDetails } from "./woocommerce-api-BoF1FQHg.mjs";
import { Bn as useStartConversation, S as useBookings, Xn as useUpdateBookingStatus, at as useCreateReview } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-HRlnwchH.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { i as useNavigate$1 } from "./router-compat-CRbRSfhz.mjs";
import { t as RequireAuth } from "./RequireAuth-ZXtI8ZPo.mjs";
import { a as DropdownMenuTrigger, n as DropdownMenuContent, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-BehT_ZHg.mjs";
import { u as useRequestRefund } from "./use-cart-B3rnJV3i.mjs";
import { t as SiteFeature } from "./SiteFeature-Diz6swln.mjs";
import { r as getProviderCalendarBookingConflictMessage } from "./booking-availability-CfcSrbaA.mjs";
import { t as BookingThreadDialog } from "./BookingThreadDialog-C9wadivV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bookings-CQk7H5Ec.js
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
		"data-inspector-id": "pages/Bookings/BookingCard/Card/0",
		"data-inspector-source": "pages/Bookings.tsx:142:5:361b72a9932b9a2e80c11375a968bc01d241b7d501547dded35951b1465bc544:1",
		className: "border-transparent card-elevated",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			"data-inspector-id": "pages/Bookings/BookingCard/CardContent/0",
			"data-inspector-source": "pages/Bookings.tsx:143:7:8a91a7a2a472ad2d03d8514d1781716a4296d2110d401237a515c0ccdc7aaf82:1",
			className: "p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/Bookings/BookingCard/div/0",
					"data-inspector-source": "pages/Bookings.tsx:144:9:2f662f80148e09d1727694a6c73c8cfd39410c0737e8123153a9648d9f3477b5:1",
					className: "flex items-start justify-between mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/Bookings/BookingCard/div/1",
						"data-inspector-source": "pages/Bookings.tsx:145:11:33e6f92784614991cae0f3613d71c66941586a50caad3484faa92de4e2c04abd:1",
						className: "flex items-center gap-3",
						children: [booking.provider?.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							"data-inspector-id": "pages/Bookings/BookingCard/img/0",
							"data-inspector-source": "pages/Bookings.tsx:147:15:a9b0245704b1fb58886ab7c18d7c4f267610b53c3cf98d2d345b5080c402941c:1",
							src: booking.provider.avatar_url,
							alt: booking.provider.full_name,
							className: "w-12 h-12 rounded-xl object-cover cursor-pointer",
							onClick: () => navigate(`/caregiver/${booking.provider_id}`)
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-id": "pages/Bookings/BookingCard/div/2",
							"data-inspector-source": "pages/Bookings.tsx:149:15:9ff6be2474eda6b29f908c0aed45664ad62cfa5fe505ad3fd14edc52744432fd:1",
							className: "w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center cursor-pointer",
							onClick: () => navigate(`/caregiver/${booking.provider_id}`),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-id": "pages/Bookings/BookingCard/span/0",
								"data-inspector-source": "pages/Bookings.tsx:150:17:a224e60c6b1d52f5a0a6c4f3d6303e5b04d2483ffaa1633e60cea91571983488:1",
								className: "text-primary font-semibold",
								children: (booking.provider?.full_name || "?")[0]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/Bookings/BookingCard/div/3",
							"data-inspector-source": "pages/Bookings.tsx:153:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								"data-inspector-id": "pages/Bookings/BookingCard/h3/0",
								"data-inspector-source": "pages/Bookings.tsx:154:15:10a2acb638bcdc143c62f9cf3469e31a6502fa0a90537d0b940fd944fdaf57d3:1",
								className: "font-semibold text-foreground cursor-pointer hover:text-primary",
								onClick: () => navigate(`/caregiver/${booking.provider_id}`),
								children: booking.provider?.full_name || t("common.provider")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/Bookings/BookingCard/p/0",
								"data-inspector-source": "pages/Bookings.tsx:155:15:8a32ba279cbd0c0db86229ca187f7b521111ae04327764c192a204267a8e4208:1",
								className: "text-sm text-muted-foreground",
								children: booking.service_type || "Care"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/Bookings/BookingCard/div/4",
						"data-inspector-source": "pages/Bookings.tsx:158:11:3f9900155b9635e4cbcd3bd763bae7c2b90165b4f1b83fed4d27f4715acbdd41:1",
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							"data-inspector-id": "pages/Bookings/BookingCard/Badge/0",
							"data-inspector-source": "pages/Bookings.tsx:159:13:51fbca5be337175d3118040268bac59b0dfef10a1588a83b696b57a62826759d:1",
							className: statusColors[booking.status] || "bg-muted text-muted-foreground",
							children: String(t(`bookings.status.${booking.status}`, { defaultValue: booking.status.replace(/_/g, " ") }))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
							"data-inspector-id": "pages/Bookings/BookingCard/DropdownMenu/0",
							"data-inspector-source": "pages/Bookings.tsx:160:13:83073324732090ac801fac798be2f9b7520fbf35e581bc6f101530d563e16dbe:1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
								"data-inspector-id": "pages/Bookings/BookingCard/DropdownMenuTrigger/0",
								"data-inspector-source": "pages/Bookings.tsx:161:15:c3bf73210512022a31594df11f895cf638f0b48008c966242af98912216c20a5:1",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "pages/Bookings/BookingCard/Button/0",
									"data-inspector-source": "pages/Bookings.tsx:161:44:c3bf73210512022a31594df11f895cf638f0b48008c966242af98912216c20a5:1",
									variant: "ghost",
									size: "icon",
									className: "min-h-11 min-w-11",
									"aria-label": t("common.actions"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, {
										"data-inspector-id": "pages/Bookings/BookingCard/MoreHorizontal/0",
										"data-inspector-source": "pages/Bookings.tsx:161:143:c3bf73210512022a31594df11f895cf638f0b48008c966242af98912216c20a5:1",
										className: "h-4 w-4"
									})
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
								"data-inspector-id": "pages/Bookings/BookingCard/DropdownMenuContent/0",
								"data-inspector-source": "pages/Bookings.tsx:162:15:1335fbe770b30a44045ff1680672a264e2d5f4f0fab75338b2064e8e87f5d4b4:1",
								align: "end",
								children: [
									["pending", "confirmed"].includes(booking.status) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										"data-inspector-id": "pages/Bookings/BookingCard/DropdownMenuItem/0",
										"data-inspector-source": "pages/Bookings.tsx:163:71:7e06a9fbdce038d923512a47fd01b41b0af421f76197582a5b83644d9ac11d0a:1",
										onClick: () => {
											setCancelTargetId(booking.id);
											setCancelTargetName(booking.provider?.full_name || t("common.provider"));
											setCancelConfirmOpen(true);
										},
										className: "text-destructive",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
												"data-inspector-id": "pages/Bookings/BookingCard/X/0",
												"data-inspector-source": "pages/Bookings.tsx:163:271:7e06a9fbdce038d923512a47fd01b41b0af421f76197582a5b83644d9ac11d0a:1",
												className: "mr-2 h-4 w-4"
											}),
											" ",
											t("bookings.cancelBooking")
										]
									}),
									["pending", "confirmed"].includes(booking.status) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										"data-inspector-id": "pages/Bookings/BookingCard/DropdownMenuItem/1",
										"data-inspector-source": "pages/Bookings.tsx:164:71:d453d23bfb92e0fb6c971d8dc1a9ab465f906493dc374e2709c6fc3f45cacfd4:1",
										onClick: () => openReschedule(booking),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
												"data-inspector-id": "pages/Bookings/BookingCard/RefreshCw/0",
												"data-inspector-source": "pages/Bookings.tsx:164:129:d453d23bfb92e0fb6c971d8dc1a9ab465f906493dc374e2709c6fc3f45cacfd4:1",
												className: "mr-2 h-4 w-4"
											}),
											" ",
											t("bookings.reschedule")
										]
									}),
									booking.status === "completed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										"data-inspector-id": "pages/Bookings/BookingCard/DropdownMenuItem/2",
										"data-inspector-source": "pages/Bookings.tsx:165:52:b6aeb62ebe543ba8933abd9c5f0b83769116b66f7fbac27058c8681995523c44:1",
										onClick: () => openReview(booking),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
												"data-inspector-id": "pages/Bookings/BookingCard/Star/0",
												"data-inspector-source": "pages/Bookings.tsx:165:106:b6aeb62ebe543ba8933abd9c5f0b83769116b66f7fbac27058c8681995523c44:1",
												className: "mr-2 h-4 w-4"
											}),
											" ",
											t("bookings.leaveReview")
										]
									}),
									[
										"completed",
										"confirmed",
										"processing"
									].includes(booking.status) && Number(booking.total_cost || 0) > 0 && !booking.refund_status && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										"data-inspector-id": "pages/Bookings/BookingCard/DropdownMenuItem/3",
										"data-inspector-source": "pages/Bookings.tsx:167:19:2907bb5de5d08db4036a5f195007a8c22fc95988dd964d1fd2412fe5cfff1489:1",
										onClick: () => {
											setRefundBooking(booking);
											setRefundReason("");
											setRefundOpen(true);
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, {
												"data-inspector-id": "pages/Bookings/BookingCard/DollarSign/0",
												"data-inspector-source": "pages/Bookings.tsx:167:126:2907bb5de5d08db4036a5f195007a8c22fc95988dd964d1fd2412fe5cfff1489:1",
												className: "mr-2 h-4 w-4"
											}),
											" ",
											t("bookings.requestRefund", "Request Refund")
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										"data-inspector-id": "pages/Bookings/BookingCard/DropdownMenuItem/4",
										"data-inspector-source": "pages/Bookings.tsx:169:17:17b17197ed06d5fdf307a258be4aed4818d3bafce006f1791db734c1578c86bb:1",
										onClick: () => {
											setIssueBooking(booking);
											setIssueOpen(true);
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
												"data-inspector-id": "pages/Bookings/BookingCard/AlertTriangle/0",
												"data-inspector-source": "pages/Bookings.tsx:169:101:17b17197ed06d5fdf307a258be4aed4818d3bafce006f1791db734c1578c86bb:1",
												className: "mr-2 h-4 w-4"
											}),
											" ",
											t("bookings.reportIssue", "Report Issue")
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										"data-inspector-id": "pages/Bookings/BookingCard/DropdownMenuItem/5",
										"data-inspector-source": "pages/Bookings.tsx:170:17:670dffe8615830d82dc824fb589a3cf9e3c8b11e9d896bc13e894b9f69fc1d65:1",
										onClick: () => handleMessage(booking),
										disabled: messagingId === booking.provider_id,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, {
												"data-inspector-id": "pages/Bookings/BookingCard/MessageSquare/0",
												"data-inspector-source": "pages/Bookings.tsx:170:121:670dffe8615830d82dc824fb589a3cf9e3c8b11e9d896bc13e894b9f69fc1d65:1",
												className: "mr-2 h-4 w-4"
											}),
											" ",
											t("common.message")
										]
									})
								]
							})]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/Bookings/BookingCard/div/5",
					"data-inspector-source": "pages/Bookings.tsx:175:9:61cf74c3b2fedf2544fd5c7bb2f26d1b21f9c0f7d15b3e795ad2532f45f8bd26:1",
					className: "grid grid-cols-3 gap-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/Bookings/BookingCard/div/6",
							"data-inspector-source": "pages/Bookings.tsx:176:11:e5cf4144830c9c1c2af2a3b5dd6959cc90510ba9131a7c152f377c7e1498a83b:1",
							className: "flex items-center gap-2 text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, {
								"data-inspector-id": "pages/Bookings/BookingCard/CalendarDays/0",
								"data-inspector-source": "pages/Bookings.tsx:176:74:e5cf4144830c9c1c2af2a3b5dd6959cc90510ba9131a7c152f377c7e1498a83b:1",
								className: "h-4 w-4 text-primary"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-id": "pages/Bookings/BookingCard/span/1",
								"data-inspector-source": "pages/Bookings.tsx:176:123:e5cf4144830c9c1c2af2a3b5dd6959cc90510ba9131a7c152f377c7e1498a83b:1",
								children: formatDate(booking.appointment_date || booking.start_time || booking.created_at, i18n.language, {
									month: "short",
									day: "numeric",
									year: "numeric"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/Bookings/BookingCard/div/7",
							"data-inspector-source": "pages/Bookings.tsx:177:11:39d651f1d3ffa4ee0e36cc4fab8ff9ca028f1f1bd089fe8cd9fcc21dce70a288:1",
							className: "flex items-center gap-2 text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
								"data-inspector-id": "pages/Bookings/BookingCard/Clock/0",
								"data-inspector-source": "pages/Bookings.tsx:177:74:39d651f1d3ffa4ee0e36cc4fab8ff9ca028f1f1bd089fe8cd9fcc21dce70a288:1",
								className: "h-4 w-4 text-primary"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"data-inspector-id": "pages/Bookings/BookingCard/span/2",
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
							"data-inspector-id": "pages/Bookings/BookingCard/div/8",
							"data-inspector-source": "pages/Bookings.tsx:178:11:eebfa4f4663e6a859c9779e3db2f46ae74a3a5315a3dae6099d035aaf80d71d5:1",
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"data-inspector-id": "pages/Bookings/BookingCard/span/3",
								"data-inspector-source": "pages/Bookings.tsx:178:39:eebfa4f4663e6a859c9779e3db2f46ae74a3a5315a3dae6099d035aaf80d71d5:1",
								className: "font-bold text-foreground text-lg",
								children: [i18n.language?.startsWith("zh") ? "¥" : "$", booking.total_cost || 0]
							})
						})
					]
				}),
				cleanBookingNote(booking.special_instruction) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-id": "pages/Bookings/BookingCard/p/1",
					"data-inspector-source": "pages/Bookings.tsx:180:59:2518b356ba108ad829845d5964c47e7d4428879595a0d42eae665fa02eb4df95:1",
					className: "text-sm text-muted-foreground mt-3 p-2 rounded-sm bg-muted/50",
					children: cleanBookingNote(booking.special_instruction)
				}),
				!!booking.refund_status && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					"data-inspector-id": "pages/Bookings/BookingCard/button/0",
					"data-inspector-source": "pages/Bookings.tsx:182:11:8c368e75324f39218072cbe2158a018716f2db9df494990d6585f50bfb5db9fb:1",
					type: "button",
					onClick: () => {
						setIssueBooking(booking);
						setIssueOpen(true);
					},
					className: "mt-3 w-full flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-left hover:bg-muted/70 transition-colors",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-inspector-id": "pages/Bookings/BookingCard/span/4",
						"data-inspector-source": "pages/Bookings.tsx:187:13:bacdd5ac74b50da255c3640aca7509b8efaaf86e6cf8e6e03593f43e8e0f51b2:1",
						className: "text-sm text-muted-foreground",
						children: [i18n.language?.startsWith("zh") ? "退款申请" : "Refund request", !!Number(booking.refund_amount) && ` · ${i18n.language?.startsWith("zh") ? "¥" : "$"}${Number(booking.refund_amount).toFixed(2)}`]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						"data-inspector-id": "pages/Bookings/BookingCard/Badge/1",
						"data-inspector-source": "pages/Bookings.tsx:191:13:bf66c0d3ee719853d2d56b8078b2e9959245a6254050ffdfbecb8d18093748e1:1",
						variant: booking.refund_status === "approved" ? "default" : booking.refund_status === "declined" ? "destructive" : "secondary",
						children: booking.refund_status === "approved" ? i18n.language?.startsWith("zh") ? "已退款" : "Refunded" : booking.refund_status === "declined" ? i18n.language?.startsWith("zh") ? "已拒绝" : "Declined" : i18n.language?.startsWith("zh") ? "待护理者处理" : "Awaiting caregiver"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/Bookings/BookingCard/div/9",
					"data-inspector-source": "pages/Bookings.tsx:200:9:a8a0cdc10b4329d6d2f9c42d1acbd79e1fae400eba86560d9d4e567613e85cea:1",
					className: "flex flex-wrap gap-2 mt-3 pt-3 border-t border-border",
					children: [
						booking.status === "completed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							"data-inspector-id": "pages/Bookings/BookingCard/Button/1",
							"data-inspector-source": "pages/Bookings.tsx:202:13:40f86239bdc1df85648724b2aedda028fe6a1903a63e1b36ec50a002d88e1c32:1",
							variant: "outline",
							size: "sm",
							onClick: () => openReview(booking),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
									"data-inspector-id": "pages/Bookings/BookingCard/Star/1",
									"data-inspector-source": "pages/Bookings.tsx:202:85:40f86239bdc1df85648724b2aedda028fe6a1903a63e1b36ec50a002d88e1c32:1",
									className: "h-3.5 w-3.5 mr-1.5"
								}),
								" ",
								t("bookings.leaveReview")
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							"data-inspector-id": "pages/Bookings/BookingCard/Button/2",
							"data-inspector-source": "pages/Bookings.tsx:204:11:ce3b4fdcc5371552431bd2d862d2000a6770bbe446a7dc28459462e5ddda0999:1",
							variant: "ghost",
							size: "sm",
							onClick: () => {
								setIssueBooking(booking);
								setIssueOpen(true);
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
									"data-inspector-id": "pages/Bookings/BookingCard/AlertTriangle/1",
									"data-inspector-source": "pages/Bookings.tsx:205:13:baeae8399b4cf4594a86db5165031a679b225110575a371f12dea3878ba7a3cc:1",
									className: "h-3.5 w-3.5 mr-1.5"
								}),
								" ",
								i18n.language?.startsWith("zh") ? "问题与退款" : "Issues & refunds"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							"data-inspector-id": "pages/Bookings/BookingCard/Button/3",
							"data-inspector-source": "pages/Bookings.tsx:207:11:08fd2ae668014d047ac8476a384a131d9f9535d1b4d26a9713c9287f8c686d1e:1",
							variant: "ghost",
							size: "sm",
							onClick: () => handleMessage(booking),
							disabled: messagingId === booking.provider_id,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, {
									"data-inspector-id": "pages/Bookings/BookingCard/MessageSquare/1",
									"data-inspector-source": "pages/Bookings.tsx:207:131:08fd2ae668014d047ac8476a384a131d9f9535d1b4d26a9713c9287f8c686d1e:1",
									className: "h-3.5 w-3.5 mr-1.5"
								}),
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
		"data-inspector-id": "pages/Bookings/Bookings/div/0",
		"data-inspector-source": "pages/Bookings.tsx:215:5:a8ef67586a96fb1558e64689a87f5c0e5c1993b379d27b4d72224515f1b1e4df:1",
		className: "max-w-4xl mx-auto px-4 py-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			"data-inspector-id": "pages/Bookings/Bookings/h1/0",
			"data-inspector-source": "pages/Bookings.tsx:216:7:e2920dbb76937f71a67e58feee247843fe6bc3c64caad6973138872d41853217:1",
			className: "sr-only",
			children: t("bookings.myBookings")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-inspector-id": "pages/Bookings/Bookings/div/1",
			"data-inspector-source": "pages/Bookings.tsx:217:7:c4fa7c395339d536db25f5f96b6cde42d87aa4a53b8dfe51f31e3e228d7dacb3:1",
			className: "flex justify-center py-20",
			role: "status",
			"aria-label": t("common.loading", "Loading"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
				"data-inspector-id": "pages/Bookings/Bookings/Loader2/0",
				"data-inspector-source": "pages/Bookings.tsx:218:9:b12edf47edd3c5728bfdcd553e6d89df192571e57e35d9579688d4485c1ee5c6:1",
				className: "h-8 w-8 animate-spin text-muted-foreground"
			})
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "pages/Bookings/Bookings/div/2",
		"data-inspector-source": "pages/Bookings.tsx:224:5:a8ef67586a96fb1558e64689a87f5c0e5c1993b379d27b4d72224515f1b1e4df:1",
		className: "max-w-4xl mx-auto px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/Bookings/Bookings/div/3",
				"data-inspector-source": "pages/Bookings.tsx:225:7:0b496867b94319357106cf8df390be531cc988004833a109d7b0817c699314ee:1",
				className: "flex items-center justify-between gap-3 mb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/Bookings/Bookings/div/4",
					"data-inspector-source": "pages/Bookings.tsx:226:9:ad6704f0e73e2aaf5297b25ad967181462ad8d1550149ddfe9e7f973738162c1:1",
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						"data-inspector-id": "pages/Bookings/Bookings/h1/1",
						"data-inspector-source": "pages/Bookings.tsx:227:11:8ad634a34298b89d97b23a16a156fdda68c8218e8dff0207c1dee7cd2aa6af2e:1",
						className: "text-xl sm:text-2xl font-bold text-foreground tracking-tight",
						children: t("bookings.myBookings")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "pages/Bookings/Bookings/p/0",
						"data-inspector-source": "pages/Bookings.tsx:228:11:d14502a234f8f97af9792071e89abae2e8fb38398ac1ee2146e381a013ff2beb:1",
						className: "text-sm text-muted-foreground mt-0.5",
						children: t("bookings.manageCareAppointments")
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					"data-inspector-id": "pages/Bookings/Bookings/Button/0",
					"data-inspector-source": "pages/Bookings.tsx:230:9:7c43fe885446789fbcd43edea0ef863cba6cf498176bbb18647c7b25a65edbc3:1",
					variant: "coral",
					size: "sm",
					className: "shrink-0",
					onClick: () => navigate("/search"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, {
							"data-inspector-id": "pages/Bookings/Bookings/CalendarDays/0",
							"data-inspector-source": "pages/Bookings.tsx:230:100:7c43fe885446789fbcd43edea0ef863cba6cf498176bbb18647c7b25a65edbc3:1",
							className: "h-4 w-4 sm:mr-1"
						}),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-id": "pages/Bookings/Bookings/span/0",
							"data-inspector-source": "pages/Bookings.tsx:230:145:7c43fe885446789fbcd43edea0ef863cba6cf498176bbb18647c7b25a65edbc3:1",
							className: "hidden sm:inline",
							children: t("bookings.bookNew")
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				"data-inspector-id": "pages/Bookings/Bookings/Tabs/0",
				"data-inspector-source": "pages/Bookings.tsx:233:7:afe81c5649d10e5c780288127b96c001ffbfbc48f4b16dc21a52ebd9ec701dd1:1",
				defaultValue: "upcoming",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						"data-inspector-id": "pages/Bookings/Bookings/TabsList/0",
						"data-inspector-source": "pages/Bookings.tsx:234:9:4b05dc84f0cdcbdff176b1e2f9c69a11169a1c8c095e9713d91cf612dabd54c4:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							"data-inspector-id": "pages/Bookings/Bookings/TabsTrigger/0",
							"data-inspector-source": "pages/Bookings.tsx:235:11:63ca261c18b9c599a3b432958827196febe1825a15d09041f6cb787ed1c92b15:1",
							value: "upcoming",
							children: [
								t("bookings.upcoming"),
								" (",
								upcoming.length,
								")"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							"data-inspector-id": "pages/Bookings/Bookings/TabsTrigger/1",
							"data-inspector-source": "pages/Bookings.tsx:236:11:22957317f8e177885264a0b2f04d3efd0a0551906a1a8fc120bde7ca2c4fa557:1",
							value: "past",
							children: [
								t("bookings.past"),
								" (",
								past.length,
								")"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						"data-inspector-id": "pages/Bookings/Bookings/TabsContent/0",
						"data-inspector-source": "pages/Bookings.tsx:238:9:e6c1b81b7ecb02b8ba82248b76609bc4d7fcc8a5344e04f109d1e6d9bb406fcc:1",
						value: "upcoming",
						className: "mt-4 space-y-4",
						children: upcoming.length > 0 ? upcoming.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingCard, {
							"data-inspector-id": "pages/Bookings/Bookings/BookingCard/0",
							"data-inspector-source": "pages/Bookings.tsx:239:59:a7d0d03543d238d12f2def1482b26c9c3021dd3ea7a8ea9a55221cfd8e5c8d1c:1",
							booking: b
						}, b.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/Bookings/Bookings/div/5",
							"data-inspector-source": "pages/Bookings.tsx:240:13:d0479225c7eb3fdfdda984ecf9c08b1ebc52ca1983bee3c3eb5bc28e034f889d:1",
							className: "text-center py-12",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, {
									"data-inspector-id": "pages/Bookings/Bookings/CalendarDays/1",
									"data-inspector-source": "pages/Bookings.tsx:241:15:abc0873c5edb8e629f0029d4557eeff949c9c1f216c7cfa7f0b5ec2f02ea9b79:1",
									className: "h-12 w-12 text-muted-foreground/30 mx-auto mb-3"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-id": "pages/Bookings/Bookings/p/1",
									"data-inspector-source": "pages/Bookings.tsx:242:15:ed356ddbe85d0187a632112a360868b344fac815422522b81d406fb2c1319371:1",
									className: "text-muted-foreground",
									children: t("bookings.noUpcoming")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "pages/Bookings/Bookings/Button/1",
									"data-inspector-source": "pages/Bookings.tsx:243:15:cd712559c86ef05726517d7c4a15c29218bc63ccb7e9e0ca97aab57fa371825c:1",
									variant: "coral",
									className: "mt-4",
									onClick: () => navigate("/search"),
									children: t("bookings.findCaregiver")
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						"data-inspector-id": "pages/Bookings/Bookings/TabsContent/1",
						"data-inspector-source": "pages/Bookings.tsx:247:9:8a6a1c0a5f5f210db79e3822e1fb2827c3fb49d828f8e026237c271b8607b2fa:1",
						value: "past",
						className: "mt-4 space-y-4",
						children: past.length > 0 ? past.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingCard, {
							"data-inspector-id": "pages/Bookings/Bookings/BookingCard/1",
							"data-inspector-source": "pages/Bookings.tsx:248:51:88f58ea57da675d7e07bdefa3ee534075e8f4228449a6b57af8056b0e3817a7a:1",
							booking: b
						}, b.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-id": "pages/Bookings/Bookings/div/6",
							"data-inspector-source": "pages/Bookings.tsx:249:13:c7ed4957b38f788afdeaf67b9a21021840a38a5459bea6dd67a1b28a6d2a986a:1",
							className: "text-center py-12",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/Bookings/Bookings/p/2",
								"data-inspector-source": "pages/Bookings.tsx:249:48:c7ed4957b38f788afdeaf67b9a21021840a38a5459bea6dd67a1b28a6d2a986a:1",
								className: "text-muted-foreground",
								children: t("bookings.noPast")
							})
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				"data-inspector-id": "pages/Bookings/Bookings/Dialog/0",
				"data-inspector-source": "pages/Bookings.tsx:255:7:3bff6fc360dea214da43088fb39907084e179a8dd79ede1ce5aaa4e34c2eb1cd:1",
				open: cancelConfirmOpen,
				onOpenChange: setCancelConfirmOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					"data-inspector-id": "pages/Bookings/Bookings/DialogContent/0",
					"data-inspector-source": "pages/Bookings.tsx:256:9:a1db9351f2bc97608c8aaec7c954792a0a22e6a3d66d076f63a06f6c1dd1b96a:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
						"data-inspector-id": "pages/Bookings/Bookings/DialogHeader/0",
						"data-inspector-source": "pages/Bookings.tsx:257:11:f3baf1571d8ce48392ac850c82c313f167b22021224d9cc9f1db77c5581f7169:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							"data-inspector-id": "pages/Bookings/Bookings/DialogTitle/0",
							"data-inspector-source": "pages/Bookings.tsx:258:13:5b012f4479c8b728c75ddd66433fa7f6b275db3e8d36d9ecb35dc0bc2808763c:1",
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
									"data-inspector-id": "pages/Bookings/Bookings/AlertTriangle/0",
									"data-inspector-source": "pages/Bookings.tsx:258:62:5b012f4479c8b728c75ddd66433fa7f6b275db3e8d36d9ecb35dc0bc2808763c:1",
									className: "h-5 w-5 text-destructive"
								}),
								" ",
								t("bookings.cancelConfirmTitle")
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							"data-inspector-id": "pages/Bookings/Bookings/DialogDescription/0",
							"data-inspector-source": "pages/Bookings.tsx:259:13:d97d527e3458aac7080dfc9f4f75b52ff91d7b7f18c62552e5dbe5ba86aa2443:1",
							children: t("bookings.cancelConfirmDesc", { name: cancelTargetName })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
						"data-inspector-id": "pages/Bookings/Bookings/DialogFooter/0",
						"data-inspector-source": "pages/Bookings.tsx:261:11:2c4588d35c249cf1d1499cf531ad3910d7d3824ab72c5418afd40b67526d5f10:1",
						className: "gap-2 sm:gap-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							"data-inspector-id": "pages/Bookings/Bookings/Button/2",
							"data-inspector-source": "pages/Bookings.tsx:262:13:af1ceb16f4a81ee05fbf6bf8f9956bac17922dd12ae91f081d4a08024ec8fa37:1",
							variant: "outline",
							onClick: () => setCancelConfirmOpen(false),
							children: t("bookings.keepBooking")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							"data-inspector-id": "pages/Bookings/Bookings/Button/3",
							"data-inspector-source": "pages/Bookings.tsx:263:13:19911abffe4d1c45d986727f455d7ca913dbfae7b0475f187c0d65cb688cb9a9:1",
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
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				"data-inspector-id": "pages/Bookings/Bookings/Dialog/1",
				"data-inspector-source": "pages/Bookings.tsx:269:7:a50618abcba5f57700997bbae8f8ee6c99b1a3a6aeed2a576f8e85bb6aecd98b:1",
				open: rescheduleOpen,
				onOpenChange: setRescheduleOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					"data-inspector-id": "pages/Bookings/Bookings/DialogContent/1",
					"data-inspector-source": "pages/Bookings.tsx:270:9:587a0b15f68db296207bf20f021c4629ce833c63ecd28c7744a58f2c4fda1c1b:1",
					className: "sm:max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
						"data-inspector-id": "pages/Bookings/Bookings/DialogHeader/1",
						"data-inspector-source": "pages/Bookings.tsx:271:11:f3baf1571d8ce48392ac850c82c313f167b22021224d9cc9f1db77c5581f7169:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							"data-inspector-id": "pages/Bookings/Bookings/DialogTitle/1",
							"data-inspector-source": "pages/Bookings.tsx:272:13:af1d854a636cbc561a70597306de739892abfb20c959c1d14ac012bb9f357e5c:1",
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
									"data-inspector-id": "pages/Bookings/Bookings/RefreshCw/0",
									"data-inspector-source": "pages/Bookings.tsx:272:62:af1d854a636cbc561a70597306de739892abfb20c959c1d14ac012bb9f357e5c:1",
									className: "h-5 w-5 text-primary"
								}),
								" ",
								t("bookings.rescheduleTitle")
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							"data-inspector-id": "pages/Bookings/Bookings/DialogDescription/1",
							"data-inspector-source": "pages/Bookings.tsx:273:13:d28384387c7231e9497238eddb00178bbbb0e48ee2f0ff631300ece7ed5b4228:1",
							children: t("bookings.rescheduleDesc", { name: rescheduleBooking?.provider?.full_name || t("common.provider") })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/Bookings/Bookings/div/7",
						"data-inspector-source": "pages/Bookings.tsx:275:11:1ac5ea4d441b4926f94bcb09515e7e5ebd280c0295c90fc7a30b7a08f2a729c8:1",
						className: "space-y-4 mt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/Bookings/Bookings/div/8",
							"data-inspector-source": "pages/Bookings.tsx:276:13:37078065acf0e00bda900d47a69b1df85a33458fc30b9f78a703de0c2b5b767c:1",
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/Bookings/Bookings/div/9",
								"data-inspector-source": "pages/Bookings.tsx:277:15:4b6ca590475f17c5f1b9ae6380b9142063bca2d2c7d6efa04faa46e33bbf8aea:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									"data-inspector-id": "pages/Bookings/Bookings/Label/0",
									"data-inspector-source": "pages/Bookings.tsx:277:20:4b6ca590475f17c5f1b9ae6380b9142063bca2d2c7d6efa04faa46e33bbf8aea:1",
									children: t("bookings.newDate")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"data-inspector-id": "pages/Bookings/Bookings/Input/0",
									"data-inspector-source": "pages/Bookings.tsx:277:58:4b6ca590475f17c5f1b9ae6380b9142063bca2d2c7d6efa04faa46e33bbf8aea:1",
									type: "date",
									value: rescheduleDate,
									onChange: (e) => setRescheduleDate(e.target.value),
									min: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/Bookings/Bookings/div/10",
								"data-inspector-source": "pages/Bookings.tsx:278:15:4972874c5a2901e06170963b140841a523174f831327c0f976e6a8c1b5e5d1dc:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									"data-inspector-id": "pages/Bookings/Bookings/Label/1",
									"data-inspector-source": "pages/Bookings.tsx:278:20:4972874c5a2901e06170963b140841a523174f831327c0f976e6a8c1b5e5d1dc:1",
									children: t("bookings.newTime")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"data-inspector-id": "pages/Bookings/Bookings/Input/1",
									"data-inspector-source": "pages/Bookings.tsx:278:58:4972874c5a2901e06170963b140841a523174f831327c0f976e6a8c1b5e5d1dc:1",
									type: "time",
									value: rescheduleTime,
									onChange: (e) => setRescheduleTime(e.target.value)
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							"data-inspector-id": "pages/Bookings/Bookings/DialogFooter/1",
							"data-inspector-source": "pages/Bookings.tsx:280:13:42ef0fb9832c0432c230be4d7b638e1b9019470c39a267a22fc113e551b87cef:1",
							className: "gap-2 sm:gap-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"data-inspector-id": "pages/Bookings/Bookings/Button/4",
								"data-inspector-source": "pages/Bookings.tsx:281:15:61b9cda2640e7b3fc41fec7a23460d538cd69d4ffdba8f0773eb8c5f01a4a379:1",
								variant: "outline",
								onClick: () => setRescheduleOpen(false),
								children: t("common.cancel")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								"data-inspector-id": "pages/Bookings/Bookings/Button/5",
								"data-inspector-source": "pages/Bookings.tsx:282:15:5bc9509dd1898ac84557939d8c59877edb323d2242a953bc56bb994cfb8d4e2a:1",
								variant: "coral",
								onClick: handleReschedule,
								disabled: rescheduleSaving || !rescheduleDate || !rescheduleTime,
								children: [rescheduleSaving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
									"data-inspector-id": "pages/Bookings/Bookings/Loader2/1",
									"data-inspector-source": "pages/Bookings.tsx:283:37:cd2292e7723fb927ece528a498b79785ddd1765e89dc9f09bdd0a09873116f4a:1",
									className: "h-4 w-4 animate-spin mr-2"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
									"data-inspector-id": "pages/Bookings/Bookings/RefreshCw/1",
									"data-inspector-source": "pages/Bookings.tsx:283:89:cd2292e7723fb927ece528a498b79785ddd1765e89dc9f09bdd0a09873116f4a:1",
									className: "h-4 w-4 mr-2"
								}), t("bookings.reschedule")]
							})]
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				"data-inspector-id": "pages/Bookings/Bookings/Dialog/2",
				"data-inspector-source": "pages/Bookings.tsx:292:7:0966562186f247071f0d3d2a1edaec5c19bb5b02def636cef3e670ce67fea26a:1",
				open: reviewOpen,
				onOpenChange: setReviewOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					"data-inspector-id": "pages/Bookings/Bookings/DialogContent/2",
					"data-inspector-source": "pages/Bookings.tsx:293:9:587a0b15f68db296207bf20f021c4629ce833c63ecd28c7744a58f2c4fda1c1b:1",
					className: "sm:max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
						"data-inspector-id": "pages/Bookings/Bookings/DialogHeader/2",
						"data-inspector-source": "pages/Bookings.tsx:294:11:f3baf1571d8ce48392ac850c82c313f167b22021224d9cc9f1db77c5581f7169:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							"data-inspector-id": "pages/Bookings/Bookings/DialogTitle/2",
							"data-inspector-source": "pages/Bookings.tsx:295:13:fa82eb319cfcc21210d23f25bfb1e8e4d62d01b04d9561845be0b1123c479835:1",
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
									"data-inspector-id": "pages/Bookings/Bookings/Star/0",
									"data-inspector-source": "pages/Bookings.tsx:295:62:fa82eb319cfcc21210d23f25bfb1e8e4d62d01b04d9561845be0b1123c479835:1",
									className: "h-5 w-5 text-warning"
								}),
								" ",
								t("bookings.leaveReview")
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							"data-inspector-id": "pages/Bookings/Bookings/DialogDescription/2",
							"data-inspector-source": "pages/Bookings.tsx:296:13:3b07f79f87dfc6ba856e16ff8c1237b2627a805152ed7ebd928862e19a845200:1",
							children: t("bookings.reviewDesc", { name: reviewBooking?.provider?.full_name || t("common.provider") })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/Bookings/Bookings/div/11",
						"data-inspector-source": "pages/Bookings.tsx:298:11:1ac5ea4d441b4926f94bcb09515e7e5ebd280c0295c90fc7a30b7a08f2a729c8:1",
						className: "space-y-4 mt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/Bookings/Bookings/div/12",
								"data-inspector-source": "pages/Bookings.tsx:299:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									"data-inspector-id": "pages/Bookings/Bookings/Label/2",
									"data-inspector-source": "pages/Bookings.tsx:300:15:f6c32c903a49deb81e1ab9a95ef560f74f457cd4d54439e73f64b63092a10cca:1",
									children: t("bookings.rating")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-id": "pages/Bookings/Bookings/div/13",
									"data-inspector-source": "pages/Bookings.tsx:301:15:2c6da401d5d12de62928fa5d4b3c0bab72a13549b9944c529af814e22a331633:1",
									className: "flex gap-1 mt-1",
									children: [
										1,
										2,
										3,
										4,
										5
									].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										"data-inspector-id": "pages/Bookings/Bookings/button/0",
										"data-inspector-source": "pages/Bookings.tsx:303:19:95ba0669192ca33f2b91af78c42e1b8fd54cc19bc35f75deccdf78229785068f:1",
										type: "button",
										"aria-label": `${s} ${t("bookings.rating")}`,
										"aria-pressed": s === reviewRating,
										onClick: () => setReviewRating(s),
										className: "min-h-11 min-w-11 flex items-center justify-center rounded-md transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
											"data-inspector-id": "pages/Bookings/Bookings/Star/1",
											"data-inspector-source": "pages/Bookings.tsx:304:21:136808943e54eba0cf15c79b1efa7e8a3c8d9388013b6b825f7491b99c20258f:1",
											className: `h-6 w-6 ${s <= reviewRating ? "text-warning fill-warning" : "text-muted-foreground"}`
										})
									}, s))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/Bookings/Bookings/div/14",
								"data-inspector-source": "pages/Bookings.tsx:309:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									"data-inspector-id": "pages/Bookings/Bookings/Label/3",
									"data-inspector-source": "pages/Bookings.tsx:310:15:af83ca34d5d7296000f6f78127e738b82ecf6e3eabc918da7f1a5ffa09aee7bb:1",
									children: t("bookings.comment")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									"data-inspector-id": "pages/Bookings/Bookings/Textarea/0",
									"data-inspector-source": "pages/Bookings.tsx:311:15:c62df27b3e194aec9ba0b8cbc6d48c00ae30851b15a7ac67b3592e0a30133036:1",
									value: reviewComment,
									onChange: (e) => setReviewComment(e.target.value),
									placeholder: t("bookings.reviewPlaceholder"),
									rows: 3
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
								"data-inspector-id": "pages/Bookings/Bookings/DialogFooter/2",
								"data-inspector-source": "pages/Bookings.tsx:313:13:42ef0fb9832c0432c230be4d7b638e1b9019470c39a267a22fc113e551b87cef:1",
								className: "gap-2 sm:gap-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "pages/Bookings/Bookings/Button/6",
									"data-inspector-source": "pages/Bookings.tsx:314:15:630dc31eb07bb1617c404a26368df9c817bb90b57fff7f734f0d511176cef40c:1",
									variant: "outline",
									onClick: () => setReviewOpen(false),
									children: t("common.cancel")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									"data-inspector-id": "pages/Bookings/Bookings/Button/7",
									"data-inspector-source": "pages/Bookings.tsx:315:15:35782e068ad7731e03184efbbcb7146bc01f3f0ceaef13e6d13e7e7b77eb1b04:1",
									variant: "coral",
									onClick: handleSubmitReview,
									disabled: reviewSaving,
									children: [reviewSaving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
										"data-inspector-id": "pages/Bookings/Bookings/Loader2/2",
										"data-inspector-source": "pages/Bookings.tsx:316:33:5348b94fa209881eb8e66cc5c338162efcca02fe512feaf70418304e0f5809f0:1",
										className: "h-4 w-4 animate-spin mr-2"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
										"data-inspector-id": "pages/Bookings/Bookings/Star/2",
										"data-inspector-source": "pages/Bookings.tsx:316:85:5348b94fa209881eb8e66cc5c338162efcca02fe512feaf70418304e0f5809f0:1",
										className: "h-4 w-4 mr-2"
									}), t("bookings.submitReview")]
								})]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				"data-inspector-id": "pages/Bookings/Bookings/Dialog/3",
				"data-inspector-source": "pages/Bookings.tsx:324:7:66418132beac86b6807eabe859c58398466f9c66a58ef31594176d3abc4db764:1",
				open: refundOpen,
				onOpenChange: setRefundOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					"data-inspector-id": "pages/Bookings/Bookings/DialogContent/3",
					"data-inspector-source": "pages/Bookings.tsx:325:9:587a0b15f68db296207bf20f021c4629ce833c63ecd28c7744a58f2c4fda1c1b:1",
					className: "sm:max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
						"data-inspector-id": "pages/Bookings/Bookings/DialogHeader/3",
						"data-inspector-source": "pages/Bookings.tsx:326:11:f3baf1571d8ce48392ac850c82c313f167b22021224d9cc9f1db77c5581f7169:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							"data-inspector-id": "pages/Bookings/Bookings/DialogTitle/3",
							"data-inspector-source": "pages/Bookings.tsx:327:13:e725a4f0b72567bc8eaed0f482db8072e7fab4425b9df014503000991fb61183:1",
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, {
									"data-inspector-id": "pages/Bookings/Bookings/DollarSign/0",
									"data-inspector-source": "pages/Bookings.tsx:327:62:e725a4f0b72567bc8eaed0f482db8072e7fab4425b9df014503000991fb61183:1",
									className: "h-5 w-5 text-warning"
								}),
								" ",
								t("bookings.requestRefund", "Request Refund")
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							"data-inspector-id": "pages/Bookings/Bookings/DialogDescription/3",
							"data-inspector-source": "pages/Bookings.tsx:328:13:78dfa59c694c747cc65b21568dfd7d3dc8ba8868fc7843d846598cac14769bd0:1",
							children: t("bookings.refundDesc", `Request a refund for your booking with ${refundBooking?.provider?.full_name || "provider"}.`)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/Bookings/Bookings/div/15",
						"data-inspector-source": "pages/Bookings.tsx:330:11:1ac5ea4d441b4926f94bcb09515e7e5ebd280c0295c90fc7a30b7a08f2a729c8:1",
						className: "space-y-4 mt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-id": "pages/Bookings/Bookings/div/16",
								"data-inspector-source": "pages/Bookings.tsx:331:13:5380b2b79e33697687caebd9d4719a7deb7774951c3fed6f29abcf2230244c8f:1",
								className: "rounded-lg bg-muted/40 p-3 text-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/Bookings/Bookings/div/17",
									"data-inspector-source": "pages/Bookings.tsx:332:15:0b0b1fbb442255c22787daeb2f7986dad046037c6a0bc5d67397aff13a4bfb99:1",
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-id": "pages/Bookings/Bookings/span/1",
										"data-inspector-source": "pages/Bookings.tsx:332:53:0b0b1fbb442255c22787daeb2f7986dad046037c6a0bc5d67397aff13a4bfb99:0",
										className: "text-muted-foreground",
										children: t("bookings.orderTotal", "Order Total")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										"data-inspector-id": "pages/Bookings/Bookings/span/2",
										"data-inspector-source": "pages/Bookings.tsx:332:141:0b0b1fbb442255c22787daeb2f7986dad046037c6a0bc5d67397aff13a4bfb99:0",
										className: "font-bold",
										children: [i18n.language?.startsWith("zh") ? "¥" : "$", refundBooking?.total_cost || 0]
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/Bookings/Bookings/div/18",
								"data-inspector-source": "pages/Bookings.tsx:334:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									"data-inspector-id": "pages/Bookings/Bookings/Label/4",
									"data-inspector-source": "pages/Bookings.tsx:335:15:de96e898d441f43c1087c6e625f508238757d2c74d4b1343a955d91acbf28ed0:1",
									children: t("bookings.refundReason", "Reason for refund")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									"data-inspector-id": "pages/Bookings/Bookings/Textarea/1",
									"data-inspector-source": "pages/Bookings.tsx:336:15:1a7086492709ef618f747fe0b637968b4d8a6b34699f01fc5731eb00d58c9ebd:1",
									value: refundReason,
									onChange: (e) => setRefundReason(e.target.value),
									placeholder: t("bookings.refundReasonPlaceholder", "Please describe why you are requesting a refund..."),
									rows: 3
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
								"data-inspector-id": "pages/Bookings/Bookings/DialogFooter/3",
								"data-inspector-source": "pages/Bookings.tsx:338:13:42ef0fb9832c0432c230be4d7b638e1b9019470c39a267a22fc113e551b87cef:1",
								className: "gap-2 sm:gap-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "pages/Bookings/Bookings/Button/8",
									"data-inspector-source": "pages/Bookings.tsx:339:15:816421c94e5b4970884db4b1704f654c33a9d84bac05136d11bfba7e0f99199b:1",
									variant: "outline",
									onClick: () => setRefundOpen(false),
									children: t("common.cancel")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									"data-inspector-id": "pages/Bookings/Bookings/Button/9",
									"data-inspector-source": "pages/Bookings.tsx:340:15:6e9dc4879c2cdad3521ea7336a9c6514e3a049c59702aed86b99140adba4a2b8:1",
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
									children: [requestRefund.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
										"data-inspector-id": "pages/Bookings/Bookings/Loader2/3",
										"data-inspector-source": "pages/Bookings.tsx:353:44:806dc22795e295e4e5363c211380ad7760417cabfd48f4894098d046ec04e063:1",
										className: "h-4 w-4 animate-spin mr-2"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, {
										"data-inspector-id": "pages/Bookings/Bookings/DollarSign/1",
										"data-inspector-source": "pages/Bookings.tsx:353:96:806dc22795e295e4e5363c211380ad7760417cabfd48f4894098d046ec04e063:1",
										className: "h-4 w-4 mr-2"
									}), t("bookings.submitRefund", "Submit Refund Request")]
								})]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingThreadDialog, {
				"data-inspector-id": "pages/Bookings/Bookings/BookingThreadDialog/0",
				"data-inspector-source": "pages/Bookings.tsx:363:7:56d8704d7b858a47904e07600961031eae760f0fe69fbcb8c269e18455e69240:1",
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
		"data-inspector-id": "routes/bookings/RouteBookingsPage/SiteFeature/0",
		"data-inspector-source": "routes/bookings.tsx:5:10:6fe959595991243ef59f09925a1ec49678c343dfd8e3cbf204bd381361d6f8c2:1",
		name: "paidCaregivers",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, {
			"data-inspector-id": "routes/bookings/RouteBookingsPage/RequireAuth/0",
			"data-inspector-source": "routes/bookings.tsx:5:45:6fe959595991243ef59f09925a1ec49678c343dfd8e3cbf204bd381361d6f8c2:1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookings, {
				"data-inspector-id": "routes/bookings/RouteBookingsPage/Bookings/0",
				"data-inspector-source": "routes/bookings.tsx:5:58:6fe959595991243ef59f09925a1ec49678c343dfd8e3cbf204bd381361d6f8c2:1"
			})
		})
	});
}
//#endregion
export { RouteBookingsPage as component };
