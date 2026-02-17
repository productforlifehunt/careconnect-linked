import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CalendarDays, DollarSign, Clock, Check, X, Loader2, User, Briefcase, TrendingUp,
} from "lucide-react";
import {
  useProviderBookings, useUpdateBookingStatus, useMyProfile,
  useProviderAvailability, useUpsertProviderAvailability,
  useProviderAvailabilitySetting, useUpdateProviderAvailabilitySetting,
  useProviderPayouts,
} from "@/hooks/use-care-data";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ProviderDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const providerId = user?.id || null;
  const { data: profile } = useMyProfile();
  const { data: bookings, isLoading: bookingsLoading } = useProviderBookings();
  const updateBookingStatus = useUpdateBookingStatus();
  const { data: availability } = useProviderAvailability(providerId);
  const { data: availSettings } = useProviderAvailabilitySetting(providerId);
  const upsertAvailability = useUpsertProviderAvailability();
  const updateSettings = useUpdateProviderAvailabilitySetting();
  const { data: payouts } = useProviderPayouts();

  // Local availability state
  const [schedule, setSchedule] = useState<Record<number, { enabled: boolean; start: string; end: string }>>(() => {
    const initial: Record<number, { enabled: boolean; start: string; end: string }> = {};
    for (let i = 0; i < 7; i++) initial[i] = { enabled: false, start: "09:00", end: "17:00" };
    return initial;
  });
  const [scheduleLoaded, setScheduleLoaded] = useState(false);

  // Load availability into local state once
  if (availability && availability.length > 0 && !scheduleLoaded) {
    const loaded: Record<number, { enabled: boolean; start: string; end: string }> = {};
    for (let i = 0; i < 7; i++) loaded[i] = { enabled: false, start: "09:00", end: "17:00" };
    (availability || []).filter((a: any) => !a.specific_date).forEach((a: any) => {
      loaded[a.day_of_week] = { enabled: a.is_available, start: a.start_time || "09:00", end: a.end_time || "17:00" };
    });
    setSchedule(loaded);
    setScheduleLoaded(true);
  }

  const handleSaveSchedule = () => {
    if (!providerId) return;
    const slots = Object.entries(schedule).map(([day, s]) => ({
      provider_id: providerId,
      day_of_week: parseInt(day),
      start_time: s.start,
      end_time: s.end,
      is_available: s.enabled,
    }));
    upsertAvailability.mutate(slots, {
      onSuccess: () => toast({ title: "Schedule saved" }),
      onError: (e: any) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
    });
  };

  const pendingBookings = (bookings || []).filter((b: any) => b.status === "pending");
  const confirmedBookings = (bookings || []).filter((b: any) => b.status === "confirmed");
  const completedBookings = (bookings || []).filter((b: any) => b.status === "completed");

  const totalEarnings = (completedBookings || []).reduce((sum: number, b: any) => sum + (b.total_cost || 0) * 0.85, 0);
  const pendingEarnings = (confirmedBookings || []).reduce((sum: number, b: any) => sum + (b.total_cost || 0) * 0.85, 0);

  const handleBookingAction = (id: string, status: string) => {
    updateBookingStatus.mutate({ id, status }, {
      onSuccess: () => toast({ title: `Booking ${status}` }),
    });
  };

  const statusColors: Record<string, string> = {
    confirmed: "bg-success text-success-foreground",
    pending: "bg-warning text-warning-foreground",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive text-destructive-foreground",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Provider Dashboard</h1>
        <p className="text-muted-foreground">Manage your bookings, schedule, and earnings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Pending Requests", value: pendingBookings.length, icon: Clock, color: "text-warning" },
          { label: "Confirmed", value: confirmedBookings.length, icon: CalendarDays, color: "text-primary" },
          { label: "Total Earned", value: `$${totalEarnings.toFixed(0)}`, icon: DollarSign, color: "text-success" },
          { label: "Pending Payout", value: `$${pendingEarnings.toFixed(0)}`, icon: TrendingUp, color: "text-coral" },
        ].map(stat => (
          <Card key={stat.label} className="border-transparent card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={stat.color}><stat.icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">Booking Requests ({pendingBookings.length})</TabsTrigger>
          <TabsTrigger value="schedule">My Schedule</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-4 space-y-4">
          {bookingsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : pendingBookings.length > 0 ? pendingBookings.map((b: any) => (
            <Card key={b.id} className="border-transparent card-elevated">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {b.client?.avatar_url ? (
                      <img src={b.client.avatar_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><User className="h-5 w-5 text-primary" /></div>
                    )}
                    <div>
                      <h3 className="font-semibold text-foreground">{b.client?.full_name || "Client"}</h3>
                      <p className="text-sm text-muted-foreground">{b.service_type} · {b.duration_hour}hrs</p>
                      <p className="text-sm text-muted-foreground">
                        {b.appointment_date ? new Date(b.appointment_date).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" }) : ""} at {b.appointment_time || ""}
                      </p>
                      {b.special_instruction && <p className="text-xs text-muted-foreground mt-1 italic">"{b.special_instruction}"</p>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-lg font-bold text-foreground">${b.total_cost || 0}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="default" onClick={() => handleBookingAction(b.id, "confirmed")} disabled={updateBookingStatus.isPending}>
                        <Check className="h-3 w-3 mr-1" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleBookingAction(b.id, "cancelled_by_provider")} disabled={updateBookingStatus.isPending}>
                        <X className="h-3 w-3 mr-1" /> Decline
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No pending booking requests</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="mt-4 space-y-4">
          {(confirmedBookings || []).length > 0 ? confirmedBookings.map((b: any) => (
            <Card key={b.id} className="border-transparent card-elevated">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-center shrink-0">
                      <p className="text-xs text-muted-foreground">{b.appointment_date ? new Date(b.appointment_date).toLocaleDateString("en", { month: "short" }) : ""}</p>
                      <p className="text-lg font-bold text-foreground">{b.appointment_date ? new Date(b.appointment_date).getDate() : ""}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{b.client?.full_name || "Client"}</h3>
                      <p className="text-sm text-muted-foreground">{b.appointment_time} · {b.duration_hour}hrs · {b.service_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[b.status]}>{b.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => handleBookingAction(b.id, "completed")}>Complete</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <p className="text-center py-12 text-muted-foreground">No confirmed bookings</p>
          )}
        </TabsContent>

        <TabsContent value="availability" className="mt-4">
          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle>Weekly Schedule</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {DAYS.map((day, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                  <div className="w-28 shrink-0">
                    <div className="flex items-center gap-2">
                      <Switch checked={schedule[i]?.enabled || false} onCheckedChange={c => setSchedule(p => ({ ...p, [i]: { ...p[i], enabled: c } }))} />
                      <span className="text-sm font-medium text-foreground">{day}</span>
                    </div>
                  </div>
                  {schedule[i]?.enabled && (
                    <div className="flex items-center gap-2">
                      <Input type="time" value={schedule[i]?.start || "09:00"} onChange={e => setSchedule(p => ({ ...p, [i]: { ...p[i], start: e.target.value } }))} className="w-32" />
                      <span className="text-muted-foreground">to</span>
                      <Input type="time" value={schedule[i]?.end || "17:00"} onChange={e => setSchedule(p => ({ ...p, [i]: { ...p[i], end: e.target.value } }))} className="w-32" />
                    </div>
                  )}
                  {!schedule[i]?.enabled && <span className="text-sm text-muted-foreground">Unavailable</span>}
                </div>
              ))}
              <Button variant="coral" className="w-full mt-4" onClick={handleSaveSchedule} disabled={upsertAvailability.isPending}>
                {upsertAvailability.isPending ? "Saving..." : "Save Schedule"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="mt-4">
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <Card className="border-transparent card-elevated">
              <CardContent className="p-5 text-center">
                <p className="text-3xl font-bold text-foreground">${totalEarnings.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Earned (85% of completed)</p>
              </CardContent>
            </Card>
            <Card className="border-transparent card-elevated">
              <CardContent className="p-5 text-center">
                <p className="text-3xl font-bold text-foreground">{completedBookings.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Completed Bookings</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle>Recent Payouts</CardTitle></CardHeader>
            <CardContent>
              {(payouts || []).length > 0 ? (payouts || []).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">${p.amount}</p>
                    <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={p.status === "completed" ? "default" : "secondary"}>{p.status}</Badge>
                </div>
              )) : (
                <p className="text-center py-8 text-muted-foreground">No payouts yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
