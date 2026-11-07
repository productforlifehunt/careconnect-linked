import { s as __toESM } from "../_runtime.mjs";
import { n as cn } from "./utils-CcHv9xqZ.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-Cz5iPbNd.mjs";
import { t as Input } from "./input-DmTt3-fi.mjs";
import { t as Textarea } from "./textarea-DPamDMgK.mjs";
import { Bt as Languages, E as Square, En as CircleCheck, Hn as Bot, Kt as House, Pn as Check, Pt as ListChecks, Rn as CalendarCheck, Sn as Circle, bn as ClipboardList, it as Plus, jn as ChevronRight, jt as LoaderCircle, u as UserRound, wn as CircleQuestionMark, xt as Mic, y as Trash2, yn as Clock3 } from "../_libs/lucide-react.mjs";
import { t as Checkbox } from "./checkbox-4tVtKjWh.mjs";
import { t as instance } from "../_libs/i18next.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-HRlnwchH.mjs";
import { t as supabase } from "./client-Bxio8ppI.mjs";
import { n as useAIAssistant } from "./AIAssistantContext-D0EXt93v.mjs";
import { t as Switch } from "./switch-Coli7fra.mjs";
import { i as useNavigate$1, n as Navigate, o as useSearchParams, r as useLocation$1, t as Link$1 } from "./router-compat-3gk8yjav.mjs";
import { n as Routes, t as Route } from "./path-routes-CJPpVmKM.mjs";
import { t as ErrorBoundary } from "./ErrorBoundary-KylBmK6w.mjs";
import { A as uiText, C as saveProfile, D as submitRecord, E as startProfile, O as todaySlots, S as savePersonDetails, T as slotId, _ as localDay, a as clearDraft, b as pushPendingRecords, c as deleteRecord, d as getDraft, f as getProfile, g as isChineseLanguage, h as hourlyReminderActive, i as cachedPeople, j as yesterdayDailyLogDone, l as exportJson, m as getSettings, o as createPerson, p as getRecords, r as ESM_SPEC, s as dailyLogDone, u as fetchMyPeople, v as localizeQuestionnaire, w as saveSettings, x as saveDraft, y as missedSlots } from "./backend-BMNT7eGe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/EsmApp-CQrgowh8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** The study's own shell — no care-app menus, just the four study screens. */
function EsmShell({ children }) {
	const { pathname } = useLocation$1();
	const { i18n } = useTranslation();
	const isChinese = isChineseLanguage(i18n.language);
	const [profile, setProfile] = (0, import_react.useState)(getProfile());
	(0, import_react.useEffect)(() => {
		const refresh = () => setProfile(getProfile());
		window.addEventListener("esm-profile-changed", refresh);
		window.addEventListener("storage", refresh);
		return () => {
			window.removeEventListener("esm-profile-changed", refresh);
			window.removeEventListener("storage", refresh);
		};
	}, []);
	const tabs = [
		{
			to: "/",
			label: uiText(isChinese, "Today", "今天"),
			icon: House
		},
		{
			to: "/log",
			label: uiText(isChinese, "Log entry", "记录"),
			icon: ClipboardList
		},
		{
			to: "/entries",
			label: uiText(isChinese, "My entries", "我的记录"),
			icon: ListChecks
		},
		{
			to: "/help",
			label: uiText(isChinese, "Help", "帮助"),
			icon: CircleQuestionMark
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/esm/EsmShell.tsx:33:5:f79c83f55aad22ecaa685c972e08ae20f91aa6075dda14056d1332a866927dba:1",
		className: "flex min-h-dvh w-full flex-col overflow-x-hidden bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				"data-inspector-source": "pages/esm/EsmShell.tsx:34:7:d16a8f50f53a8ca78364c02df2f4ea7a4f911d61f53df9622914d882d8ea039d:1",
				className: "sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/esm/EsmShell.tsx:35:9:adda6f9876b8c7832bc7d3da6d9258e2b20c08ce0b24471c3ddf77aa96402802:1",
					className: "mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
						to: "/",
						className: "truncate text-sm font-semibold text-foreground",
						children: uiText(isChinese, "A Week in the Life of Dementia Caregivers Study", "失智症护理者的一周")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/esm/EsmShell.tsx:39:11:acc0190946e2848ebf0bbf9329abca73b51b870c561e8c860d4cad9d1ba770bd:1",
						className: "flex shrink-0 items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							className: "gap-1 px-2",
							onClick: () => void i18n.changeLanguage(isChinese ? "en" : "zh-CN"),
							"aria-label": uiText(isChinese, "Switch to Chinese", "切换到英文"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Languages, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-source": "pages/esm/EsmShell.tsx:48:15:08d73e339ed2b5d466b59dde28068c4cb9035a481478d5765e9d47db10159384:1",
								children: uiText(isChinese, "Chinese", "英文")
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "ghost",
							size: "sm",
							className: "max-w-32 gap-1.5 px-2",
							"aria-label": profile?.name || uiText(isChinese, "Me", "我"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
								to: "/me",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "h-5 w-5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-source": "pages/esm/EsmShell.tsx:51:72:b8ecbde41c3440ce9036cc1815bdaa5387bc49ed698d4f700e2b5bda5dfc6715:1",
									className: "truncate",
									children: profile?.name || uiText(isChinese, "Me", "我")
								})]
							})
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				"data-inspector-source": "pages/esm/EsmShell.tsx:57:7:de55d55b1ef072d2caf876ea79e6e2fe5f4143a8a60613bfbcf1abca1b0e7271:1",
				className: "flex-1 pb-20",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				"data-inspector-source": "pages/esm/EsmShell.tsx:59:7:7e60bddd2e999636b5eb5b3d2f9cdab08200e310e18c210716b584837acfc03e:1",
				className: "fixed bottom-0 z-40 w-full border-t border-border bg-background/95 backdrop-blur",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "pages/esm/EsmShell.tsx:60:9:532fb2b137d0dbc0fdfaab94feb43edad59f5c8bdb082ea401224a0a92f572fb:1",
					className: "mx-auto flex max-w-2xl",
					children: tabs.map(({ to, label, icon: Icon }) => {
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
							to,
							className: cn("flex flex-1 flex-col items-center gap-0.5 py-2 text-xs", (to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`)) ? "text-primary" : "text-muted-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" }), label]
						}, to);
					})
				})
			})
		]
	});
}
function EsmToday() {
	const navigate = useNavigate$1();
	const { i18n } = useTranslation();
	const zh = isChineseLanguage(i18n.language);
	const currentRef = (0, import_react.useRef)(null);
	const profile = getProfile();
	const settings = getSettings();
	const slots = todaySlots();
	const currentHour = (/* @__PURE__ */ new Date()).getHours();
	const eveningDone = dailyLogDone();
	const yesterdayDone = yesterdayDailyLogDone();
	const reminderActive = hourlyReminderActive(/* @__PURE__ */ new Date(), settings);
	const currentSlot = (0, import_react.useMemo)(() => slots.find((slot) => slot.hour === currentHour), [slots, currentHour]);
	const slotLabel = (slot) => zh ? `${String(slot.hour).padStart(2, "0")}:00` : slot.label;
	(0, import_react.useEffect)(() => {
		currentRef.current?.scrollIntoView({
			behavior: settings.reducedMotion ? "auto" : "smooth",
			block: "nearest",
			inline: "center"
		});
	}, [settings.reducedMotion]);
	if (!profile) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/esm/EsmToday.tsx:31:7:b4863e7338827068b23b09a835181107266db7a268fc05e2077b6490036c3235:1",
		className: "mx-auto max-w-2xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				"data-inspector-source": "pages/esm/EsmToday.tsx:32:10:e6c9bb969c8875a8b0e2c273cc9f3ab5734fc4bb12e286469045dcc5b93d0abf:1",
				className: "text-2xl font-semibold text-foreground",
				children: uiText(zh, "A Week in the Life of Dementia Caregivers Study", "失智症护理者的一周")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "pages/esm/EsmToday.tsx:33:10:0522959aabba2c9b1afb0f436bfcc15c162a479d5be6cf3a031722be845f8a5e:1",
				className: "mt-3 text-muted-foreground",
				children: uiText(zh, "Choose your caregiver role first. Your questions and daily timeline will then appear here.", "请先选择您的护理者身份，随后这里会显示相应问卷和每日时间线。")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				"data-inspector-source": "pages/esm/EsmToday.tsx:34:10:d94af72683dc8ec567de0d03988e4cc53aff818d8f50fd4a421153b57ae2538d:1",
				className: "mt-4 flex items-center gap-2 border-y border-border py-3 text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "h-4 w-4 shrink-0" }), uiText(zh, "Every question can be answered by voice.", "每道题都可以使用语音回答。")]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-5 w-full",
				size: "lg",
				onClick: () => navigate("/me?tab=screening"),
				children: uiText(zh, "Set up my profile", "设置我的资料")
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/esm/EsmToday.tsx:41:5:791e9c2e1e52d1c574cf28272fc1ff5e3ee3af60419e89742a2a07bae81d5f1d:1",
		className: "mx-auto max-w-2xl px-4 py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/esm/EsmToday.tsx:42:7:f1c23ac8307751eb2fd2e6258851462da8b25c31d9bc80106667b0d32a6898c8:1",
				className: "flex items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/esm/EsmToday.tsx:43:9:57fd4bc0f86b3b72c33eb3930baaff440e67309c73702cde2f831828cd81116c:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "pages/esm/EsmToday.tsx:44:12:6a0f8e1fee2434dc2df0a8545825480fdbcca3338d5d8f59c9190342ce5167f0:1",
						className: "text-sm text-muted-foreground",
						children: (/* @__PURE__ */ new Date()).toLocaleDateString(zh ? "zh-CN" : "en", {
							weekday: "long",
							month: "long",
							day: "numeric"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						"data-inspector-source": "pages/esm/EsmToday.tsx:45:12:327003488afb2afc268d95aa60d5c2805b62e65318d2cb8cb44cfafd56638f50:1",
						className: "text-2xl font-semibold text-foreground",
						children: uiText(zh, "Today", "今天")
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => navigate("/me?tab=screening"),
					children: profile.screeningDone ? uiText(zh, "Screening", "初始问卷") : uiText(zh, "Finish screening", "完成初始问卷")
				})]
			}),
			!profile.screeningDone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				"data-inspector-source": "pages/esm/EsmToday.tsx:51:9:90c4a85d95f9ca2d27bca18451f885f60e54660060dc62e539347c3253c7e07f:1",
				className: "mt-5 flex w-full items-center justify-between gap-3 border-y border-primary py-4 text-left",
				onClick: () => navigate("/screening?section=introduction"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					"data-inspector-source": "pages/esm/EsmToday.tsx:52:11:8324de4fc077731ac5860918b68d78dd50af4b5f6ff2d0ddf212b29da4c42b6b:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-inspector-source": "pages/esm/EsmToday.tsx:53:14:258a98f42a7cb2a8a843fb594c295b69d71165ca292784006df98c824375276e:1",
						className: "block font-semibold text-foreground",
						children: uiText(zh, "Finish your self-introduction questions", "完成个人基本信息")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-inspector-source": "pages/esm/EsmToday.tsx:54:14:d139bfc1d398170532e34bbb11a36b4d2c97878e62b438236dea4dd503cc9431:1",
						className: "mt-1 block text-sm text-muted-foreground",
						children: uiText(zh, "Your answers are saved as you go.", "填写过程中，答案会自动保存。")
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-5 w-5 shrink-0 text-primary" })]
			}),
			!yesterdayDone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/esm/EsmToday.tsx:61:9:862c09607e9f6267531342959742b35083ffe2f4a74117f1c661552e788c11c2:1",
				className: "mt-5 border-l-4 border-amber-500 bg-amber-500/5 px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "pages/esm/EsmToday.tsx:62:11:accce60c699405bef4a4ce7e6450c2b6fb375d6644162b50e764f2f0a85c7a7c:1",
						className: "font-semibold text-foreground",
						children: uiText(zh, "Yesterday’s daily care summary is incomplete", "昨天的每日照护总结尚未完成")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "pages/esm/EsmToday.tsx:63:11:a662b61bffa8b56e6a1b5b8ff85ae2a56057c5c49275dab07cd2aac919031afa:1",
						className: "mt-1 text-sm text-muted-foreground",
						children: uiText(zh, "Please complete it now. If it remains incomplete, we will remind you again at noon and 10:00 PM.", "请现在补填；若仍未完成，我们将在中午12点和晚上10点再次提醒。")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3",
						size: "sm",
						onClick: () => navigate("/log/daily?day=yesterday"),
						children: uiText(zh, "Complete yesterday’s summary", "补填昨天的总结")
					})
				]
			}),
			reminderActive && currentSlot && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/esm/EsmToday.tsx:69:9:00f781df0f75dd02b4dfbc724ebda4bd21c4c08011b56f94a679abe82f0808c3:1",
				className: "mt-5 border-l-4 border-primary bg-primary/5 px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						"data-inspector-source": "pages/esm/EsmToday.tsx:70:13:ecb4fa1db25276981107585b0098d0263aba2b753323b9ea8d93d90e8dbd5807:1",
						className: "font-semibold text-foreground",
						children: [
							uiText(zh, "Now", "现在"),
							" · ",
							slotLabel(currentSlot)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "pages/esm/EsmToday.tsx:71:12:3d1e7eac2b34fd7750be1f5dfcef17c425b9e29e60d2c053dfa2c066b55041b8:1",
						className: "mt-1 text-sm text-muted-foreground",
						children: currentSlot.count ? uiText(zh, `${currentSlot.count} recorded. Add another event if needed.`, `已记录 ${currentSlot.count} 条；如有需要可继续添加。`) : uiText(zh, "No care event recorded yet.", "尚未记录照护事件。")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3",
						size: "sm",
						onClick: () => navigate(`/log/hourly?slot=${currentSlot.id}`),
						children: uiText(zh, "Log this hour", "记录这个小时")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"data-inspector-source": "pages/esm/EsmToday.tsx:76:7:478ee22163f50899117445e2102793734c74afc39d0a66cf0850e3729819fca4:1",
				className: "mt-7",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "pages/esm/EsmToday.tsx:77:9:ca53e59c11bbbf9b82ba6f96b9457b02613947f59bb751226b2612b129fc7d61:1",
					className: "flex items-center justify-between gap-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/esm/EsmToday.tsx:78:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							"data-inspector-source": "pages/esm/EsmToday.tsx:79:14:d4f11b94be0c1f11e765011fee1655b92ade51e9f9b2fb7455fcfb4869781413:1",
							className: "text-lg font-semibold text-foreground",
							children: uiText(zh, "24-hour timeline", "全天时间线")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "pages/esm/EsmToday.tsx:80:14:bd10d55db2f04c81f65fdbad861bee6ef93d95d860b5e01564555f7916c2ac1e:1",
							className: "text-sm text-muted-foreground",
							children: uiText(zh, "Tap any hour to add an event. Multiple entries are allowed.", "点击任意小时添加照护事件；同一小时可以记录多条。")
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "pages/esm/EsmToday.tsx:83:9:c73c041f62df362a426705fbf9e491157831c413f34eda13c0f1620b25fd0f23:1",
					className: "-mx-4 mt-4 overflow-x-auto px-4 pb-3 scrollbar-none",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "pages/esm/EsmToday.tsx:84:11:677501926adbe13656cc0e0ced86c2d7b194dfcd62d59cf5d09c9a051d3b67ea:1",
						className: "flex w-max gap-2",
						children: slots.map((slot) => {
							const current = slot.hour === currentHour;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								ref: current ? currentRef : void 0,
								variant: "outline",
								onClick: () => navigate(`/log/hourly?slot=${slot.id}`),
								className: cn("h-24 w-24 shrink-0 flex-col gap-1 border-2", current && "border-primary bg-primary/10 text-foreground", slot.done && !current && "border-success/60 bg-success/5"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-source": "pages/esm/EsmToday.tsx:99:20:909d0e027a95a038bbdae453fcb926c9c944a0f96700308658aa7500f47f90b7:1",
										className: "text-sm font-semibold",
										children: slotLabel(slot)
									}),
									slot.done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4 text-success" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "h-4 w-4 text-muted-foreground" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-source": "pages/esm/EsmToday.tsx:101:20:07a70acabe1dff2bcbd04973809e4d8af307a9e15f809d16d328a684836805d1:1",
										className: "text-xs font-normal text-muted-foreground",
										children: slot.count ? uiText(zh, `${slot.count} recorded`, `已记录 ${slot.count} 条`) : uiText(zh, "Not recorded", "未记录")
									})
								]
							}, slot.id);
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				"data-inspector-source": "pages/esm/EsmToday.tsx:109:7:0cad58fe543f96efc03aa76d18e63f9055e991124b345838020955a1b9d8f464:1",
				className: "mt-6 border-y border-border py-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/esm/EsmToday.tsx:110:9:7b70c99e2309050709ceee642c05a3d57e178ed1010bfb7a4a831b1962f1e2ce:1",
					className: "flex items-center justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/esm/EsmToday.tsx:111:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							"data-inspector-source": "pages/esm/EsmToday.tsx:112:14:c7c35719eb61b3fe9eb86e6c52e9d5e578676c40edcf66c81c17ac0c8bcd852a:1",
							className: "font-semibold text-foreground",
							children: uiText(zh, "Daily care summary", "每日照护总结")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "pages/esm/EsmToday.tsx:113:13:f16beb47123514a51ae2b3c15bbde7afa7898d052106330c8c0ca8839c9f347f:1",
							className: "mt-1 text-sm text-muted-foreground",
							children: eveningDone ? uiText(zh, "Today’s summary is recorded.", "今天的总结已记录。") : currentHour >= 22 ? uiText(zh, "Please complete today’s daily care summary now.", "请现在完成今天的每日照护总结。") : uiText(zh, "Complete this at 10:00 PM after the day’s care events.", "请于晚上10点在当天照护活动结束后填写。")
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => navigate("/log/daily"),
						children: eveningDone ? uiText(zh, "View", "查看") : uiText(zh, "Log", "记录")
					})]
				})
			})
		]
	});
}
/**
* Voice answering for the ESM survey.
*
* Records microphone audio with the Web Audio API, encodes a complete 16 kHz
* mono WAV (so every browser, including iOS Safari, produces a decodable file),
* and sends it to the `esm-transcribe` function for a transcript.
*/
var voiceText = (english, chinese) => instance.language?.startsWith("zh") ? chinese : english;
function encodeWav(chunks, sampleRate, target = 16e3) {
	const total = chunks.reduce((n, c) => n + c.length, 0);
	const merged = new Float32Array(total);
	let at = 0;
	for (const c of chunks) {
		merged.set(c, at);
		at += c.length;
	}
	const ratio = Math.max(1, Math.round(sampleRate / target));
	const outLength = Math.floor(merged.length / ratio);
	const samples = new Int16Array(outLength);
	for (let i = 0; i < outLength; i++) {
		let sum = 0;
		for (let j = 0; j < ratio; j++) sum += merged[i * ratio + j] || 0;
		const v = Math.max(-1, Math.min(1, sum / ratio));
		samples[i] = v < 0 ? v * 32768 : v * 32767;
	}
	const outRate = Math.round(sampleRate / ratio);
	const buffer = /* @__PURE__ */ new ArrayBuffer(44 + samples.length * 2);
	const view = new DataView(buffer);
	const str = (offset, s) => {
		for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
	};
	str(0, "RIFF");
	view.setUint32(4, 36 + samples.length * 2, true);
	str(8, "WAVE");
	str(12, "fmt ");
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, 1, true);
	view.setUint32(24, outRate, true);
	view.setUint32(28, outRate * 2, true);
	view.setUint16(32, 2, true);
	view.setUint16(34, 16, true);
	str(36, "data");
	view.setUint32(40, samples.length * 2, true);
	new Int16Array(buffer, 44).set(samples);
	return new Blob([buffer], { type: "audio/wav" });
}
function useVoiceRecorder() {
	const [isRecording, setIsRecording] = (0, import_react.useState)(false);
	const [isTranscribing, setIsTranscribing] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const state = (0, import_react.useRef)({ chunks: [] });
	const teardown = (0, import_react.useCallback)(() => {
		const s = state.current;
		try {
			s.node?.disconnect();
			s.source?.disconnect();
			s.stream?.getTracks().forEach((t) => t.stop());
			s.ctx?.close();
		} catch {}
		state.current = { chunks: [] };
		setIsRecording(false);
	}, []);
	return {
		isRecording,
		isTranscribing,
		error,
		start: (0, import_react.useCallback)(async () => {
			setError(null);
			let stream;
			try {
				stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			} catch {
				setError(voiceText("Microphone access is needed to answer by voice.", "使用语音回答需要开启麦克风权限。"));
				return;
			}
			const ctx = new AudioContext();
			const source = ctx.createMediaStreamSource(stream);
			const node = ctx.createScriptProcessor(4096, 1, 1);
			const chunks = [];
			node.onaudioprocess = (e) => chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
			source.connect(node);
			node.connect(ctx.destination);
			state.current = {
				stream,
				ctx,
				node,
				source,
				chunks
			};
			setIsRecording(true);
		}, []),
		stop: (0, import_react.useCallback)(async () => {
			const s = state.current;
			if (!s.ctx) return null;
			const sampleRate = s.ctx.sampleRate;
			const chunks = s.chunks;
			teardown();
			const blob = encodeWav(chunks, sampleRate);
			if (blob.size < 2048) {
				setError(voiceText("That recording was empty — please try again.", "录音内容为空，请重试。"));
				return null;
			}
			setIsTranscribing(true);
			try {
				const form = new FormData();
				form.append("file", blob, "recording.wav");
				const { data, error: fnError } = await supabase.functions.invoke("esm-transcribe", { body: form });
				if (fnError) {
					setError(voiceText("Could not turn that recording into text. Please try again.", "无法将录音转成文字，请重试。"));
					return null;
				}
				const text = data?.text?.trim();
				if (!text) {
					setError(voiceText("Nothing was recognised — please try again.", "没有识别到内容，请重试。"));
					return null;
				}
				return text;
			} finally {
				setIsTranscribing(false);
			}
		}, [teardown]),
		cancel: teardown
	};
}
var NUMBER_WORDS = {
	zero: 0,
	one: 1,
	two: 2,
	three: 3,
	four: 4,
	five: 5,
	six: 6,
	seven: 7,
	eight: 8,
	nine: 9,
	ten: 10,
	eleven: 11,
	twelve: 12,
	thirteen: 13,
	fourteen: 14,
	fifteen: 15,
	twenty: 20,
	thirty: 30,
	forty: 40,
	fifty: 50,
	sixty: 60,
	ninety: 90
};
var CHINESE_NUMBERS = {
	零: 0,
	一: 1,
	二: 2,
	两: 2,
	三: 3,
	四: 4,
	五: 5,
	六: 6,
	七: 7,
	八: 8,
	九: 9,
	十: 10
};
var norm = (s) => s.toLowerCase().replace(/[^a-z0-9\u3400-\u9fff\s.-]/g, " ").replace(/\s+/g, " ").trim();
/** Pull a number out of speech, handling "minus two", "negative 3", "five". */
function parseSpokenNumber(transcript) {
	const t = norm(transcript);
	const negative = /\b(minus|negative)\b/.test(t);
	const digits = t.match(/-?\d+(\.\d+)?/);
	if (digits) {
		const n = parseFloat(digits[0]);
		return negative ? -Math.abs(n) : n;
	}
	for (const [word, value] of Object.entries(NUMBER_WORDS)) if (new RegExp(`\\b${word}\\b`).test(t)) return negative ? -value : value;
	for (const [word, value] of Object.entries(CHINESE_NUMBERS)) if (t.includes(word)) return /负/.test(t) ? -value : value;
	return null;
}
/** Yes / no from speech. */
function parseSpokenYesNo(transcript) {
	const t = norm(transcript);
	if (/(不是|没有|并非|否|错误)/.test(t)) return "no";
	if (/(是的|有|正确|对)/.test(t)) return "yes";
	if (/\b(no|nope|none|negative|didn t|did not|never)\b/.test(t)) return "no";
	if (/\b(yes|yeah|yep|yup|correct|true|it did|there was)\b/.test(t)) return "yes";
	return null;
}
/**
* Match speech to one of the offered options by counting shared words, with an
* exact / substring match winning outright.
*/
function matchSpokenOption(transcript, options) {
	const t = norm(transcript);
	if (!t) return null;
	let best = null;
	for (const option of options) {
		const candidates = [
			option.label,
			option.value,
			...option.aliases ?? []
		].map(norm);
		let score = 0;
		for (const candidate of candidates) {
			if (!candidate) continue;
			if (t === candidate) score = Math.max(score, 1e3);
			else if (t.includes(candidate)) score = Math.max(score, 500 + candidate.length);
			else {
				const words = candidate.split(" ").filter((w) => w.length > 2);
				const hits = words.filter((w) => t.includes(w)).length;
				if (hits) score = Math.max(score, hits * 10 + hits / Math.max(1, words.length));
			}
		}
		if (score > 0 && (!best || score > best.score)) best = {
			option,
			score
		};
	}
	return best?.option ?? null;
}
/** Match speech to every option it mentions (for multi-select questions). */
function matchSpokenOptions(transcript, options) {
	const parts = transcript.split(/,| and | then |;|\.|、/).map((p) => p.trim()).filter(Boolean);
	const picked = /* @__PURE__ */ new Map();
	for (const part of parts) {
		const hit = matchSpokenOption(part, options);
		if (hit) picked.set(hit.value, hit);
	}
	return [...picked.values()];
}
/** One microphone button: tap to record, tap again to stop and fill the answer. */
function VoiceAnswerButton({ onTranscript, label, className }) {
	const rec = useVoiceRecorder();
	const { i18n } = useTranslation();
	const isChinese = isChineseLanguage(i18n.language);
	const accessibleLabel = label ?? uiText(isChinese, "Answer by voice", "使用语音回答");
	const toggle = async () => {
		if (rec.isRecording) {
			const text = await rec.stop();
			if (text) onTranscript(text);
		} else await rec.start();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/esm/VoiceAnswerButton.tsx:32:5:d185b7ea08a27d114973865d777eec476d3b1fed8b677c3089b99e16a14e11d6:1",
		className: cn("flex flex-col items-end gap-1", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			size: "sm",
			variant: rec.isRecording ? "destructive" : "secondary",
			onClick: toggle,
			disabled: rec.isTranscribing,
			"aria-label": rec.isRecording ? uiText(isChinese, "Stop recording", "停止录音") : accessibleLabel,
			children: [rec.isTranscribing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : rec.isRecording ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"data-inspector-source": "components/esm/VoiceAnswerButton.tsx:48:9:fe08c75a3b98e3c3e2b46c0f4382bfd79af3e565a01fd46c05038af2596a9697:1",
				className: "ml-1 hidden sm:inline",
				children: rec.isTranscribing ? uiText(isChinese, "Listening…", "识别中…") : rec.isRecording ? uiText(isChinese, "Stop", "停止") : uiText(isChinese, "Speak", "语音")
			})]
		}), rec.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			"data-inspector-source": "components/esm/VoiceAnswerButton.tsx:52:21:c01ad76c68d206abcf6598ad7b0988ddf91ffc2f656b66e5dd3b61b12fbddc57:1",
			className: "text-xs text-destructive max-w-[16rem] text-right",
			children: rec.error
		})]
	});
}
/**
* The four instruments participants fill in, built straight from the study's
* item bank (`spec.generated.ts`) so every question keeps its exact wording,
* order, options and storage column.
*
* Answer keys are the storage keys: `c318_a01` is written to column a01 of the
* screening table, and nothing in between needs a translation table.
*/
var TITLE_CASE = (heading) => heading.replace(/^(\d+(?:\.\d+)*)\s+/, "").replace(/\b([A-Z]{2,})\b(?![a-z])/g, (word) => word.length <= 5 && /^(NPI|ADKS|DAS|SSCQ|MSPSS|ADL|IADL|MBP|CDR|Q)$/.test(word) ? word : word.charAt(0) + word.slice(1).toLowerCase());
function scaleOf(item) {
	if (!item.scale) return void 0;
	const [minLabel, maxLabel] = (item.scale.labels || "").replace(/^\s*|\s*$/g, "").split(/\s+to\s+/i);
	return {
		min: item.scale.min,
		max: item.scale.max,
		minLabel: minLabel?.trim() || String(item.scale.min),
		maxLabel: maxLabel?.replace(/\).*$/s, "").trim() || String(item.scale.max)
	};
}
/** Options whose label starts with "Other" — used to reveal the detail box. */
var otherValues = (parent) => (parent?.options ?? []).filter((o) => /^other/i.test(o.label)).map((o) => o.value);
var byId = new Map(ESM_SPEC.map((item) => [item.id, item]));
/** Hint shown under the weekly care hours questions. */
var HOURS_HELP = "If you provide round-the-clock or almost round-the-clock care, enter 24 × 7 = 168. If you only care during the day, or for a certain number of hours a day, enter an approximate daily number × 7.";
function toQuestion(item) {
	const type = item.type === "datetime" ? "datetime" : item.type === "date" ? "text" : item.type;
	const question = {
		id: item.id,
		code: item.code || void 0,
		text: item.label,
		help: item.help,
		type,
		options: item.options,
		scale: scaleOf(item)
	};
	if (/\(optional\)/i.test(item.label) || item.otherFor) question.optional = true;
	if (item.id === "c319_a26") {
		question.custom = "people";
		question.optional = true;
		question.text = "Who was involved?";
		question.help = "Add the people who took part. Each person is saved once and can be picked again in later entries.";
	}
	if (item.id === "c318_a10" || item.id === "c318_a140") question.help = HOURS_HELP;
	if (item.id === "c319_a03") {
		question.showIf = {
			id: "c319_a01",
			equals: ["b02"]
		};
		question.optional = true;
	}
	if (/^c318_a(?:29|30|32|33|35|36|38|39|41|42|44|45|47|48|50|51|53|54|56|57|59|60|62|63)$/.test(item.id)) {
		const column = Number(item.column.slice(1));
		const presenceColumn = column - (column - 28) % 3;
		question.showIf = {
			id: `c318_a${String(presenceColumn).padStart(2, "0")}`,
			equals: ["b01"]
		};
	}
	if (item.otherFor) {
		const values = otherValues(byId.get(item.otherFor));
		if (values.length) question.showIf = {
			id: item.otherFor,
			equals: values
		};
	}
	return question;
}
/** Groups the given items into survey pages, keeping the document's order. */
function groupsOf(items) {
	const groups = [];
	for (const item of items) {
		const heading = item.block || item.group;
		const code = (heading.match(/^\d+(?:\.\d+)*/) || [""])[0];
		const last = groups[groups.length - 1];
		if (!last || last.id !== heading) groups.push({
			id: heading,
			code,
			title: TITLE_CASE(heading),
			questions: []
		});
		groups[groups.length - 1].questions.push(toQuestion(item));
	}
	return groups;
}
var startsWith = (item, prefix) => item.code.startsWith(prefix);
/** Columns a02–a05 of the hourly table are filled in by the app, not typed. */
var HIDDEN = /* @__PURE__ */ new Set(["c319_a02"]);
var screeningItems = ESM_SPEC.filter((i) => i.cct === "318");
var sharedInstrumentItems = screeningItems.filter((i) => startsWith(i, "1.7"));
var primaryScreening = {
	id: "esm_primary_screening",
	title: "Primary caregiver entry survey",
	intro: "This one-time survey sets the baseline for your week. Every question can be answered by voice — tap the microphone.",
	groups: groupsOf(screeningItems.filter((i) => startsWith(i, "1.")))
};
var otherScreening = {
	id: "esm_other_screening",
	title: "Secondary caregiver entry survey",
	intro: "This one-time survey is for secondary caregivers who help alongside the primary caregiver. Every question can be answered by voice.",
	groups: groupsOf([...screeningItems.filter((i) => startsWith(i, "2.")), ...sharedInstrumentItems])
};
var hourlyLog = {
	id: "esm_hourly_log",
	title: "Hourly log",
	intro: "Tell us about this hour: what happened, who was involved, what was hard.",
	groups: groupsOf(ESM_SPEC.filter((i) => i.cct === "319" && !HIDDEN.has(i.id)))
};
var dailyLog = {
	id: "esm_daily_log",
	title: "End-of-day log",
	intro: "Close the day: anything you did not log, and how today felt overall.",
	groups: groupsOf(ESM_SPEC.filter((i) => i.cct === "317"))
};
/**
* Optional details about a person named in an hourly log: the 2.1 questions
* (CCT318 a134–a143), saved into a new CCT318 row linked to the person by REL321.
*/
var personDetailQuestions = screeningItems.filter((i) => startsWith(i, "2.1")).map((i) => ({
	...toQuestion(i),
	optional: true
}));
byId.get("c319_a04")?.options?.map((o) => ({
	value: o.value,
	label: o.label
}));
/** Picks the people involved in this hour; new people are saved by name, details are optional. */
function PeopleAnswer({ value, onChange }) {
	const [people, setPeople] = (0, import_react.useState)(() => cachedPeople());
	const [adding, setAdding] = (0, import_react.useState)(false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [detailsFor, setDetailsFor] = (0, import_react.useState)(null);
	const [showDetails, setShowDetails] = (0, import_react.useState)(false);
	const [details, setDetails] = (0, import_react.useState)({});
	const { i18n } = useTranslation();
	const zh = isChineseLanguage(i18n.language);
	(0, import_react.useEffect)(() => {
		fetchMyPeople().then(setPeople).catch(() => void 0);
	}, []);
	const toggle = (id) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
	const add = async () => {
		if (!name.trim()) {
			toast.error(uiText(zh, "Give this person a name first.", "请先填写这个人的姓名。"));
			return;
		}
		setSaving(true);
		try {
			const person = await createPerson(name.trim());
			setPeople((prev) => [person, ...prev]);
			onChange([...value, person.id]);
			setName("");
			setAdding(false);
			setDetailsFor(person);
			setShowDetails(false);
			setDetails({});
			toast.success(uiText(zh, `${person.name} added.`, `已添加 ${person.name}。`));
		} catch (err) {
			toast.error(zh ? "无法保存此人，请重试。" : err instanceof Error ? err.message : "Could not save this person.");
		} finally {
			setSaving(false);
		}
	};
	const saveDetails = async () => {
		if (!detailsFor) return;
		setSaving(true);
		try {
			await savePersonDetails(detailsFor.id, details);
			toast.success(uiText(zh, `Details for ${detailsFor.name} saved.`, `${detailsFor.name} 的资料已保存。`));
			setDetailsFor(null);
		} catch (err) {
			toast.error(zh ? "无法保存这些资料，请重试。" : err instanceof Error ? err.message : "Could not save these details.");
		} finally {
			setSaving(false);
		}
	};
	const choices = [{
		id: "just_me",
		name: uiText(zh, "Just me", "只有我")
	}, ...people];
	const localizedDetails = localizeQuestionnaire({
		id: "person",
		title: "",
		groups: [{
			id: "person",
			title: "",
			questions: personDetailQuestions
		}]
	}, zh).groups[0].questions;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/esm/PeopleAnswer.tsx:87:5:2b69ab864b367220d20e2579d6d6e037a90e8f50bc30ed5d9cfd4ac43c641459:1",
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "components/esm/PeopleAnswer.tsx:88:7:5ce69249734d8d80e1b9cb6987019d142fcc236f59878d921f478730a7559662:1",
				className: "grid gap-2 sm:grid-cols-2",
				children: choices.map((person) => {
					const selected = value.includes(person.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						"data-inspector-source": "components/esm/PeopleAnswer.tsx:92:13:a0ae5149cc0ad9bfdab5a621ba63eb688e0bc7d696d9665b6dc68b4978db857f:1",
						className: cn("flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm", selected ? "border-primary bg-primary/5" : "border-border"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							checked: selected,
							onCheckedChange: () => toggle(person.id)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-source": "components/esm/PeopleAnswer.tsx:100:15:6ffd7c5f76a7c2e3fffc7c33910e2bbbb02b57212704d0fa06479e1de62a7492:1",
							className: "leading-snug",
							children: person.name
						})]
					}, person.id);
				})
			}),
			detailsFor && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "components/esm/PeopleAnswer.tsx:107:9:ece5bf7294c0bc33cce95942f0b4683e2e2e937ffbc4f5b9d712c200ffc79032:1",
				className: "space-y-3 rounded-md border border-border p-3",
				children: !showDetails ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "components/esm/PeopleAnswer.tsx:110:15:fbf42ea67ce04fc0b838c65df94854955a59bc6bd3fbdca95044715fc9865ca9:1",
					className: "text-sm",
					children: uiText(zh, `Would you like to add a few details about ${detailsFor.name}? This is optional — you can skip it.`, `是否补充一些关于 ${detailsFor.name} 的资料？这是选填内容，可以跳过。`)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/esm/PeopleAnswer.tsx:113:15:47f1a980953b38780719b95e8633da0f366d4740a1b0ed360c91dd050ddf7218:1",
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: () => setShowDetails(true),
						children: uiText(zh, "Add details", "补充资料")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => setDetailsFor(null),
						children: uiText(zh, "Skip", "跳过")
					})]
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/esm/PeopleAnswer.tsx:124:16:bf3603c5e86df2d59911e7d52f85e8d3f358b6601eb9630226e90b3987ba3b91:1",
						className: "text-sm font-medium",
						children: uiText(zh, `About ${detailsFor.name} (all optional)`, `关于 ${detailsFor.name}（全部选填）`)
					}),
					localizedDetails.filter((q) => !q.showIf || q.showIf.equals.includes(String(details[q.showIf.id] ?? ""))).map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/esm/PeopleAnswer.tsx:128:19:a9cf5bd41c1b831c53538236996fc0a25234574e252089ef6feab38ead785654:1",
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "components/esm/PeopleAnswer.tsx:129:22:997cb241c4f4a91fb797a072b7beb550201d637472f5d5b50a0302f16003f0e2:1",
							className: "text-sm",
							children: q.text
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuestionField, {
							question: q,
							value: details[q.id],
							onChange: (v) => setDetails((d) => ({
								...d,
								[q.id]: v
							}))
						})]
					}, q.id)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/esm/PeopleAnswer.tsx:137:15:47f1a980953b38780719b95e8633da0f366d4740a1b0ed360c91dd050ddf7218:1",
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: saveDetails,
							disabled: saving,
							children: saving ? uiText(zh, "Saving…", "保存中…") : uiText(zh, "Save details", "保存资料")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => setDetailsFor(null),
							disabled: saving,
							children: uiText(zh, "Later", "稍后")
						})]
					})
				] })
			}),
			adding ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/esm/PeopleAnswer.tsx:151:9:f609a2f5db8fd052d88706429e471739bfdb9167993b42a18457a5fbac9444da:1",
				className: "space-y-2 rounded-md border border-border p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/esm/PeopleAnswer.tsx:152:11:3f9900155b9635e4cbcd3bd763bae7c2b90165b4f1b83fed4d27f4715acbdd41:1",
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: uiText(zh, "Name", "姓名"),
						value: name,
						onChange: (e) => setName(e.target.value)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoiceAnswerButton, { onTranscript: (text) => setName(text) })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/esm/PeopleAnswer.tsx:156:11:399695daa0d3e9f56cad751c79ccb0dea05106812f8a4c18a0a193723df16599:1",
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: add,
						disabled: saving,
						children: saving ? uiText(zh, "Saving…", "保存中…") : uiText(zh, "Save person", "保存人员")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => setAdding(false),
						disabled: saving,
						children: uiText(zh, "Cancel", "取消")
					})]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "outline",
				onClick: () => setAdding(true),
				children: uiText(zh, "Add someone", "添加人员")
			})
		]
	});
}
function QuestionField({ question, value, onChange, extraOptions }) {
	const { i18n } = useTranslation();
	const isChinese = isChineseLanguage(i18n.language);
	const [heard, setHeard] = (0, import_react.useState)(null);
	const [unmatched, setUnmatched] = (0, import_react.useState)(false);
	const options = [...question.options ?? [], ...extraOptions ?? []];
	const yesNoOptions = [{
		value: "yes",
		label: uiText(isChinese, "Yes", "是")
	}, {
		value: "no",
		label: uiText(isChinese, "No", "否")
	}];
	const scale = question.scale;
	const handleTranscript = (text) => {
		setHeard(text);
		setUnmatched(false);
		switch (question.type) {
			case "text":
			case "longtext":
				onChange(text);
				return;
			case "number": {
				const n = parseSpokenNumber(text);
				if (n === null) setUnmatched(true);
				else onChange(n);
				return;
			}
			case "yesno": {
				const yn = parseSpokenYesNo(text);
				if (!yn) setUnmatched(true);
				else onChange(yn);
				return;
			}
			case "single": {
				const hit = matchSpokenOption(text, options);
				if (!hit) setUnmatched(true);
				else onChange(hit.value);
				return;
			}
			case "multi": {
				const hits = matchSpokenOptions(text, options);
				if (!hits.length) setUnmatched(true);
				else onChange(hits.map((h) => h.value));
				return;
			}
			case "scale": {
				if (!scale) return;
				const n = parseSpokenNumber(text);
				if (n !== null && n >= scale.min && n <= scale.max) {
					onChange(n);
					return;
				}
				const hit = matchSpokenOption(text, [
					{
						value: String(scale.min),
						label: scale.minLabel
					},
					{
						value: String(scale.max),
						label: scale.maxLabel
					},
					...Object.entries(scale.pointLabels ?? {}).map(([k, label]) => ({
						value: k,
						label
					}))
				]);
				if (hit) onChange(Number(hit.value));
				else setUnmatched(true);
				return;
			}
		}
	};
	const points = scale ? Array.from({ length: scale.max - scale.min + 1 }, (_, i) => scale.min + i) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/esm/QuestionField.tsx:97:5:ac6a80ab157a9076680fbfc68b3b13cf077be78ce4e2720744855999c135888c:1",
		id: `esm-q-${question.id}`,
		className: "rounded-lg border border-border bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/esm/QuestionField.tsx:98:7:701670d2585b352f3c41fd66e331fc6dda51c76e6894f52850817f6000758a55:1",
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/esm/QuestionField.tsx:99:9:ad6704f0e73e2aaf5297b25ad967181462ad8d1550149ddfe9e7f973738162c1:1",
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						"data-inspector-source": "components/esm/QuestionField.tsx:100:11:f327bf67967a4644f60784e32e821ac9000b62a71894a0c4ff7e673004f465d3:1",
						className: "text-base font-medium leading-snug text-foreground",
						children: [question.text, question.optional && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-source": "components/esm/QuestionField.tsx:102:36:9c3f4d62b2b396fa555fd0351e9b08366a247e4f032bb44d344266fb8574ee00:1",
							className: "ml-1 text-xs text-muted-foreground",
							children: uiText(isChinese, "(optional)", "（选填）")
						})]
					}), question.help && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/esm/QuestionField.tsx:104:29:2b1115446f9d1ebfb9814328ae85ac45baae0c48b3f67050c6289636966329bf:1",
						className: "mt-1 text-sm text-muted-foreground",
						children: question.help
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoiceAnswerButton, { onTranscript: handleTranscript })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/esm/QuestionField.tsx:109:7:d0277780b3a589de175b322aba4fe9f96eefe564da9707b58185c0f6a01df673:1",
				className: "mt-3",
				children: [
					question.custom === "people" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PeopleAnswer, {
						value: Array.isArray(value) ? value : [],
						onChange: (people) => onChange(people)
					}),
					question.type === "datetime" && !question.custom && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "datetime-local",
						className: "max-w-[16rem]",
						value: typeof value === "string" ? value : "",
						onChange: (e) => onChange(e.target.value)
					}),
					question.type === "text" && !question.custom && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: typeof value === "string" ? value : "",
						onChange: (e) => onChange(e.target.value),
						placeholder: uiText(isChinese, "Type or speak your answer", "请输入或使用语音回答")
					}),
					question.type === "longtext" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						rows: 4,
						value: typeof value === "string" ? value : "",
						onChange: (e) => onChange(e.target.value),
						placeholder: uiText(isChinese, "Type or speak your answer", "请输入或使用语音回答")
					}),
					question.type === "number" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/esm/QuestionField.tsx:144:11:3f9900155b9635e4cbcd3bd763bae7c2b90165b4f1b83fed4d27f4715acbdd41:1",
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							inputMode: "numeric",
							className: "max-w-[10rem]",
							value: typeof value === "number" ? value : "",
							onChange: (e) => onChange(e.target.value === "" ? null : Number(e.target.value))
						}), question.unit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-source": "components/esm/QuestionField.tsx:152:32:5148a3672b74dd2b4a97c9ca16aa42b387fcd849166d42b9a38f43cc43636072:1",
							className: "text-sm text-muted-foreground",
							children: isChinese ? {
								years: "年",
								hours: "小时",
								minutes: "分钟"
							}[question.unit] ?? "" : question.unit
						})]
					}),
					(question.type === "single" || question.type === "yesno") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "components/esm/QuestionField.tsx:157:11:5e55d9cfc644f8122d58cbc42b66c93920249d6cd3180de5884d2df1a6bf36ab:1",
						className: "flex flex-wrap gap-2",
						children: (question.type === "yesno" ? yesNoOptions : options).map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: value === option.value ? "default" : "outline",
							className: "h-auto whitespace-normal py-2 text-left",
							onClick: () => onChange(option.value),
							children: option.label
						}, option.value))
					}),
					question.type === "multi" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "components/esm/QuestionField.tsx:173:11:f34c1debfbe070f75218ac704f75e1971c06b3de056141e9fe1233b740688f9d:1",
						className: "grid gap-2 sm:grid-cols-2",
						children: options.map((option) => {
							const selected = Array.isArray(value) && value.includes(option.value);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								"data-inspector-source": "components/esm/QuestionField.tsx:177:17:c459658283444a6c19997b113eaeee1cbcdd6d8c5bebbacda300f56bfb7f7449:1",
								className: cn("flex cursor-pointer items-start gap-2 rounded-md border p-2 text-sm", selected ? "border-primary bg-primary/5" : "border-border"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									checked: selected,
									onCheckedChange: (checked) => {
										const current = Array.isArray(value) ? value : [];
										onChange(checked ? [...current, option.value] : current.filter((v) => v !== option.value));
									}
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-source": "components/esm/QuestionField.tsx:193:19:a2e76d798ee2aa38148ebb1179b6edc21f75394173edd09105767ccef7fbc795:1",
									className: "leading-snug",
									children: option.label
								})]
							}, option.value);
						})
					}),
					question.type === "scale" && scale && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/esm/QuestionField.tsx:201:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-source": "components/esm/QuestionField.tsx:202:13:147d0a55792f0d4a12f9a7fb62b8d385404e5375c7cb7810d8369465495a40d7:1",
								className: "flex flex-wrap gap-2",
								children: points.map((point) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: value === point ? "default" : "outline",
									className: "min-w-[3rem]",
									onClick: () => onChange(point),
									children: point > 0 && scale.min < 0 ? `+${point}` : point
								}, point))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/esm/QuestionField.tsx:215:13:827086817086925244388d51cb556d15494137c36a1d702294b67466cb948c1a:1",
								className: "mt-2 flex justify-between text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-source": "components/esm/QuestionField.tsx:216:15:61cdf1556ba0092a2bfa1a302167d89d10317e8540c3e4fe9e82c174dcdb2c32:1",
									children: scale.minLabel
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-source": "components/esm/QuestionField.tsx:217:15:03a1913461c07fa681ba80192164a5707c1102a992c684b1aee12cea4b5ce304:1",
									children: scale.maxLabel
								})]
							}),
							typeof value === "number" && scale.pointLabels?.[value] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/esm/QuestionField.tsx:220:15:2533a1ee6217b3bdad07b598d97cb540a6a981502dc4ef155e81e4f2e777c882:1",
								className: "mt-1 text-sm text-foreground",
								children: scale.pointLabels[value]
							})
						]
					})
				]
			}),
			heard && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				"data-inspector-source": "components/esm/QuestionField.tsx:227:9:35fd6ef9ce14417303d482c635b5bd39d08e54bf973260f92b57115065cc4889:1",
				className: "mt-2 text-xs text-muted-foreground",
				children: [
					uiText(isChinese, "Heard", "识别到"),
					"：“",
					heard,
					"”",
					unmatched && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-inspector-source": "components/esm/QuestionField.tsx:230:13:32f015d06e202a477200514a7591fb6a7fc84fa3c22db8f9b49bfba5561a82d0:1",
						className: "ml-1 text-destructive",
						children: uiText(isChinese, "— I could not match that to an answer. Please choose or speak again.", "— 无法匹配到选项，请手动选择或重新说一遍。")
					})
				]
			})
		]
	});
}
function visible(question, answers) {
	if (!question.showIf) return true;
	const given = answers[question.showIf.id] ?? null;
	if (Array.isArray(given)) return given.some((v) => question.showIf.equals.includes(v));
	return question.showIf.equals.includes(given);
}
/** Walks a questionnaire one group at a time, saving a draft as you go. */
function SurveyRunner({ questionnaire, draftId, extraOptionsByQuestion, onSubmit, submitLabel = "Submit", onCancel, initialStep = 0 }) {
	const [answers, setAnswers] = (0, import_react.useState)(() => getDraft(draftId));
	const { i18n } = useTranslation();
	const isChinese = isChineseLanguage(i18n.language);
	const displayQuestionnaire = (0, import_react.useMemo)(() => localizeQuestionnaire(questionnaire, isChinese), [questionnaire, isChinese]);
	const [step, setStep] = (0, import_react.useState)(() => Math.min(Math.max(initialStep, 0), displayQuestionnaire.groups.length - 1));
	(0, import_react.useEffect)(() => {
		saveDraft(draftId, answers);
	}, [draftId, answers]);
	(0, import_react.useEffect)(() => {
		setStep(Math.min(Math.max(initialStep, 0), displayQuestionnaire.groups.length - 1));
	}, [displayQuestionnaire.groups.length, initialStep]);
	const group = displayQuestionnaire.groups[step];
	const questions = (0, import_react.useMemo)(() => group.questions.filter((q) => visible(q, answers)), [group, answers]);
	const isLast = step === displayQuestionnaire.groups.length - 1;
	const set = (id, value) => setAnswers((prev) => ({
		...prev,
		[id]: value
	}));
	const missing = questions.filter((q) => !q.optional && (answers[q.id] === void 0 || answers[q.id] === null || answers[q.id] === "" || Array.isArray(answers[q.id]) && answers[q.id].length === 0));
	const next = () => {
		if (missing.length) {
			const first = missing[0];
			toast.error(isChinese ? `还有 ${missing.length} 个问题需要回答，请先完成“${first.text}”。` : `${missing.length} question${missing.length > 1 ? "s" : ""} still need an answer — start with “${first.text}”.`);
			document.getElementById(`esm-q-${first.id}`)?.scrollIntoView({
				behavior: "smooth",
				block: "center"
			});
			return;
		}
		if (isLast) {
			onSubmit(answers);
			clearDraft(draftId);
			return;
		}
		setStep((s) => s + 1);
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/esm/SurveyRunner.tsx:89:5:769c8d3a0ea249685ebd9a1c1e395da1c701e39c4c345b3a74ae45334735357c:1",
		className: "mx-auto w-full max-w-2xl px-4 pb-24 pt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/esm/SurveyRunner.tsx:90:7:17af1f1ab3b66335f70df83dc6b0e1b80b7613a3e2672b33c0357ed0c5f841ec:1",
				className: "mb-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/esm/SurveyRunner.tsx:91:9:ce62def3cfe1cc7f5fd58d4c69a2a996e9d425401301c6d5b771ca26f177161a:1",
						className: "text-xs uppercase tracking-wide text-muted-foreground",
						children: displayQuestionnaire.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						"data-inspector-source": "components/esm/SurveyRunner.tsx:92:9:af4f56b326edd5bae93fcfaa892191d1085876add68358fabe8e3556dc447a2c:1",
						className: "mt-1 text-2xl font-semibold text-foreground",
						children: group.title
					}),
					group.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/esm/SurveyRunner.tsx:95:32:42baa0142776fd1c622b0ce326e5fa49d6b1b633582cf5b6ead6eaf7a64845ea:1",
						className: "mt-1 text-sm text-muted-foreground",
						children: group.description
					}),
					step === 0 && displayQuestionnaire.intro && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/esm/SurveyRunner.tsx:97:11:6234934672f064c58631f1076344209a3f031f8e198925ec1b223f49c88fb33f:1",
						className: "mt-2 rounded-md bg-muted p-3 text-sm text-muted-foreground",
						children: displayQuestionnaire.intro
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "components/esm/SurveyRunner.tsx:99:9:34a100ea3f08029c4b872ed1ee48a8056118dee4bac58a14782199c43cded2c8:1",
						className: "mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-source": "components/esm/SurveyRunner.tsx:100:11:8777458440cfbef8877513571cfac714f6a9cb8baba9bf068b5ec4f7d8441c47:1",
							className: "h-full bg-primary transition-all",
							style: { width: `${(step + 1) / displayQuestionnaire.groups.length * 100}%` }
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "components/esm/SurveyRunner.tsx:107:7:0d786102428466c4a7ee6474fcde99f39d32b75cf98669fb34f9957faeb77500:1",
				className: "space-y-3",
				children: questions.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuestionField, {
					question: q,
					value: answers[q.id] ?? null,
					onChange: (v) => set(q.id, v),
					extraOptions: extraOptionsByQuestion?.[q.id]
				}, q.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/esm/SurveyRunner.tsx:119:7:075a26b0c43d3fa9b594fcd73c4709090390ba1e71b442f1f36e4a28012eaea8:1",
				className: "sticky bottom-16 mt-6 flex gap-2 rounded-lg border border-border bg-background/95 p-3 backdrop-blur",
				children: [step > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => setStep((s) => s - 1),
					children: uiText(isChinese, "Back", "上一步")
				}) : onCancel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: onCancel,
					children: uiText(isChinese, "Cancel", "取消")
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "flex-1",
					onClick: next,
					children: isLast ? isChinese ? {
						Submit: "提交",
						"Save this entry": "保存这条记录",
						"Finish today": "完成今日记录",
						"Finish the entry survey": "完成初始问卷"
					}[submitLabel] ?? "提交" : submitLabel : uiText(isChinese, "Next", "下一步")
				})]
			})
		]
	});
}
/** The one-time entry survey, chosen by the participant's role. */
function EsmScreening() {
	const navigate = useNavigate$1();
	const [params] = useSearchParams();
	const profile = getProfile();
	const { i18n } = useTranslation();
	const zh = isChineseLanguage(i18n.language);
	if (!profile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
		to: "/",
		replace: true
	});
	const isPrimary = profile.role === "primary";
	const questionnaire = isPrimary ? primaryScreening : otherScreening;
	const requestedStep = Number(params.get("step"));
	const initialStep = Number.isInteger(requestedStep) && requestedStep >= 0 ? requestedStep : params.get("section") === "introduction" ? 0 : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SurveyRunner, {
		questionnaire,
		draftId: questionnaire.id,
		initialStep,
		submitLabel: uiText(zh, "Finish the entry survey", "完成初始问卷"),
		onCancel: () => navigate("/me?tab=screening"),
		onSubmit: async (answers) => {
			const result = await submitRecord(isPrimary ? "primary_screening" : "other_screening", answers);
			saveProfile({
				...profile,
				screeningDone: true,
				name: typeof answers["c318_a01"] === "string" ? answers["c318_a01"] : profile.name
			});
			if (result.uploaded) toast.success(uiText(zh, "Entry survey saved. The weekly logging starts now.", "初始问卷已保存，现在可以开始本周记录。"));
			else toast.warning(uiText(zh, `Saved on this device only — ${result.error}`, "已保存在本设备，暂未上传。"));
			navigate("/me?tab=screening", { replace: true });
		}
	});
}
/** One hourly entry: Activity, People, Challenges & resources. */
function EsmHourlyLog() {
	const navigate = useNavigate$1();
	const [params] = useSearchParams();
	const { i18n } = useTranslation();
	const zh = isChineseLanguage(i18n.language);
	const slot = params.get("slot") || slotId(/* @__PURE__ */ new Date(), (/* @__PURE__ */ new Date()).getHours());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SurveyRunner, {
		questionnaire: hourlyLog,
		draftId: `hourly:${slot}`,
		submitLabel: uiText(zh, "Save this entry", "保存这条记录"),
		onCancel: () => navigate("/log"),
		onSubmit: async (answers) => {
			const result = await submitRecord("hourly_log", answers, { slot });
			if (result.uploaded) toast.success(uiText(zh, "Entry saved.", "记录已保存。"));
			else toast.warning(uiText(zh, `Saved on this device only — ${result.error}`, "已保存在本设备，暂未上传。"));
			navigate("/", { replace: true });
		}
	});
}
/** The 10 PM end-of-day log, with a shortcut to fill in missed hourly slots. */
function EsmDailyLog() {
	const navigate = useNavigate$1();
	const missed = missedSlots();
	const { i18n } = useTranslation();
	const zh = isChineseLanguage(i18n.language);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/esm/EsmDailyLog.tsx:20:5:7d9b64e2b3d3009104b259db8525641c470f96c72d612cc057b0833cbdeb2660:1",
		children: [missed.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-inspector-source": "pages/esm/EsmDailyLog.tsx:22:9:45ba7354cdb8c6dc32cb52a1a4caac14fbdb60adb3e5780a3943a4694880439e:1",
			className: "mx-auto max-w-2xl px-4 pt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "pb-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: uiText(zh, `${missed.length} hour${missed.length > 1 ? "s" : ""} not recorded today`, `今天有 ${missed.length} 个小时尚未记录`)
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "flex flex-wrap gap-2",
				children: missed.map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => navigate(`/log/hourly?slot=${slot.id}`),
					children: slot.label
				}, slot.id))
			})] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SurveyRunner, {
			questionnaire: dailyLog,
			draftId: `daily:${localDay(/* @__PURE__ */ new Date())}`,
			submitLabel: uiText(zh, "Finish today", "完成今日记录"),
			onCancel: () => navigate("/log"),
			onSubmit: async (answers) => {
				const result = await submitRecord("daily_log", answers);
				if (result.uploaded) toast.success(uiText(zh, "Thank you — today is complete.", "谢谢，今天的记录已完成。"));
				else toast.warning(uiText(zh, `Saved on this device only — ${result.error}`, "已保存在本设备，暂未上传。"));
				navigate("/", { replace: true });
			}
		})]
	});
}
var KIND_LABEL = {
	primary_screening: "Entry survey (main caregiver)",
	other_screening: "Entry survey (other caregiver)",
	hourly_log: "Hourly entry",
	daily_log: "End-of-day log"
};
/** Everything this participant has recorded, with a JSON export for the team. */
function EsmEntries() {
	const [records, setRecords] = (0, import_react.useState)(getRecords());
	const { i18n } = useTranslation();
	const zh = isChineseLanguage(i18n.language);
	const download = () => {
		const blob = new Blob([exportJson()], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `esm-survey-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/esm/EsmEntries.tsx:36:5:1bbf0280fea7e15a3776db35a3b187b0db468c2f5ab0e612288659e99b9ac1be:1",
		className: "mx-auto max-w-2xl space-y-3 px-4 py-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-source": "pages/esm/EsmEntries.tsx:37:7:44e03e5bc8048a36da82eb6050b1b73d7a8609941b5e77c14c9dbbea77b45549:1",
			className: "flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				"data-inspector-source": "pages/esm/EsmEntries.tsx:38:10:5e5b23609c81ed00a1cf801c44cbf73d9dbfe5e526b51552d24ee9185e4bf3aa:1",
				className: "text-2xl font-semibold text-foreground",
				children: uiText(zh, "My entries", "我的记录")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/esm/EsmEntries.tsx:39:9:071dccf697c1badae00a469af34e1305288e6fbee9447a5b501a11ceff357683:1",
				className: "flex gap-2",
				children: [records.some((r) => !r.synced) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: async () => {
						const { sent, failed } = await pushPendingRecords(getRecords());
						setRecords(getRecords());
						if (failed) toast.warning(uiText(zh, `${sent} uploaded, ${failed} still waiting.`, `已上传 ${sent} 条，仍有 ${failed} 条等待上传。`));
						else toast.success(uiText(zh, `${sent} entr${sent === 1 ? "y" : "ies"} uploaded.`, `已上传 ${sent} 条记录。`));
					},
					children: uiText(zh, "Upload", "上传")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: download,
					disabled: !records.length,
					children: uiText(zh, "Export", "导出")
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: "hourly",
			className: "pt-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "grid w-full grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "hourly",
						children: uiText(zh, "Hourly care events", "每小时照护事件")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "daily",
						children: uiText(zh, "Daily care summaries", "每日照护总结")
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "hourly",
					className: "mt-4 space-y-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordList, {
						records: records.filter((record) => record.kind === "hourly_log"),
						onDelete: () => setRecords(getRecords())
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "daily",
					className: "mt-4 space-y-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordList, {
						records: records.filter((record) => record.kind === "daily_log"),
						onDelete: () => setRecords(getRecords())
					})
				})
			]
		})]
	});
}
function RecordList({ records, onDelete }) {
	const { i18n } = useTranslation();
	const zh = isChineseLanguage(i18n.language);
	if (!records.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		"data-inspector-source": "pages/esm/EsmEntries.tsx:79:31:f927259e354e7bc24211d62c9a7310df1d4526c286b43bb48aa71906b30cc87a:1",
		className: "text-muted-foreground",
		children: uiText(zh, "Nothing recorded yet.", "目前还没有记录。")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: records.map((record) => {
		const answered = Object.values(record.answers).filter((v) => v !== null && v !== "" && !(Array.isArray(v) && v.length === 0)).length;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-row items-start justify-between gap-2 pb-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/esm/EsmEntries.tsx:89:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: zh ? {
						primary_screening: "主要护理者初始问卷",
						other_screening: "协助护理者初始问卷",
						hourly_log: "每小时照护事件",
						daily_log: "每日照护总结"
					}[record.kind] ?? "研究记录" : KIND_LABEL[record.kind] ?? "Study entry"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					"data-inspector-source": "pages/esm/EsmEntries.tsx:91:17:373dbddaf2cb540b84384d1b7b7f6a5a633ef213b2fd12c584cacab21ec69e14:1",
					className: "text-xs text-muted-foreground",
					children: [new Date(record.submittedAt).toLocaleString(zh ? "zh-CN" : "en"), record.slot ? ` · ${record.slot.slice(-2)}:00` : ""]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon",
				"aria-label": uiText(zh, "Delete entry", "删除记录"),
				onClick: () => {
					deleteRecord(record.id);
					onDelete();
					toast.success(uiText(zh, "Entry deleted.", "记录已删除。"));
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			"data-inspector-source": "pages/esm/EsmEntries.tsx:110:15:5d90bae0884f04da9ca0ed51e4224705403f46d35be88ee28e9517d5a5cacb5a:1",
			className: "text-sm text-muted-foreground",
			children: [
				uiText(zh, `${answered} answers recorded`, `已记录 ${answered} 个回答`),
				" · ",
				record.synced ? uiText(zh, "sent to the study", "已发送给研究团队") : uiText(zh, "on this device only", "仅保存在本设备")
			]
		}) })] }, record.id);
	}) });
}
function EsmLogEntry() {
	const navigate = useNavigate$1();
	const { i18n } = useTranslation();
	const zh = isChineseLanguage(i18n.language);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/esm/EsmLogEntry.tsx:13:5:791e9c2e1e52d1c574cf28272fc1ff5e3ee3af60419e89742a2a07bae81d5f1d:1",
		className: "mx-auto max-w-2xl px-4 py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				"data-inspector-source": "pages/esm/EsmLogEntry.tsx:14:7:73542107e38f0924f82b875252700ba18ed2c4a22e6b7e248af013758474e332:1",
				className: "text-2xl font-semibold text-foreground",
				children: uiText(zh, "Log entry", "记录")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "pages/esm/EsmLogEntry.tsx:15:7:e4e81cc14d4ead924d3dea8b552aa3750ff8862f020a2a2d254048d51c804236:1",
				className: "mt-1 text-sm text-muted-foreground",
				children: uiText(zh, "Choose what you want to record.", "请选择要记录的内容。")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/esm/EsmLogEntry.tsx:17:7:9ee40c33a6ea046d4152a0be4d4e033dda8feaac91e243aa8a1027fbff82464b:1",
				className: "mt-6 divide-y divide-border border-y border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					className: "h-auto w-full justify-start rounded-none px-0 py-5 text-left",
					onClick: () => navigate("/log/hourly"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "mr-3 h-6 w-6 shrink-0 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							"data-inspector-source": "pages/esm/EsmLogEntry.tsx:24:11:f9fc779e6f5fcb2076f319c1014a45706a9ba4b86ca71ae2b719eff162772754:1",
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-source": "pages/esm/EsmLogEntry.tsx:25:13:8e37f07a0fc7850bfeb12f91398d3835255e952166efaaa1793a67abc108098e:1",
								className: "block text-base font-semibold",
								children: uiText(zh, "Log hourly care event", "记录每小时照护事件")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-source": "pages/esm/EsmLogEntry.tsx:26:13:13f051f944e18e78b2801e397dc1ecb59190b4802794ad5258a3d131c8bd9850:1",
								className: "mt-1 block whitespace-normal text-sm font-normal text-muted-foreground",
								children: uiText(zh, "Record an event for this hour or add one for another time.", "记录当前小时的照护事件，或补记其他时间发生的事情。")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-3 h-5 w-5 shrink-0 text-muted-foreground" })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					className: "h-auto w-full justify-start rounded-none px-0 py-5 text-left",
					onClick: () => navigate("/log/daily"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarCheck, { className: "mr-3 h-6 w-6 shrink-0 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							"data-inspector-source": "pages/esm/EsmLogEntry.tsx:38:11:f9fc779e6f5fcb2076f319c1014a45706a9ba4b86ca71ae2b719eff162772754:1",
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-source": "pages/esm/EsmLogEntry.tsx:39:13:22efad013c1b83c25dd5e356c93840cf1f468c2d83a71fbe67b1c35883ab8275:1",
								className: "block text-base font-semibold",
								children: uiText(zh, "Log daily care summary", "记录每日照护总结")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-source": "pages/esm/EsmLogEntry.tsx:40:13:13f051f944e18e78b2801e397dc1ecb59190b4802794ad5258a3d131c8bd9850:1",
								className: "mt-1 block whitespace-normal text-sm font-normal text-muted-foreground",
								children: uiText(zh, "Complete the daily questionnaire and add anything you missed.", "完成每日问卷，并补充今天遗漏的内容。")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-3 h-5 w-5 shrink-0 text-muted-foreground" })
					]
				})]
			})
		]
	});
}
function EsmHelp() {
	const { openAssistant } = useAIAssistant();
	const { i18n } = useTranslation();
	const zh = isChineseLanguage(i18n.language);
	const helpItems = [
		{
			icon: Clock3,
			title: uiText(zh, "Hourly care events", "每小时照护事件"),
			text: uiText(zh, "Choose any hour on Today. You can add more than one event to the same hour.", "在“今天”中选择任意小时；同一小时可以记录多件事情。")
		},
		{
			icon: ListChecks,
			title: uiText(zh, "Daily care summary", "每日照护总结"),
			text: uiText(zh, "Open Log entry, then Daily care summary, to reflect on the day and fill any gaps.", "进入“记录”，再选择“每日照护总结”，回顾一天并补充遗漏。")
		},
		{
			icon: Mic,
			title: uiText(zh, "Answer by voice", "使用语音回答"),
			text: uiText(zh, "Tap the microphone beside any question. Check the matched answer before moving on.", "点击问题旁的麦克风，说出答案；进入下一题前请确认识别结果。")
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/esm/EsmHelp.tsx:18:5:791e9c2e1e52d1c574cf28272fc1ff5e3ee3af60419e89742a2a07bae81d5f1d:1",
		className: "mx-auto max-w-2xl px-4 py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				"data-inspector-source": "pages/esm/EsmHelp.tsx:19:7:3aefc900afa295cf8aee03a1ae0d78db84361a5904442d4983969347163f7957:1",
				className: "text-2xl font-semibold text-foreground",
				children: uiText(zh, "Help", "帮助")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "pages/esm/EsmHelp.tsx:20:7:9b77fe4d71f9591d056317a48fc3bd83cecba397e333f28febc4918dc56be882:1",
				className: "mt-5 divide-y divide-border border-y border-border",
				children: helpItems.map(({ icon: Icon, title, text }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/esm/EsmHelp.tsx:22:11:56f5086fd2c8999d0db93c7140294c371f37ab8d296d605c95264e55ace51bc9:1",
					className: "flex gap-3 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "mt-0.5 h-5 w-5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/esm/EsmHelp.tsx:24:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							"data-inspector-source": "pages/esm/EsmHelp.tsx:25:15:37414186344978dc3fd8f783ca03d8a7e9c98fe852c414cb0455e40f02ff8b27:1",
							className: "font-semibold text-foreground",
							children: title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "pages/esm/EsmHelp.tsx:26:15:1dee83dd56b006728d5f8a98f9cf3b793dd98b736d59f8844733a2a4bd6f4235:1",
							className: "mt-1 text-sm text-muted-foreground",
							children: text
						})]
					})]
				}, title))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "mt-6 w-full",
				size: "lg",
				onClick: () => openAssistant({
					title: uiText(zh, "Study help", "问卷填写帮助"),
					contextPrompt: uiText(zh, "Help the participant understand how to complete the caregiver study forms. Do not provide medical advice.", "帮助参与者理解如何填写护理者研究问卷。只使用中文，不提供医疗建议。"),
					starterFallback: uiText(zh, "What would you like to know about completing the study?", "您想了解问卷填写的哪一部分？")
				}),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "mr-2 h-5 w-5" }), uiText(zh, "Ask the study assistant", "询问填写助手")]
			})
		]
	});
}
var answered = (value) => value !== void 0 && value !== null && value !== "" && (!Array.isArray(value) || value.length > 0);
function EsmMe() {
	const navigate = useNavigate$1();
	const [params, setParams] = useSearchParams();
	const initialTab = params.get("tab") === "screening" ? "screening" : "profile";
	const [profile, setProfile] = (0, import_react.useState)(getProfile());
	const [name, setName] = (0, import_react.useState)(profile?.name ?? "");
	const [settings, setSettingsState] = (0, import_react.useState)(getSettings());
	const { i18n } = useTranslation();
	const zh = isChineseLanguage(i18n.language);
	const questionnaire = profile?.role === "other" ? otherScreening : primaryScreening;
	const displayedQuestionnaire = localizeQuestionnaire(questionnaire, zh);
	const draft = getDraft(questionnaire.id);
	const introduction = questionnaire.groups[0];
	const introductionDone = (0, import_react.useMemo)(() => Boolean(introduction) && introduction.questions.filter((q) => !q.optional).every((q) => answered(draft[q.id])), [draft, introduction]);
	const chooseRole = (role) => {
		const next = startProfile(role);
		setProfile(next);
		setName(next.name ?? "");
	};
	const persistProfile = () => {
		if (!profile) {
			toast.error(uiText(zh, "Choose Primary or Secondary caregiver first.", "请先选择主要护理者或协助护理者。"));
			return;
		}
		const next = {
			...profile,
			name: name.trim()
		};
		saveProfile(next);
		const nextDraft = {
			...getDraft(questionnaire.id),
			c318_a01: name.trim()
		};
		saveDraft(questionnaire.id, nextDraft);
		saveSettings(settings);
		setProfile(next);
		toast.success(uiText(zh, "Profile and settings saved.", "个人资料和设置已保存。"));
	};
	const updateQuietPeriod = (id, key, value) => {
		setSettingsState((current) => ({
			...current,
			quietPeriods: current.quietPeriods.map((period) => period.id === id ? {
				...period,
				[key]: value
			} : period)
		}));
	};
	const addQuietPeriod = () => {
		const period = {
			id: `quiet-${Date.now()}`,
			start: "12:00",
			end: "13:00"
		};
		setSettingsState((current) => ({
			...current,
			quietPeriods: [...current.quietPeriods, period]
		}));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/esm/EsmMe.tsx:69:5:791e9c2e1e52d1c574cf28272fc1ff5e3ee3af60419e89742a2a07bae81d5f1d:1",
		className: "mx-auto max-w-2xl px-4 py-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			"data-inspector-source": "pages/esm/EsmMe.tsx:70:8:e410b1a69d1f7db8384a0d7706c2bc110f57c5c4298665025589b0f0d8d10e16:1",
			className: "text-2xl font-semibold text-foreground",
			children: name || uiText(zh, "Me", "我")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: initialTab,
			className: "mt-4",
			onValueChange: (tab) => setParams(tab === "screening" ? { tab: "screening" } : {}),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "grid w-full grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "profile",
						children: uiText(zh, "Profile & settings", "个人资料与设置")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "screening",
						children: uiText(zh, "Screening questions", "初始问卷")
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "profile",
					className: "mt-5 space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "pages/esm/EsmMe.tsx:82:11:94490c180d4f0469c17deda0b1a4d7cc86527230dc532ba16ef5120fe55a0723:1",
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "esm-name",
									children: uiText(zh, "Name", "姓名")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "esm-name",
									value: name,
									onChange: (event) => setName(event.target.value),
									placeholder: uiText(zh, "Your name", "您的姓名")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-source": "pages/esm/EsmMe.tsx:85:14:77a39d5c765922717b8b376a54b60143dce509631e680a46ec61cd98d32bbb90:1",
									className: "text-xs text-muted-foreground",
									children: uiText(zh, "Saved with your screening information.", "姓名会保存在您的初始问卷信息中。")
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "pages/esm/EsmMe.tsx:87:11:c3b7db9ba40a4f81002d3842260bd06a9d23ddd5f7d7e17db65b260783e797aa:1",
							className: "divide-y divide-border border-y border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingRow, {
									label: uiText(zh, "Hourly reminders", "每小时提醒"),
									detail: uiText(zh, "Prompt me during the study day", "在研究记录期间提醒我填写"),
									checked: settings.hourlyReminders,
									onCheckedChange: (checked) => setSettingsState((current) => ({
										...current,
										hourlyReminders: checked
									}))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "pages/esm/EsmMe.tsx:94:13:e40e1d097c7de4628679eb8240508944694a7eb814f4150831df38d3ab8e5ecc:1",
									className: "space-y-3 py-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/esm/EsmMe.tsx:95:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-source": "pages/esm/EsmMe.tsx:96:17:280d4159958355fe7ea03e698b75ac951163da328d11518772ebe0f8d793d6e0:1",
											className: "text-sm font-medium text-foreground",
											children: uiText(zh, "Hourly reminder times", "每小时提醒时段")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-source": "pages/esm/EsmMe.tsx:97:17:316390f6b99a4e6a1ed062c348508f5347ad09d4945b3119cbc9c910f733e296:1",
											className: "text-xs text-muted-foreground",
											children: uiText(zh, "One reminder each hour during this period.", "在此时段内每小时提醒一次。")
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/esm/EsmMe.tsx:99:15:2e6f6dc68c5477820a8f79939f25c4191d4262e5c37d0a784648548e07c90bf5:1",
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "pages/esm/EsmMe.tsx:100:17:74ef4d5d8f87a0f65d6b2b2942b09454c01f8bfeb13eafefb64aabdc5453b6dd:1",
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "reminder-start",
												children: uiText(zh, "Start", "开始")
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "reminder-start",
												type: "time",
												value: settings.reminderStart,
												min: "08:00",
												max: "22:00",
												onChange: (event) => setSettingsState((current) => ({
													...current,
													reminderStart: event.target.value
												}))
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "pages/esm/EsmMe.tsx:101:17:674c0aaa17e463d514466662743d04b1dfc4e777417515c89dcf62feaaef8e6e:1",
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "reminder-end",
												children: uiText(zh, "End", "结束")
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "reminder-end",
												type: "time",
												value: settings.reminderEnd,
												min: "08:00",
												max: "22:00",
												onChange: (event) => setSettingsState((current) => ({
													...current,
													reminderEnd: event.target.value
												}))
											})]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "pages/esm/EsmMe.tsx:104:13:e40e1d097c7de4628679eb8240508944694a7eb814f4150831df38d3ab8e5ecc:1",
									className: "space-y-3 py-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/esm/EsmMe.tsx:105:15:352a0098704bb34d5b3dee414e24e56cdd210a8ae4c881d8c24e4a86c341327d:1",
										className: "flex items-center justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "pages/esm/EsmMe.tsx:106:17:b18a37a98c2a2a99e3973ef87c198a59b5ed47a20748a5886e450c73507c62b0:1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-source": "pages/esm/EsmMe.tsx:106:22:b18a37a98c2a2a99e3973ef87c198a59b5ed47a20748a5886e450c73507c62b0:0",
												className: "text-sm font-medium text-foreground",
												children: uiText(zh, "Do not disturb", "免打扰时段")
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												"data-inspector-source": "pages/esm/EsmMe.tsx:106:116:b18a37a98c2a2a99e3973ef87c198a59b5ed47a20748a5886e450c73507c62b0:0",
												className: "text-xs text-muted-foreground",
												children: uiText(zh, "Add more than one quiet period if needed.", "可按需要添加多个免打扰时段。")
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											type: "button",
											variant: "outline",
											size: "icon",
											onClick: addQuietPeriod,
											"aria-label": uiText(zh, "Add quiet period", "添加免打扰时段"),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" })
										})]
									}), settings.quietPeriods.map((period) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "pages/esm/EsmMe.tsx:110:17:5bacade9c0ef72535b837713a528f47439be85ac3ee7cd9e9bfc89a41460d1cc:1",
										className: "grid grid-cols-[1fr_1fr_auto] items-end gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-source": "pages/esm/EsmMe.tsx:111:19:5f1d33b6bf1624f57b12c53cefe89be1e4b95f562e125f43764d5d64bf7e874d:1",
												className: "space-y-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													htmlFor: `${period.id}-start`,
													children: uiText(zh, "From", "从")
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													id: `${period.id}-start`,
													type: "time",
													value: period.start,
													onChange: (event) => updateQuietPeriod(period.id, "start", event.target.value)
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-source": "pages/esm/EsmMe.tsx:112:19:c3a8f900b91ae906499cbf3518b954fc7a1acaf699914415f9b026de714e88b6:1",
												className: "space-y-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													htmlFor: `${period.id}-end`,
													children: uiText(zh, "To", "到")
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													id: `${period.id}-end`,
													type: "time",
													value: period.end,
													onChange: (event) => updateQuietPeriod(period.id, "end", event.target.value)
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												type: "button",
												variant: "ghost",
												size: "icon",
												onClick: () => setSettingsState((current) => ({
													...current,
													quietPeriods: current.quietPeriods.filter((item) => item.id !== period.id)
												})),
												"aria-label": uiText(zh, "Remove quiet period", "删除免打扰时段"),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
											})
										]
									}, period.id))]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "pages/esm/EsmMe.tsx:117:13:d14ab447ea86dbc7fd56ddc4a63a0edbcb2e3e84895da2a539ce8c83493486f0:1",
									className: "py-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-source": "pages/esm/EsmMe.tsx:118:15:107d646257a1d6ad00806f0dbd1fccc48aee715e26f0e5fc6d9a05e140e5075a:1",
										className: "text-sm font-medium text-foreground",
										children: uiText(zh, "Daily care summary reminder · 10:00 PM", "每日照护总结提醒 · 晚上10:00")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										"data-inspector-source": "pages/esm/EsmMe.tsx:119:15:3103465c8fdb18c0a84e3cdca1d0e0ae640abfff77ea486caf74554050f76042:1",
										className: "mt-1 text-xs text-muted-foreground",
										children: uiText(zh, "Always on. If yesterday is incomplete, reminders appear with the first morning reminder, at noon, and again at 10:00 PM.", "始终开启。若昨天未完成，将在今早第一条提醒、中午12点及晚上10点再次提醒。")
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingRow, {
									label: uiText(zh, "Reduce motion", "减少动态效果"),
									detail: uiText(zh, "Use less movement when navigating", "浏览页面时减少动画"),
									checked: settings.reducedMotion,
									onCheckedChange: (checked) => setSettingsState((current) => ({
										...current,
										reducedMotion: checked
									}))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							size: "lg",
							onClick: persistProfile,
							children: uiText(zh, "Save", "保存")
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "screening",
					className: "mt-5 space-y-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/esm/EsmMe.tsx:132:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								"data-inspector-source": "pages/esm/EsmMe.tsx:133:14:c50416a61f037723e86e58f33f308484a1a984a73c1e9f362db2d9ccc1f4580e:1",
								className: "font-semibold text-foreground",
								children: uiText(zh, "Which describes you?", "哪一种身份更符合您的情况？")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/esm/EsmMe.tsx:134:13:3d84f22f95e380731b7afdc5592f3f52365b4bd6f3eaf12876843a5474627a59:1",
								className: "mt-3 grid grid-cols-2 gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: profile?.role === "primary" ? "default" : "outline",
									className: "h-auto py-3",
									onClick: () => chooseRole("primary"),
									children: uiText(zh, "Primary caregiver", "主要护理者")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: profile?.role === "other" ? "default" : "outline",
									className: "h-auto py-3",
									onClick: () => chooseRole("other"),
									children: uiText(zh, "Secondary caregiver", "协助护理者")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "pages/esm/EsmMe.tsx:138:14:0168efa5e684b15f9f84d673082a8594b3bcfa7e4ac7a8f5e46bdfb52c2cf28a:1",
								className: "mt-2 text-xs text-muted-foreground",
								children: uiText(zh, "This choice stays on this device and selects the matching questionnaire.", "此选择只保存在本设备，用于显示与您身份相符的问卷。")
							})
						]
					}), profile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/esm/EsmMe.tsx:142:13:b923d970f3e7904bba05e9e96230f9f39b55b74a0e6242991cd5f907b564b35f:1",
						className: "border-y border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								"data-inspector-source": "pages/esm/EsmMe.tsx:143:15:d28290e03c35730f2c3304a925423562ff2093be356c903abb6ad4b64f783fba:1",
								className: "flex w-full items-center gap-3 py-4 text-left",
								onClick: () => navigate("/screening?section=introduction"),
								children: [
									introductionDone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-5 w-5 shrink-0 text-success" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-5 w-5 shrink-0 text-muted-foreground" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										"data-inspector-source": "pages/esm/EsmMe.tsx:148:17:74c06ef92d8dda37223b41c083ea59bd795bea71db3d0d21859a085bf323ff31:1",
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-source": "pages/esm/EsmMe.tsx:149:20:8d0f007d41a1fe9d8ce63d50d07649f5e0fc1a66e3ec2f8e069fc2df5b01577c:1",
											className: "block font-semibold text-foreground",
											children: introductionDone ? uiText(zh, "Self-introduction questions complete", "个人基本信息已完成") : uiText(zh, "Finish your self-introduction questions", "完成个人基本信息")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-source": "pages/esm/EsmMe.tsx:150:20:b53905c468e4d6673c34ad73fe60305891035c79985beb665391eed548f67b4c:1",
											className: "mt-0.5 block text-sm text-muted-foreground",
											children: localizeQuestionnaire(questionnaire, zh).groups[0]?.title
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-5 w-5 shrink-0 text-muted-foreground" })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								"data-inspector-source": "pages/esm/EsmMe.tsx:154:15:40004e1b601c5048966910c628450e751af7266da2c15655ccba1b56f62ab2ec:1",
								className: "flex w-full items-center gap-3 border-t border-border py-4 text-left",
								onClick: () => navigate("/screening"),
								children: [
									profile.screeningDone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-5 w-5 shrink-0 text-success" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-5 w-5 shrink-0 text-muted-foreground" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										"data-inspector-source": "pages/esm/EsmMe.tsx:156:17:74c06ef92d8dda37223b41c083ea59bd795bea71db3d0d21859a085bf323ff31:1",
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-source": "pages/esm/EsmMe.tsx:157:20:42767d55dc6e36c41f4e6ea04bcbf28bb049a9bc185bb6234859bbe1ae23a63e:1",
											className: "block font-semibold text-foreground",
											children: profile.screeningDone ? uiText(zh, "Screening questions complete", "初始问卷已完成") : uiText(zh, "Continue screening questions", "继续填写初始问卷")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"data-inspector-source": "pages/esm/EsmMe.tsx:158:21:2c86bd9ba3afd6abb16ed196ea23944960dd07c200788825cfbc2ff31ad624b1:1",
											className: "mt-0.5 block text-sm text-muted-foreground",
											children: displayedQuestionnaire.title
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-5 w-5 shrink-0 text-muted-foreground" })
								]
							}),
							displayedQuestionnaire.groups.map((group, index) => {
								const required = group.questions.filter((question) => !question.optional);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									"data-inspector-source": "pages/esm/EsmMe.tsx:166:19:e05fff7c5dc392cd75f7aba8f0c69bba5b73a321c8356daf9dd2bc7d4f9193af:1",
									className: "flex w-full items-center gap-3 border-t border-border py-3 text-left",
									onClick: () => navigate(`/screening?step=${index}`),
									children: [
										required.length > 0 && required.every((question) => answered(draft[question.id])) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-5 w-5 shrink-0 text-success" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-5 w-5 shrink-0 text-muted-foreground" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											"data-inspector-source": "pages/esm/EsmMe.tsx:172:21:2584ea9c4d0e3d8784afe71c4e79fba41af83c4a86831844c640a68b888e2c1f:1",
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												"data-inspector-source": "pages/esm/EsmMe.tsx:173:23:0b85cc05ef62e7dffc866e09c74702ef9db17a3b342fab0eed544e3b87e285d0:1",
												className: "block text-sm font-medium text-foreground",
												children: group.title
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												"data-inspector-source": "pages/esm/EsmMe.tsx:174:23:160b3524277ff57e1ac6152db056117810b21526cbf72830a727db846dd64490:1",
												className: "mt-0.5 block text-xs text-muted-foreground",
												children: uiText(zh, `${group.questions.length} questions`, `${group.questions.length} 个问题`)
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4 shrink-0 text-muted-foreground" })
									]
								}, group.id);
							})
						]
					})]
				})
			]
		})]
	});
}
function SettingRow({ label, detail, checked, onCheckedChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/esm/EsmMe.tsx:190:5:8f46ed337e6b793b087f54dc44d75d3913d631a7300291909e4a78680253580e:1",
		className: "flex min-h-16 items-center justify-between gap-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-source": "pages/esm/EsmMe.tsx:191:7:9fc1f7e500d2375b8730a7ef6d7d83ceb3c514bd7bf088bf3b6c3bf6462f7049:1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "pages/esm/EsmMe.tsx:192:9:5e0c55de30937470323998f2deb49183a3e732847dac5f50616572fc08868e82:1",
				className: "text-sm font-medium text-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "pages/esm/EsmMe.tsx:193:9:88fdba6fd470b26576d47ad92c26f07df3883b532342b3fc75933ef0adf44d60:1",
				className: "text-xs text-muted-foreground",
				children: detail
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			checked,
			onCheckedChange,
			"aria-label": label
		})]
	});
}
/**
* ESM Survey — "A Week in the Life of Dementia Caregivers".
* A standalone study app: its own shell, its own screens, no care-app menus.
*/
function EsmApp() {
	(0, import_react.useEffect)(() => {
		const url = new URL(window.location.href);
		if (url.searchParams.get("__site") !== "esm_survey") {
			url.searchParams.set("__site", "esm_survey");
			window.history.replaceState({}, "", url.toString());
		}
	}, [useLocation$1().pathname]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EsmShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBoundary, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Routes, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EsmToday, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/screening",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EsmScreening, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/log",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EsmLogEntry, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/log/hourly",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EsmHourlyLog, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/log/daily",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EsmDailyLog, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/evening",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/log/daily",
				replace: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/entries",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EsmEntries, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/help",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EsmHelp, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "/me",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EsmMe, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
			path: "*",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
				to: "/",
				replace: true
			})
		})
	] }) }) });
}
//#endregion
export { EsmApp as default };
