/**
 * WordPress data source for ChallengeD content articles
 * Fetches from the `challenged_content` JetEngine CCT
 */
import { wordpressCCTFetch } from "@/features/shared/wordpress-client";

export interface ChallengedContentItem {
  id: string;
  cct_status: string;
  title: string;
  content: string;
  excerpt: string;
  category: string; // aware | care | cope | safe | accompany
  subcategory: string;
  featured_image: string;
  sort_order: number;
  is_published: string;
  author_name: string;
  reading_time: string;
  created_at: string;
  updated_at: string;
}

const CCT_SLUG = "challenged_content";

export async function fetchChallengedContent(
  category?: string,
  subcategory?: string
): Promise<ChallengedContentItem[]> {
  const params: Record<string, string> = {};
  if (category) params.category = category;
  if (subcategory) params.subcategory = subcategory;

  const items = await wordpressCCTFetch<ChallengedContentItem[]>(CCT_SLUG, { params });
  return (items || [])
    .filter((item) => item.is_published !== "0")
    .sort((a, b) => (Number(a.sort_order) || 999) - (Number(b.sort_order) || 999));
}

export async function fetchChallengedContentById(
  id: string | number
): Promise<ChallengedContentItem | null> {
  try {
    const item = await wordpressCCTFetch<ChallengedContentItem>(CCT_SLUG, { id });
    return item ?? null;
  } catch {
    return null;
  }
}
