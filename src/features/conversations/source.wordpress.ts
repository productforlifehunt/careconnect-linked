import { wordpressCCTFetch } from "@/features/shared/wordpress-client";

/**
 * CCT slugs: chat_conversation, chat_message
 *
 * Real schema in WP (verified 2026-04-17):
 *   chat_conversation: participant_1_id, participant_2_id, last_message_at, last_message_preview
 *   chat_message:      conversation_id, sender_user_id, receiver_user_id, content, message_type
 *
 * IMPORTANT: WP wants RAW numeric ids (e.g. "1"), but the app carries user ids
 * with a "wp-" prefix (e.g. "wp-1"). Always strip the prefix before sending.
 */

const stripWp = (id: string | number | null | undefined): string =>
  id == null ? "" : String(id).replace(/^wp-/, "");

export async function fetchConversationsWordPress(currentUserId?: string): Promise<any[]> {
  try {
    const convos = await wordpressCCTFetch<any[]>("chat_conversation", { params: { _limit: 200 } });
    if (!Array.isArray(convos)) return [];
    const myId = stripWp(currentUserId);
    const filtered = myId
      ? convos.filter(
          (c: any) =>
            String(c.participant_1_id) === myId || String(c.participant_2_id) === myId
        )
      : convos;
    return filtered.map((c: any) => {
      const p1 = String(c.participant_1_id || "0");
      const p2 = String(c.participant_2_id || "0");
      const otherRaw = myId && p1 === myId ? p2 : p1;
      return {
        id: c._ID || c.id,
        title: c.title || null,
        type: c.type || "direct",
        participant_1_id: p1,
        participant_2_id: p2,
        other_user_id: otherRaw ? `wp-${otherRaw}` : null,
        last_message: c.last_message_preview || null,
        last_message_at: c.last_message_at || c.cct_modified || c.cct_created,
        created_at: c.cct_created,
      };
    });
  } catch {
    return [];
  }
}

export async function fetchDirectMessagesWordPress(conversationId: string): Promise<any[]> {
  try {
    const msgs = await wordpressCCTFetch<any[]>("chat_message", {
      params: { conversation_id: conversationId, _limit: 200 },
    });
    if (!Array.isArray(msgs)) return [];
    return msgs
      .filter((m: any) => String(m.conversation_id) === String(conversationId))
      .map((m: any) => ({
        id: m._ID || m.id,
        conversation_id: m.conversation_id,
        sender_user_id: m.sender_user_id ? `wp-${m.sender_user_id}` : null,
        receiver_user_id: m.receiver_user_id ? `wp-${m.receiver_user_id}` : null,
        sender_id: m.sender_user_id ? `wp-${m.sender_user_id}` : null, // backward-compat alias
        content: m.content || "",
        message_type: m.message_type || "text",
        created_at: m.cct_created,
      }))
      .sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));
  } catch {
    return [];
  }
}

export async function sendMessageWordPress(
  conversationId: string,
  content: string,
  senderUserId: string | number,
  receiverUserId: string | number
): Promise<void> {
  await wordpressCCTFetch("chat_message", {
    method: "POST",
    body: {
      conversation_id: conversationId,
      sender_user_id: stripWp(senderUserId),
      receiver_user_id: stripWp(receiverUserId),
      content,
      message_type: "text",
    },
  });
  // Update parent conversation last_message_at + preview (best-effort)
  try {
    const preview = content.length > 80 ? content.slice(0, 80) + "…" : content;
    await wordpressCCTFetch("chat_conversation", {
      id: conversationId,
      method: "PUT",
      body: {
        last_message_at: new Date().toISOString().slice(0, 19).replace("T", " "),
        last_message_preview: preview,
      },
    });
  } catch { /* non-blocking */ }
}

export async function markMessagesReadWordPress(_conversationId: string): Promise<void> {
  // Read-tracking deferred — schema has is_read on chat_message, but per-user
  // read state needs a chat_member table that isn't populated reliably.
  return;
}

export async function startConversationWordPress(
  otherUserId: string,
  currentUserId: string
): Promise<string> {
  const me = stripWp(currentUserId);
  const other = stripWp(otherUserId);
  if (!me || !other) throw new Error("startConversation: missing user ids");
  if (me === other) throw new Error("Cannot start a conversation with yourself");

  // Find existing conversation containing both ids (in either slot)
  try {
    const convos = await wordpressCCTFetch<any[]>("chat_conversation", { params: { _limit: 500 } });
    if (Array.isArray(convos)) {
      const existing = convos.find((c: any) => {
        const p1 = String(c.participant_1_id);
        const p2 = String(c.participant_2_id);
        return (
          (p1 === me && p2 === other) ||
          (p1 === other && p2 === me)
        );
      });
      if (existing) return String(existing._ID || existing.id);
    }
  } catch { /* fall through to create */ }

  const result = await wordpressCCTFetch<any>("chat_conversation", {
    method: "POST",
    body: {
      participant_1_id: me,
      participant_2_id: other,
    },
  });
  return String(result?._item_id || result?.id || result?._ID || "");
}
