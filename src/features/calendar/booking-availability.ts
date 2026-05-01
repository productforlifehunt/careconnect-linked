import { RRule } from "rrule";

import {
  createCalendarEventForUserWordPress,
  deleteCalendarEventWordPress,
  fetchCalendarEventsForUserWordPress,
  inviteUserToEventWordPress,
} from "./source.wordpress";
import { EVENT_TYPE_COLORS, type CalendarEvent } from "./types";

type AvailabilitySlot = {
  kind: "weekly" | "date";
  type: string;
  day_of_week?: number;
  specific_date?: string;
  start_time?: string | null;
  end_time?: string | null;
  is_available: boolean;
  priority: number;
  bookable: string;
  from?: string;
  to?: string;
};

function normalizeWPUserId(id: string | number | null | undefined): string {
  return String(id ?? "").replace(/^wp-/, "");
}

function toDate(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function toTime(value: Date) {
  return `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
}

function rangesOverlap(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && startB < endA;
}

function isBlockingEvent(event: CalendarEvent) {
  if (event.status === "cancelled") return false;
  if (event.is_availability) return false;
  return event.show_as !== "free";
}

function expandEventRanges(event: CalendarEvent, windowStart: Date, windowEnd: Date) {
  const eventStart = new Date(event.start_at);
  const eventEnd = new Date(event.end_at || event.start_at);
  if (Number.isNaN(eventStart.getTime()) || Number.isNaN(eventEnd.getTime())) return [];

  if (!event.rrule) return [{ start: eventStart, end: eventEnd }];

  try {
    const duration = Math.max(1, eventEnd.getTime() - eventStart.getTime());
    const options = RRule.parseString(event.rrule);
    const until = event.rrule_until ? new Date(event.rrule_until) : undefined;
    const rule = new RRule({
      ...options,
      dtstart: eventStart,
      ...(until && !Number.isNaN(until.getTime()) ? { until } : {}),
    });
    return rule.between(windowStart, windowEnd, true).map((start) => ({ start, end: new Date(start.getTime() + duration) }));
  } catch {
    return [{ start: eventStart, end: eventEnd }];
  }
}

function isAvailabilityManagedEvent(event: CalendarEvent) {
  return event.is_availability || event.event_type === "availability";
}

function calendarEventsToAvailability(events: CalendarEvent[]): AvailabilitySlot[] {
  return events
    .filter((event) => event.status !== "cancelled" && isAvailabilityManagedEvent(event))
    .map((event) => ({
      kind: event.rrule?.includes("FREQ=WEEKLY") ? "weekly" as const : "date" as const,
      type: "calendar-event",
      day_of_week: event.rrule?.includes("FREQ=WEEKLY") ? new Date(event.start_at).getDay() : undefined,
      specific_date: event.start_at.slice(0, 10),
      start_time: toTime(new Date(event.start_at)),
      end_time: toTime(new Date(event.end_at || event.start_at)),
      is_available: event.is_availability || event.show_as === "free",
      priority: 10,
      bookable: event.is_availability || event.show_as === "free" ? "yes" : "no",
      from: event.start_at,
      to: event.end_at,
    }));
}

function availabilityRangesForDate(events: CalendarEvent[], date: string) {
  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59`);
  return events
    .filter((event) => event.status !== "cancelled" && isAvailabilityManagedEvent(event))
    .flatMap((event) => expandEventRanges(event, dayStart, dayEnd).map((range) => ({
      start: range.start,
      end: range.end,
      is_available: event.is_availability || event.show_as === "free",
    })));
}

export async function getProviderCalendarAvailability(providerId: string): Promise<AvailabilitySlot[]> {
  const events = await fetchCalendarEventsForUserWordPress(providerId);
  return calendarEventsToAvailability(events);
}

export async function getProviderCalendarBookingConflictMessage(
  providerId: string,
  date: string,
  time: string,
  durationHours = 0,
) {
  if (!providerId || !date || !time || !durationHours) return null;
  const requestedStart = toDate(date, time);
  const requestedEnd = addHours(requestedStart, durationHours);
  const events = await fetchCalendarEventsForUserWordPress(providerId);
  const availabilityRanges = availabilityRangesForDate(events, date).filter((slot) => slot.is_available);

  if (availabilityRanges.length === 0) return "Caregiver has no available calendar slot for this time.";

  const insideAvailability = availabilityRanges.some((slot) => {
    return requestedStart >= slot.start && requestedEnd <= slot.end;
  });
  if (!insideAvailability) {
    const ranges = availabilityRanges.map((slot) => `${toTime(slot.start)}–${toTime(slot.end)}`).join(", ");
    return ranges ? `Caregiver is available: ${ranges}` : "Caregiver is not available at this time.";
  }

  const windowStart = new Date(requestedStart.getTime() - 24 * 60 * 60 * 1000);
  const windowEnd = new Date(requestedEnd.getTime() + 24 * 60 * 60 * 1000);
  const conflict = events
    .filter(isBlockingEvent)
    .flatMap((event) => expandEventRanges(event, windowStart, windowEnd))
    .find((range) => rangesOverlap(requestedStart, requestedEnd, range.start, range.end));

  if (!conflict) return null;
  return `Caregiver already has a calendar event from ${toTime(conflict.start)} to ${toTime(conflict.end)}.`;
}

export async function createBookingCalendarEvent(params: {
  providerId: string;
  clientId: string;
  appointmentDate: string;
  appointmentTime: string;
  durationHours: number;
  serviceType?: string;
  orderId?: string | number;
  note?: string | null;
}) {
  const providerId = normalizeWPUserId(params.providerId);
  const clientId = normalizeWPUserId(params.clientId);
  const start = toDate(params.appointmentDate, params.appointmentTime);
  const end = addHours(start, params.durationHours);
  const created = await createCalendarEventForUserWordPress(providerId, {
    title: params.serviceType ? `Booking — ${params.serviceType}` : "Care booking",
    description: params.note || "",
    start_at: start.toISOString(),
    end_at: end.toISOString(),
    all_day: false,
    status: "confirmed",
    priority: "high",
    color: EVENT_TYPE_COLORS.booking,
    event_type: "booking",
    show_as: "busy",
    visibility: "private",
    is_availability: false,
    source_cct_slug: "shop_order",
    source_item_id: params.orderId ? String(params.orderId) : undefined,
  });

  if (created?.id && clientId) {
    await inviteUserToEventWordPress(created.id, clientId).catch(() => undefined);
  }
  return created;
}