import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { t as Badge } from "./badge-B2YCAhUo.mjs";
import { t as formatDate } from "./locale-DKwjQju2.mjs";
import { En as CircleCheck, Ln as CalendarDays, Xn as ArrowRight, dn as DollarSign, vn as Clock } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { i as useNavigate$1, o as useSearchParams } from "./router-compat-DbWBz8c6.mjs";
import { t as RequireAuth } from "./RequireAuth-C-F4CYYW.mjs";
import { t as SiteFeature } from "./SiteFeature-DJLQlP_2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/order-confirmation-DklhviyG.js
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
		"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/div/0",
		"data-inspector-source": "pages/OrderConfirmation.tsx:29:5:b260abd948c1fbdffea02b7d5f4fa53f390ac4d97602abdf07cc40f1eebf3675:1",
		className: "max-w-2xl mx-auto px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/div/1",
				"data-inspector-source": "pages/OrderConfirmation.tsx:30:7:0ef86b4b15e29950bf7f1fc901d6db2a7783ea2793b573b612eee8a08b96f753:1",
				className: "text-center mb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/div/2",
						"data-inspector-source": "pages/OrderConfirmation.tsx:31:9:702f616d72a7cc26c17c08ab135c9be7173014a93577a105994624e9a48ce114:1",
						className: `inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-3 ${showConfetti ? "animate-bounce" : ""}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
							"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/CheckCircle2/0",
							"data-inspector-source": "pages/OrderConfirmation.tsx:32:11:25d8ff214e35b2a292d6ae323243e28ca427afe8bdfccd5a67d6d88b36b51903:1",
							className: "h-8 w-8 text-success"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/h1/e3b98a4da31a/0",
						"data-inspector-source": "pages/OrderConfirmation.tsx:34:9:400198eba2774bbd2d3e100ca9e0cf891d17964d82fb1f3f7114158df9a5345f:1",
						className: "text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2",
						children: t("checkout.orderConfirmed", "Order Confirmed!")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/p/e3b98a4da31a/0",
						"data-inspector-source": "pages/OrderConfirmation.tsx:37:9:651945639281ff6cd40ab501057a2d0b0942fe3a614e60bcc59625cebd63c089:1",
						className: "text-sm sm:text-base text-muted-foreground",
						children: t("checkout.thankYou", "Thank you for your booking. Your order has been placed successfully.")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/Card/0",
				"data-inspector-source": "pages/OrderConfirmation.tsx:42:7:dfe8edebe8c878b657260aa60786847c3b717dd5c1bca11a3a32e7dfb50ebfab:1",
				className: "border-transparent card-elevated mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/CardHeader/0",
					"data-inspector-source": "pages/OrderConfirmation.tsx:43:9:f2010175d54cc87753e86af53f4a441e8a997c64d0ff1c2dd8c2e95d07273c0b:1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/CardTitle/429043d8649d/0",
						"data-inspector-source": "pages/OrderConfirmation.tsx:44:11:aef6dbef7b83f902b059f3fb43f01529655a7a1d5e41d63d7235be1194930547:1",
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/span/e3b98a4da31a/0",
							"data-inspector-source": "pages/OrderConfirmation.tsx:45:13:8f9ba9238fcd50d4aaa5cab4e6548fd7f427d0b135fe84a03da2a51f899d39ee:1",
							children: t("checkout.orderSummary", "Order Summary")
						}), orderId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/Badge/120559ff820e/0",
							"data-inspector-source": "pages/OrderConfirmation.tsx:47:15:6a146df0399882df9095a07b691bc3147eddeedf3330d989b4842260eb92eae6:1",
							variant: "outline",
							className: "text-sm font-mono",
							children: ["#", orderId]
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/CardContent/f47caa48c159/0",
					"data-inspector-source": "pages/OrderConfirmation.tsx:53:9:cc8ea7d2cded8a22448260682e5f00c2d8bec53617c3b425befcf0e177771087:1",
					className: "space-y-4",
					children: [
						providerName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/div/3",
							"data-inspector-source": "pages/OrderConfirmation.tsx:55:13:4a922c2f8abd9d4e954db97bf3c506c383054e22ae7522de968f5a7d88e79744:1",
							className: "flex items-center justify-between py-2 border-b border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/span/e3b98a4da31a/1",
								"data-inspector-source": "pages/OrderConfirmation.tsx:56:15:68bc661653aa8edc98a4ceab8115b809b41fb790697e45b1e43bff3434a7e610:1",
								className: "text-muted-foreground",
								children: t("checkout.provider", "Provider")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/span/97dd58bb69e5/0",
								"data-inspector-source": "pages/OrderConfirmation.tsx:57:15:1358828e92ba805045ccacbde25c6a9c6babba3e6caaa2f4150223060ad4dc28:1",
								className: "font-semibold",
								children: providerName
							})]
						}),
						orderDate && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/div/4",
							"data-inspector-source": "pages/OrderConfirmation.tsx:61:13:4a922c2f8abd9d4e954db97bf3c506c383054e22ae7522de968f5a7d88e79744:1",
							className: "flex items-center justify-between py-2 border-b border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/span/e3b98a4da31a/2",
								"data-inspector-source": "pages/OrderConfirmation.tsx:62:15:77f07148f66c761fe6a537a7e0704f49f3e7c361db8d16935a341b6ea850d81f:1",
								className: "text-muted-foreground flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, {
										"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/CalendarDays/0",
										"data-inspector-source": "pages/OrderConfirmation.tsx:63:17:bfa8346b7f7f07b6ff67defb56d56d617b972f0780860449e59dff2c316a640e:1",
										className: "h-4 w-4"
									}),
									" ",
									t("checkout.date", "Date")
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/span/40ffcddcb578/0",
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
							"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/div/5",
							"data-inspector-source": "pages/OrderConfirmation.tsx:70:11:0ac4d28e18321e7cd1e74bd06d9330d4dc69ff466b072bd15392ea99898c9f02:1",
							className: "flex items-center justify-between py-2 border-b border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/span/e3b98a4da31a/3",
								"data-inspector-source": "pages/OrderConfirmation.tsx:71:13:b0d6f446e962a2c9d0cee6b9e964b3459794a70c8ab10b3eba4818b86b59426d:1",
								className: "text-muted-foreground",
								children: t("checkout.status", "Status")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/Badge/1145bf6cc336/0",
								"data-inspector-source": "pages/OrderConfirmation.tsx:72:13:8cc0c351f9064d6cff369ce22d53ee99c62a70e6b7916aadd60c7c94297589c2:1",
								className: status === "processing" || status === "completed" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground",
								children: status === "processing" ? t("checkout.confirmed", "Confirmed") : status === "on-hold" || status === "pending" ? i18n.language?.startsWith("zh") ? "待付款" : "Awaiting payment" : status
							})]
						}),
						(status === "on-hold" || status === "pending") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/p/2e6c1d713d20/0",
							"data-inspector-source": "pages/OrderConfirmation.tsx:81:13:d2f4454377d37065fe658a3d186f91225f27f4f0c679bf2a6e5425db87597216:1",
							className: "text-sm text-muted-foreground pb-2",
							children: i18n.language?.startsWith("zh") ? "订单已创建，等待护理者确认。确认与付款状态都会在「我的预约」中更新，你无需离开本应用。" : "The order is created and is waiting for the caregiver to confirm. Confirmation and payment status both update under My Bookings — you never need to leave this app."
						}),
						orderTotal && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/div/6",
							"data-inspector-source": "pages/OrderConfirmation.tsx:90:13:a6d174a21208716ffff30ea6942926aa5679cb7bb8e87e6d88986a8e201b88cf:1",
							className: "flex items-center justify-between py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/span/e3b98a4da31a/4",
								"data-inspector-source": "pages/OrderConfirmation.tsx:91:15:81e20b1953951bb9505d70054fe405112fb935db9b7a36d5e0abe5e913e433b5:1",
								className: "text-lg font-semibold flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, {
										"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/DollarSign/0",
										"data-inspector-source": "pages/OrderConfirmation.tsx:92:17:8b030ea4f58b3af955a832899c90634d439d299ff00912108c50aa85c1ed6c80:1",
										className: "h-5 w-5"
									}),
									" ",
									t("checkout.total", "Total")
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/span/629be501f8d9/0",
								"data-inspector-source": "pages/OrderConfirmation.tsx:94:15:cf6b9bdd1eacacf8592f6027ec10e37ef1ed98aeff319408b9a0306e8009e5a7:1",
								className: "text-2xl font-bold text-primary",
								children: [i18n.language?.startsWith("zh") ? "¥" : "$", orderTotal]
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/Card/1",
				"data-inspector-source": "pages/OrderConfirmation.tsx:100:7:dfe8edebe8c878b657260aa60786847c3b717dd5c1bca11a3a32e7dfb50ebfab:1",
				className: "border-transparent card-elevated mb-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/CardContent/0",
					"data-inspector-source": "pages/OrderConfirmation.tsx:101:9:02cbd0fdbf988448b7e38d9b284324a1c9f395a4ca672687934db30937fbe22c:1",
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/h3/e3b98a4da31a/0",
						"data-inspector-source": "pages/OrderConfirmation.tsx:102:11:89fedafba190906fbbaec6bc19b2de75f42b806fa4ec3771483610e6dc48f1e2:1",
						className: "font-semibold mb-2",
						children: t("checkout.whatNext", "What happens next?")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/ul/0",
						"data-inspector-source": "pages/OrderConfirmation.tsx:103:11:b89fe38ef0c93f1d0f1a880012ecbe9355130223de2c16f19465e66ba2cee1fb:1",
						className: "space-y-2 text-sm text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/li/e3b98a4da31a/0",
								"data-inspector-source": "pages/OrderConfirmation.tsx:104:13:99d9253ec7c7f0f28dc1740f8bf7d6d3504ee2f4d34c349e08df531dcb388500:1",
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
									"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/Clock/0",
									"data-inspector-source": "pages/OrderConfirmation.tsx:105:15:c883c33261ded8295264d182dfe965631e1ec92047756e7abf48c39382ed50fe:1",
									className: "h-4 w-4 mt-0.5 text-primary shrink-0"
								}), t("checkout.nextStep1", "Your provider will review and confirm your booking.")]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/li/e3b98a4da31a/1",
								"data-inspector-source": "pages/OrderConfirmation.tsx:108:13:99d9253ec7c7f0f28dc1740f8bf7d6d3504ee2f4d34c349e08df531dcb388500:1",
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, {
									"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/CalendarDays/1",
									"data-inspector-source": "pages/OrderConfirmation.tsx:109:15:0aa3969550843efcc7bdb78d53b693bed59bf10c662985dad3d79408bde80bf2:1",
									className: "h-4 w-4 mt-0.5 text-primary shrink-0"
								}), t("checkout.nextStep2", "You'll receive a notification when your booking is confirmed.")]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/li/e3b98a4da31a/2",
								"data-inspector-source": "pages/OrderConfirmation.tsx:112:13:99d9253ec7c7f0f28dc1740f8bf7d6d3504ee2f4d34c349e08df531dcb388500:1",
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
									"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/CheckCircle2/1",
									"data-inspector-source": "pages/OrderConfirmation.tsx:113:15:a92ba790df618564acff26f8f73cc1653e32db6c705dc4675698c17ae1839dbf:1",
									className: "h-4 w-4 mt-0.5 text-primary shrink-0"
								}), t("checkout.nextStep3", "You can manage or reschedule your booking from the Bookings page.")]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/div/7",
				"data-inspector-source": "pages/OrderConfirmation.tsx:120:7:bd61597a57d0346a77e1ed24830d29a63a37d6b4a5a38ed37cfaeddc148378e3:1",
				className: "flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/Button/64da27f77818/0",
					"data-inspector-source": "pages/OrderConfirmation.tsx:121:9:884c55bc81cd07521a36072aad975e13b4b7669b8a966fba2e7052593c0b773d:1",
					variant: "coral",
					className: "flex-1",
					onClick: () => navigate("/bookings"),
					children: [
						t("checkout.viewBookings", "View My Bookings"),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
							"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/ArrowRight/0",
							"data-inspector-source": "pages/OrderConfirmation.tsx:122:60:ebdf2660d21d1559b1f1696c840a7317d02199fda74aa648de9c3cdd3451bc19:1",
							className: "h-4 w-4 ml-2"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					"data-inspector-id": "pages/OrderConfirmation/OrderConfirmation/Button/64da27f77818/1",
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
		"data-inspector-id": "routes/order-confirmation/RouteOrderConfirmationPage/SiteFeature/0",
		"data-inspector-source": "routes/order-confirmation.tsx:5:10:ba586dc9d6169852acd35a1605cdde2fbca5503fd5f6006065ad38ee13c96e7a:1",
		name: "paidCaregivers",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, {
			"data-inspector-id": "routes/order-confirmation/RouteOrderConfirmationPage/RequireAuth/0",
			"data-inspector-source": "routes/order-confirmation.tsx:5:45:ba586dc9d6169852acd35a1605cdde2fbca5503fd5f6006065ad38ee13c96e7a:1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderConfirmation, {
				"data-inspector-id": "routes/order-confirmation/RouteOrderConfirmationPage/OrderConfirmation/0",
				"data-inspector-source": "routes/order-confirmation.tsx:5:58:ba586dc9d6169852acd35a1605cdde2fbca5503fd5f6006065ad38ee13c96e7a:1"
			})
		})
	});
}
//#endregion
export { RouteOrderConfirmationPage as component };
