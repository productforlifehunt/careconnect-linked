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
import { Plus, CheckCircle, Circle, Loader2, Trash2, Briefcase, Check, X, Pencil, Clock, MapPin, Users, Search, HeartHandshake } from "lucide-react";
import { VisibilityPicker, EMPTY_VISIBILITY, type VisibilityValue } from "../VisibilityPicker";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { MediaAttachments, MediaAttachmentList } from "@/components/shared/MediaAttachments";
import { useToast } from "@/hooks/use-toast";
import { useUpdateAssigneeStatus, useSearchProfiles } from "@/hooks/use-care-data";
import { useTranslation } from "react-i18next";
import { formatDate, formatTime, formatDateTime } from "@/lib/locale";

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
  shareTask: any;
}

// Exact option codes from CCT 204 a57.
const TASK_TYPE_OPTIONS: { value: string; label: string; labelZh: string }[] = [
  { value: "b55", label: "Preparing Meals", labelZh: "准备餐食" },
  { value: "b56", label: "Giving Rides", labelZh: "交通接送" },
  { value: "b57", label: "Shopping", labelZh: "购物" },
  { value: "b58", label: "Childcare", labelZh: "儿童照护" },
  { value: "b59", label: "Visits", labelZh: "探访" },
  { value: "b60", label: "Coverage", labelZh: "替班照护" },
  { value: "b61", label: "Medications / Medical Care", labelZh: "用药与医疗护理" },
  { value: "b62", label: "Miscellaneous", labelZh: "其他" },
  { value: "b63", label: "Occasions", labelZh: "重要日子" },
];

const EMPTY_FORM = {
  title: "", description: "", assigneeIds: [] as string[],
  task_date: "", start_time: "", end_time: "",
  location: "", task_types: [] as string[],
  people_needed: "" as string, help_status: "b55",
  photo_ids: [] as number[],
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
  memberCategories, createTask, updateTaskStatus, deleteTask, shareTask,
}: TasksTabProps) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const updateAssignee = useUpdateAssigneeStatus();
  // Assignees can also be people outside this group — searched from all app users.
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const { data: assigneeResults, isFetching: assigneeSearching } = useSearchProfiles(assigneeSearch.trim());
  const [extraAssignees, setExtraAssignees] = useState<Record<string, string>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [shareConfirmTask, setShareConfirmTask] = useState<any | null>(null);
  const [sharePaid, setSharePaid] = useState(false);
  const [sharePrice, setSharePrice] = useState("");
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [visibility, setVisibility] = useState<VisibilityValue>(EMPTY_VISIBILITY);

  const isEditing = editingTaskId !== null;

  // Per data model: task itself only has `k` (help status) and `l` (finish status).
  const pendingTasks = (tasks || []).filter((t: any) => String(t.finish_status) === "b55");
  const completedTasks = (tasks || []).filter((t: any) => String(t.finish_status) === "b56");

  const helpStatusColors: Record<string, string> = {
    b55: "bg-muted text-muted-foreground",
    b56: "bg-warning/10 text-warning",
    b57: "bg-success/10 text-success",
  };
  const helpStatusLabels: Record<string, string> = {
    b55: Z("无需帮助", "No help needed"),
    b56: Z("需要帮助", "Needs help"),
    b57: Z("已找到帮助", "Help found"),
  };
  const responseColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    accepted: "bg-success/10 text-success",
    rejected: "bg-destructive/10 text-destructive",
  };

  const toggleTask = (id: string, currentFinish: string) => {
    const next = String(currentFinish) === "b56" ? "b55" : "b56";
    updateTaskStatus.mutate({ id, updates: { finish_status: next, completed_at: next === "b56" ? new Date().toISOString() : "" } });
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
      help_status: String(t.help_status),
      photo_ids: Array.isArray(t.photo_ids) ? t.photo_ids : [],
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
          photo_ids: form.photo_ids,
          assigned_to: form.assigneeIds.length ? form.assigneeIds : undefined,
        },
      }, {
        onSuccess: () => {
          setEditingTaskId(null);
          setForm({ ...EMPTY_FORM });
          setAddOpen(false);
          toast({ title: Z("任务已更新", "Task updated") });
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
        photo_ids: form.photo_ids,
        subgroupIds: visibility.subgroupIds,
        visibilityUserIds: visibility.userIds,
      } as any, {
        onSuccess: () => {
          setForm({ ...EMPTY_FORM });
          setVisibility(EMPTY_VISIBILITY);
          setAddOpen(false);
          toast({ title: Z("任务已添加", "Task added") });
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

  const confirmShareTask = () => {
    const t = shareConfirmTask;
    if (!t) return;
    shareTask.mutate({
      taskId: t.id,
      needs_payment: sharePaid,
      price: sharePaid ? sharePrice : "",
    }, {
      onSuccess: () => {
        toast({ title: Z("已分享出去找帮手", "Shared out for help") });
        setShareConfirmTask(null);
        setSharePaid(false);
        setSharePrice("");
      },
      onError: (err: any) => toast({
        title: Z("没能分享出去", "Couldn't share that"),
        description: err?.message || Z("请再试一次。", "Please try again."),
        variant: "destructive",
      }),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">{Z(`任务（${pendingTasks.length} 项待办）`, `Tasks (${pendingTasks.length} pending)`)}</h3>
        <Dialog open={addOpen} onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) { setEditingTaskId(null); setForm({ ...EMPTY_FORM }); }
        }}>
          <DialogTrigger asChild>
            <Button variant="coral" size="sm" onClick={() => { setEditingTaskId(null); setForm({ ...EMPTY_FORM }); }}>
              <Plus className="h-4 w-4 mr-1" /> {Z("添加任务", "Add Task")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{isEditing ? Z("编辑任务", "Edit Task") : Z("添加任务", "Add Task")}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label>{Z("任务标题 *", "Task Title *")}</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder={Z("例如：取药", "e.g. Pick up medication")} /></div>
              <div><Label>{Z("描述", "Description")}</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder={Z("详细说明……", "Details...")} rows={2} /></div>

              <div>
                <Label>{Z("任务类型", "Task Types")}</Label>
                <div className="mt-2 grid grid-cols-2 gap-2 rounded-md border p-2">
                  {TASK_TYPE_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={form.task_types.includes(opt.value)} onCheckedChange={() => toggleTaskType(opt.value)} />
                      <span>{isCN ? opt.labelZh : opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div><Label>{Z("日期", "Date")}</Label><Input type="date" value={form.task_date} onChange={e => setForm(p => ({ ...p, task_date: e.target.value }))} /></div>
                <div><Label>{Z("开始", "Start")}</Label><Input type="time" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} /></div>
                <div><Label>{Z("结束", "End")}</Label><Input type="time" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><Label>{Z("地点", "Location")}</Label><Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder={Z("例如：药房", "e.g. Pharmacy")} /></div>
                <div><Label>{Z("所需人数", "People Needed")}</Label><Input type="number" min={1} value={form.people_needed} onChange={e => setForm(p => ({ ...p, people_needed: e.target.value }))} /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{Z("帮助状态", "Help Status")}</Label>
                  <Select value={form.help_status} onValueChange={(v) => setForm(p => ({ ...p, help_status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                       <SelectItem value="b55">{Z("无需帮助", "No help needed")}</SelectItem>
                       <SelectItem value="b56">{Z("需要帮助", "Needs help")}</SelectItem>
                       <SelectItem value="b57">{Z("已找到帮助", "Help found")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>{Z("指派给", "Assign To")}</Label>
                  <div className="mt-2 max-h-32 overflow-auto rounded-md border p-2 space-y-2">
                    {(members || []).map((m: any) => {
                      const memberId = m.user_id || `wp-${m.id}`;
                      return (
                        <label key={memberId} className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox checked={form.assigneeIds.includes(memberId)} onCheckedChange={() => toggleAssignee(memberId)} />
                          <span>{m.display_name || Z("未填姓名", "No name")}</span>
                        </label>
                      );
                    })}
                    {(members || []).length === 0 && <p className="text-xs text-muted-foreground">{Z("暂无可选成员", "No members available")}</p>}
                  </div>

                  {/* Anyone with an account can be asked to help, not only group members. */}
                  <div className="mt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">{Z("搜索其他用户", "Search other people")}</p>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-8"
                        value={assigneeSearch}
                        onChange={(e) => setAssigneeSearch(e.target.value)}
                        placeholder={Z("输入姓名或邮箱（至少 2 个字符）", "Type a name or email (2+ characters)")}
                      />
                    </div>
                    {assigneeSearch.trim().length >= 2 && (
                      <div className="mt-2 max-h-32 overflow-auto rounded-md border p-2 space-y-2">
                        {assigneeSearching && <p className="text-xs text-muted-foreground">{Z("正在搜索…", "Searching…")}</p>}
                        {!assigneeSearching && (assigneeResults || []).length === 0 && (
                          <p className="text-xs text-muted-foreground">{Z("没有找到匹配的人", "No matching people found")}</p>
                        )}
                        {(assigneeResults || []).map((p: any) => {
                          const pid = String(p.id || "").startsWith("wp-") ? String(p.id) : `wp-${p.id}`;
                          const label = p.full_name || p.email || Z("用户", "Person");
                          const already = (members || []).some((m: any) => (m.user_id || `wp-${m.id}`) === pid);
                          return (
                            <label key={pid} className="flex items-center gap-2 text-sm cursor-pointer">
                              <Checkbox
                                checked={form.assigneeIds.includes(pid)}
                                onCheckedChange={() => {
                                  setExtraAssignees((prev) => ({ ...prev, [pid]: label }));
                                  toggleAssignee(pid);
                                }}
                              />
                              <span>{label}{already ? ` · ${Z("已是成员", "already a member")}` : ""}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                    {form.assigneeIds.filter((id) => extraAssignees[id] && !(members || []).some((m: any) => (m.user_id || `wp-${m.id}`) === id)).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {form.assigneeIds
                          .filter((id) => extraAssignees[id] && !(members || []).some((m: any) => (m.user_id || `wp-${m.id}`) === id))
                          .map((id) => (
                            <Badge key={id} variant="secondary" className="gap-1">
                              {extraAssignees[id]}
                              <button type="button" onClick={() => toggleAssignee(id)} aria-label={Z("移除", "Remove")}>
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label>{Z("照片", "Photos")}</Label>
                <div className="mt-2">
                  <MediaAttachments
                    value={form.photo_ids}
                    onChange={(ids) => setForm(p => ({ ...p, photo_ids: ids }))}
                    accept="image/*"
                    label={Z("上传照片", "Upload photos")}
                  />
                </div>
              </div>

              {!isEditing && (
                <div><Label>{Z("可见范围", "Visibility")}</Label><VisibilityPicker value={visibility} onChange={setVisibility} memberCategories={memberCategories} members={members} allowExclude={false} /></div>
              )}
              <Button variant="coral" className="w-full" onClick={submitForm} disabled={createTask.isPending || updateTaskStatus.isPending || !form.title.trim()}>
                {(createTask.isPending || updateTaskStatus.isPending) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                {isEditing ? Z("保存更改", "Save Changes") : Z("添加任务", "Add Task")}
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
              ? formatDate(dateOnly(t.task_date) + "T00:00", isCN ? "zh-CN" : "en", { month: "short", day: "numeric" })
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
                          <Users className="h-3 w-3" />{Z(`需要 ${t.people_needed} 人`, `${t.people_needed} needed`)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {Array.isArray(t.task_types) && t.task_types.map((tt: string) => {
                        const opt = TASK_TYPE_OPTIONS.find((o) => o.value === String(tt));
                        return opt ? <Badge key={tt} variant="secondary" className="text-[10px]">{isCN ? opt.labelZh : opt.label}</Badge> : null;
                      })}
                      {Array.isArray(t.assignees) && t.assignees.map((a: any) => {
                        const m = (members || []).find((mm: any) => mm.user_id === a.user_id || `wp-${mm.id}` === a.user_id);
                        const name = m?.display_name || Z("未填姓名", "No name");
                        const respLabel = isCN
                          ? (a.response === "accepted" ? "已接受" : a.response === "rejected" ? "已拒绝" : "待回应")
                          : a.response;
                        return (
                          <Badge key={a.user_id} variant="outline" className={`text-[10px] ${responseColors[a.response] || ""}`}>
                            {name}: {respLabel}
                          </Badge>
                        );
                      })}
                    </div>
                    {Array.isArray(t.photo_ids) && t.photo_ids.length > 0 && <MediaAttachmentList ids={t.photo_ids} />}
                  </div>
                   <Badge variant="outline" className={`shrink-0 ${helpStatusColors[String(t.help_status)]}`}>
                     {helpStatusLabels[String(t.help_status)]}
                  </Badge>
                  <div className="flex gap-1 shrink-0">
                    {myAssignment && myAssignment.response !== "accepted" && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-success hover:bg-success/10" title={Z("接受", "Accept")}
                        onClick={() => updateAssignee.mutate({ taskId: t.id, userId: myWpId, status: "accepted" }, { onSuccess: () => toast({ title: Z("已接受", "Accepted") }) })}>
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {myAssignment && myAssignment.response !== "rejected" && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" title={Z("拒绝", "Decline")}
                        onClick={() => updateAssignee.mutate({ taskId: t.id, userId: myWpId, status: "rejected" }, { onSuccess: () => toast({ title: Z("已拒绝", "Declined") }) })}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7" title={Z("发布到护理工作板", "Post to Job Board")}
                      onClick={() => setShareConfirmTask(t)}>
                      <Briefcase className="h-3.5 w-3.5" />
                    </Button>
                    {canEdit && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" title={Z("编辑", "Edit")}
                        onClick={() => openEdit(t)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {canEdit && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" title={Z("删除", "Delete")}
                        onClick={() => deleteTask.mutate(t.id, { onSuccess: () => toast({ title: Z("任务已删除", "Task deleted") }) })}>
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
              <p className="text-xs font-medium text-muted-foreground pt-3 pb-1">{Z(`已完成（${completedTasks.length}）`, `Completed (${completedTasks.length})`)}</p>
              {completedTasks.map((t: any) => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-transparent opacity-60 hover:opacity-80">
                  <button onClick={() => toggleTask(t.id, t.finish_status)} className="shrink-0"><CheckCircle className="h-5 w-5 text-success" /></button>
                  <p className="text-sm line-through text-muted-foreground flex-1 cursor-pointer" onClick={() => toggleTask(t.id, t.finish_status)}>{t.title}</p>
                  {(isAdmin || t.created_by === userId) && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => deleteTask.mutate(t.id, { onSuccess: () => toast({ title: Z("任务已删除", "Task deleted") }) })}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </>
          )}
          {(tasks || []).length === 0 && <p className="text-center py-8 text-muted-foreground">{Z("还没有任务。点击「添加任务」创建。", 'No tasks yet. Click "Add Task" to create one.')}</p>}
        </div>
      )}

      <AlertDialog open={!!shareConfirmTask} onOpenChange={(open) => { if (!open) { setShareConfirmTask(null); setSharePaid(false); setSharePrice(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{Z("分享这件事去找帮手？", "Share this task for help?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {Z(`「${shareConfirmTask?.title ?? ""}」会出现在「需要帮手的任务」里，护理小组以外的人也能看到并表示愿意帮忙。`,
                 `"${shareConfirmTask?.title}" will appear under Tasks Needing Help, so people outside your group can offer to help.`)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox checked={sharePaid} onCheckedChange={(v) => setSharePaid(!!v)} />
              {Z("这件事有报酬", "I'm offering payment")}
            </label>
            {sharePaid && (
              <div>
                <Label className="text-xs">{Z("报酬（自己写，例如「每小时 80 元」）", "Payment (free text, e.g. \"$25/hour\")")}</Label>
                <Input value={sharePrice} onChange={(e) => setSharePrice(e.target.value)} className="mt-1" />
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{Z("取消", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmShareTask} disabled={shareTask.isPending}>
              {shareTask.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <HeartHandshake className="h-4 w-4 mr-2" />}
              {Z("分享找帮手", "Share for help")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
