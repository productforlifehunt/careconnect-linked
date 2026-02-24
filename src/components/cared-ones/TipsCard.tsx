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

const TIP_CATEGORIES = ["General", "Nutrition", "Exercise", "Mental Health", "Safety", "Communication", "Sleep", "Hygiene"];

export function TipsCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: tips } = useCareTips(caredOneId);
  const create = useCreateCareTip();
  const update = useUpdateCareTip();
  const del = useDeleteCareTip();
  const [form, setForm] = useState({ title: "", content: "", category: "General" });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", content: "", category: "" });
  const [tab, setTab] = useState("view");

  const startEdit = (t: any) => { setEditId(t.id); setEditForm({ title: t.title, content: t.content, category: t.category || "General" }); };
  const cancelEdit = () => setEditId(null);
  const saveEdit = () => {
    if (!editId || !editForm.title || !editForm.content) return;
    update.mutate({ id: editId, ...editForm }, { onSuccess: () => { setEditId(null); toast({ title: "Tip updated" }); } });
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Care Tips</h2>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="view" className="flex-1">View Tips ({(tips || []).length})</TabsTrigger>
          <TabsTrigger value="add" className="flex-1">Add New</TabsTrigger>
        </TabsList>
        <TabsContent value="view">
          <div className="space-y-2">
            {(tips || []).map((t: any) => (
              <Card key={t.id} className="border-transparent card-elevated">
                <CardContent className="p-4">
                  {editId === t.id ? (
                    <div className="space-y-2">
                      <Input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} placeholder="Title" />
                      <Textarea value={editForm.content} onChange={e => setEditForm(p => ({ ...p, content: e.target.value }))} rows={2} />
                      <Select value={editForm.category} onValueChange={v => setEditForm(p => ({ ...p, category: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{TIP_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={cancelEdit}><X className="h-3.5 w-3.5 mr-1" /> Cancel</Button>
                        <Button variant="coral" size="sm" onClick={saveEdit} disabled={update.isPending}><Check className="h-3.5 w-3.5 mr-1" /> Save</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground text-sm">{t.title}</h4>
                          {t.category && <Badge variant="secondary" className="text-[10px]">{t.category}</Badge>}
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
            {(tips || []).length === 0 && <p className="text-center py-8 text-muted-foreground">No care tips yet. Add one from the "Add New" tab.</p>}
          </div>
        </TabsContent>
        <TabsContent value="add">
          <Card className="border-transparent card-elevated"><CardContent className="p-5 space-y-3">
            <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Tip title" />
            <Textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Describe the care tip or reminder..." rows={2} />
            <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TIP_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="coral" className="w-full" onClick={() => {
              if (!form.title || !form.content) return;
              create.mutate({ user_id: caredOneId, title: form.title, content: form.content, category: form.category }, {
                onSuccess: () => { setForm({ title: "", content: "", category: "General" }); setTab("view"); toast({ title: "Tip added" }); }
              });
            }} disabled={create.isPending || !form.title || !form.content}>Add Tip</Button>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
