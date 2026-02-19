import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { useCaredOneDocuments, useCreateCaredOneDocument, useDeleteCaredOneDocument } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";

const DOC_TYPES = ["Medical Record", "Insurance", "Prescription", "Lab Result", "Legal", "ID", "Emergency Plan", "Other"];

export function DocumentsCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: docs } = useCaredOneDocuments(caredOneId);
  const create = useCreateCaredOneDocument();
  const del = useDeleteCaredOneDocument();
  const [form, setForm] = useState({ title: "", document_type: "Medical Record", file_url: "", notes: "" });

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Documents</h2>
      <Card className="border-transparent card-elevated mb-6"><CardContent className="p-5 space-y-3">
        <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Document title" />
        <div className="grid grid-cols-2 gap-3">
          <Select value={form.document_type} onValueChange={v => setForm(p => ({ ...p, document_type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={form.file_url} onChange={e => setForm(p => ({ ...p, file_url: e.target.value }))} placeholder="Link URL (optional)" />
        </div>
        <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notes (optional)" />
        <Button variant="coral" className="w-full" onClick={() => {
          if (!form.title) return;
          create.mutate({ user_id: caredOneId, title: form.title, document_type: form.document_type, file_url: form.file_url || "", notes: form.notes || undefined }, {
            onSuccess: () => { setForm({ title: "", document_type: "Medical Record", file_url: "", notes: "" }); toast({ title: "Document added" }); }
          });
        }} disabled={create.isPending || !form.title}>Add Document</Button>
      </CardContent></Card>
      <div className="space-y-2">
        {(docs || []).map((d: any) => (
          <Card key={d.id} className="border-transparent card-elevated"><CardContent className="p-3 flex justify-between items-center">
            <div className="min-w-0">
              <h4 className="font-medium text-foreground text-sm">{d.title || d.file_name || "Document"}</h4>
              <div className="flex items-center gap-2 mt-0.5"><Badge variant="secondary" className="text-[10px]">{d.document_type || "General"}</Badge><span className="text-[10px] text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</span></div>
              {d.notes && <p className="text-xs text-muted-foreground mt-0.5">{d.notes}</p>}
            </div>
            <div className="flex gap-1 shrink-0 ml-2">
              {d.file_url && <Button variant="outline" size="sm" asChild><a href={d.file_url} target="_blank" rel="noopener">View</a></Button>}
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => del.mutate(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </CardContent></Card>
        ))}
        {(docs || []).length === 0 && <p className="text-center py-8 text-muted-foreground">No documents added yet</p>}
      </div>
    </div>
  );
}
