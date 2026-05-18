import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  CalendarDays, DollarSign, Clock, Check, X, Loader2, User, Briefcase, TrendingUp, Plus, Trash2, Settings,
} from "lucide-react";
import ProviderSettingsTab from "@/components/provider/ProviderSettingsTab";
import {
  useProviderBookings, useUpdateBookingStatus, useMyProfile,
  useProviderAvailability, useUpsertProviderAvailability,
  useProviderAvailabilitySetting, useUpdateProviderAvailabilitySetting,
  useProviderPayouts,
} from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_ZH = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

export default function ProviderDashboard() {
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith("zh");
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: profile } = useMyProfile();
  const providerId = profile?.id || null;
  const { data: bookings, isLoading: bookingsLoading } = useProviderBookings();
  const updateBookingStatus = useUpdateBookingStatus();
  const { data: availability } = useProviderAvailability(providerId);
  const upsertAvailability = useUpsertProviderAvailability();
  const { data: availabilitySetting } = useProviderAvailabilitySetting(providerId);
  const updateAvailabilitySetting = useUpdateProviderAvailabilitySetting();
  const { data: payouts } = useProviderPayouts();

  const [schedule, setSchedule] = useState<Record<number, { enabled: boolean; start: string; end: string }>>(() => {
    const initial: Record<number, { enabled: boolean; start: string; end: string }> = {};
    for (let i = 0; i < 7; i++) initial[i] = { enabled: false, start: "09:00", end: "17:00" };
    return initial;
  });
  const [scheduleLoaded, setScheduleLoaded] = useState(false);
  const [dateOverrides, setDateOverrides] = useState<{ date: string; start: string; end: string; available: boolean }[]>([]);
  const [overridesLoaded, setOverridesLoaded] = useState(false);
  const [addOverrideOpen, setAddOverrideOpen] = useState(false);
  const [newOverride, setNewOverride] = useState({ date: "", start: "09:00", end: "17:00", available: true });
  const [savingOverrides, setSavingOverrides] = useState(false);
  const [availabilityRules, setAvailabilityRules] = useState({
    min_notice_hours: 24,
    booking_window_days: 60,
    allow_same_day: false,
    requires_confirmation: true,
    buffer_period: 0,
    default_date_availability: "available",
  });
  const [rulesLoaded, setRulesLoaded] = useState(false);

  useEffect(() => {
    if (availability && availability.length > 0 && !scheduleLoaded) {
      const loaded: Record<number, { enabled: boolean; start: string; end: string }> = {};
      for (let i = 0; i < 7; i++) loaded[i] = { enabled: false, start: "09:00", end: "17:00" };
      (availability || []).filter((a: any) => !a.specific_date).forEach((a: any) => {
        loaded[a.day_of_week] = { enabled: a.is_available, start: a.start_time || "09:00", end: a.end_time || "17:00" };
      });
      setSchedule(loaded);
      setScheduleLoaded(true);
    }
  }, [availability, scheduleLoaded]);

  useEffect(() => {
    if (availability && !overridesLoaded) {
      const overrides = (availability || []).filter((a: any) => a.specific_date).map((a: any) => ({
        date: a.specific_date, start: a.start_time || "09:00", end: a.end_time || "17:00", available: a.is_available,
      }));
      setDateOverrides(overrides);
      setOverridesLoaded(true);
    }
  }, [availability, overridesLoaded]);

  useEffect(() => {
    if (availabilitySetting && !rulesLoaded) {
      setAvailabilityRules({
        min_notice_hours: Number(availabilitySetting.min_notice_hours ?? 24),
        booking_window_days: Number(availabilitySetting.booking_window_days ?? 60),
        allow_same_day: Boolean(availabilitySetting.allow_same_day ?? false),
        requires_confirmation: Boolean(availabilitySetting.requires_confirmation ?? true),
        buffer_period: Number(availabilitySetting.buffer_period ?? 0),
        default_date_availability: availabilitySetting.default_date_availability ?? "available",
      });
      setRulesLoaded(true);
    }
    if (!availabilitySetting && !rulesLoaded) {
      setRulesLoaded(true);
    }
  }, [availabilitySetting, rulesLoaded]);

  const handleSaveAvailabilityRules = async () => {
    if (!providerId) return;
    try {
      await updateAvailabilitySetting.mutateAsync({ providerId, setting: availabilityRules });
      qc.invalidateQueries({ queryKey: ["providerAvailabilitySetting", providerId] });
      toast({ title: "Availability rules saved" });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  const handleSaveSchedule = () => {
    if (!providerId) return;
    const weeklySlots = Object.entries(schedule).map(([day, s]) => ({
      day_of_week: parseInt(day), start_time: s.start, end_time: s.end, is_available: s.enabled,
    }));
    const overrideSlots = dateOverrides.map((o) => ({
      specific_date: o.date, start_time: o.start, end_time: o.end, is_available: o.available,
    }));
    upsertAvailability.mutate({ providerId, slots: [...weeklySlots, ...overrideSlots] }, {
      onSuccess: () => toast({ title: "Schedule saved" }),
      onError: (e: any) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
    });
  };

  const handleAddOverride = async () => {
    if (!newOverride.date || !providerId) return;
    setSavingOverrides(true);
    try {
      const nextOverrides = [...dateOverrides.filter(o => o.date !== newOverride.date), newOverride];
      const weeklySlots = Object.entries(schedule).map(([day, s]) => ({
        day_of_week: parseInt(day), start_time: s.start, end_time: s.end, is_available: s.enabled,
      }));
      const overrideSlots = nextOverrides.map((o) => ({
        specific_date: o.date, start_time: o.start, end_time: o.end, is_available: o.available,
      }));
      await upsertAvailability.mutateAsync({ providerId, slots: [...weeklySlots, ...overrideSlots] });
      setDateOverrides(nextOverrides);
      setAddOverrideOpen(false);
      setNewOverride({ date: "", start: "09:00", end: "17:00", available: true });
      qc.invalidateQueries({ queryKey: ["providerAvailability", providerId] });
      toast({ title: "Date override saved" });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally { setSavingOverrides(false); }
  };

  const handleDeleteOverride = async (date: string) => {
    if (!providerId) return;
    try {
      const nextOverrides = dateOverrides.filter(o => o.date !== date);
      const weeklySlots = Object.entries(schedule).map(([day, s]) => ({
        day_of_week: parseInt(day), start_time: s.start, end_time: s.end, is_available: s.enabled,
      }));
      const overrideSlots = nextOverrides.map((o) => ({
        specific_date: o.date, start_time: o.start, end_time: o.end, is_available: o.available,
      }));
      await upsertAvailability.mutateAsync({ providerId, slots: [...weeklySlots, ...overrideSlots] });
      setDateOverrides(nextOverrides);
      qc.invalidateQueries({ queryKey: ["providerAvailability", providerId] });
      toast({ title: "Override removed" });
    } catch (e: any) { toast({ title: "Failed", description: e.message, variant: "destructive" }); }
  };

  const pendingBookings = (bookings || []).filter((b: any) => b.status === "pending");
  const confirmedBookings = (bookings || []).filter((b: any) => b.status === "confirmed");
  const completedBookings = (bookings || []).filter((b: any) => b.status === "completed");
  const totalEarnings = completedBookings.reduce((sum: number, b: any) => sum + (b.total_cost || 0) * 0.85, 0);
  const pendingEarnings = confirmedBookings.reduce((sum: number, b: any) => sum + (b.total_cost || 0) * 0.85, 0);

  const handleBookingAction = (id: string, status: string) => {
    updateBookingStatus.mutate({ id, status }, { onSuccess: () => toast({ title: `Booking ${status}` }) });
  };

  const statusColors: Record<string, string> = { confirmed: "bg-success text-success-foreground", pending: "bg-warning text-warning-foreground", completed: "bg-muted text-muted-foreground", cancelled: "bg-destructive text-destructive-foreground" };

  return (
    <div className="max-w-6xl mx-auto px-4 py-5">
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{isZh ? "服务者中心" : "Provider Dashboard"}</h1>
        <p className="text-sm text-muted-foreground">{isZh ? "管理预约、排班与收入" : "Manage your bookings, schedule, and earnings"}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isZh ? "待处理" : "Pending Requests", value: pendingBookings.length, icon: Clock, color: "text-warning" },
          { label: isZh ? "已确认" : "Confirmed", value: confirmedBookings.length, icon: CalendarDays, color: "text-primary" },
          { label: isZh ? "总收入" : "Total Earned", value: `$${totalEarnings.toFixed(0)}`, icon: DollarSign, color: "text-success" },
          { label: isZh ? "待结算" : "Pending Payout", value: `$${pendingEarnings.toFixed(0)}`, icon: TrendingUp, color: "text-coral" },
        ].map(stat => (
          <Card key={stat.label} className="border-transparent card-elevated">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className={`${stat.color} shrink-0`}><stat.icon className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg sm:text-2xl font-bold text-foreground truncate">{stat.value}</p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests" className="text-xs sm:text-sm">{isZh ? "预约请求" : "Requests"} ({pendingBookings.length})</TabsTrigger>
          <TabsTrigger value="schedule" className="text-xs sm:text-sm">{isZh ? "排班" : "Schedule"}</TabsTrigger>
          <TabsTrigger value="availability" className="text-xs sm:text-sm">{isZh ? "可约时间" : "Availability"}</TabsTrigger>
          <TabsTrigger value="earnings" className="text-xs sm:text-sm">{isZh ? "收入" : "Earnings"}</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm"><Settings className="h-3.5 w-3.5 mr-1" />{isZh ? "我的" : "Profile"}</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-4 space-y-4">
          {bookingsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : pendingBookings.length > 0 ? pendingBookings.map((b: any) => (
            <Card key={b.id} className="border-transparent card-elevated">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {b.client?.avatar_url ? <img src={b.client.avatar_url} alt="" className="w-12 h-12 rounded-xl object-cover" /> : <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><User className="h-5 w-5 text-primary" /></div>}
                    <div>
                      <h3 className="font-semibold text-foreground">{b.client?.full_name || (isZh ? "客户" : "Client")}</h3>
                      <p className="text-sm text-muted-foreground">{b.service_type} · {b.duration_hour}{isZh ? "小时" : "hrs"}</p>
                      <p className="text-sm text-muted-foreground">{b.appointment_date ? new Date(b.appointment_date).toLocaleDateString(isZh ? "zh-CN" : "en", { weekday: "short", month: "short", day: "numeric" }) : ""} {isZh ? "于" : "at"} {b.appointment_time || ""}</p>
                      {b.special_instruction && <p className="text-xs text-muted-foreground mt-1 italic">"{b.special_instruction}"</p>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-lg font-bold text-foreground">${b.total_cost || 0}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="default" onClick={() => handleBookingAction(b.id, "confirmed")} disabled={updateBookingStatus.isPending}><Check className="h-3 w-3 mr-1" /> {isZh ? "接受" : "Accept"}</Button>
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleBookingAction(b.id, "cancelled_by_provider")} disabled={updateBookingStatus.isPending}><X className="h-3 w-3 mr-1" /> {isZh ? "拒绝" : "Decline"}</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-12"><Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">{isZh ? "暂无待处理预约请求" : "No pending booking requests"}</p></div>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="mt-4 space-y-4">
          {confirmedBookings.length > 0 ? confirmedBookings.map((b: any) => (
            <Card key={b.id} className="border-transparent card-elevated">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-center shrink-0">
                      <p className="text-xs text-muted-foreground">{b.appointment_date ? new Date(b.appointment_date).toLocaleDateString(isZh ? "zh-CN" : "en", { month: "short" }) : ""}</p>
                      <p className="text-lg font-bold text-foreground">{b.appointment_date ? new Date(b.appointment_date).getDate() : ""}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{b.client?.full_name || (isZh ? "客户" : "Client")}</h3>
                      <p className="text-sm text-muted-foreground">{b.appointment_time} · {b.duration_hour}{isZh ? "小时" : "hrs"} · {b.service_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[b.status]}>{b.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => handleBookingAction(b.id, "completed")}>{isZh ? "完成" : "Complete"}</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : <p className="text-center py-12 text-muted-foreground">{isZh ? "暂无已确认预约" : "No confirmed bookings"}</p>}
        </TabsContent>

        <TabsContent value="availability" className="mt-4 space-y-6">
          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle>{isZh ? "每周排班" : "Weekly Schedule"}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {(isZh ? DAYS_ZH : DAYS_EN).map((day, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                  <div className="w-28 shrink-0">
                    <div className="flex items-center gap-2">
                      <Switch checked={schedule[i]?.enabled || false} onCheckedChange={c => setSchedule(p => ({ ...p, [i]: { ...p[i], enabled: c } }))} />
                      <span className="text-sm font-medium text-foreground">{day}</span>
                    </div>
                  </div>
                  {schedule[i]?.enabled ? (
                    <div className="flex items-center gap-2">
                      <Input type="time" value={schedule[i]?.start || "09:00"} onChange={e => setSchedule(p => ({ ...p, [i]: { ...p[i], start: e.target.value } }))} className="w-32" />
                      <span className="text-muted-foreground">{isZh ? "至" : "to"}</span>
                      <Input type="time" value={schedule[i]?.end || "17:00"} onChange={e => setSchedule(p => ({ ...p, [i]: { ...p[i], end: e.target.value } }))} className="w-32" />
                    </div>
                  ) : <span className="text-sm text-muted-foreground">{isZh ? "不可约" : "Unavailable"}</span>}
                </div>
              ))}
              <Button variant="coral" className="w-full mt-4" onClick={handleSaveSchedule} disabled={upsertAvailability.isPending}>
                {upsertAvailability.isPending ? (isZh ? "保存中…" : "Saving...") : (isZh ? "保存每周排班" : "Save Weekly Schedule")}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle>{isZh ? "预约规则" : "Booking Rules"}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>{isZh ? "最少提前预约（小时）" : "Minimum notice (hours)"}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={availabilityRules.min_notice_hours}
                    onChange={e => setAvailabilityRules(prev => ({ ...prev, min_notice_hours: Number(e.target.value || 0) }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{isZh ? "可预约时间范围（天）" : "Booking window (days)"}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={availabilityRules.booking_window_days}
                    onChange={e => setAvailabilityRules(prev => ({ ...prev, booking_window_days: Number(e.target.value || 1) }))}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>{isZh ? "预约间隔缓冲（分钟）" : "Buffer between bookings (minutes)"}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={availabilityRules.buffer_period}
                    onChange={e => setAvailabilityRules(prev => ({ ...prev, buffer_period: Number(e.target.value || 0) }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{isZh ? "日历默认可约状态" : "Default calendar availability"}</Label>
                  <Select
                    value={availabilityRules.default_date_availability}
                    onValueChange={value => setAvailabilityRules(prev => ({ ...prev, default_date_availability: value === "non-available" ? "non-available" : "available" }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">{isZh ? "默认可约" : "Available by default"}</SelectItem>
                      <SelectItem value="non-available">{isZh ? "默认不可约" : "Not available by default"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{isZh ? "允许当天预约" : "Allow same-day bookings"}</p>
                  <p className="text-xs text-muted-foreground">{isZh ? "允许客户在当天有空档时直接预约。" : "Enable customers to book for the current day when a slot is available."}</p>
                </div>
                <Switch checked={availabilityRules.allow_same_day} onCheckedChange={c => setAvailabilityRules(prev => ({ ...prev, allow_same_day: c }))} />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{isZh ? "需要服务者确认" : "Require provider confirmation"}</p>
                  <p className="text-xs text-muted-foreground">{isZh ? "新预约请求需要您手动确认后才生效。" : "Match Woo Bookings confirmation behavior for new booking requests."}</p>
                </div>
                <Switch checked={availabilityRules.requires_confirmation} onCheckedChange={c => setAvailabilityRules(prev => ({ ...prev, requires_confirmation: c }))} />
              </div>
              <Button variant="outline" className="w-full" onClick={handleSaveAvailabilityRules} disabled={updateAvailabilitySetting.isPending}>
                {updateAvailabilitySetting.isPending ? (isZh ? "保存中…" : "Saving...") : (isZh ? "保存预约规则" : "Save Booking Rules")}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-transparent card-elevated">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Date-Specific Overrides</CardTitle>
              <Dialog open={addOverrideOpen} onOpenChange={setAddOverrideOpen}>
                <DialogTrigger asChild><Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" /> Add Override</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Date Override</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div><Label>Date</Label><Input type="date" value={newOverride.date} onChange={e => setNewOverride(p => ({ ...p, date: e.target.value }))} min={new Date().toISOString().split("T")[0]} className="mt-1" /></div>
                    <div className="flex items-center gap-2"><Switch checked={newOverride.available} onCheckedChange={c => setNewOverride(p => ({ ...p, available: c }))} /><Label>{newOverride.available ? "Available" : "Unavailable (day off)"}</Label></div>
                    {newOverride.available && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1"><Label>Start</Label><Input type="time" value={newOverride.start} onChange={e => setNewOverride(p => ({ ...p, start: e.target.value }))} className="mt-1" /></div>
                        <div className="flex-1"><Label>End</Label><Input type="time" value={newOverride.end} onChange={e => setNewOverride(p => ({ ...p, end: e.target.value }))} className="mt-1" /></div>
                      </div>
                    )}
                    <Button variant="coral" className="w-full" onClick={handleAddOverride} disabled={savingOverrides || !newOverride.date}>{savingOverrides ? "Saving..." : "Save Override"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {dateOverrides.length > 0 ? (
                <div className="space-y-2">
                  {dateOverrides.sort((a, b) => a.date.localeCompare(b.date)).map(o => (
                    <div key={o.date} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="text-sm font-medium text-foreground">{new Date(o.date + "T12:00:00").toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</p>
                        <p className="text-xs text-muted-foreground">{o.available ? `${o.start} – ${o.end}` : "Unavailable (day off)"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={o.available ? "default" : "secondary"}>{o.available ? "Available" : "Off"}</Badge>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteOverride(o.date)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground text-center py-4">No date overrides. Add overrides for holidays, special hours, or days off.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="mt-4">
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <Card className="border-transparent card-elevated"><CardContent className="p-5 text-center"><p className="text-3xl font-bold text-foreground">${totalEarnings.toFixed(2)}</p><p className="text-sm text-muted-foreground mt-1">Total Earned (85% of completed)</p></CardContent></Card>
            <Card className="border-transparent card-elevated"><CardContent className="p-5 text-center"><p className="text-3xl font-bold text-foreground">{completedBookings.length}</p><p className="text-sm text-muted-foreground mt-1">Completed Bookings</p></CardContent></Card>
          </div>
          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle>Recent Payouts</CardTitle></CardHeader>
            <CardContent>
              {(payouts || []).length > 0 ? (payouts || []).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div><p className="text-sm font-medium text-foreground">${p.amount}</p><p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p></div>
                  <Badge variant={p.status === "completed" ? "default" : "secondary"}>{p.status}</Badge>
                </div>
              )) : <p className="text-center py-8 text-muted-foreground">No payouts yet</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <ProviderSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
