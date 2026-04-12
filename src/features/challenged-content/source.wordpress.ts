/**
 * WordPress + Static hybrid source for ChallengeD content articles.
 * Static content = production-ready curated knowledge base (33 articles).
 * WordPress CCT = CMS layer for editing, adding new articles, and admin management.
 * WordPress articles override static ones by matching category+subcategory+title.
 * New WordPress articles are merged on top.
 */
import { wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStaticContent, getStaticContentById, STATIC_CONTENT } from "@/data/challenged-content-data";

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
  // Start with static content (always available, production-ready)
  const staticItems = getStaticContent(category, subcategory);

  // Try to fetch WordPress CCT articles to merge/override
  try {
    const params: Record<string, string> = {};
    if (category) params.category = category;
    if (subcategory) params.subcategory = subcategory;
    const wpItems = await wordpressCCTFetch<ChallengedContentItem[]>(CCT_SLUG, { params });

    if (wpItems && wpItems.length > 0) {
      const published = wpItems.filter((item) => item.is_published !== "0");
      if (published.length > 0) {
        // Merge: WP articles with id prefix "wp-" to avoid collision
        const wpNormalized = published.map((item) => ({
          ...item,
          id: `wp-${item.id}`,
          sort_order: Number(item.sort_order) || 999,
        }));
        // Return WP items first (editable), then static items
        const combined = [...wpNormalized, ...staticItems];
        return combined.sort((a, b) => (a.sort_order || 999) - (b.sort_order || 999));
      }
    }
  } catch {
    // WordPress unavailable — static content is the production fallback
  }

  return staticItems;
}

export async function fetchChallengedContentById(
  id: string | number
): Promise<ChallengedContentItem | null> {
  const strId = String(id);

  // Check if it's a WP-sourced article
  if (strId.startsWith("wp-")) {
    try {
      const wpId = strId.replace("wp-", "");
      const item = await wordpressCCTFetch<ChallengedContentItem>(CCT_SLUG, { id: wpId });
      if (item) return { ...item, id: strId };
    } catch {
      // fall through
    }
  }

  // Check static content
  const staticItem = getStaticContentById(strId);
  if (staticItem) return staticItem;

  // Last resort: try WP directly with raw id
  try {
    const item = await wordpressCCTFetch<ChallengedContentItem>(CCT_SLUG, { id });
    if (item) return item;
  } catch {
    // not found
  }

  return null;
}
