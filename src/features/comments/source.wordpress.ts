import { readLinkedCCTRows } from "@/features/shared/cct-rows";
import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { fetchRelChildrenOf, fetchRelChildrenMap } from "@/features/shared/rel-batch";
import { R, T } from "@/integrations/wp-schema";

/**
 * Comments — JetEngine CCT 141 "Comment" (a55 title, a56 content).
 *
 * A comment is attached to its parent ONLY through a JetEngine relation, and
 * callers address that relation by its dictionary number (from `R`), never by
 * an entity-name string:
 *   150  149. Community post        → 141. Comment   (R.communityPostComments)
 *   143  31.  Review                → 141. Comment   (R.reviewComments)
 *   229  202. Care group post       → 141. Comment   (R.careGroupPostComments)
 *   236  204. Care task             → 141. Comment   (R.careTaskComments)
 *   142  141. Comment               → 141. Comment   (R.commentReplies — second level)
 */
export const COMMENT_RELATIONS = [
  R.communityPostComments,
  R.reviewComments,
  R.careGroupPostComments,
  R.careTaskComments,
] as const;

const SLUG = T.comment.slug;
const F = T.comment.f;
const strip = (v: string | number | null | undefined) => (v == null ? "" : String(v).replace(/^wp-/, ""));

function assertCommentRelation(relationId: number) {
  if (!(COMMENT_RELATIONS as readonly number[]).includes(relationId)) {
    throw new Error(`Relation ${relationId} is not a comment relation (allowed: ${COMMENT_RELATIONS.join(", ")})`);
  }
}

export interface CommentRow {
  id: string;
  author_id: string | null;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  replies: CommentRow[];
}

async function loadMap(relationId: number) {
  const map = await fetchRelChildrenMap(relationId);
  if (!map.loaded) throw new Error(`Could not read JetEngine relation ${relationId}`);
  return map;
}

function mapComment(c: any): CommentRow {
  return {
    id: String(c.id ?? c._ID),
    author_id: c.author_id || c.cct_author_id ? String(c.author_id || c.cct_author_id).replace(/^wp-/, "") : null,
    title: c[F.TITLE] || "",
    content: c[F.CONTENT] || "",
    created_at: c.created_at,
    updated_at: c.updated_at,
    replies: [],
  };
}

async function readComments(ids: string[]): Promise<CommentRow[]> {
  if (ids.length === 0) return [];
  const rows = await readLinkedCCTRows(SLUG, ids);
  const byId = new Map(rows.map((row) => [String(row.id ?? row._ID), row]));
  return ids.map((id) => {
    const row = byId.get(id);
    if (!row) throw new Error(`Comment ${id} is linked but could not be read`);
    return mapComment(row);
  });
}

/** Top-level comments of one parent plus their REL 142 replies (two levels). */
export async function fetchCommentsWordPress(relationId: number, parentId: string): Promise<CommentRow[]> {
  assertCommentRelation(relationId);
  const ids = (await fetchRelChildrenOf(relationId, strip(parentId))).map((c) => c.childId);
  const [comments, replyLinks] = await Promise.all([
    readComments(ids),
    Promise.all(ids.map((id) => fetchRelChildrenOf(R.commentReplies, id))),
  ]);
  const replyIdsByComment = replyLinks.map((links) => links.map((link) => link.childId));
  const replies = await readComments(replyIdsByComment.flat());
  const repliesById = new Map(replies.map((reply) => [reply.id, reply]));
  comments.forEach((comment, index) => {
    comment.replies = (replyIdsByComment[index] || [])
      .map((id) => repliesById.get(id))
      .filter((reply): reply is CommentRow => Boolean(reply))
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  });
  return comments.sort((a, b) => a.created_at.localeCompare(b.created_at));
}

/**
 * Creates a CCT 141 row and links it. `relationId` is the parent's comment
 * relation; when `replyToCommentId` is given the link goes through REL 142 to
 * that comment instead. A failed link deletes the new row (no orphans).
 */
export async function createCommentWordPress(input: { relationId: number; parentId: string; content: string; title?: string | undefined; replyToCommentId?: string | undefined }): Promise<{ id: string }> {
  assertCommentRelation(input.relationId);
  const relId = input.replyToCommentId ? R.commentReplies : input.relationId;
  const parent = Number(strip(input.replyToCommentId || input.parentId));
  if (!Number.isFinite(parent) || parent <= 0) throw new Error(`Invalid parent id: ${input.replyToCommentId || input.parentId}`);

  const result = await wordpressCCTFetch<any>(SLUG, {
    method: "POST",
    body: { [F.TITLE]: input.title || "", [F.CONTENT]: input.content },
  });
  const commentId = Number(result?.item_id ?? result?._ID ?? result?.id);
  if (!Number.isFinite(commentId) || commentId <= 0) throw new Error("Comment was not created: backend returned no item id");
  try {
    await wordpressFetch(`jet-rel/${relId}`, {
      method: "POST",
      body: { parent_id: parent, child_id: commentId, context: "child", store_items_type: "update" },
    });
  } catch (e) {
    await wordpressCCTFetch(SLUG, { id: String(commentId), method: "DELETE" }).catch(() => undefined);
    throw e instanceof Error ? e : new Error(String(e));
  }
  return { id: String(commentId) };
}

export async function updateCommentWordPress(id: string, content: string): Promise<void> {
  await wordpressCCTFetch(SLUG, { id: strip(id), method: "PUT", body: { [F.CONTENT]: content } });
}

/** Deletes the comment and its REL 142 replies (the UI promises both). */
export async function deleteCommentWordPress(id: string): Promise<void> {
  const replies = await fetchRelChildrenOf(R.commentReplies, strip(id));
  await Promise.all(replies.map((reply) => wordpressCCTFetch(SLUG, { id: reply.childId, method: "DELETE" })));
  await wordpressCCTFetch(SLUG, { id: strip(id), method: "DELETE" });
}
