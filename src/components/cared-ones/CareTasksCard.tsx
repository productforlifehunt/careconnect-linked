import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Circle, Clock, Loader2, MapPin, ChevronRight, RotateCcw, Plus } from "lucide-react";
import { useCareTasks, useCreateTask, useUpdateTaskStatus, useDeleteTask } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/lib/locale";
import { RowActions } from "./RowActions";
import { RecordDetailDialog } from "./RecordDetailDialog";
import { isPendingCareTask, pendingCareTasks } from "@/features/care-tasks/pending";

const numId = (v: any) => String(v ?? "").replace(/^wp-/, "");

const EMPTY = { title: "", description: "", task_date: "", start_time: "", location: "" };

export function CareTasksCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const { data: allTasks, isLoading, error, refetch } = useCareTasks(
    undefined,
    true,
    false,
    { caredOneOnly: true, includeAssignmentStatus: false },
  );
  const createTask = useCreateTask();
  const updateTask = useUpdateTaskStatus();
  const del = useDeleteTask();
  const [tab, setTab] = useState("view");
  const [form, setForm] = useState({ ...EMPTY });
  const [openId, setOpenId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY });

  // Tasks belong to this cared one through the task → cared one relation only.
  const tasks = useMemo(
    () => (allTasks || []).filter((t: any) => numId(t.cared_one_id) && numId(t.cared_one_id) === numId(caredOneId)),
    [allTasks, caredOneId],
  );
  const pending = pendingCareTasks(tasks, [caredOneId]);
  const done = tasks.filter((t: any) => String(t.finish_status) === "b56");
  const open = tasks.find((t: any) => String(t.id) === String(openId));

  const setStatus = (t: any, next: "b55" | "b56") => {
    updateTask.mutate(
      { id: t.id, updates: { finish_status: next, completed_at: next === "b56" ? new Date().toISOString() : "" } },
      {
        onSuccess: () => toast({ title: next === "b56" ? Z("已标记完成", "Marked as done") : Z("已改回未完成", "Marked as not done") }),
        onError: () => toast({ title: Z("没能更新这个任务，请再试一次。", "Couldn't update that task. Please try again."), variant: "destructive" }),
      },
    );
  };

  const startEdit = (t: any) => {
    setEditId(String(t.id));
    setEditForm({
      title: t.title || "",
      description: t.description || "",
      task_date: t.task_date ? String(t.task_date).slice(0, 10) : "",
      start_time: t.start_time ? String(t.start_time).slice(0, 5) : "",
      location: t.location || "",
    });
    setOpenId(null);
  };

  const saveEdit = () => {
    if (!editId || !editForm.title) return;
    updateTask.mutate(
      {
        id: editId,
        updates: {
          title: editForm.title,
          description: editForm.description,
          task_date: editForm.task_date,
          start_time: editForm.start_time,
          location: editForm.location,
        } as any,
      },
      {
        onSuccess: () => { setEditId(null); toast({ title: Z("任务已更新", "Task updated") }); },
        onError: () => toast({ title: Z("没能保存修改，请再试一次。", "Couldn't save the changes. Please try again."), variant: "destructive" }),
      },
    );
  };

  const submit = () => {
    if (!form.title) return;
    createTask.mutate({
      title: form.title,
      description: form.description || undefined,
      task_date: form.task_date || undefined,
      start_time: form.start_time || undefined,
      location: form.location || undefined,
      cared_one_id: caredOneId,
    } as any, {
      onSuccess: () => { setForm({ ...EMPTY }); setTab("view"); toast({ title: Z("任务已添加", "Task added") }); },
      onError: () => toast({ title: Z("没能添加这个任务，请再试一次。", "Couldn't add that task. Please try again."), variant: "destructive" }),
    });
  };

  const editFields = (
    <div className="space-y-3">
      <Input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} placeholder={Z("任务名称", "Task name")} />
      <Textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder={Z("需要做什么？", "What needs to be done?")} />
      <div className="grid grid-cols-2 gap-3">
        <Input type="date" value={editForm.task_date} onChange={e => setEditForm(p => ({ ...p, task_date: e.target.value }))} />
        <Input type="time" value={editForm.start_time} onChange={e => setEditForm(p => ({ ...p, start_time: e.target.value }))} />
      </div>
      <Input value={editForm.location} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))} placeholder={Z("地点（可留空）", "Place (optional)")} />
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={() => setEditId(null)}>{Z("取消", "Cancel")}</Button>
        <Button variant="coral" size="sm" onClick={saveEdit} disabled={updateTask.isPending || !editForm.title}>{Z("保存", "Save")}</Button>
      </div>
    </div>
  );

  const row = (t: any) => (
    <Card key={t.id} className="border-transparent card-elevated">
      <CardContent className="p-4">
        {editId === String(t.id) ? editFields : (
          <div className="flex items-start gap-2">
          <button
            type="button"
            className="min-w-0 flex-1 text-left flex items-start gap-3"
            onClick={() => setOpenId(String(t.id))}
            aria-label={Z(`打开任务 ${t.title}`, `Open task ${t.title}`) as string}
          >
            <span className="mt-0.5 shrink-0">
              {String(t.finish_status) === "b56"
                ? <CheckCircle className="h-5 w-5 text-success" />
                : <Circle className="h-5 w-5 text-muted-foreground" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 flex-wrap">
                <span className={`font-medium text-sm ${String(t.finish_status) === "b56" ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.title}</span>
                {t.help_status_label && String(t.help_status) !== "b55" && (
                  <Badge variant="secondary" className="text-[10px]">{t.help_status_label}</Badge>
                )}
              </span>
              {t.description && <span className="block text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</span>}
              <span className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground flex-wrap">
                {t.task_date && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(t.task_date)}{t.start_time ? ` · ${String(t.start_time).slice(0, 5)}` : ""}</span>}
                {t.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {t.location}</span>}
              </span>
            </span>
          </button>
          <RowActions onEdit={() => startEdit(t)} onDelete={() => del.mutateAsync(t.id)} />
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">{Z("护理任务", "Care Tasks")} <Badge variant="secondary">{isLoading || error ? "—" : pending.length}</Badge></h2>
        {tab === "add"
          ? <Button size="sm" variant="ghost" onClick={() => setTab("view")}>{Z("取消", "Cancel")}</Button>
          : <Button size="sm" onClick={() => setTab("add")}><Plus className="h-4 w-4 mr-1" /> {Z("添加", "Add")}</Button>}
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsContent value="view">
          {error ? <div role="alert" className="space-y-2 py-8 text-center"><p className="text-destructive">{Z("任务读取失败", "Tasks could not be loaded")}</p><Button variant="outline" onClick={() => void refetch()}>{Z("重试", "Retry")}</Button></div> : isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : tasks.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">{Z("没有待处理任务", "No pending tasks")}</p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2"><p className="text-xs font-medium text-muted-foreground">{Z(`待处理（${pending.length}）`, `Pending (${pending.length})`)}</p>{pending.length > 0 ? pending.map(row) : <p className="text-sm text-muted-foreground">{Z("没有待处理任务", "No pending tasks")}</p>}</div>
              {done.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">{Z(`已完成（${done.length}）`, `Completed (${done.length})`)}</p>
                  {done.map(row)}
                </div>
              )}
            </div>
          )}
        </TabsContent>
        <TabsContent value="add">
          <Card className="border-transparent card-elevated"><CardContent className="p-5 space-y-3">
            <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder={Z("任务名称，例如「陪同看医生」", "Task name, e.g. Take to the doctor")} />
            <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder={Z("需要做什么？", "What needs to be done?")} />
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" value={form.task_date} onChange={e => setForm(p => ({ ...p, task_date: e.target.value }))} />
              <Input type="time" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} />
            </div>
            <Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder={Z("地点（可留空）", "Place (optional)")} />
            <Button variant="coral" className="w-full" onClick={submit} disabled={createTask.isPending || !form.title}>
              {createTask.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}{Z("添加任务", "Add Task")}
            </Button>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {open && (
        <RecordDetailDialog
          open={!!openId}
          onOpenChange={(v) => !v && setOpenId(null)}
          title={open.title}
          rows={[
            { label: Z("状态", "Status"), value: String(open.finish_status) === "b56" ? Z("已完成", "Done") : Z("未完成", "Not done") },
            { label: Z("说明", "Details"), value: open.description },
            { label: Z("日期", "Date"), value: open.task_date ? formatDate(open.task_date) : undefined },
            { label: Z("时间", "Time"), value: open.start_time ? String(open.start_time).slice(0, 5) : undefined },
            { label: Z("地点", "Place"), value: open.location },
            { label: Z("协助状态", "Help status"), value: String(open.help_status) !== "b55" ? open.help_status_label : undefined },
          ]}
          actions={String(open.finish_status) === "b56" ? (
            <Button variant="outline" size="sm" onClick={() => { setStatus(open, "b55"); setOpenId(null); }} disabled={updateTask.isPending}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> {Z("改回未完成", "Mark as not done")}
            </Button>
          ) : (
            <Button variant="coral" size="sm" onClick={() => { setStatus(open, "b56"); setOpenId(null); }} disabled={updateTask.isPending}>
              <CheckCircle className="h-3.5 w-3.5 mr-1" /> {Z("标记完成", "Mark as done")}
            </Button>
          )}
          onEdit={() => startEdit(open)}
          onDelete={() => del.mutate(open.id, {
            onSuccess: () => { setOpenId(null); toast({ title: Z("任务已删除", "Task deleted") }); },
            onError: () => toast({ title: Z("没能删除这个任务", "Couldn't delete that task"), variant: "destructive" }),
          })}
          isDeleting={del.isPending}
        />
      )}
    </div>
  );
}
