/**
 * Simplified cared-one view — high-contrast, large-button UI designed for
 * people living with dementia. Shown when the logged-in user is_cared_one=true
 * on the Challenged site.
 */
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSite } from "@/contexts/SiteContext";
import { useMedicines, useCareTasks, useEmergencyContacts, useMyProfile } from "@/hooks/use-care-data";
import {
  Pill, Phone, MapPin, MessageSquare, Users, Calendar, Heart
} from "lucide-react";
import { EmergencySOS } from "./EmergencySOS";
import { CognitiveExercises } from "./CognitiveExercises";
import { AICareTips } from "./AICareTips";
import { useTranslation } from "react-i18next";

export function LovedOneSimpleView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const site = useSite();
  const { data: profile } = useMyProfile();
  const caredOneId = profile?.id || "";
  const { data: medicines } = useMedicines(caredOneId);
  const { data: emergencyContacts } = useEmergencyContacts(caredOneId);
  const displayName = user?.full_name || user?.first_name || "there";

  const primaryContact = emergencyContacts?.find((c: any) => c.is_primary) || emergencyContacts?.[0];

  const bigActions = [
    { label: t("lovedOneView.myMedications"), icon: Pill, color: "bg-primary text-primary-foreground", onClick: () => navigate("/cared-ones") },
    { label: t("lovedOneView.callForHelp"), icon: Phone, color: "bg-destructive text-destructive-foreground", onClick: primaryContact ? () => window.open(`tel:${primaryContact.phone}`) : undefined },
    { label: t("lovedOneView.myLocation"), icon: MapPin, color: "bg-success text-success-foreground", onClick: () => navigate("/gps-tracking") },
    { label: t("messages.messages"), icon: MessageSquare, color: "bg-secondary text-secondary-foreground", onClick: () => navigate("/messages") },
    { label: t("lovedOneView.myCareTeam"), icon: Users, color: "bg-accent text-accent-foreground", onClick: () => navigate("/care-circle") },
    { label: t("lovedOneView.appointments"), icon: Calendar, color: "bg-primary text-primary-foreground", onClick: () => navigate("/bookings") },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div className="text-center">
        <Heart className="h-10 w-10 text-primary mx-auto mb-2" />
        <h1 className="text-3xl font-bold text-foreground">
          {t("lovedOneView.hello", { name: displayName.split(" ")[0] })}
        </h1>
        <p className="text-lg text-muted-foreground mt-1">{t("lovedOneView.howFeeling")}</p>
      </div>

      <EmergencySOS />

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

      {medicines && medicines.length > 0 && (
        <Card className="border-transparent card-elevated">
          <CardContent className="p-4">
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" /> {t("lovedOneView.todaysMedications")}
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

      <CognitiveExercises />
      <AICareTips caredOneName={displayName} />
    </div>
  );
}
