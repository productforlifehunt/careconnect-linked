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
const KEY = "chat-read-marks-v1";

type Marks = Record<string, string>;

function load(): Marks {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as Marks) : {};
  } catch {
    return {};
  }
}

function save(marks: Marks) {
  try {
    localStorage.setItem(KEY, JSON.stringify(marks));
  } catch {
    /* storage full or blocked — badges just stay visible */
  }
}

/** Timestamp of the newest message the user has seen in this conversation. */
export function getReadMark(conversationId: string | number, userId?: string | null): string {
  return load()[`${String(userId ?? "").replace(/^wp-/, "")}:${conversationId}`] || "";
}

/** Remember that everything up to `at` (default: now) has been seen. */
export function setReadMark(conversationId: string | number, at?: string | null | undefined, userId?: string | null) {
  const marks = load();
  marks[`${String(userId ?? "").replace(/^wp-/, "")}:${conversationId}`] = at || new Date().toISOString();
  save(marks);
}

/**
 * 1 when the conversation has something new for me, 0 otherwise.
 * Only the newest message is known in the batched list read, so this is a
 * per-conversation flag rather than an exact message count.
 */
export function unreadFlag(
  conversationId: string | number,
  lastMessage: { sender_id?: string | null | undefined; created_at?: string | null | undefined } | null,
  myId: string | null | undefined,
): number {
  if (!lastMessage?.created_at) return 0;
  const normalize = (id: string) => id.replace(/^wp-/, "");
  if (myId && lastMessage.sender_id && normalize(lastMessage.sender_id) === normalize(myId)) return 0;
  const mark = getReadMark(conversationId, myId);
  const messageTime = Date.parse(lastMessage.created_at);
  if (!Number.isFinite(messageTime)) return 0;
  const readTime = Date.parse(mark);
  return !Number.isFinite(readTime) || messageTime > readTime ? 1 : 0;
}
