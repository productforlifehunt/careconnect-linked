/**
 * Reviews — WooCommerce native `/wc/v3/products/reviews`.
 *
 * Zero JetEngine CCT. Reviews are bookkept by WooCommerce on the provider's
 * bookable product (one product per provider, SKU `care-provider-<id>`).
 * Refunds / cancellations / reschedules already live on the WC order; reviews
 * now match — the entire payment/feedback surface is Woo + Dokan native.
 *
 * Facility reviews: facilities are CCT-only today (not Dokan stores), so
 * they have no Woo product to attach a review to. Returns [] until facilities
 * are wired to Dokan vendors.
 */
import {
  getProviderProduct,
  fetchProductReviews,
  createProductReview,
} from "@/services/woocommerce-api";

function mapReview(r: any) {
  return {
    id: String(r.id),
    title: "",
    content: String(r.review || "").replace(/<[^>]*>/g, ""),
    rating: Number(r.rating || 0),
    author_id: r.reviewer_email ? `wc-${r.reviewer_email}` : null,
    author_name: r.reviewer || "",
    created_at: r.date_created,
    updated_at: r.date_created,
  };
}

async function resolveProductId(entityId: string, entityType?: string): Promise<number | null> {
  if (entityType === "facility") return null; // facilities aren't Woo products
  const product = await getProviderProduct(entityId).catch(() => null);
  const pid = Number(product?.id);
  return pid > 0 ? pid : null;
}

export async function fetchEntityReviewsWordPress(
  entityId?: string,
  entityType?: string,
): Promise<any[]> {
  if (!entityId) return [];
  try {
    const productId = await resolveProductId(entityId, entityType);
    if (!productId) return [];
    const list = await fetchProductReviews(productId);
    return Array.isArray(list) ? list.map(mapReview) : [];
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
  const productId = await resolveProductId(review.entity_id, review.entity_type);
  if (!productId) {
    throw new Error(
      review.entity_type === "facility"
        ? "Facility reviews are not yet available (facility is not a Dokan vendor)."
        : "Could not find a Woo product for this provider — review cannot be posted.",
    );
  }
  await createProductReview({
    productId,
    rating: review.rating,
    review: review.comment || review.title || "",
  });
}
