import { describe, it, expect } from "vitest";
import { buildRRule, slotsFromRRule, frequencyFromRow, occurrencesOn, frequencyForSlots, normalizeSlots } from "./recurrence";

describe("CCT187 recurrence (a57/a66/a68/a69)", () => {
  it("twice daily 08:00 + 12:00 is stored and read back as two times", () => {
    const rule = buildRRule("twice_daily", ["08:00", "12:00", "12:00"]);
    expect(rule).toBe("FREQ=DAILY;INTERVAL=1;BYHOUR=8,12;BYMINUTE=0");
    expect(slotsFromRRule(rule, "2026-10-27 08:00:00")).toEqual(["08:00", "12:00"]);
    expect(frequencyFromRow(rule, false, ["08:00", "12:00"])).toBe("twice_daily");
  });

  it("different minutes use BYSETPOS so no extra times appear", () => {
    const rule = buildRRule("twice_daily", ["08:00", "12:30"]);
    expect(rule).toBe("FREQ=DAILY;INTERVAL=1;BYHOUR=8,12;BYMINUTE=0,30;BYSETPOS=1,4");
    expect(slotsFromRRule(rule, "2026-10-27 08:00:00")).toEqual(["08:00", "12:30"]);
  });

  it("end date is UNTIL, not a58", () => {
    const rule = buildRRule("once_daily", ["08:00"], "2026-11-30");
    expect(rule).toContain("UNTIL=20261130T235959");
    expect(occurrencesOn("2026-12-01", { startAt: "2026-10-27 08:00:00", rrule: rule })).toEqual([]);
  });

  it("every other day only occurs on alternate days", () => {
    const row = { startAt: "2026-10-27 08:00:00", rrule: buildRRule("every_other_day", ["08:00"]) };
    expect(occurrencesOn("2026-10-28", row)).toEqual([]);
    expect(occurrencesOn("2026-10-29", row)).toEqual(["08:00"]);
  });

  it("EXDATES remove and RDATES add occurrences", () => {
    const row = { startAt: "2026-10-27 08:00:00", rrule: buildRRule("twice_daily", ["08:00", "12:00"]),
      exdates: "20261028T080000", rdates: "20261028T200000" };
    expect(occurrencesOn("2026-10-28", row)).toEqual(["12:00", "20:00"]);
  });

  it("daily frequency follows the number of distinct times", () => {
    expect(frequencyForSlots("twice_daily", normalizeSlots(["08:00", "12:00", "18:00"]))).toBe("three_daily");
  });
});
