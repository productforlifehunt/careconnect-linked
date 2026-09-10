import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { useCareTips, useCreateCareTip, useUpdateCareTip, useDeleteCareTip } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

// Backend (CCT 209 "Cared one's care tip", field a57) only stores two options:
// b55 = "tip", b56 = "avoid". The UI must offer exactly these.
const TIP_CATEGORIES = [
  { value: "tip", labelEn: "Do this (tip)", labelZh: "这样做（方法）" },
  { value: "avoid", labelEn: "Avoid this", labelZh: "避免这样做" },
];


export function TipsCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const { data: tips } = useCareTips(caredOneId);
  const create = useCreateCareTip();
  const update = useUpdateCareTip();
  const del = useDeleteCareTip();
  const [form, setForm] = useState({ title: "", content: "", category: "General" });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", content: "", category: "" });
  const [tab, setTab] = useState("view");

  const catLabel = (val: string) => {
    const opt = TIP_CATEGORIES.find(c => c.value === val);
    return opt ? (isCN ? opt.labelZh : opt.labelEn) : val;
  };

  const startEdit = (t: any) => { setEditId(t.id); setEditForm({ title: t.title, content: t.content, category: t.category || "General" }); };
  const cancelEdit = () => setEditId(null);
  const saveEdit = () => {
    if (!editId || !editForm.title || !editForm.content) return;
    update.mutate({ id: editId, ...editForm }, { onSuccess: () => { setEditId(null); toast({ title: Z("提示已更新", "Tip updated") }); } });
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">{Z("护理提示", "Care Tips")}</h2>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="view" className="flex-1">{Z(`查看提示（${(tips || []).length}）`, `View Tips (${(tips || []).length})`)}</TabsTrigger>
          <TabsTrigger value="add" className="flex-1">{Z("新增", "Add New")}</TabsTrigger>
        </TabsList>
        <TabsContent value="view">
          <div className="space-y-2">
            {(tips || []).map((t: any) => (
              <Card key={t.id} className="border-transparent card-elevated">
                <CardContent className="p-4">
                  {editId === t.id ? (
                    <div className="space-y-2">
                      <Input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} placeholder={Z("标题", "Title")} />
                      <Textarea value={editForm.content} onChange={e => setEditForm(p => ({ ...p, content: e.target.value }))} rows={2} />
                      <Select value={editForm.category} onValueChange={v => setEditForm(p => ({ ...p, category: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{TIP_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{isCN ? c.labelZh : c.labelEn}</SelectItem>)}</SelectContent>
                      </Select>
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={cancelEdit}><X className="h-3.5 w-3.5 mr-1" /> {Z("取消", "Cancel")}</Button>
                        <Button variant="coral" size="sm" onClick={saveEdit} disabled={update.isPending}><Check className="h-3.5 w-3.5 mr-1" /> {Z("保存", "Save")}</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground text-sm">{t.title}</h4>
                          {t.category && <Badge variant="secondary" className="text-[10px]">{catLabel(t.category)}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{t.content}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(t)}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => del.mutate(t.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {(tips || []).length === 0 && <p className="text-center py-8 text-muted-foreground">{Z('还没有护理提示。从「新增」标签添加一条。', 'No care tips yet. Add one from the "Add New" tab.')}</p>}
          </div>
        </TabsContent>
        <TabsContent value="add">
          <Card className="border-transparent card-elevated"><CardContent className="p-5 space-y-3">
            <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder={Z("提示标题", "Tip title")} />
            <Textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder={Z("描述这条护理提示或提醒……", "Describe the care tip or reminder...")} rows={2} />
            <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TIP_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{isCN ? c.labelZh : c.labelEn}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="coral" className="w-full" onClick={() => {
              if (!form.title || !form.content) return;
              create.mutate({ user_id: caredOneId, title: form.title, content: form.content, category: form.category }, {
                onSuccess: () => { setForm({ title: "", content: "", category: "General" }); setTab("view"); toast({ title: Z("提示已添加", "Tip added") }); }
              });
            }} disabled={create.isPending || !form.title || !form.content}>{Z("添加提示", "Add Tip")}</Button>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
