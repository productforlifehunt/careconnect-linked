import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Trash2, Plus, CalendarDays, Loader2 } from "lucide-react";
import { useActivityLog, useCreateActivityLog, useDeleteActivityLog } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";

const VISIT_TYPES = [
  { value: "in_person", label: "🏠 In-Person Visit" },
  { value: "video", label: "📹 Video Call" },
  { value: "phone", label: "📞 Phone Call" },
  { value: "errand", label: "🛒 Errand / Outing" },
];
const emojiMap: Record<string, string> = { video: "📹", phone: "📞", errand: "🛒", in_person: "🏠" };

export function VisitLogCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: logs, isLoading } = useActivityLog(caredOneId);
  const create = useCreateActivityLog();
  const del = useDeleteActivityLog();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ activity_type: "in_person", description: "", duration_minutes: "" });

  const handleAdd = () => {
    create.mutate({ user_id: caredOneId, activity_type: form.activity_type, description: form.description || undefined, duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : undefined }, {
      onSuccess: () => { setForm({ activity_type: "in_person", description: "", duration_minutes: "" }); setAddOpen(false); toast({ title: "Visit logged ✓" }); }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Visit Log</h2>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Log Visit</Button>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log a Visit</DialogTitle>
            <DialogDescription>Record a visit, call, or outing</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Visit Type</Label>
                <Select value={form.activity_type} onValueChange={v => setForm(p => ({ ...p, activity_type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{VISIT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Duration (min)</Label><Input type="number" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: e.target.value }))} placeholder="60" className="mt-1" /></div>
            </div>
            <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What happened during the visit?..." rows={3} />
            <Button variant="coral" className="w-full" onClick={handleAdd} disabled={create.isPending}>
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} Log Visit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" />
      ) : (logs || []).length === 0 ? (
        <div className="text-center py-12">
          <CalendarDays className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">No visits logged yet</p>
          <Button variant="coral" size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Log First Visit</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {(logs || []).map((l: any) => (
            <Card key={l.id} className="border-transparent card-elevated">
              <CardContent className="p-4">
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span>{emojiMap[l.activity_type] || "🏠"}</span>
                    <Badge variant="secondary" className="text-xs capitalize">{l.activity_type?.replace(/_/g, " ")}</Badge>
                    {l.duration_minutes && <span className="text-xs text-muted-foreground">{l.duration_minutes} min</span>}
                    <span className="text-xs text-muted-foreground ml-auto">{new Date(l.created_at).toLocaleDateString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={() => del.mutate(l.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
                {l.description && <p className="text-xs text-muted-foreground mt-1 pl-7">{l.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
