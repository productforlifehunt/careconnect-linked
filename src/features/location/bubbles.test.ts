import { describe, expect, it, vi } from "vitest";

vi.mock("@/services/wp-auth", () => ({ getStoredWPUser: () => ({ user_id: 52 }) }));

import { bubbleHiding, maskWithBubble, groupAllowsBubbles, BUBBLE_MAX_HOURS, BUBBLE_MAX_RADIUS_M, type LocationBubble } from "./bubbles";

const bubble: LocationBubble = { id: "1", groupId: "9", creatorId: "7", latitude: 39.9, longitude: 116.4, radiusMeters: 1609, startsAt: "2026-11-11T00:00:00Z", endsAt: "2026-11-11T06:00:00Z" };

describe("location bubbles", () => {
  it("hides another member who created a bubble", () => {
    expect(bubbleHiding([bubble], "wp-7")).toBe(bubble);
  });
  it("never hides me from myself", () => {
    expect(bubbleHiding([{ ...bubble, creatorId: "52" }], 52)).toBeNull();
  });
  it("shows only the bubble area: no exact spot, address or movement", () => {
    const row = maskWithBubble({ latitude: 1, longitude: 2, address_text: "Home", speed: 3, moving_type: "walking", battery_level: 80 }, bubble);
    expect(row).toMatchObject({ latitude: 39.9, longitude: 116.4, address_text: null, speed: null, moving_type: null, battery_level: 80 });
  });
  it("Bubbles are on for a group unless an admin turned them off", () => {
    expect(groupAllowsBubbles({})).toBe(true);
    expect(groupAllowsBubbles({ bubbles_allowed: false })).toBe(false);
  });
  it("matches Life360 limits: up to 25 miles and 6 hours", () => {
    expect(BUBBLE_MAX_RADIUS_M).toBe(40_234);
    expect(BUBBLE_MAX_HOURS).toBe(6);
  });
});
