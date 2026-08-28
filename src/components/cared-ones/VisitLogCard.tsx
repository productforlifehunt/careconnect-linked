import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Trash2, Plus, CalendarDays, Loader2, MapPin } from "lucide-react";
import { useVisitLog, useCreateVisitLog, useDeleteVisitLog } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/lib/locale";

/**
 * Visit Log — a logged visit is a completed Care Task of type "Visits"
 * (CCT 204, a57 = b59), linked to the cared one through REL 231.
 */
export function VisitLogCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);

  const { data: logs, isLoading } = useVisitLog(caredOneId);
  const create = useCreateVisitLog();
  const del = useDeleteVisitLog();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", location: "", duration_minutes: "", description: "" });

  const handleAdd = () => {
    create.mutate(
      {
        user_id: caredOneId,
        title: form.title || Z("探访", "Visit"),
        location: form.location || undefined,
        duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : undefined,
        description: form.description || undefined,
      },
      {
        onSuccess: () => {
          setForm({ title: "", location: "", duration_minutes: "", description: "" });
          setAddOpen(false);
          toast({ title: Z("探访已记录 ✓", "Visit logged ✓") });
        },
        onError: (e: any) => toast({ title: Z("记录失败", "Could not log visit"), description: String(e?.message || e), variant: "destructive" }),
      },
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">{Z("探访记录", "Visit Log")}</h2>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> {Z("记录探访", "Log Visit")}</Button>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{Z("记录一次探访", "Log a Visit")}</DialogTitle>
            <DialogDescription>{Z("记录一次已完成的探访", "Record a completed visit")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label>{Z("标题", "Title")}</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder={Z("下午探访", "Afternoon visit")} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{Z("地点", "Location")}</Label><Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder={Z("家中", "Home")} className="mt-1" /></div>
              <div><Label>{Z("时长（分钟）", "Duration (min)")}</Label><Input type="number" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: e.target.value }))} placeholder="60" className="mt-1" /></div>
            </div>
            <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder={Z("这次探访中发生了什么？……", "What happened during the visit?...")} rows={3} />
            <Button variant="coral" className="w-full" onClick={handleAdd} disabled={create.isPending}>
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} {Z("记录探访", "Log Visit")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" />
      ) : (logs || []).length === 0 ? (
        <div className="text-center py-12">
          <CalendarDays className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">{Z("还没有探访记录", "No visits logged yet")}</p>
          <Button variant="coral" size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> {Z("记录第一次探访", "Log First Visit")}</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {(logs || []).map((l: any) => (
            <Card key={l.id} className="border-transparent card-elevated">
              <CardContent className="p-4">
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span>🏠</span>
                    <span className="text-sm font-medium text-foreground truncate">{l.title || Z("探访", "Visit")}</span>
                    {l.location && <span className="text-xs text-muted-foreground flex items-center gap-0.5"><MapPin className="h-3 w-3" />{l.location}</span>}
                    {l.duration_minutes ? <span className="text-xs text-muted-foreground">{Z(`${l.duration_minutes} 分钟`, `${l.duration_minutes} min`)}</span> : null}
                    <span className="text-xs text-muted-foreground ml-auto">{formatDate(l.visited_at, isCN ? "zh-CN" : "en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
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
