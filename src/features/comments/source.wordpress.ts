import { wordpressCCTFetch } from "@/features/shared/wordpress-client";

// CCT slug: cc_comment | flat fields
export async function fetchCommentsWordPress(entityType: string, entityId: string): Promise<any[]> {
  try {
    const comments = await wordpressCCTFetch("comment", {
      params: { entity_type: entityType, entity_id: entityId, _limit: 100 },
    });
    if (!Array.isArray(comments)) return [];
    return comments.map((c: any) => ({
      id: c.id,
      entity_type: c.entity_type || entityType,
      entity_id: c.entity_id || entityId,
      user_id: c.user_id || null,
      content: c.content || "",
      parent_id: c.parent_id || null,
      created_at: c.created_at,
      updated_at: c.updated_at,
      author: c.author_name ? { id: c.user_id, full_name: c.author_name, avatar_url: c.author_avatar || null } : null,
    }));
  } catch { return []; }
}

export async function createCommentWordPress(comment: { entity_type: string; entity_id: string; content: string; parent_id?: string }): Promise<void> {
  await wordpressCCTFetch("comment", {
    method: "POST",
    body: { entity_type: comment.entity_type, entity_id: comment.entity_id, content: comment.content, parent_id: comment.parent_id || null },
  });
}

export async function updateCommentWordPress(id: string, content: string): Promise<void> {
  await wordpressCCTFetch("comment", { id, method: "PUT", body: { content } });
}

export async function deleteCommentWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("comment", { id, method: "DELETE" });
}
