import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ClipboardCheck, Plus, Loader2, SkipForward, Check } from "lucide-react";
import { useCheckins, useCreateCheckin, useCheckinLogs, useTodayCheckinLogs, useLogCheckin } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";

function formatSlot(slot: string) {
  const [hourRaw = "8", minuteRaw = "00"] = String(slot || "08:00").split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  const isPM = hour >= 12;
  const displayHour = hour > 12 ? hour - 12 : hour || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${isPM ? "PM" : "AM"}`;
}

export function CheckInCard({ caredOneId }: { caredOneId: string }) {
  const { toast } = useToast();
  const { data: checkins, isLoading } = useCheckins(caredOneId);
  const { data: logs } = useCheckinLogs(caredOneId);
  const { data: todayLogs } = useTodayCheckinLogs(caredOneId);
  const create = useCreateCheckin();
  const logCheckin = useLogCheckin();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "Daily Check-In", frequency: "Once daily", time: "08:00", note: "" });

  const todayStatusByCheckin = useMemo(() => {
    const map = new Map<string, string>();
    (todayLogs || []).forEach((log: any) => {
      if (log.medicine_id && !map.has(String(log.medicine_id))) {
        map.set(String(log.medicine_id), log.status || "taken");
      }
    });
    return map;
  }, [todayLogs]);

  const handleCreate = () => {
    create.mutate(
      { user_id: caredOneId, name: form.name, frequency: form.frequency, time_slot: [form.time], note: form.note || undefined },
      {
        onSuccess: () => {
          setForm({ name: "Daily Check-In", frequency: "Once daily", time: "08:00", note: "" });
          setAddOpen(false);
          toast({ title: "Check-in schedule created ✓" });
        },
      }
    );
  };

  const handleLog = (checkinId: string, status: "taken" | "skipped") => {
    logCheckin.mutate(
      { medicine_id: checkinId, status },
      {
        onSuccess: () => {
          toast({ title: status === "taken" ? "Check-in completed ✓" : "Check-in skipped" });
        },
      }
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Daily Check-In</h2>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Check-In</Button>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Check-In Schedule</DialogTitle>
            <DialogDescription>Check-ins now use the same schedule and log model as medicines.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-sm">Name</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Daily Check-In" />
            </div>
            <div>
              <Label className="text-sm">Frequency</Label>
              <Input value={form.frequency} onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value }))} placeholder="Once daily" />
            </div>
            <div>
              <Label className="text-sm">Scheduled time</Label>
              <Input type="time" value={form.time} onChange={(e) => setForm((p) => ({ ...p, time: e.target.value || "08:00" }))} />
            </div>
            <div>
              <Label className="text-sm">Notes</Label>
              <Textarea value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} placeholder="Optional instructions or wellness prompt" rows={3} />
            </div>
            <Button variant="coral" className="w-full" onClick={handleCreate} disabled={create.isPending || !form.name.trim()}>
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ClipboardCheck className="h-4 w-4 mr-2" />} Save Check-In Schedule
            </Button>
          </div>
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
            return (
              <Card key={checkin.id} className="border-transparent card-elevated">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">{checkin.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {checkin.frequency || "Once daily"} · {slots.map(formatSlot).join(", ")}
                      </p>
                      {checkin.note && <p className="text-xs text-muted-foreground mt-1">{checkin.note}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${todayStatus === "taken" ? "bg-success/10 text-success" : todayStatus === "skipped" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
                        {todayStatus === "taken" ? "Completed today" : todayStatus === "skipped" ? "Skipped today" : "Pending today"}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => handleLog(String(checkin.id), "skipped")} disabled={logCheckin.isPending || !!todayStatus}><SkipForward className="h-4 w-4 mr-1" /> Skip</Button>
                      <Button size="sm" onClick={() => handleLog(String(checkin.id), "taken")} disabled={logCheckin.isPending || !!todayStatus}><Check className="h-4 w-4 mr-1" /> Complete</Button>
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
                    <div>
                      <p className="text-sm font-medium text-foreground capitalize">{log.status === "taken" ? "Completed" : log.status}</p>
                      {log.note && <p className="text-xs text-muted-foreground mt-1">{log.note}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleDateString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
