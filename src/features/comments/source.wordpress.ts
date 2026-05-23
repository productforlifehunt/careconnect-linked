import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";

/**
 * Comments are NOT addressable by entity_type/entity_id on the CCT itself.
 * Live `comment` CCT fields: a55=title, a56=content.
 * Comments are linked to entities via JetEngine relations:
 *   REL 71  care_community_post → comment
 *   REL 68  review              → comment
 *   REL 78  care_group_not_too_special_post → comment
 *   REL 82  universal_care_task → comment
 *   REL 156 care_job            → comment
 *   REL 69  comment             → comment (replies)
 *
 * This module is a thin compatibility shim that maps entity_type → relation id.
 */

const ENTITY_REL: Record<string, number> = {
  care_community_post: 71,
  community_post: 71,
  post: 71,
  review: 68,
  group_post: 78,
  care_group_post: 78,
  care_task: 82,
  care_task_real: 82,
  universal_care_task: 82,
  task: 82,
  job: 156,
  care_job: 156,
  comment: 69,
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
      try { return await wordpressCCTFetch<any>("comment", { id }); }
      catch { return null; }
    }));
    return (items.filter(Boolean) as any[]).map((c: any) => ({
      id: String(c.id || c._ID),
      entity_type: entityType,
      entity_id: entityId,
      user_id: c.author_id || null,
      title: c.a55 || "",
      content: c.a56 || "",
      parent_id: null,
      created_at: c.created_at,
      updated_at: c.updated_at,
      author: c.author_id ? { id: c.author_id, full_name: null, avatar_url: null } : null,
    }));
  } catch { return []; }
}

export async function createCommentWordPress(comment: { entity_type: string; entity_id: string; content: string; title?: string; parent_id?: string }): Promise<void> {
  const relId = comment.parent_id ? 69 : relForEntity(comment.entity_type);
  if (!relId) throw new Error(`Unsupported entity_type for comments: ${comment.entity_type}`);
  const result = await wordpressCCTFetch<any>("comment", {
    method: "POST",
    body: { a55: comment.title || "", a56: comment.content },
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
  await wordpressCCTFetch("comment", { id, method: "PUT", body: { a56: content } });
}

export async function deleteCommentWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("comment", { id, method: "DELETE" });
}
