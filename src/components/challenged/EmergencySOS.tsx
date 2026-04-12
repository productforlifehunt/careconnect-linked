import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertTriangle, MapPin, Loader2, WifiOff } from "lucide-react";
import { useShareMyLocation } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export function EmergencySOS() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const shareLocation = useShareMyLocation();
  const { toast } = useToast();

  const handleEmergency = async () => {
    setSending(true);
    try {
      // Try to get location, but proceed even without it
      let latitude = 0;
      let longitude = 0;
      let accuracy: number | null = null;
      let locationAvailable = false;

      if ("geolocation" in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 8000,
              maximumAge: 60000,
            });
          });
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
          accuracy = pos.coords.accuracy;
          locationAvailable = true;
        } catch {
          // Location denied or unavailable — continue without it
        }
      }

      // Always send the SOS alert, with or without location
      await shareLocation.mutateAsync({
        latitude,
        longitude,
        accuracy,
        isEmergency: true,
      });

      toast({
        title: t("emergencySOS.locationShared"),
        description: locationAvailable
          ? t("emergencySOS.locationSharedDesc")
          : t("emergencySOS.sosWithoutLocation", "SOS alert sent to your care circle. Location was unavailable."),
      });

      setOpen(false);
    } catch (err: any) {
      toast({
        title: t("emergencySOS.sosFailed", "SOS Failed"),
        description: err.message || t("emergencySOS.sosFailedDesc", "Could not send SOS alert. Please try again."),
        variant: "destructive",
      });
    } finally {
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
        {t("emergencySOS.emergencySOS")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> {t("emergencySOS.emergencySOS")}
            </DialogTitle>
            <DialogDescription>
              {t("emergencySOS.shareEmergencyDesc")}
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
              {t("emergencySOS.shareEmergencyLocation")}
            </Button>
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
              <WifiOff className="h-3 w-3" />
              {t("emergencySOS.worksWithoutGPS", "Works even without GPS permission")}
            </p>
            <Button variant="ghost" className="w-full" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
