import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { decodeRel72Meta } from "@/features/care-groups/rel-meta";

/**
 * Live JetEngine schema (verified from prd-to-wp-mapping.md):
 *   CCT chat_conversation: a55=chat_type, a56=chat_name, a57=ai_chat_mode, a58=last_message_at
 *   CCT chat_message:      a55=content, a56=type
 *   REL 140 (1:1)  care_group        → chat_conversation
 *   REL 142 (M:M)  chat_conversation → users           (members)
 *   REL 143 (1:M)  chat_conversation → chat_message    (messages)
 *   REL 144 (1:M)  chat_message      → chat_message    (reply parent)
 */

const REL_GROUP_CONV = 140;     // 1:1  care_group → chat_conversation
// Dictionary name "142. chat conversation → chatters" — live ID 166 (old 142 deleted & recreated)
const REL_CONV_MEMBER = 166;
const REL_CONV_MESSAGE = 143;

const stripWp = (id: string | number | null | undefined): string =>
  id == null ? "" : String(id).replace(/^wp-/, "");
const numId = (id: string | number | null | undefined): number => Number(stripWp(id));

/**
 * Resolve (or lazily create) the live group chat conversation for a care group.
 * Per spec: "every care group automatically gets one group live chat conversation".
 *
 * IMPORTANT: REL 140 (1:1 care_group→chat_conversation) is NOT exposed via the
 * jet-rel REST POST endpoint on this WP install (returns 404). To work around
 * that without leaking conversations on every render, we:
 *   1. Cache the resolved conversation id per groupId in-memory (and in
 *      sessionStorage) so re-renders don't re-create.
 *   2. Use a sentinel in `chat_name` ("__group:<gid>") to recover the link
 *      even after a hard reload, falling back to a CCT-list scan.
 *   3. Best-effort POST to REL 140 (succeeds if the route is ever added);
 *      failure is silently ignored.
 */
const _groupConvoCache = new Map<number, string>();
const _groupConvoInflight = new Map<number, Promise<string | null>>();

function readSessionConvoId(gid: number): string | null {
  try { return sessionStorage.getItem(`group_convo:${gid}`); } catch { return null; }
}
function writeSessionConvoId(gid: number, convoId: string) {
  try { sessionStorage.setItem(`group_convo:${gid}`, convoId); } catch { /* noop */ }
}

export async function getOrCreateGroupConversationWordPress(groupId: string | number): Promise<string | null> {
  const gid = numId(groupId);
  if (!gid) return null;

  // 1) Memory / session cache
  if (_groupConvoCache.has(gid)) return _groupConvoCache.get(gid)!;
  const cached = readSessionConvoId(gid);
  if (cached) { _groupConvoCache.set(gid, cached); return cached; }

  // 2) Single-flight: dedupe concurrent calls for the same group
  if (_groupConvoInflight.has(gid)) return _groupConvoInflight.get(gid)!;

  const promise = (async (): Promise<string | null> => {
    // 2a) Try REL 140 (works only if route exists)
    try {
      const rels = await wordpressFetch<any[]>(`jet-rel/${REL_GROUP_CONV}/children/${gid}`);
      const existing = (Array.isArray(rels) ? rels : [])[0]?.child_object_id;
      if (existing) {
        const id = String(existing);
        _groupConvoCache.set(gid, id);
        writeSessionConvoId(gid, id);
        return id;
      }
    } catch { /* fall through */ }

    // 2b) Fallback: scan chat_conversation CCT for sentinel chat_name
    const sentinel = `__group:${gid}`;
    try {
      const all = await wordpressCCTFetch<any[]>("chat_conversation", { params: { _limit: 500 } });
      const match = (Array.isArray(all) ? all : []).find(
        (c: any) => String(c.a56 || "") === sentinel
      );
      if (match?.id || match?._ID) {
        const id = String(match.id || match._ID);
        _groupConvoCache.set(gid, id);
        writeSessionConvoId(gid, id);
        // Best-effort REL 140 link (no-op if route missing)
        wordpressFetch(`jet-rel/${REL_GROUP_CONV}`, {
          method: "POST",
          body: { parent_id: gid, child_id: Number(id), context: "child", store_items_type: "replace" },
        }).catch(() => {});
        return id;
      }
    } catch { /* fall through */ }

    // 2c) Create new conversation with sentinel chat_name
    const created = await wordpressCCTFetch<any>("chat_conversation", {
      method: "POST",
      body: {
        a55: "b56",
        a56: sentinel,
        a57: "",
        a58: new Date().toISOString().slice(0, 19).replace("T", " "),
      },
    });
    const convoId = numId(created?.item_id || created?._ID || created?.id);
    if (!convoId) return null;

    // 2d) Cache immediately to prevent leak loops
    _groupConvoCache.set(gid, String(convoId));
    writeSessionConvoId(gid, String(convoId));

    // 2e) Best-effort REL 140 link (route may not exist — non-blocking)
    wordpressFetch(`jet-rel/${REL_GROUP_CONV}`, {
      method: "POST",
      body: { parent_id: gid, child_id: convoId, context: "child", store_items_type: "replace" },
    }).catch(() => {});

    // 2f) Add accepted group members as chatters (REL 142 — works)
    try {
      const memberRels = await wordpressFetch<any[]>(`jet-rel/72/children/${gid}`);
      const acceptedIds = (Array.isArray(memberRels) ? memberRels : [])
        .filter((r: any) => decodeRel72Meta(r?.meta).invitationStatus === "accepted")
        .map((r: any) => Number(r.child_object_id))
        .filter(Boolean);
      await Promise.all(acceptedIds.map((uid) =>
        wordpressFetch(`jet-rel/${REL_CONV_MEMBER}`, {
          method: "POST",
          body: { parent_id: convoId, child_id: uid, context: "child", store_items_type: "update" },
        }).catch(() => {})
      ));
    } catch { /* non-blocking */ }

    return String(convoId);
  })();

  _groupConvoInflight.set(gid, promise);
  try { return await promise; }
  finally { _groupConvoInflight.delete(gid); }
}


async function fetchConversationMemberIds(convoId: string | number): Promise<number[]> {
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_CONV_MEMBER}/children/${numId(convoId)}`);
    if (!Array.isArray(rels)) return [];
    return rels.map((r: any) => Number(r.child_object_id)).filter(Boolean);
  } catch { return []; }
}

export async function fetchConversationsWordPress(currentUserId?: string): Promise<any[]> {
  try {
    const convos = await wordpressCCTFetch<any[]>("chat_conversation", { params: { _limit: 200 } });
    if (!Array.isArray(convos)) return [];
    const myId = numId(currentUserId);

    const enriched = await Promise.all(convos.map(async (c: any) => {
      const id = String(c.id || c._ID);
      const memberIds = await fetchConversationMemberIds(id);
      if (myId && !memberIds.includes(myId)) return null;
      const otherId = myId ? memberIds.find((m) => m !== myId) : memberIds[0];
      return {
        id,
        title: c.a56 || null,
        chat_name: c.a56 || null,
        chat_type: c.a55 === "b56" ? "Many users" : c.a55 === "b57" ? "AI" : "direct",
        type: c.a55 === "b56" ? "Many users" : c.a55 === "b57" ? "AI" : "direct",
        ai_chat_mode: c.a57 || null,
        member_ids: memberIds.map((m) => `wp-${m}`),
        other_user_id: otherId ? `wp-${otherId}` : null,
        last_message: null,
        last_message_at: c.a58 || c.updated_at || c.created_at,
        created_at: c.created_at,
      };
    }));
    return enriched.filter(Boolean) as any[];
  } catch { return []; }
}

export async function fetchDirectMessagesWordPress(conversationId: string): Promise<any[]> {
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_CONV_MESSAGE}/children/${numId(conversationId)}`);
    if (!Array.isArray(rels) || rels.length === 0) return [];
    const messageIds = rels.map((r: any) => String(r.child_object_id)).filter(Boolean);
    const msgs = await Promise.all(messageIds.map(async (mid) => {
      try { return await wordpressCCTFetch<any>("chat_message", { id: mid }); }
      catch { return null; }
    }));
    return (msgs.filter(Boolean) as any[])
      .map((m: any) => ({
        id: String(m.id || m._ID),
        conversation_id: conversationId,
        sender_user_id: m.author_id ? `wp-${m.author_id}` : null,
        sender_id: m.author_id ? `wp-${m.author_id}` : null,
        receiver_user_id: null,
        content: m.a55 || "",
        message_type: m.a56 === "b56" ? "image" : m.a56 === "b57" ? "ai" : m.a56 === "b58" ? "system" : m.a56 === "b59" ? "price_card" : "text",
        created_at: m.created_at,
      }))
      .sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));
  } catch { return []; }
}

export async function sendMessageWordPress(
  conversationId: string,
  content: string,
  _senderUserId: string | number,
  _receiverUserId: string | number
): Promise<void> {
  // JetEngine sets author_id from the JWT — no need to send sender id
  const created = await wordpressCCTFetch<any>("chat_message", {
    method: "POST",
    body: {
      a55: content,
      a56: "b55",
    },
  });
  const messageId = numId(created?.item_id || created?._ID || created?.id);
  const convoId = numId(conversationId);
  if (messageId && convoId) {
    // Non-blocking: if REL 143 is not registered in JetEngine yet, the message
    // is still saved and the conversation timestamp is updated below.
    try {
      await wordpressFetch(`jet-rel/${REL_CONV_MESSAGE}`, {
        method: "POST",
        body: { parent_id: convoId, child_id: messageId, context: "child", store_items_type: "update" },
      });
    } catch (e) {
      console.warn(`[chat] jet-rel/${REL_CONV_MESSAGE} link failed (relation may not be registered):`, e);
    }
  }
  // Touch conversation last_message_at
  try {
    await wordpressCCTFetch("chat_conversation", {
      id: conversationId,
      method: "PUT",
      body: { a58: new Date().toISOString().slice(0, 19).replace("T", " ") },
    });
  } catch { /* non-blocking */ }
}

export async function markMessagesReadWordPress(_conversationId: string): Promise<void> {
  // Per-user read state requires per-member tracking — deferred until schema supports it
  return;
}

export async function startConversationWordPress(
  otherUserId: string,
  currentUserId: string
): Promise<string> {
  const me = numId(currentUserId);
  const other = numId(otherUserId);
  if (!me || !other) throw new Error("startConversation: missing user ids");
  if (me === other) throw new Error("Cannot start a conversation with yourself");

  // Find existing direct conversation containing both members
  try {
    const convos = await wordpressCCTFetch<any[]>("chat_conversation", { params: { _limit: 500 } });
    if (Array.isArray(convos)) {
      for (const c of convos) {
        if (c.a55 && c.a55 !== "b55") continue;
        const memberIds = await fetchConversationMemberIds(String(c.id || c._ID));
        if (memberIds.length === 2 && memberIds.includes(me) && memberIds.includes(other)) {
          return String(c.id || c._ID);
        }
      }
    }
  } catch { /* fall through */ }

  const result = await wordpressCCTFetch<any>("chat_conversation", {
    method: "POST",
    body: {
      a55: "b55",
      a56: "",
      a57: "",
      a58: new Date().toISOString().slice(0, 19).replace("T", " "),
    },
  });
  const convoId = numId(result?.item_id || result?._ID || result?.id);
  if (!convoId) throw new Error("Failed to create conversation");
  // Add both members via REL 142
  await Promise.all([me, other].map((uid) =>
    wordpressFetch(`jet-rel/${REL_CONV_MEMBER}`, {
      method: "POST",
      body: { parent_id: convoId, child_id: uid, context: "child", store_items_type: "update" },
    }).catch(() => {})
  ));
  return String(convoId);
}
