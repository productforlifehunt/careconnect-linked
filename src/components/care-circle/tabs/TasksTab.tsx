import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, CheckCircle, Circle, Loader2, Trash2, Briefcase } from "lucide-react";
import { VisibilitySelect } from "../PostActions";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { useToast } from "@/hooks/use-toast";

interface TasksTabProps {
  tasks: any[];
  tasksLoading: boolean;
  members: any[];
  activeGroupId: string | null;
  userId: string | undefined;
  isAdmin: boolean;
  memberCategories: any[];
  createTask: any;
  updateTaskStatus: any;
  deleteTask: any;
  createJob: any;
}

export function TasksTab({
  tasks, tasksLoading, members, activeGroupId, userId, isAdmin,
  memberCategories, createTask, updateTaskStatus, deleteTask, createJob,
}: TasksTabProps) {
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", assignee: "", priority: "medium", category: "Daily Living", due_date: "", visibility: "group" });

  const pendingTasks = (tasks || []).filter((t: any) => t.status !== "completed");
  const completedTasks = (tasks || []).filter((t: any) => t.status === "completed");

  const priorityColors: Record<string, string> = {
    high: "bg-destructive/10 text-destructive", urgent: "bg-destructive/10 text-destructive",
    medium: "bg-warning/10 text-warning", low: "bg-muted text-muted-foreground",
  };

  const toggleTask = (id: string, currentStatus: string) => {
    updateTaskStatus.mutate({ id, status: currentStatus === "completed" ? "pending" : "completed" });
  };

  const addTask = () => {
    if (!newTask.title || !activeGroupId) return;
    createTask.mutate({
      title: newTask.title, description: newTask.description || undefined,
      group_id: activeGroupId, assigned_to: newTask.assignee || undefined,
      priority: newTask.priority, category: newTask.category,
      due_date: newTask.due_date || undefined, status: "pending", visibility: newTask.visibility,
    } as any, {
      onSuccess: () => {
        setNewTask({ title: "", description: "", assignee: "", priority: "medium", category: "Daily Living", due_date: "", visibility: "group" });
        setAddOpen(false); toast({ title: "Task added" });
      },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Tasks ({pendingTasks.length} pending)</h3>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild><Button variant="coral" size="sm"><Plus className="h-4 w-4 mr-1" /> Add Task</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label>Task Title *</Label><Input value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Pick up medication" /></div>
              <div><Label>Description</Label><Textarea value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} placeholder="Details..." rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Priority</Label>
                  <Select value={newTask.priority} onValueChange={v => setNewTask(p => ({ ...p, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Category</Label>
                  <Select value={newTask.category} onValueChange={v => setNewTask(p => ({ ...p, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Daily Living", "Medical", "Transportation", "Meals", "Errands", "Appointments", "Emotional Support", "Other"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Due Date</Label><Input type="date" value={newTask.due_date} onChange={e => setNewTask(p => ({ ...p, due_date: e.target.value }))} /></div>
                <div><Label>Assign To</Label>
                  <Select value={newTask.assignee} onValueChange={v => setNewTask(p => ({ ...p, assignee: v }))}>
                    <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {(members || []).map((m: any) => <SelectItem key={m.user_id} value={m.user_id}>{m.profile?.full_name || "Member"}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Visibility</Label><VisibilitySelect value={newTask.visibility} onChange={v => setNewTask(p => ({ ...p, visibility: v }))} memberCategories={memberCategories} /></div>
              <Button variant="coral" className="w-full" onClick={addTask} disabled={createTask.isPending || !newTask.title.trim()}>
                {createTask.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Add Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {tasksLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-2">
          {pendingTasks.map((t: any) => (
            <div key={t.id} className="p-3 rounded-lg bg-card border group hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <button onClick={() => toggleTask(t.id, t.status)} className="shrink-0"><Circle className="h-5 w-5 text-muted-foreground hover:text-primary" /></button>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleTask(t.id, t.status)}>
                  <p className="text-sm font-medium text-foreground">{t.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {t.assignee_profile?.full_name && <span className="text-xs text-muted-foreground">{t.assignee_profile.full_name}</span>}
                    {t.due_date && <span className="text-xs text-muted-foreground">Due: {new Date(t.due_date).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>}
                    {t.category && <Badge variant="outline" className="text-[10px] h-4">{t.category}</Badge>}
                  </div>
                </div>
                <Badge variant="outline" className={priorityColors[t.priority] || ""}>{t.priority}</Badge>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" title="Post to Job Board"
                    onClick={(e) => { e.stopPropagation(); createJob.mutate({ title: t.title, description: t.description || `Help needed with: ${t.title}`, job_source_type: "group_task", linked_task_id: t.id, linked_group_id: activeGroupId!, location: "" }, { onSuccess: () => toast({ title: "Posted to Job Board" }) }); }}>
                    <Briefcase className="h-3.5 w-3.5" />
                  </Button>
                  {(isAdmin || t.created_by === userId) && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 hover:bg-destructive/10"
                      onClick={(e) => { e.stopPropagation(); deleteTask.mutate(t.id, { onSuccess: () => toast({ title: "Task deleted" }) }); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
              <CommentsSection entityType="task" entityId={t.id} compact />
            </div>
          ))}
          {completedTasks.length > 0 && (
            <>
              <p className="text-xs font-medium text-muted-foreground pt-3 pb-1">Completed ({completedTasks.length})</p>
              {completedTasks.map((t: any) => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-transparent opacity-60 hover:opacity-80">
                  <button onClick={() => toggleTask(t.id, t.status)} className="shrink-0"><CheckCircle className="h-5 w-5 text-success" /></button>
                  <p className="text-sm line-through text-muted-foreground flex-1 cursor-pointer" onClick={() => toggleTask(t.id, t.status)}>{t.title}</p>
                  {(isAdmin || t.created_by === userId) && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => deleteTask.mutate(t.id, { onSuccess: () => toast({ title: "Task deleted" }) })}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </>
          )}
          {(tasks || []).length === 0 && <p className="text-center py-8 text-muted-foreground">No tasks yet. Click "Add Task" to create one.</p>}
        </div>
      )}
    </div>
  );
}
