import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
import { i as getStoredWPUser } from "./wp-auth-DL1jfVY7.mjs";
import { a as wordpressFetch, i as wordpressCCTFetch } from "./wordpress-client-b834cpZh.mjs";
import { n as R, r as T } from "./wp-schema-Dnlz0TVP.mjs";
import { a as filterAppScope, n as appScopeParams, t as appScopeBody } from "./app-scope-Cq6C10CZ.mjs";
import { n as fetchRelChildrenMap } from "./rel-batch-97Y7fPM-.mjs";
import { t as readLinkedCCTRows } from "./cct-rows-C0yQLswP.mjs";
import { r as fetchWPUserPublicProfile } from "./wp-users-C2nRIR2f.mjs";
import { t as decodeRel72Meta } from "./rel-meta-Ubi-lVVD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/source.wordpress-D7cB4zyC.js
/**
* Local read state for chat conversations.
*
* The backend has no per-member read column on the conversation relation, so
* "unread" is computed on the device: we remember, per conversation, the
* timestamp of the newest message the user has actually opened. A conversation
* counts as unread when its newest message is newer than that mark AND was not
* sent by the current user.
*
* This is deliberately device-local: no schema change, no extra request, and no
* silent "always zero" badge like before.
*/
var KEY = "chat-read-marks-v1";
function load() {
	try {
		const raw = localStorage.getItem(KEY);
		const parsed = raw ? JSON.parse(raw) : {};
		return parsed && typeof parsed === "object" ? parsed : {};
	} catch {
		return {};
	}
}
function save(marks) {
	try {
		localStorage.setItem(KEY, JSON.stringify(marks));
	} catch {}
}
/** Timestamp of the newest message the user has seen in this conversation. */
function getReadMark(conversationId, userId) {
	return load()[`${String(userId ?? "").replace(/^wp-/, "")}:${conversationId}`] || "";
}
/** Remember that everything up to `at` (default: now) has been seen. */
function setReadMark(conversationId, at, userId) {
	const marks = load();
	marks[`${String(userId ?? "").replace(/^wp-/, "")}:${conversationId}`] = at || (/* @__PURE__ */ new Date()).toISOString();
	save(marks);
}
/**
* 1 when the conversation has something new for me, 0 otherwise.
* Only the newest message is known in the batched list read, so this is a
* per-conversation flag rather than an exact message count.
*/
function unreadFlag(conversationId, lastMessage, myId) {
	if (!lastMessage?.created_at) return 0;
	const normalize = (id) => id.replace(/^wp-/, "");
	if (myId && lastMessage.sender_id && normalize(lastMessage.sender_id) === normalize(myId)) return 0;
	const mark = getReadMark(conversationId, myId);
	const messageTime = Date.parse(lastMessage.created_at);
	if (!Number.isFinite(messageTime)) return 0;
	const readTime = Date.parse(mark);
	return !Number.isFinite(readTime) || messageTime > readTime ? 1 : 0;
}
var source_wordpress_exports = /* @__PURE__ */ __exportAll({
	fetchConversationsWordPress: () => fetchConversationsWordPress,
	fetchDirectMessagesWordPress: () => fetchDirectMessagesWordPress,
	getOrCreateGroupConversationWordPress: () => getOrCreateGroupConversationWordPress,
	markMessagesReadWordPress: () => markMessagesReadWordPress,
	sendMessageWordPress: () => sendMessageWordPress,
	startConversationWordPress: () => startConversationWordPress
});
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
var CONV = T.chatConversation.slug;
var CF = T.chatConversation.f;
var CT = T.chatConversation.opt.CHAT_TYPE;
var MSG = T.chatMessage.slug;
var MF = T.chatMessage.f;
var MT = T.chatMessage.opt.CHAT_MESSAGE_TYPE;
var REL_GROUP_CONV = R.careGroupChat;
var REL_CONV_MEMBER = R.conversationMembers;
var REL_CONV_MESSAGE = R.conversationMessages;
var stripWp = (id) => id == null ? "" : String(id).replace(/^wp-/, "");
var numId = (id) => Number(stripWp(id));
/** CCT rows expose the author as `cct_author_id`; `author_id` only on some routes. */
var authorOf = (row) => {
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
var _groupConvoCache = /* @__PURE__ */ new Map();
var _groupConvoInflight = /* @__PURE__ */ new Map();
function readSessionConvoId(gid) {
	try {
		return sessionStorage.getItem(`group_convo:${gid}`);
	} catch {
		return null;
	}
}
function writeSessionConvoId(gid, convoId) {
	try {
		sessionStorage.setItem(`group_convo:${gid}`, convoId);
	} catch {}
}
async function getOrCreateGroupConversationWordPress(groupId) {
	const gid = numId(groupId);
	if (!gid) return null;
	if (_groupConvoCache.has(gid)) return _groupConvoCache.get(gid);
	const cached = readSessionConvoId(gid);
	if (cached) {
		_groupConvoCache.set(gid, cached);
		return cached;
	}
	if (_groupConvoInflight.has(gid)) return _groupConvoInflight.get(gid);
	const promise = (async () => {
		if (REL_GROUP_CONV) try {
			const rels = await wordpressFetch(`jet-rel/${REL_GROUP_CONV}/children/${gid}`);
			const existing = (Array.isArray(rels) ? rels : [])[0]?.child_object_id;
			if (existing) {
				const id = String(existing);
				_groupConvoCache.set(gid, id);
				writeSessionConvoId(gid, id);
				return id;
			}
		} catch {}
		const sentinel = `__group:${gid}`;
		try {
			const all = await wordpressCCTFetch(CONV, { params: {
				_limit: 5,
				...appScopeParams("chatConversation"),
				_filters: JSON.stringify([{
					field: CF.CHAT_NAME,
					operator: "=",
					value: sentinel
				}])
			} });
			const match = (Array.isArray(all) ? all : []).find((c) => String(c[CF.CHAT_NAME] || "") === sentinel);
			if (match?.id || match?._ID) {
				const id = String(match.id || match._ID);
				_groupConvoCache.set(gid, id);
				writeSessionConvoId(gid, id);
				if (REL_GROUP_CONV) wordpressFetch(`jet-rel/${REL_GROUP_CONV}`, {
					method: "POST",
					body: {
						parent_id: gid,
						child_id: Number(id),
						context: "child",
						store_items_type: "replace"
					}
				}).catch(() => {});
				return id;
			}
		} catch {}
		const created = await wordpressCCTFetch(CONV, {
			method: "POST",
			body: {
				[CF.CHAT_TYPE]: CT.MANY_USERS,
				[CF.CHAT_NAME]: sentinel,
				[CF.LAST_MESSAGE_AT]: (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " "),
				...appScopeBody("chatConversation")
			}
		});
		const convoId = numId(created?.item_id || created?._ID || created?.id);
		if (!convoId) return null;
		_groupConvoCache.set(gid, String(convoId));
		writeSessionConvoId(gid, String(convoId));
		if (REL_GROUP_CONV) wordpressFetch(`jet-rel/${REL_GROUP_CONV}`, {
			method: "POST",
			body: {
				parent_id: gid,
				child_id: convoId,
				context: "child",
				store_items_type: "replace"
			}
		}).catch(() => {});
		try {
			const memberRels = await wordpressFetch(`jet-rel/${R.careGroupMembers}/children/${gid}`);
			const acceptedIds = (Array.isArray(memberRels) ? memberRels : []).filter((r) => decodeRel72Meta(r?.meta).invitationStatus === "accepted").map((r) => Number(r.child_object_id)).filter(Boolean);
			await Promise.all(acceptedIds.map((uid) => wordpressFetch(`jet-rel/${REL_CONV_MEMBER}`, {
				method: "POST",
				body: {
					parent_id: convoId,
					child_id: uid,
					context: "child",
					store_items_type: "update"
				}
			}).catch(() => {})));
		} catch {}
		return String(convoId);
	})();
	_groupConvoInflight.set(gid, promise);
	try {
		return await promise;
	} finally {
		_groupConvoInflight.delete(gid);
	}
}
async function fetchConversationMemberIds(convoId) {
	try {
		const rels = await wordpressFetch(`jet-rel/${REL_CONV_MEMBER}/children/${numId(convoId)}`);
		if (!Array.isArray(rels)) return [];
		return rels.map((r) => Number(r.child_object_id)).filter(Boolean);
	} catch (e) {
		throw e instanceof Error ? e : new Error(String(e));
	}
}
/**
* Single-request member map for REL 137 (conversation → users).
* Replaces the per-conversation N+1 lookup: one GET returns every relation row.
* `loaded` distinguishes "relation has no rows" from "request failed".
*/
async function fetchConversationMemberMap() {
	const relMap = await fetchRelChildrenMap(REL_CONV_MEMBER);
	return {
		loaded: relMap.loaded,
		get: (id) => {
			const list = [];
			for (const c of relMap.get(id) || []) {
				const child = Number(c.childId);
				if (child && !list.includes(child)) list.push(child);
			}
			return list;
		}
	};
}
/**
* Batched identity lookup for every participant across the conversation list.
*
* Names come ONLY from this app's own column on CCT 151 (joined via relation
* 152). The shared WordPress account name / login is never read. All profile
* reads run in parallel and share the transport-level dedupe.
*/
async function fetchUserDirectory(ids) {
	const out = /* @__PURE__ */ new Map();
	const unique = Array.from(new Set(ids.filter(Boolean)));
	if (unique.length === 0) return out;
	await Promise.all(unique.map(async (id) => {
		try {
			const p = await fetchWPUserPublicProfile(id);
			out.set(Number(id), {
				name: p.full_name,
				avatar: p.avatar_url
			});
		} catch {
			out.set(Number(id), {
				name: "",
				avatar: null
			});
		}
	}));
	return out;
}
async function fetchLastMessageMap() {
	const out = /* @__PURE__ */ new Map();
	try {
		const [relMap, msgs] = await Promise.all([fetchRelChildrenMap(REL_CONV_MESSAGE), wordpressCCTFetch(MSG, { params: {
			_limit: 500,
			_orderby: "cct_created",
			_order: "desc"
		} })]);
		if (!relMap.loaded) return out;
		const byId = /* @__PURE__ */ new Map();
		for (const m of Array.isArray(msgs) ? msgs : []) byId.set(String(m.id ?? m._ID), m);
		for (const [convoId, children] of relMap.entries()) {
			let best = null;
			for (const child of children || []) {
				const m = byId.get(String(child.childId));
				if (!m) continue;
				const at = String(m.created_at ?? m.cct_created ?? "");
				if (!best || at.localeCompare(String(best.created_at ?? best.cct_created ?? "")) > 0) best = m;
			}
			if (best) out.set(String(convoId), {
				id: String(best.id ?? best._ID),
				sender_id: authorOf(best) ? `wp-${authorOf(best)}` : null,
				message_content: best[MF.CHAT_MESSAGE_TYPE] === MT.IMAGE ? "[Image]" : String(best[MF.CHAT_MESSAGE_CONTENT] || ""),
				created_at: best.created_at ?? best.cct_created ?? null
			});
		}
	} catch {}
	return out;
}
/** The current user's own conversations only: REL137 parents of the user, then those rows by ID. */
async function fetchMyConversationScope(myId) {
	const parents = await wordpressFetch(`jet-rel/${REL_CONV_MEMBER}/parents/${myId}`);
	const convos = filterAppScope("chatConversation", await readLinkedCCTRows(CONV, [...new Set((Array.isArray(parents) ? parents : []).map((r) => String(r.parent_object_id)).filter((v) => /^\d+$/.test(v)))])).filter((c) => c[CF.CHAT_TYPE] !== CT.AI);
	const members = /* @__PURE__ */ new Map();
	const lastIds = /* @__PURE__ */ new Map();
	await Promise.all(convos.map(async (c) => {
		const id = String(c.id ?? c._ID);
		const [m, msgs] = await Promise.all([fetchConversationMemberIds(id), wordpressFetch(`jet-rel/${REL_CONV_MESSAGE}/children/${id}`).catch(() => [])]);
		members.set(id, m);
		const latest = (Array.isArray(msgs) ? msgs : []).map((r) => Number(r.child_object_id)).filter(Boolean).sort((a, b) => b - a)[0];
		if (latest) lastIds.set(id, String(latest));
	}));
	const lastRows = await readLinkedCCTRows(MSG, [...lastIds.values()]);
	const byMsg = new Map(lastRows.map((m) => [String(m.id ?? m._ID), m]));
	const lastMessages = /* @__PURE__ */ new Map();
	for (const [cid, mid] of lastIds) {
		const best = byMsg.get(mid);
		if (!best) continue;
		lastMessages.set(cid, {
			id: mid,
			sender_id: authorOf(best) ? `wp-${authorOf(best)}` : null,
			message_content: best[MF.CHAT_MESSAGE_TYPE] === MT.IMAGE ? "[Image]" : String(best[MF.CHAT_MESSAGE_CONTENT] || ""),
			created_at: best.created_at ?? best.cct_created ?? null
		});
	}
	return {
		convos,
		memberMap: {
			loaded: true,
			get: (id) => members.get(id) || []
		},
		lastMessages
	};
}
async function fetchConversationsWordPress(currentUserId) {
	try {
		const mine = numId(currentUserId);
		const [convos, memberMap, lastMessages] = mine ? await fetchMyConversationScope(mine).then((r) => [
			r.convos,
			r.memberMap,
			r.lastMessages
		]) : await Promise.all([
			wordpressCCTFetch(CONV, { params: {
				_limit: 200,
				...appScopeParams("chatConversation")
			} }),
			fetchConversationMemberMap(),
			fetchLastMessageMap()
		]);
		if (!Array.isArray(convos)) return [];
		const myId = numId(currentUserId);
		const rows = (await Promise.all(filterAppScope("chatConversation", convos).map(async (c) => {
			if (c[CF.CHAT_TYPE] === CT.AI) return null;
			const id = String(c.id || c._ID);
			const memberIds = memberMap.loaded ? memberMap.get(id) || [] : await fetchConversationMemberIds(id);
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
				other_user_name: null,
				other_user_avatar: null,
				last_message: last || null,
				last_message_at: last?.created_at || c[CF.LAST_MESSAGE_AT] || c.updated_at || c.created_at,
				unread_count: unreadFlag(id, last, myId ? `wp-${myId}` : null),
				created_at: c.created_at
			};
		}))).filter(Boolean);
		const directory = await fetchUserDirectory(rows.map((r) => Number(r._other_raw_id)));
		for (const r of rows) {
			const info = r._other_raw_id ? directory.get(Number(r._other_raw_id)) : null;
			if (info?.name) r.other_user_name = info.name;
			if (info?.avatar) r.other_user_avatar = info.avatar;
			delete r._other_raw_id;
		}
		return rows.sort((a, b) => String(b.last_message_at || "").localeCompare(String(a.last_message_at || "")));
	} catch (e) {
		throw e instanceof Error ? e : new Error(String(e));
	}
}
async function fetchDirectMessagesWordPress(conversationId) {
	try {
		const rels = await wordpressFetch(`jet-rel/${REL_CONV_MESSAGE}/children/${numId(conversationId)}`);
		if (!Array.isArray(rels) || rels.length === 0) return [];
		const messageIds = rels.map((r) => String(r.child_object_id)).filter(Boolean);
		const byId = /* @__PURE__ */ new Map();
		for (const m of await readLinkedCCTRows(MSG, messageIds)) byId.set(String(m.id ?? m._ID), m);
		return messageIds.map((id) => byId.get(id)).filter(Boolean).filter(Boolean).map((m) => ({
			id: String(m.id || m._ID),
			conversation_id: conversationId,
			sender_user_id: authorOf(m) ? `wp-${authorOf(m)}` : null,
			sender_id: authorOf(m) ? `wp-${authorOf(m)}` : null,
			receiver_user_id: null,
			content: m[MF.CHAT_MESSAGE_CONTENT] || "",
			message_type: m[MF.CHAT_MESSAGE_TYPE] === MT.IMAGE ? "image" : m[MF.CHAT_MESSAGE_TYPE] === MT.AI ? "ai" : m[MF.CHAT_MESSAGE_TYPE] === MT.SYSTEM_MESSAGE ? "system" : m[MF.CHAT_MESSAGE_TYPE] === MT.PRICE_CARD ? "price_card" : "text",
			created_at: m.created_at ?? m.cct_created ?? null
		})).sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));
	} catch (e) {
		throw e instanceof Error ? e : new Error(String(e));
	}
}
async function sendMessageWordPress(conversationId, content, _senderUserId, receiverUserId) {
	const created = await wordpressCCTFetch(MSG, {
		method: "POST",
		body: {
			[MF.CHAT_MESSAGE_CONTENT]: content,
			[MF.CHAT_MESSAGE_TYPE]: MT.TEXT
		}
	});
	const messageId = numId(created?.item_id || created?._ID || created?.id);
	const convoId = numId(conversationId);
	if (messageId && convoId) try {
		await wordpressFetch(`jet-rel/${REL_CONV_MESSAGE}`, {
			method: "POST",
			body: {
				parent_id: convoId,
				child_id: messageId,
				context: "child",
				store_items_type: "update"
			}
		});
	} catch (e) {
		console.warn(`[chat] jet-rel/${REL_CONV_MESSAGE} link failed (relation may not be registered):`, e);
	}
	try {
		await wordpressCCTFetch(CONV, {
			id: conversationId,
			method: "PUT",
			body: { [CF.LAST_MESSAGE_AT]: (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ") }
		});
	} catch {}
	try {
		let recipients = receiverUserId ? [receiverUserId] : [];
		if (convoId) {
			const memberIds = await fetchConversationMemberIds(String(convoId)).catch(() => []);
			if (memberIds.length > 0) recipients = memberIds;
		}
		const { notifyNewMessage } = await import("../_libs/_12.mjs").then((n) => n.n);
		await notifyNewMessage(recipients, String(conversationId), content);
	} catch {}
}
async function markMessagesReadWordPress(conversationId) {
	const me = getStoredWPUser();
	setReadMark(conversationId, void 0, me ? `wp-${me.user_id}` : null);
}
async function startConversationWordPress(otherUserId, currentUserId) {
	const me = numId(currentUserId);
	const other = numId(otherUserId);
	if (!me || !other) throw new Error("startConversation: missing user ids");
	if (me === other) throw new Error("Cannot start a conversation with yourself");
	try {
		const parentsOf = async (u) => new Set((await wordpressFetch(`jet-rel/${REL_CONV_MEMBER}/parents/${u}`) || []).map((r) => String(r.parent_object_id)));
		const [mine, theirs] = await Promise.all([parentsOf(me), parentsOf(other)]);
		const convos = filterAppScope("chatConversation", await readLinkedCCTRows(CONV, [...mine].filter((id) => theirs.has(id))));
		for (const c of convos) {
			if (c[CF.CHAT_TYPE] && c[CF.CHAT_TYPE] !== CT.ONE_TO_ONE) continue;
			const cid = String(c.id || c._ID);
			const memberIds = await fetchConversationMemberIds(cid);
			if (memberIds.length === 2 && memberIds.includes(me) && memberIds.includes(other)) return cid;
		}
	} catch {}
	const result = await wordpressCCTFetch(CONV, {
		method: "POST",
		body: {
			[CF.CHAT_TYPE]: CT.ONE_TO_ONE,
			[CF.CHAT_NAME]: "",
			[CF.LAST_MESSAGE_AT]: (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " "),
			...appScopeBody("chatConversation")
		}
	});
	const convoId = numId(result?.item_id || result?._ID || result?.id);
	if (!convoId) throw new Error("Failed to create conversation");
	await Promise.all([me, other].map((uid) => wordpressFetch(`jet-rel/${REL_CONV_MEMBER}`, {
		method: "POST",
		body: {
			parent_id: convoId,
			child_id: uid,
			context: "child",
			store_items_type: "update"
		}
	}).catch(() => {})));
	return String(convoId);
}
//#endregion
export { sendMessageWordPress as a, markMessagesReadWordPress as i, fetchDirectMessagesWordPress as n, source_wordpress_exports as o, getOrCreateGroupConversationWordPress as r, startConversationWordPress as s, fetchConversationsWordPress as t };
