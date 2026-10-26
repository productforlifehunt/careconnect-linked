import { describe, it, expect } from "vitest";
import { findDoseLog, slotOfDatetime, todayAtSlot } from "./dose-slot";

describe("dose slot", () => {
  const logs = [{ medicine_id: "7", scheduled_date: "2026-10-27 08:00:00", status: "taken" }];

  it("logging 08:00 does not mark 12:00 as done", () => {
    expect(findDoseLog(logs, "7", "08:00")?.status).toBe("taken");
    expect(findDoseLog(logs, "7", "12:00")).toBeUndefined();
  });

  it("writes the slot into the scheduled date", () => {
    expect(todayAtSlot("12:00", new Date(2026, 9, 27, 5, 10))).toBe("2026-10-27 12:00:00");
    expect(slotOfDatetime("2026-10-27 12:00:00")).toBe("12:00");
  });
});
