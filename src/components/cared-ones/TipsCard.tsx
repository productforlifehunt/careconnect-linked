import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { useCareTips, useCreateCareTip, useDeleteCareTip } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";

const TIP_CATEGORIES = ["General", "Nutrition", "Exercise", "Mental Health", "Safety", "Communication", "Sleep", "Hygiene"];

export function TipsCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: tips } = useCareTips(caredOneId);
  const create = useCreateCareTip();
  const del = useDeleteCareTip();
  const [form, setForm] = useState({ title: "", content: "", category: "General" });

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Care Tips</h2>
      <Card className="border-transparent card-elevated mb-6"><CardContent className="p-5 space-y-3">
        <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Tip title" />
        <Textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Describe the care tip or reminder..." rows={2} />
        <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{TIP_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Button variant="coral" className="w-full" onClick={() => {
          if (!form.title || !form.content) return;
          create.mutate({ user_id: caredOneId, title: form.title, content: form.content, category: form.category }, {
            onSuccess: () => { setForm({ title: "", content: "", category: "General" }); toast({ title: "Tip added" }); }
          });
        }} disabled={create.isPending || !form.title || !form.content}>Add Tip</Button>
      </CardContent></Card>
      <div className="space-y-2">
        {(tips || []).map((t: any) => (
          <Card key={t.id} className="border-transparent card-elevated"><CardContent className="p-3 flex justify-between items-start">
            <div><div className="flex items-center gap-2"><h4 className="font-medium text-foreground text-sm">{t.title}</h4>{t.category && <Badge variant="secondary" className="text-[10px]">{t.category}</Badge>}</div>
              <p className="text-xs text-muted-foreground mt-0.5">{t.content}</p></div>
            <Button variant="ghost" size="icon" className="text-destructive h-7 w-7 shrink-0" onClick={() => del.mutate(t.id)}><Trash2 className="h-3 w-3" /></Button>
          </CardContent></Card>
        ))}
        {(tips || []).length === 0 && <p className="text-center py-8 text-muted-foreground">No care tips yet</p>}
      </div>
    </div>
  );
}
