/**
 * Votes — JetEngine CCT 30 "Vote" (a55: b55 = Upvote, b56 = Downvote).
 *
 * A vote row is linked to what it votes on ONLY through a JetEngine relation,
 * addressed by its dictionary number:
 *   166  149. Community post → 30. Vote   (R.communityPostVotes)
 *   167  141. Comment        → 30. Vote   (R.commentVotes)
 *
 * The voter is the vote row's own JetEngine author (cct_author_id), a native
 * CCT column — no custom user/vote link is invented.
 */
import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { readLinkedCCTRows } from "@/features/shared/cct-rows";
import { fetchRelChildrenOf } from "@/features/shared/rel-batch";
import { getCurrentUserId } from "@/features/shared/current-user";
import { R, T } from "@/integrations/wp-schema";

export type VoteSummary = { score: number; upvotes: number; downvotes: number; userVote: -1 | 0 | 1 };

/** Relation numbers that may carry votes. Anything else is a caller bug. */
export const VOTE_RELATIONS = [R.communityPostVotes, R.commentVotes] as const;
export type VoteRelation = (typeof VOTE_RELATIONS)[number];

const SLUG = T.vote.slug;
const F = T.vote.f.UPVOTE_OR_DOWNVOTE;
const UP = T.vote.opt.UPVOTE_OR_DOWNVOTE.UPVOTE;
const DOWN = T.vote.opt.UPVOTE_OR_DOWNVOTE.DOWNVOTE;

const strip = (v: string | number) => String(v).replace(/^wp-/, "");

function assertRelation(relationId: number): asserts relationId is VoteRelation {
  if (!(VOTE_RELATIONS as readonly number[]).includes(relationId)) {
    throw new Error(`Relation ${relationId} is not a vote relation (allowed: ${VOTE_RELATIONS.join(", ")})`);
  }
}

interface VoteRow { id: string; value: -1 | 1 | 0; authorId: string | null }

function toRow(raw: any): VoteRow {
  const code = String(raw?.[F] ?? "");
  // Only the dictionary codes count. Anything else (e.g. a legacy row holding
  // the literal text "Upvote") is not a valid vote and is not counted.
  const value = code === UP ? 1 : code === DOWN ? -1 : 0;
  return { id: String(raw.id ?? raw._ID), value, authorId: raw.author_id ?? (raw.cct_author_id != null ? String(raw.cct_author_id) : null) };
}

async function fetchVoteRows(ids: string[]): Promise<VoteRow[]> {
  if (ids.length === 0) return [];
  const rows = await readLinkedCCTRows(SLUG, ids);
  const byId = new Map(rows.map((row) => [String(row.id ?? row._ID), row]));
  return ids.flatMap((id) => {
    const row = byId.get(id);
    return row ? [toRow(row)] : [];
  });
}

/** Pure tally — exported for tests. */
export function summarize(rows: Array<Pick<VoteRow, "value" | "authorId">>, me: string | null): VoteSummary {
  let upvotes = 0, downvotes = 0, userVote: -1 | 0 | 1 = 0;
  for (const r of rows) {
    if (r.value === 1) upvotes++;
    else if (r.value === -1) downvotes++;
    if (me && r.authorId === me && r.value !== 0) userVote = r.value;
  }
  return { score: upvotes - downvotes, upvotes, downvotes, userVote };
}

export async function fetchVoteSummaries(relationId: number, parentIds: string[]): Promise<Record<string, VoteSummary>> {
  assertRelation(relationId);
  const me = getCurrentUserId() ? strip(getCurrentUserId()!) : null;
  const out: Record<string, VoteSummary> = {};
  const linked = await Promise.all(parentIds.map(async (parentId) => ({
    parentId,
    childIds: (await fetchRelChildrenOf(relationId, strip(parentId))).map((child) => child.childId),
  })));
  const voteIds = [...new Set(linked.flatMap((item) => item.childIds))];
  const voteRows = await fetchVoteRows(voteIds);
  const rowsById = new Map(voteRows.map((row) => [row.id, row]));
  for (const item of linked) {
    const rows = item.childIds
      .map((id) => rowsById.get(id))
      .filter((row): row is VoteRow => Boolean(row));
    out[item.parentId] = summarize(rows, me);
  }
  return out;
}

export async function fetchVoteSummary(relationId: number, parentId: string): Promise<VoteSummary> {
  const all = await fetchVoteSummaries(relationId, [parentId]);
  return all[parentId]!;
}

/**
 * Same value again = remove my vote; other value = switch; none = create.
 * Create writes the CCT 30 row and then links it through the relation; if the
 * link fails the new row is deleted so no orphan vote is left behind.
 */
export async function toggleVote(relationId: number, parentId: string, value: -1 | 1): Promise<void> {
  assertRelation(relationId);
  const meRaw = getCurrentUserId();
  if (!meRaw) throw new Error("Please sign in to vote");
  const me = strip(meRaw);
  const parent = Number(strip(parentId));
  if (!Number.isFinite(parent) || parent <= 0) throw new Error(`Invalid item id: ${parentId}`);

  const children = await fetchRelChildrenOf(relationId, parent);
  const rows = await fetchVoteRows(children.map((child) => child.childId));
  const mine = rows.filter((r) => r.authorId === me);

  if (mine.length) {
    const [first, ...extra] = mine;
    if (first!.value === value) {
      for (const r of mine) await removeVote(relationId, parent, r.id);
      return;
    }
    await wordpressCCTFetch(SLUG, { id: first!.id, method: "PUT", body: { [F]: value === 1 ? UP : DOWN } });
    for (const r of extra) await removeVote(relationId, parent, r.id);
    return;
  }

  const created = await wordpressCCTFetch<any>(SLUG, { method: "POST", body: { [F]: value === 1 ? UP : DOWN } });
  const voteId = Number(created?.item_id ?? created?._ID ?? created?.id);
  if (!Number.isFinite(voteId) || voteId <= 0) throw new Error("Vote was not created: backend returned no item id");
  try {
    await wordpressFetch(`jet-rel/${relationId}`, {
      method: "POST",
      body: { parent_id: parent, child_id: voteId, context: "child", store_items_type: "update" },
    });
  } catch (e) {
    await wordpressCCTFetch(SLUG, { id: String(voteId), method: "DELETE" }).catch(() => undefined);
    throw e instanceof Error ? e : new Error(String(e));
  }
}

async function removeVote(relationId: number, parent: number, voteId: string) {
  await wordpressFetch(`jet-rel/${relationId}`, {
    method: "POST",
    body: { parent_id: parent, child_id: Number(voteId), context: "child", store_items_type: "disconnect" },
  });
  await wordpressCCTFetch(SLUG, { id: voteId, method: "DELETE" });
}
