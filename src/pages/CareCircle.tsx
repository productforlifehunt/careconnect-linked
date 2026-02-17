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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users, Plus, CheckCircle, Circle, Clock, UserPlus, BookOpen, ListTodo
} from "lucide-react";
import { careCircleMembers, careTasks, journalEntries, CareTask, JournalEntry } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

export default function CareCircle() {
  const { toast } = useToast();
  const [members] = useState(careCircleMembers);
  const [tasks, setTasks] = useState<CareTask[]>(careTasks);
  const [journal, setJournal] = useState<JournalEntry[]>(journalEntries);
  const [newEntry, setNewEntry] = useState("");
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", assignee: "", priority: "medium" as CareTask["priority"], category: "Daily Living" });

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === "completed" ? "pending" : "completed" } : t));
  };

  const addTask = () => {
    if (!newTask.title) return;
    const task: CareTask = {
      id: "t-" + Date.now(),
      title: newTask.title,
      assignee: newTask.assignee || "Unassigned",
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      status: "pending",
      priority: newTask.priority,
      category: newTask.category,
    };
    setTasks(prev => [task, ...prev]);
    setNewTask({ title: "", assignee: "", priority: "medium", category: "Daily Living" });
    setAddTaskOpen(false);
    toast({ title: "Task added" });
  };

  const addJournalEntry = () => {
    if (!newEntry.trim()) return;
    const entry: JournalEntry = {
      id: "j-" + Date.now(),
      author: "You",
      date: new Date().toISOString().split("T")[0],
      content: newEntry,
      type: "update",
    };
    setJournal(prev => [entry, ...prev]);
    setNewEntry("");
    toast({ title: "Journal entry added" });
  };

  const priorityColors: Record<string, string> = {
    high: "bg-destructive/10 text-destructive",
    medium: "bg-warning/10 text-warning",
    low: "bg-muted text-muted-foreground",
  };

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

      {/* Members */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-6">
        {members.map(m => (
          <Card key={m.id} className="min-w-[140px] border-transparent card-elevated">
            <CardContent className="p-4 text-center">
              <div className="relative mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <span className="text-primary font-medium">{m.name.charAt(0)}</span>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${m.status === "online" ? "bg-success" : "bg-muted-foreground/30"}`} />
              </div>
              <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.role}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks" className="gap-2"><ListTodo className="h-4 w-4" /> Tasks</TabsTrigger>
          <TabsTrigger value="journal" className="gap-2"><BookOpen className="h-4 w-4" /> Journal</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">{tasks.filter(t => t.status !== "completed").length} pending tasks</p>
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
                        {members.map(m => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
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
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button variant="coral" className="w-full" onClick={addTask}>Add Task</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            {tasks.map(t => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border hover:border-primary/30 transition-colors cursor-pointer" onClick={() => toggleTask(t.id)}>
                {t.status === "completed" ? (
                  <CheckCircle className="h-5 w-5 text-success shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${t.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{t.assignee}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(t.dueDate).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                  </p>
                </div>
                <Badge variant="outline" className={priorityColors[t.priority]}>{t.priority}</Badge>
                <Badge variant="secondary" className="text-xs">{t.category}</Badge>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="journal" className="mt-4">
          <Card className="border-transparent card-elevated mb-6">
            <CardContent className="p-4">
              <Textarea value={newEntry} onChange={e => setNewEntry(e.target.value)} placeholder="Write a care update, note, or milestone..." className="mb-3" />
              <Button variant="coral" size="sm" onClick={addJournalEntry} disabled={!newEntry.trim()}>Post Update</Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {journal.map(j => (
              <Card key={j.id} className="border-transparent card-elevated">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-sm font-medium">{j.author.charAt(0)}</span>
                      </div>
                      <span className="font-medium text-sm text-foreground">{j.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{j.type}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(j.date).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{j.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
