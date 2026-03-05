import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, ArrowLeft, Check, Pencil, Trash2, X, ClipboardList, Loader2 } from "lucide-react";
import { useCarePlans, useCreateCarePlan, useUpdateCarePlan, useDeleteCarePlan, useCarePlanGoals, useCreateCarePlanGoal, useUpdateCarePlanGoal } from "@/hooks/use-care-data";
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
  const { data: plans, isLoading } = useCarePlans(caredOneId);
  const create = useCreateCarePlan();
  const update = useUpdateCarePlan();
  const del = useDeleteCarePlan();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });

  const startEdit = (p: any) => { setEditId(p.id); setEditForm({ title: p.title, description: p.description || "" }); };
  const cancelEdit = () => setEditId(null);
  const saveEdit = () => {
    if (!editId || !editForm.title) return;
    update.mutate({ id: editId, title: editForm.title, description: editForm.description || undefined }, {
      onSuccess: () => { setEditId(null); toast({ title: "Plan updated" }); }
    });
  };

  const handleAdd = () => {
    if (!form.title) return;
    create.mutate({ user_id: caredOneId, title: form.title, description: form.description || undefined }, {
      onSuccess: () => { setForm({ title: "", description: "" }); setAddOpen(false); toast({ title: "Plan created" }); }
    });
  };

  if (selectedPlan) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Care Plans</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setSelectedPlan(null)} className="mb-2"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        <GoalsView planId={selectedPlan} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Care Plans</h2>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Care Plan</DialogTitle>
            <DialogDescription>Define a care plan with goals to track progress</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Plan title (e.g. Recovery Plan)" />
            <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the plan goals..." rows={3} />
            <Button variant="coral" className="w-full" onClick={handleAdd} disabled={create.isPending || !form.title}>
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} Create Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* List */}
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" />
      ) : (plans || []).length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">No care plans yet</p>
          <Button variant="coral" size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add First Plan</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {(plans || []).map((p: any) => (
            <Card key={p.id} className="border-transparent card-elevated">
              <CardContent className="p-4">
                {editId === p.id ? (
                  <div className="space-y-2">
                    <Input value={editForm.title} onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Plan title" />
                    <Textarea value={editForm.description} onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))} rows={2} />
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={cancelEdit}><X className="h-3.5 w-3.5 mr-1" /> Cancel</Button>
                      <Button variant="coral" size="sm" onClick={saveEdit} disabled={update.isPending}><Check className="h-3.5 w-3.5 mr-1" /> Save</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 cursor-pointer flex-1" onClick={() => setSelectedPlan(p.id)}>
                      <h4 className="font-medium text-foreground">{p.title}</h4>
                      {p.description && <p className="text-xs text-muted-foreground mt-1">{p.description}</p>}
                      <Badge variant="secondary" className="text-xs mt-2">{p.status || "active"}</Badge>
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
