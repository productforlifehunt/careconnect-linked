import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ClipboardCheck, Plus, Loader2, SkipForward, Check, AlertCircle, History, StickyNote, Edit2, Trash2, Pause, Play, Bot } from "lucide-react";
import { useCheckins, useCreateCheckin, useUpdateCheckin, useDeleteCheckin, useCheckinLogs, useTodayCheckinLogs, useLogCheckin } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { AICheckInDialog } from "./AICheckInDialog";

function formatSlot(slot: string) {
  const [hourRaw = "8", minuteRaw = "00"] = String(slot || "08:00").split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  const isPM = hour >= 12;
  const displayHour = hour > 12 ? hour - 12 : hour || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${isPM ? "PM" : "AM"}`;
}

const STATUS_LABEL: Record<string, string> = {
  checked: "Checked",
  skipped: "Skipped",
  missed: "Missed",
};

const STATUS_STYLE: Record<string, string> = {
  checked: "bg-success/10 text-success border-success/30",
  skipped: "bg-warning/10 text-warning border-warning/30",
  missed: "bg-destructive/10 text-destructive border-destructive/30",
};

export function CheckInCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: checkins, isLoading } = useCheckins(caredOneId);
  const { data: logs } = useCheckinLogs(caredOneId);
  const { data: todayLogs } = useTodayCheckinLogs(caredOneId);
  const create = useCreateCheckin();
  const update = useUpdateCheckin();
  const remove = useDeleteCheckin();
  const logCheckin = useLogCheckin();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<{ open: boolean; checkin: any }>({ open: false, checkin: null });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; checkin: any }>({ open: false, checkin: null });
  const [logDialog, setLogDialog] = useState<{ open: boolean; checkin: any; status: "checked" | "skipped" | "missed" }>({ open: false, checkin: null, status: "checked" });
  const [logNote, setLogNote] = useState("");
  const [historyOpen, setHistoryOpen] = useState<{ open: boolean; checkin: any }>({ open: false, checkin: null });
  const [aiOpen, setAiOpen] = useState<{ open: boolean; checkin: any }>({ open: false, checkin: null });

  const [form, setForm] = useState({
    name: "Daily Check-In",
    detail: "",
    frequency: "Once daily",
    time: "08:00",
    instructions: "",
    start_date: "",
    note: "",
  });

  // Today: status by checkin id
  const todayStatusByCheckin = useMemo(() => {
    const map = new Map<string, string>();
    (todayLogs || []).forEach((log: any) => {
      const cid = String(log.checkin_id || log.medicine_id || "");
      if (cid && !map.has(cid)) map.set(cid, log.status || "checked");
    });
    return map;
  }, [todayLogs]);

  // Detect missed today: time slot earlier than now, no log
  const missedTodayIds = useMemo(() => {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const ids = new Set<string>();
    (checkins || []).forEach((c: any) => {
      if (todayStatusByCheckin.has(String(c.id))) return;
      const slots: string[] = Array.isArray(c.time_slot) && c.time_slot.length ? c.time_slot : ["08:00"];
      const earliest = slots.reduce((min, s) => {
        const [h = "0", m = "0"] = String(s).split(":");
        const v = Number(h) * 60 + Number(m);
        return v < min ? v : min;
      }, Number.POSITIVE_INFINITY);
      // Grace: 60 min after slot
      if (nowMins > earliest + 60) ids.add(String(c.id));
    });
    return ids;
  }, [checkins, todayStatusByCheckin]);

  const handleCreate = () => {
    create.mutate(
      {
        user_id: caredOneId,
        name: form.name,
        detail: form.detail || undefined,
        frequency: form.frequency,
        time_slot: [form.time],
        instructions: form.instructions || undefined,
        start_date: form.start_date || undefined,
        note: form.note || undefined,
      },
      {
        onSuccess: () => {
          setForm({ name: "Daily Check-In", detail: "", frequency: "Once daily", time: "08:00", instructions: "", start_date: "", note: "" });
          setAddOpen(false);
          toast({ title: "Check-in schedule created ✓" });
        },
        onError: (e: any) => toast({ title: "Failed", description: String(e?.message || e), variant: "destructive" }),
      }
    );
  };

  const openLog = (checkin: any, status: "checked" | "skipped" | "missed") => {
    setLogNote("");
    setLogDialog({ open: true, checkin, status });
  };

  const confirmLog = () => {
    const { checkin, status } = logDialog;
    logCheckin.mutate(
      { checkin_id: String(checkin.id), status, note: logNote || undefined },
      {
        onSuccess: () => {
          setLogDialog({ open: false, checkin: null, status: "checked" });
          setLogNote("");
          toast({ title: `Check-in ${STATUS_LABEL[status].toLowerCase()} ✓` });
        },
        onError: (e: any) => toast({ title: "Failed", description: String(e?.message || e), variant: "destructive" }),
      }
    );
  };

  const togglePause = (checkin: any) => {
    update.mutate(
      { id: String(checkin.id), is_active: !checkin.is_active },
      {
        onSuccess: () => toast({ title: checkin.is_active ? "Check-in paused" : "Check-in resumed ✓" }),
        onError: (e: any) => toast({ title: "Failed", description: String(e?.message || e), variant: "destructive" }),
      }
    );
  };

  const openEdit = (checkin: any) => {
    const slot = Array.isArray(checkin.time_slot) && checkin.time_slot.length ? checkin.time_slot[0] : "08:00";
    setForm({
      name: checkin.name || "",
      detail: checkin.detail || "",
      frequency: checkin.frequency || "Once daily",
      time: slot,
      instructions: checkin.instructions || "",
      start_date: checkin.start_date || "",
      note: checkin.note || "",
    });
    setEditOpen({ open: true, checkin });
  };

  const handleEditSave = () => {
    update.mutate(
      {
        id: String(editOpen.checkin.id),
        name: form.name,
        detail: form.detail || "",
        frequency: form.frequency,
        time_slot: [form.time],
        instructions: form.instructions || "",
        start_date: form.start_date || "",
        note: form.note || "",
      },
      {
        onSuccess: () => {
          setEditOpen({ open: false, checkin: null });
          toast({ title: "Check-in updated ✓" });
        },
        onError: (e: any) => toast({ title: "Failed", description: String(e?.message || e), variant: "destructive" }),
      }
    );
  };

  const confirmDelete = () => {
    remove.mutate(String(deleteConfirm.checkin.id), {
      onSuccess: () => {
        setDeleteConfirm({ open: false, checkin: null });
        toast({ title: "Check-in deleted" });
      },
      onError: (e: any) => toast({ title: "Failed", description: String(e?.message || e), variant: "destructive" }),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Daily Check-In</h2>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Check-In</Button>
      </div>

      {/* Add schedule */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Check-In Schedule</DialogTitle>
            <DialogDescription>Set a recurring wellness check-in for this cared one.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-sm">Name</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <Label className="text-sm">Detail</Label>
              <Input value={form.detail} onChange={(e) => setForm((p) => ({ ...p, detail: e.target.value }))} placeholder="Short description (optional)" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Frequency</Label>
                <Input value={form.frequency} onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value }))} placeholder="Once daily" />
              </div>
              <div>
                <Label className="text-sm">Scheduled time</Label>
                <Input type="time" value={form.time} onChange={(e) => setForm((p) => ({ ...p, time: e.target.value || "08:00" }))} />
              </div>
            </div>
            <div>
              <Label className="text-sm">Start date</Label>
              <Input type="date" value={form.start_date} onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))} />
            </div>
            <div>
              <Label className="text-sm">Instructions</Label>
              <Input value={form.instructions} onChange={(e) => setForm((p) => ({ ...p, instructions: e.target.value }))} placeholder="What to ask or check" />
            </div>
            <div>
              <Label className="text-sm">Notes</Label>
              <Textarea value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={create.isPending || !form.name.trim()}>
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ClipboardCheck className="h-4 w-4 mr-2" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log status */}
      <Dialog open={logDialog.open} onOpenChange={(o) => !o && setLogDialog({ open: false, checkin: null, status: "checked" })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {logDialog.status === "checked" ? <Check className="h-5 w-5 text-success" /> :
               logDialog.status === "skipped" ? <SkipForward className="h-5 w-5 text-warning" /> :
               <AlertCircle className="h-5 w-5 text-destructive" />}
              Mark as {STATUS_LABEL[logDialog.status]}
            </DialogTitle>
            <DialogDescription>{logDialog.checkin?.name} — add an optional note</DialogDescription>
          </DialogHeader>
          <Textarea value={logNote} onChange={(e) => setLogNote(e.target.value)} rows={3} placeholder="How did it go?" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogDialog({ open: false, checkin: null, status: "checked" })}>Cancel</Button>
            <Button onClick={confirmLog} disabled={logCheckin.isPending}>
              {logCheckin.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History */}
      <Dialog open={historyOpen.open} onOpenChange={(o) => !o && setHistoryOpen({ open: false, checkin: null })}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><History className="h-5 w-5 text-primary" /> {historyOpen.checkin?.name} — History</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-1">
            {(logs || []).filter((l: any) => String(l.checkin_id) === String(historyOpen.checkin?.id)).length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No logs yet</p>
            ) : (
              (logs || []).filter((l: any) => String(l.checkin_id) === String(historyOpen.checkin?.id)).map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                  <Badge variant="outline" className={STATUS_STYLE[log.status] || ""}>{STATUS_LABEL[log.status] || log.status}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p>
                    {log.note && <p className="text-xs mt-0.5 flex items-start gap-1"><StickyNote className="h-3 w-3 mt-0.5 shrink-0" />{log.note}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit schedule */}
      <Dialog open={editOpen.open} onOpenChange={(o) => !o && setEditOpen({ open: false, checkin: null })}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Check-In Schedule</DialogTitle>
            <DialogDescription>Update this recurring check-in.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div><Label className="text-sm">Name</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
            <div><Label className="text-sm">Detail</Label><Input value={form.detail} onChange={(e) => setForm((p) => ({ ...p, detail: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm">Frequency</Label><Input value={form.frequency} onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value }))} /></div>
              <div><Label className="text-sm">Scheduled time</Label><Input type="time" value={form.time} onChange={(e) => setForm((p) => ({ ...p, time: e.target.value || "08:00" }))} /></div>
            </div>
            <div><Label className="text-sm">Start date</Label><Input type="date" value={form.start_date} onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))} /></div>
            <div><Label className="text-sm">Instructions</Label><Input value={form.instructions} onChange={(e) => setForm((p) => ({ ...p, instructions: e.target.value }))} /></div>
            <div><Label className="text-sm">Notes</Label><Textarea value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen({ open: false, checkin: null })}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={update.isPending || !form.name.trim()}>
              {update.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteConfirm.open} onOpenChange={(o) => !o && setDeleteConfirm({ open: false, checkin: null })}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Trash2 className="h-5 w-5 text-destructive" /> Delete check-in?</DialogTitle>
            <DialogDescription>This will permanently delete <strong>{deleteConfirm.checkin?.name}</strong>. Logged history will remain.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm({ open: false, checkin: null })}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={remove.isPending}>
              {remove.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto my-8" />
      ) : (checkins || []).length === 0 ? (
        <div className="text-center py-12">
          <ClipboardCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">No check-in schedules yet</p>
          <Button variant="coral" size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> First Check-In Schedule</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {(checkins || []).map((checkin: any) => {
            const slots = Array.isArray(checkin.time_slot) && checkin.time_slot.length > 0 ? checkin.time_slot : ["08:00"];
            const todayStatus = todayStatusByCheckin.get(String(checkin.id));
            const isMissed = missedTodayIds.has(String(checkin.id));
            return (
              <Card key={checkin.id} className="border-transparent card-elevated">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">{checkin.name}</span>
                        {!checkin.is_active && <Badge variant="outline" className="text-xs">Paused</Badge>}
                      </div>
                      {checkin.detail && <p className="text-xs text-muted-foreground mt-1">{checkin.detail}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        {checkin.frequency || "Once daily"} · {slots.map(formatSlot).join(", ")}
                      </p>
                      {checkin.instructions && <p className="text-xs text-muted-foreground mt-1 italic">{checkin.instructions}</p>}
                      {checkin.note && <p className="text-xs text-muted-foreground mt-1">{checkin.note}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge variant="outline" className={
                        todayStatus ? STATUS_STYLE[todayStatus] :
                        isMissed ? STATUS_STYLE.missed :
                        "bg-muted text-muted-foreground"
                      }>
                        {todayStatus ? STATUS_LABEL[todayStatus] + " today" :
                         isMissed ? "Missed today" : "Pending today"}
                      </Badge>
                      {!todayStatus && (
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" onClick={() => openLog(checkin, "skipped")} disabled={logCheckin.isPending}><SkipForward className="h-3 w-3 mr-1" /> Skip</Button>
                          {isMissed && (
                            <Button size="sm" variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10" onClick={() => openLog(checkin, "missed")} disabled={logCheckin.isPending}><AlertCircle className="h-3 w-3 mr-1" /> Missed</Button>
                          )}
                          <Button size="sm" onClick={() => openLog(checkin, "checked")} disabled={logCheckin.isPending}><Check className="h-3 w-3 mr-1" /> Check</Button>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" title="History" onClick={() => setHistoryOpen({ open: true, checkin })}><History className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" title={checkin.is_active ? "Pause" : "Resume"} onClick={() => togglePause(checkin)} disabled={update.isPending}>
                          {checkin.is_active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" title="Edit" onClick={() => openEdit(checkin)}><Edit2 className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" title="Delete" onClick={() => setDeleteConfirm({ open: true, checkin })}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="pt-2">
            <h3 className="text-sm font-semibold text-foreground mb-2">Recent check-in history</h3>
            <div className="space-y-2">
              {(logs || []).slice(0, 5).map((log: any) => (
                <Card key={log.id} className="border-transparent card-elevated">
                  <CardContent className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant="outline" className={STATUS_STYLE[log.status] || ""}>{STATUS_LABEL[log.status] || log.status}</Badge>
                      {log.note && <p className="text-xs text-muted-foreground truncate">{log.note}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{new Date(log.created_at).toLocaleDateString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                  </CardContent>
                </Card>
              ))}
              {(logs || []).length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No history yet</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
