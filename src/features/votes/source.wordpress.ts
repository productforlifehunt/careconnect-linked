/**
 * Votes feature — DEPRECATED at the data layer.
 *
 * The `cc_vote` CCT does not exist in the current data dictionary
 * (latest 最新数据字典.md, 47 relations / 30+ CCTs). The previous
 * voting model was removed and has no canonical replacement yet —
 * voting/reactions for community posts, reviews, etc. are not part
 * of the current truth.
 *
 * This module is kept as a no-op stub so existing UI imports continue
 * to compile; all reads return empty summaries and all writes silently
 * succeed. When the data dictionary re-introduces a vote/reaction CCT,
 * wire this file up to it (using opaque a-codes per WP.cct[*].fields).
 */

type VoteSummary = { score: number; upvotes: number; downvotes: number; userVote: -1 | 0 | 1 };

const empty = (): VoteSummary => ({ score: 0, upvotes: 0, downvotes: 0, userVote: 0 });

export async function fetchVotesWordPress(_entityType: string, entityIds: string[]): Promise<Record<string, VoteSummary>> {
  const out: Record<string, VoteSummary> = {};
  for (const id of entityIds) out[id] = empty();
  return out;
}

export async function fetchEntityVoteWordPress(_entityType: string, _entityId: string): Promise<VoteSummary> {
  return empty();
}

export async function toggleVoteWordPress(_entityType: string, _entityId: string, _value: -1 | 1): Promise<void> {
  // No-op: cc_vote CCT not present in current data dictionary.
}
