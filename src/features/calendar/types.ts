/**
 * Calendar event types & mock data
 * Aligns 1:1 with `users_calendar` CCT spec (docs/users-calendar-cct-spec.md)
 */

export type CalendarEventType =
  | "personal"
  | "family"
  | "medicine"
  | "task"
  | "appointment"
  | "availability"
  | "birthday"
  | "holiday"
  | "booking"
  | "check_in";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start_at: string; // ISO
  end_at: string;   // ISO
  all_day: boolean;
  timezone?: string;
  status: "tentative" | "confirmed" | "cancelled";
  priority: "low" | "normal" | "high" | "urgent";
  color: string;
  rrule?: string;
  rrule_until?: string;
  exdates?: string;
  event_type: CalendarEventType;
  show_as: "busy" | "free" | "tentative" | "oof";
  visibility: "default" | "public" | "private" | "confidential";
  reminders?: { minutes: number; method: "push" | "email" | "sms" }[];
  is_availability: boolean;
  availability_note?: string;
  source_cct_slug?: string;
  source_item_id?: string;
  meeting_url?: string;
  // Relations (resolved client-side via JetEngine)
  user_ids?: string[];
  care_group_id?: string;
  cared_one_id?: string;
}

/** Color palette per event_type — semantic, no hard-coded UI colors */
export const EVENT_TYPE_COLORS: Record<CalendarEventType, string> = {
  personal: "hsl(258 90% 66%)",       // primary purple
  family: "hsl(330 81% 60%)",         // pink
  medicine: "hsl(0 72% 51%)",         // red
  task: "hsl(217 91% 60%)",           // blue
  appointment: "hsl(173 80% 40%)",    // teal
  availability: "hsl(142 71% 45%)",   // green
  birthday: "hsl(45 93% 47%)",        // amber
  holiday: "hsl(280 65% 60%)",        // violet
  booking: "hsl(199 89% 48%)",        // sky
  check_in: "hsl(20 90% 55%)",        // orange
};

export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  personal: "Personal",
  family: "Family",
  medicine: "Medicine",
  task: "Task",
  appointment: "Appointment",
  availability: "Availability",
  birthday: "Birthday",
  holiday: "Holiday",
  booking: "Booking",
  check_in: "Check-in",
};

/** Mock data covering all event types + recurring + availability + multi-day */
export function getMockEvents(): CalendarEvent[] {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();
  const iso = (yy: number, mm: number, dd: number, hh = 9, mi = 0) =>
    new Date(yy, mm, dd, hh, mi).toISOString();

  return [
    {
      id: "evt-1",
      title: "Mom — Donepezil 5mg",
      description: "Aricept 5mg with breakfast",
      start_at: iso(y, m, d, 8, 0),
      end_at: iso(y, m, d, 8, 15),
      all_day: false,
      status: "confirmed",
      priority: "high",
      color: EVENT_TYPE_COLORS.medicine,
      event_type: "medicine",
      show_as: "busy",
      visibility: "private",
      is_availability: false,
      rrule: "FREQ=DAILY",
      source_cct_slug: "medicine",
      source_item_id: "12",
      cared_one_id: "co-1",
    },
    {
      id: "evt-2",
      title: "Doctor: Dr. Wang neurology",
      description: "Bring MRI scans + medication list",
      location: "Sunshine Medical Center, Rm 305",
      start_at: iso(y, m, d, 14, 30),
      end_at: iso(y, m, d, 15, 30),
      all_day: false,
      status: "confirmed",
      priority: "urgent",
      color: EVENT_TYPE_COLORS.appointment,
      event_type: "appointment",
      show_as: "busy",
      visibility: "default",
      is_availability: false,
      meeting_url: "https://meet.google.com/abc-defg-hij",
    },
    {
      id: "evt-3",
      title: "Family video call (weekly)",
      start_at: iso(y, m, d + 1, 19, 0),
      end_at: iso(y, m, d + 1, 20, 0),
      all_day: false,
      status: "confirmed",
      priority: "normal",
      color: EVENT_TYPE_COLORS.family,
      event_type: "family",
      show_as: "busy",
      visibility: "default",
      is_availability: false,
      rrule: "FREQ=WEEKLY;BYDAY=SA",
      care_group_id: "cg-1",
    },
    {
      id: "evt-4",
      title: "Free tonight 7-10pm — neighbour care swap",
      availability_note: "Available to sit with mom so you can rest",
      start_at: iso(y, m, d + 2, 19, 0),
      end_at: iso(y, m, d + 2, 22, 0),
      all_day: false,
      status: "confirmed",
      priority: "normal",
      color: EVENT_TYPE_COLORS.availability,
      event_type: "availability",
      show_as: "free",
      visibility: "public",
      is_availability: true,
      care_group_id: "cg-1",
    },
    {
      id: "evt-5",
      title: "Pick up prescription refill",
      start_at: iso(y, m, d + 3, 10, 0),
      end_at: iso(y, m, d + 3, 11, 0),
      all_day: false,
      status: "confirmed",
      priority: "high",
      color: EVENT_TYPE_COLORS.task,
      event_type: "task",
      show_as: "busy",
      visibility: "default",
      is_availability: false,
      source_cct_slug: "care_task_real",
      source_item_id: "44",
    },
    {
      id: "evt-6",
      title: "Mom's 78th birthday 🎂",
      start_at: iso(y, m, d + 5, 0, 0),
      end_at: iso(y, m, d + 5, 23, 59),
      all_day: true,
      status: "confirmed",
      priority: "high",
      color: EVENT_TYPE_COLORS.birthday,
      event_type: "birthday",
      show_as: "free",
      visibility: "default",
      is_availability: false,
      rrule: "FREQ=YEARLY",
      cared_one_id: "co-1",
    },
    {
      id: "evt-7",
      title: "Caregiver booking — Sarah K.",
      start_at: iso(y, m, d + 4, 9, 0),
      end_at: iso(y, m, d + 4, 13, 0),
      all_day: false,
      status: "confirmed",
      priority: "high",
      color: EVENT_TYPE_COLORS.booking,
      event_type: "booking",
      show_as: "busy",
      visibility: "default",
      is_availability: false,
      source_cct_slug: "shop_order",
      source_item_id: "1234",
    },
    {
      id: "evt-8",
      title: "Daily check-in call",
      start_at: iso(y, m, d, 18, 0),
      end_at: iso(y, m, d, 18, 15),
      all_day: false,
      status: "confirmed",
      priority: "normal",
      color: EVENT_TYPE_COLORS.check_in,
      event_type: "check_in",
      show_as: "free",
      visibility: "private",
      is_availability: false,
      rrule: "FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR,SA,SU",
      source_cct_slug: "check_in",
      source_item_id: "7",
    },
  ];
}
