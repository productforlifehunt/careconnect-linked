import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Pencil, Trash2, X, Check } from "lucide-react";
import { useEmergencyContacts, useCreateEmergencyContact, useUpdateEmergencyContact, useDeleteEmergencyContact } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";

const RELATIONSHIPS = ["Spouse", "Parent", "Child", "Sibling", "Doctor", "Nurse", "Caregiver", "Neighbor", "Friend", "Other"];

export function EmergencyCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: contacts } = useEmergencyContacts(caredOneId);
  const create = useCreateEmergencyContact();
  const update = useUpdateEmergencyContact();
  const del = useDeleteEmergencyContact();
  const [form, setForm] = useState({ name: "", phone: "", relationship: "Other" });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", relationship: "Other" });
  const [tab, setTab] = useState("view");

  const startEdit = (c: any) => { setEditId(c.id); setEditForm({ name: c.name, phone: c.phone, relationship: c.relationship || "Other" }); };
  const cancelEdit = () => setEditId(null);
  const saveEdit = () => {
    if (!editId || !editForm.name || !editForm.phone) return;
    update.mutate({ id: editId, name: editForm.name, phone: editForm.phone, relationship: editForm.relationship }, {
      onSuccess: () => { setEditId(null); toast({ title: "Contact updated" }); }
    });
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Emergency Contacts</h2>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="view" className="flex-1">View Contacts ({(contacts || []).length})</TabsTrigger>
          <TabsTrigger value="add" className="flex-1">Add New</TabsTrigger>
        </TabsList>
        <TabsContent value="view">
          <div className="space-y-2">
            {(contacts || []).map((c: any) => (
              <Card key={c.id} className="border-transparent card-elevated">
                <CardContent className="p-4">
                  {editId === c.id ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} placeholder="Name" />
                        <Input type="tel" value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone" />
                      </div>
                      <Select value={editForm.relationship} onValueChange={v => setEditForm(p => ({ ...p, relationship: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{RELATIONSHIPS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                      </Select>
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={cancelEdit}><X className="h-3.5 w-3.5 mr-1" /> Cancel</Button>
                        <Button variant="coral" size="sm" onClick={saveEdit} disabled={update.isPending}><Check className="h-3.5 w-3.5 mr-1" /> Save</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground text-sm">{c.name}</h4>
                          {c.is_primary && <Badge className="text-[10px]">Primary</Badge>}
                          {c.relationship && <Badge variant="secondary" className="text-[10px]">{c.relationship}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{c.phone}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="outline" size="sm" asChild><a href={`tel:${c.phone}`}><Phone className="h-3 w-3 mr-1" /> Call</a></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(c)}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => del.mutate(c.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {(contacts || []).length === 0 && <p className="text-center py-8 text-muted-foreground">No emergency contacts yet. Add one from the "Add New" tab.</p>}
          </div>
        </TabsContent>
        <TabsContent value="add">
          <Card className="border-transparent card-elevated"><CardContent className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Name <span className="text-destructive">*</span></Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Contact name" className="mt-1" /></div>
              <div><Label className="text-xs">Phone <span className="text-destructive">*</span></Label><Input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000" className="mt-1" /></div>
            </div>
            <div><Label className="text-xs">Relationship</Label>
              <Select value={form.relationship} onValueChange={v => setForm(p => ({ ...p, relationship: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{RELATIONSHIPS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button variant="coral" className="w-full" onClick={() => {
              if (!form.name || !form.phone) return;
              create.mutate({ user_id: caredOneId, name: form.name, phone: form.phone, relationship: form.relationship }, {
                onSuccess: () => { setForm({ name: "", phone: "", relationship: "Other" }); setTab("view"); toast({ title: "Contact added" }); }
              });
            }} disabled={create.isPending || !form.name || !form.phone}>Add Contact</Button>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
