import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActivityLog, useCreateActivityLog } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";

export function VisitLogCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: logs } = useActivityLog(caredOneId);
  const create = useCreateActivityLog();
  const [form, setForm] = useState({ activity_type: "in_person", description: "", duration_minutes: "" });

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Visit Log</h2>
      <Card className="border-transparent card-elevated mb-6"><CardContent className="p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Visit Type</Label>
            <Select value={form.activity_type} onValueChange={v => setForm(p => ({ ...p, activity_type: v }))}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="in_person">🏠 In-Person Visit</SelectItem>
                <SelectItem value="video">📹 Video Call</SelectItem>
                <SelectItem value="phone">📞 Phone Call</SelectItem>
                <SelectItem value="errand">🛒 Errand / Outing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Duration (minutes)</Label><Input type="number" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: e.target.value }))} placeholder="60" className="mt-1" /></div>
        </div>
        <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What happened during the visit?..." rows={3} />
        <Button variant="coral" className="w-full" onClick={() => {
          create.mutate({ cared_one_id: caredOneId, activity_type: form.activity_type, description: form.description || undefined, duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : undefined }, {
            onSuccess: () => { setForm({ activity_type: "in_person", description: "", duration_minutes: "" }); toast({ title: "Visit logged ✓" }); }
          });
        }} disabled={create.isPending}>Log Visit</Button>
      </CardContent></Card>
      <h3 className="text-sm font-semibold text-muted-foreground mb-2">History</h3>
      <div className="space-y-2">
        {(logs || []).map((l: any) => (
          <Card key={l.id} className="border-transparent card-elevated"><CardContent className="p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>{l.activity_type === "video" ? "📹" : l.activity_type === "phone" ? "📞" : l.activity_type === "errand" ? "🛒" : "🏠"}</span>
                <Badge variant="secondary" className="text-xs capitalize">{l.activity_type?.replace(/_/g, " ")}</Badge>
                {l.duration_minutes && <span className="text-xs text-muted-foreground">{l.duration_minutes} min</span>}
              </div>
              <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
            </div>
            {l.description && <p className="text-xs text-muted-foreground mt-1 pl-7">{l.description}</p>}
          </CardContent></Card>
        ))}
        {(logs || []).length === 0 && <p className="text-center py-8 text-muted-foreground">No visits logged yet</p>}
      </div>
    </div>
  );
}
