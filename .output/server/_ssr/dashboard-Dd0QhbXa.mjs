import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { a as closestCenter, h as CSS, i as PointerSensor, m as useSensors, p as useSensor, r as KeyboardSensor, t as DndContext } from "../_libs/@dnd-kit/core+[...].mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-Cz5iPbNd.mjs";
import { t as Badge } from "./badge-Dn-oRli-.mjs";
import { i as getStoredWPUser } from "./wp-auth-DL1jfVY7.mjs";
import { t as formatDate } from "./locale-DKwjQju2.mjs";
import { $t as GripVertical, Dn as CircleCheckBig, Dt as MapPin, Ln as CalendarDays, On as CircleAlert, St as MessageSquare, U as Settings2, Xn as ArrowRight, _ as TriangleAlert, c as Users, et as RefreshCw, j as Sparkles, k as SquareCheckBig, st as Pill, vn as Clock, xn as ClipboardCheck } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { r as useSite } from "./SiteContext-Br0kF93Q.mjs";
import { _ as resolveBriefingFacts, c as buildBriefingRequest } from "./ai-dynamic-knowledge-C5tnjGCy.mjs";
import { A as useCareGroups, Gn as useTodayMedicineLogs, I as useCaredOneLocation, Kt as useInboxCounts, N as useCareTasks, S as useBookings, V as useCheckins, Wn as useTodayCheckinLogs, ln as useMedicines, yn as usePosts, yr as useUserCaredOnes } from "./use-care-data-7GR_eJDG.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-HRlnwchH.mjs";
import { n as pendingCareTasks, t as pendingCareTaskTarget } from "./pending-Cmgt3sc7.mjs";
import { n as invokeAI, r as parseAIJson } from "./ai-CfmTn5iV.mjs";
import { t as config_default } from "./config-wade6xrr.mjs";
import { n as useAuth } from "./AuthContext-BAA6n6xi.mjs";
import { t as Switch } from "./switch-Coli7fra.mjs";
import { i as useNavigate$1 } from "./router-compat-3gk8yjav.mjs";
import { n as findDoseLog } from "./dose-slot--5Nbxcmi.mjs";
import { t as RequireAuth } from "./RequireAuth-CXvd5_cn.mjs";
import { t as Skeleton } from "./skeleton-BTLGg-Aw.mjs";
import { a as SheetTrigger, i as SheetTitle, n as SheetContent, r as SheetHeader, t as Sheet } from "./sheet-D4w8zsz2.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-rX0KJQzY.mjs";
import { a as verticalListSortingStrategy, i as useSortable, n as arrayMove, r as sortableKeyboardCoordinates, t as SortableContext } from "../_libs/dnd-kit__sortable.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-Dd0QhbXa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PatientSummaryCard({ caredOneId, name, avatarUrl, relationship, onClick }) {
	const { t } = useTranslation();
	const { data: checkins } = useCheckins(caredOneId);
	const { data: todayCheckinLogs } = useTodayCheckinLogs(caredOneId);
	const { data: medicines } = useMedicines(caredOneId);
	const { data: location } = useCaredOneLocation(caredOneId);
	const { data: tasks } = useCareTasks();
	const latestCheckinLog = todayCheckinLogs?.[0];
	const hasCheckinToday = !!todayCheckinLogs?.some((log) => log.status === "taken");
	const totalMeds = medicines?.length || 0;
	const totalCheckins = checkins?.length || 0;
	const hasRecentLocation = location && location.latitude;
	const locationAge = location?.updated_at ? Math.round((Date.now() - new Date(location.updated_at).getTime()) / 6e4) : null;
	const caredOneTasks = pendingCareTasks(tasks, [caredOneId]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "border-transparent card-elevated cursor-pointer hover:border-primary/30 transition-all",
		onClick,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/challenged/PatientSummaryCard.tsx:38:9:f477f7c1a333a8313e0739465c02dc8175000938d1a4146c4c244b28904dd459:1",
				className: "flex items-center gap-3 mb-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
						className: "h-11 w-11",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: avatarUrl || void 0 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
							className: "bg-primary/10 text-primary font-semibold",
							children: name?.[0]?.toUpperCase() || "?"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/challenged/PatientSummaryCard.tsx:45:11:5a7c572af95dd09e85bda96553d19e88078b3a755412ca9f76b1e3ba4099e33f:1",
						className: "flex-1 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							"data-inspector-source": "components/challenged/PatientSummaryCard.tsx:46:13:4f337e3041d01ac99aceadd45c341ed8dbaf30c6a5859682dc6fcaa1dfd55e1f:1",
							className: "font-semibold text-foreground text-sm truncate",
							children: name
						}), relationship && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "components/challenged/PatientSummaryCard.tsx:47:30:bdf8b645b9c953728695772125bd11704a8085a906e721532d231a241bbb8c49:1",
							className: "text-xs text-muted-foreground capitalize",
							children: relationship
						})]
					}),
					hasCheckinToday && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						className: "bg-success/10 text-success border-success/30 text-[10px]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-3 w-3 mr-1" }),
							" ",
							t("patientSummary.checkedIn")
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/challenged/PatientSummaryCard.tsx:56:9:ead0979e84e8dae56ef53aa18b250974a1c07c675ee6e3606a194fe01ed580b8:1",
				className: "grid grid-cols-2 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/challenged/PatientSummaryCard.tsx:57:11:7732beee54204026f8faee7594e8369a228433cce5f3f31acdcd892a27e8f155:1",
						className: "flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1.5 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "h-3.5 w-3.5 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/challenged/PatientSummaryCard.tsx:59:13:f46ae6889abb1a936ade348011002481ba6b7aa9a819fbf62faaa3d7d137babb:1",
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/challenged/PatientSummaryCard.tsx:60:15:371af70b818dbe50853860959f4024626c25837659cbe878b7ddd72a020a8f09:1",
								className: "text-[10px] text-muted-foreground truncate",
								children: t("patientSummary.checkIns") || "Check-ins"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/challenged/PatientSummaryCard.tsx:61:15:355fd2817ee8595c6a804122d8083fdcc61fdc4bf70be4bd0cbe4ea297acd6eb:1",
								className: "text-[11px] font-medium text-foreground truncate",
								children: latestCheckinLog?.status === "taken" ? t("patientSummary.completedToday") || "Done today" : totalCheckins > 0 ? t("patientSummary.pendingToday") || "Pending" : t("patientSummary.noSchedule") || "None"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/challenged/PatientSummaryCard.tsx:65:11:7732beee54204026f8faee7594e8369a228433cce5f3f31acdcd892a27e8f155:1",
						className: "flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1.5 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { className: "h-3.5 w-3.5 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/challenged/PatientSummaryCard.tsx:67:13:f46ae6889abb1a936ade348011002481ba6b7aa9a819fbf62faaa3d7d137babb:1",
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/challenged/PatientSummaryCard.tsx:68:15:842e5271b3041b4a7dcae7d58d787539244556ab92e4cefac2647ae88b425292:1",
								className: "text-[10px] text-muted-foreground truncate",
								children: t("patientSummary.medications")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								"data-inspector-source": "components/challenged/PatientSummaryCard.tsx:69:15:3f713c4e1c5852743b28ac569d0f60c8618d11fe5b59d693cf351251b93bc207:1",
								className: "text-[11px] font-medium text-foreground truncate",
								children: [
									totalMeds,
									" ",
									t("patientSummary.active")
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/challenged/PatientSummaryCard.tsx:73:11:7732beee54204026f8faee7594e8369a228433cce5f3f31acdcd892a27e8f155:1",
						className: "flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1.5 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/challenged/PatientSummaryCard.tsx:75:13:f46ae6889abb1a936ade348011002481ba6b7aa9a819fbf62faaa3d7d137babb:1",
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/challenged/PatientSummaryCard.tsx:76:15:89aaa88d3fcebb4267ceb9cd71c6684bdc74dc8cff301d0acdeaa80e8127f952:1",
								className: "text-[10px] text-muted-foreground truncate",
								children: t("patientSummary.location")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/challenged/PatientSummaryCard.tsx:77:15:e884cd758d21d2222ae70af17446256cbd903679034865c61143c449be061d1a:1",
								className: "text-[11px] font-medium text-foreground truncate",
								children: hasRecentLocation ? locationAge != null && locationAge < 60 ? `${locationAge}m ${t("patientSummary.ago")}` : t("patientSummary.available") : t("patientSummary.noData")
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/challenged/PatientSummaryCard.tsx:87:11:7732beee54204026f8faee7594e8369a228433cce5f3f31acdcd892a27e8f155:1",
						className: "flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1.5 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "h-3.5 w-3.5 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/challenged/PatientSummaryCard.tsx:89:13:f46ae6889abb1a936ade348011002481ba6b7aa9a819fbf62faaa3d7d137babb:1",
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/challenged/PatientSummaryCard.tsx:90:15:b58fa9586275195b13f8d1c447cbe1ddba87949ccef8af07b98adca7d83f1866:1",
								className: "text-[10px] text-muted-foreground truncate",
								children: t("patientSummary.tasks")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								"data-inspector-source": "components/challenged/PatientSummaryCard.tsx:91:15:5283a65779503a3d85e930bb4a3f724b736ca0fcfe595d78178a1e0c8cbd8b4e:1",
								className: "text-[11px] font-medium text-foreground truncate",
								children: [
									caredOneTasks.length,
									" ",
									t("patientSummary.pending")
								]
							})]
						})]
					})
				]
			})]
		})
	});
}
function DailyTimeline({ caredOneId, caredOneName }) {
	const { i18n } = useTranslation();
	const isZh = i18n.language?.startsWith("zh");
	const navigate = useNavigate$1();
	const site = useSite();
	const personId = String(caredOneId).replace(/^wp-/, "");
	const shownName = caredOneName || (isZh ? "被护理者" : site.caredOneSingular);
	const targetFor = (type) => type === "booking" ? "/bookings" : `/cared-ones/${personId}/${type === "medicine" ? "medicine" : type === "checkin" ? "checkin" : "tasks"}`;
	const { data: medicines } = useMedicines(caredOneId);
	const { data: todayLogs } = useTodayMedicineLogs(caredOneId);
	const { data: tasks } = useCareTasks();
	const { data: checkins } = useCheckins(caredOneId);
	const { data: todayCheckinLogs } = useTodayCheckinLogs(caredOneId);
	const { data: bookings } = useBookings();
	const today = (/* @__PURE__ */ new Date()).toDateString();
	const timelineItems = (0, import_react.useMemo)(() => {
		const items = [];
		(medicines || []).forEach((med) => {
			const statusAt = (slot) => {
				const medLog = findDoseLog(todayLogs || [], med.id, slot);
				return medLog?.status === "taken" ? "done" : medLog?.status === "skipped" ? "missed" : "pending";
			};
			const medStatus = statusAt();
			const slots = med.frequency_code === "as_needed" ? [] : med.today_slots || [];
			if (med.frequency_code !== "as_needed" && slots.length === 0) return;
			if (slots.length === 0) items.push({
				time: isZh ? "任意时间" : "Any time",
				sortTime: 1200,
				label: `${med.name} ${med.dosage ? `(${med.dosage})` : ""}`,
				type: "medicine",
				status: medStatus,
				icon: Pill
			});
			else slots.forEach((slot) => {
				const hour = parseInt(slot.split(":")[0] || "12");
				const minute = parseInt(slot.split(":")[1] || "0");
				const isPM = hour >= 12;
				const display12 = `${hour > 12 ? hour - 12 : hour || 12}:${String(minute).padStart(2, "0")} ${isPM ? "PM" : "AM"}`;
				items.push({
					time: display12,
					sortTime: hour * 100 + minute,
					label: `${med.name} ${med.dosage ? `(${med.dosage})` : ""}`,
					type: "medicine",
					status: statusAt(slot),
					icon: Pill
				});
			});
		});
		const coId = String(caredOneId).replace(/^wp-/, "");
		const me = String(getStoredWPUser()?.user_id ?? "");
		(tasks || []).filter((t) => {
			if (String(t.cared_one_id ?? "").replace(/^wp-/, "") !== coId) return false;
			const assignees = (t.assigned_to_ids || []).map((x) => String(x));
			if (me && String(t.created_by ?? "") !== me && !assignees.includes(me)) return false;
			const when = t.task_date || t.due_date;
			if (!when) return false;
			return new Date(when).toDateString() === today;
		}).forEach((t) => {
			const start = String(t.start_time || "");
			const hour = start.includes(":") ? parseInt(start.split(":")[0] || "9") : 9;
			const minute = start.includes(":") ? parseInt(start.split(":")[1] || "0") : 0;
			const isPM = hour >= 12;
			items.push({
				time: start.includes(":") ? `${hour > 12 ? hour - 12 : hour || 12}:${String(minute).padStart(2, "0")} ${isPM ? "PM" : "AM"}` : isZh ? "今天" : "Today",
				sortTime: hour * 100 + minute,
				label: t.title,
				type: "task",
				status: t.status === "completed" ? "done" : "pending",
				icon: SquareCheckBig
			});
		});
		(bookings || []).forEach((b) => {
			const when = b.appointment_date || b.start_time;
			if (!when || new Date(when).toDateString() !== today) return;
			if (["cancelled", "refunded"].includes(String(b.status))) return;
			const at = String(b.appointment_time || "");
			const hour = at.includes(":") ? parseInt(at.split(":")[0] || "10") : 10;
			const minute = at.includes(":") ? parseInt(at.split(":")[1] || "0") : 0;
			const isPM = hour >= 12;
			items.push({
				time: `${hour > 12 ? hour - 12 : hour || 12}:${String(minute).padStart(2, "0")} ${isPM ? "PM" : "AM"}`,
				sortTime: hour * 100 + minute,
				label: [b.provider?.full_name, b.service_type].filter(Boolean).join(" · ") || (isZh ? "预约" : "Appointment"),
				type: "booking",
				status: b.status === "completed" ? "done" : "pending",
				icon: CalendarDays
			});
		});
		(checkins || []).forEach((checkin) => {
			const checkinLog = (todayCheckinLogs || []).find((l) => l.medicine_id === checkin.id);
			const checkinStatus = checkinLog?.status === "taken" ? "done" : checkinLog?.status === "skipped" ? "missed" : "pending";
			(Array.isArray(checkin.time_slot) && checkin.time_slot.length > 0 ? checkin.time_slot : ["08:00"]).forEach((slot) => {
				const hour = parseInt(slot.split(":")[0] || "8");
				const minute = parseInt(slot.split(":")[1] || "0");
				const isPM = hour >= 12;
				const display12 = `${hour > 12 ? hour - 12 : hour || 12}:${String(minute).padStart(2, "0")} ${isPM ? "PM" : "AM"}`;
				items.push({
					time: display12,
					sortTime: hour * 100 + minute,
					label: checkin.name || (isZh ? "每日打卡" : "Daily check-in"),
					type: "checkin",
					status: checkinStatus,
					icon: ClipboardCheck
				});
			});
		});
		return items.sort((a, b) => a.sortTime - b.sortTime);
	}, [
		medicines,
		todayLogs,
		tasks,
		checkins,
		todayCheckinLogs,
		bookings,
		caredOneId,
		today,
		isZh
	]);
	const statusColor = {
		done: "bg-success/10 text-success border-success/30",
		pending: "bg-warning/10 text-warning border-warning/30",
		missed: "bg-destructive/10 text-destructive border-destructive/30"
	};
	const iconColor = {
		medicine: "text-primary",
		task: "text-secondary",
		checkin: "text-success",
		booking: "text-coral"
	};
	if (timelineItems.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "border-transparent card-elevated",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
			className: "pb-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "text-base flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-primary" }), isZh ? `今日事项 — ${shownName}` : `Today's Events — ${shownName}`]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "pt-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/challenged/DailyTimeline.tsx:183:9:36ad4af307838ca8ba9fb312680fecc4ea0e1486dc57b53dcd59dbc1fd0b30bb:1",
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "components/challenged/DailyTimeline.tsx:185:11:8e44cc55f589361547fe2ddce8e8f72c2658b24b40c0aa56ab6000ba99aa8e88:1",
					className: "absolute left-[18px] top-2 bottom-2 w-px bg-border"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "components/challenged/DailyTimeline.tsx:187:11:94490c180d4f0469c17deda0b1a4d7cc86527230dc532ba16ef5120fe55a0723:1",
					className: "space-y-2",
					children: timelineItems.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						"data-inspector-source": "components/challenged/DailyTimeline.tsx:189:15:0c80350ec5ca4aaa246b9000dab9d4f654a8c9f4f240bf7fb630907f7e069b58:1",
						type: "button",
						onClick: () => navigate(targetFor(item.type)),
						className: "w-full text-left flex items-start gap-3 relative rounded-lg hover:bg-muted/60 transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-source": "components/challenged/DailyTimeline.tsx:191:17:d48324b70176b1e2cae400285157aba8faf201da4593f77ee369a1bf811db007:1",
							className: `z-10 shrink-0 w-9 h-9 rounded-full bg-card border-2 border-border flex items-center justify-center ${iconColor[item.type]}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/challenged/DailyTimeline.tsx:194:17:209a2f6f517749c0c6e5ef882302921f4b7192c874065ad5d627a2ad262293fe:1",
							className: "flex-1 min-w-0 py-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/challenged/DailyTimeline.tsx:195:19:36c601bcb3180f38919ced665bafae6dcd22af2a741c5d4101e1f60d93a2c385:1",
								className: "flex items-center gap-2 flex-wrap",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-source": "components/challenged/DailyTimeline.tsx:196:21:283c0eed54905fa45bbc9da595e66231ab3f9860dde820083c60c384454cfe28:1",
									className: "text-xs font-medium text-muted-foreground",
									children: item.time
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: `text-[10px] ${statusColor[item.status]}`,
									children: isZh ? {
										done: "已完成",
										pending: "待办",
										missed: "未完成"
									}[item.status] : item.status
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/challenged/DailyTimeline.tsx:201:19:a2b965c38788067cb9522c4dc4f7b70ff18929ca35943ddafe3c8580e1171bf1:1",
								className: "text-sm text-foreground truncate",
								children: item.label
							})]
						})]
					}, `${item.type}-${i}`))
				})]
			})
		})]
	});
}
var VIS_KEY = "dashboard-widget-prefs";
var ORDER_KEY = "dashboard-widget-order";
function getWidgetPrefs() {
	try {
		return JSON.parse(localStorage.getItem(VIS_KEY) || "{}");
	} catch {
		return {};
	}
}
function setWidgetPrefs(prefs) {
	try {
		localStorage.setItem(VIS_KEY, JSON.stringify(prefs));
	} catch {}
}
function getWidgetOrder() {
	try {
		return JSON.parse(localStorage.getItem(ORDER_KEY) || "[]");
	} catch {
		return [];
	}
}
function setWidgetOrder(order) {
	try {
		localStorage.setItem(ORDER_KEY, JSON.stringify(order));
	} catch {}
}
/** Merge saved order with available widgets (saved first, then any new widgets appended) */
function resolveOrder(available, saved) {
	const ids = available.map((w) => w.id);
	const filtered = saved.filter((id) => ids.includes(id));
	const missing = ids.filter((id) => !filtered.includes(id));
	return [...filtered, ...missing];
}
var ZH_WIDGET_LABELS = {
	"patient-summaries": "被护理者概览",
	"daily-timeline": "每日时间线",
	"stats": "统计概览",
	"upcoming-bookings": "即将到来的预约",
	"care-tasks": "护理任务",
	"community-feed": "社区动态"
};
function localizeWidgetLabel(id, fallback, isZh) {
	return isZh ? ZH_WIDGET_LABELS[id] || fallback : fallback;
}
function SortableRow({ widget, checked, onToggle }) {
	const { i18n } = useTranslation();
	const isZh = i18n.language?.startsWith("zh");
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widget.id });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/dashboard/DashboardWidgetConfig.tsx:84:5:87864ea657de9b8df04eee17f170dc074229b35a52d6b8e6ccf42a09e690dd2b:1",
		ref: setNodeRef,
		style: {
			transform: CSS.Transform.toString(transform),
			transition,
			opacity: isDragging ? .5 : 1
		},
		className: "flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50 touch-none",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-source": "components/dashboard/DashboardWidgetConfig.tsx:89:7:eeb4cfcc408dca55e5436b141d3bcc8d1ba60a72659fa02566706b409a928f4f:1",
			className: "flex items-center gap-2 min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				"data-inspector-source": "components/dashboard/DashboardWidgetConfig.tsx:90:9:531de094e543e84b931063f332398a1934478c8e89ae2777f66c01dc07111df8:1",
				...attributes,
				...listeners,
				className: "cursor-grab active:cursor-grabbing touch-none p-1 -m-1",
				"aria-label": isZh ? "拖动重新排序" : "Drag to reorder",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, { className: "h-4 w-4 text-muted-foreground" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"data-inspector-source": "components/dashboard/DashboardWidgetConfig.tsx:98:9:ba5282997da7feaa12861f11606672b96d4e5ebbd2291ff1bf69153a0f3718e3:1",
				className: "text-sm font-medium truncate",
				children: widget.label
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			"aria-label": `${isZh ? "显示" : "Show"} ${localizeWidgetLabel(widget.id, widget.label, isZh)}`,
			checked,
			onCheckedChange: onToggle
		})]
	});
}
function DashboardWidgetConfig({ widgets, visibility, order, onChange, onReorder }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const { i18n } = useTranslation();
	const isZh = i18n.language?.startsWith("zh");
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
	const orderedWidgets = order.map((id) => widgets.find((w) => w.id === id)).filter((w) => !!w);
	function handleDragEnd(e) {
		const { active, over } = e;
		if (!over || active.id === over.id) return;
		const oldIdx = order.indexOf(String(active.id));
		const newIdx = order.indexOf(String(over.id));
		if (oldIdx < 0 || newIdx < 0) return;
		onReorder(arrayMove(order, oldIdx, newIdx));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				className: "gap-2",
				"aria-label": isZh ? "自定义面板" : "Customize dashboard",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"data-inspector-source": "components/dashboard/DashboardWidgetConfig.tsx:144:11:8361acee8e9cf7cd18245afcc92d74705ae23bae892b46f97c43bf797af4f533:1",
					className: "hidden sm:inline",
					children: isZh ? "自定义" : "Customize"
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			side: "right",
			className: "w-80",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: isZh ? "面板小部件" : "Dashboard Widgets" }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "components/dashboard/DashboardWidgetConfig.tsx:151:9:0bb3b90dc421293ad4be2340e6a188ca53eb3b23e1ded983fa58c22965175ef6:1",
					className: "text-xs text-muted-foreground mt-1 mb-4",
					children: isZh ? "拖动重新排序，点击开关显示或隐藏。" : "Drag to reorder. Toggle to show or hide."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DndContext, {
					sensors,
					collisionDetection: closestCenter,
					onDragEnd: handleDragEnd,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableContext, {
						items: order,
						strategy: verticalListSortingStrategy,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-source": "components/dashboard/DashboardWidgetConfig.tsx:156:13:5ca737ca92b381dd61b1bf6e56c19ce4d2db0e06f2d51b3de2f2cce60f2f25b2:1",
							className: "space-y-2",
							children: orderedWidgets.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableRow, {
								widget: {
									...w,
									label: localizeWidgetLabel(w.id, w.label, isZh)
								},
								checked: visibility[w.id] ?? true,
								onToggle: (v) => onChange(w.id, v)
							}, w.id))
						})
					})
				})
			]
		})]
	});
}
/**
* Master widget registry.
* `roles` controls who sees the widget by default.
*   "all" = everyone, "caregiver" = caregivers, "provider" = care providers, "caredOne" = cared ones
*/
var WIDGET_REGISTRY = [
	{
		id: "patient-summaries",
		label: "Cared One Overview",
		roles: ["caregiver", "provider"],
		challengedOnly: true
	},
	{
		id: "daily-timeline",
		label: "Today's Events",
		roles: ["caregiver", "provider"],
		challengedOnly: true
	},
	{
		id: "ai-briefing",
		label: "Today's Smart Briefing",
		roles: ["all"]
	},
	{
		id: "stats",
		label: "Stats Overview",
		roles: ["all"]
	},
	{
		id: "upcoming-bookings",
		label: "Upcoming Bookings",
		roles: ["all"]
	},
	{
		id: "care-tasks",
		label: "Care Tasks",
		roles: ["caregiver", "provider"]
	},
	{
		id: "community-feed",
		label: "Community Feed",
		roles: ["all"]
	}
];
/** Filter widgets to those relevant for the current user & site */
function getAvailableWidgets(isChallenged, userRole) {
	return WIDGET_REGISTRY.filter((w) => {
		if (w.challengedOnly && !isChallenged) return false;
		if (w.defaultOnly && isChallenged) return false;
		if (w.roles.includes("all")) return true;
		return w.roles.includes(userRole);
	});
}
/** Build default visibility map (all available = true) */
function getDefaultVisibility(widgets) {
	const map = {};
	widgets.forEach((w) => {
		map[w.id] = true;
	});
	return map;
}
function AISmartBriefing() {
	const isCN = (config_default.language || "").startsWith("zh");
	const Z = (cn, en) => isCN ? cn : en;
	const [data, setData] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [failed, setFailed] = (0, import_react.useState)(false);
	const run = (0, import_react.useCallback)(async () => {
		setLoading(true);
		setFailed(false);
		try {
			const reply = await invokeAI(buildBriefingRequest(await resolveBriefingFacts({ isChinese: isCN }), isCN), { language: isCN ? "zh" : "en" });
			const parsed = parseAIJson(reply);
			if (parsed) setData(parsed);
			else setData({ summary: reply });
		} catch {
			setFailed(true);
		} finally {
			setLoading(false);
		}
	}, [isCN]);
	(0, import_react.useEffect)(() => {
		run();
	}, [run]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-inspector-source": "components/dashboard/AISmartBriefing.tsx:44:5:42b16716106c67d3d0a4f375d545680cb90daa2058630a436e2c96b2cf8f7a1d:1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-source": "components/dashboard/AISmartBriefing.tsx:45:7:0768f39cf800a41614ffca587190808c6471af0097e07ff28ad879c6d0629650:1",
			className: "flex items-center justify-between mb-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				"data-inspector-source": "components/dashboard/AISmartBriefing.tsx:46:9:67adc47b1119242bd2889c0a61fc836e56aea2555727c564d77467cccf58b99b:1",
				className: "text-sm font-semibold text-foreground flex items-center gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-primary" }), Z("今日智能简报", "Today's Smart Briefing")]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: () => void run(),
				disabled: loading,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3.5 w-3.5 ${loading ? "animate-spin" : ""}` })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "border-primary/20 bg-primary/5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "p-4 space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "components/dashboard/AISmartBriefing.tsx:56:11:4c12f841e0cd46747db36eee34e5c34885a6dd915380d16e50196c5f7045c2c6:1",
					className: "text-xs text-muted-foreground",
					children: formatDate(/* @__PURE__ */ new Date())
				}), loading && !data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/dashboard/AISmartBriefing.tsx:58:13:5ca737ca92b381dd61b1bf6e56c19ce4d2db0e06f2d51b3de2f2cce60f2f25b2:1",
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-4/5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-3/5" })]
				}) : failed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "components/dashboard/AISmartBriefing.tsx:63:13:222509099689914b5ef62c3390635b843f9dded1a38beba2d42530ffb0746674:1",
					className: "text-sm text-muted-foreground",
					children: Z("暂时无法生成简报，请稍后再试。", "The briefing is unavailable right now. Please try again shortly.")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					(data?.alerts || []).filter((a) => a?.text).map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/dashboard/AISmartBriefing.tsx:69:17:2eb1e62ceae9f4c6ed9dc5b9978dc9772918c2e9d41efe7b5487d06cfd89bf27:1",
						className: "flex items-start gap-2 text-sm text-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: `h-4 w-4 shrink-0 mt-0.5 ${a.level === "high" ? "text-destructive" : "text-warning"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-source": "components/dashboard/AISmartBriefing.tsx:71:19:ce7176b5f7663416b962619fb974fcbfa200caf04426476696bda156ffa222ce:1",
							children: a.text
						})]
					}, i)),
					data?.summary ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/dashboard/AISmartBriefing.tsx:75:17:e5ed5d5d0fff980e6d5362ffbc57bc5a019f1c2fae7711be7a4d8714e4609bef:1",
						className: "text-sm text-foreground leading-relaxed",
						children: data.summary
					}) : null,
					(data?.suggestions || []).filter((s) => s?.title).map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/dashboard/AISmartBriefing.tsx:78:17:c8576cc0c48333467aff1abd68c227aa77f40d892a14aa0485fe882b9641e79f:1",
						className: "rounded-lg bg-card p-2.5 border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "components/dashboard/AISmartBriefing.tsx:79:19:fce0d83d67c43232d90d8cdad9ff731012586ea355a36ab0018ef6c408029875:1",
							className: "text-sm font-medium text-foreground",
							children: s.title
						}), s.detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "components/dashboard/AISmartBriefing.tsx:80:31:01be0f1a81249611c6f129ede3b1da772da29ea331e2e0b7d45ede3a0f322253:1",
							className: "text-xs text-muted-foreground mt-0.5",
							children: s.detail
						}) : null]
					}, i))
				] })]
			})
		})]
	});
}
function Dashboard() {
	const navigate = useNavigate$1();
	const { t, i18n } = useTranslation();
	const isChinese = i18n.language?.startsWith("zh");
	const { user } = useAuth();
	const site = useSite();
	const careGroupsLabel = isChinese ? t("nav.united", { defaultValue: "护理群组" }) : site.navLabels.careGroups;
	const { data: bookings, isLoading: bookingsLoading } = useBookings();
	const { data: tasks, isLoading: tasksLoading, error: tasksError } = useCareTasks();
	const { data: myCareGroups } = useCareGroups();
	const { unread: unreadInbox, isLoading: inboxLoading, error: inboxError } = useInboxCounts();
	const { data: caredOnes, isLoading: caredOnesLoading } = useUserCaredOnes();
	const { data: communityPosts, isLoading: postsLoading } = usePosts("care_community_post");
	const isChallenged = site.family === "challenged";
	const isLovedOne = user?.general_user_role?.includes("cared one") === true;
	const isProvider = user?.is_care_provider === true;
	const userRole = isLovedOne ? "caredOne" : isProvider ? "provider" : "caregiver";
	const availableWidgets = (0, import_react.useMemo)(() => getAvailableWidgets(isChallenged, userRole), [isChallenged, userRole]);
	const defaultVis = (0, import_react.useMemo)(() => getDefaultVisibility(availableWidgets), [availableWidgets]);
	const [visibility, setVisibility] = (0, import_react.useState)(() => ({
		...defaultVis,
		...getWidgetPrefs()
	}));
	const [order, setOrder] = (0, import_react.useState)(() => resolveOrder(availableWidgets, getWidgetOrder()));
	(0, import_react.useEffect)(() => {
		setOrder((prev) => resolveOrder(availableWidgets, prev));
	}, [availableWidgets]);
	const handleToggle = (0, import_react.useCallback)((id, val) => {
		setVisibility((prev) => {
			const next = {
				...prev,
				[id]: val
			};
			setWidgetPrefs(next);
			return next;
		});
	}, []);
	const handleReorder = (0, import_react.useCallback)((next) => {
		setOrder(next);
		setWidgetOrder(next);
	}, []);
	const show = (id) => visibility[id] !== false && availableWidgets.some((w) => w.id === id);
	const displayName = user?.full_name || (isChinese ? "朋友" : "friend");
	const bookingStart = (b) => new Date(b.appointment_date || b.start_time || b.created_at).getTime();
	const startOfToday = /* @__PURE__ */ new Date();
	startOfToday.setHours(0, 0, 0, 0);
	const myUpcomingBookings = (bookings || []).filter((b) => ["confirmed", "pending"].includes(b.status)).filter((b) => {
		const t = bookingStart(b);
		return !Number.isFinite(t) || t >= startOfToday.getTime();
	}).sort((a, b) => bookingStart(a) - bookingStart(b));
	const upcomingBookings = myUpcomingBookings.slice(0, 4);
	const myCaredOneIds = new Set((caredOnes || []).map((c) => String(c.user_id).replace(/^wp-/, "")));
	const myPendingTasks = pendingCareTasks((tasks || []).filter((tk) => {
		const co = String(tk.cared_one_id ?? "").replace(/^wp-/, "");
		return !!co && myCaredOneIds.has(co);
	}), [...myCaredOneIds]);
	const pendingTasksTarget = pendingCareTaskTarget(myPendingTasks, caredOnes?.[0]?.user_id);
	const pendingTasks = myPendingTasks.slice(0, 5);
	const myCareGroupCount = (myCareGroups || []).length;
	const firstCaredOne = caredOnes?.[0];
	const recentPosts = (communityPosts || []).slice(0, 3);
	const statusColors = {
		confirmed: "bg-success text-success-foreground",
		pending: "bg-warning text-warning-foreground",
		completed: "bg-muted text-muted-foreground",
		cancelled: "bg-destructive text-destructive-foreground",
		in_progress: "bg-primary text-primary-foreground"
	};
	const paidCare = site.features.paidCaregivers;
	const slotSkeleton = (title, height) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-inspector-source": "pages/Dashboard.tsx:131:5:42b16716106c67d3d0a4f375d545680cb90daa2058630a436e2c96b2cf8f7a1d:1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			"data-inspector-source": "pages/Dashboard.tsx:132:7:1ff2f4c3f562a5ee0df13567bc0aa5f826ab66f71e1f221e4e42017a55d5120f:1",
			className: "text-sm font-semibold text-foreground mb-2",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: `w-full ${height} rounded-xl` })]
	});
	const blocks = {
		"ai-briefing": /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AISmartBriefing, {}),
		"patient-summaries": caredOnes && caredOnes.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			"data-inspector-source": "pages/Dashboard.tsx:140:7:ec1576136360446532097715f951cb58b5555a179172d52ff41cedb2d6768ce0:1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				"data-inspector-source": "pages/Dashboard.tsx:141:9:9fc69eb8218406f575c87acfbb7c34a12d40acbd548cd2c0b7b375f803eb8941:1",
				className: "text-sm font-semibold text-foreground mb-2",
				children: t("nav.myLovedOnes") || site.navLabels.caredOnes
			}), caredOnes.length === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PatientSummaryCard, {
				caredOneId: caredOnes[0].user_id,
				name: caredOnes[0].cared_one?.full_name || "",
				avatarUrl: caredOnes[0].cared_one?.avatar_url,
				relationship: caredOnes[0].relationship,
				onClick: () => navigate(`/cared-ones/${String(caredOnes[0].user_id).replace(/^wp-/, "")}`)
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: caredOnes[0].user_id,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList, {
					className: "w-full h-auto flex-wrap justify-start gap-1 bg-muted/40 p-1 rounded-xl",
					children: caredOnes.map((co) => {
						const name = co.cared_one?.full_name || "";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: co.user_id,
							className: "rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs text-xs px-3 py-1.5 max-w-[12rem] truncate",
							children: name
						}, co.user_id);
					})
				}), caredOnes.map((co) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: co.user_id,
					className: "mt-3 focus-visible:outline-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PatientSummaryCard, {
						caredOneId: co.user_id,
						name: co.cared_one?.full_name || "",
						avatarUrl: co.cared_one?.avatar_url,
						relationship: co.relationship,
						onClick: () => navigate(`/cared-ones/${String(co.user_id).replace(/^wp-/, "")}`)
					})
				}, co.user_id))]
			})]
		}) : caredOnesLoading ? slotSkeleton(t("nav.myLovedOnes") || site.navLabels.caredOnes, "h-40") : null,
		"stats": /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-inspector-source": "pages/Dashboard.tsx:186:7:fad0dbc92ebda3f4c2ddc3a0b597538a47e692bdcad30bce978f21119062fb47:1",
			className: "grid grid-cols-2 lg:grid-cols-4 gap-2.5",
			children: [
				...paidCare ? [{
					id: "upcoming-bookings",
					label: t("dashboard.upcomingBookings"),
					value: myUpcomingBookings.length,
					icon: CalendarDays,
					color: "text-primary",
					to: "/bookings"
				}] : [],
				{
					id: "care-groups",
					label: careGroupsLabel,
					value: myCareGroupCount,
					icon: Users,
					color: "text-success",
					to: "/care-circle"
				},
				{
					id: "pending-tasks",
					label: t("dashboard.pendingTasks"),
					value: tasksLoading || caredOnesLoading || tasksError ? "—" : myPendingTasks.length,
					icon: CircleAlert,
					color: "text-warning",
					to: pendingTasksTarget
				},
				{
					id: "unread-inbox",
					label: isChinese ? "收件箱未读" : "Unread Inbox",
					value: inboxLoading || inboxError ? "—" : unreadInbox,
					icon: MessageSquare,
					color: "text-coral",
					to: "/inbox"
				}
			].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				"data-inspector-source": "pages/Dashboard.tsx:193:11:ad1e92c129b3f3f340c15fdddc77271014a3c04fe64825b9b59eaa1fc47a8024:1",
				onClick: () => navigate(s.to),
				className: "text-left rounded-lg border border-transparent card-elevated p-3 hover:border-primary/30 transition-colors",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "pages/Dashboard.tsx:195:13:e73012163ad83bcea83e0e97cf6cf06d69d629e08980da0f20a9e587ab173911:1",
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.icon, { className: `h-4 w-4 ${s.color}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "pages/Dashboard.tsx:197:15:7e9785d1ec05b380ecd3b8574ec74aa7f3b7f565f512c2303c2b133a497b6bbf:1",
						className: "text-lg font-bold text-foreground",
						children: s.value
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "pages/Dashboard.tsx:199:13:17f4a2fc23d4edd5ae83f2c66670b97c8410d2eb35d4fdd48a3f516b933c3a67:1",
					className: "text-[11px] text-muted-foreground mt-0.5 truncate",
					children: s.label
				})]
			}, s.id))
		}),
		"upcoming-bookings": paidCare ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			"data-inspector-source": "pages/Dashboard.tsx:207:7:ec1576136360446532097715f951cb58b5555a179172d52ff41cedb2d6768ce0:1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				"data-inspector-source": "pages/Dashboard.tsx:208:9:9fc69eb8218406f575c87acfbb7c34a12d40acbd548cd2c0b7b375f803eb8941:1",
				className: "text-sm font-semibold text-foreground mb-2",
				children: t("dashboard.upcomingBookings")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-transparent card-elevated",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-3 space-y-2",
					children: [bookingsLoading ? [
						1,
						2,
						3
					].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/Dashboard.tsx:215:17:0fab1afbe5225817441d1f10020bb376d2008cdcf03fc47b9d165a28a90eaef1:1",
						className: "flex items-center gap-3 p-2 rounded-lg bg-muted/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "w-10 h-12 rounded-sm" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "pages/Dashboard.tsx:217:19:91679ccc9f0b61272471b2d3a22816fd394786dab0db7cb3ed4533783ec107c6:1",
							className: "flex-1 space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-32" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-48" })]
						})]
					}, i)) : upcomingBookings.length > 0 ? upcomingBookings.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						"data-inspector-source": "pages/Dashboard.tsx:223:15:d28290e03c35730f2c3304a925423562ff2093be356c903abb6ad4b64f783fba:1",
						type: "button",
						onClick: () => navigate("/bookings"),
						className: "w-full text-left flex items-center gap-3 p-2 rounded-lg bg-muted/40 hover:bg-muted transition-colors",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/Dashboard.tsx:228:17:6bc3ee1a6cd38a5a9d9ac98d607103b197adc5140d46de3f24063348dea22683:1",
								className: "text-center shrink-0 w-10",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-source": "pages/Dashboard.tsx:229:19:a8560a4017a47c18cb6ca3025073a3e7443d6a060ae10bbf85a258d800436c56:1",
									className: "text-[10px] text-muted-foreground",
									children: formatDate(b.appointment_date || b.start_time || b.created_at, i18n.language, { month: "short" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-source": "pages/Dashboard.tsx:230:19:c0789f32e7a8774ad8d04aedd04c80b6ad7303b17727a6448c0c18fd88f152d1:1",
									className: "text-base font-bold text-foreground leading-none",
									children: new Date(b.appointment_date || b.start_time || b.created_at).getDate()
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/Dashboard.tsx:232:17:69c6dd6ee5697db1796eaf763adfffd34e8077adf6a8fb1ebb8a44bdd1a5c16c:1",
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-source": "pages/Dashboard.tsx:233:19:48fad7c72216a64ebc8ecee3df7e7d066581328591f4100a1f77b4b9905103a5:1",
									className: "font-medium text-sm text-foreground truncate",
									children: b.provider?.full_name || t("common.provider")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-source": "pages/Dashboard.tsx:234:19:390553a0fc3026187cf28f17afe72ee3db5475080e9dbcd8ac64bae7ff54c61d:1",
									className: "text-[11px] text-muted-foreground truncate",
									children: [b.appointment_time, b.service_type].filter(Boolean).join(" · ")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: `${statusColors[b.status] || "bg-muted text-muted-foreground"} text-[10px]`,
								children: t(`bookings.status.${b.status}`, { defaultValue: String(b.status ?? "") })
							})
						]
					}, b.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "pages/Dashboard.tsx:239:15:98a7c4f1fe3aac9e6dc73ef2dd6a5be9b80fac88ce10119d61f273951a33bb02:1",
						className: "text-sm text-muted-foreground text-center py-6",
						children: t("dashboard.noUpcomingBookings")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						className: "w-full h-8 text-xs",
						onClick: () => navigate("/bookings"),
						children: [
							t("common.viewAll"),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-1 h-3 w-3" })
						]
					})]
				})
			})]
		}) : null,
		"care-tasks": /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			"data-inspector-source": "pages/Dashboard.tsx:250:7:ec1576136360446532097715f951cb58b5555a179172d52ff41cedb2d6768ce0:1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				"data-inspector-source": "pages/Dashboard.tsx:251:9:9fc69eb8218406f575c87acfbb7c34a12d40acbd548cd2c0b7b375f803eb8941:1",
				className: "text-sm font-semibold text-foreground mb-2",
				children: t("dashboard.careTasks")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-transparent card-elevated",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-3 space-y-2",
					children: [tasksError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "pages/Dashboard.tsx:256:27:dea2f025ab10689b25b236f8f752623eb7622c6d79c741a97fe0ac3af344b57f:1",
						role: "alert",
						className: "text-sm text-destructive",
						children: isChinese ? "任务读取失败，请刷新重试。" : "Tasks could not be loaded. Please refresh and try again."
					}) : tasksLoading || caredOnesLoading ? [
						1,
						2,
						3
					].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "pages/Dashboard.tsx:258:17:0fab1afbe5225817441d1f10020bb376d2008cdcf03fc47b9d165a28a90eaef1:1",
						className: "flex items-center gap-3 p-2 rounded-lg bg-muted/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-4 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "pages/Dashboard.tsx:260:19:91679ccc9f0b61272471b2d3a22816fd394786dab0db7cb3ed4533783ec107c6:1",
							className: "flex-1 space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-36" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-24" })]
						})]
					}, i)) : pendingTasks.length > 0 ? pendingTasks.map((tk) => {
						const caredOneId = String(tk.cared_one_id).replace(/^wp-/, "");
						const caredOneName = (caredOnes || []).find((co) => String(co.user_id).replace(/^wp-/, "") === caredOneId)?.cared_one?.full_name || site.caredOneSingular;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							"data-inspector-source": "pages/Dashboard.tsx:270:17:ca904882b6631c4b370d8cd02a036b03f523c6fcaa909d06b9d5911eb6cf0c5e:1",
							type: "button",
							onClick: () => navigate(`/cared-ones/${caredOneId}/tasks`),
							className: "w-full text-left flex items-center gap-3 p-2 rounded-lg bg-muted/40 hover:bg-muted transition-colors",
							"aria-label": `${tk.title} — ${caredOneName}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-4 w-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "pages/Dashboard.tsx:278:19:6c7e01a82bed7b5be9659555d26252fa1b29a459f38ae1c7991bc5c13fe68b12:1",
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-source": "pages/Dashboard.tsx:279:21:36e5229de70a03c3088d66d7ad0f66d22269d47e10c4180521d5587e4f46b527:1",
									className: "font-medium text-sm text-foreground truncate",
									children: tk.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									"data-inspector-source": "pages/Dashboard.tsx:280:21:1ac0d8467d9930452c6941e636cbfee00bd7aca8e881a15202dbfac6eefb6f0e:1",
									className: "text-[11px] text-muted-foreground truncate",
									children: [caredOneName, tk.due_date && ` · ${formatDate(tk.due_date, i18n.language, {
										month: "short",
										day: "numeric"
									})}`]
								})]
							})]
						}, tk.id);
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "pages/Dashboard.tsx:288:15:54cc82c572d0c05a5845a825d6de960026f55894e58195b8fabb0cd1dd1886e2:1",
						className: "text-sm text-muted-foreground text-center py-6",
						children: t("dashboard.noPendingTasks")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						className: "w-full h-8 text-xs",
						onClick: () => navigate(pendingTasksTarget),
						children: t("common.viewAll")
					})]
				})
			})]
		}),
		"daily-timeline": firstCaredOne ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			"data-inspector-source": "pages/Dashboard.tsx:299:7:ec1576136360446532097715f951cb58b5555a179172d52ff41cedb2d6768ce0:1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				"data-inspector-source": "pages/Dashboard.tsx:300:9:9fc69eb8218406f575c87acfbb7c34a12d40acbd548cd2c0b7b375f803eb8941:1",
				className: "text-sm font-semibold text-foreground mb-2",
				children: t("dashboard.timeline", { defaultValue: "Today's Events" })
			}), (caredOnes?.length ?? 0) > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: firstCaredOne.user_id,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList, {
					className: "w-full h-auto flex-wrap justify-start gap-1 bg-muted/40 p-1 rounded-xl mb-2",
					children: caredOnes.map((co) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: co.user_id,
						className: "rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs text-xs px-3 py-1.5 max-w-[12rem] truncate",
						children: co.cared_one?.full_name || ""
					}, co.user_id))
				}), caredOnes.map((co) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: co.user_id,
					className: "focus-visible:outline-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DailyTimeline, {
						caredOneId: co.user_id,
						caredOneName: co.cared_one?.full_name || ""
					})
				}, co.user_id))]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DailyTimeline, {
				caredOneId: firstCaredOne.user_id,
				caredOneName: firstCaredOne.cared_one?.full_name || ""
			})]
		}) : caredOnesLoading ? slotSkeleton(t("dashboard.timeline", { defaultValue: "Today's Events" }), "h-32") : null,
		"community-feed": site.features.community && recentPosts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			"data-inspector-source": "pages/Dashboard.tsx:333:7:ec1576136360446532097715f951cb58b5555a179172d52ff41cedb2d6768ce0:1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/Dashboard.tsx:334:9:51fd75a066c45f8e3ee62073ef4a3b4768ac9554f2436d7521282681f1bf131a:1",
				className: "flex items-center justify-between mb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					"data-inspector-source": "pages/Dashboard.tsx:335:11:dc34927b4a8f1788a170c2bce092f41cadd06a8f89057fc02aaf606615611a66:1",
					className: "text-sm font-semibold text-foreground",
					children: t("nav.community", { defaultValue: "Community" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					className: "h-7 px-2 text-xs",
					onClick: () => navigate("/community"),
					children: [
						t("common.viewAll"),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-1 h-3 w-3" })
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "pages/Dashboard.tsx:342:9:a9929ebdeed0219092c2fcd37f2f2e7dc244c8e4e2f4be9fa5f3c342ed4ae6f9:1",
				className: "space-y-2",
				children: recentPosts.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-transparent card-elevated cursor-pointer hover:border-primary/30 transition-colors",
					onClick: () => navigate(`/community/${p.id}`),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "pages/Dashboard.tsx:347:17:dab1cefaa9085f24d1822bf6da44aba51cf9ed61549143dd9f02fd986398e0a7:1",
							className: "text-sm font-medium text-foreground truncate",
							children: p.title || p.content?.slice(0, 60)
						}), p.title && p.content && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "pages/Dashboard.tsx:349:19:d8eb188600b884891a46ba4c84346188d90977697eb3cce64a29e95c5c7b540d:1",
							className: "text-xs text-muted-foreground line-clamp-2 mt-0.5",
							children: p.content
						})]
					})
				}, p.id))
			})]
		}) : postsLoading ? slotSkeleton(t("nav.community", { defaultValue: "Community" }), "h-24") : null
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "pages/Dashboard.tsx:362:5:a95773ad71dd76adeb6f99c00b3e45bb805c5706f387e0e9ef53b2869d61fb28:1",
		className: "max-w-7xl mx-auto px-4 py-5 space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-source": "pages/Dashboard.tsx:363:7:701670d2585b352f3c41fd66e331fc6dda51c76e6894f52850817f6000758a55:1",
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "pages/Dashboard.tsx:364:9:57fd4bc0f86b3b72c33eb3930baaff440e67309c73702cde2f831828cd81116c:1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					"data-inspector-source": "pages/Dashboard.tsx:365:11:0ec6e95e66be0922f16e36152ffbd6dd5d734c8876588bbd1eaf079524910d51:1",
					className: "text-xl sm:text-2xl font-bold text-foreground",
					children: t("dashboard.welcomeBack", { name: displayName })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "pages/Dashboard.tsx:368:11:b139adbc8a0250633a9cff3737cffcc019d49ec169ff3d4855c5617614d3e17a:1",
					className: "text-sm text-muted-foreground",
					children: t(`site.${site.id}.dashboardSubtitle`, { defaultValue: site.tagline })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardWidgetConfig, {
				widgets: availableWidgets,
				visibility,
				order,
				onChange: handleToggle,
				onReorder: handleReorder
			})]
		}), order.map((id) => {
			if (!show(id)) return null;
			const block = blocks[id];
			if (!block) return null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "pages/Dashboard.tsx:385:16:ef6932d1d9c636a6eace8792b60394495070cb6732022d824a95c17e8429fc99:1",
				children: block
			}, id);
		})]
	});
}
function RouteDashboardPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, {}) });
}
//#endregion
export { RouteDashboardPage as component };
