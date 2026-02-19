import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { useCareNotes, useCreateCareNote, useDeleteCareNote } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";

export function NotesCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: notes } = useCareNotes(caredOneId);
  const create = useCreateCareNote();
  const del = useDeleteCareNote();
  const [form, setForm] = useState({ title: "", content: "", category: "" });

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Care Notes</h2>
      <Card className="border-transparent card-elevated mb-6"><CardContent className="p-5 space-y-3">
        <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Note title (optional)" />
        <Textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Write observations, instructions, or anything relevant..." rows={3} />
        <Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="Category (optional)" />
        <Button variant="coral" className="w-full" onClick={() => {
          if (!form.content) return;
          create.mutate({ user_id: caredOneId, title: form.title || undefined, content: form.content, category: form.category || undefined }, {
            onSuccess: () => { setForm({ title: "", content: "", category: "" }); toast({ title: "Note saved ✓" }); }
          });
        }} disabled={create.isPending || !form.content}>Save Note</Button>
      </CardContent></Card>
      <div className="space-y-2">
        {(notes || []).map((n: any) => (
          <Card key={n.id} className="border-transparent card-elevated"><CardContent className="p-3 flex justify-between items-start">
            <div className="min-w-0">
              {n.title && <h4 className="font-medium text-foreground text-sm">{n.title}</h4>}
              <p className="text-xs text-muted-foreground whitespace-pre-wrap">{n.content}</p>
              <div className="flex gap-2 mt-1">
                {n.category && <Badge variant="secondary" className="text-[10px]">{n.category}</Badge>}
                <span className="text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleDateString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-destructive h-7 w-7 shrink-0" onClick={() => del.mutate(n.id)}><Trash2 className="h-3 w-3" /></Button>
          </CardContent></Card>
        ))}
        {(notes || []).length === 0 && <p className="text-center py-8 text-muted-foreground">No notes yet</p>}
      </div>
    </div>
  );
}
