/**
 * Study notes & lesson-completion tracking.
 * Data dictionary (the only source of truth):
 *   CCT 218 `study_notes` — a55 Title, a56 Content
 *   REL 256: 217. Challenged App Content → 218. User's study notes (1:M, no meta)
 *   REL 255: Users → 217. Challenged App Content (1:M)
 *            meta a55 = "User has finished learning this lesson" { b55 Yes | b56 No }
 */
import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { getCurrentUserIdNumber } from "@/features/shared/current-user";
import { R, T, WP } from "@/integrations/wp-schema";

const SLUG = T.studyNote.slug;
const F = { title: T.studyNote.f.TITLE, content: T.studyNote.f.CONTENT };
const REL_ARTICLE_NOTES = R.contentStudyNotes;
const REL_USER_FINISHED = R.userFinishedContent;
const REL255 = WP.rel["255"] as unknown as {
  f: Record<string, string>;
  opt: Record<string, Record<string, string>>;
};
const FINISHED_FIELD = REL255.f.USER_HAS_FINISHED_LEARNING_THIS_LESSON;
const FINISHED_YES = REL255.opt.USER_HAS_FINISHED_LEARNING_THIS_LESSON.YES;


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
        title: n[F.title] ?? "",
        content: n[F.content] ?? "",
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
    body: { [F.title]: input.title, [F.content]: input.content },
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
  if (patch.title !== undefined) body[F.title] = patch.title;
  if (patch.content !== undefined) body[F.content] = patch.content;
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
    // Relation meta: FINISHED_FIELD === "Yes" means the lesson is done.
    return (Array.isArray(rels) ? rels : []).some((r: any) => {
      if (Number(r.child_object_id) !== aid) return false;
      const v = r?.meta?.[FINISHED_FIELD] ?? r?.[FINISHED_FIELD];
      return v === undefined || String(v) === FINISHED_YES;
    });
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
      body: { parent_id: userId, child_id: aid, context: "child", store_items_type: "update", meta: { [FINISHED_FIELD]: FINISHED_YES } },
    });
  } else {
    await wordpressFetch(`jet-rel/${REL_USER_FINISHED}`, {
      method: "DELETE",
      body: { parent_id: userId, child_id: aid },
    }).catch(() => undefined);
  }
}
