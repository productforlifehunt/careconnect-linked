import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Circle, Clock, Loader2, MapPin, Trash2 } from "lucide-react";
import { useCareTasks, useCreateTask, useUpdateTaskStatus, useDeleteTask } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/lib/locale";

const numId = (v: any) => String(v ?? "").replace(/^wp-/, "");

const EMPTY = { title: "", description: "", task_date: "", start_time: "", location: "" };

export function CareTasksCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const { data: allTasks, isLoading } = useCareTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTaskStatus();
  const del = useDeleteTask();
  const [tab, setTab] = useState("view");
  const [form, setForm] = useState({ ...EMPTY });

  // Tasks belong to this loved one through the task → loved one relation only.
  const tasks = useMemo(
    () => (allTasks || []).filter((t: any) => numId(t.cared_one_id) && numId(t.cared_one_id) === numId(caredOneId)),
    [allTasks, caredOneId],
  );
  const pending = tasks.filter((t: any) => String(t.finish_status) !== "b56");
  const done = tasks.filter((t: any) => String(t.finish_status) === "b56");

  const toggle = (t: any) => {
    const next = String(t.finish_status) === "b56" ? "b55" : "b56";
    updateTask.mutate({
      id: t.id,
      updates: { finish_status: next, completed_at: next === "b56" ? new Date().toISOString() : "" },
    });
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

  const row = (t: any) => (
    <Card key={t.id} className="border-transparent card-elevated">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <button type="button" className="mt-0.5 shrink-0" onClick={() => toggle(t)} aria-label={Z("切换完成", "Toggle done")}>
            {String(t.finish_status) === "b56"
              ? <CheckCircle className="h-5 w-5 text-success" />
              : <Circle className="h-5 w-5 text-muted-foreground" />}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={`font-medium text-sm ${String(t.finish_status) === "b56" ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.title}</h4>
              {t.help_status_label && String(t.help_status) !== "b55" && (
                <Badge variant="secondary" className="text-[10px]">{t.help_status_label}</Badge>
              )}
            </div>
            {t.description && <p className="text-xs text-muted-foreground mt-1">{t.description}</p>}
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground flex-wrap">
              {t.task_date && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(t.task_date)}{t.start_time ? ` · ${String(t.start_time).slice(0, 5)}` : ""}</span>}
              {t.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {t.location}</span>}
            </div>
          </div>
          <Button variant="ghost" size="icon" aria-label={Z(`删除 ${t.title}`, `Delete ${t.title}`) as string} className="h-7 w-7 text-destructive shrink-0" onClick={() => del.mutate(t.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>

        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">{Z("护理任务", "Care Tasks")}</h2>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="view" className="flex-1">{Z(`任务（${tasks.length}）`, `Tasks (${tasks.length})`)}</TabsTrigger>
          <TabsTrigger value="add" className="flex-1">{Z("新增", "Add New")}</TabsTrigger>
        </TabsList>
        <TabsContent value="view">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : tasks.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">{Z("还没有为这位家人安排任务。从「新增」标签添加一个。", 'No tasks for this person yet. Add one from the "Add New" tab.')}</p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">{pending.map(row)}</div>
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
    </div>
  );
}
