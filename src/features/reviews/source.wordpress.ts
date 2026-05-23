/**
 * Reviews — JetEngine CCT 65 `review` (bible §16).
 *   Fields: a55=title, a56=content, a57=rating
 *   Relations:
 *     66: care_facility → review  (1:M)
 *     68: review → comment        (1:M)
 *   Author = JetEngine default author.
 */
import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";

const SLUG = "review";
const REL_FACILITY_REVIEW = 66;

const stripWp = (v: string | number) => String(v).replace(/^wp-/, "");

function mapReview(r: any) {
  return {
    id: String(r.id || r._ID),
    title: r.a55 || "",
    content: r.a56 || "",
    rating: r.a57 != null ? Number(r.a57) : null,
    author_id: r.author_id ? `wp-${r.author_id}` : null,
    created_at: r.cct_created || r.created_at,
    updated_at: r.cct_modified || r.updated_at,
  };
}

export async function fetchEntityReviewsWordPress(entityId?: string): Promise<any[]> {
  try {
    if (!entityId) {
      const all = await wordpressCCTFetch<any[]>(SLUG, { params: { _limit: 100 } });
      return Array.isArray(all) ? all.map(mapReview) : [];
    }
    // Fetch reviews linked to this facility via Rel 66
    const parentId = stripWp(entityId);
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_FACILITY_REVIEW}/children/${parentId}`).catch(() => []);
    if (!Array.isArray(rels) || rels.length === 0) return [];
    const ids = rels.map((r: any) => String(r.child_object_id)).filter(Boolean);
    const reviews = await Promise.all(ids.map((id) => wordpressCCTFetch<any>(SLUG, { id }).catch(() => null)));
    return reviews.filter(Boolean).map(mapReview);
  } catch {
    return [];
  }
}

export async function createReviewWordPress(review: {
  entity_id: string;
  entity_type?: string;
  rating: number;
  comment?: string;
  title?: string;
}): Promise<void> {
  const parentId = Number(stripWp(review.entity_id));
  const created = await wordpressCCTFetch<any>(SLUG, {
    method: "POST",
    body: {
      a55: review.title || "",
      a56: review.comment || "",
      a57: review.rating,
    },
  });
  const reviewId = Number(created?.item_id || created?._ID || created?.id);
  if (reviewId && parentId) {
    await wordpressFetch(`jet-rel/${REL_FACILITY_REVIEW}`, {
      method: "POST",
      body: { parent_id: parentId, child_id: reviewId, context: "child", store_items_type: "update" },
    }).catch(() => {});
  }
}
