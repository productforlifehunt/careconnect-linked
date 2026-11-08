/**
 * Saved AI assistant threads.
 * Thread = CCT121 row (type AI, app-scoped). Owner = REL137 (conversation → user).
 * Messages = CCT126 rows linked by REL138 (conversation → message).
 * One-off AI uses (info cards, check-in, briefings) never come through here.
 */
import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { readLinkedCCTRows } from "@/features/shared/cct-rows";
import { T, R } from "@/integrations/wp-schema";
import { appScopeBody, isInAppScope } from "@/features/shared/app-scope";
import { getStoredWPUser } from "@/services/wp-auth";

const CONV = T.chatConversation.slug;
const CF = T.chatConversation.f;
const CT = T.chatConversation.opt.CHAT_TYPE;
const MSG = T.chatMessage.slug;
const MF = T.chatMessage.f;
const MT = T.chatMessage.opt.CHAT_MESSAGE_TYPE;
const REL_MEMBER = R.conversationMembers;
const REL_MESSAGE = R.conversationMessages;

export interface AiThread { id: string; title: string; updatedAt: string }
export interface AiThreadMessage { role: "user" | "assistant"; content: string }

const now = () => new Date().toISOString().slice(0, 19).replace("T", " ");
const rowId = (r: any) => String(r?.item_id ?? r?._ID ?? r?.id ?? "");

function me(): number {
  const id = Number(getStoredWPUser()?.user_id);
  if (!id) throw new Error("Not signed in");
  return id;
}

export async function listAiThreads(): Promise<AiThread[]> {
  const rels = await wordpressFetch<any[]>(`jet-rel/${REL_MEMBER}/parents/${me()}`);
  if (!Array.isArray(rels)) throw new Error("Could not load conversations");
  const ids = [...new Set(rels.map((r) => String(r.parent_object_id)).filter(Boolean))];
  const rows = await readLinkedCCTRows(CONV, ids).catch(() => []);
  return rows
    .filter((c) => c && c[CF.CHAT_TYPE] === CT.AI && isInAppScope("chatConversation", c))
    .map((c) => ({ id: rowId(c), title: c[CF.CHAT_NAME] || "", updatedAt: c[CF.LAST_MESSAGE_AT] || c.cct_modified || "" }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function createAiThread(title = ""): Promise<string> {
  const res = await wordpressCCTFetch<any>(CONV, {
    method: "POST",
    body: { [CF.CHAT_TYPE]: CT.AI, [CF.CHAT_NAME]: title, [CF.LAST_MESSAGE_AT]: now(), ...appScopeBody("chatConversation") },
  });
  const id = rowId(res);
  if (!id) throw new Error("Could not create conversation");
  await wordpressFetch(`jet-rel/${REL_MEMBER}`, {
    method: "POST",
    body: { parent_id: Number(id), child_id: me(), context: "child", store_items_type: "update", meta: { [T_JOINED]: now() } },
  });
  return id;
}
const T_JOINED = "a55"; // REL137 "joined at" meta (dictionary code)

/** True when the signed-in user is a member of this AI thread. */
export async function ownsAiThread(id: string): Promise<boolean> {
  const rels = await wordpressFetch<any[]>(`jet-rel/${REL_MEMBER}/children/${Number(id)}`);
  return Array.isArray(rels) && rels.some((r) => Number(r.child_object_id) === me());
}

export async function loadAiThreadMessages(id: string): Promise<AiThreadMessage[]> {
  const rels = await wordpressFetch<any[]>(`jet-rel/${REL_MESSAGE}/children/${Number(id)}`);
  if (!Array.isArray(rels) || rels.length === 0) return [];
  const ids = [...new Set(rels.map((r) => String(r.child_object_id)).filter((value) => /^\d+$/.test(value)))];
  const msgs = await readLinkedCCTRows(MSG, ids);
  return msgs
    .filter(Boolean)
    .sort((a, b) => Number(rowId(a)) - Number(rowId(b)))
    .map((m) => ({ role: m[MF.CHAT_MESSAGE_TYPE] === MT.AI ? "assistant" : "user", content: m[MF.CHAT_MESSAGE_CONTENT] || "" }));
}

export async function appendAiMessage(threadId: string, role: AiThreadMessage["role"], content: string): Promise<void> {
  const res = await wordpressCCTFetch<any>(MSG, {
    method: "POST",
    body: { [MF.CHAT_MESSAGE_CONTENT]: content, [MF.CHAT_MESSAGE_TYPE]: role === "assistant" ? MT.AI : MT.TEXT },
  });
  const mid = Number(rowId(res));
  if (!mid) throw new Error("Message not saved");
  await wordpressFetch(`jet-rel/${REL_MESSAGE}`, {
    method: "POST",
    body: { parent_id: Number(threadId), child_id: mid, context: "child", store_items_type: "update" },
  });
}

export async function touchAiThread(threadId: string, title?: string | undefined): Promise<void> {
  await wordpressCCTFetch(CONV, {
    id: threadId,
    method: "PUT",
    body: { [CF.LAST_MESSAGE_AT]: now(), ...(title ? { [CF.CHAT_NAME]: title } : {}) },
  });
}
