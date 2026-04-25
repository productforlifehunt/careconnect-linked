/**
 * ChallengeD knowledge hub — JetEngine CCT `challenged_content` (CCT 100).
 *
 * Live fields: title, content, featured_image, author_name, reading_time,
 *   language, app_area, app_content_type_, learn_module_number,
 *   learn_lesson_number, care_and_accompany_tips_category, find_tips_category
 *
 * The frontend keeps a curated static set as a guaranteed-available baseline
 * and overlays WP-published items (which can edit/extend the catalog).
 */
import { wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStaticContent, getStaticContentById } from "@/data/challenged-content-data";

export interface ChallengedContentItem {
  id: string;
  cct_status?: string;
  title: string;
  content: string;
  excerpt?: string;
  // Categorisation — multiple fields exist live; we expose a flat shape.
  category?: string;       // app_content_type_  (e.g. "learn", "care", "find")
  subcategory?: string;    // care_and_accompany_tips_category | find_tips_category | learn_module_number
  featured_image?: string;
  sort_order?: number;
  is_published?: string;
  author_name?: string;
  reading_time?: string;
  language?: string;
  app_area?: string;
  learn_module_number?: string;
  learn_lesson_number?: string;
  created_at?: string;
  updated_at?: string;
}

const CCT_SLUG = "challenged_content";

function mapWPItem(raw: any): ChallengedContentItem {
  const category = raw.app_content_type_ || raw.category || "";
  const subcategory =
    raw.care_and_accompany_tips_category ||
    raw.find_tips_category ||
    (raw.learn_module_number ? `module-${raw.learn_module_number}` : "") ||
    raw.subcategory ||
    "";
  return {
    id: String(raw.id ?? raw._ID),
    title: raw.title || "",
    content: raw.content || "",
    excerpt: typeof raw.content === "string" ? raw.content.replace(/<[^>]*>/g, "").slice(0, 240) : "",
    category,
    subcategory,
    featured_image: raw.featured_image || "",
    sort_order: 999,
    is_published: "1",
    author_name: raw.author_name || "",
    reading_time: raw.reading_time || "",
    language: raw.language || "",
    app_area: raw.app_area || "",
    learn_module_number: raw.learn_module_number || "",
    learn_lesson_number: raw.learn_lesson_number || "",
    created_at: raw.cct_created || "",
    updated_at: raw.cct_modified || raw.cct_created || "",
  };
}

export async function fetchChallengedContent(
  category?: string,
  subcategory?: string,
  locale?: { area?: string; language?: string }
): Promise<ChallengedContentItem[]> {
  const staticItems = getStaticContent(category, subcategory);

  try {
    const params: Record<string, string> = { _limit: "200" };
    if (category) params.app_content_type_ = category;
    if (locale?.area) params.app_area = locale.area;
    if (locale?.language) params.language = locale.language;

    const wpItems = await wordpressCCTFetch<any[]>(CCT_SLUG, { params });
    if (Array.isArray(wpItems) && wpItems.length > 0) {
      let mapped = wpItems.map(mapWPItem);
      if (subcategory) mapped = mapped.filter((i) => i.subcategory === subcategory);
      const wpNormalized = mapped.map((item) => ({
        ...item,
        id: `wp-${item.id}`,
      }));
      return [...wpNormalized, ...staticItems].sort(
        (a, b) => (a.sort_order || 999) - (b.sort_order || 999)
      );
    }
  } catch {
    // WP unreachable — static catalog is the production fallback.
  }

  return staticItems;
}

export async function fetchChallengedContentById(
  id: string | number
): Promise<ChallengedContentItem | null> {
  const strId = String(id);

  if (strId.startsWith("wp-")) {
    try {
      const wpId = strId.replace("wp-", "");
      const item = await wordpressCCTFetch<any>(CCT_SLUG, { id: wpId });
      if (item) return { ...mapWPItem(item), id: strId };
    } catch { /* fall through */ }
  }

  const staticItem = getStaticContentById(strId);
  if (staticItem) return staticItem;

  try {
    const item = await wordpressCCTFetch<any>(CCT_SLUG, { id });
    if (item) return mapWPItem(item);
  } catch { /* not found */ }

  return null;
}
