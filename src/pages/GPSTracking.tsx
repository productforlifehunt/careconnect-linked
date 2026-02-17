import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MapPin, Navigation, Clock, Shield, Phone, AlertTriangle, RefreshCw } from "lucide-react";
import { caregivers } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

interface TrackedPerson {
  id: string;
  name: string;
  role: string;
  lastLocation: string;
  coordinates: { lat: number; lng: number };
  lastUpdated: string;
  status: "active" | "idle" | "offline";
  batteryLevel: number;
  isSharing: boolean;
}

const trackedPeople: TrackedPerson[] = [
  {
    id: "tp1",
    name: "Mom (Helen)",
    role: "Care Recipient",
    lastLocation: "Home - 123 Oak St, Brooklyn",
    coordinates: { lat: 40.6782, lng: -73.9442 },
    lastUpdated: "2 min ago",
    status: "active",
    batteryLevel: 72,
    isSharing: true,
  },
  {
    id: "tp2",
    name: "Sarah Johnson",
    role: "Caregiver",
    lastLocation: "En route - Atlantic Ave",
    coordinates: { lat: 40.6862, lng: -73.9762 },
    lastUpdated: "Just now",
    status: "active",
    batteryLevel: 85,
    isSharing: true,
  },
  {
    id: "tp3",
    name: "David Smith",
    role: "Family Member",
    lastLocation: "Work - 456 5th Ave, Manhattan",
    coordinates: { lat: 40.7549, lng: -73.984 },
    lastUpdated: "15 min ago",
    status: "idle",
    batteryLevel: 45,
    isSharing: true,
  },
];

export default function GPSTracking() {
  const { toast } = useToast();
  const [people, setPeople] = useState(trackedPeople);
  const [selectedPerson, setSelectedPerson] = useState<TrackedPerson | null>(trackedPeople[0]);
  const [shareMyLocation, setShareMyLocation] = useState(true);
  const [geofenceAlerts, setGeofenceAlerts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const statusColors: Record<string, string> = {
    active: "bg-success",
    idle: "bg-warning",
    offline: "bg-muted-foreground/30",
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast({ title: "Locations updated" });
    }, 1500);
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
        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="border-transparent card-elevated overflow-hidden">
            <CardContent className="p-0">
              <div className="relative bg-accent/30 h-[500px] flex items-center justify-center">
                {/* Map visualization */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/50 to-primary/5">
                  {/* Grid lines for map feel */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
                    backgroundSize: "40px 40px"
                  }} />

                  {/* Person markers */}
                  {people.filter(p => p.isSharing).map((person, i) => {
                    const positions = [
                      { top: "40%", left: "35%" },
                      { top: "30%", left: "55%" },
                      { top: "60%", left: "65%" },
                    ];
                    const pos = positions[i] || positions[0];
                    return (
                      <button
                        key={person.id}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 group cursor-pointer`}
                        style={{ top: pos.top, left: pos.left }}
                        onClick={() => setSelectedPerson(person)}
                      >
                        <div className="relative">
                          <div className={`w-4 h-4 rounded-full ${statusColors[person.status]} animate-pulse-dot`} />
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
                  <p className="text-xs text-muted-foreground">Hover over markers to see details</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* People & Settings */}
        <div className="space-y-4">
          {/* People list */}
          <Card className="border-transparent card-elevated">
            <CardHeader><CardTitle className="text-lg">Tracked People</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {people.map(p => (
                <div
                  key={p.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedPerson?.id === p.id ? "bg-accent border border-primary/20" : "bg-muted/50 hover:bg-accent/50"}`}
                  onClick={() => setSelectedPerson(p)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-sm font-medium">{p.name.charAt(0)}</span>
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${statusColors[p.status]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.role}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{p.status}</Badge>
                  </div>
                  <div className="mt-2 ml-13 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.lastLocation}</p>
                    <p className="flex items-center gap-1 mt-1"><Clock className="h-3 w-3" /> {p.lastUpdated}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Selected Person Details */}
          {selectedPerson && (
            <Card className="border-transparent card-elevated">
              <CardHeader><CardTitle className="text-lg">{selectedPerson.name}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-2 rounded bg-muted/50">
                    <p className="text-muted-foreground text-xs">Battery</p>
                    <p className="font-medium text-foreground">{selectedPerson.batteryLevel}%</p>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <p className="text-muted-foreground text-xs">Status</p>
                    <p className="font-medium text-foreground capitalize">{selectedPerson.status}</p>
                  </div>
                </div>
                <div className="p-2 rounded bg-muted/50 text-sm">
                  <p className="text-muted-foreground text-xs">Coordinates</p>
                  <p className="font-mono text-xs text-foreground">{selectedPerson.coordinates.lat.toFixed(4)}, {selectedPerson.coordinates.lng.toFixed(4)}</p>
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

          {/* Settings */}
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
