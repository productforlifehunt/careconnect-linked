/**
 * ChallengeD knowledge hub — JetEngine CCT 217 `challenged_content`.
 * Bible (§19):
 *   a55=Title, a56=Content, a57=Language (b55 English | b56 Simplified Chinese)
 *   a58=app area (b55 Global English | b56 China)
 *   a59=App content type (b55 Learn | b56 Care and accompany tips | b57 Find tips)
 *   a60=Learn module number  a61=Learn lesson number
 *   a62=Care and accompany tips category (b55…b63)
 *   a63=Find tips category (b55 Wondering | b56 Getting lost | b57 Unwilling to return home)
 */
import { wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { T } from "@/integrations/wp-schema";

export interface ChallengedContentItem {
  id: string;
  cct_status?: string;
  title: string;
  content: string;
  excerpt?: string;
  category?: string;     // app_content_type (learn|care|find) — friendly label exposed to UI
  subcategory?: string;  // resolved from a60/a62/a63
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

const CCT_SLUG = T.challengedContent.slug;

const LANG_IN: Record<string, string> = { b55: "en", b56: "zh-CN" };
const LANG_OUT: Record<string, string> = { en: "b55", "zh-CN": "b56", "zh-cn": "b56" };
const AREA_IN: Record<string, string> = { b55: "global", b56: "china" };
const AREA_OUT: Record<string, string> = { global: "b55", china: "b56" };
const TYPE_IN: Record<string, string> = { b55: "learn", b56: "care", b57: "find" };
const TYPE_OUT: Record<string, string> = { learn: "b55", care: "b56", find: "b57" };

function mapWPItem(raw: any): ChallengedContentItem {
  const typeCode = String(raw.a59 ?? "");
  const category = TYPE_IN[typeCode] || typeCode || "";
  let subcategory = "";
  if (category === "care") subcategory = String(raw.a62 ?? "");
  else if (category === "find") subcategory = String(raw.a63 ?? "");
  else if (category === "learn" && raw.a60) subcategory = `module-${raw.a60}`;
  const content = String(raw.a56 ?? "");
  return {
    id: String(raw.id ?? raw._ID),
    title: String(raw.a55 ?? ""),
    content,
    excerpt: content.replace(/<[^>]*>/g, "").slice(0, 240),
    category,
    subcategory,
    featured_image: "",
    sort_order: 999,
    is_published: "1",
    author_name: "",
    reading_time: "",
    language: LANG_IN[String(raw.a57 ?? "")] || String(raw.a57 ?? ""),
    app_area: AREA_IN[String(raw.a58 ?? "")] || String(raw.a58 ?? ""),
    learn_module_number: raw.a60 != null ? String(raw.a60) : "",
    learn_lesson_number: raw.a61 != null ? String(raw.a61) : "",
    created_at: raw.cct_created || raw.created_at || "",
    updated_at: raw.cct_modified || raw.updated_at || raw.created_at || "",
  };
}

export async function fetchChallengedContent(
  category?: string,
  subcategory?: string,
  locale?: { area?: string; language?: string }
): Promise<ChallengedContentItem[]> {
  const params: Record<string, string> = { _limit: "200" };
    if (category && TYPE_OUT[category]) params.a59 = TYPE_OUT[category];
    if (locale?.area && AREA_OUT[locale.area]) params.a58 = AREA_OUT[locale.area];
    if (locale?.language && LANG_OUT[locale.language]) params.a57 = LANG_OUT[locale.language];

  const wpItems = await wordpressCCTFetch<any[]>(CCT_SLUG, { params });
  if (!Array.isArray(wpItems)) throw new Error("ChallengeD content returned an invalid response");
  let mapped = wpItems.map(mapWPItem);
  if (subcategory) mapped = mapped.filter((i) => i.subcategory === subcategory);
  return mapped.map((item) => ({ ...item, id: `wp-${item.id}` }));
}

export async function fetchChallengedContentById(id: string | number): Promise<ChallengedContentItem | null> {
  const strId = String(id);
  const wpId = strId.replace(/^wp-/, "");
  const item = await wordpressCCTFetch<any>(CCT_SLUG, { id: wpId });
  return item ? { ...mapWPItem(item), id: strId.startsWith("wp-") ? strId : String(item.id ?? item._ID) } : null;
}
