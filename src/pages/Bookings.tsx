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
import { CalendarDays, Clock, MoreHorizontal, X, Check, MessageSquare, Loader2, Star, AlertTriangle, RefreshCw, DollarSign } from "lucide-react";
import { useBookings, useCreateReview, useUpdateBookingStatus, useStartConversation } from "@/hooks/use-care-data";
import { useRequestRefund } from "@/hooks/use-cart";
import { updateOrderBookingDetails } from "@/services/woocommerce-api";
import { getProviderCalendarBookingConflictMessage as getProviderBookingConflictMessage } from "@/features/calendar/booking-availability";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { formatDate, formatTime, formatDateTime } from "@/lib/locale";
import { cleanBookingNote } from "@/lib/utils";

export default function Bookings() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { user: authUser } = useAuth();
  const { data: bookings, isLoading } = useBookings();
  const createReview = useCreateReview();
  const updateStatus = useUpdateBookingStatus();
  const startConversation = useStartConversation();
  const requestRefund = useRequestRefund();

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
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundBooking, setRefundBooking] = useState<any>(null);
  const [refundReason, setRefundReason] = useState("");
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueBooking, setIssueBooking] = useState<any>(null);
  const [issueText, setIssueText] = useState("");
  const [issueSubmitting, setIssueSubmitting] = useState(false);

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
      const conflictMessage = await getProviderBookingConflictMessage(
        String(rescheduleBooking.provider_id || ""),
        rescheduleDate,
        rescheduleTime,
        Number(rescheduleBooking.duration_hour || 1),
      );
      if (conflictMessage) {
        toast({ title: t("bookings.rescheduleFailed"), description: conflictMessage, variant: "destructive" });
        return;
      }
      await updateOrderBookingDetails(Number(rescheduleBooking.id), {
        appointmentDate: rescheduleDate,
        appointmentTime: rescheduleTime,
        durationHours: Number(rescheduleBooking.duration_hour || 1),
        specialInstructions: rescheduleBooking.special_instruction || "",
      });
      toast({ title: t("bookings.rescheduled"), description: t("bookings.rescheduledDesc") });
      setRescheduleOpen(false);
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["providerBookings"] });
    } catch (e: any) { toast({ title: t("bookings.rescheduleFailed"), description: e.message, variant: "destructive" }); }
    finally { setRescheduleSaving(false); }
  };

  const handleSubmitReview = async () => {
    if (!reviewBooking) return;
    setReviewSaving(true);
    try {
      if (!authUser) throw new Error("Not authenticated");
      await createReview.mutateAsync({
        entity_id: String(reviewBooking.provider_id),
        entity_type: "provider",
        rating: reviewRating,
        comment: reviewComment,
      });
      toast({ title: t("bookings.reviewSubmitted") });
      setReviewOpen(false);
      setReviewBooking(null);
      setReviewRating(5);
      setReviewComment("");
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
            <Badge className={statusColors[booking.status] || "bg-muted text-muted-foreground"}>{String(t(`bookings.status.${booking.status}`, { defaultValue: booking.status.replace(/_/g, " ") }))}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {["pending", "confirmed"].includes(booking.status) && <DropdownMenuItem onClick={() => { setCancelTargetId(booking.id); setCancelTargetName(booking.provider?.full_name || t("common.provider")); setCancelConfirmOpen(true); }} className="text-destructive"><X className="mr-2 h-4 w-4" /> {t("bookings.cancelBooking")}</DropdownMenuItem>}
                {["pending", "confirmed"].includes(booking.status) && <DropdownMenuItem onClick={() => openReschedule(booking)}><RefreshCw className="mr-2 h-4 w-4" /> {t("bookings.reschedule")}</DropdownMenuItem>}
                {booking.status === "completed" && <DropdownMenuItem onClick={() => openReview(booking)}><Star className="mr-2 h-4 w-4" /> {t("bookings.leaveReview")}</DropdownMenuItem>}
                {["completed", "confirmed", "processing"].includes(booking.status) && Number(booking.total_cost || 0) > 0 && (
                  <DropdownMenuItem onClick={() => { setRefundBooking(booking); setRefundReason(""); setRefundOpen(true); }}><DollarSign className="mr-2 h-4 w-4" /> {t("bookings.requestRefund", "Request Refund")}</DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => { setIssueBooking(booking); setIssueText(""); setIssueOpen(true); }}><AlertTriangle className="mr-2 h-4 w-4" /> {t("bookings.reportIssue", "Report Issue")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMessage(booking)} disabled={messagingId === booking.provider_id}><MessageSquare className="mr-2 h-4 w-4" /> {t("common.message")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4 text-primary" /><span>{formatDate(booking.appointment_date || booking.start_time || booking.created_at, i18n.language, { month: "short", day: "numeric", year: "numeric" })}</span></div>
          <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4 text-primary" /><span>{booking.appointment_time || ""} · {booking.duration_hour || ""}{t("common.hours")}</span></div>
          <div className="text-right"><span className="font-bold text-foreground text-lg">{i18n.language?.startsWith("zh") ? "¥" : "$"}{booking.total_cost || 0}</span></div>
        </div>
        {cleanBookingNote(booking.special_instruction) && <p className="text-sm text-muted-foreground mt-3 p-2 rounded bg-muted/50">{cleanBookingNote(booking.special_instruction)}</p>}
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
    <div className="max-w-4xl mx-auto px-4 py-5">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{t("bookings.myBookings")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("bookings.manageCareAppointments")}</p>
        </div>
        <Button variant="coral" size="sm" className="shrink-0" onClick={() => navigate("/search")}><CalendarDays className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">{t("bookings.bookNew")}</span></Button>
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

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-warning" /> {t("bookings.leaveReview")}</DialogTitle>
            <DialogDescription>{t("bookings.reviewDesc", { name: reviewBooking?.provider?.full_name || t("common.provider") })}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>{t("bookings.rating")}</Label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setReviewRating(s)} className="p-1 transition-colors">
                    <Star className={`h-6 w-6 ${s <= reviewRating ? "text-warning fill-warning" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>{t("bookings.comment")}</Label>
              <Textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder={t("bookings.reviewPlaceholder")} rows={3} />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setReviewOpen(false)}>{t("common.cancel")}</Button>
              <Button variant="coral" onClick={handleSubmitReview} disabled={reviewSaving}>
                {reviewSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Star className="h-4 w-4 mr-2" />}
                {t("bookings.submitReview")}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      {/* Refund Request Dialog */}
      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-warning" /> {t("bookings.requestRefund", "Request Refund")}</DialogTitle>
            <DialogDescription>{t("bookings.refundDesc", `Request a refund for your booking with ${refundBooking?.provider?.full_name || "provider"}.`)}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="rounded-lg bg-muted/40 p-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{t("bookings.orderTotal", "Order Total")}</span><span className="font-bold">{i18n.language?.startsWith("zh") ? "¥" : "$"}{refundBooking?.total_cost || 0}</span></div>
            </div>
            <div>
              <Label>{t("bookings.refundReason", "Reason for refund")}</Label>
              <Textarea value={refundReason} onChange={e => setRefundReason(e.target.value)} placeholder={t("bookings.refundReasonPlaceholder", "Please describe why you are requesting a refund...")} rows={3} />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setRefundOpen(false)}>{t("common.cancel")}</Button>
              <Button variant="coral" disabled={requestRefund.isPending || !refundReason.trim()} onClick={async () => {
                if (!refundBooking) return;
                try {
                  await requestRefund.mutateAsync({
                    orderId: Number(refundBooking.id),
                    amount: String(refundBooking.total_cost || ""),
                    reason: refundReason.trim(),
                  });
                  setRefundOpen(false);
                  setRefundBooking(null);
                  setRefundReason("");
                } catch { /* error handled by hook */ }
              }}>
                {requestRefund.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <DollarSign className="h-4 w-4 mr-2" />}
                {t("bookings.submitRefund", "Submit Refund Request")}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Issue dialog — files a customer-visible note on the WC order,
          which admins and Dokan vendor see in their dashboards. */}
      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("bookings.reportIssue", "Report Issue")}</DialogTitle>
            <DialogDescription>
              {t(
                "bookings.reportIssueDesc",
                "Describe what went wrong with this booking. Our team and the provider will be notified and respond as soon as possible."
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
              placeholder={t("bookings.reportIssuePlaceholder", "Tell us what happened...")}
              rows={5}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIssueOpen(false)}>{t("common.cancel")}</Button>
              <Button
                disabled={issueSubmitting || !issueText.trim()}
                onClick={async () => {
                  if (!issueBooking) return;
                  setIssueSubmitting(true);
                  try {
                    const { addOrderCustomerNote } = await import("@/services/woocommerce-api");
                    await addOrderCustomerNote(Number(issueBooking.id), issueText.trim());
                    toast({
                      title: t("bookings.issueReported", "Issue reported"),
                      description: t(
                        "bookings.issueReportedDesc",
                        "Our team has been notified and will follow up."
                      ),
                    });
                    setIssueOpen(false);
                    setIssueBooking(null);
                    setIssueText("");
                  } catch (err: any) {
                    toast({
                      title: t("bookings.issueFailed", "Failed to report"),
                      description: err.message,
                      variant: "destructive",
                    });
                  } finally {
                    setIssueSubmitting(false);
                  }
                }}
              >
                {issueSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
                {t("bookings.submitIssue", "Submit")}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
