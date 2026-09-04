import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { R, T } from "@/integrations/wp-schema";

/**
 * Comments are NOT addressable by entity_type/entity_id on the CCT itself.
 * Comment CCT (141) fields: a55=title, a56=content.
 * Comments are linked to entities via JetEngine relations (see wp-schema R):
 *   150 community post → comment
 *   143 review         → comment
 *   229 care group post → comment
 *   236 care task      → comment
 *   254 care job       → comment
 *   142 comment        → comment (replies)
 *
 * This module is a thin compatibility shim that maps entity_type → relation id.
 */

const ENTITY_REL: Record<string, number> = {
  care_community_post: R.communityPostComments,
  community_post: R.communityPostComments,
  post: R.communityPostComments,
  review: R.reviewComments,
  group_post: R.careGroupPostComments,
  care_group_post: R.careGroupPostComments,
  care_task: R.careTaskComments,
  care_task_real: R.careTaskComments,
  universal_care_task: R.careTaskComments,
  task: R.careTaskComments,
  comment: R.commentReplies,
};

function relForEntity(entityType: string): number | null {
  return ENTITY_REL[entityType] ?? null;
}


const stripWp = (v: string | number | null | undefined) =>
  v == null ? "" : String(v).replace(/^wp-/, "");

export async function fetchCommentsWordPress(entityType: string, entityId: string): Promise<any[]> {
  const relId = relForEntity(entityType);
  if (!relId) return [];
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${relId}/children/${stripWp(entityId)}`);
    if (!Array.isArray(rels) || rels.length === 0) return [];
    const ids = rels.map((r: any) => String(r.child_object_id)).filter(Boolean);
    const items = await Promise.all(ids.map(async (id) => {
      try { return await wordpressCCTFetch<any>(T.comment.slug, { id }); }
      catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
    }));
    return (items.filter(Boolean) as any[]).map((c: any) => ({
      id: String(c.id || c._ID),
      entity_type: entityType,
      entity_id: entityId,
      user_id: c.author_id || null,
      title: c[T.comment.f.TITLE] || "",
      content: c[T.comment.f.CONTENT] || "",
      parent_id: null,
      created_at: c.created_at,
      updated_at: c.updated_at,
      author: c.author_id ? { id: c.author_id, full_name: null, avatar_url: null } : null,
    }));
  } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
}

export async function createCommentWordPress(comment: { entity_type: string; entity_id: string; content: string; title?: string; parent_id?: string }): Promise<void> {
  const relId = comment.parent_id ? R.commentReplies : relForEntity(comment.entity_type);
  if (!relId) throw new Error(`Unsupported entity_type for comments: ${comment.entity_type}`);
  const result = await wordpressCCTFetch<any>(T.comment.slug, {
    method: "POST",
    body: { [T.comment.f.TITLE]: comment.title || "", [T.comment.f.CONTENT]: comment.content },
  });
  const commentId = Number(result?.item_id || result?._ID || result?.id);
  const parentId = Number(stripWp(comment.parent_id || comment.entity_id));
  if (commentId && parentId) {
    await wordpressFetch(`jet-rel/${relId}`, {
      method: "POST",
      body: { parent_id: parentId, child_id: commentId, context: "child", store_items_type: "update" },
    });
  }
}

export async function updateCommentWordPress(id: string, content: string): Promise<void> {
  await wordpressCCTFetch(T.comment.slug, { id, method: "PUT", body: { [T.comment.f.CONTENT]: content } });
}

export async function deleteCommentWordPress(id: string): Promise<void> {
  await wordpressCCTFetch(T.comment.slug, { id, method: "DELETE" });
}
