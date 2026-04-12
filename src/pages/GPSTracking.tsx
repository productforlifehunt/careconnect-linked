import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSite } from "@/contexts/SiteContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { MapPin, Navigation, Clock, Shield, Phone, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { useLocationShares } from "@/hooks/use-care-data";
import { shareMyLocationWordPress, disableMyLocationSharingWordPress } from "@/features/location/source.wordpress-extended";
import { fetchCaredOneLocationSettingsWordPress } from "@/features/location/source.wordpress-extended";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslation } from "react-i18next";

export default function GPSTracking() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const site = useSite();
  const { data: locationShares, isLoading, refetch } = useLocationShares();
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [shareMyLocation, setShareMyLocation] = useState(false);
  const [geofenceAlerts, setGeofenceAlerts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingShare, setUpdatingShare] = useState(false);
  const [sosDialogOpen, setSosDialogOpen] = useState(false);
  const [sosSending, setSosSending] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const { user } = useAuth();

  const getCurrentAuthUserId = async () => {
    return user?.user_id ?? null;
  };

  const getCurrentProfileId = async () => {
    return user?.id ?? null;
  };

  // Check if current user has a location_current row
  useEffect(() => {
    (async () => {
      const authUserId = await getCurrentAuthUserId();
      if (!authUserId) return;
      try {
        const settings = await fetchCaredOneLocationSettingsWordPress(String(authUserId));
        if (settings?.sharing_enabled) setShareMyLocation(true);
      } catch {}
    })();
  }, []);

  const people = (locationShares || []).map((ls: any) => {
    const lat = parseFloat(ls.latitude) || 0;
    const lng = parseFloat(ls.longitude) || 0;
    return {
      id: ls.id,
      userId: ls.user_id,
      name: ls.profile?.full_name || t("common.unknown"),
      avatar_url: ls.profile?.avatar_url,
      lastLocation: ls.address_text || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      coordinates: { lat, lng },
      lastUpdated: ls.updated_at ? new Date(ls.updated_at).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" }) : "",
      status: "active" as const,
      isSharing: ls.sharing_status !== "off",
    };
  });

  const sharingPeople = people.filter(p => p.isSharing && p.coordinates.lat && p.coordinates.lng);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    const map = L.map(mapRef.current, { zoomControl: true }).setView([39.8283, -98.5795], 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    leafletMap.current = map;
    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;
    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (sharingPeople.length === 0) return;

    sharingPeople.forEach(person => {
      const initials = person.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2);
      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="width:36px;height:36px;border-radius:50%;background:hsl(var(--primary));color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer">${initials}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      const marker = L.marker([person.coordinates.lat, person.coordinates.lng], { icon })
        .addTo(map)
        .bindPopup(`<b>${person.name}</b><br/>Last seen: ${person.lastUpdated}<br/>${person.lastLocation}`);
      marker.on("click", () => setSelectedPerson(person));
      markersRef.current.push(marker);
    });

    // Fit bounds
    if (sharingPeople.length === 1) {
      map.setView([sharingPeople[0].coordinates.lat, sharingPeople[0].coordinates.lng], 14);
    } else {
      const bounds = L.latLngBounds(sharingPeople.map(p => [p.coordinates.lat, p.coordinates.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [sharingPeople.length, locationShares]);

  // Focus map on selected person
  useEffect(() => {
    if (selectedPerson?.coordinates?.lat && leafletMap.current) {
      leafletMap.current.setView([selectedPerson.coordinates.lat, selectedPerson.coordinates.lng], 15);
    }
  }, [selectedPerson]);

  const handleToggleShare = async (checked: boolean) => {
    setShareMyLocation(checked);
    setUpdatingShare(true);
    try {
      const authUserId = await getCurrentAuthUserId();
      if (!authUserId) return;
      if (checked && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const timestamp = new Date().toISOString();
          await shareMyLocationWordPress(pos.coords.latitude, pos.coords.longitude);
          refetch();
          setUpdatingShare(false);
          toast({ title: t("gps.locationSharingEnabled") });
        }, () => {
          setUpdatingShare(false);
          toast({ title: t("gps.couldNotGetLocation"), description: t("gps.enableLocationAccess"), variant: "destructive" });
          setShareMyLocation(false);
        });
      } else {
        await disableMyLocationSharingWordPress();
        refetch();
        setUpdatingShare(false);
        toast({ title: t("gps.locationSharingDisabled") });
      }
    } catch {
      setUpdatingShare(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    refetch().then(() => {
      setRefreshing(false);
      toast({ title: t("gps.locationsUpdated") });
    });
  };

  const handleSOS = async () => {
    setSosSending(true);
    try {
      const profileId = await getCurrentProfileId();
      const authUserId = await getCurrentAuthUserId();
      if (!profileId || !authUserId) throw new Error("Not authenticated");

      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
      });

      await shareMyLocationWordPress(position.coords.latitude, position.coords.longitude, {
        accuracy: position.coords.accuracy ?? null,
        isEmergency: true,
      });

      refetch();
      setSosDialogOpen(false);
      toast({
        title: t("gps.sosSuccess"),
        description: t("gps.sosSuccessDesc", { groups: site.navLabels.careGroups.toLowerCase() }),
      });
    } catch (err: any) {
      toast({
        title: t("gps.sosFailed"),
        description: err.message || t("gps.sosFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setSosSending(false);
    }
  };

  const statusColors: Record<string, string> = {
    active: "bg-success",
    idle: "bg-warning",
    offline: "bg-muted-foreground/30",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("gps.gpsTracking")}</h1>
          <p className="text-muted-foreground">{t("gps.realtimeLocation")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} /> {t("common.refresh")}
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setSosDialogOpen(true)}>
            <AlertTriangle className="h-4 w-4 mr-1" /> {t("gps.sos")}
          </Button>
        </div>
      </div>

      {/* SOS Confirmation Dialog */}
      <Dialog open={sosDialogOpen} onOpenChange={setSosDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> {t("gps.emergencySOS")}
            </DialogTitle>
            <DialogDescription>
              {t("gps.sosDesc", { groups: site.navLabels.careGroups.toLowerCase() })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSosDialogOpen(false)} disabled={sosSending}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleSOS} disabled={sosSending}>
              {sosSending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t("gps.sosConfirmSending")}</> : t("gps.sendSOS")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-transparent card-elevated overflow-hidden">
            <CardContent className="p-0">
              <div ref={mapRef} className="h-[500px] w-full" />
              {sharingPeople.length === 0 && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[400]">
                  <div className="text-center bg-card/80 backdrop-blur-sm rounded-xl p-6">
                    <MapPin className="h-12 w-12 text-primary/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{t("gps.noSharingDesc")}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t("gps.enableSharingDesc")}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle className="text-lg">{t("gps.trackedPeople")}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : people.length > 0 ? people.map((p: any) => (
                <div
                  key={p.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedPerson?.id === p.id ? "bg-accent border border-primary/20" : "bg-muted/50 hover:bg-accent/50"}`}
                  onClick={() => setSelectedPerson(p)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary text-sm font-medium">{p.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${p.isSharing ? statusColors.active : statusColors.offline}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      {!p.isSharing && <Badge variant="secondary" className="text-[10px] mt-0.5">{t("gps.notSharing")}</Badge>}
                    </div>
                  </div>
                  {p.isSharing && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.lastLocation}</p>
                      <p className="flex items-center gap-1 mt-1"><Clock className="h-3 w-3" /> {p.lastUpdated}</p>
                    </div>
                  )}
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">{t("gps.noLocationShares")}</p>
              )}
            </CardContent>
          </Card>

          {selectedPerson && selectedPerson.coordinates?.lat && (
            <Card className="border-transparent card-elevated">
              <CardHeader><CardTitle className="text-lg">{selectedPerson.name}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="p-2 rounded bg-muted/50 text-sm">
                  <p className="text-muted-foreground text-xs">{t("gps.coordinates")}</p>
                  <p className="font-mono text-xs text-foreground">{selectedPerson.coordinates.lat?.toFixed(6)}, {selectedPerson.coordinates.lng?.toFixed(6)}</p>
                </div>
                <div className="p-2 rounded bg-muted/50 text-sm">
                  <p className="text-muted-foreground text-xs">{t("gps.lastUpdated")}</p>
                  <p className="text-xs text-foreground">{selectedPerson.lastUpdated}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPerson.coordinates.lat},${selectedPerson.coordinates.lng}`} target="_blank" rel="noopener noreferrer">
                      <Navigation className="h-3 w-3 mr-1" /> {t("common.directions")}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle className="text-lg">{t("common.settings")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">{t("gps.shareMyLocation")}</Label>
                <Switch checked={shareMyLocation} onCheckedChange={handleToggleShare} disabled={updatingShare} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">{t("gps.geofenceAlerts")}</Label>
                <Switch checked={geofenceAlerts} onCheckedChange={setGeofenceAlerts} />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Shield className="h-3 w-3" /> {t("gps.locationEncrypted", { groups: site.navLabels.careGroups.toLowerCase() })}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
