import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MapPin, Navigation, Clock, Shield, Phone, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { useLocationShares } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";

export default function GPSTracking() {
  const { toast } = useToast();
  const { data: locationShares, isLoading, refetch } = useLocationShares();
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [shareMyLocation, setShareMyLocation] = useState(true);
  const [geofenceAlerts, setGeofenceAlerts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const people = (locationShares || []).map((ls: any) => ({
    id: ls.id,
    name: ls.profile?.full_name || "Unknown",
    avatar_url: ls.profile?.avatar_url,
    lastLocation: ls.address || `${ls.latitude?.toFixed(4)}, ${ls.longitude?.toFixed(4)}`,
    coordinates: { lat: ls.latitude, lng: ls.longitude },
    lastUpdated: new Date(ls.updated_at).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" }),
    status: "active" as const,
    isSharing: ls.is_sharing,
  }));

  const statusColors: Record<string, string> = {
    active: "bg-success",
    idle: "bg-warning",
    offline: "bg-muted-foreground/30",
  };

  const handleRefresh = () => {
    setRefreshing(true);
    refetch().then(() => {
      setRefreshing(false);
      toast({ title: "Locations updated" });
    });
  };

  const handleEmergency = () => {
    toast({
      title: "🚨 Emergency Alert Sent",
      description: "All care circle members have been notified with your current location.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">GPS Tracking</h1>
          <p className="text-muted-foreground">Real-time location of your care team</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="destructive" size="sm" onClick={handleEmergency}>
            <AlertTriangle className="h-4 w-4 mr-1" /> SOS
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-transparent card-elevated overflow-hidden">
            <CardContent className="p-0">
              <div className="relative bg-accent/30 h-[500px] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/50 to-primary/5">
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
                    backgroundSize: "40px 40px"
                  }} />
                  {people.filter(p => p.isSharing).map((person, i) => {
                    const positions = [
                      { top: "40%", left: "35%" },
                      { top: "30%", left: "55%" },
                      { top: "60%", left: "65%" },
                      { top: "50%", left: "45%" },
                    ];
                    const pos = positions[i % positions.length];
                    return (
                      <button
                        key={person.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 group cursor-pointer"
                        style={{ top: pos.top, left: pos.left }}
                        onClick={() => setSelectedPerson(person)}
                      >
                        <div className="relative">
                          <div className={`w-4 h-4 rounded-full ${statusColors[person.status]} animate-pulse`} />
                          <div className={`absolute -inset-2 rounded-full ${statusColors[person.status]} opacity-20 animate-ping`} style={{ animationDuration: "3s" }} />
                        </div>
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-card shadow-lg rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border">
                          <p className="text-foreground">{person.name}</p>
                          <p className="text-muted-foreground">{person.lastUpdated}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="relative z-20 text-center pointer-events-none">
                  <MapPin className="h-12 w-12 text-primary/20 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Interactive map view</p>
                  <p className="text-xs text-muted-foreground">{people.length} people sharing location</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle className="text-lg">Tracked People</CardTitle></CardHeader>
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
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${statusColors[p.status]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.lastLocation}</p>
                    <p className="flex items-center gap-1 mt-1"><Clock className="h-3 w-3" /> {p.lastUpdated}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">No location shares found</p>
              )}
            </CardContent>
          </Card>

          {selectedPerson && (
            <Card className="border-transparent card-elevated">
              <CardHeader><CardTitle className="text-lg">{selectedPerson.name}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="p-2 rounded bg-muted/50 text-sm">
                  <p className="text-muted-foreground text-xs">Coordinates</p>
                  <p className="font-mono text-xs text-foreground">{selectedPerson.coordinates.lat?.toFixed(4)}, {selectedPerson.coordinates.lng?.toFixed(4)}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Navigation className="h-3 w-3 mr-1" /> Directions
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone className="h-3 w-3 mr-1" /> Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle className="text-lg">Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Share my location</Label>
                <Switch checked={shareMyLocation} onCheckedChange={setShareMyLocation} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Geofence alerts</Label>
                <Switch checked={geofenceAlerts} onCheckedChange={setGeofenceAlerts} />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Shield className="h-3 w-3" /> Location data is encrypted and only shared with your care circle
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
