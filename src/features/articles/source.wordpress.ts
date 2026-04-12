import { getWordPressFeature, listWordPressFeature } from "@/features/shared/wordpress-adapter";

// ─── WordPress-native types ────────────────────────────────
// ─── Fetchers ──────────────────────────────────────────────
export async function fetchArticlesWordPress(perPage = 20, category?: number): Promise<any[]> {
  try {
    const params: Record<string, string | number> = { per_page: perPage, _embed: 1 };
    if (category) params.categories = category;
    return await listWordPressFeature<any[]>("articles", { params });
  } catch {
    return [];
  }
}

export async function fetchArticleByIdWordPress(id: string): Promise<any | null> {
  try {
    return await getWordPressFeature<any>("article", { endpointArgs: { id }, params: { _embed: 1 } });
  } catch {
    return null;
  }
}
