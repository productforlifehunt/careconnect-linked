import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { T, R } from "@/integrations/wp-schema";
import { communityTypeCode } from "@/features/shared/app-scope";

// ─── Community Posts (CCT 149 "Afresh community post") ──────
// Shared across apps: the "Community type" radio scopes rows to ChallengeD /
// Care-CNC, so every read filters and every write stamps it.

const SLUG = T.afreshCommunityPost.slug;
const F = T.afreshCommunityPost.f;

// JetEngine relations
const REL_POST_COMMENT = R.communityPostComments; // 1:M community post → comment
const REL_COMMENT_REPLY = R.commentReplies;       // M:M comment → comment

export async function fetchCommunityPostsWordPress(locale?: { area?: string; language?: string; category?: string }): Promise<any[]> {
  try {
    const params: Record<string, string | number> = { _limit: 50 };
    params[F.COMMUNITY_TYPE] = communityTypeCode();
    if (locale?.area) params[F.APP_AREA] = locale.area;
    if (locale?.language) params[F.LANGUAGE] = locale.language;
    if (locale?.category) params[F.COMMUNITY_POST_CATEGORY] = locale.category;
    const posts = await wordpressCCTFetch<any[]>(SLUG, { params });
    if (!Array.isArray(posts)) return [];
    return posts.map((p: any) => ({
      id: p.id,
      title: p[F.TITLE] || "",
      content: p[F.CONTENT] || "",
      community_type: p[F.COMMUNITY_TYPE] || null,
      app_area: p[F.APP_AREA] || null,
      language: p[F.LANGUAGE] || null,
      category: p[F.COMMUNITY_POST_CATEGORY] || null,
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
      title: p[F.TITLE] || "",
      content: p[F.CONTENT] || "",
      community_type: p[F.COMMUNITY_TYPE] || null,
      app_area: p[F.APP_AREA] || null,
      language: p[F.LANGUAGE] || null,
      category: p[F.COMMUNITY_POST_CATEGORY] || null,
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
      [F.TITLE]: post.title,
      [F.CONTENT]: post.content,
      [F.COMMUNITY_TYPE]: communityTypeCode(),
      [F.APP_AREA]: post.app_area || "",
      [F.LANGUAGE]: post.language || "",
      [F.COMMUNITY_POST_CATEGORY]: post.category || "",
    },
  })) as any;
  return { id: String(result?.item_id || result?.id || result?._ID) };
}

export async function updateCommunityPostWordPress(
  id: string,
  updates: { title?: string; content?: string; app_area?: string; language?: string; category?: string },
): Promise<void> {
  const body: Record<string, any> = {};
  if (updates.title !== undefined) body[F.TITLE] = updates.title;
  if (updates.content !== undefined) body[F.CONTENT] = updates.content;
  if (updates.app_area !== undefined) body[F.APP_AREA] = updates.app_area;
  if (updates.language !== undefined) body[F.LANGUAGE] = updates.language;
  if (updates.category !== undefined) body[F.COMMUNITY_POST_CATEGORY] = updates.category;
  await wordpressCCTFetch(SLUG, { id, method: "PUT", body });
}

export async function deleteCommunityPostWordPress(id: string): Promise<void> {
  await wordpressCCTFetch(SLUG, { id, method: "DELETE" });
}

// ─── Comments (CCT: comment) via JetEngine relations ────────
// Live fields: title, content. Linked to entities ONLY via relations.

const COMMENT_SLUG = T.comment.slug;
const CF = T.comment.f;

async function fetchCommentById(id: string, parentId: string | null = null): Promise<any | null> {
  try {
    const c: any = await wordpressCCTFetch(COMMENT_SLUG, { id });
    if (!c) return null;
    return {
      id: String(c.id || id),
      title: c[CF.TITLE] || "",
      content: c[CF.CONTENT] || "",
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
    body: { [CF.TITLE]: comment.title || "", [CF.CONTENT]: comment.content },
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
    body: { [CF.TITLE]: reply.title || "", [CF.CONTENT]: reply.content },
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
  if (updates.title !== undefined) body[CF.TITLE] = updates.title;
  if (updates.content !== undefined) body[CF.CONTENT] = updates.content;
  await wordpressCCTFetch(COMMENT_SLUG, { id, method: "PUT", body });
}

export async function deleteCommentCCTWordPress(id: string): Promise<void> {
  await wordpressCCTFetch(COMMENT_SLUG, { id, method: "DELETE" });
}
