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
import {
  Briefcase, Plus, MapPin, Clock, DollarSign, Search, Loader2, Send, User,
} from "lucide-react";
import { useJobPostings, useCreateJobPosting, useApplyToJob, useMyJobApplications } from "@/hooks/use-care-data";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Jobs() {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: jobs, isLoading } = useJobPostings({ source: sourceFilter || undefined });
  const { data: myApps } = useMyJobApplications();
  const createJob = useCreateJobPosting();
  const applyToJob = useApplyToJob();

  const [createOpen, setCreateOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState<string | null>(null);
  const [newJob, setNewJob] = useState({ title: "", description: "", service_type: "", hourly_rate: "", location: "", job_source_type: "general" });
  const [coverLetter, setCoverLetter] = useState("");

  const handleCreateJob = () => {
    if (!newJob.title || !newJob.description) return;
    createJob.mutate({
      title: newJob.title,
      description: newJob.description,
      service_type: newJob.service_type || undefined,
      hourly_rate: newJob.hourly_rate ? parseFloat(newJob.hourly_rate) : undefined,
      location: newJob.location || undefined,
      job_source_type: newJob.job_source_type,
    }, {
      onSuccess: () => {
        setNewJob({ title: "", description: "", service_type: "", hourly_rate: "", location: "", job_source_type: "general" });
        setCreateOpen(false);
        toast({ title: "Job posted successfully" });
      },
    });
  };

  const handleApply = (jobId: string) => {
    if (!coverLetter.trim()) return;
    applyToJob.mutate({ jobId, coverLetter }, {
      onSuccess: () => {
        setCoverLetter("");
        setApplyOpen(null);
        toast({ title: "Application submitted!" });
      },
    });
  };

  const appliedJobIds = new Set((myApps || []).map((a: any) => a.job_id));

  const filteredJobs = (jobs || []).filter((j: any) =>
    !searchQuery || j.title?.toLowerCase().includes(searchQuery.toLowerCase()) || j.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sourceLabels: Record<string, string> = {
    general: "General",
    group_task: "Group Task",
    cared_one_checkin: "Check-In",
    cared_one_care: "Ongoing Care",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Jobs Board</h1>
          <p className="text-muted-foreground">Find care jobs or post opportunities</p>
        </div>
        {isAuthenticated && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="coral"><Plus className="h-4 w-4 mr-2" /> Post Job</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Post a Care Job</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div><Label>Job Title *</Label><Input value={newJob.title} onChange={e => setNewJob(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Part-time caregiver needed" /></div>
                <div><Label>Description *</Label><Textarea value={newJob.description} onChange={e => setNewJob(p => ({ ...p, description: e.target.value }))} placeholder="Describe the care needs, schedule, and requirements..." rows={4} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Service Type</Label><Input value={newJob.service_type} onChange={e => setNewJob(p => ({ ...p, service_type: e.target.value }))} placeholder="e.g. Senior Care" /></div>
                  <div><Label>Hourly Rate ($)</Label><Input type="number" value={newJob.hourly_rate} onChange={e => setNewJob(p => ({ ...p, hourly_rate: e.target.value }))} placeholder="25" /></div>
                </div>
                <div><Label>Location</Label><Input value={newJob.location} onChange={e => setNewJob(p => ({ ...p, location: e.target.value }))} placeholder="City, State" /></div>
                <div>
                  <Label>Job Type</Label>
                  <Select value={newJob.job_source_type} onValueChange={v => setNewJob(p => ({ ...p, job_source_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="cared_one_checkin">Check-In Care</SelectItem>
                      <SelectItem value="cared_one_care">Ongoing Care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="coral" className="w-full" onClick={handleCreateJob} disabled={createJob.isPending || !newJob.title || !newJob.description}>
                  {createJob.isPending ? "Posting..." : "Post Job"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search jobs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="group_task">Group Task</SelectItem>
            <SelectItem value="cared_one_checkin">Check-In</SelectItem>
            <SelectItem value="cared_one_care">Ongoing Care</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="browse">
        <TabsList>
          <TabsTrigger value="browse">Browse Jobs ({filteredJobs.length})</TabsTrigger>
          <TabsTrigger value="my-applications">My Applications ({(myApps || []).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : filteredJobs.length > 0 ? filteredJobs.map((job: any) => (
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
                      {job.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>}
                      {job.hourly_rate && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> ${job.hourly_rate}/hr</span>}
                      {job.service_type && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {job.service_type}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(job.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{job.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant={job.status === "open" ? "default" : "secondary"}>{job.status}</Badge>
                  {isAuthenticated && job.posted_by !== user?.id && (
                    appliedJobIds.has(job.id) ? (
                      <Badge variant="outline" className="text-success border-success">Applied ✓</Badge>
                    ) : (
                      <Dialog open={applyOpen === job.id} onOpenChange={open => setApplyOpen(open ? job.id : null)}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="coral"><Send className="h-3 w-3 mr-1" /> Apply</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Apply to: {job.title}</DialogTitle></DialogHeader>
                          <div className="space-y-4 mt-2">
                            <div>
                              <Label>Cover Letter</Label>
                              <Textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} placeholder="Introduce yourself, explain your experience and why you're a good fit..." rows={5} />
                            </div>
                            <Button variant="coral" className="w-full" onClick={() => handleApply(job.id)} disabled={applyToJob.isPending || !coverLetter.trim()}>
                              {applyToJob.isPending ? "Submitting..." : "Submit Application"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-16">
              <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No jobs found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-applications" className="mt-4 space-y-4">
          {(myApps || []).length > 0 ? (myApps || []).map((app: any) => (
            <Card key={app.id} className="border-transparent card-elevated">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{app.job?.title || "Job"}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      {app.job?.service_type && <span>{app.job.service_type}</span>}
                      {app.job?.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {app.job.location}</span>}
                      {app.job?.hourly_rate && <span>${app.job.hourly_rate}/hr</span>}
                    </div>
                  </div>
                  <Badge variant={app.status === "accepted" ? "default" : app.status === "rejected" ? "destructive" : "secondary"}>
                    {app.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{app.cover_letter}</p>
                <p className="text-xs text-muted-foreground mt-2">Applied {new Date(app.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</p>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No applications yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
