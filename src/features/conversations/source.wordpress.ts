import { wordpressCCTFetch } from "@/features/shared/wordpress-client";

// CCT slugs: chat_conversation, chat_message | flat fields
export async function fetchConversationsWordPress(): Promise<any[]> {
  try {
    const convos = await wordpressCCTFetch("chat_conversation", { params: { _limit: 50 } });
    if (!Array.isArray(convos)) return [];
    return convos.map((c: any) => ({
      id: c.id,
      title: c.title || null,
      type: c.type || "direct",
      participant_ids: c.participant_ids || null,
      last_message: c.last_message || null,
      last_message_at: c.last_message_at || c.updated_at || c.created_at,
      created_at: c.created_at,
    }));
  } catch {
    return [];
  }
}

export async function fetchDirectMessagesWordPress(conversationId: string): Promise<any[]> {
  try {
    const msgs = await wordpressCCTFetch("chat_message", {
      params: { conversation_id: conversationId, _limit: 100 },
    });
    if (!Array.isArray(msgs)) return [];
    return msgs.map((m: any) => ({
      id: m.id,
      conversation_id: m.conversation_id || conversationId,
      sender_id: m.sender_id || null,
      content: m.content || "",
      created_at: m.created_at,
    }));
  } catch {
    return [];
  }
}

export async function sendMessageWordPress(conversationId: string, content: string): Promise<void> {
  await wordpressCCTFetch("chat_message", {
    method: "POST",
    body: { conversation_id: conversationId, content },
  });
}

export async function markMessagesReadWordPress(conversationId: string): Promise<void> {
  try {
    // Find the chat_member record for this conversation + current user
    const members = await wordpressCCTFetch<any[]>("chat_member", {
      params: { conversation_id: conversationId, _limit: 50 },
    });
    if (!Array.isArray(members) || members.length === 0) return;

    // Get the latest message ID in this conversation
    const messages = await wordpressCCTFetch<any[]>("chat_message", {
      params: { conversation_id: conversationId, _limit: 1, _order: "DESC" },
    });
    const lastMsgId = Array.isArray(messages) && messages.length > 0
      ? String(messages[0]._ID || messages[0].id)
      : null;
    if (!lastMsgId) return;

    // Update all member records for this conversation (server filters by auth user)
    await Promise.all(
      members.map((m: any) =>
        wordpressCCTFetch("chat_member", {
          id: m.id || m._ID,
          method: "PUT",
          body: { last_read_message_id: lastMsgId },
        })
      )
    );
  } catch {
    // Silently fail — unread tracking is non-critical
  }
}

export async function startConversationWordPress(otherUserId: string): Promise<string> {
  // Check if a conversation already exists with this user
  try {
    const convos = await wordpressCCTFetch("chat_conversation", { params: { _limit: 200 } });
    if (Array.isArray(convos)) {
      const existing = convos.find((c: any) => {
        const pids = c.participant_ids || "";
        return pids.includes(otherUserId);
      });
      if (existing) return String(existing.id);
    }
  } catch { /* proceed to create */ }

  // Create a new conversation
  const result = await wordpressCCTFetch("chat_conversation", {
    method: "POST",
    body: { participant_ids: otherUserId, type: "direct" },
  });
  const r = result as any;
  return String(r?.id || r?._item_id || "");
}
