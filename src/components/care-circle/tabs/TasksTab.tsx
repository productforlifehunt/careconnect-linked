import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, CheckCircle, Circle, Loader2, Trash2, Briefcase, Check, X } from "lucide-react";
import { VisibilityPicker, EMPTY_VISIBILITY, type VisibilityValue } from "../VisibilityPicker";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { useToast } from "@/hooks/use-toast";
import { useUpdateAssigneeStatus } from "@/hooks/use-care-data";

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

// Task type values per data model field `c` (1..9)
const TASK_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "1", label: "Preparing Meals" },
  { value: "2", label: "Shopping/Errands" },
  { value: "3", label: "Transportation" },
  { value: "4", label: "Personal Care" },
  { value: "5", label: "Medication" },
  { value: "6", label: "Companionship" },
  { value: "7", label: "Housekeeping" },
  { value: "8", label: "Medical Appointments" },
  { value: "9", label: "Occasions" },
];

export function TasksTab({
  tasks, tasksLoading, members, activeGroupId, userId, isAdmin,
  memberCategories, createTask, updateTaskStatus, deleteTask, createJob,
}: TasksTabProps) {
  const { toast } = useToast();
  const updateAssignee = useUpdateAssigneeStatus();
  const [addOpen, setAddOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "", description: "", assigneeIds: [] as string[],
    task_date: "", start_time: "", end_time: "",
    location: "", task_types: [] as string[],
    people_needed: "" as string, help_status: "1",
  });
  const [visibility, setVisibility] = useState<VisibilityValue>(EMPTY_VISIBILITY);

  // Per data model: task itself only has `k` (help status) and `l` (finish status: 1=not finished, 2=finished).
  // "pending/accepted/rejected" belongs to each assignee on REL 108 meta `a` — i.e. invitee response.
  const pendingTasks = (tasks || []).filter((t: any) => String(t.finish_status ?? "1") !== "2");
  const completedTasks = (tasks || []).filter((t: any) => String(t.finish_status ?? "1") === "2");

  const helpStatusColors: Record<string, string> = {
    "1": "bg-muted text-muted-foreground",
    "2": "bg-warning/10 text-warning",
    "3": "bg-success/10 text-success",
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
      title: newTask.title,
      description: newTask.description || undefined,
      group_id: activeGroupId,
      assigned_to: newTask.assigneeIds.length ? newTask.assigneeIds : undefined,
      task_date: newTask.task_date || undefined,
      start_time: newTask.start_time || undefined,
      end_time: newTask.end_time || undefined,
      location: newTask.location || undefined,
      task_types: newTask.task_types.length ? newTask.task_types : undefined,
      people_needed: newTask.people_needed ? Number(newTask.people_needed) : undefined,
      help_status: newTask.help_status,
      subgroupIds: visibility.subgroupIds,
      visibilityUserIds: visibility.userIds,
    } as any, {
      onSuccess: () => {
        setNewTask({
          title: "", description: "", assigneeIds: [],
          task_date: "", start_time: "", end_time: "",
          location: "", task_types: [], people_needed: "", help_status: "1",
        });
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

  const toggleTaskType = (val: string) => {
    setNewTask((prev) => ({
      ...prev,
      task_types: prev.task_types.includes(val)
        ? prev.task_types.filter((v) => v !== val)
        : [...prev.task_types, val],
    }));
  };

  const getAssignedNames = (task: any) => {
    const ids = Array.isArray(task.assigned_to_ids) ? task.assigned_to_ids : task.assigned_to ? [task.assigned_to] : [];
    return ids
      .map((id: string) => (members || []).find((m: any) => m.user_id === id || `wp-${m.id}` === id))
      .filter(Boolean)
      .map((m: any) => m.display_name || m.profile?.full_name || "Member");
  };

  const myWpId = userId ? `wp-${String(userId).replace(/^wp-/, "")}` : "";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Tasks ({pendingTasks.length} pending)</h3>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild><Button variant="coral" size="sm"><Plus className="h-4 w-4 mr-1" /> Add Task</Button></DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label>Task Title *</Label><Input value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Pick up medication" /></div>
              <div><Label>Description</Label><Textarea value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} placeholder="Details..." rows={2} /></div>

              <div>
                <Label>Task Types</Label>
                <div className="mt-2 grid grid-cols-2 gap-2 rounded-md border p-2">
                  {TASK_TYPE_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={newTask.task_types.includes(opt.value)} onCheckedChange={() => toggleTaskType(opt.value)} />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div><Label>Date</Label><Input type="date" value={newTask.task_date} onChange={e => setNewTask(p => ({ ...p, task_date: e.target.value }))} /></div>
                <div><Label>Start</Label><Input type="time" value={newTask.start_time} onChange={e => setNewTask(p => ({ ...p, start_time: e.target.value }))} /></div>
                <div><Label>End</Label><Input type="time" value={newTask.end_time} onChange={e => setNewTask(p => ({ ...p, end_time: e.target.value }))} /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><Label>Location</Label><Input value={newTask.location} onChange={e => setNewTask(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Pharmacy" /></div>
                <div><Label>People Needed</Label><Input type="number" min={1} value={newTask.people_needed} onChange={e => setNewTask(p => ({ ...p, people_needed: e.target.value }))} /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Help Status</Label>
                  <Select value={newTask.help_status} onValueChange={(v) => setNewTask(p => ({ ...p, help_status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">No help needed</SelectItem>
                      <SelectItem value="2">Needs help</SelectItem>
                      <SelectItem value="3">Help found</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
          {pendingTasks.map((t: any) => {
            const myAssignment = Array.isArray(t.assignees)
              ? t.assignees.find((a: any) => a.user_id === myWpId)
              : null;
            return (
            <div key={t.id} className="p-3 rounded-lg bg-card border group hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <button onClick={() => toggleTask(t.id, t.finish_status)} className="shrink-0"><Circle className="h-5 w-5 text-muted-foreground hover:text-primary" /></button>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleTask(t.id, t.finish_status)}>
                  <p className="text-sm font-medium text-foreground">{t.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {getAssignedNames(t).length > 0 && <span className="text-xs text-muted-foreground">{getAssignedNames(t).join(", ")}</span>}
                    {t.task_date && <span className="text-xs text-muted-foreground">{new Date(t.task_date).toLocaleDateString("en", { month: "short", day: "numeric" })}{t.start_time ? ` ${String(t.start_time).slice(11,16) || t.start_time}` : ""}</span>}
                    {t.location && <span className="text-xs text-muted-foreground">@ {t.location}</span>}
                    {Array.isArray(t.task_types) && t.task_types.map((tt: string) => {
                      const opt = TASK_TYPE_OPTIONS.find((o) => o.value === String(tt));
                      return opt ? <Badge key={tt} variant="secondary" className="text-[10px]">{opt.label}</Badge> : null;
                    })}
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
                  {myAssignment && myAssignment.response !== "accepted" && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-success hover:bg-success/10" title="Accept"
                      onClick={(e) => { e.stopPropagation(); updateAssignee.mutate({ taskId: t.id, userId: myWpId, status: "accepted" }, { onSuccess: () => toast({ title: "Accepted" }) }); }}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {myAssignment && myAssignment.response !== "rejected" && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" title="Decline"
                      onClick={(e) => { e.stopPropagation(); updateAssignee.mutate({ taskId: t.id, userId: myWpId, status: "rejected" }, { onSuccess: () => toast({ title: "Declined" }) }); }}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" title="Post to Job Board"
                    onClick={(e) => { e.stopPropagation(); createJob.mutate({ title: t.title, description: t.description || `Help needed with: ${t.title}`, job_source_type: "group_task", linked_task_id: t.id, linked_group_id: activeGroupId!, location: t.location || "" }, { onSuccess: () => toast({ title: "Posted to Job Board" }) }); }}>
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
            );
          })}
          {completedTasks.length > 0 && (
            <>
              <p className="text-xs font-medium text-muted-foreground pt-3 pb-1">Completed ({completedTasks.length})</p>
              {completedTasks.map((t: any) => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-transparent opacity-60 hover:opacity-80">
                  <button onClick={() => toggleTask(t.id, t.finish_status)} className="shrink-0"><CheckCircle className="h-5 w-5 text-success" /></button>
                  <p className="text-sm line-through text-muted-foreground flex-1 cursor-pointer" onClick={() => toggleTask(t.id, t.finish_status)}>{t.title}</p>
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
