import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Clock, MoreHorizontal, X, Check, MessageSquare, Loader2 } from "lucide-react";
import { useBookings, useUpdateBookingStatus } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Bookings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: bookings, isLoading } = useBookings();
  const updateStatus = useUpdateBookingStatus();

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

  const allBookings = bookings || [];
  const upcoming = allBookings.filter((b: any) => ["confirmed", "pending", "in_progress"].includes(b.status));
  const past = allBookings.filter((b: any) => ["completed", "cancelled", "cancelled_by_user", "cancelled_by_provider"].includes(b.status));

  const BookingCard = ({ booking }: { booking: any }) => (
    <Card className="border-transparent card-elevated">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {booking.provider?.avatar_url && (
              <img src={booking.provider.avatar_url} alt={booking.provider.full_name} className="w-12 h-12 rounded-xl object-cover cursor-pointer" onClick={() => navigate(`/caregiver/${booking.provider_id}`)} />
            )}
            <div>
              <h3 className="font-semibold text-foreground">{booking.provider?.full_name || "Provider"}</h3>
              <p className="text-sm text-muted-foreground">{booking.service_type || "Care"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[booking.status] || "bg-muted text-muted-foreground"}>{booking.status}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {booking.status === "pending" && <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, "confirmed")}><Check className="mr-2 h-4 w-4" /> Confirm</DropdownMenuItem>}
                {["pending", "confirmed"].includes(booking.status) && <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, "cancelled_by_user")} className="text-destructive"><X className="mr-2 h-4 w-4" /> Cancel</DropdownMenuItem>}
                {booking.status === "confirmed" && <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, "completed")}><Check className="mr-2 h-4 w-4" /> Mark Complete</DropdownMenuItem>}
                <DropdownMenuItem onClick={() => navigate("/messages")}><MessageSquare className="mr-2 h-4 w-4" /> Message</DropdownMenuItem>
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
    </div>
  );
}
