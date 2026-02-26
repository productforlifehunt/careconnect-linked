import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Phone, AlertTriangle, MapPin, Loader2 } from "lucide-react";
import { useShareMyLocation } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";

export function EmergencySOS() {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const shareLocation = useShareMyLocation();
  const { toast } = useToast();

  const handleEmergency = async () => {
    setSending(true);
    try {
      // Try to get current position and share it as emergency
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              await shareLocation.mutateAsync({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
              });
              toast({
                title: "Emergency location shared",
                description: "Your current location has been shared with your care team.",
              });
            } catch (err: any) {
              toast({ title: "Location shared with errors", description: err.message, variant: "destructive" });
            }
            setSending(false);
            setOpen(false);
          },
          () => {
            toast({
              title: "Location unavailable",
              description: "Could not get your location. Please enable location services.",
              variant: "destructive",
            });
            setSending(false);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        toast({ title: "Geolocation not supported", variant: "destructive" });
        setSending(false);
      }
    } catch {
      setSending(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        size="lg"
        className="w-full h-16 text-lg font-bold gap-3 shadow-lg animate-pulse hover:animate-none"
        onClick={() => setOpen(true)}
      >
        <AlertTriangle className="h-6 w-6" />
        Emergency SOS
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Emergency SOS
            </DialogTitle>
            <DialogDescription>
              This will share your emergency location with your care team and alert them immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Button
              variant="destructive"
              className="w-full h-14 text-base font-bold gap-2"
              onClick={handleEmergency}
              disabled={sending}
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <MapPin className="h-5 w-5" />
              )}
              Share Emergency Location
            </Button>
            <a href="tel:911" className="block">
              <Button variant="outline" className="w-full h-14 text-base font-bold gap-2 border-destructive text-destructive hover:bg-destructive/10">
                <Phone className="h-5 w-5" />
                Call 911
              </Button>
            </a>
            <Button variant="ghost" className="w-full" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
