import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, CheckCircle, Circle, Loader2, Trash2, Briefcase, Check, X, Pencil, Clock, MapPin, Users } from "lucide-react";
import { VisibilityPicker, EMPTY_VISIBILITY, type VisibilityValue } from "../VisibilityPicker";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { useToast } from "@/hooks/use-toast";
import { useUpdateAssigneeStatus } from "@/hooks/use-care-data";
import { useTranslation } from "react-i18next";

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
const TASK_TYPE_OPTIONS: { value: string; label: string; labelZh: string }[] = [
  { value: "1", label: "Preparing Meals", labelZh: "准备餐食" },
  { value: "2", label: "Shopping/Errands", labelZh: "购物 / 跑腿" },
  { value: "3", label: "Transportation", labelZh: "交通接送" },
  { value: "4", label: "Personal Care", labelZh: "个人护理" },
  { value: "5", label: "Medication", labelZh: "用药" },
  { value: "6", label: "Companionship", labelZh: "陪伴" },
  { value: "7", label: "Housekeeping", labelZh: "家务清洁" },
  { value: "8", label: "Medical Appointments", labelZh: "就医预约" },
  { value: "9", label: "Occasions", labelZh: "重要日子" },
];

const EMPTY_FORM = {
  title: "", description: "", assigneeIds: [] as string[],
  task_date: "", start_time: "", end_time: "",
  location: "", task_types: [] as string[],
  people_needed: "" as string, help_status: "1",
};

const fmtTime = (raw?: string | null): string => {
  if (!raw) return "";
  const m = String(raw).match(/(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : "";
};

const dateOnly = (raw?: string | null): string => {
  if (!raw) return "";
  return String(raw).split("T")[0].split(" ")[0];
};

export function TasksTab({
  tasks, tasksLoading, members, activeGroupId, userId, isAdmin,
  memberCategories, createTask, updateTaskStatus, deleteTask, createJob,
}: TasksTabProps) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const updateAssignee = useUpdateAssigneeStatus();
  const [addOpen, setAddOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [jobConfirmTask, setJobConfirmTask] = useState<any | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [visibility, setVisibility] = useState<VisibilityValue>(EMPTY_VISIBILITY);

  const isEditing = editingTaskId !== null;

  // Per data model: task itself only has `k` (help status) and `l` (finish status).
  const pendingTasks = (tasks || []).filter((t: any) => String(t.finish_status ?? "1") !== "2");
  const completedTasks = (tasks || []).filter((t: any) => String(t.finish_status ?? "1") === "2");

  const helpStatusColors: Record<string, string> = {
    "1": "bg-muted text-muted-foreground",
    "2": "bg-warning/10 text-warning",
    "3": "bg-success/10 text-success",
  };
  const helpStatusLabels: Record<string, string> = {
    "1": Z("无需帮助", "No help needed"),
    "2": Z("需要帮助", "Needs help"),
    "3": Z("已找到帮助", "Help found"),
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

  const openEdit = (t: any) => {
    setEditingTaskId(t.id);
    setForm({
      title: t.title || "",
      description: t.description || "",
      assigneeIds: Array.isArray(t.assigned_to_ids) ? t.assigned_to_ids : [],
      task_date: dateOnly(t.task_date),
      start_time: fmtTime(t.start_time),
      end_time: fmtTime(t.end_time),
      location: t.location || "",
      task_types: Array.isArray(t.task_types) ? t.task_types.map(String) : [],
      people_needed: t.people_needed != null ? String(t.people_needed) : "",
      help_status: String(t.help_status ?? "1"),
    });
    setVisibility(EMPTY_VISIBILITY);
    setAddOpen(true);
  };

  const submitForm = () => {
    if (!form.title || !activeGroupId) return;
    if (isEditing) {
      updateTaskStatus.mutate({
        id: editingTaskId!,
        updates: {
          title: form.title,
          description: form.description,
          task_date: form.task_date,
          start_time: form.start_time,
          end_time: form.end_time,
          location: form.location,
          task_types: form.task_types,
          people_needed: form.people_needed ? Number(form.people_needed) : undefined,
          help_status: form.help_status,
          assigned_to: form.assigneeIds.length ? form.assigneeIds : undefined,
        },
      }, {
        onSuccess: () => {
          setEditingTaskId(null);
          setForm({ ...EMPTY_FORM });
          setAddOpen(false);
          toast({ title: "Task updated" });
        },
      });
    } else {
      createTask.mutate({
        title: form.title,
        description: form.description || undefined,
        group_id: activeGroupId,
        assigned_to: form.assigneeIds.length ? form.assigneeIds : undefined,
        task_date: form.task_date || undefined,
        start_time: form.start_time || undefined,
        end_time: form.end_time || undefined,
        location: form.location || undefined,
        task_types: form.task_types.length ? form.task_types : undefined,
        people_needed: form.people_needed ? Number(form.people_needed) : undefined,
        help_status: form.help_status,
        subgroupIds: visibility.subgroupIds,
        visibilityUserIds: visibility.userIds,
      } as any, {
        onSuccess: () => {
          setForm({ ...EMPTY_FORM });
          setVisibility(EMPTY_VISIBILITY);
          setAddOpen(false);
          toast({ title: "Task added" });
        },
      });
    }
  };

  const toggleAssignee = (memberId: string) => {
    setForm((prev) => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(memberId)
        ? prev.assigneeIds.filter((id) => id !== memberId)
        : [...prev.assigneeIds, memberId],
    }));
  };

  const toggleTaskType = (val: string) => {
    setForm((prev) => ({
      ...prev,
      task_types: prev.task_types.includes(val)
        ? prev.task_types.filter((v) => v !== val)
        : [...prev.task_types, val],
    }));
  };

  const myWpId = userId ? `wp-${String(userId).replace(/^wp-/, "")}` : "";

  const confirmPostJob = () => {
    const t = jobConfirmTask;
    if (!t) return;
    createJob.mutate({
      title: t.title,
      description: t.description || `Help needed with: ${t.title}`,
      job_source_type: "group_task",
      linked_task_id: t.id,
      linked_group_id: activeGroupId!,
      location: t.location || "",
    }, {
      onSuccess: () => {
        toast({ title: "Posted to Job Board" });
        setJobConfirmTask(null);
      },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Tasks ({pendingTasks.length} pending)</h3>
        <Dialog open={addOpen} onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) { setEditingTaskId(null); setForm({ ...EMPTY_FORM }); }
        }}>
          <DialogTrigger asChild>
            <Button variant="coral" size="sm" onClick={() => { setEditingTaskId(null); setForm({ ...EMPTY_FORM }); }}>
              <Plus className="h-4 w-4 mr-1" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{isEditing ? "Edit Task" : "Add Task"}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label>Task Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Pick up medication" /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Details..." rows={2} /></div>

              <div>
                <Label>Task Types</Label>
                <div className="mt-2 grid grid-cols-2 gap-2 rounded-md border p-2">
                  {TASK_TYPE_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={form.task_types.includes(opt.value)} onCheckedChange={() => toggleTaskType(opt.value)} />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div><Label>Date</Label><Input type="date" value={form.task_date} onChange={e => setForm(p => ({ ...p, task_date: e.target.value }))} /></div>
                <div><Label>Start</Label><Input type="time" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} /></div>
                <div><Label>End</Label><Input type="time" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><Label>Location</Label><Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Pharmacy" /></div>
                <div><Label>People Needed</Label><Input type="number" min={1} value={form.people_needed} onChange={e => setForm(p => ({ ...p, people_needed: e.target.value }))} /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Help Status</Label>
                  <Select value={form.help_status} onValueChange={(v) => setForm(p => ({ ...p, help_status: v }))}>
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
                          <Checkbox checked={form.assigneeIds.includes(memberId)} onCheckedChange={() => toggleAssignee(memberId)} />
                          <span>{m.display_name || m.profile?.full_name || "Member"}</span>
                        </label>
                      );
                    })}
                    {(members || []).length === 0 && <p className="text-xs text-muted-foreground">No members available</p>}
                  </div>
                </div>
              </div>

              {!isEditing && (
                <div><Label>Visibility</Label><VisibilityPicker value={visibility} onChange={setVisibility} memberCategories={memberCategories} members={members} /></div>
              )}
              <Button variant="coral" className="w-full" onClick={submitForm} disabled={createTask.isPending || updateTaskStatus.isPending || !form.title.trim()}>
                {(createTask.isPending || updateTaskStatus.isPending) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                {isEditing ? "Save Changes" : "Add Task"}
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
            const start = fmtTime(t.start_time);
            const end = fmtTime(t.end_time);
            const dateStr = t.task_date
              ? new Date(dateOnly(t.task_date) + "T00:00").toLocaleDateString("en", { month: "short", day: "numeric" })
              : "";
            const canEdit = isAdmin || t.created_by === userId;
            return (
              <div key={t.id} className="p-3 rounded-lg bg-card border group hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleTask(t.id, t.finish_status)} className="shrink-0 mt-0.5">
                    <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{t.title}</p>
                    {t.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{t.description}</p>}

                    <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-muted-foreground">
                      {(dateStr || start) && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {dateStr}{dateStr && start ? " · " : ""}{start}{end ? `–${end}` : ""}
                        </span>
                      )}
                      {t.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{t.location}
                        </span>
                      )}
                      {t.people_needed != null && t.people_needed !== "" && Number(t.people_needed) > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3 w-3" />{t.people_needed} needed
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
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
                  <Badge variant="outline" className={`shrink-0 ${helpStatusColors[String(t.help_status ?? "1")] || ""}`}>
                    {helpStatusLabels[String(t.help_status ?? "1")] || "No help needed"}
                  </Badge>
                  <div className="flex gap-1 shrink-0">
                    {myAssignment && myAssignment.response !== "accepted" && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-success hover:bg-success/10" title="Accept"
                        onClick={() => updateAssignee.mutate({ taskId: t.id, userId: myWpId, status: "accepted" }, { onSuccess: () => toast({ title: "Accepted" }) })}>
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {myAssignment && myAssignment.response !== "rejected" && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" title="Decline"
                        onClick={() => updateAssignee.mutate({ taskId: t.id, userId: myWpId, status: "rejected" }, { onSuccess: () => toast({ title: "Declined" }) })}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Post to Job Board"
                      onClick={() => setJobConfirmTask(t)}>
                      <Briefcase className="h-3.5 w-3.5" />
                    </Button>
                    {canEdit && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit"
                        onClick={() => openEdit(t)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {canEdit && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" title="Delete"
                        onClick={() => deleteTask.mutate(t.id, { onSuccess: () => toast({ title: "Task deleted" }) })}>
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

      <AlertDialog open={!!jobConfirmTask} onOpenChange={(open) => !open && setJobConfirmTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Post to Job Board?</AlertDialogTitle>
            <AlertDialogDescription>
              This will publish "{jobConfirmTask?.title}" to the public Job Board so caregivers outside your group can apply to help.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPostJob} disabled={createJob.isPending}>
              {createJob.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Briefcase className="h-4 w-4 mr-2" />}
              Post Job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
