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
import { Star, MapPin, Shield, Clock, CheckCircle, Calendar, MessageSquare, Heart, ArrowLeft, Phone } from "lucide-react";
import { caregivers } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

export default function CaregiverProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const caregiver = caregivers.find(c => c.id === id);

  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingDuration, setBookingDuration] = useState("2");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingType, setBookingType] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  if (!caregiver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-lg text-muted-foreground">Caregiver not found</p>
        <Button variant="outline" onClick={() => navigate("/search")}>Back to Search</Button>
      </div>
    );
  }

  const handleBooking = () => {
    if (!bookingDate || !bookingTime || !bookingType) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    toast({
      title: "Booking Request Sent!",
      description: `Your booking with ${caregiver.name} on ${bookingDate} at ${bookingTime} has been submitted.`,
    });
    setBookingDialogOpen(false);
    setBookingDate("");
    setBookingTime("");
    setBookingNotes("");
  };

  const total = caregiver.hourlyRate * parseInt(bookingDuration);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Button variant="ghost" className="mb-4 gap-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-transparent card-elevated">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <img src={caregiver.avatar} alt={caregiver.name} className="w-28 h-28 rounded-2xl object-cover" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-foreground">{caregiver.name}</h1>
                        {caregiver.verified && <Shield className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Star className="h-4 w-4 text-warning fill-warning" /> {caregiver.rating} ({caregiver.reviewCount} reviews)</span>
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {caregiver.location}</span>
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {caregiver.experience} years exp.</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsFavorited(!isFavorited)}>
                      <Heart className={`h-5 w-5 ${isFavorited ? "fill-coral text-coral" : "text-muted-foreground"}`} />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {caregiver.specialty.map(s => (
                      <Badge key={s} variant="secondary" className="bg-accent text-accent-foreground">{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle>About</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground leading-relaxed">{caregiver.bio}</p></CardContent>
          </Card>

          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle>Qualifications</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Certifications</h4>
                  <div className="space-y-2">
                    {caregiver.certifications.map(c => (
                      <div key={c} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-success" /> {c}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Languages</h4>
                  <div className="space-y-2">
                    {caregiver.languages.map(l => (
                      <div key={l} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-success" /> {l}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {caregiver.backgroundCheck && (
                <div className="mt-4 p-3 rounded-lg bg-success/10 flex items-center gap-2 text-sm text-success">
                  <Shield className="h-4 w-4" /> Background check passed
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle>Availability</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                  <Badge key={day} variant={caregiver.availability.includes(day) ? "default" : "outline"} className={caregiver.availability.includes(day) ? "" : "opacity-40"}>
                    {day}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle>Recent Reviews</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Maria G.", rating: 5, text: "Sarah was absolutely wonderful with my mother. She's patient, kind, and very professional.", date: "2 weeks ago" },
                { name: "Tom R.", rating: 5, text: "Highly recommend! Great communication and always on time. My father looks forward to her visits.", date: "1 month ago" },
                { name: "Jennifer L.", rating: 4, text: "Very reliable and caring. She helped our family through a difficult time with grace.", date: "2 months ago" },
              ].map((review, i) => (
                <div key={i} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-foreground">{review.name}</span>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Star key={j} className="h-3 w-3 text-warning fill-warning" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{review.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Booking + Contact */}
        <div className="space-y-4">
          <Card className="border-transparent card-elevated sticky top-24">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <span className="text-3xl font-bold text-foreground">${caregiver.hourlyRate}</span>
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
                    <DialogTitle>Book {caregiver.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Care Type *</Label>
                      <Select value={bookingType} onValueChange={setBookingType}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          {caregiver.specialty.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Date *</Label>
                        <Input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} />
                      </div>
                      <div>
                        <Label>Time *</Label>
                        <Input type="time" value={bookingTime} onChange={e => setBookingTime(e.target.value)} />
                      </div>
                    </div>
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
                      <Label>Notes</Label>
                      <Textarea value={bookingNotes} onChange={e => setBookingNotes(e.target.value)} placeholder="Any special requirements..." />
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Estimated Total</span>
                      <span className="text-xl font-bold text-foreground">${total}</span>
                    </div>
                    <Button variant="coral" className="w-full" onClick={handleBooking}>Confirm Booking</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="w-full mb-3">
                <MessageSquare className="mr-2 h-4 w-4" /> Send Message
              </Button>
              <Button variant="ghost" className="w-full">
                <Phone className="mr-2 h-4 w-4" /> Request Call
              </Button>

              <div className="mt-6 pt-4 border-t space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Responds {caregiver.responseTime.toLowerCase()}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Background verified</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>{caregiver.experience} years experience</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
