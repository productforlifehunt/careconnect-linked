import type { Profile } from "@/types/care-connector";

import { getWordPressFeature, listWordPressFeature } from "@/features/shared/wordpress-adapter";
import { fetchAllProviderProductSummaries } from "@/services/woocommerce-api";

function isActivePaidProvider(profile: Profile): boolean {
  return profile.is_care_provider === true && profile.provider_is_active === true;
}

export interface ProviderFilters {
  query?: string;
  specialties?: string[];
  minRate?: number;
  maxRate?: number;
  verifiedOnly?: boolean;
  minRating?: number;
  sortBy?: string;
  location?: string;
  /** pa_service-location slugs to require (any-of). e.g. ["in-person", "remote"]. */
  serviceLocations?: string[];
  /** pa_service-type slugs to require (any-of). */
  serviceTypeSlugs?: string[];
}

export async function fetchProvidersWordPress(filters?: ProviderFilters): Promise<Profile[]> {
  try {
    const params: Record<string, string | number> = {};
    if (filters?.query) params.search = filters.query;

    // Run the Dokan store list and the WC product summary scan in parallel —
    // the product summaries hydrate each provider card with min_block_cost +
    // pa_service-type / pa_service-location attribute slugs so we can filter
    // against the real package catalogue (not the stale CCT hourly_rate).
    const [storeResults, productSummaries] = await Promise.all([
      listWordPressFeature<Profile[]>("providers", { params }),
      fetchAllProviderProductSummaries().catch(() => new Map()),
    ]);

    let results: Profile[] = (storeResults || []).filter(isActivePaidProvider).map((p) => {
      const summary = productSummaries.get(String(p.id));
      if (!summary) return p;
      return {
        ...p,
        min_block_cost: summary.minBlockCost || null,
        service_type_slugs: summary.serviceTypeSlugs,
        service_location_slugs: summary.serviceLocationSlugs,
        // Mirror min_block_cost into the legacy hourly_rate field so existing
        // card UI ("$X / hour") shows the real package price.
        care_provider_starts_hourly_rate:
          summary.minBlockCost > 0 ? summary.minBlockCost : p.care_provider_starts_hourly_rate,
      };
    });

    // Client-side filtering for fields Dokan API doesn't natively filter
    if (filters?.location) {
      const loc = filters.location.toLowerCase();
      results = results.filter((p) => p.location?.toLowerCase().includes(loc));
    }
    if (filters?.minRating != null) {
      results = results.filter((p) => (p.rating_average ?? 0) >= filters.minRating!);
    }
    if (filters?.serviceLocations && filters.serviceLocations.length > 0) {
      const want = new Set(filters.serviceLocations.map((s) => s.toLowerCase()));
      results = results.filter((p) => (p.service_location_slugs || []).some((s) => want.has(s)));
    }
    if (filters?.serviceTypeSlugs && filters.serviceTypeSlugs.length > 0) {
      const want = new Set(filters.serviceTypeSlugs.map((s) => s.toLowerCase()));
      results = results.filter((p) => (p.service_type_slugs || []).some((s) => want.has(s)));
    }
    if (filters?.minRate != null) {
      results = results.filter((p) => (p.care_provider_starts_hourly_rate ?? 0) >= filters.minRate!);
    }
    if (filters?.maxRate != null) {
      results = results.filter(
        (p) => (p.care_provider_starts_hourly_rate ?? Number.POSITIVE_INFINITY) <= filters.maxRate!,
      );
    }

    // Sorting
    if (filters?.sortBy === "rating") results.sort((a, b) => (b.rating_average ?? 0) - (a.rating_average ?? 0));
    else if (filters?.sortBy === "price-low")
      results.sort(
        (a, b) => (a.care_provider_starts_hourly_rate ?? 0) - (b.care_provider_starts_hourly_rate ?? 0),
      );
    else if (filters?.sortBy === "price-high")
      results.sort(
        (a, b) => (b.care_provider_starts_hourly_rate ?? 0) - (a.care_provider_starts_hourly_rate ?? 0),
      );
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
