import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Pencil, Trash2, X, Check, Plus, FileText, Loader2 } from "lucide-react";
import { useCaredOneDocuments, useCreateCaredOneDocument, useUpdateCaredOneDocument, useDeleteCaredOneDocument } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/lib/locale";
import { MediaAttachments, MediaAttachmentList } from "@/components/shared/MediaAttachments";

/**
 * Cared one's care document — CCT 212 only:
 * a55 name, a56 content, a57 attachments (gallery).
 * Linked to the cared one through its JetEngine relation.
 */
export function DocumentsCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);

  const { data: docs, isLoading } = useCaredOneDocuments(caredOneId);
  const create = useCreateCaredOneDocument();
  const update = useUpdateCaredOneDocument();
  const del = useDeleteCaredOneDocument();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", attachment_ids: [] as number[] });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", attachment_ids: [] as number[] });

  const startEdit = (d: any) => {
    setEditId(d.id);
    setEditForm({
      title: d.title || "",
      description: d.description || "",
      attachment_ids: Array.isArray(d.attachment_ids) ? d.attachment_ids : [],
    });
  };
  const cancelEdit = () => setEditId(null);
  const saveEdit = () => {
    if (!editId || !editForm.title) return;
    update.mutate({ id: editId, title: editForm.title, description: editForm.description, attachment_ids: editForm.attachment_ids }, {
      onSuccess: () => { setEditId(null); toast({ title: Z("文件已更新", "Document updated") }); },
      onError: (e: any) => toast({ title: Z("保存失败", "Couldn't save"), description: e?.message, variant: "destructive" }),
    });
  };

  const handleAdd = () => {
    if (!form.title) return;
    create.mutate({ user_id: caredOneId, title: form.title, description: form.description || undefined, attachment_ids: form.attachment_ids }, {
      onSuccess: () => { setForm({ title: "", description: "", attachment_ids: [] }); setAddOpen(false); toast({ title: Z("文件已添加", "Document added") }); },
      onError: (e: any) => toast({ title: Z("添加失败", "Couldn't add"), description: e?.message, variant: "destructive" }),
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
            <div>
              <Label>{Z("附件（PDF / TXT / 图片）", "Attachments (PDF / TXT / images)")}</Label>
              <div className="mt-1">
                <MediaAttachments
                  value={form.attachment_ids}
                  onChange={(ids) => setForm(p => ({ ...p, attachment_ids: ids }))}
                  accept=".pdf,.txt,.doc,.docx,.xls,.xlsx,image/*"
                  label={Z("上传附件", "Upload files")}
                />
              </div>
            </div>
            <div><Label>{Z("说明", "Description")}</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder={Z("可选说明", "Optional description")} className="mt-1" /></div>
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
                    <Input value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} placeholder={Z("说明", "Description")} />
                    <MediaAttachments
                      value={editForm.attachment_ids}
                      onChange={(ids) => setEditForm(p => ({ ...p, attachment_ids: ids }))}
                      accept=".pdf,.txt,.doc,.docx,.xls,.xlsx,image/*"
                      label={Z("上传附件", "Upload files")}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={cancelEdit}><X className="h-3.5 w-3.5 mr-1" /> {Z("取消", "Cancel")}</Button>
                      <Button variant="coral" size="sm" onClick={saveEdit} disabled={update.isPending}><Check className="h-3.5 w-3.5 mr-1" /> {Z("保存", "Save")}</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center gap-2">
                    <div className="min-w-0">
                      <h4 className="font-medium text-foreground text-sm">{d.title || Z("文件", "Document")}</h4>
                      <span className="text-[10px] text-muted-foreground">{formatDate(d.created_at, isCN ? "zh-CN" : undefined)}</span>
                      {d.description && <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap">{d.description}</p>}
                      {Array.isArray(d.attachment_ids) && d.attachment_ids.length > 0 && <MediaAttachmentList ids={d.attachment_ids} />}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={Z("编辑文件", "Edit document")} onClick={() => startEdit(d)}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" aria-label={Z("删除文件", "Delete document")} onClick={() => del.mutate(d.id)}><Trash2 className="h-3 w-3" /></Button>
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
