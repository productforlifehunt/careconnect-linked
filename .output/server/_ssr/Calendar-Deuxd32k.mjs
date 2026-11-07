import { s as __toESM } from "../_runtime.mjs";
import { t as index } from "../_libs/@fullcalendar/interaction+[...].mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { t as Card } from "./card-Cz5iPbNd.mjs";
import { t as Badge } from "./badge-Dn-oRli-.mjs";
import { t as Input } from "./input-DmTt3-fi.mjs";
import { t as Textarea } from "./textarea-DPamDMgK.mjs";
import { a as fetchCalendarEventsWordPress, n as createCalendarEventWordPress, o as updateCalendarEventWordPress, r as deleteCalendarEventWordPress } from "./source.wordpress-AL18NEGx.mjs";
import { n as formatDateTime, r as formatTime, t as formatDate } from "./locale-DKwjQju2.mjs";
import { $ as Repeat, Dt as MapPin, In as Calendar, c as Users, it as Plus, ut as Pencil, vn as Clock, y as Trash2 } from "../_libs/lucide-react.mjs";
import { t as index$1 } from "../_libs/@fullcalendar/rrule+[...].mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-COszB6Fv.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-jh6xKLyY.mjs";
import { t as Checkbox } from "./checkbox-4tVtKjWh.mjs";
import { n as getEventTypeLabel, t as EVENT_TYPE_COLORS } from "./types-BPWLUqsD.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as FullCalendar } from "../_libs/fullcalendar__react.mjs";
import { t as index$2 } from "../_libs/fullcalendar__daygrid.mjs";
import { t as index$3 } from "../_libs/fullcalendar__timegrid.mjs";
import { t as index$4 } from "../_libs/fullcalendar__list.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Calendar-Deuxd32k.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TYPES = [
	"personal",
	"family",
	"medicine",
	"task",
	"appointment",
	"availability",
	"birthday",
	"holiday",
	"booking",
	"check_in"
];
var PRIORITIES = [
	"low",
	"normal",
	"high",
	"urgent"
];
/** ISO → value for <input type="datetime-local"> in local time */
function toLocalInput(iso) {
	if (!iso) return "";
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	const pad = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function nextHourLocal(offsetHours = 1) {
	const d = /* @__PURE__ */ new Date();
	d.setMinutes(0, 0, 0);
	d.setHours(d.getHours() + offsetHours);
	return toLocalInput(d.toISOString());
}
function EventFormDialog({ open, onOpenChange, event, onSaved }) {
	const { i18n } = useTranslation();
	const isZh = i18n.language?.startsWith("zh");
	const isEdit = !!event?.id;
	const [title, setTitle] = (0, import_react.useState)("");
	const [type, setType] = (0, import_react.useState)("personal");
	const [priority, setPriority] = (0, import_react.useState)("normal");
	const [start, setStart] = (0, import_react.useState)(nextHourLocal(1));
	const [end, setEnd] = (0, import_react.useState)(nextHourLocal(2));
	const [allDay, setAllDay] = (0, import_react.useState)(false);
	const [location, setLocation] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setTitle(event?.title ?? "");
		setType(event?.event_type ?? "personal");
		setPriority(event?.priority ?? "normal");
		setStart(toLocalInput(event?.start_at) || nextHourLocal(1));
		setEnd(toLocalInput(event?.end_at) || nextHourLocal(2));
		setAllDay(!!event?.all_day);
		setLocation(event?.location ?? "");
		setDescription(event?.description ?? "");
	}, [open, event]);
	const submit = async () => {
		if (!title.trim()) {
			toast.error(isZh ? "请填写标题" : "Please enter a title");
			return;
		}
		const startISO = new Date(start).toISOString();
		const endISO = new Date(end).toISOString();
		if (!allDay && new Date(endISO) <= new Date(startISO)) {
			toast.error(isZh ? "结束时间必须晚于开始时间" : "End time must be after the start time");
			return;
		}
		setSaving(true);
		try {
			const payload = {
				title: title.trim(),
				event_type: type,
				priority,
				status: "confirmed",
				start_at: startISO,
				end_at: endISO,
				all_day: allDay,
				location: location.trim() || void 0,
				description: description.trim() || void 0,
				color: EVENT_TYPE_COLORS[type],
				is_availability: type === "availability",
				show_as: type === "availability" ? "free" : "busy",
				visibility: "default"
			};
			if (isEdit && event) await updateCalendarEventWordPress(event.id, payload);
			else if (!await createCalendarEventWordPress(payload)) throw new Error("not-created");
			toast.success(isZh ? isEdit ? "已更新事件" : "事件已创建" : isEdit ? "Event updated" : "Event created");
			onOpenChange(false);
			onSaved?.();
		} catch {
			toast.error(isZh ? "保存失败，请重试" : "Could not save the event. Please try again.");
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: isEdit ? isZh ? "编辑事件" : "Edit event" : isZh ? "新建事件" : "New event" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: isZh ? "事件会保存到你的日历，并按类型着色。" : "Saved to your calendar and colour-coded by type." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "features/calendar/EventFormDialog.tsx:137:9:482afb581bfec18aad82ccf811d4fb320616c4e23732a947fd21cc1ce63e5ed3:1",
					className: "space-y-3.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "features/calendar/EventFormDialog.tsx:138:11:9541b692ae39a53fa7b28f59d6bedf14f4e326fb6cc658d60c341a98730c8a08:1",
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								htmlFor: "event-title",
								children: [isZh ? "标题" : "Title", " *"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "event-title",
								value: title,
								onChange: (e) => setTitle(e.target.value),
								placeholder: isZh ? "例如：复诊预约" : "e.g. Follow-up appointment"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "features/calendar/EventFormDialog.tsx:148:11:ae2ab7ad4cb0418c1fd55a32546945ea097001b2c70b4b5b96f5d4f4c4efe8de:1",
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "features/calendar/EventFormDialog.tsx:149:13:0bd137aee249026a5dcadda5560dc6aa5052211c8c1d3dfb27198b058ac36b71:1",
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: isZh ? "类型" : "Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: type,
									onValueChange: (v) => setType(v),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: t,
										children: getEventTypeLabel(t, i18n.language)
									}, t)) })]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "features/calendar/EventFormDialog.tsx:160:13:0bd137aee249026a5dcadda5560dc6aa5052211c8c1d3dfb27198b058ac36b71:1",
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: isZh ? "优先级" : "Priority" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: priority,
									onValueChange: (v) => setPriority(v),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: PRIORITIES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: p,
										children: isZh ? {
											low: "低",
											normal: "普通",
											high: "高",
											urgent: "紧急"
										}[p] : p.charAt(0).toUpperCase() + p.slice(1)
									}, p)) })]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "features/calendar/EventFormDialog.tsx:177:11:ae2ab7ad4cb0418c1fd55a32546945ea097001b2c70b4b5b96f5d4f4c4efe8de:1",
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "features/calendar/EventFormDialog.tsx:178:13:0bd137aee249026a5dcadda5560dc6aa5052211c8c1d3dfb27198b058ac36b71:1",
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "event-start",
									children: isZh ? "开始" : "Starts"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "event-start",
									type: "datetime-local",
									value: start,
									onChange: (e) => setStart(e.target.value)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "features/calendar/EventFormDialog.tsx:182:13:0bd137aee249026a5dcadda5560dc6aa5052211c8c1d3dfb27198b058ac36b71:1",
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "event-end",
									children: isZh ? "结束" : "Ends"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "event-end",
									type: "datetime-local",
									value: end,
									onChange: (e) => setEnd(e.target.value)
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "features/calendar/EventFormDialog.tsx:188:11:3f9900155b9635e4cbcd3bd763bae7c2b90165b4f1b83fed4d27f4715acbdd41:1",
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
								id: "event-allday",
								checked: allDay,
								onCheckedChange: (c) => setAllDay(!!c)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "event-allday",
								className: "font-normal",
								children: isZh ? "全天" : "All day"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "features/calendar/EventFormDialog.tsx:193:11:9541b692ae39a53fa7b28f59d6bedf14f4e326fb6cc658d60c341a98730c8a08:1",
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "event-location",
								children: isZh ? "地点" : "Location"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "event-location",
								value: location,
								onChange: (e) => setLocation(e.target.value),
								placeholder: isZh ? "选填" : "Optional"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "features/calendar/EventFormDialog.tsx:203:11:9541b692ae39a53fa7b28f59d6bedf14f4e326fb6cc658d60c341a98730c8a08:1",
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "event-desc",
								children: isZh ? "备注" : "Notes"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "event-desc",
								rows: 3,
								value: description,
								onChange: (e) => setDescription(e.target.value),
								placeholder: isZh ? "选填" : "Optional"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => onOpenChange(false),
						disabled: saving,
						children: isZh ? "取消" : "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: submit,
						disabled: saving,
						children: saving ? isZh ? "保存中…" : "Saving…" : isZh ? "保存" : "Save"
					})]
				})
			]
		})
	});
}
var ALL_TYPES = [
	"personal",
	"family",
	"medicine",
	"task",
	"appointment",
	"availability",
	"birthday",
	"holiday",
	"booking",
	"check_in"
];
var PRIORITY_LABEL = {
	low: {
		en: "Low",
		zh: "低"
	},
	normal: {
		en: "Normal",
		zh: "普通"
	},
	high: {
		en: "High",
		zh: "高"
	},
	urgent: {
		en: "Urgent",
		zh: "紧急"
	}
};
function CalendarPage() {
	const { i18n } = useTranslation();
	const isZh = i18n.language?.startsWith("zh");
	const queryClient = useQueryClient();
	const [enabledTypes, setEnabledTypes] = (0, import_react.useState)(new Set(ALL_TYPES));
	const [selectedEvent, setSelectedEvent] = (0, import_react.useState)(null);
	const [formOpen, setFormOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [deleting, setDeleting] = (0, import_react.useState)(false);
	const { data: allEvents = [], isLoading } = useQuery({
		queryKey: ["calendar-events"],
		queryFn: fetchCalendarEventsWordPress,
		staleTime: 6e4
	});
	const refresh = () => queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
	const openCreate = () => {
		setEditing(null);
		setFormOpen(true);
	};
	const openEdit = (e) => {
		setSelectedEvent(null);
		setEditing(e);
		setFormOpen(true);
	};
	const removeEvent = async (e) => {
		setDeleting(true);
		try {
			await deleteCalendarEventWordPress(e.id);
			toast.success(isZh ? "事件已删除" : "Event deleted");
			setSelectedEvent(null);
			refresh();
		} catch {
			toast.error(isZh ? "删除失败，请重试" : "Could not delete the event. Please try again.");
		} finally {
			setDeleting(false);
		}
	};
	/** Convert CCT-shaped events → FullCalendar EventInput, with RRULE support */
	const fcEvents = (0, import_react.useMemo)(() => {
		return allEvents.filter((e) => enabledTypes.has(e.event_type)).map((e) => {
			const base = {
				id: e.id,
				title: e.title,
				allDay: e.all_day,
				backgroundColor: e.color,
				borderColor: e.color,
				textColor: "#fff",
				extendedProps: e
			};
			if (e.rrule) {
				base.rrule = {
					freq: e.rrule.includes("FREQ=DAILY") ? "daily" : e.rrule.includes("FREQ=WEEKLY") ? "weekly" : e.rrule.includes("FREQ=MONTHLY") ? "monthly" : e.rrule.includes("FREQ=YEARLY") ? "yearly" : void 0,
					dtstart: e.start_at,
					...e.rrule_until ? { until: e.rrule_until } : {}
				};
				base.duration = msToDuration(new Date(e.end_at).getTime() - new Date(e.start_at).getTime());
			} else {
				base.start = e.start_at;
				base.end = e.end_at;
			}
			return base;
		});
	}, [allEvents, enabledTypes]);
	const toggleType = (t) => {
		setEnabledTypes((prev) => {
			const next = new Set(prev);
			next.has(t) ? next.delete(t) : next.add(t);
			return next;
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/Calendar.tsx:117:5:a014ba5538330e9f663b7cf36a5c193936ae1b428a3c69639812212721ca6f4d:1",
		className: "container mx-auto px-4 py-5 sm:py-8 space-y-5 max-w-5xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				"data-inspector-source": "pages/Calendar.tsx:118:7:546153273b80ed6f18b3bd21946d9af797bd5ae4ab2d2bd785a8616b16e6b12c:1",
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/Calendar.tsx:119:9:022c7680dd5804e6d855e057bc6f5af8daf8e535e2ed831271ed35d696191b60:1",
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "pages/Calendar.tsx:120:11:56ea4934ffe8c47db8c5184a311710889b8ac21ef22fe586c434aa974b45332b:1",
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-source": "pages/Calendar.tsx:121:13:31ce523c73833ffc7e54dd9b98d3a5cb146d6fbfdcd689219055484bb2df2c1a:1",
								className: "h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-5 w-5 text-primary" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								"data-inspector-source": "pages/Calendar.tsx:124:13:8f0929902330e7be31123331e3b56d676dc6516cc2f9b7d510ca523dfde2bcec:1",
								className: "text-xl sm:text-2xl font-bold text-foreground tracking-tight",
								children: isZh ? "日历" : "Calendar"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							className: "rounded-full shrink-0",
							onClick: openCreate,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1.5" }), isZh ? "新建事件" : "New event"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "pages/Calendar.tsx:131:9:3980ca3ca2a59023271de4c2cc249bbdc95640b65edd10c5a55f64390dac6e91:1",
						className: "text-[13px] sm:text-sm text-muted-foreground leading-relaxed",
						children: isZh ? "家庭日程、护理任务、用药与可约时间，一目了然。" : "Family schedule, care tasks, medicine & availability — all in one view."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						className: "rounded-full font-medium text-[11px]",
						children: isLoading ? isZh ? "加载中…" : "Loading…" : isZh ? `${allEvents.length} 条 · 实时` : `${allEvents.length} event${allEvents.length === 1 ? "" : "s"} · live`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-4 rounded-2xl border-border/60 shadow-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "pages/Calendar.tsx:142:9:2641a7b8e8b7de60be057f6a997845823a10241b8f7ec013ab2b1b3433213e11:1",
					className: "text-[13px] font-medium mb-3 text-foreground/90",
					children: isZh ? "显示事件类型" : "Show event types"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "pages/Calendar.tsx:143:9:da99eae503c6bba6c4c1fb547ad6f7da75305f4b90823d57e0edf001eb358872:1",
					className: "flex flex-wrap gap-1.5",
					children: ALL_TYPES.map((t) => {
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							"data-inspector-source": "pages/Calendar.tsx:147:15:d28290e03c35730f2c3304a925423562ff2093be356c903abb6ad4b64f783fba:1",
							type: "button",
							onClick: () => toggleType(t),
							className: `flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12px] font-medium transition-all border ${enabledTypes.has(t) ? "bg-foreground/[0.04] border-border text-foreground" : "bg-transparent border-transparent text-muted-foreground opacity-50 hover:opacity-80"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-source": "pages/Calendar.tsx:157:17:39e4d6312ccfe1ddff16db3490f7aee7f6091137dcd3920591538d38f0a42421:1",
								className: "inline-block h-2.5 w-2.5 rounded-full",
								style: { backgroundColor: EVENT_TYPE_COLORS[t] }
							}), getEventTypeLabel(t, i18n.language)]
						}, t);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "p-2.5 sm:p-4 rounded-2xl border-border/60 shadow-none overflow-hidden\n        [&_.fc]:font-sans\n        [&_.fc-toolbar.fc-header-toolbar]:!flex [&_.fc-toolbar.fc-header-toolbar]:!flex-col [&_.fc-toolbar.fc-header-toolbar]:!gap-2.5 [&_.fc-toolbar.fc-header-toolbar]:!items-stretch [&_.fc-toolbar.fc-header-toolbar]:!mb-3\n        sm:[&_.fc-toolbar.fc-header-toolbar]:!flex-row sm:[&_.fc-toolbar.fc-header-toolbar]:!items-center\n        [&_.fc-toolbar-chunk]:!flex [&_.fc-toolbar-chunk]:!items-center [&_.fc-toolbar-chunk]:!justify-center [&_.fc-toolbar-chunk]:!gap-1\n        [&_.fc-toolbar-title]:!text-base [&_.fc-toolbar-title]:!font-semibold [&_.fc-toolbar-title]:text-foreground\n        sm:[&_.fc-toolbar-title]:!text-lg\n        [&_.fc-button]:!bg-transparent [&_.fc-button]:!border [&_.fc-button]:!border-border [&_.fc-button]:!text-foreground [&_.fc-button]:!shadow-none [&_.fc-button]:!rounded-lg [&_.fc-button]:!font-medium [&_.fc-button]:!text-[12px] [&_.fc-button]:!px-2.5 [&_.fc-button]:!py-1.5 [&_.fc-button]:!h-auto [&_.fc-button]:!capitalize\n        [&_.fc-button:hover]:!bg-muted\n        [&_.fc-button-active]:!bg-primary [&_.fc-button-active]:!text-primary-foreground [&_.fc-button-active]:!border-primary\n        [&_.fc-button-primary:not(:disabled).fc-button-active]:!bg-primary [&_.fc-button-primary:not(:disabled).fc-button-active]:!text-primary-foreground\n        [&_.fc-button:focus]:!shadow-none [&_.fc-button:focus]:!ring-2 [&_.fc-button:focus]:!ring-ring/30\n        [&_.fc-icon]:!text-[14px]\n        [&_.fc-col-header-cell]:!border-border/40 [&_.fc-col-header-cell-cushion]:text-muted-foreground [&_.fc-col-header-cell-cushion]:!text-[11px] [&_.fc-col-header-cell-cushion]:!font-medium [&_.fc-col-header-cell-cushion]:!uppercase [&_.fc-col-header-cell-cushion]:!tracking-wide [&_.fc-col-header-cell-cushion]:!py-2\n        [&_.fc-daygrid-day]:!border-border/40\n        [&_.fc-daygrid-day-number]:text-foreground [&_.fc-daygrid-day-number]:!text-[12px] [&_.fc-daygrid-day-number]:!font-medium [&_.fc-daygrid-day-number]:!p-1.5\n        [&_.fc-day-today]:!bg-primary/[0.06]\n        [&_.fc-day-today_.fc-daygrid-day-number]:!text-primary [&_.fc-day-today_.fc-daygrid-day-number]:!font-semibold\n        [&_.fc-scrollgrid]:!border-border/40 [&_.fc-scrollgrid_td]:!border-border/40 [&_.fc-scrollgrid_th]:!border-border/40\n        [&_.fc-list-day-cushion]:!bg-muted/60\n        [&_.fc-list-event:hover_td]:!bg-accent/40\n        [&_.fc-event]:!rounded-md [&_.fc-event]:!border-0 [&_.fc-event]:!px-1.5 [&_.fc-event]:!text-[10px] [&_.fc-event]:!font-medium",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FullCalendar, {
					plugins: [
						index$2,
						index$3,
						index$4,
						index,
						index$1
					],
					initialView: "dayGridMonth",
					locale: isZh ? "zh-cn" : "en",
					firstDay: isZh ? 1 : 0,
					headerToolbar: {
						left: "prev,next today",
						center: "title",
						right: "dayGridMonth,timeGridWeek,listWeek"
					},
					buttonText: isZh ? {
						today: "今天",
						month: "月",
						week: "周",
						day: "日",
						list: "列表"
					} : {
						today: "Today",
						month: "Month",
						week: "Week",
						day: "Day",
						list: "List"
					},
					allDayText: isZh ? "全天" : "all-day",
					noEventsText: isZh ? "本周没有日程" : "No events this week",
					events: fcEvents,
					height: "auto",
					nowIndicator: true,
					dayMaxEvents: 2,
					fixedWeekCount: false,
					dateClick: openCreate,
					eventClick: (info) => {
						setSelectedEvent(info.event.extendedProps);
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!selectedEvent,
				onOpenChange: (o) => !o && setSelectedEvent(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
					className: "max-w-md",
					children: selectedEvent && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-source": "pages/Calendar.tsx:228:21:737572ec33e0f6c4e56499298a68cf162be952b37ad59f0271c3b3ae4138700f:1",
							className: "inline-block h-3 w-3 rounded-full",
							style: { backgroundColor: selectedEvent.color }
						}), selectedEvent.title]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						className: "mr-2",
						children: getEventTypeLabel(selectedEvent.event_type, i18n.language)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: PRIORITY_LABEL[selectedEvent.priority]?.[isZh ? "zh" : "en"] ?? selectedEvent.priority
					})] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/Calendar.tsx:241:17:d79db76178a6b6e5b6727b44b855af925d6f24a051614b1e06f591f8083207b5:1",
						className: "space-y-3 text-sm",
						children: [
							selectedEvent.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "pages/Calendar.tsx:243:21:db0cbf0d7cb5bca5fff10d017335ce531a12f827fd901a525ce8a48dc276737e:1",
								className: "text-muted-foreground",
								children: selectedEvent.description
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/Calendar.tsx:245:19:b74c1d730788bad270e6e9d8de3ba2e94f36724ca03634d016375df8aa562c5a:1",
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-source": "pages/Calendar.tsx:247:21:4357dd8cba747f75a12f49060d6d114fb03c37d8f91aeb2487bb0fb025869c9e:1",
									children: selectedEvent.all_day ? isZh ? `${formatDate(selectedEvent.start_at)} · 全天` : `${formatDate(selectedEvent.start_at)} · All day` : `${formatDateTime(selectedEvent.start_at)} → ${formatTime(selectedEvent.end_at)}`
								})]
							}),
							selectedEvent.location && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/Calendar.tsx:254:21:3bb1a124b206a598b007a8fe16f9977b02689922b500895a59d2c42b0c32a119:1",
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-source": "pages/Calendar.tsx:256:23:01f7aadd0e0c892cc818c5d5346e6c36412726480ae786ee7b140be31c646883:1",
									children: selectedEvent.location
								})]
							}),
							selectedEvent.rrule && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/Calendar.tsx:260:21:3bb1a124b206a598b007a8fe16f9977b02689922b500895a59d2c42b0c32a119:1",
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
									"data-inspector-source": "pages/Calendar.tsx:262:23:6cc642d6ebcafab9992a99d4216b9d73b8b991feb22ee6c05ce3888a8018978a:1",
									className: "text-xs bg-muted px-2 py-0.5 rounded-sm",
									children: selectedEvent.rrule
								})]
							}),
							selectedEvent.is_availability && selectedEvent.availability_note && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/Calendar.tsx:266:21:ba93df5f235e2f552a05ec55f75d5cf4d4451e05e68cff3b75f83076b527e5d1:1",
								className: "flex items-start gap-2 p-3 bg-success/10 rounded-lg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4 text-success mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-source": "pages/Calendar.tsx:268:23:1cfe7ae1cc2e0bf9bf835c5ab52f921d623d7b2600b3ba5ab31da3dc83518fac:1",
									className: "text-success",
									children: selectedEvent.availability_note
								})]
							}),
							selectedEvent.meeting_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								size: "sm",
								className: "w-full",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									"data-inspector-source": "pages/Calendar.tsx:273:23:6aec749213a308603679e728bc0a00a4294f1b78bbd0fd2b21ccdb627493b7f2:1",
									href: selectedEvent.meeting_url,
									target: "_blank",
									rel: "noreferrer",
									children: isZh ? "加入会议" : "Join meeting"
								})
							}),
							selectedEvent.source_cct_slug ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "pages/Calendar.tsx:279:21:10358687e9d44a4e567aa3bb0307027692e985fad2289a6aeaa8fa2f065dbae9:1",
								className: "text-[12px] text-muted-foreground",
								children: isZh ? "这条日程来自其他功能，请到对应页面修改。" : "This came from another part of the app — change it there."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/Calendar.tsx:285:21:53b761001b7ccf880f954e4df8e5b45c2e9bc275b8d0f145c3ac6f973a6d5b3d:1",
								className: "flex gap-2 pt-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									className: "flex-1",
									onClick: () => openEdit(selectedEvent),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4 mr-1.5" }), isZh ? "编辑" : "Edit"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									className: "flex-1 text-destructive hover:text-destructive",
									disabled: deleting,
									onClick: () => removeEvent(selectedEvent),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 mr-1.5" }), deleting ? isZh ? "删除中…" : "Deleting…" : isZh ? "删除" : "Delete"]
								})]
							})
						]
					})] })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventFormDialog, {
				open: formOpen,
				onOpenChange: setFormOpen,
				event: editing,
				onSaved: refresh
			})
		]
	});
}
function msToDuration(ms) {
	const totalMin = Math.max(1, Math.round(ms / 6e4));
	const h = Math.floor(totalMin / 60);
	const m = totalMin % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
//#endregion
export { CalendarPage as default };
