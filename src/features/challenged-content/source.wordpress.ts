/**
 * WordPress data source for ChallengeD content articles.
 * Falls back to static content when WordPress is unavailable.
 */
import { wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStaticContent, getStaticContentById } from "@/data/challenged-content-data";

export interface ChallengedContentItem {
  id: string;
  cct_status: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
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
  try {
    const params: Record<string, string> = {};
    if (category) params.category = category;
    if (subcategory) params.subcategory = subcategory;
    const items = await wordpressCCTFetch<ChallengedContentItem[]>(CCT_SLUG, { params });
    if (items && items.length > 0) {
      return items
        .filter((item) => item.is_published !== "0")
        .sort((a, b) => (Number(a.sort_order) || 999) - (Number(b.sort_order) || 999));
    }
  } catch {
    // WordPress unavailable — fall through to static content
  }
  return getStaticContent(category, subcategory);
}

export async function fetchChallengedContentById(
  id: string | number
): Promise<ChallengedContentItem | null> {
  try {
    const item = await wordpressCCTFetch<ChallengedContentItem>(CCT_SLUG, { id });
    if (item) return item;
  } catch {
    // fall through
  }
  return getStaticContentById(String(id));
}
