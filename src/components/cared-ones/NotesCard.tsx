import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Pencil, Trash2, X, Check, Plus, StickyNote, Loader2 } from "lucide-react";
import { useCareNotes, useCreateCareNote, useUpdateCareNote, useDeleteCareNote } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";

export function NotesCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: notes, isLoading } = useCareNotes(caredOneId);
  const create = useCreateCareNote();
  const update = useUpdateCareNote();
  const del = useDeleteCareNote();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", content: "", category: "" });

  const startEdit = (n: any) => { setEditId(n.id); setEditForm({ title: n.title || "", content: n.content, category: n.category || "" }); };
  const cancelEdit = () => setEditId(null);
  const saveEdit = () => {
    if (!editId || !editForm.content) return;
    update.mutate({ id: editId, title: editForm.title || undefined, content: editForm.content, category: editForm.category || undefined }, {
      onSuccess: () => { setEditId(null); toast({ title: "Note updated" }); }
    });
  };

  const handleAdd = () => {
    if (!form.content) return;
    create.mutate({ user_id: caredOneId, title: form.title || undefined, content: form.content, category: form.category || undefined }, {
      onSuccess: () => { setForm({ title: "", content: "", category: "" }); setAddOpen(false); toast({ title: "Note saved ✓" }); }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Care Notes</h2>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Care Note</DialogTitle>
            <DialogDescription>Record observations, instructions, or anything relevant</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Note title (optional)" />
            <Textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Write observations, instructions, or anything relevant..." rows={4} />
            <Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="Category (optional)" />
            <Button variant="coral" className="w-full" onClick={handleAdd} disabled={create.isPending || !form.content}>
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} Save Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* List */}
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" />
      ) : (notes || []).length === 0 ? (
        <div className="text-center py-12">
          <StickyNote className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">No notes yet</p>
          <Button variant="coral" size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add First Note</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {(notes || []).map((n: any) => (
            <Card key={n.id} className="border-transparent card-elevated">
              <CardContent className="p-4">
                {editId === n.id ? (
                  <div className="space-y-2">
                    <Input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} placeholder="Title (optional)" />
                    <Textarea value={editForm.content} onChange={e => setEditForm(p => ({ ...p, content: e.target.value }))} rows={3} />
                    <Input value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))} placeholder="Category (optional)" />
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={cancelEdit}><X className="h-3.5 w-3.5 mr-1" /> Cancel</Button>
                      <Button variant="coral" size="sm" onClick={saveEdit} disabled={update.isPending}><Check className="h-3.5 w-3.5 mr-1" /> Save</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      {n.title && <h4 className="font-medium text-foreground text-sm">{n.title}</h4>}
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">{n.content}</p>
                      <div className="flex gap-2 mt-1">
                        {n.category && <Badge variant="secondary" className="text-[10px]">{n.category}</Badge>}
                        <span className="text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleDateString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(n)}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => del.mutate(n.id)}><Trash2 className="h-3 w-3" /></Button>
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
