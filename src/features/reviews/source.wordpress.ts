import { createWordPressFeature, listWordPressFeature } from "@/features/shared/wordpress-adapter";

export async function fetchEntityReviewsWordPress(entityId?: string): Promise<any[]> {
  try {
    const params: Record<string, string | number> = { per_page: 20 };
    if (entityId) {
      const numericId = parseInt(entityId.replace("wp-", ""), 10);
      if (!isNaN(numericId)) params.post = numericId;
    }
    return await listWordPressFeature<any[]>("reviews", { params });
  } catch {
    return [];
  }
}

export async function createReviewWordPress(review: {
  entity_id: string;
  entity_type: string;
  rating: number;
  comment?: string;
}): Promise<void> {
  const numericId = parseInt(review.entity_id.replace("wp-", ""), 10);
  await createWordPressFeature("review_create", review, {
    endpointArgs: { id: numericId },
  });
}
