import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardCheck } from "lucide-react";
import { useCheckinLogs, useCreateCheckinLog } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useSite } from "@/contexts/SiteContext";

interface CheckInsTabProps {
  groupCaredOnes: any[];
  activeGroupId: string | null;
}

export function CheckInsTab({ groupCaredOnes, activeGroupId }: CheckInsTabProps) {
  const { toast } = useToast();
  const site = useSite();
  const [selectedCaredOne, setSelectedCaredOne] = useState<string | null>(null);
  const activeCOId = selectedCaredOne || (groupCaredOnes.length > 0 ? groupCaredOnes[0].user_id : null);
  const { data: logs } = useCheckinLogs(activeCOId);
  const createCheckin = useCreateCheckinLog();
  const [form, setForm] = useState({ mood: "good", energy_level: 7, pain_level: 0, sleep_hours: 7, note: "" });

  const handleSubmit = () => {
    if (!activeCOId) return;
    createCheckin.mutate({ user_id: activeCOId, ...form, energy_level: Number(form.energy_level), pain_level: Number(form.pain_level), sleep_hours: Number(form.sleep_hours) }, {
      onSuccess: () => { setForm({ mood: "good", energy_level: 7, pain_level: 0, sleep_hours: 7, note: "" }); toast({ title: "Check-in recorded" }); },
    });
  };

  const moodEmoji: Record<string, string> = { great: "😊", good: "🙂", okay: "😐", poor: "😟", bad: "😢" };

  if (groupCaredOnes.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardCheck className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground mb-2">No cared ones to check in on.</p>
        <p className="text-sm text-muted-foreground">Go to the <strong>Cared Ones</strong> tab and add one first.</p>
      </div>
    );
  }

  return (
    <div>
      {groupCaredOnes.length > 1 && (
        <div className="flex gap-2 mb-4">
          {groupCaredOnes.map((co: any) => (
            <Badge key={co.user_id} variant={activeCOId === co.user_id ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedCaredOne(co.user_id)}>{co.profile?.full_name || site.caredOneSingular}</Badge>
          ))}
        </div>
      )}
      <Card className="border-transparent card-elevated mb-4">
        <CardHeader><CardTitle className="text-base">New Check-In for {groupCaredOnes.find((co: any) => co.user_id === activeCOId)?.profile?.full_name || site.caredOneSingular}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div><Label className="text-xs">Mood</Label>
              <Select value={form.mood} onValueChange={v => setForm(p => ({ ...p, mood: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["great", "good", "okay", "poor", "bad"].map(m => <SelectItem key={m} value={m}>{moodEmoji[m]} {m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Energy (1-10)</Label><Input type="number" min={1} max={10} value={form.energy_level} onChange={e => setForm(p => ({ ...p, energy_level: parseInt(e.target.value) || 0 }))} /></div>
            <div><Label className="text-xs">Pain (0-10)</Label><Input type="number" min={0} max={10} value={form.pain_level} onChange={e => setForm(p => ({ ...p, pain_level: parseInt(e.target.value) || 0 }))} /></div>
            <div><Label className="text-xs">Sleep (hrs)</Label><Input type="number" min={0} max={24} step={0.5} value={form.sleep_hours} onChange={e => setForm(p => ({ ...p, sleep_hours: parseFloat(e.target.value) || 0 }))} /></div>
          </div>
          <div><Label className="text-xs">Notes</Label><Input value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="Any observations..." /></div>
          <Button variant="coral" size="sm" onClick={handleSubmit} disabled={createCheckin.isPending}>Record Check-In</Button>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {(logs || []).map((l: any) => (
          <Card key={l.id} className="border-transparent card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">{moodEmoji[l.mood] || "🙂"} {l.mood || "Check-in"}</span>
                <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {l.energy_level != null && <span>Energy: {l.energy_level}/10</span>}
                {l.pain_level != null && <span>Pain: {l.pain_level}/10</span>}
                {l.sleep_hours != null && <span>Sleep: {l.sleep_hours}h</span>}
              </div>
              {l.note && <p className="text-sm text-muted-foreground mt-1">{l.note}</p>}
              {l.reporter && <p className="text-xs text-muted-foreground mt-1">by {l.reporter.full_name}</p>}
            </CardContent>
          </Card>
        ))}
        {(logs || []).length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No check-ins yet</p>}
      </div>
    </div>
  );
}
