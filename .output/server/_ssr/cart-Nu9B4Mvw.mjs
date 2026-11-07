import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { t as Badge } from "./badge-B2YCAhUo.mjs";
import { t as Input } from "./input-4rcasKp7.mjs";
import { C as Tag, I as ShoppingCart, Zn as ArrowLeft, bt as Minus, it as Plus, jt as LoaderCircle, n as X, y as Trash2 } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-SAioInf-.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { d as getStoreCountries } from "./woocommerce-api-BoF1FQHg.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { i as useNavigate$1 } from "./router-compat-DbWBz8c6.mjs";
import { t as RequireAuth } from "./RequireAuth-C-F4CYYW.mjs";
import { a as useCheckout, c as useRemoveCartItem, f as useUpdateCartQuantity, i as useCart, l as useRemoveCoupon, o as useClearCart, r as useApplyCoupon } from "./use-cart-B3rnJV3i.mjs";
import { t as SiteFeature } from "./SiteFeature-DJLQlP_2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cart-Nu9B4Mvw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Service names come back from the store HTML-escaped (e.g. "&amp;"). */
function decodeEntities(value) {
	if (!value) return "";
	const el = document.createElement("textarea");
	el.innerHTML = value;
	return el.value;
}
function Cart() {
	const navigate = useNavigate$1();
	const { i18n } = useTranslation();
	const cn = i18n.language?.startsWith("zh");
	const { user } = useAuth();
	const { data: cart, isLoading } = useCart();
	const removeItem = useRemoveCartItem();
	const clearAll = useClearCart();
	const doCheckout = useCheckout();
	const setQty = useUpdateCartQuantity();
	const applyCoupon = useApplyCoupon();
	const dropCoupon = useRemoveCoupon();
	const [couponCode, setCouponCode] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [address1, setAddress1] = (0, import_react.useState)("");
	const [city, setCity] = (0, import_react.useState)("");
	const [state, setState] = (0, import_react.useState)("");
	const [postcode, setPostcode] = (0, import_react.useState)("");
	const [country, setCountry] = (0, import_react.useState)("US");
	(0, import_react.useEffect)(() => {
		const u = user;
		const mail = u?.email || u?.user_email || u?.user_login_email;
		if (!email && mail) setEmail(mail);
	}, [user, email]);
	const { data: countries = [] } = useQuery({
		queryKey: ["wc-countries"],
		queryFn: getStoreCountries,
		staleTime: 1440 * 60 * 1e3
	});
	const stateOptions = countries.find((c) => c.code === country)?.states ?? [];
	const stateRequired = stateOptions.length > 0;
	const items = cart?.items || [];
	const totals = cart?.totals || {};
	const minor = Number(totals.currency_minor_unit ?? 2);
	const money = (raw) => (Number(raw || 0) / Math.pow(10, minor)).toFixed(2);
	const total = totals.total_price ? money(totals.total_price) : "0.00";
	const sym = totals.currency_symbol || "$";
	const coupons = cart?.raw?.coupons || [];
	const missingFields = [
		[email, cn ? "账单邮箱" : "billing email"],
		[address1, cn ? "街道地址" : "street address"],
		[city, cn ? "城市" : "city"],
		...stateRequired ? [[state, cn ? "省 / 州" : "state / province"]] : [],
		[postcode, cn ? "邮政编码" : "ZIP / postcode"],
		[country, cn ? "国家" : "country"]
	].filter(([v]) => !String(v || "").trim()).map(([, label]) => label);
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-inspector-id": "pages/Cart/Cart/div/0",
		"data-inspector-source": "pages/Cart.tsx:80:25:70472f2f58c48187a7afa31c3c941f4e1450ac6d50faf9b01018782a0f1b84db:1",
		className: "flex justify-center py-20",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
			"data-inspector-id": "pages/Cart/Cart/Loader2/0",
			"data-inspector-source": "pages/Cart.tsx:80:68:70472f2f58c48187a7afa31c3c941f4e1450ac6d50faf9b01018782a0f1b84db:1",
			className: "h-8 w-8 animate-spin text-muted-foreground"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "pages/Cart/Cart/div/231e5f7f861b/0",
		"data-inspector-source": "pages/Cart.tsx:83:5:41a3ad4da040094834c4804d8e84f8024ba734a3596a2449ad63feeaba6fd399:1",
		className: "max-w-3xl mx-auto px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				"data-inspector-id": "pages/Cart/Cart/Button/b938925e6a9b/0",
				"data-inspector-source": "pages/Cart.tsx:84:7:8cdcc14653078326059c942409124d6a1115eabaf438487dc346099929e29016:1",
				variant: "ghost",
				size: "sm",
				className: "mb-3 gap-1.5 -ml-2",
				onClick: () => navigate(-1),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
						"data-inspector-id": "pages/Cart/Cart/ArrowLeft/0",
						"data-inspector-source": "pages/Cart.tsx:84:101:8cdcc14653078326059c942409124d6a1115eabaf438487dc346099929e29016:1",
						className: "h-4 w-4"
					}),
					" ",
					cn ? "返回" : "Back"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				"data-inspector-id": "pages/Cart/Cart/h1/ff2082aa78ae/0",
				"data-inspector-source": "pages/Cart.tsx:85:7:8c594e5613fb4fd1785088fb39853d9ec6e45abd2e21222a1a189f4bd1e7ba02:1",
				className: "text-xl sm:text-2xl font-bold tracking-tight mb-5 flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, {
						"data-inspector-id": "pages/Cart/Cart/ShoppingCart/0",
						"data-inspector-source": "pages/Cart.tsx:85:97:8c594e5613fb4fd1785088fb39853d9ec6e45abd2e21222a1a189f4bd1e7ba02:1",
						className: "h-5 w-5"
					}),
					" ",
					cn ? "我的购物车" : "Your Cart"
				]
			}),
			items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				"data-inspector-id": "pages/Cart/Cart/Card/0",
				"data-inspector-source": "pages/Cart.tsx:88:9:9df5ed3d9553ae45a773e3ae764b4589d00585c17b92b1196958a4188342c189:1",
				className: "border-transparent card-elevated",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					"data-inspector-id": "pages/Cart/Cart/CardContent/0",
					"data-inspector-source": "pages/Cart.tsx:89:11:1f0cb0e990a5b49b426257cd654c407189a79c7ea5b3e9f759061309c302c6ef:1",
					className: "p-8 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, {
							"data-inspector-id": "pages/Cart/Cart/ShoppingCart/1",
							"data-inspector-source": "pages/Cart.tsx:90:13:2e0a3f65fa3c85288a2ab435299be9f85e1f627d52066436877c572d552f25fc:1",
							className: "h-12 w-12 mx-auto text-muted-foreground mb-4"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "pages/Cart/Cart/p/ff2082aa78ae/0",
							"data-inspector-source": "pages/Cart.tsx:91:13:447fd0a20d56c64730ab755db19b49ca51d1645ff1fa263a11490f5a6d74b7f1:1",
							className: "text-lg text-muted-foreground mb-4",
							children: cn ? "购物车为空" : "Your cart is empty"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							"data-inspector-id": "pages/Cart/Cart/Button/b938925e6a9b/1",
							"data-inspector-source": "pages/Cart.tsx:92:13:48beafd33d963deeca4b6101aada4961d67e0673d8d51af93e5667c991fdeb2d:1",
							variant: "coral",
							onClick: () => navigate("/search"),
							children: cn ? "浏览护理服务" : "Browse Care Services"
						})
					]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/Cart/Cart/div/1",
				"data-inspector-source": "pages/Cart.tsx:96:9:016acb45e37f8fd66985f879762723e3792cd6b1b475d10f0bf88264dad7cf46:1",
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					"data-inspector-id": "pages/Cart/Cart/Card/1",
					"data-inspector-source": "pages/Cart.tsx:97:11:a64a620c93afbb6418aa9cd618d936e82dcd8c90cc1f74f7641d7a9db51d7453:1",
					className: "border-transparent card-elevated",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						"data-inspector-id": "pages/Cart/Cart/CardHeader/0",
						"data-inspector-source": "pages/Cart.tsx:98:13:c3bbe77fa7ec1d4a68c4990e65c20f85e69097062f72a39478bc3ac55895626c:1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/Cart/Cart/div/2",
							"data-inspector-source": "pages/Cart.tsx:99:15:a9077605babd609cd10539bc1e3dc7ae031793a024439419627ac092b11b41c3:1",
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
								"data-inspector-id": "pages/Cart/Cart/CardTitle/d586666aec29/0",
								"data-inspector-source": "pages/Cart.tsx:100:17:c01e49be1d6a6afd4bbee8869f315d606c1cd2972fe63fdb1dec3147d1c3c124:1",
								children: [
									cn ? "商品" : "Items",
									" (",
									items.length,
									")"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"data-inspector-id": "pages/Cart/Cart/Button/3a0594eb922d/0",
								"data-inspector-source": "pages/Cart.tsx:101:17:7b715884469ef773ec38ec76f4d63960637fc79882562d8b369898ed4d87069b:1",
								variant: "ghost",
								size: "sm",
								className: "text-destructive",
								onClick: () => clearAll.mutate(),
								disabled: clearAll.isPending,
								children: cn ? "全部清空" : "Clear All"
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						"data-inspector-id": "pages/Cart/Cart/CardContent/b3d321f94a00/0",
						"data-inspector-source": "pages/Cart.tsx:104:13:2a7a99b6c13f423abf168bd67f8502acc5771ae26f9b028babc4f70f40bbe188:1",
						className: "space-y-3",
						children: items.map((item) => {
							const detail = decodeEntities(String(item.description || "").replace(/<[^>]*>/g, "").trim());
							const vendor = (item.item_data || []).find((d) => d?.type === "vendor")?.value;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/Cart/Cart/div/3",
								"data-inspector-source": "pages/Cart.tsx:109:17:9cbf57a614e351d3147439b753e30f183d0f36b5ee597b075cc1a08bde857d51:1",
								className: "flex items-start justify-between border-b last:border-0 pb-3 last:pb-0 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/Cart/Cart/div/3dcaba2c350c/0",
									"data-inspector-source": "pages/Cart.tsx:110:19:c9f728a842791bc673f3eea21cc2466fdcc0c68f3bf384588614aad87566b9cb:1",
									className: "min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-id": "pages/Cart/Cart/p/c49f965238de/0",
											"data-inspector-source": "pages/Cart.tsx:111:21:abef43e784a783b0d3db8b8379e7a749e1ddb320c1dd690d6e6fe9b10219c2f4:1",
											className: "font-semibold",
											children: decodeEntities(item.name)
										}),
										detail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-id": "pages/Cart/Cart/p/9c0211c51d04/0",
											"data-inspector-source": "pages/Cart.tsx:112:32:c69de4740bd33d26d51980561d1e06b653bde303a777b01fdf7462fbfa10485b:1",
											className: "text-xs text-muted-foreground mt-0.5",
											children: detail
										}),
										vendor && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											"data-inspector-id": "pages/Cart/Cart/p/11b703ebb78b/0",
											"data-inspector-source": "pages/Cart.tsx:113:32:1b8aa91b1ae8506302ec316f25539b5a27a4b17310f242de205340e6dd558300:1",
											className: "text-xs text-muted-foreground",
											children: [
												cn ? "服务方" : "Provider",
												": ",
												decodeEntities(String(vendor))
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-id": "pages/Cart/Cart/div/4",
											"data-inspector-source": "pages/Cart.tsx:114:21:696253f0fa1c205978046de238e3756f2324aa7bb3d579ea200f643a868ef0b8:1",
											className: "flex items-center gap-2 mt-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													"data-inspector-id": "pages/Cart/Cart/Button/f52783dfd576/0",
													"data-inspector-source": "pages/Cart.tsx:115:23:e234e155ae4a949fccf3aaaeff6c2082e15713f122586a1c8a153b24c75df02d:1",
													variant: "outline",
													size: "icon",
													className: "h-7 w-7",
													"aria-label": cn ? "减少数量" : "Decrease quantity",
													disabled: setQty.isPending,
													onClick: () => setQty.mutate({
														itemKey: item.key,
														quantity: Number(item.quantity || 1) - 1
													}),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {
														"data-inspector-id": "pages/Cart/Cart/Minus/0",
														"data-inspector-source": "pages/Cart.tsx:118:25:a20cfb1e38a4a9f8c3478b152b841268953652254e40c9c243a6cddf973805a7:1",
														className: "h-3.5 w-3.5"
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													"data-inspector-id": "pages/Cart/Cart/span/3352ac44ad2f/0",
													"data-inspector-source": "pages/Cart.tsx:120:23:af5fa50b4bfae133927c94691563564903c2330c5ef472fcf3b59eb86a7e1b7a:1",
													className: "min-w-6 text-center text-sm font-medium",
													children: item.quantity
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													"data-inspector-id": "pages/Cart/Cart/Button/f52783dfd576/1",
													"data-inspector-source": "pages/Cart.tsx:121:23:2a81e8900c15d3f85ee783d9424e6fb5dd4e933e17c71ae8cd48f6835f528459:1",
													variant: "outline",
													size: "icon",
													className: "h-7 w-7",
													"aria-label": cn ? "增加数量" : "Increase quantity",
													disabled: setQty.isPending,
													onClick: () => setQty.mutate({
														itemKey: item.key,
														quantity: Number(item.quantity || 1) + 1
													}),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
														"data-inspector-id": "pages/Cart/Cart/Plus/0",
														"data-inspector-source": "pages/Cart.tsx:124:25:50c3f362f2336a0573ffef50bac651d7c646aced109a75ec00accc741eaeb4b4:1",
														className: "h-3.5 w-3.5"
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													"data-inspector-id": "pages/Cart/Cart/span/a778470772e1/0",
													"data-inspector-source": "pages/Cart.tsx:126:23:f5d0b05a9078fcabdc33fdbbbc89c902571eba397dde03f6a97b68eb2267c05e:1",
													className: "text-sm text-muted-foreground",
													children: [
														"× ",
														sym,
														Number(item.price || 0).toFixed(2)
													]
												})
											]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/Cart/Cart/div/5",
									"data-inspector-source": "pages/Cart.tsx:129:19:0e791d4d0d8c937fcea012f1fbe080582b2a083660cb89b02af12957ae86d73d:1",
									className: "flex items-center gap-2 shrink-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										"data-inspector-id": "pages/Cart/Cart/Badge/a5d15aee8528/0",
										"data-inspector-source": "pages/Cart.tsx:130:21:44a7cede4fafe981b2796413667763c0e7ab33f6b7332710d24439f3afd0b14d:1",
										variant: "secondary",
										children: [sym, (Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										"data-inspector-id": "pages/Cart/Cart/Button/ae84dc7441a4/0",
										"data-inspector-source": "pages/Cart.tsx:131:21:80875cfc09d59fa418383717f6f8e2046c9413dbe145fb9fb59abb1478f57b1e:1",
										variant: "ghost",
										size: "icon",
										"aria-label": cn ? "移除" : "Remove item",
										onClick: () => removeItem.mutate(item.key),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
											"data-inspector-id": "pages/Cart/Cart/Trash2/0",
											"data-inspector-source": "pages/Cart.tsx:131:140:80875cfc09d59fa418383717f6f8e2046c9413dbe145fb9fb59abb1478f57b1e:1",
											className: "h-4 w-4 text-destructive"
										})
									})]
								})]
							}, item.key);
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					"data-inspector-id": "pages/Cart/Cart/Card/2",
					"data-inspector-source": "pages/Cart.tsx:140:11:a64a620c93afbb6418aa9cd618d936e82dcd8c90cc1f74f7641d7a9db51d7453:1",
					className: "border-transparent card-elevated",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						"data-inspector-id": "pages/Cart/Cart/CardContent/6066aa90e257/0",
						"data-inspector-source": "pages/Cart.tsx:141:13:5f2fee4d8c78739ecf039d066371cf940b20a628987e273ce57d6062090e2e27:1",
						className: "p-5 space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/Cart/Cart/div/c80f5e6f8657/0",
								"data-inspector-source": "pages/Cart.tsx:142:15:f2363fb736e34fe278c1c6a79637c03e43712bbc8d8966ca7c71f14a06b8fc5b:1",
								className: "space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "pages/Cart/Cart/Label/ff2082aa78ae/0",
										"data-inspector-source": "pages/Cart.tsx:143:17:55c40d31ce55c3826f7d0669c54d617c9647a3947549df1394b7b02bf583c98c:1",
										htmlFor: "coupon-code",
										children: cn ? "优惠码" : "Coupon code"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/Cart/Cart/div/6",
										"data-inspector-source": "pages/Cart.tsx:144:17:d083778d1dcc27fdd6d17334070f6d219e3753eb38227a321fb3d21549e6953d:1",
										className: "flex gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											"data-inspector-id": "pages/Cart/Cart/Input/582f62563a3a/0",
											"data-inspector-source": "pages/Cart.tsx:145:19:973601b5515baf9100cda61a7928f46cd411f87064dd4060a1fbea24a177ec87:1",
											id: "coupon-code",
											value: couponCode,
											onChange: (e) => setCouponCode(e.target.value),
											placeholder: cn ? "输入优惠码" : "Enter code"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											"data-inspector-id": "pages/Cart/Cart/Button/300fb605f4b9/0",
											"data-inspector-source": "pages/Cart.tsx:146:19:3be6de6fe435fb4ef8c0dea5c133644f6ef6614d23a8a54e03d971cc920f5bce:1",
											variant: "outline",
											disabled: !couponCode.trim() || applyCoupon.isPending,
											onClick: async () => {
												await applyCoupon.mutateAsync(couponCode.trim());
												setCouponCode("");
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {
												"data-inspector-id": "pages/Cart/Cart/Tag/0",
												"data-inspector-source": "pages/Cart.tsx:148:21:2ec5e0066ec2668989bbf662ee4143db41542b66c68ebf741a48a41b84858ad9:1",
												className: "h-4 w-4 mr-1.5"
											}), cn ? "使用" : "Apply"]
										})]
									}),
									coupons.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-id": "pages/Cart/Cart/div/962c01e2529f/0",
										"data-inspector-source": "pages/Cart.tsx:152:19:baf17cacac286c421c4c35635c9a3f909020f8ca3d92a1f708b46011cbde1455:1",
										className: "flex flex-wrap gap-2 pt-1",
										children: coupons.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											"data-inspector-id": "pages/Cart/Cart/Badge/af4964bbe235/0",
											"data-inspector-source": "pages/Cart.tsx:154:23:b210658198d35647c66fbe239a3f706467ed46d45056d168f680bea647ef79a3:1",
											variant: "secondary",
											className: "gap-1",
											children: [c.code, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												"data-inspector-id": "pages/Cart/Cart/button/3bb815133632/0",
												"data-inspector-source": "pages/Cart.tsx:156:25:3f667feb9b6ef07ec5c8c5e8520768a687d9bc13e5b0fa37f61df8d51061e59b:1",
												type: "button",
												"aria-label": cn ? "移除优惠码" : "Remove coupon",
												onClick: () => dropCoupon.mutate(c.code),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
													"data-inspector-id": "pages/Cart/Cart/X/0",
													"data-inspector-source": "pages/Cart.tsx:157:27:631ef2b3cc6b3c56c175b26d56c61c70d20f5f9b259d6eadde7e0a183fc83344:1",
													className: "h-3 w-3"
												})
											})]
										}, c.code))
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/Cart/Cart/div/1da167375475/0",
								"data-inspector-source": "pages/Cart.tsx:165:15:2d0d79e2d5f62206b70b225760502c2b21e7eb6fea6333776aec87dbaede1db0:1",
								className: "space-y-1.5 text-sm",
								children: [
									totals.total_items != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/Cart/Cart/div/7",
										"data-inspector-source": "pages/Cart.tsx:167:19:5fb0a02dd2f6661ee4cef4cb364ab065dc4fefeafc3555c32a23d442654318fc:1",
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "pages/Cart/Cart/span/ff2082aa78ae/0",
											"data-inspector-source": "pages/Cart.tsx:167:57:5fb0a02dd2f6661ee4cef4cb364ab065dc4fefeafc3555c32a23d442654318fc:0",
											className: "text-muted-foreground",
											children: cn ? "小计" : "Subtotal"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											"data-inspector-id": "pages/Cart/Cart/span/9e0c2dfb6bd4/0",
											"data-inspector-source": "pages/Cart.tsx:167:128:5fb0a02dd2f6661ee4cef4cb364ab065dc4fefeafc3555c32a23d442654318fc:0",
											children: [sym, money(totals.total_items)]
										})]
									}),
									Number(totals.total_discount || 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/Cart/Cart/div/8",
										"data-inspector-source": "pages/Cart.tsx:170:19:f59a85fcc6fad28e295a097b36c261d4437ae6d6218dfbb904419b07b706a030:1",
										className: "flex justify-between text-primary",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "pages/Cart/Cart/span/ff2082aa78ae/1",
											"data-inspector-source": "pages/Cart.tsx:170:70:f59a85fcc6fad28e295a097b36c261d4437ae6d6218dfbb904419b07b706a030:0",
											children: cn ? "优惠" : "Discount"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											"data-inspector-id": "pages/Cart/Cart/span/34f8b325f919/0",
											"data-inspector-source": "pages/Cart.tsx:170:107:f59a85fcc6fad28e295a097b36c261d4437ae6d6218dfbb904419b07b706a030:0",
											children: [
												"−",
												sym,
												money(totals.total_discount)
											]
										})]
									}),
									Number(totals.total_fees || 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/Cart/Cart/div/9",
										"data-inspector-source": "pages/Cart.tsx:173:19:5e190afa3c6356ac110f10066f707a1fb9e424ef1d2352a46c82e7f08080d3db:1",
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "pages/Cart/Cart/span/ff2082aa78ae/2",
											"data-inspector-source": "pages/Cart.tsx:173:57:5e190afa3c6356ac110f10066f707a1fb9e424ef1d2352a46c82e7f08080d3db:0",
											className: "text-muted-foreground",
											children: cn ? "服务费" : "Fees"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											"data-inspector-id": "pages/Cart/Cart/span/9424dc13edee/0",
											"data-inspector-source": "pages/Cart.tsx:173:125:5e190afa3c6356ac110f10066f707a1fb9e424ef1d2352a46c82e7f08080d3db:0",
											children: [sym, money(totals.total_fees)]
										})]
									}),
									Number(totals.total_shipping || 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/Cart/Cart/div/10",
										"data-inspector-source": "pages/Cart.tsx:176:19:50587544455c7d993c4359ded57d022613afa10beffb04af0927a10341af1566:1",
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "pages/Cart/Cart/span/ff2082aa78ae/3",
											"data-inspector-source": "pages/Cart.tsx:176:57:50587544455c7d993c4359ded57d022613afa10beffb04af0927a10341af1566:0",
											className: "text-muted-foreground",
											children: cn ? "配送" : "Shipping"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											"data-inspector-id": "pages/Cart/Cart/span/4967ed802543/0",
											"data-inspector-source": "pages/Cart.tsx:176:128:50587544455c7d993c4359ded57d022613afa10beffb04af0927a10341af1566:0",
											children: [sym, money(totals.total_shipping)]
										})]
									}),
									Number(totals.total_tax || 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/Cart/Cart/div/11",
										"data-inspector-source": "pages/Cart.tsx:179:19:1efc0859d498ff9bbd15a9dfcef54f8cdc484603e5014ba587da691a88eadeda:1",
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "pages/Cart/Cart/span/ff2082aa78ae/4",
											"data-inspector-source": "pages/Cart.tsx:179:57:1efc0859d498ff9bbd15a9dfcef54f8cdc484603e5014ba587da691a88eadeda:0",
											className: "text-muted-foreground",
											children: cn ? "税费" : "Tax"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											"data-inspector-id": "pages/Cart/Cart/span/72d4d86fe518/0",
											"data-inspector-source": "pages/Cart.tsx:179:123:1efc0859d498ff9bbd15a9dfcef54f8cdc484603e5014ba587da691a88eadeda:0",
											children: [sym, money(totals.total_tax)]
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/Cart/Cart/div/12",
								"data-inspector-source": "pages/Cart.tsx:182:15:f8edfd9ba18bec75a9999fabc74dedc0935605421af441e1cbc3cad8679b8629:1",
								className: "flex justify-between text-lg font-bold border-t pt-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-id": "pages/Cart/Cart/span/ff2082aa78ae/5",
									"data-inspector-source": "pages/Cart.tsx:182:85:f8edfd9ba18bec75a9999fabc74dedc0935605421af441e1cbc3cad8679b8629:0",
									children: cn ? "合计" : "Total"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									"data-inspector-id": "pages/Cart/Cart/span/61c5a45a8fa6/0",
									"data-inspector-source": "pages/Cart.tsx:182:119:f8edfd9ba18bec75a9999fabc74dedc0935605421af441e1cbc3cad8679b8629:0",
									children: [sym, total]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/Cart/Cart/div/13",
								"data-inspector-source": "pages/Cart.tsx:184:15:59551fecf8c50336cac08e432bdfa842cf88c4b5abfae542fb86cd3942cf326f:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									"data-inspector-id": "pages/Cart/Cart/Label/ff2082aa78ae/1",
									"data-inspector-source": "pages/Cart.tsx:184:20:59551fecf8c50336cac08e432bdfa842cf88c4b5abfae542fb86cd3942cf326f:1",
									htmlFor: "billing-email",
									children: [cn ? "账单邮箱" : "Billing Email", " *"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"data-inspector-id": "pages/Cart/Cart/Input/5f58ddbafbdc/0",
									"data-inspector-source": "pages/Cart.tsx:184:92:59551fecf8c50336cac08e432bdfa842cf88c4b5abfae542fb86cd3942cf326f:1",
									id: "billing-email",
									value: email,
									onChange: (e) => setEmail(e.target.value),
									placeholder: user?.email || "email@example.com"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/Cart/Cart/div/14",
								"data-inspector-source": "pages/Cart.tsx:185:15:e0b0a3b74cf075e3c66aa3fb0ec8e706e6d8a166b6d5b17ce47c560f551307f8:1",
								className: "grid gap-3 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/Cart/Cart/div/15",
										"data-inspector-source": "pages/Cart.tsx:186:17:22297d40430755e0ca2ba39efc4862e76bfb6cdb227fad65b2d7cb2cca180954:1",
										className: "sm:col-span-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											"data-inspector-id": "pages/Cart/Cart/Label/ff2082aa78ae/2",
											"data-inspector-source": "pages/Cart.tsx:187:19:37dc0590fa28a6b67ec4160460938270a93106bf22cf728962900d7dd54edd57:1",
											htmlFor: "billing-address1",
											children: [cn ? "街道地址" : "Street address", " *"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											"data-inspector-id": "pages/Cart/Cart/Input/29f6972f02c8/0",
											"data-inspector-source": "pages/Cart.tsx:188:19:257140d1109a4f2cb5ad1da8bdf99dc2571466238a4cdb98d7aab50ae402bef4:1",
											id: "billing-address1",
											value: address1,
											onChange: (e) => setAddress1(e.target.value),
											placeholder: cn ? "例如：建国路 12 号" : "e.g. 12 Main Street"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/Cart/Cart/div/16",
										"data-inspector-source": "pages/Cart.tsx:190:17:51ca381fb22bb716b554fd428d257caa4f014e5a7ec615be5507e585b30d8f0e:1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											"data-inspector-id": "pages/Cart/Cart/Label/ff2082aa78ae/3",
											"data-inspector-source": "pages/Cart.tsx:190:22:51ca381fb22bb716b554fd428d257caa4f014e5a7ec615be5507e585b30d8f0e:1",
											htmlFor: "billing-city",
											children: [cn ? "城市" : "City", " *"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											"data-inspector-id": "pages/Cart/Cart/Input/5813b5967095/0",
											"data-inspector-source": "pages/Cart.tsx:190:82:51ca381fb22bb716b554fd428d257caa4f014e5a7ec615be5507e585b30d8f0e:1",
											id: "billing-city",
											value: city,
											onChange: (e) => setCity(e.target.value)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/Cart/Cart/div/17",
										"data-inspector-source": "pages/Cart.tsx:191:17:5c0cfeab2a8761078ab09aebcc8dfdc90f43c05ceb4c0bce1360818de13eade8:1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											"data-inspector-id": "pages/Cart/Cart/Label/ff2082aa78ae/4",
											"data-inspector-source": "pages/Cart.tsx:191:22:5c0cfeab2a8761078ab09aebcc8dfdc90f43c05ceb4c0bce1360818de13eade8:1",
											htmlFor: "billing-postcode",
											children: [cn ? "邮政编码" : "ZIP / Postcode", " *"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											"data-inspector-id": "pages/Cart/Cart/Input/e13112bb4942/0",
											"data-inspector-source": "pages/Cart.tsx:191:98:5c0cfeab2a8761078ab09aebcc8dfdc90f43c05ceb4c0bce1360818de13eade8:1",
											id: "billing-postcode",
											value: postcode,
											onChange: (e) => setPostcode(e.target.value)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/Cart/Cart/div/1cc298471339/0",
										"data-inspector-source": "pages/Cart.tsx:192:17:92be92a7fe050749218dc20048da94fc87b46eec5b7e95e0d8e8ef44bf4fe0d1:1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											"data-inspector-id": "pages/Cart/Cart/Label/ff2082aa78ae/5",
											"data-inspector-source": "pages/Cart.tsx:193:19:8322a2064e57989ae8bf1108957deb6431deae37760ed08d29ec139705437154:1",
											htmlFor: "billing-country",
											children: [cn ? "国家 / 地区" : "Country", " *"]
										}), countries.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											"data-inspector-id": "pages/Cart/Cart/Select/1777932da5d7/0",
											"data-inspector-source": "pages/Cart.tsx:195:21:798806e7dc857851a6b1b84577aa200c17bdffb4671a0cc55d6b0ee3c303c97c:1",
											value: country,
											onValueChange: (v) => {
												setCountry(v);
												setState("");
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												"data-inspector-id": "pages/Cart/Cart/SelectTrigger/0",
												"data-inspector-source": "pages/Cart.tsx:196:23:64d65fd8406c81cb7c7c092f66b80a0a923ed21c75c00ac3db93d0b694bde898:1",
												id: "billing-country",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {
													"data-inspector-id": "pages/Cart/Cart/SelectValue/0",
													"data-inspector-source": "pages/Cart.tsx:196:59:64d65fd8406c81cb7c7c092f66b80a0a923ed21c75c00ac3db93d0b694bde898:1",
													placeholder: cn ? "选择国家" : "Select country"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
												"data-inspector-id": "pages/Cart/Cart/SelectContent/7f282e7d8985/0",
												"data-inspector-source": "pages/Cart.tsx:197:23:2d97c567bacf3aba996090892fdc1d38f14599331c9ea509ff946bbddc0200b9:1",
												className: "max-h-72",
												children: countries.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													"data-inspector-id": "pages/Cart/Cart/SelectItem/9cd0d0278089/0",
													"data-inspector-source": "pages/Cart.tsx:198:45:46b43771cc182689d397b16a86f0d27557e679921145bf2423c18a6597d00296:1",
													value: c.code,
													children: c.name
												}, c.code))
											})]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											"data-inspector-id": "pages/Cart/Cart/Input/2f67eba362a4/0",
											"data-inspector-source": "pages/Cart.tsx:202:21:9e49ccdbf1593433c08b507cf17a368fc19771476e82bf4055b0a465e81de2d8:1",
											id: "billing-country",
											value: country,
											onChange: (e) => setCountry(e.target.value.toUpperCase().slice(0, 2)),
											placeholder: "US"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/Cart/Cart/div/d233faea5385/0",
										"data-inspector-source": "pages/Cart.tsx:205:17:92be92a7fe050749218dc20048da94fc87b46eec5b7e95e0d8e8ef44bf4fe0d1:1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											"data-inspector-id": "pages/Cart/Cart/Label/a95b8f5fa781/0",
											"data-inspector-source": "pages/Cart.tsx:206:19:a425857a1930d17f4dc7ba60b92b8be6f5e8bb187abfd10b5cc89cd07afb672f:1",
											htmlFor: "billing-state",
											children: [
												cn ? "省 / 州" : "State / Province",
												" ",
												stateRequired ? "*" : ""
											]
										}), stateOptions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											"data-inspector-id": "pages/Cart/Cart/Select/c0076202ee8d/0",
											"data-inspector-source": "pages/Cart.tsx:208:21:dae6db162df2b56179d3a47fda4a91ba578c04ad8a6ef46f4c17e33db02c1b48:1",
											value: state,
											onValueChange: setState,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												"data-inspector-id": "pages/Cart/Cart/SelectTrigger/1",
												"data-inspector-source": "pages/Cart.tsx:209:23:1bfc848d053d1d9c00821b12c07673b2a189ebe4d15772a4191376ea3b53f335:1",
												id: "billing-state",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {
													"data-inspector-id": "pages/Cart/Cart/SelectValue/1",
													"data-inspector-source": "pages/Cart.tsx:209:57:1bfc848d053d1d9c00821b12c07673b2a189ebe4d15772a4191376ea3b53f335:1",
													placeholder: cn ? "选择省 / 州" : "Select state / province"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
												"data-inspector-id": "pages/Cart/Cart/SelectContent/96d9859aa980/0",
												"data-inspector-source": "pages/Cart.tsx:210:23:2d97c567bacf3aba996090892fdc1d38f14599331c9ea509ff946bbddc0200b9:1",
												className: "max-h-72",
												children: stateOptions.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													"data-inspector-id": "pages/Cart/Cart/SelectItem/48327b717f16/0",
													"data-inspector-source": "pages/Cart.tsx:211:48:9a14e6749f7ac1c3c504789c968a89290d4f0fac77ac7f83b0270ce5e23fc1f7:1",
													value: s.code,
													children: s.name
												}, s.code))
											})]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											"data-inspector-id": "pages/Cart/Cart/Input/21e640b8fa24/0",
											"data-inspector-source": "pages/Cart.tsx:215:21:71340d1c8d784ada7778c4d8c26fcb6237faf100f181dc5afeac2d6f311a3644:1",
											id: "billing-state",
											value: state,
											onChange: (e) => setState(e.target.value),
											placeholder: cn ? "可选" : "Optional"
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-id": "pages/Cart/Cart/div/ff2082aa78ae/0",
								"data-inspector-source": "pages/Cart.tsx:222:15:a2ed63587a9acc9b3a3c674c75896ef6a590250815f6e97809fcd833a677b054:1",
								className: "rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground",
								children: cn ? "下一步：在本应用内完成下单，付款方式按平台已启用的渠道处理，全程无需跳转到其他网站。平台仅提供收款便利，不代为托管款项，也不介入纠纷或退款仲裁。" : "Next: your order is placed inside this app and handled by whichever payment method the platform has enabled — no redirect to any other website. The platform only provides the payment convenience; it does not hold funds in escrow and does not arbitrate disputes or refunds."
							}),
							missingFields.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/Cart/Cart/p/30f8b3514415/0",
								"data-inspector-source": "pages/Cart.tsx:230:17:ca8bd92c3d130b4246c58dea99fb290b92706d8243fe3a5061d4804c14b66d5b:1",
								className: "text-sm text-destructive",
								children: (cn ? "继续付款前请填写：" : "Fill in before continuing: ") + missingFields.join(cn ? "、" : ", ")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"data-inspector-id": "pages/Cart/Cart/Button/41ef5964a65f/0",
								"data-inspector-source": "pages/Cart.tsx:235:15:9248f61b905a3da5eb9043e9a519b816896ba8f28bbfb1fd128d7002735882ee:1",
								variant: "coral",
								className: "w-full",
								size: "lg",
								disabled: doCheckout.isPending || missingFields.length > 0,
								onClick: async () => {
									const u = user;
									const parts = (u?.full_name || "").split(" ").filter(Boolean);
									const result = await doCheckout.mutateAsync({
										first_name: parts[0] || "",
										last_name: parts.slice(1).join(" ") || parts[0] || "",
										email: email.trim(),
										phone: u?.phone_number || "",
										address_1: address1.trim(),
										city: city.trim(),
										state: state.trim(),
										postcode: postcode.trim(),
										country: country.trim() || "US"
									});
									const orderId = result?.order_id || result?.id || "";
									const orderKey = result?.order_key || "";
									const orderTotal = result?.totals?.total_price ? (parseInt(result.totals.total_price) / 100).toFixed(2) : total;
									const paymentUrl = result?.payment_url || "";
									const orderStatus = result?.status || "pending";
									try {
										const params = new URLSearchParams();
										if (orderId) params.set("order_id", String(orderId));
										if (orderKey) params.set("order_key", orderKey);
										if (orderTotal) params.set("total", orderTotal);
										params.set("status", orderStatus);
										sessionStorage.setItem("cc:last_order", params.toString());
									} catch {}
									if (paymentUrl) {
										window.location.href = paymentUrl;
										return;
									}
									const params = new URLSearchParams();
									if (orderId) params.set("order_id", String(orderId));
									if (orderKey) params.set("order_key", orderKey);
									if (orderTotal) params.set("total", orderTotal);
									params.set("status", orderStatus);
									navigate(`/order-confirmation?${params.toString()}`);
								},
								children: doCheckout.isPending ? cn ? "处理中…" : "Processing..." : cn ? "前往安全支付" : "Continue to Secure Payment"
							})
						]
					})
				})]
			})
		]
	});
}
function RouteCartPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFeature, {
		"data-inspector-id": "routes/cart/RouteCartPage/SiteFeature/0",
		"data-inspector-source": "routes/cart.tsx:5:10:7fbe1c22e853b7f3c24d73c7871b8606358d6ca08be9f1a4de6fd9959ba76310:1",
		name: "paidCaregivers",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, {
			"data-inspector-id": "routes/cart/RouteCartPage/RequireAuth/0",
			"data-inspector-source": "routes/cart.tsx:5:45:7fbe1c22e853b7f3c24d73c7871b8606358d6ca08be9f1a4de6fd9959ba76310:1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cart, {
				"data-inspector-id": "routes/cart/RouteCartPage/Cart/0",
				"data-inspector-source": "routes/cart.tsx:5:58:7fbe1c22e853b7f3c24d73c7871b8606358d6ca08be9f1a4de6fd9959ba76310:1"
			})
		})
	});
}
//#endregion
export { RouteCartPage as component };
