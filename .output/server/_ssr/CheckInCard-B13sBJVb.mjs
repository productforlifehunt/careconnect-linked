import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { t as Badge } from "./badge-B2YCAhUo.mjs";
import { t as Input } from "./input-JWLlmFeK.mjs";
import { t as Textarea } from "./textarea-ZNemOC_7.mjs";
import { n as formatDateTime, t as formatDate } from "./locale-DKwjQju2.mjs";
import { Hn as Bot, On as CircleAlert, P as SkipForward, Pn as Check, at as Play, dt as Pen, it as Plus, jt as LoaderCircle, pt as Pause, qt as History, w as StickyNote, xn as ClipboardCheck, y as Trash2 } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-DHxbK-sS.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { B as useCheckinLogs, V as useCheckins, Wn as useTodayCheckinLogs, X as useCreateCheckin, _t as useDeleteCheckin, rn as useLogCheckin, rr as useUpdateCheckin } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { n as useAIAssistant } from "./AIAssistantContext-DkVIa2Bc.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CheckInCard-B13sBJVb.js
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
		"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/div/0",
		"data-inspector-source": "components/cared-ones/CheckInCard.tsx:240:5:7d9b64e2b3d3009104b259db8525641c470f96c72d612cc057b0833cbdeb2660:1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2 mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/h2/0",
					"data-inspector-source": "components/cared-ones/CheckInCard.tsx:242:9:15ed77ae69364a428c5894310ec7c3cc5daa146ada87326808425974dacfb982:1",
					className: "min-w-0 text-lg font-bold text-foreground",
					children: Z("签到", "Check-In")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/div/1",
					"data-inspector-source": "components/cared-ones/CheckInCard.tsx:243:9:939884db6b80be08f78c6ae0fab3c7428f7926a76762ba551555e64f7a36f52a:1",
					className: "flex w-full min-w-0 items-center gap-2 sm:w-auto",
					"aria-label": Z("签到视图与添加", "Check-in views and add"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/div/2",
						"data-inspector-source": "components/cared-ones/CheckInCard.tsx:244:11:5f97dc54f87cb5379b3efb6632c7240b12dc90d5eec38b06666b72f317a72354:1",
						className: "grid h-9 min-w-0 flex-1 grid-cols-[1fr_0.85fr_1.2fr] overflow-hidden rounded-lg border sm:w-[228px] sm:flex-none",
						role: "tablist",
						"aria-label": Z("签到视图", "Check-in views"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Button/d1ac371fa990",
								"data-inspector-source": "components/cared-ones/CheckInCard.tsx:245:13:71a95a45d1f9128d0fe28408997f26737bae71e257456d33fba914ca5f0c68ce:1",
								role: "tab",
								"aria-selected": view === "today",
								variant: "ghost",
								onClick: () => setView("today"),
								className: `h-full min-w-0 rounded-none px-2 text-xs ${view === "today" ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "text-muted-foreground"}`,
								children: Z("时间线", "Timeline")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Button/d1ac371fa990",
								"data-inspector-source": "components/cared-ones/CheckInCard.tsx:246:13:b77c439af0eadef8156e7439fa1b51828f4d940bd6bc7e4946d79f6cd1553c25:1",
								role: "tab",
								"aria-selected": view === "records",
								variant: "ghost",
								onClick: () => setView("records"),
								className: `h-full min-w-0 rounded-none px-2 text-xs ${view === "records" ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "text-muted-foreground"}`,
								children: Z("记录", "Records")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Button/d1ac371fa990",
								"data-inspector-source": "components/cared-ones/CheckInCard.tsx:247:13:2f68b0f0adf9e46acd7739220dfe999ef32fdf63c3847c03efac1814ad165173:1",
								role: "tab",
								"aria-selected": view === "manage",
								variant: "ghost",
								onClick: () => setView("manage"),
								className: `h-full min-w-0 rounded-none px-2 text-xs ${view === "manage" ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "text-muted-foreground"}`,
								children: Z("签到管理", "Manage")
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Button/98512c5a1f68",
						"data-inspector-source": "components/cared-ones/CheckInCard.tsx:249:11:8a4c4c8e5d6be40680ac4e49370faf343a21f30ff5603c6ece3552d60a8c88de:1",
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
				"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Dialog/98512c5a1f68",
				"data-inspector-source": "components/cared-ones/CheckInCard.tsx:254:7:0948f33fe93c407a8c4efe07c67f4b5b473c27ae9abaf58d027354e93eacabeb:1",
				open: addOpen,
				onOpenChange: setAddOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/DialogTitle/0",
							"data-inspector-source": "components/cared-ones/CheckInCard.tsx:257:13:c36a0f9a3e576548e9cfb6d6f43eae375e0961b98a268907127a45fd208ec9cc:1",
							children: Z("创建签到日程", "Create Check-In Schedule")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/DialogDescription/0",
							"data-inspector-source": "components/cared-ones/CheckInCard.tsx:258:13:a50331fd96f2a94abc9f9b086011d38a0154754a5e285ed1d3daa10720cf63b1:1",
							children: Z("定个时间，每天问一声他今天怎么样。", "Pick a time to ask how they are doing each day.")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 mt-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Label/0",
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:262:15:4362767c65cb0b855c6e166f403621eccdc5e21a5a90b6a99770d54e9be90d3b:1",
									className: "text-sm",
									children: Z("名称", "Name")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Input/e2e366b082e3",
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:263:15:9f827f519036c6fb57e15aabafad77c82b4b72f1b7c028b067b6a8db32fd0ef9:1",
									value: form.name,
									onChange: (e) => setForm((p) => ({
										...p,
										name: e.target.value
									}))
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Label/1",
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:266:15:c608b4e2304962d142cc935f518ff66dc2dfd36e82becc4e80341d76b5c2af75:1",
									className: "text-sm",
									children: Z("详情", "Detail")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Input/3bcf127ea833",
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:267:15:153e870d635134a0d46f036f7cb7ba37e00c881764013a501587294e44e22667:1",
									value: form.detail,
									onChange: (e) => setForm((p) => ({
										...p,
										detail: e.target.value
									})),
									placeholder: Z("简短描述(可选)", "Short description (optional)")
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Label/2",
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:271:17:f708f9ff493a072616e02098c0127a3fe92a06ec39cc6880139136e10295969a:1",
										className: "text-sm",
										children: Z("频率", "Frequency")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Input/b50457872a5f",
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:272:17:640b4c4dae4e867d46d6ddf4a8fb3aa2f71d5b85d0094a3da7d18d17134451b0:1",
										value: form.frequency,
										onChange: (e) => setForm((p) => ({
											...p,
											frequency: e.target.value
										})),
										placeholder: Z("每日一次", "Once daily")
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Label/3",
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:275:17:a1649593143111ce0432d1f26a0280fb2fbde800ffb972f49fb41081d78e050d:1",
										className: "text-sm",
										children: Z("计划时间", "Scheduled time")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Input/86c049492fd3",
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:276:17:429636b36d248ad4ca5978af0fe7102de39522f230a38a217537f8228e045912:1",
										type: "time",
										value: form.time,
										onChange: (e) => setForm((p) => ({
											...p,
											time: e.target.value || "08:00"
										}))
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Label/4",
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:280:15:e84f17637e27469f90bc37cfc535755643a6108e183aa06fa6bc84d70c97c76a:1",
									className: "text-sm",
									children: Z("开始日期", "Start date")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Input/fe0369b0fa42",
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:281:15:88761ac2569437ef44988e0889128956d5a1d25cdf4536b23be1b5f030c5f9de:1",
									type: "date",
									value: form.start_date,
									onChange: (e) => setForm((p) => ({
										...p,
										start_date: e.target.value
									}))
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Label/5",
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:285:17:393f368ed8d9b05d6965073128f6b9b9a8cb00e4559a332f0712704a04f83d26:1",
										className: "text-sm",
										children: Z("提前提醒(分钟)", "Remind before (min)")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Input/aa5d65242508",
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:286:17:ec7a3801599a993aecde22bd79d1f07f6e98caf8fe5b6acac52bf33c8bfd9752:1",
										type: "number",
										min: "0",
										value: form.reminder_time_before,
										onChange: (e) => setForm((p) => ({
											...p,
											reminder_time_before: e.target.value
										}))
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Label/6",
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:289:17:182bc7927326c7162cff7c473ae6d4abac3da9dc6a17d8bb6f6b39bc9ee5ebe2:1",
										className: "text-sm",
										children: Z("多久通知护理者(分钟)", "Notify caregiver after (min)")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Input/2ad2f72bb96e",
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:290:17:88eef6dc60570c41e829ae3563e60f89858ebb7dde94a94811ce6c8f4b89dae4:1",
										type: "number",
										min: "0",
										value: form.time_to_send_to_caregiver,
										onChange: (e) => setForm((p) => ({
											...p,
											time_to_send_to_caregiver: e.target.value
										}))
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Label/7",
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:294:15:f9e4b9090a2f1d1a611397a5a131c3fe734f05bd89bbf7bfff3716cd15b21961:1",
									className: "text-sm",
									children: Z("签到方式", "Check-in type")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/div/3",
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:295:15:c144db72fe5124e7cb367c94e5a65dda927910dd7ceb975a4ca3a96835686288:1",
									className: "flex gap-4 mt-1",
									children: ["ai", "human"].map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/label/0",
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:297:19:9c170f2392d7cd9f7c9de11772e83be2362b505f0d6303755b7f24db0075fcc1:1",
										className: "flex items-center gap-2 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/input/fabfbf1afe2e",
											"data-inspector-source": "components/cared-ones/CheckInCard.tsx:298:21:9d02b49668bb7a04e8710917a2fd66f6915aec5803ea1823a08113a84799f59b:1",
											type: "checkbox",
											checked: form.check_in_type.includes(type),
											onChange: (e) => setForm((p) => ({
												...p,
												check_in_type: e.target.checked ? [...p.check_in_type, type] : p.check_in_type.filter((v) => v !== type)
											}))
										}), type === "ai" ? Z("AI 签到", "AI check-in") : Z("人工签到", "Human check-in")]
									}, type))
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Button/98512c5a1f68",
							"data-inspector-source": "components/cared-ones/CheckInCard.tsx:317:13:5f1b4cf31cbb6693df15d02741bb5531de771ae03675e8b7f2808fc40724c1ea:1",
							variant: "outline",
							onClick: () => setAddOpen(false),
							children: Z("取消", "Cancel")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Button/5a58d0863a63",
							"data-inspector-source": "components/cared-ones/CheckInCard.tsx:318:13:a212628276547aa32e5cc6e5ec2169aa9f7fd3516010acdb800711498b01a69a:1",
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
				"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Dialog/720d50a48e6c",
				"data-inspector-source": "components/cared-ones/CheckInCard.tsx:326:7:e97b0210b071438cd3391549d56ecf9cd3109d6decbc1084dc5e99ab3757d35c:1",
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
							"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/DialogTitle/1",
							"data-inspector-source": "components/cared-ones/CheckInCard.tsx:329:13:c15677cb541d768a5dff24ae7b2861da9af7371992010546de7ce915fccaf083:1",
							className: "flex items-center gap-2",
							children: [logDialog.status === "checked" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-5 w-5 text-success" }) : logDialog.status === "skipped" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "h-5 w-5 text-warning" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-5 w-5 text-destructive" }), Z(`标记为${STATUS_LABEL[logDialog.status]}`, `Mark as ${STATUS_LABEL[logDialog.status]}`)]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
							"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/DialogDescription/1",
							"data-inspector-source": "components/cared-ones/CheckInCard.tsx:335:13:397caed6742e4a0098b308d0793e0da5d20aa92ba9433c4ba5ee1bc97523c6f0:1",
							children: [
								logDialog.checkin?.name,
								" — ",
								Z("添加可选备注", "add an optional note")
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Textarea/ff87d0d79660",
							"data-inspector-source": "components/cared-ones/CheckInCard.tsx:337:11:fff231df771634f72f0bff92680dd58f4b827aec5fd7a3b43942fec9ae6eefab:1",
							value: logNote,
							onChange: (e) => setLogNote(e.target.value),
							rows: 3,
							placeholder: Z("情况如何?", "How did it go?")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Button/aae83f78debe",
							"data-inspector-source": "components/cared-ones/CheckInCard.tsx:339:13:a36d63e8294389d45bb871c16bbf484d2a29504d669af1c4518a6dae04d49c99:1",
							variant: "outline",
							onClick: () => setLogDialog({
								open: false,
								checkin: null,
								status: "checked"
							}),
							children: Z("取消", "Cancel")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Button/bceacb0c8fb4",
							"data-inspector-source": "components/cared-ones/CheckInCard.tsx:340:13:00a59ae8790c73af509816aa1c799a681ed656b0e07e03da406dd57c56b697fc:1",
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
				"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Dialog/2d84b47635ff",
				"data-inspector-source": "components/cared-ones/CheckInCard.tsx:348:7:1214f024c453b81971758a95f9bbe77fc6e00f221ca42cde1ce604a276843c7f:1",
				open: historyOpen.open,
				onOpenChange: (o) => !o && setHistoryOpen({
					open: false,
					checkin: null
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-lg max-h-[80vh] flex flex-col",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/DialogTitle/2",
						"data-inspector-source": "components/cared-ones/CheckInCard.tsx:351:13:7bdbf289d1d62b3b8667d0e579c829185b75d42d6e99dc4905824389a1373c09:1",
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "h-5 w-5 text-primary" }),
							" ",
							historyOpen.checkin?.name,
							" — ",
							Z("历史记录", "History")
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/div/4",
						"data-inspector-source": "components/cared-ones/CheckInCard.tsx:353:11:35e58f8ebeb114df4701afebc660598df309009866bd9067a00c7be1e5f7310c:1",
						className: "flex-1 overflow-y-auto space-y-1",
						children: (logs || []).filter((l) => String(l.checkin_id) === String(historyOpen.checkin?.id)).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/p/0",
							"data-inspector-source": "components/cared-ones/CheckInCard.tsx:355:15:7dc2688e57807f56a430b0e4bd54ba03e0c6482f9b5bfb79b382818d1a9601cb:1",
							className: "text-center text-muted-foreground py-8",
							children: Z("暂无记录", "No logs yet")
						}) : (logs || []).filter((l) => String(l.checkin_id) === String(historyOpen.checkin?.id)).map((log) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/div/5",
							"data-inspector-source": "components/cared-ones/CheckInCard.tsx:358:17:75099a663977dc895403fd8fbb18aa489d997b558755a591e29ab1a56c54e511:1",
							className: "flex items-start gap-3 py-2 border-b border-border/50 last:border-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Badge/0",
								"data-inspector-source": "components/cared-ones/CheckInCard.tsx:359:19:5f9987cfd32970b7907513158f63d063829d54594566966df763900b53b158ce:1",
								variant: "outline",
								className: STATUS_STYLE[log.status] || "",
								children: STATUS_LABEL[log.status] || log.status
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/div/6",
								"data-inspector-source": "components/cared-ones/CheckInCard.tsx:360:19:6c7e01a82bed7b5be9659555d26252fa1b29a459f38ae1c7991bc5c13fe68b12:1",
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/p/1",
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:361:21:6c430d13372f372af8d818aae42e687d2f00f885e6828e3ba0a4341a82cbd2c5:1",
									className: "text-xs text-muted-foreground",
									children: formatDateTime(log.created_at, isCN ? "zh-CN" : void 0)
								}), log.note && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/p/2",
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
				"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Dialog/d001c9b3df63",
				"data-inspector-source": "components/cared-ones/CheckInCard.tsx:372:7:def29b43900730496efda241a87a44896422975a0af227d7cb7027bd73ee2af8:1",
				open: editOpen.open,
				onOpenChange: (o) => !o && setEditOpen({
					open: false,
					checkin: null
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/DialogTitle/3",
							"data-inspector-source": "components/cared-ones/CheckInCard.tsx:375:13:edfd2b89434c6c2b9a6fc46d23fbf5867500fc8178d12b6d0172d32be48b54f6:1",
							children: Z("编辑签到日程", "Edit Check-In Schedule")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/DialogDescription/2",
							"data-inspector-source": "components/cared-ones/CheckInCard.tsx:376:13:47938e61584d232a42164328cbbf4d4f7c38dc015cbb06d5c869630d2ea6f177:1",
							children: Z("更新这个定期签到。", "Update this recurring check-in.")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 mt-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Label/8",
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:379:18:40968f52c62074d8fae761b55e8e500ced78ac05fcde4453fee232ba4ccbbc4a:1",
									className: "text-sm",
									children: Z("名称", "Name")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Input/e2e366b082e3",
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:379:70:40968f52c62074d8fae761b55e8e500ced78ac05fcde4453fee232ba4ccbbc4a:1",
									value: form.name,
									onChange: (e) => setForm((p) => ({
										...p,
										name: e.target.value
									}))
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Label/9",
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:380:18:3cdbc51e015a2cd796c025cecd114ba421bfb4812edf2a12d9ab5ed7aa486a1b:1",
									className: "text-sm",
									children: Z("详情", "Detail")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Input/3bcf127ea833",
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:380:72:3cdbc51e015a2cd796c025cecd114ba421bfb4812edf2a12d9ab5ed7aa486a1b:1",
									value: form.detail,
									onChange: (e) => setForm((p) => ({
										...p,
										detail: e.target.value
									}))
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Label/10",
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:382:20:bd3ef72b38dc50875ebff77039a6c6bd13d46d820c839a0c38f7337f227411f5:1",
										className: "text-sm",
										children: Z("频率", "Frequency")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Input/b50457872a5f",
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:382:77:bd3ef72b38dc50875ebff77039a6c6bd13d46d820c839a0c38f7337f227411f5:1",
										value: form.frequency,
										onChange: (e) => setForm((p) => ({
											...p,
											frequency: e.target.value
										}))
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Label/11",
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:383:20:64e2193764e1fcf146312669afec3cb98850a4f3a20ce0cb4f5451019abca6e3:1",
										className: "text-sm",
										children: Z("计划时间", "Scheduled time")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Input/86c049492fd3",
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:383:84:64e2193764e1fcf146312669afec3cb98850a4f3a20ce0cb4f5451019abca6e3:1",
										type: "time",
										value: form.time,
										onChange: (e) => setForm((p) => ({
											...p,
											time: e.target.value || "08:00"
										}))
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Label/12",
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:385:18:1c7e38c879bff6251cf95f4485423f07bc0ab0e8cc2e6037e3340109bd77a20c:1",
									className: "text-sm",
									children: Z("开始日期", "Start date")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Input/fe0369b0fa42",
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:385:78:1c7e38c879bff6251cf95f4485423f07bc0ab0e8cc2e6037e3340109bd77a20c:1",
									type: "date",
									value: form.start_date,
									onChange: (e) => setForm((p) => ({
										...p,
										start_date: e.target.value
									}))
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Label/13",
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:387:20:e45d56d4b4b0fe13c4c75067f4c2e535b5aa83f98e2586a1254f5bf01d9e7991:1",
										className: "text-sm",
										children: Z("提前提醒(分钟)", "Remind before (min)")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Input/aa5d65242508",
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:387:93:e45d56d4b4b0fe13c4c75067f4c2e535b5aa83f98e2586a1254f5bf01d9e7991:1",
										type: "number",
										min: "0",
										value: form.reminder_time_before,
										onChange: (e) => setForm((p) => ({
											...p,
											reminder_time_before: e.target.value
										}))
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Label/14",
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:388:20:5e7ae1ad494154a6102fb6166da73de642766801194f0ecebe3dbe12eea3eeb0:1",
										className: "text-sm",
										children: Z("多久通知护理者(分钟)", "Notify caregiver after (min)")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Input/2ad2f72bb96e",
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:388:105:5e7ae1ad494154a6102fb6166da73de642766801194f0ecebe3dbe12eea3eeb0:1",
										type: "number",
										min: "0",
										value: form.time_to_send_to_caregiver,
										onChange: (e) => setForm((p) => ({
											...p,
											time_to_send_to_caregiver: e.target.value
										}))
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Label/15",
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:391:15:f9e4b9090a2f1d1a611397a5a131c3fe734f05bd89bbf7bfff3716cd15b21961:1",
									className: "text-sm",
									children: Z("签到方式", "Check-in type")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/div/7",
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:392:15:c144db72fe5124e7cb367c94e5a65dda927910dd7ceb975a4ca3a96835686288:1",
									className: "flex gap-4 mt-1",
									children: ["ai", "human"].map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/label/1",
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:394:19:9c170f2392d7cd9f7c9de11772e83be2362b505f0d6303755b7f24db0075fcc1:1",
										className: "flex items-center gap-2 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/input/fabfbf1afe2e",
											"data-inspector-source": "components/cared-ones/CheckInCard.tsx:395:21:1219a22f478c8d64328bd8e1242aea5ad731bbd7882fc487c3ff3b04ba5377ad:1",
											type: "checkbox",
											checked: form.check_in_type.includes(type),
											onChange: (e) => setForm((p) => ({
												...p,
												check_in_type: e.target.checked ? [...p.check_in_type, type] : p.check_in_type.filter((v) => v !== type)
											}))
										}), type === "ai" ? Z("AI 签到", "AI check-in") : Z("人工签到", "Human check-in")]
									}, type))
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Button/193ee8e16a1b",
							"data-inspector-source": "components/cared-ones/CheckInCard.tsx:403:13:db2ce414df3cda58a8896dfc639479e070ab6d249d243b153675a062ead41dd0:1",
							variant: "outline",
							onClick: () => setEditOpen({
								open: false,
								checkin: null
							}),
							children: Z("取消", "Cancel")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Button/8fd3a6305d4b",
							"data-inspector-source": "components/cared-ones/CheckInCard.tsx:404:13:c910360efef1a57846d223c9c8d06c746b5a53bb748639d7002c45d6e7067f86:1",
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
				"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Dialog/d5ff84410182",
				"data-inspector-source": "components/cared-ones/CheckInCard.tsx:412:7:df920c9b7ed6ab8f3c32360379150cf5c630cdd9991eff05bf163b439d1e421e:1",
				open: deleteConfirm.open,
				onOpenChange: (o) => !o && setDeleteConfirm({
					open: false,
					checkin: null
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/DialogTitle/4",
						"data-inspector-source": "components/cared-ones/CheckInCard.tsx:415:13:c4e9e73fa49b32d20d0e969af2c6193728c5bdbb7af15f868406d6a3b43f6558:1",
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-5 w-5 text-destructive" }),
							" ",
							Z("删除签到?", "Delete check-in?")
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
						"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/DialogDescription/3",
						"data-inspector-source": "components/cared-ones/CheckInCard.tsx:416:13:f631e8251c68d0d1577fc2f86a729701e05c9ac2017d5e3cca84ffc501c535cd:1",
						children: isCN ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							"这将永久删除 ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/strong/0",
								"data-inspector-source": "components/cared-ones/CheckInCard.tsx:416:49:f631e8251c68d0d1577fc2f86a729701e05c9ac2017d5e3cca84ffc501c535cd:0",
								children: deleteConfirm.checkin?.name
							}),
							"。已记录的历史将保留。"
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							"This will permanently delete ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/strong/1",
								"data-inspector-source": "components/cared-ones/CheckInCard.tsx:416:143:f631e8251c68d0d1577fc2f86a729701e05c9ac2017d5e3cca84ffc501c535cd:0",
								children: deleteConfirm.checkin?.name
							}),
							". Logged history will remain."
						] })
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Button/960ed315f386",
						"data-inspector-source": "components/cared-ones/CheckInCard.tsx:419:13:0ccfa651b744f0bf648c7a164eaf3219997940da2bb9d93b2d546f23ae14b8e3:1",
						variant: "outline",
						onClick: () => setDeleteConfirm({
							open: false,
							checkin: null
						}),
						children: Z("取消", "Cancel")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Button/816ebf025193",
						"data-inspector-source": "components/cared-ones/CheckInCard.tsx:420:13:015fa5fab2ca7bea34069c160ab0210c03bfe408030205f14c370ac8ec71a02f:1",
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
				className: "text-center py-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "h-10 w-10 text-muted-foreground mx-auto mb-3" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/p/3",
						"data-inspector-source": "components/cared-ones/CheckInCard.tsx:432:11:dca1dbcf941128c13f919e45bb1a356ba2f5e983ebe36dab2deffc65bfd874c9:1",
						className: "text-muted-foreground mb-3",
						children: Z("暂无签到日程", "No check-in schedules yet")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Button/98512c5a1f68",
						"data-inspector-source": "components/cared-ones/CheckInCard.tsx:433:11:400786a8f84a76498257cdd6287d93fb347ba91efd68d777eeeab551614a4e3f:1",
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
				"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/div/8",
				"data-inspector-source": "components/cared-ones/CheckInCard.tsx:436:9:a9929ebdeed0219092c2fcd37f2f2e7dc244c8e4e2f4be9fa5f3c342ed4ae6f9:1",
				className: "space-y-2",
				children: [(logs || []).map((log) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Card/0",
					"data-inspector-source": "components/cared-ones/CheckInCard.tsx:438:13:b822d836e4d8ac6eefe169a5cf2490985413152bb9d65bbeb38f0a2985b637b0:1",
					className: "border-transparent card-elevated",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-3 flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/div/9",
							"data-inspector-source": "components/cared-ones/CheckInCard.tsx:440:17:cb0bcb1bc216e26d01846c31a47381f2f116c1144d8e1591d24588612cb7cc2f:1",
							className: "flex items-center gap-2 min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Badge/1",
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:441:19:5f9987cfd32970b7907513158f63d063829d54594566966df763900b53b158ce:1",
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
									"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/p/4",
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:443:32:14371a6fc2e265b5a5dd55af581e9fda8d8331d08945bc5432ea6a3bb7e31c7e:1",
									className: "text-xs text-muted-foreground truncate",
									children: log.note
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/span/0",
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
					"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/p/5",
					"data-inspector-source": "components/cared-ones/CheckInCard.tsx:449:41:ecc0580becfcf5ac625cbbb5c7b151f714203e5a7bcd90241dd395d91db70f81:1",
					className: "text-xs text-muted-foreground text-center py-4",
					children: Z("暂无历史", "No history yet")
				})]
			}) : view === "manage" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/div/10",
				"data-inspector-source": "components/cared-ones/CheckInCard.tsx:452:9:9691218ba3864011c02b10e0dfc141bd21cad293a3ea5b44156818e49c59dee3:1",
				className: "space-y-3",
				children: (checkins || []).map((checkin) => {
					const slots = Array.isArray(checkin.time_slot) && checkin.time_slot.length > 0 ? checkin.time_slot : ["08:00"];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Card/1",
						"data-inspector-source": "components/cared-ones/CheckInCard.tsx:456:15:4ebe1c0949224eb44ab406abf452879429ad7ab89b981b33e8ec41d3dca7479a:1",
						className: "border-transparent card-elevated",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-3 md:flex-row md:items-start md:justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/div/11",
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:459:21:7e92fa1cb7f722585e2d72c13c697dfb618334b5b769825562efeebdfc7de1ce:1",
									className: "min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/div/12",
											"data-inspector-source": "components/cared-ones/CheckInCard.tsx:460:23:9c74adccab2762420a8519a705cca954d512d2abcde47618634ae6d6ae68a8b0:1",
											className: "flex items-center gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "h-4 w-4 text-primary" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/span/1",
													"data-inspector-source": "components/cared-ones/CheckInCard.tsx:462:25:49351e6088c0971828eaa558faa59731d9f07e9b02dcdb05bf98223e29d032ea:1",
													className: "font-medium text-foreground",
													children: checkin.name
												}),
												!checkin.is_active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Badge/2",
													"data-inspector-source": "components/cared-ones/CheckInCard.tsx:463:48:a0da3e28d234df8d6d4220e5bf8545b234adbc081bbb00f9ac0d6e7a68b867e3:1",
													variant: "outline",
													className: "text-xs",
													children: Z("已暂停", "Paused")
												})
											]
										}),
										checkin.detail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/p/6",
											"data-inspector-source": "components/cared-ones/CheckInCard.tsx:465:42:7727db68c9b50b5b4b1c3f892cd9ab52940bde9c5d7690319d8d4cf03daa61fa:1",
											className: "text-xs text-muted-foreground mt-1",
											children: checkin.detail
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/p/7",
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
									className: "flex items-center gap-1 shrink-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Button/da516dc3440b",
											"data-inspector-source": "components/cared-ones/CheckInCard.tsx:471:23:d524a49aad4c8d6fa01288bbc3ee5589d463321df6068d6a0d0f2ffce3e86510:1",
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
											"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Button/bc7f46e29767",
											"data-inspector-source": "components/cared-ones/CheckInCard.tsx:472:23:a3209f96f61e838db087078fd5fad56a086b7457df39ac943dfbc3729acd4871:1",
											size: "icon",
											variant: "ghost",
											className: "h-7 w-7",
											title: checkin.is_active ? Z("暂停", "Pause") : Z("恢复", "Resume"),
											onClick: () => togglePause(checkin),
											disabled: update.isPending,
											children: checkin.is_active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-3.5 w-3.5" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Button/7555abac38cd",
											"data-inspector-source": "components/cared-ones/CheckInCard.tsx:475:23:c7cfeac3801bfb433fb36b8f56d8a39ec884fcb2d72df5160e56231ef7b29a17:1",
											size: "icon",
											variant: "ghost",
											className: "h-7 w-7",
											title: Z("编辑", "Edit"),
											onClick: () => openEdit(checkin),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pen, { className: "h-3.5 w-3.5" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Button/960ed315f386",
											"data-inspector-source": "components/cared-ones/CheckInCard.tsx:476:23:733328773e90ff767507b250fb18c7ed10cd02d7b0314c6049a142b5de9c0c5f:1",
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
				"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/div/13",
				"data-inspector-source": "components/cared-ones/CheckInCard.tsx:485:9:9691218ba3864011c02b10e0dfc141bd21cad293a3ea5b44156818e49c59dee3:1",
				className: "space-y-3",
				children: (checkins || []).map((checkin) => {
					const slots = Array.isArray(checkin.time_slot) && checkin.time_slot.length > 0 ? checkin.time_slot : ["08:00"];
					const todayStatus = todayStatusByCheckin.get(String(checkin.id));
					const isMissed = missedTodayIds.has(String(checkin.id));
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Card/2",
						"data-inspector-source": "components/cared-ones/CheckInCard.tsx:491:15:4ebe1c0949224eb44ab406abf452879429ad7ab89b981b33e8ec41d3dca7479a:1",
						className: "border-transparent card-elevated",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-3 md:flex-row md:items-start md:justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/div/14",
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:494:21:7e92fa1cb7f722585e2d72c13c697dfb618334b5b769825562efeebdfc7de1ce:1",
									className: "min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/div/15",
											"data-inspector-source": "components/cared-ones/CheckInCard.tsx:495:23:9c74adccab2762420a8519a705cca954d512d2abcde47618634ae6d6ae68a8b0:1",
											className: "flex items-center gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "h-4 w-4 text-primary" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/span/2",
													"data-inspector-source": "components/cared-ones/CheckInCard.tsx:497:25:49351e6088c0971828eaa558faa59731d9f07e9b02dcdb05bf98223e29d032ea:1",
													className: "font-medium text-foreground",
													children: checkin.name
												}),
												!checkin.is_active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Badge/3",
													"data-inspector-source": "components/cared-ones/CheckInCard.tsx:498:48:a0da3e28d234df8d6d4220e5bf8545b234adbc081bbb00f9ac0d6e7a68b867e3:1",
													variant: "outline",
													className: "text-xs",
													children: Z("已暂停", "Paused")
												})
											]
										}),
										checkin.detail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/p/8",
											"data-inspector-source": "components/cared-ones/CheckInCard.tsx:500:42:7727db68c9b50b5b4b1c3f892cd9ab52940bde9c5d7690319d8d4cf03daa61fa:1",
											className: "text-xs text-muted-foreground mt-1",
											children: checkin.detail
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/p/9",
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
									"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/div/16",
									"data-inspector-source": "components/cared-ones/CheckInCard.tsx:505:21:7841d729b59d47ba2af99dbbc40394211c1da3e7ed2cd6074b6906ae182d6ee0:1",
									className: "flex flex-col items-end gap-2 shrink-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Badge/4",
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:506:23:521d7d1463fe6af9ffd5ef02389051d1c930cb3ab7ff25ce2a52e610b8e2d14a:1",
										variant: "outline",
										className: todayStatus ? STATUS_STYLE[todayStatus] : isMissed ? STATUS_STYLE["missed"] : "bg-muted text-muted-foreground",
										children: todayStatus ? Z(`今天${STATUS_LABEL[todayStatus]}`, STATUS_LABEL[todayStatus] + " today") : isMissed ? Z("今天未完成", "Missed today") : Z("今天待办", "Pending today")
									}), !todayStatus && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/div/17",
										"data-inspector-source": "components/cared-ones/CheckInCard.tsx:515:25:880e111dd88443b8e6fa9b788970782c1a50b4a5e06fe515a0c611c62b55c6ae:1",
										className: "flex items-center gap-1 flex-wrap justify-end",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Button/add0becd71eb",
												"data-inspector-source": "components/cared-ones/CheckInCard.tsx:516:27:839b6c0114b10b894aca3168dad73d455677761afc1e2b98c986d00db113a0d4:1",
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
												"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Button/65658fc2a42f",
												"data-inspector-source": "components/cared-ones/CheckInCard.tsx:517:27:eb725e2470b39ac186597018d0602cb91afe87df1e65bbd6310012ddad0dd017:1",
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
												"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Button/65658fc2a42f",
												"data-inspector-source": "components/cared-ones/CheckInCard.tsx:519:29:52b761267a5039b0f7181777fe950cd6cc826efdb083c7a37ce3b6b1812ee7d9:1",
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
												"data-inspector-id": "components/cared-ones/CheckInCard/CheckInCard/Button/65658fc2a42f",
												"data-inspector-source": "components/cared-ones/CheckInCard.tsx:521:27:300d28114900629231eb4563f7baea979ce4c2a34bbd3dc902b5ba1e36868e2e:1",
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
