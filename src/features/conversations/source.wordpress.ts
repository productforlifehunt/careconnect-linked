import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { decodeRel72Meta } from "@/features/care-groups/rel-meta";
import { T, R } from "@/integrations/wp-schema";
import { appScopeBody, appScopeParams, filterAppScope } from "@/features/shared/app-scope";
import { fetchRelChildrenMap } from "@/features/shared/rel-batch";
import { fetchWPUserPublicProfile } from "@/features/shared/wp-users";
import { setReadMark, unreadFlag } from "@/features/conversations/read-state";

/**
 * Chat lives in CCTs shared by every app on the backend, so reads filter and
 * writes stamp the "App" scope (ChallengeD / CareCNC).
 *   CCT 121 chat_conversation: chat type, chat name, last message at, App
 *   CCT 126 chat_message:      content, type, image url, price card data
 *   REL 137 (M:M) chat conversation → users        (chatters)
 *   REL 138 (1:M) chat conversation → chat message (messages)
 *   REL 139 (1:M) chat message      → chat message (reply parent)
 *
 * NOTE: relation 265 (1:1 care group 199 → chat conversation 121) is the live
 * link for ChallengeD group chat — relation 140 belongs to the Afresh care
 * group (9). The sentinel chat-name scan below stays only as a recovery path
 * for conversations created before 265 existed.
 */

const CONV = T.chatConversation.slug;
const CF = T.chatConversation.f;
const CT = T.chatConversation.opt.CHAT_TYPE;
const MSG = T.chatMessage.slug;
const MF = T.chatMessage.f;
const MT = T.chatMessage.opt.CHAT_MESSAGE_TYPE;

const REL_GROUP_CONV = R.careGroupChat;   // 1:1 care group (199) → chat conversation (121)

const REL_CONV_MEMBER = R.conversationMembers;
const REL_CONV_MESSAGE = R.conversationMessages;

const stripWp = (id: string | number | null | undefined): string =>
  id == null ? "" : String(id).replace(/^wp-/, "");
const numId = (id: string | number | null | undefined): number => Number(stripWp(id));
/** CCT rows expose the author as `cct_author_id`; `author_id` only on some routes. */
const authorOf = (row: any): number | null => {
  const raw = row?.author_id ?? row?.cct_author_id;
  return raw ? Number(raw) : null;
};

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
    // 2a) Try the group→conversation relation (only if one is configured)
    if (REL_GROUP_CONV) {
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
    }

    // 2b) Fallback: scan chat_conversation CCT for sentinel chat_name
    const sentinel = `__group:${gid}`;
    try {
      const all = await wordpressCCTFetch<any[]>(CONV, { params: { _limit: 500, ...appScopeParams("chatConversation") } });
      const match = (Array.isArray(all) ? all : []).find(
        (c: any) => String(c[CF.CHAT_NAME] || "") === sentinel
      );
      if (match?.id || match?._ID) {
        const id = String(match.id || match._ID);
        _groupConvoCache.set(gid, id);
        writeSessionConvoId(gid, id);
        // Best-effort relation link (skipped while no relation is configured)
        if (REL_GROUP_CONV) {
          wordpressFetch(`jet-rel/${REL_GROUP_CONV}`, {
            method: "POST",
            body: { parent_id: gid, child_id: Number(id), context: "child", store_items_type: "replace" },
          }).catch(() => {});
        }
        return id;
      }
    } catch { /* fall through */ }

    // 2c) Create new conversation with sentinel chat_name
    const created = await wordpressCCTFetch<any>(CONV, {
      method: "POST",
      body: {
        [CF.CHAT_TYPE]: CT.MANY_USERS,
        [CF.CHAT_NAME]: sentinel,
        [CF.LAST_MESSAGE_AT]: new Date().toISOString().slice(0, 19).replace("T", " "),
        ...appScopeBody("chatConversation"),
      },
    });
    const convoId = numId(created?.item_id || created?._ID || created?.id);
    if (!convoId) return null;

    // 2d) Cache immediately to prevent leak loops
    _groupConvoCache.set(gid, String(convoId));
    writeSessionConvoId(gid, String(convoId));

    // 2e) Best-effort relation link (skipped while no relation is configured)
    if (REL_GROUP_CONV) {
      wordpressFetch(`jet-rel/${REL_GROUP_CONV}`, {
        method: "POST",
        body: { parent_id: gid, child_id: convoId, context: "child", store_items_type: "replace" },
      }).catch(() => {});
    }

    // 2f) Add accepted group members as chatters (care group members relation)
    try {
      const memberRels = await wordpressFetch<any[]>(`jet-rel/${R.careGroupMembers}/children/${gid}`);
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
  } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
}

/**
 * Single-request member map for REL 137 (conversation → users).
 * Replaces the per-conversation N+1 lookup: one GET returns every relation row.
 * `loaded` distinguishes "relation has no rows" from "request failed".
 */
async function fetchConversationMemberMap(): Promise<{ loaded: boolean; get: (id: string) => number[] }> {
  const relMap = await fetchRelChildrenMap(REL_CONV_MEMBER);
  return {
    loaded: relMap.loaded,
    get: (id: string) => {
      const list: number[] = [];
      for (const c of relMap.get(id) || []) {
        const child = Number(c.childId);
        if (child && !list.includes(child)) list.push(child);
      }
      return list;
    },
  };
}

/**
 * Batched identity lookup for every participant across the conversation list.
 *
 * Names come ONLY from this app's own column on CCT 151 (joined via relation
 * 152). The shared WordPress account name / login is never read. All profile
 * reads run in parallel and share the transport-level dedupe.
 */
async function fetchUserDirectory(ids: number[]): Promise<Map<number, { name: string; avatar: string | null }>> {
  const out = new Map<number, { name: string; avatar: string | null }>();
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (unique.length === 0) return out;
  await Promise.all(
    unique.map(async (id) => {
      try {
        const p = await fetchWPUserPublicProfile(id);
        out.set(Number(id), { name: p.full_name, avatar: p.avatar_url });
      } catch {
        out.set(Number(id), { name: "", avatar: null });
      }
    }),
  );
  return out;
}


/**
 * Batched last-message lookup: one relation map (conversation → messages) plus
 * one CCT list read, so the conversation list can show a real preview instead
 * of a hardcoded "No messages yet.".
 */
interface LastMessage {
  id: string;
  sender_id: string | null;
  message_content: string;
  created_at: string | null;
}

async function fetchLastMessageMap(): Promise<Map<string, LastMessage>> {
  const out = new Map<string, LastMessage>();
  try {
    const [relMap, msgs] = await Promise.all([
      fetchRelChildrenMap(REL_CONV_MESSAGE),
      wordpressCCTFetch<any[]>(MSG, { params: { _limit: 500, _orderby: "cct_created", _order: "desc" } }),
    ]);
    if (!relMap.loaded) return out;
    const byId = new Map<string, any>();
    for (const m of Array.isArray(msgs) ? msgs : []) byId.set(String(m.id ?? m._ID), m);
    for (const [convoId, children] of relMap.entries()) {
      let best: any = null;
      for (const child of children || []) {
        const m = byId.get(String(child.childId));
        if (!m) continue;
        const at = String(m.created_at ?? m.cct_created ?? "");
        if (!best || at.localeCompare(String(best.created_at ?? best.cct_created ?? "")) > 0) best = m;
      }
      if (best) {
        out.set(String(convoId), {
          id: String(best.id ?? best._ID),
          sender_id: authorOf(best) ? `wp-${authorOf(best)}` : null,
          message_content:
            best[MF.CHAT_MESSAGE_TYPE] === MT.IMAGE
              ? "[Image]"
              : String(best[MF.CHAT_MESSAGE_CONTENT] || ""),
          created_at: best.created_at ?? best.cct_created ?? null,
        });
      }
    }
  } catch { /* preview stays empty */ }
  return out;
}

export async function fetchConversationsWordPress(currentUserId?: string): Promise<any[]> {
  try {
    const [convos, memberMap, lastMessages] = await Promise.all([
      wordpressCCTFetch<any[]>(CONV, { params: { _limit: 200, ...appScopeParams("chatConversation") } }),
      fetchConversationMemberMap(),
      fetchLastMessageMap(),
    ]);
    if (!Array.isArray(convos)) return [];
    const myId = numId(currentUserId);

    const rows = (await Promise.all(filterAppScope("chatConversation", convos).map(async (c: any) => {
      const id = String(c.id || c._ID);
      const memberIds = memberMap.loaded
        ? (memberMap.get(id) || [])
        : await fetchConversationMemberIds(id);
      if (myId && !memberIds.includes(myId)) return null;
      const otherId = myId ? memberIds.find((m) => m !== myId) : memberIds[0];
      const last = lastMessages.get(id) || null;
      return {
        id,
        title: c[CF.CHAT_NAME] || null,
        chat_name: c[CF.CHAT_NAME] || null,
        chat_type: c[CF.CHAT_TYPE] === CT.MANY_USERS ? "Many users" : c[CF.CHAT_TYPE] === CT.AI ? "AI" : "direct",
        type: c[CF.CHAT_TYPE] === CT.MANY_USERS ? "Many users" : c[CF.CHAT_TYPE] === CT.AI ? "AI" : "direct",
        ai_chat_mode: null,
        member_ids: memberIds.map((m) => `wp-${m}`),
        other_user_id: otherId ? `wp-${otherId}` : null,
        _other_raw_id: otherId || null,
        other_user_name: null as string | null,
        other_user_avatar: null as string | null,
        last_message: last || null,
        last_message_at: last?.created_at || c[CF.LAST_MESSAGE_AT] || c.updated_at || c.created_at,
        created_at: c.created_at,
      };
    }))).filter(Boolean) as any[];

    // Resolve participant display names in one request.
    const directory = await fetchUserDirectory(rows.map((r) => Number(r._other_raw_id)));
    for (const r of rows) {
      const info = r._other_raw_id ? directory.get(Number(r._other_raw_id)) : null;
      if (info?.name) r.other_user_name = info.name;
      if (info?.avatar) r.other_user_avatar = info.avatar;
      delete r._other_raw_id;
    }

    return rows.sort((a, b) => String(b.last_message_at || "").localeCompare(String(a.last_message_at || "")));
  } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
}


export async function fetchDirectMessagesWordPress(conversationId: string): Promise<any[]> {
  try {
    // Both halves leave at once: the relation rows (which messages belong to
    // this conversation) and one bulk message read. No stage-two waterfall and
    // no request-per-message N+1.
    const [rels, bulk] = await Promise.all([
      wordpressFetch<any[]>(`jet-rel/${REL_CONV_MESSAGE}/children/${numId(conversationId)}`),
      wordpressCCTFetch<any[]>(MSG, { params: { _limit: 500, _orderby: "cct_created", _order: "desc" } }),
    ]);
    if (!Array.isArray(rels) || rels.length === 0) return [];
    const messageIds = rels.map((r: any) => String(r.child_object_id)).filter(Boolean);
    const byId = new Map<string, any>();
    for (const m of Array.isArray(bulk) ? bulk : []) byId.set(String(m.id ?? m._ID), m);
    const missing = messageIds.filter((id) => !byId.has(id));
    const fetched = await Promise.all(
      missing.map((mid) => wordpressCCTFetch<any>(MSG, { id: mid })),
    );
    for (const m of fetched) if (m) byId.set(String(m.id ?? m._ID), m);
    const msgs = messageIds.map((id) => byId.get(id)).filter(Boolean);

    return (msgs.filter(Boolean) as any[])
      .map((m: any) => ({
        id: String(m.id || m._ID),
        conversation_id: conversationId,
        sender_user_id: authorOf(m) ? `wp-${authorOf(m)}` : null,
        sender_id: authorOf(m) ? `wp-${authorOf(m)}` : null,
        receiver_user_id: null,
        content: m[MF.CHAT_MESSAGE_CONTENT] || "",
        message_type:
          m[MF.CHAT_MESSAGE_TYPE] === MT.IMAGE ? "image"
          : m[MF.CHAT_MESSAGE_TYPE] === MT.AI ? "ai"
          : m[MF.CHAT_MESSAGE_TYPE] === MT.SYSTEM_MESSAGE ? "system"
          : m[MF.CHAT_MESSAGE_TYPE] === MT.PRICE_CARD ? "price_card"
          : "text",
        created_at: m.created_at ?? m.cct_created ?? null,
      }))
      .sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));
  } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
}

export async function sendMessageWordPress(
  conversationId: string,
  content: string,
  _senderUserId: string | number,
  receiverUserId: string | number
): Promise<void> {
  // JetEngine sets author_id from the JWT — no need to send sender id
  const created = await wordpressCCTFetch<any>(MSG, {
    method: "POST",
    body: {
      [MF.CHAT_MESSAGE_CONTENT]: content,
      [MF.CHAT_MESSAGE_TYPE]: MT.TEXT,
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
    await wordpressCCTFetch(CONV, {
      id: conversationId,
      method: "PUT",
      body: { [CF.LAST_MESSAGE_AT]: new Date().toISOString().slice(0, 19).replace("T", " ") },
    });
  } catch { /* non-blocking */ }

  // Notify the other participant(s) — non-blocking, never fails the send.
  try {
    let recipients: Array<string | number> = receiverUserId ? [receiverUserId] : [];
    if (convoId) {
      const memberIds = await fetchConversationMemberIds(String(convoId)).catch(() => [] as number[]);
      if (memberIds.length > 0) recipients = memberIds;
    }
    const { notifyNewMessage } = await import("@/features/notifications/notify-events");
    await notifyNewMessage(recipients, String(conversationId), content);
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
    const [convos, memberMap] = await Promise.all([
      wordpressCCTFetch<any[]>(CONV, { params: { _limit: 500, ...appScopeParams("chatConversation") } }),
      fetchConversationMemberMap(),
    ]);
    if (Array.isArray(convos)) {
      for (const c of convos) {
        if (c[CF.CHAT_TYPE] && c[CF.CHAT_TYPE] !== CT.ONE_TO_ONE) continue;
        const cid = String(c.id || c._ID);
        const memberIds = memberMap.loaded ? (memberMap.get(cid) || []) : await fetchConversationMemberIds(cid);
        if (memberIds.length === 2 && memberIds.includes(me) && memberIds.includes(other)) {
          return cid;
        }
      }
    }
  } catch { /* fall through */ }


  const result = await wordpressCCTFetch<any>(CONV, {
    method: "POST",
    body: {
      [CF.CHAT_TYPE]: CT.ONE_TO_ONE,
      [CF.CHAT_NAME]: "",
      [CF.LAST_MESSAGE_AT]: new Date().toISOString().slice(0, 19).replace("T", " "),
      ...appScopeBody("chatConversation"),
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
