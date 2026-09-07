import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Pill, Plus, Loader2, Trash2, Check, X, Clock, SkipForward, Edit2, History, TrendingUp, AlertCircle, ChevronDown, ChevronUp, StickyNote, Search } from "lucide-react";
import { useMedicines, useCreateMedicine, useDeleteMedicine, useLogMedicine, useUpdateMedicine, useTodayMedicineLogs, useMedicineLogs } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import i18n from "@/i18n/config";
const isCN = () => (i18n.language || "").startsWith("zh");
const Z = (cn: string, en: string) => (isCN() ? cn : en);
import { motion, AnimatePresence } from "framer-motion";
import { rxnormSuggest, rxnormLookup, type RxSuggestion } from "@/lib/rxnorm";
import { formatDate, formatTime as formatLocaleTime, formatDateTime } from "@/lib/locale";
import { useAIAssistant } from "@/contexts/AIAssistantContext";

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
].map(value => ({ value, label: hourLabel(parseInt(value.split(":")[0])) }));

const FREQUENCIES = [
  { value: "once_daily", label: Z("每日一次","Once daily") },{ value: "twice_daily", label: Z("每日两次","Twice daily") },
  { value: "three_daily", label: Z("每日三次","Three times daily") },{ value: "four_daily", label: Z("每日四次","Four times daily") },
  { value: "every_other_day", label: Z("隔日一次","Every other day") },{ value: "weekly", label: Z("每周一次","Weekly") },
  { value: "as_needed", label: Z("按需服用","As needed") },
];

/** Localized frequency label from the stored code (CCT 187 a66 RRULE + a95). */
function freqLabel(med: any): string {
  const code = med?.frequency_code || med?.frequency;
  return FREQUENCIES.find(f => f.value === code)?.label || med?.frequency || "";
}

function formatHour(h: string): string {
  return hourLabel(parseInt(h.split(":")[0]));
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
    const total = taken + skipped;
    const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;
    return { taken, skipped, total, adherence };
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
          <div className="grid grid-cols-3 gap-3 py-2">
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
                <div className={`mt-0.5 shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${log.status === "taken" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
                  {log.status === "taken" ? <Check className="h-3.5 w-3.5" /> : <SkipForward className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium capitalize">{log.status}</span>
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
  const [form, setForm] = useState({ name: "", dosage: "", rxcui: "", frequency: "once_daily", time_slots: ["08:00"] as string[], note: "", stock_count: "" as string | number, refill_threshold: "" as string | number, reminder_time_before: "0" as string | number, time_to_send_to_caregiver: "" as string | number, time_to_be_considered_missing: "" as string | number });

  // Populate form on open
  useState(() => {
    if (med && open) {
      const freqEntry = FREQUENCIES.find(f => f.value === (med.frequency_code || med.frequency)) || FREQUENCIES.find(f => f.label === med.frequency);
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
        time_to_send_to_caregiver: med.time_to_send_to_caregiver ?? "",
        time_to_be_considered_missing: med.time_to_be_considered_missing ?? "",
      });
    }
  });

  // Re-populate when med/open changes
  const populateForm = useCallback(() => {
    if (med) {
      const freqEntry = FREQUENCIES.find(f => f.value === (med.frequency_code || med.frequency)) || FREQUENCIES.find(f => f.label === med.frequency);
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
        time_to_send_to_caregiver: med.time_to_send_to_caregiver ?? "",
        time_to_be_considered_missing: med.time_to_be_considered_missing ?? "",
      });
    }
  }, [med]);

  const handleSave = () => {
    if (!form.name.trim()) return;
    updateMed.mutate({
      id: med.id,
      name: form.name.trim(),
      dosage: form.dosage || undefined,
      medication_concept_identifier: form.rxcui || undefined,
      frequency: FREQUENCIES.find(f => f.value === form.frequency)?.label || form.frequency,
      time_slot: form.time_slots,
      note: form.note || undefined,
      stock_count: form.stock_count === "" ? "" : Number(form.stock_count),
      refill_threshold: form.refill_threshold === "" ? "" : Number(form.refill_threshold),
      reminder_time_before: form.reminder_time_before === "" ? 0 : Number(form.reminder_time_before),
      time_to_send_to_caregiver: form.time_to_send_to_caregiver === "" ? null : Number(form.time_to_send_to_caregiver),
      time_to_be_considered_missing: form.time_to_be_considered_missing === "" ? null : Number(form.time_to_be_considered_missing),
    }, {
      onSuccess: () => { toast({ title: Z("药品已更新","Medicine updated") }); onClose(); },
      onError: (err) => toast({ title: Z("操作失败","Failed"), description: String(err.message), variant: "destructive" }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); else populateForm(); }}>
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
              <Select value={form.frequency} onValueChange={v => setForm(p => ({ ...p, frequency: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{FREQUENCIES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label>{Z("服药时间","Scheduled Times")}</Label>
              <Button type="button" variant="ghost" size="sm" onClick={() => setForm(p => ({ ...p, time_slots: [...p.time_slots, "12:00"] }))} className="text-xs h-7"><Plus className="h-3 w-3 mr-1" /> {Z("添加时间","Add Time")}</Button>
            </div>
            <div className="space-y-2 mt-1">
              {form.time_slots.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Select value={slot} onValueChange={v => setForm(p => ({ ...p, time_slots: p.time_slots.map((t, i) => i === idx ? v : t) }))}>
                    <SelectTrigger><Clock className="h-4 w-4 mr-2 text-muted-foreground" /><SelectValue /></SelectTrigger>
                    <SelectContent>{SCHEDULE_TIMES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                  {form.time_slots.length > 1 && <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => setForm(p => ({ ...p, time_slots: p.time_slots.filter((_, i) => i !== idx) }))}><X className="h-3 w-3" /></Button>}
                </div>
              ))}
            </div>
          </div>
          <div><Label>{Z("备注","Notes")}</Label><Textarea value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder={Z("用药说明、副作用…","Instructions, side effects…")} className="mt-1 min-h-[60px]" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>{Z("库存数量","Stock count")} <span className="text-muted-foreground text-xs">{Z("(剩余药片)","(pills left)")}</span></Label><Input type="number" min="0" value={form.stock_count} onChange={e => setForm(p => ({ ...p, stock_count: e.target.value }))} placeholder="e.g. 30" className="mt-1" /></div>
            <div><Label>{Z("补药提醒","Refill alert")} <span className="text-muted-foreground text-xs">{Z("(阈值)","(threshold)")}</span></Label><Input type="number" min="0" value={form.refill_threshold} onChange={e => setForm(p => ({ ...p, refill_threshold: e.target.value }))} placeholder="e.g. 7" className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div><Label>{Z("提前提醒(分钟)","Remind before (min)")}</Label><Input type="number" min="0" value={form.reminder_time_before} onChange={e => setForm(p => ({ ...p, reminder_time_before: e.target.value }))} className="mt-1" /></div>
              <div><Label>{Z("多久通知护理者(分钟)","Notify caregiver after (min)")}</Label><Input type="number" min="0" value={form.time_to_send_to_caregiver} onChange={e => setForm(p => ({ ...p, time_to_send_to_caregiver: e.target.value }))} className="mt-1" /></div>
              <div><Label>{Z("多久算漏服(分钟)","Count as missed after (min)")}</Label><Input type="number" min="0" value={form.time_to_be_considered_missing} onChange={e => setForm(p => ({ ...p, time_to_be_considered_missing: e.target.value }))} className="mt-1" /></div>
            </div>

          <div className="sticky bottom-0 -mx-6 flex gap-2 border-t bg-background px-6 py-3">
            <Button className="flex-1" onClick={handleSave} disabled={updateMed.isPending || !form.name.trim()}>
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
function MedDoseCard({ med, todayLogs, onLog, onEdit, onHistory, compact, slot }: {
  med: any;
  todayLogs: any[];
  onLog: (med: any, status: "taken" | "skipped" | "missed") => void;
  onEdit: (med: any) => void;
  onHistory: (med: any) => void;
  compact?: boolean;
  slot?: string;
}) {
  const isPRN = med.frequency_code === "as_needed" || med.frequency === "As needed" || med.frequency === "as_needed";
  const logForThisDose = todayLogs.find((l: any) => l.medicine_id === med.id);
  const isTaken = logForThisDose?.status === "taken";
  const isSkipped = logForThisDose?.status === "skipped";
  const isMissedLogged = logForThisDose?.status === "missed";
  const isDone = isTaken || isSkipped || isMissedLogged;

  // Auto-detect missed: scheduled slot >60min in the past, no log
  const isMissedAuto = useMemo(() => {
    if (isDone || isPRN || !slot) return false;
    const [h = "0", m = "0"] = slot.split(":");
    const slotMins = Number(h) * 60 + Number(m);
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return nowMins > slotMins + 60;
  }, [slot, isDone, isPRN]);

  return (
    <motion.div
      layout
      className={`flex items-center justify-between rounded-xl border p-3 transition-all ${
        isTaken ? "bg-success/5 border-success/30" :
        isSkipped ? "bg-warning/5 border-warning/30" :
        isMissedLogged ? "bg-destructive/5 border-destructive/30" :
        isMissedAuto ? "bg-destructive/5 border-destructive/40" :
        "bg-card border-border hover:border-primary/30"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
          isTaken ? "bg-success/15 text-success" :
          isSkipped ? "bg-warning/15 text-warning" :
          isMissedLogged || isMissedAuto ? "bg-destructive/15 text-destructive" :
          "bg-primary/10 text-primary"
        }`}>
          {isTaken ? <Check className="h-4 w-4" /> : isSkipped ? <SkipForward className="h-4 w-4" /> : (isMissedLogged || isMissedAuto) ? <AlertCircle className="h-4 w-4" /> : <Pill className="h-4 w-4" />}
        </div>
        <div className="min-w-0">
          <p className={`font-medium text-sm truncate ${isDone ? "line-through opacity-60" : "text-foreground"}`}>
            {med.name}
            {isPRN && <Badge variant="outline" className="ml-2 text-[10px] py-0 px-1.5 border-primary/40 text-primary">PRN</Badge>}
            {typeof med.stock_count === "number" && typeof med.refill_threshold === "number" && med.stock_count <= med.refill_threshold && (
              <Badge variant="outline" className="ml-2 text-[10px] py-0 px-1.5 border-destructive/40 text-destructive bg-destructive/5">
                <AlertCircle className="h-2.5 w-2.5 mr-0.5" />{Z(`库存低:剩 ${med.stock_count}`, `Low: ${med.stock_count} left`)}
              </Badge>
            )}
          </p>
          <p className="text-xs text-muted-foreground">{[med.dosage, freqLabel(med)].filter(Boolean).join(" · ")}</p>
          {logForThisDose?.note && (
            <p className="text-xs text-muted-foreground/80 mt-0.5 italic flex items-center gap-1">
              <StickyNote className="h-2.5 w-2.5" />{logForThisDose.note}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 ml-2">
        {isDone ? (
          <Badge variant="outline" className={`text-xs ${
            isTaken ? "border-success/40 text-success bg-success/10" :
            isSkipped ? "border-warning/40 text-warning bg-warning/10" :
            "border-destructive/40 text-destructive bg-destructive/10"
          }`}>
            {isTaken ? Z("✓ 已服用","✓ Taken") : isSkipped ? Z("⏭ 已跳过","⏭ Skipped") : Z("⚠ 漏服","⚠ Missed")}
            {logForThisDose?.created_at && <span className="ml-1 opacity-70">{formatTime(logForThisDose.created_at)}</span>}
          </Badge>
        ) : isPRN ? (
          <>
            <Button size="sm" className="h-8 text-xs bg-primary/15 text-primary hover:bg-primary/25 border-0" variant="outline"
              onClick={() => onLog(med, "taken")}><Plus className="h-3 w-3 mr-1" /> {Z("立即记录","Log dose now")}</Button>
          </>
        ) : (
          <>
            <Button size="sm" className="h-8 text-xs bg-success/15 text-success hover:bg-success/25 border-0" variant="outline"
              onClick={() => onLog(med, "taken")}><Check className="h-3 w-3 mr-1" /> {Z("已服用","Taken")}</Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs text-warning hover:bg-warning/10"
              onClick={() => onLog(med, "skipped")}><SkipForward className="h-3 w-3 mr-1" /> {Z("跳过","Skip")}</Button>
            {isMissedAuto && (
              <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive hover:bg-destructive/10"
                onClick={() => onLog(med, "missed")}><AlertCircle className="h-3 w-3 mr-1" /> {Z("漏服","Missed")}</Button>
            )}
          </>
        )}
        <Button size="icon" variant="ghost" aria-label={Z(`${med.name} 用药记录`, `${med.name} history`) as string} className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onHistory(med)}>
          <History className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="ghost" aria-label={Z(`编辑 ${med.name}`, `Edit ${med.name}`) as string} className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onEdit(med)}>
          <Edit2 className="h-3.5 w-3.5" />
        </Button>

      </div>
    </motion.div>
  );
}

// ─── RxNorm Autocomplete (NIH/NLM, free) ───────────────────
function RxNormNameInput({ value, onChange, onPick }: {
  value: string;
  onChange: (v: string) => void;
  onPick: (s: { name: string; strength?: string | null; doseForm?: string | null; rxcui?: string | null }) => void;
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
export function MedicineCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: meds, isLoading } = useMedicines(caredOneId);
  const { data: todayLogs } = useTodayMedicineLogs(caredOneId);
  const createMed = useCreateMedicine();
  const deleteMed = useDeleteMedicine();
  const logMed = useLogMedicine();
  const { openAssistant } = useAIAssistant();
  const autoOpenedDoseRef = useRef<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [view, setView] = useState<"timeline" | "list">("timeline");
  const [form, setForm] = useState({ name: "", dosage: "", rxcui: "", frequency: "once_daily", time_slots: ["08:00"] as string[], note: "", stock_count: "" as string | number, refill_threshold: "" as string | number, reminder_time_before: "0" as string | number, time_to_send_to_caregiver: "" as string | number, time_to_be_considered_missing: "" as string | number });
  const updateMed = useUpdateMedicine();

  // Dialogs
  const [logDialog, setLogDialog] = useState<{ open: boolean; med: any; action: "taken" | "skipped" | "missed" }>({ open: false, med: null, action: "taken" });
  const [historyMed, setHistoryMed] = useState<any>(null);
  const [editMed, setEditMed] = useState<any>(null);

  const handleLog = (med: any, status: "taken" | "skipped" | "missed") => {
    setLogDialog({ open: true, med, action: status });
  };

  const confirmLog = (note: string) => {
    const { med, action } = logDialog;
    logMed.mutate(
      {
        medicine_id: med.id,
        status: action,
        note: note || undefined,
        user_id: caredOneId,
        // Apple HKMedicationDoseEvent context, copied from the schedule row
        dose_quantity: med.dose_quantity ?? null,
        scheduled_dose_quantity: med.dose_quantity ?? null,
        dose_unit: med.dose_unit || null,
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

  const handleAdd = () => {
    if (!form.name.trim()) return;
    createMed.mutate(
      {
        user_id: caredOneId,
        name: form.name.trim(),
        dosage: form.dosage || undefined,
        frequency: FREQUENCIES.find(f => f.value === form.frequency)?.label || form.frequency,
        time_slot: form.time_slots.length > 0 ? form.time_slots : ["08:00"],
        note: form.note || undefined,
        stock_count: form.stock_count === "" ? undefined : Number(form.stock_count),
        refill_threshold: form.refill_threshold === "" ? undefined : Number(form.refill_threshold),
        reminder_time_before: form.reminder_time_before === "" ? 0 : Number(form.reminder_time_before),
        time_to_send_to_caregiver: form.time_to_send_to_caregiver === "" ? undefined : Number(form.time_to_send_to_caregiver),
        time_to_be_considered_missing: form.time_to_be_considered_missing === "" ? undefined : Number(form.time_to_be_considered_missing),
      },
      { onSuccess: () => { setForm({ name: "", dosage: "", rxcui: "", frequency: "once_daily", time_slots: ["08:00"], note: "", stock_count: "", refill_threshold: "", reminder_time_before: "0", time_to_send_to_caregiver: "", time_to_be_considered_missing: "" }); setAddOpen(false); toast({ title: Z("药品已添加","Medicine added") }); },
        onError: (err) => toast({ title: Z("添加失败","Failed to add"), description: String(err.message), variant: "destructive" }) }
    );
  };

  // Adherence summary
  const adherenceSummary = useMemo(() => {
    if (!meds || !todayLogs) return null;
    const totalSlots = (meds as any[]).reduce((sum, m) => sum + Math.max((m.time_slot || []).length, 1), 0);
    const logged = (todayLogs as any[]).length;
    const taken = (todayLogs as any[]).filter(l => l.status === "taken").length;
    const skipped = (todayLogs as any[]).filter(l => l.status === "skipped").length;
    const pending = totalSlots - logged;
    const pct = totalSlots > 0 ? Math.round((taken / totalSlots) * 100) : 0;
    return { totalSlots, taken, skipped, pending, pct };
  }, [meds, todayLogs]);

  // Timeline grouping
  const timelineMeds = useMemo(() => {
    if (!meds) return {};
    const grouped: Record<string, any[]> = {};
    (meds as any[]).forEach((med) => {
      const slots = med.time_slot || [];
      if (slots.length === 0) { if (!grouped["08:00"]) grouped["08:00"] = []; grouped["08:00"].push(med); }
      else { slots.forEach((slot: string) => { const t = slot.includes(":") ? slot.substring(0, 5) : "08:00"; if (!grouped[t]) grouped[t] = []; grouped[t].push(med); }); }
    });
    return grouped;
  }, [meds]);

  useEffect(() => {
    if (!meds || !todayLogs) return;
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const loggedMedicineIds = new Set((todayLogs as any[]).map((log) => String(log.medicine_id)));
    const due = (meds as any[]).flatMap((med) => {
      const slots: string[] = med.time_slot?.length ? med.time_slot : ["08:00"];
      return slots.map((slot) => ({ med, slot }));
    }).find(({ med, slot }) => {
      if (loggedMedicineIds.has(String(med.id)) || med.is_active === false) return false;
      const [hour = "0", minute = "0"] = String(slot).split(":");
      return nowMinutes >= Number(hour) * 60 + Number(minute);
    });
    if (!due) return;
    const key = `${now.toISOString().slice(0, 10)}-${due.med.id}-${due.slot}`;
    if (autoOpenedDoseRef.current === key) return;
    autoOpenedDoseRef.current = key;
    const dose = [due.med.name, due.med.dosage, due.slot].filter(Boolean).join(" · ");
    openAssistant({
      id: `medicine-${key}`,
      title: Z("用药提醒", "Medicine reminder"),
      contextPrompt: Z(`这是已从用药日程精确读取的本次提醒：${dose}。只确认本次是否服用或跳过，不更改剂量，不提供诊断。`, `This reminder was read directly from the medicine schedule: ${dose}. Confirm only whether this dose was taken or skipped; do not change dosage or diagnose.`),
      starterPrompt: Z(`现在提醒用户确认这次用药：${dose}。`, `Prompt the user to confirm this scheduled dose now: ${dose}.`),
      starterFallback: Z(`到了 ${due.med.name} 的用药时间。已经服用了吗？`, `It is time for ${due.med.name}. Has this dose been taken?`),
      completionStatuses: ["taken", "skipped"],
      onComplete: async ({ status, summary }) => {
        await logMed.mutateAsync({ medicine_id: due.med.id, status: status === "skipped" ? "skipped" : "taken", note: summary || undefined, user_id: caredOneId });
        toast({ title: status === "skipped" ? Z(`${due.med.name} 已跳过`, `${due.med.name} skipped`) : Z(`${due.med.name} 已记录服用`, `${due.med.name} recorded as taken`) });
      },
    });
  }, [meds, todayLogs, caredOneId]);

  const hasScheduledMeds = Object.keys(timelineMeds).length > 0;
  const currentHour = new Date().getHours();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">{Z("用药追踪","Medicine Tracker")}</h2>
        <div className="flex gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <button onClick={() => setView("timeline")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "timeline" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-accent"}`}>{Z("时间线","Timeline")}</button>
            <button onClick={() => setView("list")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-accent"}`}>{Z("列表","List")}</button>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> {Z("添加","Add")}</Button>
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
                  // RxNorm lookup only prefills name/strength — CCT 205 has no concept column.
                  setForm(p => ({ ...p, name, dosage: p.dosage || strength || "", rxcui: rxcui || "" }));
                }}
              />
              <p className="text-[10px] text-muted-foreground mt-1">{Z("由 RxNorm(NIH/NLM)提供 — 免费美国药品数据库","Powered by RxNorm (NIH/NLM) — free US drug database") as any}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{Z("剂量","Dosage")}</Label><Input value={form.dosage} onChange={e => setForm(p => ({ ...p, dosage: e.target.value }))} placeholder={Z("例如:10 毫克","e.g. 10mg")} className="mt-1" /></div>
              <div><Label>{Z("频率","Frequency")}</Label>
                <Select value={form.frequency} onValueChange={v => setForm(p => ({ ...p, frequency: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{FREQUENCIES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between"><Label>{Z("服药时间","Scheduled Times")}</Label><Button type="button" variant="ghost" size="sm" onClick={() => setForm(p => ({ ...p, time_slots: [...p.time_slots, "12:00"] }))} className="text-xs h-7"><Plus className="h-3 w-3 mr-1" /> {Z("添加时间","Add Time")}</Button></div>
              <div className="space-y-2 mt-1">
                {form.time_slots.map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Select value={slot} onValueChange={v => setForm(p => ({ ...p, time_slots: p.time_slots.map((t, i) => i === idx ? v : t) }))}>
                      <SelectTrigger><Clock className="h-4 w-4 mr-2 text-muted-foreground" /><SelectValue /></SelectTrigger>
                      <SelectContent>{SCHEDULE_TIMES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                    {form.time_slots.length > 1 && <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => setForm(p => ({ ...p, time_slots: p.time_slots.filter((_, i) => i !== idx) }))}><X className="h-3 w-3" /></Button>}
                  </div>
                ))}
              </div>
            </div>
            <div><Label>{Z("备注","Notes")} <span className="text-muted-foreground text-xs">{Z("(可选)","(optional)")}</span></Label><Textarea value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder={Z("随餐服用、避免乳制品…","Take with food, avoid dairy…")} className="mt-1 min-h-[60px]" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{Z("库存数量","Stock count")} <span className="text-muted-foreground text-xs">{Z("(可选)","(optional)")}</span></Label><Input type="number" min="0" value={form.stock_count} onChange={e => setForm(p => ({ ...p, stock_count: e.target.value }))} placeholder="e.g. 30" className="mt-1" /></div>
              <div><Label>{Z("补药提醒阈值","Refill alert at")} <span className="text-muted-foreground text-xs">{Z("(可选)","(optional)")}</span></Label><Input type="number" min="0" value={form.refill_threshold} onChange={e => setForm(p => ({ ...p, refill_threshold: e.target.value }))} placeholder="e.g. 7" className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div><Label>{Z("提前提醒(分钟)","Remind before (min)")}</Label><Input type="number" min="0" value={form.reminder_time_before} onChange={e => setForm(p => ({ ...p, reminder_time_before: e.target.value }))} className="mt-1" /></div>
              <div><Label>{Z("多久通知护理者(分钟)","Notify caregiver after (min)")}</Label><Input type="number" min="0" value={form.time_to_send_to_caregiver} onChange={e => setForm(p => ({ ...p, time_to_send_to_caregiver: e.target.value }))} className="mt-1" /></div>
              <div><Label>{Z("多久算漏服(分钟)","Count as missed after (min)")}</Label><Input type="number" min="0" value={form.time_to_be_considered_missing} onChange={e => setForm(p => ({ ...p, time_to_be_considered_missing: e.target.value }))} className="mt-1" /></div>
            </div>
            <div className="sticky bottom-0 -mx-6 flex gap-2 border-t bg-background px-6 py-3">
              <Button variant="outline" onClick={() => setAddOpen(false)}>{Z("取消","Cancel")}</Button>
              <Button className="flex-1" variant="coral" onClick={handleAdd} disabled={createMed.isPending || !form.name.trim()}>
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
            const hourNum = parseInt(hour.split(":")[0]);
            const isCurrentHour = currentHour === hourNum;
            const isPast = hourNum < currentHour;
            if (!medsAtTime && !isCurrentHour) return null; // Hide empty non-current hours for cleaner view
            return (
              <div key={hour} className={`flex border-b border-border/30 ${isCurrentHour ? "bg-primary/5" : ""}`}>
                <div className={`w-20 shrink-0 py-3 px-2 text-xs font-medium ${isCurrentHour ? "text-primary font-semibold" : isPast ? "text-muted-foreground/60" : "text-muted-foreground"}`}>
                  {isCurrentHour && <div className="w-2 h-2 rounded-full bg-primary inline-block mr-1 animate-pulse" />}
                  {formatHour(hour)}
                </div>
                <div className="flex-1 py-2 px-2">
                  {medsAtTime ? (
                    <div className="space-y-2">
                      {medsAtTime.map((med: any) => (
                        <MedDoseCard
                          key={med.id}
                          med={med}
                          todayLogs={todayLogs || []}
                          onLog={handleLog}
                          onEdit={setEditMed}
                          onHistory={setHistoryMed}
                          compact
                          slot={hour}
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
      ) : (
        <div className="space-y-2">
          {(meds || []).map((med: any) => (
            <MedDoseCard
              key={med.id}
              med={med}
              todayLogs={todayLogs || []}
              onLog={handleLog}
              onEdit={setEditMed}
              onHistory={setHistoryMed}
              slot={(med.time_slot && med.time_slot[0]) || undefined}
            />
          ))}
          {(meds || []).length === 0 && <p className="text-center py-8 text-muted-foreground">{Z("尚未添加药物","No medications added yet") as any}</p>}
        </div>
      )}
    </div>
  );
}
