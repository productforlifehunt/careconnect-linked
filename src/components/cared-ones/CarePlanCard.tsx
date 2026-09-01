import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Check, Pencil, Trash2, X, ClipboardList, Loader2 } from "lucide-react";
import { useCarePlans, useCreateCarePlan, useUpdateCarePlan, useDeleteCarePlan } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

function useZ() {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  return { isCN, Z: (cn: string, en: string) => (isCN ? cn : en) };
}

export function CarePlanCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { Z } = useZ();
  const { data: plans, isLoading } = useCarePlans(caredOneId);
  const create = useCreateCarePlan();
  const update = useUpdateCarePlan();
  const del = useDeleteCarePlan();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });

  const startEdit = (p: any) => { setEditId(p.id); setEditForm({ title: p.title, description: p.description || "" }); };
  const cancelEdit = () => setEditId(null);
  const saveEdit = () => {
    if (!editId || !editForm.title) return;
    update.mutate({ id: editId, title: editForm.title, description: editForm.description || undefined }, {
      onSuccess: () => { setEditId(null); toast({ title: Z("方案已更新", "Plan updated") }); }
    });
  };

  const handleAdd = () => {
    if (!form.title) return;
    create.mutate({ user_id: caredOneId, title: form.title, description: form.description || undefined }, {
      onSuccess: () => { setForm({ title: "", description: "" }); setAddOpen(false); toast({ title: Z("方案已创建", "Plan created") }); }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">{Z("护理方案", "Care Plans")}</h2>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> {Z("添加", "Add")}</Button>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{Z("创建护理方案", "Create Care Plan")}</DialogTitle>
            <DialogDescription>{Z("制定护理方案并设定目标来追踪进展", "Define a care plan with goals to track progress")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="plan-title">{Z("方案名称", "Plan name")}</Label>
              <Input id="plan-title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder={Z("例如:每日活动安排", "e.g. Daily activity routine")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plan-detail">{Z("方案内容", "Plan details")}</Label>
              <Textarea id="plan-detail" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder={Z("要做什么、什么时候做、由谁来做…", "What to do, when, and who helps...")} rows={3} />
            </div>
            <Button variant="coral" className="w-full" onClick={handleAdd} disabled={create.isPending || !form.title}>
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} {Z("创建方案", "Create Plan")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" />
      ) : (plans || []).length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">{Z("暂无护理方案", "No care plans yet")}</p>
          <Button variant="coral" size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> {Z("添加第一个方案", "Add First Plan")}</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {(plans || []).map((p: any) => (
            <Card key={p.id} className="border-transparent card-elevated">
              <CardContent className="p-4">
                {editId === p.id ? (
                  <div className="space-y-2">
                    <Input value={editForm.title} onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))} placeholder={Z("方案名称", "Plan title")} />
                    <Textarea value={editForm.description} onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))} rows={2} />
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={cancelEdit}><X className="h-3.5 w-3.5 mr-1" /> {Z("取消", "Cancel")}</Button>
                      <Button variant="coral" size="sm" onClick={saveEdit} disabled={update.isPending}><Check className="h-3.5 w-3.5 mr-1" /> {Z("保存", "Save")}</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-foreground">{p.title}</h4>
                      {p.description && <p className="text-xs text-muted-foreground mt-1">{p.description}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); startEdit(p); }}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); del.mutate(p.id); }}><Trash2 className="h-3 w-3" /></Button>
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
