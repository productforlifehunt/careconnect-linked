/**
 * Calendar event types
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

export const EVENT_TYPE_LABELS_ZH: Record<CalendarEventType, string> = {
  personal: "个人",
  family: "家庭",
  medicine: "用药",
  task: "任务",
  appointment: "约诊",
  availability: "可约时间",
  birthday: "生日",
  holiday: "假期",
  booking: "预约",
  check_in: "签到",
};

export function getEventTypeLabel(type: CalendarEventType, lang?: string): string {
  return (lang?.startsWith("zh") ? EVENT_TYPE_LABELS_ZH : EVENT_TYPE_LABELS)[type] || type;
}
