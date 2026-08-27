import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Pencil, Trash2, X, Check, Plus, FileText, Loader2 } from "lucide-react";
import { useCaredOneDocuments, useCreateCaredOneDocument, useUpdateCaredOneDocument, useDeleteCaredOneDocument } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { formatDate, formatTime, formatDateTime } from "@/lib/locale";

const DOC_VALUES = ["Medical Record", "Insurance", "Prescription", "Lab Result", "Legal", "ID", "Emergency Plan", "Other"];
const DOC_ZH: Record<string,string> = { "Medical Record":"病历", Insurance:"保险", Prescription:"处方", "Lab Result":"化验结果", Legal:"法律文件", ID:"身份证件", "Emergency Plan":"应急预案", Other:"其他" };

export function DocumentsCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const docLabel = (d: string) => isCN ? (DOC_ZH[d] || d) : d;

  const { data: docs, isLoading } = useCaredOneDocuments(caredOneId);
  const create = useCreateCaredOneDocument();
  const update = useUpdateCaredOneDocument();
  const del = useDeleteCaredOneDocument();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", document_type: "Medical Record", file_url: "", notes: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", document_type: "", file_url: "", notes: "" });

  const startEdit = (d: any) => { setEditId(d.id); setEditForm({ title: d.title || "", document_type: d.document_type || "Other", file_url: d.file_url || "", notes: d.notes || "" }); };
  const cancelEdit = () => setEditId(null);
  const saveEdit = () => {
    if (!editId || !editForm.title) return;
    update.mutate({ id: editId, title: editForm.title, document_type: editForm.document_type, file_url: editForm.file_url || undefined, notes: editForm.notes || undefined }, {
      onSuccess: () => { setEditId(null); toast({ title: Z("文件已更新", "Document updated") }); }
    });
  };

  const handleAdd = () => {
    if (!form.title) return;
    create.mutate({ user_id: caredOneId, title: form.title, document_type: form.document_type, file_url: form.file_url || "", description: form.notes || undefined }, {
      onSuccess: () => { setForm({ title: "", document_type: "Medical Record", file_url: "", notes: "" }); setAddOpen(false); toast({ title: Z("文件已添加", "Document added") }); }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">{Z("文件资料", "Documents")}</h2>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> {Z("添加", "Add")}</Button>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{Z("添加文件", "Add Document")}</DialogTitle>
            <DialogDescription>{Z("存储重要文件和记录", "Store important documents and records")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label>{Z("标题", "Title")} <span className="text-destructive">*</span></Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder={Z("文件标题", "Document title")} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{Z("类型", "Type")}</Label>
                <Select value={form.document_type} onValueChange={v => setForm(p => ({ ...p, document_type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{DOC_VALUES.map(t => <SelectItem key={t} value={t}>{docLabel(t)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>{Z("链接地址", "Link URL")}</Label><Input value={form.file_url} onChange={e => setForm(p => ({ ...p, file_url: e.target.value }))} placeholder="https://..." className="mt-1" /></div>
            </div>
            <div><Label>{Z("备注", "Notes")}</Label><Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder={Z("可选备注", "Optional notes")} className="mt-1" /></div>
            <Button variant="coral" className="w-full" onClick={handleAdd} disabled={create.isPending || !form.title}>
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} {Z("添加文件", "Add Document")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" />
      ) : (docs || []).length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">{Z("暂无文件", "No documents yet")}</p>
          <Button variant="coral" size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> {Z("添加第一个文件", "Add First Document")}</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {(docs || []).map((d: any) => (
            <Card key={d.id} className="border-transparent card-elevated">
              <CardContent className="p-4">
                {editId === d.id ? (
                  <div className="space-y-2">
                    <Input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} placeholder={Z("标题", "Title")} />
                    <div className="grid grid-cols-2 gap-2">
                      <Select value={editForm.document_type} onValueChange={v => setEditForm(p => ({ ...p, document_type: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{DOC_VALUES.map(t => <SelectItem key={t} value={t}>{docLabel(t)}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input value={editForm.file_url} onChange={e => setEditForm(p => ({ ...p, file_url: e.target.value }))} placeholder={Z("链接地址", "Link URL")} />
                    </div>
                    <Input value={editForm.notes} onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))} placeholder={Z("备注", "Notes")} />
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={cancelEdit}><X className="h-3.5 w-3.5 mr-1" /> {Z("取消", "Cancel")}</Button>
                      <Button variant="coral" size="sm" onClick={saveEdit} disabled={update.isPending}><Check className="h-3.5 w-3.5 mr-1" /> {Z("保存", "Save")}</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center gap-2">
                    <div className="min-w-0">
                      <h4 className="font-medium text-foreground text-sm">{d.title || d.file_name || Z("文件", "Document")}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[10px]">{docLabel(d.document_type || "Other")}</Badge>
                        <span className="text-[10px] text-muted-foreground">{formatDate(d.created_at, isCN ? "zh-CN" : undefined)}</span>
                      </div>
                      {d.notes && <p className="text-xs text-muted-foreground mt-0.5">{d.notes}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {d.file_url && <Button variant="outline" size="sm" asChild><a href={d.file_url} target="_blank" rel="noopener">{Z("查看", "View")}</a></Button>}
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(d)}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => del.mutate(d.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
