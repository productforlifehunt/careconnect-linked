/**
 * Study notes & lesson-completion tracking for the ChallengeD Knowledge Hub.
 *
 * - CCT slug: `users_study_notes` (fields: title, content)
 * - REL 158: challenged_content (parent) → users_study_notes (child) — 1:M
 * - REL 157: users (parent) → challenged_content (child) — 1:M
 *           Marks "user has finished this learn lesson"
 *
 * The `users_study_notes` CCT has no native owner field, so:
 *   - We resolve a note's author from `cct_author_id` (the WP user that POSTed it).
 *   - We filter to only the current user's notes on the client.
 */
import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { getCurrentUserIdNumber } from "@/features/shared/current-user";

const SLUG = "users_study_notes";
const REL_ARTICLE_NOTES = 158;
const REL_USER_FINISHED = 157;

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  article_id: string; // local-only resolved value
  created_at?: string | null;
  updated_at?: string | null;
}

function normalizeArticleId(id: string | number): number {
  return Number(String(id).replace(/^wp-/, ""));
}

/** All notes the current user has written for one article. */
export async function fetchStudyNotesForArticle(articleId: string | number): Promise<StudyNote[]> {
  const aid = normalizeArticleId(articleId);
  const userId = getCurrentUserIdNumber();
  if (!aid) return [];
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_ARTICLE_NOTES}/children/${aid}`).catch(() => []);
    const noteIds = (Array.isArray(rels) ? rels : [])
      .map((r: any) => Number(r.child_object_id))
      .filter(Boolean);
    if (noteIds.length === 0) return [];
    const fetched = await Promise.all(
      noteIds.map((nid) => wordpressCCTFetch<any>(SLUG, { id: nid }).catch(() => null))
    );
    return fetched
      .filter(Boolean)
      .filter((n: any) => !userId || Number(n.author_id) === userId)
      .map((n: any) => ({
        id: String(n.id ?? n._ID),
        title: n.title ?? "",
        content: n.content ?? "",
        article_id: String(articleId),
        created_at: n.created_at ?? null,
        updated_at: n.updated_at ?? null,
      }));
  } catch {
    return [];
  }
}

export async function createStudyNote(input: {
  article_id: string | number;
  title: string;
  content: string;
}): Promise<StudyNote | null> {
  const aid = normalizeArticleId(input.article_id);
  if (!aid) return null;
  const created: any = await wordpressCCTFetch(SLUG, {
    method: "POST",
    body: { title: input.title, content: input.content },
  });
  const newId = Number(created?.item_id ?? created?._ID ?? created?.id ?? 0);
  if (!newId) return null;
  // Link article → note via REL 158
  try {
    await wordpressFetch(`jet-rel/${REL_ARTICLE_NOTES}`, {
      method: "POST",
      body: { parent_id: aid, child_id: newId, context: "child", store_items_type: "update" },
    });
  } catch { /* non-fatal */ }
  return {
    id: String(newId),
    title: input.title,
    content: input.content,
    article_id: String(input.article_id),
  };
}

export async function updateStudyNote(id: string, patch: { title?: string; content?: string }): Promise<void> {
  await wordpressCCTFetch(SLUG, { id, method: "PUT", body: patch });
}

export async function deleteStudyNote(id: string): Promise<void> {
  await wordpressCCTFetch(SLUG, { id, method: "DELETE" });
}

/** Whether the current user has marked a learn lesson as finished (REL 157). */
export async function isLessonFinished(articleId: string | number): Promise<boolean> {
  const userId = getCurrentUserIdNumber();
  const aid = normalizeArticleId(articleId);
  if (!userId || !aid) return false;
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_USER_FINISHED}/children/${userId}`).catch(() => []);
    return (Array.isArray(rels) ? rels : []).some((r: any) => Number(r.child_object_id) === aid);
  } catch {
    return false;
  }
}

export async function markLessonFinished(articleId: string | number, finished = true): Promise<void> {
  const userId = getCurrentUserIdNumber();
  const aid = normalizeArticleId(articleId);
  if (!userId || !aid) return;
  if (finished) {
    await wordpressFetch(`jet-rel/${REL_USER_FINISHED}`, {
      method: "POST",
      body: { parent_id: userId, child_id: aid, context: "child", store_items_type: "update" },
    });
  } else {
    await wordpressFetch(`jet-rel/${REL_USER_FINISHED}`, {
      method: "DELETE",
      body: { parent_id: userId, child_id: aid },
    }).catch(() => undefined);
  }
}
