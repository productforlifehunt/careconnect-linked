import { readLinkedCCTRows } from '@/features/shared/cct-rows';
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
import {
  dedupeRead,
  fetchRelChildrenMap,
  fetchRelChildrenOf,
} from "@/features/shared/rel-batch";
import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { fetchWPUserPublicProfiles } from "@/features/shared/wp-users";

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

function relForEntity(entityType?: string | undefined): number {
  const rel = ENTITY_REVIEW_REL[entityType ?? "provider"];
  if (!rel) throw new Error(`No review relation for "${entityType}"`);
  return rel;
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

/** All Review rows, read once per screen and indexed by row id. */
async function fetchReviewIndex(): Promise<Map<string, any>> {
  return dedupeRead("cct-index:review", async () => {
    const index = new Map<string, any>();
    try {
      const rows = await wordpressCCTFetch<any[]>(REVIEW.slug, { params: { _limit: 500 } });
      if (Array.isArray(rows)) {
        for (const row of rows) index.set(String(row?.id ?? row?._ID ?? ""), row);
      }
    } catch { /* falls back to per-id reads */ }
    return index;
  });
}

async function fetchReviewRows(parentId: number, relId: number): Promise<any[]> {
  // Only this entity's own reviews: its relation children, then those rows by ID.
  const ids = (await fetchRelChildrenOf(relId, parentId)).map((c) => c.childId);
  return readLinkedCCTRows(REVIEW.slug, ids);
}

async function fetchProviderReviewRows(providerUserId: number): Promise<any[]> {
  return fetchReviewRows(providerUserId, REL_PROVIDER_REVIEWS);
}

export async function fetchEntityReviewsWordPress(
  entityId?: string | undefined,
  entityType?: string | undefined,
): Promise<EntityReview[]> {
  const parentId = numericId(entityId);
  if (!parentId) return [];

  const rows = await fetchReviewRows(parentId, relForEntity(entityType));
  if (rows.length === 0) return [];

  const authorIds = Array.from(
    new Set(rows.map((r: any) => Number(r.author_id || r.cct_author_id) || 0)),
  ).filter(Boolean);
  const authorProfiles = await fetchWPUserPublicProfiles(authorIds);

  return rows
    .map((row: any) => {
      const authorId = Number(row.author_id || row.cct_author_id) || 0;
      return {
        id: String(row.id ?? row._ID),
        title: String(row[F.TITLE] ?? ""),
        content: String(row[F.CONTENT] ?? ""),
        rating: Number(row[F.RATING] ?? 0) || 0,
        author_id: authorId ? `wp-${authorId}` : null,
        author_name: authorProfiles.get(authorId)?.full_name || "",
        created_at: row.cct_created ?? row.created_at ?? null,
        updated_at:
          row.cct_modified ?? row.updated_at ?? row.created_at ?? null,
      };
    })
    .sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")));
}

/** Rating aggregate for any review parent, computed from the Review CCT. */
export async function fetchRatingSummary(
  parentId: string | number,
  entityType?: string | undefined,
): Promise<{ average: number | null; count: number }> {
  const pid = numericId(parentId);
  if (!pid) return { average: null, count: 0 };
  const rows = await fetchReviewRows(pid, relForEntity(entityType));
  const ratings = rows
    .map((r: any) => Number(r[F.RATING]))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (ratings.length === 0) return { average: null, count: 0 };
  return {
    average: ratings.reduce((a, b) => a + b, 0) / ratings.length,
    count: ratings.length,
  };
}

/**
 * Real rating aggregate for a care provider, computed from the Review CCT.
 * Returns null averages when the provider has no reviews — callers must render
 * "New" rather than a fabricated score.
 */
export async function fetchProviderRatingSummary(
  providerUserId: string | number,
): Promise<{ average: number | null; count: number }> {
  return fetchRatingSummary(providerUserId, "provider");
}

/** Read ratings for a directory with one CCT batch instead of one per provider. */
export async function fetchProviderRatingSummaries(
  providerUserIds: Array<string | number>,
): Promise<Map<string, { average: number | null; count: number }>> {
  const parentIds = [...new Set(providerUserIds.map(numericId).filter(Boolean).map(String))];
  const summaries = new Map<string, { average: number | null; count: number }>(
    parentIds.map((id) => [id, { average: null, count: 0 }]),
  );
  if (parentIds.length === 0) return summaries;

  const relationMap = await fetchRelChildrenMap(REL_PROVIDER_REVIEWS);
  const linkedReviews = relationMap.loaded
    ? parentIds.map((parentId) => ({
        parentId,
        children: relationMap.get(parentId) ?? [],
      }))
    : await Promise.all(
        parentIds.map(async (parentId) => ({
          parentId,
          children: await fetchRelChildrenOf(REL_PROVIDER_REVIEWS, parentId),
        })),
      );
  const reviewIds = [
    ...new Set(
      linkedReviews.flatMap(({ children }) =>
        children.map(({ childId }) => childId),
      ),
    ),
  ];
  if (reviewIds.length === 0) return summaries;

  const reviewRows = await readLinkedCCTRows(REVIEW.slug, reviewIds);
  const reviewsById = new Map(reviewRows.map((row) => [String(row.id ?? row._ID), row]));
  for (const { parentId, children } of linkedReviews) {
    const ratings = [...new Set(children.map(({ childId }) => childId))]
      .map((childId) => Number(reviewsById.get(childId)?.[F.RATING]))
      .filter((rating) => Number.isFinite(rating) && rating > 0);
    if (ratings.length > 0) {
      summaries.set(parentId, {
        average: ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length,
        count: ratings.length,
      });
    }
  }
  return summaries;
}

export async function createReviewWordPress(review: {
  entity_id: string;
  entity_type?: string | undefined;
  rating: number;
  comment?: string | undefined;
  title?: string | undefined;
}): Promise<void> {
  const parentId = numericId(review.entity_id);
  if (!parentId) throw new Error("Missing id — review cannot be posted.");
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

  await wordpressFetch(`jet-rel/${relForEntity(review.entity_type)}`, {
    method: "POST",
    body: {
      parent_id: parentId,
      child_id: newId,
      context: "child",
      store_items_type: "update",
    },
  });
}
