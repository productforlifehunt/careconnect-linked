import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { n as CardContent, t as Card } from "./card-Cz5iPbNd.mjs";
import { t as Badge } from "./badge-Dn-oRli-.mjs";
import { t as Input } from "./input-DmTt3-fi.mjs";
import { t as Textarea } from "./textarea-DPamDMgK.mjs";
import { n as formatDateTime, t as formatDate } from "./locale-DKwjQju2.mjs";
import { Hn as Bot, On as CircleAlert, P as SkipForward, Pn as Check, at as Play, dt as Pen, it as Plus, jt as LoaderCircle, pt as Pause, qt as History, w as StickyNote, xn as ClipboardCheck, y as Trash2 } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-COszB6Fv.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { B as useCheckinLogs, V as useCheckins, Wn as useTodayCheckinLogs, X as useCreateCheckin, _t as useDeleteCheckin, rn as useLogCheckin, rr as useUpdateCheckin } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { n as useAIAssistant } from "./AIAssistantContext-D0EXt93v.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CheckInCard-B1P462FM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function formatSlot(slot, isCN) {
	const [hourRaw = "8", minuteRaw = "00"] = String(slot || "08:00").split(":");
	const hour = Number(hourRaw);
	const minute = Number(minuteRaw);
	if (isCN) return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
	const isPM = hour >= 12;
	return `${hour > 12 ? hour - 12 : hour || 12}:${String(minute).padStart(2, "0")} ${isPM ? "PM" : "AM"}`;
}
var STATUS_STYLE = {
	checked: "bg-success/10 text-success border-success/30",
	skipped: "bg-warning/10 text-warning border-warning/30",
	missed: "bg-destructive/10 text-destructive border-destructive/30"
};
function CheckInCard({ caredOneId }) {
	const { toast } = useToast();
	const { user } = useAuth();
	const { i18n } = useTranslation();
	const isCN = i18n.language?.startsWith("zh");
	const Z = (cn, en) => isCN ? cn : en;
	const STATUS_LABEL = {
		checked: Z("已签到", "Checked"),
		skipped: Z("已跳过", "Skipped"),
		missed: Z("未完成", "Missed")
	};
	const { data: checkins, isLoading } = useCheckins(caredOneId);
	const { data: logs } = useCheckinLogs(caredOneId);
	const { data: todayLogs } = useTodayCheckinLogs(caredOneId);
	const create = useCreateCheckin();
	const update = useUpdateCheckin();
	const remove = useDeleteCheckin();
	const logCheckin = useLogCheckin();
	const [addOpen, setAddOpen] = (0, import_react.useState)(false);
	const [view, setView] = (0, import_react.useState)("today");
	const [editOpen, setEditOpen] = (0, import_react.useState)({
		open: false,
		checkin: null
	});
	const [deleteConfirm, setDeleteConfirm] = (0, import_react.useState)({
		open: false,
		checkin: null
	});
	const [logDialog, setLogDialog] = (0, import_react.useState)({
		open: false,
		checkin: null,
		status: "checked"
	});
	const [logNote, setLogNote] = (0, import_react.useState)("");
	const [historyOpen, setHistoryOpen] = (0, import_react.useState)({
		open: false,
		checkin: null
	});
	const { openWriteAssistant } = useAIAssistant();
	const autoOpenedRef = (0, import_react.useRef)(null);
	const [form, setForm] = (0, import_react.useState)({
		name: Z("签到", "Check-In"),
		detail: "",
		frequency: Z("每日一次", "Once daily"),
		time: "08:00",
		start_date: "",
		reminder_time_before: "0",
		time_to_send_to_caregiver: "",
		check_in_type: ["human"]
	});
	const openAICheckIn = (checkin) => {
		openWriteAssistant({
			skill: "record-check-in",
			id: `checkin-${checkin.id}-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}`,
			target: {
				caredOneId: String(caredOneId),
				recordId: String(checkin.id),
				label: checkin.name || Z("签到", "Check-In"),
				detail: checkin.detail || ""
			}
		});
	};
	(0, import_react.useEffect)(() => {
		if (!user?.general_user_role?.includes("cared one") || !checkins || !todayLogs) return;
		const now = /* @__PURE__ */ new Date();
		const nowMinutes = now.getHours() * 60 + now.getMinutes();
		const completed = new Set((todayLogs || []).map((l) => String(l.checkin_id)));
		const due = checkins.find((checkin) => {
			if (checkin.is_active === false || completed.has(String(checkin.id)) || !checkin.check_in_type?.includes("ai")) return false;
			const slot = Array.isArray(checkin.time_slot) ? checkin.time_slot[0] : checkin.time_slot;
			const [h = "0", m = "0"] = String(slot || "").split(":");
			const scheduled = Number(h) * 60 + Number(m);
			return Number.isFinite(scheduled) && nowMinutes >= scheduled;
		});
		if (!due) return;
		const key = `${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}-${due.id}`;
		if (autoOpenedRef.current === key) return;
		autoOpenedRef.current = key;
		openAICheckIn(due);
	}, [
		checkins,
		todayLogs,
		user?.general_user_role
	]);
	const todayStatusByCheckin = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		(todayLogs || []).forEach((log) => {
			const cid = String(log.checkin_id || log.medicine_id || "");
			if (cid && !map.has(cid)) map.set(cid, log.status || "checked");
		});
		return map;
	}, [todayLogs]);
	const missedTodayIds = (0, import_react.useMemo)(() => {
		const now = /* @__PURE__ */ new Date();
		const nowMins = now.getHours() * 60 + now.getMinutes();
		const ids = /* @__PURE__ */ new Set();
		(checkins || []).forEach((c) => {
			if (todayStatusByCheckin.has(String(c.id))) return;
			const earliest = (Array.isArray(c.time_slot) && c.time_slot.length ? c.time_slot : ["08:00"]).reduce((min, s) => {
				const [h = "0", m = "0"] = String(s).split(":");
				const v = Number(h) * 60 + Number(m);
				return v < min ? v : min;
			}, Number.POSITIVE_INFINITY);
			if (nowMins > earliest + 60) ids.add(String(c.id));
		});
		return ids;
	}, [checkins, todayStatusByCheckin]);
	const handleCreate = () => {
		create.mutate({
			user_id: caredOneId,
			name: form.name,
			detail: form.detail || void 0,
			frequency: form.frequency,
			time_slot: [form.time],
			start_date: form.start_date || void 0,
			reminder_time_before: form.reminder_time_before === "" ? 0 : Number(form.reminder_time_before),
			time_to_send_to_caregiver: form.time_to_send_to_caregiver === "" ? void 0 : Number(form.time_to_send_to_caregiver),
			check_in_type: form.check_in_type
		}, {
			onSuccess: () => {
				setForm({
					name: Z("签到", "Check-In"),
					detail: "",
					frequency: Z("每日一次", "Once daily"),
					time: "08:00",
					start_date: "",
					reminder_time_before: "0",
					time_to_send_to_caregiver: "",
					check_in_type: ["human"]
				});
				setAddOpen(false);
				toast({ title: Z("签到日程已创建 ✓", "Check-in schedule created ✓") });
			},
			onError: (e) => toast({
				title: Z("操作失败", "Failed"),
				description: String(e?.message || e),
				variant: "destructive"
			})
		});
	};
	const openLog = (checkin, status) => {
		setLogNote("");
		setLogDialog({
			open: true,
			checkin,
			status
		});
	};
	const confirmLog = () => {
		const { checkin, status } = logDialog;
		logCheckin.mutate({
			checkin_id: String(checkin.id),
			status,
			note: logNote || void 0,
			cared_one_id: caredOneId,
			checkin_name: checkin.name
		}, {
			onSuccess: () => {
				setLogDialog({
					open: false,
					checkin: null,
					status: "checked"
				});
				setLogNote("");
				toast({ title: Z(`签到${STATUS_LABEL[status]} ✓`, `Check-in ${STATUS_LABEL[status].toLowerCase()} ✓`) });
			},
			onError: (e) => toast({
				title: Z("操作失败", "Failed"),
				description: String(e?.message || e),
				variant: "destructive"
			})
		});
	};
	const togglePause = (checkin) => {
		update.mutate({
			id: String(checkin.id),
			is_active: !checkin.is_active
		}, {
			onSuccess: () => toast({ title: checkin.is_active ? Z("签到已暂停", "Check-in paused") : Z("签到已恢复 ✓", "Check-in resumed ✓") }),
			onError: (e) => toast({
				title: Z("操作失败", "Failed"),
				description: String(e?.message || e),
				variant: "destructive"
			})
		});
	};
	const openEdit = (checkin) => {
		const slot = Array.isArray(checkin.time_slot) && checkin.time_slot.length ? checkin.time_slot[0] : "08:00";
		setForm({
			name: checkin.name || "",
			detail: checkin.detail || "",
			frequency: checkin.frequency || Z("每日一次", "Once daily"),
			time: slot,
			start_date: checkin.start_date || "",
			reminder_time_before: checkin.reminder_time_before != null ? String(checkin.reminder_time_before) : "0",
			time_to_send_to_caregiver: checkin.time_to_send_to_caregiver != null ? String(checkin.time_to_send_to_caregiver) : "",
			check_in_type: Array.isArray(checkin.check_in_type) && checkin.check_in_type.length ? checkin.check_in_type : ["human"]
		});
		setEditOpen({
			open: true,
			checkin
		});
	};
	const handleEditSave = () => {
		update.mutate({
			id: String(editOpen.checkin.id),
			name: form.name,
			detail: form.detail || "",
			frequency: form.frequency,
			time_slot: [form.time],
			start_date: form.start_date || "",
			reminder_time_before: form.reminder_time_before === "" ? 0 : Number(form.reminder_time_before),
			time_to_send_to_caregiver: form.time_to_send_to_caregiver === "" ? null : Number(form.time_to_send_to_caregiver),
			check_in_type: form.check_in_type
		}, {
			onSuccess: () => {
				setEditOpen({
					open: false,
					checkin: null
				});
				toast({ title: Z("签到已更新 ✓", "Check-in updated ✓") });
			},
			onError: (e) => toast({
				title: Z("操作失败", "Failed"),
				description: String(e?.message || e),
				variant: "destructive"
			})
		});
	};
	const confirmDelete = () => {
		remove.mutate(String(deleteConfirm.checkin.id), {
			onSuccess: () => {
				setDeleteConfirm({
					open: false,
					checkin: null
				});
				toast({ title: Z("签到已删除", "Check-in deleted") });
			},
			onError: (e) => toast({
				title: Z("操作失败", "Failed"),
				description: String(e?.message || e),
				variant: "destructive"
			})
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/cared-ones/CheckInCard.tsx:240:5:7d9b64e2b3d3009104b259db8525641c470f96c72d612cc057b0833cbdeb2660:1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/CheckInCard.tsx:241:7:b11c727e4fae8e8b5bdc4d990285164457ce8b70eaa0bbb96e778a29473c72fa:1",
				className: "flex flex-wrap items-center justify-between gap-2 mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					"data-inspector-source": "components/cared-ones/CheckInCard.tsx:242:9:15ed77ae69364a428c5894310ec7c3cc5daa146ada87326808425974dacfb982:1",
					className: "min-w-0 text-lg font-bold text-foreground",
					children: Z("签到", "Check-In")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/cared-ones/CheckInCard.tsx:243:9:939884db6b80be08f78c6ae0fab3c7428f7926a76762ba551555e64f7a36f52a:1",
					className: "flex w-full min-w-0 items-center gap-2 sm:w-auto",
					"aria-label": Z("签到视图与添加", "Check-in views and add"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/cared-ones/CheckInCard.tsx:244:11:5f97dc54f87cb5379b3efb6632c7240b12dc90d5eec38b06666b72f317a72354:1",
						className: "grid h-9 min-w-0 flex-1 grid-cols-[1fr_0.85fr_1.2fr] overflow-hidden rounded-lg border sm:w-[228px] sm:flex-none",
						role: "tablist",
						"aria-label": Z("签到视图", "Check-in views"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								role: "tab",
								"aria-selected": view === "today",
								variant: "ghost",
								onClick: () => setView("today"),
								className: `h-full min-w-0 rounded-none px-2 text-xs ${view === "today" ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "text-muted-foreground"}`,
								children: Z("时间线", "Timeline")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								role: "tab",
								"aria-selected": view === "records",
								variant: "ghost",
								onClick: () => setView("records"),
								className: `h-full min-w-0 rounded-none px-2 text-xs ${view === "records" ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "text-muted-foreground"}`,
								children: Z("记录", "Records")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								role: "tab",
								"aria-selected": view === "manage",
								variant: "ghost",
								onClick: () => setView("manage"),
								className: `h-full min-w-0 rounded-none px-2 text-xs ${view === "manage" ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "text-muted-foreground"}`,
								children: Z("签到管理", "Manage")
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						className: "h-9 w-20 shrink-0",
						onClick: () => setAddOpen(true),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }),
							" ",
							Z("添加", "Add")
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: addOpen,
				onOpenChange: setAddOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: Z("创建签到日程", "Create Check-In Schedule") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: Z("定个时间，每天问一声他今天怎么样。", "Pick a time to ask how they are doing each day.") })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/CheckInCard.tsx:260:11:2995dfc8cb02ff86e5b949e1f6885e03932586a0dbe7a96a660c24336b94b5e2:1",
							className: "space-y-3 mt-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:261:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-sm",
										children: Z("名称", "Name")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.name,
										onChange: (e) => setForm((p) => ({
											...p,
											name: e.target.value
										}))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:265:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-sm",
										children: Z("详情", "Detail")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.detail,
										onChange: (e) => setForm((p) => ({
											...p,
											detail: e.target.value
										})),
										placeholder: Z("简短描述(可选)", "Short description (optional)")
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:269:13:37078065acf0e00bda900d47a69b1df85a33458fc30b9f78a703de0c2b5b767c:1",
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:270:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-sm",
											children: Z("频率", "Frequency")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.frequency,
											onChange: (e) => setForm((p) => ({
												...p,
												frequency: e.target.value
											})),
											placeholder: Z("每日一次", "Once daily")
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:274:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-sm",
											children: Z("计划时间", "Scheduled time")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "time",
											value: form.time,
											onChange: (e) => setForm((p) => ({
												...p,
												time: e.target.value || "08:00"
											}))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:279:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-sm",
										children: Z("开始日期", "Start date")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: form.start_date,
										onChange: (e) => setForm((p) => ({
											...p,
											start_date: e.target.value
										}))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:283:13:37078065acf0e00bda900d47a69b1df85a33458fc30b9f78a703de0c2b5b767c:1",
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:284:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-sm",
											children: Z("提前提醒(分钟)", "Remind before (min)")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											min: "0",
											value: form.reminder_time_before,
											onChange: (e) => setForm((p) => ({
												...p,
												reminder_time_before: e.target.value
											}))
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:288:15:f3f43257fc886bc4777fcc7461b2973f343861e96f893f279efea507b498465d:1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-sm",
											children: Z("多久通知护理者(分钟)", "Notify caregiver after (min)")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											min: "0",
											value: form.time_to_send_to_caregiver,
											onChange: (e) => setForm((p) => ({
												...p,
												time_to_send_to_caregiver: e.target.value
											}))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:293:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-sm",
										children: Z("签到方式", "Check-in type")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:295:15:c144db72fe5124e7cb367c94e5a65dda927910dd7ceb975a4ca3a96835686288:1",
										className: "flex gap-4 mt-1",
										children: ["ai", "human"].map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											"data-inspector-source": "components/cared-ones/CheckInCard.tsx:297:19:9c170f2392d7cd9f7c9de11772e83be2362b505f0d6303755b7f24db0075fcc1:1",
											className: "flex items-center gap-2 text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												"data-inspector-source": "components/cared-ones/CheckInCard.tsx:298:21:9d02b49668bb7a04e8710917a2fd66f6915aec5803ea1823a08113a84799f59b:1",
												type: "checkbox",
												checked: form.check_in_type.includes(type),
												onChange: (e) => setForm((p) => ({
													...p,
													check_in_type: e.target.checked ? [...p.check_in_type, type] : p.check_in_type.filter((v) => v !== type)
												}))
											}), type === "ai" ? Z("AI 签到", "AI check-in") : Z("人工签到", "Human check-in")]
										}, type))
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setAddOpen(false),
							children: Z("取消", "Cancel")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: handleCreate,
							disabled: create.isPending || !form.name.trim(),
							children: [
								create.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "h-4 w-4 mr-2" }),
								" ",
								Z("保存", "Save")
							]
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: logDialog.open,
				onOpenChange: (o) => !o && setLogDialog({
					open: false,
					checkin: null,
					status: "checked"
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2",
							children: [logDialog.status === "checked" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-5 w-5 text-success" }) : logDialog.status === "skipped" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "h-5 w-5 text-warning" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-5 w-5 text-destructive" }), Z(`标记为${STATUS_LABEL[logDialog.status]}`, `Mark as ${STATUS_LABEL[logDialog.status]}`)]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
							logDialog.checkin?.name,
							" — ",
							Z("添加可选备注", "add an optional note")
						] })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: logNote,
							onChange: (e) => setLogNote(e.target.value),
							rows: 3,
							placeholder: Z("情况如何?", "How did it go?")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setLogDialog({
								open: false,
								checkin: null,
								status: "checked"
							}),
							children: Z("取消", "Cancel")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: confirmLog,
							disabled: logCheckin.isPending,
							children: [
								logCheckin.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }),
								" ",
								Z("确认", "Confirm")
							]
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: historyOpen.open,
				onOpenChange: (o) => !o && setHistoryOpen({
					open: false,
					checkin: null
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-lg max-h-[80vh] flex flex-col",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "h-5 w-5 text-primary" }),
							" ",
							historyOpen.checkin?.name,
							" — ",
							Z("历史记录", "History")
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "components/cared-ones/CheckInCard.tsx:353:11:35e58f8ebeb114df4701afebc660598df309009866bd9067a00c7be1e5f7310c:1",
						className: "flex-1 overflow-y-auto space-y-1",
						children: (logs || []).filter((l) => String(l.checkin_id) === String(historyOpen.checkin?.id)).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "components/cared-ones/CheckInCard.tsx:355:15:7dc2688e57807f56a430b0e4bd54ba03e0c6482f9b5bfb79b382818d1a9601cb:1",
							className: "text-center text-muted-foreground py-8",
							children: Z("暂无记录", "No logs yet")
						}) : (logs || []).filter((l) => String(l.checkin_id) === String(historyOpen.checkin?.id)).map((log) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/CheckInCard.tsx:358:17:75099a663977dc895403fd8fbb18aa489d997b558755a591e29ab1a56c54e511:1",
							className: "flex items-start gap-3 py-2 border-b border-border/50 last:border-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: STATUS_STYLE[log.status] || "",
								children: STATUS_LABEL[log.status] || log.status
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/cared-ones/CheckInCard.tsx:360:19:6c7e01a82bed7b5be9659555d26252fa1b29a459f38ae1c7991bc5c13fe68b12:1",
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:361:21:6c430d13372f372af8d818aae42e687d2f00f885e6828e3ba0a4341a82cbd2c5:1",
									className: "text-xs text-muted-foreground",
									children: formatDateTime(log.created_at, isCN ? "zh-CN" : void 0)
								}), log.note && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:362:34:7f652b0d0efbb18e4d82aa38ee472b61463d47832a53d9f39a3691888b448ef7:1",
									className: "text-xs mt-0.5 flex items-start gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickyNote, { className: "h-3 w-3 mt-0.5 shrink-0" }), log.note]
								})]
							})]
						}, log.id))
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: editOpen.open,
				onOpenChange: (o) => !o && setEditOpen({
					open: false,
					checkin: null
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: Z("编辑签到日程", "Edit Check-In Schedule") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: Z("更新这个定期签到。", "Update this recurring check-in.") })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/CheckInCard.tsx:378:11:2995dfc8cb02ff86e5b949e1f6885e03932586a0dbe7a96a660c24336b94b5e2:1",
							className: "space-y-3 mt-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:379:13:40968f52c62074d8fae761b55e8e500ced78ac05fcde4453fee232ba4ccbbc4a:1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-sm",
										children: Z("名称", "Name")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.name,
										onChange: (e) => setForm((p) => ({
											...p,
											name: e.target.value
										}))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:380:13:3cdbc51e015a2cd796c025cecd114ba421bfb4812edf2a12d9ab5ed7aa486a1b:1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-sm",
										children: Z("详情", "Detail")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.detail,
										onChange: (e) => setForm((p) => ({
											...p,
											detail: e.target.value
										}))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:381:13:37078065acf0e00bda900d47a69b1df85a33458fc30b9f78a703de0c2b5b767c:1",
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:382:15:bd3ef72b38dc50875ebff77039a6c6bd13d46d820c839a0c38f7337f227411f5:1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-sm",
											children: Z("频率", "Frequency")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.frequency,
											onChange: (e) => setForm((p) => ({
												...p,
												frequency: e.target.value
											}))
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:383:15:64e2193764e1fcf146312669afec3cb98850a4f3a20ce0cb4f5451019abca6e3:1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-sm",
											children: Z("计划时间", "Scheduled time")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "time",
											value: form.time,
											onChange: (e) => setForm((p) => ({
												...p,
												time: e.target.value || "08:00"
											}))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:385:13:1c7e38c879bff6251cf95f4485423f07bc0ab0e8cc2e6037e3340109bd77a20c:1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-sm",
										children: Z("开始日期", "Start date")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: form.start_date,
										onChange: (e) => setForm((p) => ({
											...p,
											start_date: e.target.value
										}))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:386:13:37078065acf0e00bda900d47a69b1df85a33458fc30b9f78a703de0c2b5b767c:1",
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:387:15:e45d56d4b4b0fe13c4c75067f4c2e535b5aa83f98e2586a1254f5bf01d9e7991:1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-sm",
											children: Z("提前提醒(分钟)", "Remind before (min)")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											min: "0",
											value: form.reminder_time_before,
											onChange: (e) => setForm((p) => ({
												...p,
												reminder_time_before: e.target.value
											}))
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:388:15:5e7ae1ad494154a6102fb6166da73de642766801194f0ecebe3dbe12eea3eeb0:1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-sm",
											children: Z("多久通知护理者(分钟)", "Notify caregiver after (min)")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											min: "0",
											value: form.time_to_send_to_caregiver,
											onChange: (e) => setForm((p) => ({
												...p,
												time_to_send_to_caregiver: e.target.value
											}))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:390:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-sm",
										children: Z("签到方式", "Check-in type")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:392:15:c144db72fe5124e7cb367c94e5a65dda927910dd7ceb975a4ca3a96835686288:1",
										className: "flex gap-4 mt-1",
										children: ["ai", "human"].map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											"data-inspector-source": "components/cared-ones/CheckInCard.tsx:394:19:9c170f2392d7cd9f7c9de11772e83be2362b505f0d6303755b7f24db0075fcc1:1",
											className: "flex items-center gap-2 text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												"data-inspector-source": "components/cared-ones/CheckInCard.tsx:395:21:1219a22f478c8d64328bd8e1242aea5ad731bbd7882fc487c3ff3b04ba5377ad:1",
												type: "checkbox",
												checked: form.check_in_type.includes(type),
												onChange: (e) => setForm((p) => ({
													...p,
													check_in_type: e.target.checked ? [...p.check_in_type, type] : p.check_in_type.filter((v) => v !== type)
												}))
											}), type === "ai" ? Z("AI 签到", "AI check-in") : Z("人工签到", "Human check-in")]
										}, type))
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setEditOpen({
								open: false,
								checkin: null
							}),
							children: Z("取消", "Cancel")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: handleEditSave,
							disabled: update.isPending || !form.name.trim(),
							children: [
								update.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }),
								" ",
								Z("保存", "Save")
							]
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: deleteConfirm.open,
				onOpenChange: (o) => !o && setDeleteConfirm({
					open: false,
					checkin: null
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-5 w-5 text-destructive" }),
							" ",
							Z("删除签到?", "Delete check-in?")
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: isCN ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						"这将永久删除 ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							"data-inspector-source": "components/cared-ones/CheckInCard.tsx:416:49:f631e8251c68d0d1577fc2f86a729701e05c9ac2017d5e3cca84ffc501c535cd:0",
							children: deleteConfirm.checkin?.name
						}),
						"。已记录的历史将保留。"
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						"This will permanently delete ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							"data-inspector-source": "components/cared-ones/CheckInCard.tsx:416:143:f631e8251c68d0d1577fc2f86a729701e05c9ac2017d5e3cca84ffc501c535cd:0",
							children: deleteConfirm.checkin?.name
						}),
						". Logged history will remain."
					] }) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setDeleteConfirm({
							open: false,
							checkin: null
						}),
						children: Z("取消", "Cancel")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "destructive",
						onClick: confirmDelete,
						disabled: remove.isPending,
						children: [
							remove.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }),
							" ",
							Z("删除", "Delete")
						]
					})] })]
				})
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" }) : (checkins || []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/CheckInCard.tsx:430:9:46119a07a0831a6dbbe6f75edb4540edbf84f4bf35c3a0cf51a944e0aa862c41:1",
				className: "text-center py-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "h-10 w-10 text-muted-foreground mx-auto mb-3" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/cared-ones/CheckInCard.tsx:432:11:dca1dbcf941128c13f919e45bb1a356ba2f5e983ebe36dab2deffc65bfd874c9:1",
						className: "text-muted-foreground mb-3",
						children: Z("暂无签到日程", "No check-in schedules yet")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "coral",
						size: "sm",
						onClick: () => setAddOpen(true),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }),
							" ",
							Z("创建第一个签到日程", "First Check-In Schedule")
						]
					})
				]
			}) : view === "records" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/CheckInCard.tsx:436:9:a9929ebdeed0219092c2fcd37f2f2e7dc244c8e4e2f4be9fa5f3c342ed4ae6f9:1",
				className: "space-y-2",
				children: [(logs || []).map((log) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-transparent card-elevated",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-3 flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/CheckInCard.tsx:440:17:cb0bcb1bc216e26d01846c31a47381f2f116c1144d8e1591d24588612cb7cc2f:1",
							className: "flex items-center gap-2 min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: STATUS_STYLE[log.status] || "",
									children: STATUS_LABEL[log.status] || log.status
								}),
								log.checked_by_ai && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									className: "text-xs border-primary/40 text-primary",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "h-3 w-3 mr-1" }), "AI"]
								}),
								log.note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:443:32:14371a6fc2e265b5a5dd55af581e9fda8d8331d08945bc5432ea6a3bb7e31c7e:1",
									className: "text-xs text-muted-foreground truncate",
									children: log.note
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-source": "components/cared-ones/CheckInCard.tsx:445:17:0c2b6a0cc6e34713f6d82a051d67edc9a8864eed7c35b267f23c474c12bc77f8:1",
							className: "text-xs text-muted-foreground shrink-0",
							children: formatDate(log.created_at, isCN ? "zh-CN" : "en", {
								month: "short",
								day: "numeric",
								hour: "numeric",
								minute: "2-digit"
							})
						})]
					})
				}, log.id)), (logs || []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "components/cared-ones/CheckInCard.tsx:449:41:ecc0580becfcf5ac625cbbb5c7b151f714203e5a7bcd90241dd395d91db70f81:1",
					className: "text-xs text-muted-foreground text-center py-4",
					children: Z("暂无历史", "No history yet")
				})]
			}) : view === "manage" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "components/cared-ones/CheckInCard.tsx:452:9:9691218ba3864011c02b10e0dfc141bd21cad293a3ea5b44156818e49c59dee3:1",
				className: "space-y-3",
				children: (checkins || []).map((checkin) => {
					const slots = Array.isArray(checkin.time_slot) && checkin.time_slot.length > 0 ? checkin.time_slot : ["08:00"];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border-transparent card-elevated",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/cared-ones/CheckInCard.tsx:458:19:c87a0044f6ece035164c918399398d8ed64ccf97427660a959384f0f70a010f6:1",
								className: "flex flex-col gap-3 md:flex-row md:items-start md:justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:459:21:7e92fa1cb7f722585e2d72c13c697dfb618334b5b769825562efeebdfc7de1ce:1",
									className: "min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "components/cared-ones/CheckInCard.tsx:460:23:9c74adccab2762420a8519a705cca954d512d2abcde47618634ae6d6ae68a8b0:1",
											className: "flex items-center gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "h-4 w-4 text-primary" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													"data-inspector-source": "components/cared-ones/CheckInCard.tsx:462:25:49351e6088c0971828eaa558faa59731d9f07e9b02dcdb05bf98223e29d032ea:1",
													className: "font-medium text-foreground",
													children: checkin.name
												}),
												!checkin.is_active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "outline",
													className: "text-xs",
													children: Z("已暂停", "Paused")
												})
											]
										}),
										checkin.detail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-source": "components/cared-ones/CheckInCard.tsx:465:42:7727db68c9b50b5b4b1c3f892cd9ab52940bde9c5d7690319d8d4cf03daa61fa:1",
											className: "text-xs text-muted-foreground mt-1",
											children: checkin.detail
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											"data-inspector-source": "components/cared-ones/CheckInCard.tsx:466:23:78063d89baa9cb55c7f2ac51eb5253aefaa0826af547a4f9d440b7a994e9218a:1",
											className: "text-xs text-muted-foreground mt-1",
											children: [
												checkin.frequency || Z("每日一次", "Once daily"),
												" · ",
												slots.map((s) => formatSlot(s, isCN)).join(", ")
											]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:470:21:d85f94a5b4a50aa92c758f610955e32961e187ac3241476774dba866f95fc263:1",
									className: "flex items-center gap-1 shrink-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "icon",
											variant: "ghost",
											className: "h-7 w-7",
											title: Z("历史", "History"),
											onClick: () => setHistoryOpen({
												open: true,
												checkin
											}),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "h-3.5 w-3.5" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "icon",
											variant: "ghost",
											className: "h-7 w-7",
											title: checkin.is_active ? Z("暂停", "Pause") : Z("恢复", "Resume"),
											onClick: () => togglePause(checkin),
											disabled: update.isPending,
											children: checkin.is_active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-3.5 w-3.5" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "icon",
											variant: "ghost",
											className: "h-7 w-7",
											title: Z("编辑", "Edit"),
											onClick: () => openEdit(checkin),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pen, { className: "h-3.5 w-3.5" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "icon",
											variant: "ghost",
											className: "h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10",
											title: Z("删除", "Delete"),
											onClick: () => setDeleteConfirm({
												open: true,
												checkin
											}),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
										})
									]
								})]
							})
						})
					}, checkin.id);
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "components/cared-ones/CheckInCard.tsx:485:9:9691218ba3864011c02b10e0dfc141bd21cad293a3ea5b44156818e49c59dee3:1",
				className: "space-y-3",
				children: (checkins || []).map((checkin) => {
					const slots = Array.isArray(checkin.time_slot) && checkin.time_slot.length > 0 ? checkin.time_slot : ["08:00"];
					const todayStatus = todayStatusByCheckin.get(String(checkin.id));
					const isMissed = missedTodayIds.has(String(checkin.id));
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border-transparent card-elevated",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/cared-ones/CheckInCard.tsx:493:19:c87a0044f6ece035164c918399398d8ed64ccf97427660a959384f0f70a010f6:1",
								className: "flex flex-col gap-3 md:flex-row md:items-start md:justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:494:21:7e92fa1cb7f722585e2d72c13c697dfb618334b5b769825562efeebdfc7de1ce:1",
									className: "min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "components/cared-ones/CheckInCard.tsx:495:23:9c74adccab2762420a8519a705cca954d512d2abcde47618634ae6d6ae68a8b0:1",
											className: "flex items-center gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "h-4 w-4 text-primary" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													"data-inspector-source": "components/cared-ones/CheckInCard.tsx:497:25:49351e6088c0971828eaa558faa59731d9f07e9b02dcdb05bf98223e29d032ea:1",
													className: "font-medium text-foreground",
													children: checkin.name
												}),
												!checkin.is_active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "outline",
													className: "text-xs",
													children: Z("已暂停", "Paused")
												})
											]
										}),
										checkin.detail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-source": "components/cared-ones/CheckInCard.tsx:500:42:7727db68c9b50b5b4b1c3f892cd9ab52940bde9c5d7690319d8d4cf03daa61fa:1",
											className: "text-xs text-muted-foreground mt-1",
											children: checkin.detail
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											"data-inspector-source": "components/cared-ones/CheckInCard.tsx:501:23:78063d89baa9cb55c7f2ac51eb5253aefaa0826af547a4f9d440b7a994e9218a:1",
											className: "text-xs text-muted-foreground mt-1",
											children: [
												checkin.frequency || Z("每日一次", "Once daily"),
												" · ",
												slots.map((s) => formatSlot(s, isCN)).join(", ")
											]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:505:21:7841d729b59d47ba2af99dbbc40394211c1da3e7ed2cd6074b6906ae182d6ee0:1",
									className: "flex flex-col items-end gap-2 shrink-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: todayStatus ? STATUS_STYLE[todayStatus] : isMissed ? STATUS_STYLE["missed"] : "bg-muted text-muted-foreground",
										children: todayStatus ? Z(`今天${STATUS_LABEL[todayStatus]}`, STATUS_LABEL[todayStatus] + " today") : isMissed ? Z("今天未完成", "Missed today") : Z("今天待办", "Pending today")
									}), !todayStatus && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:515:25:880e111dd88443b8e6fa9b788970782c1a50b4a5e06fe515a0c611c62b55c6ae:1",
										className: "flex items-center gap-1 flex-wrap justify-end",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "outline",
												className: "border-primary/40 text-primary hover:bg-primary/10",
												onClick: () => openAICheckIn(checkin),
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "h-3 w-3 mr-1" }),
													" ",
													Z("AI 签到", "AI Check")
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => openLog(checkin, "skipped"),
												disabled: logCheckin.isPending,
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "h-3 w-3 mr-1" }),
													" ",
													Z("跳过", "Skip")
												]
											}),
											isMissed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "outline",
												className: "border-destructive/40 text-destructive hover:bg-destructive/10",
												onClick: () => openLog(checkin, "missed"),
												disabled: logCheckin.isPending,
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-3 w-3 mr-1" }),
													" ",
													Z("未完成", "Missed")
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												onClick: () => openLog(checkin, "checked"),
												disabled: logCheckin.isPending,
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3 mr-1" }),
													" ",
													Z("签到", "Check")
												]
											})
										]
									})]
								})]
							})
						})
					}, checkin.id);
				})
			})
		]
	});
}
//#endregion
export { CheckInCard };
