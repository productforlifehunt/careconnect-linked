import type { Profile } from "@/types/care-connector";

import { getWordPressFeature, listWordPressFeature } from "@/features/shared/wordpress-adapter";

export interface ProviderFilters {
  query?: string;
  specialties?: string[];
  minRate?: number;
  maxRate?: number;
  verifiedOnly?: boolean;
  minRating?: number;
  sortBy?: string;
  location?: string;
}

// ─── WordPress-native types ────────────────────────────────
// ─── Fetchers ──────────────────────────────────────────────
export async function fetchProvidersWordPress(filters?: ProviderFilters): Promise<Profile[]> {
  try {
    const params: Record<string, string | number> = {};
    if (filters?.query) params.search = filters.query;

    let results = await listWordPressFeature<Profile[]>("providers", { params });

    // Client-side filtering for fields Dokan API doesn't natively filter
    if (filters?.location) {
      const loc = filters.location.toLowerCase();
      results = results.filter(p => p.location?.toLowerCase().includes(loc));
    }
    if (filters?.minRating != null) {
      results = results.filter(p => (p.rating_average ?? 0) >= filters.minRating!);
    }

    // Sorting
    if (filters?.sortBy === "rating") results.sort((a, b) => (b.rating_average ?? 0) - (a.rating_average ?? 0));
    else if (filters?.sortBy === "price-low") results.sort((a, b) => (a.care_provider_starts_hourly_rate ?? 0) - (b.care_provider_starts_hourly_rate ?? 0));
    else if (filters?.sortBy === "price-high") results.sort((a, b) => (b.care_provider_starts_hourly_rate ?? 0) - (a.care_provider_starts_hourly_rate ?? 0));
    else results.sort((a, b) => (b.rating_average ?? 0) - (a.rating_average ?? 0));

    return results;
  } catch {
    return [];
  }
}

export async function fetchProviderByIdWordPress(id: string): Promise<Profile | null> {
  try {
    return await getWordPressFeature<Profile>("provider", { endpointArgs: { id } });
  } catch {
    return null;
  }
}
