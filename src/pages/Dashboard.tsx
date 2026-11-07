import { Suspense, useState, useCallback, useMemo, useEffect, type ReactNode } from "react";
import { useNavigate } from "@/lib/router-compat";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useSite } from "@/contexts/SiteContext";
import {
  useBookings, useCareTasks, useUserCaredOnes, usePosts, useCareGroups, useInboxCounts,
} from "@/features/dashboard/use-dashboard-data";

import {
  CalendarDays, Users, MapPin, ArrowRight, CheckCircle, AlertCircle, MessageSquare,
  ShoppingBag, Heart, BookOpen, Wand2, Briefcase, Bell, Calendar as CalIcon,
  Settings2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  getWidgetPrefs, setWidgetPrefs, getWidgetOrder, setWidgetOrder, resolveOrder,
} from "@/components/dashboard/dashboard-widget-preferences";
import { getAvailableWidgets, getDefaultVisibility } from "@/components/dashboard/widgets";
import { formatDate, formatTime, formatDateTime } from "@/lib/locale";
import { pendingCareTasks, pendingCareTaskTarget } from "@/features/care-tasks/pending";
import { lazyRetry } from "@/lib/lazy-retry";

const DashboardWidgetConfig = lazyRetry(
  () => import("@/components/dashboard/DashboardWidgetConfig").then((module) => ({ default: module.DashboardWidgetConfig })),
  "DashboardWidgetConfig",
);
const AISmartBriefing = lazyRetry(
  () => import("@/components/dashboard/AISmartBriefing").then((module) => ({ default: module.AISmartBriefing })),
  "AISmartBriefing",
);
const PatientSummaryCard = lazyRetry(
  () => import("@/components/challenged/PatientSummaryCard").then((module) => ({ default: module.PatientSummaryCard })),
  "PatientSummaryCard",
);
const DailyTimeline = lazyRetry(
  () => import("@/components/challenged/DailyTimeline").then((module) => ({ default: module.DailyTimeline })),
  "DailyTimeline",
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isChinese = i18n.language?.startsWith("zh");
  const { user } = useAuth();
  const site = useSite();
  const careGroupsLabel = isChinese ? t("nav.united", { defaultValue: "护理群组" }) : site.navLabels.careGroups;
  const { data: bookings, isLoading: bookingsLoading } = useBookings();
  const { data: tasks, isLoading: tasksLoading, error: tasksError } = useCareTasks();
  const { data: myCareGroups } = useCareGroups();
  const { unread: unreadInbox, isLoading: inboxLoading, error: inboxError } = useInboxCounts();
  const { data: caredOnes, isLoading: caredOnesLoading } = useUserCaredOnes();
  const { data: communityPosts, isLoading: postsLoading } = usePosts("care_community_post");

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
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);

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

  const displayName = user?.full_name || (isChinese ? "朋友" : "friend");
  // Only this user's own bookings, and only ones still ahead of us, sorted by
  // when they start. Nothing from other people's calendars.
  const bookingStart = (b: any) => new Date(b.appointment_date || b.start_time || b.created_at).getTime();
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  const myUpcomingBookings = (bookings || [])
    .filter((b: any) => ["confirmed", "pending"].includes(b.status))
    .filter((b: any) => {
      const t = bookingStart(b);
      return !Number.isFinite(t) || t >= startOfToday.getTime();
    })
    .sort((a: any, b: any) => bookingStart(a) - bookingStart(b));
  const upcomingBookings = myUpcomingBookings.slice(0, 4);
  // The dashboard is person-centred: only tasks connected through the task →
  // cared-one relation to someone in this user's cared-one list belong here.
  // Unlinked/test tasks and tasks for other people's cared ones must never leak in.
  const myCaredOneIds = new Set((caredOnes || []).map((c: any) => String(c.user_id).replace(/^wp-/, "")));
  const myTasks = (tasks || []).filter((tk: any) => {
    const co = String(tk.cared_one_id ?? "").replace(/^wp-/, "");
    return !!co && myCaredOneIds.has(co);
  });
  const myPendingTasks = pendingCareTasks(myTasks, [...myCaredOneIds]);
  const pendingTasksTarget = pendingCareTaskTarget(myPendingTasks, caredOnes?.[0]?.user_id);
  const pendingTasks = myPendingTasks.slice(0, 5);
  // Care teams the user actually belongs to, and unread messages sent to them.
  const myCareGroupCount = (myCareGroups || []).length;
  const firstCaredOne = caredOnes?.[0];
  const recentPosts = (communityPosts || []).slice(0, 3);


  const statusColors: Record<string, string> = {
    confirmed: "bg-success text-success-foreground",
    pending: "bg-warning text-warning-foreground",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive text-destructive-foreground",
    in_progress: "bg-primary text-primary-foreground",
  };

  const paidCare = site.features.paidCaregivers;

  // Placeholder that holds a widget's slot while its data loads, so the
  // dashboard never re-shuffles blocks as requests finish at different times.
  const slotSkeleton = (title: string, height: string) => (
    <section>
      <h2 className="text-sm font-semibold text-foreground mb-2">{title}</h2>
      <Skeleton className={`w-full ${height} rounded-xl`} />
    </section>
  );

  const blocks: Record<string, ReactNode> = {
    "ai-briefing": (
      <Suspense fallback={slotSkeleton(isChinese ? "今日智能简报" : "Today's Smart Briefing", "h-32")}>
        <AISmartBriefing />
      </Suspense>
    ),
    "patient-summaries": caredOnes && caredOnes.length > 0 ? (
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-2">
          {t("nav.myLovedOnes") || site.navLabels.caredOnes}
        </h2>
        {caredOnes.length === 1 ? (
          <Suspense fallback={<Skeleton className="h-40 w-full rounded-xl" />}>
            <PatientSummaryCard
              caredOneId={caredOnes[0].user_id}
              name={caredOnes[0].cared_one?.full_name || ""}
              avatarUrl={caredOnes[0].cared_one?.avatar_url}
              relationship={caredOnes[0].relationship}
              onClick={() => navigate(`/cared-ones/${String(caredOnes[0].user_id).replace(/^wp-/, "")}`)}
            />
          </Suspense>
        ) : (
          <Tabs defaultValue={caredOnes[0].user_id}>
            <TabsList className="w-full h-auto flex-wrap justify-start gap-1 bg-muted/40 p-1 rounded-xl">
              {caredOnes.map((co: any) => {
                const name = co.cared_one?.full_name || "";
                return (
                  <TabsTrigger
                    key={co.user_id}
                    value={co.user_id}
                    className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs text-xs px-3 py-1.5 max-w-[12rem] truncate"
                  >
                    {name}
                  </TabsTrigger>

                );
              })}
            </TabsList>
            {caredOnes.map((co: any) => (
              <TabsContent key={co.user_id} value={co.user_id} className="mt-3 focus-visible:outline-hidden">
                <Suspense fallback={<Skeleton className="h-40 w-full rounded-xl" />}>
                  <PatientSummaryCard
                    caredOneId={co.user_id}
                    name={co.cared_one?.full_name || ""}
                    avatarUrl={co.cared_one?.avatar_url}
                    relationship={co.relationship}
                    onClick={() => navigate(`/cared-ones/${String(co.user_id).replace(/^wp-/, "")}`)}
                  />
                </Suspense>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </section>
    ) : caredOnesLoading ? slotSkeleton(t("nav.myLovedOnes") || site.navLabels.caredOnes, "h-40") : null,

    "stats": (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[
          ...(paidCare ? [{ id: "upcoming-bookings", label: t("dashboard.upcomingBookings"), value: myUpcomingBookings.length, icon: CalendarDays, color: "text-primary", to: "/bookings" }] : []),
          { id: "care-groups", label: careGroupsLabel, value: myCareGroupCount, icon: Users, color: "text-success", to: "/care-circle" },
          { id: "pending-tasks", label: t("dashboard.pendingTasks"), value: tasksLoading || caredOnesLoading || tasksError ? "—" : myPendingTasks.length, icon: AlertCircle, color: "text-warning", to: pendingTasksTarget },
          { id: "unread-inbox", label: isChinese ? "收件箱未读" : "Unread Inbox", value: inboxLoading || inboxError ? "—" : unreadInbox, icon: MessageSquare, color: "text-coral", to: "/inbox" },
        ].map((s) => (
          <button key={s.id} onClick={() => navigate(s.to)}
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


    "upcoming-bookings": paidCare ? (
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-2">
          {t("dashboard.upcomingBookings")}
        </h2>
        <Card className="border-transparent card-elevated">
          <CardContent className="p-3 space-y-2">
            {bookingsLoading ? (
              [1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/40">
                  <Skeleton className="w-10 h-12 rounded-sm" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))
            ) : upcomingBookings.length > 0 ? upcomingBookings.map((b: any) => (
              <button
                key={b.id}
                type="button"
                onClick={() => navigate("/bookings")}
                className="w-full text-left flex items-center gap-3 p-2 rounded-lg bg-muted/40 hover:bg-muted transition-colors">
                <div className="text-center shrink-0 w-10">
                  <p className="text-[10px] text-muted-foreground">{formatDate(b.appointment_date || b.start_time || b.created_at, i18n.language, { month: "short" })}</p>
                  <p className="text-base font-bold text-foreground leading-none">{new Date(b.appointment_date || b.start_time || b.created_at).getDate()}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{b.provider?.full_name || t("common.provider")}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{[b.appointment_time, b.service_type].filter(Boolean).join(" · ")}</p>
                </div>
                <Badge className={`${statusColors[b.status] || "bg-muted text-muted-foreground"} text-[10px]`}>{t(`bookings.status.${b.status}`, { defaultValue: String(b.status ?? "") })}</Badge>
              </button>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-6">{t("dashboard.noUpcomingBookings")}</p>
            )}
            <Button variant="ghost" size="sm" className="w-full h-8 text-xs" onClick={() => navigate("/bookings")}>
              {t("common.viewAll")} <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </section>
    ) : null,

    "care-tasks": (
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-2">
          {t("dashboard.careTasks")}
        </h2>
        <Card className="border-transparent card-elevated">
          <CardContent className="p-3 space-y-2">
            {tasksError ? <p role="alert" className="text-sm text-destructive">{isChinese ? "任务读取失败，请刷新重试。" : "Tasks could not be loaded. Please refresh and try again."}</p> : tasksLoading || caredOnesLoading ? (
              [1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/40">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-36" /><Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            ) : pendingTasks.length > 0 ? pendingTasks.map((tk: any) => {
              const caredOneId = String(tk.cared_one_id).replace(/^wp-/, "");
              const caredOne = (caredOnes || []).find((co: any) => String(co.user_id).replace(/^wp-/, "") === caredOneId);
              const caredOneName = caredOne?.cared_one?.full_name || site.caredOneSingular;
              return (
                <button
                  key={tk.id}
                  type="button"
                  onClick={() => navigate(`/cared-ones/${caredOneId}/tasks`)}
                  className="w-full text-left flex items-center gap-3 p-2 rounded-lg bg-muted/40 hover:bg-muted transition-colors"
                  aria-label={`${tk.title} — ${caredOneName}`}
                >
                  <CheckCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{tk.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {caredOneName}
                      {tk.due_date && ` · ${formatDate(tk.due_date, i18n.language, { month: "short", day: "numeric" })}`}
                    </p>
                  </div>
                </button>
              );
            }) : (
              <p className="text-sm text-muted-foreground text-center py-6">{t("dashboard.noPendingTasks")}</p>
            )}
            <Button variant="ghost" size="sm" className="w-full h-8 text-xs" onClick={() => navigate(pendingTasksTarget)}>
              {t("common.viewAll")}
            </Button>
          </CardContent>
        </Card>
      </section>
    ),

    "daily-timeline": firstCaredOne ? (
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-2">
          {t("dashboard.timeline", { defaultValue: "Today's Events" })}
        </h2>
        {(caredOnes?.length ?? 0) > 1 ? (
          <Tabs defaultValue={firstCaredOne.user_id}>
            <TabsList className="w-full h-auto flex-wrap justify-start gap-1 bg-muted/40 p-1 rounded-xl mb-2">
              {caredOnes!.map((co: any) => (
                <TabsTrigger key={co.user_id} value={co.user_id}
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs text-xs px-3 py-1.5 max-w-[12rem] truncate">
                  {co.cared_one?.full_name || ""}
                </TabsTrigger>
              ))}
            </TabsList>
            {caredOnes!.map((co: any) => (
              <TabsContent key={co.user_id} value={co.user_id} className="focus-visible:outline-hidden">
                <Suspense fallback={<Skeleton className="h-32 w-full rounded-xl" />}>
                  <DailyTimeline
                    caredOneId={co.user_id}
                    caredOneName={co.cared_one?.full_name || ""}
                  />
                </Suspense>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <Suspense fallback={<Skeleton className="h-32 w-full rounded-xl" />}>
            <DailyTimeline
              caredOneId={firstCaredOne.user_id}
              caredOneName={firstCaredOne.cared_one?.full_name || ""}
            />
          </Suspense>
        )}
      </section>
    ) : caredOnesLoading ? slotSkeleton(t("dashboard.timeline", { defaultValue: "Today's Events" }), "h-32") : null,


    "community-feed": site.features.community && recentPosts.length > 0 ? (
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
    ) : postsLoading ? slotSkeleton(t("nav.community", { defaultValue: "Community" }), "h-24") : null,


  };

  const customizeButton = (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      aria-label={isChinese ? "自定义面板" : "Customize dashboard"}
      disabled={showWidgetConfig}
      onClick={() => setShowWidgetConfig(true)}
    >
      <Settings2 className="h-4 w-4" />
      <span className="hidden sm:inline">
        {isChinese ? "自定义" : "Customize"}
      </span>
    </Button>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-5 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {t("dashboard.welcomeBack", { name: displayName })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t(`site.${site.id}.dashboardSubtitle`, { defaultValue: site.tagline })}
          </p>
        </div>
        {showWidgetConfig ? (
          <Suspense fallback={customizeButton}>
            <DashboardWidgetConfig
              widgets={availableWidgets}
              visibility={visibility}
              order={order}
              onChange={handleToggle}
              onReorder={handleReorder}
              initialOpen
            />
          </Suspense>
        ) : (
          customizeButton
        )}
      </div>

      {order.map((id) => {
        if (!show(id)) return null;
        const block = blocks[id];
        if (!block) return null;
        return <div key={id}>{block}</div>;
      })}
    </div>
  );
}
