import { useState } from "react";
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
import { useProvider, useProviderReviews, useCreateBooking, useToggleSavedProvider, useSavedProviders, useStartConversation, useProviderAvailability } from "@/hooks/use-care-data";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function CaregiverProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { data: caregiver, isLoading } = useProvider(id);
  const { data: reviews } = useProviderReviews(id);
  const { data: savedProviders } = useSavedProviders();
  const toggleSaved = useToggleSavedProvider();
  const createBooking = useCreateBooking();
  const startConversation = useStartConversation();

  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingDuration, setBookingDuration] = useState("2");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingType, setBookingType] = useState("");
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [availabilityWarning, setAvailabilityWarning] = useState("");
  const [recurringPattern, setRecurringPattern] = useState("none");

  const { data: availability } = useProviderAvailability(id);
  const isFavorited = savedProviders?.some((sp: any) => sp.provider_id === id) || false;

  // Check availability when date/time changes
  const checkAvailability = (date: string, time: string) => {
    setAvailabilityWarning("");
    if (!date || !time || !availability || availability.length === 0) return;
    const dayOfWeek = new Date(date + "T12:00:00").getDay(); // 0=Sun
    // Check for specific_date override first
    const specificSlot = availability.find((s: any) => s.specific_date === date);
    if (specificSlot) {
      if (!specificSlot.is_available) {
        setAvailabilityWarning("Provider is not available on this date.");
        return;
      }
      if (time < specificSlot.start_time || time >= specificSlot.end_time) {
        setAvailabilityWarning(`Provider is available ${specificSlot.start_time}–${specificSlot.end_time} on this date.`);
        return;
      }
      return;
    }
    // Check weekly pattern
    const weeklySlots = availability.filter((s: any) => !s.specific_date && s.day_of_week === dayOfWeek);
    if (weeklySlots.length === 0) {
      setAvailabilityWarning("Provider has no availability set for this day.");
      return;
    }
    const available = weeklySlots.some((s: any) => s.is_available && time >= s.start_time && time < s.end_time);
    if (!available) {
      const slots = weeklySlots.filter((s: any) => s.is_available).map((s: any) => `${s.start_time}–${s.end_time}`).join(", ");
      setAvailabilityWarning(slots ? `Provider is available: ${slots}` : "Provider is not available on this day.");
    }
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
    // Prevent past date bookings
    const selectedDate = new Date(bookingDate + "T" + bookingTime);
    if (selectedDate < new Date()) {
      toast({ title: "Cannot book in the past", description: "Please select a future date and time.", variant: "destructive" });
      return;
    }
    // HARD BLOCK if availability conflict
    if (availabilityWarning) {
      toast({ title: "Time slot unavailable", description: availabilityWarning, variant: "destructive" });
      return;
    }
    if (!isAuthenticated) {
      toast({ title: "Please sign in to book", variant: "destructive" });
      navigate("/auth");
      return;
    }
    try {
      const recurringNote = recurringPattern !== "none" ? `[Recurring: ${recurringPattern}] ` : "";
      await createBooking.mutateAsync({
        provider_id: caregiver.id,
        appointment_date: bookingDate,
        appointment_time: bookingTime,
        duration_hour: parseInt(bookingDuration),
        service_type: bookingType,
        hourly_rate: caregiver.hourly_rate || 0,
        total_cost: (caregiver.hourly_rate || 0) * parseInt(bookingDuration),
        special_instruction: recurringNote + (bookingNotes || "") || null,
        status: caregiver.instant_book_enabled ? "confirmed" : "pending",
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
    toggleSaved.mutate({ providerId: caregiver.id, isSaved: isFavorited });
  };

  const total = (caregiver.hourly_rate || 0) * parseInt(bookingDuration);
  const responseTime = caregiver.response_time_minute
    ? caregiver.response_time_minute < 60 ? `Under ${caregiver.response_time_minute} min` : `Under ${Math.ceil(caregiver.response_time_minute / 60)} hours`
    : "N/A";

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
                        {caregiver.background_check_status === "passed" && <Shield className="h-5 w-5 text-primary" />}
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

          {((caregiver.certification && caregiver.certification.length > 0)) && (
            <Card className="border-transparent card-elevated">
              <CardHeader><CardTitle>Qualifications</CardTitle></CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-medium text-sm mb-2">Certifications</h4>
                  <div className="space-y-2">
                    {(caregiver.certification || []).map(c => (
                      <div key={c} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-success" /> {c}
                      </div>
                    ))}
                  </div>
                </div>
                {caregiver.background_check_status === "passed" && (
                  <div className="mt-4 p-3 rounded-lg bg-success/10 flex items-center gap-2 text-sm text-success">
                    <Shield className="h-4 w-4" /> Background check passed
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle>Reviews ({reviews?.length || 0})</CardTitle></CardHeader>
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
                  {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                  {review.response_text && (
                    <div className="mt-2 ml-4 p-2 bg-muted/50 rounded text-sm text-muted-foreground">
                      <span className="font-medium">Provider response:</span> {review.response_text}
                    </div>
                  )}
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
                <span className="text-3xl font-bold text-foreground">${caregiver.hourly_rate || 0}</span>
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
                      <Select value={bookingType} onValueChange={setBookingType}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                         {(caregiver.specialty && caregiver.specialty.length > 0) ? caregiver.specialty.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>) : (
                           <>
                             <SelectItem value="Elder Care">Elder Care</SelectItem>
                             <SelectItem value="Child Care">Child Care</SelectItem>
                             <SelectItem value="Companionship">Companionship</SelectItem>
                             <SelectItem value="Nursing Care">Nursing Care</SelectItem>
                             <SelectItem value="General Care">General Care</SelectItem>
                           </>
                         )}
                        </SelectContent>
                      </Select>
                    </div>
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
                    <Button variant="coral" className="w-full" onClick={handleBooking} disabled={createBooking.isPending}>
                      {createBooking.isPending ? "Submitting..." : "Confirm Booking"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="w-full mb-3" onClick={() => {
                if (!isAuthenticated) { navigate("/auth"); return; }
                startConversation.mutate(caregiver.id, {
                  onSuccess: () => navigate("/messages", { state: { targetUserId: caregiver.id, targetUserName: caregiver.full_name, targetUserAvatar: caregiver.avatar_url } }),
                  onError: () => navigate("/messages"),
                });
              }} disabled={startConversation.isPending}>
                <MessageSquare className="mr-2 h-4 w-4" /> {startConversation.isPending ? "Opening..." : "Send Message"}
              </Button>
              {caregiver.phone_number && (
                <Button variant="ghost" className="w-full" asChild>
                  <a href={`tel:${caregiver.phone_number}`}>
                    <Phone className="mr-2 h-4 w-4" /> Call {caregiver.full_name?.split(" ")[0]}
                  </a>
                </Button>
              )}

              <div className="mt-6 pt-4 border-t space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Responds {responseTime}</span>
                </div>
                {caregiver.background_check_status === "passed" && (
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
                {caregiver.instant_book_enabled && (
                  <Badge className="bg-success text-success-foreground">Instant Book</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
