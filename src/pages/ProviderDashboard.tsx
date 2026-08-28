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
  CalendarDays, DollarSign, Clock, Check, X, Loader2, User, Briefcase, TrendingUp, Plus, Trash2, Settings, MessageSquare,
} from "lucide-react";
import ProviderSettingsTab from "@/components/provider/ProviderSettingsTab";
import MyBookingServicesTab from "@/components/provider/MyBookingServicesTab";
import BookingThreadDialog from "@/components/booking/BookingThreadDialog";


import {
  useProviderBookings, useUpdateBookingStatus, useMyProfile,
  useProviderAvailability, useUpsertProviderAvailability,
} from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { formatDate, formatTime, formatDateTime } from "@/lib/locale";
import { cleanBookingNote } from "@/lib/utils";

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
  const [threadOpen, setThreadOpen] = useState(false);
  const [threadBooking, setThreadBooking] = useState<any>(null);


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



  const handleSaveSchedule = () => {
    if (!providerId) return;
    const weeklySlots = Object.entries(schedule).map(([day, s]) => ({
      day_of_week: parseInt(day), start_time: s.start, end_time: s.end, is_available: s.enabled,
    }));
    const overrideSlots = dateOverrides.map((o) => ({
      specific_date: o.date, start_time: o.start, end_time: o.end, is_available: o.available,
    }));
    upsertAvailability.mutate({ providerId, slots: [...weeklySlots, ...overrideSlots] }, {
      onSuccess: () => toast({ title: isZh ? "排班已保存" : "Schedule saved" }),
      onError: (e: any) => toast({ title: isZh ? "保存失败" : "Save failed", description: e.message, variant: "destructive" }),
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
      toast({ title: isZh ? "日期例外已保存" : "Date override saved" });
    } catch (e: any) {
      toast({ title: isZh ? "操作失败" : "Failed", description: e.message, variant: "destructive" });
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
      toast({ title: isZh ? "已删除例外" : "Override removed" });
    } catch (e: any) { toast({ title: isZh ? "操作失败" : "Failed", description: e.message, variant: "destructive" }); }
  };

  const pendingBookings = (bookings || []).filter((b: any) => b.status === "pending");
  const confirmedBookings = (bookings || []).filter((b: any) => b.status === "confirmed");
  const completedBookings = (bookings || []).filter((b: any) => b.status === "completed");
  // Open refund requests the caregiver has to answer, newest first.
  const refundRequests = (bookings || []).filter((b: any) => b.refund_status === "requested");
  const settledRefunds = (bookings || []).filter((b: any) => ["approved", "declined"].includes(String(b.refund_status || "")));
  const totalEarnings = completedBookings.reduce((sum: number, b: any) => sum + (b.total_cost || 0), 0);
  const pendingEarnings = confirmedBookings.reduce((sum: number, b: any) => sum + (b.total_cost || 0), 0);


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
          { label: isZh ? "总收入" : "Total Earned", value: `${isZh ? "¥" : "$"}${totalEarnings.toFixed(0)}`, icon: DollarSign, color: "text-success" },
          { label: isZh ? "待结算" : "Pending Payout", value: `${isZh ? "¥" : "$"}${pendingEarnings.toFixed(0)}`, icon: TrendingUp, color: "text-coral" },
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
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="requests" className="text-xs sm:text-sm">{isZh ? "预约请求" : "Requests"} ({pendingBookings.length})</TabsTrigger>
          <TabsTrigger value="schedule" className="text-xs sm:text-sm">{isZh ? "排班" : "Schedule"}</TabsTrigger>
          <TabsTrigger value="refunds" className="text-xs sm:text-sm">
            {isZh ? "退款与问题" : "Refunds & issues"}{refundRequests.length > 0 ? ` (${refundRequests.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="availability" className="text-xs sm:text-sm">{isZh ? "可约时间" : "Availability"}</TabsTrigger>
          <TabsTrigger value="earnings" className="text-xs sm:text-sm">{isZh ? "收入" : "Earnings"}</TabsTrigger>
          <TabsTrigger value="services" className="text-xs sm:text-sm">{isZh ? "我的服务" : "My Services & Rates"}</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm"><Settings className="h-3.5 w-3.5 mr-1" />{isZh ? "我的" : "Profile"}</TabsTrigger>
        </TabsList>

        <TabsContent value="refunds" className="mt-4 space-y-4">
          {refundRequests.length === 0 && settledRefunds.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">
              {isZh ? "暂无退款申请或问题反馈" : "No refund requests or reported issues"}
            </p>
          ) : (
            [...refundRequests, ...settledRefunds].map((b: any) => (
              <Card key={b.id} className="border-transparent card-elevated">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{b.client?.full_name || (isZh ? "客户" : "Client")}</h3>
                      <p className="text-sm text-muted-foreground">
                        #{b.id} · {b.service_type} · {b.appointment_date ? formatDate(b.appointment_date, isZh ? "zh-CN" : "en", { month: "short", day: "numeric" }) : ""} {b.appointment_time || ""}
                      </p>
                      {!!b.refund_reason && (
                        <p className="text-sm text-muted-foreground mt-1.5 italic">"{b.refund_reason}"</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-foreground">
                        {isZh ? "¥" : "$"}{Number(b.refund_amount || b.total_cost || 0).toFixed(2)}
                      </p>
                      <Badge
                        className="mt-1"
                        variant={b.refund_status === "approved" ? "default" : b.refund_status === "declined" ? "destructive" : "secondary"}
                      >
                        {b.refund_status === "approved"
                          ? (isZh ? "已退款" : "Refunded")
                          : b.refund_status === "declined"
                            ? (isZh ? "已拒绝" : "Declined")
                            : (isZh ? "待处理" : "Awaiting you")}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant={b.refund_status === "requested" ? "coral" : "outline"}
                    size="sm"
                    onClick={() => { setThreadBooking(b); setThreadOpen(true); }}
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                    {b.refund_status === "requested"
                      ? (isZh ? "查看并处理" : "Review & decide")
                      : (isZh ? "查看沟通记录" : "View thread")}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>


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
                      <p className="text-sm text-muted-foreground">{b.appointment_date ? formatDate(b.appointment_date, isZh ? "zh-CN" : "en", { weekday: "short", month: "short", day: "numeric" }) : ""} {isZh ? "于" : "at"} {b.appointment_time || ""}</p>
                      {cleanBookingNote(b.special_instruction) && <p className="text-xs text-muted-foreground mt-1 italic">"{cleanBookingNote(b.special_instruction)}"</p>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-lg font-bold text-foreground">{isZh ? "¥" : "$"}{b.total_cost || 0}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="default" onClick={() => handleBookingAction(b.id, "confirmed")} disabled={updateBookingStatus.isPending}><Check className="h-3 w-3 mr-1" /> {isZh ? "接受" : "Accept"}</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setThreadBooking(b); setThreadOpen(true); }}><MessageSquare className="h-3 w-3 mr-1" /> {isZh ? "沟通" : "Thread"}</Button>

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
                      <p className="text-xs text-muted-foreground">{b.appointment_date ? formatDate(b.appointment_date, isZh ? "zh-CN" : "en", { month: "short" }) : ""}</p>
                      <p className="text-lg font-bold text-foreground">{b.appointment_date ? new Date(b.appointment_date).getDate() : ""}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{b.client?.full_name || (isZh ? "客户" : "Client")}</h3>
                      <p className="text-sm text-muted-foreground">{b.appointment_time} · {b.duration_hour}{isZh ? "小时" : "hrs"} · {b.service_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[b.status]}>{b.status}</Badge>
                    <Button size="sm" variant="ghost" onClick={() => { setThreadBooking(b); setThreadOpen(true); }}><MessageSquare className="h-3 w-3 mr-1" /> {isZh ? "沟通" : "Thread"}</Button>
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
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>{isZh ? "特殊日期设置" : "Date-Specific Overrides"}</CardTitle>
              <Dialog open={addOverrideOpen} onOpenChange={setAddOverrideOpen}>
                <DialogTrigger asChild><Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" /> {isZh ? "添加特殊日" : "Add Override"}</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{isZh ? "添加特殊日期" : "Add Date Override"}</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div><Label>{isZh ? "日期" : "Date"}</Label><Input type="date" value={newOverride.date} onChange={e => setNewOverride(p => ({ ...p, date: e.target.value }))} min={new Date().toISOString().split("T")[0]} className="mt-1" /></div>
                    <div className="flex items-center gap-2"><Switch checked={newOverride.available} onCheckedChange={c => setNewOverride(p => ({ ...p, available: c }))} /><Label>{newOverride.available ? (isZh ? "可约" : "Available") : (isZh ? "不可约（休息日）" : "Unavailable (day off)")}</Label></div>
                    {newOverride.available && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1"><Label>{isZh ? "开始" : "Start"}</Label><Input type="time" value={newOverride.start} onChange={e => setNewOverride(p => ({ ...p, start: e.target.value }))} className="mt-1" /></div>
                        <div className="flex-1"><Label>{isZh ? "结束" : "End"}</Label><Input type="time" value={newOverride.end} onChange={e => setNewOverride(p => ({ ...p, end: e.target.value }))} className="mt-1" /></div>
                      </div>
                    )}
                    <Button variant="coral" className="w-full" onClick={handleAddOverride} disabled={savingOverrides || !newOverride.date}>{savingOverrides ? (isZh ? "保存中…" : "Saving...") : (isZh ? "保存设置" : "Save Override")}</Button>
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
                        <p className="text-sm font-medium text-foreground">{formatDate(o.date + "T12:00:00", isZh ? "zh-CN" : "en", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</p>
                        <p className="text-xs text-muted-foreground">{o.available ? `${o.start} – ${o.end}` : (isZh ? "不可约（休息日）" : "Unavailable (day off)")}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={o.available ? "default" : "secondary"}>{o.available ? (isZh ? "可约" : "Available") : (isZh ? "休息" : "Off")}</Badge>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteOverride(o.date)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground text-center py-4">{isZh ? "暂无特殊日期。可为节假日、特殊营业时间或休息日添加设置。" : "No date overrides. Add overrides for holidays, special hours, or days off."}</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="mt-4">
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <Card className="border-transparent card-elevated"><CardContent className="p-5 text-center"><p className="text-3xl font-bold text-foreground">{isZh ? "¥" : "$"}{totalEarnings.toFixed(2)}</p><p className="text-sm text-muted-foreground mt-1">{isZh ? "已完成订单总额" : "Completed Bookings Total"}</p></CardContent></Card>
            <Card className="border-transparent card-elevated"><CardContent className="p-5 text-center"><p className="text-3xl font-bold text-foreground">{completedBookings.length}</p><p className="text-sm text-muted-foreground mt-1">{isZh ? "已完成预约" : "Completed Bookings"}</p></CardContent></Card>
          </div>
          <Card className="border-transparent card-elevated mb-4">
            <CardContent className="p-5 text-sm text-muted-foreground leading-relaxed">
              {isZh
                ? "客户在下单时通过平台的在线支付完成付款，款项按订单记入您的收款账户。完成服务后金额转为可提现余额，您可在“收款账户”中提交提现申请；退款与纠纷同样按订单处理。"
                : "Clients pay online when they place the booking, and each amount is recorded to your payout account. Once you mark the service complete the amount becomes withdrawable — request a payout from your payout account. Refunds and disputes are handled per order."}
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <ProviderSettingsTab />
        </TabsContent>

        <TabsContent value="services" className="mt-4">
          <MyBookingServicesTab />
        </TabsContent>
      </Tabs>

      <BookingThreadDialog
        open={threadOpen}
        onOpenChange={setThreadOpen}
        orderId={threadBooking?.id}
        role="provider"
        counterpartName={threadBooking?.client?.full_name}
        refundStatus={threadBooking?.refund_status}
        refundReason={threadBooking?.refund_reason}
        refundAmount={threadBooking?.refund_amount}
      />
    </div>

  );
}
