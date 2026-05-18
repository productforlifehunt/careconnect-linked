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
  Briefcase, Plus, MapPin, Search, Loader2, Send, User, ChevronDown, ChevronUp,
  Check, X, Star, Clock, Tag,
} from "lucide-react";
import {
  useJobPostings, useCreateJobPosting, useApplyToJob, useMyJobApplications,
  useMyJobPostings, useJobApplications, useUpdateJobApplication, useCreateExternalTestJob,
  useStartConversation,
} from "@/hooks/use-care-data";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Jobs() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const zh = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (zh ? cn : en);
  const startConversation = useStartConversation();
  const { isAuthenticated, user } = useAuth();
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("browse");
  const { data: jobs, isLoading } = useJobPostings({ source: sourceFilter || undefined });
  const { data: myApps } = useMyJobApplications();
  const { data: myPostedJobs, isLoading: myPostsLoading } = useMyJobPostings();
  const createJob = useCreateJobPosting();
  const applyToJob = useApplyToJob();
  const createExternalTestJob = useCreateExternalTestJob();


  const [createOpen, setCreateOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState<string | null>(null);
  const [newJob, setNewJob] = useState({ title: "", description: "", location: "", job_source_type: "general" });
  const [coverLetter, setCoverLetter] = useState("");

  const handleCreateJob = () => {
    if (!newJob.title || !newJob.description) return;
    createJob.mutate({
      title: newJob.title,
      description: newJob.description,
      location: newJob.location || "",
    }, {
      onSuccess: () => {
        setNewJob({ title: "", description: "", location: "", job_source_type: "general" });
        setCreateOpen(false);
        toast({ title: Z("职位发布成功", "Job posted successfully") });
      },
      onError: (err: any) => {
        toast({ title: Z("发布失败", "Failed to post job"), description: err?.message || Z("请重试", "Please try again"), variant: "destructive" });
      },
    });
  };

  const handleApply = (jobId: string) => {
    if (!coverLetter.trim()) return;
    applyToJob.mutate({ jobId, coverLetter }, {
      onSuccess: () => {
        setCoverLetter("");
        setApplyOpen(null);
        toast({ title: Z("申请已提交！", "Application submitted!") });
      },
      onError: (err: any) => {
        toast({ title: Z("申请失败", "Failed to apply"), description: err?.message || Z("请重试", "Please try again"), variant: "destructive" });
      },
    });
  };

  const appliedJobIds = new Set((myApps || []).map((a: any) => a.job_id));
  const myPostedJobIds = new Set((myPostedJobs || []).map((j: any) => j.id));

  const filteredJobs = (jobs || []).filter((j: any) =>
    !searchQuery || j.title?.toLowerCase().includes(searchQuery.toLowerCase()) || j.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sourceLabels: Record<string, string> = zh ? {
    general: "通用",
    group_task: "小组任务",
    cared_one_checkin: "签到护理",
    cared_one_care: "长期护理",
  } : {
    general: "General",
    group_task: "Group Task",
    cared_one_checkin: "Check-In",
    cared_one_care: "Ongoing Care",
  };

  const myPostedCount = (myPostedJobs || []).length;
  const myAppsCount = (myApps || []).length;
  const availableToApplyCount = filteredJobs.filter((job: any) => !myPostedJobIds.has(job.id) && job.status === "open" && !appliedJobIds.has(job.id)).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground">{Z("已发布护理工作", "Jobs Board")}</h1>
          <p className="text-muted-foreground text-sm">{Z("寻找护理工作或发布机会", "Find care jobs or post opportunities")}</p>
        </div>
        {isAuthenticated && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="coral" className="self-start sm:self-auto shrink-0"><Plus className="h-4 w-4 mr-2" /> {Z("发布工作", "Post Job")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{Z("发布护理工作", "Post a Care Job")}</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div><Label>{Z("工作标题 *", "Job Title *")}</Label><Input value={newJob.title} onChange={e => setNewJob(p => ({ ...p, title: e.target.value }))} placeholder={Z("例如：招聘兼职护理者", "e.g. Part-time caregiver needed")} className="mt-1" /></div>
                <div><Label>{Z("详细描述 *", "Description *")}</Label><Textarea value={newJob.description} onChange={e => setNewJob(p => ({ ...p, description: e.target.value }))} placeholder={Z("描述护理需求、时间安排、要求、薪资和地点……", "Describe the care needs, schedule, requirements, rate, and location...")} rows={5} className="mt-1" /></div>
                <div><Label>{Z("地点", "Location")}</Label><Input value={newJob.location} onChange={e => setNewJob(p => ({ ...p, location: e.target.value }))} placeholder={Z("例如：上海浦东", "e.g. Brooklyn, NY")} className="mt-1" /></div>
                <div>
                  <Label>{Z("工作类型", "Job Type")}</Label>
                  <Select value={newJob.job_source_type} onValueChange={v => setNewJob(p => ({ ...p, job_source_type: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">{Z("通用", "General")}</SelectItem>
                      <SelectItem value="cared_one_checkin">{Z("签到护理", "Check-In Care")}</SelectItem>
                      <SelectItem value="cared_one_care">{Z("长期护理", "Ongoing Care")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="coral" className="w-full" onClick={handleCreateJob} disabled={createJob.isPending || !newJob.title || !newJob.description}>
                  {createJob.isPending ? Z("发布中…", "Posting...") : Z("发布工作", "Post Job")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={Z("搜索工作……", "Search jobs...")} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={sourceFilter || "all"} onValueChange={v => setSourceFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-full sm:w-[160px] shrink-0"><SelectValue placeholder={Z("所有类型", "All types")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{Z("所有类型", "All Types")}</SelectItem>
            <SelectItem value="general">{Z("通用", "General")}</SelectItem>
            <SelectItem value="group_task">{Z("小组任务", "Group Task")}</SelectItem>
            <SelectItem value="cared_one_checkin">{Z("签到护理", "Check-In")}</SelectItem>
            <SelectItem value="cared_one_care">{Z("长期护理", "Ongoing Care")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="browse">
        <div className="overflow-x-auto -mx-4 px-4 scrollbar-none">
          <TabsList className="w-max">
            <TabsTrigger value="browse">{Z("浏览工作", "Browse Jobs")} ({filteredJobs.length})</TabsTrigger>
            <TabsTrigger value="my-applications">{Z("我的申请", "My Applications")} ({myAppsCount})</TabsTrigger>
            {isAuthenticated && <TabsTrigger value="my-posts">{Z("我发布的", "My Posted Jobs")} ({myPostedCount})</TabsTrigger>}
          </TabsList>
        </div>

        {/* ═══ BROWSE JOBS ═══ */}
        <TabsContent value="browse" className="mt-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : filteredJobs.length > 0 ? (
            <>
              {isAuthenticated && availableToApplyCount === 0 && (
                <div className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                  {Z("目前没有其他用户发布的开放工作。您可以在", "No open jobs from other users right now. You can manage your own posts in")}{" "}
                  <button
                    type="button"
                    className="font-medium text-primary hover:underline"
                    onClick={() => setActiveTab("my-posts")}
                  >
                    {Z("我发布的", "My Posted Jobs")}
                  </button>
                  {Z("中管理您的发布。", ".")}
                </div>
              )}

              {filteredJobs.map((job: any) => (
                <Card key={job.id} className="border-transparent card-elevated">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg text-foreground">{job.title}</h3>
                          <Badge variant="secondary" className="text-xs">{sourceLabels[job.job_source_type] || job.job_source_type}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                          {job.poster?.full_name && <span className="flex items-center gap-1"><User className="h-3 w-3" /> {job.poster.full_name}</span>}
                          {(job.location || job.poster?.location) && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location || job.poster?.location}</span>}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(job.created_at).toLocaleDateString(i18n.language, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{job.description}</p>
                    <div className="flex items-center justify-between gap-3">
                      <Badge variant={job.status === "open" ? "default" : "secondary"}>{job.status}</Badge>
                      <div className="flex items-center gap-2">
                        {isAuthenticated ? (
                          myPostedJobIds.has(job.id) ? (
                            <>
                              <Badge variant="outline" className="text-muted-foreground">{Z("我发布的", "Your Job")}</Badge>
                              <Button size="sm" variant="outline" onClick={() => setActiveTab("my-posts")}>{Z("管理", "Manage")}</Button>
                            </>
                          ) : appliedJobIds.has(job.id) ? (
                            <>
                              <Badge variant="outline" className="text-success border-success">{Z("已申请 ✓", "Applied ✓")}</Badge>
                              <Button size="sm" variant="outline" onClick={() => setActiveTab("my-applications")}>{Z("查看", "View")}</Button>
                            </>
                          ) : job.status === "open" ? (
                            <>
                              {job.poster?.id && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={startConversation.isPending}
                                  onClick={() => {
                                    startConversation.mutate(job.poster.id, {
                                      onSuccess: () => navigate("/messages", {
                                        state: {
                                          targetUserId: job.poster.id,
                                          targetUserName: job.poster.full_name,
                                          targetUserAvatar: job.poster.avatar_url,
                                          openQuote: true,
                                          quotePrefill: { serviceType: job.title, jobId: job.id },
                                        },
                                      }),
                                      onError: () => navigate("/messages"),
                                    });
                                  }}
                                >
                                  <Tag className="h-3 w-3 mr-1" /> {Z("联系与报价", "Contact & Quote")}
                                </Button>
                              )}
                            <Dialog open={applyOpen === job.id} onOpenChange={open => { setApplyOpen(open ? job.id : null); if (!open) setCoverLetter(""); }}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="coral"><Send className="h-3 w-3 mr-1" /> {Z("申请", "Apply")}</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader><DialogTitle>{Z("申请：", "Apply to: ")}{job.title}</DialogTitle></DialogHeader>
                                <div className="space-y-4 mt-2">
                                  <div>
                                    <Label>{Z("求职信 *", "Cover Letter *")}</Label>
                                    <Textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} placeholder={Z("介绍您自己，说明您的经验以及为何适合这份工作……", "Introduce yourself, explain your experience and why you're a good fit...")} rows={5} className="mt-1" />
                                  </div>
                                  <Button variant="coral" className="w-full" onClick={() => handleApply(job.id)} disabled={applyToJob.isPending || !coverLetter.trim()}>
                                    {applyToJob.isPending ? Z("提交中…", "Submitting...") : Z("提交申请", "Submit Application")}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            </>
                          ) : null
                        ) : (
                          <Badge variant="outline">{Z("登录后申请", "Sign in to apply")}</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <div className="text-center py-16">
              <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">{Z("未找到工作", "No jobs found")}</p>
            </div>
          )}
        </TabsContent>

        {/* ═══ MY APPLICATIONS ═══ */}
        <TabsContent value="my-applications" className="mt-4 space-y-4">
          {(myApps || []).length > 0 ? (myApps || []).map((app: any) => (
            <Card key={app.id} className="border-transparent card-elevated">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{app.job?.title || "Job"}</h3>
                    {app.job?.location && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" /> {app.job.location}</p>}
                  </div>
                  <Badge variant={
                    app.status === "accepted" ? "default" :
                    app.status === "rejected" ? "destructive" : "secondary"
                  }>
                    {app.status === "accepted" ? Z("✓ 已接受", "✓ Accepted") : app.status === "rejected" ? Z("✗ 已拒绝", "✗ Rejected") : Z("待处理", "Pending")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{app.cover_letter}</p>
                <p className="text-xs text-muted-foreground mt-2">{Z("申请于 ", "Applied ")}{new Date(app.created_at).toLocaleDateString(zh ? "zh-CN" : "en", { month: "short", day: "numeric", year: "numeric" })}</p>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-16">
              <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">{Z("还没有申请", "No applications yet")}</p>
              <p className="text-sm text-muted-foreground mt-1">{Z("浏览可用工作并提交申请开始使用", "Browse available jobs and apply to get started")}</p>
            </div>
          )}
        </TabsContent>

        {/* ═══ MY POSTED JOBS ═══ */}
        {isAuthenticated && (
          <TabsContent value="my-posts" className="mt-4 space-y-4">
            {myPostsLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : (myPostedJobs || []).length > 0 ? (myPostedJobs || []).map((job: any) => (
              <PostedJobCard key={job.id} job={job} sourceLabels={sourceLabels} />
            )) : (
              <div className="text-center py-16">
                <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">{Z("您还没有发布任何工作", "You haven't posted any jobs yet")}</p>
                <Button variant="coral" className="mt-4" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> {Z("发布您的第一份工作", "Post Your First Job")}
                </Button>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// ─── Posted Job Card (with applicant management) ─────────────
function PostedJobCard({ job, sourceLabels }: { job: any; sourceLabels: Record<string, string> }) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const zh = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (zh ? cn : en);
  const [expanded, setExpanded] = useState(false);
  const { data: applications, isLoading: appsLoading } = useJobApplications(expanded ? job.id : null);
  const updateApplication = useUpdateJobApplication();

  const handleAction = (appId: string, status: "accepted" | "rejected") => {
    updateApplication.mutate({ id: appId, status }, {
      onSuccess: () => toast({ title: status === "accepted" ? Z("已接受申请人 ✓", "Applicant accepted ✓") : Z("已拒绝申请人", "Applicant declined") }),
      onError: (err: any) => toast({ title: Z("操作失败", "Failed"), description: err.message, variant: "destructive" }),
    });
  };

  const appCount = job._applicant_count ?? undefined;

  return (
    <Card className="border-transparent card-elevated">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-lg text-foreground">{job.title}</h3>
              <Badge variant="secondary" className="text-xs">{sourceLabels[job.job_source_type] || job.job_source_type}</Badge>
              <Badge variant={job.status === "open" ? "default" : "secondary"}>{job.status}</Badge>
            </div>
            {job.location && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</p>}
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Clock className="h-3 w-3" /> {Z("发布于 ", "Posted ")}{new Date(job.created_at).toLocaleDateString(zh ? "zh-CN" : "en", { month: "short", day: "numeric", year: "numeric" })}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>

        {/* View Applicants Toggle */}
        <button
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {expanded ? Z("隐藏申请人", "Hide Applicants") : Z("查看申请人", "View Applicants")}
        </button>

        {expanded && (
          <div className="mt-4 border-t pt-4">
            {appsLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : (applications || []).length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">{(applications || []).length} {Z("位申请人", "Applicant")}{!zh && (applications || []).length !== 1 ? "s" : ""}</p>
                {(applications || []).map((app: any) => (
                  <div key={app.id} className="rounded-lg border p-4 bg-muted/30">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarImage src={app.applicant?.avatar_url} />
                          <AvatarFallback className="text-xs">{(app.applicant?.full_name || "?")[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{app.applicant?.full_name || Z("申请人", "Applicant")}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {app.applicant?.years_of_experience && <span>{app.applicant.years_of_experience} {Z("年经验", "yrs exp")}</span>}
                            {app.applicant?.rating_average && (
                              <span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-warning fill-warning" />{app.applicant.rating_average.toFixed(1)}</span>
                            )}
                            {app.applicant?.hourly_rate && <span>{zh ? `¥${app.applicant.hourly_rate}/小时` : `$${app.applicant.hourly_rate}/hr`}</span>}
                          </div>
                        </div>
                      </div>
                      <Badge variant={
                        app.status === "accepted" ? "default" :
                        app.status === "rejected" ? "destructive" : "secondary"
                      } className="shrink-0">
                        {app.status === "accepted" ? Z("已接受", "accepted") : app.status === "rejected" ? Z("已拒绝", "rejected") : Z("待处理", "pending")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground bg-background rounded p-2 mb-3">{app.cover_letter}</p>
                    <p className="text-xs text-muted-foreground mb-3">{Z("申请于 ", "Applied ")}{new Date(app.created_at).toLocaleDateString(zh ? "zh-CN" : "en", { month: "short", day: "numeric", year: "numeric" })}</p>
                    {app.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="default" className="bg-success hover:bg-success/90 text-success-foreground" onClick={() => handleAction(app.id, "accepted")} disabled={updateApplication.isPending}>
                          <Check className="h-3 w-3 mr-1" /> {Z("接受", "Accept")}
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleAction(app.id, "rejected")} disabled={updateApplication.isPending}>
                          <X className="h-3 w-3 mr-1" /> {Z("拒绝", "Decline")}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <User className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{Z("还没有申请", "No applications yet")}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
