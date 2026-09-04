import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  CalendarEvent,
  CalendarEventType,
  EVENT_TYPE_COLORS,
  getEventTypeLabel,
} from "@/features/calendar/types";
import { fetchCalendarEventsWordPress, deleteCalendarEventWordPress } from "@/features/calendar/source.wordpress";
import EventFormDialog from "@/features/calendar/EventFormDialog";
import { Calendar as CalendarIcon, MapPin, Users, Clock, Repeat, Plus, Pencil, Trash2 } from "lucide-react";
import { formatDate, formatTime, formatDateTime } from "@/lib/locale";
import { toast } from "sonner";

const ALL_TYPES: CalendarEventType[] = [
  "personal", "family", "medicine", "task", "appointment",
  "availability", "birthday", "holiday", "booking", "check_in",
];

const PRIORITY_LABEL: Record<string, { en: string; zh: string }> = {
  low: { en: "Low", zh: "低" },
  normal: { en: "Normal", zh: "普通" },
  high: { en: "High", zh: "高" },
  urgent: { en: "Urgent", zh: "紧急" },
};

export default function CalendarPage() {
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith("zh");
  const queryClient = useQueryClient();
  const [enabledTypes, setEnabledTypes] = useState<Set<CalendarEventType>>(new Set(ALL_TYPES));
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: allEvents = [], isLoading } = useQuery({
    queryKey: ["calendar-events"],
    queryFn: fetchCalendarEventsWordPress,
    staleTime: 60_000,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["calendar-events"] });

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (e: CalendarEvent) => { setSelectedEvent(null); setEditing(e); setFormOpen(true); };

  const removeEvent = async (e: CalendarEvent) => {
    setDeleting(true);
    try {
      await deleteCalendarEventWordPress(e.id);
      toast.success(isZh ? "事件已删除" : "Event deleted");
      setSelectedEvent(null);
      refresh();
    } catch {
      toast.error(isZh ? "删除失败，请重试" : "Could not delete the event. Please try again.");
    } finally {
      setDeleting(false);
    }
  };


  /** Convert CCT-shaped events → FullCalendar EventInput, with RRULE support */
  const fcEvents = useMemo(() => {
    return allEvents
      .filter((e) => enabledTypes.has(e.event_type))
      .map((e) => {
        const base: any = {
          id: e.id,
          title: e.title,
          allDay: e.all_day,
          backgroundColor: e.color,
          borderColor: e.color,
          textColor: "#fff",
          extendedProps: e,
        };
        if (e.rrule) {
          // RRULE-driven recurring events
          base.rrule = {
            freq: e.rrule.includes("FREQ=DAILY") ? "daily"
              : e.rrule.includes("FREQ=WEEKLY") ? "weekly"
              : e.rrule.includes("FREQ=MONTHLY") ? "monthly"
              : e.rrule.includes("FREQ=YEARLY") ? "yearly" : undefined,
            dtstart: e.start_at,
            ...(e.rrule_until ? { until: e.rrule_until } : {}),
          };
          base.duration = msToDuration(new Date(e.end_at).getTime() - new Date(e.start_at).getTime());
        } else {
          base.start = e.start_at;
          base.end = e.end_at;
        }
        return base;
      });
  }, [allEvents, enabledTypes]);

  const toggleType = (t: CalendarEventType) => {
    setEnabledTypes((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };

  return (
    <div className="container mx-auto px-4 py-5 sm:py-8 space-y-5 max-w-5xl">
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-[22px] sm:text-3xl font-semibold tracking-tight">{isZh ? "日历" : "Calendar"}</h1>
          </div>
          <Button size="sm" className="rounded-full shrink-0" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            {isZh ? "新建事件" : "New event"}
          </Button>
        </div>
        <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed">
          {isZh ? "家庭日程、护理任务、用药与可约时间，一目了然。" : "Family schedule, care tasks, medicine & availability — all in one view."}
        </p>
        <Badge variant="secondary" className="rounded-full font-medium text-[11px]">
          {isLoading ? (isZh ? "加载中…" : "Loading…") : (isZh ? `${allEvents.length} 条 · 实时` : `${allEvents.length} event${allEvents.length === 1 ? "" : "s"} · live`)}
        </Badge>
      </header>


      {/* Type filter chips */}
      <Card className="p-4 rounded-2xl border-border/60 shadow-none">
        <div className="text-[13px] font-medium mb-3 text-foreground/90">{isZh ? "显示事件类型" : "Show event types"}</div>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TYPES.map((t) => {
            const active = enabledTypes.has(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleType(t)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12px] font-medium transition-all border ${
                  active
                    ? "bg-foreground/[0.04] border-border text-foreground"
                    : "bg-transparent border-transparent text-muted-foreground opacity-50 hover:opacity-80"
                }`}
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: EVENT_TYPE_COLORS[t] }}
                />
                {getEventTypeLabel(t, i18n.language)}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Calendar */}
      <Card className="p-2.5 sm:p-4 rounded-2xl border-border/60 shadow-none overflow-hidden
        [&_.fc]:font-sans
        [&_.fc-toolbar.fc-header-toolbar]:!flex [&_.fc-toolbar.fc-header-toolbar]:!flex-col [&_.fc-toolbar.fc-header-toolbar]:!gap-2.5 [&_.fc-toolbar.fc-header-toolbar]:!items-stretch [&_.fc-toolbar.fc-header-toolbar]:!mb-3
        sm:[&_.fc-toolbar.fc-header-toolbar]:!flex-row sm:[&_.fc-toolbar.fc-header-toolbar]:!items-center
        [&_.fc-toolbar-chunk]:!flex [&_.fc-toolbar-chunk]:!items-center [&_.fc-toolbar-chunk]:!justify-center [&_.fc-toolbar-chunk]:!gap-1
        [&_.fc-toolbar-title]:!text-base [&_.fc-toolbar-title]:!font-semibold [&_.fc-toolbar-title]:text-foreground
        sm:[&_.fc-toolbar-title]:!text-lg
        [&_.fc-button]:!bg-transparent [&_.fc-button]:!border [&_.fc-button]:!border-border [&_.fc-button]:!text-foreground [&_.fc-button]:!shadow-none [&_.fc-button]:!rounded-lg [&_.fc-button]:!font-medium [&_.fc-button]:!text-[12px] [&_.fc-button]:!px-2.5 [&_.fc-button]:!py-1.5 [&_.fc-button]:!h-auto [&_.fc-button]:!capitalize
        [&_.fc-button:hover]:!bg-muted
        [&_.fc-button-active]:!bg-primary [&_.fc-button-active]:!text-primary-foreground [&_.fc-button-active]:!border-primary
        [&_.fc-button-primary:not(:disabled).fc-button-active]:!bg-primary [&_.fc-button-primary:not(:disabled).fc-button-active]:!text-primary-foreground
        [&_.fc-button:focus]:!shadow-none [&_.fc-button:focus]:!ring-2 [&_.fc-button:focus]:!ring-ring/30
        [&_.fc-icon]:!text-[14px]
        [&_.fc-col-header-cell]:!border-border/40 [&_.fc-col-header-cell-cushion]:text-muted-foreground [&_.fc-col-header-cell-cushion]:!text-[11px] [&_.fc-col-header-cell-cushion]:!font-medium [&_.fc-col-header-cell-cushion]:!uppercase [&_.fc-col-header-cell-cushion]:!tracking-wide [&_.fc-col-header-cell-cushion]:!py-2
        [&_.fc-daygrid-day]:!border-border/40
        [&_.fc-daygrid-day-number]:text-foreground [&_.fc-daygrid-day-number]:!text-[12px] [&_.fc-daygrid-day-number]:!font-medium [&_.fc-daygrid-day-number]:!p-1.5
        [&_.fc-day-today]:!bg-primary/[0.06]
        [&_.fc-day-today_.fc-daygrid-day-number]:!text-primary [&_.fc-day-today_.fc-daygrid-day-number]:!font-semibold
        [&_.fc-scrollgrid]:!border-border/40 [&_.fc-scrollgrid_td]:!border-border/40 [&_.fc-scrollgrid_th]:!border-border/40
        [&_.fc-list-day-cushion]:!bg-muted/60
        [&_.fc-list-event:hover_td]:!bg-accent/40
        [&_.fc-event]:!rounded-md [&_.fc-event]:!border-0 [&_.fc-event]:!px-1.5 [&_.fc-event]:!text-[10px] [&_.fc-event]:!font-medium">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, rrulePlugin]}
          initialView="dayGridMonth"
          locale={isZh ? "zh-cn" : "en"}
          firstDay={isZh ? 1 : 0}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,listWeek",
          }}
          buttonText={
            isZh
              ? { today: "今天", month: "月", week: "周", day: "日", list: "列表" }
              : { today: "Today", month: "Month", week: "Week", day: "Day", list: "List" }
          }
          allDayText={isZh ? "全天" : "all-day"}
          noEventsText={isZh ? "本周没有日程" : "No events this week"}
          events={fcEvents}
          height="auto"
          nowIndicator
          dayMaxEvents={2}
          fixedWeekCount={false}
          dateClick={openCreate}
          eventClick={(info) => {
            setSelectedEvent(info.event.extendedProps as CalendarEvent);
          }}

        />
      </Card>

        {/* Event detail dialog */}
        <Dialog open={!!selectedEvent} onOpenChange={(o) => !o && setSelectedEvent(null)}>
          <DialogContent className="max-w-md">
            {selectedEvent && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: selectedEvent.color }}
                    />
                    {selectedEvent.title}
                  </DialogTitle>
                  <DialogDescription>
                    <Badge variant="secondary" className="mr-2">
                      {getEventTypeLabel(selectedEvent.event_type, i18n.language)}
                    </Badge>
                    <Badge variant="outline">{PRIORITY_LABEL[selectedEvent.priority]?.[isZh ? "zh" : "en"] ?? selectedEvent.priority}</Badge>
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  {selectedEvent.description && (
                    <p className="text-muted-foreground">{selectedEvent.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {selectedEvent.all_day
                        ? (isZh ? `${formatDate(selectedEvent.start_at)} · 全天` : `${formatDate(selectedEvent.start_at)} · All day`)
                        : `${formatDateTime(selectedEvent.start_at)} → ${formatTime(selectedEvent.end_at)}`}
                    </span>
                  </div>
                  {selectedEvent.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                  {selectedEvent.rrule && (
                    <div className="flex items-center gap-2">
                      <Repeat className="h-4 w-4 text-muted-foreground" />
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">{selectedEvent.rrule}</code>
                    </div>
                  )}
                  {selectedEvent.is_availability && selectedEvent.availability_note && (
                    <div className="flex items-start gap-2 p-3 bg-success/10 rounded-lg">
                      <Users className="h-4 w-4 text-success mt-0.5" />
                      <span className="text-success">{selectedEvent.availability_note}</span>
                    </div>
                  )}
                  {selectedEvent.meeting_url && (
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <a href={selectedEvent.meeting_url} target="_blank" rel="noreferrer">
                        {isZh ? "加入会议" : "Join meeting"}
                      </a>
                    </Button>
                  )}
                  {selectedEvent.source_cct_slug ? (
                    <p className="text-[12px] text-muted-foreground">
                      {isZh
                        ? "这条日程来自其他功能，请到对应页面修改。"
                        : "This came from another part of the app — change it there."}
                    </p>
                  ) : (
                    <div className="flex gap-2 pt-1">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(selectedEvent)}>
                        <Pencil className="h-4 w-4 mr-1.5" />
                        {isZh ? "编辑" : "Edit"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-destructive hover:text-destructive"
                        disabled={deleting}
                        onClick={() => removeEvent(selectedEvent)}
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        {deleting ? (isZh ? "删除中…" : "Deleting…") : isZh ? "删除" : "Delete"}
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
      </Dialog>

      <EventFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        event={editing}
        onSaved={refresh}
      />
    </div>
  );
}


function msToDuration(ms: number): string {
  const totalMin = Math.max(1, Math.round(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
