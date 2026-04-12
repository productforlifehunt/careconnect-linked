/**
 * WordPress data source for ChallengeD content articles
 * Fetches from the `challenged_content` JetEngine CCT
 */
import { wordpressCCTFetch } from "@/features/shared/wordpress-client";

export interface ChallengedContentItem {
  _ID: number;
  cct_status: string;
  title: string;
  content: string;
  excerpt: string;
  category: string; // aware | care | cope | safe | accompany
  subcategory: string;
  featured_image: string;
  sort_order: number;
  is_published: string; // "1" or "0"
  author_name: string;
  reading_time: string;
  cct_created: string;
  cct_modified: string;
}

const CCT_SLUG = "challenged_content";

export async function fetchChallengedContent(
  category?: string,
  subcategory?: string
): Promise<ChallengedContentItem[]> {
  const params: Record<string, string> = {};
  if (category) params.category = category;
  if (subcategory) params.subcategory = subcategory;

  const items = await wordpressCCTFetch<ChallengedContentItem[]>(CCT_SLUG, params);
  return (items || [])
    .filter((item) => item.is_published !== "0")
    .sort((a, b) => (Number(a.sort_order) || 999) - (Number(b.sort_order) || 999));
}

export async function fetchChallengedContentById(
  id: number
): Promise<ChallengedContentItem | null> {
  const items = await wordpressCCTFetch<ChallengedContentItem[]>(CCT_SLUG, {
    _ID: String(id),
  });
  return items?.[0] ?? null;
}
