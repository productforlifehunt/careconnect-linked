import { beforeEach, describe, expect, it } from "vitest";
import { setReadMark, unreadFlag } from "./read-state";

beforeEach(() => localStorage.clear());
describe("account-scoped conversation read flags", () => {
  const last = { sender_id: "wp-9", created_at: "2026-10-27T05:00:00Z" };
  it("one account opening a chat does not mark it read for another", () => {
    setReadMark("7", "2026-10-27T06:00:00Z", "wp-1");
    expect(unreadFlag("7", last, "wp-1")).toBe(0);
    expect(unreadFlag("7", last, "wp-2")).toBe(1);
  });
  it("compares actual dates rather than differently formatted date strings", () => {
    setReadMark("7", "2026-10-27T04:59:00Z", "wp-1");
    expect(unreadFlag("7", { ...last, created_at: "2026-10-27 05:00:00" }, "wp-1")).toBe(1);
  });
  it("messages sent by me never increase my unread flag", () => {
    expect(unreadFlag("7", last, "9")).toBe(0);
  });
});