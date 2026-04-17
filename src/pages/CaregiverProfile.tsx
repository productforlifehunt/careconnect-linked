import { useState, useEffect, useMemo } from "react";
import { useServiceTypes } from "@/hooks/use-service-types";
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
import { useCreateBookingWithWooCommerce } from "@/hooks/use-booking-woocommerce";
import { useAddToCart } from "@/hooks/use-cart";
import { getAvailabilityConflictMessage, getProviderBookingConflictMessage, getProviderProduct, extractProviderServicesFromProduct, fetchProductBookingResources, type BookingResourceOption } from "@/services/woocommerce-api";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function CaregiverProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { data: caregiver, isLoading } = useProvider(id);
  const { data: reviews } = useProviderReviews(id);
  const { data: savedProviders } = useSavedProviders();
  const toggleSaved = useToggleSavedProvider();
  const createReview = useCreateReview();
  const startConversation = useStartConversation();
  const createBooking = useCreateBookingWithWooCommerce();
  const addToCart = useAddToCart();
  const { serviceTypes } = useServiceTypes();

  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingDuration, setBookingDuration] = useState("2");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingType, setBookingType] = useState("");
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
    queryKey: ["product-booking-resources", providerProduct?.id],
    queryFn: () => fetchProductBookingResources(providerProduct.id),
    enabled: !!providerProduct?.id,
    staleTime: 1000 * 60 * 5,
  });

  // Auto-select first delivery option when dialog opens
  useEffect(() => {
    if (bookingDialogOpen && !deliveryResourceId && bookingResources.length > 0) {
      setDeliveryResourceId(String(bookingResources[0].id));
    }
  }, [bookingDialogOpen, deliveryResourceId, bookingResources]);

  const selectedResource = bookingResources.find((r: BookingResourceOption) => String(r.id) === deliveryResourceId);
  const resourceCostPerHour = Number(selectedResource?.blockCost || 0);
  // Build the source of truth for what the provider actually offers.
  // Priority: WC product `_service_rates` meta → profile.specialty (fallback) → empty.
  const offered = useMemo(() => {
    const defaultRate = caregiver?.care_provider_starts_hourly_rate || 0;
    const fromProduct = extractProviderServicesFromProduct(providerProduct, defaultRate);
    if (fromProduct.services.length > 0) return fromProduct;
    // Fallback: provider has profile specialties but hasn't synced product yet
    const services = caregiver?.specialty || [];
    const rates: Record<string, number> = {};
    services.forEach(s => { rates[s] = defaultRate; });
    return { services, rates };
  }, [providerProduct, caregiver]);

  // Effective hourly rate: per-service rate if available, else default
  const effectiveRate = bookingType
    ? (offered.rates[bookingType] ?? caregiver?.care_provider_starts_hourly_rate ?? 0)
    : (caregiver?.care_provider_starts_hourly_rate ?? 0);

  // Auto-pick the first offered service when dialog opens, so user can't be stuck
  useEffect(() => {
    if (bookingDialogOpen && !bookingType && offered.services.length > 0) {
      setBookingType(offered.services[0]);
    }
  }, [bookingDialogOpen, bookingType, offered.services]);

  // Check availability when date/time changes
  const checkAvailability = (date: string, time: string) => {
    const warning = getAvailabilityConflictMessage(availability || [], date, time, Number(bookingDuration));
    setAvailabilityWarning(warning || "");
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!caregiver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-lg text-muted-foreground">Caregiver not found</p>
        <Button variant="outline" onClick={() => navigate("/search")}>Back to Search</Button>
      </div>
    );
  }

  const handleBooking = async () => {
    if (!bookingDate || !bookingTime || !bookingType) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    const selectedDate = new Date(bookingDate + "T" + bookingTime);
    if (selectedDate < new Date()) {
      toast({ title: "Cannot book in the past", description: "Please select a future date and time.", variant: "destructive" });
      return;
    }
    const minNoticeHours = Number(availabilitySetting?.min_notice_hours ?? 0);
    if (minNoticeHours > 0) {
      const earliestBookable = new Date(Date.now() + minNoticeHours * 60 * 60 * 1000);
      if (selectedDate < earliestBookable) {
        toast({ title: "Minimum notice required", description: `This caregiver requires at least ${minNoticeHours} hours notice.`, variant: "destructive" });
        return;
      }
    }
    const durationHours = parseInt(bookingDuration);
    const scheduleConflictMessage = getAvailabilityConflictMessage(availability || [], bookingDate, bookingTime, durationHours);
    if (scheduleConflictMessage) {
      setAvailabilityWarning(scheduleConflictMessage);
      toast({ title: "Time slot unavailable", description: scheduleConflictMessage, variant: "destructive" });
      return;
    }
    const conflictMessage = await getProviderBookingConflictMessage(caregiver.id, bookingDate, bookingTime, durationHours);
    if (conflictMessage) {
      setAvailabilityWarning(conflictMessage);
      toast({ title: "Time slot unavailable", description: conflictMessage, variant: "destructive" });
      return;
    }
    if (!isAuthenticated) {
      toast({ title: "Please sign in to book", variant: "destructive" });
      navigate("/auth");
      return;
    }
    try {
      const recurringNote = recurringPattern !== "none" ? `[Recurring: ${recurringPattern}] ` : "";
      const deliveryNote = selectedResource ? `[Delivery: ${selectedResource.name}] ` : "";
      const ratePerHour = effectiveRate + resourceCostPerHour;
      await createBooking.mutateAsync({
        provider_id: caregiver.id,
        appointment_date: bookingDate,
        appointment_time: bookingTime,
        duration_hour: durationHours,
        service_type: bookingType,
        hourly_rate: ratePerHour,
        total_cost: ratePerHour * durationHours,
        special_instruction: recurringNote + deliveryNote + (bookingNotes || "") || null,
        status: availabilitySetting?.requires_confirmation === false ? "confirmed" : "pending",
        payment_status: "pending",
      });
      toast({ title: "Booking Request Sent!", description: `Your booking with ${caregiver.full_name} has been submitted.` });
      setBookingDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Booking failed", description: err.message, variant: "destructive" });
    }
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) { navigate("/auth"); return; }
    toggleSaved.mutate(caregiver.id);
  };

  const durationHrs = parseInt(bookingDuration) || 0;
  const total = (effectiveRate + resourceCostPerHour) * durationHrs;
  const hasAvailabilityConflict = Boolean(availabilityWarning);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Button variant="ghost" className="mb-4 gap-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-transparent card-elevated">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <img src={caregiver.avatar_url || "/placeholder.svg"} alt={caregiver.full_name || ""} className="w-28 h-28 rounded-2xl object-cover" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-foreground">{caregiver.full_name}</h1>
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
              <CardHeader><CardTitle>About</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground leading-relaxed">{caregiver.bio}</p></CardContent>
            </Card>
          )}

          {((caregiver.certifications && caregiver.certifications.length > 0)) && (
            <Card className="border-transparent card-elevated">
              <CardHeader><CardTitle>Qualifications</CardTitle></CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-medium text-sm mb-2">Certifications</h4>
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
                <CardTitle>Reviews ({reviews?.length || 0})</CardTitle>
                <Dialog open={reviewDialogOpen} onOpenChange={(open) => {
                    if (open && !isAuthenticated) {
                      toast({ title: "Please sign in to write a review", variant: "destructive" });
                      navigate("/auth");
                      return;
                    }
                    setReviewDialogOpen(open);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="coral" size="sm"><Star className="h-3.5 w-3.5 mr-1" /> Write Review</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader><DialogTitle>Review {caregiver.full_name}</DialogTitle></DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label className="mb-2 block">Rating</Label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <button key={s} type="button" onClick={() => setReviewRating(s)} className="focus:outline-none">
                                <Star className={`h-7 w-7 cursor-pointer transition-colors ${s <= reviewRating ? "text-warning fill-warning" : "text-muted-foreground/30"}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label>Comment</Label>
                          <Textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Share your experience..." rows={4} />
                        </div>
                        <Button variant="coral" className="w-full" disabled={createReview.isPending} onClick={async () => {
                          try {
                            await createReview.mutateAsync({ entity_id: caregiver.id, entity_type: "provider", rating: reviewRating, comment: reviewComment });
                            toast({ title: "Review submitted!", description: "Thank you for your feedback." });
                            setReviewDialogOpen(false);
                            setReviewRating(5);
                            setReviewComment("");
                          } catch (err: any) {
                            toast({ title: "Failed to submit review", description: err.message, variant: "destructive" });
                          }
                        }}>
                          {createReview.isPending ? "Submitting..." : "Submit Review"}
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
                    <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</span>
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
                <span className="text-3xl font-bold text-foreground">${caregiver.care_provider_starts_hourly_rate || 0}</span>
                <span className="text-muted-foreground">/hour</span>
              </div>

              <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="coral" className="w-full mb-3" size="lg">
                    <Calendar className="mr-2 h-4 w-4" /> Book Now
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Book {caregiver.full_name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Care Type *</Label>
                      {offered.services.length === 0 ? (
                        <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3 border border-dashed">
                          This caregiver hasn't published any services yet. Please send them a message to inquire.
                        </div>
                      ) : (
                        <Select value={bookingType} onValueChange={setBookingType}>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            {offered.services.map((s: string) => (
                              <SelectItem key={s} value={s}>
                                {s} — ${offered.rates[s] ?? 0}/hr
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {bookingType && (
                        <p className="text-xs text-muted-foreground mt-1.5">
                          Rate for {bookingType}: <span className="font-semibold text-foreground">${effectiveRate}/hr</span>
                        </p>
                      )}
                    </div>
                    {bookingResources.length > 0 && (
                      <div>
                        <Label>Delivery *</Label>
                        <Select value={deliveryResourceId} onValueChange={setDeliveryResourceId}>
                          <SelectTrigger><SelectValue placeholder="Select delivery option" /></SelectTrigger>
                          <SelectContent>
                            {bookingResources.map((r: BookingResourceOption) => (
                              <SelectItem key={r.id} value={String(r.id)}>
                                {r.name} {r.blockCost > 0 ? `(+$${r.blockCost}/hr)` : "(included)"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Date *</Label>
                        <Input type="date" value={bookingDate} onChange={e => { setBookingDate(e.target.value); checkAvailability(e.target.value, bookingTime); }} min={new Date().toISOString().split("T")[0]} />
                      </div>
                      <div>
                        <Label>Time *</Label>
                        <Input type="time" value={bookingTime} onChange={e => { setBookingTime(e.target.value); checkAvailability(bookingDate, e.target.value); }} />
                      </div>
                    </div>
                    {availabilityWarning && (
                      <div className="text-sm text-warning bg-warning/10 rounded-lg p-2.5 flex items-center gap-2">
                        <Clock className="h-4 w-4 shrink-0" />
                        {availabilityWarning}
                      </div>
                    )}
                    <div>
                      <Label>Duration (hours)</Label>
                      <Select value={bookingDuration} onValueChange={setBookingDuration}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 8].map(h => <SelectItem key={h} value={String(h)}>{h} hour{h > 1 ? "s" : ""}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Recurring</Label>
                      <Select value={recurringPattern} onValueChange={setRecurringPattern}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">One-time</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea value={bookingNotes} onChange={e => setBookingNotes(e.target.value)} placeholder="Any special requirements..." />
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Estimated Total</span>
                      <span className="text-xl font-bold text-foreground">${total}{recurringPattern !== "none" ? `/${recurringPattern === "weekly" ? "wk" : recurringPattern === "biweekly" ? "2wk" : "mo"}` : ""}</span>
                    </div>
                    <Button variant="coral" className="w-full" onClick={handleBooking} disabled={createBooking.isPending || hasAvailabilityConflict || offered.services.length === 0}>
                      {createBooking.isPending ? "Submitting..." : "Confirm Booking"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="w-full mb-3" disabled={addToCart.isPending} onClick={async () => {
                if (!isAuthenticated) { navigate("/auth"); return; }
                try {
                  const product = await getProviderProduct(caregiver.id);
                  if (!product) { toast({ title: "Service not listed yet", variant: "destructive" }); return; }
                  await addToCart.mutateAsync({ productId: product.id });
                  toast({ title: "Added to cart", description: `${caregiver.full_name}'s service added.` });
                } catch (e: any) { toast({ title: "Failed", description: e.message, variant: "destructive" }); }
              }}>
                {addToCart.isPending ? "Adding..." : "Add to Cart"}
              </Button>

              <Button variant="outline" className="w-full mb-3" onClick={() => {
                if (!isAuthenticated) { navigate("/auth"); return; }
                startConversation.mutate({ otherUserId: caregiver.id }, {
                  onSuccess: () => navigate("/messages", { state: { targetUserId: caregiver.id, targetUserName: caregiver.full_name, targetUserAvatar: caregiver.avatar_url } }),
                  onError: () => navigate("/messages"),
                });
              }} disabled={startConversation.isPending}>
                <MessageSquare className="mr-2 h-4 w-4" /> {startConversation.isPending ? "Opening..." : "Send Message"}
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
                    <span>Background verified</span>
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
