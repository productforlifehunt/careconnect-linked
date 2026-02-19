import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ArrowLeft, Check } from "lucide-react";
import { useCarePlans, useCreateCarePlan, useCarePlanGoals, useCreateCarePlanGoal, useUpdateCarePlanGoal } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";

function GoalsView({ planId }: { planId: string }) {
  const { toast } = useToast();
  const { data: goals } = useCarePlanGoals(planId);
  const createGoal = useCreateCarePlanGoal();
  const updateGoal = useUpdateCarePlanGoal();
  const [title, setTitle] = useState("");
  const completed = (goals || []).filter((g: any) => g.status === "completed").length;
  const total = (goals || []).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">Goals</h3>
        {total > 0 && <span className="text-xs text-muted-foreground">{completed}/{total} completed</span>}
      </div>
      {total > 0 && <div className="w-full bg-accent rounded-full h-2 mb-4"><div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }} /></div>}
      <div className="flex gap-2 mb-4">
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Add a goal..." onKeyDown={e => { if (e.key === "Enter" && title.trim()) { createGoal.mutate({ care_plan_id: planId, title: title.trim() }, { onSuccess: () => { setTitle(""); toast({ title: "Goal added" }); } }); } }} />
        <Button size="sm" onClick={() => { if (!title.trim()) return; createGoal.mutate({ care_plan_id: planId, title: title.trim() }, { onSuccess: () => { setTitle(""); toast({ title: "Goal added" }); } }); }} disabled={createGoal.isPending}><Plus className="h-4 w-4" /></Button>
      </div>
      <div className="space-y-2">
        {(goals || []).map((g: any) => (
          <div key={g.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border cursor-pointer hover:bg-accent/30 transition-colors" onClick={() => updateGoal.mutate({ id: g.id, status: g.status === "completed" ? "pending" : "completed" })}>
            {g.status === "completed" ? <Check className="h-4 w-4 text-success" /> : <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />}
            <span className={`text-sm ${g.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>{g.title}</span>
          </div>
        ))}
        {total === 0 && <p className="text-center py-6 text-muted-foreground text-sm">No goals yet. Add one above.</p>}
      </div>
    </div>
  );
}

export function CarePlanCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: plans } = useCarePlans(caredOneId);
  const create = useCreateCarePlan();
  const [form, setForm] = useState({ title: "", description: "" });
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Care Plans</h2>
      <Card className="border-transparent card-elevated mb-6"><CardContent className="p-5 space-y-3">
        <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Plan title (e.g. Recovery Plan)" />
        <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the plan goals..." rows={2} />
        <Button variant="coral" className="w-full" onClick={() => {
          if (!form.title) return;
          create.mutate({ user_id: caredOneId, title: form.title, description: form.description || undefined }, {
            onSuccess: () => { setForm({ title: "", description: "" }); toast({ title: "Plan created" }); }
          });
        }} disabled={create.isPending || !form.title}>Create Plan</Button>
      </CardContent></Card>
      {selectedPlan ? (
        <div><Button variant="ghost" size="sm" onClick={() => setSelectedPlan(null)} className="mb-2"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button><GoalsView planId={selectedPlan} /></div>
      ) : (
        <div className="space-y-2">
          {(plans || []).map((p: any) => (
            <Card key={p.id} className="border-transparent card-elevated cursor-pointer hover:border-primary/20" onClick={() => setSelectedPlan(p.id)}>
              <CardContent className="p-4"><h4 className="font-medium text-foreground">{p.title}</h4>{p.description && <p className="text-xs text-muted-foreground mt-1">{p.description}</p>}<Badge variant="secondary" className="text-xs mt-2">{p.status || "active"}</Badge></CardContent>
            </Card>
          ))}
          {(plans || []).length === 0 && <p className="text-center py-8 text-muted-foreground">No care plans yet</p>}
        </div>
      )}
    </div>
  );
}
