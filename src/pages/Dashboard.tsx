import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useSite } from "@/contexts/SiteContext";
import { useBookings, useCareTasks, useDashboardStats, useUserCaredOnes } from "@/hooks/use-care-data";
import {
  CalendarDays, Users, MapPin, ArrowRight, CheckCircle, AlertCircle, MessageSquare,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PatientSummaryCard } from "@/components/challenged/PatientSummaryCard";
import { EmergencySOS } from "@/components/challenged/EmergencySOS";
import { DailyTimeline } from "@/components/challenged/DailyTimeline";
import { LovedOneSimpleView } from "@/components/challenged/LovedOneSimpleView";
import { DementiaAssistant } from "@/components/challenged/DementiaAssistant";
// Removed: AIInsightsPanel, AICareTips, AIDailySummary, SymptomTracker, DementiaStageSelector
// — these implied medical assessment / clinical analysis. The app provides
// companionship, logistics, and neutral logging only.
import { CaregiverWellness } from "@/components/challenged/CaregiverWellness";
import { DashboardWidgetConfig, getWidgetPrefs, setWidgetPrefs } from "@/components/dashboard/DashboardWidgetConfig";
import { getAvailableWidgets, getDefaultVisibility } from "@/components/dashboard/widgets";

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const site = useSite();
  const { data: bookings, isLoading: bookingsLoading } = useBookings();
  const { data: tasks, isLoading: tasksLoading } = useCareTasks();
  const { data: stats } = useDashboardStats();
  const { data: caredOnes } = useUserCaredOnes();

  const isChallenged = site.id === "challenged";
  const isLovedOne = user?.general_user_role?.includes("cared one") === true;
  const isProvider = user?.is_care_provider === true;
  const userRole: "caregiver" | "provider" | "caredOne" = isLovedOne
    ? "caredOne"
    : isProvider
      ? "provider"
      : "caregiver";

  // Widget configuration
  const availableWidgets = useMemo(
    () => getAvailableWidgets(isChallenged, userRole),
    [isChallenged, userRole]
  );
  const defaultVis = useMemo(() => getDefaultVisibility(availableWidgets), [availableWidgets]);

  const [visibility, setVisibility] = useState<Record<string, boolean>>(() => {
    const saved = getWidgetPrefs();
    return { ...defaultVis, ...saved };
  });

  const handleToggle = useCallback((id: string, val: boolean) => {
    setVisibility((prev) => {
      const next = { ...prev, [id]: val };
      setWidgetPrefs(next);
      return next;
    });
  }, []);

  const show = (id: string) => visibility[id] !== false && availableWidgets.some((w) => w.id === id);

  // Loved one gets simplified view
  if (isChallenged && isLovedOne) {
    return (
      <>
        <LovedOneSimpleView />
        <DementiaAssistant />
      </>
    );
  }

  const displayName = user?.full_name || user?.first_name || "there";
  const upcomingBookings = (bookings || []).filter((b: any) => ["confirmed", "pending"].includes(b.status)).slice(0, 3);
  const pendingTasks = (tasks || []).filter((t: any) => t.status !== "completed").slice(0, 4);
  const firstCaredOne = caredOnes?.[0];

  const statusColors: Record<string, string> = {
    confirmed: "bg-success text-success-foreground",
    pending: "bg-warning text-warning-foreground",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive text-destructive-foreground",
    cancelled_by_user: "bg-destructive text-destructive-foreground",
    cancelled_by_provider: "bg-destructive text-destructive-foreground",
    in_progress: "bg-primary text-primary-foreground",
  };

  const priorityColors: Record<string, string> = {
    high: "bg-destructive/10 text-destructive",
    urgent: "bg-destructive/10 text-destructive",
    medium: "bg-warning/10 text-warning",
    low: "bg-muted text-muted-foreground",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header with customize button */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("dashboard.welcomeBack", { name: displayName.split(" ")[0] })}</h1>
          <p className="text-muted-foreground">
            {t(`site.${site.id}.dashboardSubtitle`)}
          </p>
        </div>
        <DashboardWidgetConfig
          widgets={availableWidgets}
          visibility={visibility}
          onChange={handleToggle}
        />
      </div>

      {/* Emergency SOS */}
      {show("emergency-sos") && (
        <div className="mb-6"><EmergencySOS /></div>
      )}

      {/* Stats */}
      {show("stats") && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: t("dashboard.upcomingBookings"), value: stats?.upcomingBookings ?? 0, icon: CalendarDays, color: "text-primary" },
            { label: site.navLabels.careGroups, value: stats?.careGroups ?? 0, icon: Users, color: "text-success" },
            { label: t("dashboard.pendingTasks"), value: stats?.pendingTasks ?? 0, icon: AlertCircle, color: "text-warning" },
            { label: t("dashboard.unreadMessages"), value: stats?.unreadMessages ?? 0, icon: MessageSquare, color: "text-coral" },
          ].map((stat) => (
            <Card key={stat.label} className="border-transparent card-elevated">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={stat.color}><stat.icon className="h-5 w-5" /></div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Patient Summaries — Challenged only */}
      {show("patient-summaries") && caredOnes && caredOnes.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-foreground mb-3">{site.navLabels.caredOnes} — At a Glance</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {caredOnes.map((co: any) => (
              <PatientSummaryCard
                key={co.user_id}
                caredOneId={co.user_id}
                name={co.cared_one?.full_name || co.cared_one?.first_name || site.caredOneSingular}
                avatarUrl={co.cared_one?.avatar_url}
                relationship={co.relationship}
                onClick={() => navigate("/cared-ones")}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Removed: dementia-stage selector + ai-insights panel (clinical-flavoured) */}

        {show("daily-timeline") && firstCaredOne && (
          <DailyTimeline
            caredOneId={firstCaredOne.user_id}
            caredOneName={firstCaredOne.cared_one?.full_name || firstCaredOne.cared_one?.first_name || site.caredOneSingular}
          />
        )}

        {/* Removed: symptom & behavior tracker */}

        {show("caregiver-wellness") && <CaregiverWellness />}

        {/* Removed: AI daily summary + AI care tips (avoid implying medical advice) */}

        {/* Upcoming Bookings */}
        {show("upcoming-bookings") && (
          <Card className="border-transparent card-elevated">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-lg">{t("dashboard.upcomingBookings")}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/bookings")}>{t("common.viewAll")} <ArrowRight className="ml-1 h-3 w-3" /></Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {bookingsLoading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"><Skeleton className="w-10 h-12 rounded" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-48" /></div><Skeleton className="h-6 w-16 rounded-full" /></div>)}</div>
              ) : upcomingBookings.length > 0 ? upcomingBookings.map((b: any) => (
                <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="text-center shrink-0">
                    <p className="text-xs text-muted-foreground">{new Date(b.appointment_date || b.start_time || b.created_at).toLocaleDateString("en", { month: "short" })}</p>
                    <p className="text-lg font-bold text-foreground">{new Date(b.appointment_date || b.start_time || b.created_at).getDate()}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{b.provider?.full_name || "Provider"}</p>
                    <p className="text-xs text-muted-foreground">{b.appointment_time || ""} · {b.duration_hour || ""}hrs · {b.service_type || ""}</p>
                  </div>
                  <Badge className={statusColors[b.status] || "bg-muted text-muted-foreground"}>{b.status}</Badge>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">{t("dashboard.noUpcomingBookings")}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Care Tasks */}
        {show("care-tasks") && (
          <Card className="border-transparent card-elevated">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-lg">{t("dashboard.careTasks")}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/care-circle")}>{t("common.viewAll")} <ArrowRight className="ml-1 h-3 w-3" /></Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasksLoading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"><Skeleton className="h-4 w-4 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-36" /><Skeleton className="h-3 w-24" /></div><Skeleton className="h-5 w-14 rounded-full" /></div>)}</div>
              ) : pendingTasks.length > 0 ? pendingTasks.map((t: any) => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <CheckCircle className={`h-4 w-4 shrink-0 ${t.status === "completed" ? "text-success" : "text-muted-foreground"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.assignee_profile?.full_name || "Unassigned"}
                      {t.due_date && ` · Due ${new Date(t.due_date).toLocaleDateString("en", { month: "short", day: "numeric" })}`}
                    </p>
                  </div>
                  <Badge variant="outline" className={priorityColors[t.priority] || ""}>{t.priority}</Badge>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">{t("dashboard.noPendingTasks")}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        {show("quick-actions") && (
          <Card className="border-transparent card-elevated lg:col-span-2">
            <CardHeader><CardTitle className="text-lg">{t("dashboard.quickActions")}</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/search")}>
                <CalendarDays className="h-5 w-5 text-primary" />
                <span className="text-xs">{isChallenged ? t("nav.findHelp") : t("dashboard.bookCare")}</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/care-circle")}>
                <Users className="h-5 w-5 text-primary" />
                <span className="text-xs">{site.navLabels.careGroups}</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/gps-tracking")}>
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-xs">{t("dashboard.gpsTrack")}</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/messages")}>
                <MessageSquare className="h-5 w-5 text-primary" />
                <span className="text-xs">{t("nav.messages")}</span>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Dementia Assistant */}
      {show("dementia-assistant") && <DementiaAssistant />}
    </div>
  );
}
