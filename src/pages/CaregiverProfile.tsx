import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, MapPin, Shield, Clock, CheckCircle, Calendar, MessageSquare, Heart, ArrowLeft, Phone, Loader2 } from "lucide-react";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { useProvider, useProviderReviews, useCreateReview, useToggleSavedProvider, useSavedProviders, useStartConversation, useProviderAvailability, useProviderAvailabilitySetting } from "@/hooks/use-care-data";
import { useAddToCart } from "@/hooks/use-cart";
import { getAvailabilityConflictMessage, getProviderBookingConflictMessage, getProviderProduct, fetchProviderBookingOptions, type BookingResourceOption } from "@/services/woocommerce-api";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { formatDate, formatTime, formatDateTime } from "@/lib/locale";

const TIME_STEP_MINUTES = 30;

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatTimeLabel(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2026, 0, 1, hours, minutes));
}

function getDurationHours(start: string, end: string) {
  if (!start || !end) return 0;
  const diffMinutes = timeToMinutes(end) - timeToMinutes(start);
  return diffMinutes > 0 ? diffMinutes / 60 : 0;
}

export default function CaregiverProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isZh = i18n.language?.startsWith("zh");
  const { isAuthenticated } = useAuth();
  const { data: caregiver, isLoading } = useProvider(id);
  const { data: reviews } = useProviderReviews(id);
  const { data: savedProviders } = useSavedProviders();
  const toggleSaved = useToggleSavedProvider();
  const createReview = useCreateReview();
  const startConversation = useStartConversation();
  const addToCart = useAddToCart();

  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingEndTime, setBookingEndTime] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [availabilityWarning, setAvailabilityWarning] = useState("");
  const [recurringPattern, setRecurringPattern] = useState("none");
  const [deliveryResourceId, setDeliveryResourceId] = useState<string>("");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const { data: availability } = useProviderAvailability(id);
  const { data: availabilitySetting } = useProviderAvailabilitySetting(id || null);
  const isFavorited = savedProviders?.some((sp: any) => sp.provider_id === id) || false;

  // Fetch the provider's WC product to derive their actual offered services + per-service rates
  const { data: providerProduct } = useQuery({
    queryKey: ["provider-product", id],
    queryFn: () => getProviderProduct(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch delivery resources (Local / Virtual) attached to this product so the
  // booking dialog can show price-impacting choices and total live-updates.
  const { data: bookingResources = [] } = useQuery({
    queryKey: ["provider-booking-options", id],
    queryFn: () => fetchProviderBookingOptions(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  // Auto-select first delivery option when dialog opens
  useEffect(() => {
    if (bookingDialogOpen && !deliveryResourceId && bookingResources.length > 0) {
      setDeliveryResourceId(String(bookingResources[0].id));
    }
  }, [bookingDialogOpen, deliveryResourceId, bookingResources]);

  const selectedResource = bookingResources.find((r: BookingResourceOption) => String(r.id) === deliveryResourceId);
  const availabilityPreview = useMemo(() => {
    const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklySlots = (availability || [])
      .filter((slot: any) => slot.is_available && typeof slot.day_of_week === "number" && slot.start_time && slot.end_time)
      .sort((a: any, b: any) => a.day_of_week - b.day_of_week || String(a.start_time).localeCompare(String(b.start_time)));

    return weeklySlots.slice(0, 5).map((slot: any) => ({
      label: `${weekdayLabels[slot.day_of_week]} ${slot.start_time}–${slot.end_time}`,
    }));
  }, [availability]);
  // In the flat-resource model, the resource IS the service package and its
  // blockCost IS the full per-hour rate (no separate base + surcharge).
  const effectiveRate = Number(selectedResource?.blockCost || 0);
  // Derive the service-type label from the chosen resource for display + order meta.
  const bookingTypeLabel = selectedResource?.name || "";

  const availableTimeRanges = useMemo(() => {
    if (!bookingDate) return [];

    const dayOfWeek = new Date(`${bookingDate}T12:00:00`).getDay();
    const specificSlots = (availability || []).filter((slot: any) => slot.specific_date === bookingDate);
    const candidateSlots = specificSlots.length > 0
      ? specificSlots.filter((slot: any) => slot.is_available && slot.start_time && slot.end_time)
      : (availability || []).filter(
          (slot: any) =>
            slot.day_of_week === dayOfWeek && slot.is_available && slot.start_time && slot.end_time,
        );

    // Fallback: provider has not defined any availability for this day.
    // Allow booking across a default 08:00–22:00 window so the user can still
    // pick a time and submit a request (provider will confirm/decline).
    if (candidateSlots.length === 0) {
      return [{ start_time: "08:00", end_time: "22:00", is_available: true, _fallback: true }];
    }

    return candidateSlots.sort(
      (a: any, b: any) => String(a.start_time).localeCompare(String(b.start_time)),
    );
  }, [availability, bookingDate]);

  const startTimeOptions = useMemo(() => {
    const options = new Set<string>();

    availableTimeRanges.forEach((slot: any) => {
      const slotStart = timeToMinutes(String(slot.start_time));
      const slotEnd = timeToMinutes(String(slot.end_time));
      for (let minutes = slotStart; minutes + TIME_STEP_MINUTES <= slotEnd; minutes += TIME_STEP_MINUTES) {
        options.add(minutesToTime(minutes));
      }
    });

    return Array.from(options).sort();
  }, [availableTimeRanges]);

  const endTimeOptions = useMemo(() => {
    if (!bookingTime) return [];

    const selectedStartMinutes = timeToMinutes(bookingTime);
    const options = new Set<string>();

    availableTimeRanges.forEach((slot: any) => {
      const slotStart = timeToMinutes(String(slot.start_time));
      const slotEnd = timeToMinutes(String(slot.end_time));
      if (selectedStartMinutes < slotStart || selectedStartMinutes >= slotEnd) return;

      for (
        let minutes = selectedStartMinutes + TIME_STEP_MINUTES;
        minutes <= slotEnd;
        minutes += TIME_STEP_MINUTES
      ) {
        options.add(minutesToTime(minutes));
      }
    });

    return Array.from(options).sort();
  }, [availableTimeRanges, bookingTime]);

  useEffect(() => {
    if (bookingTime && !startTimeOptions.includes(bookingTime)) {
      setBookingTime("");
    }
  }, [bookingTime, startTimeOptions]);

  useEffect(() => {
    if (bookingEndTime && !endTimeOptions.includes(bookingEndTime)) {
      setBookingEndTime("");
    }
  }, [bookingEndTime, endTimeOptions]);

  useEffect(() => {
    if (!bookingTime && startTimeOptions.length > 0) {
      setBookingTime(startTimeOptions[0]);
    }
  }, [bookingTime, startTimeOptions]);

  useEffect(() => {
    if (!bookingEndTime && endTimeOptions.length > 0) {
      setBookingEndTime(endTimeOptions[0]);
    }
  }, [bookingEndTime, endTimeOptions]);

  // Check availability when date/time changes
  const checkAvailability = (date: string, time: string, endTime = bookingEndTime) => {
    const warning = getAvailabilityConflictMessage(availability || [], date, time, getDurationHours(time, endTime));
    setAvailabilityWarning(warning || "");
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!caregiver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-lg text-muted-foreground">{isZh ? "未找到该护理者" : "Caregiver not found"}</p>
        <Button variant="outline" onClick={() => navigate("/search")}>{isZh ? "返回搜索" : "Back to Search"}</Button>
      </div>
    );
  }

  const handleBooking = async () => {
    if (!bookingDate || !bookingTime || !bookingEndTime || !selectedResource) {
      toast({ title: isZh ? "请选择服务套餐、日期、开始时间和结束时间" : "Please pick a service package, date, start time, and end time", variant: "destructive" });
      return;
    }
    const selectedDate = new Date(bookingDate + "T" + bookingTime);
    if (selectedDate < new Date()) {
      toast({ title: isZh ? "无法预约过去时间" : "Cannot book in the past", description: isZh ? "请选择未来的日期与时间。" : "Please select a future date and time.", variant: "destructive" });
      return;
    }
    const minNoticeHours = Number(availabilitySetting?.min_notice_hours ?? 0);
    if (minNoticeHours > 0) {
      const earliestBookable = new Date(Date.now() + minNoticeHours * 60 * 60 * 1000);
      if (selectedDate < earliestBookable) {
        toast({ title: isZh ? "需提前预约" : "Minimum notice required", description: isZh ? `此护理者要求至少提前 ${minNoticeHours} 小时预约。` : `This caregiver requires at least ${minNoticeHours} hours notice.`, variant: "destructive" });
        return;
      }
    }
    const durationHours = getDurationHours(bookingTime, bookingEndTime);
    if (!durationHours) {
      toast({ title: isZh ? "时间区间无效" : "Invalid time range", description: isZh ? "结束时间必须晚于开始时间。" : "End time must be after start time.", variant: "destructive" });
      return;
    }
    const scheduleConflictMessage = getAvailabilityConflictMessage(availability || [], bookingDate, bookingTime, durationHours);
    if (scheduleConflictMessage) {
      setAvailabilityWarning(scheduleConflictMessage);
      toast({ title: isZh ? "该时段不可预约" : "Time slot unavailable", description: scheduleConflictMessage, variant: "destructive" });
      return;
    }
    const conflictMessage = await getProviderBookingConflictMessage(caregiver.id, bookingDate, bookingTime, durationHours);
    if (conflictMessage) {
      setAvailabilityWarning(conflictMessage);
      toast({ title: isZh ? "该时段不可预约" : "Time slot unavailable", description: conflictMessage, variant: "destructive" });
      return;
    }
    if (!isAuthenticated) {
      toast({ title: isZh ? "请先登录后再预约" : "Please sign in to book", variant: "destructive" });
      navigate("/auth");
      return;
    }
    try {
      const recurringNote = recurringPattern !== "none" ? `[Recurring: ${recurringPattern}] ` : "";
      const packageNote = `[Package: ${selectedResource.name}] `;
      await addToCart.mutateAsync({
        productId: selectedResource.productId || providerProduct?.id,
        booking: {
          resourceId: selectedResource?.id,
          startDate: bookingDate,
          startTime: bookingTime,
          durationHours,
          serviceType: bookingTypeLabel,
          notes: recurringNote + packageNote + (bookingNotes || "") || undefined,
        },
      });
      toast({ title: isZh ? "已加入购物车" : "Added to cart", description: isZh ? `已加入 ${caregiver.full_name} 的 ${selectedResource?.name} 预约。` : `${caregiver.full_name}'s ${selectedResource?.name} booking added.` });
      setBookingDialogOpen(false);
      navigate('/cart');
    } catch (err: any) {
      toast({ title: isZh ? "加入购物车失败" : "Failed to add to cart", description: err.message, variant: "destructive" });
    }
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) { navigate("/auth"); return; }
    toggleSaved.mutate(caregiver.id);
  };

  const durationHrs = getDurationHours(bookingTime, bookingEndTime);
  const total = effectiveRate * durationHrs;
  const hasAvailabilityConflict = Boolean(availabilityWarning);

  return (
    <div className="max-w-5xl mx-auto px-4 py-5">
      <Button variant="ghost" size="sm" className="mb-3 gap-1.5 -ml-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card className="border-transparent card-elevated">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row gap-5">
                <img src={caregiver.avatar_url || "/placeholder.svg"} alt={caregiver.full_name || ""} className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">{caregiver.full_name}</h1>
                        {caregiver.care_provider_is_background_checked && <Shield className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Star className="h-4 w-4 text-warning fill-warning" /> {caregiver.rating_average?.toFixed(1) || "New"} ({caregiver.rating_count || 0} reviews)</span>
                        {caregiver.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {caregiver.location}</span>}
                        {caregiver.years_of_experience && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {caregiver.years_of_experience} years exp.</span>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleToggleFavorite}>
                      <Heart className={`h-5 w-5 ${isFavorited ? "fill-coral text-coral" : "text-muted-foreground"}`} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {(caregiver.specialty || []).map(s => (
                      <Badge key={s} variant="secondary" className="bg-accent text-accent-foreground">{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {caregiver.bio && (
            <Card className="border-transparent card-elevated">
              <CardHeader><CardTitle>{isZh ? "关于" : "About"}</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground leading-relaxed">{caregiver.bio}</p></CardContent>
            </Card>
          )}

          {((caregiver.certifications && caregiver.certifications.length > 0)) && (
            <Card className="border-transparent card-elevated">
              <CardHeader><CardTitle>{isZh ? "资质" : "Qualifications"}</CardTitle></CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-medium text-sm mb-2">{isZh ? "证书" : "Certifications"}</h4>
                  <div className="space-y-2">
                    {(caregiver.certifications || []).map(c => (
                      <div key={c} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-success" /> {c}
                      </div>
                    ))}
                  </div>
                </div>
                {caregiver.care_provider_is_background_checked && (
                  <div className="mt-4 p-3 rounded-lg bg-success/10 flex items-center gap-2 text-sm text-success">
                    <Shield className="h-4 w-4" /> {t("caregiverProfile.bgCheckPassed")}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          <Card className="border-transparent card-elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{isZh ? "评价" : "Reviews"} ({reviews?.length || 0})</CardTitle>
                <Dialog open={reviewDialogOpen} onOpenChange={(open) => {
                    if (open && !isAuthenticated) {
                      toast({ title: isZh ? "请先登录后撰写评价" : "Please sign in to write a review", variant: "destructive" });
                      navigate("/auth");
                      return;
                    }
                    setReviewDialogOpen(open);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="coral" size="sm"><Star className="h-3.5 w-3.5 mr-1" /> {isZh ? "撰写评价" : "Write Review"}</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader><DialogTitle>{isZh ? "评价 " : "Review "}{caregiver.full_name}</DialogTitle></DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label className="mb-2 block">{isZh ? "评分" : "Rating"}</Label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <button key={s} type="button" onClick={() => setReviewRating(s)} className="focus:outline-none">
                                <Star className={`h-7 w-7 cursor-pointer transition-colors ${s <= reviewRating ? "text-warning fill-warning" : "text-muted-foreground/30"}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label>{isZh ? "评论" : "Comment"}</Label>
                          <Textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder={isZh ? "分享您的体验…" : "Share your experience..."} rows={4} />
                        </div>
                        <Button variant="coral" className="w-full" disabled={createReview.isPending} onClick={async () => {
                          try {
                            await createReview.mutateAsync({ entity_id: caregiver.id, entity_type: "provider", rating: reviewRating, comment: reviewComment });
                            toast({ title: isZh ? "评价已提交！" : "Review submitted!", description: isZh ? "感谢您的反馈。" : "Thank you for your feedback." });
                            setReviewDialogOpen(false);
                            setReviewRating(5);
                            setReviewComment("");
                          } catch (err: any) {
                            toast({ title: isZh ? "提交评价失败" : "Failed to submit review", description: err.message, variant: "destructive" });
                          }
                        }}>
                          {createReview.isPending ? (isZh ? "提交中…" : "Submitting...") : (isZh ? "提交评价" : "Submit Review")}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(reviews || []).length > 0 ? (reviews || []).map((review: any) => (
                <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-foreground">{review.reviewer?.full_name || "Anonymous"}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(review.created_at, i18n.language, { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Star key={j} className="h-3 w-3 text-warning fill-warning" />
                    ))}
                  </div>
                  {review.content && <p className="text-sm text-muted-foreground">{review.content}</p>}
                  {review.response_text && (
                    <div className="mt-2 ml-4 p-2 bg-muted/50 rounded text-sm text-muted-foreground">
                      <span className="font-medium">Provider response:</span> {review.response_text}
                    </div>
                  )}
                  <CommentsSection entityType="review" entityId={review.id} compact />
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">No reviews yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Booking + Contact */}
        <div className="space-y-4">
          <Card className="border-transparent card-elevated sticky top-24">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <span className="text-3xl font-bold text-foreground">{isZh ? "¥" : "$"}{bookingResources[0]?.blockCost || caregiver.care_provider_starts_hourly_rate || 0}</span>
                <span className="text-muted-foreground">{isZh ? "/小时" : "/hour"}</span>
              </div>

              {bookingResources.length > 0 && (
                <div className="mb-5 space-y-2">
                  <p className="text-sm font-medium text-foreground">{isZh ? "服务套餐" : "Service packages"}</p>
                  <div className="space-y-2">
                    {bookingResources.map((resource: BookingResourceOption) => (
                      <div key={resource.id} className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-sm text-foreground">{resource.name}</span>
                          <span className="text-sm font-semibold text-foreground">{isZh ? `¥${resource.blockCost}/小时` : `$${resource.blockCost}/hr`}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {availabilityPreview.length > 0 && (
                <div className="mb-5 space-y-2">
                  <p className="text-sm font-medium text-foreground">{isZh ? "可约时间" : "Availability"}</p>
                  <div className="space-y-1.5">
                    {availabilityPreview.map((slot) => (
                      <div key={slot.label} className="text-sm text-muted-foreground">{slot.label}</div>
                    ))}
                  </div>
                </div>
              )}

              <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="coral" className="w-full mb-3" size="lg">
                    <Calendar className="mr-2 h-4 w-4" /> {isZh ? "立即预约" : "Book Now"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{isZh ? `预约 ${caregiver.full_name}` : `Book ${caregiver.full_name}`}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>{isZh ? "服务套餐 *" : "Service Package *"}</Label>
                      {bookingResources.length === 0 ? (
                        <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3 border border-dashed">
                          {isZh ? "该护理者尚未发布服务套餐。请发消息协商定价。" : "This caregiver hasn't published any service packages yet. Send them a message to negotiate a custom price."}
                        </div>
                      ) : (
                        <Select value={deliveryResourceId} onValueChange={setDeliveryResourceId}>
                          <SelectTrigger><SelectValue placeholder={isZh ? "选择套餐" : "Select a package"} /></SelectTrigger>
                          <SelectContent>
                            {bookingResources.map((r: BookingResourceOption) => (
                              <SelectItem key={r.id} value={String(r.id)}>
                                {r.name} — {isZh ? `¥${r.blockCost}/小时` : `$${r.blockCost}/hr`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {selectedResource && (
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {isZh ? "费率：" : "Rate: "}<span className="font-semibold text-foreground">{isZh ? `¥${effectiveRate}/小时` : `$${effectiveRate}/hr`}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>{isZh ? "日期 *" : "Date *"}</Label>
                      <Input
                        type="date"
                        value={bookingDate}
                        onChange={e => {
                          setBookingDate(e.target.value);
                          setBookingTime("");
                          setBookingEndTime("");
                          setAvailabilityWarning("");
                        }}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>{isZh ? "开始 *" : "From *"}</Label>
                        <Select
                          value={bookingTime}
                          onValueChange={(value) => {
                            setBookingTime(value);
                            setBookingEndTime("");
                            checkAvailability(bookingDate, value, "");
                          }}
                          disabled={!bookingDate || startTimeOptions.length === 0}
                        >
                          <SelectTrigger><SelectValue placeholder={bookingDate ? (isZh ? "选择开始时间" : "Select start") : (isZh ? "请先选日期" : "Choose date first")} /></SelectTrigger>
                          <SelectContent>
                            {startTimeOptions.map((time) => (
                              <SelectItem key={time} value={time}>{formatTimeLabel(time)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{isZh ? "结束 *" : "To *"}</Label>
                        <Select
                          value={bookingEndTime}
                          onValueChange={(value) => {
                            setBookingEndTime(value);
                            checkAvailability(bookingDate, bookingTime, value);
                          }}
                          disabled={!bookingTime || endTimeOptions.length === 0}
                        >
                          <SelectTrigger><SelectValue placeholder={bookingTime ? (isZh ? "选择结束时间" : "Select end") : (isZh ? "请先选开始" : "Choose start first")} /></SelectTrigger>
                          <SelectContent>
                            {endTimeOptions.map((time) => (
                              <SelectItem key={time} value={time}>{formatTimeLabel(time)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {availabilityWarning && (
                      <div className="text-sm text-warning bg-warning/10 rounded-lg p-2.5 flex items-center gap-2">
                        <Clock className="h-4 w-4 shrink-0" />
                        {availabilityWarning}
                      </div>
                    )}
                    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                      <div className="text-xs text-muted-foreground">{isZh ? "时长" : "Duration"}</div>
                      <div className="text-sm font-medium text-foreground">
                        {durationHrs > 0 ? (isZh ? `${durationHrs} 小时` : `${durationHrs} hour${durationHrs > 1 ? "s" : ""}`) : (isZh ? "请选择时间段" : "Choose a time range")}
                      </div>
                    </div>
                    <div>
                      <Label>{isZh ? "周期" : "Recurring"}</Label>
                      <Select value={recurringPattern} onValueChange={setRecurringPattern}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{isZh ? "单次" : "One-time"}</SelectItem>
                          <SelectItem value="weekly">{isZh ? "每周" : "Weekly"}</SelectItem>
                          <SelectItem value="biweekly">{isZh ? "每两周" : "Bi-weekly"}</SelectItem>
                          <SelectItem value="monthly">{isZh ? "每月" : "Monthly"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{isZh ? "备注" : "Notes"}</Label>
                      <Textarea value={bookingNotes} onChange={e => setBookingNotes(e.target.value)} placeholder={isZh ? "任何特殊需求…" : "Any special requirements..."} />
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-muted-foreground">{isZh ? "预估总价" : "Estimated Total"}</span>
                      <span className="text-xl font-bold text-foreground">{isZh ? "¥" : "$"}{total}{recurringPattern !== "none" ? `/${recurringPattern === "weekly" ? (isZh ? "周" : "wk") : recurringPattern === "biweekly" ? (isZh ? "2周" : "2wk") : (isZh ? "月" : "mo")}` : ""}</span>
                    </div>
                    <Button variant="coral" className="w-full" onClick={handleBooking} disabled={addToCart.isPending || hasAvailabilityConflict || !selectedResource}>
                      {addToCart.isPending ? (isZh ? "加入中…" : "Adding...") : (isZh ? "加入购物车并结算" : "Add to Cart & Checkout")}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="w-full mb-3" onClick={() => {
                if (!isAuthenticated) { navigate("/auth"); return; }
                startConversation.mutate({ otherUserId: caregiver.id }, {
                  onSuccess: () => navigate("/messages", { state: { targetUserId: caregiver.id, targetUserName: caregiver.full_name, targetUserAvatar: caregiver.avatar_url } }),
                  onError: () => navigate("/messages"),
                });
              }} disabled={startConversation.isPending}>
                <MessageSquare className="mr-2 h-4 w-4" /> {startConversation.isPending ? "Opening..." : "Message / Negotiate Price"}
              </Button>
              {caregiver.phone && (
                <Button variant="ghost" className="w-full" asChild>
                  <a href={`tel:${caregiver.phone}`}>
                    <Phone className="mr-2 h-4 w-4" /> Call {caregiver.full_name?.split(" ")[0]}
                  </a>
                </Button>
              )}

              <div className="mt-6 pt-4 border-t space-y-3 text-sm">
                {caregiver.care_provider_is_background_checked && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>{isZh ? "已通过背景核查" : "Background verified"}</span>
                  </div>
                )}
                {caregiver.years_of_experience && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>{caregiver.years_of_experience} years experience</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
