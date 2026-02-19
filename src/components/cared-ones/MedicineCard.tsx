import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Pill, Plus, Loader2, Trash2, Check, X, Clock, SkipForward } from "lucide-react";
import { useMedicines, useCreateMedicine, useDeleteMedicine, useLogMedicine } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";

const TIMELINE_HOURS = [
  "08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00",
  "16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00",
  "00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00",
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

export function MedicineCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: meds, isLoading } = useMedicines(caredOneId);
  const createMed = useCreateMedicine();
  const deleteMed = useDeleteMedicine();
  const logMed = useLogMedicine();
  const [addOpen, setAddOpen] = useState(false);
  const [view, setView] = useState<"timeline" | "list">("timeline");
  const [form, setForm] = useState({ name: "", dosage: "", frequency: "once_daily", time_slots: ["08:00"] as string[], note: "" });

  const addTimeSlot = () => setForm(p => ({ ...p, time_slots: [...p.time_slots, "12:00"] }));
  const removeTimeSlot = (idx: number) => setForm(p => ({ ...p, time_slots: p.time_slots.filter((_, i) => i !== idx) }));
  const updateTimeSlot = (idx: number, val: string) => setForm(p => ({ ...p, time_slots: p.time_slots.map((t, i) => i === idx ? val : t) }));

  const handleAdd = () => {
    if (!form.name.trim()) return;
    createMed.mutate(
      { user_id: caredOneId, name: form.name.trim(), dosage: form.dosage || undefined, frequency: FREQUENCIES.find(f => f.value === form.frequency)?.label || form.frequency, time_slot: form.time_slots.length > 0 ? form.time_slots : ["08:00"], note: form.note || undefined },
      { onSuccess: () => { setForm({ name: "", dosage: "", frequency: "once_daily", time_slots: ["08:00"], note: "" }); setAddOpen(false); toast({ title: "Medicine added" }); },
        onError: (err) => toast({ title: "Failed to add", description: String(err.message), variant: "destructive" }) }
    );
  };

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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Medicine Tracker</h2>
        <div className="flex gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <button onClick={() => setView("timeline")} className={`px-3 py-1.5 text-xs font-medium ${view === "timeline" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-accent"}`}>Timeline</button>
            <button onClick={() => setView("list")} className={`px-3 py-1.5 text-xs font-medium ${view === "list" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-accent"}`}>List</button>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </div>
      </div>

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
              <div className="flex items-center justify-between"><Label>Scheduled Times</Label><Button type="button" variant="ghost" size="sm" onClick={addTimeSlot} className="text-xs h-7"><Plus className="h-3 w-3 mr-1" /> Add Time</Button></div>
              <div className="space-y-2 mt-1">
                {form.time_slots.map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Select value={slot} onValueChange={v => updateTimeSlot(idx, v)}>
                      <SelectTrigger><Clock className="h-4 w-4 mr-2 text-muted-foreground" /><SelectValue /></SelectTrigger>
                      <SelectContent>{SCHEDULE_TIMES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                    {form.time_slots.length > 1 && <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeTimeSlot(idx)}><X className="h-3 w-3" /></Button>}
                  </div>
                ))}
              </div>
            </div>
            <div><Label>Notes <span className="text-muted-foreground text-xs">(optional)</span></Label><Input value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="Take with food..." className="mt-1" /></div>
            <Button className="w-full" variant="coral" onClick={handleAdd} disabled={createMed.isPending || !form.name.trim()}>
              {createMed.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} Add Medicine
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" /> : view === "timeline" ? (
        <div className="space-y-0">
          {!hasScheduledMeds ? (
            <div className="text-center py-12"><Pill className="h-10 w-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground mb-3">No medications scheduled yet</p><Button variant="coral" size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add First Medicine</Button></div>
          ) : TIMELINE_HOURS.map((hour) => {
            const medsAtTime = timelineMeds[hour];
            const isCurrentHour = new Date().getHours() === parseInt(hour.split(":")[0]);
            return (
              <div key={hour} className={`flex border-b border-border/50 ${isCurrentHour ? "bg-primary/5" : ""}`}>
                <div className={`w-20 shrink-0 py-3 px-2 text-xs font-medium ${isCurrentHour ? "text-primary" : "text-muted-foreground"} ${medsAtTime ? "" : "opacity-40"}`}>
                  {isCurrentHour && <div className="w-2 h-2 rounded-full bg-primary inline-block mr-1" />}{formatHour(hour)}
                </div>
                <div className="flex-1 py-2 px-2">
                  {medsAtTime && <div className="space-y-2">
                    {medsAtTime.map((med: any) => (
                      <div key={med.id} className="flex items-center justify-between bg-card rounded-lg border p-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Pill className="h-4 w-4 text-primary shrink-0" />
                          <div className="min-w-0"><p className="font-medium text-foreground text-sm truncate">{med.name}</p><p className="text-xs text-muted-foreground">{[med.dosage, med.frequency].filter(Boolean).join(" · ")}</p></div>
                        </div>
                        <div className="flex gap-1.5 shrink-0 ml-2">
                          <Button size="sm" variant="outline" className="h-8 text-xs border-success/30 text-success hover:bg-success/10" onClick={() => logMed.mutate({ medicine_id: med.id, status: "taken", user_id: caredOneId }, { onSuccess: () => toast({ title: `${med.name} marked as taken ✓` }) })}><Check className="h-3 w-3 mr-1" /> Taken</Button>
                          <Button size="sm" variant="ghost" className="h-8 text-xs text-warning hover:bg-warning/10" onClick={() => logMed.mutate({ medicine_id: med.id, status: "skipped", user_id: caredOneId }, { onSuccess: () => toast({ title: `${med.name} skipped` }) })}><SkipForward className="h-3 w-3 mr-1" /> Skip</Button>
                        </div>
                      </div>
                    ))}
                  </div>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {(meds || []).map((med: any) => (
            <Card key={med.id} className="border-transparent card-elevated"><CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground">{med.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{[med.dosage, med.frequency, ...(med.time_slot || []).map((t: string) => SCHEDULE_TIMES.find(s => s.value === t)?.label || t)].filter(Boolean).join(" · ")}</p>
                  {med.note && <p className="text-xs text-muted-foreground mt-1 italic">{med.note}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="outline" className="border-success/30 text-success hover:bg-success/10" onClick={() => logMed.mutate({ medicine_id: med.id, status: "taken", user_id: caredOneId }, { onSuccess: () => toast({ title: "Taken ✓" }) })}><Check className="h-3 w-3 mr-1" /> Taken</Button>
                  <Button size="sm" variant="ghost" className="text-warning hover:bg-warning/10" onClick={() => logMed.mutate({ medicine_id: med.id, status: "skipped", user_id: caredOneId }, { onSuccess: () => toast({ title: "Skipped" }) })}>Skip</Button>
                  <Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => deleteMed.mutate(med.id, { onSuccess: () => toast({ title: `${med.name} deleted` }) })}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </CardContent></Card>
          ))}
          {(meds || []).length === 0 && <p className="text-center py-8 text-muted-foreground">No medications added yet</p>}
        </div>
      )}
    </div>
  );
}
