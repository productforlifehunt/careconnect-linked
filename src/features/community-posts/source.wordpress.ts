import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";

// ─── Community Posts (CCT: care_community_post) ─────────────
// Live fields: a55=title, a56=content, a57=language, a58=app area, a59=category

const SLUG = "care_community_post";

// Live JetEngine relations
const REL_POST_COMMENT = 229;   // 1:M care_community_post → comment
const REL_COMMENT_REPLY = 142;  // M:M comment → comment

export async function fetchCommunityPostsWordPress(locale?: { area?: string; language?: string; category?: string }): Promise<any[]> {
  try {
    const params: Record<string, string | number> = { _limit: 50 };
    if (locale?.area) params.a58 = locale.area;
    if (locale?.language) params.a57 = locale.language;
    if (locale?.category) params.a59 = locale.category;
    const posts = await wordpressCCTFetch<any[]>(SLUG, { params });
    if (!Array.isArray(posts)) return [];
    return posts.map((p: any) => ({
      id: p.id,
      title: p.a55 || "",
      content: p.a56 || "",
      app_area: p.a58 || null,
      language: p.a57 || null,
      category: p.a59 || null,
      author_id: p.author_id,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));
  } catch { return []; }
}

export async function fetchCommunityPostByIdWordPress(id: string): Promise<any | null> {
  try {
    const p: any = await wordpressCCTFetch(SLUG, { id });
    if (!p) return null;
    return {
      id: p.id,
      title: p.a55 || "",
      content: p.a56 || "",
      app_area: p.a58 || null,
      language: p.a57 || null,
      category: p.a59 || null,
      author_id: p.author_id,
      created_at: p.created_at,
      updated_at: p.updated_at,
    };
  } catch { return null; }
}

export async function createCommunityPostWordPress(post: {
  title: string;
  content: string;
  app_area?: string;
  language?: string;
  category?: string;
}): Promise<{ id: string }> {
  const result = (await wordpressCCTFetch(SLUG, {
    method: "POST",
    body: {
      a55: post.title,
      a56: post.content,
      a58: post.app_area || "",
      a57: post.language || "",
      a59: post.category || "",
    },
  })) as any;
  return { id: String(result?.item_id || result?.id || result?._ID) };
}

export async function updateCommunityPostWordPress(
  id: string,
  updates: { title?: string; content?: string; app_area?: string; language?: string; category?: string },
): Promise<void> {
  const body: Record<string, any> = {};
  if (updates.title !== undefined) body.a55 = updates.title;
  if (updates.content !== undefined) body.a56 = updates.content;
  if (updates.app_area !== undefined) body.a58 = updates.app_area;
  if (updates.language !== undefined) body.a57 = updates.language;
  if (updates.category !== undefined) body.a59 = updates.category;
  await wordpressCCTFetch(SLUG, { id, method: "PUT", body });
}

export async function deleteCommunityPostWordPress(id: string): Promise<void> {
  await wordpressCCTFetch(SLUG, { id, method: "DELETE" });
}

// ─── Comments (CCT: comment) via JetEngine relations ────────
// Live fields: title, content. Linked to entities ONLY via relations.

const COMMENT_SLUG = "comment";

async function fetchCommentById(id: string, parentId: string | null = null): Promise<any | null> {
  try {
    const c: any = await wordpressCCTFetch(COMMENT_SLUG, { id });
    if (!c) return null;
    return {
      id: String(c.id || id),
      title: c.a55 || "",
      content: c.a56 || "",
      author_id: c.author_id || null,
      created_at: c.created_at || null,
      updated_at: c.updated_at || null,
      parent_id: parentId,
    };
  } catch { return null; }
}

export async function fetchPostCommentsWordPress(postId: string): Promise<any[]> {
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_POST_COMMENT}/children/${postId}`);
    if (!Array.isArray(rels)) return [];
    const ids = rels.map((r: any) => String(r.child_object_id)).filter(Boolean);
    const comments = await Promise.all(ids.map((id) => fetchCommentById(id, null)));
    return comments.filter(Boolean);
  } catch { return []; }
}

export async function fetchCommentRepliesWordPress(commentId: string): Promise<any[]> {
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_COMMENT_REPLY}/children/${commentId}`);
    if (!Array.isArray(rels)) return [];
    const ids = rels.map((r: any) => String(r.child_object_id)).filter(Boolean);
    const replies = await Promise.all(ids.map((id) => fetchCommentById(id, commentId)));
    return replies.filter(Boolean);
  } catch { return []; }
}

export async function createPostCommentWordPress(
  postId: string,
  comment: { content: string; title?: string },
): Promise<{ id: string }> {
  const result = (await wordpressCCTFetch(COMMENT_SLUG, {
    method: "POST",
    body: { a55: comment.title || "", a56: comment.content },
  })) as any;
  const commentId = String(result?.item_id || result?.id || result?._ID);
  await wordpressFetch(`jet-rel/${REL_POST_COMMENT}`, {
    method: "POST",
    body: { parent_id: Number(postId), child_id: Number(commentId), context: "child", store_items_type: "update" },
  });
  return { id: commentId };
}

export async function createCommentReplyWordPress(
  parentCommentId: string,
  reply: { content: string; title?: string },
): Promise<{ id: string }> {
  const result = (await wordpressCCTFetch(COMMENT_SLUG, {
    method: "POST",
    body: { a55: reply.title || "", a56: reply.content },
  })) as any;
  const replyId = String(result?.item_id || result?.id || result?._ID);
  await wordpressFetch(`jet-rel/${REL_COMMENT_REPLY}`, {
    method: "POST",
    body: { parent_id: Number(parentCommentId), child_id: Number(replyId), context: "child", store_items_type: "update" },
  });
  return { id: replyId };
}

export async function updateCommentCCTWordPress(
  id: string,
  updates: { content?: string; title?: string },
): Promise<void> {
  const body: Record<string, any> = {};
  if (updates.title !== undefined) body.a55 = updates.title;
  if (updates.content !== undefined) body.a56 = updates.content;
  await wordpressCCTFetch(COMMENT_SLUG, { id, method: "PUT", body });
}

export async function deleteCommentCCTWordPress(id: string): Promise<void> {
  await wordpressCCTFetch(COMMENT_SLUG, { id, method: "DELETE" });
}
