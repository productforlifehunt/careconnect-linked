import { s as __toESM } from "../_runtime.mjs";
import { t as cleanBookingNote } from "./utils-CcHv9xqZ.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-Cz5iPbNd.mjs";
import { t as Badge } from "./badge-Dn-oRli-.mjs";
import { t as Input } from "./input-DmTt3-fi.mjs";
import { t as Textarea } from "./textarea-DPamDMgK.mjs";
import { t as formatDate } from "./locale-DKwjQju2.mjs";
import { Bn as Briefcase, Dt as MapPin, En as CircleCheck, H as Settings, Ht as Info, L as Shield, Ln as CalendarDays, Pn as Check, St as MessageSquare, an as EyeOff, ct as Phone, dn as DollarSign, i as Wallet, in as Eye, it as Plus, jt as LoaderCircle, l as User, n as X, v as TrendingUp, vn as Clock, y as Trash2 } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, s as DialogTrigger, t as Dialog } from "./dialog-COszB6Fv.mjs";
import { t as Checkbox } from "./checkbox-4tVtKjWh.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as SERVICE_DELIVERY_MODES, t as CARE_SERVICE_TYPES } from "./source.wordpress-CI9kg3_M.mjs";
import { _ as saveMyPayout, h as requestWithdrawal, i as cancelWithdrawal, l as getMyPayout } from "./woocommerce-api-BoF1FQHg.mjs";
import { Sn as useProviderBookings, Xn as useUpdateBookingStatus, mn as useMyProfile, mr as useUpdateProfile, vr as useUpsertProviderAvailability, xn as useProviderAvailability } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-HRlnwchH.mjs";
import { t as Switch } from "./switch-Coli7fra.mjs";
import { t as RequireAuth } from "./RequireAuth-CXvd5_cn.mjs";
import { t as SiteFeature } from "./SiteFeature-CQrN1JWZ.mjs";
import { t as Separator } from "./separator-BD-dtN1z.mjs";
import { t as BookingThreadDialog } from "./BookingThreadDialog-Bz3hv0pG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/caregiver-setting-CHde-59Y.js
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
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-5 w-5" }),
				" ",
				section === "history" ? isZh ? "收款记录" : "Payment history" : isZh ? "收款账户与提现" : "Payment account",
				showAccount && hasPayoutDetails && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "default",
					className: "ml-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3 mr-1" }), isZh ? "已配置" : "Configured"]
				})
			]
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-5",
			children: [
				showAccount && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:153:9:7108f0c155dfffbc154af9d8daa980dfe2abd0b82639c1a702a93225847bdd70:1",
					className: "grid sm:grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:154:11:e7f0c2024286c48d42495bfcd5ec3bcb22a0be71295ff26973bed54f84c10572:1",
						className: "rounded-lg bg-muted/40 border border-border/50 p-4 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:155:13:d0859382fd9f810edbd000403f857c98b84b26ca118f6cbeb66f0ff69e227a18:1",
							className: "text-2xl font-bold text-foreground",
							children: [currency, balance.toFixed(2)]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:158:13:947df5fd1387142186b23c2d3fa5f05afa28a858c7ddcec5e8f9af1af913bbbb:1",
							className: "text-xs text-muted-foreground mt-1",
							children: isZh ? "可提现余额" : "Available balance"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:162:11:e7f0c2024286c48d42495bfcd5ec3bcb22a0be71295ff26973bed54f84c10572:1",
						className: "rounded-lg bg-muted/40 border border-border/50 p-4 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:163:13:d0859382fd9f810edbd000403f857c98b84b26ca118f6cbeb66f0ff69e227a18:1",
							className: "text-2xl font-bold text-foreground",
							children: [currency, minimum.toFixed(2)]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:166:13:947df5fd1387142186b23c2d3fa5f05afa28a858c7ddcec5e8f9af1af913bbbb:1",
							className: "text-xs text-muted-foreground mt-1",
							children: isZh ? "最低提现金额" : "Minimum payout"
						})]
					})]
				}),
				showAccount && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:174:9:fe47b4fb8b3adc0ce8f40a453eb2577833cc244d2bbddee4ba36cd8baa6b167f:1",
						className: "flex gap-2 p-3 rounded-lg bg-muted/40 border border-border/50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-4 w-4 text-muted-foreground shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:176:11:b4d5393b3c01515501267a57802d39d039e25750b3c72b248003635d0cbf80ac:1",
							className: "text-sm text-muted-foreground leading-relaxed",
							children: isZh ? "客户在下单时完成在线支付。您将服务标记为已完成后，该笔金额进入可提现余额，可随时提交提现申请。" : "Clients pay online when they book. After you mark a service complete, that amount moves into your available balance and you can request a payout."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:183:9:a9929ebdeed0219092c2fcd37f2f2e7dc244c8e4e2f4be9fa5f3c342ed4ae6f9:1",
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "paypal-email",
							className: "font-semibold",
							children: isZh ? "PayPal 收款邮箱" : "PayPal email"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "paypal-email",
							type: "email",
							value: paypalEmail,
							onChange: (e) => setPaypalEmail(e.target.value),
							placeholder: "you@example.com",
							disabled: isLoading
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:197:9:e74548b9b0838019cca70a1cb7b825ec8514f27e72777971d711733ba07ea1c1:1",
						className: "grid sm:grid-cols-3 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:198:11:94490c180d4f0469c17deda0b1a4d7cc86527230dc532ba16ef5120fe55a0723:1",
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "bank-ac-name",
									children: isZh ? "账户名" : "Account name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "bank-ac-name",
									value: accountName,
									onChange: (e) => setAccountName(e.target.value),
									disabled: isLoading
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:202:11:94490c180d4f0469c17deda0b1a4d7cc86527230dc532ba16ef5120fe55a0723:1",
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "bank-ac-number",
									children: isZh ? "账号" : "Account number"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "bank-ac-number",
									value: accountNumber,
									onChange: (e) => setAccountNumber(e.target.value),
									disabled: isLoading
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:206:11:94490c180d4f0469c17deda0b1a4d7cc86527230dc532ba16ef5120fe55a0723:1",
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "bank-name",
									children: isZh ? "银行名称" : "Bank name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "bank-name",
									value: bankName,
									onChange: (e) => setBankName(e.target.value),
									disabled: isLoading
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => saveMutation.mutate(),
						disabled: saveMutation.isPending,
						className: "w-full",
						children: saveMutation.isPending ? isZh ? "保存中..." : "Saving..." : isZh ? "保存收款信息" : "Save payout details"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:224:9:a9929ebdeed0219092c2fcd37f2f2e7dc244c8e4e2f4be9fa5f3c342ed4ae6f9:1",
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "withdraw-amount",
								className: "font-semibold",
								children: isZh ? "提现金额" : "Payout amount"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:228:11:399695daa0d3e9f56cad751c79ccb0dea05106812f8a4c18a0a193723df16599:1",
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "withdraw-amount",
									type: "number",
									min: "0",
									step: "0.01",
									value: amount,
									onChange: (e) => setAmount(e.target.value),
									placeholder: balance > 0 ? balance.toFixed(2) : "0.00"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "secondary",
									onClick: () => withdrawMutation.mutate(),
									disabled: withdrawMutation.isPending || !hasPayoutDetails || balance <= 0 || !!pendingPayout,
									children: withdrawMutation.isPending ? isZh ? "提交中..." : "Submitting..." : isZh ? "申请提现" : "Request payout"
								})]
							}),
							!hasPayoutDetails && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:249:13:7092a605bb0ee468f54cfd5cd2af559f4d0717ca74addc443319cf46d0cfdc7a:1",
								className: "text-xs text-muted-foreground",
								children: isZh ? "请先保存收款信息，然后即可申请提现。" : "Save your payout details first, then you can request a payout."
							}),
							!!pendingPayout && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:254:13:2082eeabaff57b7c8b364367d5eb760288b28e250d83df996a6b08cf2af6937c:1",
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:255:15:cbfae5e3953ff4ddefb94e1e3ae3a8e922537f3e3c99c4944a42d7f59324a7ab:1",
									className: "text-xs text-muted-foreground flex-1 min-w-[200px]",
									children: isZh ? `您有一笔 ${currency}${Number(pendingPayout.amount).toFixed(2)} 的提现申请正在处理中。可撤销后重新申请。` : `A ${currency}${Number(pendingPayout.amount).toFixed(2)} payout request is still being processed. Cancel it if you'd rather request a different amount.`
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
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
					"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:277:11:e08bc0e72a9b8ebab0b80a261611e7176c27317cfdfb45aaa019e378b1611cc3:1",
					className: "text-sm text-muted-foreground text-center py-4",
					children: isZh ? "还没有收款记录。" : "No payments yet."
				}),
				showHistory && !!data?.withdrawals?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:283:11:94490c180d4f0469c17deda0b1a4d7cc86527230dc532ba16ef5120fe55a0723:1",
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:284:13:2f00a63d48427bbcf6f257b5e48d986015b93829f96fb3ea8798ef66c106a220:1",
						className: "text-sm font-semibold text-foreground",
						children: isZh ? "提现记录" : "Payout history"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:287:13:0bd137aee249026a5dcadda5560dc6aa5052211c8c1d3dfb27198b058ac36b71:1",
						className: "space-y-1.5",
						children: data.withdrawals.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:289:17:57cfb453d80c5b3876557731ebb710f22afd7b872bc588cf691169cc29669c92:1",
							className: "flex items-center justify-between text-sm rounded-md border border-border/50 px-3 py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:290:19:4806fdcb928588c94be8868b91cf7f4b1a6aa784d1ca678118eb1e8d4b539abd:1",
									className: "text-muted-foreground",
									children: String(w.created || "").slice(0, 10)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									"data-inspector-source": "components/provider/PayoutAccountsCard.tsx:291:19:d37021ac6a036cbad2be59c1ebadc2a69856230579377f65e001ec716257c123:1",
									className: "font-medium text-foreground",
									children: [currency, Number(w.amount).toFixed(2)]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
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
		"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:69:5:e8152ec757d91b474394261df6fbd17235cd92293da6049d8573bfc7e827e690:1",
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-transparent card-elevated",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:73:11:0a35c96ed4573ee1b900efcf2e4b51a9f1bcdaae7f5b9df5a3d4af50abe09d16:1",
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:74:13:9a2aac01354b38c80e2cf75c3916cb920054d16b840ad082b1a51496892dad6e:1",
							className: "flex items-center gap-3",
							children: [isActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-5 w-5 text-success" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-5 w-5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:76:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:77:17:270074e06515ae41cc418f8bdc595c5f69b0c55f071e87c850292d6b1f439e58:1",
									className: "font-semibold text-foreground",
									children: t("providerDash.marketplaceVisibility")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:78:17:108d1bf0a361eb111fb560a675d4f372e3c8439e22f69ad671599758cc2a8243:1",
									className: "text-sm text-muted-foreground",
									children: isActive ? t("providerDash.visibleBookable") : t("providerDash.hiddenFromSearch")
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
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
							"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:97:11:c5065b328556111bf4fb157ce8ccdfb20f2662af0d205836c97600aaa35772c8:1",
							className: "grid sm:grid-cols-2 gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:98:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "flex items-center gap-1.5 mb-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5" }),
										" ",
										t("common.location")
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: location,
									onChange: (e) => setLocation(e.target.value),
									placeholder: t("providerDash.locationPlaceholder")
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:102:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
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
									type: "number",
									min: "0",
									step: "5",
									value: hourlyRate,
									onChange: (e) => setHourlyRate(e.target.value),
									placeholder: t("providerDash.ratePlaceholder")
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:107:11:c5065b328556111bf4fb157ce8ccdfb20f2662af0d205836c97600aaa35772c8:1",
							className: "grid sm:grid-cols-2 gap-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:108:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
										className: "flex items-center gap-1.5 mb-1.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-3.5 w-3.5" }),
											" ",
											t("providerDash.phoneNumber")
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: phone,
										onChange: (e) => setPhone(e.target.value),
										placeholder: t("providerDash.phonePlaceholder")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:111:15:aa4e7bf88861ff694fbb7c9a0a6032f6efcb7d0dba46425a83cf01109af7f87c:1",
										className: "text-xs text-muted-foreground mt-1",
										children: i18n.language?.startsWith("zh") ? "仅用于收款账户，不会公开显示。" : "Used for your payout account only — never shown publicly."
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/provider/ProviderSettingsTab.tsx:114:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "mb-1.5",
								children: t("providerDash.bioAboutMe")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: bio,
								onChange: (e) => setBio(e.target.value),
								placeholder: t("providerDash.bioPlaceholder"),
								rows: 4
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
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
		"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:87:7:2824b4b33d70b08ffa057c3b6fd92b976cea9c44067bdd48fc6bdcff80139521:1",
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
		"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:113:5:e8152ec757d91b474394261df6fbd17235cd92293da6049d8573bfc7e827e690:1",
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-transparent card-elevated",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-5 w-5" }),
						" ",
						isZh ? "我提供的服务" : "Services I offer"
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:121:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-sm font-semibold mb-2 block",
							children: isZh ? "服务方式" : "How you deliver care"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:125:13:6df5046976a2c17a90114856f9935b91cdac159698bf66fbe64ab7f2fc7d6285:1",
							className: "flex flex-wrap gap-4",
							children: SERVICE_DELIVERY_MODES.map((mode) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:127:17:f69cfff7517788edc34467c36e017a1d9210b4b28709b7fef021a146d44e7672:1",
								className: "flex items-center gap-2 cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									checked: delivery.includes(mode.slug),
									onCheckedChange: () => toggle(delivery, mode.slug, setDelivery)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:132:19:663297272de99287824f7bffcaf16da098108dbd85a94030afec3e0ae82acc80:1",
									className: "text-sm",
									children: isZh ? mode.zh : mode.en
								})]
							}, mode.slug))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:138:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-sm font-semibold mb-2 block",
							children: isZh ? "服务类型" : "Care service types"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:142:13:bddc1cc40d3e61d0327922fdf6b3e45b1cbbd67b4eb7d50eaeba75950f3d1b8e:1",
							className: "grid sm:grid-cols-2 gap-2",
							children: CARE_SERVICE_TYPES.map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:144:17:0f6ba130bd6fd217ca1f8336cf38f76500f294123ff3ae9cafe8aa915482ad9e:1",
								className: "flex items-center gap-2 cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									checked: services.includes(st.slug),
									onCheckedChange: () => toggle(services, st.slug, setServices)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:149:19:b03cab54e66e5ce78fccf03f34e2af205d7d9133e1f380d0bfee2e832449718d:1",
									className: "text-sm",
									children: isZh ? st.zh : st.en
								})]
							}, st.slug))
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-transparent card-elevated",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
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
							"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:164:11:b139adbc8a0250633a9cff3737cffcc019d49ec169ff3d4855c5617614d3e17a:1",
							className: "text-sm text-muted-foreground",
							children: isZh ? "只填写您真正提供的服务价格，留空的项目不会显示给客户。客户也可以在聊天中与您商定其他价格。" : "Fill in only the rates you actually offer — anything left blank stays hidden from clients. Clients can also agree a different price with you in chat."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:169:11:c5065b328556111bf4fb157ce8ccdfb20f2662af0d205836c97600aaa35772c8:1",
							className: "grid sm:grid-cols-2 gap-4",
							children: rateFields.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:171:15:3810e3efe5264177d995f737fd1eb0357d3032e37bb6b3dd82cdbce66f14e47e:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "mb-1.5 block text-sm",
									children: f.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:173:17:fdb4f1ece835a2f38c9f35268e966c9f2f3b4c9a155a6dfb4b7342278f0808ab:1",
									className: "flex items-center gap-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:174:19:242fb8a3e6516959487489f66c2a6006ff6d4e6d580f5df896fa06f065c385e6:1",
											className: "text-muted-foreground text-sm",
											children: isZh ? "¥" : "$"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											min: "0",
											step: "5",
											className: "h-9 text-right",
											value: f.value,
											onChange: (e) => f.set(e.target.value),
											placeholder: "50"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:182:19:b0039730da2a11ffb120029b7cd30f31029468cf4c21b7984a9892c053b3c3cb:1",
											className: "text-xs text-muted-foreground whitespace-nowrap",
											children: f.suffix
										})
									]
								})]
							}, f.label))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/provider/MyBookingServicesTab.tsx:187:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "mb-1.5 block text-sm",
								children: isZh ? "取消政策" : "Cancellation policy"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 3,
								value: cancellation,
								onChange: (e) => setCancellation(e.target.value),
								placeholder: isZh ? "例如：提前 24 小时取消可全额退款。" : "For example: full refund if cancelled at least 24 hours ahead."
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
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
		"data-inspector-source": "pages/ProviderDashboard.tsx:155:5:047f97546b6b623a830d42bd874d784b00605b835008974c0947012e076edd18:1",
		className: "max-w-6xl mx-auto px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/ProviderDashboard.tsx:156:7:c0548c6d71b6241ddaaa80a6883f7f922d1c21117170de4c5862b55fad60e1fa:1",
				className: "mb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					"data-inspector-source": "pages/ProviderDashboard.tsx:157:9:46db18a4e88e94107191fed76bdd50eba43b76927ab6ee587d5c4cd82d67d7a8:1",
					className: "text-xl sm:text-2xl font-bold tracking-tight text-foreground",
					children: isZh ? "照护者设置" : "Caregiver Settings"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "pages/ProviderDashboard.tsx:158:9:a8f5896a59c6880e3410237249066422b12a56086180de2cc4f03d80c25f6b94:1",
					className: "text-sm text-muted-foreground",
					children: isZh ? "管理预约、排班、收款与你的资料" : "Manage your bookings, schedule, payments, and your details"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
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
					className: "border-transparent card-elevated",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-3 sm:p-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "pages/ProviderDashboard.tsx:170:15:3e897db5491687abda2c8933f53b39ec170c3b0bc80974103be8364f45a66933:1",
							className: "flex items-center gap-2 sm:gap-3 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-source": "pages/ProviderDashboard.tsx:171:17:ca19c83c881afc0c7a2f5401f47fc492875e0e5bd646ce3ad558584d66f923d0:1",
								className: `${stat.color} shrink-0`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(stat.icon, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/ProviderDashboard.tsx:172:17:0609ea2756528d20bd9fb5e28ebbd836467f0c7d0d394cb37e1364524450fc44:1",
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-source": "pages/ProviderDashboard.tsx:173:19:d13098f67962d075e719952802a1fffe42594b345173213b370a96cf2161d751:1",
									className: "text-lg sm:text-2xl font-bold text-foreground truncate",
									children: stat.value
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
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
								value: "schedule",
								className: "text-xs sm:text-sm",
								children: isZh ? "排班" : "Schedule"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "refunds",
								className: "text-xs sm:text-sm",
								children: [isZh ? "退款与问题" : "Refunds & issues", refundRequests.length > 0 ? ` (${refundRequests.length})` : ""]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "availability",
								className: "text-xs sm:text-sm",
								children: isZh ? "可约时间" : "Availability"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "services",
								className: "text-xs sm:text-sm",
								children: isZh ? "我的服务与价格" : "My Services & Rates"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "payment",
								className: "text-xs sm:text-sm",
								children: isZh ? "收款账户" : "Payment Account"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "earnings",
								className: "text-xs sm:text-sm",
								children: isZh ? "收款记录" : "Payment History"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "settings",
								className: "text-xs sm:text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-3.5 w-3.5 mr-1" }), isZh ? "基本资料" : "Basic Information"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "refunds",
						className: "mt-4 space-y-4",
						children: refundRequests.length === 0 && settledRefunds.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "pages/ProviderDashboard.tsx:198:13:adbfa3b62010f4f80c3f4c3a035ecd82a8d3e536bc6a10f5fd08c9139fcbfd0c:1",
							className: "text-center py-12 text-muted-foreground",
							children: isZh ? "暂无退款申请或问题反馈" : "No refund requests or reported issues"
						}) : [...refundRequests, ...settledRefunds].map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: "border-transparent card-elevated",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-5 space-y-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "pages/ProviderDashboard.tsx:205:19:c1240054b26ec8c068b22751bfbb06f4a2fedfcc5c0bc75cd48def4eca595107:1",
									className: "flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/ProviderDashboard.tsx:206:21:2d98207b73cc711122b21ea133d0df667fd847f6b0ed27d1bf599dc88361f69c:1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												"data-inspector-source": "pages/ProviderDashboard.tsx:207:23:dd3e9f088e581453072e8ec7ebf8224097d137dda97df64275e9d06bfc2a6911:1",
												className: "font-semibold text-foreground",
												children: b.client?.full_name || (isZh ? "客户" : "Client")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
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
										"data-inspector-source": "pages/ProviderDashboard.tsx:215:21:f0495290c3dde9d4c6198a23844f9fe4c577e46b6c171ffa8011d209b1159426:1",
										className: "text-right shrink-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											"data-inspector-source": "pages/ProviderDashboard.tsx:216:23:3f7678fde7c8d4b93b346bdef2a40eb5ab75d28bb55da50449580b1a90bf241c:1",
											className: "text-lg font-bold text-foreground",
											children: [isZh ? "¥" : "$", Number(b.refund_amount || b.total_cost || 0).toFixed(2)]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											className: "mt-1",
											variant: b.refund_status === "approved" ? "default" : b.refund_status === "declined" ? "destructive" : "secondary",
											children: b.refund_status === "approved" ? isZh ? "已退款" : "Refunded" : b.refund_status === "declined" ? isZh ? "已拒绝" : "Declined" : isZh ? "待处理" : "Awaiting you"
										})]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
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
						value: "requests",
						className: "mt-4 space-y-4",
						children: bookingsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-source": "pages/ProviderDashboard.tsx:250:13:f2d19bfe435a0965ff78263811567e2e339b27a2820e4c3006da76d8a74f087a:1",
							className: "flex justify-center py-12",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" })
						}) : pendingBookings.length > 0 ? pendingBookings.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: "border-transparent card-elevated",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "p-5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "pages/ProviderDashboard.tsx:254:17:8a709cb6890d2f02dfca5567bed2582de51a5ead3461bbc9490df87b294e999e:1",
									className: "flex items-start justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/ProviderDashboard.tsx:255:19:f8c73ffb941a2e60669a0e7885be562338fe50deba6c40dbe54b167fd24bfbaa:1",
										className: "flex items-center gap-3",
										children: [b.client?.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											"data-inspector-source": "pages/ProviderDashboard.tsx:256:45:0d1cbc0641cfd325985c23725c5bfb53ef6b61817b0e357825610b67069c8386:1",
											src: b.client.avatar_url,
											alt: "",
											className: "w-12 h-12 rounded-xl object-cover"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "pages/ProviderDashboard.tsx:256:134:0d1cbc0641cfd325985c23725c5bfb53ef6b61817b0e357825610b67069c8386:1",
											className: "w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-5 w-5 text-primary" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "pages/ProviderDashboard.tsx:257:21:2d98207b73cc711122b21ea133d0df667fd847f6b0ed27d1bf599dc88361f69c:1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
													"data-inspector-source": "pages/ProviderDashboard.tsx:258:23:dd3e9f088e581453072e8ec7ebf8224097d137dda97df64275e9d06bfc2a6911:1",
													className: "font-semibold text-foreground",
													children: b.client?.full_name || (isZh ? "客户" : "Client")
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
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
										"data-inspector-source": "pages/ProviderDashboard.tsx:264:19:d1928c61c8e431fbff5e6a842e0a0fddafca110e7cb478fc2b470308abcc2baa:1",
										className: "flex flex-col items-end gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											"data-inspector-source": "pages/ProviderDashboard.tsx:265:21:e3b4fd4cc7cafe997e014f5fcc67c4eb389b483dec1df58229c67153bacaa5b5:1",
											className: "text-lg font-bold text-foreground",
											children: [isZh ? "¥" : "$", b.total_cost || 0]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "pages/ProviderDashboard.tsx:266:21:051bafc68cf6513d6ab4b12d56fc60a7b19e6e453b24cc77fd4b7ed3633875a3:1",
											className: "flex gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
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
							"data-inspector-source": "pages/ProviderDashboard.tsx:277:13:604c54e848a034199b9f66636a0ecb33284dc7971f331ad56fa81bf86b89a79d:1",
							className: "text-center py-12",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefcase, { className: "h-12 w-12 text-muted-foreground/30 mx-auto mb-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "pages/ProviderDashboard.tsx:277:121:604c54e848a034199b9f66636a0ecb33284dc7971f331ad56fa81bf86b89a79d:1",
								className: "text-muted-foreground",
								children: isZh ? "暂无待处理预约请求" : "No pending booking requests"
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "schedule",
						className: "mt-4 space-y-4",
						children: confirmedBookings.length > 0 ? confirmedBookings.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: "border-transparent card-elevated",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "p-5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "pages/ProviderDashboard.tsx:285:17:16400e4476a80c458fbfc97272bb388c06951a4fb5e4afa521d31a21a3f731a0:1",
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/ProviderDashboard.tsx:286:19:f8c73ffb941a2e60669a0e7885be562338fe50deba6c40dbe54b167fd24bfbaa:1",
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "pages/ProviderDashboard.tsx:287:21:f74a6a2e20544c397377c7b925c0d6b497157aa1437ec138b84fe938da7ccadd:1",
											className: "text-center shrink-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-source": "pages/ProviderDashboard.tsx:288:23:88f72a79f7259214df0e486e6c351074de7079ab540385fe9bc69b2c3e150892:1",
												className: "text-xs text-muted-foreground",
												children: b.appointment_date ? formatDate(b.appointment_date, isZh ? "zh-CN" : "en", { month: "short" }) : ""
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-source": "pages/ProviderDashboard.tsx:289:23:db828b71e72254b8a3584bfdd5cb7a3955e59ed2a62c85df740574a1ebfa305d:1",
												className: "text-lg font-bold text-foreground",
												children: b.appointment_date ? new Date(b.appointment_date).getDate() : ""
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "pages/ProviderDashboard.tsx:291:21:2d98207b73cc711122b21ea133d0df667fd847f6b0ed27d1bf599dc88361f69c:1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												"data-inspector-source": "pages/ProviderDashboard.tsx:292:23:dd3e9f088e581453072e8ec7ebf8224097d137dda97df64275e9d06bfc2a6911:1",
												className: "font-semibold text-foreground",
												children: b.client?.full_name || (isZh ? "客户" : "Client")
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
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
											})]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/ProviderDashboard.tsx:296:19:b74c1d730788bad270e6e9d8de3ba2e94f36724ca03634d016375df8aa562c5a:1",
										className: "flex items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												className: statusColors[b.status],
												children: b.status
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
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
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: isZh ? "每周排班" : "Weekly Schedule" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "space-y-4",
								children: [(isZh ? DAYS_ZH : DAYS_EN).map((day, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "pages/ProviderDashboard.tsx:313:17:a72f982eb3b6bd1e797d6e01d581033bb5ee36bc7d5ad26480367b47444e414a:1",
									className: "flex items-center gap-4 p-3 rounded-lg bg-muted/30",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-source": "pages/ProviderDashboard.tsx:314:19:cc1d1a6b03272e4c4e8705d6a282486c8111d60755e48c47f396653986277605:1",
										className: "w-28 shrink-0",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "pages/ProviderDashboard.tsx:315:21:3bb1a124b206a598b007a8fe16f9977b02689922b500895a59d2c42b0c32a119:1",
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
												checked: schedule[i]?.enabled || false,
												onCheckedChange: (c) => setSchedule((p) => ({
													...p,
													[i]: {
														...p[i],
														enabled: c
													}
												}))
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												"data-inspector-source": "pages/ProviderDashboard.tsx:317:23:2ea7f6d5b02c6f3e1a6fc56c0b5146f337d8f531da42e25f3c9d58b2fcec3a7a:1",
												className: "text-sm font-medium text-foreground",
												children: day
											})]
										})
									}), schedule[i]?.enabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/ProviderDashboard.tsx:321:21:3bb1a124b206a598b007a8fe16f9977b02689922b500895a59d2c42b0c32a119:1",
										className: "flex items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
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
												"data-inspector-source": "pages/ProviderDashboard.tsx:323:23:f0b8a58cec60be7416a19f451c3221bfdfba98dc5e5f6d5491f806c9d1cc76a6:1",
												className: "text-muted-foreground",
												children: isZh ? "至" : "to"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
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
										"data-inspector-source": "pages/ProviderDashboard.tsx:326:23:143181306967025fa509d9e35caaa57eb1f771fe3a5720026111f96d54a5dce3:1",
										className: "text-sm text-muted-foreground",
										children: isZh ? "不可约" : "Unavailable"
									})]
								}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
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
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: isZh ? "特殊日期设置" : "Date-Specific Overrides" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
									open: addOverrideOpen,
									onOpenChange: setAddOverrideOpen,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "outline",
											size: "sm",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }),
												" ",
												isZh ? "添加特殊日" : "Add Override"
											]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: isZh ? "添加特殊日期" : "Add Date Override" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/ProviderDashboard.tsx:343:19:a53db526e0b9c9c6cdab80e58e908b3c132193f65d4009051ca25362ae93f2c3:1",
										className: "space-y-4 mt-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-source": "pages/ProviderDashboard.tsx:344:21:35ed64158a93a450a0a62582b2807234082e29f14c8c9d9c075c179b0d1df95f:1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: isZh ? "日期" : "Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "date",
													value: newOverride.date,
													onChange: (e) => setNewOverride((p) => ({
														...p,
														date: e.target.value
													})),
													min: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
													className: "mt-1"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-source": "pages/ProviderDashboard.tsx:345:21:bfbcfd84422d73f0dcd211bb39f4cd2ecce8deb56dcb507a9115accde9e12145:1",
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
													checked: newOverride.available,
													onCheckedChange: (c) => setNewOverride((p) => ({
														...p,
														available: c
													}))
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: newOverride.available ? isZh ? "可约" : "Available" : isZh ? "不可约（休息日）" : "Unavailable (day off)" })]
											}),
											newOverride.available && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-source": "pages/ProviderDashboard.tsx:347:23:9c74adccab2762420a8519a705cca954d512d2abcde47618634ae6d6ae68a8b0:1",
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													"data-inspector-source": "pages/ProviderDashboard.tsx:348:25:cefcd33d28a9252d811165c5f0ca58bbcc2518bcee2a86320e2941dffb295013:1",
													className: "flex-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: isZh ? "开始" : "Start" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "time",
														value: newOverride.start,
														onChange: (e) => setNewOverride((p) => ({
															...p,
															start: e.target.value
														})),
														className: "mt-1"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													"data-inspector-source": "pages/ProviderDashboard.tsx:349:25:2e77c5ffe6bd13a9665fe4950b3b9a6a266bbc1eb6940f0718a1d90ad4e2cafe:1",
													className: "flex-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: isZh ? "结束" : "End" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
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
												variant: "coral",
												className: "w-full",
												onClick: handleAddOverride,
												disabled: savingOverrides || !newOverride.date,
												children: savingOverrides ? isZh ? "保存中…" : "Saving..." : isZh ? "保存设置" : "Save Override"
											})
										]
									})] })]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: dateOverrides.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-source": "pages/ProviderDashboard.tsx:359:17:17d9d6c09ea299a8a60db95751c360e55c1db680a84cb8451206c49e7d794eb0:1",
								className: "space-y-2",
								children: dateOverrides.sort((a, b) => a.date.localeCompare(b.date)).map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "pages/ProviderDashboard.tsx:361:21:b09e89aea2cced3b638ff9b0c7715e8113c600937556f99a127428a04aad6d79:1",
									className: "flex items-center justify-between p-3 rounded-lg bg-muted/30",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/ProviderDashboard.tsx:362:23:d14754f96e852e8d56eadac4faa40ceeee3677f5bfc8967503e68d9ff1211335:1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-source": "pages/ProviderDashboard.tsx:363:25:dda6ebf8e5e9fd2ca3066f963aa97e6e177d5b6fabd2960fa63654dabc8499ad:1",
											className: "text-sm font-medium text-foreground",
											children: formatDate(o.date + "T12:00:00", isZh ? "zh-CN" : "en", {
												weekday: "short",
												month: "short",
												day: "numeric",
												year: "numeric"
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-source": "pages/ProviderDashboard.tsx:364:25:a4dd7302574638a316f887bc4ad9f512eab6396dbfe36530ab17d533217d2d89:1",
											className: "text-xs text-muted-foreground",
											children: o.available ? `${o.start} – ${o.end}` : isZh ? "不可约（休息日）" : "Unavailable (day off)"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/ProviderDashboard.tsx:366:23:9c74adccab2762420a8519a705cca954d512d2abcde47618634ae6d6ae68a8b0:1",
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: o.available ? "default" : "secondary",
											children: o.available ? isZh ? "可约" : "Available" : isZh ? "休息" : "Off"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
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
								"data-inspector-source": "pages/ProviderDashboard.tsx:373:19:e9233ceb9beb72e208e5e329b7eefb74966c00de43727c216d95141066784159:1",
								className: "text-sm text-muted-foreground text-center py-4",
								children: isZh ? "暂无特殊日期。可为节假日、特殊营业时间或休息日添加设置。" : "No date overrides. Add overrides for holidays, special hours, or days off."
							}) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "payment",
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: "border-transparent card-elevated mb-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "p-5 text-sm text-muted-foreground leading-relaxed",
								children: isZh ? "客户在下单时通过平台的在线支付完成付款，款项按订单记入您的收款账户。完成服务后金额转为可提现余额，可直接在下方提交提现申请；退款与纠纷同样按订单处理。平台不收取任何佣金。" : "Clients pay online when they place the booking, and each amount is recorded to your payout account. Once you mark the service complete the amount becomes withdrawable — request a payout right below. Refunds and disputes are handled per order. The platform takes no commission."
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayoutAccountsCard, { section: "account" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "earnings",
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "pages/ProviderDashboard.tsx:392:11:9855662f17006dab969a843007d60ff44893abab812715378d8c789488f0a96a:1",
							className: "grid sm:grid-cols-2 gap-4 mb-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
								className: "border-transparent card-elevated",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "p-5 text-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										"data-inspector-source": "pages/ProviderDashboard.tsx:393:105:c36f941164306b2f52e396f6917af47c51044730aad8c42841b80f2956883eb5:0",
										className: "text-3xl font-bold text-foreground",
										children: [isZh ? "¥" : "$", totalEarnings.toFixed(2)]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
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
										"data-inspector-source": "pages/ProviderDashboard.tsx:394:105:09879b3914d6b4132ae335165660f209fac3e2ec9a3f72bf02a3734330f4448f:0",
										className: "text-3xl font-bold text-foreground",
										children: completedBookings.length
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
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
