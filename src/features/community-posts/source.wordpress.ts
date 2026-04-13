import { wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { wordpressFetch } from "@/features/shared/wordpress-client";

// ─── Community Posts (CCT: care_community_post) ─────────────

const SLUG = "care_community_post";

// Relation IDs from JetEngine
const REL_POST_COMMENT = 71; // care_community_post → comment (many-to-many)
const REL_COMMENT_REPLY = 69; // comment → comment (many-to-many)

export async function fetchCommunityPostsWordPress(locale?: { area?: string; language?: string }): Promise<any[]> {
  try {
    const params: Record<string, string | number> = { _limit: 50, _orderby: "cct_created", _order: "desc" };
    if (locale?.area) params.app_area = locale.area;
    if (locale?.language) params.language = locale.language;
    const posts = await wordpressCCTFetch(SLUG, { params });
    if (!Array.isArray(posts)) return [];
    return posts.map((p: any) => ({
      id: p.id,
      title: p.title || "",
      content: p.content || "",
      author_id: p.author_id,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));
  } catch {
    return [];
  }
}

export async function fetchCommunityPostByIdWordPress(id: string): Promise<any | null> {
  try {
    const p = await wordpressCCTFetch(SLUG, { id });
    if (!p) return null;
    return {
      id: (p as any).id,
      title: (p as any).title || "",
      content: (p as any).content || "",
      author_id: (p as any).author_id,
      created_at: (p as any).created_at,
      updated_at: (p as any).updated_at,
    };
  } catch {
    return null;
  }
}

export async function createCommunityPostWordPress(post: {
  title: string;
  content: string;
}): Promise<{ id: string }> {
  const result = (await wordpressCCTFetch(SLUG, {
    method: "POST",
    body: { title: post.title, content: post.content },
  })) as any;
  return { id: String(result?.item_id || result?.id || result?._ID) };
}

export async function updateCommunityPostWordPress(
  id: string,
  updates: { title?: string; content?: string },
): Promise<void> {
  await wordpressCCTFetch(SLUG, { id, method: "PUT", body: updates });
}

export async function deleteCommunityPostWordPress(id: string): Promise<void> {
  await wordpressCCTFetch(SLUG, { id, method: "DELETE" });
}

// ─── Comments (CCT: comment) via relation endpoints ─────────

const COMMENT_SLUG = "comment";

/** Fetch a single comment CCT item by ID and normalize it */
async function fetchCommentById(id: string, parentId: string | null = null): Promise<any | null> {
  try {
    const item = await wordpressCCTFetch(COMMENT_SLUG, { id });
    if (!item || typeof item !== "object") return null;
    const c = item as any;
    return {
      id: String(c.id || id),
      title: c.title || "",
      content: c.content || "",
      author_id: c.author_id || null,
      created_at: c.created_at || null,
      updated_at: c.updated_at || null,
      parent_id: parentId,
    };
  } catch {
    return null;
  }
}

/** Fetch comments linked to a community post via relation 71 */
export async function fetchPostCommentsWordPress(postId: string): Promise<any[]> {
  try {
    const rels = await wordpressFetch<any[]>(
      `jet-rel/${REL_POST_COMMENT}/children/${postId}`,
    );
    if (!Array.isArray(rels)) return [];
    const ids = rels.map((r: any) => String(r.child_object_id)).filter(Boolean);
    const comments = await Promise.all(ids.map((id) => fetchCommentById(id, null)));
    return comments.filter(Boolean);
  } catch {
    return [];
  }
}

/** Fetch replies to a comment via relation 69 */
export async function fetchCommentRepliesWordPress(commentId: string): Promise<any[]> {
  try {
    const rels = await wordpressFetch<any[]>(
      `jet-rel/${REL_COMMENT_REPLY}/children/${commentId}`,
    );
    if (!Array.isArray(rels)) return [];
    const ids = rels.map((r: any) => String(r.child_object_id)).filter(Boolean);
    const replies = await Promise.all(ids.map((id) => fetchCommentById(id, commentId)));
    return replies.filter(Boolean);
  } catch {
    return [];
  }
}

/** Create a comment CCT item and link it to a community post via relation 71 */
export async function createPostCommentWordPress(
  postId: string,
  comment: { content: string },
): Promise<{ id: string }> {
  // 1. Create the comment CCT item
  const result = (await wordpressCCTFetch(COMMENT_SLUG, {
    method: "POST",
    body: { title: "", content: comment.content },
  })) as any;
  const commentId = String(result?.item_id || result?.id || result?._ID);

  // 2. Link it to the post via relation 71
  await wordpressFetch(`jet-rel/${REL_POST_COMMENT}`, {
    method: "POST",
    body: {
      parent_id: Number(postId),
      child_id: Number(commentId),
      context: "child",
      store_items_type: "update",
    },
  });

  return { id: commentId };
}

/** Create a reply to a comment and link it via relation 69 */
export async function createCommentReplyWordPress(
  parentCommentId: string,
  reply: { content: string },
): Promise<{ id: string }> {
  // 1. Create the reply CCT item
  const result = (await wordpressCCTFetch(COMMENT_SLUG, {
    method: "POST",
    body: { title: "", content: reply.content },
  })) as any;
  const replyId = String(result?.item_id || result?.id || result?._ID);

  // 2. Link it to the parent comment via relation 69
  await wordpressFetch(`jet-rel/${REL_COMMENT_REPLY}`, {
    method: "POST",
    body: {
      parent_id: Number(parentCommentId),
      child_id: Number(replyId),
      context: "child",
      store_items_type: "update",
    },
  });

  return { id: replyId };
}

/** Update a comment CCT item */
export async function updateCommentCCTWordPress(
  id: string,
  updates: { content?: string },
): Promise<void> {
  await wordpressCCTFetch(COMMENT_SLUG, { id, method: "PUT", body: updates });
}

/** Delete a comment CCT item */
export async function deleteCommentCCTWordPress(id: string): Promise<void> {
  await wordpressCCTFetch(COMMENT_SLUG, { id, method: "DELETE" });
}
