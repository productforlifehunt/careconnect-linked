import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, Clock, MoreHorizontal, X, Check, MessageSquare, Loader2, Star, AlertTriangle, RefreshCw } from "lucide-react";
import { useBookings, useUpdateBookingStatus, useStartConversation } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { careDb, careAuth } from "@/integrations/supabase/external-client";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export default function Bookings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: bookings, isLoading } = useBookings();
  const updateStatus = useUpdateBookingStatus();
  const startConversation = useStartConversation();

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [messagingId, setMessagingId] = useState<string | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [cancelTargetName, setCancelTargetName] = useState("");
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleBooking, setRescheduleBooking] = useState<any>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleSaving, setRescheduleSaving] = useState(false);

  const statusColors: Record<string, string> = {
    confirmed: "bg-success text-success-foreground", pending: "bg-warning text-warning-foreground", completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive text-destructive-foreground", cancelled_by_user: "bg-destructive text-destructive-foreground",
    cancelled_by_provider: "bg-destructive text-destructive-foreground", in_progress: "bg-primary text-primary-foreground",
  };

  const handleStatusUpdate = (id: string, status: string) => {
    updateStatus.mutate({ id, status }, {
      onSuccess: () => toast({ title: t("bookings.bookingUpdated", { status }) }),
      onError: (err: any) => toast({ title: t("bookings.updateFailed"), description: err.message, variant: "destructive" }),
    });
  };

  const handleMessage = (booking: any) => {
    if (!booking.provider_id) return;
    setMessagingId(booking.provider_id);
    startConversation.mutate(booking.provider_id, {
      onSuccess: () => {
        navigate("/messages", { state: { targetUserId: booking.provider_id, targetUserName: booking.provider?.full_name, targetUserAvatar: booking.provider?.avatar_url } });
      },
      onError: () => { setMessagingId(null); navigate("/messages"); },
    });
  };

  const openReview = (booking: any) => { setReviewBooking(booking); setReviewRating(5); setReviewComment(""); setReviewOpen(true); };
  const openReschedule = (booking: any) => { setRescheduleBooking(booking); setRescheduleDate(booking.appointment_date || ""); setRescheduleTime(booking.appointment_time || ""); setRescheduleOpen(true); };

  const handleReschedule = async () => {
    if (!rescheduleBooking || !rescheduleDate || !rescheduleTime) return;
    const selectedDate = new Date(rescheduleDate + "T" + rescheduleTime);
    if (selectedDate < new Date()) { toast({ title: t("bookings.cannotPastDate"), variant: "destructive" }); return; }
    setRescheduleSaving(true);
    try {
      const { error } = await careDb.from("booking").update({ appointment_date: rescheduleDate, appointment_time: rescheduleTime, status: "pending" }).eq("id", rescheduleBooking.id);
      if (error) throw error;
      if (rescheduleBooking.provider_id) {
        const { data: { session } } = await careAuth.auth.getSession();
        const userName = session?.user?.user_metadata?.full_name || "A client";
        await careDb.from("notification").insert({ user_id: rescheduleBooking.provider_id, type: "booking_rescheduled", title: "Booking Rescheduled", content: `${userName} rescheduled to ${new Date(rescheduleDate).toLocaleDateString("en", { month: "short", day: "numeric" })} at ${rescheduleTime}`, link_url: "/provider-dashboard" }).then(() => {});
      }
      toast({ title: t("bookings.rescheduled"), description: t("bookings.rescheduledDesc") });
      setRescheduleOpen(false);
      qc.invalidateQueries({ queryKey: ["bookings"] });
    } catch (e: any) { toast({ title: t("bookings.rescheduleFailed"), description: e.message, variant: "destructive" }); }
    finally { setRescheduleSaving(false); }
  };

  const handleSubmitReview = async () => {
    if (!reviewBooking) return;
    setReviewSaving(true);
    try {
      const { data: { session } } = await careAuth.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const { data: existingReview } = await careDb.from("review").select("id").eq("reviewer_id", session.user.id).eq("entity_id", reviewBooking.provider_id).maybeSingle();
      if (existingReview) { toast({ title: t("bookings.alreadyReviewed"), description: t("bookings.alreadyReviewedDesc"), variant: "destructive" }); setReviewOpen(false); setReviewSaving(false); return; }
      const { error } = await careDb.from("review").insert({ reviewer_id: session.user.id, entity_id: reviewBooking.provider_id, rating: reviewRating, comment: reviewComment || null });
      if (error) throw error;
      const { data: existing } = await careDb.from("review").select("rating").eq("entity_id", reviewBooking.provider_id);
      if (existing && existing.length > 0) {
        const total = existing.reduce((sum: number, r: any) => sum + r.rating, 0);
        const avg = total / existing.length;
        await careDb.from("profile").update({ rating_average: Math.round(avg * 10) / 10, rating_count: existing.length }).eq("id", reviewBooking.provider_id);
      } else {
        await careDb.from("profile").update({ rating_average: reviewRating, rating_count: 1 }).eq("id", reviewBooking.provider_id);
      }
      toast({ title: t("bookings.reviewSubmitted") });
      setReviewOpen(false);
    } catch (e: any) { toast({ title: t("bookings.reviewFailed"), description: e.message, variant: "destructive" }); }
    finally { setReviewSaving(false); }
  };

  const allBookings = bookings || [];
  const upcoming = allBookings.filter((b: any) => ["confirmed", "pending", "in_progress"].includes(b.status));
  const past = allBookings.filter((b: any) => ["completed", "cancelled", "cancelled_by_user", "cancelled_by_provider"].includes(b.status));

  const BookingCard = ({ booking }: { booking: any }) => (
    <Card className="border-transparent card-elevated">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {booking.provider?.avatar_url ? (
              <img src={booking.provider.avatar_url} alt={booking.provider.full_name} className="w-12 h-12 rounded-xl object-cover cursor-pointer" onClick={() => navigate(`/caregiver/${booking.provider_id}`)} />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center cursor-pointer" onClick={() => navigate(`/caregiver/${booking.provider_id}`)}>
                <span className="text-primary font-semibold">{(booking.provider?.full_name || "?")[0]}</span>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-foreground cursor-pointer hover:text-primary" onClick={() => navigate(`/caregiver/${booking.provider_id}`)}>{booking.provider?.full_name || t("common.provider")}</h3>
              <p className="text-sm text-muted-foreground">{booking.service_type || "Care"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[booking.status] || "bg-muted text-muted-foreground"}>{booking.status.replace(/_/g, " ")}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {["pending", "confirmed"].includes(booking.status) && <DropdownMenuItem onClick={() => { setCancelTargetId(booking.id); setCancelTargetName(booking.provider?.full_name || t("common.provider")); setCancelConfirmOpen(true); }} className="text-destructive"><X className="mr-2 h-4 w-4" /> {t("bookings.cancelBooking")}</DropdownMenuItem>}
                {["pending", "confirmed"].includes(booking.status) && <DropdownMenuItem onClick={() => openReschedule(booking)}><RefreshCw className="mr-2 h-4 w-4" /> {t("bookings.reschedule")}</DropdownMenuItem>}
                {booking.status === "completed" && <DropdownMenuItem onClick={() => openReview(booking)}><Star className="mr-2 h-4 w-4" /> {t("bookings.leaveReview")}</DropdownMenuItem>}
                <DropdownMenuItem onClick={() => handleMessage(booking)} disabled={messagingId === booking.provider_id}><MessageSquare className="mr-2 h-4 w-4" /> {t("bookings.messageProvider")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4 text-primary" /><span>{new Date(booking.appointment_date || booking.start_time || booking.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</span></div>
          <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4 text-primary" /><span>{booking.appointment_time || ""} · {booking.duration_hour || ""}{t("common.hours")}</span></div>
          <div className="text-right"><span className="font-bold text-foreground text-lg">${booking.total_cost || 0}</span></div>
        </div>
        {booking.special_instruction && <p className="text-sm text-muted-foreground mt-3 p-2 rounded bg-muted/50">{booking.special_instruction}</p>}
        {booking.status === "completed" && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => openReview(booking)}><Star className="h-3.5 w-3.5 mr-1.5" /> {t("bookings.leaveReview")}</Button>
            <Button variant="ghost" size="sm" onClick={() => handleMessage(booking)} disabled={messagingId === booking.provider_id}><MessageSquare className="h-3.5 w-3.5 mr-1.5" /> {t("common.message")}</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("bookings.myBookings")}</h1>
          <p className="text-muted-foreground">{t("bookings.manageCareAppointments")}</p>
        </div>
        <Button variant="coral" onClick={() => navigate("/search")}><CalendarDays className="h-4 w-4 mr-2" /> {t("bookings.bookNew")}</Button>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">{t("bookings.upcoming")} ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">{t("bookings.past")} ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4 space-y-4">
          {upcoming.length > 0 ? upcoming.map((b: any) => <BookingCard key={b.id} booking={b} />) : (
            <div className="text-center py-12">
              <CalendarDays className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">{t("bookings.noUpcoming")}</p>
              <Button variant="coral" className="mt-4" onClick={() => navigate("/search")}>{t("bookings.findCaregiver")}</Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="past" className="mt-4 space-y-4">
          {past.length > 0 ? past.map((b: any) => <BookingCard key={b.id} booking={b} />) : (
            <div className="text-center py-12"><p className="text-muted-foreground">{t("bookings.noPast")}</p></div>
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> {t("bookings.cancelConfirmTitle")}</DialogTitle>
            <DialogDescription>{t("bookings.cancelConfirmDesc", { name: cancelTargetName })}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCancelConfirmOpen(false)}>{t("bookings.keepBooking")}</Button>
            <Button variant="destructive" onClick={() => { if (cancelTargetId) { handleStatusUpdate(cancelTargetId, "cancelled_by_user"); setCancelConfirmOpen(false); setCancelTargetId(null); } }}>{t("bookings.yesCancel")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><RefreshCw className="h-5 w-5 text-primary" /> {t("bookings.rescheduleTitle")}</DialogTitle>
            <DialogDescription>{t("bookings.rescheduleDesc", { name: rescheduleBooking?.provider?.full_name || t("common.provider") })}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{t("bookings.newDate")}</Label><Input type="date" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} min={new Date().toISOString().split("T")[0]} /></div>
              <div><Label>{t("bookings.newTime")}</Label><Input type="time" value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)} /></div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setRescheduleOpen(false)}>{t("common.cancel")}</Button>
              <Button variant="coral" onClick={handleReschedule} disabled={rescheduleSaving || !rescheduleDate || !rescheduleTime}>
                {rescheduleSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                {t("bookings.reschedule")}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
