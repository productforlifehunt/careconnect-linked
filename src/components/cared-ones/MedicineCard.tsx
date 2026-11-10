import { RowActions } from "./RowActions";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Pill, Plus, Loader2, Trash2, Check, X, Clock, SkipForward, Edit2, History, TrendingUp, AlertCircle, ChevronDown, ChevronUp, StickyNote, Search, Bot } from "lucide-react";
import { useMedicines, useCreateMedicine, useDeleteMedicine, useLogMedicine, useUpdateMedicine, useTodayMedicineLogs, useMedicineLogs, useAllMedicineLogs, useCheckinCaregivers, useScheduleNotificationReceivers, useSetScheduleNotificationSubscription } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import i18n from "@/i18n/config";
const isCN = () => (i18n.language || "").startsWith("zh");
const Z = (cn: string, en: string) => (isCN() ? cn : en);
import { motion, AnimatePresence } from "framer-motion";
import { rxnormSuggest, rxnormLookup, type RxSuggestion } from "@/lib/rxnorm";
import { formatDate, formatTime as formatLocaleTime, formatDateTime } from "@/lib/locale";
import { useAIAssistant } from "@/contexts/AIAssistantContext";
import { useAuth } from "@/contexts/AuthContext";
import { findDoseLog, todayAtSlot } from "@/features/medicine/dose-slot";
import { slotsNeeded, frequencyForSlots, localDay, type FrequencyCode } from "@/features/schedules/recurrence";
import { ScheduleRecurrenceFields } from "./ScheduleRecurrenceFields";
import { requestCareScheduleNotificationPermission } from "@/features/schedules/device-reminders";
import { fetchMedicineAssigneeIdsWordPress } from "@/features/medicine/source.medicine";

const TIMELINE_HOURS = [
  "06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00",
  "16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00",
  "00:00","01:00","02:00","03:00","04:00","05:00",
];

function hourLabel(h24: number): string {
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

const SCHEDULE_TIMES = [
  "06:00","07:00","08:00","09:00","10:00","11:00",
  "12:00","13:00","14:00","15:00","16:00","17:00",
  "18:00","19:00","20:00","21:00","22:00","23:00",
].map(value => ({ value, label: hourLabel(parseInt(value.split(":")[0]!)) }));

const FREQUENCIES = [
  { value: "once_daily", label: Z("每日一次","Once daily") },{ value: "twice_daily", label: Z("每日两次","Twice daily") },
  { value: "three_daily", label: Z("每日三次","Three times daily") },{ value: "four_daily", label: Z("每日四次","Four times daily") },
  { value: "every_other_day", label: Z("隔日一次","Every other day") },{ value: "weekly", label: Z("每周一次","Weekly") },
  { value: "monthly", label: Z("每月", "Monthly") },{ value: "yearly", label: Z("每年", "Yearly") },{ value: "daily", label: Z("每隔几天", "Every N days") },
  { value: "as_needed", label: Z("按需服用","As needed") },
];

function CheckinModeField({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  return (
    <div>
      <Label>{Z("签到方式", "Check-in method")}</Label>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-2">
        {(["human", "ai"] as const).map((mode) => (
          <label key={mode} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={value.includes(mode)}
              onChange={(event) => onChange(event.target.checked
                ? [...value, mode]
                : value.filter((item) => item !== mode))}
            />
            {mode === "ai" ? Z("AI 核对", "AI check-in") : Z("人工核对", "Manual check-in")}
          </label>
        ))}
      </div>
    </div>
  );
}

function ScheduleCaregiverField({ caregivers, value, onChange, label, loading = false, error = false, disabled = false }: { caregivers: Array<{ id: string; name: string }>; value: string[]; onChange: (value: string[]) => void; label: string; loading?: boolean; error?: boolean; disabled?: boolean }) {
  return (
    <div>
      <Label>{label}</Label>
      {loading ? <p className="mt-1 text-xs text-muted-foreground">{Z("正在读取已指派人员…", "Loading assigned people…")}</p> : error ? <p className="mt-1 text-xs text-destructive">{Z("无法读取已指派人员；保存其他内容不会更改此设置。", "Could not load assigned people. Saving other changes will leave this setting unchanged.")}</p> : caregivers.length ? (
        <div className="mt-1 grid gap-2 sm:grid-cols-2">
          {caregivers.map((person) => (
            <label key={person.id} className={`flex items-center gap-2 text-sm ${disabled ? "opacity-60" : ""}`}>
              <input type="checkbox" checked={value.includes(person.id)} disabled={disabled} onChange={(event) => onChange(event.target.checked ? [...value, person.id] : value.filter((id) => id !== person.id))} />
              <span className="truncate">{person.name}</span>
            </label>
          ))}
        </div>
      ) : <p className="mt-1 text-xs text-muted-foreground">{Z("该被照护者暂无已关联的护理者。", "No caregivers are linked to this cared one yet.")}</p>}
    </div>
  );
}

/** Daily frequencies need exactly that many distinct times (a66 BYHOUR/BYMINUTE). */
function resizeSlots(freq: string, slots: string[]): string[] {
  const unique = Array.from(new Set(slots));
  const need = slotsNeeded(freq as FrequencyCode);
  if (need === null || need === 0) return unique.length ? unique : ["08:00"];
  const out = unique.slice(0, need);
  while (out.length < need) out.push(nextFreeTime(out));
  return out;
}
function nextFreeTime(used: string[]): string {
  return ["08:00", "12:00", "18:00", "21:00", ...SCHEDULE_TIMES.map(t => t.value)].find(t => !used.includes(t)) || "08:00";
}
/** Adding/removing a time keeps the daily frequency equal to the number of times. */
function withSlots<F extends { frequency: string; time_slots: string[] }>(form: F, slots: string[]): F {
  return { ...form, time_slots: slots, frequency: frequencyForSlots(form.frequency as FrequencyCode, slots) };
}
/** Doses shown today: calendar occurrences (a66 − a68 + a69); as-needed shows once. */
function doseSlotsToday(med: any): string[] {
  const isPRN = med.frequency_code === "as_needed";
  if (isPRN) return ["08:00"];
  return med.today_slots || [];
}

/** Localized frequency label from the stored code (CCT 187 a66 RRULE + a95). */
function freqLabel(med: any): string {
  const code = med?.frequency_code || med?.frequency;
  const interval = Math.max(1, Number(med?.repeat_interval) || 1);
  if (code === "daily") return Z(`每 ${interval} 天`, `Every ${interval} days`);
  if (code === "weekly") {
    const intervalLabel = interval > 1 ? Z(`每 ${interval} 周`, `Every ${interval} weeks`) : Z("每周", "Weekly");
    const weekdayNames: Record<string, string> = { MO: Z("周一", "Mon"), TU: Z("周二", "Tue"), WE: Z("周三", "Wed"), TH: Z("周四", "Thu"), FR: Z("周五", "Fri"), SA: Z("周六", "Sat"), SU: Z("周日", "Sun") };
    const days = (med?.repeat_weekdays || []).map((day: string) => weekdayNames[day]).filter(Boolean);
    return days.length ? `${intervalLabel} · ${days.join(", ")}` : intervalLabel;
  }
  if (code === "monthly" && interval > 1) return Z(`每 ${interval} 个月`, `Every ${interval} months`);
  if (code === "yearly" && interval > 1) return Z(`每 ${interval} 年`, `Every ${interval} years`);
  return FREQUENCIES.find(f => f.value === code)?.label || med?.frequency || "";
}

function formatHour(h: string): string {
  return hourLabel(parseInt(h.split(":")[0]!));
}

function formatTime(dateStr: string): string {
  return formatLocaleTime(dateStr, i18n.language, { hour: "numeric", minute: "2-digit" });
}

// ─── Log Note Dialog ────────────────────────────────────────
function LogNoteDialog({ open, onClose, onConfirm, medName, action, isPending }: {
  open: boolean; onClose: () => void; onConfirm: (note: string) => void;
  medName: string; action: "taken" | "skipped" | "missed"; isPending: boolean;
}) {
  const [note, setNote] = useState("");
  const titleMap = { taken: Z("标记为已服用","Mark as Taken"), skipped: Z("跳过此剂","Skip Dose"), missed: Z("标记为漏服","Mark as Missed") };
  const Icon = action === "taken" ? Check : action === "skipped" ? SkipForward : AlertCircle;
  const iconColor = action === "taken" ? "text-success" : action === "skipped" ? "text-warning" : "text-destructive";
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setNote(""); onClose(); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${iconColor}`} />
            {titleMap[action]}
          </DialogTitle>
          <DialogDescription>{medName} — {Z("为此次服药添加可选备注","add an optional note about this dose")}</DialogDescription>
        </DialogHeader>
        <Textarea
          value={note} onChange={e => setNote(e.target.value)}
          placeholder={action === "taken" ? Z("例如:早餐时服用,感觉良好…","e.g. Taken with breakfast, felt fine…") : action === "skipped" ? Z("例如:药已用完,感觉恶心…","e.g. Out of stock, feeling nauseous…") : Z("例如:忘记了、当时在睡觉…","e.g. Forgot, was sleeping…")}
          className="min-h-[80px]"
        />
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => { setNote(""); onClose(); }}>{Z("取消","Cancel")}</Button>
          <Button
            variant={action === "taken" ? "default" : "outline"}
            className={action === "taken" ? "bg-success hover:bg-success/90 text-success-foreground" : action === "skipped" ? "border-warning text-warning hover:bg-warning/10" : "border-destructive text-destructive hover:bg-destructive/10"}
            onClick={() => { onConfirm(note); setNote(""); }}
            disabled={isPending}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {Z("确认","Confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Medicine History Dialog ────────────────────────────────
function MedHistoryDialog({ open, onClose, med }: { open: boolean; onClose: () => void; med: any }) {
  const { data: logs, isLoading } = useMedicineLogs(open ? med?.id : null);

  const stats = useMemo(() => {
    if (!logs || logs.length === 0) return null;
    const taken = logs.filter((l: any) => l.status === "taken").length;
    const skipped = logs.filter((l: any) => l.status === "skipped").length;
    const missed = logs.filter((l: any) => l.status === "missed").length;
    const total = taken + skipped + missed;
    const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;
    return { taken, skipped, missed, total, adherence };
  }, [logs]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            {med?.name} — {Z("历史记录","History")}
          </DialogTitle>
          <DialogDescription>{[med?.dosage, freqLabel(med)].filter(Boolean).join(" · ")}</DialogDescription>
        </DialogHeader>

        {/* Adherence Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-2 py-2">
            <div className="text-center p-3 rounded-xl bg-success/10 border border-success/20">
              <div className="text-2xl font-bold text-success">{stats.adherence}%</div>
              <div className="text-xs text-muted-foreground">{Z("依从率","Adherence")}</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-primary/10 border border-primary/20">
              <div className="text-2xl font-bold text-primary">{stats.taken}</div>
              <div className="text-xs text-muted-foreground">{Z("已服用","Taken")}</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-warning/10 border border-warning/20">
              <div className="text-2xl font-bold text-warning">{stats.skipped}</div>
              <div className="text-xs text-muted-foreground">{Z("已跳过","Skipped")}</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <div className="text-2xl font-bold text-destructive">{stats.missed}</div>
              <div className="text-xs text-muted-foreground">{Z("漏服","Missed")}</div>
            </div>
          </div>
        )}

        {/* Log list */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 -mr-1">
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground my-8" />
          ) : (logs || []).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{Z("暂无记录","No logs recorded yet") as any}</p>
          ) : (
            (logs || []).map((log: any) => (
              <div key={log.id} className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
                <div className={`mt-0.5 shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${log.status === "taken" ? "bg-success/15 text-success" : log.status === "missed" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"}`}>
                  {log.status === "taken" ? <Check className="h-3.5 w-3.5" /> : log.status === "missed" ? <AlertCircle className="h-3.5 w-3.5" /> : <SkipForward className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{log.status === "taken" ? Z("已服用", "Taken") : log.status === "skipped" ? Z("已跳过", "Skipped") : Z("漏服", "Missed")}</span>
                    {log.logged_by_ai && <Badge variant="outline" className="h-5 border-primary/40 px-1.5 text-[10px] text-primary"><Bot className="mr-1 h-3 w-3" />AI</Badge>}
                    <span className="text-xs text-muted-foreground">{formatDate(log.created_at)} · {formatTime(log.created_at)}</span>
                  </div>
                  {log.note && (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-start gap-1">
                      <StickyNote className="h-3 w-3 mt-0.5 shrink-0" />{log.note}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Medicine Dialog ───────────────────────────────────
function EditMedDialog({ open, onClose, med, onDelete }: { open: boolean; onClose: () => void; med: any; onDelete: () => void }) {
  const updateMed = useUpdateMedicine();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: caregivers = [] } = useCheckinCaregivers(med?.user_id || null);
  const [form, setForm] = useState({ name: "", dosage: "", rxcui: "", frequency: "once_daily", repeat_interval: 1, repeat_weekdays: [] as string[], time_slots: ["08:00"] as string[], note: "", check_in_type: ["human"] as string[], start_date: "", end_date: "", stock_count: "" as string | number, refill_threshold: "" as string | number, reminder_time_before: "0" as string | number, assignee_ids: [] as string[] });
  const [peopleLoad, setPeopleLoad] = useState<{ medicineId: string; assignees: "loading" | "ready" | "error" } | null>(null);
  const [peopleDirty, setPeopleDirty] = useState({ assignees: false });
  const editMedicineIdRef = useRef<string | null>(null);

  // Re-populate when med/open changes
  const populateForm = useCallback(() => {
    if (med) {
      const freqEntry = FREQUENCIES.find(f => f.value === (med.frequency_code || med.frequency)) || FREQUENCIES.find(f => f.label === med.frequency);
      setForm({
        name: med.name || "",
        dosage: med.dosage || "",
        rxcui: med.medication_concept_identifier || "",
        frequency: freqEntry?.value || "once_daily",
        repeat_interval: med.repeat_interval || 1,
        repeat_weekdays: med.repeat_weekdays || [],
        time_slots: med.time_slot?.length > 0 ? [...med.time_slot] : ["08:00"],
        note: med.note || "",
        check_in_type: med.check_in_type?.length ? [...med.check_in_type] : ["human"],
        start_date: med.start_date || "",
        end_date: med.end_date || "",
        stock_count: med.stock_count ?? "",
        refill_threshold: med.refill_threshold ?? "",
        reminder_time_before: med.reminder_time_before ?? "0",
        assignee_ids: [],
      });
      const medicineId = String(med.id);
      editMedicineIdRef.current = medicineId;
      setPeopleDirty({ assignees: false });
      setPeopleLoad({ medicineId, assignees: "loading" });
      fetchMedicineAssigneeIdsWordPress(medicineId).then((ids) => {
        if (editMedicineIdRef.current === medicineId) setForm((current) => ({ ...current, assignee_ids: ids }));
        setPeopleLoad((current) => current?.medicineId === medicineId ? { ...current, assignees: "ready" } : current);
      }).catch(() => setPeopleLoad((current) => current?.medicineId === medicineId ? { ...current, assignees: "error" } : current));
    }
  }, [med]);

  useEffect(() => {
    if (open) populateForm();
  }, [open, populateForm]);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const alertsAllowed = await requestCareScheduleNotificationPermission();
    const updates: Record<string, any> & { id: string } = {
      id: med.id,
      name: form.name.trim(),
      dosage: form.dosage || undefined,
      medication_concept_identifier: form.rxcui || undefined,
      frequency: form.frequency,
      repeat_interval: Number(form.repeat_interval) || 1,
      repeat_weekdays: form.repeat_weekdays,
      time_slot: form.time_slots,
      check_in_type: form.check_in_type,
      start_date: form.start_date,
      end_date: form.end_date,
      note: form.note || undefined,
      stock_count: form.stock_count === "" ? "" : Number(form.stock_count),
      refill_threshold: form.refill_threshold === "" ? "" : Number(form.refill_threshold),
      reminder_time_before: form.reminder_time_before === "" ? 0 : Number(form.reminder_time_before),
    };
    if (peopleDirty.assignees) updates["assignee_ids"] = form.assignee_ids;
    updateMed.mutate(updates, {
      onSuccess: () => { toast({ title: Z("药品已更新","Medicine updated"), description: alertsAllowed ? undefined : Z("计划已保存；请在被照护者手机打开应用并开启通知，才能收到定时提醒。", "Schedule saved. Open the app on the cared one's phone and enable notifications to receive timed reminders.") }); onClose(); },
      onError: (err) => toast({ title: Z("操作失败","Failed"), description: String(err.message), variant: "destructive" }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { editMedicineIdRef.current = null; onClose(); } else populateForm(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{Z("编辑药品","Edit Medicine")}</DialogTitle>
          <DialogDescription>{Z("更新药品信息","Update medication details")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div><Label>{Z("药品名称","Medicine Name")} <span className="text-destructive">*</span></Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>{Z("剂量","Dosage")}</Label><Input value={form.dosage} onChange={e => setForm(p => ({ ...p, dosage: e.target.value }))} placeholder={Z("例如:10 毫克","e.g. 10mg")} className="mt-1" /></div>
            <div><Label>{Z("频率","Frequency")}</Label>
              <Select value={form.frequency} onValueChange={v => setForm(p => ({ ...p, frequency: v, time_slots: resizeSlots(v, p.time_slots) }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{FREQUENCIES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <ScheduleRecurrenceFields
            frequency={form.frequency}
            interval={form.repeat_interval}
            weekdays={form.repeat_weekdays}
            onIntervalChange={(value) => setForm((p) => ({ ...p, repeat_interval: value === "" ? 1 : Number(value) }))}
            onWeekdaysChange={(repeat_weekdays) => setForm((p) => ({ ...p, repeat_weekdays }))}
            Z={Z}
          />
          <div>
            <div className="flex items-center justify-between">
              <Label>{Z("服药时间","Scheduled Times")}</Label>
              <Button type="button" variant="ghost" size="sm" onClick={() => setForm(p => withSlots(p, [...p.time_slots, nextFreeTime(p.time_slots)]))} className="text-xs h-7"><Plus className="h-3 w-3 mr-1" /> {Z("添加时间","Add Time")}</Button>
            </div>
            <div className="space-y-2 mt-1">
              {form.time_slots.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Select value={slot} onValueChange={v => setForm(p => ({ ...p, time_slots: p.time_slots.map((t, i) => i === idx ? v : t) }))}>
                    <SelectTrigger><Clock className="h-4 w-4 mr-2 text-muted-foreground" /><SelectValue /></SelectTrigger>
                    <SelectContent>{SCHEDULE_TIMES.filter(t => t.value === slot || !form.time_slots.includes(t.value)).map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                  {form.time_slots.length > 1 && <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => setForm(p => withSlots(p, p.time_slots.filter((_, i) => i !== idx)))}><X className="h-3 w-3" /></Button>}
                </div>
              ))}
            </div>
          </div>
          <CheckinModeField value={form.check_in_type} onChange={(check_in_type) => setForm((p) => ({ ...p, check_in_type }))} />
          <ScheduleCaregiverField caregivers={caregivers} value={form.assignee_ids} onChange={(assignee_ids) => { setForm((p) => ({ ...p, assignee_ids })); setPeopleDirty((p) => ({ ...p, assignees: true })); }} label={Z("负责用药核对的人", "People assigned to check doses")} loading={peopleLoad?.medicineId === String(med?.id) && peopleLoad.assignees === "loading"} error={peopleLoad?.medicineId === String(med?.id) && peopleLoad.assignees === "error"} disabled={peopleLoad?.medicineId !== String(med?.id) || peopleLoad.assignees !== "ready"} />
          <div className="grid grid-cols-2 gap-3">
            <div><Label>{Z("开始日期", "Start date")}</Label><Input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className="mt-1" /></div>
            <div><Label>{Z("结束日期", "End date")}</Label><Input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} className="mt-1" /></div>
          </div>
          <div><Label>{Z("备注","Notes")}</Label><Textarea value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder={Z("用药说明、副作用…","Instructions, side effects…")} className="mt-1 min-h-[60px]" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>{Z("库存数量","Stock count")} <span className="text-muted-foreground text-xs">{Z("(剩余药片)","(pills left)")}</span></Label><Input type="number" min="0" value={form.stock_count} onChange={e => setForm(p => ({ ...p, stock_count: e.target.value }))} placeholder="e.g. 30" className="mt-1" /></div>
            <div><Label>{Z("补药提醒","Refill alert")} <span className="text-muted-foreground text-xs">{Z("(阈值)","(threshold)")}</span></Label><Input type="number" min="0" value={form.refill_threshold} onChange={e => setForm(p => ({ ...p, refill_threshold: e.target.value }))} placeholder="e.g. 7" className="mt-1" /></div>
            </div>
            <div><Label>{Z("提前提醒(分钟)","Remind before (min)")}</Label><Input type="number" min="0" value={form.reminder_time_before} onChange={e => setForm(p => ({ ...p, reminder_time_before: e.target.value }))} className="mt-1" /></div>

          <div className="sticky bottom-0 -mx-6 flex gap-2 border-t bg-background px-6 py-3">
            <Button className="flex-1" onClick={handleSave} disabled={updateMed.isPending || !form.name.trim() || form.check_in_type.length === 0}>
              {updateMed.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} {Z("保存更改","Save Changes")}
            </Button>
            <Button variant="outline" onClick={onClose}>{Z("取消","Cancel")}</Button>
            <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-1" /> {Z("删除","Delete")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Inline Med Card (used in timeline & list) ──────────────
function MedDoseCard({ med, todayLogs, onLog, onEdit, onDelete, onHistory, compact, slot, manage }: {
  med: any;
  todayLogs: any[];
  onLog: (med: any, status: "taken" | "skipped" | "missed", slot?: string | undefined) => void;
  onEdit: (med: any) => void;
  onDelete?: ((med: any) => Promise<unknown>) | undefined;
  onHistory: (med: any) => void;
  compact?: boolean | undefined;
  slot?: string | undefined;
  /** Manage view: plan editing only, no dose check-in buttons. */
  manage?: boolean | undefined;
}) {
  const isPRN = med.frequency_code === "as_needed" || med.frequency === "As needed" || med.frequency === "as_needed";
  const logForThisDose = findDoseLog(todayLogs, med.id, isPRN ? undefined : slot);
  const isTaken = logForThisDose?.status === "taken";
  const isSkipped = logForThisDose?.status === "skipped";
  const isMissedLogged = logForThisDose?.status === "missed";
  const isDone = isTaken || isSkipped || isMissedLogged;
  const humanCheckInEnabled = med.check_in_type?.length ? med.check_in_type.includes("human") : true;

  // A manual missed-dose action becomes available after the scheduled time.
  const isMissedAuto = useMemo(() => {
    if (isDone || isPRN || !slot) return false;
    const [h = "0", m = "0"] = slot.split(":");
    const slotMins = Number(h) * 60 + Number(m);
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return nowMins > slotMins;
  }, [slot, isDone, isPRN]);

  const lowStock = typeof med.stock_count === "number" && typeof med.refill_threshold === "number" && med.stock_count <= med.refill_threshold;

  return (
    <motion.div
      layout
      className={`min-w-0 rounded-xl border p-3 transition-all ${
        isTaken ? "bg-success/5 border-success/30" :
        isSkipped ? "bg-warning/5 border-warning/30" :
        isMissedLogged ? "bg-destructive/5 border-destructive/30" :
        isMissedAuto ? "bg-destructive/5 border-destructive/40" :
        "bg-card border-border hover:border-primary/30"
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
          isTaken ? "bg-success/15 text-success" :
          isSkipped ? "bg-warning/15 text-warning" :
          isMissedLogged || isMissedAuto ? "bg-destructive/15 text-destructive" :
          "bg-primary/10 text-primary"
        }`}>
          {isTaken ? <Check className="h-4 w-4" /> : isSkipped ? <SkipForward className="h-4 w-4" /> : (isMissedLogged || isMissedAuto) ? <AlertCircle className="h-4 w-4" /> : <Pill className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`font-medium text-sm break-words ${isDone ? "line-through opacity-60" : "text-foreground"}`}>{med.name}</p>
          {(isPRN || lowStock) && (
            <div className="mt-1 flex flex-wrap gap-1">
              {isPRN && <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-primary/40 text-primary">PRN</Badge>}
              {lowStock && (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-destructive/40 text-destructive bg-destructive/5">
                  <AlertCircle className="h-2.5 w-2.5 mr-0.5" />{Z(`库存低:剩 ${med.stock_count}`, `Low: ${med.stock_count} left`)}
                </Badge>
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-0.5 break-words">{[med.dosage, freqLabel(med)].filter(Boolean).join(" · ")}</p>
          {logForThisDose?.note && (
            <p className="text-xs text-muted-foreground/80 mt-0.5 italic flex items-center gap-1 break-words">
              <StickyNote className="h-2.5 w-2.5 shrink-0" />{logForThisDose.note}
            </p>
          )}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1 pl-12">
        {manage ? (
          <>
            <span className="text-xs text-muted-foreground">
              {isPRN
                ? Z("按需服用","As needed")
                : (med.time_slot || []).map((s: string) => formatHour(s)).join(" · ")}
            </span>
            <div className="ml-auto flex items-center gap-0.5">
              <Button size="icon" variant="ghost" aria-label={Z(`${med.name} 用药记录`, `${med.name} history`) as string} className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onHistory(med)}>
                <History className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" aria-label={Z(`编辑 ${med.name}`, `Edit ${med.name}`) as string} className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onEdit(med)}>
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              {onDelete && <RowActions onDelete={() => onDelete(med)} />}
            </div>
          </>
        ) : isDone ? (
          <Badge variant="outline" className={`text-xs ${
            isTaken ? "border-success/40 text-success bg-success/10" :
            isSkipped ? "border-warning/40 text-warning bg-warning/10" :
            "border-destructive/40 text-destructive bg-destructive/10"
          }`}>
            {isTaken ? Z("✓ 已服用","✓ Taken") : isSkipped ? Z("⏭ 已跳过","⏭ Skipped") : Z("⚠ 漏服","⚠ Missed")}
            {logForThisDose?.created_at && <span className="ml-1 opacity-70">{formatTime(logForThisDose.created_at)}</span>}
          </Badge>
        ) : isPRN && humanCheckInEnabled ? (
          <Button size="sm" className="h-8 text-xs bg-primary/15 text-primary hover:bg-primary/25 border-0" variant="outline"
            onClick={() => onLog(med, "taken", slot)}><Plus className="h-3 w-3 mr-1" /> {Z("立即记录","Log dose now")}</Button>
        ) : !isPRN && humanCheckInEnabled ? (
          <>
            <Button size="sm" className="h-8 text-xs bg-success/15 text-success hover:bg-success/25 border-0" variant="outline"
              onClick={() => onLog(med, "taken", slot)}><Check className="h-3 w-3 mr-1" /> {Z("已服用","Taken")}</Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs text-warning hover:bg-warning/10"
              onClick={() => onLog(med, "skipped", slot)}><SkipForward className="h-3 w-3 mr-1" /> {Z("跳过","Skip")}</Button>
            {isMissedAuto && (
              <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive hover:bg-destructive/10"
                onClick={() => onLog(med, "missed", slot)}><AlertCircle className="h-3 w-3 mr-1" /> {Z("漏服","Missed")}</Button>
            )}
          </>
        ) : null}
      </div>
    </motion.div>
  );
}

// ─── RxNorm Autocomplete (NIH/NLM, free) ───────────────────
function RxNormNameInput({ value, onChange, onPick }: {
  value: string;
  onChange: (v: string) => void;
  onPick: (s: { name: string; strength?: string | null | undefined; doseForm?: string | null | undefined; rxcui?: string | null | undefined }) => void;
}) {
  const [suggestions, setSuggestions] = useState<RxSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounce = useRef<number | null>(null);

  useEffect(() => {
    if (debounce.current) window.clearTimeout(debounce.current);
    if (value.trim().length < 2) { setSuggestions([]); return; }
    setLoading(true);
    debounce.current = window.setTimeout(async () => {
      const list = await rxnormSuggest(value);
      setSuggestions(list);
      setLoading(false);
      setOpen(list.length > 0);
    }, 300);
    return () => { if (debounce.current) window.clearTimeout(debounce.current); };
  }, [value]);

  // Click outside closes dropdown
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handlePick = async (name: string) => {
    onChange(name);
    setOpen(false);
    const info = await rxnormLookup(name);
    onPick({ name, strength: info.strength, doseForm: info.doseForm, rxcui: info.rxcui });
  };

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Input
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={Z("输入关键词搜索(例如:Lisinopril)","Type to search (e.g. Lisinopril)")}
          className="mt-1 pr-8"
          autoComplete="off"
        />
        {loading ? (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 mt-0.5 h-4 w-4 animate-spin text-muted-foreground" />
        ) : value.length >= 2 ? (
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 mt-0.5 h-4 w-4 text-muted-foreground" />
        ) : null}
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-60 overflow-y-auto">
          <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground border-b">RxNorm · NIH/NLM</div>
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handlePick(s.name)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main MedicineCard ──────────────────────────────────────
export function MedicineCard({ caredOneId, caredOneName }: { caredOneId: string; caredOneName: string }) {
  const { toast } = useToast();
  const { data: meds, isLoading } = useMedicines(caredOneId);
  const { data: caregivers = [] } = useCheckinCaregivers(caredOneId);
  const { data: todayLogs } = useTodayMedicineLogs(caredOneId);
  const { data: allLogs, isLoading: allLogsLoading } = useAllMedicineLogs(caredOneId);
  const createMed = useCreateMedicine();
  const deleteMed = useDeleteMedicine();
  const logMed = useLogMedicine();
  const { openWriteAssistant } = useAIAssistant();
  const { user } = useAuth();
  const scheduleIds = useMemo(() => (meds || []).map((med: any) => String(med.id)), [meds]);
  const receiverId = String(user?.user_id ?? "").replace(/^wp-/, "");
  const { data: scheduleReceivers, isLoading: scheduleReceiversLoading } = useScheduleNotificationReceivers(scheduleIds);
  const setScheduleSubscription = useSetScheduleNotificationSubscription();
  const receivesMedicationReminders = Boolean(
    receiverId && scheduleIds.length && scheduleReceivers &&
    scheduleIds.every((id) => (scheduleReceivers.get(id) || []).includes(receiverId)),
  );
  const autoOpenedDoseRef = useRef<Set<string>>(new Set());
  const [clock, setClock] = useState(() => new Date());

  const [addOpen, setAddOpen] = useState(false);
  const [view, setView] = useState<"timeline" | "records" | "manage">("timeline");
  const [form, setForm] = useState({ name: "", dosage: "", rxcui: "", frequency: "once_daily", repeat_interval: 1, repeat_weekdays: [] as string[], time_slots: ["08:00"] as string[], note: "", check_in_type: ["human"] as string[], start_date: "", end_date: "", stock_count: "" as string | number, refill_threshold: "" as string | number, reminder_time_before: "0" as string | number, assignee_ids: [] as string[] });
  const updateMed = useUpdateMedicine();

  // Dialogs
  const [logDialog, setLogDialog] = useState<{ open: boolean; med: any; action: "taken" | "skipped" | "missed"; slot?: string | undefined }>({ open: false, med: null, action: "taken" });
  const [historyMed, setHistoryMed] = useState<any>(null);
  const [editMed, setEditMed] = useState<any>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const handleLog = (med: any, status: "taken" | "skipped" | "missed", slot?: string | undefined) => {
    setLogDialog({ open: true, med, action: status, slot });
  };

  const handleMedicationReminderSubscription = (receives: boolean) => {
    setScheduleSubscription.mutate(
      { scheduleIds, receiverId, receives },
      {
        onSuccess: () => toast({ title: receives ? Z("已开启用药提醒推送", "Medication reminders on") : Z("已关闭用药提醒推送", "Medication reminders off") }),
        onError: (error) => toast({ title: Z("保存失败", "Save failed"), description: error instanceof Error ? error.message : String(error), variant: "destructive" }),
      },
    );
  };

  const confirmLog = (note: string) => {
    const { med, action, slot } = logDialog;
    logMed.mutate(
      {
        medicine_id: med.id,
        status: action,
        note: note || undefined,
        medication_note: med.note || "",
        user_id: caredOneId,
        // Apple HKMedicationDoseEvent context, copied from the schedule row
        dose_quantity: med.dose_quantity ?? null,
        scheduled_dose_quantity: med.dose_quantity ?? null,
        dose_unit: med.dose_unit || null,
        // a88 Scheduled date = the dose slot this log answers
        scheduled_date: slot ? todayAtSlot(slot) : null,
        schedule_type: med.schedule_type || null,
        concept_identifier: med.medication_concept_identifier || null,
        concept_display_text: med.name || null,
        rxcui: med.medication_concept_identifier || null,
      },
      {
        onSuccess: () => {
          // Decrement stock on "taken"
          if (action === "taken" && typeof med.stock_count === "number" && med.stock_count > 0) {
            const newStock = med.stock_count - 1;
            updateMed.mutate({ id: med.id, stock_count: newStock });
            if (typeof med.refill_threshold === "number" && newStock <= med.refill_threshold) {
              toast({ title: Z(`库存不足:${med.name}`, `Low stock: ${med.name}`), description: Z(`剩余 ${newStock} 剂 — 该补药了`, `${newStock} doses left — time to refill`), variant: "destructive" });
            }
          }
          toast({ title: action === "taken" ? Z(`${med.name} 已标记为服用 ✓`, `${med.name} marked as taken ✓`) : action === "skipped" ? Z(`${med.name} 已跳过`, `${med.name} skipped`) : Z(`${med.name} 已标记为漏服`, `${med.name} marked as missed`) });
          setLogDialog({ open: false, med: null, action: "taken" });
        },
        onError: (err) => toast({ title: Z("操作失败","Failed"), description: String(err.message), variant: "destructive" }),
      }
    );
  };

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    const alertsAllowed = await requestCareScheduleNotificationPermission();
    createMed.mutate(
      {
        user_id: caredOneId,
        name: form.name.trim(),
        dosage: form.dosage || undefined,
        medication_concept_identifier: form.rxcui || undefined,
        frequency: form.frequency,
        repeat_interval: Number(form.repeat_interval) || 1,
        repeat_weekdays: form.repeat_weekdays,
        time_slot: form.time_slots.length > 0 ? form.time_slots : ["08:00"],
        check_in_type: form.check_in_type,
        start_date: form.start_date || undefined,
        end_date: form.end_date || undefined,
        note: form.note || undefined,
        stock_count: form.stock_count === "" ? undefined : Number(form.stock_count),
        refill_threshold: form.refill_threshold === "" ? undefined : Number(form.refill_threshold),
        reminder_time_before: form.reminder_time_before === "" ? 0 : Number(form.reminder_time_before),
        assignee_ids: form.assignee_ids,
      },
      { onSuccess: () => { setForm({ name: "", dosage: "", rxcui: "", frequency: "once_daily", repeat_interval: 1, repeat_weekdays: [], time_slots: ["08:00"], note: "", check_in_type: ["human"], start_date: "", end_date: "", stock_count: "", refill_threshold: "", reminder_time_before: "0", assignee_ids: [] }); setAddOpen(false); toast({ title: Z("药品已添加","Medicine added"), description: alertsAllowed ? undefined : Z("计划已保存；请在被照护者手机打开应用并开启通知，才能收到定时提醒。", "Schedule saved. Open the app on the cared one's phone and enable notifications to receive timed reminders.") }); },
        onError: (err) => toast({ title: Z("添加失败","Failed to add"), description: String(err.message), variant: "destructive" }) }
    );
  };

  // Adherence summary
  const adherenceSummary = useMemo(() => {
    if (!meds || !todayLogs) return null;
    const totalSlots = (meds as any[]).reduce((sum, m) => sum + doseSlotsToday(m).length, 0);
    const logged = (todayLogs as any[]).length;
    const taken = (todayLogs as any[]).filter(l => l.status === "taken").length;
    const skipped = (todayLogs as any[]).filter(l => l.status === "skipped").length;
    const pending = totalSlots - logged;
    const pct = totalSlots > 0 ? Math.round((taken / totalSlots) * 100) : 0;
    return { totalSlots, taken, skipped, pending, pct };
  }, [meds, todayLogs]);

  // Timeline grouping
  // Keyed by the hour row ("08:00"); each entry keeps its exact slot ("08:30").
  // Duplicate slots of one medicine are one dose, shown once.
  const timelineMeds = useMemo(() => {
    if (!meds) return {};
    const grouped: Record<string, { med: any; slot: string }[]> = {};
    (meds as any[]).forEach((med) => {
      doseSlotsToday(med).forEach((slot) => {
        const hourKey = `${slot.substring(0, 2)}:00`;
        (grouped[hourKey] ||= []).push({ med, slot });
      });
    });
    return grouped;
  }, [meds]);

  useEffect(() => {
    if (!user?.general_user_role?.includes("cared one") || !meds || !todayLogs) return;
    const now = clock;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const due = (meds as any[]).flatMap((med) => {
      if (med.frequency_code === "as_needed") return [];
      return doseSlotsToday(med).map((slot) => ({ med, slot }));
    }).find(({ med, slot }) => {
      const key = `${localDay()}-${med.id}-${slot}`;
      if (autoOpenedDoseRef.current.has(key) || findDoseLog(todayLogs as any[], med.id, slot) || med.is_active === false || !med.check_in_type?.includes("ai")) return false;
      const [hour = "0", minute = "0"] = String(slot).split(":");
      return nowMinutes >= Number(hour) * 60 + Number(minute);
    });
    if (!due) return;
    const key = `${localDay()}-${due.med.id}-${due.slot}`;
    autoOpenedDoseRef.current.add(key);
    const dose = [due.med.name, due.med.dosage, due.slot].filter(Boolean).join(" · ");
    // One call: the registry decides wording, outcomes, the write and the refresh.
    openWriteAssistant({
      skill: "record-medicine-dose",
      id: `medicine-${key}`,
      target: {
        caredOneId: String(caredOneId),
        recordId: String(due.med.id),
        label: due.med.name,
        detail: dose,
        slot: due.slot,
        medicationNote: due.med.note || "",
        doseQuantity: due.med.dose_quantity ?? null,
        doseUnit: due.med.dose_unit || "",
        scheduleType: due.med.schedule_type || "",
        conceptIdentifier: due.med.medication_concept_identifier || "",
      },
    });
  }, [meds, todayLogs, caredOneId, user?.general_user_role, clock]);

  const hasScheduledMeds = Object.keys(timelineMeds).length > 0;
  const currentHour = new Date().getHours();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="min-w-0 text-lg font-bold text-foreground">{Z("用药追踪","Medicine Tracker")}</h2>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-2 sm:w-auto" aria-label={Z("用药视图与添加","Medicine views and add")}>
          <div className="grid h-9 min-w-0 basis-full flex-1 grid-cols-[1fr_0.85fr_1.2fr] overflow-hidden rounded-lg border sm:w-[228px] sm:basis-auto sm:flex-none" role="tablist" aria-label={Z("用药视图","Medicine views")}>
            <Button role="tab" aria-selected={view === "timeline"} variant="ghost" onClick={() => setView("timeline")} className={`h-full min-w-0 rounded-none px-2 text-xs ${view === "timeline" ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "text-muted-foreground"}`}>{Z("时间线","Timeline")}</Button>
            <Button role="tab" aria-selected={view === "records"} variant="ghost" onClick={() => setView("records")} className={`h-full min-w-0 rounded-none px-2 text-xs ${view === "records" ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "text-muted-foreground"}`}>{Z("记录","Records")}</Button>
            <Button role="tab" aria-selected={view === "manage"} variant="ghost" onClick={() => setView("manage")} className={`h-full min-w-0 rounded-none px-2 text-xs ${view === "manage" ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "text-muted-foreground"}`}>{Z("用药管理","Manage")}</Button>
          </div>
          <div className="flex min-h-9 max-w-full items-center gap-2 rounded-md border border-border px-2.5 py-1" data-inspector-id="medicine-notification-receiver-toggle" data-testid="medicine-notification-receiver-toggle">
            <span className="min-w-0 break-words text-xs">{Z(`接收${caredOneName}的用药提醒`, `Receive medication reminders for ${caredOneName}`)}</span>
            <Switch
              className="shrink-0"
              aria-label={Z(`接收${caredOneName}的用药提醒`, `Receive medication reminders for ${caredOneName}`)}
              checked={receivesMedicationReminders}
              onCheckedChange={handleMedicationReminderSubscription}
              disabled={!receiverId || scheduleIds.length === 0 || scheduleReceiversLoading || setScheduleSubscription.isPending}
            />
          </div>
          <Button size="sm" className="h-9 w-20 shrink-0" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> {Z("添加","Add")}</Button>
        </div>
      </div>

      {/* Today's Adherence Bar */}
      {adherenceSummary && adherenceSummary.totalSlots > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-muted/50 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> {Z("今日进度","Today's Progress") as any}
            </span>
            <span className="text-sm font-bold text-foreground">{adherenceSummary.pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-success to-success/80"
              initial={{ width: 0 }}
              animate={{ width: `${adherenceSummary.pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="h-3 w-3 text-success" /> {adherenceSummary.taken} {Z("已服用","taken")}</span>
            <span className="flex items-center gap-1"><SkipForward className="h-3 w-3 text-warning" /> {adherenceSummary.skipped} {Z("已跳过","skipped")}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {adherenceSummary.pending} {Z("待服","pending")}</span>
          </div>
        </div>
      )}

      {/* Add Medicine Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{Z("添加药品","Add Medicine")}</DialogTitle><DialogDescription>{Z("将药物添加到每日计划","Add a medication to the daily schedule")}</DialogDescription></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>{Z("药品名称","Medicine Name")} <span className="text-destructive">*</span></Label>
              <RxNormNameInput
                value={form.name}
                onChange={(v) => setForm(p => ({ ...p, name: v }))}
                onPick={({ name, strength, rxcui }) => {
                  // RxNorm identifiers are stored numerically in CCT 187 a92.
                  setForm(p => ({ ...p, name, dosage: p.dosage || strength || "", rxcui: rxcui || "" }));
                }}
              />
              <p className="text-[10px] text-muted-foreground mt-1">{Z("由 RxNorm(NIH/NLM)提供 — 免费美国药品数据库","Powered by RxNorm (NIH/NLM) — free US drug database") as any}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{Z("剂量","Dosage")}</Label><Input value={form.dosage} onChange={e => setForm(p => ({ ...p, dosage: e.target.value }))} placeholder={Z("例如:10 毫克","e.g. 10mg")} className="mt-1" /></div>
              <div><Label>{Z("频率","Frequency")}</Label>
                <Select value={form.frequency} onValueChange={v => setForm(p => ({ ...p, frequency: v, time_slots: resizeSlots(v, p.time_slots) }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{FREQUENCIES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <ScheduleRecurrenceFields
              frequency={form.frequency}
              interval={form.repeat_interval}
              weekdays={form.repeat_weekdays}
              onIntervalChange={(value) => setForm((p) => ({ ...p, repeat_interval: value === "" ? 1 : Number(value) }))}
              onWeekdaysChange={(repeat_weekdays) => setForm((p) => ({ ...p, repeat_weekdays }))}
              Z={Z}
            />
            <div>
              <div className="flex items-center justify-between"><Label>{Z("服药时间","Scheduled Times")}</Label><Button type="button" variant="ghost" size="sm" onClick={() => setForm(p => withSlots(p, [...p.time_slots, nextFreeTime(p.time_slots)]))} className="text-xs h-7"><Plus className="h-3 w-3 mr-1" /> {Z("添加时间","Add Time")}</Button></div>
              <div className="space-y-2 mt-1">
                {form.time_slots.map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Select value={slot} onValueChange={v => setForm(p => ({ ...p, time_slots: p.time_slots.map((t, i) => i === idx ? v : t) }))}>
                      <SelectTrigger><Clock className="h-4 w-4 mr-2 text-muted-foreground" /><SelectValue /></SelectTrigger>
                      <SelectContent>{SCHEDULE_TIMES.filter(t => t.value === slot || !form.time_slots.includes(t.value)).map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                    {form.time_slots.length > 1 && <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => setForm(p => withSlots(p, p.time_slots.filter((_, i) => i !== idx)))}><X className="h-3 w-3" /></Button>}
                  </div>
                ))}
              </div>
            </div>
            <CheckinModeField value={form.check_in_type} onChange={(check_in_type) => setForm((p) => ({ ...p, check_in_type }))} />
            <ScheduleCaregiverField caregivers={caregivers} value={form.assignee_ids} onChange={(assignee_ids) => setForm((p) => ({ ...p, assignee_ids }))} label={Z("负责用药核对的人", "People assigned to check doses")} />
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{Z("开始日期", "Start date")}</Label><Input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className="mt-1" /></div>
              <div><Label>{Z("结束日期", "End date")}</Label><Input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} className="mt-1" /></div>
            </div>
            <div><Label>{Z("备注","Notes")} <span className="text-muted-foreground text-xs">{Z("(可选)","(optional)")}</span></Label><Textarea value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder={Z("随餐服用、避免乳制品…","Take with food, avoid dairy…")} className="mt-1 min-h-[60px]" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{Z("库存数量","Stock count")} <span className="text-muted-foreground text-xs">{Z("(可选)","(optional)")}</span></Label><Input type="number" min="0" value={form.stock_count} onChange={e => setForm(p => ({ ...p, stock_count: e.target.value }))} placeholder="e.g. 30" className="mt-1" /></div>
              <div><Label>{Z("补药提醒阈值","Refill alert at")} <span className="text-muted-foreground text-xs">{Z("(可选)","(optional)")}</span></Label><Input type="number" min="0" value={form.refill_threshold} onChange={e => setForm(p => ({ ...p, refill_threshold: e.target.value }))} placeholder="e.g. 7" className="mt-1" /></div>
            </div>
            <div><Label>{Z("提前提醒(分钟)","Remind before (min)")}</Label><Input type="number" min="0" value={form.reminder_time_before} onChange={e => setForm(p => ({ ...p, reminder_time_before: e.target.value }))} className="mt-1" /></div>
            <div className="sticky bottom-0 -mx-6 flex gap-2 border-t bg-background px-6 py-3">
              <Button variant="outline" onClick={() => setAddOpen(false)}>{Z("取消","Cancel")}</Button>
              <Button className="flex-1" variant="coral" onClick={handleAdd} disabled={createMed.isPending || !form.name.trim() || form.check_in_type.length === 0}>
                {createMed.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} {Z("添加药品","Add Medicine")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Note Dialog */}
      <LogNoteDialog
        open={logDialog.open}
        onClose={() => setLogDialog({ open: false, med: null, action: "taken" })}
        onConfirm={confirmLog}
        medName={logDialog.med?.name || ""}
        action={logDialog.action}
        isPending={logMed.isPending}
      />

      {/* History Dialog */}
      <MedHistoryDialog open={!!historyMed} onClose={() => setHistoryMed(null)} med={historyMed} />

      {/* Edit Dialog */}
      {editMed && (
        <EditMedDialog
          open={!!editMed}
          onClose={() => setEditMed(null)}
          med={editMed}
          onDelete={() => {
            deleteMed.mutate(editMed.id, {
              onSuccess: () => { toast({ title: Z(`${editMed.name} 已删除`, `${editMed.name} deleted`) }); setEditMed(null); },
            });
          }}
        />
      )}

      {/* Content */}
      {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" /> : view === "timeline" ? (
        <div className="space-y-0">
          {!hasScheduledMeds ? (
            <div className="text-center py-12">
              <Pill className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-3">{Z("暂未安排药物","No medications scheduled yet") as any}</p>
              <Button variant="coral" size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> {Z("添加第一个药品","Add First Medicine")}</Button>
            </div>
          ) : TIMELINE_HOURS.map((hour) => {
            const medsAtTime = timelineMeds[hour];
            const hourNum = parseInt(hour.split(":")[0]!);
            const isCurrentHour = currentHour === hourNum;
            const isPast = hourNum < currentHour;
            if (!medsAtTime && !isCurrentHour) return null; // Hide empty non-current hours for cleaner view
            return (
              <div key={hour} className={`flex border-b border-border/30 ${isCurrentHour ? "bg-primary/5" : ""}`}>
                <div className={`w-14 sm:w-20 shrink-0 py-3 px-1 sm:px-2 text-xs font-medium ${isCurrentHour ? "text-primary font-semibold" : isPast ? "text-muted-foreground/60" : "text-muted-foreground"}`}>
                  {isCurrentHour && <div className="w-2 h-2 rounded-full bg-primary inline-block mr-1 animate-pulse" />}
                  {formatHour(hour)}
                </div>
                <div className="min-w-0 flex-1 py-2 pr-1 sm:px-2">
                  {medsAtTime ? (
                    <div className="space-y-2">
                      {medsAtTime.map(({ med, slot }) => (
                        <MedDoseCard
                          key={`${med.id}-${slot}`}
                          med={med}
                          todayLogs={todayLogs || []}
                          onLog={handleLog}
                          onEdit={setEditMed}
                          onDelete={(m: any) => deleteMed.mutateAsync(m.id)}
                          onHistory={setHistoryMed}
                          compact
                          slot={slot}
                        />
                      ))}
                    </div>
                  ) : isCurrentHour ? (
                    <p className="text-xs text-muted-foreground py-2 italic">{Z("此时段无药物","No meds at this time") as any}</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : view === "records" ? (
        <div className="space-y-2">
          {allLogsLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" />
          ) : (allLogs || []).length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">{Z("暂无服药记录","No dose records yet") as any}</p>
          ) : (
            (allLogs || []).map((log: any) => (
              <div key={log.id} className="flex items-start gap-3 rounded-xl border border-border/50 bg-card p-3">
                <div className={`mt-0.5 shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${log.status === "taken" ? "bg-success/15 text-success" : log.status === "skipped" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"}`}>
                  {log.status === "taken" ? <Check className="h-3.5 w-3.5" /> : log.status === "skipped" ? <SkipForward className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium break-words">{log.med_name || log.concept_display_text || Z("药品","Medicine")}</span>
                    <Badge variant="outline" className={`text-xs ${log.status === "taken" ? "border-success/40 text-success" : log.status === "skipped" ? "border-warning/40 text-warning" : "border-destructive/40 text-destructive"}`}>
                      {log.status === "taken" ? Z("已服用","Taken") : log.status === "skipped" ? Z("已跳过","Skipped") : Z("漏服","Missed")}
                    </Badge>
                    {log.logged_by_ai && <Badge variant="outline" className="text-xs border-primary/40 text-primary"><Bot className="mr-1 h-3 w-3" />AI</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {log.scheduled_date ? `${Z("计划","Scheduled")} ${formatDateTime(log.scheduled_date, i18n.language)} · ` : ""}{formatDate(log.created_at)} · {formatTime(log.created_at)}
                  </p>
                  {log.note && (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-start gap-1 break-words">
                      <StickyNote className="h-3 w-3 mt-0.5 shrink-0" />{log.note}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {(meds || []).map((med: any) => (
            <MedDoseCard
              key={med.id}
              med={med}
              todayLogs={todayLogs || []}
              onLog={handleLog}
              onEdit={setEditMed}
              onDelete={(m: any) => deleteMed.mutateAsync(m.id)}
              onHistory={setHistoryMed}
              manage
              slot={(med.time_slot && med.time_slot[0]) || undefined}
            />
          ))}
          {(meds || []).length === 0 && <p className="text-center py-8 text-muted-foreground">{Z("尚未添加药物","No medications added yet") as any}</p>}
        </div>
      )}
    </div>
  );
}
