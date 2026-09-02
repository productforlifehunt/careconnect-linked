/**
 * Reviews — JetEngine CCT 31 "Review" (a55 title, a56 content, a57 rating)
 * attached to its parent through JetEngine relations only:
 *   144 → 2. Shop
 *   264 → Users (care provider)
 *   294 → 215. care facility
 *   145 → 140. nicotine product
 * Replies live in CCT 141 Comment via relation 143 (and 142 for nested).
 * No WooCommerce/Dokan reviews, no custom foreign keys.
 */
import { R, T } from "@/integrations/wp-schema";
import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { lookupUserNames } from "@/services/woocommerce-api";

const REVIEW = T.review;
const F = REVIEW.f;
const REL_PROVIDER_REVIEWS = R.providerReviews; // 264: Users -> 31. Review

/** entity_type → JetEngine relation id whose parent owns the reviews. */
const ENTITY_REVIEW_REL: Record<string, number> = {
  provider: R.providerReviews,
  caregiver: R.providerReviews,
  user: R.providerReviews,
  facility: R.facilityReviews,
  care_facility: R.facilityReviews,
  shop: R.shopReviews,
  store: R.shopReviews,
  product: R.productReviews,
  nicotine_product: R.productReviews,
};

function relForEntity(entityType?: string): number {
  return ENTITY_REVIEW_REL[entityType ?? "provider"] ?? R.providerReviews;
}

export interface EntityReview {
  id: string;
  title: string;
  content: string;
  rating: number;
  author_id: string | null;
  author_name: string;
  created_at: string | null;
  updated_at: string | null;
}

function numericId(value: string | number | undefined | null): number {
  return Number(String(value ?? "").replace(/^wp-/, "")) || 0;
}

async function fetchReviewRows(parentId: number, relId: number): Promise<any[]> {
  const rels = await wordpressFetch<any[]>(`jet-rel/${relId}/children/${parentId}`);
  const ids = (Array.isArray(rels) ? rels : [])
    .map((r: any) => Number(r.child_object_id))
    .filter(Boolean);
  if (ids.length === 0) return [];
  const rows = await Promise.all(
    ids.map((id) => wordpressCCTFetch<any>(REVIEW.slug, { id })),
  );
  return rows.filter(Boolean);
}

async function fetchProviderReviewRows(providerUserId: number): Promise<any[]> {
  return fetchReviewRows(providerUserId, REL_PROVIDER_REVIEWS);
}

async function resolveAuthorName(authorId: number): Promise<string> {
  if (!authorId) return "";
  const user = await wordpressFetch<any>(`wp/v2/users/${authorId}`).catch(() => null);
  if (user?.name) return String(user.name);
  // wp/v2/users is closed to non-admin callers, so fall back to the
  // server-side name lookup used elsewhere for chat counterparts.
  const rows = await lookupUserNames([authorId]).catch(() => []);
  return String(rows.find((r) => Number(r.id) === authorId)?.name || "");
}

export async function fetchEntityReviewsWordPress(
  entityId?: string,
  entityType?: string,
): Promise<EntityReview[]> {
  const parentId = numericId(entityId);
  if (!parentId) return [];

  const rows = await fetchReviewRows(parentId, relForEntity(entityType));
  if (rows.length === 0) return [];

  const authorNames = new Map<number, string>();
  await Promise.all(
    Array.from(new Set(rows.map((r: any) => Number(r.author_id || r.cct_author_id) || 0)))
      .filter(Boolean)
      .map(async (id) => authorNames.set(id, await resolveAuthorName(id))),
  );

  return rows
    .map((row: any) => {
      const authorId = Number(row.author_id || row.cct_author_id) || 0;
      return {
        id: String(row.id ?? row._ID),
        title: String(row[F.TITLE] ?? ""),
        content: String(row[F.CONTENT] ?? ""),
        rating: Number(row[F.RATING] ?? 0) || 0,
        author_id: authorId ? `wp-${authorId}` : null,
        author_name: authorNames.get(authorId) || "",
        created_at: row.cct_created ?? row.created_at ?? null,
        updated_at: row.cct_modified ?? row.updated_at ?? row.created_at ?? null,
      };
    })
    .sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")));
}

/**
 * Real rating aggregate for a care provider, computed from the Review CCT.
 * Returns null averages when the provider has no reviews — callers must render
 * "New" rather than a fabricated score.
 */
export async function fetchProviderRatingSummary(
  providerUserId: string | number,
): Promise<{ average: number | null; count: number }> {
  const uid = numericId(providerUserId);
  if (!uid) return { average: null, count: 0 };
  const rows = await fetchProviderReviewRows(uid).catch(() => []);
  const ratings = rows
    .map((r: any) => Number(r[F.RATING]))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (ratings.length === 0) return { average: null, count: 0 };
  return {
    average: ratings.reduce((a, b) => a + b, 0) / ratings.length,
    count: ratings.length,
  };
}

export async function createReviewWordPress(review: {
  entity_id: string;
  entity_type?: string;
  rating: number;
  comment?: string;
  title?: string;
}): Promise<void> {
  if (review.entity_type === "facility") {
    throw new Error("Facility reviews are not part of the data model yet.");
  }
  const providerUserId = numericId(review.entity_id);
  if (!providerUserId) throw new Error("Missing provider id — review cannot be posted.");
  const rating = Math.round(Number(review.rating));
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5.");
  }

  const created: any = await wordpressCCTFetch(REVIEW.slug, {
    method: "POST",
    body: {
      [F.TITLE]: String(review.title ?? ""),
      [F.CONTENT]: String(review.comment ?? ""),
      [F.RATING]: String(rating),
    },
  });
  const newId = Number(created?.item_id ?? created?._ID ?? created?.id ?? 0);
  if (!newId) throw new Error("Review could not be saved.");

  await wordpressFetch(`jet-rel/${REL_PROVIDER_REVIEWS}`, {
    method: "POST",
    body: {
      parent_id: providerUserId,
      child_id: newId,
      context: "child",
      store_items_type: "update",
    },
  });
}
