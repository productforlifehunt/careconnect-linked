import { useState, useMemo } from "react";
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
  EVENT_TYPE_LABELS,
  getMockEvents,
} from "@/features/calendar/types";
import { Calendar as CalendarIcon, MapPin, Users, Clock, Repeat } from "lucide-react";

const ALL_TYPES: CalendarEventType[] = [
  "personal", "family", "medicine", "task", "appointment",
  "availability", "birthday", "holiday", "booking", "check_in",
];

export default function CalendarPage() {
  const [enabledTypes, setEnabledTypes] = useState<Set<CalendarEventType>>(new Set(ALL_TYPES));
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const allEvents = useMemo(() => getMockEvents(), []);

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
    <div className="container mx-auto px-4 py-6 space-y-6">
        <header className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <CalendarIcon className="h-7 w-7 text-primary" /> Calendar
            </h1>
            <p className="text-muted-foreground mt-1">
              Family schedule, care tasks, medicine reminders & availability — all in one view.
            </p>
            <Badge variant="outline" className="mt-2">
              Mock data preview · Backend: <code className="ml-1">users_calendar</code> CCT (pending field setup)
            </Badge>
          </div>
        </header>

        {/* Type filter chips */}
        <Card className="p-4">
          <div className="text-sm font-medium mb-3">Show event types</div>
          <div className="flex flex-wrap gap-3">
            {ALL_TYPES.map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={enabledTypes.has(t)}
                  onCheckedChange={() => toggleType(t)}
                />
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: EVENT_TYPE_COLORS[t] }}
                />
                <span className="text-sm">{EVENT_TYPE_LABELS[t]}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Calendar */}
        <Card className="p-4 [&_.fc]:font-sans [&_.fc-toolbar-title]:text-foreground [&_.fc-col-header-cell-cushion]:text-foreground [&_.fc-daygrid-day-number]:text-foreground [&_.fc-list-day-cushion]:!bg-muted [&_.fc-list-event:hover_td]:!bg-accent">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, rrulePlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            buttonText={{
              today: "Today",
              month: "Month",
              week: "Week",
              day: "Day",
              list: "Agenda",
            }}
            events={fcEvents}
            height="auto"
            nowIndicator
            dayMaxEvents={3}
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
                      {EVENT_TYPE_LABELS[selectedEvent.event_type]}
                    </Badge>
                    <Badge variant="outline">{selectedEvent.priority}</Badge>
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
                        ? "All day"
                        : `${new Date(selectedEvent.start_at).toLocaleString()} → ${new Date(selectedEvent.end_at).toLocaleTimeString()}`}
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
                        Join meeting
                      </a>
                    </Button>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function msToDuration(ms: number): string {
  const totalMin = Math.max(1, Math.round(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
