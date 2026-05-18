import { useState, useCallback, useMemo, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useSite } from "@/contexts/SiteContext";
import {
  useBookings, useCareTasks, useDashboardStats, useUserCaredOnes, usePosts,
} from "@/hooks/use-care-data";
import {
  CalendarDays, Users, MapPin, ArrowRight, CheckCircle, AlertCircle, MessageSquare,
  ShoppingBag, Heart, BookOpen, Wand2, Briefcase, Bell, Calendar as CalIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PatientSummaryCard } from "@/components/challenged/PatientSummaryCard";
import { DailyTimeline } from "@/components/challenged/DailyTimeline";
import { LovedOneSimpleView } from "@/components/challenged/LovedOneSimpleView";
import { DementiaAssistant } from "@/components/challenged/DementiaAssistant";
import { CaregiverWellness } from "@/components/challenged/CaregiverWellness";
import {
  DashboardWidgetConfig, getWidgetPrefs, setWidgetPrefs,
  getWidgetOrder, setWidgetOrder, resolveOrder,
} from "@/components/dashboard/DashboardWidgetConfig";
import { getAvailableWidgets, getDefaultVisibility } from "@/components/dashboard/widgets";

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isChinese = i18n.language?.startsWith("zh");
  const { user } = useAuth();
  const site = useSite();
  const careGroupsLabel = isChinese ? t("nav.united", { defaultValue: "护理群组" }) : site.navLabels.careGroups;
  const { data: bookings, isLoading: bookingsLoading } = useBookings();
  const { data: tasks, isLoading: tasksLoading } = useCareTasks();
  const { data: stats } = useDashboardStats();
  const { data: caredOnes } = useUserCaredOnes();
  const { data: communityPosts } = usePosts("care_community_post");

  const isChallenged = site.family === "challenged";
  const isLovedOne = user?.general_user_role?.includes("cared one") === true;
  const isProvider = user?.is_care_provider === true;
  const userRole: "caregiver" | "provider" | "caredOne" = isLovedOne
    ? "caredOne"
    : isProvider
      ? "provider"
      : "caregiver";

  const availableWidgets = useMemo(
    () => getAvailableWidgets(isChallenged, userRole),
    [isChallenged, userRole]
  );
  const defaultVis = useMemo(() => getDefaultVisibility(availableWidgets), [availableWidgets]);

  const [visibility, setVisibility] = useState<Record<string, boolean>>(() => ({
    ...defaultVis, ...getWidgetPrefs(),
  }));

  const [order, setOrder] = useState<string[]>(() =>
    resolveOrder(availableWidgets, getWidgetOrder())
  );

  // Keep order in sync when available widgets change (role/site switch)
  useEffect(() => {
    setOrder((prev) => resolveOrder(availableWidgets, prev));
  }, [availableWidgets]);

  const handleToggle = useCallback((id: string, val: boolean) => {
    setVisibility((prev) => {
      const next = { ...prev, [id]: val };
      setWidgetPrefs(next);
      return next;
    });
  }, []);

  const handleReorder = useCallback((next: string[]) => {
    setOrder(next);
    setWidgetOrder(next);
  }, []);

  const show = (id: string) =>
    visibility[id] !== false && availableWidgets.some((w) => w.id === id);

  if (isChallenged && isLovedOne) {
    return (
      <>
        <LovedOneSimpleView />
        <DementiaAssistant />
      </>
    );
  }

  const displayName = user?.full_name || user?.first_name || "there";
  const upcomingBookings = (bookings || [])
    .filter((b: any) => ["confirmed", "pending"].includes(b.status))
    .slice(0, 4);
  const pendingTasks = (tasks || []).filter((t: any) => t.status !== "completed").slice(0, 5);
  const firstCaredOne = caredOnes?.[0];
  const recentPosts = (communityPosts || []).slice(0, 3);

  const statusColors: Record<string, string> = {
    confirmed: "bg-success text-success-foreground",
    pending: "bg-warning text-warning-foreground",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive text-destructive-foreground",
    in_progress: "bg-primary text-primary-foreground",
  };
  const priorityColors: Record<string, string> = {
    high: "bg-destructive/10 text-destructive",
    urgent: "bg-destructive/10 text-destructive",
    medium: "bg-warning/10 text-warning",
    low: "bg-muted text-muted-foreground",
  };

  const quickTools = [
    { icon: ShoppingBag, label: t("nav.findHelp", { defaultValue: "Marketplace" }), to: "/search", color: "text-coral" },
    { icon: MapPin,      label: t("dashboard.gpsTrack", { defaultValue: "GPS" }),    to: "/gps-tracking", color: "text-primary" },
    { icon: CalIcon,     label: t("nav.calendar", { defaultValue: "Calendar" }),     to: "/calendar", color: "text-success" },
    { icon: MessageSquare, label: t("nav.messages", { defaultValue: "Messages" }),   to: "/messages", color: "text-coral" },
    { icon: Briefcase,   label: t("nav.bookings", { defaultValue: "Bookings" }),     to: "/bookings", color: "text-primary" },
    { icon: Users,       label: careGroupsLabel,                                        to: "/care-circle", color: "text-success" },
    { icon: BookOpen,    label: t("nav.resources", { defaultValue: "Resources" }),   to: "/resources", color: "text-primary" },
    { icon: Bell,        label: t("nav.notifications", { defaultValue: "Alerts" }), to: "/notifications", color: "text-warning" },
    { icon: Wand2,    label: t("nav.aiCompanion", { defaultValue: "AI Companion" }), to: "/ai-companion", color: "text-primary" },
  ];

  // ── Each widget id maps to its own block; rendered in user-defined order ──
  const blocks: Record<string, ReactNode> = {
    "patient-summaries": caredOnes && caredOnes.length > 0 ? (
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground">
            {t("nav.myLovedOnes") || site.navLabels.caredOnes}
          </h2>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => navigate("/cared-ones")}>
            {t("common.viewAll")} <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-1
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {caredOnes.map((co: any) => (
            <div key={co.user_id} className="snap-start shrink-0 w-[85%] sm:w-[340px]">
              <PatientSummaryCard
                caredOneId={co.user_id}
                name={co.cared_one?.full_name || co.cared_one?.first_name || site.caredOneSingular}
                avatarUrl={co.cared_one?.avatar_url}
                relationship={co.relationship}
                onClick={() => navigate("/cared-ones")}
              />
            </div>
          ))}
        </div>
      </section>
    ) : null,

    "stats": (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[
          { label: t("dashboard.upcomingBookings"), value: stats?.upcomingBookings ?? 0, icon: CalendarDays, color: "text-primary", to: "/bookings" },
          { label: careGroupsLabel, value: stats?.careGroups ?? 0, icon: Users, color: "text-success", to: "/care-circle" },
          { label: t("dashboard.pendingTasks"), value: stats?.pendingTasks ?? 0, icon: AlertCircle, color: "text-warning", to: "/care-circle" },
          { label: t("dashboard.unreadMessages"), value: stats?.unreadMessages ?? 0, icon: MessageSquare, color: "text-coral", to: "/messages" },
        ].map((s) => (
          <button key={s.label} onClick={() => navigate(s.to)}
            className="text-left rounded-lg border border-transparent card-elevated p-3 hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-2">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <p className="text-lg font-bold text-foreground">{s.value}</p>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{s.label}</p>
          </button>
        ))}
      </div>
    ),

    "quick-actions": (
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-2">
          {t("dashboard.quickActions", { defaultValue: "Quick Tools" })}
        </h2>
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {quickTools.map((q) => (
            <button key={q.label} onClick={() => navigate(q.to)}
              className="shrink-0 w-[72px] flex flex-col items-center gap-1.5 p-2 rounded-xl
                card-elevated border border-transparent hover:border-primary/30 transition-colors">
              <div className={`h-9 w-9 rounded-full bg-muted/60 flex items-center justify-center ${q.color}`}>
                <q.icon className="h-4 w-4" />
              </div>
              <span className="text-[10px] text-foreground text-center leading-tight line-clamp-2">
                {q.label}
              </span>
            </button>
          ))}
        </div>
      </section>
    ),

    "upcoming-bookings": (
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-2">
          {t("dashboard.upcomingBookings")}
        </h2>
        <Card className="border-transparent card-elevated">
          <CardContent className="p-3 space-y-2">
            {bookingsLoading ? (
              [1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/40">
                  <Skeleton className="w-10 h-12 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))
            ) : upcomingBookings.length > 0 ? upcomingBookings.map((b: any) => (
              <div key={b.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/40">
                <div className="text-center shrink-0 w-10">
                  <p className="text-[10px] text-muted-foreground">{new Date(b.appointment_date || b.start_time || b.created_at).toLocaleDateString(i18n.language, { month: "short" })}</p>
                  <p className="text-base font-bold text-foreground leading-none">{new Date(b.appointment_date || b.start_time || b.created_at).getDate()}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{b.provider?.full_name || "Provider"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{b.appointment_time || ""} · {b.service_type || ""}</p>
                </div>
                <Badge className={`${statusColors[b.status] || "bg-muted text-muted-foreground"} text-[10px]`}>{b.status}</Badge>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-6">{t("dashboard.noUpcomingBookings")}</p>
            )}
            <Button variant="ghost" size="sm" className="w-full h-8 text-xs" onClick={() => navigate("/bookings")}>
              {t("common.viewAll")} <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </section>
    ),

    "care-tasks": (
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-2">
          {t("dashboard.careTasks")}
        </h2>
        <Card className="border-transparent card-elevated">
          <CardContent className="p-3 space-y-2">
            {tasksLoading ? (
              [1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/40">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-36" /><Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            ) : pendingTasks.length > 0 ? pendingTasks.map((tk: any) => (
              <div key={tk.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/40">
                <CheckCircle className={`h-4 w-4 shrink-0 ${tk.status === "completed" ? "text-success" : "text-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{tk.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {tk.assignee_profile?.full_name || "Unassigned"}
                    {tk.due_date && ` · ${new Date(tk.due_date).toLocaleDateString(i18n.language, { month: "short", day: "numeric" })}`}
                  </p>
                </div>
                <Badge variant="outline" className={`${priorityColors[tk.priority] || ""} text-[10px]`}>{tk.priority}</Badge>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-6">{t("dashboard.noPendingTasks")}</p>
            )}
            <Button variant="ghost" size="sm" className="w-full h-8 text-xs" onClick={() => navigate("/care-circle")}>
              {t("common.viewAll")} <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </section>
    ),

    "daily-timeline": firstCaredOne ? (
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-2">
          {t("dashboard.timeline", { defaultValue: "Daily Timeline" })}
        </h2>
        <DailyTimeline
          caredOneId={firstCaredOne.user_id}
          caredOneName={firstCaredOne.cared_one?.full_name || firstCaredOne.cared_one?.first_name || site.caredOneSingular}
        />
      </section>
    ) : null,

    "community-feed": recentPosts.length > 0 ? (
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground">
            {t("nav.community", { defaultValue: "Community" })}
          </h2>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => navigate("/community")}>
            {t("common.viewAll")} <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
        <div className="space-y-2">
          {recentPosts.map((p: any) => (
            <Card key={p.id} className="border-transparent card-elevated cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => navigate(`/community/${p.id}`)}>
              <CardContent className="p-3">
                <p className="text-sm font-medium text-foreground truncate">{p.title || p.content?.slice(0, 60)}</p>
                {p.title && p.content && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{p.content}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    ) : null,

    "caregiver-wellness": <CaregiverWellness />,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-5 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {t("dashboard.welcomeBack", { name: displayName.split(" ")[0] })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t(`site.${site.id}.dashboardSubtitle`, { defaultValue: site.tagline })}
          </p>
        </div>
        <DashboardWidgetConfig
          widgets={availableWidgets}
          visibility={visibility}
          order={order}
          onChange={handleToggle}
          onReorder={handleReorder}
        />
      </div>

      {order.map((id) => {
        if (!show(id)) return null;
        const block = blocks[id];
        if (!block) return null;
        return <div key={id}>{block}</div>;
      })}

      {/* Floating AI Companion (not part of reorderable flow) */}
      {show("dementia-assistant") && <DementiaAssistant />}
    </div>
  );
}
