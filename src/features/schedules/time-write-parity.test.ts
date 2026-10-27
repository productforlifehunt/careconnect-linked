import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ cct: vi.fn(), fetch: vi.fn() }));
vi.mock("@/features/shared/wordpress-client", () => ({ wordpressCCTFetch: m.cct, wordpressFetch: m.fetch }));
vi.mock("@/features/shared/rel-batch", () => ({ dedupeRead: (_key: string, fn: () => unknown) => fn(), fetchRelChildrenMap: vi.fn() }));
vi.mock("@/services/wp-auth", () => ({ getStoredWPUser: vi.fn() }));
vi.mock("@/features/shared/wp-users", () => ({ fetchWPUser: vi.fn(), fetchWPUserProfile: vi.fn() }));

import { createMedicineWordPress, updateMedicineWordPress } from "@/features/medicine/source.medicine";
import { createCheckinWordPress, updateCheckinWordPress } from "@/features/cared-ones/source.wordpress-extended";
import { T } from "@/integrations/wp-schema";

const input = { user_id: "54", name: "Parity test", start_date: "2026-10-27", frequency: "twice_daily", time_slot: ["12:30", "08:00"], end_date: "2026-11-30" };
const expected = {
  a57: "2026-10-27 08:00:00", a58: "2026-10-27 08:00:00",
  a66: "FREQ=DAILY;INTERVAL=1;BYHOUR=8,12;BYMINUTE=0,30;BYSETPOS=1,4;UNTIL=20261130T235959",
};
function writes(method: string): Record<string, unknown>[] {
  return m.cct.mock.calls.filter(([, options]) => options?.method === method).map(([, options]) => options.body);
}

describe("medicine and check-in share CCT187 time writes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    m.fetch.mockResolvedValue([]);
    m.cct.mockImplementation(async (_slug, options) => options?.method === "POST" ? { item_id: 999 } : {
      _ID: 999, ...expected, a68: "20261028T080000", a69: "20261028T200000", a95: "b56",
    });
  });
  it("both creates write identical a57/a58/a66 into CCT187 with different event types", async () => {
    await createMedicineWordPress(input);
    await createCheckinWordPress(input);
    const bodies = writes("POST");
    expect(bodies).toHaveLength(2);
    for (const body of bodies) expect(body).toMatchObject(expected);
    expect(bodies.map((body) => body.a60)).toEqual(["b55", "b56"]);
    expect(m.cct.mock.calls.every(([slug]) => slug === T.calendarEvent.slug)).toBe(true);
  });
  it("both time edits preserve UNTIL and do not overwrite a68/a69 or write a90/a70", async () => {
    const updates = { time_slot: ["09:00", "13:30"] };
    await updateMedicineWordPress("999", updates);
    await updateCheckinWordPress("999", updates);
    const bodies = writes("PUT");
    expect(bodies).toHaveLength(2);
    for (const body of bodies) {
      expect(body).toMatchObject({ a57: "2026-10-27 09:00:00", a58: "2026-10-27 09:00:00", a66: "FREQ=DAILY;INTERVAL=1;BYHOUR=9,13;BYMINUTE=0,30;BYSETPOS=1,4;UNTIL=20261130T235959" });
      for (const field of ["a68", "a69", "a70", "a90"]) expect(body).not.toHaveProperty(field);
    }
  });
  it("both end-date-only edits encode the same new cutoff in a66 rather than a58", async () => {
    await updateMedicineWordPress("999", { end_date: "2026-12-15" });
    await updateCheckinWordPress("999", { end_date: "2026-12-15" });
    const bodies = writes("PUT");
    expect(bodies).toHaveLength(2);
    for (const body of bodies) {
      expect(body.a58).toBe("2026-10-27 08:00:00");
      expect(body.a66).toBe(expected.a66.replace("20261130", "20261215"));
    }
  });
  it("neither create stores a90 or an ordinary-plan recurrence ID", async () => {
    await createMedicineWordPress(input);
    await createCheckinWordPress(input);
    const bodies = writes("POST");
    expect(bodies).toHaveLength(2);
    for (const body of bodies) {
      expect(body).not.toHaveProperty("a90");
      expect(body).not.toHaveProperty("a70");
    }
  });
});