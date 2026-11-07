import { s as __toESM } from "./_runtime.mjs";
import { i as require_react } from "./_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./_ssr/button-DgaEzEqC.mjs";
import { t as Label } from "./_ssr/label-BLfGGA0c.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./_ssr/card-DGU2jav_.mjs";
import { t as Badge } from "./_ssr/badge-B2YCAhUo.mjs";
import { t as Input } from "./_ssr/input-JWLlmFeK.mjs";
import { t as Textarea } from "./_ssr/textarea-ZNemOC_7.mjs";
import { n as R } from "./_ssr/wp-schema-Dnlz0TVP.mjs";
import { t as formatDate } from "./_ssr/locale-DKwjQju2.mjs";
import { Dt as MapPin, In as Calendar, L as Shield, St as MessageSquare, T as Star, Yt as Heart, Zn as ArrowLeft, ct as Phone, jt as LoaderCircle, vn as Clock } from "./_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, s as DialogTrigger, t as Dialog } from "./_ssr/dialog-DHxbK-sS.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-CCayJGqJ.mjs";
import { t as useTranslation } from "./_libs/react-i18next.mjs";
import { i as careServiceTypeLabel, o as deliveryModeLabel, t as CARE_SERVICE_TYPES } from "./_ssr/source.wordpress-CI9kg3_M.mjs";
import { o as clearCart, s as createServiceProduct } from "./_ssr/woocommerce-api-BoF1FQHg.mjs";
import { Bn as useStartConversation, Cn as useProviderReviews, Kn as useToggleSavedProvider, at as useCreateReview, bn as useProvider, jn as useSavedProviders, xn as useProviderAvailability } from "./_ssr/use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./_ssr/use-toast-D8d_MLWg.mjs";
import { n as useAuth } from "./_ssr/AuthContext-BAA6n6xi.mjs";
import { a as useParams$1, i as useNavigate$1 } from "./_ssr/router-compat-CRbRSfhz.mjs";
import { t as CommentsSection } from "./_ssr/CommentsSection-Dr3pAlaO.mjs";
import { n as useAddToCart } from "./_ssr/use-cart-B3rnJV3i.mjs";
import { t as SiteFeature } from "./_ssr/SiteFeature-Dc7M6czo.mjs";
import { n as getAvailabilityConflictMessage, r as getProviderCalendarBookingConflictMessage } from "./_ssr/booking-availability-CfcSrbaA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-CVDI0t27.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Just-in-time care service product.
*
* Per the data dictionary, a caregiver's services and rates live only in the
* JetEngine CCT ("护理者的护理服务只使用我们的CCT来储存"). WooCommerce is
* touched for the first time at the exact moment the client adds a service to
* the cart — this helper creates that one product, owned by the caregiver so
* Dokan commission and payout apply, and returns its product id.
*
* Creation runs through the `wp-admin-ops` edge function because buyers do not
* have wc/v3 product-create capabilities.
*/
async function createCareBookingProduct(input) {
	const { vendorUserId, vendorName, serviceLabel, delivery, rate, hours, unit } = input;
	const quantity = unit === "hour" ? hours : Math.max(1, Math.round(hours));
	const amount = Math.round(rate * quantity * 100) / 100;
	if (!(amount > 0)) throw new Error("Service price must be greater than 0");
	const numericVendorId = String(vendorUserId).replace(/^wp-/, "");
	const name = vendorName ? `${serviceLabel} — ${vendorName}` : serviceLabel;
	const when = [input.startDate, input.startTime].filter(Boolean).join(" ");
	const priceLine = unit === "hour" ? `${serviceLabel}: $${rate}/hr × ${quantity}h = $${amount}` : `${serviceLabel}: $${rate} × ${quantity} = $${amount}`;
	const description = when ? `${priceLine} — ${when}` : priceLine;
	const meta = [
		{
			key: "_dokan_vendor_id",
			value: numericVendorId
		},
		{
			key: "_is_care_service_product",
			value: "1"
		},
		{
			key: "_care_service_label",
			value: serviceLabel
		},
		{
			key: "_care_service_rate",
			value: String(rate)
		},
		{
			key: "_care_service_unit",
			value: unit
		},
		{
			key: "_care_service_quantity",
			value: String(quantity)
		}
	];
	if (delivery) meta.push({
		key: "_care_service_delivery",
		value: delivery
	});
	if (input.startDate) meta.push({
		key: "_care_service_start_date",
		value: input.startDate
	});
	if (input.startTime) meta.push({
		key: "_care_service_start_time",
		value: input.startTime
	});
	if (input.notes) meta.push({
		key: "_care_service_notes",
		value: input.notes
	});
	return createServiceProduct({
		name,
		description,
		amount,
		vendorUserId: numericVendorId,
		meta
	});
}
var TIME_STEP_MINUTES = 30;
function timeToMinutes(value) {
	const [hours, minutes] = value.split(":").map(Number);
	return hours * 60 + minutes;
}
function minutesToTime(totalMinutes) {
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
function formatTimeLabel(value) {
	const [hours, minutes] = value.split(":").map(Number);
	return new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		minute: "2-digit"
	}).format(new Date(2026, 0, 1, hours, minutes));
}
function getDurationHours(start, end) {
	if (!start || !end) return 0;
	const diffMinutes = timeToMinutes(end) - timeToMinutes(start);
	return diffMinutes > 0 ? diffMinutes / 60 : 0;
}
function CaregiverProfile() {
	const { id } = useParams$1();
	const navigate = useNavigate$1();
	const { toast } = useToast();
	const { t, i18n } = useTranslation();
	const isZh = i18n.language?.startsWith("zh");
	const { isAuthenticated, user } = useAuth();
	const { data: caregiver, isLoading } = useProvider(id);
	const { data: reviews } = useProviderReviews(id);
	const reviewCount = (reviews || []).length;
	const reviewAverage = reviewCount ? (reviews || []).reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviewCount : null;
	const { data: savedProviders } = useSavedProviders();
	const toggleSaved = useToggleSavedProvider();
	const createReview = useCreateReview();
	const startConversation = useStartConversation();
	const addToCart = useAddToCart();
	const [bookingDate, setBookingDate] = (0, import_react.useState)("");
	const [bookingTime, setBookingTime] = (0, import_react.useState)("");
	const [bookingEndTime, setBookingEndTime] = (0, import_react.useState)("");
	const [bookingNotes, setBookingNotes] = (0, import_react.useState)("");
	const [bookingDialogOpen, setBookingDialogOpen] = (0, import_react.useState)(false);
	const [availabilityWarning, setAvailabilityWarning] = (0, import_react.useState)("");
	const [recurringPattern, setRecurringPattern] = (0, import_react.useState)("none");
	const [deliveryResourceId, setDeliveryResourceId] = (0, import_react.useState)("");
	const [reviewDialogOpen, setReviewDialogOpen] = (0, import_react.useState)(false);
	const [reviewRating, setReviewRating] = (0, import_react.useState)(5);
	const [reviewComment, setReviewComment] = (0, import_react.useState)("");
	const { data: availability } = useProviderAvailability(id ?? null);
	const isFavorited = savedProviders?.some((sp) => sp.provider_id === id) || false;
	/**
	* Bookable services come from the caregiver's dictionary record (CCT 258):
	* a68 service types, a65 delivery modes, and the four published rates
	* (a66 in-person/hr, a67 remote/hr, a69 remote check-in, a70 remote
	* medication reminder). WooCommerce is not queried here — a product is
	* created only when this client adds a service to the cart.
	*/
	const bookingOptions = (0, import_react.useMemo)(() => {
		if (!caregiver) return [];
		const offered = new Set(caregiver.service_type_slugs || []);
		const modes = new Set(caregiver.service_location_slugs || []);
		const rateInPerson = Number(caregiver.care_provider_hourly_rate_in_person) || 0;
		const rateRemote = Number(caregiver.care_provider_hourly_rate_remote) || 0;
		const rateCheckin = Number(caregiver.care_provider_rate_remote_checkin) || 0;
		const rateMedicine = Number(caregiver.care_provider_rate_remote_medicine) || 0;
		const options = [];
		for (const service of CARE_SERVICE_TYPES) {
			if (!offered.has(service.slug)) continue;
			const label = isZh ? service.zh : service.en;
			if (service.slug === "remote-checkin") {
				if (rateCheckin > 0) options.push({
					key: service.slug,
					serviceSlug: service.slug,
					label,
					delivery: "remote",
					rate: rateCheckin,
					unit: "visit"
				});
				continue;
			}
			if (service.slug === "remote-medicine-supervision") {
				if (rateMedicine > 0) options.push({
					key: service.slug,
					serviceSlug: service.slug,
					label,
					delivery: "remote",
					rate: rateMedicine,
					unit: "visit"
				});
				continue;
			}
			const deliveries = service.delivery ? [service.delivery] : ["in-person", "remote"].filter((m) => modes.has(m));
			for (const delivery of deliveries) {
				const rate = delivery === "remote" ? rateRemote : rateInPerson;
				if (rate <= 0) continue;
				options.push({
					key: `${service.slug}:${delivery}`,
					serviceSlug: service.slug,
					label: service.delivery ? label : `${label} · ${delivery === "remote" ? isZh ? "远程" : "Remote" : isZh ? "上门" : "In-person"}`,
					delivery,
					rate,
					unit: "hour"
				});
			}
		}
		return options;
	}, [caregiver, isZh]);
	(0, import_react.useEffect)(() => {
		if (bookingDialogOpen && !deliveryResourceId && bookingOptions.length > 0) setDeliveryResourceId(bookingOptions[0].key);
	}, [
		bookingDialogOpen,
		deliveryResourceId,
		bookingOptions
	]);
	const selectedResource = bookingOptions.find((o) => o.key === deliveryResourceId);
	const availabilityPreview = (0, import_react.useMemo)(() => {
		const weekdayLabels = isZh ? [
			"周日",
			"周一",
			"周二",
			"周三",
			"周四",
			"周五",
			"周六"
		] : [
			"Sun",
			"Mon",
			"Tue",
			"Wed",
			"Thu",
			"Fri",
			"Sat"
		];
		return (availability || []).filter((slot) => slot.is_available && typeof slot.day_of_week === "number" && slot.start_time && slot.end_time).sort((a, b) => a.day_of_week - b.day_of_week || String(a.start_time).localeCompare(String(b.start_time))).map((slot) => ({ label: `${weekdayLabels[slot.day_of_week]} ${slot.start_time}–${slot.end_time}` }));
	}, [availability, isZh]);
	const effectiveRate = Number(selectedResource?.rate || 0);
	const bookingTypeLabel = selectedResource?.label || "";
	const availableTimeRanges = (0, import_react.useMemo)(() => {
		if (!bookingDate) return [];
		const dayOfWeek = (/* @__PURE__ */ new Date(`${bookingDate}T12:00:00`)).getDay();
		const specificSlots = (availability || []).filter((slot) => slot.specific_date === bookingDate);
		const candidateSlots = specificSlots.length > 0 ? specificSlots.filter((slot) => slot.is_available && slot.start_time && slot.end_time) : (availability || []).filter((slot) => slot.day_of_week === dayOfWeek && slot.is_available && slot.start_time && slot.end_time);
		if (candidateSlots.length === 0) return [];
		return candidateSlots.sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)));
	}, [availability, bookingDate]);
	const startTimeOptions = (0, import_react.useMemo)(() => {
		const options = /* @__PURE__ */ new Set();
		availableTimeRanges.forEach((slot) => {
			const slotStart = timeToMinutes(String(slot.start_time));
			const slotEnd = timeToMinutes(String(slot.end_time));
			for (let minutes = slotStart; minutes + TIME_STEP_MINUTES <= slotEnd; minutes += TIME_STEP_MINUTES) options.add(minutesToTime(minutes));
		});
		return Array.from(options).sort();
	}, [availableTimeRanges]);
	const endTimeOptions = (0, import_react.useMemo)(() => {
		if (!bookingTime) return [];
		const selectedStartMinutes = timeToMinutes(bookingTime);
		const options = /* @__PURE__ */ new Set();
		availableTimeRanges.forEach((slot) => {
			const slotStart = timeToMinutes(String(slot.start_time));
			const slotEnd = timeToMinutes(String(slot.end_time));
			if (selectedStartMinutes < slotStart || selectedStartMinutes >= slotEnd) return;
			for (let minutes = selectedStartMinutes + TIME_STEP_MINUTES; minutes <= slotEnd; minutes += TIME_STEP_MINUTES) options.add(minutesToTime(minutes));
		});
		return Array.from(options).sort();
	}, [availableTimeRanges, bookingTime]);
	(0, import_react.useEffect)(() => {
		if (bookingTime && !startTimeOptions.includes(bookingTime)) setBookingTime("");
	}, [bookingTime, startTimeOptions]);
	(0, import_react.useEffect)(() => {
		if (bookingEndTime && !endTimeOptions.includes(bookingEndTime)) setBookingEndTime("");
	}, [bookingEndTime, endTimeOptions]);
	(0, import_react.useEffect)(() => {
		if (!bookingTime && startTimeOptions.length > 0) setBookingTime(startTimeOptions[0]);
	}, [bookingTime, startTimeOptions]);
	(0, import_react.useEffect)(() => {
		if (!bookingEndTime && endTimeOptions.length > 0) setBookingEndTime(endTimeOptions[0]);
	}, [bookingEndTime, endTimeOptions]);
	const checkAvailability = (date, time, endTime = bookingEndTime) => {
		const warning = getAvailabilityConflictMessage(availability || [], date, time, getDurationHours(time, endTime));
		setAvailabilityWarning(warning || "");
	};
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/div/0",
		"data-inspector-source": "pages/CaregiverProfile.tsx:261:7:2d1871ad282b54046bdae4adcf88939e157ae39855f3b86d960d6c8e65573a29:1",
		className: "flex justify-center py-20",
		role: "status",
		"aria-label": isZh ? "正在加载护理者" : "Loading caregiver",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/h1/0",
			"data-inspector-source": "pages/CaregiverProfile.tsx:262:9:4487a65a6ac25c359c71c9ea3de0c9ad0bddff12066baae2fc23adc5b799c486:1",
			className: "sr-only",
			children: isZh ? "护理者资料" : "Caregiver profile"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" })]
	});
	if (!caregiver) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center justify-center min-h-[50vh] gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/h1/1",
			"data-inspector-source": "pages/CaregiverProfile.tsx:271:9:d77e0171d757a366ac994bfb7fd5e6227f4d737d8509f6cb011f826ac04a72ce:1",
			className: "text-lg font-semibold text-foreground",
			children: isZh ? "未找到该护理者" : "Caregiver not found"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Button/d0cda6559bb3",
			"data-inspector-source": "pages/CaregiverProfile.tsx:272:9:3c18bb1b7cdd0fbb5f93ed2bf9cd6b6401fa8de67291fb039058817204918605:1",
			variant: "outline",
			onClick: () => navigate("/search"),
			children: isZh ? "返回搜索" : "Back to Search"
		})]
	});
	const handleBooking = async () => {
		if (!bookingDate || !bookingTime || !bookingEndTime || !selectedResource) {
			toast({
				title: isZh ? "请选择服务、日期、开始时间和结束时间" : "Please pick a service, date, start time, and end time",
				variant: "destructive"
			});
			return;
		}
		if (/* @__PURE__ */ new Date(bookingDate + "T" + bookingTime) < /* @__PURE__ */ new Date()) {
			toast({
				title: isZh ? "无法预约过去时间" : "Cannot book in the past",
				description: isZh ? "请选择未来的日期与时间。" : "Please select a future date and time.",
				variant: "destructive"
			});
			return;
		}
		const durationHours = getDurationHours(bookingTime, bookingEndTime);
		if (!durationHours) {
			toast({
				title: isZh ? "时间区间无效" : "Invalid time range",
				description: isZh ? "结束时间必须晚于开始时间。" : "End time must be after start time.",
				variant: "destructive"
			});
			return;
		}
		const scheduleConflictMessage = getAvailabilityConflictMessage(availability || [], bookingDate, bookingTime, durationHours);
		if (scheduleConflictMessage) {
			setAvailabilityWarning(scheduleConflictMessage);
			toast({
				title: isZh ? "该时段不可预约" : "Time slot unavailable",
				description: scheduleConflictMessage,
				variant: "destructive"
			});
			return;
		}
		const conflictMessage = await getProviderCalendarBookingConflictMessage(caregiver.id, bookingDate, bookingTime, durationHours);
		if (conflictMessage) {
			setAvailabilityWarning(conflictMessage);
			toast({
				title: isZh ? "该时段不可预约" : "Time slot unavailable",
				description: conflictMessage,
				variant: "destructive"
			});
			return;
		}
		if (!isAuthenticated) {
			toast({
				title: isZh ? "请先登录后再预约" : "Please sign in to book",
				variant: "destructive"
			});
			navigate("/auth");
			return;
		}
		if (user && caregiver && String(user.id) === String(caregiver.id)) {
			toast({
				title: isZh ? "这是您自己的服务" : "This is your own service",
				description: isZh ? "您不能预约自己提供的服务，请使用其他账号体验预约流程。" : "You can't book your own service. Use another account to try the booking flow.",
				variant: "destructive"
			});
			return;
		}
		try {
			try {
				await clearCart();
			} catch {}
			const recurringNote = recurringPattern !== "none" ? `[Recurring: ${recurringPattern}] ` : "";
			const packageNote = `[Service: ${selectedResource.label}] `;
			const product = await createCareBookingProduct({
				vendorUserId: caregiver.id,
				vendorName: caregiver.full_name ?? void 0,
				serviceLabel: selectedResource.label,
				delivery: selectedResource.delivery,
				rate: selectedResource.rate,
				hours: selectedResource.unit === "hour" ? durationHours : 1,
				unit: selectedResource.unit,
				startDate: bookingDate,
				startTime: bookingTime,
				notes: recurringNote + packageNote + (bookingNotes || "")
			});
			await addToCart.mutateAsync({
				productId: product.id,
				booking: {
					startDate: bookingDate,
					startTime: bookingTime,
					durationHours,
					serviceType: bookingTypeLabel,
					notes: recurringNote + packageNote + (bookingNotes || "") || void 0
				}
			});
			toast({
				title: isZh ? "已加入购物车" : "Added to cart",
				description: isZh ? `已加入 ${caregiver.full_name} 的 ${selectedResource?.label} 预约。` : `${caregiver.full_name}'s ${selectedResource?.label} booking added.`
			});
			setBookingDialogOpen(false);
			navigate("/cart");
		} catch (err) {
			toast({
				title: isZh ? "加入购物车失败" : "Failed to add to cart",
				description: err.message,
				variant: "destructive"
			});
		}
	};
	const handleToggleFavorite = () => {
		if (!isAuthenticated) {
			navigate("/auth");
			return;
		}
		toggleSaved.mutate(caregiver.id);
	};
	const durationHrs = getDurationHours(bookingTime, bookingEndTime);
	const total = selectedResource?.unit === "visit" ? effectiveRate : effectiveRate * durationHrs;
	const hasAvailabilityConflict = Boolean(availabilityWarning);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-5xl mx-auto px-4 py-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Button/d0cda6559bb3",
			"data-inspector-source": "pages/CaregiverProfile.tsx:374:7:1caa8c28bbdcc3f96a21c3d52c587256ef61f86a3b0d028bc1cd43ee2cd3e13e:1",
			variant: "ghost",
			size: "sm",
			className: "mb-3 gap-1.5 -ml-2",
			onClick: () => navigate(-1),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }),
				" ",
				isZh ? "返回" : "Back"
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid lg:grid-cols-3 lg:grid-rows-[auto_auto] items-start gap-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/div/1",
					"data-inspector-source": "pages/CaregiverProfile.tsx:379:9:043dc412d27399f5b74b43112f3e50468d5cae2120bb4eed56091478c1e5797a:1",
					className: "lg:col-span-2 space-y-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: "border-transparent card-elevated",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "p-5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-row items-start gap-4 sm:gap-5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/img/0",
										"data-inspector-source": "pages/CaregiverProfile.tsx:383:17:e04d0e89f14d77745c5e3aa70fde71d172ac205abd25e41cab2c2be90f0ad58f:1",
										src: caregiver.avatar_url || "/placeholder.svg",
										alt: caregiver.full_name || "",
										className: "w-20 h-20 sm:w-28 sm:h-28 rounded-2xl object-cover bg-muted shrink-0"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-start justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/div/2",
													"data-inspector-source": "pages/CaregiverProfile.tsx:387:23:9c74adccab2762420a8519a705cca954d512d2abcde47618634ae6d6ae68a8b0:1",
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
														"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/h1/2",
														"data-inspector-source": "pages/CaregiverProfile.tsx:388:25:724f009778e5a08bb4399abb8e22ab843fd94d16398ff84927daf5ee39f20a10:1",
														className: "text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate",
														children: caregiver.full_name
													}), caregiver.care_provider_is_background_checked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-5 w-5 text-primary shrink-0" })]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/div/3",
													"data-inspector-source": "pages/CaregiverProfile.tsx:391:23:13bdeb08fc659ffcda1cd32c68d29cd8a6de427c819d4fc78cb19225669818a9:1",
													className: "flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-muted-foreground",
													children: [reviewCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/span/0",
														"data-inspector-source": "pages/CaregiverProfile.tsx:393:27:2f803dc2d00b736edb7b8e9c989835ff7e02d7f96b7782d807035c74024e4161:1",
														className: "flex items-center gap-1",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-4 w-4 text-warning fill-warning" }),
															" ",
															reviewAverage?.toFixed(1),
															" (",
															isZh ? `${reviewCount} 条评价` : `${reviewCount} review${reviewCount === 1 ? "" : "s"}`,
															")"
														]
													}), caregiver.location && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/span/1",
														"data-inspector-source": "pages/CaregiverProfile.tsx:395:48:feb47e0d164319934875e19d2534bdda16d88e1b4ec2c5c878ece062217294ef:1",
														className: "flex items-center gap-1",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4" }),
															" ",
															caregiver.location
														]
													})]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Button/07cab69e5ffd",
												"data-inspector-source": "pages/CaregiverProfile.tsx:399:21:f78eb0d3971a8bb1961070c6eb62ce8e6cd943a164ed8f8de3e28a31c77337dc:1",
												variant: "ghost",
												size: "icon",
												className: "min-h-11 min-w-11 shrink-0",
												onClick: handleToggleFavorite,
												title: isZh ? "收藏" : "Save",
												"aria-label": isZh ? "收藏" : "Save",
												"aria-pressed": isFavorited,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
													"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Heart/0",
													"data-inspector-source": "pages/CaregiverProfile.tsx:408:23:4ee0f00fcdb4fbfc5700768501b3d8851271d8e7a18f0c0965a1458e64c848e4:1",
													className: `h-5 w-5 ${isFavorited ? "fill-coral text-coral" : "text-muted-foreground"}`
												})
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/div/4",
											"data-inspector-source": "pages/CaregiverProfile.tsx:412:19:63b320d217bbd81320f6e998d5eabc4a8be9f90f5f09c5e60911ed85f89b2704:1",
											className: "flex flex-wrap gap-2 mt-4",
											children: [(caregiver.service_location_slugs || []).map((slug) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Badge/0",
												"data-inspector-source": "pages/CaregiverProfile.tsx:414:23:8f8d21a2a566317f729186d42f07613c29931fbec89654d9e913aa6b750cebf4:1",
												variant: "outline",
												className: "border-primary/40 text-primary",
												children: deliveryModeLabel(slug, isZh)
											}, `loc-${slug}`)), (caregiver.service_type_slugs || []).map((slug) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Badge/1",
												"data-inspector-source": "pages/CaregiverProfile.tsx:417:23:8fd005d762963a41427d2987b7e454293431f943a1ea23cdad8180fde5ac97c8:1",
												variant: "secondary",
												className: "bg-accent text-accent-foreground",
												children: careServiceTypeLabel(slug, isZh)
											}, slug))]
										})]
									})]
								})
							})
						}),
						caregiver.bio && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "border-transparent card-elevated",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/CardTitle/0",
								"data-inspector-source": "pages/CaregiverProfile.tsx:427:27:b2289d2daedd7f8a0172b028d99bc6a1994ee343976c04e5f7f68c0438650501:1",
								children: isZh ? "关于" : "About"
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/p/0",
								"data-inspector-source": "pages/CaregiverProfile.tsx:428:28:d29468c122eab79396dfdfde95e611169b35bd54cdd1a49497f18d8693880c27:1",
								className: "text-muted-foreground leading-relaxed",
								children: caregiver.bio
							}) })]
						}),
						caregiver.care_provider_is_background_checked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "border-transparent card-elevated",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/CardTitle/1",
								"data-inspector-source": "pages/CaregiverProfile.tsx:434:27:be16f1e7d82ed75a5e9157fda0f060414a9f584b6985764c3ad9d1e1e0eb3c5e:1",
								children: isZh ? "资质" : "Qualifications"
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/CardContent/0",
								"data-inspector-source": "pages/CaregiverProfile.tsx:435:15:320cbf145ed66e9ee0a6e2e1eaac3a9a548e314638ac0409fac3ecea5a11523a:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/div/5",
									"data-inspector-source": "pages/CaregiverProfile.tsx:436:17:1f85fca0d205f031497880accbf604bb5b9e354272520a40d0e43af7bf2612d3:1",
									className: "p-3 rounded-lg bg-success/10 flex items-center gap-2 text-sm text-success",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4 w-4" }),
										" ",
										t("caregiverProfile.bgCheckPassed")
									]
								}), caregiver.care_provider_background_check_detail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/p/1",
									"data-inspector-source": "pages/CaregiverProfile.tsx:440:19:dc01649818521f4159d7ee73e019926ca015bb7df161661d0dc25e5d688b609b:1",
									className: "mt-3 text-sm text-muted-foreground",
									children: caregiver.care_provider_background_check_detail
								})]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-4 lg:row-span-2 lg:self-start",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border-transparent card-elevated sticky top-24",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/CardContent/1",
							"data-inspector-source": "pages/CaregiverProfile.tsx:452:13:5aa40a5609121f807a0d4805d8cd5033d1a77e95bd35fa90fd3d34c6df402109:1",
							className: "p-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-center mb-6",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/span/2",
										"data-inspector-source": "pages/CaregiverProfile.tsx:454:17:36d48a7d87954254a7062d8cc408866d19270ca8ea00936d74a4673d1572b587:1",
										className: "text-3xl font-bold text-foreground",
										children: [isZh ? "¥" : "$", bookingOptions[0]?.rate || caregiver.care_provider_starts_hourly_rate || 0]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/span/3",
										"data-inspector-source": "pages/CaregiverProfile.tsx:455:17:eaa2160a3c158c313374d233eaad0c1128bc63315162ba6e92e696b9fa0e2f99:1",
										className: "text-muted-foreground",
										children: isZh ? "/小时" : "/hour"
									})]
								}),
								bookingOptions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-5 space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/p/2",
										"data-inspector-source": "pages/CaregiverProfile.tsx:460:19:f6066acd0e3f7f4f423f1cd1ae800d7f10861f75e5b21d1d1893d4692bc7c87f:1",
										className: "text-sm font-medium text-foreground",
										children: isZh ? "提供的服务" : "Services offered"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/div/6",
										"data-inspector-source": "pages/CaregiverProfile.tsx:461:19:439b6f9b43d94c6ccd7c220cd8528c328eb752b546b04255c1754d6c16590ed1:1",
										className: "space-y-2",
										children: bookingOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/div/7",
											"data-inspector-source": "pages/CaregiverProfile.tsx:463:23:e6518c52df6efd4684b8805014d7da1b19c1a64a2f0bdb7c97b65dc5648e6a4c:1",
											className: "rounded-lg border border-border bg-muted/30 px-3 py-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-start justify-between gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/span/4",
													"data-inspector-source": "pages/CaregiverProfile.tsx:465:27:986c2faee449fa71c6333bbbc3d48ca63e70f54c1b35de73317c945f530b4231:1",
													className: "text-sm text-foreground",
													children: option.label
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/span/5",
													"data-inspector-source": "pages/CaregiverProfile.tsx:466:27:1bdd7d9f9b434cbc499775dc77b9353604ee10988313a3e7c2bf41e648a44da6:1",
													className: "text-sm font-semibold text-foreground",
													children: isZh ? `¥${option.rate}${option.unit === "hour" ? "/小时" : "/次"}` : `$${option.rate}${option.unit === "hour" ? "/hr" : " each"}`
												})]
											})
										}, option.key))
									})]
								}),
								availabilityPreview.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-5 space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/p/3",
										"data-inspector-source": "pages/CaregiverProfile.tsx:480:19:8b279e7eb8efc056984be0b98a126906337172a1709158604e6abba7f9a33a5e:1",
										className: "text-sm font-medium text-foreground",
										children: isZh ? "可约时间" : "Availability"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/div/8",
										"data-inspector-source": "pages/CaregiverProfile.tsx:481:19:dd66b4a0569a1d07bd1f88685ea1cab597a6ea549438b1e12b2870d1769540e8:1",
										className: "space-y-1.5",
										children: availabilityPreview.map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/div/9",
											"data-inspector-source": "pages/CaregiverProfile.tsx:483:23:fd54cd3dbfd4575cd07524a7906a849f8f29bba28303f81f4e275dde7eab094d:1",
											className: "text-sm text-muted-foreground",
											children: slot.label
										}, slot.label))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
									"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Dialog/f66bf1d30c0d",
									"data-inspector-source": "pages/CaregiverProfile.tsx:489:15:0a20faf69a0f82e29885e0d4a50a6c5150f0349c3fb41745782f211204b08220:1",
									open: bookingDialogOpen,
									onOpenChange: setBookingDialogOpen,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Button/0",
											"data-inspector-source": "pages/CaregiverProfile.tsx:491:19:f512c9b75152183472fccd225d141e7fbc795275d8ffd3361d398db148b8e717:1",
											variant: "coral",
											className: "w-full mb-3",
											size: "lg",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "mr-2 h-4 w-4" }),
												" ",
												isZh ? "立即预约" : "Book Now"
											]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
										className: "sm:max-w-md",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
											"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/DialogTitle/0",
											"data-inspector-source": "pages/CaregiverProfile.tsx:497:21:202c9b601344242df282f4822be15720418f66e79b554b024ce23936ae221874:1",
											children: isZh ? `预约 ${caregiver.full_name}` : `Book ${caregiver.full_name}`
										}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/div/10",
											"data-inspector-source": "pages/CaregiverProfile.tsx:499:19:2841f46302ca9adca689c9dbf645a83f09fd5e7979693f8b024547a1f2543668:1",
											className: "space-y-4 mt-4",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/div/11",
													"data-inspector-source": "pages/CaregiverProfile.tsx:500:21:2d98207b73cc711122b21ea133d0df667fd847f6b0ed27d1bf599dc88361f69c:1",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Label/0",
															"data-inspector-source": "pages/CaregiverProfile.tsx:501:23:0262a361b9c60c709719c01f66495d8e0fdfbb65b7822b19878483d9485a6078:1",
															children: isZh ? "服务 *" : "Service *"
														}),
														bookingOptions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/div/12",
															"data-inspector-source": "pages/CaregiverProfile.tsx:503:25:8c88c4e14f002c1d5bd58d932e49fff4cf09e5e6cde73995f0f0eb4873c97041:1",
															className: "text-sm text-muted-foreground bg-muted/50 rounded-md p-3 border border-dashed",
															children: isZh ? "该护理者还没有公开服务与价格。请发消息与他们商定价格。" : "This caregiver hasn't published services and rates yet. Send them a message to agree a price."
														}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
															"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Select/25af120b4c1c",
															"data-inspector-source": "pages/CaregiverProfile.tsx:507:25:bba4a306abb8733c2911d77fbc3558321da1d4947e096ca8538141344c6fa826:1",
															value: deliveryResourceId,
															onValueChange: setDeliveryResourceId,
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {
																"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/SelectValue/0",
																"data-inspector-source": "pages/CaregiverProfile.tsx:508:42:67ca6b12c35a1dd7d091e50233c43a875db3c66d6ca2d31fcfc8bd26d8a78871:1",
																placeholder: isZh ? "选择服务" : "Select a service"
															}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
																"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/SelectContent/0",
																"data-inspector-source": "pages/CaregiverProfile.tsx:509:27:ab74b561bd775e2419fa1b648459e4f48a5d0ca40eb20e2155c9170a1ba8285a:1",
																children: bookingOptions.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
																	"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/SelectItem/0",
																	"data-inspector-source": "pages/CaregiverProfile.tsx:511:31:09a60041f4ac647a29691b42bc3685abb3dd25b1dfda4824db716e26ee6234a4:1",
																	value: o.key,
																	children: [
																		o.label,
																		" — ",
																		isZh ? `¥${o.rate}${o.unit === "hour" ? "/小时" : "/次"}` : `$${o.rate}${o.unit === "hour" ? "/hr" : " each"}`
																	]
																}, o.key))
															})]
														}),
														selectedResource && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
															"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/p/4",
															"data-inspector-source": "pages/CaregiverProfile.tsx:521:25:7875e4b04a5e6f0b16305584a4a9e78104c036a23422dc5c8208b0a8f2a8dcd0:1",
															className: "text-xs text-muted-foreground mt-1.5",
															children: [isZh ? "价格：" : "Rate: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/span/6",
																"data-inspector-source": "pages/CaregiverProfile.tsx:523:27:2981c6e5eaa1a058b008b7b37bb928605940158a95dd0ffc73528df5f489f661:1",
																className: "font-semibold text-foreground",
																children: isZh ? `¥${effectiveRate}${selectedResource.unit === "hour" ? "/小时" : "/次"}` : `$${effectiveRate}${selectedResource.unit === "hour" ? "/hr" : " each"}`
															})]
														})
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Label/1",
													"data-inspector-source": "pages/CaregiverProfile.tsx:532:23:66d5cfbcd1cfb52c070a8ea89f9aabc030e3987ba7d4a2ac1a2ef7feea798fee:1",
													children: isZh ? "日期 *" : "Date *"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Input/f9c91f9540c8",
													"data-inspector-source": "pages/CaregiverProfile.tsx:533:23:7e0deb2125c394bcbbfec7cc04a003d5f02ad836f57cf1160ae5e4678c2b2690:1",
													type: "date",
													value: bookingDate,
													onChange: (e) => {
														setBookingDate(e.target.value);
														setBookingTime("");
														setBookingEndTime("");
														setAvailabilityWarning("");
													},
													min: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-2 gap-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Label/2",
														"data-inspector-source": "pages/CaregiverProfile.tsx:547:25:130fcc1693c54327180965bfeff55eebb7be372a0e51cbd116646160817b04cc:1",
														children: isZh ? "开始 *" : "From *"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Select/6ce4d51f0137",
														"data-inspector-source": "pages/CaregiverProfile.tsx:548:25:d54e95c7a9289e215ddd3cd586a2d5f739b06d3f4fe13344cc641e0b86898a8b:1",
														value: bookingTime,
														onValueChange: (value) => {
															setBookingTime(value);
															setBookingEndTime("");
															checkAvailability(bookingDate, value, "");
														},
														disabled: !bookingDate || startTimeOptions.length === 0,
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {
															"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/SelectValue/1",
															"data-inspector-source": "pages/CaregiverProfile.tsx:557:42:80cfedb4885e3e508675c6bd9ec5e417dad28c056f90c63202015d58e53fa66f:1",
															placeholder: bookingDate ? isZh ? "选择开始时间" : "Select start" : isZh ? "请先选日期" : "Choose date first"
														}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
															"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/SelectContent/1",
															"data-inspector-source": "pages/CaregiverProfile.tsx:558:27:ab74b561bd775e2419fa1b648459e4f48a5d0ca40eb20e2155c9170a1ba8285a:1",
															children: startTimeOptions.map((time) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/SelectItem/1",
																"data-inspector-source": "pages/CaregiverProfile.tsx:560:31:9abd8b523e026129a0053b4d4c13ca00537872524e0b9f31d95569e32bbeab98:1",
																value: time,
																children: formatTimeLabel(time)
															}, time))
														})]
													})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Label/3",
														"data-inspector-source": "pages/CaregiverProfile.tsx:566:25:5e4882440c2134a2ab45d5c7b42209d87bfc06862d43a9a5383317b4f58f2694:1",
														children: isZh ? "结束 *" : "To *"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Select/536bbdacd67d",
														"data-inspector-source": "pages/CaregiverProfile.tsx:567:25:d54e95c7a9289e215ddd3cd586a2d5f739b06d3f4fe13344cc641e0b86898a8b:1",
														value: bookingEndTime,
														onValueChange: (value) => {
															setBookingEndTime(value);
															checkAvailability(bookingDate, bookingTime, value);
														},
														disabled: !bookingTime || endTimeOptions.length === 0,
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {
															"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/SelectValue/2",
															"data-inspector-source": "pages/CaregiverProfile.tsx:575:42:b155d572010cb9e900da8aa3a4322cfb4cc9eed3711647a384bf4684ff256803:1",
															placeholder: bookingTime ? isZh ? "选择结束时间" : "Select end" : isZh ? "请先选开始" : "Choose start first"
														}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
															"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/SelectContent/2",
															"data-inspector-source": "pages/CaregiverProfile.tsx:576:27:ab74b561bd775e2419fa1b648459e4f48a5d0ca40eb20e2155c9170a1ba8285a:1",
															children: endTimeOptions.map((time) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/SelectItem/2",
																"data-inspector-source": "pages/CaregiverProfile.tsx:578:31:9abd8b523e026129a0053b4d4c13ca00537872524e0b9f31d95569e32bbeab98:1",
																value: time,
																children: formatTimeLabel(time)
															}, time))
														})]
													})] })]
												}),
												bookingDate && startTimeOptions.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/div/13",
													"data-inspector-source": "pages/CaregiverProfile.tsx:585:23:f01bf4fb052ac2b04ad7651886e8ff216644afe3c9de5737877dfdda19354e52:1",
													className: "text-sm text-muted-foreground bg-muted/40 rounded-lg p-2.5 flex items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 shrink-0" }), isZh ? "该护理者未在此日期开放时段，请选择其他日期。" : "This caregiver has no published availability on this date. Please pick another day."]
												}),
												availabilityWarning && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/div/14",
													"data-inspector-source": "pages/CaregiverProfile.tsx:594:23:9ef384a1c900ed30164061101f0aa4a2d5fa3a234446a92eccc03825af0d3170:1",
													className: "text-sm text-warning bg-warning/10 rounded-lg p-2.5 flex items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 shrink-0" }), availabilityWarning]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "rounded-lg border border-border bg-muted/30 px-3 py-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/div/15",
														"data-inspector-source": "pages/CaregiverProfile.tsx:600:23:037ddce05b646f99c51468fd860757c7ce8eed8660f057194b9feddda3fb8698:1",
														className: "text-xs text-muted-foreground",
														children: isZh ? "时长" : "Duration"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/div/16",
														"data-inspector-source": "pages/CaregiverProfile.tsx:601:23:c64551b8a11e2872ad0adccb2930c52c13caf2dab74f0abe07e2a810ea53ca1a:1",
														className: "text-sm font-medium text-foreground",
														children: durationHrs > 0 ? isZh ? `${durationHrs} 小时` : `${durationHrs} hour${durationHrs > 1 ? "s" : ""}` : isZh ? "请选择时间段" : "Choose a time range"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/div/17",
													"data-inspector-source": "pages/CaregiverProfile.tsx:605:21:2d98207b73cc711122b21ea133d0df667fd847f6b0ed27d1bf599dc88361f69c:1",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Label/4",
															"data-inspector-source": "pages/CaregiverProfile.tsx:606:23:05c42b9cec65090f83be1c53fd00f85ecdcc4cf7e8759a7564a3202761a03937:1",
															children: isZh ? "周期" : "Recurring"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
															"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Select/6377eb6fed56",
															"data-inspector-source": "pages/CaregiverProfile.tsx:607:23:a92cf29e843d1d24f4b88d95559240f6aff10529088bb82a0ea36604b15d2deb:1",
															value: recurringPattern,
															onValueChange: setRecurringPattern,
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/SelectItem/3",
																	"data-inspector-source": "pages/CaregiverProfile.tsx:610:27:75b72875b796f81d972e9af5a42f1016a9076205b0661cf54c5a7269e76b56cb:1",
																	value: "none",
																	children: isZh ? "单次" : "One-time"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/SelectItem/4",
																	"data-inspector-source": "pages/CaregiverProfile.tsx:611:27:29fe6b4c8e4661ec654db4f99144c10425edc876cbe25c83452e997bd95dfc0e:1",
																	value: "weekly",
																	children: isZh ? "每周" : "Weekly"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/SelectItem/5",
																	"data-inspector-source": "pages/CaregiverProfile.tsx:612:27:d45b95d7f371f69aebc965245c3e229c5ae988d377f4c10eb58d2cb61db62ca9:1",
																	value: "biweekly",
																	children: isZh ? "每两周" : "Bi-weekly"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/SelectItem/6",
																	"data-inspector-source": "pages/CaregiverProfile.tsx:613:27:f954f9d494151852fb363783003bd8ac85977040e3e33e540d42054f2347c392:1",
																	value: "monthly",
																	children: isZh ? "每月" : "Monthly"
																})
															] })]
														}),
														recurringPattern !== "none" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/p/5",
															"data-inspector-source": "pages/CaregiverProfile.tsx:617:25:aedbbaf69faf5f16efc52fe435892264545b9adb5631c6abce2c5b447ffbcc11:1",
															className: "text-xs text-muted-foreground mt-1",
															children: isZh ? "周期只是给护理者的请求备注：本次只为这一次服务付款，后续每次单独预约付款。" : "Recurring is a note to the caregiver — you pay for this session only; each later session is booked and paid separately."
														})
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Label/5",
													"data-inspector-source": "pages/CaregiverProfile.tsx:625:23:3e3767faef6862b0aea20c36e3ecfadc4b48a1b78eb4446f1b02fabd82347653:1",
													children: isZh ? "备注" : "Notes"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
													"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Textarea/ed76ec33d35f",
													"data-inspector-source": "pages/CaregiverProfile.tsx:626:23:54e74922a81874d1f92afda89a20978e0033f909a73f749a2982a8f38486f45b:1",
													value: bookingNotes,
													onChange: (e) => setBookingNotes(e.target.value),
													placeholder: isZh ? "任何特殊需求…" : "Any special requirements..."
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between items-center pt-2 border-t",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/span/7",
														"data-inspector-source": "pages/CaregiverProfile.tsx:629:23:560342ae26e5ba105055be305ccc5d598586341fb1099851ca37f759ef8aa274:1",
														className: "text-sm text-muted-foreground",
														children: isZh ? "本次预估总价" : "Estimated Total (this session)"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/span/8",
														"data-inspector-source": "pages/CaregiverProfile.tsx:630:23:5a80c84dde5740a815251608e0da1c3fb31102e39ae90f6fb055979f059e37ea:1",
														className: "text-xl font-bold text-foreground",
														children: [isZh ? "¥" : "$", total]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Button/0daf7741d4c0",
													"data-inspector-source": "pages/CaregiverProfile.tsx:633:21:50ffc68b8701159fa15ad8ab3b32dd5a8bf459f4ddf7a1dc5b266626ffb96cc5:1",
													variant: "coral",
													className: "w-full",
													onClick: handleBooking,
													disabled: addToCart.isPending || hasAvailabilityConflict || !selectedResource,
													children: addToCart.isPending ? isZh ? "加入中…" : "Adding..." : isZh ? "加入购物车并结算" : "Add to Cart & Checkout"
												})
											]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Button/3e8c3ba0b464",
									"data-inspector-source": "pages/CaregiverProfile.tsx:640:15:ce6fe2dac7ecea5d4a1008c958414f7e18c0a267da2e2673f8bbea4a91901050:1",
									variant: "outline",
									className: "w-full mb-3",
									onClick: () => {
										if (!isAuthenticated) {
											navigate("/auth");
											return;
										}
										startConversation.mutate({ otherUserId: caregiver.id }, {
											onSuccess: () => navigate("/inbox?tab=messages", { state: {
												targetUserId: caregiver.id,
												targetUserName: caregiver.full_name,
												targetUserAvatar: caregiver.avatar_url
											} }),
											onError: () => navigate("/inbox?tab=messages")
										});
									},
									disabled: startConversation.isPending,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "mr-2 h-4 w-4" }),
										" ",
										startConversation.isPending ? isZh ? "正在打开…" : "Opening..." : isZh ? "发消息 / 议价" : "Message / Negotiate Price"
									]
								}),
								caregiver.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Button/1",
									"data-inspector-source": "pages/CaregiverProfile.tsx:650:17:0a267b857a73aab5927df3127fa7c5e5bc58ad63f50b03ef1f268e68adb765d8:1",
									variant: "ghost",
									className: "w-full",
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/a/0",
										"data-inspector-source": "pages/CaregiverProfile.tsx:651:19:5e65ebf6f6ecdfe60949521a0c6e49ae83f21b97c554322e5240a9de96c1313f:1",
										href: `tel:${caregiver.phone}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "mr-2 h-4 w-4" }),
											" ",
											isZh ? `致电 ${caregiver.full_name || ""}` : `Call ${caregiver.full_name?.split(" ")[0] || ""}`
										]
									})
								}),
								caregiver.care_provider_is_background_checked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-6 pt-4 border-t space-y-3 text-sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/span/9",
											"data-inspector-source": "pages/CaregiverProfile.tsx:661:21:825ec176409a82e3c599766dbada8898f5d06696259c36221ada38496b1721fe:1",
											children: isZh ? "已通过背景核查" : "Background verified"
										})]
									})
								})
							]
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lg:col-span-2 lg:col-start-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-transparent card-elevated",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
								"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/CardTitle/2",
								"data-inspector-source": "pages/CaregiverProfile.tsx:675:19:11c2e02551280f6c831dd0a16b140b8c283d4513633e91d85f288615a177b4cc:1",
								children: [
									isZh ? "评价" : "Reviews",
									" (",
									reviews?.length || 0,
									")"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
								"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Dialog/4e51c16f0fd0",
								"data-inspector-source": "pages/CaregiverProfile.tsx:676:19:6482cc41fd6fc4d6f8f8816afb08eff8d2118da6035a46aeabc27ae4acb3dfdd:1",
								open: reviewDialogOpen,
								onOpenChange: (open) => {
									if (open && !isAuthenticated) {
										toast({
											title: isZh ? "请先登录后撰写评价" : "Please sign in to write a review",
											variant: "destructive"
										});
										navigate("/auth");
										return;
									}
									setReviewDialogOpen(open);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Button/2",
										"data-inspector-source": "pages/CaregiverProfile.tsx:685:25:129e11122218cc4fbc9b9d0704d2d0d7a48008bd94b7fbd225a780ed02747c9d:1",
										variant: "coral",
										size: "sm",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3.5 w-3.5 mr-1" }),
											" ",
											isZh ? "撰写评价" : "Write Review"
										]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
									className: "sm:max-w-md",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
										"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/DialogTitle/1",
										"data-inspector-source": "pages/CaregiverProfile.tsx:688:39:8ee3445dc2c18e9c064fd0d9dc66cc2d102488ba65ee88fc8eb3a3ba7e3e9e26:1",
										children: [isZh ? "评价 " : "Review ", caregiver.full_name]
									}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-4 mt-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Label/6",
												"data-inspector-source": "pages/CaregiverProfile.tsx:691:29:31f11492666f5dd876361192820f914e2178606c24b112e9bd4b1a56238f23e8:1",
												className: "mb-2 block",
												children: isZh ? "评分" : "Rating"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/div/18",
												"data-inspector-source": "pages/CaregiverProfile.tsx:692:29:5b65d1d9a21d54e3552d3121d514440c9079346f170810686e25cc2901c32977:1",
												className: "flex gap-1",
												children: [
													1,
													2,
													3,
													4,
													5
												].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/button/0ac1d653765b",
													"data-inspector-source": "pages/CaregiverProfile.tsx:694:34:f66566949df5848910d2ab10db158920ec2e48f1c9f6f895f7b82c0a46b86e68:1",
													type: "button",
													"aria-label": isZh ? `${s} 星` : `${s} stars`,
													"aria-pressed": s === reviewRating,
													onClick: () => setReviewRating(s),
													className: "min-h-11 min-w-11 flex items-center justify-center rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
														"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Star/0",
														"data-inspector-source": "pages/CaregiverProfile.tsx:695:35:475955973c2e649b8fae1c365aaa957c18bc1bed2543b31e7cb52f75d09c2685:1",
														className: `h-7 w-7 cursor-pointer transition-colors ${s <= reviewRating ? "text-warning fill-warning" : "text-muted-foreground/30"}`
													})
												}, s))
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Label/7",
												"data-inspector-source": "pages/CaregiverProfile.tsx:701:29:4e3e0e91e60b01efee3079bf36c8105d560a00f74c02541805c46454f80551f0:1",
												children: isZh ? "评论" : "Comment"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
												"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Textarea/9fb963a987d5",
												"data-inspector-source": "pages/CaregiverProfile.tsx:702:29:6b13017f3ddd1f46d868d3f72c1c5c1e0ac97d8c5ef729b745c9a7081200ba22:1",
												value: reviewComment,
												onChange: (e) => setReviewComment(e.target.value),
												placeholder: isZh ? "分享您的体验…" : "Share your experience...",
												rows: 4
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Button/d44848545870",
												"data-inspector-source": "pages/CaregiverProfile.tsx:704:27:ef4ddc5a475a94b424924c2c37833fa94ef743d630e6f7aeeeb8b208b27db497:1",
												variant: "coral",
												className: "w-full",
												disabled: createReview.isPending,
												onClick: async () => {
													try {
														await createReview.mutateAsync({
															entity_id: caregiver.id,
															entity_type: "provider",
															rating: reviewRating,
															comment: reviewComment
														});
														toast({
															title: isZh ? "评价已提交！" : "Review submitted!",
															description: isZh ? "感谢您的反馈。" : "Thank you for your feedback."
														});
														setReviewDialogOpen(false);
														setReviewRating(5);
														setReviewComment("");
													} catch (err) {
														toast({
															title: isZh ? "提交评价失败" : "Failed to submit review",
															description: err.message,
															variant: "destructive"
														});
													}
												},
												children: createReview.isPending ? isZh ? "提交中…" : "Submitting..." : isZh ? "提交评价" : "Submit Review"
											})
										]
									})]
								})]
							})]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/CardContent/2",
							"data-inspector-source": "pages/CaregiverProfile.tsx:722:15:feb18dbf869a28937d51636c693dfdb0959cfd70a0b28fccd954b9628bb195f2:1",
							className: "space-y-4",
							children: (reviews || []).length > 0 ? (reviews || []).map((review) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/div/19",
								"data-inspector-source": "pages/CaregiverProfile.tsx:724:19:9899c74eb36e5dd83347cac368881c9f83f051b1a0dfa082bdaca1a45105a482:1",
								className: "border-b last:border-0 pb-4 last:pb-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between mb-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/span/10",
											"data-inspector-source": "pages/CaregiverProfile.tsx:726:23:5d3bfc1daf3697748925d871a2b263f57e8b42bb15555b5f36eff2f608e2ee3e:1",
											className: "font-medium text-sm text-foreground",
											children: review.reviewer?.full_name || (isZh ? "未填姓名" : "No name")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/span/11",
											"data-inspector-source": "pages/CaregiverProfile.tsx:727:23:410028eb4dc26fc47acee5cd3c2c0acbd76314149721a7445047289d49144291:1",
											className: "text-xs text-muted-foreground",
											children: formatDate(review.created_at, i18n.language, {
												month: "short",
												day: "numeric",
												year: "numeric"
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/div/20",
										"data-inspector-source": "pages/CaregiverProfile.tsx:729:21:825b2d4c1a76863e81e32da23b7cdb89f215ef440d68243ccc2ea49998abf6de:1",
										className: "flex gap-0.5 mb-2",
										children: Array.from({ length: review.rating }).map((_, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
											"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/Star/1",
											"data-inspector-source": "pages/CaregiverProfile.tsx:731:25:2ab3a109906731720140e1ceea932bdcc3e1eb4cf2198154339b3d2691b4030a:1",
											className: "h-3 w-3 text-warning fill-warning"
										}, j))
									}),
									review.content && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/p/6",
										"data-inspector-source": "pages/CaregiverProfile.tsx:734:40:ec933b398daaddc58018fac6cd02877a60856c3aa2019d70517babda97b5517a:1",
										className: "text-sm text-muted-foreground",
										children: review.content
									}),
									review.response_text && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/div/21",
										"data-inspector-source": "pages/CaregiverProfile.tsx:736:23:b3876df5574e7d814b76c79cbfc793715ee07b7640b2856d59ae2f3d7ff6e2e5:1",
										className: "mt-2 ml-4 p-2 bg-muted/50 rounded-sm text-sm text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/span/12",
												"data-inspector-source": "pages/CaregiverProfile.tsx:737:25:6951f9733bd1b6f7951c933e09412246e9508bf4456a2e75bae5db23987d0e20:1",
												className: "font-medium",
												children: isZh ? "服务者回复：" : "Provider response:"
											}),
											" ",
											review.response_text
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentsSection, {
										"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/CommentsSection/0",
										"data-inspector-source": "pages/CaregiverProfile.tsx:740:21:0cac2fa7f1e9d68b1982a2176bc084352950720fa3f6c880aff8352b55c6a2e4:1",
										relationId: R.reviewComments,
										parentId: review.id,
										compact: true
									})
								]
							}, review.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/CaregiverProfile/CaregiverProfile/p/7",
								"data-inspector-source": "pages/CaregiverProfile.tsx:743:19:f5aa62f5d7e9ad4f4555bb94928d2ee723fd03fe35fb2cac10c5cf2f231bd1fb:1",
								className: "text-sm text-muted-foreground text-center py-4",
								children: isZh ? "暂无评价" : "No reviews yet"
							})
						})]
					})
				})
			]
		})]
	});
}
function RouteCaregiverIdPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFeature, {
		name: "paidCaregivers",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaregiverProfile, {})
	});
}
//#endregion
export { RouteCaregiverIdPage as component };
