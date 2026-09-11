import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, Check, Plus, StickyNote, Loader2, ChevronRight } from "lucide-react";
import { useCareNotes, useCreateCareNote, useUpdateCareNote, useDeleteCareNote } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/lib/locale";
import { RecordDetailDialog } from "./RecordDetailDialog";

// Backend (CCT 197 "Cared one's care note") stores ONLY a55 Title and a56 Content.
// There is no category column — never collect or send one.
export function NotesCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const { data: notes, isLoading } = useCareNotes(caredOneId);
  const create = useCreateCareNote();
  const update = useUpdateCareNote();
  const del = useDeleteCareNote();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", content: "" });
  const [openId, setOpenId] = useState<string | null>(null);
  const open = (notes || []).find((n: any) => String(n.id) === String(openId));

  const startEdit = (n: any) => { setOpenId(null); setEditId(n.id); setEditForm({ title: n.title || "", content: n.content }); };
  const cancelEdit = () => setEditId(null);
  const saveEdit = () => {
    if (!editId || !editForm.content) return;
    update.mutate({ id: editId, title: editForm.title || undefined, content: editForm.content }, {
      onSuccess: () => { setEditId(null); toast({ title: Z("笔记已更新", "Note updated") }); }
    });
  };

  const handleAdd = () => {
    if (!form.content) return;
    create.mutate({ user_id: caredOneId, title: form.title || undefined, content: form.content }, {
      onSuccess: () => { setForm({ title: "", content: "" }); setAddOpen(false); toast({ title: Z("笔记已保存 ✓", "Note saved ✓") }); }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">{Z("护理笔记", "Care Notes")}</h2>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> {Z("添加", "Add")}</Button>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{Z("添加护理笔记", "Add Care Note")}</DialogTitle>
            <DialogDescription>{Z("记录观察、指示或任何相关信息", "Record observations, instructions, or anything relevant")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder={Z("笔记标题（可选）", "Note title (optional)")} />
            <Textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder={Z("写下观察、指示或任何相关内容……", "Write observations, instructions, or anything relevant...")} rows={4} />
            <Button variant="coral" className="w-full" onClick={handleAdd} disabled={create.isPending || !form.content}>
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} {Z("保存笔记", "Save Note")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" />
      ) : (notes || []).length === 0 ? (
        <div className="text-center py-12">
          <StickyNote className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">{Z("还没有笔记", "No notes yet")}</p>
          <Button variant="coral" size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> {Z("添加第一条", "Add First Note")}</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {(notes || []).map((n: any) => (
            <Card key={n.id} className="border-transparent card-elevated">
              <CardContent className="p-4">
                {editId === n.id ? (
                  <div className="space-y-2">
                    <Input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} placeholder={Z("标题（可选）", "Title (optional)")} />
                    <Textarea value={editForm.content} onChange={e => setEditForm(p => ({ ...p, content: e.target.value }))} rows={4} />
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={cancelEdit}><X className="h-3.5 w-3.5 mr-1" /> {Z("取消", "Cancel")}</Button>
                      <Button variant="coral" size="sm" onClick={saveEdit} disabled={update.isPending}><Check className="h-3.5 w-3.5 mr-1" /> {Z("保存", "Save")}</Button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="w-full text-left flex justify-between items-start gap-2" onClick={() => setOpenId(String(n.id))}>
                    <span className="min-w-0">
                      {n.title && <span className="block font-medium text-foreground text-sm">{n.title}</span>}
                      <span className="block text-xs text-muted-foreground line-clamp-2">{n.content}</span>
                      <span className="block text-[10px] text-muted-foreground mt-1">{formatDate(n.created_at, isCN ? "zh-CN" : "en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  </button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {open && (
        <RecordDetailDialog
          open={!!openId}
          onOpenChange={(v) => !v && setOpenId(null)}
          title={open.title || Z("护理笔记", "Care note")}
          rows={[
            { label: Z("内容", "Content"), value: open.content },
            { label: Z("记录时间", "Written"), value: open.created_at ? formatDate(open.created_at, isCN ? "zh-CN" : "en", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : undefined },
          ]}
          onEdit={() => startEdit(open)}
          onDelete={() => del.mutate(open.id, {
            onSuccess: () => { setOpenId(null); toast({ title: Z("笔记已删除", "Note deleted") }); },
            onError: (e: any) => toast({ title: Z("没能删除", "Couldn't delete"), description: e?.message, variant: "destructive" }),
          })}
          isDeleting={del.isPending}
        />
      )}
    </div>
  );
}
