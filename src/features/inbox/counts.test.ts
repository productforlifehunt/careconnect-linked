import { describe, expect, it } from "vitest";
import { inboxCounts } from "./counts";

describe("one inbox count definition", () => {
  it("four unread notifications plus one conversation equals five, not fourteen total rows", () => {
    const notifications = Array.from({ length: 13 }, (_, i) => ({ is_read: i >= 4 }));
    expect(inboxCounts(notifications, [{ unread_count: 1 }])).toEqual({
      unreadNotifications: 4, unreadMessages: 1, unread: 5, total: 14, read: 9,
    });
  });
  it("counts unread conversations, not message volume", () => {
    expect(inboxCounts([], [{ unread_count: "1" }, { unread_count: 5 }, { unread_count: 0 }, {}]).unreadMessages).toBe(2);
  });
  it("read notifications and read conversations add no unread count", () => {
    expect(inboxCounts([{ is_read: true }], [{ unread_count: 0 }])).toEqual({
      unreadNotifications: 0, unreadMessages: 0, unread: 0, total: 2, read: 2,
    });
  });
});