import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { t as Label } from "./label-BLfGGA0c.mjs";
import { t as Badge } from "./badge-Dn-oRli-.mjs";
import { t as Input } from "./input-DmTt3-fi.mjs";
import { t as Textarea } from "./textarea-DPamDMgK.mjs";
import { n as formatDateTime, r as formatTime$1, t as formatDate } from "./locale-DKwjQju2.mjs";
import { G as Search, On as CircleAlert, P as SkipForward, Pn as Check, dt as Pen, it as Plus, jt as LoaderCircle, n as X, qt as History, st as Pill, v as TrendingUp, vn as Clock, w as StickyNote, y as Trash2 } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-COszB6Fv.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-jh6xKLyY.mjs";
import { A as slotsNeeded, y as frequencyForSlots } from "./source.medicine-C8MN5KOu.mjs";
import { Ct as useDeleteMedicine, Gn as useTodayMedicineLogs, cn as useMedicineLogs, in as useLogMedicine, ln as useMedicines, lr as useUpdateMedicine, nt as useCreateMedicine, y as useAllMedicineLogs } from "./use-care-data-7GR_eJDG.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { t as RowActions } from "./RowActions-BGuzjdk0.mjs";
import { t as motion } from "../_libs/framer-motion.mjs";
import { t as config_default } from "./config-wade6xrr.mjs";
import { n as useAIAssistant } from "./AIAssistantContext-CGVvEq5z.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { n as findDoseLog, r as todayAtSlot } from "./dose-slot--5Nbxcmi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/MedicineCard-C8ABHO44.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var BASE = "https://rxnav.nlm.nih.gov/REST";
/** Spelling-tolerant suggestion list for a drug name fragment. */
async function rxnormSuggest(query, limit = 8) {
	const q = query.trim();
	if (q.length < 2) return [];
	try {
		const res = await fetch(`${BASE}/spellingsuggestions.json?name=${encodeURIComponent(q)}`);
		if (!res.ok) return [];
		return ((await res.json())?.suggestionGroup?.suggestionList?.suggestion || []).slice(0, limit).map((name) => ({ name }));
	} catch {
		return [];
	}
}
/** Resolve a drug name → RxCUI + standardized strength/dose-form info. */
async function rxnormLookup(name) {
	try {
		const rxcui = (await (await fetch(`${BASE}/rxcui.json?name=${encodeURIComponent(name)}&search=2`)).json())?.idGroup?.rxnormId?.[0] || null;
		if (!rxcui) return {
			rxcui: null,
			strength: null,
			doseForm: null
		};
		const fullName = (await (await fetch(`${BASE}/rxcui/${rxcui}/properties.json`)).json())?.properties?.name || "";
		const strengthMatch = fullName.match(/(\d+(\.\d+)?\s*(MG|MCG|ML|G|IU|%)\b)/i);
		const formMatch = fullName.match(/(Oral Tablet|Oral Capsule|Injection|Oral Solution|Oral Suspension|Patch|Cream|Ointment|Drop)/i);
		return {
			rxcui,
			strength: strengthMatch ? strengthMatch[1] : null,
			doseForm: formMatch ? formMatch[1] : null
		};
	} catch {
		return {
			rxcui: null,
			strength: null,
			doseForm: null
		};
	}
}
var isCN = () => (config_default.language || "").startsWith("zh");
var Z = (cn, en) => isCN() ? cn : en;
var TIMELINE_HOURS = [
	"06:00",
	"07:00",
	"08:00",
	"09:00",
	"10:00",
	"11:00",
	"12:00",
	"13:00",
	"14:00",
	"15:00",
	"16:00",
	"17:00",
	"18:00",
	"19:00",
	"20:00",
	"21:00",
	"22:00",
	"23:00",
	"00:00",
	"01:00",
	"02:00",
	"03:00",
	"04:00",
	"05:00"
];
function hourLabel(h24) {
	if (isCN()) {
		if (h24 === 0) return "凌晨12点";
		if (h24 < 6) return `凌晨${h24}点`;
		if (h24 < 12) return `上午${h24}点`;
		if (h24 === 12) return "中午12点";
		if (h24 < 18) return `下午${h24 - 12}点`;
		return `晚上${h24 - 12}点`;
	}
	if (h24 === 0) return "12 AM";
	if (h24 === 12) return "12 PM";
	if (h24 < 12) return `${h24} AM`;
	return `${h24 - 12} PM`;
}
var SCHEDULE_TIMES = [
	"06:00",
	"07:00",
	"08:00",
	"09:00",
	"10:00",
	"11:00",
	"12:00",
	"13:00",
	"14:00",
	"15:00",
	"16:00",
	"17:00",
	"18:00",
	"19:00",
	"20:00",
	"21:00",
	"22:00",
	"23:00"
].map((value) => ({
	value,
	label: hourLabel(parseInt(value.split(":")[0]))
}));
var FREQUENCIES = [
	{
		value: "once_daily",
		label: Z("每日一次", "Once daily")
	},
	{
		value: "twice_daily",
		label: Z("每日两次", "Twice daily")
	},
	{
		value: "three_daily",
		label: Z("每日三次", "Three times daily")
	},
	{
		value: "four_daily",
		label: Z("每日四次", "Four times daily")
	},
	{
		value: "every_other_day",
		label: Z("隔日一次", "Every other day")
	},
	{
		value: "weekly",
		label: Z("每周一次", "Weekly")
	},
	{
		value: "as_needed",
		label: Z("按需服用", "As needed")
	}
];
/** Daily frequencies need exactly that many distinct times (a66 BYHOUR/BYMINUTE). */
function resizeSlots(freq, slots) {
	const unique = Array.from(new Set(slots));
	const need = slotsNeeded(freq);
	if (need === null || need === 0) return unique.length ? unique : ["08:00"];
	const out = unique.slice(0, need);
	while (out.length < need) out.push(nextFreeTime(out));
	return out;
}
function nextFreeTime(used) {
	return [
		"08:00",
		"12:00",
		"18:00",
		"21:00",
		...SCHEDULE_TIMES.map((t) => t.value)
	].find((t) => !used.includes(t)) || "08:00";
}
/** Adding/removing a time keeps the daily frequency equal to the number of times. */
function withSlots(form, slots) {
	return {
		...form,
		time_slots: slots,
		frequency: frequencyForSlots(form.frequency, slots)
	};
}
/** Doses shown today: calendar occurrences (a66 − a68 + a69); as-needed shows once. */
function doseSlotsToday(med) {
	if (med.frequency_code === "as_needed") return ["08:00"];
	return med.today_slots || [];
}
/** Localized frequency label from the stored code (CCT 187 a66 RRULE + a95). */
function freqLabel(med) {
	const code = med?.frequency_code || med?.frequency;
	return FREQUENCIES.find((f) => f.value === code)?.label || med?.frequency || "";
}
function formatHour(h) {
	return hourLabel(parseInt(h.split(":")[0]));
}
function formatTime(dateStr) {
	return formatTime$1(dateStr, config_default.language, {
		hour: "numeric",
		minute: "2-digit"
	});
}
function LogNoteDialog({ open, onClose, onConfirm, medName, action, isPending }) {
	const [note, setNote] = (0, import_react.useState)("");
	const titleMap = {
		taken: Z("标记为已服用", "Mark as Taken"),
		skipped: Z("跳过此剂", "Skip Dose"),
		missed: Z("标记为漏服", "Mark as Missed")
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (o) => {
			if (!o) {
				setNote("");
				onClose();
			}
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(action === "taken" ? Check : action === "skipped" ? SkipForward : CircleAlert, { className: `h-5 w-5 ${action === "taken" ? "text-success" : action === "skipped" ? "text-warning" : "text-destructive"}` }), titleMap[action]]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
					medName,
					" — ",
					Z("为此次服药添加可选备注", "add an optional note about this dose")
				] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: note,
					onChange: (e) => setNote(e.target.value),
					placeholder: action === "taken" ? Z("例如:早餐时服用,感觉良好…", "e.g. Taken with breakfast, felt fine…") : action === "skipped" ? Z("例如:药已用完,感觉恶心…", "e.g. Out of stock, feeling nauseous…") : Z("例如:忘记了、当时在睡觉…", "e.g. Forgot, was sleeping…"),
					className: "min-h-[80px]"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "gap-2 sm:gap-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => {
							setNote("");
							onClose();
						},
						children: Z("取消", "Cancel")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: action === "taken" ? "default" : "outline",
						className: action === "taken" ? "bg-success hover:bg-success/90 text-success-foreground" : action === "skipped" ? "border-warning text-warning hover:bg-warning/10" : "border-destructive text-destructive hover:bg-destructive/10",
						onClick: () => {
							onConfirm(note);
							setNote("");
						},
						disabled: isPending,
						children: [isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }), Z("确认", "Confirm")]
					})]
				})
			]
		})
	});
}
function MedHistoryDialog({ open, onClose, med }) {
	const { data: logs, isLoading } = useMedicineLogs(open ? med?.id : null);
	const stats = (0, import_react.useMemo)(() => {
		if (!logs || logs.length === 0) return null;
		const taken = logs.filter((l) => l.status === "taken").length;
		const skipped = logs.filter((l) => l.status === "skipped").length;
		const total = taken + skipped;
		return {
			taken,
			skipped,
			total,
			adherence: total > 0 ? Math.round(taken / total * 100) : 0
		};
	}, [logs]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (o) => {
			if (!o) onClose();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-lg max-h-[80vh] flex flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "h-5 w-5 text-primary" }),
						med?.name,
						" — ",
						Z("历史记录", "History")
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: [med?.dosage, freqLabel(med)].filter(Boolean).join(" · ") })] }),
				stats && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/cared-ones/MedicineCard.tsx:163:11:18fdfb477a21a55f841de02612d19f43bba4363c7bdc56b2f76e5b8daf3b735e:1",
					className: "grid grid-cols-3 gap-3 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/MedicineCard.tsx:164:13:bcbf41cdf82fa748c6178603092e8525352c5b21883ab2c0f8c0996b87fbf0be:1",
							className: "text-center p-3 rounded-xl bg-success/10 border border-success/20",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:165:15:957845bdaf0222f70ccebbc8573c2a638398a3b8d5af1c33ee4412564d28541d:1",
								className: "text-2xl font-bold text-success",
								children: [stats.adherence, "%"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:166:15:d99f0e1a6a7dd8ecb6322a90e5528691ae0d451cb36af20d84347d505058a4af:1",
								className: "text-xs text-muted-foreground",
								children: Z("依从率", "Adherence")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/MedicineCard.tsx:168:13:b1b17c01debfe382c365cc1e0db756dddc983fae815fcfbefc9535be35ed7b55:1",
							className: "text-center p-3 rounded-xl bg-primary/10 border border-primary/20",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:169:15:7365a12c8d52296c5a32d527801e29174e3de72474d22659b49981b5fec9f9ca:1",
								className: "text-2xl font-bold text-primary",
								children: stats.taken
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:170:15:ffa614f4f334de25edfd5eb8446c3b71adeb774cb2d43b1a73c23ccbcd0cabb8:1",
								className: "text-xs text-muted-foreground",
								children: Z("已服用", "Taken")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/MedicineCard.tsx:172:13:3299c07d7875ac3cd53b9b3beccb96d4b8ce1d62fdc9e1ec85b8dee86914d4d1:1",
							className: "text-center p-3 rounded-xl bg-warning/10 border border-warning/20",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:173:15:98e8933767c856600b230634858d7b06325608ffdceeafe7f02091e6c85e3728:1",
								className: "text-2xl font-bold text-warning",
								children: stats.skipped
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:174:15:13391dfc34cf1d71bf0facd5465c2c7367ff117c4b48da78add8b483173425bd:1",
								className: "text-xs text-muted-foreground",
								children: Z("已跳过", "Skipped")
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "components/cared-ones/MedicineCard.tsx:180:9:81d7bb04772cccaff0ce374bfcea45981dcb91340656d91fea0dfb2672545ee0:1",
					className: "flex-1 overflow-y-auto space-y-1 pr-1 -mr-1",
					children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin mx-auto text-muted-foreground my-8" }) : (logs || []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/cared-ones/MedicineCard.tsx:184:13:f15982e75957c719120042ce2187c5b68e4ea3d993819f7e60643e8e5687f95b:1",
						className: "text-center text-muted-foreground py-8",
						children: Z("暂无记录", "No logs recorded yet")
					}) : (logs || []).map((log) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/cared-ones/MedicineCard.tsx:187:15:6950864de9db813cd9abccbf3d70d0a26f6ab2ca72aadeb75a58f8b0780a6200:1",
						className: "flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-source": "components/cared-ones/MedicineCard.tsx:188:17:9eee17bdcd40ee817995d47ea16d44d24d4212f6f77fd8425157cb65e3a475b4:1",
							className: `mt-0.5 shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${log.status === "taken" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`,
							children: log.status === "taken" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "h-3.5 w-3.5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/MedicineCard.tsx:191:17:69c6dd6ee5697db1796eaf763adfffd34e8077adf6a8fb1ebb8a44bdd1a5c16c:1",
							className: "flex-1 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:192:19:b74c1d730788bad270e6e9d8de3ba2e94f36724ca03634d016375df8aa562c5a:1",
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-source": "components/cared-ones/MedicineCard.tsx:193:21:11da580f720b46730b908a300fa10d23e2199988f0a8d0a0f666b7d248ea3575:1",
									className: "text-sm font-medium capitalize",
									children: log.status
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									"data-inspector-source": "components/cared-ones/MedicineCard.tsx:194:21:e978a79dc85e6975a5f6336688cec7c4a24f72c0c11c205335c955777d444bac:1",
									className: "text-xs text-muted-foreground",
									children: [
										formatDate(log.created_at),
										" · ",
										formatTime(log.created_at)
									]
								})]
							}), log.note && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:197:21:eeac6f9056cea513eb3ca840e829963e48ada192335ddc68f71b77ae3ac574cb:1",
								className: "text-xs text-muted-foreground mt-0.5 flex items-start gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickyNote, { className: "h-3 w-3 mt-0.5 shrink-0" }), log.note]
							})]
						})]
					}, log.id))
				})
			]
		})
	});
}
function EditMedDialog({ open, onClose, med, onDelete }) {
	const updateMed = useUpdateMedicine();
	const { toast } = useToast();
	const { user } = useAuth();
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		dosage: "",
		rxcui: "",
		frequency: "once_daily",
		time_slots: ["08:00"],
		note: "",
		stock_count: "",
		refill_threshold: "",
		reminder_time_before: "0",
		time_to_send_to_caregiver: ""
	});
	(0, import_react.useState)(() => {
		if (med && open) {
			const freqEntry = FREQUENCIES.find((f) => f.value === (med.frequency_code || med.frequency)) || FREQUENCIES.find((f) => f.label === med.frequency);
			setForm({
				name: med.name || "",
				dosage: med.dosage || "",
				rxcui: med.medication_concept_identifier || "",
				frequency: freqEntry?.value || "once_daily",
				time_slots: med.time_slot?.length > 0 ? [...med.time_slot] : ["08:00"],
				note: med.note || "",
				stock_count: med.stock_count ?? "",
				refill_threshold: med.refill_threshold ?? "",
				reminder_time_before: med.reminder_time_before ?? "0",
				time_to_send_to_caregiver: med.time_to_send_to_caregiver ?? ""
			});
		}
	});
	const populateForm = (0, import_react.useCallback)(() => {
		if (med) {
			const freqEntry = FREQUENCIES.find((f) => f.value === (med.frequency_code || med.frequency)) || FREQUENCIES.find((f) => f.label === med.frequency);
			setForm({
				name: med.name || "",
				dosage: med.dosage || "",
				rxcui: med.medication_concept_identifier || "",
				frequency: freqEntry?.value || "once_daily",
				time_slots: med.time_slot?.length > 0 ? [...med.time_slot] : ["08:00"],
				note: med.note || "",
				stock_count: med.stock_count ?? "",
				refill_threshold: med.refill_threshold ?? "",
				reminder_time_before: med.reminder_time_before ?? "0",
				time_to_send_to_caregiver: med.time_to_send_to_caregiver ?? ""
			});
		}
	}, [med]);
	const handleSave = () => {
		if (!form.name.trim()) return;
		updateMed.mutate({
			id: med.id,
			name: form.name.trim(),
			dosage: form.dosage || void 0,
			medication_concept_identifier: form.rxcui || void 0,
			frequency: form.frequency,
			time_slot: form.time_slots,
			note: form.note || void 0,
			stock_count: form.stock_count === "" ? "" : Number(form.stock_count),
			refill_threshold: form.refill_threshold === "" ? "" : Number(form.refill_threshold),
			reminder_time_before: form.reminder_time_before === "" ? 0 : Number(form.reminder_time_before),
			time_to_send_to_caregiver: form.time_to_send_to_caregiver === "" ? null : Number(form.time_to_send_to_caregiver)
		}, {
			onSuccess: () => {
				toast({ title: Z("药品已更新", "Medicine updated") });
				onClose();
			},
			onError: (err) => toast({
				title: Z("操作失败", "Failed"),
				description: String(err.message),
				variant: "destructive"
			})
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (o) => {
			if (!o) onClose();
			else populateForm();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: Z("编辑药品", "Edit Medicine") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: Z("更新药品信息", "Update medication details") })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-source": "components/cared-ones/MedicineCard.tsx:283:9:857816ba7611c32773fc9e589773689ef3b6dddccca5a21f8e88269e24854f91:1",
			className: "space-y-4 mt-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/cared-ones/MedicineCard.tsx:284:11:0024f6f79ccdfa20a5e6d01c69a43abcb65b43fda606d53de531a148895ea6ac:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [
						Z("药品名称", "Medicine Name"),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-source": "components/cared-ones/MedicineCard.tsx:284:51:0024f6f79ccdfa20a5e6d01c69a43abcb65b43fda606d53de531a148895ea6ac:1",
							className: "text-destructive",
							children: "*"
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: form.name,
						onChange: (e) => setForm((p) => ({
							...p,
							name: e.target.value
						})),
						className: "mt-1"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/cared-ones/MedicineCard.tsx:285:11:ae2ab7ad4cb0418c1fd55a32546945ea097001b2c70b4b5b96f5d4f4c4efe8de:1",
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/cared-ones/MedicineCard.tsx:286:13:59c089b632d5839466c073929e298e38a1adde8aa5189b2d2820e2a4bf7849d0:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("剂量", "Dosage") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.dosage,
							onChange: (e) => setForm((p) => ({
								...p,
								dosage: e.target.value
							})),
							placeholder: Z("例如:10 毫克", "e.g. 10mg"),
							className: "mt-1"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/cared-ones/MedicineCard.tsx:287:13:ee404c65d4cb797826e2964c7e4c8e915eab95ae76c054dff7d4f48ebf917e50:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("频率", "Frequency") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: form.frequency,
							onValueChange: (v) => setForm((p) => ({
								...p,
								frequency: v,
								time_slots: resizeSlots(v, p.time_slots)
							})),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "mt-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: FREQUENCIES.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: f.value,
								children: f.label
							}, f.value)) })]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/cared-ones/MedicineCard.tsx:294:11:d66c1910b77ed5e7a4e134c4b4a480775c9ee8fb6387f3952a5dfb9d7c9614c1:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/cared-ones/MedicineCard.tsx:295:13:ce91ce10dfa7d3a6c22fb50fbf7bf7dbaded6d5d1e2814bcf1a6ca9054f593ed:1",
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("服药时间", "Scheduled Times") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "ghost",
							size: "sm",
							onClick: () => setForm((p) => withSlots(p, [...p.time_slots, nextFreeTime(p.time_slots)])),
							className: "text-xs h-7",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3 mr-1" }),
								" ",
								Z("添加时间", "Add Time")
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "components/cared-ones/MedicineCard.tsx:299:13:e404a61de4d47648a1f4a1bc3853ffd05ed8c9df525b2e6b3c8352f16c91cc72:1",
						className: "space-y-2 mt-1",
						children: form.time_slots.map((slot, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/MedicineCard.tsx:301:17:4c337e33958bc071fa773a7d72bb624d51f632f1898366f6a434dfdd5a9bb9b6:1",
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: slot,
								onValueChange: (v) => setForm((p) => ({
									...p,
									time_slots: p.time_slots.map((t, i) => i === idx ? v : t)
								})),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 mr-2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: SCHEDULE_TIMES.filter((t) => t.value === slot || !form.time_slots.includes(t.value)).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: t.value,
									children: t.label
								}, t.value)) })]
							}), form.time_slots.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "ghost",
								size: "icon",
								className: "h-8 w-8 text-destructive shrink-0",
								onClick: () => setForm((p) => withSlots(p, p.time_slots.filter((_, i) => i !== idx))),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" })
							})]
						}, idx))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/cared-ones/MedicineCard.tsx:311:11:d050dc731f790cc11b83f811650ae290f55df739af1cea8bb71889288775c93f:1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("备注", "Notes") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: form.note,
						onChange: (e) => setForm((p) => ({
							...p,
							note: e.target.value
						})),
						placeholder: Z("用药说明、副作用…", "Instructions, side effects…"),
						className: "mt-1 min-h-[60px]"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/cared-ones/MedicineCard.tsx:312:11:ae2ab7ad4cb0418c1fd55a32546945ea097001b2c70b4b5b96f5d4f4c4efe8de:1",
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/cared-ones/MedicineCard.tsx:313:13:b46eb9af35d49a9c4ff2962ce7340583ee960c33b427a763ded0a709aed19507:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [
							Z("库存数量", "Stock count"),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:313:51:b46eb9af35d49a9c4ff2962ce7340583ee960c33b427a763ded0a709aed19507:1",
								className: "text-muted-foreground text-xs",
								children: Z("(剩余药片)", "(pills left)")
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							min: "0",
							value: form.stock_count,
							onChange: (e) => setForm((p) => ({
								...p,
								stock_count: e.target.value
							})),
							placeholder: "e.g. 30",
							className: "mt-1"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/cared-ones/MedicineCard.tsx:314:13:f8ef4c0f9b183dab78d5f6475a513f386edec55062462d7f89bdc7b593a51a0b:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [
							Z("补药提醒", "Refill alert"),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:314:52:f8ef4c0f9b183dab78d5f6475a513f386edec55062462d7f89bdc7b593a51a0b:1",
								className: "text-muted-foreground text-xs",
								children: Z("(阈值)", "(threshold)")
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							min: "0",
							value: form.refill_threshold,
							onChange: (e) => setForm((p) => ({
								...p,
								refill_threshold: e.target.value
							})),
							placeholder: "e.g. 7",
							className: "mt-1"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/cared-ones/MedicineCard.tsx:316:13:927a99fb6383a094ffed45066f46e1d7f11e90ffc47831884805fa6a68536ff3:1",
					className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/cared-ones/MedicineCard.tsx:317:15:afee3aff3b0e58bc69a74aa13235001f4ba6065d7509e53c39084b5feff576bb:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("提前提醒(分钟)", "Remind before (min)") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							min: "0",
							value: form.reminder_time_before,
							onChange: (e) => setForm((p) => ({
								...p,
								reminder_time_before: e.target.value
							})),
							className: "mt-1"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/cared-ones/MedicineCard.tsx:318:15:b6c7f1804f939120f5deef1738bb2be190b6c0a197a7d5acb324325b801495bf:1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("多久通知护理者(分钟)", "Notify caregiver after (min)") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							min: "0",
							value: form.time_to_send_to_caregiver,
							onChange: (e) => setForm((p) => ({
								...p,
								time_to_send_to_caregiver: e.target.value
							})),
							className: "mt-1"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/cared-ones/MedicineCard.tsx:321:11:3d47212f19c588efeb3716d0124fa927de0d5c6c7ae0ea2243952dd00ef35d6d:1",
					className: "sticky bottom-0 -mx-6 flex gap-2 border-t bg-background px-6 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "flex-1",
							onClick: handleSave,
							disabled: updateMed.isPending || !form.name.trim(),
							children: [
								updateMed.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : null,
								" ",
								Z("保存更改", "Save Changes")
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: onClose,
							children: Z("取消", "Cancel")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							className: "text-destructive border-destructive/30 hover:bg-destructive/10",
							onClick: onDelete,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 mr-1" }),
								" ",
								Z("删除", "Delete")
							]
						})
					]
				})
			]
		})] })
	});
}
function MedDoseCard({ med, todayLogs, onLog, onEdit, onDelete, onHistory, compact, slot, manage }) {
	const isPRN = med.frequency_code === "as_needed" || med.frequency === "As needed" || med.frequency === "as_needed";
	const logForThisDose = findDoseLog(todayLogs, med.id, isPRN ? void 0 : slot);
	const isTaken = logForThisDose?.status === "taken";
	const isSkipped = logForThisDose?.status === "skipped";
	const isMissedLogged = logForThisDose?.status === "missed";
	const isDone = isTaken || isSkipped || isMissedLogged;
	const isMissedAuto = (0, import_react.useMemo)(() => {
		if (isDone || isPRN || !slot) return false;
		const [h = "0", m = "0"] = slot.split(":");
		const slotMins = Number(h) * 60 + Number(m);
		const now = /* @__PURE__ */ new Date();
		return now.getHours() * 60 + now.getMinutes() > slotMins + 60;
	}, [
		slot,
		isDone,
		isPRN
	]);
	const lowStock = typeof med.stock_count === "number" && typeof med.refill_threshold === "number" && med.stock_count <= med.refill_threshold;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		layout: true,
		className: `min-w-0 rounded-xl border p-3 transition-all ${isTaken ? "bg-success/5 border-success/30" : isSkipped ? "bg-warning/5 border-warning/30" : isMissedLogged ? "bg-destructive/5 border-destructive/30" : isMissedAuto ? "bg-destructive/5 border-destructive/40" : "bg-card border-border hover:border-primary/30"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-source": "components/cared-ones/MedicineCard.tsx:379:7:2fce152281b7f48a0b48f0bf1ae4eae283e413b2becea41c5e5c1cd08516d613:1",
			className: "flex items-start gap-3 min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "components/cared-ones/MedicineCard.tsx:380:9:d90e34d88f913445feb3d7b6391183a279da9802097ed87343ab731511408a80:1",
				className: `shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${isTaken ? "bg-success/15 text-success" : isSkipped ? "bg-warning/15 text-warning" : isMissedLogged || isMissedAuto ? "bg-destructive/15 text-destructive" : "bg-primary/10 text-primary"}`,
				children: isTaken ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) : isSkipped ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "h-4 w-4" }) : isMissedLogged || isMissedAuto ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { className: "h-4 w-4" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/MedicineCard.tsx:388:9:231e7d8bf0ed63884efe56243648ca780756e1ecfddcca7090c730657bc2ad65:1",
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/cared-ones/MedicineCard.tsx:389:11:d00a085987a7bc1169948d2956127d9752cab1e4c8007ffcf2088cc4c1c5c1b3:1",
						className: `font-medium text-sm break-words ${isDone ? "line-through opacity-60" : "text-foreground"}`,
						children: med.name
					}),
					(isPRN || lowStock) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/cared-ones/MedicineCard.tsx:391:13:2eb4f109e1cb7295e7ecdeb95721e6b87862755eaee386a20edba9ced74c350b:1",
						className: "mt-1 flex flex-wrap gap-1",
						children: [isPRN && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: "text-[10px] py-0 px-1.5 border-primary/40 text-primary",
							children: "PRN"
						}), lowStock && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: "text-[10px] py-0 px-1.5 border-destructive/40 text-destructive bg-destructive/5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-2.5 w-2.5 mr-0.5" }), Z(`库存低:剩 ${med.stock_count}`, `Low: ${med.stock_count} left`)]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/cared-ones/MedicineCard.tsx:400:11:6b9f666815852c4f0e378a997b50a3eadcbbd36f2fa2b101b7de060d4726dbe0:1",
						className: "text-xs text-muted-foreground mt-0.5 break-words",
						children: [med.dosage, freqLabel(med)].filter(Boolean).join(" · ")
					}),
					logForThisDose?.note && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						"data-inspector-source": "components/cared-ones/MedicineCard.tsx:402:13:97870e7a99993aeceede757c8990215a74a5c3181faa3f25f23dc675a7790869:1",
						className: "text-xs text-muted-foreground/80 mt-0.5 italic flex items-center gap-1 break-words",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickyNote, { className: "h-2.5 w-2.5 shrink-0" }), logForThisDose.note]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-inspector-source": "components/cared-ones/MedicineCard.tsx:408:7:5953ab2ae473fa3f23a93d88c8543162e18beb2882d2e553b8aebeb95b6a9bfc:1",
			className: "mt-2 flex flex-wrap items-center gap-1 pl-12",
			children: manage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"data-inspector-source": "components/cared-ones/MedicineCard.tsx:411:13:5c145c7c063b404e4127d03eac6f04437163dd84f3519375be1df9f294a5038f:1",
				className: "text-xs text-muted-foreground",
				children: isPRN ? Z("按需服用", "As needed") : (med.time_slot || []).map((s) => formatHour(s)).join(" · ")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/MedicineCard.tsx:416:13:a71a2b736d8be3525fe977c25a0b075e9034a7d32dd892f2536875d7f0b9ad6e:1",
				className: "ml-auto flex items-center gap-0.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon",
						variant: "ghost",
						"aria-label": Z(`${med.name} 用药记录`, `${med.name} history`),
						className: "h-7 w-7 text-muted-foreground hover:text-foreground",
						onClick: () => onHistory(med),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "h-3.5 w-3.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon",
						variant: "ghost",
						"aria-label": Z(`编辑 ${med.name}`, `Edit ${med.name}`),
						className: "h-7 w-7 text-muted-foreground hover:text-foreground",
						onClick: () => onEdit(med),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pen, { className: "h-3.5 w-3.5" })
					}),
					onDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowActions, { onDelete: () => onDelete(med) })
				]
			})] }) : isDone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				variant: "outline",
				className: `text-xs ${isTaken ? "border-success/40 text-success bg-success/10" : isSkipped ? "border-warning/40 text-warning bg-warning/10" : "border-destructive/40 text-destructive bg-destructive/10"}`,
				children: [isTaken ? Z("✓ 已服用", "✓ Taken") : isSkipped ? Z("⏭ 已跳过", "⏭ Skipped") : Z("⚠ 漏服", "⚠ Missed"), logForThisDose?.created_at && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"data-inspector-source": "components/cared-ones/MedicineCard.tsx:433:44:29e12ab0bc1bdc011bc2f5694564ad61f7511c421fd351392b0325b890c73276:1",
					className: "ml-1 opacity-70",
					children: formatTime(logForThisDose.created_at)
				})]
			}) : isPRN ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				className: "h-8 text-xs bg-primary/15 text-primary hover:bg-primary/25 border-0",
				variant: "outline",
				onClick: () => onLog(med, "taken", slot),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3 mr-1" }),
					" ",
					Z("立即记录", "Log dose now")
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					className: "h-8 text-xs bg-success/15 text-success hover:bg-success/25 border-0",
					variant: "outline",
					onClick: () => onLog(med, "taken", slot),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3 mr-1" }),
						" ",
						Z("已服用", "Taken")
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "ghost",
					className: "h-8 text-xs text-warning hover:bg-warning/10",
					onClick: () => onLog(med, "skipped", slot),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "h-3 w-3 mr-1" }),
						" ",
						Z("跳过", "Skip")
					]
				}),
				isMissedAuto && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "ghost",
					className: "h-8 text-xs text-destructive hover:bg-destructive/10",
					onClick: () => onLog(med, "missed", slot),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-3 w-3 mr-1" }),
						" ",
						Z("漏服", "Missed")
					]
				})
			] })
		})]
	});
}
function RxNormNameInput({ value, onChange, onPick }) {
	const [suggestions, setSuggestions] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [open, setOpen] = (0, import_react.useState)(false);
	const wrapRef = (0, import_react.useRef)(null);
	const debounce = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (debounce.current) window.clearTimeout(debounce.current);
		if (value.trim().length < 2) {
			setSuggestions([]);
			return;
		}
		setLoading(true);
		debounce.current = window.setTimeout(async () => {
			const list = await rxnormSuggest(value);
			setSuggestions(list);
			setLoading(false);
			setOpen(list.length > 0);
		}, 300);
		return () => {
			if (debounce.current) window.clearTimeout(debounce.current);
		};
	}, [value]);
	(0, import_react.useEffect)(() => {
		function onDoc(e) {
			if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
		}
		document.addEventListener("mousedown", onDoc);
		return () => document.removeEventListener("mousedown", onDoc);
	}, []);
	const handlePick = async (name) => {
		onChange(name);
		setOpen(false);
		const info = await rxnormLookup(name);
		onPick({
			name,
			strength: info.strength,
			doseForm: info.doseForm,
			rxcui: info.rxcui
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/cared-ones/MedicineCard.tsx:497:5:080461755557ba64b96e9dd1a060749a82ea6eae9f9697d1cefb1c7f52a6d2d5:1",
		ref: wrapRef,
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-source": "components/cared-ones/MedicineCard.tsx:498:7:36b3ec7cb76d89ac106a21ec524105b589fc9632bbe5c8744f38fbddfd87d49d:1",
			className: "relative",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value,
				onChange: (e) => {
					onChange(e.target.value);
					setOpen(true);
				},
				onFocus: () => suggestions.length > 0 && setOpen(true),
				placeholder: Z("输入关键词搜索(例如:Lisinopril)", "Type to search (e.g. Lisinopril)"),
				className: "mt-1 pr-8",
				autoComplete: "off"
			}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "absolute right-2.5 top-1/2 -translate-y-1/2 mt-0.5 h-4 w-4 animate-spin text-muted-foreground" }) : value.length >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute right-2.5 top-1/2 -translate-y-1/2 mt-0.5 h-4 w-4 text-muted-foreground" }) : null]
		}), open && suggestions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-source": "components/cared-ones/MedicineCard.tsx:514:9:5e8a933efa842856f9ac8c6d200a7a9577bd9bf8e9def209722f38925580d542:1",
			className: "absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-60 overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "components/cared-ones/MedicineCard.tsx:515:11:f4248c8f6c38fcbe20f0c772ec8b75aa317eb810fbac35fedaa92cd5ec06511c:1",
				className: "px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground border-b",
				children: "RxNorm · NIH/NLM"
			}), suggestions.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				"data-inspector-source": "components/cared-ones/MedicineCard.tsx:517:13:a3b579ee303d0cab98ee81bdba245eb3089583d5c87a311fe484ba754cd07fc0:1",
				type: "button",
				onClick: () => handlePick(s.name),
				className: "w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors",
				children: s.name
			}, i))]
		})]
	});
}
function MedicineCard({ caredOneId }) {
	const { toast } = useToast();
	const { data: meds, isLoading } = useMedicines(caredOneId);
	const { data: todayLogs } = useTodayMedicineLogs(caredOneId);
	const { data: allLogs, isLoading: allLogsLoading } = useAllMedicineLogs(caredOneId);
	const createMed = useCreateMedicine();
	const deleteMed = useDeleteMedicine();
	const logMed = useLogMedicine();
	const { openWriteAssistant } = useAIAssistant();
	const { user } = useAuth();
	const autoOpenedDoseRef = (0, import_react.useRef)(null);
	const [addOpen, setAddOpen] = (0, import_react.useState)(false);
	const [view, setView] = (0, import_react.useState)("timeline");
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		dosage: "",
		rxcui: "",
		frequency: "once_daily",
		time_slots: ["08:00"],
		note: "",
		stock_count: "",
		refill_threshold: "",
		reminder_time_before: "0",
		time_to_send_to_caregiver: ""
	});
	const updateMed = useUpdateMedicine();
	const [logDialog, setLogDialog] = (0, import_react.useState)({
		open: false,
		med: null,
		action: "taken"
	});
	const [historyMed, setHistoryMed] = (0, import_react.useState)(null);
	const [editMed, setEditMed] = (0, import_react.useState)(null);
	const handleLog = (med, status, slot) => {
		setLogDialog({
			open: true,
			med,
			action: status,
			slot
		});
	};
	const confirmLog = (note) => {
		const { med, action, slot } = logDialog;
		logMed.mutate({
			medicine_id: med.id,
			status: action,
			note: note || void 0,
			user_id: caredOneId,
			dose_quantity: med.dose_quantity ?? null,
			scheduled_dose_quantity: med.dose_quantity ?? null,
			dose_unit: med.dose_unit || null,
			scheduled_date: slot ? todayAtSlot(slot) : null,
			schedule_type: med.schedule_type || null,
			concept_identifier: med.medication_concept_identifier || null,
			concept_display_text: med.name || null,
			rxcui: med.medication_concept_identifier || null
		}, {
			onSuccess: () => {
				if (action === "taken" && typeof med.stock_count === "number" && med.stock_count > 0) {
					const newStock = med.stock_count - 1;
					updateMed.mutate({
						id: med.id,
						stock_count: newStock
					});
					if (typeof med.refill_threshold === "number" && newStock <= med.refill_threshold) toast({
						title: Z(`库存不足:${med.name}`, `Low stock: ${med.name}`),
						description: Z(`剩余 ${newStock} 剂 — 该补药了`, `${newStock} doses left — time to refill`),
						variant: "destructive"
					});
				}
				toast({ title: action === "taken" ? Z(`${med.name} 已标记为服用 ✓`, `${med.name} marked as taken ✓`) : action === "skipped" ? Z(`${med.name} 已跳过`, `${med.name} skipped`) : Z(`${med.name} 已标记为漏服`, `${med.name} marked as missed`) });
				setLogDialog({
					open: false,
					med: null,
					action: "taken"
				});
			},
			onError: (err) => toast({
				title: Z("操作失败", "Failed"),
				description: String(err.message),
				variant: "destructive"
			})
		});
	};
	const handleAdd = () => {
		if (!form.name.trim()) return;
		createMed.mutate({
			user_id: caredOneId,
			name: form.name.trim(),
			dosage: form.dosage || void 0,
			medication_concept_identifier: form.rxcui || void 0,
			frequency: form.frequency,
			time_slot: form.time_slots.length > 0 ? form.time_slots : ["08:00"],
			note: form.note || void 0,
			stock_count: form.stock_count === "" ? void 0 : Number(form.stock_count),
			refill_threshold: form.refill_threshold === "" ? void 0 : Number(form.refill_threshold),
			reminder_time_before: form.reminder_time_before === "" ? 0 : Number(form.reminder_time_before),
			time_to_send_to_caregiver: form.time_to_send_to_caregiver === "" ? void 0 : Number(form.time_to_send_to_caregiver)
		}, {
			onSuccess: () => {
				setForm({
					name: "",
					dosage: "",
					rxcui: "",
					frequency: "once_daily",
					time_slots: ["08:00"],
					note: "",
					stock_count: "",
					refill_threshold: "",
					reminder_time_before: "0",
					time_to_send_to_caregiver: ""
				});
				setAddOpen(false);
				toast({ title: Z("药品已添加", "Medicine added") });
			},
			onError: (err) => toast({
				title: Z("添加失败", "Failed to add"),
				description: String(err.message),
				variant: "destructive"
			})
		});
	};
	const adherenceSummary = (0, import_react.useMemo)(() => {
		if (!meds || !todayLogs) return null;
		const totalSlots = meds.reduce((sum, m) => sum + doseSlotsToday(m).length, 0);
		const logged = todayLogs.length;
		const taken = todayLogs.filter((l) => l.status === "taken").length;
		return {
			totalSlots,
			taken,
			skipped: todayLogs.filter((l) => l.status === "skipped").length,
			pending: totalSlots - logged,
			pct: totalSlots > 0 ? Math.round(taken / totalSlots * 100) : 0
		};
	}, [meds, todayLogs]);
	const timelineMeds = (0, import_react.useMemo)(() => {
		if (!meds) return {};
		const grouped = {};
		meds.forEach((med) => {
			doseSlotsToday(med).forEach((slot) => {
				const hourKey = `${slot.substring(0, 2)}:00`;
				(grouped[hourKey] ||= []).push({
					med,
					slot
				});
			});
		});
		return grouped;
	}, [meds]);
	(0, import_react.useEffect)(() => {
		if (!user?.general_user_role?.includes("cared one") || !meds || !todayLogs) return;
		const now = /* @__PURE__ */ new Date();
		const nowMinutes = now.getHours() * 60 + now.getMinutes();
		const due = meds.flatMap((med) => {
			if (med.frequency_code === "as_needed") return [];
			return doseSlotsToday(med).map((slot) => ({
				med,
				slot
			}));
		}).find(({ med, slot }) => {
			if (findDoseLog(todayLogs, med.id, slot) || med.is_active === false) return false;
			const [hour = "0", minute = "0"] = String(slot).split(":");
			return nowMinutes >= Number(hour) * 60 + Number(minute);
		});
		if (!due) return;
		const key = `${now.toISOString().slice(0, 10)}-${due.med.id}-${due.slot}`;
		if (autoOpenedDoseRef.current === key) return;
		autoOpenedDoseRef.current = key;
		const dose = [
			due.med.name,
			due.med.dosage,
			due.slot
		].filter(Boolean).join(" · ");
		openWriteAssistant({
			skill: "record-medicine-dose",
			id: `medicine-${key}`,
			target: {
				caredOneId: String(caredOneId),
				recordId: String(due.med.id),
				label: due.med.name,
				detail: dose,
				slot: due.slot
			}
		});
	}, [
		meds,
		todayLogs,
		caredOneId,
		user?.general_user_role
	]);
	const hasScheduledMeds = Object.keys(timelineMeds).length > 0;
	const currentHour = (/* @__PURE__ */ new Date()).getHours();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/cared-ones/MedicineCard.tsx:679:5:7d9b64e2b3d3009104b259db8525641c470f96c72d612cc057b0833cbdeb2660:1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/MedicineCard.tsx:680:7:b11c727e4fae8e8b5bdc4d990285164457ce8b70eaa0bbb96e778a29473c72fa:1",
				className: "flex flex-wrap items-center justify-between gap-2 mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					"data-inspector-source": "components/cared-ones/MedicineCard.tsx:681:9:8f848f2f1de3cd6dada140941fa96d3174f6648146daff250623f9f069c34de7:1",
					className: "min-w-0 text-lg font-bold text-foreground",
					children: Z("用药追踪", "Medicine Tracker")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/cared-ones/MedicineCard.tsx:682:9:8b8fe3b7bf95d0f0141ae70c7a1dabc0d2b5144f71115b481762ec3895c913c7:1",
					className: "flex w-full min-w-0 items-center gap-2 sm:w-auto",
					"aria-label": Z("用药视图与添加", "Medicine views and add"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/cared-ones/MedicineCard.tsx:683:11:a438ba987653ad8ae76d4bad42c9c15a45dd9a75fc6625f2d3ecec60101984c9:1",
						className: "grid h-9 min-w-0 flex-1 grid-cols-[1fr_0.85fr_1.2fr] overflow-hidden rounded-lg border sm:w-[228px] sm:flex-none",
						role: "tablist",
						"aria-label": Z("用药视图", "Medicine views"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								role: "tab",
								"aria-selected": view === "timeline",
								variant: "ghost",
								onClick: () => setView("timeline"),
								className: `h-full min-w-0 rounded-none px-2 text-xs ${view === "timeline" ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "text-muted-foreground"}`,
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
								children: Z("用药管理", "Manage")
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
			adherenceSummary && adherenceSummary.totalSlots > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/MedicineCard.tsx:694:9:720b710d7d1ca4d4fefbcac60afe7cfb3d33fcd923788d022beea0c7359cec22:1",
				className: "mb-4 p-3 rounded-xl bg-muted/50 border border-border/50",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/cared-ones/MedicineCard.tsx:695:11:d5667453e81ecd4a7e928847b0cf5b10435f66fd0dce35778de9a8c365571f7a:1",
						className: "flex items-center justify-between mb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							"data-inspector-source": "components/cared-ones/MedicineCard.tsx:696:13:aab82a670092f5676f890779c4ab923423f8bc1753ba564e74ed4a88931c7109:1",
							className: "text-xs font-medium text-muted-foreground flex items-center gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-3.5 w-3.5" }),
								" ",
								Z("今日进度", "Today's Progress")
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							"data-inspector-source": "components/cared-ones/MedicineCard.tsx:699:13:a96fb9892bdfe4134ead5fe7a1ac9a37b128fadee176441c13db04e22aba3d18:1",
							className: "text-sm font-bold text-foreground",
							children: [adherenceSummary.pct, "%"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "components/cared-ones/MedicineCard.tsx:701:11:e1e027daa4b63c8b0c1b64565cda6b3a2aeef3a7d2c681a58c04a637664ae72f:1",
						className: "h-2 rounded-full bg-muted overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
							className: "h-full rounded-full bg-gradient-to-r from-success to-success/80",
							initial: { width: 0 },
							animate: { width: `${adherenceSummary.pct}%` },
							transition: {
								duration: .6,
								ease: "easeOut"
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/cared-ones/MedicineCard.tsx:709:11:4b649152a7dc3bf987f535a58c78a195f4958f104ae1e37305fc35e1af5013c0:1",
						className: "flex gap-3 mt-2 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:710:13:b708a5aa40ea1c870ca1943f51bb96578218bf7233106dfa004ef02fef824857:1",
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3 text-success" }),
									" ",
									adherenceSummary.taken,
									" ",
									Z("已服用", "taken")
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:711:13:a34400fe69f70e29024fc8fbc97a5be0c0674596f9741883e6ba4c17f763c43c:1",
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "h-3 w-3 text-warning" }),
									" ",
									adherenceSummary.skipped,
									" ",
									Z("已跳过", "skipped")
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:712:13:2ad0461cd13a389adbe1477d420582442c96cfa34377835bd289405eb6ff204f:1",
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3" }),
									" ",
									adherenceSummary.pending,
									" ",
									Z("待服", "pending")
								]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: addOpen,
				onOpenChange: setAddOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: Z("添加药品", "Add Medicine") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: Z("将药物添加到每日计划", "Add a medication to the daily schedule") })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/cared-ones/MedicineCard.tsx:721:11:1ac5ea4d441b4926f94bcb09515e7e5ebd280c0295c90fc7a30b7a08f2a729c8:1",
					className: "space-y-4 mt-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/MedicineCard.tsx:722:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [
									Z("药品名称", "Medicine Name"),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-source": "components/cared-ones/MedicineCard.tsx:723:50:b02155b996f301a3a3554a945d2237987a8273c365654bc7551a0720ce5de2d6:1",
										className: "text-destructive",
										children: "*"
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RxNormNameInput, {
									value: form.name,
									onChange: (v) => setForm((p) => ({
										...p,
										name: v
									})),
									onPick: ({ name, strength, rxcui }) => {
										setForm((p) => ({
											...p,
											name,
											dosage: p.dosage || strength || "",
											rxcui: rxcui || ""
										}));
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-source": "components/cared-ones/MedicineCard.tsx:732:15:8a8fae169588aef8e722af940e887b531545c170fb9f035628ad129726b896bd:1",
									className: "text-[10px] text-muted-foreground mt-1",
									children: Z("由 RxNorm(NIH/NLM)提供 — 免费美国药品数据库", "Powered by RxNorm (NIH/NLM) — free US drug database")
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/MedicineCard.tsx:734:13:37078065acf0e00bda900d47a69b1df85a33458fc30b9f78a703de0c2b5b767c:1",
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:735:15:85497b963a5c9f9f5e64b53e69450f71e61580c574ec9d2a6c83b3b6497f08ad:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("剂量", "Dosage") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.dosage,
									onChange: (e) => setForm((p) => ({
										...p,
										dosage: e.target.value
									})),
									placeholder: Z("例如:10 毫克", "e.g. 10mg"),
									className: "mt-1"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:736:15:e6b86fea7151d7aaa4c035c8da71d9b201e78582826cf66d881511dae815de0c:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("频率", "Frequency") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.frequency,
									onValueChange: (v) => setForm((p) => ({
										...p,
										frequency: v,
										time_slots: resizeSlots(v, p.time_slots)
									})),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "mt-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: FREQUENCIES.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: f.value,
										children: f.label
									}, f.value)) })]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/MedicineCard.tsx:743:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:744:15:3ef4777877aa3fa103cc4900927d2e5278d05e03979d893db27b94cce2d4625b:1",
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("服药时间", "Scheduled Times") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "ghost",
									size: "sm",
									onClick: () => setForm((p) => withSlots(p, [...p.time_slots, nextFreeTime(p.time_slots)])),
									className: "text-xs h-7",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3 mr-1" }),
										" ",
										Z("添加时间", "Add Time")
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:745:15:f72ce0a500099be8052c292691aaefc1485da70264a4986fc1e789da69dadcb0:1",
								className: "space-y-2 mt-1",
								children: form.time_slots.map((slot, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/cared-ones/MedicineCard.tsx:747:19:1db67b82a3f23c60d5208601bb8081f74c5a0ff734a65ba58a342b651f57e122:1",
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: slot,
										onValueChange: (v) => setForm((p) => ({
											...p,
											time_slots: p.time_slots.map((t, i) => i === idx ? v : t)
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 mr-2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: SCHEDULE_TIMES.filter((t) => t.value === slot || !form.time_slots.includes(t.value)).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: t.value,
											children: t.label
										}, t.value)) })]
									}), form.time_slots.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "ghost",
										size: "icon",
										className: "h-8 w-8 text-destructive shrink-0",
										onClick: () => setForm((p) => withSlots(p, p.time_slots.filter((_, i) => i !== idx))),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" })
									})]
								}, idx))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/MedicineCard.tsx:757:13:665bc2e3e4a71721925ab5432467f80af5ef584c6c101108bfec4cc5bba05c34:1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [
								Z("备注", "Notes"),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-source": "components/cared-ones/MedicineCard.tsx:757:43:665bc2e3e4a71721925ab5432467f80af5ef584c6c101108bfec4cc5bba05c34:1",
									className: "text-muted-foreground text-xs",
									children: Z("(可选)", "(optional)")
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: form.note,
								onChange: (e) => setForm((p) => ({
									...p,
									note: e.target.value
								})),
								placeholder: Z("随餐服用、避免乳制品…", "Take with food, avoid dairy…"),
								className: "mt-1 min-h-[60px]"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/MedicineCard.tsx:758:13:37078065acf0e00bda900d47a69b1df85a33458fc30b9f78a703de0c2b5b767c:1",
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:759:15:848c943e2ec52dddc99deb7214eb6dff0eee1bef373de9f6efbda9f328332cf3:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [
									Z("库存数量", "Stock count"),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-source": "components/cared-ones/MedicineCard.tsx:759:53:848c943e2ec52dddc99deb7214eb6dff0eee1bef373de9f6efbda9f328332cf3:1",
										className: "text-muted-foreground text-xs",
										children: Z("(可选)", "(optional)")
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									min: "0",
									value: form.stock_count,
									onChange: (e) => setForm((p) => ({
										...p,
										stock_count: e.target.value
									})),
									placeholder: "e.g. 30",
									className: "mt-1"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:760:15:6c870de0273881c7a61cdd8f8be5cc42adf039f5a64c759923daec25196b50d9:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [
									Z("补药提醒阈值", "Refill alert at"),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-source": "components/cared-ones/MedicineCard.tsx:760:59:6c870de0273881c7a61cdd8f8be5cc42adf039f5a64c759923daec25196b50d9:1",
										className: "text-muted-foreground text-xs",
										children: Z("(可选)", "(optional)")
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									min: "0",
									value: form.refill_threshold,
									onChange: (e) => setForm((p) => ({
										...p,
										refill_threshold: e.target.value
									})),
									placeholder: "e.g. 7",
									className: "mt-1"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/MedicineCard.tsx:762:13:927a99fb6383a094ffed45066f46e1d7f11e90ffc47831884805fa6a68536ff3:1",
							className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:763:15:afee3aff3b0e58bc69a74aa13235001f4ba6065d7509e53c39084b5feff576bb:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("提前提醒(分钟)", "Remind before (min)") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									min: "0",
									value: form.reminder_time_before,
									onChange: (e) => setForm((p) => ({
										...p,
										reminder_time_before: e.target.value
									})),
									className: "mt-1"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:764:15:b6c7f1804f939120f5deef1738bb2be190b6c0a197a7d5acb324325b801495bf:1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: Z("多久通知护理者(分钟)", "Notify caregiver after (min)") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									min: "0",
									value: form.time_to_send_to_caregiver,
									onChange: (e) => setForm((p) => ({
										...p,
										time_to_send_to_caregiver: e.target.value
									})),
									className: "mt-1"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/MedicineCard.tsx:766:13:5a2fa06e9bb29f8eece13a118a361343037bc95ad3a5f18deb460051d35878e6:1",
							className: "sticky bottom-0 -mx-6 flex gap-2 border-t bg-background px-6 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setAddOpen(false),
								children: Z("取消", "Cancel")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "flex-1",
								variant: "coral",
								onClick: handleAdd,
								disabled: createMed.isPending || !form.name.trim(),
								children: [
									createMed.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-2" }),
									" ",
									Z("添加药品", "Add Medicine")
								]
							})]
						})
					]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogNoteDialog, {
				open: logDialog.open,
				onClose: () => setLogDialog({
					open: false,
					med: null,
					action: "taken"
				}),
				onConfirm: confirmLog,
				medName: logDialog.med?.name || "",
				action: logDialog.action,
				isPending: logMed.isPending
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MedHistoryDialog, {
				open: !!historyMed,
				onClose: () => setHistoryMed(null),
				med: historyMed
			}),
			editMed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditMedDialog, {
				open: !!editMed,
				onClose: () => setEditMed(null),
				med: editMed,
				onDelete: () => {
					deleteMed.mutate(editMed.id, { onSuccess: () => {
						toast({ title: Z(`${editMed.name} 已删除`, `${editMed.name} deleted`) });
						setEditMed(null);
					} });
				}
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" }) : view === "timeline" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "components/cared-ones/MedicineCard.tsx:805:9:96dfe9398999c78ed32015857df835de87fcd155c92035bd79069fa427a351e3:1",
				className: "space-y-0",
				children: !hasScheduledMeds ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/cared-ones/MedicineCard.tsx:807:13:d0479225c7eb3fdfdda984ecf9c08b1ebc52ca1983bee3c3eb5bc28e034f889d:1",
					className: "text-center py-12",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { className: "h-10 w-10 text-muted-foreground mx-auto mb-3" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "components/cared-ones/MedicineCard.tsx:809:15:219d948be989b6ee4ca3e12329e4466b9a3a0bfeb9d75c844247063c1dad1183:1",
							className: "text-muted-foreground mb-3",
							children: Z("暂未安排药物", "No medications scheduled yet")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "coral",
							size: "sm",
							onClick: () => setAddOpen(true),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }),
								" ",
								Z("添加第一个药品", "Add First Medicine")
							]
						})
					]
				}) : TIMELINE_HOURS.map((hour) => {
					const medsAtTime = timelineMeds[hour];
					const hourNum = parseInt(hour.split(":")[0]);
					const isCurrentHour = currentHour === hourNum;
					const isPast = hourNum < currentHour;
					if (!medsAtTime && !isCurrentHour) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/cared-ones/MedicineCard.tsx:819:15:c7c85949edb859a896a6f006541ff13a1396fc56fc20e42f90f9bed3cc2cdf21:1",
						className: `flex border-b border-border/30 ${isCurrentHour ? "bg-primary/5" : ""}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/cared-ones/MedicineCard.tsx:820:17:30392329a1a4817db80099a25ad1b507dc2fa2dd7682c99514b9d8f99641a6d6:1",
							className: `w-14 sm:w-20 shrink-0 py-3 px-1 sm:px-2 text-xs font-medium ${isCurrentHour ? "text-primary font-semibold" : isPast ? "text-muted-foreground/60" : "text-muted-foreground"}`,
							children: [isCurrentHour && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:821:37:58f6d237ec2b0b9aa71808d012f144c4ab01c0035a35aa05508a47922a7c12a3:1",
								className: "w-2 h-2 rounded-full bg-primary inline-block mr-1 animate-pulse"
							}), formatHour(hour)]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-source": "components/cared-ones/MedicineCard.tsx:824:17:3dd45c0cafa6981c73432ddb9deb1e6dfbc043c093dc053df1f334baade66912:1",
							className: "min-w-0 flex-1 py-2 pr-1 sm:px-2",
							children: medsAtTime ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:826:21:7797cf625e2a6da5c13ad2e5d24962cf5996f825e6686aafdbff036a8ac646a3:1",
								className: "space-y-2",
								children: medsAtTime.map(({ med, slot }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MedDoseCard, {
									med,
									todayLogs: todayLogs || [],
									onLog: handleLog,
									onEdit: setEditMed,
									onDelete: (m) => deleteMed.mutateAsync(m.id),
									onHistory: setHistoryMed,
									compact: true,
									slot
								}, `${med.id}-${slot}`))
							}) : isCurrentHour ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:842:21:ac7cc72e36fa8ae4557868340e2df97d749ebc41ffbbc85ee6bfaf32d1eafeb8:1",
								className: "text-xs text-muted-foreground py-2 italic",
								children: Z("此时段无药物", "No meds at this time")
							}) : null
						})]
					}, hour);
				})
			}) : view === "records" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "components/cared-ones/MedicineCard.tsx:850:9:a9929ebdeed0219092c2fcd37f2f2e7dc244c8e4e2f4be9fa5f3c342ed4ae6f9:1",
				className: "space-y-2",
				children: allLogsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" }) : (allLogs || []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "components/cared-ones/MedicineCard.tsx:854:13:80c10272453d02a1f48d0d0810d74ecf9834efad4be7f691c333f4e8c8046132:1",
					className: "text-center py-8 text-muted-foreground",
					children: Z("暂无服药记录", "No dose records yet")
				}) : (allLogs || []).map((log) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/cared-ones/MedicineCard.tsx:857:15:b9e2655be18193ad88d8a6ec77aa4c51b04b4d7e22073eedfe65c291b41ce885:1",
					className: "flex items-start gap-3 rounded-xl border border-border/50 bg-card p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "components/cared-ones/MedicineCard.tsx:858:17:29dce2aaac73bf3bd97321f80eb457a1ec2987ecd99472ed014e7bf95c8e9d26:1",
						className: `mt-0.5 shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${log.status === "taken" ? "bg-success/15 text-success" : log.status === "skipped" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"}`,
						children: log.status === "taken" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5" }) : log.status === "skipped" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-3.5 w-3.5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/cared-ones/MedicineCard.tsx:861:17:69c6dd6ee5697db1796eaf763adfffd34e8077adf6a8fb1ebb8a44bdd1a5c16c:1",
						className: "flex-1 min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:862:19:65452639ab5901d45f1385f697d8918307d34f601ef02390b31b5166ac68d559:1",
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-source": "components/cared-ones/MedicineCard.tsx:863:21:f3bc9536739d10c5db8d0f638bf808acb0099396b2a18de33b392bd6efdea4b6:1",
									className: "text-sm font-medium break-words",
									children: log.med_name || log.concept_display_text || Z("药品", "Medicine")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: `text-xs ${log.status === "taken" ? "border-success/40 text-success" : log.status === "skipped" ? "border-warning/40 text-warning" : "border-destructive/40 text-destructive"}`,
									children: log.status === "taken" ? Z("已服用", "Taken") : log.status === "skipped" ? Z("已跳过", "Skipped") : Z("漏服", "Missed")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:868:19:75242c101df29f64d6c6a687866a743b0001bc066fcf9e771b4b5e844b0a5e95:1",
								className: "text-xs text-muted-foreground mt-0.5",
								children: [
									log.scheduled_date ? `${Z("计划", "Scheduled")} ${formatDateTime(log.scheduled_date, config_default.language)} · ` : "",
									formatDate(log.created_at),
									" · ",
									formatTime(log.created_at)
								]
							}),
							log.note && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								"data-inspector-source": "components/cared-ones/MedicineCard.tsx:872:21:a81d990a35d7257cb46d1488d46e3aa63a39407a6507283b11430703291d9711:1",
								className: "text-xs text-muted-foreground mt-0.5 flex items-start gap-1 break-words",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickyNote, { className: "h-3 w-3 mt-0.5 shrink-0" }), log.note]
							})
						]
					})]
				}, log.id))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/cared-ones/MedicineCard.tsx:882:9:a9929ebdeed0219092c2fcd37f2f2e7dc244c8e4e2f4be9fa5f3c342ed4ae6f9:1",
				className: "space-y-2",
				children: [(meds || []).map((med) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MedDoseCard, {
					med,
					todayLogs: todayLogs || [],
					onLog: handleLog,
					onEdit: setEditMed,
					onDelete: (m) => deleteMed.mutateAsync(m.id),
					onHistory: setHistoryMed,
					manage: true,
					slot: med.time_slot && med.time_slot[0] || void 0
				}, med.id)), (meds || []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "components/cared-ones/MedicineCard.tsx:896:41:c01ec1a44e9c864de5a6f81ccab666d5dac639252f67847d846236c23d0479d1:1",
					className: "text-center py-8 text-muted-foreground",
					children: Z("尚未添加药物", "No medications added yet")
				})]
			})
		]
	});
}
//#endregion
export { MedicineCard };
