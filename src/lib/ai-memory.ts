/**
 * AI conversation memory standard.
 *
 * Two buckets only:
 *   1. Casual / companion chat: frontend-only, 10,000 char rolling window,
 *      no backend persistence, never attached to a cared-one record.
 *   2. Care-fact / one-shot: no conversation memory; fresh DB facts every call;
 *      only the outcome/conclusion is stored as a formal record.
 *
 * Shared-link visitors: nothing stored, ever.
 */

export const AI_MEMORY_CHAR_LIMIT = 10_000;

/**
 * Keep the newest messages whose total character count is within the limit.
 * Drops oldest messages first. Always keeps at least the last message so a
 * single long user prompt can still be sent.
 *
 * The count includes BOTH user messages and assistant replies — the model
 * sees the full conversation, not just what the user typed.
 */
export function trimMessagesToCharLimit<T extends { role: string; content?: string | null }>(
  messages: T[],
  limit = AI_MEMORY_CHAR_LIMIT
): T[] {
  if (!messages.length) return [];
  const chars = messages.map((m) => (m.content?.length ?? 0));
  let total = chars.reduce((a, b) => a + b, 0);
  let start = 0;
  while (total > limit && start < messages.length - 1) {
    total -= chars[start] ?? 0;
    start++;
  }
  return messages.slice(start);
}
