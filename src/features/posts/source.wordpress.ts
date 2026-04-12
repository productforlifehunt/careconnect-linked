import { createWordPressFeature, deleteWordPressFeature, getWordPressFeature, listWordPressFeature, updateWordPressFeature } from "@/features/shared/wordpress-adapter";
import {
  fetchCommunityPostsWordPress,
  fetchCommunityPostByIdWordPress,
  createCommunityPostWordPress,
  updateCommunityPostWordPress,
  deleteCommunityPostWordPress,
} from "@/features/community-posts/source.wordpress";

// CCT-based post types that should NOT go through wp/v2
const CCT_POST_TYPES = ["care_community_post"];

export async function fetchPostsWordPress(postType: string, _area?: string, _childPostType?: string | null): Promise<any[]> {
  if (CCT_POST_TYPES.includes(postType)) {
    return fetchCommunityPostsWordPress();
  }
  try {
    return await listWordPressFeature<any[]>("generic_posts", { endpointArgs: { postType } });
  } catch { return []; }
}

export async function fetchPostByIdWordPress(id: string, postType?: string): Promise<any | null> {
  if (postType && CCT_POST_TYPES.includes(postType)) {
    return fetchCommunityPostByIdWordPress(id);
  }
  try {
    try {
      return await getWordPressFeature<any>("generic_post", { endpointArgs: { id, postType: "post" } });
    } catch {
      return await getWordPressFeature<any>("generic_post", { endpointArgs: { id, postType: "pages" } });
    }
  } catch { return null; }
}

export async function createPostWordPress(post: { title: string; content?: string; post_type?: string; postType?: string; status?: string }): Promise<any> {
  const pt = post.postType || post.post_type || "post";
  if (CCT_POST_TYPES.includes(pt)) {
    return createCommunityPostWordPress({ title: post.title, content: post.content || "" });
  }
  const result = await createWordPressFeature<any>("generic_posts", post, { endpointArgs: { postType: pt } });
  return { id: String(result.id) };
}

export async function updatePostWordPress(id: string, updates: { title?: string; content?: string; status?: string }, postType?: string): Promise<void> {
  if (postType && CCT_POST_TYPES.includes(postType)) {
    await updateCommunityPostWordPress(id, updates);
    return;
  }
  await updateWordPressFeature("generic_post", updates, { endpointArgs: { id, postType: "post" } });
}

export async function deletePostWordPress(id: string, postType?: string): Promise<void> {
  if (postType && CCT_POST_TYPES.includes(postType)) {
    await deleteCommunityPostWordPress(id);
    return;
  }
  await deleteWordPressFeature("generic_post", { endpointArgs: { id, postType: "post" }, params: { force: true } });
}
