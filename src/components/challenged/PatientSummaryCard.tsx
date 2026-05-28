import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pill, ClipboardCheck, MapPin, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { useCheckins, useTodayCheckinLogs, useMedicines, useCaredOneLocation, useCareTasks } from "@/hooks/use-care-data";
import { useTranslation } from "react-i18next";

interface PatientSummaryCardProps {
  caredOneId: string;
  name: string;
  avatarUrl?: string | null;
  relationship?: string | null;
  onClick?: () => void;
}

export function PatientSummaryCard({ caredOneId, name, avatarUrl, relationship, onClick }: PatientSummaryCardProps) {
  const { t } = useTranslation();
  const { data: checkins } = useCheckins(caredOneId);
  const { data: todayCheckinLogs } = useTodayCheckinLogs(caredOneId);
  const { data: medicines } = useMedicines(caredOneId);
  const { data: location } = useCaredOneLocation(caredOneId);
  const { data: tasks } = useCareTasks();

  const latestCheckinLog = todayCheckinLogs?.[0];
  const hasCheckinToday = !!todayCheckinLogs?.some((log: any) => log.status === "taken");
  const totalMeds = medicines?.length || 0;
  const totalCheckins = checkins?.length || 0;
  const hasRecentLocation = location && location.latitude;
  const locationAge = location?.updated_at
    ? Math.round((Date.now() - new Date(location.updated_at).getTime()) / 60000)
    : null;
  const caredOneTasks = (tasks || []).filter((t: any) => t.care_recipient_id === caredOneId && t.status !== "completed");

  return (
    <Card className="border-transparent card-elevated cursor-pointer hover:border-primary/30 transition-all" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-11 w-11">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {name?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm truncate">{name}</h3>
            {relationship && <p className="text-xs text-muted-foreground capitalize">{relationship}</p>}
          </div>
          {hasCheckinToday && (
            <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-[10px]">
              <CheckCircle className="h-3 w-3 mr-1" /> {t("patientSummary.checkedIn")}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1.5 min-w-0">
            <ClipboardCheck className="h-3.5 w-3.5 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-muted-foreground truncate">{t("patientSummary.checkIns") || "Check-ins"}</p>
              <p className="text-[11px] font-medium text-foreground truncate">{latestCheckinLog?.status === "taken" ? (t("patientSummary.completedToday") || "Done today") : totalCheckins > 0 ? (t("patientSummary.pendingToday") || "Pending") : (t("patientSummary.noSchedule") || "None")}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1.5 min-w-0">
            <Pill className="h-3.5 w-3.5 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-muted-foreground truncate">{t("patientSummary.medications")}</p>
              <p className="text-[11px] font-medium text-foreground truncate">{totalMeds} {t("patientSummary.active")}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1.5 min-w-0">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-muted-foreground truncate">{t("patientSummary.location")}</p>
              <p className="text-[11px] font-medium text-foreground truncate">
                {hasRecentLocation
                  ? locationAge != null && locationAge < 60
                    ? `${locationAge}m ${t("patientSummary.ago")}`
                    : t("patientSummary.available")
                  : t("patientSummary.noData")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1.5 min-w-0">
            <ClipboardCheck className="h-3.5 w-3.5 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-muted-foreground truncate">{t("patientSummary.tasks")}</p>
              <p className="text-[11px] font-medium text-foreground truncate">{caredOneTasks.length} {t("patientSummary.pending")}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
