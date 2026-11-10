import { describe, it, expect } from "vitest";
import { visibleThroughGroups } from "./circle-sharing";
describe("per-circle sharing", () => {
  it("hidden when paused in the only shared circle", () => expect(visibleThroughGroups(["22"], new Set(["22"]))).toBe(false));
  it("visible when another shared circle is not paused", () => expect(visibleThroughGroups(["22", "8"], new Set(["22"]))).toBe(true));
});
