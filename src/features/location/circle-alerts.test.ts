import { describe, it, expect } from "vitest";
import { shouldAlertLowBattery } from "./circle-alerts";
describe("low battery alert", () => {
  it("alerts at 10% when not charging", () => expect(shouldAlertLowBattery(10, false, false)).toBe(true));
  it("no alert at 11%", () => expect(shouldAlertLowBattery(11, false, false)).toBe(false));
  it("no alert while charging", () => expect(shouldAlertLowBattery(5, true, false)).toBe(false));
  it("only once per drop", () => expect(shouldAlertLowBattery(5, false, true)).toBe(false));
});
