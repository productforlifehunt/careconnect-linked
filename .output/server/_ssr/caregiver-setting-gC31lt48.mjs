import { s as __toESM } from "../_runtime.mjs";
import { t as cleanBookingNote } from "./utils-CcHv9xqZ.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { t as Badge } from "./badge-B2YCAhUo.mjs";
import { t as Input } from "./input-JWLlmFeK.mjs";
import { t as Textarea } from "./textarea-ZNemOC_7.mjs";
import { t as formatDate } from "./locale-DKwjQju2.mjs";
import { Bn as Briefcase, Dt as MapPin, En as CircleCheck, H as Settings, Ht as Info, L as Shield, Ln as CalendarDays, Pn as Check, St as MessageSquare, an as EyeOff, ct as Phone, dn as DollarSign, i as Wallet, in as Eye, it as Plus, jt as LoaderCircle, l as User, n as X, v as TrendingUp, vn as Clock, y as Trash2 } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, s as DialogTrigger, t as Dialog } from "./dialog-DHxbK-sS.mjs";
import { t as Checkbox } from "./checkbox-4tVtKjWh.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as SERVICE_DELIVERY_MODES, t as CARE_SERVICE_TYPES } from "./source.wordpress-CI9kg3_M.mjs";
import { _ as saveMyPayout, h as requestWithdrawal, i as cancelWithdrawal, l as getMyPayout } from "./woocommerce-api-BoF1FQHg.mjs";
import { Sn as useProviderBookings, Xn as useUpdateBookingStatus, mn as useMyProfile, mr as useUpdateProfile, vr as useUpsertProviderAvailability, xn as useProviderAvailability } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-HRlnwchH.mjs";
import { t as Switch } from "./switch-Coli7fra.mjs";
import { t as RequireAuth } from "./RequireAuth-DeCqG_0H.mjs";
import { t as SiteFeature } from "./SiteFeature-Dc7M6czo.mjs";
import { t as Separator } from "./separator-BD-dtN1z.mjs";
import { t as BookingThreadDialog } from "./BookingThreadDialog-DNQUtLwr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/caregiver-setting-gC31lt48.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Payout account for caregivers.
*
* Clients pay online at checkout, so every confirmed booking is recorded
* against the caregiver's payout account. This card shows the balance, lets the
* caregiver save where the money should be sent (PayPal or bank), and submits a
* payout request once a completed booking has matured.
*/
function PayoutAccountsCard({ section = "all" } = {}) {
	const showAccount = section === "all" || section === "account";
	const showHistory = section === "all" || section === "history";
	const { i18n } = useTranslation();
	const isZh = i18n.language?.startsWith("zh");
	const { toast } = useToast();
	const qc = useQueryClient();
	const currency = isZh ? "¥" : "$";
	const { data, isLoading } = useQuery({
		queryKey: ["my-payout"],
		queryFn: getMyPayout
	});
	const [paypalEmail, setPaypalEmail] = (0, import_react.useState)("");
	const [accountName, setAccountName] = (0, import_react.useState)("");
	const [accountNumber, setAccountNumber] = (0, import_react.useState)("");
	const [bankName, setBankName] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!data) return;
		setPaypalEmail(data.payment?.paypal?.email || "");
		setAccountName(data.payment?.bank?.["ac_name"] || "");
		setAccountNumber(data.payment?.bank?.["ac_number"] || "");
		setBankName(data.payment?.bank?.["bank_name"] || "");
	}, [data]);
	const balance = Number(data?.balance?.current_balance ?? 0);
	const minimum = Number(data?.balance?.withdraw_limit ?? 0) || 0;
	const hasPayoutDetails = !!(paypalEmail.trim() || accountName.trim() && accountNumber.trim());
	const pendingPayout = (data?.withdrawals ?? []).find((w) => String(w.status).toLowerCase() === "pending");
	const saveMutation = useMutation({
		mutationFn: async () => {
			const payment = {};
			if (paypalEmail.trim()) payment.paypal = { email: paypalEmail.trim() };
			if (accountName.trim() || accountNumber.trim() || bankName.trim()) payment.bank = {
				ac_name: accountName.trim(),
				ac_number: accountNumber.trim(),
				bank_name: bankName.trim()
			};
			if (!Object.keys(payment).length) throw new Error(isZh ? "请填写至少一种收款方式" : "Add at least one payout method");
			return saveMyPayout(payment);
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["my-payout"] });
			toast({ title: isZh ? "收款信息已保存" : "Payout details saved" });
		},
		onError: (err) => toast({
			title: isZh ? "保存失败" : "Save failed",
			description: err.message,
			variant: "destructive"
		})
	});
	const withdrawMutation = useMutation({
		mutationFn: async () => {
			const value = Number(amount);
			if (!(value > 0)) throw new Error(isZh ? "请输入提现金额" : "Enter an amount");
			if (value > balance) throw new Error(isZh ? "超出可提现余额" : "Amount exceeds your balance");
			if (minimum > 0 && value < minimum) throw new Error(isZh ? `最低提现金额为 ${currency}${minimum.toFixed(2)}，请等余额积累后再申请。` : `The minimum payout is ${currency}${minimum.toFixed(2)} — let your balance build up before requesting.`);
			return requestWithdrawal(value, paypalEmail.trim() ? "paypal" : "bank");
		},
		onSuccess: () => {
			setAmount("");
			qc.invalidateQueries({ queryKey: ["my-payout"] });
			toast({ title: isZh ? "提现申请已提交" : "Payout request submitted" });
		},
		onError: (err) => toast({
			title: isZh ? "提交失败" : "Request failed",
			description: err.message,
			variant: "destructive"
		})
	});
	const cancelMutation = useMutation({
		mutationFn: async () => {
			if (!pendingPayout) throw new Error(isZh ? "没有待处理的提现申请" : "No pending payout request");
			return cancelWithdrawal(Number(pendingPayout.id));
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["my-payout"] });
			toast({ title: isZh ? "提现申请已撤销" : "Payout request cancelled" });
		},
		onError: (err) => toast({
			title: isZh ? "撤销失败" : "Cancel failed",
			description: err.message,
			variant: "destructive"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "border-transparent card-elevated",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
			"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/CardTitle/0",
			"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:138:9:1cf9bf94135dd9825f87c3c2373b63764a5d47beb71ec84eba586b0ccfcd5028:1",
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-5 w-5" }),
				" ",
				section === "history" ? isZh ? "收款记录" : "Payment history" : isZh ? "收款账户与提现" : "Payment account",
				showAccount && hasPayoutDetails && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/Badge/0",
					"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:144:13:2eb417a95ad8567de61f7669b4a160091cbdf4717b02d7287ae5fe5605d25285:1",
					variant: "default",
					className: "ml-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3 mr-1" }), isZh ? "已配置" : "Configured"]
				})
			]
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/CardContent/0",
			"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:151:7:360ea4ea76925f7a2f5cb7b3184691b710d7ef3450472a82df2c532967f67e91:1",
			className: "space-y-5",
			children: [
				showAccount && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid sm:grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-muted/40 border border-border/50 p-4 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/p/0",
							"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:155:13:d0859382fd9f810edbd000403f857c98b84b26ca118f6cbeb66f0ff69e227a18:1",
							className: "text-2xl font-bold text-foreground",
							children: [currency, balance.toFixed(2)]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/p/1",
							"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:158:13:947df5fd1387142186b23c2d3fa5f05afa28a858c7ddcec5e8f9af1af913bbbb:1",
							className: "text-xs text-muted-foreground mt-1",
							children: isZh ? "可提现余额" : "Available balance"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-muted/40 border border-border/50 p-4 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/p/2",
							"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:163:13:d0859382fd9f810edbd000403f857c98b84b26ca118f6cbeb66f0ff69e227a18:1",
							className: "text-2xl font-bold text-foreground",
							children: [currency, minimum.toFixed(2)]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/p/3",
							"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:166:13:947df5fd1387142186b23c2d3fa5f05afa28a858c7ddcec5e8f9af1af913bbbb:1",
							className: "text-xs text-muted-foreground mt-1",
							children: isZh ? "最低提现金额" : "Minimum payout"
						})]
					})]
				}),
				showAccount && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 p-3 rounded-lg bg-muted/40 border border-border/50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-4 w-4 text-muted-foreground shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/p/4",
							"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:176:11:b4d5393b3c01515501267a57802d39d039e25750b3c72b248003635d0cbf80ac:1",
							className: "text-sm text-muted-foreground leading-relaxed",
							children: isZh ? "客户在下单时完成在线支付。您将服务标记为已完成后，该笔金额进入可提现余额，可随时提交提现申请。" : "Clients pay online when they book. After you mark a service complete, that amount moves into your available balance and you can request a payout."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/Label/0",
							"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:184:11:aeb40de461097cbb60bc39f5bbebabb3d4ae05ec6a6cc38f2a8a6085124c15cb:1",
							htmlFor: "paypal-email",
							className: "font-semibold",
							children: isZh ? "PayPal 收款邮箱" : "PayPal email"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/Input/5e7ac5a8ffec",
							"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:187:11:d4f7c24aad5a31d525ea65ead1bfb88da0c9e19532555693807d05f3682b7a5f:1",
							id: "paypal-email",
							type: "email",
							value: paypalEmail,
							onChange: (e) => setPaypalEmail(e.target.value),
							placeholder: "you@example.com",
							disabled: isLoading
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid sm:grid-cols-3 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/Label/1",
									"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:199:13:52e40fa3c904325744b387b0c21331b8fa226ab307ef520d341c8cd03077e203:1",
									htmlFor: "bank-ac-name",
									children: isZh ? "账户名" : "Account name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/Input/5dd55235b181",
									"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:200:13:acbe539e4317d2af852443bde4bca0eb1e9a7feb1ba2b677d835e51327fa7150:1",
									id: "bank-ac-name",
									value: accountName,
									onChange: (e) => setAccountName(e.target.value),
									disabled: isLoading
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/Label/2",
									"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:203:13:e3edd96ad76bf6c9148d28e5e6bb3086d3689142b201c722d3e679136b26442f:1",
									htmlFor: "bank-ac-number",
									children: isZh ? "账号" : "Account number"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/Input/54a03c090425",
									"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:204:13:d0c59ca034721fdb5e3709e40c344db9646084f174bc387039791249e2fa5508:1",
									id: "bank-ac-number",
									value: accountNumber,
									onChange: (e) => setAccountNumber(e.target.value),
									disabled: isLoading
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/Label/3",
									"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:207:13:e1f94bd5b18072f0d8b56e6e0c7c2dc3df7754b63f69d2be68b5d152dc86ccf0:1",
									htmlFor: "bank-name",
									children: isZh ? "银行名称" : "Bank name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/Input/1896e865ed05",
									"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:208:13:4c2c2b68dda6dc02962f55e5c4ecb2e6e7e232492180baa60aedd9c3d81c8b72:1",
									id: "bank-name",
									value: bankName,
									onChange: (e) => setBankName(e.target.value),
									disabled: isLoading
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/Button/bdadf1bc74ba",
						"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:212:9:2cbf2afe1b54a91992d854285721d994fd9ad62c98cef20b40ccfc2ba0f045a3:1",
						onClick: () => saveMutation.mutate(),
						disabled: saveMutation.isPending,
						className: "w-full",
						children: saveMutation.isPending ? isZh ? "保存中..." : "Saving..." : isZh ? "保存收款信息" : "Save payout details"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/div/0",
						"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:224:9:a9929ebdeed0219092c2fcd37f2f2e7dc244c8e4e2f4be9fa5f3c342ed4ae6f9:1",
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/Label/4",
								"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:225:11:8da6c5ad9123fc4621112defe7d7f1e0fbfc6689ab9f10bcdc3439123c4a5737:1",
								htmlFor: "withdraw-amount",
								className: "font-semibold",
								children: isZh ? "提现金额" : "Payout amount"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/Input/2037c30e650e",
									"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:229:13:f8dc2d8b298e828184f92f8f9e5eae0e54d3df44a3c49a90dfb735edcc2d1bc1:1",
									id: "withdraw-amount",
									type: "number",
									min: "0",
									step: "0.01",
									value: amount,
									onChange: (e) => setAmount(e.target.value),
									placeholder: balance > 0 ? balance.toFixed(2) : "0.00"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/Button/7e04e8fcfc52",
									"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:238:13:60054442b94c42177db5b21fb03d894a904d65d6c0a0f642d1b4d56fb66f23b7:1",
									variant: "secondary",
									onClick: () => withdrawMutation.mutate(),
									disabled: withdrawMutation.isPending || !hasPayoutDetails || balance <= 0 || !!pendingPayout,
									children: withdrawMutation.isPending ? isZh ? "提交中..." : "Submitting..." : isZh ? "申请提现" : "Request payout"
								})]
							}),
							!hasPayoutDetails && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/p/5",
								"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:249:13:7092a605bb0ee468f54cfd5cd2af559f4d0717ca74addc443319cf46d0cfdc7a:1",
								className: "text-xs text-muted-foreground",
								children: isZh ? "请先保存收款信息，然后即可申请提现。" : "Save your payout details first, then you can request a payout."
							}),
							!!pendingPayout && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/p/6",
									"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:255:15:cbfae5e3953ff4ddefb94e1e3ae3a8e922537f3e3c99c4944a42d7f59324a7ab:1",
									className: "text-xs text-muted-foreground flex-1 min-w-[200px]",
									children: isZh ? `您有一笔 ${currency}${Number(pendingPayout.amount).toFixed(2)} 的提现申请正在处理中。可撤销后重新申请。` : `A ${currency}${Number(pendingPayout.amount).toFixed(2)} payout request is still being processed. Cancel it if you'd rather request a different amount.`
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/Button/62eea038e8d6",
									"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:260:15:07f77ad16dcf60707111099b7ffe94ca8bfc5a0b826f92ea7219e3e2cfb16e6f:1",
									variant: "outline",
									size: "sm",
									onClick: () => cancelMutation.mutate(),
									disabled: cancelMutation.isPending,
									children: cancelMutation.isPending ? isZh ? "撤销中..." : "Cancelling..." : isZh ? "撤销申请" : "Cancel request"
								})]
							})
						]
					})
				] }),
				showHistory && !data?.withdrawals?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/p/7",
					"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:277:11:e08bc0e72a9b8ebab0b80a261611e7176c27317cfdfb45aaa019e378b1611cc3:1",
					className: "text-sm text-muted-foreground text-center py-4",
					children: isZh ? "还没有收款记录。" : "No payments yet."
				}),
				showHistory && !!data?.withdrawals?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/p/8",
						"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:284:13:2f00a63d48427bbcf6f257b5e48d986015b93829f96fb3ea8798ef66c106a220:1",
						className: "text-sm font-semibold text-foreground",
						children: isZh ? "提现记录" : "Payout history"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/div/1",
						"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:287:13:0bd137aee249026a5dcadda5560dc6aa5052211c8c1d3dfb27198b058ac36b71:1",
						className: "space-y-1.5",
						children: data.withdrawals.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/div/2",
							"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:289:17:57cfb453d80c5b3876557731ebb710f22afd7b872bc588cf691169cc29669c92:1",
							className: "flex items-center justify-between text-sm rounded-md border border-border/50 px-3 py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/span/0",
									"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:290:19:4806fdcb928588c94be8868b91cf7f4b1a6aa784d1ca678118eb1e8d4b539abd:1",
									className: "text-muted-foreground",
									children: String(w.created || "").slice(0, 10)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/span/1",
									"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:291:19:d37021ac6a036cbad2be59c1ebadc2a69856230579377f65e001ec716257c123:1",
									className: "font-medium text-foreground",
									children: [currency, Number(w.amount).toFixed(2)]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									"data-inspector-id": "components/provider/PayoutAccountsCard/PayoutAccountsCard/Badge/1",
									"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:292:19:8679cd1718e6d46c702d596587c15fcff0ff42a3337dba595db2a3267e53ec60:1",
									variant: w.status === "approved" ? "default" : "secondary",
									children: w.status
								})
							]
						}, w.id))
					})]
				})
			]
		})]
	});
}
/**
* Profile tab — Basic Info, Active toggle, Payout accounts.
*
* Writes to CCT 258 only. Nothing here touches WooCommerce/Dokan: a Woo
* product is created just-in-time when a buyer adds a service to the cart,
* per the data dictionary. Rates per service live in "My Booking Services".
*/
function ProviderSettingsTab() {
	const { t, i18n } = useTranslation();
	const { toast } = useToast();
	const { data: profile } = useMyProfile();
	const updateProfile = useUpdateProfile();
	const [location, setLocation] = (0, import_react.useState)("");
	const [hourlyRate, setHourlyRate] = (0, import_react.useState)("");
	const [bio, setBio] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [isActive, setIsActive] = (0, import_react.useState)(false);
	const [loaded, setLoaded] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (profile && !loaded) {
			setLocation(profile.location || "");
			setHourlyRate(profile.care_provider_starts_hourly_rate?.toString() || "");
			setBio(profile.bio || "");
			setPhone(profile.phone || "");
			setIsActive(profile.provider_is_active || false);
			setLoaded(true);
		}
	}, [profile, loaded]);
	const handleSave = async () => {
		try {
			await updateProfile.mutateAsync({
				location,
				care_provider_starts_hourly_rate: parseFloat(hourlyRate) || 0,
				bio,
				phone,
				provider_is_active: isActive,
				...isActive ? { is_care_provider: true } : {}
			});
			toast({ title: t("profile.profileUpdated") });
		} catch (e) {
			toast({
				title: t("profile.updateFailed"),
				description: e.message,
				variant: "destructive"
			});
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-transparent card-elevated",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "components/provider/ProviderSettingsTab/ProviderSettingsTab/div/0",
							"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:74:13:9a2aac01354b38c80e2cf75c3916cb920054d16b840ad082b1a51496892dad6e:1",
							className: "flex items-center gap-3",
							children: [isActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-5 w-5 text-success" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-5 w-5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "components/provider/ProviderSettingsTab/ProviderSettingsTab/p/0",
								"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:77:17:270074e06515ae41cc418f8bdc595c5f69b0c55f071e87c850292d6b1f439e58:1",
								className: "font-semibold text-foreground",
								children: t("providerDash.marketplaceVisibility")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "components/provider/ProviderSettingsTab/ProviderSettingsTab/p/1",
								"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:78:17:108d1bf0a361eb111fb560a675d4f372e3c8439e22f69ad671599758cc2a8243:1",
								className: "text-sm text-muted-foreground",
								children: isActive ? t("providerDash.visibleBookable") : t("providerDash.hiddenFromSearch")
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							"data-inspector-id": "components/provider/ProviderSettingsTab/ProviderSettingsTab/Switch/d565999bcdd3",
							"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:83:13:d88304283cf599864b8833decc75af81c3f039e241aba4d42db2f7f35ecb1428:1",
							checked: isActive,
							onCheckedChange: setIsActive
						})]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayoutAccountsCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-transparent card-elevated",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					"data-inspector-id": "components/provider/ProviderSettingsTab/ProviderSettingsTab/CardTitle/0",
					"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:95:21:23db4915c6c07fa0db9f012d269aafb84a17f6699e4c03d48efae47e2145ba62:1",
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefcase, { className: "h-5 w-5" }),
						" ",
						t("providerDash.basicInfo")
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid sm:grid-cols-2 gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								"data-inspector-id": "components/provider/ProviderSettingsTab/ProviderSettingsTab/Label/0",
								"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:99:15:04acb4fb954f9d0c3acb70db9c58407b692606d7b6781e7ec943093b66217d71:1",
								className: "flex items-center gap-1.5 mb-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5" }),
									" ",
									t("common.location")
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								"data-inspector-id": "components/provider/ProviderSettingsTab/ProviderSettingsTab/Input/ff39066f72c4",
								"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:100:15:ba528cb1ed46e8436e390cd7b9d3635556683d622b240c7ff9c8f2608117218f:1",
								value: location,
								onChange: (e) => setLocation(e.target.value),
								placeholder: t("providerDash.locationPlaceholder")
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								"data-inspector-id": "components/provider/ProviderSettingsTab/ProviderSettingsTab/Label/1",
								"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:103:15:c8360e56c2c4b6352c354a48479f153c91664b5f0c7a0eaadeebf8fbc85d58ce:1",
								className: "flex items-center gap-1.5 mb-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-3.5 w-3.5" }),
									" ",
									t("becomeCaregiver.hourlyRateDollar"),
									" (",
									t("providerDash.defaultRate"),
									")"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								"data-inspector-id": "components/provider/ProviderSettingsTab/ProviderSettingsTab/Input/82af58bb0cc1",
								"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:104:15:dad3d3023729b12ce324ee1f49e6d40302e00107a0f39cc12001f648dbb58717:1",
								type: "number",
								min: "0",
								step: "5",
								value: hourlyRate,
								onChange: (e) => setHourlyRate(e.target.value),
								placeholder: t("providerDash.ratePlaceholder")
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid sm:grid-cols-2 gap-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									"data-inspector-id": "components/provider/ProviderSettingsTab/ProviderSettingsTab/Label/2",
									"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:109:15:93a88d4f18c8cc94b3ad88a0510fef6574df848d673c155d2db9f94cbac34d9f:1",
									className: "flex items-center gap-1.5 mb-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-3.5 w-3.5" }),
										" ",
										t("providerDash.phoneNumber")
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"data-inspector-id": "components/provider/ProviderSettingsTab/ProviderSettingsTab/Input/0e0dacb751e6",
									"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:110:15:2917d7ff267c7e00bdf4c1d86c9969c7087739efdd05ee7055777bc9faee1d51:1",
									value: phone,
									onChange: (e) => setPhone(e.target.value),
									placeholder: t("providerDash.phonePlaceholder")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-id": "components/provider/ProviderSettingsTab/ProviderSettingsTab/p/2",
									"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:111:15:aa4e7bf88861ff694fbb7c9a0a6032f6efcb7d0dba46425a83cf01109af7f87c:1",
									className: "text-xs text-muted-foreground mt-1",
									children: i18n.language?.startsWith("zh") ? "仅用于收款账户，不会公开显示。" : "Used for your payout account only — never shown publicly."
								})
							] })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							"data-inspector-id": "components/provider/ProviderSettingsTab/ProviderSettingsTab/Label/3",
							"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:115:13:de3a35039aa948f84cc74f2e359d2984a09bb3d8c17853244cb08b3f0fe166d2:1",
							className: "mb-1.5",
							children: t("providerDash.bioAboutMe")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							"data-inspector-id": "components/provider/ProviderSettingsTab/ProviderSettingsTab/Textarea/63015564413b",
							"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:116:13:88bd2ddcffcce87c3f8a4444a63d30257ae6e4ec5cda93e81973a95373368046:1",
							value: bio,
							onChange: (e) => setBio(e.target.value),
							placeholder: t("providerDash.bioPlaceholder"),
							rows: 4
						})] })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				"data-inspector-id": "components/provider/ProviderSettingsTab/ProviderSettingsTab/Button/aa5038f1eee5",
				"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:125:7:647d41609c8dfe04374d35bc6d4e9599509ddf62956a52fa12a782ad99482c03:1",
				variant: "coral",
				className: "w-full",
				onClick: handleSave,
				disabled: updateProfile.isPending,
				children: updateProfile.isPending ? t("common.saving") : t("providerDash.saveProfileSettings")
			})
		]
	});
}
/**
* Provider Dashboard → "My Care Services" tab.
*
* Everything on this screen is stored in the JetEngine CCT 258 record only:
*   a65 delivery modes · a68 care service types ·
*   a66 in-person $/hr · a67 remote $/hr · a69 remote check-in · a70 remote
*   medication reminder · a63 cancellation policy.
*
* No WooCommerce/Dokan call happens here. A Woo product is created just in
* time when a client adds one of these services to their cart.
*/
function MyBookingServicesTab() {
	const { i18n } = useTranslation();
	const isZh = i18n.language?.startsWith("zh");
	const { toast } = useToast();
	const { data: profile, isLoading } = useMyProfile();
	const updateProfile = useUpdateProfile();
	const [delivery, setDelivery] = (0, import_react.useState)([]);
	const [services, setServices] = (0, import_react.useState)([]);
	const [rateInPerson, setRateInPerson] = (0, import_react.useState)("");
	const [rateRemote, setRateRemote] = (0, import_react.useState)("");
	const [rateCheckin, setRateCheckin] = (0, import_react.useState)("");
	const [rateMedicine, setRateMedicine] = (0, import_react.useState)("");
	const [cancellation, setCancellation] = (0, import_react.useState)("");
	const [loaded, setLoaded] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!profile || loaded) return;
		setDelivery(profile.service_location_slugs || []);
		setServices(profile.service_type_slugs || []);
		setRateInPerson(profile.care_provider_hourly_rate_in_person?.toString() || "");
		setRateRemote(profile.care_provider_hourly_rate_remote?.toString() || "");
		setRateCheckin(profile.care_provider_rate_remote_checkin?.toString() || "");
		setRateMedicine(profile.care_provider_rate_remote_medicine?.toString() || "");
		setCancellation(profile.care_provider_cancellation_policy || "");
		setLoaded(true);
	}, [profile, loaded]);
	const toggle = (list, value, set) => set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
	const num = (v) => v.trim() === "" ? null : parseFloat(v);
	const handleSave = async () => {
		try {
			await updateProfile.mutateAsync({
				service_location_slugs: delivery,
				service_type_slugs: services,
				care_provider_hourly_rate_in_person: num(rateInPerson),
				care_provider_hourly_rate_remote: num(rateRemote),
				care_provider_rate_remote_checkin: num(rateCheckin),
				care_provider_rate_remote_medicine: num(rateMedicine),
				care_provider_cancellation_policy: cancellation
			});
			toast({
				title: isZh ? "服务与价格已保存" : "Services and rates saved",
				description: isZh ? "客户现在可以在搜索中看到这些服务和价格。" : "Clients can now see these services and rates in search."
			});
		} catch (e) {
			toast({
				title: isZh ? "保存失败" : "Save failed",
				description: e.message,
				variant: "destructive"
			});
		}
	};
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-center justify-center py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" })
	});
	const rateFields = [
		{
			label: isZh ? "上门服务（每小时）" : "In-person care (per hour)",
			value: rateInPerson,
			set: setRateInPerson,
			suffix: isZh ? "/小时" : "/hr"
		},
		{
			label: isZh ? "远程服务（每小时）" : "Remote care (per hour)",
			value: rateRemote,
			set: setRateRemote,
			suffix: isZh ? "/小时" : "/hr"
		},
		{
			label: isZh ? "远程签到（每次）" : "Remote check-in (each)",
			value: rateCheckin,
			set: setRateCheckin,
			suffix: isZh ? "/次" : "/each"
		},
		{
			label: isZh ? "远程用药提醒（每次）" : "Remote medication reminder (each)",
			value: rateMedicine,
			set: setRateMedicine,
			suffix: isZh ? "/次" : "/each"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-transparent card-elevated",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					"data-inspector-id": "components/provider/MyBookingServicesTab/MyBookingServicesTab/CardTitle/0",
					"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:116:11:7ec4ad714b7fe240c43b2c48e0209225641df858423da606878d0541a3f9e8fa:1",
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-5 w-5" }),
						" ",
						isZh ? "我提供的服务" : "Services I offer"
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						"data-inspector-id": "components/provider/MyBookingServicesTab/MyBookingServicesTab/Label/0",
						"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:122:13:22c47a30c93db5de304569c27b17852a8887ceb892c2b195bf31cd7f965cb0d5:1",
						className: "text-sm font-semibold mb-2 block",
						children: isZh ? "服务方式" : "How you deliver care"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-id": "components/provider/MyBookingServicesTab/MyBookingServicesTab/div/0",
						"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:125:13:6df5046976a2c17a90114856f9935b91cdac159698bf66fbe64ab7f2fc7d6285:1",
						className: "flex flex-wrap gap-4",
						children: SERVICE_DELIVERY_MODES.map((mode) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							"data-inspector-id": "components/provider/MyBookingServicesTab/MyBookingServicesTab/label/0",
							"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:127:17:f69cfff7517788edc34467c36e017a1d9210b4b28709b7fef021a146d44e7672:1",
							className: "flex items-center gap-2 cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
								"data-inspector-id": "components/provider/MyBookingServicesTab/MyBookingServicesTab/Checkbox/7b76ea4d072e",
								"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:128:19:28f78074b8639cd2d6687787e1e0642c49a6ec132d4184e90fba23d5d29575d1:1",
								checked: delivery.includes(mode.slug),
								onCheckedChange: () => toggle(delivery, mode.slug, setDelivery)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-id": "components/provider/MyBookingServicesTab/MyBookingServicesTab/span/0",
								"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:132:19:663297272de99287824f7bffcaf16da098108dbd85a94030afec3e0ae82acc80:1",
								className: "text-sm",
								children: isZh ? mode.zh : mode.en
							})]
						}, mode.slug))
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						"data-inspector-id": "components/provider/MyBookingServicesTab/MyBookingServicesTab/Label/1",
						"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:139:13:22c47a30c93db5de304569c27b17852a8887ceb892c2b195bf31cd7f965cb0d5:1",
						className: "text-sm font-semibold mb-2 block",
						children: isZh ? "服务类型" : "Care service types"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-id": "components/provider/MyBookingServicesTab/MyBookingServicesTab/div/1",
						"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:142:13:bddc1cc40d3e61d0327922fdf6b3e45b1cbbd67b4eb7d50eaeba75950f3d1b8e:1",
						className: "grid sm:grid-cols-2 gap-2",
						children: CARE_SERVICE_TYPES.map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							"data-inspector-id": "components/provider/MyBookingServicesTab/MyBookingServicesTab/label/1",
							"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:144:17:0f6ba130bd6fd217ca1f8336cf38f76500f294123ff3ae9cafe8aa915482ad9e:1",
							className: "flex items-center gap-2 cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
								"data-inspector-id": "components/provider/MyBookingServicesTab/MyBookingServicesTab/Checkbox/9d1cd45c2429",
								"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:145:19:28f78074b8639cd2d6687787e1e0642c49a6ec132d4184e90fba23d5d29575d1:1",
								checked: services.includes(st.slug),
								onCheckedChange: () => toggle(services, st.slug, setServices)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-id": "components/provider/MyBookingServicesTab/MyBookingServicesTab/span/1",
								"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:149:19:b03cab54e66e5ce78fccf03f34e2af205d7d9133e1f380d0bfee2e832449718d:1",
								className: "text-sm",
								children: isZh ? st.zh : st.en
							})]
						}, st.slug))
					})] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-transparent card-elevated",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					"data-inspector-id": "components/provider/MyBookingServicesTab/MyBookingServicesTab/CardTitle/1",
					"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:159:11:7ec4ad714b7fe240c43b2c48e0209225641df858423da606878d0541a3f9e8fa:1",
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-5 w-5" }),
						" ",
						isZh ? "我的价格" : "My rates"
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "components/provider/MyBookingServicesTab/MyBookingServicesTab/p/0",
							"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:164:11:b139adbc8a0250633a9cff3737cffcc019d49ec169ff3d4855c5617614d3e17a:1",
							className: "text-sm text-muted-foreground",
							children: isZh ? "只填写您真正提供的服务价格，留空的项目不会显示给客户。客户也可以在聊天中与您商定其他价格。" : "Fill in only the rates you actually offer — anything left blank stays hidden from clients. Clients can also agree a different price with you in chat."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-id": "components/provider/MyBookingServicesTab/MyBookingServicesTab/div/2",
							"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:169:11:c5065b328556111bf4fb157ce8ccdfb20f2662af0d205836c97600aaa35772c8:1",
							className: "grid sm:grid-cols-2 gap-4",
							children: rateFields.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "components/provider/MyBookingServicesTab/MyBookingServicesTab/div/3",
								"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:171:15:3810e3efe5264177d995f737fd1eb0357d3032e37bb6b3dd82cdbce66f14e47e:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									"data-inspector-id": "components/provider/MyBookingServicesTab/MyBookingServicesTab/Label/2",
									"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:172:17:edea7b00b53907c7fd47e6ce49889fc73871f84397abbe33f295271a96124fbb:1",
									className: "mb-1.5 block text-sm",
									children: f.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "components/provider/MyBookingServicesTab/MyBookingServicesTab/span/2",
											"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:174:19:242fb8a3e6516959487489f66c2a6006ff6d4e6d580f5df896fa06f065c385e6:1",
											className: "text-muted-foreground text-sm",
											children: isZh ? "¥" : "$"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											"data-inspector-id": "components/provider/MyBookingServicesTab/MyBookingServicesTab/Input/a962a07fa50a",
											"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:175:19:2027ce8482541b8b59ec7b0cf4045905f9733b5513979d8912ab9990a38a94e9:1",
											type: "number",
											min: "0",
											step: "5",
											className: "h-9 text-right",
											value: f.value,
											onChange: (e) => f.set(e.target.value),
											placeholder: "50"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "components/provider/MyBookingServicesTab/MyBookingServicesTab/span/3",
											"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:182:19:b0039730da2a11ffb120029b7cd30f31029468cf4c21b7984a9892c053b3c3cb:1",
											className: "text-xs text-muted-foreground whitespace-nowrap",
											children: f.suffix
										})
									]
								})]
							}, f.label))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							"data-inspector-id": "components/provider/MyBookingServicesTab/MyBookingServicesTab/Label/3",
							"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:188:13:b7e3a9bcd84e87b13722768dd4f08072de309f2a0b228ee7fc4790adedd6b0fe:1",
							className: "mb-1.5 block text-sm",
							children: isZh ? "取消政策" : "Cancellation policy"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							"data-inspector-id": "components/provider/MyBookingServicesTab/MyBookingServicesTab/Textarea/6e8a0ff904b9",
							"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:191:13:0664b8337fa794f6160571cedab7a1e20789f1ba8665fc34e15fcbefe5796e9d:1",
							rows: 3,
							value: cancellation,
							onChange: (e) => setCancellation(e.target.value),
							placeholder: isZh ? "例如：提前 24 小时取消可全额退款。" : "For example: full refund if cancelled at least 24 hours ahead."
						})] })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				"data-inspector-id": "components/provider/MyBookingServicesTab/MyBookingServicesTab/Button/aa5038f1eee5",
				"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:203:7:647d41609c8dfe04374d35bc6d4e9599509ddf62956a52fa12a782ad99482c03:1",
				variant: "coral",
				className: "w-full",
				onClick: handleSave,
				disabled: updateProfile.isPending,
				children: updateProfile.isPending ? isZh ? "保存中…" : "Saving…" : isZh ? "保存服务与价格" : "Save services and rates"
			})
		]
	});
}
var DAYS_EN = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday"
];
var DAYS_ZH = [
	"周日",
	"周一",
	"周二",
	"周三",
	"周四",
	"周五",
	"周六"
];
function ProviderDashboard() {
	const { i18n } = useTranslation();
	const isZh = i18n.language?.startsWith("zh");
	const { toast } = useToast();
	const qc = useQueryClient();
	const { data: profile } = useMyProfile();
	const providerId = profile?.id || null;
	const { data: bookings, isLoading: bookingsLoading } = useProviderBookings();
	const updateBookingStatus = useUpdateBookingStatus();
	const { data: availability } = useProviderAvailability(providerId);
	const upsertAvailability = useUpsertProviderAvailability();
	const [schedule, setSchedule] = (0, import_react.useState)(() => {
		const initial = {};
		for (let i = 0; i < 7; i++) initial[i] = {
			enabled: false,
			start: "09:00",
			end: "17:00"
		};
		return initial;
	});
	const [scheduleLoaded, setScheduleLoaded] = (0, import_react.useState)(false);
	const [dateOverrides, setDateOverrides] = (0, import_react.useState)([]);
	const [overridesLoaded, setOverridesLoaded] = (0, import_react.useState)(false);
	const [addOverrideOpen, setAddOverrideOpen] = (0, import_react.useState)(false);
	const [newOverride, setNewOverride] = (0, import_react.useState)({
		date: "",
		start: "09:00",
		end: "17:00",
		available: true
	});
	const [savingOverrides, setSavingOverrides] = (0, import_react.useState)(false);
	const [threadOpen, setThreadOpen] = (0, import_react.useState)(false);
	const [threadBooking, setThreadBooking] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (availability && availability.length > 0 && !scheduleLoaded) {
			const loaded = {};
			for (let i = 0; i < 7; i++) loaded[i] = {
				enabled: false,
				start: "09:00",
				end: "17:00"
			};
			(availability || []).filter((a) => !a.specific_date).forEach((a) => {
				loaded[a.day_of_week] = {
					enabled: a.is_available,
					start: a.start_time || "09:00",
					end: a.end_time || "17:00"
				};
			});
			setSchedule(loaded);
			setScheduleLoaded(true);
		}
	}, [availability, scheduleLoaded]);
	(0, import_react.useEffect)(() => {
		if (availability && !overridesLoaded) {
			const overrides = (availability || []).filter((a) => a.specific_date).map((a) => ({
				date: a.specific_date,
				start: a.start_time || "09:00",
				end: a.end_time || "17:00",
				available: a.is_available
			}));
			setDateOverrides(overrides);
			setOverridesLoaded(true);
		}
	}, [availability, overridesLoaded]);
	const handleSaveSchedule = () => {
		if (!providerId) return;
		const weeklySlots = Object.entries(schedule).map(([day, s]) => ({
			day_of_week: parseInt(day),
			start_time: s.start,
			end_time: s.end,
			is_available: s.enabled
		}));
		const overrideSlots = dateOverrides.map((o) => ({
			specific_date: o.date,
			start_time: o.start,
			end_time: o.end,
			is_available: o.available
		}));
		upsertAvailability.mutate({
			providerId,
			slots: [...weeklySlots, ...overrideSlots]
		}, {
			onSuccess: () => toast({ title: isZh ? "排班已保存" : "Schedule saved" }),
			onError: (e) => toast({
				title: isZh ? "保存失败" : "Save failed",
				description: e.message,
				variant: "destructive"
			})
		});
	};
	const handleAddOverride = async () => {
		if (!newOverride.date || !providerId) return;
		setSavingOverrides(true);
		try {
			const nextOverrides = [...dateOverrides.filter((o) => o.date !== newOverride.date), newOverride];
			const weeklySlots = Object.entries(schedule).map(([day, s]) => ({
				day_of_week: parseInt(day),
				start_time: s.start,
				end_time: s.end,
				is_available: s.enabled
			}));
			const overrideSlots = nextOverrides.map((o) => ({
				specific_date: o.date,
				start_time: o.start,
				end_time: o.end,
				is_available: o.available
			}));
			await upsertAvailability.mutateAsync({
				providerId,
				slots: [...weeklySlots, ...overrideSlots]
			});
			setDateOverrides(nextOverrides);
			setAddOverrideOpen(false);
			setNewOverride({
				date: "",
				start: "09:00",
				end: "17:00",
				available: true
			});
			qc.invalidateQueries({ queryKey: ["providerAvailability", providerId] });
			toast({ title: isZh ? "日期例外已保存" : "Date override saved" });
		} catch (e) {
			toast({
				title: isZh ? "操作失败" : "Failed",
				description: e.message,
				variant: "destructive"
			});
		} finally {
			setSavingOverrides(false);
		}
	};
	const handleDeleteOverride = async (date) => {
		if (!providerId) return;
		try {
			const nextOverrides = dateOverrides.filter((o) => o.date !== date);
			const weeklySlots = Object.entries(schedule).map(([day, s]) => ({
				day_of_week: parseInt(day),
				start_time: s.start,
				end_time: s.end,
				is_available: s.enabled
			}));
			const overrideSlots = nextOverrides.map((o) => ({
				specific_date: o.date,
				start_time: o.start,
				end_time: o.end,
				is_available: o.available
			}));
			await upsertAvailability.mutateAsync({
				providerId,
				slots: [...weeklySlots, ...overrideSlots]
			});
			setDateOverrides(nextOverrides);
			qc.invalidateQueries({ queryKey: ["providerAvailability", providerId] });
			toast({ title: isZh ? "已删除例外" : "Override removed" });
		} catch (e) {
			toast({
				title: isZh ? "操作失败" : "Failed",
				description: e.message,
				variant: "destructive"
			});
		}
	};
	const pendingBookings = (bookings || []).filter((b) => b.status === "pending");
	const confirmedBookings = (bookings || []).filter((b) => b.status === "confirmed");
	const completedBookings = (bookings || []).filter((b) => b.status === "completed");
	const refundRequests = (bookings || []).filter((b) => b.refund_status === "requested");
	const settledRefunds = (bookings || []).filter((b) => ["approved", "declined"].includes(String(b.refund_status || "")));
	const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.total_cost || 0), 0);
	const pendingEarnings = confirmedBookings.reduce((sum, b) => sum + (b.total_cost || 0), 0);
	const handleBookingAction = (id, status) => {
		updateBookingStatus.mutate({
			id,
			status
		}, { onSuccess: () => toast({ title: `Booking ${status}` }) });
	};
	const statusColors = {
		confirmed: "bg-success text-success-foreground",
		pending: "bg-warning text-warning-foreground",
		completed: "bg-muted text-muted-foreground",
		cancelled: "bg-destructive text-destructive-foreground"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-6xl mx-auto px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/h1/0",
					"data-inspector-source": "pages/ProviderDashboard.tsx:157:9:46db18a4e88e94107191fed76bdd50eba43b76927ab6ee587d5c4cd82d67d7a8:1",
					className: "text-xl sm:text-2xl font-bold tracking-tight text-foreground",
					children: isZh ? "照护者设置" : "Caregiver Settings"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/p/0",
					"data-inspector-source": "pages/ProviderDashboard.tsx:158:9:a8f5896a59c6880e3410237249066422b12a56086180de2cc4f03d80c25f6b94:1",
					className: "text-sm text-muted-foreground",
					children: isZh ? "管理预约、排班、收款与你的资料" : "Manage your bookings, schedule, payments, and your details"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/div/0",
				"data-inspector-source": "pages/ProviderDashboard.tsx:161:7:04786dcb5a74b0ac5e3045e21bf52c8d17a2da98837749276f95c203c6831fba:1",
				className: "grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6",
				children: [
					{
						label: isZh ? "待处理" : "Pending Requests",
						value: pendingBookings.length,
						icon: Clock,
						color: "text-warning"
					},
					{
						label: isZh ? "已确认" : "Confirmed",
						value: confirmedBookings.length,
						icon: CalendarDays,
						color: "text-primary"
					},
					{
						label: isZh ? "总收入" : "Total Earned",
						value: `${isZh ? "¥" : "$"}${totalEarnings.toFixed(0)}`,
						icon: DollarSign,
						color: "text-success"
					},
					{
						label: isZh ? "待结算" : "Pending Payout",
						value: `${isZh ? "¥" : "$"}${pendingEarnings.toFixed(0)}`,
						icon: TrendingUp,
						color: "text-coral"
					}
				].map((stat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Card/0",
					"data-inspector-source": "pages/ProviderDashboard.tsx:168:11:f04bb8450723d7d574950b8b7222204b78b74cf57e64a119dc91d98f52eabcd6:1",
					className: "border-transparent card-elevated",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-3 sm:p-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 sm:gap-3 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/div/1",
								"data-inspector-source": "pages/ProviderDashboard.tsx:171:17:ca19c83c881afc0c7a2f5401f47fc492875e0e5bd646ce3ad558584d66f923d0:1",
								className: `${stat.color} shrink-0`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(stat.icon, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/p/1",
									"data-inspector-source": "pages/ProviderDashboard.tsx:173:19:d13098f67962d075e719952802a1fffe42594b345173213b370a96cf2161d751:1",
									className: "text-lg sm:text-2xl font-bold text-foreground truncate",
									children: stat.value
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/p/2",
									"data-inspector-source": "pages/ProviderDashboard.tsx:174:19:d39f5f33b3e5ae6f03e5081f40fe25871b987fd9368ee873127549dfa3bcfc8c:1",
									className: "text-[11px] sm:text-xs text-muted-foreground truncate",
									children: stat.label
								})]
							})]
						})
					})
				}, stat.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "requests",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "flex-wrap h-auto",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/TabsTrigger/0",
								"data-inspector-source": "pages/ProviderDashboard.tsx:184:11:3d8fc64530ea207dd204bc4c5ddd3604790ecdddafce748a2a8d593a2b9e42dd:1",
								value: "requests",
								className: "text-xs sm:text-sm",
								children: [
									isZh ? "预约请求" : "Requests",
									" (",
									pendingBookings.length,
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/TabsTrigger/1",
								"data-inspector-source": "pages/ProviderDashboard.tsx:185:11:da200a39caaf6d2b98d0a022d66984ac98e2b66c630bf59f3102012a66364a38:1",
								value: "schedule",
								className: "text-xs sm:text-sm",
								children: isZh ? "排班" : "Schedule"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/TabsTrigger/2",
								"data-inspector-source": "pages/ProviderDashboard.tsx:186:11:e44f623c31993e963f4e5d866465fe5bab7b552fefc74bc247d74dcb56a5596f:1",
								value: "refunds",
								className: "text-xs sm:text-sm",
								children: [isZh ? "退款与问题" : "Refunds & issues", refundRequests.length > 0 ? ` (${refundRequests.length})` : ""]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/TabsTrigger/3",
								"data-inspector-source": "pages/ProviderDashboard.tsx:189:11:bd15cf1f7cd9804eb79fff44ed6263705de6b9ee5611dd3e4a235a98c899a141:1",
								value: "availability",
								className: "text-xs sm:text-sm",
								children: isZh ? "可约时间" : "Availability"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/TabsTrigger/4",
								"data-inspector-source": "pages/ProviderDashboard.tsx:190:11:2f931366004d6a93cd57084cb4fb9a4d28c352876748f0c9945711a9b9b92d2b:1",
								value: "services",
								className: "text-xs sm:text-sm",
								children: isZh ? "我的服务与价格" : "My Services & Rates"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/TabsTrigger/5",
								"data-inspector-source": "pages/ProviderDashboard.tsx:191:11:7136de643d77c149fe41f378913b4c7587aafcebb913199398757a2e1df1e26b:1",
								value: "payment",
								className: "text-xs sm:text-sm",
								children: isZh ? "收款账户" : "Payment Account"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/TabsTrigger/6",
								"data-inspector-source": "pages/ProviderDashboard.tsx:192:11:8aebdf5577eebcf721b174244157566b97a63b2b5bedb96a55b884d12c50fe58:1",
								value: "earnings",
								className: "text-xs sm:text-sm",
								children: isZh ? "收款记录" : "Payment History"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/TabsTrigger/7",
								"data-inspector-source": "pages/ProviderDashboard.tsx:193:11:d0caf6a20a735d4863d9baec80532402ac1855ba5bdfa5199c2aca95781c3085:1",
								value: "settings",
								className: "text-xs sm:text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-3.5 w-3.5 mr-1" }), isZh ? "基本资料" : "Basic Information"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/TabsContent/0",
						"data-inspector-source": "pages/ProviderDashboard.tsx:196:9:1d8f89e32845b0e30e189702884380f61b295fa6743770fbd6d96387c5a9ecb5:1",
						value: "refunds",
						className: "mt-4 space-y-4",
						children: refundRequests.length === 0 && settledRefunds.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/p/3",
							"data-inspector-source": "pages/ProviderDashboard.tsx:198:13:adbfa3b62010f4f80c3f4c3a035ecd82a8d3e536bc6a10f5fd08c9139fcbfd0c:1",
							className: "text-center py-12 text-muted-foreground",
							children: isZh ? "暂无退款申请或问题反馈" : "No refund requests or reported issues"
						}) : [...refundRequests, ...settledRefunds].map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Card/1",
							"data-inspector-source": "pages/ProviderDashboard.tsx:203:15:681e940f3d95598f3d8ce57c00a99d3381305720f0c332b425f78c811acda18f:1",
							className: "border-transparent card-elevated",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-5 space-y-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/div/2",
										"data-inspector-source": "pages/ProviderDashboard.tsx:206:21:2d98207b73cc711122b21ea133d0df667fd847f6b0ed27d1bf599dc88361f69c:1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/h3/0",
												"data-inspector-source": "pages/ProviderDashboard.tsx:207:23:dd3e9f088e581453072e8ec7ebf8224097d137dda97df64275e9d06bfc2a6911:1",
												className: "font-semibold text-foreground",
												children: b.client?.full_name || (isZh ? "客户" : "Client")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/p/4",
												"data-inspector-source": "pages/ProviderDashboard.tsx:208:23:65736fe7a8869d8cc3cfbebc91102203b43cc586c01cd41b3f39a96e8d684f9d:1",
												className: "text-sm text-muted-foreground",
												children: [
													"#",
													b.id,
													" · ",
													b.service_type,
													" · ",
													b.appointment_date ? formatDate(b.appointment_date, isZh ? "zh-CN" : "en", {
														month: "short",
														day: "numeric"
													}) : "",
													" ",
													b.appointment_time || ""
												]
											}),
											!!b.refund_reason && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/p/5",
												"data-inspector-source": "pages/ProviderDashboard.tsx:212:25:10db8cfc59b7147cb53ab52d6b421924dc51c55fcadaddaea4d6ac1f5e1111eb:1",
												className: "text-sm text-muted-foreground mt-1.5 italic",
												children: [
													"\"",
													b.refund_reason,
													"\""
												]
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-right shrink-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/p/6",
											"data-inspector-source": "pages/ProviderDashboard.tsx:216:23:3f7678fde7c8d4b93b346bdef2a40eb5ab75d28bb55da50449580b1a90bf241c:1",
											className: "text-lg font-bold text-foreground",
											children: [isZh ? "¥" : "$", Number(b.refund_amount || b.total_cost || 0).toFixed(2)]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Badge/0",
											"data-inspector-source": "pages/ProviderDashboard.tsx:219:23:6b82e230b3bcd628ae3b10526f6e85f0f4d4ce3619ee353d6f449a8ef6546158:1",
											className: "mt-1",
											variant: b.refund_status === "approved" ? "default" : b.refund_status === "declined" ? "destructive" : "secondary",
											children: b.refund_status === "approved" ? isZh ? "已退款" : "Refunded" : b.refund_status === "declined" ? isZh ? "已拒绝" : "Declined" : isZh ? "待处理" : "Awaiting you"
										})]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Button/7ccbbe89c4f2",
									"data-inspector-source": "pages/ProviderDashboard.tsx:231:19:33c2e35f18b5a30c5e21844064a72a70671b6555a52e84cfba539490e8618e64:1",
									variant: b.refund_status === "requested" ? "coral" : "outline",
									size: "sm",
									onClick: () => {
										setThreadBooking(b);
										setThreadOpen(true);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-3.5 w-3.5 mr-1.5" }), b.refund_status === "requested" ? isZh ? "查看并处理" : "Review & decide" : isZh ? "查看沟通" : "View messages"]
								})]
							})
						}, b.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/TabsContent/1",
						"data-inspector-source": "pages/ProviderDashboard.tsx:248:9:61149b309d774122b0e7b0265459ae14761497fde743a0edc14ce54c6856aa69:1",
						value: "requests",
						className: "mt-4 space-y-4",
						children: bookingsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-center py-12",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" })
						}) : pendingBookings.length > 0 ? pendingBookings.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Card/2",
							"data-inspector-source": "pages/ProviderDashboard.tsx:252:13:f58141ba391fee1ed4128a3a84f274827bc6ec0e87125509804a5f65b212df29:1",
							className: "border-transparent card-elevated",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "p-5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/div/3",
										"data-inspector-source": "pages/ProviderDashboard.tsx:255:19:f8c73ffb941a2e60669a0e7885be562338fe50deba6c40dbe54b167fd24bfbaa:1",
										className: "flex items-center gap-3",
										children: [b.client?.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/img/0",
											"data-inspector-source": "pages/ProviderDashboard.tsx:256:45:0d1cbc0641cfd325985c23725c5bfb53ef6b61817b0e357825610b67069c8386:1",
											src: b.client.avatar_url,
											alt: "",
											className: "w-12 h-12 rounded-xl object-cover"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-5 w-5 text-primary" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/div/4",
											"data-inspector-source": "pages/ProviderDashboard.tsx:257:21:2d98207b73cc711122b21ea133d0df667fd847f6b0ed27d1bf599dc88361f69c:1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
													"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/h3/1",
													"data-inspector-source": "pages/ProviderDashboard.tsx:258:23:dd3e9f088e581453072e8ec7ebf8224097d137dda97df64275e9d06bfc2a6911:1",
													className: "font-semibold text-foreground",
													children: b.client?.full_name || (isZh ? "客户" : "Client")
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/p/7",
													"data-inspector-source": "pages/ProviderDashboard.tsx:259:23:7f806ce4b18198a93793705f43ce839a52645411d06ab375b3db9569a204813d:1",
													className: "text-sm text-muted-foreground",
													children: [
														b.service_type,
														" · ",
														b.duration_hour,
														isZh ? "小时" : "hrs"
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/p/8",
													"data-inspector-source": "pages/ProviderDashboard.tsx:260:23:b04b47af0d5eabb9b20418b0611bc4e30b5539f5d9a5303df6b06249d8f9c14b:1",
													className: "text-sm text-muted-foreground",
													children: [
														b.appointment_date ? formatDate(b.appointment_date, isZh ? "zh-CN" : "en", {
															weekday: "short",
															month: "short",
															day: "numeric"
														}) : "",
														" ",
														isZh ? "于" : "at",
														" ",
														b.appointment_time || ""
													]
												}),
												cleanBookingNote(b.special_instruction) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/p/9",
													"data-inspector-source": "pages/ProviderDashboard.tsx:261:67:d0b50e0808ab78cb5b2031369db674fa19092f713716821f685e1357c01cbe88:1",
													className: "text-xs text-muted-foreground mt-1 italic",
													children: [
														"\"",
														cleanBookingNote(b.special_instruction),
														"\""
													]
												})
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col items-end gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/span/0",
											"data-inspector-source": "pages/ProviderDashboard.tsx:265:21:e3b4fd4cc7cafe997e014f5fcc67c4eb389b483dec1df58229c67153bacaa5b5:1",
											className: "text-lg font-bold text-foreground",
											children: [isZh ? "¥" : "$", b.total_cost || 0]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Button/e3753d2c2d26",
													"data-inspector-source": "pages/ProviderDashboard.tsx:267:23:f8a1165e4acfddbcb77fd271a2fe5e864be1125c29d7d79bf29d7e19ccfdc808:1",
													size: "sm",
													variant: "default",
													onClick: () => handleBookingAction(b.id, "confirmed"),
													disabled: updateBookingStatus.isPending,
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3 mr-1" }),
														" ",
														isZh ? "接受" : "Accept"
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Button/7ccbbe89c4f2",
													"data-inspector-source": "pages/ProviderDashboard.tsx:268:23:893a1c2096139b9505407917743be865444189e4d87eecb8d8cf9e93253394f7:1",
													size: "sm",
													variant: "ghost",
													onClick: () => {
														setThreadBooking(b);
														setThreadOpen(true);
													},
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-3 w-3 mr-1" }),
														" ",
														isZh ? "沟通" : "Thread"
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Button/e3753d2c2d26",
													"data-inspector-source": "pages/ProviderDashboard.tsx:270:23:424f017cbdf4b9cc422c9f86952e3013f429eba7496b6f3731069f89a0714972:1",
													size: "sm",
													variant: "outline",
													className: "text-destructive",
													onClick: () => handleBookingAction(b.id, "cancelled_by_provider"),
													disabled: updateBookingStatus.isPending,
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3 mr-1" }),
														" ",
														isZh ? "拒绝" : "Decline"
													]
												})
											]
										})]
									})]
								})
							})
						}, b.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-center py-12",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefcase, { className: "h-12 w-12 text-muted-foreground/30 mx-auto mb-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/p/10",
								"data-inspector-source": "pages/ProviderDashboard.tsx:277:121:604c54e848a034199b9f66636a0ecb33284dc7971f331ad56fa81bf86b89a79d:1",
								className: "text-muted-foreground",
								children: isZh ? "暂无待处理预约请求" : "No pending booking requests"
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/TabsContent/2",
						"data-inspector-source": "pages/ProviderDashboard.tsx:281:9:68eab5cf565a426f685f5a2c39e544815551ac7122b8910409ca090d3110760d:1",
						value: "schedule",
						className: "mt-4 space-y-4",
						children: confirmedBookings.length > 0 ? confirmedBookings.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Card/3",
							"data-inspector-source": "pages/ProviderDashboard.tsx:283:13:f58141ba391fee1ed4128a3a84f274827bc6ec0e87125509804a5f65b212df29:1",
							className: "border-transparent card-elevated",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "p-5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-center shrink-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/p/11",
												"data-inspector-source": "pages/ProviderDashboard.tsx:288:23:88f72a79f7259214df0e486e6c351074de7079ab540385fe9bc69b2c3e150892:1",
												className: "text-xs text-muted-foreground",
												children: b.appointment_date ? formatDate(b.appointment_date, isZh ? "zh-CN" : "en", { month: "short" }) : ""
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/p/12",
												"data-inspector-source": "pages/ProviderDashboard.tsx:289:23:db828b71e72254b8a3584bfdd5cb7a3955e59ed2a62c85df740574a1ebfa305d:1",
												className: "text-lg font-bold text-foreground",
												children: b.appointment_date ? new Date(b.appointment_date).getDate() : ""
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/h3/2",
											"data-inspector-source": "pages/ProviderDashboard.tsx:292:23:dd3e9f088e581453072e8ec7ebf8224097d137dda97df64275e9d06bfc2a6911:1",
											className: "font-semibold text-foreground",
											children: b.client?.full_name || (isZh ? "客户" : "Client")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/p/13",
											"data-inspector-source": "pages/ProviderDashboard.tsx:293:23:6f132114db1ac98e45daa0a9248895c3914ab550301fd32f51bd9ef466d644b2:1",
											className: "text-sm text-muted-foreground",
											children: [
												b.appointment_time,
												" · ",
												b.duration_hour,
												isZh ? "小时" : "hrs",
												" · ",
												b.service_type
											]
										})] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Badge/1",
												"data-inspector-source": "pages/ProviderDashboard.tsx:297:21:f7e675d3332a091d2053be38b376462ff812c4ab94e3117de73762c6fd7c4d86:1",
												className: statusColors[b.status],
												children: b.status
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Button/7ccbbe89c4f2",
												"data-inspector-source": "pages/ProviderDashboard.tsx:298:21:7c39ca94cd122d6407eb2d335823141dc71e38baa0014ee068d99b382c57b46d:1",
												size: "sm",
												variant: "ghost",
												onClick: () => {
													setThreadBooking(b);
													setThreadOpen(true);
												},
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-3 w-3 mr-1" }),
													" ",
													isZh ? "沟通" : "Thread"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Button/e3753d2c2d26",
												"data-inspector-source": "pages/ProviderDashboard.tsx:299:21:8fa0d397e51a9dbb9d710bcdc8a79c442e984c876595c79614a86cbf4bebb302:1",
												size: "sm",
												variant: "outline",
												onClick: () => handleBookingAction(b.id, "completed"),
												children: isZh ? "完成" : "Complete"
											})
										]
									})]
								})
							})
						}, b.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/p/14",
							"data-inspector-source": "pages/ProviderDashboard.tsx:305:16:331c4b13b128f5252fa59c207fa68fa0836b674761cc4da2195918cb02b1b16b:1",
							className: "text-center py-12 text-muted-foreground",
							children: isZh ? "暂无已确认预约" : "No confirmed bookings"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "availability",
						className: "mt-4 space-y-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "border-transparent card-elevated",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/CardTitle/0",
								"data-inspector-source": "pages/ProviderDashboard.tsx:310:25:365bd4436d1064b52dddd3689db65c542d1cc9eda1229d14ec9b3478bf660950:1",
								children: isZh ? "每周排班" : "Weekly Schedule"
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/CardContent/0",
								"data-inspector-source": "pages/ProviderDashboard.tsx:311:13:1363dc75b44b5db44644fec753f742e10ec1c5e01baa19bb08bac509895f3b8b:1",
								className: "space-y-4",
								children: [(isZh ? DAYS_ZH : DAYS_EN).map((day, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/div/5",
									"data-inspector-source": "pages/ProviderDashboard.tsx:313:17:a72f982eb3b6bd1e797d6e01d581033bb5ee36bc7d5ad26480367b47444e414a:1",
									className: "flex items-center gap-4 p-3 rounded-lg bg-muted/30",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "w-28 shrink-0",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
												"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Switch/801c3125d982",
												"data-inspector-source": "pages/ProviderDashboard.tsx:316:23:824d06173a950efd4c2f07d074b40b9705ff962114b21e6f734ca7581f258e35:1",
												checked: schedule[i]?.enabled || false,
												onCheckedChange: (c) => setSchedule((p) => ({
													...p,
													[i]: {
														...p[i],
														enabled: c
													}
												}))
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/span/1",
												"data-inspector-source": "pages/ProviderDashboard.tsx:317:23:2ea7f6d5b02c6f3e1a6fc56c0b5146f337d8f531da42e25f3c9d58b2fcec3a7a:1",
												className: "text-sm font-medium text-foreground",
												children: day
											})]
										})
									}), schedule[i]?.enabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Input/22285a71978e",
												"data-inspector-source": "pages/ProviderDashboard.tsx:322:23:d24d4a0bf3f958c71739371a126a58c2ae29bddea3b0eb32aa639df80db0674e:1",
												type: "time",
												value: schedule[i]?.start || "09:00",
												onChange: (e) => setSchedule((p) => ({
													...p,
													[i]: {
														...p[i],
														start: e.target.value
													}
												})),
												className: "w-32"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/span/2",
												"data-inspector-source": "pages/ProviderDashboard.tsx:323:23:f0b8a58cec60be7416a19f451c3221bfdfba98dc5e5f6d5491f806c9d1cc76a6:1",
												className: "text-muted-foreground",
												children: isZh ? "至" : "to"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Input/07860d73151c",
												"data-inspector-source": "pages/ProviderDashboard.tsx:324:23:ea5d6dfc32dedea1e343886e7cb0a8e150f4c6fce7f13b5ab2b1a2107f93a600:1",
												type: "time",
												value: schedule[i]?.end || "17:00",
												onChange: (e) => setSchedule((p) => ({
													...p,
													[i]: {
														...p[i],
														end: e.target.value
													}
												})),
												className: "w-32"
											})
										]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/span/3",
										"data-inspector-source": "pages/ProviderDashboard.tsx:326:23:143181306967025fa509d9e35caaa57eb1f771fe3a5720026111f96d54a5dce3:1",
										className: "text-sm text-muted-foreground",
										children: isZh ? "不可约" : "Unavailable"
									})]
								}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Button/65929270e501",
									"data-inspector-source": "pages/ProviderDashboard.tsx:329:15:2b829ba22d378b9552f8cfa1d33252e23dd201431589d8254bf699ce9f399baa:1",
									variant: "coral",
									className: "w-full mt-4",
									onClick: handleSaveSchedule,
									disabled: upsertAvailability.isPending,
									children: upsertAvailability.isPending ? isZh ? "保存中…" : "Saving..." : isZh ? "保存每周排班" : "Save Weekly Schedule"
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "border-transparent card-elevated",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex-row items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/CardTitle/1",
									"data-inspector-source": "pages/ProviderDashboard.tsx:338:15:32bc1ab98ffeac61a0fc3e55b954804227ecccedb42e330531dda4b782c69157:1",
									children: isZh ? "特殊日期设置" : "Date-Specific Overrides"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
									"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Dialog/f0637d8fe670",
									"data-inspector-source": "pages/ProviderDashboard.tsx:339:15:99df8986bfbee792de9380852efcf5f9ab354c2b973a7e8dd5773eb21216b6db:1",
									open: addOverrideOpen,
									onOpenChange: setAddOverrideOpen,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Button/0",
											"data-inspector-source": "pages/ProviderDashboard.tsx:340:40:118f425317e411dd803c4dcadc173da90d6a6029817bf2ad50f50b1d5b3eac83:1",
											variant: "outline",
											size: "sm",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }),
												" ",
												isZh ? "添加特殊日" : "Add Override"
											]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
										"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/DialogTitle/0",
										"data-inspector-source": "pages/ProviderDashboard.tsx:342:33:600051c1894ace48ef9569fbb5039a9530158d7bf726b671860d9613fd76d0db:1",
										children: isZh ? "添加特殊日期" : "Add Date Override"
									}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/div/6",
										"data-inspector-source": "pages/ProviderDashboard.tsx:343:19:a53db526e0b9c9c6cdab80e58e908b3c132193f65d4009051ca25362ae93f2c3:1",
										className: "space-y-4 mt-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Label/0",
												"data-inspector-source": "pages/ProviderDashboard.tsx:344:26:35ed64158a93a450a0a62582b2807234082e29f14c8c9d9c075c179b0d1df95f:1",
												children: isZh ? "日期" : "Date"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Input/44bac2447b65",
												"data-inspector-source": "pages/ProviderDashboard.tsx:344:63:35ed64158a93a450a0a62582b2807234082e29f14c8c9d9c075c179b0d1df95f:1",
												type: "date",
												value: newOverride.date,
												onChange: (e) => setNewOverride((p) => ({
													...p,
													date: e.target.value
												})),
												min: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
												className: "mt-1"
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
													"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Switch/59c5f72db29b",
													"data-inspector-source": "pages/ProviderDashboard.tsx:345:62:bfbcfd84422d73f0dcd211bb39f4cd2ecce8deb56dcb507a9115accde9e12145:1",
													checked: newOverride.available,
													onCheckedChange: (c) => setNewOverride((p) => ({
														...p,
														available: c
													}))
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Label/1",
													"data-inspector-source": "pages/ProviderDashboard.tsx:345:173:bfbcfd84422d73f0dcd211bb39f4cd2ecce8deb56dcb507a9115accde9e12145:1",
													children: newOverride.available ? isZh ? "可约" : "Available" : isZh ? "不可约（休息日）" : "Unavailable (day off)"
												})]
											}),
											newOverride.available && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Label/2",
														"data-inspector-source": "pages/ProviderDashboard.tsx:348:49:cefcd33d28a9252d811165c5f0ca58bbcc2518bcee2a86320e2941dffb295013:1",
														children: isZh ? "开始" : "Start"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Input/5571954a3297",
														"data-inspector-source": "pages/ProviderDashboard.tsx:348:87:cefcd33d28a9252d811165c5f0ca58bbcc2518bcee2a86320e2941dffb295013:1",
														type: "time",
														value: newOverride.start,
														onChange: (e) => setNewOverride((p) => ({
															...p,
															start: e.target.value
														})),
														className: "mt-1"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Label/3",
														"data-inspector-source": "pages/ProviderDashboard.tsx:349:49:2e77c5ffe6bd13a9665fe4950b3b9a6a266bbc1eb6940f0718a1d90ad4e2cafe:1",
														children: isZh ? "结束" : "End"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Input/6bcf71cc4128",
														"data-inspector-source": "pages/ProviderDashboard.tsx:349:85:2e77c5ffe6bd13a9665fe4950b3b9a6a266bbc1eb6940f0718a1d90ad4e2cafe:1",
														type: "time",
														value: newOverride.end,
														onChange: (e) => setNewOverride((p) => ({
															...p,
															end: e.target.value
														})),
														className: "mt-1"
													})]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Button/3deab7f85df1",
												"data-inspector-source": "pages/ProviderDashboard.tsx:352:21:aaea831d346724e1228d97bf5f8f3d6b358e1fdc9e0212a8b3af952110e78709:1",
												variant: "coral",
												className: "w-full",
												onClick: handleAddOverride,
												disabled: savingOverrides || !newOverride.date,
												children: savingOverrides ? isZh ? "保存中…" : "Saving..." : isZh ? "保存设置" : "Save Override"
											})
										]
									})] })]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/CardContent/1",
								"data-inspector-source": "pages/ProviderDashboard.tsx:357:13:99f79613100029c181255b390230e3734121b3a5fcf3df56d54718e647b1a511:1",
								children: dateOverrides.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/div/7",
									"data-inspector-source": "pages/ProviderDashboard.tsx:359:17:17d9d6c09ea299a8a60db95751c360e55c1db680a84cb8451206c49e7d794eb0:1",
									className: "space-y-2",
									children: dateOverrides.sort((a, b) => a.date.localeCompare(b.date)).map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/div/8",
										"data-inspector-source": "pages/ProviderDashboard.tsx:361:21:b09e89aea2cced3b638ff9b0c7715e8113c600937556f99a127428a04aad6d79:1",
										className: "flex items-center justify-between p-3 rounded-lg bg-muted/30",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/p/15",
											"data-inspector-source": "pages/ProviderDashboard.tsx:363:25:dda6ebf8e5e9fd2ca3066f963aa97e6e177d5b6fabd2960fa63654dabc8499ad:1",
											className: "text-sm font-medium text-foreground",
											children: formatDate(o.date + "T12:00:00", isZh ? "zh-CN" : "en", {
												weekday: "short",
												month: "short",
												day: "numeric",
												year: "numeric"
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/p/16",
											"data-inspector-source": "pages/ProviderDashboard.tsx:364:25:a4dd7302574638a316f887bc4ad9f512eab6396dbfe36530ab17d533217d2d89:1",
											className: "text-xs text-muted-foreground",
											children: o.available ? `${o.start} – ${o.end}` : isZh ? "不可约（休息日）" : "Unavailable (day off)"
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Badge/2",
												"data-inspector-source": "pages/ProviderDashboard.tsx:367:25:28eda4717262bf338214e711790784300db1e6d1ba0931e7bdf26e375133ae22:1",
												variant: o.available ? "default" : "secondary",
												children: o.available ? isZh ? "可约" : "Available" : isZh ? "休息" : "Off"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/Button/82b617f15195",
												"data-inspector-source": "pages/ProviderDashboard.tsx:368:25:30a22fe49165879c6228990007cd1e45d2a63c83cc135dd1d39c45b647188793:1",
												variant: "ghost",
												size: "icon",
												className: "min-h-11 min-w-11 text-destructive",
												"aria-label": isZh ? "删除特殊日期" : "Delete date override",
												onClick: () => handleDeleteOverride(o.date),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
											})]
										})]
									}, o.date))
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/p/17",
									"data-inspector-source": "pages/ProviderDashboard.tsx:373:19:e9233ceb9beb72e208e5e329b7eefb74966c00de43727c216d95141066784159:1",
									className: "text-sm text-muted-foreground text-center py-4",
									children: isZh ? "暂无特殊日期。可为节假日、特殊营业时间或休息日添加设置。" : "No date overrides. Add overrides for holidays, special hours, or days off."
								})
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "payment",
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: "border-transparent card-elevated mb-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/CardContent/2",
								"data-inspector-source": "pages/ProviderDashboard.tsx:381:13:fb84936bef4489abdfb3e76f83dfb1a415bd8474b04713eb6dedde7371fc77e4:1",
								className: "p-5 text-sm text-muted-foreground leading-relaxed",
								children: isZh ? "客户在下单时通过平台的在线支付完成付款，款项按订单记入您的收款账户。完成服务后金额转为可提现余额，可直接在下方提交提现申请；退款与纠纷同样按订单处理。平台不收取任何佣金。" : "Clients pay online when they place the booking, and each amount is recorded to your payout account. Once you mark the service complete the amount becomes withdrawable — request a payout right below. Refunds and disputes are handled per order. The platform takes no commission."
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayoutAccountsCard, { section: "account" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "earnings",
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid sm:grid-cols-2 gap-4 mb-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
								className: "border-transparent card-elevated",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "p-5 text-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/p/18",
										"data-inspector-source": "pages/ProviderDashboard.tsx:393:105:c36f941164306b2f52e396f6917af47c51044730aad8c42841b80f2956883eb5:0",
										className: "text-3xl font-bold text-foreground",
										children: [isZh ? "¥" : "$", totalEarnings.toFixed(2)]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/p/19",
										"data-inspector-source": "pages/ProviderDashboard.tsx:393:203:c36f941164306b2f52e396f6917af47c51044730aad8c42841b80f2956883eb5:0",
										className: "text-sm text-muted-foreground mt-1",
										children: isZh ? "已完成订单总额" : "Completed Bookings Total"
									})]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
								className: "border-transparent card-elevated",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "p-5 text-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/p/20",
										"data-inspector-source": "pages/ProviderDashboard.tsx:394:105:09879b3914d6b4132ae335165660f209fac3e2ec9a3f72bf02a3734330f4448f:0",
										className: "text-3xl font-bold text-foreground",
										children: completedBookings.length
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/p/21",
										"data-inspector-source": "pages/ProviderDashboard.tsx:394:185:09879b3914d6b4132ae335165660f209fac3e2ec9a3f72bf02a3734330f4448f:0",
										className: "text-sm text-muted-foreground mt-1",
										children: isZh ? "已完成预约" : "Completed Bookings"
									})]
								})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayoutAccountsCard, { section: "history" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "settings",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderSettingsTab, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "services",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MyBookingServicesTab, {})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingThreadDialog, {
				"data-inspector-id": "pages/ProviderDashboard/ProviderDashboard/BookingThreadDialog/580789f3d706",
				"data-inspector-source": "pages/ProviderDashboard.tsx:408:7:56d8704d7b858a47904e07600961031eae760f0fe69fbcb8c269e18455e69240:1",
				open: threadOpen,
				onOpenChange: setThreadOpen,
				orderId: threadBooking?.id,
				role: "provider",
				counterpartName: threadBooking?.client?.full_name,
				refundStatus: threadBooking?.refund_status,
				refundReason: threadBooking?.refund_reason,
				refundAmount: threadBooking?.refund_amount
			})
		]
	});
}
function RouteCaregiverSettingPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFeature, {
		name: "paidCaregivers",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderDashboard, {}) })
	});
}
//#endregion
export { RouteCaregiverSettingPage as component };
