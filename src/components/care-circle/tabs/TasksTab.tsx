import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, CheckCircle, Circle, Loader2, Trash2, Briefcase } from "lucide-react";
import { VisibilityPicker, EMPTY_VISIBILITY, type VisibilityValue } from "../VisibilityPicker";
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
  const [newTask, setNewTask] = useState({ title: "", description: "", assigneeIds: [] as string[], due_date: "" });
  const [visibility, setVisibility] = useState<VisibilityValue>(EMPTY_VISIBILITY);

  // Per data model: task itself only has `k` (help status) and `l` (finish status: 1=not finished, 2=finished).
  // "pending/accepted/rejected" belongs to each assignee on REL 108 meta `a` — i.e. invitee response.
  const pendingTasks = (tasks || []).filter((t: any) => String(t.finish_status ?? "1") !== "2");
  const completedTasks = (tasks || []).filter((t: any) => String(t.finish_status ?? "1") === "2");

  const helpStatusColors: Record<string, string> = {
    "1": "bg-muted text-muted-foreground",      // doesn't need help
    "2": "bg-warning/10 text-warning",          // needs help
    "3": "bg-success/10 text-success",          // found help
  };
  const helpStatusLabels: Record<string, string> = {
    "1": "No help needed",
    "2": "Needs help",
    "3": "Help found",
  };
  const responseColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    accepted: "bg-success/10 text-success",
    rejected: "bg-destructive/10 text-destructive",
  };

  const toggleTask = (id: string, currentFinish: string) => {
    const next = String(currentFinish) === "2" ? "1" : "2";
    updateTaskStatus.mutate({ id, updates: { finish_status: next, completed_at: next === "2" ? new Date().toISOString() : "" } });
  };

  const addTask = () => {
    if (!newTask.title || !activeGroupId) return;
    createTask.mutate({
      title: newTask.title, description: newTask.description || undefined,
      group_id: activeGroupId, assigned_to: newTask.assigneeIds.length ? newTask.assigneeIds : undefined,
      due_date: newTask.due_date || undefined,
      subgroupIds: visibility.subgroupIds,
      visibilityUserIds: visibility.userIds,
    } as any, {
      onSuccess: () => {
        setNewTask({ title: "", description: "", assigneeIds: [], due_date: "" });
        setVisibility(EMPTY_VISIBILITY);
        setAddOpen(false); toast({ title: "Task added" });
      },
    });
  };

  const toggleAssignee = (memberId: string) => {
    setNewTask((prev) => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(memberId)
        ? prev.assigneeIds.filter((id) => id !== memberId)
        : [...prev.assigneeIds, memberId],
    }));
  };

  const getAssignedNames = (task: any) => {
    const ids = Array.isArray(task.assigned_to_ids) ? task.assigned_to_ids : task.assigned_to ? [task.assigned_to] : [];
    return ids
      .map((id: string) => (members || []).find((m: any) => m.user_id === id || `wp-${m.id}` === id))
      .filter(Boolean)
      .map((m: any) => m.display_name || m.profile?.full_name || "Member");
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
                <div><Label>Due Date</Label><Input type="date" value={newTask.due_date} onChange={e => setNewTask(p => ({ ...p, due_date: e.target.value }))} /></div>
                <div><Label>Assign To</Label>
                  <div className="mt-2 max-h-32 overflow-auto rounded-md border p-2 space-y-2">
                    {(members || []).map((m: any) => {
                      const memberId = m.user_id || `wp-${m.id}`;
                      return (
                        <label key={memberId} className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox checked={newTask.assigneeIds.includes(memberId)} onCheckedChange={() => toggleAssignee(memberId)} />
                          <span>{m.display_name || m.profile?.full_name || "Member"}</span>
                        </label>
                      );
                    })}
                    {(members || []).length === 0 && <p className="text-xs text-muted-foreground">No members available</p>}
                  </div>
                </div>
              </div>
              <div><Label>Visibility</Label><VisibilityPicker value={visibility} onChange={setVisibility} memberCategories={memberCategories} members={members} /></div>
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
                <button onClick={() => toggleTask(t.id, t.finish_status)} className="shrink-0"><Circle className="h-5 w-5 text-muted-foreground hover:text-primary" /></button>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleTask(t.id, t.finish_status)}>
                  <p className="text-sm font-medium text-foreground">{t.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {getAssignedNames(t).length > 0 && <span className="text-xs text-muted-foreground">{getAssignedNames(t).join(", ")}</span>}
                    {t.due_date && <span className="text-xs text-muted-foreground">Due: {new Date(t.due_date).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>}
                    {Array.isArray(t.assignees) && t.assignees.map((a: any) => {
                      const m = (members || []).find((mm: any) => mm.user_id === a.user_id || `wp-${mm.id}` === a.user_id);
                      const name = m?.display_name || m?.profile?.full_name || "Member";
                      return (
                        <Badge key={a.user_id} variant="outline" className={`text-[10px] ${responseColors[a.response] || ""}`}>
                          {name}: {a.response}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                <Badge variant="outline" className={helpStatusColors[String(t.help_status ?? "1")] || ""}>
                  {helpStatusLabels[String(t.help_status ?? "1")] || "No help needed"}
                </Badge>
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
