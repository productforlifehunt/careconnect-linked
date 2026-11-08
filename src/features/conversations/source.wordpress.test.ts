import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  wordpressFetch: vi.fn(),
  wordpressCCTFetch: vi.fn(),
  readLinkedCCTRows: vi.fn(),
  fetchWPUserPublicProfile: vi.fn(),
}));

vi.mock("@/features/shared/cct-rows", () => ({
  readLinkedCCTRows: mocks.readLinkedCCTRows,
}));

vi.mock("@/features/shared/wordpress-client", () => ({
  wordpressFetch: mocks.wordpressFetch,
  wordpressCCTFetch: mocks.wordpressCCTFetch,
}));

vi.mock("@/features/shared/rel-batch", () => ({
  dedupeRead: (_key: string, load: () => Promise<unknown>) => load(),
  fetchRelChildrenMap: vi.fn(),
  fetchRelChildrenOf: async (relationId: number, parentId: number | string) => {
    const rows = await mocks.wordpressFetch(
      `jet-rel/${relationId}/children/${parentId}`,
    );
    return Array.isArray(rows)
      ? rows.map((row) => ({
          childId: String(row.child_object_id),
          meta: null,
        }))
      : [];
  },
}));

vi.mock("@/features/shared/wp-users", () => ({
  fetchWPUserPublicProfile: mocks.fetchWPUserPublicProfile,
}));

vi.mock("@/features/shared/app-scope", () => ({
  appScopeBody: () => ({}),
  appScopeParams: () => ({}),
  filterAppScope: (_scope: string, rows: unknown[]) => rows,
}));

vi.mock("@/services/wp-auth", () => ({ getStoredWPUser: () => null }));

import { fetchConversationsWordPress } from "./source.wordpress";
import { R, T } from "@/integrations/wp-schema";

describe("fetchConversationsWordPress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads an authorized participant profile while the latest message read is pending", async () => {
    let finishMessageRead!: (rows: unknown[]) => void;
    const pendingMessages = new Promise<unknown[]>((resolve) => {
      finishMessageRead = resolve;
    });

    mocks.wordpressFetch.mockImplementation(async (path: string) => {
      if (path === `jet-rel/${R.conversationMembers}/parents/70`) {
        return [{ parent_object_id: "1" }];
      }
      if (path === `jet-rel/${R.conversationMembers}/children/1`) {
        return [{ child_object_id: "70" }, { child_object_id: "80" }];
      }
      if (path === `jet-rel/${R.conversationMessages}/children/1`) {
        return [{ child_object_id: "42" }];
      }
      return [];
    });

    mocks.readLinkedCCTRows.mockImplementation((slug: string) => {
      if (slug === T.chatConversation.slug) {
        return Promise.resolve([
          {
            id: "1",
            [T.chatConversation.f.CHAT_TYPE]:
              T.chatConversation.opt.CHAT_TYPE.ONE_TO_ONE,
          },
        ]);
      }
      return pendingMessages;
    });

    mocks.fetchWPUserPublicProfile.mockResolvedValue({
      full_name: "Care partner",
      avatar_url: null,
    });

    const result = fetchConversationsWordPress("wp-70");

    await vi.waitFor(() => {
      expect(mocks.fetchWPUserPublicProfile).toHaveBeenCalledWith(80);
    });
    expect(mocks.readLinkedCCTRows).toHaveBeenCalledWith(T.chatMessage.slug, [
      "42",
    ]);

    finishMessageRead([
      {
        id: "42",
        cct_author_id: 80,
        created_at: "2026-11-08 04:00:00",
        [T.chatMessage.f.CHAT_MESSAGE_CONTENT]: "I am on my way.",
        [T.chatMessage.f.CHAT_MESSAGE_TYPE]:
          T.chatMessage.opt.CHAT_MESSAGE_TYPE.TEXT,
      },
    ]);

    const conversations = await result;
    expect(conversations[0]?.other_user_name).toBe("Care partner");
    expect(conversations[0]?.last_message?.message_content).toBe(
      "I am on my way.",
    );
  });
});
