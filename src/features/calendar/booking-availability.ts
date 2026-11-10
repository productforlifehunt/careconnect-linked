import { RRule } from "rrule";

import {
  createCalendarEventForUserWordPress,
  deleteCalendarEventWordPress,
  fetchCalendarEventsForUserWordPress,
  inviteUserToEventWordPress,
} from "./source.wordpress";
import { EVENT_TYPE_COLORS, type CalendarEvent } from "./types";

export type AvailabilitySlot = {
  kind: "weekly" | "date";
  type: string;
  day_of_week?: number | undefined;
  specific_date?: string | undefined;
  start_time?: string | null | undefined;
  end_time?: string | null | undefined;
  is_available: boolean;
  priority: number;
  bookable: string;
  from?: string | undefined;
  to?: string | undefined;
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
  if (isAvailabilityManagedEvent(event)) return false;
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
    const skipped = new Set(String(event.exdates || "").split(/[,\n]/).map((d) => d.trim().slice(0, 10).replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")).filter(Boolean));
    return rule.between(windowStart, windowEnd, true)
      .filter((start) => !skipped.has(localDay(start)))
      .map((start) => ({ start, end: new Date(start.getTime() + duration) }));
  } catch {
    return [{ start: eventStart, end: eventEnd }];
  }
}

function isAvailabilityManagedEvent(event: CalendarEvent) {
  return event.is_availability || event.event_type === "availability";
}

const BYDAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

function localDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Weekdays an RFC 5545 weekly rule repeats on (BYDAY, else DTSTART's weekday). */
function weeklyDays(event: CalendarEvent): number[] {
  const byday = /BYDAY=([^;]+)/.exec(event.rrule || "")?.[1];
  if (!byday) return [new Date(event.start_at).getDay()];
  return byday.split(",").map((d) => BYDAY.indexOf(d.slice(-2))).filter((d) => d >= 0);
}

function calendarEventsToAvailability(events: CalendarEvent[]): AvailabilitySlot[] {
  return events
    .filter((event) => event.status !== "cancelled" && isAvailabilityManagedEvent(event))
    .flatMap((event): AvailabilitySlot[] => {
      const available = event.is_availability || event.show_as === "free";
      const start = new Date(event.start_at);
      const end = new Date(event.end_at || event.start_at);
      const base = {
        type: "calendar-event",
        start_time: event.all_day ? null : toTime(start),
        end_time: event.all_day ? null : toTime(end),
        is_available: available,
        priority: 10,
        bookable: available ? "yes" : "no",
        from: event.start_at,
        to: event.end_at,
      };
      if (event.rrule?.includes("FREQ=WEEKLY")) {
        return weeklyDays(event).map((day) => ({ ...base, kind: "weekly" as const, day_of_week: day }));
      }
      return [{ ...base, kind: "date" as const, specific_date: localDay(start) }];
    });
}

/** A date with its own availability rows replaces the weekly hours that day. */
function availabilityRangesForDate(events: CalendarEvent[], date: string) {
  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59`);
  const managed = events.filter((event) => event.status !== "cancelled" && isAvailabilityManagedEvent(event));
  const dated = managed.filter((event) => !event.rrule && localDay(new Date(event.start_at)) === date);
  const source = dated.length > 0 ? dated : managed.filter((event) => Boolean(event.rrule));
  return source
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

/** Writes availability as ordinary CCT 187 calendar rows: local `YYYY-MM-DD HH:mm:ss`
 * times, RFC 5545 weekly RRULE with BYDAY, free/busy show-as, and the timezone. */
export async function upsertProviderCalendarAvailability(providerIdInput: string, slots: AvailabilitySlot[]) {
  const providerId = normalizeWPUserId(providerIdInput);
  if (!providerId) throw new Error("Provider user id is required");

  const existing = await fetchCalendarEventsForUserWordPress(providerId);
  await Promise.all(
    existing
      .filter(isAvailabilityManagedEvent)
      .map((event) => deleteCalendarEventWordPress(event.id).catch(() => undefined)),
  );

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = new Date();
  const written = (slots || []).filter((slot) => slot.specific_date || slot.is_available);

  const created = await Promise.all(
    written.map((slot) => {
      const isAvailable = Boolean(slot.is_available);
      const date = slot.specific_date || (() => {
        const d = new Date(today);
        d.setDate(today.getDate() + ((Number(slot.day_of_week || 0) - today.getDay() + 7) % 7));
        return localDay(d);
      })();
      const allDay = !isAvailable;
      const startTime = allDay ? "00:00" : slot.start_time || "09:00";
      const endTime = allDay ? "23:59" : slot.end_time || "17:00";
      return createCalendarEventForUserWordPress(providerId, {
        title: isAvailable ? "Available" : "Unavailable",
        start_at: `${date}T${startTime}:00`,
        end_at: `${date}T${endTime}:00`,
        all_day: allDay,
        timezone,
        status: "confirmed",
        priority: "normal",
        color: EVENT_TYPE_COLORS.availability,
        event_type: "availability",
        show_as: isAvailable ? "free" : "busy",
        visibility: "public",
        is_availability: isAvailable,
        availability_note: isAvailable ? "Available for care booking" : "Unavailable",
        rrule: slot.specific_date ? undefined : `FREQ=WEEKLY;BYDAY=${BYDAY[Number(slot.day_of_week || 0)]}`,
      });
    }),
  );

  return created.filter(Boolean);
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
  serviceType?: string | undefined;
  orderId?: string | number | undefined;
  note?: string | null | undefined;
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
/**
 * Pure check of a requested slot against the caregiver's weekly / date-specific
 * availability derived from CCT 187. No WooCommerce involved.
 */
export function getAvailabilityConflictMessage(
  availability: AvailabilitySlot[] = [],
  date: string,
  time: string,
  durationHours = 0,
): string | null {
  if (!date || !time || !availability || availability.length === 0) return null;

  const toMinutes = (v: string) => {
    const [h, m] = String(v).split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const dayOfWeek = new Date(`${date}T12:00:00`).getDay();
  const specificSlots = availability.filter((slot) => slot.specific_date === date);

  const evaluateDuration = (slot: AvailabilitySlot) => {
    if (!durationHours || !slot.end_time) return null;
    const endMinutes = toMinutes(time) + durationHours * 60;
    if (endMinutes > toMinutes(slot.end_time)) {
      return `Session would end at ${Math.floor(endMinutes / 60)}:${String(endMinutes % 60).padStart(2, "0")} but the caregiver is available until ${slot.end_time}.`;
    }
    return null;
  };

  const evaluate = (slots: AvailabilitySlot[], emptyMessage: string) => {
    const blocked = slots.some((slot) => !slot.is_available && !slot.start_time && !slot.end_time);
    if (blocked) return "Caregiver is not available on this date.";
    const match = slots.find(
      (slot) => slot.is_available && slot.start_time && slot.end_time && time >= slot.start_time && time < slot.end_time,
    );
    if (match) return evaluateDuration(match);
    const ranges = slots
      .filter((slot) => slot.is_available && slot.start_time && slot.end_time)
      .map((slot) => `${slot.start_time}–${slot.end_time}`)
      .join(", ");
    return ranges ? `Caregiver is available ${ranges}.` : emptyMessage;
  };

  if (specificSlots.length > 0) return evaluate(specificSlots, "Caregiver is not available on this date.");

  const weeklySlots = availability.filter((slot) => slot.day_of_week === dayOfWeek);
  if (weeklySlots.length === 0) return "Caregiver has no availability set for this day.";
  return evaluate(weeklySlots, "Caregiver is not available on this day.");
}
