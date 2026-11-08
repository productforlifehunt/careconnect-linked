import type { Profile } from "@/types/care-connector";

export interface ProviderFilters {
  query?: string | undefined;
  specialties?: string[] | undefined;
  minRate?: number | undefined;
  maxRate?: number | undefined;
  verifiedOnly?: boolean | undefined;
  minRating?: number | undefined;
  sortBy?: string | undefined;
  location?: string | undefined;
  /** Delivery-mode slugs to require (any-of), from CCT 258 a65. */
  serviceLocations?: string[] | undefined;
  /** Care service slugs to require (any-of), from CCT 258 a68. */
  serviceTypeSlugs?: string[] | undefined;
}

export function filterProviders(
  directory: Profile[],
  filters?: ProviderFilters | undefined,
): Profile[] {
  try {
    let results: Profile[] = [...directory];
    if (filters?.query) {
      const query = filters.query.toLowerCase();
      results = results.filter((profile) =>
        [
          profile.full_name,
          profile.user_name,
          profile.bio,
          profile.location,
          ...(profile.specialty || []),
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query),
        ),
      );
    }

    if (filters?.location) {
      const location = filters.location.toLowerCase();
      results = results.filter((profile) =>
        profile.location?.toLowerCase().includes(location),
      );
    }
    if (filters?.minRating != null) {
      results = results.filter(
        (profile) => (profile.rating_average ?? 0) >= filters.minRating!,
      );
    }
    if (filters?.serviceLocations?.length) {
      const wanted = new Set(
        filters.serviceLocations.map((value) => value.toLowerCase()),
      );
      results = results.filter((profile) =>
        (profile.service_location_slugs || []).some((value) =>
          wanted.has(value),
        ),
      );
    }
    if (filters?.serviceTypeSlugs?.length) {
      const wanted = new Set(
        filters.serviceTypeSlugs.map((value) => value.toLowerCase()),
      );
      results = results.filter((profile) =>
        (profile.service_type_slugs || []).some((value) => wanted.has(value)),
      );
    }
    if (filters?.minRate != null) {
      results = results.filter(
        (profile) =>
          (profile.care_provider_starts_hourly_rate ?? 0) >= filters.minRate!,
      );
    }
    if (filters?.maxRate != null) {
      results = results.filter(
        (profile) =>
          (profile.care_provider_starts_hourly_rate ??
            Number.POSITIVE_INFINITY) <= filters.maxRate!,
      );
    }

    const byRatingDescending = (a: Profile, b: Profile) =>
      (b.rating_average ?? -1) - (a.rating_average ?? -1);
    const priceOf = (profile: Profile) =>
      profile.care_provider_starts_hourly_rate;
    if (filters?.sortBy === "rating") {
      results.sort(byRatingDescending);
    } else if (filters?.sortBy === "price-low") {
      results.sort(
        (a, b) =>
          (priceOf(a) ?? Number.POSITIVE_INFINITY) -
          (priceOf(b) ?? Number.POSITIVE_INFINITY),
      );
    } else if (filters?.sortBy === "price-high") {
      results.sort((a, b) => (priceOf(b) ?? -1) - (priceOf(a) ?? -1));
    } else {
      results.sort(byRatingDescending);
    }

    return results;
  } catch (error) {
    throw new Error(
      `Failed to fetch providers: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
