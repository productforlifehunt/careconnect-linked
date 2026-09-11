import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, CalendarDays, Loader2, ChevronRight } from "lucide-react";
import { useVisitLog, useCreateVisitLog, useDeleteVisitLog } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/lib/locale";
import { RecordDetailDialog } from "./RecordDetailDialog";

/**
 * Visit Log — part of the check-in system. A logged visit is a check-in
 * entry with the details written in its note field.
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
  const [notes, setNotes] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const open = (logs || []).find((l: any) => String(l.id) === String(openId));

  const handleAdd = () => {
    create.mutate(
      { user_id: caredOneId, description: notes },
      {
        onSuccess: () => {
          setNotes("");
          setAddOpen(false);
          toast({ title: Z("探访已记录 ✓", "Visit saved ✓") });
        },
        onError: (e: any) => toast({ title: Z("没能保存这次探访", "Could not save this visit"), description: String(e?.message || e), variant: "destructive" }),
      },
    );
  };

  const when = (value: any, long = false) =>
    formatDate(value, isCN ? "zh-CN" : "en", long
      ? { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
      : { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">{Z("探访记录", "Visit Log")}</h2>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> {Z("记录探访", "Add a visit")}</Button>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{Z("记录一次探访", "Add a visit")}</DialogTitle>
            <DialogDescription>{Z("写下这次探访的情况，家人都能看到。", "Write down how the visit went. Everyone in the care circle can read it.")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={Z("例如：下午三点到家里，一起吃了水果，心情不错。", "For example: went over at 3pm, we had fruit together, good mood.")}
              rows={4}
            />
            <Button variant="coral" className="w-full" onClick={handleAdd} disabled={create.isPending || !notes.trim()}>
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} {Z("保存", "Save visit")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" />
      ) : (logs || []).length === 0 ? (
        <div className="text-center py-12">
          <CalendarDays className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">{Z("还没有探访记录", "No visits written down yet")}</p>
          <Button variant="coral" size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> {Z("记录第一次探访", "Add the first visit")}</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {(logs || []).map((l: any) => (
            <Card key={l.id} className="border-transparent card-elevated">
              <CardContent className="p-4">
                <button type="button" className="w-full text-left flex justify-between items-start gap-2" onClick={() => setOpenId(String(l.id))}>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-muted-foreground">{when(l.visited_at)}</span>
                    {l.description && <span className="block text-sm text-foreground mt-1 line-clamp-2">{l.description}</span>}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {open && (
        <RecordDetailDialog
          open={!!openId}
          onOpenChange={(v) => !v && setOpenId(null)}
          title={Z("探访记录", "Visit")}
          rows={[
            { label: Z("时间", "When"), value: when(open.visited_at, true) },
            { label: Z("情况", "What happened"), value: open.description },
          ]}
          onDelete={() => del.mutate(open.id, {
            onSuccess: () => { setOpenId(null); toast({ title: Z("记录已删除", "Visit deleted") }); },
            onError: (e: any) => toast({ title: Z("没能删除", "Couldn't delete"), description: e?.message, variant: "destructive" }),
          })}
          isDeleting={del.isPending}
        />
      )}
    </div>
  );
}
