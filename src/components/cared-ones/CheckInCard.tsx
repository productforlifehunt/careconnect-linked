import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ClipboardCheck, Plus, Loader2 } from "lucide-react";
import { useCheckinLogs, useCreateCheckinLog } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";

const MOODS = [
  { value: "great", emoji: "😊", label: "Great" },{ value: "good", emoji: "🙂", label: "Good" },
  { value: "okay", emoji: "😐", label: "Okay" },{ value: "poor", emoji: "😟", label: "Poor" },{ value: "bad", emoji: "😢", label: "Bad" },
];

export function CheckInCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: logs, isLoading } = useCheckinLogs(caredOneId);
  const create = useCreateCheckinLog();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ mood: "good", energy_level: 7, pain_level: 0, sleep_hours: 7, note: "" });

  const handleSubmit = () => {
    create.mutate({ user_id: caredOneId, ...form }, {
      onSuccess: () => { setForm({ mood: "good", energy_level: 7, pain_level: 0, sleep_hours: 7, note: "" }); setAddOpen(false); toast({ title: "Check-in recorded ✓" }); }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Daily Check-In</h2>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Check In</Button>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Check-In</DialogTitle>
            <DialogDescription>Log how they're feeling today</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div><Label className="text-sm font-medium mb-2 block">How are they feeling?</Label>
              <div className="flex gap-2">
                {MOODS.map(m => (
                  <button key={m.value} onClick={() => setForm(p => ({ ...p, mood: m.value }))}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border-2 transition-all ${form.mood === m.value ? "border-primary bg-primary/10" : "border-transparent bg-accent/50 hover:bg-accent"}`}>
                    <span className="text-2xl">{m.emoji}</span><span className="text-[10px] font-medium text-muted-foreground">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label className="text-xs text-muted-foreground">Energy Level</Label><div className="flex items-center gap-2 mt-1"><input type="range" min={1} max={10} value={form.energy_level} onChange={e => setForm(p => ({ ...p, energy_level: parseInt(e.target.value) }))} className="flex-1 accent-primary" /><span className="text-sm font-semibold text-foreground w-5 text-center">{form.energy_level}</span></div></div>
              <div><Label className="text-xs text-muted-foreground">Pain Level</Label><div className="flex items-center gap-2 mt-1"><input type="range" min={0} max={10} value={form.pain_level} onChange={e => setForm(p => ({ ...p, pain_level: parseInt(e.target.value) }))} className="flex-1 accent-destructive" /><span className="text-sm font-semibold text-foreground w-5 text-center">{form.pain_level}</span></div></div>
              <div><Label className="text-xs text-muted-foreground">Sleep (hrs)</Label><Input type="number" min={0} max={24} step={0.5} value={form.sleep_hours} onChange={e => setForm(p => ({ ...p, sleep_hours: parseFloat(e.target.value) || 0 }))} className="mt-1" /></div>
            </div>
            <div><Label className="text-xs text-muted-foreground">Notes</Label><Textarea value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="Any observations, symptoms, or changes..." rows={2} className="mt-1" /></div>
            <Button variant="coral" className="w-full" onClick={handleSubmit} disabled={create.isPending}>
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ClipboardCheck className="h-4 w-4 mr-2" />} Record Check-In
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" />
      ) : (logs || []).length === 0 ? (
        <div className="text-center py-12">
          <ClipboardCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">No check-ins yet</p>
          <Button variant="coral" size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> First Check-In</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {(logs || []).map((l: any) => (
            <Card key={l.id} className="border-transparent card-elevated">
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{MOODS.find(m => m.value === l.mood)?.emoji || "🙂"}</span>
                    <div><span className="text-sm font-medium text-foreground capitalize">{l.mood}</span>
                      <div className="flex gap-3 text-xs text-muted-foreground">{l.energy_level != null && <span>⚡ {l.energy_level}/10</span>}{l.pain_level != null && l.pain_level > 0 && <span>🩹 {l.pain_level}/10</span>}{l.sleep_hours != null && <span>😴 {l.sleep_hours}h</span>}</div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                </div>
                {l.note && <p className="text-xs text-muted-foreground mt-1 pl-9">{l.note}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
