/**
 * Study notes & lesson-completion tracking.
 * Bible (§19):
 *   CCT 122 users_study_notes: a55=title, a56=content
 *   REL 158: challenged_content → users_study_notes (1:M)
 *   REL 157: users → challenged_content (1:M, "user finished learning lesson")
 *            Relation field a55 = USER_HAS_FINISHED_LEARNING_THIS_LESSON (b55 Yes | b56 No)
 */
import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { getCurrentUserIdNumber } from "@/features/shared/current-user";

const SLUG = "users_study_notes";
const REL_ARTICLE_NOTES = 256;
// Dictionary name "157. finished ChallengeD content" — live ID 167 (old 157 deleted & recreated)
const REL_USER_FINISHED = 255;

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  article_id: string;
  created_at?: string | null;
  updated_at?: string | null;
}

function normalizeArticleId(id: string | number): number {
  return Number(String(id).replace(/^wp-/, ""));
}

export async function fetchStudyNotesForArticle(articleId: string | number): Promise<StudyNote[]> {
  const aid = normalizeArticleId(articleId);
  const userId = getCurrentUserIdNumber();
  if (!aid) return [];
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_ARTICLE_NOTES}/children/${aid}`).catch(() => []);
    const noteIds = (Array.isArray(rels) ? rels : []).map((r: any) => Number(r.child_object_id)).filter(Boolean);
    if (noteIds.length === 0) return [];
    const fetched = await Promise.all(
      noteIds.map((nid) => wordpressCCTFetch<any>(SLUG, { id: nid }).catch(() => null))
    );
    return fetched
      .filter(Boolean)
      .filter((n: any) => !userId || Number(n.author_id) === userId)
      .map((n: any) => ({
        id: String(n.id ?? n._ID),
        title: n.a55 ?? "",
        content: n.a56 ?? "",
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
    body: { a55: input.title, a56: input.content },
  });
  const newId = Number(created?.item_id ?? created?._ID ?? created?.id ?? 0);
  if (!newId) return null;
  try {
    await wordpressFetch(`jet-rel/${REL_ARTICLE_NOTES}`, {
      method: "POST",
      body: { parent_id: aid, child_id: newId, context: "child", store_items_type: "update" },
    });
  } catch { /* non-fatal */ }
  return { id: String(newId), title: input.title, content: input.content, article_id: String(input.article_id) };
}

export async function updateStudyNote(id: string, patch: { title?: string; content?: string }): Promise<void> {
  const body: Record<string, any> = {};
  if (patch.title !== undefined) body.a55 = patch.title;
  if (patch.content !== undefined) body.a56 = patch.content;
  await wordpressCCTFetch(SLUG, { id, method: "PUT", body });
}

export async function deleteStudyNote(id: string): Promise<void> {
  await wordpressCCTFetch(SLUG, { id, method: "DELETE" });
}

export async function isLessonFinished(articleId: string | number): Promise<boolean> {
  const userId = getCurrentUserIdNumber();
  const aid = normalizeArticleId(articleId);
  if (!userId || !aid) return false;
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_USER_FINISHED}/children/${userId}`).catch(() => []);
    // Rel field a55=b55 means "Yes, finished"
    return (Array.isArray(rels) ? rels : []).some(
      (r: any) => Number(r.child_object_id) === aid && (r.a55 === "b55" || r.a55 === undefined),
    );
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
      body: { parent_id: userId, child_id: aid, context: "child", store_items_type: "update", meta: { a55: "b55" } },
    });
  } else {
    await wordpressFetch(`jet-rel/${REL_USER_FINISHED}`, {
      method: "DELETE",
      body: { parent_id: userId, child_id: aid },
    }).catch(() => undefined);
  }
}
