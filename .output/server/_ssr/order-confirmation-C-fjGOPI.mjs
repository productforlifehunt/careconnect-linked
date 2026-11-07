import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { t as Badge } from "./badge-B2YCAhUo.mjs";
import { t as formatDate } from "./locale-DKwjQju2.mjs";
import { En as CircleCheck, Ln as CalendarDays, Xn as ArrowRight, dn as DollarSign, vn as Clock } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { i as useNavigate$1, o as useSearchParams } from "./router-compat-CRbRSfhz.mjs";
import { t as RequireAuth } from "./RequireAuth-DeCqG_0H.mjs";
import { t as SiteFeature } from "./SiteFeature-Dc7M6czo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/order-confirmation-C-fjGOPI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function OrderConfirmation() {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate$1();
	const [searchParams] = useSearchParams();
	const orderId = searchParams.get("order_id");
	const orderTotal = searchParams.get("total");
	const orderDate = searchParams.get("date");
	const providerName = searchParams.get("provider");
	const status = searchParams.get("status") || "processing";
	const [showConfetti, setShowConfetti] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const timer = setTimeout(() => setShowConfetti(false), 3e3);
		return () => clearTimeout(timer);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-2xl mx-auto px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center mb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/div/0",
						"data-inspector-source": "pages/OrderConfirmation.tsx:31:9:702f616d72a7cc26c17c08ab135c9be7173014a93577a105994624e9a48ce114:1",
						className: `inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-3 ${showConfetti ? "animate-bounce" : ""}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-8 w-8 text-success" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/h1/0",
						"data-inspector-source": "pages/OrderConfirmation.tsx:34:9:400198eba2774bbd2d3e100ca9e0cf891d17964d82fb1f3f7114158df9a5345f:1",
						className: "text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2",
						children: t("checkout.orderConfirmed", "Order Confirmed!")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/p/0",
						"data-inspector-source": "pages/OrderConfirmation.tsx:37:9:651945639281ff6cd40ab501057a2d0b0942fe3a614e60bcc59625cebd63c089:1",
						className: "text-sm sm:text-base text-muted-foreground",
						children: t("checkout.thankYou", "Thank you for your booking. Your order has been placed successfully.")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-transparent card-elevated mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/CardTitle/0",
					"data-inspector-source": "pages/OrderConfirmation.tsx:44:11:aef6dbef7b83f902b059f3fb43f01529655a7a1d5e41d63d7235be1194930547:1",
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/span/0",
						"data-inspector-source": "pages/OrderConfirmation.tsx:45:13:8f9ba9238fcd50d4aaa5cab4e6548fd7f427d0b135fe84a03da2a51f899d39ee:1",
						children: t("checkout.orderSummary", "Order Summary")
					}), orderId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/Badge/0",
						"data-inspector-source": "pages/OrderConfirmation.tsx:47:15:6a146df0399882df9095a07b691bc3147eddeedf3330d989b4842260eb92eae6:1",
						variant: "outline",
						className: "text-sm font-mono",
						children: ["#", orderId]
					})]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/CardContent/0",
					"data-inspector-source": "pages/OrderConfirmation.tsx:53:9:cc8ea7d2cded8a22448260682e5f00c2d8bec53617c3b425befcf0e177771087:1",
					className: "space-y-4",
					children: [
						providerName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between py-2 border-b border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/span/1",
								"data-inspector-source": "pages/OrderConfirmation.tsx:56:15:68bc661653aa8edc98a4ceab8115b809b41fb790697e45b1e43bff3434a7e610:1",
								className: "text-muted-foreground",
								children: t("checkout.provider", "Provider")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/span/2",
								"data-inspector-source": "pages/OrderConfirmation.tsx:57:15:1358828e92ba805045ccacbde25c6a9c6babba3e6caaa2f4150223060ad4dc28:1",
								className: "font-semibold",
								children: providerName
							})]
						}),
						orderDate && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between py-2 border-b border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/span/3",
								"data-inspector-source": "pages/OrderConfirmation.tsx:62:15:77f07148f66c761fe6a537a7e0704f49f3e7c361db8d16935a341b6ea850d81f:1",
								className: "text-muted-foreground flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "h-4 w-4" }),
									" ",
									t("checkout.date", "Date")
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/span/4",
								"data-inspector-source": "pages/OrderConfirmation.tsx:65:15:76d43f58c5a60e3d11aa5b4871003d79e55530449bbbcf998c2fe26a8ca57c46:1",
								className: "font-semibold",
								children: formatDate(orderDate, i18n.language, {
									month: "long",
									day: "numeric",
									year: "numeric"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between py-2 border-b border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/span/5",
								"data-inspector-source": "pages/OrderConfirmation.tsx:71:13:b0d6f446e962a2c9d0cee6b9e964b3459794a70c8ab10b3eba4818b86b59426d:1",
								className: "text-muted-foreground",
								children: t("checkout.status", "Status")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/Badge/1",
								"data-inspector-source": "pages/OrderConfirmation.tsx:72:13:8cc0c351f9064d6cff369ce22d53ee99c62a70e6b7916aadd60c7c94297589c2:1",
								className: status === "processing" || status === "completed" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground",
								children: status === "processing" ? t("checkout.confirmed", "Confirmed") : status === "on-hold" || status === "pending" ? i18n.language?.startsWith("zh") ? "待付款" : "Awaiting payment" : status
							})]
						}),
						(status === "on-hold" || status === "pending") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/p/1",
							"data-inspector-source": "pages/OrderConfirmation.tsx:81:13:d2f4454377d37065fe658a3d186f91225f27f4f0c679bf2a6e5425db87597216:1",
							className: "text-sm text-muted-foreground pb-2",
							children: i18n.language?.startsWith("zh") ? "订单已创建，等待护理者确认。确认与付款状态都会在「我的预约」中更新，你无需离开本应用。" : "The order is created and is waiting for the caregiver to confirm. Confirmation and payment status both update under My Bookings — you never need to leave this app."
						}),
						orderTotal && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/span/6",
								"data-inspector-source": "pages/OrderConfirmation.tsx:91:15:81e20b1953951bb9505d70054fe405112fb935db9b7a36d5e0abe5e913e433b5:1",
								className: "text-lg font-semibold flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-5 w-5" }),
									" ",
									t("checkout.total", "Total")
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/span/7",
								"data-inspector-source": "pages/OrderConfirmation.tsx:94:15:cf6b9bdd1eacacf8592f6027ec10e37ef1ed98aeff319408b9a0306e8009e5a7:1",
								className: "text-2xl font-bold text-primary",
								children: [i18n.language?.startsWith("zh") ? "¥" : "$", orderTotal]
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-transparent card-elevated mb-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/h3/0",
						"data-inspector-source": "pages/OrderConfirmation.tsx:102:11:89fedafba190906fbbaec6bc19b2de75f42b806fa4ec3771483610e6dc48f1e2:1",
						className: "font-semibold mb-2",
						children: t("checkout.whatNext", "What happens next?")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "space-y-2 text-sm text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/li/0",
								"data-inspector-source": "pages/OrderConfirmation.tsx:104:13:99d9253ec7c7f0f28dc1740f8bf7d6d3504ee2f4d34c349e08df531dcb388500:1",
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 mt-0.5 text-primary shrink-0" }), t("checkout.nextStep1", "Your provider will review and confirm your booking.")]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/li/1",
								"data-inspector-source": "pages/OrderConfirmation.tsx:108:13:99d9253ec7c7f0f28dc1740f8bf7d6d3504ee2f4d34c349e08df531dcb388500:1",
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "h-4 w-4 mt-0.5 text-primary shrink-0" }), t("checkout.nextStep2", "You'll receive a notification when your booking is confirmed.")]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/li/2",
								"data-inspector-source": "pages/OrderConfirmation.tsx:112:13:99d9253ec7c7f0f28dc1740f8bf7d6d3504ee2f4d34c349e08df531dcb388500:1",
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 mt-0.5 text-primary shrink-0" }), t("checkout.nextStep3", "You can manage or reschedule your booking from the Bookings page.")]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/Button/d0cda6559bb3",
					"data-inspector-source": "pages/OrderConfirmation.tsx:121:9:884c55bc81cd07521a36072aad975e13b4b7669b8a966fba2e7052593c0b773d:1",
					variant: "coral",
					className: "flex-1",
					onClick: () => navigate("/bookings"),
					children: [
						t("checkout.viewBookings", "View My Bookings"),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4 ml-2" })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/Button/d0cda6559bb3",
					"data-inspector-source": "pages/OrderConfirmation.tsx:124:9:f3b0f37bc7a19a1006b45603647ca0161b46326c97ffa59948f67dbbb25da17d:1",
					variant: "outline",
					className: "flex-1",
					onClick: () => navigate("/search"),
					children: t("checkout.browseMore", "Browse More Services")
				})]
			})
		]
	});
}
function RouteOrderConfirmationPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFeature, {
		name: "paidCaregivers",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderConfirmation, {}) })
	});
}
//#endregion
export { RouteOrderConfirmationPage as component };
