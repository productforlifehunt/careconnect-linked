import { listWordPressFeature } from "@/features/shared/wordpress-adapter";

export async function fetchCategoriesWordPress(taxonomy = "product_cat"): Promise<any[]> {
  try {
    return await listWordPressFeature<any[]>("categories", { endpointArgs: { taxonomy } });
  } catch {
    return [];
  }
}
