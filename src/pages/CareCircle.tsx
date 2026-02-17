import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, Plus, CheckCircle, Circle, Clock, UserPlus, BookOpen, ListTodo, Loader2
} from "lucide-react";
import { useCareGroups, useCareGroupMembers, useCareTasks, useCreateTask, useUpdateTaskStatus, useCareGroupPosts, useCreateGroupPost } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";

export default function CareCircle() {
  const { toast } = useToast();
  const { data: groups, isLoading: groupsLoading } = useCareGroups();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const activeGroupId = selectedGroupId || (groups && groups.length > 0 ? groups[0].id : null);

  const { data: members } = useCareGroupMembers(activeGroupId);
  const { data: tasks, isLoading: tasksLoading } = useCareTasks(activeGroupId);
  const { data: posts } = useCareGroupPosts(activeGroupId);
  const createTask = useCreateTask();
  const updateTaskStatus = useUpdateTaskStatus();
  const createPost = useCreateGroupPost();

  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", assignee: "", priority: "medium", category: "Daily Living" });
  const [newEntry, setNewEntry] = useState("");

  const toggleTask = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    updateTaskStatus.mutate({ id, status: newStatus });
  };

  const addTask = () => {
    if (!newTask.title || !activeGroupId) return;
    createTask.mutate({
      title: newTask.title,
      group_id: activeGroupId,
      assigned_to: newTask.assignee || undefined,
      priority: newTask.priority,
      category: newTask.category,
      status: "pending",
    } as any, {
      onSuccess: () => {
        setNewTask({ title: "", assignee: "", priority: "medium", category: "Daily Living" });
        setAddTaskOpen(false);
        toast({ title: "Task added" });
      },
    });
  };

  const addJournalEntry = () => {
    if (!newEntry.trim() || !activeGroupId) return;
    createPost.mutate({
      group_id: activeGroupId,
      content: newEntry,
      type: "discussion",
    }, {
      onSuccess: () => {
        setNewEntry("");
        toast({ title: "Post added" });
      },
    });
  };

  const priorityColors: Record<string, string> = {
    high: "bg-destructive/10 text-destructive",
    urgent: "bg-destructive/10 text-destructive",
    medium: "bg-warning/10 text-warning",
    low: "bg-muted text-muted-foreground",
  };

  if (groupsLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 text-center">
        <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">No Care Groups Yet</h1>
        <p className="text-muted-foreground mb-6">Create a care group to coordinate care with your family and team.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Care Circle</h1>
          <p className="text-muted-foreground">Coordinate care with your team</p>
        </div>
        <Button variant="coral" size="sm">
          <UserPlus className="h-4 w-4 mr-2" /> Invite Member
        </Button>
      </div>

      {/* Group selector if multiple */}
      {groups.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {groups.map(g => (
            <Badge
              key={g.id}
              variant={activeGroupId === g.id ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedGroupId(g.id)}
            >
              {g.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Members */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-6">
        {(members || []).map((m: any) => (
          <Card key={m.id} className="min-w-[140px] border-transparent card-elevated">
            <CardContent className="p-4 text-center">
              <div className="relative mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                {m.profile?.avatar_url ? (
                  <img src={m.profile.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <span className="text-primary font-medium">{(m.profile?.full_name || "?").charAt(0)}</span>
                )}
              </div>
              <p className="text-sm font-medium text-foreground truncate">{m.profile?.full_name || "Member"}</p>
              <p className="text-xs text-muted-foreground">{m.relationship || (m.is_owner ? "Owner" : m.is_admin ? "Admin" : "Member")}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks" className="gap-2"><ListTodo className="h-4 w-4" /> Tasks</TabsTrigger>
          <TabsTrigger value="journal" className="gap-2"><BookOpen className="h-4 w-4" /> Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">{(tasks || []).filter((t: any) => t.status !== "completed").length} pending tasks</p>
            <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Task</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Care Task</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <Label>Task</Label>
                    <Input value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} placeholder="What needs to be done?" />
                  </div>
                  <div>
                    <Label>Assign to</Label>
                    <Select value={newTask.assignee} onValueChange={v => setNewTask(p => ({ ...p, assignee: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                      <SelectContent>
                        {(members || []).map((m: any) => <SelectItem key={m.user_id} value={m.user_id}>{m.profile?.full_name || "Member"}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Priority</Label>
                      <Select value={newTask.priority} onValueChange={(v: any) => setNewTask(p => ({ ...p, priority: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={newTask.category} onValueChange={v => setNewTask(p => ({ ...p, category: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Medical">Medical</SelectItem>
                          <SelectItem value="Daily Living">Daily Living</SelectItem>
                          <SelectItem value="Administrative">Administrative</SelectItem>
                          <SelectItem value="meal_prep">Meal Prep</SelectItem>
                          <SelectItem value="transportation">Transportation</SelectItem>
                          <SelectItem value="medication">Medication</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button variant="coral" className="w-full" onClick={addTask} disabled={createTask.isPending}>Add Task</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {tasksLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-2">
              {(tasks || []).map((t: any) => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border hover:border-primary/30 transition-colors cursor-pointer" onClick={() => toggleTask(t.id, t.status)}>
                  {t.status === "completed" ? (
                    <CheckCircle className="h-5 w-5 text-success shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${t.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{t.assignee_profile?.full_name || "Unassigned"}</span>
                      {t.due_date && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(t.due_date).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <Badge variant="outline" className={priorityColors[t.priority] || ""}>{t.priority}</Badge>
                  {t.category && <Badge variant="secondary" className="text-xs">{t.category}</Badge>}
                </div>
              ))}
              {(tasks || []).length === 0 && <p className="text-center py-8 text-muted-foreground">No tasks yet</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="journal" className="mt-4">
          <Card className="border-transparent card-elevated mb-6">
            <CardContent className="p-4">
              <Textarea value={newEntry} onChange={e => setNewEntry(e.target.value)} placeholder="Write a care update, note, or milestone..." className="mb-3" />
              <Button variant="coral" size="sm" onClick={addJournalEntry} disabled={!newEntry.trim() || createPost.isPending}>Post Update</Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {(posts || []).map((j: any) => (
              <Card key={j.id} className="border-transparent card-elevated">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {j.author?.avatar_url ? (
                          <img src={j.author.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <span className="text-primary text-sm font-medium">{(j.author?.full_name || "?").charAt(0)}</span>
                        )}
                      </div>
                      <span className="font-medium text-sm text-foreground">{j.author?.full_name || "Member"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{j.type}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(j.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                    </div>
                  </div>
                  {j.title && <p className="font-medium text-sm text-foreground mb-1">{j.title}</p>}
                  <p className="text-sm text-muted-foreground">{j.content}</p>
                </CardContent>
              </Card>
            ))}
            {(posts || []).length === 0 && <p className="text-center py-8 text-muted-foreground">No posts yet</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
