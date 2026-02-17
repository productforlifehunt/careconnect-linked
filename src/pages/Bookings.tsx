import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarDays, Clock, MapPin, Star, MoreHorizontal, X, Check, MessageSquare } from "lucide-react";
import { sampleBookings, caregivers, Booking } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Bookings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>(sampleBookings);

  const updateStatus = (id: string, status: Booking["status"]) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    toast({ title: `Booking ${status}` });
  };

  const statusColors: Record<string, string> = {
    confirmed: "bg-success text-success-foreground",
    pending: "bg-warning text-warning-foreground",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive text-destructive-foreground",
  };

  const upcoming = bookings.filter(b => ["confirmed", "pending"].includes(b.status));
  const past = bookings.filter(b => ["completed", "cancelled"].includes(b.status));

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const caregiver = caregivers.find(c => c.id === booking.caregiverId);
    return (
      <Card className="border-transparent card-elevated">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {caregiver && (
                <img src={caregiver.avatar} alt={booking.caregiverName} className="w-12 h-12 rounded-xl object-cover cursor-pointer" onClick={() => navigate(`/caregiver/${booking.caregiverId}`)} />
              )}
              <div>
                <h3 className="font-semibold text-foreground">{booking.caregiverName}</h3>
                <p className="text-sm text-muted-foreground">{booking.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={statusColors[booking.status]}>{booking.status}</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {booking.status === "pending" && <DropdownMenuItem onClick={() => updateStatus(booking.id, "confirmed")}><Check className="mr-2 h-4 w-4" /> Confirm</DropdownMenuItem>}
                  {["pending", "confirmed"].includes(booking.status) && <DropdownMenuItem onClick={() => updateStatus(booking.id, "cancelled")} className="text-destructive"><X className="mr-2 h-4 w-4" /> Cancel</DropdownMenuItem>}
                  {booking.status === "confirmed" && <DropdownMenuItem onClick={() => updateStatus(booking.id, "completed")}><Check className="mr-2 h-4 w-4" /> Mark Complete</DropdownMenuItem>}
                  <DropdownMenuItem><MessageSquare className="mr-2 h-4 w-4" /> Message</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span>{new Date(booking.date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>{booking.time} · {booking.duration}hrs</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-foreground text-lg">${booking.total}</span>
            </div>
          </div>

          {booking.notes && (
            <p className="text-sm text-muted-foreground mt-3 p-2 rounded bg-muted/50">{booking.notes}</p>
          )}
        </CardContent>
      </Card>
    );
  };

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
          {upcoming.length > 0 ? upcoming.map(b => <BookingCard key={b.id} booking={b} />) : (
            <div className="text-center py-12">
              <CalendarDays className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No upcoming bookings</p>
              <Button variant="coral" className="mt-4" onClick={() => navigate("/search")}>Find a Caregiver</Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="past" className="mt-4 space-y-4">
          {past.length > 0 ? past.map(b => <BookingCard key={b.id} booking={b} />) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No past bookings</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
