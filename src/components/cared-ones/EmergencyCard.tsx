import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Phone, Pencil, Trash2, X, Check, Plus, Users, Loader2, MapPin } from "lucide-react";
import { useEmergencyContacts, useCreateEmergencyContact, useUpdateEmergencyContact, useDeleteEmergencyContact } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const RELATIONSHIP_VALUES = ["Spouse", "Parent", "Child", "Sibling", "Doctor", "Nurse", "Caregiver", "Neighbor", "Friend", "Other"];
const REL_ZH: Record<string,string> = { Spouse:"配偶", Parent:"父母", Child:"子女", Sibling:"兄弟姐妹", Doctor:"医生", Nurse:"护士", Caregiver:"护理者", Neighbor:"邻居", Friend:"朋友", Other:"其他" };

interface ContactForm {
  name: string;
  phone: string;
  relationship: string;
  content: string;
  address: string;
  note: string;
}

const EMPTY: ContactForm = { name: "", phone: "", relationship: "Other", content: "", address: "", note: "" };

export function EmergencyCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const relLabel = (r: string) => isCN ? (REL_ZH[r] || r) : r;

  const { data: contacts, isLoading } = useEmergencyContacts(caredOneId);
  const create = useCreateEmergencyContact();
  const update = useUpdateEmergencyContact();
  const del = useDeleteEmergencyContact();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<ContactForm>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ContactForm>(EMPTY);

  const startEdit = (c: any) => {
    setEditId(c.id);
    setEditForm({
      name: c.name || "",
      phone: c.phone || "",
      relationship: c.relationship || "Other",
      content: c.content || "",
      address: c.address || "",
      note: c.note || "",
    });
  };
  const cancelEdit = () => setEditId(null);
  const saveEdit = () => {
    if (!editId || !editForm.name || !editForm.phone) return;
    update.mutate({ id: editId, ...editForm }, {
      onSuccess: () => { setEditId(null); toast({ title: Z("联系人已更新", "Contact updated") }); },
      onError: (e: any) => toast({ title: Z("保存失败", "Couldn't save"), description: e.message, variant: "destructive" }),
    });
  };

  const handleAdd = () => {
    if (!form.name || !form.phone) return;
    create.mutate({ user_id: caredOneId, ...form }, {
      onSuccess: () => { setForm(EMPTY); setAddOpen(false); toast({ title: Z("联系人已添加", "Contact added") }); },
      onError: (e: any) => toast({ title: Z("添加失败", "Couldn't add"), description: e.message, variant: "destructive" }),
    });
  };

  const fields = (f: ContactForm, set: (u: Partial<ContactForm>) => void) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{Z("姓名", "Name")} <span className="text-destructive">*</span></Label>
          <Input className="mt-1" value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder={Z("联系人姓名", "Contact name")} />
        </div>
        <div>
          <Label>{Z("电话", "Phone")} <span className="text-destructive">*</span></Label>
          <Input className="mt-1" type="tel" value={f.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+86 138 0000 0000" />
        </div>
      </div>
      <div>
        <Label>{Z("关系", "Relationship")}</Label>
        <Select value={f.relationship} onValueChange={(v) => set({ relationship: v })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>{RELATIONSHIP_VALUES.map((r) => <SelectItem key={r} value={r}>{relLabel(r)}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label>{Z("详细信息", "Detail")}</Label>
        <Input className="mt-1" value={f.content} onChange={(e) => set({ content: e.target.value })} placeholder={Z("微信、邮箱、备用号码或其他说明", "WeChat, email, second number, or other details")} />
      </div>
      <div>
        <Label>{Z("地址", "Address")}</Label>
        <Input className="mt-1" value={f.address} onChange={(e) => set({ address: e.target.value })} placeholder={Z("住址或工作地点", "Home or work address")} />
      </div>
      <div>
        <Label>{Z("备注", "Note")}</Label>
        <Textarea className="mt-1" rows={2} value={f.note} onChange={(e) => set({ note: e.target.value })} placeholder={Z("什么时候找这位联系人最合适……", "When it's best to reach this person…")} />
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">{Z("紧急联系人", "Emergency Contacts")}</h2>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> {Z("添加", "Add")}</Button>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{Z("添加紧急联系人", "Add Emergency Contact")}</DialogTitle>
            <DialogDescription>{Z("为紧急情况添加一位重要联系人", "Add an important contact for emergencies")}</DialogDescription>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            {fields(form, (u) => setForm((p) => ({ ...p, ...u })))}
            <Button variant="coral" className="w-full" onClick={handleAdd} disabled={create.isPending || !form.name || !form.phone}>
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} {Z("添加联系人", "Add Contact")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" />
      ) : (contacts || []).length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">{Z("暂无紧急联系人", "No emergency contacts yet")}</p>
          <Button variant="coral" size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> {Z("添加第一位联系人", "Add First Contact")}</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {(contacts || []).map((c: any) => (
            <Card key={c.id} className="border-transparent card-elevated">
              <CardContent className="p-4">
                {editId === c.id ? (
                  <div className="space-y-3">
                    {fields(editForm, (u) => setEditForm((p) => ({ ...p, ...u })))}
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={cancelEdit}><X className="h-3.5 w-3.5 mr-1" /> {Z("取消", "Cancel")}</Button>
                      <Button variant="coral" size="sm" onClick={saveEdit} disabled={update.isPending}><Check className="h-3.5 w-3.5 mr-1" /> {Z("保存", "Save")}</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-foreground text-sm">{c.name}</h4>
                        {c.relationship && <Badge variant="secondary" className="text-[10px]">{relLabel(c.relationship)}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.phone}</p>
                      {c.content && <p className="text-xs text-muted-foreground mt-0.5">{c.content}</p>}
                      {c.address && (
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-start gap-1">
                          <MapPin className="h-3 w-3 mt-0.5 shrink-0" /> <span className="min-w-0">{c.address}</span>
                        </p>
                      )}
                      {c.note && <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{c.note}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="outline" size="sm" asChild><a href={`tel:${c.phone}`}><Phone className="h-3 w-3 mr-1" /> {Z("拨打", "Call")}</a></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={Z("编辑联系人", "Edit contact")} onClick={() => startEdit(c)}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" aria-label={Z("删除联系人", "Delete contact")} onClick={() => del.mutate(c.id)}><Trash2 className="h-3 w-3" /></Button>
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
