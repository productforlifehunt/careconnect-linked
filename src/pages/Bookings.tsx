import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, Clock, MoreHorizontal, X, Check, MessageSquare, Loader2, Star } from "lucide-react";
import { useBookings, useUpdateBookingStatus, useStartConversation } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { careDb } from "@/integrations/supabase/external-client";
import { careAuth } from "@/integrations/supabase/external-client";

export default function Bookings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: bookings, isLoading } = useBookings();
  const updateStatus = useUpdateBookingStatus();
  const startConversation = useStartConversation();

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [messagingId, setMessagingId] = useState<string | null>(null);

  const statusColors: Record<string, string> = {
    confirmed: "bg-success text-success-foreground",
    pending: "bg-warning text-warning-foreground",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive text-destructive-foreground",
    cancelled_by_user: "bg-destructive text-destructive-foreground",
    cancelled_by_provider: "bg-destructive text-destructive-foreground",
    in_progress: "bg-primary text-primary-foreground",
  };

  const handleStatusUpdate = (id: string, status: string) => {
    updateStatus.mutate({ id, status }, {
      onSuccess: () => toast({ title: `Booking ${status}` }),
      onError: (err: any) => toast({ title: "Update failed", description: err.message, variant: "destructive" }),
    });
  };

  const handleMessage = (booking: any) => {
    if (!booking.provider_id) return;
    setMessagingId(booking.provider_id);
    startConversation.mutate(booking.provider_id, {
      onSuccess: () => {
        navigate("/messages", { state: { targetUserId: booking.provider_id, targetUserName: booking.provider?.full_name, targetUserAvatar: booking.provider?.avatar_url } });
      },
      onError: () => {
        setMessagingId(null);
        navigate("/messages");
      },
    });
  };

  const openReview = (booking: any) => {
    setReviewBooking(booking);
    setReviewRating(5);
    setReviewComment("");
    setReviewOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewBooking) return;
    setReviewSaving(true);
    try {
      const { data: { session } } = await careAuth.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      // Insert review (no entity_type column in care_connector schema)
      const { error } = await careDb.from("review").insert({
        reviewer_id: session.user.id,
        entity_id: reviewBooking.provider_id,
        rating: reviewRating,
        comment: reviewComment || null,
      });
      if (error) throw error;
      // Update provider's rating_average and rating_count manually
      const { data: existing } = await careDb
        .from("review")
        .select("rating")
        .eq("entity_id", reviewBooking.provider_id);
      if (existing && existing.length > 0) {
        const total = existing.reduce((sum: number, r: any) => sum + r.rating, 0);
        const avg = total / existing.length;
        await careDb.from("profile").update({
          rating_average: Math.round(avg * 10) / 10,
          rating_count: existing.length,
        }).eq("id", reviewBooking.provider_id);
      } else {
        // First review
        await careDb.from("profile").update({
          rating_average: reviewRating,
          rating_count: 1,
        }).eq("id", reviewBooking.provider_id);
      }
      toast({ title: "Review submitted! Thank you." });
      setReviewOpen(false);
    } catch (e: any) {
      toast({ title: "Failed to submit review", description: e.message, variant: "destructive" });
    } finally {
      setReviewSaving(false);
    }
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
              <h3 className="font-semibold text-foreground cursor-pointer hover:text-primary" onClick={() => navigate(`/caregiver/${booking.provider_id}`)}>{booking.provider?.full_name || "Provider"}</h3>
              <p className="text-sm text-muted-foreground">{booking.service_type || "Care"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[booking.status] || "bg-muted text-muted-foreground"}>{booking.status.replace(/_/g, " ")}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {["pending", "confirmed"].includes(booking.status) && <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, "cancelled_by_user")} className="text-destructive"><X className="mr-2 h-4 w-4" /> Cancel Booking</DropdownMenuItem>}
                {booking.status === "completed" && <DropdownMenuItem onClick={() => openReview(booking)}><Star className="mr-2 h-4 w-4" /> Leave Review</DropdownMenuItem>}
                <DropdownMenuItem onClick={() => handleMessage(booking)} disabled={messagingId === booking.provider_id}>
                  <MessageSquare className="mr-2 h-4 w-4" /> Message Provider
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span>{new Date(booking.appointment_date || booking.start_time || booking.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>{booking.appointment_time || ""} · {booking.duration_hour || ""}hrs</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-foreground text-lg">${booking.total_cost || 0}</span>
          </div>
        </div>

        {booking.special_instruction && (
          <p className="text-sm text-muted-foreground mt-3 p-2 rounded bg-muted/50">{booking.special_instruction}</p>
        )}

        {/* CTA row for completed bookings */}
        {booking.status === "completed" && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => openReview(booking)}>
              <Star className="h-3.5 w-3.5 mr-1.5" /> Leave Review
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleMessage(booking)} disabled={messagingId === booking.provider_id}>
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Message
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Bookings</h1>
          <p className="text-muted-foreground">Manage your care appointments</p>
        </div>
        <Button variant="coral" onClick={() => navigate("/search")}>
          <CalendarDays className="h-4 w-4 mr-2" /> Book New
        </Button>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4 space-y-4">
          {upcoming.length > 0 ? upcoming.map((b: any) => <BookingCard key={b.id} booking={b} />) : (
            <div className="text-center py-12">
              <CalendarDays className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No upcoming bookings</p>
              <Button variant="coral" className="mt-4" onClick={() => navigate("/search")}>Find a Caregiver</Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="past" className="mt-4 space-y-4">
          {past.length > 0 ? past.map((b: any) => <BookingCard key={b.id} booking={b} />) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No past bookings</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review {reviewBooking?.provider?.full_name || "Provider"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setReviewRating(n)} className="transition-transform hover:scale-110">
                    <Star className={`h-8 w-8 ${n <= reviewRating ? "text-warning fill-warning" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Share your experience</Label>
              <Textarea
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder="How was your experience with this caregiver? Share details to help others..."
                rows={4}
                className="mt-1"
              />
            </div>
            <Button variant="coral" className="w-full" onClick={handleSubmitReview} disabled={reviewSaving}>
              {reviewSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Star className="h-4 w-4 mr-2" />}
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
