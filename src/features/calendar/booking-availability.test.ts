import { describe, it, expect, vi, beforeEach } from "vitest";

const store: any[] = [];
vi.mock("./source.wordpress", () => ({
  fetchCalendarEventsForUserWordPress: vi.fn(async () => store.slice()),
  deleteCalendarEventWordPress: vi.fn(async () => true),
  inviteUserToEventWordPress: vi.fn(),
  createCalendarEventForUserWordPress: vi.fn(async (_id: string, e: any) => { const row = { id: String(store.length + 1), status: "confirmed", ...e }; created.push(row); return row; }),
}));
const created: any[] = [];

import { upsertProviderCalendarAvailability, getProviderCalendarBookingConflictMessage } from "./booking-availability";

beforeEach(() => { store.length = 0; created.length = 0; });

describe("caregiver availability in the shared calendar", () => {
  it("writes weekly hours as RFC 5545 weekly rules with BYDAY and local times", async () => {
    await upsertProviderCalendarAvailability("46", [
      { kind: "weekly", type: "", day_of_week: 1, start_time: "09:00", end_time: "12:00", is_available: true, priority: 0, bookable: "yes" },
      { kind: "weekly", type: "", day_of_week: 1, start_time: "14:00", end_time: "17:00", is_available: true, priority: 0, bookable: "yes" },
    ]);
    expect(created).toHaveLength(2);
    expect(created[0].rrule).toBe("FREQ=WEEKLY;BYDAY=MO");
    expect(created[0].start_at).toMatch(/^\d{4}-\d{2}-\d{2}T09:00:00$/);
    expect(created[0].show_as).toBe("free");
  });

  it("a day off on a date blocks that date's weekly hours", async () => {
    store.push(
      { id: "1", status: "confirmed", event_type: "availability", is_availability: true, show_as: "free", start_at: "2026-11-02 09:00:00", end_at: "2026-11-02 17:00:00", rrule: "FREQ=WEEKLY;BYDAY=MO" },
      { id: "2", status: "confirmed", event_type: "availability", is_availability: false, show_as: "busy", all_day: true, start_at: "2026-11-16 00:00:00", end_at: "2026-11-16 23:59:00" },
    );
    expect(await getProviderCalendarBookingConflictMessage("46", "2026-11-09", "10:00", 2)).toBeNull();
    expect(await getProviderCalendarBookingConflictMessage("46", "2026-11-16", "10:00", 2)).not.toBeNull();
  });
});
