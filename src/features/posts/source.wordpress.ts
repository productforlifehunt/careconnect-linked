/**
 * Posts data source.
 *
 * There is no WordPress CPT behind community content — everything lives in the
 * shared "Afresh community post" CCT (149). The row's Community-type radio
 * scopes it to ChallengeD / Care-CNC, and the Community-post-category radio
 * separates discussions from articles. Codes are opaque and come from the
 * dictionary via `T`, never inferred.
 */
import {
  fetchCommunityPostsWordPress,
  fetchCommunityPostByIdWordPress,
  createCommunityPostWordPress,
  updateCommunityPostWordPress,
  deleteCommunityPostWordPress,
} from "@/features/community-posts/source.wordpress";
import { T } from "@/integrations/wp-schema";

const CATEGORY = T.afreshCommunityPost.opt.COMMUNITY_POST_CATEGORY;
const AREA = T.afreshCommunityPost.opt.APP_AREA;
const LANGUAGE = T.afreshCommunityPost.opt.LANGUAGE;

/** Logical post types used by the UI. */
const ARTICLE_TYPES = ["challenged_article", "article", "care_article"];

/** Map a UI post type to the opaque Community-post-category code. */
export function postCategoryCode(postType?: string | null): string {
  return postType && ARTICLE_TYPES.includes(postType) ? CATEGORY.ARTICLE : CATEGORY.DISCUSSION;
}

/** Map the UI's area string ("china" / "global") to its opaque checkbox code. */
function areaCode(area?: string | null): string | undefined {
  if (!area) return undefined;
  return area === "china" ? AREA.CHINA : AREA.GLOBAL_ENGLISH;
}

/** Map an i18n language tag to its opaque radio code. */
function languageCode(language?: string | null): string | undefined {
  if (!language) return undefined;
  return language.startsWith("zh") ? LANGUAGE.SIMPLIFIED_CHINESE : LANGUAGE.ENGLISH;
}

export async function fetchPostsWordPress(
  postType: string,
  area?: string,
  _childPostType?: string | null,
): Promise<any[]> {
  return fetchCommunityPostsWordPress({
    area: areaCode(area),
    category: postCategoryCode(postType),
  });
}

export async function fetchPostByIdWordPress(id: string, _postType?: string): Promise<any | null> {
  return fetchCommunityPostByIdWordPress(id);
}

export async function createPostWordPress(post: {
  title: string;
  content?: string;
  post_type?: string;
  postType?: string;
  status?: string;
  area?: string;
  language?: string;
}): Promise<{ id: string }> {
  const pt = post.postType || post.post_type;
  return createCommunityPostWordPress({
    title: post.title,
    content: post.content || "",
    app_area: areaCode(post.area),
    language: languageCode(post.language),
    category: postCategoryCode(pt),
  });
}

export async function updatePostWordPress(
  id: string,
  updates: { title?: string; content?: string; status?: string },
  _postType?: string,
): Promise<void> {
  await updateCommunityPostWordPress(id, { title: updates.title, content: updates.content });
}

export async function deletePostWordPress(id: string, _postType?: string): Promise<void> {
  await deleteCommunityPostWordPress(id);
}
