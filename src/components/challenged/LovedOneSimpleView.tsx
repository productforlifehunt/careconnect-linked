/**
 * Simplified "Loved One View" — high-contrast, large-button UI designed for
 * people living with dementia. Shown when the logged-in user is_cared_one=true
 * on the Challenged site.
 */
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSite } from "@/contexts/SiteContext";
import { useMedicines, useCareTasks, useEmergencyContacts } from "@/hooks/use-care-data";
import {
  Pill, Phone, MapPin, MessageSquare, Users, Calendar, AlertTriangle, Heart
} from "lucide-react";
import { EmergencySOS } from "./EmergencySOS";

export function LovedOneSimpleView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const site = useSite();
  const userId = user?.id || "";
  const { data: medicines } = useMedicines(userId);
  const { data: emergencyContacts } = useEmergencyContacts(userId);
  const displayName = user?.full_name || user?.first_name || "there";

  const primaryContact = emergencyContacts?.find((c: any) => c.is_primary) || emergencyContacts?.[0];

  const bigActions = [
    { label: "My Medications", icon: Pill, color: "bg-primary text-primary-foreground", onClick: () => navigate("/cared-ones") },
    { label: "Call for Help", icon: Phone, color: "bg-destructive text-destructive-foreground", onClick: primaryContact ? () => window.open(`tel:${primaryContact.phone}`) : undefined },
    { label: "My Location", icon: MapPin, color: "bg-success text-success-foreground", onClick: () => navigate("/gps-tracking") },
    { label: "Messages", icon: MessageSquare, color: "bg-secondary text-secondary-foreground", onClick: () => navigate("/messages") },
    { label: "My Care Team", icon: Users, color: "bg-accent text-accent-foreground", onClick: () => navigate("/care-circle") },
    { label: "Appointments", icon: Calendar, color: "bg-primary text-primary-foreground", onClick: () => navigate("/bookings") },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Greeting — large, clear */}
      <div className="text-center">
        <Heart className="h-10 w-10 text-primary mx-auto mb-2" />
        <h1 className="text-3xl font-bold text-foreground">
          Hello, {displayName.split(" ")[0]}!
        </h1>
        <p className="text-lg text-muted-foreground mt-1">How are you feeling today?</p>
      </div>

      {/* Emergency SOS — prominent */}
      <EmergencySOS />

      {/* Big action buttons — 2 columns, large touch targets */}
      <div className="grid grid-cols-2 gap-3">
        {bigActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className={`h-24 flex-col gap-2 text-base font-semibold border-2 ${action.color}`}
            onClick={action.onClick}
            disabled={!action.onClick}
          >
            <action.icon className="h-8 w-8" />
            <span>{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Today's Medications — simple list */}
      {medicines && medicines.length > 0 && (
        <Card className="border-transparent card-elevated">
          <CardContent className="p-4">
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" /> Today's Medications
            </h2>
            <div className="space-y-2">
              {medicines.slice(0, 5).map((med: any) => (
                <div key={med.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Pill className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{med.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {med.dosage || ""} {med.time_slot?.length ? `· ${med.time_slot.join(", ")}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
