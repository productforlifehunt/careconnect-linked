import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { t as Badge } from "./badge-B2YCAhUo.mjs";
import { t as Input } from "./input-4rcasKp7.mjs";
import { t as Textarea } from "./textarea-ZNemOC_7.mjs";
import { t as formatDate } from "./locale-DKwjQju2.mjs";
import { An as ChevronUp, C as Tag, Dt as MapPin, G as Search, Nn as ChevronDown, Pn as Check, W as Send, Zt as HeartHandshake, gn as Coins, jt as LoaderCircle, l as User, n as X, vn as Clock } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, s as DialogTrigger, t as Dialog } from "./dialog-C88F3k7U.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-SAioInf-.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { Bn as useStartConversation, Gt as useHelpTasks, Jn as useUnshareTask, Un as useTaskApplicants, fn as useMyHelpTasks, hn as useMyTaskApplications, ut as useDecideTaskApplicant, x as useApplyToSharedTask } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-HRlnwchH.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { i as useNavigate$1 } from "./router-compat-DbWBz8c6.mjs";
import { t as RequireAuth } from "./RequireAuth-C-F4CYYW.mjs";
import { t as SiteFeature } from "./SiteFeature-DJLQlP_2.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-rX0KJQzY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tasks-DWx_MgaD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TasksNeedingHelp() {
	const { toast } = useToast();
	const navigate = useNavigate$1();
	const { i18n } = useTranslation();
	const zh = i18n.language?.startsWith("zh");
	const Z = (cn, en) => zh ? cn : en;
	const startConversation = useStartConversation();
	const { isAuthenticated } = useAuth();
	const [payFilter, setPayFilter] = (0, import_react.useState)("all");
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [activeTab, setActiveTab] = (0, import_react.useState)("browse");
	const [applyOpen, setApplyOpen] = (0, import_react.useState)(null);
	const [message, setMessage] = (0, import_react.useState)("");
	const { data: tasks, isLoading } = useHelpTasks(payFilter === "all" ? void 0 : { paid: payFilter === "paid" });
	const { data: myApps } = useMyTaskApplications();
	const { data: myShared, isLoading: mySharedLoading } = useMyHelpTasks();
	const applyToTask = useApplyToSharedTask();
	const handleApply = (taskId) => {
		if (!message.trim()) return;
		applyToTask.mutate({
			taskId,
			message
		}, {
			onSuccess: () => {
				setMessage("");
				setApplyOpen(null);
				toast({ title: Z("已告诉对方你想帮忙", "Your offer to help was sent") });
			},
			onError: (err) => toast({
				title: Z("没能送出", "Couldn't send that"),
				description: err?.message || Z("请再试一次。", "Please try again."),
				variant: "destructive"
			})
		});
	};
	const appliedIds = new Set((myApps || []).map((a) => String(a.task_id)));
	const mineIds = new Set((myShared || []).map((t) => String(t.id)));
	const filtered = (tasks || []).filter((t) => !searchQuery || t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || t.description?.toLowerCase().includes(searchQuery.toLowerCase()));
	const priceLabel = (t) => t.needs_payment ? t.price ? `${Z("报酬", "Pays")} ${t.price}` : Z("有报酬", "Paid") : Z("互助（无报酬）", "Volunteer");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/div/0",
		"data-inspector-source": "pages/TasksNeedingHelp.tsx:77:5:c0fbf495ed5e47ff6b20c048c1cf29bfec208549780c5a294e2caa477f6e26b3:1",
		className: "max-w-5xl mx-auto px-4 py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/div/1",
				"data-inspector-source": "pages/TasksNeedingHelp.tsx:78:7:9962d362d2eab014c6e973f3284396fdb9bb3f9f12bc9f620bb17a6b24d78f28:1",
				className: "mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/h1/bbeebd879e1d/0",
					"data-inspector-source": "pages/TasksNeedingHelp.tsx:79:9:98c56f6b9d9d0a0960f9160acddd44cc5539ff0a3ee0ca9ee7cfe4d1c699dffb:1",
					className: "text-xl sm:text-2xl font-bold text-foreground tracking-tight",
					children: Z("需要帮手的护理任务", "Care Tasks Needing Help")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/p/bbeebd879e1d/0",
					"data-inspector-source": "pages/TasksNeedingHelp.tsx:80:9:05845d813bd77e03af0dfa9dde9b368fae8a30f13a7470c2a998145958a6cc07:1",
					className: "text-muted-foreground text-sm",
					children: Z("这些任务由家人分享出来找人帮忙，你也可以在护理圈里把自己的任务分享出来。", "Tasks families shared out for help. You can share your own from your care circle.")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/div/2",
				"data-inspector-source": "pages/TasksNeedingHelp.tsx:86:7:7d2cac37a159d66fcfcb3b72b6664f69df8351fb1017f991bafe4a5f7852b4ba:1",
				className: "flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/div/3",
					"data-inspector-source": "pages/TasksNeedingHelp.tsx:87:9:a6f33fd0c00bbc996b8e6015ebfe159b0d6de6209ef1c14d81b760a2d891950a:1",
					className: "relative flex-1 min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
						"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Search/0",
						"data-inspector-source": "pages/TasksNeedingHelp.tsx:88:11:9ee9c4903bb8ee59e12a42c45a2ce8f32dbb2cf961c8aca928455d217757032a:1",
						className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Input/a41350cff061/0",
						"data-inspector-source": "pages/TasksNeedingHelp.tsx:89:11:d4f7c24aad5a31d525ea65ead1bfb88da0c9e19532555693807d05f3682b7a5f:1",
						placeholder: Z("搜索任务……", "Search tasks..."),
						value: searchQuery,
						onChange: (e) => setSearchQuery(e.target.value),
						className: "pl-9"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Select/6b3904b6f9e8/0",
					"data-inspector-source": "pages/TasksNeedingHelp.tsx:96:9:8ed5ae5adc089868cacecf7bd2fc4b2400d75f6188f23c88711aa079dcdfcecc:1",
					value: payFilter,
					onValueChange: setPayFilter,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/SelectTrigger/0",
						"data-inspector-source": "pages/TasksNeedingHelp.tsx:97:11:f3f8b6985f559301edb0eaca377db984ecf3e2569424bb5f00f2e095f99d3fe9:1",
						className: "w-full sm:w-[170px] shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {
							"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/SelectValue/0",
							"data-inspector-source": "pages/TasksNeedingHelp.tsx:97:67:f3f8b6985f559301edb0eaca377db984ecf3e2569424bb5f00f2e095f99d3fe9:1"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
						"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/SelectContent/0",
						"data-inspector-source": "pages/TasksNeedingHelp.tsx:98:11:48459541b0a9fae8ff635dadc1db25558ed9c088f88a441faccd0af9fba4ad65:1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/SelectItem/bbeebd879e1d/0",
								"data-inspector-source": "pages/TasksNeedingHelp.tsx:99:13:90e97696d20341419e2c800bf1bff18d8680547a3c0892013ef960ae8768bc7c:1",
								value: "all",
								children: Z("全部", "All tasks")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/SelectItem/bbeebd879e1d/1",
								"data-inspector-source": "pages/TasksNeedingHelp.tsx:100:13:2a2ab7e890c164a4b3ea399be489c8f43c76b69ae04901656455f74a3e21791b:1",
								value: "paid",
								children: Z("有报酬", "Paid")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/SelectItem/bbeebd879e1d/2",
								"data-inspector-source": "pages/TasksNeedingHelp.tsx:101:13:868b57c742a97e44cd38ca6661f877d4ee1747c7f98bee4a6db086e44d7c1043:1",
								value: "free",
								children: Z("互助（无报酬）", "Volunteer")
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Tabs/3df6a2b466a7/0",
				"data-inspector-source": "pages/TasksNeedingHelp.tsx:106:7:0e5237459b3056280b30ea74791efd40b64026a9fa4a9e8258303bf924843b58:1",
				value: activeTab,
				onValueChange: setActiveTab,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/div/4",
						"data-inspector-source": "pages/TasksNeedingHelp.tsx:107:9:59d0b10996196db5d9c65aeb3213ed9bf6a7a3fdf97591845db611478e10b6a0:1",
						className: "overflow-x-auto -mx-4 px-4 scrollbar-none",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
							"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/TabsList/008c2c80a3ba/0",
							"data-inspector-source": "pages/TasksNeedingHelp.tsx:108:11:cc97ce8e35304189f166c4a3726426c61b0449995f78f1adc70e426a4068ce92:1",
							className: "w-max",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
									"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/TabsTrigger/0e922f318645/0",
									"data-inspector-source": "pages/TasksNeedingHelp.tsx:109:13:493d190f0a2274d90a87253b6c43ea3735cbd6af7da709bb34c57def7659aafd:1",
									value: "browse",
									children: [
										Z("浏览", "Browse"),
										" (",
										filtered.length,
										")"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
									"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/TabsTrigger/48aa7a124936/0",
									"data-inspector-source": "pages/TasksNeedingHelp.tsx:110:13:c718580d7abd2e5b139214f998019d171b637a42965fa2fbeb7b66ad585a080c:1",
									value: "my-offers",
									children: [
										Z("我要帮的", "My Offers"),
										" (",
										(myApps || []).length,
										")"
									]
								}),
								isAuthenticated && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
									"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/TabsTrigger/65750afd0cac/0",
									"data-inspector-source": "pages/TasksNeedingHelp.tsx:112:15:bb139b4c8fbed6616deddcbe71fb4bb069daa38b57e5a925f11364e29c2671c8:1",
									value: "my-shared",
									children: [
										Z("我分享的", "Shared by Me"),
										" (",
										(myShared || []).length,
										")"
									]
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/TabsContent/08800cc9524c/0",
						"data-inspector-source": "pages/TasksNeedingHelp.tsx:118:9:6d107a41d9ff37698c69f597b9921a191a01f42ad4a7d93019075351dd18d2b8:1",
						value: "browse",
						className: "mt-4 space-y-4",
						children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/div/5",
							"data-inspector-source": "pages/TasksNeedingHelp.tsx:120:13:7094f440d5e18ca396f051cfd9fc9436256187dac3fed295d3828eea2418ff8e:1",
							className: "flex justify-center py-16",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Loader2/0",
								"data-inspector-source": "pages/TasksNeedingHelp.tsx:120:56:7094f440d5e18ca396f051cfd9fc9436256187dac3fed295d3828eea2418ff8e:1",
								className: "h-8 w-8 animate-spin text-muted-foreground"
							})
						}) : filtered.length > 0 ? filtered.map((task) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Card/0",
							"data-inspector-source": "pages/TasksNeedingHelp.tsx:122:13:f4d550bb18adfc5c5813befd83caf570606f5f90be7f5f36adfd47b5a00c7476:1",
							className: "border-transparent card-elevated",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/CardContent/176f6de5ce63/0",
								"data-inspector-source": "pages/TasksNeedingHelp.tsx:123:15:2cf75e8f3b93e1a9e7a9c9eda9d9775eef381e83d6e1eb8d1733d70992977ecb:1",
								className: "p-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/div/6",
										"data-inspector-source": "pages/TasksNeedingHelp.tsx:124:17:b05b21a997104fd3951f3242abce19b8b4c0e97726b8df5584e1bd1fca5f096b:1",
										className: "flex items-start justify-between mb-3 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/div/7",
											"data-inspector-source": "pages/TasksNeedingHelp.tsx:125:19:3268e5f0ee526346fe9b2bd501c6ce71786ed5c128b3e6c4cde1824a0a887bf3:1",
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/div/8",
												"data-inspector-source": "pages/TasksNeedingHelp.tsx:126:21:b1facb02bab01906b8ebdc8df6c81dffda72b9af27ccfb8e0ab3e107dc6bf02b:1",
												className: "flex items-center gap-2 mb-1 flex-wrap",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
													"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/h3/455130aca66c/0",
													"data-inspector-source": "pages/TasksNeedingHelp.tsx:127:23:c45bb15a2863c2d1d02c24b0e4a69727594372f67868ea5430a687c82af4c09e:1",
													className: "font-semibold text-lg text-foreground",
													children: task.title
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
													"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Badge/6cb47716384d/0",
													"data-inspector-source": "pages/TasksNeedingHelp.tsx:128:23:2155eb3c39b3b09a4e58c84a8504b87bf0d70b1ac28433544d8472d95f88415e:1",
													variant: task.needs_payment ? "default" : "secondary",
													className: "text-xs",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, {
														"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Coins/0",
														"data-inspector-source": "pages/TasksNeedingHelp.tsx:129:25:949d87debe7c2995c2d65fae0f766180093f5849d8bb7ccf59f6ac80c028db10:1",
														className: "h-3 w-3 mr-1"
													}), priceLabel(task)]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/div/8b4a4160c5ea/0",
												"data-inspector-source": "pages/TasksNeedingHelp.tsx:132:21:0fc2602f2836e2496712d31919b36531781da1e7bb936c2dcd0b907c2a5bbc43:1",
												className: "flex flex-wrap items-center gap-3 text-sm text-muted-foreground",
												children: [
													task.poster?.full_name && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/span/aa47a818bd20/0",
														"data-inspector-source": "pages/TasksNeedingHelp.tsx:133:50:f79a866cd9ab22d94e51d74cf66abc5699e6638fea296bbabb877b2951568adb:1",
														className: "flex items-center gap-1",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, {
																"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/User/0",
																"data-inspector-source": "pages/TasksNeedingHelp.tsx:133:92:f79a866cd9ab22d94e51d74cf66abc5699e6638fea296bbabb877b2951568adb:1",
																className: "h-3 w-3"
															}),
															" ",
															task.poster.full_name
														]
													}),
													(task.location || task.poster?.location) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/span/6097e2134160/0",
														"data-inspector-source": "pages/TasksNeedingHelp.tsx:135:25:6c074cfa70b75719640a030bb56586316d64a86f3b4cfe743b2e700a99e22994:1",
														className: "flex items-center gap-1",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
																"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/MapPin/0",
																"data-inspector-source": "pages/TasksNeedingHelp.tsx:135:67:6c074cfa70b75719640a030bb56586316d64a86f3b4cfe743b2e700a99e22994:1",
																className: "h-3 w-3"
															}),
															" ",
															task.location || task.poster?.location
														]
													}),
													task.task_date && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/span/b6fbe1ca70ef/0",
														"data-inspector-source": "pages/TasksNeedingHelp.tsx:137:42:66263561952f4c052a6cb45541c8f93b9641361c99dc952b112375da4630fc60:1",
														className: "flex items-center gap-1",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
																"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Clock/0",
																"data-inspector-source": "pages/TasksNeedingHelp.tsx:137:84:66263561952f4c052a6cb45541c8f93b9641361c99dc952b112375da4630fc60:1",
																className: "h-3 w-3"
															}),
															" ",
															formatDate(task.task_date, i18n.language)
														]
													})
												]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/span/37d1ca697086/0",
											"data-inspector-source": "pages/TasksNeedingHelp.tsx:140:19:c670f5ebe66c59533f6cd406665f6562d444aafdfdf994c03217d0746ea84b97:1",
											className: "text-xs text-muted-foreground shrink-0",
											children: formatDate(task.created_at, i18n.language, {
												month: "short",
												day: "numeric"
											})
										})]
									}),
									task.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/p/87e11ac8f72e/0",
										"data-inspector-source": "pages/TasksNeedingHelp.tsx:144:38:0a269a7a7c14e4cd9ce87beb10579ae3737cffabbfd546f076aa41dc90b8faf0:1",
										className: "text-sm text-muted-foreground mb-4 line-clamp-3",
										children: task.description
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/div/9",
										"data-inspector-source": "pages/TasksNeedingHelp.tsx:145:17:7d5ed6fb24d729d39e3a7864aa871395f0656c2e001429cae3dac724ca9a1af0:1",
										className: "flex items-center justify-between gap-3 flex-wrap",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Badge/1c6fab77151e/0",
											"data-inspector-source": "pages/TasksNeedingHelp.tsx:146:19:483b048cc71902ea8cfe1927bfdd7a0618f7b3fa08db20eef65be7c1da5ce0cf:1",
											variant: task.status === "open" ? "default" : "secondary",
											children: task.status === "open" ? Z("还在找人", "Looking for help") : Z("已找到帮手", "Help found")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/div/b1bb1dc43694/0",
											"data-inspector-source": "pages/TasksNeedingHelp.tsx:149:19:b74c1d730788bad270e6e9d8de3ba2e94f36724ca03634d016375df8aa562c5a:1",
											className: "flex items-center gap-2",
											children: !isAuthenticated ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Badge/bbeebd879e1d/0",
												"data-inspector-source": "pages/TasksNeedingHelp.tsx:151:23:3e070a66a11c6444894580c72e739347080c21a59c95e9c5556e1852b951ba21:1",
												variant: "outline",
												children: Z("登录后可以帮忙", "Sign in to help")
											}) : mineIds.has(String(task.id)) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Badge/bbeebd879e1d/1",
												"data-inspector-source": "pages/TasksNeedingHelp.tsx:154:25:1c4c7f6074fdad55d3fb4f344ff7cc61c6410e7b7c1c4c2bfdda279c7dfa3100:1",
												variant: "outline",
												className: "text-muted-foreground",
												children: Z("我分享的", "Shared by you")
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Button/499fcc85c7b4/0",
												"data-inspector-source": "pages/TasksNeedingHelp.tsx:155:25:511b0a66010b97cc4e97253dd1ebf5a624cffe95e0d97d5ea8997f57a4480f8d:1",
												size: "sm",
												variant: "outline",
												onClick: () => setActiveTab("my-shared"),
												children: Z("管理", "Manage")
											})] }) : appliedIds.has(String(task.id)) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Badge/bbeebd879e1d/2",
												"data-inspector-source": "pages/TasksNeedingHelp.tsx:159:25:f56e518d9d58416d09358f7f2e8fd3b1046a9e4082f3c35497d59a20439a17cb:1",
												variant: "outline",
												className: "text-success border-success",
												children: Z("已表示要帮 ✓", "Offered ✓")
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Button/499fcc85c7b4/1",
												"data-inspector-source": "pages/TasksNeedingHelp.tsx:160:25:67731ac9be05f3ae4493214020250ae9bcb72eecd8243567a44c11f76192b337:1",
												size: "sm",
												variant: "outline",
												onClick: () => setActiveTab("my-offers"),
												children: Z("查看", "View")
											})] }) : task.status === "open" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [task.poster?.id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Button/93da0692f9ac/0",
												"data-inspector-source": "pages/TasksNeedingHelp.tsx:165:27:4a828009be824df5b03d00f75ed234df6de61f75fd919efa92da1d546e15e88d:1",
												size: "sm",
												variant: "outline",
												disabled: startConversation.isPending,
												onClick: () => startConversation.mutate(task.poster.id, {
													onSuccess: () => navigate("/inbox?tab=messages", { state: {
														targetUserId: task.poster.id,
														targetUserName: task.poster.full_name,
														targetUserAvatar: task.poster.avatar_url,
														openQuote: task.needs_payment,
														quotePrefill: {
															serviceType: task.title,
															taskId: task.id
														}
													} }),
													onError: () => navigate("/inbox?tab=messages")
												}),
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {
														"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Tag/0",
														"data-inspector-source": "pages/TasksNeedingHelp.tsx:182:29:caf59593a35d83d5f90f0a07b3b0272e0ad1025019571a2cd44f30e5339c3d69:1",
														className: "h-3 w-3 mr-1"
													}),
													" ",
													task.needs_payment ? Z("联系与报价", "Contact & Quote") : Z("联系", "Contact")
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
												"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Dialog/ee3ad3a9ca93/0",
												"data-inspector-source": "pages/TasksNeedingHelp.tsx:185:25:5745fc2db663434b44e5379a192bb3ea43e358b0be0549fe9ebf55c727a92c0d:1",
												open: applyOpen === task.id,
												onOpenChange: (open) => {
													setApplyOpen(open ? task.id : null);
													if (!open) setMessage("");
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
													"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/DialogTrigger/0",
													"data-inspector-source": "pages/TasksNeedingHelp.tsx:189:27:5739f8e624d3314af0a25ca1e01936c8403e2770be42902d00dc754e3dc8a4b9:1",
													asChild: true,
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Button/bbeebd879e1d/0",
														"data-inspector-source": "pages/TasksNeedingHelp.tsx:190:29:2dbca09d22067111c63af33870d8d151d6c2dcf4695b61ecb68d7dc225b7070d:1",
														size: "sm",
														variant: "coral",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, {
																"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Send/0",
																"data-inspector-source": "pages/TasksNeedingHelp.tsx:190:63:2dbca09d22067111c63af33870d8d151d6c2dcf4695b61ecb68d7dc225b7070d:1",
																className: "h-3 w-3 mr-1"
															}),
															" ",
															Z("我可以帮", "I can help")
														]
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
													"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/DialogContent/0",
													"data-inspector-source": "pages/TasksNeedingHelp.tsx:192:27:2b707bddcea86835ab769a517147f1695f505fcdb8a4eba8678d20e059959ad2:1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
														"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/DialogHeader/0",
														"data-inspector-source": "pages/TasksNeedingHelp.tsx:193:29:8f9c977d4799ada6a14dac323f61b43538e6ae8221a308c17ae8784d7f207bc3:1",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
															"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/DialogTitle/f948ee810f14/0",
															"data-inspector-source": "pages/TasksNeedingHelp.tsx:193:43:8f9c977d4799ada6a14dac323f61b43538e6ae8221a308c17ae8784d7f207bc3:1",
															children: [Z("帮忙：", "Help with: "), task.title]
														})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/div/10",
														"data-inspector-source": "pages/TasksNeedingHelp.tsx:194:29:f0d491be0f80de34ed869020eb2eaee745f3eddf41e8aa5f5bac8bddd05f919b:1",
														className: "space-y-4 mt-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/div/11",
															"data-inspector-source": "pages/TasksNeedingHelp.tsx:195:31:62791fa979a22458798827e25e0fd7555a05a23f216a8f7d50d2f6be8037aa97:1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
																"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Label/bbeebd879e1d/0",
																"data-inspector-source": "pages/TasksNeedingHelp.tsx:196:33:d1563db10d59e34ac70f9d6add7b0c1fb60bb17b50c5dbe7fc1e939e46c1d9ac:1",
																children: Z("留个话 *", "Your message *")
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
																"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Textarea/996dc65fba8a/0",
																"data-inspector-source": "pages/TasksNeedingHelp.tsx:197:33:c0970322512275f268e9771a31cbc27e16af839ded10948f0e2df150c29a4e4f:1",
																value: message,
																onChange: (e) => setMessage(e.target.value),
																placeholder: Z("说说你能怎么帮、什么时间方便。", "Say how you can help and when you're free."),
																rows: 5,
																className: "mt-1"
															})]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Button/a051a81ac609/0",
															"data-inspector-source": "pages/TasksNeedingHelp.tsx:205:31:8feb8aa2e43403c338aa42723e271b4b4ceae8d3eeaee90971abc5f4e0793d95:1",
															variant: "coral",
															className: "w-full",
															onClick: () => handleApply(task.id),
															disabled: applyToTask.isPending || !message.trim(),
															children: applyToTask.isPending ? Z("发送中…", "Sending...") : Z("发送", "Send")
														})]
													})]
												})]
											})] }) : null
										})]
									})
								]
							})
						}, task.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/div/12",
							"data-inspector-source": "pages/TasksNeedingHelp.tsx:223:13:7cec364c52189f872edb446a18a9aaf474663c7e3babffd4e771c6ee5e57247f:1",
							className: "text-center py-16",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartHandshake, {
								"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/HeartHandshake/0",
								"data-inspector-source": "pages/TasksNeedingHelp.tsx:224:15:332f7c55800f8447f4455c1d97998e58c70b4685405ae5050483fdb94f8937b7:1",
								className: "h-12 w-12 text-muted-foreground/30 mx-auto mb-3"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/p/bbeebd879e1d/1",
								"data-inspector-source": "pages/TasksNeedingHelp.tsx:225:15:2dea142f2fe8bb5a7e7f2c247b3ef5564bc8db325b689f19ab5d695358bd8ba4:1",
								className: "text-muted-foreground",
								children: Z("暂时没有需要帮手的任务", "No tasks need help right now")
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/TabsContent/ac9162617e6a/0",
						"data-inspector-source": "pages/TasksNeedingHelp.tsx:231:9:77f90a808bacf66ad385da483d067792b773cc5ddc0b5559514f128070651efa:1",
						value: "my-offers",
						className: "mt-4 space-y-4",
						children: (myApps || []).length > 0 ? (myApps || []).map((app) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Card/1",
							"data-inspector-source": "pages/TasksNeedingHelp.tsx:233:13:be095281b615b75a636f1c6f946fb5d71d2854eacd0e3c51a8e53c2a72f61e9f:1",
							className: "border-transparent card-elevated",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/CardContent/e98f7c0531e6/0",
								"data-inspector-source": "pages/TasksNeedingHelp.tsx:234:15:2cf75e8f3b93e1a9e7a9c9eda9d9775eef381e83d6e1eb8d1733d70992977ecb:1",
								className: "p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/div/13",
									"data-inspector-source": "pages/TasksNeedingHelp.tsx:235:17:91ec266b69abd0666fa4ccf6cbcf021aedc4c1b8ef224924fd3781935c1e94c4:1",
									className: "flex items-center justify-between mb-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/div/120099dbaf50/0",
										"data-inspector-source": "pages/TasksNeedingHelp.tsx:236:19:c9f728a842791bc673f3eea21cc2466fdcc0c68f3bf384588614aad87566b9cb:1",
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/h3/ef7034357681/0",
											"data-inspector-source": "pages/TasksNeedingHelp.tsx:237:21:1324e5e0c8b3c9abbd28e70ee3bef2c8dba7170f08cb9298405d633ba522404c:1",
											className: "font-semibold text-foreground",
											children: app.task?.title || Z("护理任务", "Care task")
										}), app.task?.location && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/p/c750f083d2d7/0",
											"data-inspector-source": "pages/TasksNeedingHelp.tsx:239:23:8013ab021dff9f69fee925e58c39e5049a284ae5f27892c2c99b8a9026370f5b:1",
											className: "text-xs text-muted-foreground flex items-center gap-1 mt-0.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
													"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/MapPin/1",
													"data-inspector-source": "pages/TasksNeedingHelp.tsx:240:25:00af55d4605289cda0731257ba1f8df74228e2d1a0d8ff13e337a870c70b2230:1",
													className: "h-3 w-3"
												}),
												" ",
												app.task.location
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Badge/d78c2c806960/0",
										"data-inspector-source": "pages/TasksNeedingHelp.tsx:244:19:2590c1e473e8c013a91d56071ec988a0f6a8dddd20bad246703f6a12822fd022:1",
										variant: app.status === "accepted" ? "default" : app.status === "rejected" ? "destructive" : "secondary",
										children: app.status === "accepted" ? Z("✓ 已接受", "✓ Accepted") : app.status === "rejected" ? Z("✗ 未选中", "✗ Not chosen") : Z("等待回复", "Waiting")
									})]
								}), app.task?.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/p/82a8cbb49a3a/0",
									"data-inspector-source": "pages/TasksNeedingHelp.tsx:250:43:1764d2b032f7b8de48a48d9670193d91fe68aaa88e0dec5f74e32143b6c06142:1",
									className: "text-sm text-muted-foreground line-clamp-2",
									children: app.task.description
								})]
							})
						}, app.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/p/bbeebd879e1d/2",
							"data-inspector-source": "pages/TasksNeedingHelp.tsx:254:13:7d1c429c7d8219e6552f825dfb55d7b9bdb6cdf27c5445ce6757fddacff727b7:1",
							className: "text-center py-16 text-muted-foreground",
							children: Z("你还没有表示要帮哪件事。", "You haven't offered to help with anything yet.")
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/TabsContent/adb117ad95b3/0",
						"data-inspector-source": "pages/TasksNeedingHelp.tsx:259:9:17e9756f24001abbaa774c13cbddf53926f5a1bcc735a63c97f3205336d83e71:1",
						value: "my-shared",
						className: "mt-4 space-y-4",
						children: mySharedLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/div/14",
							"data-inspector-source": "pages/TasksNeedingHelp.tsx:261:13:7094f440d5e18ca396f051cfd9fc9436256187dac3fed295d3828eea2418ff8e:1",
							className: "flex justify-center py-16",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/Loader2/1",
								"data-inspector-source": "pages/TasksNeedingHelp.tsx:261:56:7094f440d5e18ca396f051cfd9fc9436256187dac3fed295d3828eea2418ff8e:1",
								className: "h-8 w-8 animate-spin text-muted-foreground"
							})
						}) : (myShared || []).length > 0 ? (myShared || []).map((task) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MySharedTaskCard, {
							"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/MySharedTaskCard/0",
							"data-inspector-source": "pages/TasksNeedingHelp.tsx:263:13:e42a4fa6b84c4fc6f883715e64db9df3d4fae5cba2fb00e610ab7a4eb9390a7b:1",
							task,
							zh: !!zh
						}, task.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "pages/TasksNeedingHelp/TasksNeedingHelp/p/bbeebd879e1d/3",
							"data-inspector-source": "pages/TasksNeedingHelp.tsx:265:13:090809ad259afecc9c0fe5562fa27c266d6c2ce01523f6ee00b64639f43cc67d:1",
							className: "text-center py-16 text-muted-foreground",
							children: Z("你还没有把任务分享出去。在护理圈的任务里点「分享找帮手」。", "You haven't shared any task yet. Use \"Share for help\" on a task in your care circle.")
						})
					})
				]
			})
		]
	});
}
function MySharedTaskCard({ task, zh }) {
	const Z = (cn, en) => zh ? cn : en;
	const { toast } = useToast();
	const [expanded, setExpanded] = (0, import_react.useState)(false);
	const { data: applicants, isLoading } = useTaskApplicants(expanded ? task.id : null);
	const decide = useDecideTaskApplicant();
	const unshare = useUnshareTask();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/Card/0",
		"data-inspector-source": "pages/TasksNeedingHelp.tsx:285:5:361b72a9932b9a2e80c11375a968bc01d241b7d501547dded35951b1465bc544:1",
		className: "border-transparent card-elevated",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/CardContent/5b2ad5f45f93/0",
			"data-inspector-source": "pages/TasksNeedingHelp.tsx:286:7:8a91a7a2a472ad2d03d8514d1781716a4296d2110d401237a515c0ccdc7aaf82:1",
			className: "p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/div/0",
				"data-inspector-source": "pages/TasksNeedingHelp.tsx:287:9:022c7680dd5804e6d855e057bc6f5af8daf8e535e2ed831271ed35d696191b60:1",
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/div/1",
					"data-inspector-source": "pages/TasksNeedingHelp.tsx:288:11:021206592328ec6fcf79b0e9006ae83a4947be199e751fda6903cb59fff96bab:1",
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/h3/455130aca66c/0",
						"data-inspector-source": "pages/TasksNeedingHelp.tsx:289:13:d82930d8053a4c76e3e69cb396ed5669653d20b87e523634f575381ba1fa7b34:1",
						className: "font-semibold text-foreground",
						children: task.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/div/55e5d4dbfae1/0",
						"data-inspector-source": "pages/TasksNeedingHelp.tsx:290:13:747ef2873175b5c3c313774dd5f04c5ed986a203a0631e0f4e73daf3dc43374a:1",
						className: "flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/Badge/1c6fab77151e/0",
								"data-inspector-source": "pages/TasksNeedingHelp.tsx:291:15:bd82037ac77bb27301fa6b84898278bb90b00c8488eb1da24eafbbc5e37a4124:1",
								variant: task.status === "open" ? "default" : "secondary",
								className: "text-[10px]",
								children: task.status === "open" ? Z("还在找人", "Looking for help") : Z("已找到帮手", "Help found")
							}),
							task.needs_payment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/span/57dd326fa2d3/0",
								"data-inspector-source": "pages/TasksNeedingHelp.tsx:294:38:b9a5f85624b701005f10ef1e1226159b495ea575ba73cb8351c2932ac87db3b9:1",
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, {
										"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/Coins/0",
										"data-inspector-source": "pages/TasksNeedingHelp.tsx:294:80:b9a5f85624b701005f10ef1e1226159b495ea575ba73cb8351c2932ac87db3b9:1",
										className: "h-3 w-3"
									}),
									" ",
									task.price || Z("有报酬", "Paid")
								]
							}),
							task.location && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/span/4240b111cdff/0",
								"data-inspector-source": "pages/TasksNeedingHelp.tsx:295:33:ee37660753f4a4af6ab7e359131afe250a80cefbb79107900a97a63dffc52cdb:1",
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
										"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/MapPin/0",
										"data-inspector-source": "pages/TasksNeedingHelp.tsx:295:75:ee37660753f4a4af6ab7e359131afe250a80cefbb79107900a97a63dffc52cdb:1",
										className: "h-3 w-3"
									}),
									" ",
									task.location
								]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/div/2",
					"data-inspector-source": "pages/TasksNeedingHelp.tsx:298:11:45f7f11220a147cd4be3a2a3f2ce568b9ef47a3c66d1c5455eb910957cb6be07:1",
					className: "flex items-center gap-2 shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/Button/7a2aca28b068/0",
						"data-inspector-source": "pages/TasksNeedingHelp.tsx:299:13:7040faa6b8fa30aa1c74c883cb721ca0206ad7e905a839f35407f6e3d73918b9:1",
						size: "sm",
						variant: "outline",
						onClick: () => setExpanded((v) => !v),
						children: [expanded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, {
							"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/ChevronUp/0",
							"data-inspector-source": "pages/TasksNeedingHelp.tsx:300:27:6abc63033c6b9ae889a06856de02dbcd89909b1e1b86f3bdf447301397edc2ef:1",
							className: "h-4 w-4"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
							"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/ChevronDown/0",
							"data-inspector-source": "pages/TasksNeedingHelp.tsx:300:63:6abc63033c6b9ae889a06856de02dbcd89909b1e1b86f3bdf447301397edc2ef:1",
							className: "h-4 w-4"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/span/bbeebd879e1d/0",
							"data-inspector-source": "pages/TasksNeedingHelp.tsx:301:15:7c68b4739b5807c792b6f8b8b2677e9ebe530104d73fac87d61b2441a32e27c0:1",
							className: "ml-1",
							children: Z("想帮的人", "Helpers")
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/Button/4d945b43214c/0",
						"data-inspector-source": "pages/TasksNeedingHelp.tsx:303:13:60054442b94c42177db5b21fb03d894a904d65d6c0a0f642d1b4d56fb66f23b7:1",
						size: "sm",
						variant: "ghost",
						disabled: unshare.isPending,
						onClick: () => unshare.mutate(task.id, { onSuccess: () => toast({ title: Z("已收回分享", "No longer shared") }) }),
						children: Z("收回分享", "Stop sharing")
					})]
				})]
			}), expanded && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/div/9d8608528a2d/0",
				"data-inspector-source": "pages/TasksNeedingHelp.tsx:317:11:ba35e66f55ecbbd8b1a53570ff94111ddd6d07094389b7fea2cd16b5d2703e2b:1",
				className: "mt-4 space-y-2 border-t border-border pt-4",
				children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/div/3",
					"data-inspector-source": "pages/TasksNeedingHelp.tsx:319:15:9fe826266c3a3a716faaa4387241cdf5fcaf5fefcc746e5092582e6c77217dc9:1",
					className: "flex justify-center py-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/Loader2/0",
						"data-inspector-source": "pages/TasksNeedingHelp.tsx:319:57:9fe826266c3a3a716faaa4387241cdf5fcaf5fefcc746e5092582e6c77217dc9:1",
						className: "h-5 w-5 animate-spin text-muted-foreground"
					})
				}) : (applicants || []).length > 0 ? (applicants || []).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/div/65eb973afc0d/0",
					"data-inspector-source": "pages/TasksNeedingHelp.tsx:321:15:fde5b04e0f9fb0a26452c118c19738a8f4688b85e0027e81faf794c3db97d6a9:1",
					className: "flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/div/4",
						"data-inspector-source": "pages/TasksNeedingHelp.tsx:322:17:cb0bcb1bc216e26d01846c31a47381f2f116c1144d8e1591d24588612cb7cc2f:1",
						className: "flex items-center gap-2 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
							"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/Avatar/0",
							"data-inspector-source": "pages/TasksNeedingHelp.tsx:323:19:2af13903ac397cd1e890812298dc06e1e15ea64b733274e2caa0bb82e460e09e:1",
							className: "h-8 w-8",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
								"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/AvatarImage/0",
								"data-inspector-source": "pages/TasksNeedingHelp.tsx:324:21:2456c73385132995c67282dade68538ea891cf2478084ccdfd8b78e4e9c389e6:1",
								src: a.applicant?.avatar_url || void 0
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
								"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/AvatarFallback/7a926f9f67b7/0",
								"data-inspector-source": "pages/TasksNeedingHelp.tsx:325:21:2278a07565c2661a0f23f074b17243928e7502e55a4b041e3b5db227fc7ecca8:1",
								children: (a.applicant?.full_name || "?").slice(0, 1)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/div/5",
							"data-inspector-source": "pages/TasksNeedingHelp.tsx:327:19:c9f728a842791bc673f3eea21cc2466fdcc0c68f3bf384588614aad87566b9cb:1",
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/p/99d8238d79e0/0",
								"data-inspector-source": "pages/TasksNeedingHelp.tsx:328:21:c36d8ceb685ec73af9cf54adff0b55c3322b5c4929cb74beef5b024050dd1f42:1",
								className: "text-sm font-medium text-foreground truncate",
								children: a.applicant?.full_name || Z("用户", "User")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/p/048b69723335/0",
								"data-inspector-source": "pages/TasksNeedingHelp.tsx:329:21:46dd39a319f36ab7ac39cb34f7d5f12701c17442d90b8576fca96339c8899667:1",
								className: "text-xs text-muted-foreground",
								children: a.status === "accepted" ? Z("已接受", "Accepted") : a.status === "rejected" ? Z("未选中", "Not chosen") : Z("等待你回复", "Waiting for you")
							})]
						})]
					}), a.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/div/6",
						"data-inspector-source": "pages/TasksNeedingHelp.tsx:335:19:0e791d4d0d8c937fcea012f1fbe080582b2a083660cb89b02af12957ae86d73d:1",
						className: "flex items-center gap-2 shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/Button/372920906d56/0",
							"data-inspector-source": "pages/TasksNeedingHelp.tsx:336:21:3f8769f532823dd4e9fa3b301a3ea3b1a6f1d1667df348590bac11d136bd45cc:1",
							size: "sm",
							variant: "coral",
							disabled: decide.isPending,
							onClick: () => decide.mutate({
								id: a.id,
								status: "accepted"
							}, { onSuccess: () => toast({ title: Z("已接受这位帮手", "Helper accepted") }) }),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
								"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/Check/0",
								"data-inspector-source": "pages/TasksNeedingHelp.tsx:340:23:d270c6e48b39f51cc38a4fb69982679de990d49a713b54b4c1a3fcc7c60eefac:1",
								className: "h-3 w-3"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/Button/372920906d56/1",
							"data-inspector-source": "pages/TasksNeedingHelp.tsx:342:21:81cd8e9635e0d4691406b81469b398721ecc29053f5f02d64f28b9b8ac416672:1",
							size: "sm",
							variant: "outline",
							disabled: decide.isPending,
							onClick: () => decide.mutate({
								id: a.id,
								status: "rejected"
							}, { onSuccess: () => toast({ title: Z("已谢过这位", "Politely declined") }) }),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
								"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/X/0",
								"data-inspector-source": "pages/TasksNeedingHelp.tsx:346:23:b5d86a73733482dab9565cbea5d7c9ff4910f22a4fdba2b8cc570e88537e12ea:1",
								className: "h-3 w-3"
							})
						})]
					})]
				}, a.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-id": "pages/TasksNeedingHelp/MySharedTaskCard/p/bbeebd879e1d/0",
					"data-inspector-source": "pages/TasksNeedingHelp.tsx:352:15:8242e7746a285a32df339e4784490650232cacc2e3dac113bc68d0d14d4e5212:1",
					className: "text-sm text-muted-foreground text-center py-4",
					children: Z("还没有人表示要帮。", "Nobody has offered yet.")
				})
			})]
		})
	});
}
function RouteTasksPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFeature, {
		"data-inspector-id": "routes/tasks/RouteTasksPage/SiteFeature/0",
		"data-inspector-source": "routes/tasks.tsx:5:10:69ac9dd5cf2ecf2c81c780a9bb20c0c05cca3ab49b93b9816c7e789752579836:1",
		name: "paidCaregivers",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, {
			"data-inspector-id": "routes/tasks/RouteTasksPage/RequireAuth/0",
			"data-inspector-source": "routes/tasks.tsx:5:45:69ac9dd5cf2ecf2c81c780a9bb20c0c05cca3ab49b93b9816c7e789752579836:1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TasksNeedingHelp, {
				"data-inspector-id": "routes/tasks/RouteTasksPage/TasksNeedingHelp/0",
				"data-inspector-source": "routes/tasks.tsx:5:58:69ac9dd5cf2ecf2c81c780a9bb20c0c05cca3ab49b93b9816c7e789752579836:1"
			})
		})
	});
}
//#endregion
export { RouteTasksPage as component };
