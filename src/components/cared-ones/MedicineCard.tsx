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
import { motion, AnimatePresence } from "framer-motion";
import { rxnormSuggest, rxnormLookup, type RxSuggestion } from "@/lib/rxnorm";

const TIMELINE_HOURS = [
  "06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00",
  "16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00",
  "00:00","01:00","02:00","03:00","04:00","05:00",
];

const SCHEDULE_TIMES = [
  { value: "06:00", label: "6:00 AM" },{ value: "07:00", label: "7:00 AM" },{ value: "08:00", label: "8:00 AM" },
  { value: "09:00", label: "9:00 AM" },{ value: "10:00", label: "10:00 AM" },{ value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },{ value: "13:00", label: "1:00 PM" },{ value: "14:00", label: "2:00 PM" },
  { value: "15:00", label: "3:00 PM" },{ value: "16:00", label: "4:00 PM" },{ value: "17:00", label: "5:00 PM" },
  { value: "18:00", label: "6:00 PM" },{ value: "19:00", label: "7:00 PM" },{ value: "20:00", label: "8:00 PM" },
  { value: "21:00", label: "9:00 PM" },{ value: "22:00", label: "10:00 PM" },{ value: "23:00", label: "11:00 PM" },
];

const FREQUENCIES = [
  { value: "once_daily", label: "Once daily" },{ value: "twice_daily", label: "Twice daily" },
  { value: "three_daily", label: "Three times daily" },{ value: "four_daily", label: "Four times daily" },
  { value: "every_other_day", label: "Every other day" },{ value: "weekly", label: "Weekly" },
  { value: "as_needed", label: "As needed" },
];

function formatHour(h: string): string {
  const hour = parseInt(h.split(":")[0]);
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// ─── Log Note Dialog ────────────────────────────────────────
function LogNoteDialog({ open, onClose, onConfirm, medName, action, isPending }: {
  open: boolean; onClose: () => void; onConfirm: (note: string) => void;
  medName: string; action: "taken" | "skipped" | "missed"; isPending: boolean;
}) {
  const [note, setNote] = useState("");
  const titleMap = { taken: "Mark as Taken", skipped: "Skip Dose", missed: "Mark as Missed" };
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
          <DialogDescription>{medName} — add an optional note about this dose</DialogDescription>
        </DialogHeader>
        <Textarea
          value={note} onChange={e => setNote(e.target.value)}
          placeholder={action === "taken" ? "e.g. Taken with breakfast, felt fine…" : action === "skipped" ? "e.g. Out of stock, feeling nauseous…" : "e.g. Forgot, was sleeping…"}
          className="min-h-[80px]"
        />
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => { setNote(""); onClose(); }}>Cancel</Button>
          <Button
            variant={action === "taken" ? "default" : "outline"}
            className={action === "taken" ? "bg-success hover:bg-success/90 text-success-foreground" : action === "skipped" ? "border-warning text-warning hover:bg-warning/10" : "border-destructive text-destructive hover:bg-destructive/10"}
            onClick={() => { onConfirm(note); setNote(""); }}
            disabled={isPending}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Confirm
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
            {med?.name} — History
          </DialogTitle>
          <DialogDescription>{[med?.dosage, med?.frequency].filter(Boolean).join(" · ")}</DialogDescription>
        </DialogHeader>

        {/* Adherence Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 py-2">
            <div className="text-center p-3 rounded-xl bg-success/10 border border-success/20">
              <div className="text-2xl font-bold text-success">{stats.adherence}%</div>
              <div className="text-xs text-muted-foreground">Adherence</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-primary/10 border border-primary/20">
              <div className="text-2xl font-bold text-primary">{stats.taken}</div>
              <div className="text-xs text-muted-foreground">Taken</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-warning/10 border border-warning/20">
              <div className="text-2xl font-bold text-warning">{stats.skipped}</div>
              <div className="text-xs text-muted-foreground">Skipped</div>
            </div>
          </div>
        )}

        {/* Log list */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 -mr-1">
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground my-8" />
          ) : (logs || []).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No logs recorded yet</p>
          ) : (
            (logs || []).map((log: any) => (
              <div key={log.id} className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
                <div className={`mt-0.5 shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${log.status === "taken" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
                  {log.status === "taken" ? <Check className="h-3.5 w-3.5" /> : <SkipForward className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium capitalize">{log.status}</span>
                    <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleDateString()} · {formatTime(log.created_at)}</span>
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
  const [form, setForm] = useState({ name: "", dosage: "", frequency: "once_daily", time_slots: ["08:00"] as string[], note: "", stock_count: "" as string | number, refill_threshold: "" as string | number });

  // Populate form on open
  useState(() => {
    if (med && open) {
      const freqEntry = FREQUENCIES.find(f => f.label === med.frequency);
      setForm({
        name: med.name || "",
        dosage: med.dosage || "",
        frequency: freqEntry?.value || "once_daily",
        time_slots: med.time_slot?.length > 0 ? [...med.time_slot] : ["08:00"],
        note: med.note || "",
        stock_count: med.stock_count ?? "",
        refill_threshold: med.refill_threshold ?? "",
      });
    }
  });

  // Re-populate when med/open changes
  const populateForm = useCallback(() => {
    if (med) {
      const freqEntry = FREQUENCIES.find(f => f.label === med.frequency);
      setForm({
        name: med.name || "",
        dosage: med.dosage || "",
        frequency: freqEntry?.value || "once_daily",
        time_slots: med.time_slot?.length > 0 ? [...med.time_slot] : ["08:00"],
        note: med.note || "",
        stock_count: med.stock_count ?? "",
        refill_threshold: med.refill_threshold ?? "",
      });
    }
  }, [med]);

  const handleSave = () => {
    if (!form.name.trim()) return;
    updateMed.mutate({
      id: med.id,
      name: form.name.trim(),
      dosage: form.dosage || undefined,
      frequency: FREQUENCIES.find(f => f.value === form.frequency)?.label || form.frequency,
      time_slot: form.time_slots,
      note: form.note || undefined,
      stock_count: form.stock_count === "" ? "" : Number(form.stock_count),
      refill_threshold: form.refill_threshold === "" ? "" : Number(form.refill_threshold),
    }, {
      onSuccess: () => { toast({ title: "Medicine updated" }); onClose(); },
      onError: (err) => toast({ title: "Failed", description: String(err.message), variant: "destructive" }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); else populateForm(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Medicine</DialogTitle>
          <DialogDescription>Update medication details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div><Label>Medicine Name <span className="text-destructive">*</span></Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Dosage</Label><Input value={form.dosage} onChange={e => setForm(p => ({ ...p, dosage: e.target.value }))} placeholder="e.g. 10mg" className="mt-1" /></div>
            <div><Label>Frequency</Label>
              <Select value={form.frequency} onValueChange={v => setForm(p => ({ ...p, frequency: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{FREQUENCIES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label>Scheduled Times</Label>
              <Button type="button" variant="ghost" size="sm" onClick={() => setForm(p => ({ ...p, time_slots: [...p.time_slots, "12:00"] }))} className="text-xs h-7"><Plus className="h-3 w-3 mr-1" /> Add Time</Button>
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
          <div><Label>Notes</Label><Textarea value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="Instructions, side effects…" className="mt-1 min-h-[60px]" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Stock count <span className="text-muted-foreground text-xs">(pills left)</span></Label><Input type="number" min="0" value={form.stock_count} onChange={e => setForm(p => ({ ...p, stock_count: e.target.value }))} placeholder="e.g. 30" className="mt-1" /></div>
            <div><Label>Refill alert <span className="text-muted-foreground text-xs">(threshold)</span></Label><Input type="number" min="0" value={form.refill_threshold} onChange={e => setForm(p => ({ ...p, refill_threshold: e.target.value }))} placeholder="e.g. 7" className="mt-1" /></div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleSave} disabled={updateMed.isPending || !form.name.trim()}>
              {updateMed.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save Changes
            </Button>
            <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
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
  const isPRN = med.frequency === "As needed" || med.frequency === "as_needed";
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
                <AlertCircle className="h-2.5 w-2.5 mr-0.5" />Low: {med.stock_count} left
              </Badge>
            )}
          </p>
          <p className="text-xs text-muted-foreground">{[med.dosage, med.frequency].filter(Boolean).join(" · ")}</p>
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
            {isTaken ? "✓ Taken" : isSkipped ? "⏭ Skipped" : "⚠ Missed"}
            {logForThisDose?.created_at && <span className="ml-1 opacity-70">{formatTime(logForThisDose.created_at)}</span>}
          </Badge>
        ) : isPRN ? (
          <>
            <Button size="sm" className="h-8 text-xs bg-primary/15 text-primary hover:bg-primary/25 border-0" variant="outline"
              onClick={() => onLog(med, "taken")}><Plus className="h-3 w-3 mr-1" /> Log dose now</Button>
          </>
        ) : (
          <>
            <Button size="sm" className="h-8 text-xs bg-success/15 text-success hover:bg-success/25 border-0" variant="outline"
              onClick={() => onLog(med, "taken")}><Check className="h-3 w-3 mr-1" /> Taken</Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs text-warning hover:bg-warning/10"
              onClick={() => onLog(med, "skipped")}><SkipForward className="h-3 w-3 mr-1" /> Skip</Button>
            {isMissedAuto && (
              <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive hover:bg-destructive/10"
                onClick={() => onLog(med, "missed")}><AlertCircle className="h-3 w-3 mr-1" /> Missed</Button>
            )}
          </>
        )}
        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onHistory(med)}>
          <History className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onEdit(med)}>
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
  onPick: (s: { name: string; strength?: string | null; doseForm?: string | null }) => void;
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
    onPick({ name, strength: info.strength, doseForm: info.doseForm });
  };

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Input
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Type to search (e.g. Lisinopril)"
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

  const [addOpen, setAddOpen] = useState(false);
  const [view, setView] = useState<"timeline" | "list">("timeline");
  const [form, setForm] = useState({ name: "", dosage: "", frequency: "once_daily", time_slots: ["08:00"] as string[], note: "", stock_count: "" as string | number, refill_threshold: "" as string | number });
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
      { medicine_id: med.id, status: action, note: note || undefined, user_id: caredOneId },
      {
        onSuccess: () => {
          // Decrement stock on "taken"
          if (action === "taken" && typeof med.stock_count === "number" && med.stock_count > 0) {
            const newStock = med.stock_count - 1;
            updateMed.mutate({ id: med.id, stock_count: newStock });
            if (typeof med.refill_threshold === "number" && newStock <= med.refill_threshold) {
              toast({ title: `Low stock: ${med.name}`, description: `${newStock} doses left — time to refill`, variant: "destructive" });
            }
          }
          toast({ title: action === "taken" ? `${med.name} marked as taken ✓` : action === "skipped" ? `${med.name} skipped` : `${med.name} marked as missed` });
          setLogDialog({ open: false, med: null, action: "taken" });
        },
        onError: (err) => toast({ title: "Failed", description: String(err.message), variant: "destructive" }),
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
      },
      { onSuccess: () => { setForm({ name: "", dosage: "", frequency: "once_daily", time_slots: ["08:00"], note: "", stock_count: "", refill_threshold: "" }); setAddOpen(false); toast({ title: "Medicine added" }); },
        onError: (err) => toast({ title: "Failed to add", description: String(err.message), variant: "destructive" }) }
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

  const hasScheduledMeds = Object.keys(timelineMeds).length > 0;
  const currentHour = new Date().getHours();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Medicine Tracker</h2>
        <div className="flex gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <button onClick={() => setView("timeline")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "timeline" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-accent"}`}>Timeline</button>
            <button onClick={() => setView("list")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-accent"}`}>List</button>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </div>
      </div>

      {/* Today's Adherence Bar */}
      {adherenceSummary && adherenceSummary.totalSlots > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-muted/50 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> Today's Progress
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
            <span className="flex items-center gap-1"><Check className="h-3 w-3 text-success" /> {adherenceSummary.taken} taken</span>
            <span className="flex items-center gap-1"><SkipForward className="h-3 w-3 text-warning" /> {adherenceSummary.skipped} skipped</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {adherenceSummary.pending} pending</span>
          </div>
        </div>
      )}

      {/* Add Medicine Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Medicine</DialogTitle><DialogDescription>Add a medication to the daily schedule</DialogDescription></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label>Medicine Name <span className="text-destructive">*</span></Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Lisinopril, Aspirin" className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Dosage</Label><Input value={form.dosage} onChange={e => setForm(p => ({ ...p, dosage: e.target.value }))} placeholder="e.g. 10mg" className="mt-1" /></div>
              <div><Label>Frequency</Label>
                <Select value={form.frequency} onValueChange={v => setForm(p => ({ ...p, frequency: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{FREQUENCIES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between"><Label>Scheduled Times</Label><Button type="button" variant="ghost" size="sm" onClick={() => setForm(p => ({ ...p, time_slots: [...p.time_slots, "12:00"] }))} className="text-xs h-7"><Plus className="h-3 w-3 mr-1" /> Add Time</Button></div>
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
            <div><Label>Notes <span className="text-muted-foreground text-xs">(optional)</span></Label><Textarea value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="Take with food, avoid dairy…" className="mt-1 min-h-[60px]" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Stock count <span className="text-muted-foreground text-xs">(optional)</span></Label><Input type="number" min="0" value={form.stock_count} onChange={e => setForm(p => ({ ...p, stock_count: e.target.value }))} placeholder="e.g. 30" className="mt-1" /></div>
              <div><Label>Refill alert at <span className="text-muted-foreground text-xs">(optional)</span></Label><Input type="number" min="0" value={form.refill_threshold} onChange={e => setForm(p => ({ ...p, refill_threshold: e.target.value }))} placeholder="e.g. 7" className="mt-1" /></div>
            </div>
            <Button className="w-full" variant="coral" onClick={handleAdd} disabled={createMed.isPending || !form.name.trim()}>
              {createMed.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} Add Medicine
            </Button>
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
              onSuccess: () => { toast({ title: `${editMed.name} deleted` }); setEditMed(null); },
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
              <p className="text-muted-foreground mb-3">No medications scheduled yet</p>
              <Button variant="coral" size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add First Medicine</Button>
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
                    <p className="text-xs text-muted-foreground py-2 italic">No meds at this time</p>
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
          {(meds || []).length === 0 && <p className="text-center py-8 text-muted-foreground">No medications added yet</p>}
        </div>
      )}
    </div>
  );
}
