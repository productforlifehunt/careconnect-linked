import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HeartHandshake, MapPin, Search, Loader2, Send, User, ChevronDown, ChevronUp,
  Check, X, Clock, Tag, Coins,
} from "lucide-react";
import {
  useHelpTasks, useMyHelpTasks, useMyTaskApplications, useTaskApplicants,
  useApplyToSharedTask, useDecideTaskApplicant, useUnshareTask, useStartConversation,
} from "@/hooks/use-care-data";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/lib/locale";

export default function TasksNeedingHelp() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const zh = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (zh ? cn : en);
  const startConversation = useStartConversation();
  const { isAuthenticated } = useAuth();

  const [payFilter, setPayFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("browse");
  const [applyOpen, setApplyOpen] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const { data: tasks, isLoading } = useHelpTasks(
    payFilter === "all" ? undefined : { paid: payFilter === "paid" },
  );
  const { data: myApps } = useMyTaskApplications();
  const { data: myShared, isLoading: mySharedLoading } = useMyHelpTasks();
  const applyToTask = useApplyToSharedTask();

  const handleApply = (taskId: string) => {
    if (!message.trim()) return;
    applyToTask.mutate({ taskId, message }, {
      onSuccess: () => {
        setMessage("");
        setApplyOpen(null);
        toast({ title: Z("已告诉对方你想帮忙", "Your offer to help was sent") });
      },
      onError: (err: any) => toast({
        title: Z("没能送出", "Couldn't send that"),
        description: err?.message || Z("请再试一次。", "Please try again."),
        variant: "destructive",
      }),
    });
  };

  const appliedIds = new Set((myApps || []).map((a: any) => String(a.task_id)));
  const mineIds = new Set((myShared || []).map((t: any) => String(t.id)));

  const filtered = (tasks || []).filter((t: any) =>
    !searchQuery
    || t.title?.toLowerCase().includes(searchQuery.toLowerCase())
    || t.description?.toLowerCase().includes(searchQuery.toLowerCase()));

  const priceLabel = (t: any) => (t.needs_payment
    ? (t.price ? `${Z("报酬", "Pays")} ${t.price}` : Z("有报酬", "Paid"))
    : Z("互助（无报酬）", "Volunteer"));

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{Z("需要帮手的护理任务", "Care Tasks Needing Help")}</h1>
        <p className="text-muted-foreground text-sm">
          {Z("这些任务由家人分享出来找人帮忙，你也可以在护理圈里把自己的任务分享出来。",
             "Tasks families shared out for help. You can share your own from your care circle.")}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={Z("搜索任务……", "Search tasks...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={payFilter} onValueChange={setPayFilter}>
          <SelectTrigger className="w-full sm:w-[170px] shrink-0"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{Z("全部", "All tasks")}</SelectItem>
            <SelectItem value="paid">{Z("有报酬", "Paid")}</SelectItem>
            <SelectItem value="free">{Z("互助（无报酬）", "Volunteer")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto -mx-4 px-4 scrollbar-none">
          <TabsList className="w-max">
            <TabsTrigger value="browse">{Z("浏览", "Browse")} ({filtered.length})</TabsTrigger>
            <TabsTrigger value="my-offers">{Z("我要帮的", "My Offers")} ({(myApps || []).length})</TabsTrigger>
            {isAuthenticated && (
              <TabsTrigger value="my-shared">{Z("我分享的", "Shared by Me")} ({(myShared || []).length})</TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* ═══ BROWSE ═══ */}
        <TabsContent value="browse" className="mt-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : filtered.length > 0 ? filtered.map((task: any) => (
            <Card key={task.id} className="border-transparent card-elevated">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-lg text-foreground">{task.title}</h3>
                      <Badge variant={task.needs_payment ? "default" : "secondary"} className="text-xs">
                        <Coins className="h-3 w-3 mr-1" />{priceLabel(task)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {task.poster?.full_name && <span className="flex items-center gap-1"><User className="h-3 w-3" /> {task.poster.full_name}</span>}
                      {(task.location || task.poster?.location) && (
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {task.location || task.poster?.location}</span>
                      )}
                      {task.task_date && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(task.task_date, i18n.language)}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDate(task.created_at, i18n.language, { month: "short", day: "numeric" })}
                  </span>
                </div>
                {task.description && <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{task.description}</p>}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <Badge variant={task.status === "open" ? "default" : "secondary"}>
                    {task.status === "open" ? Z("还在找人", "Looking for help") : Z("已找到帮手", "Help found")}
                  </Badge>
                  <div className="flex items-center gap-2">
                    {!isAuthenticated ? (
                      <Badge variant="outline">{Z("登录后可以帮忙", "Sign in to help")}</Badge>
                    ) : mineIds.has(String(task.id)) ? (
                      <>
                        <Badge variant="outline" className="text-muted-foreground">{Z("我分享的", "Shared by you")}</Badge>
                        <Button size="sm" variant="outline" onClick={() => setActiveTab("my-shared")}>{Z("管理", "Manage")}</Button>
                      </>
                    ) : appliedIds.has(String(task.id)) ? (
                      <>
                        <Badge variant="outline" className="text-success border-success">{Z("已表示要帮 ✓", "Offered ✓")}</Badge>
                        <Button size="sm" variant="outline" onClick={() => setActiveTab("my-offers")}>{Z("查看", "View")}</Button>
                      </>
                    ) : task.status === "open" ? (
                      <>
                        {task.poster?.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={startConversation.isPending}
                            onClick={() => startConversation.mutate(task.poster.id, {
                              onSuccess: () => navigate("/inbox?tab=messages", {
                                state: {
                                  targetUserId: task.poster.id,
                                  targetUserName: task.poster.full_name,
                                  targetUserAvatar: task.poster.avatar_url,
                                  openQuote: task.needs_payment,
                                  quotePrefill: { serviceType: task.title, taskId: task.id },
                                },
                              }),
                              onError: () => navigate("/inbox?tab=messages"),
                            })}
                          >
                            <Tag className="h-3 w-3 mr-1" /> {task.needs_payment ? Z("联系与报价", "Contact & Quote") : Z("联系", "Contact")}
                          </Button>
                        )}
                        <Dialog
                          open={applyOpen === task.id}
                          onOpenChange={(open) => { setApplyOpen(open ? task.id : null); if (!open) setMessage(""); }}
                        >
                          <DialogTrigger asChild>
                            <Button size="sm" variant="coral"><Send className="h-3 w-3 mr-1" /> {Z("我可以帮", "I can help")}</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>{Z("帮忙：", "Help with: ")}{task.title}</DialogTitle></DialogHeader>
                            <div className="space-y-4 mt-2">
                              <div>
                                <Label>{Z("留个话 *", "Your message *")}</Label>
                                <Textarea
                                  value={message}
                                  onChange={(e) => setMessage(e.target.value)}
                                  placeholder={Z("说说你能怎么帮、什么时间方便。", "Say how you can help and when you're free.")}
                                  rows={5}
                                  className="mt-1"
                                />
                              </div>
                              <Button
                                variant="coral"
                                className="w-full"
                                onClick={() => handleApply(task.id)}
                                disabled={applyToTask.isPending || !message.trim()}
                              >
                                {applyToTask.isPending ? Z("发送中…", "Sending...") : Z("发送", "Send")}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-16">
              <HeartHandshake className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">{Z("暂时没有需要帮手的任务", "No tasks need help right now")}</p>
            </div>
          )}
        </TabsContent>

        {/* ═══ MY OFFERS ═══ */}
        <TabsContent value="my-offers" className="mt-4 space-y-4">
          {(myApps || []).length > 0 ? (myApps || []).map((app: any) => (
            <Card key={app.id} className="border-transparent card-elevated">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2 gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground">{app.task?.title || Z("护理任务", "Care task")}</h3>
                    {app.task?.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {app.task.location}
                      </p>
                    )}
                  </div>
                  <Badge variant={app.status === "accepted" ? "default" : app.status === "rejected" ? "destructive" : "secondary"}>
                    {app.status === "accepted" ? Z("✓ 已接受", "✓ Accepted")
                      : app.status === "rejected" ? Z("✗ 未选中", "✗ Not chosen")
                      : Z("等待回复", "Waiting")}
                  </Badge>
                </div>
                {app.task?.description && <p className="text-sm text-muted-foreground line-clamp-2">{app.task.description}</p>}
              </CardContent>
            </Card>
          )) : (
            <p className="text-center py-16 text-muted-foreground">{Z("你还没有表示要帮哪件事。", "You haven't offered to help with anything yet.")}</p>
          )}
        </TabsContent>

        {/* ═══ SHARED BY ME ═══ */}
        <TabsContent value="my-shared" className="mt-4 space-y-4">
          {mySharedLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (myShared || []).length > 0 ? (myShared || []).map((task: any) => (
            <MySharedTaskCard key={task.id} task={task} zh={!!zh} />
          )) : (
            <p className="text-center py-16 text-muted-foreground">
              {Z("你还没有把任务分享出去。在护理圈的任务里点「分享找帮手」。",
                 'You haven\'t shared any task yet. Use "Share for help" on a task in your care circle.')}
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MySharedTaskCard({ task, zh }: { task: any; zh: boolean }) {
  const Z = (cn: string, en: string) => (zh ? cn : en);
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const { data: applicants, isLoading } = useTaskApplicants(expanded ? task.id : null);
  const decide = useDecideTaskApplicant();
  const unshare = useUnshareTask();

  return (
    <Card className="border-transparent card-elevated">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground">{task.title}</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
              <Badge variant={task.status === "open" ? "default" : "secondary"} className="text-[10px]">
                {task.status === "open" ? Z("还在找人", "Looking for help") : Z("已找到帮手", "Help found")}
              </Badge>
              {task.needs_payment && <span className="flex items-center gap-1"><Coins className="h-3 w-3" /> {task.price || Z("有报酬", "Paid")}</span>}
              {task.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {task.location}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={() => setExpanded((v) => !v)}>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span className="ml-1">{Z("想帮的人", "Helpers")}</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={unshare.isPending}
              onClick={() => unshare.mutate(task.id, {
                onSuccess: () => toast({ title: Z("已收回分享", "No longer shared") }),
              })}
            >
              {Z("收回分享", "Stop sharing")}
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-2 border-t border-border pt-4">
            {isLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : (applicants || []).length > 0 ? (applicants || []).map((a: any) => (
              <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={a.applicant?.avatar_url || undefined} />
                    <AvatarFallback>{(a.applicant?.full_name || "?").slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.applicant?.full_name || Z("用户", "User")}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.status === "accepted" ? Z("已接受", "Accepted") : a.status === "rejected" ? Z("未选中", "Not chosen") : Z("等待你回复", "Waiting for you")}
                    </p>
                  </div>
                </div>
                {a.status === "pending" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="coral" disabled={decide.isPending}
                      onClick={() => decide.mutate({ id: a.id, status: "accepted" }, {
                        onSuccess: () => toast({ title: Z("已接受这位帮手", "Helper accepted") }),
                      })}>
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" disabled={decide.isPending}
                      onClick={() => decide.mutate({ id: a.id, status: "rejected" }, {
                        onSuccess: () => toast({ title: Z("已谢过这位", "Politely declined") }),
                      })}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-4">{Z("还没有人表示要帮。", "Nobody has offered yet.")}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
