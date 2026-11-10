import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ClipboardCheck, Plus, Loader2, SkipForward, Check, AlertCircle, History, StickyNote, Edit2, Trash2, Pause, Play, Bot, X } from "lucide-react";
import { useCheckins, useCreateCheckin, useUpdateCheckin, useDeleteCheckin, useCheckinLogs, useTodayCheckinLogs, useLogCheckin, useCheckinCaregivers, useScheduleNotificationReceivers, useSetScheduleNotificationSubscription } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { formatDate, formatTime, formatDateTime } from "@/lib/locale";
import { useAIAssistant } from "@/contexts/AIAssistantContext";
import { useAuth } from "@/contexts/AuthContext";
import { frequencyForSlots, normalizeSlots, localDay } from "@/features/schedules/recurrence";
import { todayAtSlot } from "@/features/medicine/dose-slot";
import { ScheduleRecurrenceFields } from "./ScheduleRecurrenceFields";
import { requestCareScheduleNotificationPermission } from "@/features/schedules/device-reminders";
import { fetchCheckinAssigneeIdsWordPress } from "@/features/cared-ones/source.wordpress-extended";

function formatSlot(slot: string, isCN: boolean) {
  const [hourRaw = "8", minuteRaw = "00"] = String(slot || "08:00").split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  if (isCN) return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  const isPM = hour >= 12;
  const displayHour = hour > 12 ? hour - 12 : hour || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${isPM ? "PM" : "AM"}`;
}

const STATUS_STYLE: Record<string, string> = {
  checked: "bg-success/10 text-success border-success/30",
  skipped: "bg-warning/10 text-warning border-warning/30",
  missed: "bg-destructive/10 text-destructive border-destructive/30",
};

const CHECKIN_FREQUENCIES = [
  ["once_daily", "Once daily", "每日一次"],
  ["twice_daily", "Twice daily", "每日两次"],
  ["three_daily", "Three times daily", "每日三次"],
  ["four_daily", "Four times daily", "每日四次"],
  ["every_other_day", "Every other day", "隔日一次"],
  ["weekly", "Weekly", "每周一次"],
  ["monthly", "Monthly", "每月"],
  ["yearly", "Yearly", "每年"],
  ["daily", "Every N days", "每隔几天"],
] as const;

function checkinFrequencyLabel(checkin: any, Z: (cn: string, en: string) => string): string {
  const code = checkin?.frequency_code;
  const interval = Math.max(1, Number(checkin?.repeat_interval) || 1);
  if (code === "daily") return Z(`每 ${interval} 天`, `Every ${interval} days`);
  if (code === "weekly") {
    const label = interval > 1 ? Z(`每 ${interval} 周`, `Every ${interval} weeks`) : Z("每周", "Weekly");
    const weekdayNames: Record<string, string> = { MO: Z("周一", "Mon"), TU: Z("周二", "Tue"), WE: Z("周三", "Wed"), TH: Z("周四", "Thu"), FR: Z("周五", "Fri"), SA: Z("周六", "Sat"), SU: Z("周日", "Sun") };
    const days = (checkin?.repeat_weekdays || []).map((day: string) => weekdayNames[day]).filter(Boolean);
    return days.length ? `${label} · ${days.join(", ")}` : label;
  }
  if (code === "monthly" && interval > 1) return Z(`每 ${interval} 个月`, `Every ${interval} months`);
  if (code === "yearly" && interval > 1) return Z(`每 ${interval} 年`, `Every ${interval} years`);
  return checkin?.frequency || Z("每日一次", "Once daily");
}

function CheckinTypeFields({ value, onChange, Z }: { value: string[]; onChange: (value: string[]) => void; Z: (cn: string, en: string) => string }) {
  return (
    <div>
      <Label className="text-sm">{Z("签到方式", "Check-in method")}</Label>
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
        {(["ai", "human"] as const).map((type) => (
          <label key={type} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={value.includes(type)} onChange={(event) => onChange(event.target.checked ? [...value, type] : value.filter((item) => item !== type))} />
            {type === "ai" ? Z("AI 核对", "AI check-in") : Z("人工核对", "Manual check-in")}
          </label>
        ))}
      </div>
    </div>
  );
}

function CaregiverFields({ caregivers, value, onChange, label, empty, Z, loading = false, error = false, disabled = false }: { caregivers: Array<{ id: string; name: string }>; value: string[]; onChange: (value: string[]) => void; label: string; empty: string; Z: (cn: string, en: string) => string; loading?: boolean; error?: boolean; disabled?: boolean }) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      {loading ? <p className="mt-1 text-xs text-muted-foreground">{Z("正在读取已指派人员…", "Loading assigned people…")}</p> : error ? <p className="mt-1 text-xs text-destructive">{Z("无法读取已指派人员；保存其他内容不会更改此设置。", "Could not load assigned people. Saving other changes will leave this setting unchanged.")}</p> : caregivers.length ? (
        <div className="mt-1 grid gap-2 sm:grid-cols-2">
          {caregivers.map((person) => (
            <label key={person.id} className={`flex items-center gap-2 text-sm ${disabled ? "opacity-60" : ""}`}>
              <input type="checkbox" checked={value.includes(person.id)} disabled={disabled} onChange={(event) => onChange(event.target.checked ? [...value, person.id] : value.filter((id) => id !== person.id))} />
              <span className="truncate">{person.name}</span>
            </label>
          ))}
        </div>
      ) : <p className="mt-1 text-xs text-muted-foreground">{empty}</p>}
    </div>
  );
}

function resizeCheckinSlots(frequency: string, value: string[]) {
  const count = ({ once_daily: 1, twice_daily: 2, three_daily: 3, four_daily: 4 } as Record<string, number>)[frequency];
  if (!count) return value;
  const slots = [...value].slice(0, count);
  const defaults = ["08:00", "12:00", "18:00", "21:00"];
  while (slots.length < count) slots.push(defaults.find((slot) => !slots.includes(slot)) || "08:00");
  return slots;
}

export function CheckInCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const STATUS_LABEL: Record<string, string> = {
    checked: Z("已签到", "Checked"),
    skipped: Z("已跳过", "Skipped"),
    missed: Z("未完成", "Missed"),
  };
  const { data: checkins, isLoading } = useCheckins(caredOneId);
  const scheduleIds = useMemo(() => (checkins || []).map((checkin: any) => String(checkin.id)), [checkins]);
  const receiverId = String(user?.user_id ?? "").replace(/^wp-/, "");
  const { data: scheduleReceivers, isLoading: scheduleReceiversLoading } = useScheduleNotificationReceivers(scheduleIds);
  const setScheduleSubscription = useSetScheduleNotificationSubscription();
  const receivesCheckinNotifications = Boolean(
    receiverId && scheduleIds.length && scheduleReceivers &&
    scheduleIds.every((id) => (scheduleReceivers.get(id) || []).includes(receiverId)),
  );
  const { data: caregivers = [] } = useCheckinCaregivers(caredOneId);
  const { data: logs } = useCheckinLogs(caredOneId);
  const { data: todayLogs } = useTodayCheckinLogs(caredOneId);
  const create = useCreateCheckin();
  const update = useUpdateCheckin();
  const remove = useDeleteCheckin();
  const logCheckin = useLogCheckin();

  const [addOpen, setAddOpen] = useState(false);
  const [view, setView] = useState<"today" | "records" | "manage">("today");
  const [editOpen, setEditOpen] = useState<{ open: boolean; checkin: any }>({ open: false, checkin: null });
  const [peopleLoad, setPeopleLoad] = useState<{ checkinId: string; assignees: "loading" | "ready" | "error" } | null>(null);
  const [peopleDirty, setPeopleDirty] = useState({ assignees: false });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; checkin: any }>({ open: false, checkin: null });
  const [logDialog, setLogDialog] = useState<{ open: boolean; checkin: any; slot: string; status: "checked" | "skipped" | "missed" }>({ open: false, checkin: null, slot: "08:00", status: "checked" });
  const [logNote, setLogNote] = useState("");
  const [historyOpen, setHistoryOpen] = useState<{ open: boolean; checkin: any }>({ open: false, checkin: null });
  const { openWriteAssistant } = useAIAssistant();
  const autoOpenedRef = useRef<Set<string>>(new Set());
  const editScheduleIdRef = useRef<string | null>(null);
  const [clock, setClock] = useState(() => new Date());

  const [form, setForm] = useState({
    name: Z("签到", "Check-In"),
    detail: "",
    frequency: "once_daily",
    repeat_interval: 1,
    repeat_weekdays: [] as string[],
    time_slots: ["08:00"] as string[],
    start_date: "",
    end_date: "",
    reminder_time_before: "0",
    time_to_send_to_caregiver: "",
    check_in_type: ["human"] as string[],
    assignee_ids: [] as string[],
  });

  // One call: the registry decides wording, outcomes, the write and the refresh.
  const openAICheckIn = (checkin: any, slot: string) => {
    openWriteAssistant({
      skill: "record-check-in",
      id: `checkin-${checkin.id}-${localDay()}-${slot}`,
      target: {
        caredOneId: String(caredOneId),
        recordId: String(checkin.id),
        label: checkin.name || Z("签到", "Check-In"),
        detail: checkin.detail || "",
        slot,
      },
    });
  };

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user?.general_user_role?.includes("cared one") || !checkins || !todayLogs) return;
    const now = clock;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const completed = new Set((todayLogs || []).map((log: any) => {
      const checkin = (checkins as any[]).find((item) => String(item.id) === String(log.checkin_id));
      const scheduled = String(log.scheduled_date || "");
      const slot = scheduled.match(/[ T](\d{2}:\d{2})/)?.[1] || checkin?.today_slots?.[0] || checkin?.time_slot?.[0] || "08:00";
      return `${log.checkin_id}-${slot}`;
    }));
    const due = (checkins as any[]).flatMap((checkin) => {
      if (checkin.is_active === false || !checkin.check_in_type?.includes("ai")) return [];
      return (checkin.today_slots || []).map((slot: string) => ({ checkin, slot }));
    }).find(({ checkin, slot }) => {
      const key = `${localDay()}-${checkin.id}-${slot}`;
      if (completed.has(`${checkin.id}-${slot}`) || autoOpenedRef.current.has(key)) return false;
      const [h = "0", m = "0"] = String(slot).split(":");
      return nowMinutes >= Number(h) * 60 + Number(m);
    });
    if (!due) return;
    const key = `${localDay()}-${due.checkin.id}-${due.slot}`;
    autoOpenedRef.current.add(key);
    openAICheckIn(due.checkin, due.slot);
  }, [checkins, todayLogs, user?.general_user_role, clock]);

  // Today: status by plan and scheduled time, so repeated check-ins stay separate.
  const todayStatusByCheckin = useMemo(() => {
    const map = new Map<string, string>();
    (todayLogs || []).forEach((log: any) => {
      const cid = String(log.checkin_id || log.medicine_id || "");
      const checkin = (checkins || []).find((item: any) => String(item.id) === cid);
      const scheduled = String(log.scheduled_date || "");
      const slot = scheduled.match(/[ T](\d{2}:\d{2})/)?.[1] || checkin?.today_slots?.[0] || checkin?.time_slot?.[0] || "08:00";
      const key = `${cid}-${slot}`;
      if (cid && !map.has(key)) map.set(key, log.status || "checked");
    });
    return map;
  }, [todayLogs, checkins]);

  const historyStats = useMemo(() => {
    const items = (logs || []).filter((log: any) => String(log.checkin_id) === String(historyOpen.checkin?.id));
    const checked = items.filter((log: any) => log.status === "checked").length;
    const skipped = items.filter((log: any) => log.status === "skipped").length;
    const missed = items.filter((log: any) => log.status === "missed").length;
    const total = checked + skipped + missed;
    return { items, checked, skipped, missed, total, adherence: total ? Math.round((checked / total) * 100) : 0 };
  }, [logs, historyOpen.checkin]);

  // Detect missed today: time slot earlier than now, no log
  const missedTodayIds = useMemo(() => {
    const now = clock;
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const ids = new Set<string>();
    (checkins || []).forEach((c: any) => {
      const slots: string[] = c.today_slots || [];
      slots.forEach((slot) => {
        const key = `${c.id}-${slot}`;
        if (todayStatusByCheckin.has(key)) return;
        const missedAfter = Number(c.time_to_send_to_caregiver || 0);
        if (missedAfter <= 0) return;
        const [h = "0", m = "0"] = String(slot).split(":");
        if (nowMins > Number(h) * 60 + Number(m) + missedAfter) ids.add(key);
      });
    });
    return ids;
  }, [checkins, todayStatusByCheckin, clock]);

  const handleCheckinNotificationSubscription = (receives: boolean) => {
    setScheduleSubscription.mutate(
      { scheduleIds, receiverId, receives },
      {
        onSuccess: () => toast({ title: receives ? Z("已开启探望提醒推送", "Check-in notifications on") : Z("已关闭探望提醒推送", "Check-in notifications off") }),
        onError: (error) => toast({ title: Z("保存失败", "Save failed"), description: error instanceof Error ? error.message : String(error), variant: "destructive" }),
      },
    );
  };

  const handleCreate = async () => {
    const alertsAllowed = await requestCareScheduleNotificationPermission();
    create.mutate(
      {
        user_id: caredOneId,
        name: form.name,
        detail: form.detail || undefined,
        frequency: frequencyForSlots(form.frequency as any, form.time_slots),
        repeat_interval: Number(form.repeat_interval) || 1,
        repeat_weekdays: form.repeat_weekdays,
        time_slot: normalizeSlots(form.time_slots),
        start_date: form.start_date || undefined,
        end_date: form.end_date || undefined,
        reminder_time_before: form.reminder_time_before === "" ? 0 : Number(form.reminder_time_before),
        time_to_send_to_caregiver: form.time_to_send_to_caregiver === "" ? undefined : Number(form.time_to_send_to_caregiver),
        check_in_type: form.check_in_type,
        assignee_ids: form.assignee_ids,
      },
      {
        onSuccess: () => {
          setForm({ name: Z("签到", "Check-In"), detail: "", frequency: "once_daily", repeat_interval: 1, repeat_weekdays: [], time_slots: ["08:00"], start_date: "", end_date: "", reminder_time_before: "0", time_to_send_to_caregiver: "", check_in_type: ["human"], assignee_ids: [] });
          setAddOpen(false);
          toast({ title: Z("签到日程已创建 ✓", "Check-in schedule created ✓"), description: alertsAllowed ? undefined : Z("计划已保存；请在被照护者手机打开应用并开启通知，才能按时自动签到。", "Schedule saved. Open the app on the cared one's phone and enable notifications for timed AI check-ins.") });
        },
        onError: (e: any) => toast({ title: Z("操作失败", "Failed"), description: String(e?.message || e), variant: "destructive" }),
      }
    );
  };

  const openLog = (checkin: any, slot: string, status: "checked" | "skipped" | "missed") => {
    setLogNote("");
    setLogDialog({ open: true, checkin, slot, status });
  };

  const confirmLog = () => {
    const { checkin, slot, status } = logDialog;
    logCheckin.mutate(
      { checkin_id: String(checkin.id), status, note: logNote || undefined, scheduled_date: todayAtSlot(slot), cared_one_id: caredOneId, checkin_name: checkin.name },
      {
        onSuccess: () => {
          setLogDialog({ open: false, checkin: null, slot: "08:00", status: "checked" });
          setLogNote("");
          toast({ title: Z(`签到${STATUS_LABEL[status]} ✓`, `Check-in ${STATUS_LABEL[status]!.toLowerCase()} ✓`) });
        },
        onError: (e: any) => toast({ title: Z("操作失败", "Failed"), description: String(e?.message || e), variant: "destructive" }),
      }
    );
  };

  const togglePause = (checkin: any) => {
    update.mutate(
      { id: String(checkin.id), is_active: !checkin.is_active },
      {
        onSuccess: () => toast({ title: checkin.is_active ? Z("签到已暂停", "Check-in paused") : Z("签到已恢复 ✓", "Check-in resumed ✓") }),
        onError: (e: any) => toast({ title: Z("操作失败", "Failed"), description: String(e?.message || e), variant: "destructive" }),
      }
    );
  };

  const openEdit = (checkin: any) => {
    const checkinId = String(checkin.id);
    editScheduleIdRef.current = checkinId;
    setForm({
      name: checkin.name || "",
      detail: checkin.detail || "",
      frequency: checkin.frequency_code || "once_daily",
      repeat_interval: checkin.repeat_interval || 1,
      repeat_weekdays: checkin.repeat_weekdays || [],
      time_slots: Array.isArray(checkin.time_slot) && checkin.time_slot.length ? [...checkin.time_slot] : ["08:00"],
      start_date: checkin.start_date || "",
      end_date: checkin.end_date || "",
      reminder_time_before: checkin.reminder_time_before != null ? String(checkin.reminder_time_before) : "0",
      time_to_send_to_caregiver: checkin.time_to_send_to_caregiver != null ? String(checkin.time_to_send_to_caregiver) : "",
      check_in_type: Array.isArray(checkin.check_in_type) && checkin.check_in_type.length ? checkin.check_in_type : ["human"],
      assignee_ids: [],
    });
    setPeopleDirty({ assignees: false });
    setPeopleLoad({ checkinId, assignees: "loading" });
    setEditOpen({ open: true, checkin });
    fetchCheckinAssigneeIdsWordPress(checkinId).then((ids) => {
      if (editScheduleIdRef.current === checkinId) setForm((current) => ({ ...current, assignee_ids: ids }));
      setPeopleLoad((current) => current?.checkinId === checkinId ? { ...current, assignees: "ready" } : current);
    }).catch(() => setPeopleLoad((current) => current?.checkinId === checkinId ? { ...current, assignees: "error" } : current));
  };

  const handleEditSave = async () => {
    const alertsAllowed = await requestCareScheduleNotificationPermission();
    const updates: Record<string, any> & { id: string } = {
      id: String(editOpen.checkin.id),
      name: form.name,
      detail: form.detail || "",
      frequency: frequencyForSlots(form.frequency as any, form.time_slots),
      repeat_interval: Number(form.repeat_interval) || 1,
      repeat_weekdays: form.repeat_weekdays,
      time_slot: normalizeSlots(form.time_slots),
      start_date: form.start_date || "",
      end_date: form.end_date || "",
      reminder_time_before: form.reminder_time_before === "" ? 0 : Number(form.reminder_time_before),
      time_to_send_to_caregiver: form.time_to_send_to_caregiver === "" ? null : Number(form.time_to_send_to_caregiver),
      check_in_type: form.check_in_type,
    };
    if (peopleDirty.assignees) updates["assignee_ids"] = form.assignee_ids;
    update.mutate(
      updates,
      {
        onSuccess: () => {
          editScheduleIdRef.current = null;
          setEditOpen({ open: false, checkin: null });
          toast({ title: Z("签到已更新 ✓", "Check-in updated ✓"), description: alertsAllowed ? undefined : Z("计划已保存；请在被照护者手机打开应用并开启通知，才能按时自动签到。", "Schedule saved. Open the app on the cared one's phone and enable notifications for timed AI check-ins.") });
        },
        onError: (e: any) => toast({ title: Z("操作失败", "Failed"), description: String(e?.message || e), variant: "destructive" }),
      }
    );
  };

  const confirmDelete = () => {
    remove.mutate(String(deleteConfirm.checkin.id), {
      onSuccess: () => {
        setDeleteConfirm({ open: false, checkin: null });
        toast({ title: Z("签到已删除", "Check-in deleted") });
      },
      onError: (e: any) => toast({ title: Z("操作失败", "Failed"), description: String(e?.message || e), variant: "destructive" }),
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="min-w-0 text-lg font-bold text-foreground">{Z("签到", "Check-In")}</h2>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-2 sm:w-auto" aria-label={Z("签到视图与添加", "Check-in views and add")}>
          <div className="grid h-9 min-w-0 basis-full flex-1 grid-cols-[1fr_0.85fr_1.2fr] overflow-hidden rounded-lg border sm:w-[228px] sm:basis-auto sm:flex-none" role="tablist" aria-label={Z("签到视图", "Check-in views")}>
            <Button role="tab" aria-selected={view === "today"} variant="ghost" onClick={() => setView("today")} className={`h-full min-w-0 rounded-none px-2 text-xs ${view === "today" ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "text-muted-foreground"}`}>{Z("时间线", "Timeline")}</Button>
            <Button role="tab" aria-selected={view === "records"} variant="ghost" onClick={() => setView("records")} className={`h-full min-w-0 rounded-none px-2 text-xs ${view === "records" ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "text-muted-foreground"}`}>{Z("记录", "Records")}</Button>
            <Button role="tab" aria-selected={view === "manage"} variant="ghost" onClick={() => setView("manage")} className={`h-full min-w-0 rounded-none px-2 text-xs ${view === "manage" ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "text-muted-foreground"}`}>{Z("签到管理", "Manage")}</Button>
          </div>
          <div className="flex min-h-9 max-w-full items-center gap-2 rounded-md border border-border px-2.5 py-1" data-inspector-id="checkin-notification-receiver-toggle" data-testid="checkin-notification-receiver-toggle">
            <span className="min-w-0 break-words text-xs">{Z(`接收${caredOneName}的探望提醒`, `Receive check-in reminders for ${caredOneName}`)}</span>
            <Switch
              className="shrink-0"
              aria-label={Z(`接收${caredOneName}的探望提醒`, `Receive check-in reminders for ${caredOneName}`)}
              checked={receivesCheckinNotifications}
              onCheckedChange={handleCheckinNotificationSubscription}
              disabled={!receiverId || scheduleIds.length === 0 || scheduleReceiversLoading || setScheduleSubscription.isPending}
            />
          </div>
          <Button size="sm" className="h-9 w-20 shrink-0" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> {Z("添加", "Add")}</Button>
        </div>
      </div>

      {/* Add schedule */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{Z("创建签到日程", "Create Check-In Schedule")}</DialogTitle>
            <DialogDescription>{Z("定个时间，每天问一声他今天怎么样。", "Pick a time to ask how they are doing each day.")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-sm">{Z("名称", "Name")}</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <Label className="text-sm">{Z("详情", "Detail")}</Label>
              <Input value={form.detail} onChange={(e) => setForm((p) => ({ ...p, detail: e.target.value }))} placeholder={Z("简短描述(可选)", "Short description (optional)")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">{Z("频率", "Frequency")}</Label>
                <Select value={form.frequency} onValueChange={(frequency) => setForm((p) => ({ ...p, frequency, time_slots: resizeCheckinSlots(frequency, p.time_slots) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CHECKIN_FREQUENCIES.map(([value, en, cn]) => <SelectItem key={value} value={value}>{Z(cn, en)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-end"><Button type="button" variant="outline" className="w-full" onClick={() => setForm((p) => ({ ...p, time_slots: normalizeSlots([...p.time_slots, ["08:00", "12:00", "18:00", "21:00"].find((slot) => !p.time_slots.includes(slot)) || "08:00"]) }))}><Plus className="h-3 w-3 mr-1" />{Z("添加时段", "Add time")}</Button></div>
            </div>
            <ScheduleRecurrenceFields
              frequency={form.frequency}
              interval={form.repeat_interval}
              weekdays={form.repeat_weekdays}
              onIntervalChange={(value) => setForm((p) => ({ ...p, repeat_interval: value === "" ? 1 : Number(value) }))}
              onWeekdaysChange={(repeat_weekdays) => setForm((p) => ({ ...p, repeat_weekdays }))}
              Z={Z}
            />
            <div className="space-y-2">
              <Label className="text-sm">{Z("计划时间", "Scheduled times")}</Label>
              {form.time_slots.map((slot, index) => (
                <div key={`${index}-${slot}`} className="flex items-center gap-2">
                  <Input type="time" value={slot} onChange={(e) => setForm((p) => ({ ...p, time_slots: normalizeSlots(p.time_slots.map((value, i) => i === index ? e.target.value : value)) }))} />
                  {form.time_slots.length > 1 && <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" aria-label={Z("删除时段", "Remove time")} onClick={() => setForm((p) => ({ ...p, time_slots: normalizeSlots(p.time_slots.filter((_, i) => i !== index)) }))}><X className="h-3.5 w-3.5" /></Button>}
                </div>
              ))}
            </div>
            <div>
              <Label className="text-sm">{Z("开始日期", "Start date")}</Label>
              <Input type="date" value={form.start_date} onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))} />
            </div>
            <div>
              <Label className="text-sm">{Z("结束日期", "End date")}</Label>
              <Input type="date" value={form.end_date} onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">{Z("提前提醒(分钟)", "Remind before (min)")}</Label>
                <Input type="number" min="0" value={form.reminder_time_before} onChange={(e) => setForm((p) => ({ ...p, reminder_time_before: e.target.value }))} />
              </div>
              <div>
                <Label className="text-sm">{Z("多久通知护理者(分钟)", "Notify caregiver after (min)")}</Label>
                <Input type="number" min="0" value={form.time_to_send_to_caregiver} onChange={(e) => setForm((p) => ({ ...p, time_to_send_to_caregiver: e.target.value }))} />
              </div>
            </div>
            <CheckinTypeFields value={form.check_in_type} onChange={(check_in_type) => setForm((p) => ({ ...p, check_in_type }))} Z={Z} />
            <CaregiverFields caregivers={caregivers} value={form.assignee_ids} onChange={(assignee_ids) => setForm((p) => ({ ...p, assignee_ids }))} label={Z("负责签到的人", "People assigned to check in")} empty={Z("该被照护者暂无已关联的护理者。", "No caregivers are linked to this cared one yet.")} Z={Z} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>{Z("取消", "Cancel")}</Button>
            <Button onClick={handleCreate} disabled={create.isPending || !form.name.trim() || form.check_in_type.length === 0}>
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ClipboardCheck className="h-4 w-4 mr-2" />} {Z("保存", "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log status */}
      <Dialog open={logDialog.open} onOpenChange={(o) => !o && setLogDialog({ open: false, checkin: null, slot: "08:00", status: "checked" })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {logDialog.status === "checked" ? <Check className="h-5 w-5 text-success" /> :
               logDialog.status === "skipped" ? <SkipForward className="h-5 w-5 text-warning" /> :
               <AlertCircle className="h-5 w-5 text-destructive" />}
              {Z(`标记为${STATUS_LABEL[logDialog.status]}`, `Mark as ${STATUS_LABEL[logDialog.status]}`)}
            </DialogTitle>
            <DialogDescription>{logDialog.checkin?.name} — {Z("添加可选备注", "add an optional note")}</DialogDescription>
          </DialogHeader>
          <Textarea value={logNote} onChange={(e) => setLogNote(e.target.value)} rows={3} placeholder={Z("情况如何?", "How did it go?")} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogDialog({ open: false, checkin: null, slot: "08:00", status: "checked" })}>{Z("取消", "Cancel")}</Button>
            <Button onClick={confirmLog} disabled={logCheckin.isPending}>
              {logCheckin.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />} {Z("确认", "Confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History */}
      <Dialog open={historyOpen.open} onOpenChange={(o) => !o && setHistoryOpen({ open: false, checkin: null })}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><History className="h-5 w-5 text-primary" /> {historyOpen.checkin?.name} — {Z("历史记录", "History")}</DialogTitle>
          </DialogHeader>
          {historyStats.total > 0 && (
            <div className="grid grid-cols-4 gap-2 py-2 text-center">
              <div className="rounded-lg border bg-primary/5 p-2"><div className="font-bold text-primary">{historyStats.adherence}%</div><div className="text-[10px] text-muted-foreground">{Z("依从率", "Adherence")}</div></div>
              <div className="rounded-lg border bg-success/5 p-2"><div className="font-bold text-success">{historyStats.checked}</div><div className="text-[10px] text-muted-foreground">{Z("已签到", "Checked")}</div></div>
              <div className="rounded-lg border bg-warning/5 p-2"><div className="font-bold text-warning">{historyStats.skipped}</div><div className="text-[10px] text-muted-foreground">{Z("已跳过", "Skipped")}</div></div>
              <div className="rounded-lg border bg-destructive/5 p-2"><div className="font-bold text-destructive">{historyStats.missed}</div><div className="text-[10px] text-muted-foreground">{Z("未完成", "Missed")}</div></div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto space-y-1">
            {historyStats.items.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">{Z("暂无记录", "No logs yet")}</p>
            ) : (
              historyStats.items.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                  <Badge variant="outline" className={STATUS_STYLE[log.status] || ""}>{STATUS_LABEL[log.status] || log.status}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{formatDateTime(log.created_at, isCN ? "zh-CN" : undefined)}</p>
                    {log.note && <p className="text-xs mt-0.5 flex items-start gap-1"><StickyNote className="h-3 w-3 mt-0.5 shrink-0" />{log.note}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit schedule */}
      <Dialog open={editOpen.open} onOpenChange={(o) => { if (!o) { editScheduleIdRef.current = null; setEditOpen({ open: false, checkin: null }); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{Z("编辑签到日程", "Edit Check-In Schedule")}</DialogTitle>
            <DialogDescription>{Z("更新这个定期签到。", "Update this recurring check-in.")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div><Label className="text-sm">{Z("名称", "Name")}</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
            <div><Label className="text-sm">{Z("详情", "Detail")}</Label><Input value={form.detail} onChange={(e) => setForm((p) => ({ ...p, detail: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm">{Z("频率", "Frequency")}</Label>
                <Select value={form.frequency} onValueChange={(frequency) => setForm((p) => ({ ...p, frequency, time_slots: resizeCheckinSlots(frequency, p.time_slots) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CHECKIN_FREQUENCIES.map(([value, en, cn]) => <SelectItem key={value} value={value}>{Z(cn, en)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-end"><Button type="button" variant="outline" className="w-full" onClick={() => setForm((p) => ({ ...p, time_slots: normalizeSlots([...p.time_slots, ["08:00", "12:00", "18:00", "21:00"].find((slot) => !p.time_slots.includes(slot)) || "08:00"]) }))}><Plus className="h-3 w-3 mr-1" />{Z("添加时段", "Add time")}</Button></div>
            </div>
            <ScheduleRecurrenceFields
              frequency={form.frequency}
              interval={form.repeat_interval}
              weekdays={form.repeat_weekdays}
              onIntervalChange={(value) => setForm((p) => ({ ...p, repeat_interval: value === "" ? 1 : Number(value) }))}
              onWeekdaysChange={(repeat_weekdays) => setForm((p) => ({ ...p, repeat_weekdays }))}
              Z={Z}
            />
            <div className="space-y-2">
              <Label className="text-sm">{Z("计划时间", "Scheduled times")}</Label>
              {form.time_slots.map((slot, index) => (
                <div key={`${index}-${slot}`} className="flex items-center gap-2">
                  <Input type="time" value={slot} onChange={(e) => setForm((p) => ({ ...p, time_slots: normalizeSlots(p.time_slots.map((value, i) => i === index ? e.target.value : value)) }))} />
                  {form.time_slots.length > 1 && <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" aria-label={Z("删除时段", "Remove time")} onClick={() => setForm((p) => ({ ...p, time_slots: normalizeSlots(p.time_slots.filter((_, i) => i !== index)) }))}><X className="h-3.5 w-3.5" /></Button>}
                </div>
              ))}
            </div>
            <div><Label className="text-sm">{Z("开始日期", "Start date")}</Label><Input type="date" value={form.start_date} onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))} /></div>
            <div><Label className="text-sm">{Z("结束日期", "End date")}</Label><Input type="date" value={form.end_date} onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm">{Z("提前提醒(分钟)", "Remind before (min)")}</Label><Input type="number" min="0" value={form.reminder_time_before} onChange={(e) => setForm((p) => ({ ...p, reminder_time_before: e.target.value }))} /></div>
              <div><Label className="text-sm">{Z("多久通知护理者(分钟)", "Notify caregiver after (min)")}</Label><Input type="number" min="0" value={form.time_to_send_to_caregiver} onChange={(e) => setForm((p) => ({ ...p, time_to_send_to_caregiver: e.target.value }))} /></div>
            </div>
            <CheckinTypeFields value={form.check_in_type} onChange={(check_in_type) => setForm((p) => ({ ...p, check_in_type }))} Z={Z} />
            <CaregiverFields caregivers={caregivers} value={form.assignee_ids} onChange={(assignee_ids) => { setForm((p) => ({ ...p, assignee_ids })); setPeopleDirty((p) => ({ ...p, assignees: true })); }} label={Z("负责签到的人", "People assigned to check in")} empty={Z("该被照护者暂无已关联的护理者。", "No caregivers are linked to this cared one yet.")} Z={Z} loading={peopleLoad?.checkinId === String(editOpen.checkin?.id) && peopleLoad.assignees === "loading"} error={peopleLoad?.checkinId === String(editOpen.checkin?.id) && peopleLoad.assignees === "error"} disabled={peopleLoad?.checkinId !== String(editOpen.checkin?.id) || peopleLoad.assignees !== "ready"} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { editScheduleIdRef.current = null; setEditOpen({ open: false, checkin: null }); }}>{Z("取消", "Cancel")}</Button>
            <Button onClick={handleEditSave} disabled={update.isPending || !form.name.trim() || form.check_in_type.length === 0}>
              {update.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />} {Z("保存", "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteConfirm.open} onOpenChange={(o) => !o && setDeleteConfirm({ open: false, checkin: null })}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Trash2 className="h-5 w-5 text-destructive" /> {Z("删除签到?", "Delete check-in?")}</DialogTitle>
            <DialogDescription>{isCN ? <>这将永久删除 <strong>{deleteConfirm.checkin?.name}</strong>。已记录的历史将保留。</> : <>This will permanently delete <strong>{deleteConfirm.checkin?.name}</strong>. Logged history will remain.</>}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm({ open: false, checkin: null })}>{Z("取消", "Cancel")}</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={remove.isPending}>
              {remove.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />} {Z("删除", "Delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" />
      ) : (checkins || []).length === 0 ? (
        <div className="text-center py-12">
          <ClipboardCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">{Z("暂无签到日程", "No check-in schedules yet")}</p>
          <Button variant="coral" size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> {Z("创建第一个签到日程", "First Check-In Schedule")}</Button>
        </div>
      ) : view === "records" ? (
        <div className="space-y-2">
          {(logs || []).map((log: any) => (
            <Card key={log.id} className="border-transparent card-elevated">
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant="outline" className={STATUS_STYLE[log.status] || ""}>{STATUS_LABEL[log.status] || log.status}</Badge>
                  {log.checked_by_ai && <Badge variant="outline" className="text-xs border-primary/40 text-primary"><Bot className="h-3 w-3 mr-1" />AI</Badge>}
                  {log.note && <p className="text-xs text-muted-foreground truncate">{log.note}</p>}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{formatDate(log.created_at, isCN ? "zh-CN" : "en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
              </CardContent>
            </Card>
          ))}
          {(logs || []).length === 0 && <p className="text-xs text-muted-foreground text-center py-4">{Z("暂无历史", "No history yet")}</p>}
        </div>
      ) : view === "manage" ? (
        <div className="space-y-3">
          {(checkins || []).map((checkin: any) => {
            const slots = Array.isArray(checkin.time_slot) && checkin.time_slot.length > 0 ? checkin.time_slot : ["08:00"];
            return (
              <Card key={checkin.id} className="border-transparent card-elevated">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">{checkin.name}</span>
                        {!checkin.is_active && <Badge variant="outline" className="text-xs">{Z("已暂停", "Paused")}</Badge>}
                      </div>
                      {checkin.detail && <p className="text-xs text-muted-foreground mt-1">{checkin.detail}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        {checkinFrequencyLabel(checkin, Z)} · {slots.map((s: string) => formatSlot(s, isCN)).join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-7 w-7" title={Z("历史", "History")} onClick={() => setHistoryOpen({ open: true, checkin })}><History className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" title={checkin.is_active ? Z("暂停", "Pause") : Z("恢复", "Resume")} onClick={() => togglePause(checkin)} disabled={update.isPending}>
                        {checkin.is_active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" title={Z("编辑", "Edit")} onClick={() => openEdit(checkin)}><Edit2 className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" title={Z("删除", "Delete")} onClick={() => setDeleteConfirm({ open: true, checkin })}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {(checkins || []).map((checkin: any) => {
            const slots: string[] = checkin.today_slots || [];
            const modes: string[] = checkin.check_in_type?.length ? checkin.check_in_type : ["human"];
            return (
              <Card key={checkin.id} className="border-transparent card-elevated">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">{checkin.name}</span>
                        {!checkin.is_active && <Badge variant="outline" className="text-xs">{Z("已暂停", "Paused")}</Badge>}
                      </div>
                      {checkin.detail && <p className="text-xs text-muted-foreground mt-1">{checkin.detail}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        {checkinFrequencyLabel(checkin, Z)} · {slots.length ? slots.map((s: string) => formatSlot(s, isCN)).join(", ") : Z("今天无安排", "No check-in scheduled today")}
                      </p>
                    </div>
                    <div className="flex min-w-0 flex-col gap-2">
                      {slots.map((slot) => {
                        const status = todayStatusByCheckin.get(`${checkin.id}-${slot}`);
                        const isMissed = missedTodayIds.has(`${checkin.id}-${slot}`);
                        return (
                          <div key={`${checkin.id}-${slot}`} className="flex flex-wrap items-center justify-end gap-2">
                            <span className="text-xs text-muted-foreground">{formatSlot(slot, isCN)}</span>
                            <Badge variant="outline" className={status ? STATUS_STYLE[status] : isMissed ? STATUS_STYLE["missed"] : "bg-muted text-muted-foreground"}>
                              {status ? STATUS_LABEL[status] : isMissed ? Z("未完成", "Missed") : Z("待办", "Pending")}
                            </Badge>
                            {!status && checkin.is_active !== false && (
                              <div className="flex flex-wrap items-center justify-end gap-1">
                                {modes.includes("ai") && <Button size="sm" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10" onClick={() => openAICheckIn(checkin, slot)}><Bot className="h-3 w-3 mr-1" /> {Z("AI 签到", "AI Check")}</Button>}
                                {modes.includes("human") && <>
                                  <Button size="sm" variant="outline" onClick={() => openLog(checkin, slot, "skipped")} disabled={logCheckin.isPending}><SkipForward className="h-3 w-3 mr-1" /> {Z("跳过", "Skip")}</Button>
                                  {isMissed && <Button size="sm" variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10" onClick={() => openLog(checkin, slot, "missed")} disabled={logCheckin.isPending}><AlertCircle className="h-3 w-3 mr-1" /> {Z("漏签", "Missed")}</Button>}
                                  <Button size="sm" onClick={() => openLog(checkin, slot, "checked")} disabled={logCheckin.isPending}><Check className="h-3 w-3 mr-1" /> {Z("签到", "Check")}</Button>
                                </>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
}
