import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pill, ClipboardCheck, MapPin, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { useCheckinLogs, useMedicines, useMedicineLogs, useCaredOneLocation, useCareTasks } from "@/hooks/use-care-data";

interface PatientSummaryCardProps {
  caredOneId: string;
  name: string;
  avatarUrl?: string | null;
  relationship?: string | null;
  onClick?: () => void;
}

export function PatientSummaryCard({ caredOneId, name, avatarUrl, relationship, onClick }: PatientSummaryCardProps) {
  const { data: checkins } = useCheckinLogs(caredOneId);
  const { data: medicines } = useMedicines(caredOneId);
  const { data: location } = useCaredOneLocation(caredOneId);
  const { data: tasks } = useCareTasks();

  // Latest check-in
  const latestCheckin = checkins?.[0];
  const hasCheckinToday = latestCheckin && new Date(latestCheckin.created_at).toDateString() === new Date().toDateString();

  // Medication count
  const totalMeds = medicines?.length || 0;

  // Location status
  const hasRecentLocation = location && location.latitude;
  const locationAge = location?.updated_at
    ? Math.round((Date.now() - new Date(location.updated_at).getTime()) / 60000)
    : null;

  // Pending tasks for this cared one
  const caredOneTasks = (tasks || []).filter((t: any) => t.care_recipient_id === caredOneId && t.status !== "completed");

  // Mood emoji
  const moodEmoji: Record<string, string> = { great: "😊", good: "🙂", okay: "😐", low: "😟", bad: "😢" };

  return (
    <Card
      className="border-transparent card-elevated cursor-pointer hover:border-primary/30 transition-all"
      onClick={onClick}
    >
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
            {relationship && (
              <p className="text-xs text-muted-foreground capitalize">{relationship}</p>
            )}
          </div>
          {hasCheckinToday ? (
            <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-[10px]">
              <CheckCircle className="h-3 w-3 mr-1" /> Checked in
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-[10px]">
              <AlertTriangle className="h-3 w-3 mr-1" /> No check-in
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Mood */}
          <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-1.5">
            <span className="text-base">{latestCheckin ? (moodEmoji[latestCheckin.mood] || "😐") : "—"}</span>
            <div>
              <p className="text-[10px] text-muted-foreground leading-none">Mood</p>
              <p className="text-xs font-medium text-foreground capitalize">{latestCheckin?.mood || "Unknown"}</p>
            </div>
          </div>

          {/* Medications */}
          <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-1.5">
            <Pill className="h-3.5 w-3.5 text-primary" />
            <div>
              <p className="text-[10px] text-muted-foreground leading-none">Medications</p>
              <p className="text-xs font-medium text-foreground">{totalMeds} active</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <div>
              <p className="text-[10px] text-muted-foreground leading-none">Location</p>
              <p className="text-xs font-medium text-foreground">
                {hasRecentLocation
                  ? locationAge != null && locationAge < 60
                    ? `${locationAge}m ago`
                    : "Available"
                  : "No data"}
              </p>
            </div>
          </div>

          {/* Tasks */}
          <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-1.5">
            <ClipboardCheck className="h-3.5 w-3.5 text-primary" />
            <div>
              <p className="text-[10px] text-muted-foreground leading-none">Tasks</p>
              <p className="text-xs font-medium text-foreground">{caredOneTasks.length} pending</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
