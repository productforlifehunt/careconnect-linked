import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pill, ClipboardCheck, HeartPulse, Lightbulb, Target, FileText, Phone, MapPin, FolderOpen, Activity, Pencil } from "lucide-react";
import { useUserCaredOnes } from "@/hooks/use-care-data";

const featureCards = [
  { key: "medicine", title: "Medicine Tracker", icon: Pill, color: "text-primary" },
  { key: "checkin", title: "Daily Check-ins", icon: ClipboardCheck, color: "text-primary" },
  { key: "health", title: "Health Tracking", icon: HeartPulse, color: "text-primary" },
  { key: "tips", title: "Care Tips", icon: Lightbulb, color: "text-primary" },
  { key: "plan", title: "Care Plan", icon: Target, color: "text-primary" },
  { key: "notes", title: "Care Notes", icon: FileText, color: "text-primary" },
  { key: "emergency", title: "Emergency Contacts", icon: Phone, color: "text-primary" },
  { key: "location", title: "Location & Safe Zones", icon: MapPin, color: "text-primary" },
  { key: "documents", title: "Documents", icon: FolderOpen, color: "text-primary" },
  { key: "visits", title: "Visit Log", icon: Activity, color: "text-primary" },
];

export default function CaredOnes() {
  const { data: caredOnes, isLoading } = useUserCaredOnes();
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const selectedId = activeTab || (caredOnes && caredOnes.length > 0 ? caredOnes[0].id : null);
  const selectedCaredOne = caredOnes?.find((c: any) => c.id === selectedId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Cared Ones</h1>
        <p className="text-muted-foreground">Manage and track care for your loved ones</p>
      </div>

      {/* Add button */}
      <Button variant="default" className="w-full mb-6 h-12 text-base hero-gradient text-primary-foreground hover:opacity-90">
        <Plus className="h-5 w-5 mr-2" />
        Add Cared One
      </Button>

      {/* Tabs for each cared one */}
      {caredOnes && caredOnes.length > 0 ? (
        <>
          <div className="flex gap-2 mb-6 flex-wrap">
            {caredOnes.map((co: any) => (
              <button
                key={co.id}
                onClick={() => setActiveTab(co.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  selectedId === co.id
                    ? "bg-card border-primary text-foreground shadow-sm"
                    : "bg-transparent border-border text-muted-foreground hover:bg-accent/50"
                }`}
              >
                {co.cared_one?.full_name || co.cared_one?.first_name || "Cared One"}
              </button>
            ))}
          </div>

          {/* Edit button */}
          {selectedCaredOne && (
            <div className="flex justify-end mb-4">
              <Button variant="default" size="sm" className="hero-gradient text-primary-foreground">
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit Cared One
              </Button>
            </div>
          )}

          {/* 10 Feature Cards — 2-column grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {featureCards.map((card) => (
              <Card
                key={card.key}
                className="border-transparent card-elevated cursor-pointer hover:border-primary/20 transition-all"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`${card.color} mt-0.5`}>
                      <card.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm">{card.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {getSubtitle(card.key)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getDescription(card.key, selectedCaredOne?.cared_one?.full_name || "your cared one")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card className="border-transparent card-elevated">
          <CardContent className="p-8 text-center">
            <HeartPulse className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">No cared ones yet</h3>
            <p className="text-sm text-muted-foreground">
              Add the people you're caring for to track their health, medications, and more.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getSubtitle(key: string): string {
  const map: Record<string, string> = {
    medicine: "Track medications & doses",
    checkin: "Daily wellness monitoring",
    health: "Vitals & health records",
    tips: "Helpful care reminders",
    plan: "Structured care goals",
    notes: "Free-form care notes",
    emergency: "Emergency contact list",
    location: "GPS & safe zones",
    documents: "Medical records & docs",
    visits: "Caregiver visit history",
  };
  return map[key] || "";
}

function getDescription(key: string, name: string): string {
  const map: Record<string, string> = {
    medicine: `Manage medications, log doses taken or missed for ${name}.`,
    checkin: `Record daily mood, energy, pain, and sleep for ${name}.`,
    health: `Log vitals like blood pressure, heart rate, and weight.`,
    tips: `Add helpful reminders and tips for caring for ${name}.`,
    plan: `Set structured care plans with goals and progress tracking.`,
    notes: `Write and organize care notes by category.`,
    emergency: `Store emergency contacts with primary designation.`,
    location: `Track location and set geofenced safe/danger zones.`,
    documents: `Upload and manage medical records, insurance, and legal docs.`,
    visits: `Track caregiver visits — in-person, video, or phone.`,
  };
  return map[key] || "";
}
